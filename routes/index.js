var express = require('express');
var router = express.Router();

router.get('/', function(req, res, next) {
    var db = req.app.db;
    var config = req.app.config;

    db.find({}, function (err, docs){
        res.render('index', { 
            title: 'Welcome to ' + config.title,
            docs: docs,
            config: config
        });
    });
});

router.get('/doc/:slug', function(req, res, next) {
    var db = req.app.db;
    var config = req.app.config;

    db.find({}, function (err, docs){
        db.findOne({docSlug: req.params.slug}, function (err, doc){
            res.render('index', { 
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
