const uglifycss = require('uglifycss');
const uglifyjs = require('uglify-js');
const fs = require('fs-extra');
const md = require('markdown-it')();
const path = require('path');
var config = require('./config/config.json');

// uglify assets
module.exports.uglify = function(callback) {
    // uglify css
    var cssfileContents = fs.readFileSync(path.join('public', 'stylesheets', 'style.css'), 'utf8');
    var cssUglified = uglifycss.processString(cssfileContents);
    fs.writeFileSync(path.join('public', 'stylesheets', 'style.min.css'), cssUglified, 'utf8');

    // uglify js
    var rawCode = fs.readFileSync(path.join('public', 'javascripts', 'main.js'), 'utf8');
    var jsUglified = uglifyjs.minify(rawCode, {
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

module.exports.build = function(callback) {
    if(typeof config.docs !== 'undefined' && config.docs.length > 0){
        fs.emptyDir('dist')
        .then(() => {
            config.docs.forEach(function(doc){
                let fileContents = fs.readFileSync(doc.file, "utf-8")
                fs.writeFileSync(path.join("dist", doc.title.toLowerCase() + ".html"), md.render(fileContents))
            });
        })
        .then(() => {
            callback()
        })
        .catch(() => {
            console.log("One or more files were not found");
            callback()
        });
    }
};