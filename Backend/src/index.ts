import 'dotenv/config';
import express, { Request, Response } from 'express';
import cors from 'cors';
import path from 'path';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import authRoutes from './routes/authRoutes';
import profileRoutes from './routes/profileRoutes';
import messageRoutes from './routes/messageRoutes';
import leadRoutes from './routes/leadRoutes';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || "";

// 🚨 UPDATED: Robust CORS Configuration 
// This explicitly tells the browser to trust your frontend URLs
app.use(cors({
    origin: [
        'http://energyhub.okstate.edu', 
        'https://energyhub.okstate.edu',
        'http://localhost:5173', // Include this if you ever test locally
        'http://localhost:3000'
    ],
    credentials: true, // Crucial for login tokens and sessions!
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']
}));

app.use(express.json()); // Parse JSON bodies

// Serve the 'uploads' folder publicly so the frontend can download files
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

mongoose.connect(MONGO_URI)
  .then(() => console.log("✅ MongoDB Connected Successfully"))
  .catch((err) => console.error("❌ MongoDB Connection Error:", err));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/leads', leadRoutes);

// 1. Test Route
app.get('/', (req: Request, res: Response) => {
  res.send('ITAC Staff Portal API is Running & DB Connected!');
});

// Start Server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});