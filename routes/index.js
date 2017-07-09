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

module.exports = router;
