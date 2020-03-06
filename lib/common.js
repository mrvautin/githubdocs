const fs = require('fs');
const path = require('path');
const uglifycss = require('uglifycss');
const uglifyes = require('uglify-es');
const slugify = require('slugify');
const cheerio = require('cheerio');
const axios = require('axios');
const JsSearch = require('js-search');
const sm = require('sitemap');
const md = require('markdown-it')();
const glob = require('glob-promise');
const shortid = require('shortid');
const _ = require('lodash');
const crypto = require('crypto');
const config = require('../config/config.json');
const indexedDocs = [];

// uglify assets
const uglify = () => {
    // uglify css
    const cssfileContents = fs.readFileSync(path.join('public', 'stylesheets', 'style.css'), 'utf8');
    const cssUglified = uglifycss.processString(cssfileContents);
    fs.writeFileSync(path.join('public', 'stylesheets', 'style.min.css'), cssUglified, 'utf8');

    // uglify js
    const rawCode = fs.readFileSync(path.join('public', 'javascripts', 'main.js'), 'utf8');
    const jsUglified = uglifyes.minify(rawCode);

    fs.writeFileSync(path.join('public', 'javascripts', 'main.min.js'), jsUglified.code, 'utf8');
    console.log('[INFO] Files minified');
    return Promise.resolve();
};

// indexes the static docs. Is ran on initial start and the interval in config or default
const indexDocs = async (app) => {
    const docs = await getDocs();
    // setup index
    const index = new JsSearch.Search('_id');
    index.addIndex('docTitle');
    index.addIndex('docBody');
    index.addIndex('docSlug');

    console.log(`[INFO] Found doc count: ${docs.length}`);

    // add to index
    for(let i = 0, len = docs.length; i < len; i++){
        const doc = docs[i];

        // Check for existing doc
        const existingDoc = _.filter(indexedDocs, { sha: await getSha(doc) });
        if(existingDoc && existingDoc.length > 0){
            return;
        }

        const docBody = await getDoc(doc);
        const renderedHtml = md.render(docBody);
        const $ = cheerio.load(renderedHtml);
        let docTitle = $('h1').first().text();

        // set the docTitle
        if(docTitle.trim() === ''){
            if(config.static){
                docTitle = path.basename(doc, '.md');
            }else{
                docTitle = path.basename(doc.name, '.md');
            }
        }

        const docId = shortid.generate();
        const indexDoc = {
            docTitle: docTitle,
            docBody: renderedHtml,
            docSlug: slugify(docTitle),
            sha: await getSha(doc),
            _id: docId
        };

        // Add to config
        indexedDocs.push(indexDoc);
    };

    // Add all docs to index
    index.addDocuments(indexedDocs);

    // Write back index
    app.index = index;

    // Keep static docs
    app.config.docs = indexedDocs;

    console.log(`[INFO] Docs indexed: ${indexedDocs.length}`);
};

const generateSitemap = async (req) => {
    // get the articles
    const docs = indexedDocs;
    const urlArray = [];

    // push in the base url
    urlArray.push({ url: '/', changefreq: 'weekly', priority: 1.0 });

    // get the article URL's
    for(const key in docs){
        urlArray.push({ url: docs[key].docSlug, changefreq: 'weekly', priority: 1.0 });
    }

    // create the sitemap
    const sitemap = sm.createSitemap({
        hostname: req.protocol + '://' + req.headers.host,
        cacheTime: 600000, // 600 sec - cache purge period
        urls: urlArray
    });

    return sitemap;
};

const githubOptions = (config) => {
    return {
        url: `https://api.github.com/repos/${config.githubRepoOwner}/${config.githubRepoName}/contents/${config.githubRepoPath}`,
        headers: {
            'User-Agent': 'githubdocs'
        }
    };
};

const getDocs = async () => {
    const githubOpts = githubOptions(config);

    if(config.static){
        // Get docs
        return glob('docs/*');
    }

    if(process.env.NODE_ENV === 'production'){
        const githubData = await axios.get(githubOpts.url, {
            headers: githubOpts.headers
        });

        return githubData.data;
    }
    return require('../config/exampleDocs.json');
};

const getDoc = async (doc) => {
    if(config.static){
        // Get doc
        return fs.readFileSync(doc, 'utf-8');
    }

    // Check for existing doc
    const existingDoc = _.filter(indexedDocs, { sha: doc.sha });
    if(existingDoc && existingDoc.length > 0){
        return existingDoc.docBody;
    }
    // No existing doc, fetching
    try{
        const fetchedDoc = await axios.get(doc.download_url);
        return fetchedDoc.data;
    }catch(ex){
        console.log('[ERROR] Failed to fetch Github doc', ex);
        return '';
    }
};

const getSha = async (doc) => {
    if(config.static){
        // Get sha of doc
        const shasum = crypto.createHash('sha1');
        const readFile = fs.readFileSync(doc, 'utf-8');
        shasum.update(readFile);
        return shasum.digest('hex');
    }

    return doc.sha;
};

module.exports = {
    uglify,
    indexDocs,
    generateSitemap
};
