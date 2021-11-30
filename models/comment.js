var mongoose = require('mongoose');
const Post = require('./post');

var commentSchema = mongoose.Schema({
    content: {
        type: String,
        required: true
    },
    date: {
        type: String,
        required: true
    },
    user: {
        type: String,
        required: true
    },
    image: {
        type: String,
        required: true
    },
    postID: {
        type: String,
        required: true
    }
});

var Comment = mongoose.model('comment', commentSchema);
module.exports = {Comment, commentSchema};