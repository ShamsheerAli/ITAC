import express, { Request, Response } from 'express';
import bcrypt from 'bcryptjs'; // (or 'bcrypt' depending on what you used in your backend)
import crypto from 'crypto';
import nodemailer from 'nodemailer';
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
      name: docName,
      originalName: req.file.originalname,
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
      { 
          status: 'Documents Submitted',
          statusUpdatedAt: Date.now() // 🚨 NEW: Starts the timer for Kanban board!
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
    
    // 🚨 NEW: Only update the timer if the status is actually changing!
    if (existingProfile.status !== status) {
        updateData.statusUpdatedAt = Date.now();
    }

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
          status: 'Ready for audit', // Automatically moves them on the Kanban board!
          statusUpdatedAt: Date.now() // 🚨 NEW: Starts the timer for Kanban board!
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
          status: 'Audit Scheduled', // Automatically move them on the Kanban board!
          statusUpdatedAt: Date.now() // 🚨 NEW: Starts the timer for Kanban board!
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

// @route   GET /api/profile/staff/:userId
// @desc    Get staff profile
router.get('/staff/:userId', async (req, res) => {
  try {
    // Assuming your profile links to the user via a 'userId' or 'user' field. 
    // If your DB uses _id for this, change it to findById(req.params.userId)
    const profile = await ClientProfile.findById(req.params.userId);
    res.json(profile);
  } catch (err) {
    res.status(500).json({ message: "Server error fetching staff profile" });
  }
});

// @route   PUT /api/profile/staff/:userId
// @desc    Update staff profile (Bypasses email triggers and forces creation)
router.put('/staff/:userId', async (req, res) => {
  try {
    const updatedProfile = await ClientProfile.findByIdAndUpdate(
      req.params.userId,
      { $set: req.body },
      { new: true, upsert: true }
    );
    res.json(updatedProfile);
  } catch (err) {
    console.error("Error saving staff profile:", err);
    res.status(500).json({ message: "Server error saving staff profile" });
  }
});

// @route   DELETE /api/profile/:id  <-- Adjust this path if your archived clients are stored elsewhere
// @desc    PERMANENTLY delete a client from the database
router.delete('/:id', async (req, res) => {
  try {
    // findByIdAndDelete completely wipes the record from your MongoDB collection
    const deletedClient = await ClientProfile.findByIdAndDelete(req.params.id); 
    
    if (!deletedClient) {
      return res.status(404).json({ message: 'Client not found' });
    }

    // Optional: If you also want to delete the actual User account attached to this profile
    // await User.findByIdAndDelete(deletedClient.userId); 

    res.json({ message: 'Client permanently deleted' });
  } catch (err) {
    console.error("Error permanently deleting client:", err);
    res.status(500).json({ message: "Server error deleting client" });
  }
});


// @route   POST /api/profile/admin/manual-create
// @desc    Manually create a client from the Kanban board and send invite email
router.post('/admin/manual-create', async (req, res) => {
    try {
        const { companyName, name, email } = req.body;

        // 1. Validate inputs
        if (!companyName || !name || !email) {
            return res.status(400).json({ message: 'Company name, contact name, and email are required.' });
        }

        // 2. Check if this email is already registered
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'An account with this email address already exists.' });
        }

        // 3. Generate a random 8-character temporary password
        const tempPassword = crypto.randomBytes(4).toString('hex');

        // 4. Hash the password before saving (IMPORTANT: If your User model has a pre('save') 
        // hook that automatically hashes passwords, you can skip this bcrypt step!)
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(tempPassword, salt);

        // 5. Create the new User document
        const newUser = new User({
            name,
            email,
            passwordHash: hashedPassword, // Use 'tempPassword' here instead if your model auto-hashes
            role: 'client'
        });
        await newUser.save();

        // 6. Create the empty Client Profile linked to this User
        const newProfile = new ClientProfile({
            user: newUser._id,
            companyName: companyName,
            contactName: name, // Carry over the contact name
            contactEmail: email,
            status: 'New Inquiry' // Drops them right into the first Kanban column
        });
        await newProfile.save();

        // 7. Send the Welcome Email with Nodemailer
        const transporter = nodemailer.createTransport({
            service: 'gmail', // Or your SMTP provider
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            }
        });

        const loginLink = 'http://energyhub.okstate.edu/login';

        await transporter.sendMail({
            from: '"OSU ITAC" <noreply@energyhub.okstate.edu>',
            to: email,
            subject: "Welcome to OSU ITAC - Your Account is Ready",
            html: `
                <div style="font-family: Arial, sans-serif; max-w: 600px; margin: 0 auto; color: #333;">
                    <h2 style="color: #FE5C00;">Welcome to the OSU ITAC Portal!</h2>
                    <p>Hello ${name},</p>
                    <p>An ITAC staff member has set up a portal account for <strong>${companyName}</strong>.</p>
                    <p>You can log in to your dashboard to track your assessment progress, upload required utility bills, and securely communicate with our team.</p>
                    
                    <div style="background-color: #f9fafb; border-left: 4px solid #FE5C00; padding: 15px; border-radius: 4px; margin: 20px 0;">
                        <p style="margin: 0 0 8px 0;"><strong>Login Email:</strong> ${email}</p>
                        <p style="margin: 0;"><strong>Temporary Password:</strong> <span style="font-family: monospace; font-size: 16px; background: #e5e7eb; padding: 2px 6px; border-radius: 4px;">${tempPassword}</span></p>
                    </div>
                    
                    <p style="font-size: 14px; color: #666;"><em>Note: For your security, please update your password on your profile page immediately after logging in.</em></p>
                    
                    <a href="${loginLink}" style="display: inline-block; padding: 12px 24px; background-color: #FE5C00; color: white; text-decoration: none; border-radius: 5px; font-weight: bold; margin-top: 15px;">
                        Log In to Your Dashboard
                    </a>
                </div>
            `
        });

        res.status(201).json({ message: 'Client created and email sent successfully!' });

    } catch (error) {
        console.error("Manual client creation error:", error);
        res.status(500).json({ message: 'Server error while creating the client.' });
    }
});

// @route   POST /api/profile/audit-files/:id
// @desc    Upload staff field notes and images to a client profile
// Make sure you have 'upload' configured via Multer (e.g., upload.array('auditFiles', 10))
router.post('/audit-files/:id', upload.array('auditFiles', 10), async (req, res) => {
    try {
        const clientProfile = await ClientProfile.findById(req.params.id);
        
        if (!clientProfile) {
            return res.status(404).json({ message: 'Client profile not found' });
        }

        // Check if files were uploaded
        if (req.files && Array.isArray(req.files)) {
            const newFiles = req.files.map(file => ({
                name: file.filename,
                originalName: file.originalname,
                path: file.path,
                uploadedAt: new Date()
            }));

            // Initialize array if it doesn't exist in schema yet
            if (!clientProfile.auditFiles) {
                clientProfile.auditFiles = [];
            }

            // Append new files to the array
            clientProfile.auditFiles.push(...newFiles);
            await clientProfile.save();
        }

        res.json({ message: 'Files uploaded successfully', profile: clientProfile });
    } catch (error) {
        console.error("Error uploading audit files:", error);
        res.status(500).json({ message: 'Server error' });
    }
});


export default router;