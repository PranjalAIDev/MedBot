// routes/chatRoutes.js
const express = require('express');
const { body, validationResult } = require('express-validator');
const Doctor = require('../models/Doctor');
const Patient = require('../models/Patient');
const Chat = require('../models/Chat');
const ChatRequest = require('../models/ChatRequest');
const auth = require('../middleware/auth');

const router = express.Router();

// Test endpoint to check authentication
router.get('/auth-test', auth, async (req, res) => {
    try {
        return res.status(200).json({
            message: 'Authentication successful',
            userType: req.userType,
            userId: req.user._id,
            userName: req.user.name
        });
    } catch (err) {
        console.error('Auth Test Error:', err);
        return res.status(500).json({ error: 'Authentication test failed' });
    }
});

// Search for doctors
router.get('/doctors/search', auth, async (req, res) => {
    try {
        if (req.userType !== 'patient') {
            return res.status(403).json({ error: 'Only patients can search for doctors' });
        }

        const { specialty, location, showAll } = req.query;

        // Build the query
        const query = {};

        // Filter by specialty if provided and not showing all
        if (specialty && showAll !== 'true') {
            query.specialty = specialty;
        }

        // Filter by location if provided
        if (location) {
            query['location.city'] = { $regex: location, $options: 'i' };
        }

        // Only show doctors available for chat
        query.isAvailableForChat = true;

        // Find doctors matching the criteria
        const doctors = await Doctor.find(query)
            .select('name userId specialty location isAvailableForChat')
            .sort('name');

        return res.status(200).json({ doctors });
    } catch (err) {
        console.error('Doctor Search Error:', err);
        return res.status(500).json({ error: 'Failed to search for doctors' });
    }
});

// Send a chat request to a doctor
router.post('/request',
    auth,
    [
        body('doctorId').notEmpty().withMessage('Doctor ID is required'),
        body('message').notEmpty().withMessage('Message is required')
    ],
    async (req, res) => {
        console.log('Received chat request:', {
            body: req.body,
            userType: req.userType,
            userId: req.user ? req.user._id : 'undefined'
        });

        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            console.log('Validation errors:', errors.array());
            return res.status(400).json({ errors: errors.array() });
        }

        try {
            if (req.userType !== 'patient') {
                console.log('User type is not patient:', req.userType);
                return res.status(403).json({ error: 'Only patients can send chat requests' });
            }

            const { doctorId, message } = req.body;
            const patientId = req.user._id;

            console.log('Processing chat request:', {
                doctorId,
                patientId,
                messageLength: message ? message.length : 0
            });

            // Check if the doctor exists
            const doctor = await Doctor.findById(doctorId);
            if (!doctor) {
                console.log('Doctor not found with ID:', doctorId);
                return res.status(404).json({ error: 'Doctor not found' });
            }

            console.log('Found doctor:', {
                doctorName: doctor.name,
                doctorId: doctor._id,
                isAvailableForChat: doctor.isAvailableForChat
            });

            // Check if the doctor is available for chat
            if (!doctor.isAvailableForChat) {
                console.log('Doctor is not available for chat:', doctor.name);
                return res.status(400).json({ error: 'This doctor is not available for chat at the moment' });
            }

            // Check if there's already a pending request
            const existingRequest = await ChatRequest.findOne({
                patient: patientId,
                doctor: doctorId,
                status: 'pending'
            });

            if (existingRequest) {
                console.log('Found existing request:', existingRequest._id);
                return res.status(400).json({ error: 'You already have a pending request with this doctor' });
            }

            // Create a new chat request
            const chatRequest = new ChatRequest({
                patient: patientId,
                doctor: doctorId,
                message
            });

            await chatRequest.save();
            console.log('Chat request saved successfully:', chatRequest._id);

            return res.status(201).json({
                message: 'Chat request sent successfully',
                request: chatRequest
            });
        } catch (err) {
            console.error('Chat Request Error:', err);
            return res.status(500).json({ error: 'Failed to send chat request: ' + err.message });
        }
    }
);

// Get all chat requests for a doctor
router.get('/requests/doctor', auth, async (req, res) => {
    try {
        if (req.userType !== 'doctor') {
            return res.status(403).json({ error: 'Only doctors can view their chat requests' });
        }

        const doctorId = req.user._id;

        const requests = await ChatRequest.find({ doctor: doctorId })
            .populate('patient', 'name userId')
            .sort('-createdAt');

        return res.status(200).json({ requests });
    } catch (err) {
        console.error('Get Doctor Requests Error:', err);
        return res.status(500).json({ error: 'Failed to get chat requests' });
    }
});

// Get patient details for a chat request
router.get('/patient/:patientId/details', auth, async (req, res) => {
    try {
        if (req.userType !== 'doctor') {
            return res.status(403).json({ error: 'Only doctors can view patient details' });
        }

        const { patientId } = req.params;

        // Find the patient
        const patient = await Patient.findById(patientId);
        if (!patient) {
            return res.status(404).json({ error: 'Patient not found' });
        }

        // Return the patient's details
        const patientDetails = {
            _id: patient._id,
            name: patient.name,
            userId: patient.userId,
            email: patient.email,
            patientStatus: patient.patientStatus || 'stable',
            medications: patient.medications || [],
            familyHistory: patient.familyHistory || [],
            appointments: patient.appointments || [],
            vitalSigns: patient.vitalSigns || {}
        };

        return res.status(200).json({ patient: patientDetails });
    } catch (err) {
        console.error('Get Patient Details Error:', err);
        return res.status(500).json({ error: 'Failed to get patient details' });
    }
});

// Get all chat requests for a patient
router.get('/requests/patient', auth, async (req, res) => {
    try {
        if (req.userType !== 'patient') {
            return res.status(403).json({ error: 'Only patients can view their chat requests' });
        }

        const patientId = req.user._id;

        const requests = await ChatRequest.find({ patient: patientId })
            .populate('doctor', 'name userId specialty')
            .sort('-createdAt');

        return res.status(200).json({ requests });
    } catch (err) {
        console.error('Get Patient Requests Error:', err);
        return res.status(500).json({ error: 'Failed to get chat requests' });
    }
});

// Accept or reject a chat request
router.put('/request/:requestId',
    auth,
    [
        body('status').isIn(['accepted', 'rejected']).withMessage('Status must be either accepted or rejected')
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        try {
            if (req.userType !== 'doctor') {
                return res.status(403).json({ error: 'Only doctors can accept or reject chat requests' });
            }

            const { requestId } = req.params;
            const { status } = req.body;
            const doctorId = req.user._id;

            // Find the request
            const request = await ChatRequest.findOne({
                _id: requestId,
                doctor: doctorId,
                status: 'pending'
            });

            if (!request) {
                return res.status(404).json({ error: 'Chat request not found or already processed' });
            }

            // Update the request status
            request.status = status;

            // If accepted, create a new chat
            if (status === 'accepted') {
                const chat = new Chat({
                    patient: request.patient,
                    doctor: doctorId,
                    messages: []
                });

                await chat.save();
                request.chat = chat._id;
            }

            await request.save();

            return res.status(200).json({
                message: `Chat request ${status}`,
                request
            });
        } catch (err) {
            console.error('Process Chat Request Error:', err);
            return res.status(500).json({ error: 'Failed to process chat request' });
        }
    }
);

module.exports = router;
