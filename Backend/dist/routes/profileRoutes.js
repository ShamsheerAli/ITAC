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
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const mongoose_1 = __importDefault(require("mongoose"));
const ClientProfile_1 = __importDefault(require("../models/ClientProfile"));
const uploadMiddleware_1 = require("../middleware/uploadMiddleware"); // Ensure this path is correct
const User_1 = __importDefault(require("../models/User"));
const mailer_1 = require("../utils/mailer");
const router = express_1.default.Router();
// Lightweight in-memory limiter for sensitive profile mutation/read routes.
const routeRateLimitStore = new Map();
const withSimpleRateLimit = (routeKey, limit, windowMs) => {
    return (req, res, next) => {
        const key = `${routeKey}:${req.ip || 'unknown'}`;
        const now = Date.now();
        const existing = routeRateLimitStore.get(key);
        if (!existing || now > existing.resetAt) {
            routeRateLimitStore.set(key, { count: 1, resetAt: now + windowMs });
            next();
            return;
        }
        if (existing.count >= limit) {
            res.status(429).json({ message: 'Too many requests. Please try again shortly.' });
            return;
        }
        existing.count += 1;
        routeRateLimitStore.set(key, existing);
        next();
    };
};
// =========================================================================
// 1. SPECIFIC ROUTES (MUST BE AT THE TOP)
// =========================================================================
// @route   GET /api/profile/details/:id
// @desc    Get a single profile by PROFILE ID (Used by Staff Review Page)
// ⚠️ THIS MUST BE BEFORE /:userId
router.get('/details/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const profileId = new mongoose_1.default.Types.ObjectId(req.params.id);
        const profile = yield ClientProfile_1.default.findById(profileId).populate('user', ['name', 'email']);
        if (!profile) {
            res.status(404).json({ message: 'Profile not found' });
            return;
        }
        res.json(profile);
    }
    catch (err) {
        console.error("Error fetching profile details:", err);
        res.status(500).send('Server Error');
    }
}));
// @route   GET /api/profile/admin/all
// @desc    Get ALL client profiles (Joined with User info)
router.get('/admin/all', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const profiles = yield ClientProfile_1.default.find()
            .populate('user', ['name', 'email', 'role'])
            .sort({ createdAt: -1 });
        res.json(profiles);
    }
    catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
}));
// @route   POST /api/profile/upload
// @desc    Upload a document
// Change 'req: Request' to 'req: any' to allow .file property
router.post('/upload', uploadMiddleware_1.upload.single('file'), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { userId, docName } = req.body;
        if (!req.file) {
            res.status(400).json({ message: 'No file uploaded' });
            return;
        }
        const userObjectId = new mongoose_1.default.Types.ObjectId(userId);
        const profile = yield ClientProfile_1.default.findOne({ user: userObjectId });
        if (!profile) {
            res.status(404).json({ message: 'Profile not found' });
            return;
        }
        profile.documents.push({
            name: docName,
            originalName: req.file.originalname,
            path: req.file.path,
            uploadedAt: new Date()
        });
        yield profile.save();
        res.json({ message: 'File uploaded successfully', filePath: req.file.path });
    }
    catch (err) {
        console.error(err);
        res.status(500).send('Server Error during upload');
    }
}));
// @route   POST /api/profile/:userId/submit-documents
// @desc    Client confirms they are done uploading. Notifies staff and updates status.
router.post('/:userId/submit-documents', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // 1. Find the profile
        const profile = yield ClientProfile_1.default.findOneAndUpdate({ user: req.params.userId }, {
            status: 'Documents Submitted',
            statusUpdatedAt: Date.now() // 🚨 NEW: Starts the timer for Kanban board!
        }, { new: true });
        if (!profile) {
            res.status(404).json({ message: "Profile not found" });
            return;
        }
        // 2. Fire the email to the staff
        const clientName = profile.contactName || 'A Client';
        const companyName = profile.companyName || 'Unknown Company';
        (0, mailer_1.sendDocumentUploadEmail)(clientName, companyName)
            .catch(err => console.error("❌ Document email failed:", err));
        res.json({ message: "Documents submitted successfully", profile });
    }
    catch (err) {
        console.error("Submit Documents Error:", err);
        res.status(500).json({ message: "Server error" });
    }
}));
/// @route   PUT /api/profile/status/:id
// @desc    Update client status AND service type AND email client if approved
router.put('/status/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { status, serviceType } = req.body;
        // 1. Get the existing profile BEFORE updating so we can check if the status is actually changing
        const existingProfile = yield ClientProfile_1.default.findById(req.params.id).populate('user', 'email name');
        if (!existingProfile) {
            res.status(404).json({ message: 'Profile not found' });
            return;
        }
        // 2. Create update object dynamically
        const updateData = { status };
        if (serviceType)
            updateData.serviceType = serviceType;
        // 🚨 NEW: Only update the timer if the status is actually changing!
        if (existingProfile.status !== status) {
            updateData.statusUpdatedAt = Date.now();
        }
        // 3. Update the database
        const updatedProfile = yield ClientProfile_1.default.findByIdAndUpdate(req.params.id, updateData, { new: true }).populate('user', 'email name');
        // 4. THE MAGIC: Check if we just moved them to the approval/document phase!
        // We check `existingProfile.status !== status` so we don't spam them if the staff just updates the service type later!
        const isNewlyApproved = (status === 'Approved' ||
            status === 'Awaiting Documents' ||
            status === 'Ready for audit') && existingProfile.status !== status;
        if (isNewlyApproved && updatedProfile && updatedProfile.user) {
            // Extract the user's data safely
            const clientEmail = updatedProfile.user.email;
            const clientName = updatedProfile.contactName || updatedProfile.user.name || 'Valued Client';
            const assignedService = updatedProfile.serviceType || 'our assessment services';
            console.log(`✉️ Sending approval email to client: ${clientEmail}`);
            // Fire off the email to the client in the background!
            (0, mailer_1.sendClientApprovalEmail)(clientEmail, clientName, assignedService)
                .catch(err => console.error("❌ Client email failed:", err));
        }
        res.json(updatedProfile);
    }
    catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
}));
// @route   PUT /api/profile/:id/schedule
// @desc    Save proposed audit dates, update status to Ready for Audit, and email client
router.put('/:id/schedule', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { proposedAuditDates, auditNotes } = req.body;
        // 1. Update the dates/notes AND automatically change their status to 'Ready for Audit'
        // We also use .populate() so we can grab their email address for the mailer
        const profile = yield ClientProfile_1.default.findByIdAndUpdate(req.params.id, {
            proposedAuditDates,
            auditNotes,
            status: 'Ready for audit', // Automatically moves them on the Kanban board!
            statusUpdatedAt: Date.now() // 🚨 NEW: Starts the timer for Kanban board!
        }, { new: true }).populate('user', 'email name');
        if (!profile) {
            res.status(404).json({ message: "Profile not found" });
            return;
        }
        // 2. Fire the email to the client
        if (profile.user) {
            // Extract the user's data safely
            const clientEmail = profile.user.email;
            const clientName = profile.contactName || profile.user.name || 'Valued Client';
            console.log(`✉️ Sending audit date proposal email to: ${clientEmail}`);
            // Fire off the email in the background!
            (0, mailer_1.sendAuditDatesProposedEmail)(clientEmail, clientName)
                .catch(err => console.error("❌ Proposed dates email failed:", err));
        }
        res.json({ message: "Schedule updated successfully and client notified", profile });
    }
    catch (error) {
        console.error("Scheduling Error:", error);
        res.status(500).json({ message: "Server error" });
    }
}));
// @route   PUT /api/profile/:id/archive
// @desc    Archive a client
router.put('/:id/archive', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        // Find by the user field instead of _id to match what the frontend sends
        const profile = yield ClientProfile_1.default.findOneAndUpdate({ user: id }, { isArchived: true }, { new: true });
        if (!profile)
            return res.status(404).json({ message: "Profile not found" });
        res.json({ message: "Client archived successfully", profile });
    }
    catch (error) {
        console.error("Archive Error:", error);
        res.status(500).json({ message: "Server error" });
    }
}));
// @route   PUT /api/profile/:id/unarchive
// @desc    Unarchive a client
router.put('/:id/unarchive', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const profile = yield ClientProfile_1.default.findOneAndUpdate({ user: id }, { isArchived: false }, { new: true });
        if (!profile)
            return res.status(404).json({ message: "Profile not found" });
        res.json({ message: "Client restored successfully", profile });
    }
    catch (error) {
        console.error("Unarchive Error:", error);
        res.status(500).json({ message: "Server error" });
    }
}));
// @route   PUT /api/profile/:userId/confirm-schedule
// @desc    Client confirms their final audit date and emails staff
router.put('/:userId/confirm-schedule', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { confirmedAuditDate } = req.body;
        // 1. Find the profile by the USER ID and update the dates
        const profile = yield ClientProfile_1.default.findOneAndUpdate({ user: req.params.userId }, {
            confirmedAuditDate,
            status: 'Audit Scheduled', // Automatically move them on the Kanban board!
            statusUpdatedAt: Date.now() // 🚨 NEW: Starts the timer for Kanban board!
        }, { new: true });
        if (!profile) {
            res.status(404).json({ message: "Profile not found" });
            return;
        }
        // 2. Fire the email to the staff
        const clientName = profile.contactName || 'A Client';
        const companyName = profile.companyName || 'Unknown Company';
        console.log(`✉️ Sending audit date selection email to staff for: ${companyName}`);
        // Fire off the email in the background!
        (0, mailer_1.sendAuditDateSelectedEmail)(companyName, clientName, confirmedAuditDate)
            .catch(err => console.error("❌ Date selection email failed:", err));
        res.json({ message: "Audit scheduled successfully", profile });
    }
    catch (error) {
        console.error("Schedule Confirmation Error:", error);
        res.status(500).json({ message: "Server error" });
    }
}));
// @route   PUT /api/profile/:id/staff-confirm-audit
// @desc    Staff officially confirms the client's selected audit date and emails client
router.put('/:id/staff-confirm-audit', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // 1. Update the database and populate the user so we can get their email
        const profile = yield ClientProfile_1.default.findByIdAndUpdate(req.params.id, { isAuditConfirmed: true }, { new: true }).populate('user', 'email name');
        if (!profile) {
            return res.status(404).json({ message: "Profile not found" });
        }
        // Create a "safe" version of the profile to bypass TypeScript's strict rules
        const safeProfile = profile;
        // 2. Fire the final email to the client!
        if (safeProfile.user) {
            const clientEmail = safeProfile.user.email;
            const clientName = safeProfile.contactName || safeProfile.user.name || 'Valued Client';
            const confirmedDate = safeProfile.confirmedAuditDate || 'your scheduled date';
            console.log(`✉️ Sending official confirmation email to: ${clientEmail}`);
            // Fire off the email in the background!
            (0, mailer_1.sendAuditConfirmedEmail)(clientEmail, clientName, confirmedDate)
                .catch(err => console.error("❌ Official confirmation email failed:", err));
        }
        res.json({ message: "Audit officially confirmed!", profile });
    }
    catch (error) {
        console.error("Confirmation Error:", error);
        res.status(500).json({ message: "Server error" });
    }
}));
// @route   PUT /api/profile/:userId/remove-document
// @desc    Removes a specific document from the client's profile
router.put('/:userId/remove-document', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { path } = req.body; // <-- Changed to look for the specific file path
        // Pull the exact document that matches this unique file path
        const profile = yield ClientProfile_1.default.findOneAndUpdate({ user: req.params.userId }, { $pull: { documents: { path: path } } }, { new: true });
        if (!profile)
            return res.status(404).json({ message: "Profile not found" });
        res.json({ message: "Document removed successfully", profile });
    }
    catch (error) {
        console.error("Remove Document Error:", error);
        res.status(500).json({ message: "Server error" });
    }
}));
// =========================================================================
// 2. GENERIC ROUTES (MUST BE AT THE BOTTOM)
// =========================================================================
// @route   GET /api/profile/:userId
// @desc    Get client profile by User ID (Used by Client Dashboard)
router.get('/:userId', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userIdString = req.params.userId;
        // Safety Check: If "details" or "admin" accidentally gets here, stop.
        if (!mongoose_1.default.Types.ObjectId.isValid(userIdString)) {
            res.status(400).json({ message: 'Invalid User ID' });
            return;
        }
        const userId = new mongoose_1.default.Types.ObjectId(userIdString);
        const profile = yield ClientProfile_1.default.findOne({ user: userId });
        if (!profile) {
            res.status(404).json({ message: 'Profile not found' });
            return;
        }
        res.json(profile);
    }
    catch (err) {
        console.error("Profile Fetch Error:", err);
        res.status(500).send('Server Error');
    }
}));
// @route   POST /api/profile
// @desc    Create or Update client profile
router.post('/', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const _a = req.body, { userId } = _a, rest = __rest(_a, ["userId"]);
    try {
        const userObjectId = new mongoose_1.default.Types.ObjectId(userId);
        const profileFields = Object.assign({ user: userObjectId }, rest);
        let profile = yield ClientProfile_1.default.findOne({ user: userObjectId });
        if (profile) {
            profile = yield ClientProfile_1.default.findOneAndUpdate({ user: userObjectId }, { $set: profileFields }, { new: true });
        }
        else {
            profile = new ClientProfile_1.default(profileFields);
            yield profile.save();
        }
        res.json(profile);
    }
    catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
}));
// @route   PUT /api/profile/:id
// @desc    Update OR Create client profile AND trigger Staff Email
router.put('/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        console.log(`🚨 ===> FRONTEND SUCCESSFULLY HIT THE PUT ROUTE! User ID: ${req.params.id}`);
        const userId = req.params.id;
        // 1. Check if profile exists
        const existingProfile = yield ClientProfile_1.default.findOne({ user: userId });
        // If it doesn't exist, OR if it's currently a 'New Inquiry', it's a first-time update!
        const isFirstTimeUpdate = !existingProfile || existingProfile.status === 'New Inquiry';
        // 2. Update OR Create (upsert) the profile!
        const updatedProfile = yield ClientProfile_1.default.findOneAndUpdate({ user: userId }, { $set: Object.assign(Object.assign({}, req.body), { user: userId }) }, // Save form data + ensure User ID is attached
        { new: true, upsert: true, setDefaultsOnInsert: true } // UPSERT creates it if missing!
        );
        console.log("👉 Profile saved! Attempting email sequence...");
        // 3. Send the Email (Temporarily sending on ALL updates to test it)
        if (isFirstTimeUpdate && updatedProfile) {
            // Fetch the User account to get their email address
            const userAccount = yield User_1.default.findById(userId);
            const clientEmail = userAccount ? userAccount.email : 'Unknown Email';
            const companyName = updatedProfile.companyName || 'New Client';
            console.log(`✉️ Sending email alert for: ${companyName}`);
            // Fire off the email in the background
            (0, mailer_1.sendNewInquiryEmail)(clientEmail, companyName)
                .then(() => console.log("✅ Email sent successfully!"))
                .catch(err => console.error("❌ Email failed:", err));
        }
        res.json({ message: "Profile saved successfully", profile: updatedProfile });
    }
    catch (error) {
        console.error("Update Error:", error);
        res.status(500).json({ message: "Server error" });
    }
}));
// @route   GET /api/profile/staff/:userId
// @desc    Get staff profile
router.get('/staff/:userId', withSimpleRateLimit('profile_staff_get', 60, 60000), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const rawUserId = req.params.userId;
        const userId = typeof rawUserId === 'string' ? rawUserId : '';
        if (!mongoose_1.default.Types.ObjectId.isValid(userId)) {
            return res.status(400).json({ message: "Invalid user id" });
        }
        const userObjectId = new mongoose_1.default.Types.ObjectId(userId);
        const profile = yield ClientProfile_1.default.findOne({ user: userObjectId });
        res.json(profile);
    }
    catch (err) {
        res.status(500).json({ message: "Server error fetching staff profile" });
    }
}));
// @route   PUT /api/profile/staff/:userId
// @desc    Update staff profile (Bypasses email triggers and forces creation)
router.put('/staff/:userId', withSimpleRateLimit('profile_staff_put', 30, 60000), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const rawUserId = req.params.userId;
        const userId = typeof rawUserId === 'string' ? rawUserId : '';
        if (!mongoose_1.default.Types.ObjectId.isValid(userId)) {
            return res.status(400).json({ message: "Invalid user id" });
        }
        const userObjectId = new mongoose_1.default.Types.ObjectId(userId);
        const allowedUpdates = ['contactName', 'position', 'contactPhone', 'linkedIn', 'facebook'];
        const sanitizedUpdates = allowedUpdates.reduce((acc, key) => {
            if (Object.prototype.hasOwnProperty.call(req.body, key)) {
                acc[key] = req.body[key];
            }
            return acc;
        }, {});
        const updatedProfile = yield ClientProfile_1.default.findOneAndUpdate({ user: userObjectId }, { $set: Object.assign(Object.assign({}, sanitizedUpdates), { user: userObjectId }) }, { new: true, upsert: true, setDefaultsOnInsert: true });
        res.json(updatedProfile);
    }
    catch (err) {
        console.error("Error saving staff profile:", err);
        res.status(500).json({ message: "Server error saving staff profile" });
    }
}));
// @route   DELETE /api/profile/:id  <-- Adjust this path if your archived clients are stored elsewhere
// @desc    PERMANENTLY delete a client from the database
router.delete('/:id', withSimpleRateLimit('profile_delete', 20, 60000), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const rawId = req.params.id;
        const id = typeof rawId === 'string' ? rawId : '';
        if (!mongoose_1.default.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: "Invalid id" });
        }
        const objectId = new mongoose_1.default.Types.ObjectId(id);
        let deletedClient = yield ClientProfile_1.default.findByIdAndDelete(objectId);
        if (!deletedClient) {
            deletedClient = yield ClientProfile_1.default.findOneAndDelete({ user: objectId });
        }
        if (!deletedClient) {
            return res.status(404).json({ message: 'Client not found' });
        }
        // Optional: If you also want to delete the actual User account attached to this profile
        // await User.findByIdAndDelete(deletedClient.userId); 
        res.json({ message: 'Client permanently deleted' });
    }
    catch (err) {
        console.error("Error permanently deleting client:", err);
        res.status(500).json({ message: "Server error deleting client" });
    }
}));
exports.default = router;
