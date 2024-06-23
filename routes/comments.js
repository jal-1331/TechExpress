const express = require('express');
const router = express.Router();
const Comment = require('../models/Comment');
const authMiddleware = require('../middleware/auth');
const Post = require('../models/Post');
const User = require('../models/User');

// Create a comment
router.post('/', authMiddleware.verifyToken, async (req, res) => {
  try {
    const { postId, content } = req.body; // Change articleId to postId
    const userId = req.user.id;
    const comment = new Comment({ post: postId, author: userId, content }); // Change articleId to postId
    await comment.save();
    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    post.comments.push(comment._id);
    await post.save();
    
    res.status(201).json(comment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get all comments for a post
router.get('/:postId', async (req, res) => { 
  try {
    const { postId } = req.params; 
    const comments = await Comment.find({ post: postId }).populate('author', 'username'); 
    res.json(comments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update a comment
// router.put('/:id', authMiddleware.verifyToken, async (req, res) => {
//   try {
//     const { id } = req.params;
//     const { content } = req.body;
//     const updatedComment = await Comment.findByIdAndUpdate(id, { content }, { new: true });
//     if (!updatedComment) {
//       return res.status(404).json({ message: 'Comment not found' });
//     }
//     res.json(updatedComment);
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// });

// Delete a comment
router.delete('/:id', authMiddleware.verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    const deletedComment = await Comment.findByIdAndDelete(id);
    if (!deletedComment) {
      return res.status(404).json({ message: 'Comment not found' });
    }
    res.json({ message: 'Comment deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});
router.delete('/user/:username', async (req, res) => {
  const username = req.params.username;
  try {
    // Find the user by username
    const user = await User.findOne({ username });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Delete comments by the user ID
    await Comment.deleteMany({ author: user._id });

    res.status(200).json({ message: 'All comments by the user have been deleted' });
  } catch (error) {
    console.error('Error deleting comments by user:', error);
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
