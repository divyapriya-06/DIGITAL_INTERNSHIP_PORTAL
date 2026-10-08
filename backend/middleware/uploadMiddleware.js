import multer from 'multer';
import path from 'path';
import fs from 'fs';

// Ensure upload directories exist
const resumesDir = path.join(process.cwd(), 'uploads', 'resumes');
const proofsDir = path.join(process.cwd(), 'uploads', 'proofs');

if (!fs.existsSync(resumesDir)) {
  fs.mkdirSync(resumesDir, { recursive: true });
}
if (!fs.existsSync(proofsDir)) {
  fs.mkdirSync(proofsDir, { recursive: true });
}

// Resume storage
const resumeStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, resumesDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `resume-${req.user ? req.user._id : 'guest'}-${uniqueSuffix}${ext}`);
  }
});

// Resume filter
const resumeFileFilter = (req, file, cb) => {
  const allowedExtensions = ['.pdf', '.docx', '.doc'];
  const ext = path.extname(file.originalname).toLowerCase();
  
  if (allowedExtensions.includes(ext)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only PDF and DOCX documents are allowed for resume upload.'), false);
  }
};

export const uploadResume = multer({
  storage: resumeStorage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
  fileFilter: resumeFileFilter,
});

// Verification Proof storage
const proofStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, proofsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `proof-${req.user ? req.user._id : 'company'}-${uniqueSuffix}${ext}`);
  }
});

// Proof filter
const proofFileFilter = (req, file, cb) => {
  const allowedExtensions = ['.pdf', '.jpg', '.jpeg', '.png', '.docx'];
  const ext = path.extname(file.originalname).toLowerCase();

  if (allowedExtensions.includes(ext)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only PDF, JPG, PNG and DOCX documents are allowed for verification proof.'), false);
  }
};

export const uploadProof = multer({
  storage: proofStorage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB
  fileFilter: proofFileFilter,
});
