import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors()); // Allow frontend requests
app.use(express.json()); // Parse JSON bodies

// 1. Test Route
app.get('/', (req: Request, res: Response) => {
  res.send('ITAC Staff Portal API is Running!');
});

// 2. Mock API Route (We will replace this later with a Database)
app.get('/api/test', (req: Request, res: Response) => {
  res.json({ message: "Hello from the Backend!", status: "Success" });
});

// Start Server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});