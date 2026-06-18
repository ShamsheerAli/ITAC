import express, { Request, Response } from 'express';
import Lead from '../models/Lead';

const router = express.Router();

// @route   POST /api/leads
// @desc    Create a new potential client (lead)
router.post('/', async (req: Request, res: Response): Promise<void> => {
  try {
    const newLead = new Lead(req.body);
    const savedLead = await newLead.save();
    
    console.log("✅ New Lead Saved:", savedLead.companyName);
    res.status(201).json(savedLead);
  } catch (err) {
    console.error("Error saving lead:", err);
    res.status(500).json({ message: 'Server error saving lead' });
  }
});

// @route   GET /api/leads
// @desc    Get all potential clients
router.get('/', async (req: Request, res: Response): Promise<void> => {
  try {
    // Fetches all leads, sorting by the newest ones first
    const leads = await Lead.find({ isArchived: false }).sort({ createdAt: -1 });
    res.json(leads);
  } catch (err) {
    console.error("Error fetching leads:", err);
    res.status(500).json({ message: 'Server error fetching leads' });
  }
});


// @route   PUT /api/leads/:id/archive
// @desc    Archive a potential client (Soft Delete)
router.put('/:id/archive', async (req: Request, res: Response): Promise<void> => {
  try {
    const lead = await Lead.findByIdAndUpdate(
      req.params.id,
      { isArchived: true }, // Flips the hidden switch!
      { new: true }
    );

    if (!lead) {
      res.status(404).json({ message: 'Lead not found' });
      return;
    }

    res.json({ message: 'Lead archived successfully', lead });
  } catch (err) {
    console.error("Error archiving lead:", err);
    res.status(500).json({ message: 'Server error archiving lead' });
  }
});

export default router;