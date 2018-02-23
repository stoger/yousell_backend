let express = require('express'),
    router = express.Router(),
    cors = require('cors'),
    bodyParser = require('body-parser'),
    csrf = require('csurf'),
    passport = require('passport');

let csrfProtection = csrf();

let jsonParser = bodyParser.json(),
    urlParser = bodyParser.urlencoded({ extended: true });

let bodyParseArray = [jsonParser, urlParser];

let countProducts = require('../models/m_product').countAllProducts;

router.get('/', csrfProtection, (req, res) => {
    let token = req.csrfToken();
    res.json({ _csrf: token });
});

router.get('/success', function (req, res) {
    console.log('Seems like a success');
    countProducts()
        .then(count => {
            res.contentType('application/json').json({
                success: true,
                amount: count / 12
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

router.post('/', bodyParseArray, passport.authenticate('local.signin', {
    successRedirect: '/login/success',
    failureRedirect: '/login/failure',
    session: false
}));

module.exports = router;