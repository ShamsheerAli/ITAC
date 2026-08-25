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
// @desc    Send an invitation email to the lead to create an account
router.post('/convert/:id', async (req, res) => {
  try {
    const lead = await Lead.findById(req.params.id);
    
    if (!lead) {
      return res.status(404).json({ message: 'Lead not found' });
    }
    if (!lead.contactEmail) {
      return res.status(400).json({ message: 'Lead has no email address' });
    }

    // Clean up the email string in case they entered multiple emails with semicolons
    const formattedEmails = lead.contactEmail.replace(/;/g, ',').replace(/\s+/g, '');

    // Configure Nodemailer (Ensure you have your SMTP setup here)
    const transporter = nodemailer.createTransport({
      service: 'gmail', // Or your specific provider
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });

    // The link to your signup page
    const signupLink = 'http://energyhub.okstate.edu/signup'; 

    await transporter.sendMail({
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
    await lead.save();

    res.json({ message: 'Invitation email sent successfully!' });

  } catch (err) {
    console.error("Error sending conversion email:", err);
    res.status(500).json({ message: 'Server error during conversion' });
  }
});


export default router;