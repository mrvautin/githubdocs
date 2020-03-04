const express = require('express');
const path = require('path');
const logger = require('morgan');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const Datastore = require('nedb-promises');
const {
    uglify,
    indexDocs,
    indexStatic
} = require('./lib/common');
const config = require('./config/config.json');

// Set either dynamic or static
let route = require('./routes/index');
if(config.static){
    route = require('./routes/static');
}

const app = express();

app.use(logger('dev'));
app.set('port', process.env.PORT || 5555);
app.set('bind', process.env.BIND || '0.0.0.0');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', route);

// catch 404 and forward to error handler
app.use((req, res, next) => {
    const err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handlers

// development error handler
// will print stacktrace
if(app.get('env') === 'development'){
    app.use((err, req, res, next) => {
        res.status(err.status || 500);
        res.send({
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use((err, req, res, next) => {
    res.status(err.status || 500);
    res.send({
        message: err.message,
        error: err
    });
});

// setup db
const db = new Datastore('data/docs.db');
db.load();

// add some references to app
app.db = db;
app.config = config;

// set the indexing to occur every Xmins - defaults to: 300000ms (5mins)
setInterval(async() => {
    if(config.static){
        await indexStatic(app);
    }else{
        await indexDocs(app);
    }
}, config.updateDocsInterval || 300000);

// uglify assets
uglify()
.then(async() => {
    // kick off initial index
    if(config.static){
        // Index docs
        await indexStatic(app);
    }else{
        // Remove docs on startup to re-index
        await db.remove({}, { multi: true });

        // Index docs
        await indexDocs(app);
    }

    console.log('[INFO] Indexing complete');
    // serve the app
    app.listen(app.get('port'), app.get('bind'), () => {
        console.log('[INFO] githubdocs running on host: http://' + app.get('bind') + ':' + app.get('port'));
    });
});

module.exports = app;
