import express, { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import User from '../models/User';
import crypto from 'crypto';
import nodemailer from 'nodemailer';

const router = express.Router();

// @route   POST /api/auth/register
// @desc    Register a new user
// @access  Public
router.post('/register', async (req: Request, res: Response): Promise<void> => {
  const { name, email, password, role } = req.body;

  try {
    // 1. Check if user already exists
    let user = await User.findOne({ email });
    if (user) {
      res.status(400).json({ message: 'User already exists' });
      return;
    }

    // 2. Encrypt the password (Hash it)
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // 3. Create the new user
    user = new User({
      name,
      email,
      passwordHash: hashedPassword,
      role: role || 'client', // Default to client if no role sent
    });

    await user.save();

    // 4. Respond with success
    res.status(201).json({ message: 'User registered successfully' });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/auth/login
// @desc    Authenticate user & get token
// @access  Public
// @route   POST /api/auth/login
router.post('/login', async (req: Request, res: Response): Promise<void> => {
  const { email, password } = req.body;

  console.log("👉 Login Attempt for:", email); // LOG 1

  try {
    // 1. Check if user exists
    const user = await User.findOne({ email });
    
    if (!user) {
      console.log("❌ User not found in DB"); // LOG 2
      res.status(400).json({ message: 'Invalid credentials' });
      return;
    }

    console.log("✅ User found:", user.email); // LOG 3
    console.log("🔑 Hashed Password in DB:", user.passwordHash); // LOG 4

    // 2. Check password
    const isMatch = await bcrypt.compare(password, user.passwordHash);
    
    if (!isMatch) {
      console.log("❌ Password did not match"); // LOG 5
      res.status(400).json({ message: 'Invalid credentials' });
      return;
    }

    console.log("✅ Login Successful!"); // LOG 6

    res.json({
      message: 'Login successful',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      }
    });

  } catch (err) {
    console.error("Server Error:", err);
    res.status(500).json({ message: 'Server error' });
  }
});


// @route   POST /api/auth/forgot-password
// @desc    Generate token and send reset email
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: 'There is no user with that email address.' });
    }

    // 1. Generate a random reset token
    const resetToken = crypto.randomBytes(32).toString('hex');

    // 2. Hash it and save it to the database (expires in 1 hour)
    user.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    user.resetPasswordExpire = new Date(Date.now() + 60 * 60 * 1000); 
    await user.save();

    // 3. Create the reset URL (pointing to your frontend)
    // IMPORTANT: Change this URL to your live frontend URL when deploying!
    const resetUrl = `${req.protocol}://${req.get('host')?.replace('5000', '5173')}/reset-password/${resetToken}`;

    // 4. Configure Nodemailer (Replace with your actual email credentials)
    const transporter = nodemailer.createTransport({
      service: 'Gmail', // or your preferred email service
      auth: {
        user: process.env.EMAIL_USER, // e.g., 'your-email@gmail.com'
        pass: process.env.EMAIL_PASS, // Use an App Password if using Gmail!
      },
    });

    // 5. Send the email
    const message = `
      <h1>You have requested a password reset</h1>
      <p>Please go to this link to reset your password:</p>
      <a href=${resetUrl} clicktracking=off>${resetUrl}</a>
    `;

    await transporter.sendMail({
      to: user.email,
      subject: 'Password Reset Request',
      html: message,
    });

    res.status(200).json({ message: 'Email sent successfully' });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Email could not be sent' });
  }
});

// @route   PUT /api/auth/reset-password/:token
// @desc    Verify token and save new password
router.put('/reset-password/:token', async (req, res) => {
  try {
    // 1. Hash the token from the URL to match what's in the database
    const hashedToken = crypto.createHash('sha256').update(req.params.token).digest('hex');

    // 2. Find the user by token AND check if it has expired
    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpire: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ message: 'Token is invalid or has expired' });
    }

    // 3. Hash the new password
    const salt = await bcrypt.genSalt(10);
    user.passwordHash = await bcrypt.hash(req.body.password, salt);

    // 4. Clear the reset token fields
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save();

    res.status(200).json({ message: 'Password reset successful!' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error during password reset' });
  }
});


export default router;