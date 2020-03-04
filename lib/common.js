const fs = require('fs');
const path = require('path');
const uglifycss = require('uglifycss');
const uglifyjs = require('uglify-js');
const slugify = require('slugify');
const cheerio = require('cheerio');
const axios = require('axios');
const JsSearch = require('js-search');
const sm = require('sitemap');
const md = require('markdown-it')();
const glob = require('glob-promise');
const shortid = require('shortid');

// uglify assets
const uglify = () => {
    // uglify css
    const cssfileContents = fs.readFileSync(path.join('public', 'stylesheets', 'style.css'), 'utf8');
    const cssUglified = uglifycss.processString(cssfileContents);
    fs.writeFileSync(path.join('public', 'stylesheets', 'style.min.css'), cssUglified, 'utf8');

    // uglify js
    const rawCode = fs.readFileSync(path.join('public', 'javascripts', 'main.js'), 'utf8');
    const jsUglified = uglifyjs.minify(rawCode, {
        compress: {
            dead_code: true,
            global_defs: {
                DEBUG: false
            }
        }
    });

    fs.writeFileSync(path.join('public', 'javascripts', 'main.min.js'), jsUglified.code, 'utf8');
    console.log('[INFO] Files minified');
    return Promise.resolve();
};

// indexes the docs from Github. Is ran on initial start and the interval in config or default
const indexDocs = async (app) => {
    const db = app.db;
    const config = app.config;

    const options = {
        url: 'https://api.github.com/repos/' + config.githubRepoOwner + '/' + config.githubRepoName + '/contents/' + config.githubRepoPath,
        headers: {
            'User-Agent': 'githubdocs'
        }
    };

    let githubdocs = [];
    if(process.NODE_ENV === 'production'){
        // TODO check this
        githubdocs = await axios.get(options.url, {
            headers: options.headers
        }).data;
    }else{
        githubdocs = require('../config/exampleDocs.json');
    }

    // loop our docs and insert into DB
    for(let i = 0, len = githubdocs.length; i < len; i++){
        const doc = githubdocs[i];
        // only insert files, ignore dirs
        if(doc.type === 'file'){
            const existingDoc = await db.findOne({ sha: doc.sha });

            let docBody = '';
            if(existingDoc){
                docBody = existingDoc.docBody;
            }else{
                // No existing doc, fetching
                const fetchedDoc = await axios.get(doc.download_url);
                docBody = fetchedDoc.data;
            }
            const renderedHtml = md.render(docBody);
            const $ = cheerio.load(renderedHtml);
            let docTitle = $('h1').first().text();

            // set the docTitle
            if(docTitle.trim() === ''){
                docTitle = doc.name;
            }

            // set the docTitle for the DB
            doc.docTitle = docTitle;
            doc.docBody = renderedHtml;
            doc.docSlug = slugify(docTitle);

            // Upsert
            await db.update({ docSlug: doc.docSlug }, doc, { upsert: true });
        }

        // Get all docs and add to the index
        const docs = await db.find({});

        // setup index
        const index = new JsSearch.Search('_id');
        index.addIndex('docTitle');
        index.addIndex('docBody');
        index.addIndex('docSlug');

        // Add all docs to index
        index.addDocuments(docs);

        // Write back index
        app.index = index;
    };
};

// indexes the static docs. Is ran on initial start and the interval in config or default
const indexStatic = async (app) => {
    const docsStore = [];

    // Get docs
    const docs = await glob('docs/*');

    // setup index
    const index = new JsSearch.Search('_id');
    index.addIndex('docTitle');
    index.addIndex('docBody');
    index.addIndex('docSlug');

    // add to index
    for(let i = 0, len = docs.length; i < len; i++){
        const doc = docs[i];

        const docBody = fs.readFileSync(doc, 'utf-8');
        const renderedHtml = md.render(docBody);
        const $ = cheerio.load(renderedHtml);
        let docTitle = $('h1').first().text();

        // set the docTitle
        if(docTitle.trim() === ''){
            docTitle = path.basename(doc, '.md');
        }

        const docId = shortid.generate();

        const indexDoc = {
            docTitle: docTitle,
            docBody: renderedHtml,
            docSlug: slugify(docTitle),
            docFile: doc,
            _id: docId
        };

        // Add to config
        docsStore.push(indexDoc);
    };

    // Add all docs to index
    index.addDocuments(docsStore);

    // Write back index
    app.index = index;

    // Keep static docs
    app.config.docs = docsStore;
};

const generateSitemap = async (req) => {
    const db = req.app.db;

    // get the articles
    const docs = await db.find({});
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

module.exports = {
    uglify,
    indexDocs,
    indexStatic,
    generateSitemap
};
