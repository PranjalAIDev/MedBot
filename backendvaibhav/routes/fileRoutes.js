// routes/fileRoutes.js
const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const mongoose = require('mongoose');
const auth = require('../middleware/auth');
const Chat = require('../models/Chat');

const router = express.Router();

// Configure storage
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const uploadDir = path.join(__dirname, '../uploads');
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + '-' + file.originalname);
    }
});

// File filter
const fileFilter = (req, file, cb) => {
    // Accept images, PDFs, and common document formats
    const allowedFileTypes = [
        'image/jpeg',
        'image/png',
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'text/plain'
    ];

    if (allowedFileTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Unsupported file type. Only images, PDFs, and documents are allowed.'), false);
    }
};

// Configure upload
const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 10 * 1024 * 1024 // 10MB limit
    }
});

// Define the ChatFile schema
const ChatFileSchema = new mongoose.Schema({
    chatId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Chat',
        required: true
    },
    sender: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        refPath: 'senderType'
    },
    senderType: {
        type: String,
        required: true,
        enum: ['Patient', 'Doctor']
    },
    originalName: {
        type: String,
        required: true
    },
    fileName: {
        type: String,
        required: true
    },
    fileType: {
        type: String,
        required: true
    },
    fileSize: {
        type: Number,
        required: true
    },
    filePath: {
        type: String,
        required: true
    }
}, { timestamps: true });

const ChatFile = mongoose.model('ChatFile', ChatFileSchema);

// Upload a file to a chat
router.post('/chat/:chatId/upload', auth, upload.single('file'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        const { chatId } = req.params;
        const userId = req.user._id;
        const userType = req.userType;

        // Find the chat and make sure the user is a participant
        const chat = await Chat.findOne({
            _id: chatId,
            [userType === 'patient' ? 'patient' : 'doctor']: userId
        });

        if (!chat) {
            // Delete the uploaded file if chat not found
            fs.unlinkSync(req.file.path);
            return res.status(404).json({ error: 'Chat not found' });
        }

        // Create a new chat file record
        const chatFile = new ChatFile({
            chatId,
            sender: userId,
            senderType: userType === 'patient' ? 'Patient' : 'Doctor',
            originalName: req.file.originalname,
            fileName: req.file.filename,
            fileType: req.file.mimetype,
            fileSize: req.file.size,
            filePath: req.file.path
        });

        await chatFile.save();

        // Determine if the file is an image
        const isImage = req.file.mimetype.startsWith('image/');

        // Create a public URL for the file
        const fileUrl = `/uploads/${req.file.filename}`;
        console.log('File URL created:', fileUrl);

        // Add a message to the chat about the file
        const newMessage = {
            sender: userId,
            senderType: userType === 'patient' ? 'Patient' : 'Doctor',
            content: `Shared a file: ${req.file.originalname}`,
            fileId: chatFile._id,
            messageType: 'file', // Explicitly set message type
            fileUrl: fileUrl,
            isImage: isImage
        };

        // Ensure the message type is set correctly
        if (!newMessage.messageType) {
            newMessage.messageType = 'file';
        }

        console.log('Adding file message to chat:', newMessage);
        chat.messages.push(newMessage);

        // Update the last activity timestamp
        chat.lastActivity = Date.now();
        await chat.save();

        // Get the last message (the one we just added)
        const lastMessage = chat.messages[chat.messages.length - 1];

        return res.status(201).json({
            message: 'File uploaded successfully',
            file: {
                id: chatFile._id,
                originalName: chatFile.originalName,
                fileType: chatFile.fileType,
                fileSize: chatFile.fileSize,
                fileUrl: fileUrl,
                isImage: isImage
            },
            lastMessage: lastMessage,
            chat
        });
    } catch (err) {
        console.error('File Upload Error:', err);
        // Delete the uploaded file if there was an error
        if (req.file) {
            fs.unlinkSync(req.file.path);
        }
        return res.status(500).json({ error: 'Failed to upload file: ' + err.message });
    }
});

// Get all files for a chat
router.get('/chat/:chatId/files', auth, async (req, res) => {
    try {
        const { chatId } = req.params;
        const userId = req.user._id;
        const userType = req.userType;

        // Find the chat and make sure the user is a participant
        const chat = await Chat.findOne({
            _id: chatId,
            [userType === 'patient' ? 'patient' : 'doctor']: userId
        });

        if (!chat) {
            return res.status(404).json({ error: 'Chat not found' });
        }

        // Find all files for this chat
        const files = await ChatFile.find({ chatId })
            .sort('-createdAt');

        return res.status(200).json({ files });
    } catch (err) {
        console.error('Get Chat Files Error:', err);
        return res.status(500).json({ error: 'Failed to get chat files' });
    }
});

// Download a file
router.get('/file/:fileId', auth, async (req, res) => {
    try {
        const { fileId } = req.params;
        const userId = req.user._id;
        const userType = req.userType;

        // Find the file
        const file = await ChatFile.findById(fileId);
        if (!file) {
            return res.status(404).json({ error: 'File not found' });
        }

        // Find the chat and make sure the user is a participant
        const chat = await Chat.findOne({
            _id: file.chatId,
            [userType === 'patient' ? 'patient' : 'doctor']: userId
        });

        if (!chat) {
            return res.status(403).json({ error: 'You do not have permission to access this file' });
        }

        // Send the file
        res.download(file.filePath, file.originalName);
    } catch (err) {
        console.error('File Download Error:', err);
        return res.status(500).json({ error: 'Failed to download file' });
    }
});

module.exports = router;
