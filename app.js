const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const exphbs = require('express-handlebars');
const expressValidator = require('express-validator');
const flash = require('connect-flash');
const session = require('express-session');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const mongo = require('mongodb');
const mongoose = require('mongoose');


mongoose.connect('mongodb://admin:admin123@ds139775.mlab.com:39775/node_passport_login', { useNewUrlParser: true })
.then(() => console.log('Database connected'))
.catch(err => console.log('Can not connect to DB'))

const indexRoutes = require('./routes/index');
const userRoutes = require('./routes/users');

const app = express();

//view engin setup
app.set('views', path.join(__dirname, 'views'));
app.engine('handlebars', exphbs({ defaultLayout: 'layout' }));
app.set('view engine', 'handlebars');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());

app.use(express.static(path.join(__dirname, 'public')));

//Express session
app.use(session({
    secret: 'secret',
    saveUninitialized: true,
    resave: true
}))

//passport init
app.use(passport.initialize());
app.use(passport.session());

//express-validator
app.use(expressValidator({
    errorFormatter: function(param, msg, value){
        let namespace = param.split('.');
        let root = namespace.shift();
        let formParam = root;
        while(namespace.length){
            formParam += `[${namespace.shift()}]`;
        }
        return {
            param: formParam,
            msg: msg,
            value: value
        }
    }
}))

//Connect Flash
app.use(flash());

//global variables
app.use(function(req, res, next){
    res.locals.success_msg = req.flash('success_msg');
    res.locals.error_msg = req.flash('error_msg');
    res.locals.error = req.flash('error');
    res.locals.user = req.user || null;
    next();
})

app.use('/', indexRoutes);
app.use('/users', userRoutes);

app.set('port', (process.env.PORT || 3000));
app.listen(app.get('port'), () => console.log(`Server started on port ${app.get('port')}`));