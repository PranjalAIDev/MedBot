// routes/doctorRoutes.js

const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const { body, validationResult } = require('express-validator'); // Add validation
const Doctor = require('../models/Doctor');
const Patient = require('../models/Patient');
const auth = require('../middleware/auth'); // Import the auth middleware

const router = express.Router();

// Sign Up (Doctor)
router.post(
    '/signup',
    [
        body('name').notEmpty().withMessage('Name is required'),
        body('email').isEmail().withMessage('Valid email is required'),
        body('licenseNumber').notEmpty().withMessage('License Number is required'),
        body('userId').notEmpty().withMessage('User ID is required'),
        body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            // Send validation errors to the client
            return res.status(400).json({ errors: errors.array() });
        }

        try {
            const { name, email, licenseNumber, userId, password } = req.body;

            // Check if userId or email already exists
            const existing = await Doctor.findOne({ $or: [{ userId }, { email }] });
            if (existing) {
                return res.status(400).json({ error: 'User ID or Email already exists' });
            }

            // Hash the password
            const hashedPassword = await bcrypt.hash(password, 10);

            // Create a new doctor
            const newDoctor = new Doctor({
                name,
                email,
                licenseNumber,
                userId,
                password: hashedPassword,
            });

            await newDoctor.save();

            // Generate JWT token
            const secret = process.env.JWT_SECRET || 'default_secret'; // Use environment variable in production
            if (!secret) {
                console.error('JWT_SECRET is not defined in environment variables');
                return res.status(500).json({ error: 'Server configuration error' });
            }

            const token = jwt.sign({ id: newDoctor._id, userType: 'doctor' }, secret, { expiresIn: '4h' });

            res.status(201).json({
                message: 'Doctor registered successfully',
                token,
                userId: newDoctor.userId,
                name: newDoctor.name,
            });
        } catch (err) {
            console.error('Doctor Signup Error:', err);
            res.status(500).json({ error: 'Registration failed' });
        }
    }
);

// Sign In (Doctor)
router.post(
    '/signin',
    [
        body('userId').notEmpty().withMessage('User ID is required'),
        body('password').notEmpty().withMessage('Password is required'),
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            // Send validation errors to the client
            return res.status(400).json({ errors: errors.array() });
        }

        try {
            const { userId, password } = req.body;

            // Find doctor by userId
            const doctor = await Doctor.findOne({ userId });
            if (!doctor) {
                return res.status(404).json({ error: 'User not found' });
            }

            // Compare passwords
            const isMatch = await bcrypt.compare(password, doctor.password);
            if (!isMatch) {
                return res.status(400).json({ error: 'Invalid credentials' });
            }

            // Generate JWT token
            const secret = process.env.JWT_SECRET || 'default_secret'; // Use environment variable in production
            if (!secret) {
                console.error('JWT_SECRET is not defined in environment variables');
                return res.status(500).json({ error: 'Server configuration error' });
            }

            const token = jwt.sign({ id: doctor._id, userType: 'doctor' }, secret, { expiresIn: '4h' });

            res.status(200).json({
                token,
                userId: doctor.userId,
                name: doctor.name,
            });
        } catch (err) {
            console.error('Doctor Signin Error:', err);
            res.status(500).json({ error: 'Sign in failed' });
        }
    }
);

// Get Doctor Profile
router.get('/profile', auth, async (req, res) => { // Apply auth middleware
    try {
        const doctor = req.user; // 'auth' middleware attaches the user to req
        res.status(200).json({
            name: doctor.name,
            email: doctor.email,
            userId: doctor.userId,
            licenseNumber: doctor.licenseNumber,
            specialty: doctor.specialty,
            location: doctor.location,
            isAvailableForChat: doctor.isAvailableForChat
        });
    } catch (err) {
        console.error('Get Profile Error:', err);
        res.status(500).json({ error: 'Failed to fetch profile' });
    }
});

// Update Doctor Profile
router.put('/profile', auth, async (req, res) => {
    try {
        if (req.userType !== 'doctor') {
            return res.status(403).json({ error: 'Only doctors can update their profile' });
        }

        const doctor = req.user;
        const { specialty, city, state, country, isAvailableForChat } = req.body;

        // Update fields if provided
        if (specialty) doctor.specialty = specialty;
        if (city || state || country) {
            doctor.location = {
                ...doctor.location,
                ...(city && { city }),
                ...(state && { state }),
                ...(country && { country })
            };
        }
        if (isAvailableForChat !== undefined) doctor.isAvailableForChat = isAvailableForChat;

        await doctor.save();

        res.status(200).json({
            message: 'Profile updated successfully',
            doctor: {
                name: doctor.name,
                email: doctor.email,
                userId: doctor.userId,
                licenseNumber: doctor.licenseNumber,
                specialty: doctor.specialty,
                location: doctor.location,
                isAvailableForChat: doctor.isAvailableForChat
            }
        });
    } catch (err) {
        console.error('Update Profile Error:', err);
        res.status(500).json({ error: 'Failed to update profile' });
    }
});

// Get all heart doctors
router.get('/heart-specialists', async (req, res) => {
    try {
        const doctors = await Doctor.find({
            specialty: 'Cardiology',
            isAvailableForChat: true
        })
        .select('name userId specialty location')
        .sort('name');

        res.status(200).json({ doctors });
    } catch (err) {
        console.error('Get Heart Specialists Error:', err);
        res.status(500).json({ error: 'Failed to fetch heart specialists' });
    }
});

// Get patients for a doctor
router.get('/patients', auth, async (req, res) => {
    try {
        if (req.userType !== 'doctor') {
            return res.status(403).json({ error: 'Only doctors can view their patients' });
        }

        const doctorId = req.user._id;

        // 1. Get all patients who have appointments with this doctor
        const patientsWithAppointments = await Patient.aggregate([
            // Unwind the appointments array to work with individual appointments
            { $unwind: { path: '$appointments', preserveNullAndEmptyArrays: false } },
            // Match appointments with this doctor
            { $match: { 'appointments.doctor': new mongoose.Types.ObjectId(doctorId) } },
            // Group back by patient to avoid duplicates
            { $group: {
                _id: '$_id',
                name: { $first: '$name' },
                userId: { $first: '$userId' },
                medications: { $first: '$medications' },
                familyHistory: { $first: '$familyHistory' },
                appointments: { $push: '$appointments' }
            }},
            // Sort by most recent appointment
            { $sort: { 'appointments.date': -1 } }
        ]);

        // 2. Get all patients who have accepted chat requests with this doctor
        const ChatRequest = mongoose.model('ChatRequest');
        const chatPatientIds = await ChatRequest.distinct('patient', {
            doctor: doctorId,
            status: 'accepted'
        });

        // 3. Fetch the patient details for chat patients
        const chatPatients = await Patient.find({
            _id: { $in: chatPatientIds }
        }).select('_id name userId medications familyHistory patientStatus');

        // 4. Format the appointment patients
        const formattedAppointmentPatients = patientsWithAppointments.map(patient => {
            // Get the most recent appointment
            const sortedAppointments = patient.appointments.sort((a, b) =>
                new Date(b.date) - new Date(a.date)
            );
            const lastAppointment = sortedAppointments[0];

            // Get the primary condition from family history or medications
            let condition = 'General checkup';
            if (patient.medications && patient.medications.length > 0) {
                condition = patient.medications[0].name;
            } else if (patient.familyHistory && patient.familyHistory.length > 0 &&
                       patient.familyHistory[0].conditions &&
                       patient.familyHistory[0].conditions.length > 0) {
                condition = patient.familyHistory[0].conditions[0];
            }

            // Determine status based on patientStatus field, medications, or appointment type
            let status = patient.patientStatus || 'stable';

            // If patientStatus is not set, determine based on other factors
            if (!patient.patientStatus) {
                if (patient.medications && patient.medications.length > 3) {
                    status = 'moderate';
                }
                if (lastAppointment && lastAppointment.type.toLowerCase().includes('emergency')) {
                    status = 'critical';
                }
            }

            return {
                id: patient._id,
                name: patient.name,
                condition: condition,
                status: status,
                lastVisit: lastAppointment ? lastAppointment.date : 'Unknown',
                source: 'appointment'
            };
        });

        // 5. Format the chat patients
        const formattedChatPatients = chatPatients.map(patient => {
            // Get the primary condition from family history or medications
            let condition = 'Chat consultation';
            if (patient.medications && patient.medications.length > 0) {
                condition = patient.medications[0].name;
            } else if (patient.familyHistory && patient.familyHistory.length > 0 &&
                       patient.familyHistory[0].conditions &&
                       patient.familyHistory[0].conditions.length > 0) {
                condition = patient.familyHistory[0].conditions[0];
            }

            // Determine status based on patientStatus field or medications
            let status = patient.patientStatus || 'stable';

            // If patientStatus is not set, determine based on medications
            if (!patient.patientStatus && patient.medications && patient.medications.length > 3) {
                status = 'moderate';
            }

            return {
                id: patient._id,
                name: patient.name,
                condition: condition,
                status: status,
                lastVisit: 'Via chat',
                source: 'chat'
            };
        });

        // 6. Combine both sets of patients and remove duplicates
        const allPatients = [...formattedAppointmentPatients, ...formattedChatPatients];

        // Remove duplicates based on patient ID
        const uniquePatients = Array.from(
            new Map(allPatients.map(patient => [patient.id.toString(), patient])).values()
        );

        // 7. Sort by name and limit to 10 patients
        uniquePatients.sort((a, b) => a.name.localeCompare(b.name));
        const limitedPatients = uniquePatients.slice(0, 10);

        res.status(200).json({ patients: limitedPatients });
    } catch (err) {
        console.error('Get Patients Error:', err);
        res.status(500).json({ error: 'Failed to fetch patients' });
    }
});

// Get today's appointments for a doctor
router.get('/appointments/today', auth, async (req, res) => {
    try {
        if (req.userType !== 'doctor') {
            return res.status(403).json({ error: 'Only doctors can view their appointments' });
        }

        const doctorId = req.user._id;
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        // 1. Find all appointments in the Appointment model
        const appointmentModel = mongoose.model('Appointment');
        const appointmentsFromModel = await appointmentModel.find({
            doctor: doctorId,
            date: {
                $gte: today,
                $lt: tomorrow
            }
        }).populate('patient', 'name');

        // 2. Find all patients with appointments for today with this doctor
        const patients = await Patient.find({
            'appointments.doctor': new mongoose.Types.ObjectId(doctorId),
            'appointments.date': {
                $gte: today,
                $lt: tomorrow
            }
        }).select('name appointments');

        // Extract and format the appointments from Patient model
        const appointmentsFromPatients = [];
        patients.forEach(patient => {
            patient.appointments.forEach(apt => {
                if (apt.doctor && apt.doctor.toString() === doctorId.toString() &&
                    new Date(apt.date) >= today && new Date(apt.date) < tomorrow) {
                    appointmentsFromPatients.push({
                        id: apt._id,
                        patientId: patient._id,
                        patientName: patient.name,
                        time: apt.time,
                        type: apt.type,
                        status: apt.status
                    });
                }
            });
        });

        // Format appointments from the Appointment model
        const formattedAppointmentsFromModel = appointmentsFromModel.map(apt => ({
            id: apt._id,
            patientId: apt.patient._id,
            patientName: apt.patient.name,
            time: apt.time,
            type: apt.type,
            status: apt.status || 'scheduled'
        }));

        // Combine both sets of appointments
        const allAppointments = [...appointmentsFromPatients, ...formattedAppointmentsFromModel];

        // Remove duplicates (if any) based on appointment ID
        const uniqueAppointments = Array.from(
            new Map(allAppointments.map(apt => [apt.id.toString(), apt])).values()
        );

        // Sort by time
        uniqueAppointments.sort((a, b) => {
            const timeA = a.time.split(':').map(Number);
            const timeB = b.time.split(':').map(Number);

            if (timeA[0] !== timeB[0]) {
                return timeA[0] - timeB[0]; // Sort by hour
            }
            return timeA[1] - timeB[1]; // Sort by minute
        });

        res.status(200).json({ appointments: uniqueAppointments });
    } catch (err) {
        console.error('Get Today\'s Appointments Error:', err);
        res.status(500).json({ error: 'Failed to fetch appointments' });
    }
});

// Get dashboard statistics for a doctor
router.get('/dashboard/stats', auth, async (req, res) => {
    try {
        if (req.userType !== 'doctor') {
            return res.status(403).json({ error: 'Only doctors can view their dashboard stats' });
        }

        const doctorId = req.user._id;

        // Get current date info
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        // Calculate start of week (Sunday)
        const startOfWeek = new Date(today);
        startOfWeek.setDate(today.getDate() - today.getDay());

        // Calculate end of week (Saturday)
        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(startOfWeek.getDate() + 7);

        // 1. Count total patients (from both models)
        // First, count patients from Patient model with appointments with this doctor
        const patientsFromPatientModel = await Patient.distinct('_id', {
            'appointments.doctor': new mongoose.Types.ObjectId(doctorId)
        });

        // Then, count patients from Appointment model with this doctor
        const appointmentModel = mongoose.model('Appointment');
        const patientsFromAppointmentModel = await appointmentModel.distinct('patient', {
            doctor: doctorId
        });

        // Combine and remove duplicates
        const allPatientIds = [...patientsFromPatientModel.map(id => id.toString()),
                               ...patientsFromAppointmentModel.map(id => id.toString())];
        const uniquePatientIds = [...new Set(allPatientIds)];
        const totalPatients = uniquePatientIds.length;

        // 2. Count today's appointments (from both models)
        // From Patient model
        const todayApptsFromPatientModel = await Patient.aggregate([
            { $unwind: '$appointments' },
            {
                $match: {
                    'appointments.doctor': new mongoose.Types.ObjectId(doctorId),
                    'appointments.date': { $gte: today, $lt: tomorrow }
                }
            },
            { $count: 'count' }
        ]);

        // From Appointment model
        const todayApptsFromAppointmentModel = await appointmentModel.countDocuments({
            doctor: doctorId,
            date: { $gte: today, $lt: tomorrow }
        });

        const todayAppointmentsCount =
            (todayApptsFromPatientModel[0]?.count || 0) + todayApptsFromAppointmentModel;

        // 3. Count critical cases (patients with status marked as critical)
        // First, count patients with patientStatus set to 'critical'
        const criticalStatusPatientsCount = await Patient.countDocuments({
            'appointments.doctor': new mongoose.Types.ObjectId(doctorId),
            'patientStatus': 'critical'
        });

        // Then, count patients with many active medications (as a fallback)
        const criticalMedicationPatientsResult = await Patient.aggregate([
            { $match: { 'appointments.doctor': new mongoose.Types.ObjectId(doctorId) } },
            { $match: { 'patientStatus': { $ne: 'critical' } } }, // Exclude already counted patients
            { $match: { 'medications.status': 'active' } },
            { $addFields: { medicationCount: { $size: "$medications" } } },
            { $match: { medicationCount: { $gt: 3 } } },
            { $count: 'count' }
        ]);

        const criticalMedicationPatientsCount = criticalMedicationPatientsResult[0]?.count || 0;

        // Combine both counts
        const criticalPatientsCount = criticalStatusPatientsCount + criticalMedicationPatientsCount;

        // 4. Count this week's appointments
        // From Patient model
        const weekApptsFromPatientModel = await Patient.aggregate([
            { $unwind: '$appointments' },
            {
                $match: {
                    'appointments.doctor': new mongoose.Types.ObjectId(doctorId),
                    'appointments.date': { $gte: startOfWeek, $lt: endOfWeek }
                }
            },
            { $count: 'count' }
        ]);

        // From Appointment model
        const weekApptsFromAppointmentModel = await appointmentModel.countDocuments({
            doctor: doctorId,
            date: { $gte: startOfWeek, $lt: endOfWeek }
        });

        const weekAppointmentsCount =
            (weekApptsFromPatientModel[0]?.count || 0) + weekApptsFromAppointmentModel;

        // Return all stats
        res.status(200).json({
            stats: {
                totalPatients,
                todayAppointments: todayAppointmentsCount,
                criticalCases: criticalPatientsCount,
                weekAppointments: weekAppointmentsCount
            }
        });
    } catch (err) {
        console.error('Get Dashboard Stats Error:', err);
        res.status(500).json({ error: 'Failed to fetch dashboard statistics' });
    }
});

// Update patient medications (for doctors)
router.post('/patient/:patientId/medications',
    auth,
    [
        body('name').notEmpty().withMessage('Medication name is required'),
        body('dosage').notEmpty().withMessage('Dosage is required'),
        body('schedule').notEmpty().withMessage('Schedule is required'),
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        try {
            if (req.userType !== 'doctor') {
                return res.status(403).json({ error: 'Only doctors can update patient medications' });
            }

            const { patientId } = req.params;
            const { name, dosage, schedule, status = 'active' } = req.body;

            // Find the patient
            const patient = await Patient.findById(patientId);
            if (!patient) {
                return res.status(404).json({ error: 'Patient not found' });
            }

            // Add the new medication
            const newMedication = {
                name,
                dosage,
                schedule,
                status
            };

            patient.medications.push(newMedication);
            await patient.save();

            // Create a notification for the patient
            patient.notifications.push({
                title: 'New Medication Added',
                message: `Dr. ${req.user.name} has prescribed ${name} (${dosage}) to be taken ${schedule}`,
                type: 'medication'
            });

            return res.status(201).json({
                message: 'Medication added successfully',
                medication: newMedication,
                patientMedications: patient.medications
            });
        } catch (err) {
            console.error('Add Patient Medication Error:', err);
            return res.status(500).json({ error: 'Failed to add medication' });
        }
    }
);

// Delete patient medication (for doctors)
router.delete('/patient/:patientId/medications/:medicationId', auth, async (req, res) => {
    try {
        if (req.userType !== 'doctor') {
            return res.status(403).json({ error: 'Only doctors can delete patient medications' });
        }

        const { patientId, medicationId } = req.params;

        // Find the patient
        const patient = await Patient.findById(patientId);
        if (!patient) {
            return res.status(404).json({ error: 'Patient not found' });
        }

        // Check if medication exists
        const medicationIndex = patient.medications.findIndex(med => med._id.toString() === medicationId);
        if (medicationIndex === -1) {
            return res.status(404).json({ error: 'Medication not found' });
        }

        // Get medication name for notification
        const medicationName = patient.medications[medicationIndex].name;

        // Remove the medication
        patient.medications.splice(medicationIndex, 1);
        await patient.save();

        // Create a notification for the patient
        patient.notifications.push({
            title: 'Medication Removed',
            message: `Dr. ${req.user.name} has removed ${medicationName} from your medications`,
            type: 'medication'
        });

        return res.status(200).json({
            message: 'Medication deleted successfully',
            patientMedications: patient.medications
        });
    } catch (err) {
        console.error('Delete Patient Medication Error:', err);
        return res.status(500).json({ error: 'Failed to delete medication' });
    }
});

// Update patient status (mark as critical, etc.)
router.put('/patient/:patientId/status', auth, async (req, res) => {
    try {
        if (req.userType !== 'doctor') {
            return res.status(403).json({ error: 'Only doctors can update patient status' });
        }

        const { patientId } = req.params;
        const { status } = req.body;

        if (!status || !['critical', 'stable', 'moderate'].includes(status)) {
            return res.status(400).json({ error: 'Valid status (critical, stable, or moderate) is required' });
        }

        // Find the patient
        const patient = await Patient.findById(patientId);
        if (!patient) {
            return res.status(404).json({ error: 'Patient not found' });
        }

        // Update patient status
        // Since there's no status field in the Patient model, we'll add it as a custom field
        patient.patientStatus = status;
        await patient.save();

        // Create a notification for the patient
        patient.notifications.push({
            title: 'Status Update',
            message: `Dr. ${req.user.name} has updated your status to ${status}`,
            type: 'status'
        });

        return res.status(200).json({
            message: 'Patient status updated successfully',
            patientStatus: status
        });
    } catch (err) {
        console.error('Update Patient Status Error:', err);
        return res.status(500).json({ error: 'Failed to update patient status' });
    }
});

module.exports = router;
