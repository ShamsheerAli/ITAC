import express from 'express';
import Message from '../models/Message';

const router = express.Router();

// GET all messages for a specific client
router.get('/:clientUserId', async (req, res) => {
  try {
    const messages = await Message.find({ clientUserId: req.params.clientUserId })
                                  .sort({ createdAt: 1 }); // Oldest first
    res.json(messages);
  } catch (err) {
    res.status(500).json({ message: "Error fetching messages" });
  }
});

// POST a new message
router.post('/:clientUserId', async (req, res) => {
  try {
    const { senderRole, text } = req.body;
    
    const newMessage = new Message({
      clientUserId: req.params.clientUserId,
      senderRole,
      text
    });

    await newMessage.save();
    res.status(201).json(newMessage);
  } catch (err) {
    res.status(500).json({ message: "Error sending message" });
  }
});


// @route   GET /api/messages/admin/unread
// @desc    Gets ALL unread messages sent by clients
router.get('/admin/unread', async (req, res) => {
  try {
    const unreadMessages = await Message.find({ senderRole: 'client', isRead: false });
    res.json(unreadMessages);
  } catch (err) {
    res.status(500).json({ message: "Error fetching unread messages" });
  }
});

// @route   PUT /api/messages/admin/mark-read/:clientUserId
// @desc    Marks all unread messages from a specific client as read
router.put('/admin/mark-read/:clientUserId', async (req, res) => {
  try {
    await Message.updateMany(
      { clientUserId: req.params.clientUserId, senderRole: 'client', isRead: false },
      { $set: { isRead: true } }
    );
    res.json({ message: "Messages marked as read" });
  } catch (err) {
    res.status(500).json({ message: "Error updating messages" });
  }
});

export default router;