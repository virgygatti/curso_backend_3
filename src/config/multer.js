const multer = require('multer');
const path = require('path');
const fs = require('fs');

const UPLOADS_DIR = path.join(process.cwd(), 'uploads');
const DOCUMENTS_DIR = path.join(UPLOADS_DIR, 'documents');
const PRODUCTS_DIR = path.join(UPLOADS_DIR, 'products');

[UPLOADS_DIR, DOCUMENTS_DIR, PRODUCTS_DIR].forEach((dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

const storageDocuments = multer.diskStorage({
  destination: (req, file, cb) => cb(null, DOCUMENTS_DIR),
  filename: (req, file, cb) => {
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const ext = path.extname(file.originalname) || '';
    cb(null, `${unique}${ext}`);
  }
});

const storageProducts = multer.diskStorage({
  destination: (req, file, cb) => cb(null, PRODUCTS_DIR),
  filename: (req, file, cb) => {
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const ext = path.extname(file.originalname) || '';
    cb(null, `${unique}${ext}`);
  }
});

const uploadDocuments = multer({
  storage: storageDocuments,
  limits: { fileSize: 5 * 1024 * 1024 }
});

const uploadProducts = multer({
  storage: storageProducts,
  limits: { fileSize: 5 * 1024 * 1024 }
});

module.exports = {
  uploadDocuments,
  uploadProducts,
  DOCUMENTS_DIR,
  PRODUCTS_DIR
};
