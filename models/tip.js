var mongoose = require('mongoose');

var tipSchema = mongoose.Schema({
    amount: {
        type: Number,
        required: true
    },
    from: {
        type: String,
        required: true
    },
    message: String,
    user: {
        type: String,
        required: true
    },
    date: {
        type: String,
        required: true
    }
});

var Tip = mongoose.model('tip', tipSchema);

tipSchema.methods.findTotalTips = function(){
    Tip.find({}).then((tips, err) => {
        if(err) return err;
        var total = 0;
        for(var i = 0; i < tips.length; i++){
            total += tips[i].amount;
        }
    })
}

module.exports = Tip;