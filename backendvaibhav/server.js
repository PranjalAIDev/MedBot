const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");
require("dotenv").config(); // Load environment variables
const auth = require("./middleware/auth"); // Import auth middleware
const doctorRoutes = require("./routes/doctorRoutes");
const patientRoutes = require("./routes/patientRoutes");
const chatRoutes = require("./routes/chatRoutes");
const messageRoutes = require("./routes/messageRoutes");
const fileRoutes = require("./routes/fileRoutes");
const authRoutes = require("./routes/authRoutes");

const app = express();

app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5000;
const dburl = process.env.MONGO_URI || "mongodb+srv://yashbudhia:khuljas1ms1m@cluster0.nnafmtq.mongodb.net/medbook-users";

mongoose
  .connect(dburl, {})
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error(err));

// Simple test endpoint to check if server is running
app.get('/api/status', (req, res) => {
  res.status(200).json({ status: 'Server is running' });
});

// Routes
app.use("/api/doctor", doctorRoutes);
app.use("/api/patient", patientRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/files", fileRoutes);
app.use("/api/auth", authRoutes);

// Serve uploaded files statically
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Direct file access endpoint (no auth required)
app.get('/api/files/direct/:filename', (req, res) => {
  try {
    const { filename } = req.params;
    const filePath = path.join(__dirname, 'uploads', filename);

    console.log('Direct file access request:', filename);

    // Check if file exists
    const fs = require('fs');
    if (!fs.existsSync(filePath)) {
      console.log('File not found on disk:', filePath);
      return res.status(404).json({ error: 'File not found' });
    }

    // Determine content type based on file extension
    const mime = require('mime-types');
    const contentType = mime.lookup(filePath) || 'application/octet-stream';
    res.setHeader('Content-Type', contentType);

    console.log('Sending file directly:', filePath);

    // Send the file
    res.sendFile(filePath);
  } catch (err) {
    console.error('Direct File Access Error:', err);
    return res.status(500).json({ error: 'Failed to access file: ' + err.message });
  }
});

// Add a route to serve files directly by ID
app.get('/api/files/view/:fileId', auth, async (req, res) => {
  try {
    const { fileId } = req.params;
    const userId = req.user._id;
    const userType = req.userType;

    console.log('File view request:', {
      fileId,
      userId,
      userType
    });

    // Find the file
    const ChatFile = mongoose.model('ChatFile');
    const file = await ChatFile.findById(fileId);

    if (!file) {
      console.log('File not found:', fileId);
      return res.status(404).json({ error: 'File not found' });
    }

    console.log('Found file:', {
      id: file._id,
      originalName: file.originalName,
      filePath: file.filePath,
      fileType: file.fileType
    });

    // Find the chat and make sure the user is a participant
    const Chat = mongoose.model('Chat');
    const chat = await Chat.findOne({
      _id: file.chatId,
      [userType === 'patient' ? 'patient' : 'doctor']: userId
    });

    if (!chat) {
      console.log('User not authorized to access file');
      return res.status(403).json({ error: 'You do not have permission to access this file' });
    }

    // Check if file exists on disk
    const fs = require('fs');
    if (!fs.existsSync(file.filePath)) {
      console.log('File not found on disk:', file.filePath);
      return res.status(404).json({ error: 'File not found on disk' });
    }

    // Determine content type
    const contentType = file.fileType;
    res.setHeader('Content-Type', contentType);

    console.log('Sending file:', file.filePath);

    // Send the file
    res.sendFile(file.filePath);
  } catch (err) {
    console.error('File View Error:', err);
    return res.status(500).json({ error: 'Failed to view file: ' + err.message });
  }
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

// const dburl = "mongodb+srv://yashbudhia:khuljas1ms1m@cluster0.nnafmtq.mongodb.net/medbook-users";
//mongodb://localhost:27017/medbook