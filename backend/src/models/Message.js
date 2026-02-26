const mongoose = require('mongoose');

/**
 * Message Schema
 */
const messageSchema = new mongoose.Schema(
  {
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: function() {
        return !this.groupChat; // Required if not a group chat
      },
    },
    groupChat: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'GroupChat',
      default: null,
    },
    content: {
      type: String,
      trim: true,
    },
    messageType: {
      type: String,
      enum: ['text', 'image', 'file', 'emoji'],
      default: 'text',
    },
    fileUrl: {
      type: String,
      default: null,
    },
    fileName: {
      type: String,
      default: null,
    },
    fileSize: {
      type: Number,
      default: null,
    },
    isDelivered: {
      type: Boolean,
      default: false,
    },
    isSeen: {
      type: Boolean,
      default: false,
    },
    seenAt: {
      type: Date,
      default: null,
    },
    deliveredAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true, // Adds createdAt and updatedAt
  }
);

/**
 * Index for faster queries
 */
messageSchema.index({ sender: 1, recipient: 1, createdAt: -1 });
messageSchema.index({ groupChat: 1, createdAt: -1 });

module.exports = mongoose.model('Message', messageSchema);
