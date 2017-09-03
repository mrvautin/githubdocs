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
var async = require('async');
var fs = require('fs');
var md = require('markdown-it')();
var shared = require('./shared');
var config = require('./config/config.json');

var routes = require('./routes/static');

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

// setup lunr
var lunrIndex = lunr(function (){
    this.field('docTitle', {boost: 10});
    this.field('docBody', {boost: 5});
});

// add some references to app
app.config = config;
app.index = lunrIndex;

// build html
shared.build(function(){
    console.log("[INFO] Successfully built");
    // uglify assets
    shared.uglify(function(){
        // kick off initial index
        indexDocs(function(){
            // serve the app
            app.listen(app.get('port'), app.get('bind'), function (){
                console.log('[INFO] githubdocs running on host: http://' + app.get('bind') + ':' + app.get('port'));
            });
        });
    });
});

// Send HTML file
app.get('/', function(req, res, next) {
    res.sendFile(path.join(__dirname, '../index.html'));
});


// indexes the docs from Github. Is ran on initial start and the interval in config or default
function indexDocs(callback){
    if(typeof config.docs !== 'undefined' && config.docs.length > 0){
        let docIndex = 0;
        config.docs.forEach(function(doc){
            let fileContents = fs.readFileSync(doc.file, "utf-8")
            let renderedHtml = md.render(fileContents);
            let $ = cheerio.load(renderedHtml);
            let docTitle = $('h1').first().text();

            // set the docTitle
            if(docTitle.trim() === ''){
                docTitle = doc.name;
            }

            // set the docTitle for the DB
            doc.docTitle = docTitle;
            doc.docBody = renderedHtml;
            doc.docSlug = slugify(docTitle);

            // build lunr index doc
            var indexDoc = {
                docTitle: docTitle,
                docBody: $.html(),
                id: docIndex
            }

            // add to lunr index
            lunrIndex.add(indexDoc);

            config.docs[docIndex].index = docIndex;
            docIndex++;
        })
        callback()
    }else{
        console.log("No docs found");
        process.exit(0);
    }
}

module.exports = app;
