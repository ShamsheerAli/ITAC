import multer from 'multer';
import path from 'path';

// Set storage engine
const storage = multer.diskStorage({
  destination: './uploads/',
  filename: function (req, file, cb) {
    cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
  },
});

// Check file type
function checkFileType(file: Express.Multer.File, cb: multer.FileFilterCallback) {
  // Allowed extensions (Added xls, xlsx, csv)
  const extRegex = /jpeg|jpg|png|pdf|doc|docx|xls|xlsx|csv/;
  const extname = extRegex.test(path.extname(file.originalname).toLowerCase());
  
  // Check mime type (Added the specific keywords that Excel and Word use behind the scenes)
  const mimeRegex = /jpeg|jpg|png|pdf|msword|wordprocessingml|ms-excel|spreadsheetml|csv/;
  const mimetype = mimeRegex.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error('Error: Images, PDFs, Docs, and Spreadsheets Only!'));
  }
}

// Init upload
export const upload = multer({
  storage: storage,
  limits: { fileSize: 10000000 }, // 10MB limit
  fileFilter: function (req, file, cb) {
    checkFileType(file, cb);
  },
});