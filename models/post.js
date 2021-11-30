var mongoose = require('mongoose');
var {commentSchema} = require('./comment');

var postSchema = new mongoose.Schema({
    datePosted: {
        type: String
    },
    description: {
        type: String,
        required: true
    },
    content: {
        type: [String],
        required: true
    },
    likes: {
        type: [String],
        default: []
    },
    comments: {
        type: [commentSchema],
        default: []
    },
    restrictedComments: {
        type: Boolean,
        default: false
    }
});

var Post = mongoose.model('post', postSchema);
module.exports = Post;