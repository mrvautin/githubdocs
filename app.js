var express = require('express');
var path = require('path');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var request = require('request');
var Datastore = require('nedb');
var lunr = require('lunr');
var slugify = require('slugify');
var cheerio = require('cheerio');
var _ = require('lodash');
var uglifycss = require('uglifycss');
var uglifyjs = require('uglify-js');
var async = require('async');
var fs = require('fs');
var config = require('./config/config.json');

var routes = require('./routes/index');

var app = express();

app.engine('html', require('ejs').renderFile);
app.set('view engine', 'ejs');
app.use(logger('dev'));
app.set('port', process.env.PORT || 5555);
app.set('bind', process.env.BIND || '0.0.0.0');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', routes);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function (err, req, res, next) {
        res.status(err.status || 500);
        res.send({
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function (err, req, res, next) {
    res.status(err.status || 500);
    res.send({
        message: err.message,
        error: err
    });
});

// setup db
var db = new Datastore('data/docs.db');
db.loadDatabase();

// get docs
var options = {
    url: 'https://api.github.com/repos/' + config.githubRepoOwner + '/' + config.githubRepoName + '/contents/' + config.githubRepoPath,
    headers: {
        'User-Agent': 'githubdocs'
    }
};

// setup lunr
var lunrIndex = lunr(function (){
    this.field('docTitle', {boost: 10});
    this.field('docBody', {boost: 5});
});

// add some references to app
app.db = db;
app.config = config;
app.index = lunrIndex;

// set the indexing to occur every Xmins - defaults to: 300000ms
setInterval(function() {
    indexDocs(options);
}, config.updateDocsInterval || 300000);

// uglify assets
uglify(function(){
    // kick off initial index
    indexDocs(options, function(){
        // serve the app
        app.listen(app.get('port'), app.get('bind'), function (){
            console.log('[INFO] githubdocs running on host: http://' + app.get('bind') + ':' + app.get('port'));
        });
    });
});

// uglify assets
function uglify(callback){
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

// indexes the docs from Github. Is ran on initial start and the interval in config or default
function indexDocs(options, callback){
    request(options, function(error, response, body){
        // loop our docs and insert into DB
        async.each(JSON.parse(body), function(doc, callback) {
            // only insert files, ignore dirs
            if(doc.type === 'file'){
                request.get(doc.download_url, function (error, response, body) {
                    var md = require('markdown-it')();
                    var renderedHtml = md.render(body);
                    var $ = cheerio.load(renderedHtml);
                    var docTitle = $('h1').first().text();

                    // set the docTitle
                    if(docTitle.trim() === ''){
                        docTitle = doc.name;
                    }

                    // set the docTitle for the DB
                    doc.docTitle = docTitle;
                    doc.docBody = renderedHtml;
                    doc.docSlug = slugify(docTitle);
                    
                    // upsert doc
                    db.update({docSlug: doc.docSlug}, doc, {upsert: true}, function (err, newDoc) {
                        // build lunr index doc
                        var indexDoc = {
                            docTitle: docTitle,
                            docBody: $.html(),
                            id: newDoc._id
                        }

                        // add to lunr index
                        lunrIndex.add(indexDoc);        
                        callback();
                    });
                });
            }
        }, function(err) {
            console.log('[INFO] Indexing complete');
            // callback on optional callback
            if(callback){
                callback();
            }
        });
    });
}

module.exports = app;
