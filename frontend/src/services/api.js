import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

// Users API
export const userAPI = {
  getAllUsers: () => axios.get(`${API_URL}/api/users`),
  getUserById: (id) => axios.get(`${API_URL}/api/users/${id}`),
  searchUsers: (query) => axios.get(`${API_URL}/api/users/search?query=${query}`),
  getConversations: () => axios.get(`${API_URL}/api/users/conversations`),
};

// Messages API
export const messageAPI = {
  sendMessage: (data) => axios.post(`${API_URL}/api/messages`, data),
  getMessages: (userId) => axios.get(`${API_URL}/api/messages/${userId}`),
  markSeen: (userId) => axios.put(`${API_URL}/api/messages/seen/${userId}`),
  deleteMessage: (messageId) => axios.delete(`${API_URL}/api/messages/${messageId}`),
};

// Groups API
export const groupAPI = {
  createGroup: (data) => axios.post(`${API_URL}/api/groups`, data),
  getUserGroups: () => axios.get(`${API_URL}/api/groups`),
  getGroupById: (id) => axios.get(`${API_URL}/api/groups/${id}`),
  getGroupMessages: (id) => axios.get(`${API_URL}/api/groups/${id}/messages`),
  addMembers: (id, members) => axios.put(`${API_URL}/api/groups/${id}/members`, { members }),
  removeMember: (groupId, memberId) => axios.delete(`${API_URL}/api/groups/${groupId}/members/${memberId}`),
  leaveGroup: (id) => axios.delete(`${API_URL}/api/groups/${id}/leave`),
};

export default {
  userAPI,
  messageAPI,
  groupAPI,
};
