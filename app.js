//this app.js is required

//these are all the functions for the app.js
const express = require('express'); //framework
const app = express();
const mongoose = require("mongoose"); //database library
const bodyParser = require("body-parser"); //parses the JSON
const User = require("./models/user"); //user schema
const imgModel = require("./models/imagemodel"); //portfolio schema
const fs =require("fs"); //all files system
const path = require("path"); //window-style path
const multer =require('multer'); //middleware for handling form-data
require("dotenv/config");

//multer is middleware used for uploading images
const storage = multer.diskStorage({ 
    destination: (req, file, cb) => { 
        cb(null, "uploads") 
    }, 
    filename: (req, file, cb) => { 
        cb(null, file.fieldname + "-" + Date.now()) 
    } 
});
const upload = multer({ storage: storage }); 

//parse incoming request bodies in a middleware before handlers, available under req.body property
app.use(bodyParser.json()); 
app.use(express.static('views'));
app.use(bodyParser.urlencoded({ extended: false })) 

//app.set defines directory where to look for ejs files.
app.set("view engine","ejs"); //ejs
app.use(express.static(__dirname + '/public')) //css, images, js

//database connection
mongoose.connect('');
var db=mongoose.connection; 

//required express-session
app.use(require("express-session")({
    secret:"Any normal Word",       
    resave: false, //is used to enabled the session store that do not support touch command          
    saveUninitialized:false // will prevent a a lot of empty session objects being stored in the session store
}));

//routes
app.get("/", (req,res) =>{
    res.render("home");
})

app.get("/home", (req,res) =>{
    res.render("home");
})

app.get("/submit", (req,res) =>{
    res.render("submit");
})

// Retriving the image 
app.get('/showcase', (req, res, user) => { 
    //find user by id to get their objects (email)
    User.findById(req.session.userId).exec(function (error, user) {
        if (error) {
            return next(error);
        } else {
            if (user === null) {
                var err = new Error('Not authorized! Go back!');
                err.status = 401;
                return next(err);
            } else {
                console.log("Current user: "+user.email);
            }
        }
        //find login user in database 
        var query = user.email;
        imgModel.find({email:query}, (err, items) => {
            if (err) {
                console.log(err); 
            } 
            else { 
                res.render('showcase', { items: items });
            }
        });
    });
});

//login page
app.get("/login",(req,res)=>{
    res.render("login");
});

app.post('/login', function (req, res, next) {
    if (req.body.logemail && req.body.logpassword) {
        //validate the log email and log password
        User.authenticate(req.body.logemail, req.body.logpassword, function (error, user) {
            if (error || !user) {
                var err = new Error('Wrong email or password.');
                err.status = 401;
                return next(err);
            } else {
                req.session.userId = user._id;
                return res.redirect('/showcase');
            }
        });
    } else {
        var err = new Error('All fields required.');
        err.status = 400;
        return next(err);
    }
});

app.get("/signup",(req,res)=>{
    res.render("signup");
});

app.post('/signup', function (req, res, next) {
    //input the email, username, and password
    if (req.body.email && req.body.username && req.body.password && req.body.passwordConf) {
        var userData = {
            email: req.body.email,
            username: req.body.username,
            password: req.body.password,
        }
        User.create(userData, function (error, user) {
            if (error) {
                return next(error);
            } else {
                //item save
                //instead of fetching all objects, it only fetchs user id
                req.session.userId = user._id;
                return res.redirect('/login');
            }
        });
    } else {
        var err = new Error('All fields required.');
        err.status = 400;
        return next(err);
    }
})

//log out function
app.get('/logout', function (req, res, next) {
  if (req.session) {
    // delete session object
    req.session.destroy(function (err) {
      if (err) {
        return next(err);
      } else {
        return res.redirect('/');
      }
    });
  }
});

//default function
module.exports = app;

//submit portfolio
app.post('/submit', upload.single('image'), (req, res, next) => { 
  //fields for the submit form
    var obj = { 
        fname: req.body.fname,
        lname: req.body.lname,
        email: req.body.email, 
        department: req.body.department,
        PTitle: req.body.PTitle,
        Description: req.body.Description,
        ITitile: req.body.ITitle,
        url: req.body.url,
        group: req.body.group,
        img: { 
            data: fs.readFileSync(path.join(__dirname + '/uploads/' + req.file.filename)), 
            contentType: 'image/png'
        } 
    } 
    imgModel.create(obj, (err, item) => { 
        if (err) { 
            console.log(err); 
        } 
        else { 
            // item.save(); 
            res.redirect('/showcase'); 
        } 
    }); 
}); 

//Listen On Server
app.listen(process.env.PORT ||3000,function (err) {
    if(err){
        console.log(err);
    }else {
        console.log("Server Started At Port 3000");
    } 
});