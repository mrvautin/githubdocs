const express = require('express');
const path = require('path');
const slugify = require('slugify');
const fs = require('fs');
const {
    generateSitemap
} = require('../lib/common');
const router = express.Router();

router.get('/', (req, res) => {
    const config = req.app.config;
    let layoutFile = 'index.html';
    if(typeof config.layoutFile && config.layoutFile !== ''){
        layoutFile = config.layoutFile;
    }
    res.sendFile(path.join(__dirname, '../', layoutFile));
});

router.get('/config', (req, res) => {
    res.status(200).json(req.app.config);
});

router.get('/sidebar', (req, res) => {
    const config = req.app.config;
    res.status(200).json({ docs: config.docs, config: config });
});

router.get('/doc/:slug', (req, res) => {
    const config = req.app.config;
    let reqDoc = '';
    let index = 0;
    let reqIndex = 0;
    config.docs.forEach((doc) => {
        if(doc.docSlug.toLowerCase() === req.params.slug.toLowerCase()){
            reqDoc = doc;
            reqIndex = index;
        }
        index++;
    });

    res.status(200).json({
        title: reqDoc.docTitle,
        doc: {
            docBody: reqDoc.docBody,
            docTitle: reqDoc.docTitle,
            nextDoc: config.docs[reqIndex + 1],
            prevDoc: config.docs[reqIndex - 1]
        },
        docs: config.docs,
        config: config
    });
});

// search on the index
router.post('/search', (req, res) => {
    const config = req.app.config;
    const index = req.app.index;

    // we strip the ID's from the index search
    const indexArray = [];
    index.search(req.body.keyword).forEach((id) => {
        indexArray.push(id._id);
    });

    const matches = config.docs.filter((doc) => {
        return indexArray.includes(doc._id);
    });

    res.status(200).json(matches);
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
