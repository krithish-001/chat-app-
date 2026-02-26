const User = require('../models/User');
const Message = require('../models/Message');

/**
 * @desc    Get all users except current user
 * @route   GET /api/users
 * @access  Private
 */
const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({ _id: { $ne: req.user.id } })
      .select('-password')
      .sort({ name: 1 });

    res.status(200).json({
      success: true,
      count: users.length,
      data: users,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * @desc    Get user by ID
 * @route   GET /api/users/:id
 * @access  Private
 */
const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * @desc    Search users by name or email
 * @route   GET /api/users/search?query=
 * @access  Private
 */
const searchUsers = async (req, res) => {
  try {
    const { query } = req.query;

    if (!query) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a search query',
      });
    }

    const users = await User.find({
      _id: { $ne: req.user.id },
      $or: [
        { name: { $regex: query, $options: 'i' } },
        { email: { $regex: query, $options: 'i' } },
      ],
    })
      .select('-password')
      .limit(10);

    res.status(200).json({
      success: true,
      count: users.length,
      data: users,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * @desc    Get user's recent conversations
 * @route   GET /api/users/conversations
 * @access  Private
 */
const getConversations = async (req, res) => {
  try {
    const userId = req.user.id;

    // Get all messages where user is sender or recipient
    const messages = await Message.find({
      $or: [{ sender: userId }, { recipient: userId }],
    })
      .populate('sender', 'name email profilePicture isOnline lastSeen')
      .populate('recipient', 'name email profilePicture isOnline lastSeen')
      .sort({ createdAt: -1 });

    // Get unique conversations
    const conversationsMap = new Map();

    messages.forEach((message) => {
      const otherUserId =
        message.sender._id.toString() === userId
          ? message.recipient._id.toString()
          : message.sender._id.toString();

      if (!conversationsMap.has(otherUserId)) {
        conversationsMap.set(otherUserId, {
          user:
            message.sender._id.toString() === userId
              ? message.recipient
              : message.sender,
          lastMessage: message,
          unreadCount: 0,
        });
      }

      // Count unread messages
      if (
        message.recipient._id.toString() === userId &&
        !message.isSeen
      ) {
        conversationsMap.get(otherUserId).unreadCount++;
      }
    });

    const conversations = Array.from(conversationsMap.values());

    res.status(200).json({
      success: true,
      count: conversations.length,
      data: conversations,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  getAllUsers,
  getUserById,
  searchUsers,
  getConversations,
};
