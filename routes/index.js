const express = require('express');
const path = require('path');
const {
    generateSitemap
} = require('../lib/common');
const router = express.Router();

router.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../index.html'));
});

router.get('/config', (req, res) => {
    res.status(200).json(req.app.config);
});

router.get('/sidebar', async (req, res) => {
    const db = req.app.db;
    const config = req.app.config;

    const docs = await db.find({});
    res.status(200).json({ docs: docs, config: config });
});

router.get('/doc/:slug', async (req, res) => {
    const db = req.app.db;
    const config = req.app.config;

    const docs = await db.find({});
    const doc = await db.findOne({ docSlug: req.params.slug });
    res.status(200).json({
        title: doc.docTitle,
        doc: doc,
        docs: docs,
        config: config
    });
});

// search on the index
router.post('/search', async (req, res) => {
    const db = req.app.db;
    const index = req.app.index;

    // we strip the ID's from the index search
    const indexArray = [];
    index.search(req.body.keyword).forEach((id) => {
        indexArray.push(id._id);
    });

    // we search on the indexes
    const results = await db.find({ _id: { $in: indexArray } });
    res.status(200).json(results);
});

// return sitemap
router.get('/sitemap.xml', async (req, res) => {
    const sitemap = await generateSitemap(req);

    // render the sitemap
    sitemap.toXML((err, xml) => {
        if(err){
            res.status(500).end();
            return;
        }
        res.header('Content-Type', 'application/xml');
        res.send(xml);
    });
});

module.exports = router;
