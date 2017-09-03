var express = require('express');
var path = require('path');
var router = express.Router();

router.get('/', function(req, res, next) {
    res.sendFile(path.join(__dirname, '../index.html'));
});

router.get('/config', function(req, res, next) {
    res.status(200).json(req.app.config);
});

router.get('/sidebar', function(req, res, next) {
    var db = req.app.db;
    var config = req.app.config;

    db.find({}, function (err, docs){
        res.status(200).json({docs: docs, config: config});
    });
});

router.get('/doc/:slug', function(req, res, next) {
    var db = req.app.db;
    var config = req.app.config;

    db.find({}, function (err, docs){
        db.findOne({docSlug: req.params.slug}, function (err, doc){
            res.status(200).json({
                title: doc.docTitle,
                doc: doc,
                docs: docs,
                config: config
            });
        });
    });
});

// search on the index
router.post('/search', function(req, res, next) {
    var db = req.app.db;
    var lunrIndex = req.app.index;

    // we strip the ID's from the lunr index search
    var lunrIdArray = [];
    lunrIndex.search(req.body.keyword).forEach(function(id){
        lunrIdArray.push(id.ref);
    });

    // we search on the lunr indexes
    db.find({_id: {$in: lunrIdArray}}, function(err, results){
        res.status(200).json(results);
    });
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
