import express, { Request, Response } from 'express';
import Lead from '../models/Lead';
import nodemailer from 'nodemailer';

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

// @route   PUT /api/leads/:id
// @desc    Update a potential client's data
router.put('/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const updatedLead = await Lead.findByIdAndUpdate(
      req.params.id,
      { $set: req.body }, // Updates only the fields that were sent
      { new: true } // Returns the newly updated document
    );

    if (!updatedLead) {
      res.status(404).json({ message: 'Lead not found' });
      return;
    }

    res.json(updatedLead);
  } catch (err) {
    console.error("Error updating lead:", err);
    res.status(500).json({ message: 'Server error updating lead' });
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

// @route   POST /api/leads/convert/:id
// @desc    Send invitation email and archive the lead
router.post('/convert/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const lead = await Lead.findById(req.params.id);
    
    if (!lead) {
      res.status(404).json({ message: 'Lead not found' });
      return;
    }

    if (!lead.contactEmail) {
      res.status(400).json({ message: 'Lead has no email address' });
      return;
    }

    // 1. SETUP EMAIL TRANSPORTER (Update with your actual SMTP credentials)
    // If you are using Gmail, Outlook, or OSU's internal SMTP, plug it in here
    const transporter = nodemailer.createTransport({
      service: 'gmail', 
      auth: {
        user: "doeosuitac@gmail.com",
        pass: "unmfksjvznjcrvpd",
      },
    });

    // 2. SEND THE EMAIL
    await transporter.sendMail({
      from: '"OSU ITAC Portal" <noreply@energyhub.okstate.edu>',
      to: lead.contactEmail,
      subject: "Invitation to OSU ITAC Services",
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
            <h2 style="color: #FE5C00;">Hello ${lead.contactName || lead.companyName},</h2>
            <p>You have been selected to proceed with the Oklahoma State University ITAC energy assessment process!</p>
            <p>To get started, please create your official portal account. Once logged in, you will be able to securely upload your utility documents and track your assessment progress.</p>
            
            <div style="text-align: center; margin: 30px 0;">
                <a href="https://energyhub.okstate.edu/signup" style="background-color: #FE5C00; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold; font-size: 16px;">
                    Create Your Account
                </a>
            </div>
            
            <p style="color: #666; font-size: 12px;">If you have any questions, please reply to this email.</p>
        </div>
      `,
    });

    // 3. ARCHIVE THE LEAD SO IT LEAVES THE TABLE
    lead.isArchived = true;
    await lead.save();

    res.json({ message: 'Invitation email sent successfully!' });

  } catch (err) {
    console.error("Error sending conversion email:", err);
    res.status(500).json({ message: 'Server error during conversion' });
  }
});


export default router;