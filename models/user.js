//this models/user is to create a schema for user
//packages must be downloaded in the system
var mongoose = require('mongoose');
var bcrypt = require('bcrypt');

//create a user schema 
var UserSchema = new mongoose.Schema({
    //email, username, and password. The type of all models are string and they're required. For email and username, the trim is used to erase the unnecessary space. 
    email: {
        type: String, 
        unique: true,
        required: true,
        trim: true
    },
    username: {
        type: String,
        unique: true,
        required: true,
        trim: true
    },
    password: {
        type: String,
        required: true,
    }
});

//authenticate input against database
UserSchema.statics.authenticate = function (email, password, callback) {
    User.findOne({ email: email }).exec(function (err, user) {
        if (err) {
            return callback(err)
        } else if (!user) {
            var err = new Error('User not found.');
            err.status = 401;
            return callback(err);
        }
        bcrypt.compare(password, user.password, function (err, result) {
            if (result === true) {
                return callback(null, user);
            } else {
                return callback();
            }
        })
    });
}

//hashing the password before saving it to the database
UserSchema.pre('save', function (next) {
    var user = this;
    //hashing time algorithm takes, 10 is default value
    const saltRounds = 10;
    bcrypt.hash(user.password, saltRounds, function (err, hash) {
        if (err) {
            return next(err);
        }
        user.password = hash;
        next();
    })
});
//create the model inside User collection
var User = mongoose.model('userDetails', UserSchema);
//default function, defines the values of User
module.exports = User;