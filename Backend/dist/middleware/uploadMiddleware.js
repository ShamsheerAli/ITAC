"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.upload = void 0;
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
// Set storage engine
const storage = multer_1.default.diskStorage({
    destination: './uploads/',
    filename: function (req, file, cb) {
        cb(null, file.fieldname + '-' + Date.now() + path_1.default.extname(file.originalname));
    },
});
// Check file type
function checkFileType(file, cb) {
    // Allowed extensions (Added xls, xlsx, csv)
    const extRegex = /jpeg|jpg|png|pdf|doc|docx|xls|xlsx|csv/;
    const extname = extRegex.test(path_1.default.extname(file.originalname).toLowerCase());
    // Check mime type (Added the specific keywords that Excel and Word use behind the scenes)
    const mimeRegex = /jpeg|jpg|png|pdf|msword|wordprocessingml|ms-excel|spreadsheetml|csv/;
    const mimetype = mimeRegex.test(file.mimetype);
    if (mimetype && extname) {
        return cb(null, true);
    }
    else {
        cb(new Error('Error: Images, PDFs, Docs, and Spreadsheets Only!'));
    }
}
// Init upload
exports.upload = (0, multer_1.default)({
    storage: storage,
    limits: { fileSize: 10000000 }, // 10MB limit
    fileFilter: function (req, file, cb) {
        checkFileType(file, cb);
    },
});
