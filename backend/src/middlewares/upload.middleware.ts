import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { config } from '../config';
import { AppError } from '../utils/errorHandler';

// Ensure upload directory exists
if (!fs.existsSync(config.upload.uploadDir)) {
  fs.mkdirSync(config.upload.uploadDir, { recursive: true });
}

// Configure storage
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, config.upload.uploadDir);
  },
  filename: (_req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    const nameWithoutExt = path.basename(file.originalname, ext);
    const sanitizedName = nameWithoutExt.replace(/[^a-zA-Z0-9]/g, '_');
    cb(null, `${sanitizedName}-${uniqueSuffix}${ext}`);
  },
});

// File filter
const fileFilter = (_req: Express.Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  if (config.upload.allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new AppError('Invalid file type. Allowed types: PDF, DOC, DOCX, XLS, XLSX, JPG, PNG', 400));
  }
};

export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: config.upload.maxFileSize,
  },
});
