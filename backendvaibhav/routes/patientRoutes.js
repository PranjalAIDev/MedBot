// routes/patientRoutes.js
const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const Patient = require('../models/Patient');
const Doctor = require('../models/Doctor');
const Appointment = require('../models/Appointment');
const auth = require('../middleware/auth'); // The new auth that handles both userType

const router = express.Router();

/* -------------------------
   PATIENT AUTH
--------------------------*/

// Sign Up (Patient)
router.post(
    '/signup',
    [
        body('name').notEmpty().withMessage('Name is required'),
        body('email').isEmail().withMessage('Valid email is required'),
        body('userId').notEmpty().withMessage('User ID is required'),
        body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        try {
            const { name, email, userId, password } = req.body;

            const existing = await Patient.findOne({ $or: [{ userId }, { email }] });
            if (existing) {
                return res.status(400).json({ error: 'User ID or Email already exists' });
            }

            const hashedPassword = await bcrypt.hash(password, 10);
            const newPatient = new Patient({ name, email, userId, password: hashedPassword });
            await newPatient.save();

            // Optionally log them in right away
            const secret = process.env.JWT_SECRET || 'default_secret';
            const token = jwt.sign({ id: newPatient._id, userType: 'patient' }, secret, { expiresIn: '4h' });

            res.status(201).json({
                message: 'Patient registered successfully',
                token,
                userId: newPatient.userId,
                name: newPatient.name,
            });
        } catch (err) {
            console.error('Signup Error:', err);
            res.status(500).json({ error: 'Registration failed' });
        }
    }
);

// Sign In (Patient)
router.post(
    '/signin',
    [
        body('userId').notEmpty().withMessage('User ID is required'),
        body('password').notEmpty().withMessage('Password is required'),
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        try {
            const { userId, password } = req.body;

            const patient = await Patient.findOne({ userId });
            if (!patient) {
                return res.status(404).json({ error: 'User not found' });
            }

            const isMatch = await bcrypt.compare(password, patient.password);
            if (!isMatch) {
                return res.status(400).json({ error: 'Invalid credentials' });
            }

            const secret = process.env.JWT_SECRET || 'default_secret';
            // userType = 'patient'
            const token = jwt.sign({ id: patient._id, userType: 'patient' }, secret, { expiresIn: '4h' });

            return res.status(200).json({
                token,
                userId: patient.userId,
                name: patient.name,
            });
        } catch (err) {
            console.error('Signin Error:', err);
            res.status(500).json({ error: 'Internal Server Error' });
        }
    }
);

/* -------------------------
   MEDICATION ROUTES
--------------------------*/
router.get('/medications', auth, async (req, res) => {
    try {
        // userType can be 'patient' or 'doctor'
        if (req.userType === 'patient') {
            const patient = req.user; // the logged-in patient
            return res.status(200).json({ medications: patient.medications });
        } else {
            // for doctor, you might do something else, e.g. require a patientId param
            return res
                .status(403)
                .json({ error: 'Doctors cannot view medications for a patient unless patientId is specified' });
        }
    } catch (err) {
        console.error('Fetch Medications Error:', err);
        res.status(500).json({ error: 'Failed to fetch medications' });
    }
});

router.post(
    '/medications',
    auth,
    [
        body('name').notEmpty().withMessage('Name is required'),
        body('dosage').notEmpty().withMessage('Dosage is required'),
        body('schedule').notEmpty().withMessage('Schedule is required'),
    ],
    async (req, res) => {
        try {
            if (req.userType !== 'patient') {
                return res
                    .status(403)
                    .json({ error: 'Only patients can add medications to their own record' });
            }

            const { name, dosage, schedule, status } = req.body;
            const patient = req.user;

            const newMedication = {
                name,
                dosage,
                schedule,
                status: status || 'Active',
            };

            patient.medications.push(newMedication);
            await patient.save();

            return res.status(201).json({
                message: 'Medication added successfully',
                medications: patient.medications,
            });
        } catch (err) {
            console.error('Add Medication Error:', err);
            res.status(500).json({ error: 'Failed to add medication' });
        }
    }
);

// DELETE a medication
router.delete('/medications/:medId', auth, async (req, res) => {
    try {
        if (req.userType !== 'patient') {
            return res
                .status(403)
                .json({ error: 'Only patients can delete medications from their own record' });
        }

        const { medId } = req.params;
        const patient = req.user;

        const beforeCount = patient.medications.length;
        patient.medications.pull({ _id: medId });

        if (patient.medications.length === beforeCount) {
            return res.status(404).json({ error: 'Medication not found' });
        }

        await patient.save();
        return res.status(200).json({
            message: 'Medication deleted successfully',
            medications: patient.medications,
        });
    } catch (err) {
        console.error('Delete Medication Error:', err);
        res.status(500).json({ error: 'Failed to delete medication' });
    }
});

/* -------------------------
   FAMILY HISTORY ROUTES
--------------------------*/

/**
 * GET the family history for the logged-in patient
 */
router.get('/family-history', auth, async (req, res) => {
    try {
        if (req.userType !== 'patient') {
            return res
                .status(403)
                .json({ error: 'Only patients can view their own family history' });
        }

        const patient = req.user;
        return res.status(200).json({ familyHistory: patient.familyHistory });
    } catch (err) {
        console.error('Fetch Family History Error:', err);
        res.status(500).json({ error: 'Failed to fetch family history' });
    }
});

/**
 * POST a new family member
 */
router.post(
    '/family-history',
    auth,
    [
        body('name').notEmpty().withMessage('Name is required'),
        body('relation').notEmpty().withMessage('Relation is required'),
        body('conditions').notEmpty().withMessage('Conditions are required'),
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        try {
            if (req.userType !== 'patient') {
                return res
                    .status(403)
                    .json({ error: 'Only patients can add family history to their own record' });
            }

            const patient = req.user;
            const { name, relation, conditions } = req.body;

            // If multiple conditions are passed in a comma-separated string
            const conditionsArray = conditions.split(',').map((c) => c.trim());

            const newFamilyMember = {
                name,
                relation,
                conditions: conditionsArray,
            };

            patient.familyHistory.push(newFamilyMember);
            await patient.save();

            res.status(201).json({
                message: 'Family member added successfully',
                familyHistory: patient.familyHistory,
            });
        } catch (err) {
            console.error('Add Family Member Error:', err);
            res.status(500).json({ error: 'Failed to add family member' });
        }
    }
);

/**
 * DELETE a family member by _id
 */
router.delete('/family-history/:famId', auth, async (req, res) => {
    try {
        if (req.userType !== 'patient') {
            return res
                .status(403)
                .json({ error: 'Only patients can delete family members from their own record' });
        }

        const { famId } = req.params;
        const patient = req.user;

        const familyMember = patient.familyHistory.id(famId);
        if (!familyMember) {
            return res.status(404).json({ error: 'Family member not found' });
        }

        patient.familyHistory.pull({ _id: famId });
        await patient.save();

        return res.status(200).json({
            message: 'Family member deleted successfully',
            familyHistory: patient.familyHistory,
        });
    } catch (err) {
        console.error('Delete Family Member Error:', err);
        res.status(500).json({ error: 'Failed to delete family member' });
    }
});

/* -------------------------
   APPOINTMENT ROUTES
--------------------------*/

// Create an appointment
router.post(
    '/appointments',
    auth,
    [
        body('type').notEmpty().withMessage('Appointment type is required'),
        body('doctorUserId').notEmpty().withMessage('Doctor User ID is required'),
        body('date').notEmpty().withMessage('Date is required'),
        body('time').notEmpty().withMessage('Time is required'),
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        try {
            const { type, doctorUserId, date, time } = req.body;
            let patientId;

            if (req.userType === 'patient') {
                patientId = req.user._id;
            } else if (req.userType === 'doctor') {
                // For simplicity, block doctor from creating an appointment this way
                return res.status(403).json({ error: 'Doctors cannot create appointments this way' });
            }

            // find the doctor by userId
            const doctor = await Doctor.findOne({ userId: doctorUserId });
            if (!doctor) {
                return res
                    .status(404)
                    .json({ error: `Doctor with userId '${doctorUserId}' does not exist` });
            }

            const newAppointment = new Appointment({
                patient: patientId,
                doctor: doctor._id,
                type,
                date,
                time,
            });
            await newAppointment.save();

            return res.status(201).json({
                message: 'Appointment scheduled successfully',
                appointment: newAppointment,
            });
        } catch (err) {
            console.error('Appointment Creation Error:', err);
            res.status(500).json({ error: 'Failed to create appointment' });
        }
    }
);

// GET all appointments for this patient
router.get('/appointments', auth, async (req, res) => {
    try {
        if (req.userType !== 'patient') {
            return res.status(403).json({ error: 'Only patients can view their appointments here' });
        }
        const patientId = req.user._id;

        const appointments = await Appointment.find({ patient: patientId }).populate(
            'doctor',
            'name email licenseNumber userId'
        );

        return res.status(200).json({ appointments });
    } catch (err) {
        console.error('Fetch Appointments Error:', err);
        res.status(500).json({ error: 'Failed to fetch appointments' });
    }
});

// DELETE an appointment
router.delete('/appointments/:id', auth, async (req, res) => {
    try {
        if (req.userType !== 'patient') {
            return res.status(403).json({ error: 'Only patients can delete their appointments here' });
        }
        const { id } = req.params;
        const patientId = req.user._id;

        const appointment = await Appointment.findOneAndDelete({
            _id: id,
            patient: patientId
        });
        if (!appointment) {
            return res.status(404).json({ error: 'Appointment not found' });
        }

        return res.status(200).json({ message: 'Appointment deleted successfully' });
    } catch (err) {
        console.error('Delete Appointment Error:', err);
        res.status(500).json({ error: 'Failed to delete appointment' });
    }
});

/* -------------------------
   DOCTOR-ACCESSIBLE PATIENT INFO
--------------------------*/
router.get('/:patientUserId/patient-info', auth, async (req, res) => {
    try {
        // 1) Confirm the caller is a doctor
        if (req.userType !== 'doctor') {
            return res
                .status(403)
                .json({ error: 'Only doctors can access another patient\'s info' });
        }

        // 2) Parse the patientUserId from the route param
        const { patientUserId } = req.params;

        // 3) Find the patient by that userId
        const patient = await Patient.findOne({ userId: patientUserId });
        if (!patient) {
            return res.status(404).json({ error: 'Patient not found' });
        }

        // 4) Return the patient's data to the doctor
        const safeData = {
            _id: patient._id,
            name: patient.name,
            email: patient.email,
            userId: patient.userId,
            patientStatus: patient.patientStatus || 'stable',
            medications: patient.medications || [],
            familyHistory: patient.familyHistory || [],
            vitalSigns: patient.vitalSigns || {},
            notifications: patient.notifications || []
        };

        return res.status(200).json({ patient: safeData });
    } catch (err) {
        console.error('Fetch Patient Info Error:', err);
        return res.status(500).json({ error: 'Failed to fetch patient info' });
    }
});

/* -------------------------
   NOTIFICATIONS ROUTES
--------------------------*/

// Get all notifications for the logged-in patient
router.get('/notifications', auth, async (req, res) => {
    try {
        if (req.userType !== 'patient') {
            return res.status(403).json({ error: 'Only patients can view their notifications' });
        }

        const patient = req.user;
        return res.status(200).json({
            notifications: patient.notifications || [],
            unreadCount: patient.notifications ? patient.notifications.filter(n => !n.read).length : 0
        });
    } catch (err) {
        console.error('Fetch Notifications Error:', err);
        res.status(500).json({ error: 'Failed to fetch notifications' });
    }
});

// Mark a notification as read
router.put('/notifications/:notificationId/read', auth, async (req, res) => {
    try {
        if (req.userType !== 'patient') {
            return res.status(403).json({ error: 'Only patients can update their notifications' });
        }

        const { notificationId } = req.params;
        const patient = req.user;

        // Find the notification
        const notification = patient.notifications.id(notificationId);
        if (!notification) {
            return res.status(404).json({ error: 'Notification not found' });
        }

        // Mark as read
        notification.read = true;
        await patient.save();

        return res.status(200).json({
            message: 'Notification marked as read',
            notifications: patient.notifications,
            unreadCount: patient.notifications.filter(n => !n.read).length
        });
    } catch (err) {
        console.error('Update Notification Error:', err);
        res.status(500).json({ error: 'Failed to update notification' });
    }
});

// Mark all notifications as read
router.put('/notifications/read-all', auth, async (req, res) => {
    try {
        if (req.userType !== 'patient') {
            return res.status(403).json({ error: 'Only patients can update their notifications' });
        }

        const patient = req.user;

        // Mark all as read
        if (patient.notifications && patient.notifications.length > 0) {
            patient.notifications.forEach(notification => {
                notification.read = true;
            });
            await patient.save();
        }

        return res.status(200).json({
            message: 'All notifications marked as read',
            notifications: patient.notifications,
            unreadCount: 0
        });
    } catch (err) {
        console.error('Update All Notifications Error:', err);
        res.status(500).json({ error: 'Failed to update notifications' });
    }
});

module.exports = router;
