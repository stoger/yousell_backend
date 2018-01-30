var passport = require('passport');
var User = require('../models/m_user_pp');
var flash = require('connect-flash');

// replace with ldapaut later
var LocalStrategy = require('passport-local').Strategy;

passport.serializeUser(function (user, done) {
    done(null, user);
});

passport.deserializeUser(function (id, done) {
    User.findById(id, function (err, user) {
        done(err, user);
    });
});

passport.use('local.signin', new LocalStrategy({
    usernameField: 'username',
    passwordField: 'password',
    passReqToCallback: true
}, function (req, username, password, done) {
    req.checkBody('username').trim().notEmpty();//.isEmail();
    req.checkBody('password').trim().notEmpty();
    let errors = req.validationErrors();

    if (errors) {
        let messages = [];
        errors.forEach(function (error) {
            console.log(error);
            messages.push(error.msg);
        });

        return done(null, false, req.flash('error', messages));
    }

    // TODO: Change for LDAP
    // TODO: Specify speaking error messages for RALF
    User.find({ "username": username }, function (err, user) {
        if (err) {
            console.log(`Unable to find One: ${err}`);
            return done(err);
        }

        if (!user) {
            console.log(`Unable to find User`);
            return done(null, false, { message: 'No user was found.' });
        }

        // CHECK THIS ONCE MORE, DOESN'T WORK
        if (!User.validatePassword(password)) {
            console.log('Passwords dont match');
            return done(null, false, { message: 'Wrong password.' });
        }

        return done(null, user);
    });
}));