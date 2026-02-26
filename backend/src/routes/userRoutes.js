const express = require('express');
const router = express.Router();
const {
  getAllUsers,
  getUserById,
  searchUsers,
  getConversations,
} = require('../controllers/userController');
const { protect } = require('../middleware/auth');

// All routes are protected
router.use(protect);

router.get('/', getAllUsers);
router.get('/search', searchUsers);
router.get('/conversations', getConversations);
router.get('/:id', getUserById);

module.exports = router;
