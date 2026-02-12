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