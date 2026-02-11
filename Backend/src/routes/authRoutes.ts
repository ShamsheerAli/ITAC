import express, { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import User from '../models/User';

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
export default router;