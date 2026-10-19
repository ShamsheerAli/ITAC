import express, { Request, Response } from 'express';
import bcrypt from 'bcryptjs'; 
import crypto from 'crypto';
import nodemailer from 'nodemailer';
import mongoose from 'mongoose';
import ClientProfile from '../models/ClientProfile';
import { upload } from '../middleware/uploadMiddleware'; 
import User from '../models/User'; 
import { sendNewInquiryEmail, sendClientApprovalEmail, sendDocumentUploadEmail, sendAuditDatesProposedEmail, sendAuditDateSelectedEmail, sendAuditConfirmedEmail } from '../utils/mailer';

const router = express.Router();

// =========================================================================
// 1. SPECIFIC ROUTES (MUST BE AT THE TOP)
// =========================================================================

// @route   GET /api/profile/details/:id
// @desc    Get a single profile by PROFILE ID (Used by Staff Review Page)
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
router.post('/upload', upload.single('file'), async (req: any, res: Response): Promise<void> => {
  try {
    // 🚨 UPDATED: Using facilityId instead of userId
    const { facilityId, docName } = req.body;
    if (!req.file) {
      res.status(400).json({ message: 'No file uploaded' });
      return;
    }

    const facilityObjectId = new mongoose.Types.ObjectId(facilityId as string);
    // 🚨 UPDATED: Find directly by the Facility ID
    const profile = await ClientProfile.findById(facilityObjectId);
    
    if (!profile) {
      res.status(404).json({ message: 'Facility not found' });
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

// @route   POST /api/profile/:facilityId/submit-documents
// @desc    Client confirms they are done uploading for a specific facility. Notifies staff.
router.post('/:facilityId/submit-documents', async (req: Request, res: Response): Promise<void> => {
  try {
    // 🚨 UPDATED: Target the specific facility using findByIdAndUpdate
    const profile = await ClientProfile.findByIdAndUpdate(
      req.params.facilityId,
      { 
          status: 'Documents Submitted',
          statusUpdatedAt: Date.now() 
      }, 
      { new: true }
    );

    if (!profile) {
      res.status(404).json({ message: "Facility not found" });
      return;
    }

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

// @route   PUT /api/profile/status/:id
// @desc    Update client status AND service type AND email client if approved
router.put('/status/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const { status, serviceType } = req.body; 

    const existingProfile = await ClientProfile.findById(req.params.id).populate('user', 'email name');
    if (!existingProfile) {
      res.status(404).json({ message: 'Profile not found' });
      return;
    }

    const updateData: any = { status };
    if (serviceType) updateData.serviceType = serviceType;
    
    if (existingProfile.status !== status) {
        updateData.statusUpdatedAt = Date.now();
    }

    const updatedProfile = await ClientProfile.findByIdAndUpdate(
      req.params.id, 
      updateData, 
      { new: true }
    ).populate('user', 'email name');

    const isNewlyApproved = (status === 'Awaiting Documents' || status === 'Ready for audit') && existingProfile.status !== status;

    if (isNewlyApproved && updatedProfile && updatedProfile.user) {
        const clientEmail = (updatedProfile.user as any).email;
        const clientName = updatedProfile.contactName || (updatedProfile.user as any).name || 'Valued Client';
        const assignedService = updatedProfile.serviceType || 'our assessment services';
        
        console.log(`✉️ Sending approval email to client: ${clientEmail}`);
        
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
    
    const profile = await ClientProfile.findByIdAndUpdate(
      req.params.id, 
      { 
          proposedAuditDates, 
          auditNotes,
          status: 'Ready for audit', 
          statusUpdatedAt: Date.now() 
      },
      { new: true }
    ).populate('user', 'email name');
    
    if (!profile) {
        res.status(404).json({ message: "Profile not found" });
        return;
    }

    if (profile.user) {
        const clientEmail = (profile.user as any).email;
        const clientName = profile.contactName || (profile.user as any).name || 'Valued Client';
        
        console.log(`✉️ Sending audit date proposal email to: ${clientEmail}`);
        
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
// @desc    Archive a specific facility
router.put('/:id/archive', async (req, res) => {
  try {
    // 🚨 UPDATED: Archive the specific facility using findByIdAndUpdate
    const profile = await ClientProfile.findByIdAndUpdate(
      req.params.id, 
      { isArchived: true },
      { new: true }
    );
    if (!profile) return res.status(404).json({ message: "Facility not found" });
    res.json({ message: "Facility archived successfully", profile });
  } catch (error) {
    console.error("Archive Error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// @route   PUT /api/profile/:id/unarchive
// @desc    Unarchive a specific facility
router.put('/:id/unarchive', async (req, res) => {
  try {
    // 🚨 UPDATED: Unarchive the specific facility using findByIdAndUpdate
    const profile = await ClientProfile.findByIdAndUpdate(
      req.params.id, 
      { isArchived: false },
      { new: true }
    );
    if (!profile) return res.status(404).json({ message: "Facility not found" });
    res.json({ message: "Facility restored successfully", profile });
  } catch (error) {
    console.error("Unarchive Error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// @route   PUT /api/profile/:id/confirm-schedule
// @desc    Client confirms their final audit date OR requests new dates
router.put('/:id/confirm-schedule', async (req: Request, res: Response): Promise<void> => {
  try {
    const { confirmedAuditDate, isRescheduling, alternativeDates } = req.body;
    
    // Default payload: what happens if they confirm normally
    let updatePayload: any = {
        confirmedAuditDate: confirmedAuditDate,
        status: 'Audit Scheduled', 
        statusUpdatedAt: Date.now() 
    };

    // 🚨 NEW: If they reject the dates, keep them in the "Ready for audit" column 
    // and overwrite the staff notes with their counter-proposal
    if (isRescheduling) {
        updatePayload.status = 'Ready for audit';
        updatePayload.auditNotes = `CLIENT REQUESTED NEW DATES: ${alternativeDates}`;
        updatePayload.confirmedAuditDate = ""; // Clear any old confirmed date
    }

    const profile = await ClientProfile.findByIdAndUpdate(
      req.params.id, 
      updatePayload,
      { new: true }
    );
    
    if (!profile) {
        res.status(404).json({ message: "Facility not found" });
        return;
    }

    const clientName = profile.contactName || 'A Client';
    const companyName = profile.companyName || 'Unknown Company';
    
    // We pass their counter-proposal text directly to the emailer as the "confirmedDate" string
    // so the staff email will literally say: "Client selected: Client requested new dates: Nov 5th"
    sendAuditDateSelectedEmail(companyName, clientName, confirmedAuditDate)
        .catch(err => console.error("❌ Date selection email failed:", err));
    
    res.json({ message: "Schedule updated successfully", profile });
  } catch (error) {
    console.error("Schedule Confirmation Error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// @route   PUT /api/profile/:id/staff-confirm-audit
// @desc    Staff officially confirms the client's selected audit date and emails client
router.put('/:id/staff-confirm-audit', async (req, res) => {
  try {
    const profile = await ClientProfile.findByIdAndUpdate(
      req.params.id, 
      { isAuditConfirmed: true },
      { new: true }
    ).populate('user', 'email name');
    
    if (!profile) {
        return res.status(404).json({ message: "Profile not found" });
    }
    
    const safeProfile = profile as any;
    
    if (safeProfile.user) {
        const clientEmail = safeProfile.user.email;
        const clientName = safeProfile.contactName || safeProfile.user.name || 'Valued Client';
        const confirmedDate = safeProfile.confirmedAuditDate || 'your scheduled date';
        
        console.log(`✉️ Sending official confirmation email to: ${clientEmail}`);
        
        sendAuditConfirmedEmail(clientEmail, clientName, confirmedDate)
            .catch(err => console.error("❌ Official confirmation email failed:", err));
    }

    res.json({ message: "Audit officially confirmed!", profile });
  } catch (error) {
    console.error("Confirmation Error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// @route   PUT /api/profile/:facilityId/remove-document
// @desc    Removes a specific document from the specific facility
router.put('/:facilityId/remove-document', async (req, res) => {
  try {
    const { path } = req.body; 
    
    // 🚨 UPDATED: Target the specific facility using findByIdAndUpdate
    const profile = await ClientProfile.findByIdAndUpdate(
      req.params.facilityId,
      { $pull: { documents: { path: path } } },
      { new: true }
    );

    if (!profile) return res.status(404).json({ message: "Facility not found" });

    res.json({ message: "Document removed successfully", profile });
  } catch (error) {
    console.error("Remove Document Error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// =========================================================================
// 2. GENERIC ROUTES (MUST BE AT THE BOTTOM)
// =========================================================================

// @route   GET /api/profile/user-facilities/:userId
// @desc    Get ALL facilities owned by a user (Returns an Array)
router.get('/user-facilities/:userId', async (req: Request, res: Response): Promise<void> => {
  try {
    const userIdString = req.params.userId as string;
    
    if (!mongoose.Types.ObjectId.isValid(userIdString)) {
        res.status(400).json({ message: 'Invalid User ID' });
        return;
    }

    const userId = new mongoose.Types.ObjectId(userIdString);
    const facilities = await ClientProfile.find({ user: userId as any }).sort({ createdAt: -1 });
    
    res.json(facilities);
  } catch (err) {
    console.error("Facilities Fetch Error:", err);
    res.status(500).send('Server Error');
  }
});

// @route   POST /api/profile/new-facility
// @desc    Strictly CREATE a new facility
router.post('/new-facility', async (req: Request, res: Response): Promise<void> => {
  const { userId, companyName, ...rest } = req.body;

  try {
    const userObjectId = new mongoose.Types.ObjectId(userId as string);
    
    const newProfile = new ClientProfile({ 
        user: userObjectId, 
        companyName: companyName,
        status: 'New Inquiry',
        ...rest 
    });

    await newProfile.save();
    res.status(201).json(newProfile);

  } catch (err) {
    console.error("Error creating new facility:", err);
    res.status(500).send('Server Error');
  }
});

// @route   PUT /api/profile/:id
// @desc    Update a SPECIFIC facility using its unique Profile _id
router.put('/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const facilityId = req.params.id; 
    const { userId, ...updateData } = req.body;

    const existingProfile = await ClientProfile.findById(facilityId);
    
    const isFirstTimeUpdate = !existingProfile || existingProfile.status === 'New Inquiry';

    const updatedProfile = await ClientProfile.findByIdAndUpdate(
      facilityId,
      { $set: updateData }, 
      { new: true } 
    );

    if (isFirstTimeUpdate && updatedProfile && userId) {
        const userAccount = await User.findById(userId);
        const clientEmail = userAccount ? userAccount.email : 'Unknown Email';
        const companyName = updatedProfile.companyName || 'New Client';
        
        sendNewInquiryEmail(clientEmail, companyName)
            .catch(err => console.error("❌ Email failed:", err));
    }

    res.json({ message: "Facility updated successfully", profile: updatedProfile });
  } catch (error) {
    console.error("Update Error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// @route   GET /api/profile/staff/:userId
// @desc    Get staff profile
router.get('/staff/:userId', async (req, res) => {
  try {
    const profile = await ClientProfile.findById(req.params.userId);
    res.json(profile);
  } catch (err) {
    res.status(500).json({ message: "Server error fetching staff profile" });
  }
});

// @route   PUT /api/profile/staff/:userId
// @desc    Update staff profile
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

// @route   DELETE /api/profile/:id 
// @desc    PERMANENTLY delete a client facility from the database
router.delete('/:id', async (req, res) => {
  try {
    const deletedClient = await ClientProfile.findByIdAndDelete(req.params.id); 
    
    if (!deletedClient) {
      return res.status(404).json({ message: 'Facility not found' });
    }

    res.json({ message: 'Facility permanently deleted' });
  } catch (err) {
    console.error("Error permanently deleting facility:", err);
    res.status(500).json({ message: "Server error deleting facility" });
  }
});

export default router;