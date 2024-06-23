const mongoose = require('mongoose');

const CommentSchema = new mongoose.Schema({
  content: {
    type: String,
    required: true
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // Assuming you have a User model for authentication
    required: true
  },
  post: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Post', // Assuming you have a Post model for posts
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const Comment = mongoose.model('Comment', CommentSchema);

module.exports = Comment;
