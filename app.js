//jshint esversion:6
require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const ejs = require('ejs');
const mongoose = require('mongoose');
const session = require('express-session');
const passport = require('passport');
const passportLocalMongoose = require('passport-local-mongoose');
//const { Passport } = require('passport');
// const bcrypt = require('bcrypt');
// const saltRounds = 7;

const app = express();

app.use(express.static('public'));
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended: true}));

app.use(session({
    secret: "Our little secret",
    resave: false,
    saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());

mongoose.connect('mongodb://localhost:27017/userDB', {useNewUrlParser: true});
//mongoose.set('useCreateIndex', true);

const userSchema = new mongoose.Schema({
    email: String,
    username: String,
    password: String,
    nickname: String
});

userSchema.plugin(passportLocalMongoose);

const User = new mongoose.model('User', userSchema);

passport.use(User.createStrategy());

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());


app.get('/', (req, res)=>{
    res.render('home');
});

app.get('/login', (req, res)=>{
    res.render('login');
});

app.get('/register', (req, res)=>{
    res.render('register');
});

app.get('/secrets', (req, res)=>{
    if (req.isAuthenticated()) {
        res.render('secrets');
    } else {
        res.redirect('/login');
    }
});

app.get('/logout', (req, res)=>{
    req.logout();
    res.redirect('/');
});

app.post('/register', (req, res) => {
    User.register({email: req.body.email, username: req.body.username, nickname: req.body.nickname}, req.body.password, (err, user)=>{
        if(err){
            console.log(err);
        } else{
            passport.authenticate('local')(req, res, ()=>{
                res.redirect('/secrets');
            });
        }
    });
});

app.post('/login', (req, res)=>{
    const user = new User({
        email: req.body.email,
        password: req.body.password
    });
    req.login(user, (err)=>{
        if(err){
            console.log("helloworld!");
        } else {
            passport.authenticate('local')(req, res, ()=>{
                res.redirect('/secrets');
            });
        }
    });
});

app.listen(4444, ()=>{
    console.log('Server started on port 4444.');
});


