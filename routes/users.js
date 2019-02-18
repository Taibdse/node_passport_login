const express = require('express');
const router = express.Router();
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const User = require('../models/user');

//Get Register
router.get('/register', (req, res) => {
    res.render('register');
})

//Login
router.get('/login', (req, res) => {
    res.render('login');
})

router.post('/register', (req, res) => {
    let { name, email, username, password, password2 } = req.body;
    
    //Validation
    req.checkBody('name', 'Name is required').notEmpty();
    req.checkBody('email', 'Email is required').notEmpty();
    req.checkBody('email', 'Email is not valid').isEmail();
    req.checkBody('username', 'Userame is required').notEmpty();
    req.checkBody('password', 'Password is required').notEmpty();
    req.checkBody('password2', 'Passwords do not match').equals(password);

    let errors = req.validationErrors();

    if(errors){
        res.render('register', { errors })
    } else {
        let newUser = User({ name, email, username, password });
        User.createUser(newUser, (err, user) => {
            if(err) throw err;
            console.log(user);
        })
        req.flash('success_msg', 'You are registered and now can login');
        res.redirect('/users/login');
    }
})

passport.use(new LocalStrategy(function(username, password, done){
    User.getUserByUsername(username, (err, user) => {
        if(err) throw err;
        if(!user){
            return done(null, false, { message: 'Unknown user' });
        }
        User.comparePassword(password, user.password, (err, isMatch) => {
            if(err) throw err;
            if(isMatch) {
                return done(null, user);
            } else {
                return done(null, false, { message: 'Invalid password' });
            }
        })
    })
}))

passport.serializeUser((user, done) => {
    done(null, user.id)
})

passport.deserializeUser((id, done) => {
    User.getUserById(id, (err, user) => {
        done(err, user);
    });
})

router.post('/login', 
    passport.authenticate('local', 
    { successRedirect: '/', failureRedirect: '/users/login', failureFlash: true }), 
    (req, res) => {
    res.redirect('/');
})

router.get('/logout', (req, res) => {
    req.logOut();
    req.flash('success_msg', 'You are logout');
    res.redirect('/users/login');
})

module.exports = router;