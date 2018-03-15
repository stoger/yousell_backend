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
    cors = require('cors'),
    jwt = require('jsonwebtoken');

let loginRoutes = require('./routes/r_login'),
    listingRoutes = require('./routes/r_items'),
    messagingRoutes = require('./routes/r_messages'),
    ratingRoutes = require('./routes/r_rating'),
    searchRoutes = require('./routes/r_search'),
    chattingRoutes = require('./routes/r_chat');

let app = express();
app.locals.allowedOrigins = ['http://localhost:3000', 'http://localhost:8080', 'http://172.20.10.4:3000', 'http://172.17.111.118'];

let issuesoption = {
    origin: true,
    methods: ['GET', 'POST'], // extendable, possibly a PUT would be sent as soon as images are uploaded
    credentials: true,
};

let mongoURI = process.env.MONGOLAB_URI || 'mongodb://localhost:27017/yousell';
mongoose.connect(mongoURI, {
    useMongoClient: true
}, (err, result) => {
    if (err) {
        console.log('Error trying to establish DBConnection');
        process.exit(1);
    }

    console.log('Connected to MongoDB successfully!');
});

// Load the configuration for passport which is located in config/passport.js
require('./config/passport');

// Main project configuration for the server itself
app.use(helmet.xssFilter());
app.use(helmet.noCache());
app.use(helmet.noSniff());
app.use(helmet.frameguard());
app.use(helmet.hidePoweredBy({
    setTo: 'PHP 4.15.2'
}));
app.use(logger('dev'));
app.use(cors(issuesoption));
app.use(bodyParser.urlencoded({
    extended: true,
    limit: '50mb'
}));
app.use(bodyParser.json({
    limit: '50mb'
}));
app.use(validator());
app.use(cookieParser());
app.use(session({
    secret: 'yousellbackendsecret',
    resave: false,
    saveUninitialized: true
}));
app.use(flash());
app.use(passport.initialize());
app.use(passport.session());
app.use(express.static(path.join(__dirname, 'public')));

// Set secret which is solely used for JWT
app.set('secret', '2e418b5751e5d91f3b3b32ab5851222a');

// app.get('/documentation/all', (req, res) => {
//     res.sendFile(path.join(__dirname, 'apidoc/index.html'));
// });

app.all('*', (req, res, next) => {
    let reqOrigin = req.headers.origin;

    if (app.locals.allowedOrigins.indexOf(reqOrigin) !== -1) {
        res.setHeader('Access-Control-Allow-Origin', reqOrigin);
        res.setHeader('Access-Control-Allow-Methods', ['GET', 'POST']);
    }

    res.setHeader('Access-Control-Allow-Credentials', true);
    next();
});

app.use('/login', loginRoutes);

// Important app.use for suppporting JWT throughout all routes except for the login route.
// Initial token created when successfully logging in

// app.use((req, res, next) => {
//     let token = req.body.token || req.query.token || req.headers['x-access-token'] || req.get('x-access-token');
//     if (token) {
//         jwt.verify(token, app.get('secret'), (err, decoded) => {
//             if (err) {
//                 res.contentType('application/json').status(403).send(
//                     JSON.stringify({
//                         message: 'Error when trying to verify JWT',
//                         error: err
//                     })
//                 ).end();
//             } else {
//                 req.decoded = decoded;
//                 console.log('Heading towards next route!');
//                 next();
//             }
//         });
//     } else {
//         res.contentType('application/json').status(403).send(
//             JSON.stringify({
//                 message: 'No token provided',
//             })
//         ).end();
//     }
// });

app.use('/main', listingRoutes);
app.use('/message', messagingRoutes);
app.use('/rate', ratingRoutes);
app.use('/search', searchRoutes);
app.use('/chat', chattingRoutes)


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

app.use(csrf({
    cookie: true
}));
module.exports = app;