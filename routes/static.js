const express = require('express');
const path = require('path');
const slugify = require('slugify');
const cheerio = require('cheerio');
const fs = require('fs');
const router = express.Router();

router.get('/', function(req, res, next) {
    var config = req.app.config;
    var layoutFile = "index.html";
    if(typeof config.layoutFile && config.layoutFile !== ""){
        layoutFile = config.layoutFile;
    }

    res.sendFile(path.join(__dirname, '../', layoutFile));
});

router.get('/config', function(req, res, next) {
    res.status(200).json(req.app.config);
});

router.get('/sidebar', function(req, res, next) {
    var config = req.app.config;
    res.status(200).json({docs: config.docs, config: config});
});

router.get('/doc/:slug', function(req, res, next) {
    var config = req.app.config;
    var reqDoc = "";
    let index = 0;
    let reqIndex = 0;
    config.docs.forEach(function(doc){
        if(slugify(doc.title).toLowerCase() === req.params.slug.toLowerCase()){
            reqDoc = doc;
            reqIndex = index;
        }
        index++;
    })

    // Get the doc HTML
    const docFileRead = fs.readFileSync(path.join(__dirname, "../", "dist", reqDoc.title + ".html"), "utf-8");

    res.status(200).json({
        title: reqDoc.docTitle,
        doc: {
            docBody: docFileRead,
            docTitle: reqDoc.docTitle,
            nextDoc: config.docs[reqIndex + 1],
            prevDoc: config.docs[reqIndex - 1]
        },
        docs: config.docs,
        config: config
    });
});

// search on the index
router.post('/search', function(req, res, next) {
    var config = req.app.config;
    var lunrIndex = req.app.index;

    // we strip the ID's from the lunr index search
    var lunrArray = [];
    lunrIndex.search(req.body.keyword).forEach(function(id){
        lunrArray.push(id.ref);
    });

    var matches = config.docs.filter(function(doc){
        return lunrArray.includes(doc.index);
    });

    res.status(200).json(matches);
});

// return sitemap
router.get('/sitemap.xml', function (req, res, next){
    var sm = require('sitemap');
    var db = req.app.db;

    // get the articles
    db.find({}, function (err, docs){
        var urlArray = [];

        // push in the base url
        urlArray.push({url: '/', changefreq: 'weekly', priority: 1.0});

        // get the article URL's
        for(var key in docs){
            urlArray.push({url: docs[key].docSlug, changefreq: 'weekly', priority: 1.0});
        }

        // create the sitemap
        var sitemap = sm.createSitemap({
            hostname: req.protocol + '://' + req.headers.host,
            cacheTime: 600000,        // 600 sec - cache purge period
            urls: urlArray
        });

        // render the sitemap
        sitemap.toXML(function(err, xml){
            if(err){
                return res.status(500).end();
            }
            res.header('Content-Type', 'application/xml');
            res.send(xml);
        });
    });
});

module.exports = router;
