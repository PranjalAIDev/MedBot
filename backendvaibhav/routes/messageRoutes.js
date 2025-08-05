// routes/messageRoutes.js
const express = require('express');
const { body, validationResult } = require('express-validator');
const Chat = require('../models/Chat');
const Patient = require('../models/Patient');
const Doctor = require('../models/Doctor');
const Appointment = require('../models/Appointment');
const auth = require('../middleware/auth');

const router = express.Router();

// Get all chats for a user (patient or doctor)
router.get('/chats', auth, async (req, res) => {
    try {
        const userId = req.user._id;
        const userType = req.userType;

        let query = {};
        if (userType === 'patient') {
            query.patient = userId;
        } else if (userType === 'doctor') {
            query.doctor = userId;
        }

        const chats = await Chat.find(query)
            .populate(userType === 'patient' ? 'doctor' : 'patient', 'name userId')
            .sort('-lastActivity');

        return res.status(200).json({ chats });
    } catch (err) {
        console.error('Get Chats Error:', err);
        return res.status(500).json({ error: 'Failed to get chats' });
    }
});

// Get a specific chat by ID
router.get('/chat/:chatId', auth, async (req, res) => {
    try {
        const { chatId } = req.params;
        const userId = req.user._id;
        const userType = req.userType;

        // Find the chat and make sure the user is a participant
        const chat = await Chat.findOne({
            _id: chatId,
            [userType === 'patient' ? 'patient' : 'doctor']: userId
        }).populate(userType === 'patient' ? 'doctor' : 'patient', 'name userId');

        if (!chat) {
            return res.status(404).json({ error: 'Chat not found' });
        }

        // Mark messages as read if the user is the recipient
        if (chat.messages.length > 0) {
            const senderType = userType === 'patient' ? 'Doctor' : 'Patient';

            // Mark all messages from the other party as read
            chat.messages.forEach(message => {
                if (message.senderType === senderType && !message.read) {
                    message.read = true;
                }
            });

            await chat.save();
        }

        return res.status(200).json({ chat });
    } catch (err) {
        console.error('Get Chat Error:', err);
        return res.status(500).json({ error: 'Failed to get chat' });
    }
});

// Send a message in a chat
router.post('/chat/:chatId/message',
    auth,
    [
        body('content').notEmpty().withMessage('Message content is required')
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        try {
            const { chatId } = req.params;
            const { content } = req.body;
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

            // Add the message to the chat
            chat.messages.push({
                sender: userId,
                senderType: userType === 'patient' ? 'Patient' : 'Doctor',
                content
            });

            // Update the last activity timestamp
            chat.lastActivity = Date.now();

            await chat.save();

            return res.status(201).json({
                message: 'Message sent successfully',
                chat
            });
        } catch (err) {
            console.error('Send Message Error:', err);
            return res.status(500).json({ error: 'Failed to send message' });
        }
    }
);

// Get patient records for a doctor during chat
router.get('/patient/:patientId/records', auth, async (req, res) => {
    try {
        if (req.userType !== 'doctor') {
            return res.status(403).json({ error: 'Only doctors can access patient records' });
        }

        const { patientId } = req.params;

        // Find the patient
        const patient = await Patient.findById(patientId);
        if (!patient) {
            return res.status(404).json({ error: 'Patient not found' });
        }

        // Return the patient's medical records
        const records = {
            medications: patient.medications || [],
            familyHistory: patient.familyHistory || []
        };

        return res.status(200).json({ records });
    } catch (err) {
        console.error('Get Patient Records Error:', err);
        return res.status(500).json({ error: 'Failed to get patient records' });
    }
});

// Delete a chat
router.delete('/chat/:chatId', auth, async (req, res) => {
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

        // Delete the chat
        await Chat.findByIdAndDelete(chatId);

        return res.status(200).json({ message: 'Chat deleted successfully' });
    } catch (err) {
        console.error('Delete Chat Error:', err);
        return res.status(500).json({ error: 'Failed to delete chat' });
    }
});

// Schedule an appointment from chat
router.post('/chat/:chatId/appointment',
    auth,
    [
        body('type').notEmpty().withMessage('Appointment type is required'),
        body('date').notEmpty().withMessage('Date is required'),
        body('time').notEmpty().withMessage('Time is required')
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        try {
            const { chatId } = req.params;
            const { type, date, time } = req.body;
            const userId = req.user._id;
            const userType = req.userType;

            // Find the chat and make sure the user is a participant
            const chat = await Chat.findOne({
                _id: chatId
            }).populate('patient doctor');

            if (!chat) {
                return res.status(404).json({ error: 'Chat not found' });
            }

            // Determine patient and doctor IDs
            let patientId, doctorId;
            if (userType === 'patient') {
                patientId = userId;
                doctorId = chat.doctor._id;
            } else {
                doctorId = userId;
                patientId = chat.patient._id;
            }

            // Create a new appointment
            const appointment = new Appointment({
                patient: patientId,
                doctor: doctorId,
                type,
                date: new Date(date),
                time,
                status: 'Scheduled'
            });

            await appointment.save();

            // Add a message to the chat about the appointment
            const appointmentMessage = {
                sender: userId,
                senderType: userType === 'patient' ? 'Patient' : 'Doctor',
                content: `Appointment scheduled for ${new Date(date).toLocaleDateString()} at ${time}`,
                appointmentId: appointment._id,
                messageType: 'appointment'
            };

            chat.messages.push(appointmentMessage);
            chat.lastActivity = Date.now();
            await chat.save();

            return res.status(201).json({
                message: 'Appointment scheduled successfully',
                appointment,
                chat
            });
        } catch (err) {
            console.error('Schedule Appointment Error:', err);
            return res.status(500).json({ error: 'Failed to schedule appointment: ' + err.message });
        }
    }
);

module.exports = router;
