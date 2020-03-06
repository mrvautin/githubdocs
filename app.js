const express = require('express');
const path = require('path');
const logger = require('morgan');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
let handlebars = require('express-handlebars');
const cron = require('node-cron');
const {
    uglify,
    indexDocs
} = require('./lib/common');
const config = require('./config/config.json');

const route = require('./routes/index');

const app = express();

// view engine setup
app.set('views', path.join(__dirname, '/views'));
app.engine('hbs', handlebars({
    extname: 'hbs',
    layoutsDir: path.join(__dirname, 'views', 'layouts'),
    defaultLayout: 'layout.hbs'
}));
app.set('view engine', 'hbs');

// Handlebars helpers
handlebars = handlebars.create({
    helpers: {
        env: () => {
            if(process.env.NODE_ENV === 'production'){
                return '.min';
            }
            return '';
        }
    }
});

app.use(logger('dev'));
app.set('port', process.env.PORT || 5555);
app.set('bind', process.env.BIND || '0.0.0.0');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// Make stuff accessible to our router
app.use((req, res, next) => {
    req.handlebars = handlebars;
    next();
});

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

// add some references to app
app.config = config;

// set the indexing to occur every Xmins - defaults to every 5mins
cron.schedule(config.updateDocsCron || '*/5 * * * *', async () => {
    await indexDocs(app);
    console.log('[INFO] Indexing complete');
});

// uglify assets
uglify()
.then(async() => {
    // kick off initial index
    await indexDocs(app);

    console.log('[INFO] Indexing complete');
    // serve the app
    app.listen(app.get('port'), app.get('bind'), () => {
        console.log('[INFO] githubdocs running on host: http://' + app.get('bind') + ':' + app.get('port'));
    });
});

module.exports = app;
