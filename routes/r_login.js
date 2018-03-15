let express = require('express'),
    router = express(),
    cors = require('cors'),
    bodyParser = require('body-parser'),
    csrf = require('csurf'),
    passport = require('passport'),
    jwt = require('jsonwebtoken');

let csrfProtection = csrf();

let jsonParser = bodyParser.json(),
    urlParser = bodyParser.urlencoded({
        extended: true
    });

let bodyParseArray = [jsonParser, urlParser];

let countProducts = require('../models/m_product').countAllProducts;

/**
 * @api {get} /login  CSRF Token anfragen
 * @apiName Request-CSRF
 * @apiGroup Login
 * 
 * @apiSuccess _token {String} CSRF-Token
 */
router.get('/', csrfProtection, (req, res) => {
    let token = req.csrfToken();
    res.json({
        _csrf: token
    });
});

router.get('/success', function (req, res) {
    countProducts()
        .then(count => {
            res.contentType('application/json').json({
                success: true,
                amount: Math.ceil(count / 12)
            });
        }, err => {
            console.log('dis shiet redirects!');
            res.redirect('/login/failure');
        });
});

router.get('/failure', bodyParseArray, (req, res) => {
    res.contentType('application/json').json({
        success: false,
    });
});

/** 
 * @api {post} /login Authentifiziert den Benutzer am LDAP Server
 * @apiName User-Login
 * @apiGroup Login
 * 
 * @apiParam {String} username Eingegebener Benutzername
 * @apiParam {String} password Eingegebenes Passwort
 * 
 * @apiParamExample {json} Request paylaod example:
 * { "username": "testuser", "password": "testpasswd" }
 * 
 * @apiSuccess success {Boolean} true
 * @apiSuccess amount {Double} Anzahl der zu anzeigenden Produkte
 * 
 * @apiError success {Boolean} false
 */
router.post('/', bodyParseArray, passport.authenticate('local', {
    successRedirect: '/login/success',
    failureRedirect: '/login/failure',
    session: false
}));

// not used currently
router.post('/', bodyParseArray, (req, res, next) => {
    passport.authenticate('ldap', (err, user, info) => {
        if (err) {
            console.log('Returning with full on error, status 500!');
            next(err);
        }

        if (!user) {
            console.log('Returning with authentication failure, status 204!');
            res.contentType('application/json').status(204).send(
                JSON.stringify({
                    success: false,
                    message: 'Authentication failed!'
                })
            ).end();
            return;
        }

        let jwtToken = jwt.sign({
            name: user.sAMAccountName
        }, router.get('secret'), {
            expiresIn: 60 * 60 * 24
        });

        countProducts()
            .then(count => {
                console.log('Returning with success, status 200!');
                res.contentType('application/json').status(200).send(
                    JSON.stringify({
                        success: true,
                        amount: Math.ceil(count / 12),
                        token: jwtToken
                    })
                ).end()
            }, err => {
                console.log('Returning with error while trying to count products, status 500!');
                res.contentType('application/json').status(500).send(
                    JSON.stringify({
                        success: false,
                        message: 'Error trying to fetch product count'
                    })
                ).end();
            });
    })(req, res, next);
});

module.exports = router;