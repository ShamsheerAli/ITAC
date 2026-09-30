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
const Lead_1 = __importDefault(require("../models/Lead"));
const nodemailer_1 = __importDefault(require("nodemailer"));
const router = express_1.default.Router();
// @route   POST /api/leads
// @desc    Create a new potential client (lead)
router.post('/', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const newLead = new Lead_1.default(req.body);
        const savedLead = yield newLead.save();
        console.log("✅ New Lead Saved:", savedLead.companyName);
        res.status(201).json(savedLead);
    }
    catch (err) {
        console.error("Error saving lead:", err);
        res.status(500).json({ message: 'Server error saving lead' });
    }
}));
// @route   GET /api/leads
// @desc    Get all potential clients
router.get('/', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Fetches all leads, sorting by the newest ones first
        const leads = yield Lead_1.default.find({ isArchived: false }).sort({ createdAt: -1 });
        res.json(leads);
    }
    catch (err) {
        console.error("Error fetching leads:", err);
        res.status(500).json({ message: 'Server error fetching leads' });
    }
}));
// @route   PUT /api/leads/:id
// @desc    Update a potential client's data
router.put('/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const updatedLead = yield Lead_1.default.findByIdAndUpdate(req.params.id, { $set: req.body }, // Updates only the fields that were sent
        { new: true } // Returns the newly updated document
        );
        if (!updatedLead) {
            res.status(404).json({ message: 'Lead not found' });
            return;
        }
        res.json(updatedLead);
    }
    catch (err) {
        console.error("Error updating lead:", err);
        res.status(500).json({ message: 'Server error updating lead' });
    }
}));
// @route   PUT /api/leads/:id/archive
// @desc    Archive a potential client (Soft Delete)
router.put('/:id/archive', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const lead = yield Lead_1.default.findByIdAndUpdate(req.params.id, { isArchived: true }, // Flips the hidden switch!
        { new: true });
        if (!lead) {
            res.status(404).json({ message: 'Lead not found' });
            return;
        }
        res.json({ message: 'Lead archived successfully', lead });
    }
    catch (err) {
        console.error("Error archiving lead:", err);
        res.status(500).json({ message: 'Server error archiving lead' });
    }
}));
// @route   POST /api/leads/convert/:id
// @desc    Send an invitation email to the lead to create an account
router.post('/convert/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const lead = yield Lead_1.default.findById(req.params.id);
        if (!lead) {
            return res.status(404).json({ message: 'Lead not found' });
        }
        if (!lead.contactEmail) {
            return res.status(400).json({ message: 'Lead has no email address' });
        }
        // Clean up the email string in case they entered multiple emails with semicolons
        const formattedEmails = lead.contactEmail.replace(/;/g, ',').replace(/\s+/g, '');
        // Configure Nodemailer (Ensure you have your SMTP setup here)
        const transporter = nodemailer_1.default.createTransport({
            service: 'gmail', // Or your specific provider
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            }
        });
        // The link to your signup page
        const signupLink = 'http://energyhub.okstate.edu/signup';
        yield transporter.sendMail({
            from: '"OSU ITAC" <noreply@energyhub.okstate.edu>',
            to: formattedEmails,
            subject: "Invitation to OSU ITAC Services",
            html: `
        <div style="font-family: Arial, sans-serif; max-w: 600px; margin: 0 auto;">
            <h2>Welcome to OSU ITAC!</h2>
            <p>Hello ${lead.contactName || lead.companyName},</p>
            <p>You have been invited to join the ITAC portal to begin your energy assessment process.</p>
            <p>Please click the button below to create your account and access your dashboard:</p>
            <a href="${signupLink}" style="display: inline-block; padding: 12px 24px; background-color: #FE5C00; color: white; text-decoration: none; border-radius: 5px; font-weight: bold; margin-top: 10px;">
                Create Your Account
            </a>
            <p style="margin-top: 30px; font-size: 12px; color: #666;">If the button doesn't work, copy and paste this link into your browser: ${signupLink}</p>
        </div>
      `
        });
        // Mark the lead as archived so it leaves the active pipeline
        lead.isArchived = true;
        yield lead.save();
        res.json({ message: 'Invitation email sent successfully!' });
    }
    catch (err) {
        console.error("Error sending conversion email:", err);
        res.status(500).json({ message: 'Server error during conversion' });
    }
}));
exports.default = router;
