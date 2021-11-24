const mongoose = require('mongoose');
const User = require('./user');

const subscriptionSchema = new mongoose.Schema({
    price: Number,
    customerID: {
        type: String,
        required: true,
        unique: true
    },
    subscriptionID: {
        type: String,
        required: true,
        unique: true
    },
    user: {
        type: String,
        required: true,
        unique: true
    },
    expires_in: {
        type: Number,
        required: true
    },
    dates_subscribed: {
        type: [[String,String]],
        required: true
    },
    active: {
        type: Boolean,
        default: false
    }
});

subscriptionSchema.methods.getUser = function(username){
    User.findOne({ username: username }, (err, user) => {
        if(err) return false;
        if(!user) return false;
        return true;
    })
}

subscriptionSchema.methods.updateUserActive = function(customerID){
    User.findOneAndUpdate({ customerID: customerID }, { $inc: { months_paid: 1 }}).then(() => {
        return true;
    });
};

subscriptionSchema.methods.updateUserUnactive = function(customerID){
    User.findOneAndUpdate({ customerID: customerID }, { $set: { active: false }}).then(() => {
        return true;
    })
}

const Sub = mongoose.model('subscription', subscriptionSchema);
module.exports = Sub;