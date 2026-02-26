const express = require('express');
const router = express.Router();
const {
  sendMessage,
  getMessages,
  markMessagesSeen,
  markMessageDelivered,
  deleteMessage,
} = require('../controllers/messageController');
const { protect } = require('../middleware/auth');
const upload = require('../middleware/upload');

// All routes are protected
router.use(protect);

router.post('/', upload.single('file'), sendMessage);
router.get('/:userId', getMessages);
router.put('/seen/:userId', markMessagesSeen);
router.put('/delivered/:messageId', markMessageDelivered);
router.delete('/:messageId', deleteMessage);

module.exports = router;
