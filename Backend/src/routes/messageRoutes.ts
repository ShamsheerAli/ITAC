import express from 'express';
import Message from '../models/Message';
import User from '../models/User';
import nodemailer from 'nodemailer';
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

// @route   GET /api/messages/client/unread/:clientUserId
// @desc    Gets ALL unread messages sent by STAFF to a specific client
router.get('/client/unread/:clientUserId', async (req, res) => {
  try {
    const unreadMessages = await Message.find({ 
      clientUserId: req.params.clientUserId, 
      senderRole: 'staff', 
      isRead: false 
    });
    res.json(unreadMessages);
  } catch (err) {
    res.status(500).json({ message: "Error fetching unread messages" });
  }
});

// @route   PUT /api/messages/client/mark-read/:clientUserId
// @desc    Client marks all staff messages as read when opening Inbox
router.put('/client/mark-read/:clientUserId', async (req, res) => {
  try {
    await Message.updateMany(
      { clientUserId: req.params.clientUserId, senderRole: 'staff', isRead: false },
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

// @route   POST /api/messages/admin/broadcast
// @desc    Email all client users via BCC
router.post('/admin/broadcast', async (req, res) => {
    try {
        const { subject, message } = req.body;

        if (!subject || !message) {
            return res.status(400).json({ message: "Subject and message are required." });
        }

        // 1. Fetch all users who have the 'client' role
        const clients = await User.find({ role: 'client' });
        
        // Extract their emails into a flat array
        const clientEmails = clients.map(client => client.email).filter(Boolean);

        if (clientEmails.length === 0) {
            return res.status(404).json({ message: "No clients found to broadcast to." });
        }

        // 2. Configure Nodemailer transport
        const transporter = nodemailer.createTransport({
            service: 'gmail', 
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS // The app password you generated earlier!
            }
        });

        // 3. Send the Broadcast Email
        await transporter.sendMail({
            from: '"OSU ITAC" <noreply@energyhub.okstate.edu>',
            bcc: clientEmails, // 🚨 CRITICAL: Use BCC so clients don't see each other's emails
            subject: subject,
            text: message, // Fallback plain text
            html: `
                <div style="font-family: Arial, sans-serif; max-w: 600px; margin: 0 auto; color: #333;">
                    <h2 style="color: #FE5C00;">ITAC Portal Announcement</h2>
                    <p style="white-space: pre-wrap;">${message}</p>
                    <hr style="border: none; border-top: 1px solid #eaeaea; margin: 30px 0;" />
                    <p style="font-size: 12px; color: #888;">
                        This is an automated message from the OSU Industrial Training and Assessment Center. 
                        Please log in to your <a href="http://energyhub.okstate.edu/login" style="color: #FE5C00;">dashboard</a> for more details.
                    </p>
                </div>
            `
        });

        res.status(200).json({ message: "Broadcast sent successfully!" });

    } catch (error) {
        console.error("Broadcast error:", error);
        res.status(500).json({ message: "Failed to send broadcast email." });
    }
});

export default router;