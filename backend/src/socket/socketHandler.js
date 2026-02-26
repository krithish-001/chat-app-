const User = require('../models/User');
const Message = require('../models/Message');
const GroupChat = require('../models/GroupChat');

/**
 * Socket.IO connection handler
 */
const socketHandler = (io) => {
  // Store active users
  const activeUsers = new Map();

  io.on('connection', (socket) => {
    console.log('🔌 New client connected:', socket.id);

    /**
     * User joins the chat
     */
    socket.on('user-connected', async (userId) => {
      try {
        // Store user's socket ID
        activeUsers.set(userId, socket.id);

        // Update user status in database
        await User.findByIdAndUpdate(userId, {
          isOnline: true,
          socketId: socket.id,
        });

        // Notify all users about online status
        io.emit('user-status-change', {
          userId,
          isOnline: true,
        });

        console.log(`✅ User ${userId} connected`);
      } catch (error) {
        console.error('Error in user-connected:', error);
      }
    });

    /**
     * Send private message
     */
    socket.on('send-message', async (data) => {
      try {
        const { senderId, recipientId, content, messageType, fileUrl, fileName, fileSize } = data;

        // Create message in database
        const message = await Message.create({
          sender: senderId,
          recipient: recipientId,
          content,
          messageType: messageType || 'text',
          fileUrl,
          fileName,
          fileSize,
          isDelivered: true,
          deliveredAt: Date.now(),
        });

        await message.populate('sender', 'name email profilePicture');
        await message.populate('recipient', 'name email profilePicture');

        // Send to recipient if online
        const recipientSocketId = activeUsers.get(recipientId);
        if (recipientSocketId) {
          io.to(recipientSocketId).emit('receive-message', message);
        }

        // Send confirmation to sender
        socket.emit('message-sent', message);

        console.log(`📨 Message sent from ${senderId} to ${recipientId}`);
      } catch (error) {
        console.error('Error in send-message:', error);
        socket.emit('message-error', { error: error.message });
      }
    });

    /**
     * Send group message
     */
    socket.on('send-group-message', async (data) => {
      try {
        const { senderId, groupId, content, messageType, fileUrl, fileName, fileSize } = data;

        // Create message in database
        const message = await Message.create({
          sender: senderId,
          groupChat: groupId,
          content,
          messageType: messageType || 'text',
          fileUrl,
          fileName,
          fileSize,
        });

        await message.populate('sender', 'name email profilePicture');

        // Update group's last message
        await GroupChat.findByIdAndUpdate(groupId, {
          lastMessage: message._id,
          lastMessageTime: Date.now(),
        });

        // Get group members
        const group = await GroupChat.findById(groupId);

        // Send to all group members
        group.members.forEach((memberId) => {
          const memberSocketId = activeUsers.get(memberId.toString());
          if (memberSocketId) {
            io.to(memberSocketId).emit('receive-group-message', {
              groupId,
              message,
            });
          }
        });

        console.log(`📨 Group message sent to group ${groupId}`);
      } catch (error) {
        console.error('Error in send-group-message:', error);
        socket.emit('message-error', { error: error.message });
      }
    });

    /**
     * Typing indicator
     */
    socket.on('typing', (data) => {
      const { recipientId, isTyping, senderId } = data;
      const recipientSocketId = activeUsers.get(recipientId);
      
      if (recipientSocketId) {
        io.to(recipientSocketId).emit('user-typing', {
          userId: senderId,
          isTyping,
        });
      }
    });

    /**
     * Group typing indicator
     */
    socket.on('group-typing', async (data) => {
      const { groupId, isTyping, senderId } = data;

      try {
        const group = await GroupChat.findById(groupId);
        
        // Notify all group members except sender
        group.members.forEach((memberId) => {
          if (memberId.toString() !== senderId) {
            const memberSocketId = activeUsers.get(memberId.toString());
            if (memberSocketId) {
              io.to(memberSocketId).emit('group-user-typing', {
                groupId,
                userId: senderId,
                isTyping,
              });
            }
          }
        });
      } catch (error) {
        console.error('Error in group-typing:', error);
      }
    });

    /**
     * Mark message as seen
     */
    socket.on('message-seen', async (data) => {
      try {
        const { messageId, userId } = data;

        const message = await Message.findByIdAndUpdate(
          messageId,
          {
            isSeen: true,
            seenAt: Date.now(),
          },
          { new: true }
        );

        // Notify sender
        const senderSocketId = activeUsers.get(message.sender.toString());
        if (senderSocketId) {
          io.to(senderSocketId).emit('message-seen-update', {
            messageId,
            seenBy: userId,
            seenAt: message.seenAt,
          });
        }
      } catch (error) {
        console.error('Error in message-seen:', error);
      }
    });

    /**
     * Video/Voice call signaling
     */
    socket.on('call-user', (data) => {
      const { recipientId, signalData, from, callType } = data;
      const recipientSocketId = activeUsers.get(recipientId);

      if (recipientSocketId) {
        io.to(recipientSocketId).emit('incoming-call', {
          signal: signalData,
          from,
          callType,
        });
      }
    });

    socket.on('answer-call', (data) => {
      const { to, signalData } = data;
      const recipientSocketId = activeUsers.get(to);

      if (recipientSocketId) {
        io.to(recipientSocketId).emit('call-accepted', {
          signal: signalData,
        });
      }
    });

    socket.on('end-call', (data) => {
      const { recipientId } = data;
      const recipientSocketId = activeUsers.get(recipientId);

      if (recipientSocketId) {
        io.to(recipientSocketId).emit('call-ended');
      }
    });

    /**
     * User disconnects
     */
    socket.on('disconnect', async () => {
      try {
        // Find user by socket ID
        let disconnectedUserId;
        for (const [userId, socketId] of activeUsers.entries()) {
          if (socketId === socket.id) {
            disconnectedUserId = userId;
            break;
          }
        }

        if (disconnectedUserId) {
          // Remove from active users
          activeUsers.delete(disconnectedUserId);

          // Update user status in database
          await User.findByIdAndUpdate(disconnectedUserId, {
            isOnline: false,
            lastSeen: Date.now(),
            socketId: null,
          });

          // Notify all users about offline status
          io.emit('user-status-change', {
            userId: disconnectedUserId,
            isOnline: false,
            lastSeen: Date.now(),
          });

          console.log(`❌ User ${disconnectedUserId} disconnected`);
        }
      } catch (error) {
        console.error('Error in disconnect:', error);
      }
    });
  });
};

module.exports = socketHandler;
