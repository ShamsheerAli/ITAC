import express from 'express';
import Message from '../models/Message';
import ClientProfile from '../models/ClientProfile'; // Added this to fetch company names

const router = express.Router();

// =========================================================================
// 1. SPECIFIC ROUTES (MUST BE AT THE TOP)
// =========================================================================

// @route   GET /api/messages/admin/unread
// @desc    Gets ALL unread messages sent by clients (For the Sidebar Red Dot)
router.get('/admin/unread', async (req, res) => {
  try {
    const unreadMessages = await Message.find({ senderRole: 'client', isRead: false });
    res.json(unreadMessages);
  } catch (err) {
    res.status(500).json({ message: "Error fetching unread messages" });
  }
});

// @route   GET /api/messages/admin/conversations
// @desc    Get all active conversations for the inbox sidebar list
router.get('/admin/conversations', async (req, res) => {
  try {
    // 1. Find all unique clients who have sent or received a message
    const distinctClientIds = await Message.distinct('clientUserId');

    // 2. Fetch their profiles so we can show their Company Names in the UI
    const profiles = await ClientProfile.find({ user: { $in: distinctClientIds } }).populate('user', 'name email');

    // 3. For each client, attach their unread count and latest message
    const conversations = await Promise.all(profiles.map(async (profile) => {
        const unreadCount = await Message.countDocuments({ 
            clientUserId: profile.user, 
            senderRole: 'client', 
            isRead: false 
        });
        const lastMessage = await Message.findOne({ clientUserId: profile.user }).sort({ createdAt: -1 });

        return {
            profile,
            unreadCount,
            lastMessage
        };
    }));

    // 4. Sort so the people who messaged most recently are at the top
    conversations.sort((a, b) => {
        const dateA = a.lastMessage ? new Date(a.lastMessage.createdAt).getTime() : 0;
        const dateB = b.lastMessage ? new Date(b.lastMessage.createdAt).getTime() : 0;
        return dateB - dateA;
    });

    res.json(conversations);
  } catch (err) {
    res.status(500).json({ message: "Error fetching conversations" });
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

// =========================================================================
// 2. DYNAMIC ROUTES (MUST BE AT THE BOTTOM)
// =========================================================================

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

export default router;