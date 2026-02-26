const express = require('express');
const router = express.Router();
const {
  createGroup,
  getUserGroups,
  getGroupById,
  getGroupMessages,
  addGroupMembers,
  removeGroupMember,
  leaveGroup,
} = require('../controllers/groupController');
const { protect } = require('../middleware/auth');
const upload = require('../middleware/upload');

// All routes are protected
router.use(protect);

router.post('/', upload.single('groupIcon'), createGroup);
router.get('/', getUserGroups);
router.get('/:id', getGroupById);
router.get('/:id/messages', getGroupMessages);
router.put('/:id/members', addGroupMembers);
router.delete('/:id/members/:memberId', removeGroupMember);
router.delete('/:id/leave', leaveGroup);

module.exports = router;
