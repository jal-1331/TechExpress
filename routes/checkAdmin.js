// routes/checkAdmin.js

const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth'); // Import authentication middleware
const User = require('../models/User');

// Route to check if the user making the request is an admin
router.get('/', authMiddleware.verifyToken, async (req, res) => {
  try {
    // Get the user ID from the request object (assuming it's stored in req.user)
    const userId = req.user.id;

    // Find the user in the database
    const user = await User.findById(userId);

    // Check if the user exists and is an admin
    if (user && user.isAdmin) {
      // User is an admin
      res.json({ isAdmin: true, userId: user._id });
    } else {
      // User is not an admin
      res.json({ isAdmin: false, userId: user._id });
    }
  } catch (error) {
    // Error handling
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

module.exports = router;
