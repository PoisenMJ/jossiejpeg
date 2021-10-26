const mongoose = require('mongoose');
const User = require('./user');

const subscriptionSchema = new mongoose.Schema({
    customerID: {
        type: String,
        required: true
    },
    subscriptionID: {
        type: String,
        required: true
    },
    user: {
        type: String,
        required: true,
        unique: true
    },
    expires_in: {
        type: Number,
        required: true
    }
});

subscriptionSchema.methods.getUser = function(username){
    User.findOne({ username: username }, (err, user) => {
        if(err) return false;
        if(!user) return false;
        return true;
    })
}

subscriptionSchema.methods.updateUserActive = function(username){
    User.findOneAndUpdate({ username: username }, { subscribed: true }).then(() => {
        return true;
    });
}

const Sub = mongoose.model('subscription', subscriptionSchema);
module.exports = Sub;