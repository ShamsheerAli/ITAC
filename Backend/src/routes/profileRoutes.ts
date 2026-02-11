import express, { Request, Response } from 'express';
import mongoose from 'mongoose';
import ClientProfile, { IClientProfile } from '../models/ClientProfile';

const router = express.Router();

// @route   GET /api/profile/:userId
// @desc    Get client profile by User ID
router.get('/:userId', async (req: Request, res: Response): Promise<void> => {
  try {
    // FIX 1: Cast params to string to satisfy TypeScript
    const userIdString = req.params.userId as string;
    const userId = new mongoose.Types.ObjectId(userIdString);

    // FIX 2: Cast the query filter as any to avoid strict type conflict
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
  const {
    userId,
    companyName, contactName, contactEmail, contactPhone,
    streetAddress, city, state, zipCode,
    buildingSize, utilityExpenses, energyConsumption, grossSales,
    sicCode, naics, description
  } = req.body;

  try {
    // FIX 3: Ensure userId is treated as string before conversion
    const userObjectId = new mongoose.Types.ObjectId(userId as string);

    // Build profile object
    const profileFields: any = { user: userObjectId };
    if (companyName) profileFields.companyName = companyName;
    if (contactName) profileFields.contactName = contactName;
    if (contactEmail) profileFields.contactEmail = contactEmail;
    if (contactPhone) profileFields.contactPhone = contactPhone;
    if (streetAddress) profileFields.streetAddress = streetAddress;
    if (city) profileFields.city = city;
    if (state) profileFields.state = state;
    if (zipCode) profileFields.zipCode = zipCode;
    if (buildingSize) profileFields.buildingSize = buildingSize;
    if (utilityExpenses) profileFields.utilityExpenses = utilityExpenses;
    if (energyConsumption) profileFields.energyConsumption = energyConsumption;
    if (grossSales) profileFields.grossSales = grossSales;
    if (sicCode) profileFields.sicCode = sicCode;
    if (naics) profileFields.naics = naics;
    if (description) profileFields.description = description;

    // FIX 4: Use 'as any' for the query to avoid filter type errors
    let profile = await ClientProfile.findOne({ user: userObjectId } as any);

    if (profile) {
      // Update existing
      profile = await ClientProfile.findOneAndUpdate(
        { user: userObjectId } as any,
        { $set: profileFields },
        { new: true }
      );
      res.json(profile);
      return;
    }

    // Create new
    profile = new ClientProfile(profileFields);
    await profile.save();
    res.json(profile);

  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});

export default router;