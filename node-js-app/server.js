const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

// Enable CORS for development
app.use(cors());
app.use(express.json());

// Create uploads directory if it doesn't exist
const UPLOAD_DIR = path.join(__dirname, 'uploads');
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, UPLOAD_DIR);
  },
  filename: function (req, file, cb) {
    // Use fixed filenames to always overwrite the latest
    const fileType = req.path.includes('consumption') ? 'consumption' : 'price';
    const ext = path.extname(file.originalname);
    cb(null, `${fileType}_latest${ext}`);
  }
});

const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 50 * 1024 * 1024 // 50MB limit
  }
});

// Serve static files (the web app)
app.use(express.static(__dirname));

// API endpoint to upload consumption file
app.post('/api/upload/consumption', upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, error: 'No file uploaded' });
  }
  
  console.log('Consumption file uploaded:', req.file.filename);
  res.json({ 
    success: true, 
    filename: req.file.originalname,
    savedAs: req.file.filename
  });
});

// API endpoint to upload price file
app.post('/api/upload/price', upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, error: 'No file uploaded' });
  }
  
  console.log('Price file uploaded:', req.file.filename);
  res.json({ 
    success: true, 
    filename: req.file.originalname,
    savedAs: req.file.filename
  });
});

// API endpoint to check if files exist
app.get('/api/files', (req, res) => {
  const files = fs.readdirSync(UPLOAD_DIR);
  
  const consumptionFile = files.find(f => f.startsWith('consumption_latest'));
  const priceFile = files.find(f => f.startsWith('price_latest'));
  
  if (!consumptionFile || !priceFile) {
    return res.json({ success: false, message: 'No saved files found' });
  }
  
  // Get file stats
  const consumptionStats = fs.statSync(path.join(UPLOAD_DIR, consumptionFile));
  const priceStats = fs.statSync(path.join(UPLOAD_DIR, priceFile));
  
  res.json({
    success: true,
    consumption: {
      filename: consumptionFile,
      size: consumptionStats.size,
      modified: consumptionStats.mtime
    },
    price: {
      filename: priceFile,
      size: priceStats.size,
      modified: priceStats.mtime
    }
  });
});

// API endpoint to download consumption file
app.get('/api/download/consumption', (req, res) => {
  const files = fs.readdirSync(UPLOAD_DIR);
  const consumptionFile = files.find(f => f.startsWith('consumption_latest'));
  
  if (!consumptionFile) {
    return res.status(404).json({ success: false, error: 'No consumption file found' });
  }
  
  const filePath = path.join(UPLOAD_DIR, consumptionFile);
  res.sendFile(filePath);
});

// API endpoint to download price file
app.get('/api/download/price', (req, res) => {
  const files = fs.readdirSync(UPLOAD_DIR);
  const priceFile = files.find(f => f.startsWith('price_latest'));
  
  if (!priceFile) {
    return res.status(404).json({ success: false, error: 'No price file found' });
  }
  
  const filePath = path.join(UPLOAD_DIR, priceFile);
  res.sendFile(filePath);
});

// API endpoint to clear all saved files
app.post('/api/clear', (req, res) => {
  try {
    const files = fs.readdirSync(UPLOAD_DIR);
    
    files.forEach(file => {
      fs.unlinkSync(path.join(UPLOAD_DIR, file));
    });
    
    console.log('All saved files cleared');
    res.json({ success: true, message: 'All files deleted' });
  } catch (error) {
    console.error('Error clearing files:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`
╔═══════════════════════════════════════════════════════════╗
║   ⚡ Power Consumption Analysis Server                    ║
║                                                           ║
║   Server running on: http://localhost:${PORT}              ║
║   Upload directory: ${UPLOAD_DIR}                        ║
║                                                           ║
║   API Endpoints:                                          ║
║   - POST /api/upload/consumption                          ║
║   - POST /api/upload/price                                ║
║   - GET  /api/files                                       ║
║   - GET  /api/download/consumption                        ║
║   - GET  /api/download/price                              ║
║   - POST /api/clear                                       ║
║   - GET  /api/health                                      ║
╚═══════════════════════════════════════════════════════════╝
  `);
  
  console.log('Ready to accept file uploads!\n');
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\nShutting down server...');
  process.exit(0);
});
