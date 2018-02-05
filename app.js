let express = require('express'),
    path = require('path'),
    logger = require('morgan'),
    cookieParser = require('cookie-parser'),
    bodyParser = require('body-parser'),
    session = require('express-session'),
    passport = require('passport'),
    flash = require('connect-flash'),
    mongoose = require('mongoose'),
    validator = require('express-validator'),
    helmet = require('helmet'),
    csrf = require('csurf'),
    cors = require('cors');


let loginRoutes = require('./routes/r_login'),
    listingRoutes = require('./routes/r_items'),
    messagingRoutes = require('./routes/r_messages'),
    ratingRoutes = require('./routes/r_rating'),
    searchRoutes = require('./routes/r_search');

let app = express();
app.locals.allowedOrigins = ['http://localhost:3000', 'http://localhost:8080', 'http://172.20.10.4:3000'];

let issuesoption = {
    origin: true,
    methods: ['GET', 'POST'], // extendable, possibly a PUT would be sent as soon as images are uploaded
    credentials: true,
};

let mongoURI = process.env.MONGOLAB_URI || 'mongodb://192.168.1.17/yousell';
mongoose.connect(mongoURI, {
    useMongoClient: true
}, (err, result) => {
    if (err) {
        console.log('Error trying to establish DBConnection');
    } else {
        console.log('Connected to MongoDB successfully!');
    }
});

// Load the configuration for passport which is located in config/passport.js
require('./config/passport');

// view engine setup
// app.set('views', path.join(__dirname, 'views'));
// app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(helmet({
    noCache: true,
    hidePoweredBy: { setTo: 'Default' },
    noSniff: true,
    xssFilter: true
})); // Disable this if it doesn't work anymore
app.use(cors(issuesoption));
app.use(bodyParser.urlencoded({ extended: true, limit: '50mb' }));
app.use(bodyParser.json({ limit: '50mb' }));
app.use(validator());
app.use(cookieParser());
app.use(session({ secret: 'mysupersecret', resave: false, saveUninitialized: true }));
app.use(flash());
app.use(passport.initialize());
app.use(passport.session());
app.use(express.static(path.join(__dirname, 'public')));


app.all('*', (req, res, next) => {
    let reqOrigin = req.headers.origin;

    if (app.locals.allowedOrigins.indexOf(reqOrigin) !== -1) {
        res.setHeader('Access-Control-Allow-Origin', reqOrigin);
    }

    res.setHeader('Access-Control-Allow-Credentials', true);
    next();
});

app.use('/login', loginRoutes);
app.use('/main', listingRoutes);
app.use('/message', messagingRoutes);
app.use('/rate', ratingRoutes);
app.use('/search', searchRoutes);


// catch 404 and forward to error handler
app.use(function (req, res, next) {
    console.log('No route found...');

    let err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handler
app.use(function (err, req, res, next) {
    console.log(err.stack);

    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    // render the error page
    res.status(err.status || 500);
    res.end(JSON.stringify(err));
});

app.use(csrf({ cookie: true }));
module.exports = app;