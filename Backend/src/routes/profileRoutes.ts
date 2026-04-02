import express, { Request, Response } from 'express';
import mongoose from 'mongoose';
import ClientProfile from '../models/ClientProfile';
import { upload } from '../middleware/uploadMiddleware'; // Ensure this path is correct

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

// @route   PUT /api/profile/status/:id
// @desc    Update client status AND service type
router.put('/status/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    // Destructure status and serviceType from body
    const { status, serviceType } = req.body; 

    // Create update object dynamically
    const updateData: any = { status };
    if (serviceType) updateData.serviceType = serviceType; // Only update if provided

    const profile = await ClientProfile.findByIdAndUpdate(
      req.params.id, 
      updateData, // Use the dynamic object
      { new: true }
    );

    if (!profile) {
      res.status(404).json({ message: 'Profile not found' });
      return;
    }
    res.json(profile);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});
// @route   PUT /api/profile/:id/schedule
// @desc    Save proposed audit dates and notes
router.put('/:id/schedule', async (req, res) => {
  try {
    const { proposedAuditDates, auditNotes } = req.body;
    
    // Find the profile by its ID and update the dates/notes. 
    // We also automatically move them to the "Audit Scheduled" column!
    const profile = await ClientProfile.findByIdAndUpdate(
      req.params.id, 
      { 
          proposedAuditDates, 
          auditNotes,
      },
      { new: true }
    );
    
    if (!profile) {
        return res.status(404).json({ message: "Profile not found" });
    }
    
    res.json({ message: "Schedule updated successfully", profile });
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
// @desc    Client confirms their final audit date
router.put('/:userId/confirm-schedule', async (req, res) => {
  try {
    const { confirmedAuditDate } = req.body;
    
    // Find the profile by the USER ID (because the client frontend uses the User ID)
    const profile = await ClientProfile.findOneAndUpdate(
      { user: req.params.userId }, 
      { 
          confirmedAuditDate,
          status: 'Audit Scheduled' // Automatically move them on the Kanban board!
      },
      { new: true }
    );
    
    if (!profile) {
        return res.status(404).json({ message: "Profile not found" });
    }
    
    res.json({ message: "Audit scheduled successfully", profile });
  } catch (error) {
    console.error("Schedule Confirmation Error:", error);
    res.status(500).json({ message: "Server error" });
  }
});
// @route   PUT /api/profile/:id/staff-confirm-audit
// @desc    Staff officially confirms the client's selected audit date
router.put('/:id/staff-confirm-audit', async (req, res) => {
  try {
    const profile = await ClientProfile.findByIdAndUpdate(
      req.params.id, 
      { isAuditConfirmed: true },
      { new: true }
    );
    
    if (!profile) return res.status(404).json({ message: "Profile not found" });
    
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

export default router;