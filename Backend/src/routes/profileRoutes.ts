import express, { Request, Response } from 'express';
import mongoose from 'mongoose';
import ClientProfile from '../models/ClientProfile';
import { upload } from '../middleware/uploadMiddleware'; // Ensure this path is correct
import User from '../models/User'; 
import { sendNewInquiryEmail, sendClientApprovalEmail, sendDocumentUploadEmail, sendAuditDatesProposedEmail, sendAuditDateSelectedEmail, sendAuditConfirmedEmail } from '../utils/mailer';

const router = express.Router();

// =========================================================================
// 1. SPECIFIC ROUTES (MUST BE AT THE TOP)
// =========================================================================

// @route   GET /api/profile/details/:id
// @desc    Get a single profile by PROFILE ID (Used by Staff Review Page)
// ⚠️ THIS MUST BE BEFORE /:userId
router.get('/details/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const profileId = new mongoose.Types.ObjectId(req.params.id as string);
    const profile = await ClientProfile.findById(profileId).populate('user', ['name', 'email']);

    if (!profile) {
      res.status(404).json({ message: 'Profile not found' });
      return;
    }
    res.json(profile);
  } catch (err) {
    console.error("Error fetching profile details:", err);
    res.status(500).send('Server Error');
  }
});

// @route   GET /api/profile/admin/all
// @desc    Get ALL client profiles (Joined with User info)
router.get('/admin/all', async (req: Request, res: Response): Promise<void> => {
  try {
    const profiles = await ClientProfile.find()
      .populate('user', ['name', 'email', 'role']) 
      .sort({ createdAt: -1 });

    res.json(profiles);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});

// @route   POST /api/profile/upload
// @desc    Upload a document
// Change 'req: Request' to 'req: any' to allow .file property
router.post('/upload', upload.single('file'), async (req: any, res: Response): Promise<void> => {
  try {
    const { userId, docName } = req.body;
    if (!req.file) {
      res.status(400).json({ message: 'No file uploaded' });
      return;
    }

    const userObjectId = new mongoose.Types.ObjectId(userId as string);
    const profile = await ClientProfile.findOne({ user: userObjectId });
    if (!profile) {
      res.status(404).json({ message: 'Profile not found' });
      return;
    }

    profile.documents.push({
      name: docName || req.file.originalname,
      path: req.file.path,
      uploadedAt: new Date()
    });

    await profile.save();
    res.json({ message: 'File uploaded successfully', filePath: req.file.path });

  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error during upload');
  }
});


// @route   POST /api/profile/:userId/submit-documents
// @desc    Client confirms they are done uploading. Notifies staff and updates status.
router.post('/:userId/submit-documents', async (req: Request, res: Response): Promise<void> => {
  try {
    // 1. Find the profile
    const profile = await ClientProfile.findOneAndUpdate(
      { user: req.params.userId },
      { status: 'Documents Submitted' }, // Automatically update their status!
      { new: true }
    );

    if (!profile) {
      res.status(404).json({ message: "Profile not found" });
      return;
    }

    // 2. Fire the email to the staff
    const clientName = profile.contactName || 'A Client';
    const companyName = profile.companyName || 'Unknown Company';
    
    sendDocumentUploadEmail(clientName, companyName)
        .catch(err => console.error("❌ Document email failed:", err));

    res.json({ message: "Documents submitted successfully", profile });
  } catch (err) {
    console.error("Submit Documents Error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

/// @route   PUT /api/profile/status/:id
// @desc    Update client status AND service type AND email client if approved
router.put('/status/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const { status, serviceType } = req.body; 

    // 1. Get the existing profile BEFORE updating so we can check if the status is actually changing
    const existingProfile = await ClientProfile.findById(req.params.id).populate('user', 'email name');
    if (!existingProfile) {
      res.status(404).json({ message: 'Profile not found' });
      return;
    }

    // 2. Create update object dynamically
    const updateData: any = { status };
    if (serviceType) updateData.serviceType = serviceType;

    // 3. Update the database
    const updatedProfile = await ClientProfile.findByIdAndUpdate(
      req.params.id, 
      updateData, 
      { new: true }
    ).populate('user', 'email name');

    // 4. THE MAGIC: Check if we just moved them to the approval/document phase!
    // We check `existingProfile.status !== status` so we don't spam them if the staff just updates the service type later!
    const isNewlyApproved = (status === 'Awaiting Documents' || status === 'Ready for audit') && existingProfile.status !== status;

    if (isNewlyApproved && updatedProfile && updatedProfile.user) {
        // Extract the user's data safely
        const clientEmail = (updatedProfile.user as any).email;
        const clientName = updatedProfile.contactName || (updatedProfile.user as any).name || 'Valued Client';
        const assignedService = updatedProfile.serviceType || 'our assessment services';
        
        console.log(`✉️ Sending approval email to client: ${clientEmail}`);
        
        // Fire off the email to the client in the background!
        sendClientApprovalEmail(clientEmail, clientName, assignedService)
            .catch(err => console.error("❌ Client email failed:", err));
    }

    res.json(updatedProfile);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});
// @route   PUT /api/profile/:id/schedule
// @desc    Save proposed audit dates, update status to Ready for Audit, and email client
router.put('/:id/schedule', async (req: Request, res: Response): Promise<void> => {
  try {
    const { proposedAuditDates, auditNotes } = req.body;
    
    // 1. Update the dates/notes AND automatically change their status to 'Ready for Audit'
    // We also use .populate() so we can grab their email address for the mailer
    const profile = await ClientProfile.findByIdAndUpdate(
      req.params.id, 
      { 
          proposedAuditDates, 
          auditNotes,
          status: 'Ready for audit' // Automatically moves them on the Kanban board!
      },
      { new: true }
    ).populate('user', 'email name');
    
    if (!profile) {
        res.status(404).json({ message: "Profile not found" });
        return;
    }

    // 2. Fire the email to the client
    if (profile.user) {
        // Extract the user's data safely
        const clientEmail = (profile.user as any).email;
        const clientName = profile.contactName || (profile.user as any).name || 'Valued Client';
        
        console.log(`✉️ Sending audit date proposal email to: ${clientEmail}`);
        
        // Fire off the email in the background!
        sendAuditDatesProposedEmail(clientEmail, clientName)
            .catch(err => console.error("❌ Proposed dates email failed:", err));
    }
    
    res.json({ message: "Schedule updated successfully and client notified", profile });
  } catch (error) {
    console.error("Scheduling Error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// @route   PUT /api/profile/:id/archive
// @desc    Archive a client
router.put('/:id/archive', async (req, res) => {
  try {
    const { id } = req.params;
    // Find by the user field instead of _id to match what the frontend sends
    const profile = await ClientProfile.findOneAndUpdate(
      { user: id }, 
      { isArchived: true },
      { new: true }
    );
    if (!profile) return res.status(404).json({ message: "Profile not found" });
    res.json({ message: "Client archived successfully", profile });
  } catch (error) {
    console.error("Archive Error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// @route   PUT /api/profile/:id/unarchive
// @desc    Unarchive a client
router.put('/:id/unarchive', async (req, res) => {
  try {
    const { id } = req.params;
    const profile = await ClientProfile.findOneAndUpdate(
      { user: id }, 
      { isArchived: false },
      { new: true }
    );
    if (!profile) return res.status(404).json({ message: "Profile not found" });
    res.json({ message: "Client restored successfully", profile });
  } catch (error) {
    console.error("Unarchive Error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// @route   PUT /api/profile/:userId/confirm-schedule
// @desc    Client confirms their final audit date and emails staff
router.put('/:userId/confirm-schedule', async (req: Request, res: Response): Promise<void> => {
  try {
    const { confirmedAuditDate } = req.body;
    
    // 1. Find the profile by the USER ID and update the dates
    const profile = await ClientProfile.findOneAndUpdate(
      { user: req.params.userId }, 
      { 
          confirmedAuditDate,
          status: 'Audit Scheduled' // Automatically move them on the Kanban board!
      },
      { new: true }
    );
    
    if (!profile) {
        res.status(404).json({ message: "Profile not found" });
        return;
    }

    // 2. Fire the email to the staff
    const clientName = profile.contactName || 'A Client';
    const companyName = profile.companyName || 'Unknown Company';
    
    console.log(`✉️ Sending audit date selection email to staff for: ${companyName}`);
    
    // Fire off the email in the background!
    sendAuditDateSelectedEmail(companyName, clientName, confirmedAuditDate)
        .catch(err => console.error("❌ Date selection email failed:", err));
    
    res.json({ message: "Audit scheduled successfully", profile });
  } catch (error) {
    console.error("Schedule Confirmation Error:", error);
    res.status(500).json({ message: "Server error" });
  }
});


// @route   PUT /api/profile/:id/staff-confirm-audit
// @desc    Staff officially confirms the client's selected audit date and emails client
router.put('/:id/staff-confirm-audit', async (req, res) => {
  try {
    // 1. Update the database and populate the user so we can get their email
    const profile = await ClientProfile.findByIdAndUpdate(
      req.params.id, 
      { isAuditConfirmed: true },
      { new: true }
    ).populate('user', 'email name');
    
    if (!profile) {
        return res.status(404).json({ message: "Profile not found" });
    }
    
    // Create a "safe" version of the profile to bypass TypeScript's strict rules
    const safeProfile = profile as any;
    
    // 2. Fire the final email to the client!
    if (safeProfile.user) {
        const clientEmail = safeProfile.user.email;
        const clientName = safeProfile.contactName || safeProfile.user.name || 'Valued Client';
        const confirmedDate = safeProfile.confirmedAuditDate || 'your scheduled date';
        
        console.log(`✉️ Sending official confirmation email to: ${clientEmail}`);
        
        // Fire off the email in the background!
        sendAuditConfirmedEmail(clientEmail, clientName, confirmedDate)
            .catch(err => console.error("❌ Official confirmation email failed:", err));
    }

    res.json({ message: "Audit officially confirmed!", profile });
  } catch (error) {
    console.error("Confirmation Error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// @route   PUT /api/profile/:userId/remove-document
// @desc    Removes a specific document from the client's profile
// @route   PUT /api/profile/:userId/remove-document
// @desc    Removes a specific document from the client's profile
router.put('/:userId/remove-document', async (req, res) => {
  try {
    const { path } = req.body; // <-- Changed to look for the specific file path
    
    // Pull the exact document that matches this unique file path
    const profile = await ClientProfile.findOneAndUpdate(
      { user: req.params.userId },
      { $pull: { documents: { path: path } } },
      { new: true }
    );

    if (!profile) return res.status(404).json({ message: "Profile not found" });

    res.json({ message: "Document removed successfully", profile });
  } catch (error) {
    console.error("Remove Document Error:", error);
    res.status(500).json({ message: "Server error" });
  }
});
// =========================================================================
// 2. GENERIC ROUTES (MUST BE AT THE BOTTOM)
// =========================================================================

// @route   GET /api/profile/:userId
// @desc    Get client profile by User ID (Used by Client Dashboard)
router.get('/:userId', async (req: Request, res: Response): Promise<void> => {
  try {
    const userIdString = req.params.userId as string;
    
    // Safety Check: If "details" or "admin" accidentally gets here, stop.
    if (!mongoose.Types.ObjectId.isValid(userIdString)) {
        res.status(400).json({ message: 'Invalid User ID' });
        return;
    }

    const userId = new mongoose.Types.ObjectId(userIdString);
    const profile = await ClientProfile.findOne({ user: userId } as any);
    
    if (!profile) {
      res.status(404).json({ message: 'Profile not found' });
      return;
    }
    res.json(profile);
  } catch (err) {
    console.error("Profile Fetch Error:", err);
    res.status(500).send('Server Error');
  }
});

// @route   POST /api/profile
// @desc    Create or Update client profile
router.post('/', async (req: Request, res: Response): Promise<void> => {
  const { userId, ...rest } = req.body;

  try {
    const userObjectId = new mongoose.Types.ObjectId(userId as string);
    const profileFields: any = { user: userObjectId, ...rest };

    let profile = await ClientProfile.findOne({ user: userObjectId } as any);

    if (profile) {
      profile = await ClientProfile.findOneAndUpdate(
        { user: userObjectId } as any,
        { $set: profileFields },
        { new: true }
      );
    } else {
      profile = new ClientProfile(profileFields);
      await profile.save();
    }
    res.json(profile);

  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});


// @route   PUT /api/profile/:id
// @desc    Update OR Create client profile AND trigger Staff Email
router.put('/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    console.log(`🚨 ===> FRONTEND SUCCESSFULLY HIT THE PUT ROUTE! User ID: ${req.params.id}`);
    const userId = req.params.id;

    // 1. Check if profile exists
    const existingProfile = await ClientProfile.findOne({ user: userId as any });
    
    // If it doesn't exist, OR if it's currently a 'New Inquiry', it's a first-time update!
    const isFirstTimeUpdate = !existingProfile || existingProfile.status === 'New Inquiry';

    // 2. Update OR Create (upsert) the profile!
    const updatedProfile = await ClientProfile.findOneAndUpdate(
      { user: userId as any },
      { $set: { ...req.body, user: userId } }, // Save form data + ensure User ID is attached
      { new: true, upsert: true, setDefaultsOnInsert: true } // UPSERT creates it if missing!
    );

    console.log("👉 Profile saved! Attempting email sequence...");

    // 3. Send the Email (Temporarily sending on ALL updates to test it)
    if (isFirstTimeUpdate && updatedProfile) {
        // Fetch the User account to get their email address
        const userAccount = await User.findById(userId);
        const clientEmail = userAccount ? userAccount.email : 'Unknown Email';
        const companyName = updatedProfile.companyName || 'New Client';
        
        console.log(`✉️ Sending email alert for: ${companyName}`);
        
        // Fire off the email in the background
        sendNewInquiryEmail(clientEmail, companyName)
            .then(() => console.log("✅ Email sent successfully!"))
            .catch(err => console.error("❌ Email failed:", err));
    }

    res.json({ message: "Profile saved successfully", profile: updatedProfile });
  } catch (error) {
    console.error("Update Error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;