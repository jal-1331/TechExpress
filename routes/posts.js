const express = require('express');
const router = express.Router();
const Post = require('../models/Post');
const Comment=require('../models/Comment');



// Create a new post
router.post('/', async (req, res) => {
  const { title, content, imageUrl, category } = req.body;
  try {
    const newPost = new Post({ title, content, imageUrl, category });
    const savedPost = await newPost.save();
    res.status(201).json(savedPost);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});



// Fetch all posts
router.get('/', async (req, res) => {
  try {
    const posts = await Post.find().populate({
      path: 'comments',
      populate: {
        path: 'author',
        select: 'username' // Only select the username field of the author
      },
      select: 'content'
    });
    res.json(posts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});



// fetch posts by category
router.get('/category/:category',async(req,res)=>{
  const category=req.params.category;
  try{
    const post=await Post.find({ category }).populate({
      path:'comments',
      populate:{
        path:'author',
        select:'username'
      },
      select:'content'
    });
    res.json(post);

    
  }catch(error){
    console.error('Error fetching posts by category:', error); 
    res.status(500).json({massage:error.massage});
  }
});



// fetch posts by title
router.get('/title/:title', async (req, res) => {
  const title = req.params.title;
  try {
    const posts = await Post.find({ title }).populate({
      path: 'comments',
      populate: {
        path: 'author',
        select: 'username'
      },
      select: 'content'
    });
    console.log(posts);
    res.json(posts);
  } catch (error) {
    console.error('Error fetching posts by title:', error);
    res.status(500).json({ message: error.message });
  }
});





//fetch lattest posts (last 3 days)

router.get('/latest', async(req,res)=>{
  const threeDaysAgo=new Date();
  threeDaysAgo.setDate(threeDaysAgo.getDate()-3);
  try{
    const posts= await Post.find({ createdAt: {$gte : threeDaysAgo}}).populate({
      path: 'comments',
      populate: {
        path: 'author',
        select: 'username'
      },
      select: 'content'
    });
    res.json(posts);

  }catch(error){
    res.status(500).json({message:error.message});
  }

});




// Search for posts by title with autocomplete suggestions
router.get('/search', async (req, res) => {
  const { query } = req.query;
  if (!query) {
    return res.status(400).json({ message: 'Query parameter is required' });
  }

  // Trim and escape regex special characters
  const trimmedQuery = query.trim();
  const escapedQuery = trimmedQuery.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');

  try {
    const posts = await Post.find({ title: { $regex: escapedQuery, $options: 'i' } }).select('title');
     // Debug log
    res.json(posts);
  } catch (error) {
    console.error(`Error searching posts with query "${query}":`, error); // Debug log
    res.status(500).json({ message: error.message });
  }
});


// Delete a post by title
router.delete('/title/:title', async (req, res) => {
  const title = req.params.title;
  try {
    const post = await Post.findOneAndDelete({ title });
    if (post) {
      res.json({ message: 'Post deleted successfully' });
    } else {
      res.status(404).json({ message: 'Post not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});






// Delete all comments for a post by post title
router.delete('/title/:title/comments', async (req, res) => {
  const { title } = req.params;
  try {
    // Find the post by title
    const post = await Post.findOne({ title });
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    // Delete all comments associated with the post
    await Comment.deleteMany({ post: post._id });

    res.status(200).json({ message: 'All comments deleted successfully' });
  } catch (error) {
    console.error('Error deleting comments:', error);
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
