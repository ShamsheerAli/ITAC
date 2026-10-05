"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const Message_1 = __importDefault(require("../models/Message"));
const ClientProfile_1 = __importDefault(require("../models/ClientProfile")); // Added this to fetch company names
const router = express_1.default.Router();
// =========================================================================
// 1. SPECIFIC ROUTES (MUST BE AT THE TOP)
// =========================================================================
// @route   GET /api/messages/admin/unread
// @desc    Gets ALL unread messages sent by clients (For the Sidebar Red Dot)
router.get('/admin/unread', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const unreadMessages = yield Message_1.default.find({ senderRole: 'client', isRead: false });
        res.json(unreadMessages);
    }
    catch (err) {
        res.status(500).json({ message: "Error fetching unread messages" });
    }
}));
// @route   GET /api/messages/admin/conversations
// @desc    Get all active conversations for the inbox sidebar list
router.get('/admin/conversations', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // 1. Find all unique clients who have sent or received a message
        const distinctClientIds = yield Message_1.default.distinct('clientUserId');
        // 2. Fetch their profiles so we can show their Company Names in the UI
        const profiles = yield ClientProfile_1.default.find({ user: { $in: distinctClientIds } }).populate('user', 'name email');
        // 3. For each client, attach their unread count and latest message
        const conversations = yield Promise.all(profiles.map((profile) => __awaiter(void 0, void 0, void 0, function* () {
            const unreadCount = yield Message_1.default.countDocuments({
                clientUserId: profile.user,
                senderRole: 'client',
                isRead: false
            });
            const lastMessage = yield Message_1.default.findOne({ clientUserId: profile.user }).sort({ createdAt: -1 });
            return {
                profile,
                unreadCount,
                lastMessage
            };
        })));
        // 4. Sort so the people who messaged most recently are at the top
        conversations.sort((a, b) => {
            const dateA = a.lastMessage ? new Date(a.lastMessage.createdAt).getTime() : 0;
            const dateB = b.lastMessage ? new Date(b.lastMessage.createdAt).getTime() : 0;
            return dateB - dateA;
        });
        res.json(conversations);
    }
    catch (err) {
        res.status(500).json({ message: "Error fetching conversations" });
    }
}));
// @route   PUT /api/messages/admin/mark-read/:clientUserId
// @desc    Marks all unread messages from a specific client as read
router.put('/admin/mark-read/:clientUserId', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield Message_1.default.updateMany({ clientUserId: req.params.clientUserId, senderRole: 'client', isRead: false }, { $set: { isRead: true } });
        res.json({ message: "Messages marked as read" });
    }
    catch (err) {
        res.status(500).json({ message: "Error updating messages" });
    }
}));
// @route   GET /api/messages/client/unread/:clientUserId
// @desc    Gets ALL unread messages sent by STAFF to a specific client
router.get('/client/unread/:clientUserId', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const unreadMessages = yield Message_1.default.find({
            clientUserId: req.params.clientUserId,
            senderRole: 'staff',
            isRead: false
        });
        res.json(unreadMessages);
    }
    catch (err) {
        res.status(500).json({ message: "Error fetching unread messages" });
    }
}));
// @route   PUT /api/messages/client/mark-read/:clientUserId
// @desc    Client marks all staff messages as read when opening Inbox
router.put('/client/mark-read/:clientUserId', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield Message_1.default.updateMany({ clientUserId: req.params.clientUserId, senderRole: 'staff', isRead: false }, { $set: { isRead: true } });
        res.json({ message: "Messages marked as read" });
    }
    catch (err) {
        res.status(500).json({ message: "Error updating messages" });
    }
}));
// =========================================================================
// 2. DYNAMIC ROUTES (MUST BE AT THE BOTTOM)
// =========================================================================
// GET all messages for a specific client
router.get('/:clientUserId', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const messages = yield Message_1.default.find({ clientUserId: req.params.clientUserId })
            .sort({ createdAt: 1 }); // Oldest first
        res.json(messages);
    }
    catch (err) {
        res.status(500).json({ message: "Error fetching messages" });
    }
}));
// POST a new message
router.post('/:clientUserId', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { senderRole, text } = req.body;
        const newMessage = new Message_1.default({
            clientUserId: req.params.clientUserId,
            senderRole,
            text
        });
        yield newMessage.save();
        res.status(201).json(newMessage);
    }
    catch (err) {
        res.status(500).json({ message: "Error sending message" });
    }
}));
exports.default = router;
