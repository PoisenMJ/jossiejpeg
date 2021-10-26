var mongoose = require('mongoose');

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
        type: Number,
        default: 0
    },
    // COMMENTS
});

var Post = mongoose.model('post', postSchema);
module.exports = Post;