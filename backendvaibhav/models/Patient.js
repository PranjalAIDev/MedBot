// models/Patient.js
const mongoose = require('mongoose');

// Define the schema for a family member
const FamilyMemberSchema = new mongoose.Schema({
    name: { type: String, required: true },
    relation: { type: String, required: true },
    conditions: [{ type: String }] // Array of medical conditions
}, { timestamps: true });

// Define the schema for an appointment
const AppointmentSchema = new mongoose.Schema({
    date: { type: Date, required: true },
    time: { type: String, required: true },
    type: { type: String, required: true },
    status: {
        type: String,
        enum: ['scheduled', 'completed', 'cancelled'],
        default: 'scheduled'
    },
    doctor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Doctor'
    },
    notes: { type: String }
}, { timestamps: true });

// Define the schema for a patient
const PatientSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    userId: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    token: { type: String },

    // Patient status (for doctor to mark as critical, etc.)
    patientStatus: {
        type: String,
        enum: ['critical', 'moderate', 'stable'],
        default: 'stable'
    },

    // Vital signs
    vitalSigns: {
        bloodPressure: { type: String },
        heartRate: { type: Number },
        oxygenLevel: { type: Number },
        temperature: { type: Number },
        lastUpdated: { type: Date }
    },

    // Medications
    medications: [
        {
            name: { type: String, required: true },
            dosage: { type: String, required: true },
            schedule: { type: String, required: true },
            status: { type: String, enum: ['active', 'inactive'], default: 'active' },
            prescribedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Doctor' },
            prescribedDate: { type: Date, default: Date.now }
        },
    ],

    // Family History as an array of FamilyMemberSchema
    familyHistory: [FamilyMemberSchema],

    // Appointments
    appointments: [AppointmentSchema],

    // Notifications
    notifications: [
        {
            title: { type: String, required: true },
            message: { type: String, required: true },
            type: { type: String, enum: ['medication', 'appointment', 'status', 'general'], default: 'general' },
            read: { type: Boolean, default: false },
            createdAt: { type: Date, default: Date.now }
        }
    ],
}, { timestamps: true });

module.exports = mongoose.model('Patient', PatientSchema);
