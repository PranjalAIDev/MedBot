// models/Chat.js
const mongoose = require('mongoose');

// Define the schema for a chat message
const MessageSchema = new mongoose.Schema({
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
    content: {
        type: String,
        required: true
    },
    read: {
        type: Boolean,
        default: false
    },
    fileId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'ChatFile'
    },
    fileUrl: {
        type: String
    },
    isImage: {
        type: Boolean,
        default: false
    },
    appointmentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Appointment'
    },
    messageType: {
        type: String,
        enum: ['text', 'file', 'appointment'],
        default: 'text'
    }
}, { timestamps: true });

// Define the schema for a chat conversation
const ChatSchema = new mongoose.Schema({
    patient: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Patient',
        required: true
    },
    doctor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Doctor',
        required: true
    },
    messages: [MessageSchema],
    status: {
        type: String,
        enum: ['active', 'closed'],
        default: 'active'
    },
    lastActivity: {
        type: Date,
        default: Date.now
    }
}, { timestamps: true });

module.exports = mongoose.model('Chat', ChatSchema);
