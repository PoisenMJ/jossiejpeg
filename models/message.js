const mongoose = require('mongoose');

var messageSchema = mongoose.Schema({
    content: {
        type: String
    },
    imageContent: {
        type: String
    },
    from: {
        required: true,
        type: String
    },
    to: {
        required: true,
        type: String
    },
    date: {     
        required: true,
        type: String
    },
    image: {
        required: true,
        type: String
    },
    read: {
        type: Boolean,
        default: false
    }
});

const Message = mongoose.model('message', messageSchema);
module.exports = Message;