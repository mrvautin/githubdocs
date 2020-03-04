const uglifycss = require('uglifycss');
const uglifyjs = require('uglify-js');
const fs = require('fs');
const md = require('markdown-it')();
const path = require('path');
const config = require('./config/config.json');

// uglify assets
module.exports.uglify = function(callback){
    // uglify css
    const cssfileContents = fs.readFileSync(path.join('public', 'stylesheets', 'style.css'), 'utf8');
    const cssUglified = uglifycss.processString(cssfileContents);
    fs.writeFileSync(path.join('public', 'stylesheets', 'style.min.css'), cssUglified, 'utf8');

    const materialCssfileContents = fs.readFileSync(path.join('public', 'stylesheets', 'material-style.css'), 'utf8');
    const materialCssUglified = uglifycss.processString(materialCssfileContents);
    fs.writeFileSync(path.join('public', 'stylesheets', 'material-style.min.css'), materialCssUglified, 'utf8');

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
    callback();
};

module.exports.build = function(callback){
    if(typeof config.docs !== 'undefined' && config.docs.length > 0){
        fs.emptyDir('dist')
        .then(() => {
            config.docs.forEach((doc) => {
                const fileContents = fs.readFileSync(doc.file, 'utf-8');
                fs.writeFileSync(path.join('dist', doc.title.toLowerCase() + '.html'), md.render(fileContents));
            });
        })
        .then(() => {
            callback();
        })
        .catch(() => {
            console.log('[ERROR] One or more files were not found');
            callback();
        });
    }else{
        console.log('[ERROR] No docs to process. Add some to your config.json file');
    }
};
