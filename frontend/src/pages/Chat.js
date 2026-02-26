import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import { useTheme } from '../context/ThemeContext';
import { userAPI, messageAPI } from '../services/api';
import { FiSun, FiMoon, FiLogOut, FiSearch, FiSettings } from 'react-icons/fi';
import toast from 'react-hot-toast';

const Chat = () => {
  const { user, logout } = useAuth();
  const { socket, onlineUsers } = useSocket();
  const { isDark, toggleTheme } = useTheme();
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [typingUsers, setTypingUsers] = useState(new Set());

  // Load users on mount
  useEffect(() => {
    loadUsers();
  }, []);

  // Load messages when user is selected
  useEffect(() => {
    if (selectedUser) {
      loadMessages(selectedUser._id);
      markMessagesAsSeen(selectedUser._id);
    }
  }, [selectedUser]);

  // Socket listeners
  useEffect(() => {
    if (!socket) return;

    socket.on('receive-message', (message) => {
      if (
        selectedUser &&
        (message.sender._id === selectedUser._id || message.recipient._id === selectedUser._id)
      ) {
        setMessages((prev) => [...prev, message]);
        markMessagesAsSeen(selectedUser._id);
      } else {
        toast.success(`New message from ${message.sender.name}`);
      }
    });

    socket.on('user-typing', ({ userId, isTyping }) => {
      if (selectedUser && userId === selectedUser._id) {
        setTypingUsers((prev) => {
          const updated = new Set(prev);
          if (isTyping) {
            updated.add(userId);
          } else {
            updated.delete(userId);
          }
          return updated;
        });
      }
    });

    return () => {
      socket.off('receive-message');
      socket.off('user-typing');
    };
  }, [socket, selectedUser]);

  const loadUsers = async () => {
    try {
      const response = await userAPI.getAllUsers();
      setUsers(response.data.data);
    } catch (error) {
      toast.error('Failed to load users');
    }
  };

  const loadMessages = async (userId) => {
    try {
      const response = await messageAPI.getMessages(userId);
      setMessages(response.data.data);
    } catch (error) {
      toast.error('Failed to load messages');
    }
  };

  const markMessagesAsSeen = async (userId) => {
    try {
      await messageAPI.markSeen(userId);
    } catch (error) {
      console.error('Failed to mark messages as seen');
    }
  };

  const sendMessage = (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedUser || !socket) return;

    socket.emit('send-message', {
      senderId: user._id,
      recipientId: selectedUser._id,
      content: newMessage,
      messageType: 'text',
    });

    setNewMessage('');
    setIsTyping(false);
  };

  const handleTyping = (e) => {
    setNewMessage(e.target.value);
    
    if (!socket || !selectedUser) return;
    
    if (e.target.value.length > 0 && !isTyping) {
      setIsTyping(true);
      socket.emit('typing', {
        recipientId: selectedUser._id,
        isTyping: true,
        senderId: user._id,
      });
    } else if (e.target.value.length === 0 && isTyping) {
      setIsTyping(false);
      socket.emit('typing', {
        recipientId: selectedUser._id,
        isTyping: false,
        senderId: user._id,
      });
    }
  };

  const filteredUsers = users.filter((u) =>
    u.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-dark-900">
      {/* Sidebar */}
      <div className="w-80 bg-white dark:bg-dark-800 border-r border-gray-200 dark:border-dark-700 flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-gray-200 dark:border-dark-700">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <img
                src={user?.profilePicture || 'https://via.placeholder.com/40'}
                alt="Profile"
                className="w-10 h-10 rounded-full"
              />
              <div>
                <h2 className="font-semibold text-gray-900 dark:text-white">{user?.name}</h2>
                <p className="text-xs text-gray-500 dark:text-gray-400">Online</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={toggleTheme}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-dark-700 transition-colors"
              >
                {isDark ? <FiSun className="text-gray-400" /> : <FiMoon className="text-gray-600" />}
              </button>
              <button
                onClick={logout}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-dark-700 transition-colors"
              >
                <FiLogOut className="text-gray-600 dark:text-gray-400" />
              </button>
            </div>
          </div>

          {/* Search */}
          <div className="relative">
            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search users..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-100 dark:bg-dark-700 rounded-lg text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
        </div>

        {/* Users List */}
        <div className="flex-1 overflow-y-auto">
          {filteredUsers.map((u) => (
            <div
              key={u._id}
              onClick={() => setSelectedUser(u)}
              className={`p-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-dark-700 transition-colors ${
                selectedUser?._id === u._id ? 'bg-primary-50 dark:bg-dark-700' : ''
              }`}
            >
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <img
                    src={u.profilePicture || 'https://via.placeholder.com/40'}
                    alt={u.name}
                    className="w-12 h-12 rounded-full"
                  />
                  {onlineUsers.has(u._id) && (
                    <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white dark:border-dark-800"></div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-900 dark:text-white truncate">{u.name}</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                    {onlineUsers.has(u._id) ? 'Online' : 'Offline'}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col">
        {selectedUser ? (
          <>
            {/* Chat Header */}
            <div className="bg-white dark:bg-dark-800 p-4 border-b border-gray-200 dark:border-dark-700">
              <div className="flex items-center space-x-3">
                <img
                  src={selectedUser.profilePicture || 'https://via.placeholder.com/40'}
                  alt={selectedUser.name}
                  className="w-10 h-10 rounded-full"
                />
                <div>
                  <h2 className="font-semibold text-gray-900 dark:text-white">{selectedUser.name}</h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {typingUsers.has(selectedUser._id)
                      ? 'typing...'
                      : onlineUsers.has(selectedUser._id)
                      ? 'Online'
                      : 'Offline'}
                  </p>
                </div>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 dark:bg-dark-900">
              {messages.map((msg) => (
                <div
                  key={msg._id}
                  className={`flex ${msg.sender._id === user._id ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl ${
                      msg.sender._id === user._id
                        ? 'bg-primary-500 text-white'
                        : 'bg-white dark:bg-dark-800 text-gray-900 dark:text-white'
                    }`}
                  >
                    <p>{msg.content}</p>
                    <p className="text-xs mt-1 opacity-70">
                      {new Date(msg.createdAt).toLocaleTimeString('en-US', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Message Input */}
            <div className="bg-white dark:bg-dark-800 p-4 border-t border-gray-200 dark:border-dark-700">
              <form onSubmit={sendMessage} className="flex items-center space-x-2">
                <input
                  type="text"
                  value={newMessage}
                  onChange={handleTyping}
                  placeholder="Type a message..."
                  className="flex-1 px-4 py-2 bg-gray-100 dark:bg-dark-700 rounded-full text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
                <button
                  type="submit"
                  className="px-6 py-2 bg-primary-500 text-white rounded-full font-semibold hover:bg-primary-600 transition-colors"
                >
                  Send
                </button>
              </form>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center bg-gray-50 dark:bg-dark-900">
            <div className="text-center">
              <div className="text-6xl mb-4">💬</div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                Welcome to ChatApp
              </h3>
              <p className="text-gray-500 dark:text-gray-400">
                Select a user to start chatting
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Chat;
