const mongoose = require('mongoose');
const bcryptjs = require('bcryptjs');
const Schema = mongoose.Schema;

const UserSchema = new Schema({
    username: { type: String },
    password: { type: String },
    email: { type: String },
    name: { type: String }
})

const User = module.exports = mongoose.model('users', UserSchema);

module.exports.createUser = function(newUser, callback){
    bcryptjs.genSalt(10, (err, salt) => {
        bcryptjs.hash(newUser.password, salt, (err, hash) => {
            newUser.password = hash;
            newUser.save(callback)
        })
    })
}

module.exports.getUserByUsername = function(username, callback){
    User.findOne({ username }, callback)
}

module.exports.comparePassword = function(candidatePassword, hash, callback){
    bcryptjs.compare(candidatePassword, hash, (err, isMatch) => {
        if(err) throw err;
        callback(null, isMatch);
    })
}

module.exports.getUserById = function(id, callback){
    User.findById(id, callback);
}