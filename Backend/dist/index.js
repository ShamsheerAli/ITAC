"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const path_1 = __importDefault(require("path"));
const dotenv_1 = __importDefault(require("dotenv"));
const mongoose_1 = __importDefault(require("mongoose"));
const authRoutes_1 = __importDefault(require("./routes/authRoutes"));
const profileRoutes_1 = __importDefault(require("./routes/profileRoutes"));
const messageRoutes_1 = __importDefault(require("./routes/messageRoutes"));
const leadRoutes_1 = __importDefault(require("./routes/leadRoutes"));
// Load environment variables
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || "";
// 🚨 UPDATED: Robust CORS Configuration 
// This explicitly tells the browser to trust your frontend URLs
app.use((0, cors_1.default)({
    origin: [
        'http://energyhub.okstate.edu',
        'https://energyhub.okstate.edu',
        'http://localhost:5173', // Include this if you ever test locally
        'http://localhost:3000',
        'https://didactic-space-winner-jpxjjrrpg93pvwj-5173.app.github.dev'
    ],
    credentials: true, // Crucial for login tokens and sessions!
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']
}));
app.use(express_1.default.json()); // Parse JSON bodies
// Serve the 'uploads' folder publicly so the frontend can download files
app.use('/uploads', express_1.default.static(path_1.default.join(__dirname, '../uploads')));
mongoose_1.default.connect(MONGO_URI)
    .then(() => console.log("✅ MongoDB Connected Successfully"))
    .catch((err) => console.error("❌ MongoDB Connection Error:", err));
// Routes
app.use('/api/auth', authRoutes_1.default);
app.use('/api/profile', profileRoutes_1.default);
app.use('/api/messages', messageRoutes_1.default);
app.use('/api/leads', leadRoutes_1.default);
// Add these near your other app.use() middleware
app.use('/uploads', express_1.default.static('uploads'));
app.use('/api/uploads', express_1.default.static('uploads'));
// 1. Test Route
app.get('/', (req, res) => {
    res.send('ITAC Staff Portal API is Running & DB Connected!');
});
// Start Server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
