// routes/authRoutes.js
const express = require('express');
const jwt = require('jsonwebtoken');
const Patient = require('../models/Patient');
const Doctor = require('../models/Doctor');
const auth = require('../middleware/auth');

const router = express.Router();

// Refresh token endpoint
router.post('/refresh-token', auth, async (req, res) => {
    try {
        // The auth middleware has already verified the token and attached the user
        const userId = req.user._id;
        const userType = req.userType;

        // Generate a new token
        const secret = process.env.JWT_SECRET || 'default_secret';
        const newToken = jwt.sign({ id: userId, userType }, secret, { expiresIn: '4h' });

        return res.status(200).json({
            message: 'Token refreshed successfully',
            token: newToken
        });
    } catch (err) {
        console.error('Token Refresh Error:', err);
        return res.status(500).json({ error: 'Failed to refresh token' });
    }
});

// Check token validity endpoint
router.get('/check-token', auth, (req, res) => {
    // If we get here, the token is valid (auth middleware passed)
    return res.status(200).json({
        valid: true,
        userType: req.userType,
        userId: req.user._id,
        name: req.user.name
    });
});

// Get current user info
router.get('/me', auth, (req, res) => {
    const user = req.user;
    const userType = req.userType;

    // Return different fields based on user type
    if (userType === 'patient') {
        return res.status(200).json({
            userType,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                userId: user.userId
            }
        });
    } else if (userType === 'doctor') {
        return res.status(200).json({
            userType,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                userId: user.userId,
                licenseNumber: user.licenseNumber,
                specialty: user.specialty,
                isAvailableForChat: user.isAvailableForChat
            }
        });
    }

    return res.status(400).json({ error: 'Unknown user type' });
});

module.exports = router;
