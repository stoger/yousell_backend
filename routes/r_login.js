let express = require('express'),
    router = express.Router(),
    cors = require('cors'),
    bodyParser = require('body-parser'),
    csrf = require('csurf'),
    passport = require('passport');

let csrfProtection = csrf();

let jsonParser = bodyParser.json();
let urlParser = bodyParser.urlencoded({ extended: true });

let bodyParseArray = [jsonParser, urlParser];

router.get('/', csrfProtection, (req, res) => {
    console.log('Sending token!');
    let token = req.csrfToken();
    res.json({ _csrf: token });
});

router.get('/success', function (req, res) {
    res.contentType('application/json').json({
        success: true,
    });
});

router.get('/failure', bodyParseArray, function (req, res) {
    res.contentType('application/json').json({
        success: false,
    });
});

router.post('/', bodyParseArray, passport.authenticate('local.signin', {
    successRedirect: '/login/success',
    failureRedirect: '/login/failure',
    failureFlash: true
}));

module.exports = router;