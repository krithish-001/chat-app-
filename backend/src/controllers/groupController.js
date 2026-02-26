const GroupChat = require('../models/GroupChat');
const Message = require('../models/Message');
const { uploadToCloudinary } = require('../config/cloudinary');
const fs = require('fs');

/**
 * @desc    Create a group chat
 * @route   POST /api/groups
 * @access  Private
 */
const createGroup = async (req, res) => {
  try {
    const { name, description, members } = req.body;
    const adminId = req.user.id;

    if (!members || members.length < 2) {
      return res.status(400).json({
        success: false,
        message: 'Group must have at least 2 members',
      });
    }

    const groupData = {
      name,
      description,
      admin: adminId,
      members: [...new Set([adminId, ...members])], // Ensure admin is included and no duplicates
    };

    // Handle group icon upload
    if (req.file) {
      const result = await uploadToCloudinary(req.file.path, 'chat-app/groups');
      groupData.groupIcon = result.secure_url;
      fs.unlinkSync(req.file.path);
    }

    const group = await GroupChat.create(groupData);
    await group.populate('admin members', 'name email profilePicture');

    res.status(201).json({
      success: true,
      data: group,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * @desc    Get all groups user is part of
 * @route   GET /api/groups
 * @access  Private
 */
const getUserGroups = async (req, res) => {
  try {
    const userId = req.user.id;

    const groups = await GroupChat.find({ members: userId })
      .populate('admin members', 'name email profilePicture isOnline')
      .populate('lastMessage')
      .sort({ lastMessageTime: -1 });

    res.status(200).json({
      success: true,
      count: groups.length,
      data: groups,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * @desc    Get group by ID
 * @route   GET /api/groups/:id
 * @access  Private
 */
const getGroupById = async (req, res) => {
  try {
    const group = await GroupChat.findById(req.params.id)
      .populate('admin members', 'name email profilePicture isOnline');

    if (!group) {
      return res.status(404).json({
        success: false,
        message: 'Group not found',
      });
    }

    // Check if user is a member
    if (!group.members.some((member) => member._id.toString() === req.user.id)) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to access this group',
      });
    }

    res.status(200).json({
      success: true,
      data: group,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * @desc    Get group messages
 * @route   GET /api/groups/:id/messages
 * @access  Private
 */
const getGroupMessages = async (req, res) => {
  try {
    const { id } = req.params;

    const group = await GroupChat.findById(id);
    if (!group) {
      return res.status(404).json({
        success: false,
        message: 'Group not found',
      });
    }

    // Check if user is a member
    if (!group.members.some((member) => member.toString() === req.user.id)) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to access this group',
      });
    }

    const messages = await Message.find({ groupChat: id })
      .populate('sender', 'name email profilePicture')
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
 * @desc    Add members to group
 * @route   PUT /api/groups/:id/members
 * @access  Private (Admin only)
 */
const addGroupMembers = async (req, res) => {
  try {
    const { id } = req.params;
    const { members } = req.body;

    const group = await GroupChat.findById(id);

    if (!group) {
      return res.status(404).json({
        success: false,
        message: 'Group not found',
      });
    }

    // Check if user is admin
    if (group.admin.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Only admin can add members',
      });
    }

    // Add new members (avoid duplicates)
    const newMembers = members.filter((m) => !group.members.includes(m));
    group.members.push(...newMembers);
    await group.save();

    await group.populate('admin members', 'name email profilePicture');

    res.status(200).json({
      success: true,
      data: group,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * @desc    Remove member from group
 * @route   DELETE /api/groups/:id/members/:memberId
 * @access  Private (Admin only)
 */
const removeGroupMember = async (req, res) => {
  try {
    const { id, memberId } = req.params;

    const group = await GroupChat.findById(id);

    if (!group) {
      return res.status(404).json({
        success: false,
        message: 'Group not found',
      });
    }

    // Check if user is admin
    if (group.admin.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Only admin can remove members',
      });
    }

    // Cannot remove admin
    if (memberId === group.admin.toString()) {
      return res.status(400).json({
        success: false,
        message: 'Cannot remove group admin',
      });
    }

    group.members = group.members.filter((m) => m.toString() !== memberId);
    await group.save();

    res.status(200).json({
      success: true,
      data: group,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * @desc    Leave group
 * @route   DELETE /api/groups/:id/leave
 * @access  Private
 */
const leaveGroup = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const group = await GroupChat.findById(id);

    if (!group) {
      return res.status(404).json({
        success: false,
        message: 'Group not found',
      });
    }

    // Admin cannot leave, must transfer ownership first
    if (group.admin.toString() === userId) {
      return res.status(400).json({
        success: false,
        message: 'Admin must transfer ownership before leaving',
      });
    }

    group.members = group.members.filter((m) => m.toString() !== userId);
    await group.save();

    res.status(200).json({
      success: true,
      message: 'Left group successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  createGroup,
  getUserGroups,
  getGroupById,
  getGroupMessages,
  addGroupMembers,
  removeGroupMember,
  leaveGroup,
};
