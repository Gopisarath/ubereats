// Fix for uploads directory - update the upload.js middleware file

const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure upload directory exists with proper permissions
const uploadDir = path.join(__dirname, '../uploads');
console.log('Upload directory path:', uploadDir);

if (!fs.existsSync(uploadDir)) {
  console.log('Creating uploads directory...');
  try {
    fs.mkdirSync(uploadDir, { recursive: true, mode: 0o755 });
    console.log('Uploads directory created successfully');
  } catch (err) {
    console.error('Error creating uploads directory:', err);
  }
}

// Configure storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Verify upload directory is accessible
    try {
      fs.accessSync(uploadDir, fs.constants.W_OK);
      cb(null, uploadDir);
    } catch (err) {
      console.error('Upload directory is not writable:', err);
      cb(new Error('Upload directory is not writable'));
    }
  },
  filename: (req, file, cb) => {
    // Create a unique filename
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    // Get file extension from original filename
    const ext = path.extname(file.originalname);
    // Create final filename
    const filename = file.fieldname + '-' + uniqueSuffix + ext;
    console.log(`Generated filename: ${filename} for original: ${file.originalname}`);
    cb(null, filename);
  }
});

// Improved file filter
const fileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
  
  if (allowedTypes.includes(file.mimetype)) {
    console.log(`Accepted file: ${file.originalname} (${file.mimetype})`);
    cb(null, true);
  } else {
    console.error(`Rejected file: ${file.originalname} (${file.mimetype})`);
    cb(new Error(`Invalid file type. Only JPEG, PNG, GIF and WebP are allowed. You uploaded: ${file.mimetype}`), false);
  }
};

// Create upload middleware with better error handling
const upload = multer({ 
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB
  }
});

// Add static file serving in your server.js file:
// app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

module.exports = upload;