const mongoose = require('mongoose');
const crypto = require('crypto');
const uniqueKeyGen = require('mongoose-generate-unique-key');

const userSchema = new mongoose.Schema({
    email: {
        type: String,
    },
    password: String,
    firstName: String,
    lastName: String,
    role: {
        type: String,
        default: "user"
    },
    username: String,
    subscribed: {
        type: Boolean,
        default: false
    },
    image: {
        type: String,
        default: 'default.jpg',
        required: true
    },
    customerID: {
        type: String,
        index: { unique: true }
    }
});

userSchema.methods.encryptPassword = function(password){
    return crypto.createHash('md5').update(password).digest('hex');
}
userSchema.methods.checkPassword = function(password){
    return this.encryptPassword(password) === this.password;
}
userSchema.pre('save', function(next){
    var user = this;
    
    // hash user password
    // if(!user.isModified('password')) return next();
    var hashedPassword = crypto.createHash('md5').update(user.password).digest('hex');
    console.log(hashedPassword);
    user.password = hashedPassword;
    return next();
});
userSchema.plugin(uniqueKeyGen('username', () => String(Math.floor(Math.random() * 100000000)))) 

const User = mongoose.model('user', userSchema);

module.exports = User;