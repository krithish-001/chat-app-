const Message = require('../models/Message');
const User = require('../models/User');
const { uploadToCloudinary } = require('../config/cloudinary');
const fs = require('fs');

/**
 * @desc    Send a message
 * @route   POST /api/messages
 * @access  Private
 */
const sendMessage = async (req, res) => {
  try {
    const { recipientId, content, messageType, groupChatId } = req.body;
    const senderId = req.user.id;

    // Validate recipient exists
    if (recipientId) {
      const recipient = await User.findById(recipientId);
      if (!recipient) {
        return res.status(404).json({
          success: false,
          message: 'Recipient not found',
        });
      }
    }

    const messageData = {
      sender: senderId,
      recipient: recipientId,
      content,
      messageType: messageType || 'text',
      groupChat: groupChatId || null,
    };

    // Handle file upload
    if (req.file) {
      const result = await uploadToCloudinary(
        req.file.path,
        messageType === 'image' ? 'chat-app/images' : 'chat-app/files'
      );
      messageData.fileUrl = result.secure_url;
      messageData.fileName = req.file.originalname;
      messageData.fileSize = req.file.size;

      // Delete temporary file
      fs.unlinkSync(req.file.path);
    }

    const message = await Message.create(messageData);

    // Populate sender and recipient details
    await message.populate('sender', 'name email profilePicture');
    if (recipientId) {
      await message.populate('recipient', 'name email profilePicture isOnline');
    }

    res.status(201).json({
      success: true,
      data: message,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * @desc    Get messages between two users
 * @route   GET /api/messages/:userId
 * @access  Private
 */
const getMessages = async (req, res) => {
  try {
    const { userId } = req.params;
    const currentUserId = req.user.id;

    const messages = await Message.find({
      $or: [
        { sender: currentUserId, recipient: userId },
        { sender: userId, recipient: currentUserId },
      ],
    })
      .populate('sender', 'name email profilePicture')
      .populate('recipient', 'name email profilePicture')
      .sort({ createdAt: 1 });

    res.status(200).json({
      success: true,
      count: messages.length,
      data: messages,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * @desc    Mark messages as seen
 * @route   PUT /api/messages/seen/:userId
 * @access  Private
 */
const markMessagesSeen = async (req, res) => {
  try {
    const { userId } = req.params;
    const currentUserId = req.user.id;

    await Message.updateMany(
      {
        sender: userId,
        recipient: currentUserId,
        isSeen: false,
      },
      {
        isSeen: true,
        seenAt: Date.now(),
      }
    );

    res.status(200).json({
      success: true,
      message: 'Messages marked as seen',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * @desc    Mark messages as delivered
 * @route   PUT /api/messages/delivered/:messageId
 * @access  Private
 */
const markMessageDelivered = async (req, res) => {
  try {
    const { messageId } = req.params;

    const message = await Message.findByIdAndUpdate(
      messageId,
      {
        isDelivered: true,
        deliveredAt: Date.now(),
      },
      { new: true }
    );

    res.status(200).json({
      success: true,
      data: message,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * @desc    Delete a message
 * @route   DELETE /api/messages/:messageId
 * @access  Private
 */
const deleteMessage = async (req, res) => {
  try {
    const { messageId } = req.params;
    const userId = req.user.id;

    const message = await Message.findById(messageId);

    if (!message) {
      return res.status(404).json({
        success: false,
        message: 'Message not found',
      });
    }

    // Only sender can delete
    if (message.sender.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this message',
      });
    }

    await message.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Message deleted successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  sendMessage,
  getMessages,
  markMessagesSeen,
  markMessageDelivered,
  deleteMessage,
};
