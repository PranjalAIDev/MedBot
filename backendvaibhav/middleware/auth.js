// middleware/auth.js
const jwt = require('jsonwebtoken');
const Patient = require('../models/Patient');
const Doctor = require('../models/Doctor');

const auth = async (req, res, next) => {
    console.log('Auth middleware called for path:', req.path);

    try {
        // Extract token from Authorization header
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            console.log('Authorization header missing or malformed:', authHeader);
            return res.status(401).json({ error: 'Authorization token missing or malformed' });
        }

        const token = authHeader.split(' ')[1];
        console.log('Token extracted:', token.substring(0, 10) + '...');

        const secret = process.env.JWT_SECRET || 'default_secret';
        console.log('Using secret:', secret ? 'Secret exists' : 'No secret');

        // Verify token
        try {
            const decoded = jwt.verify(token, secret);
            console.log('Token decoded successfully:', {
                id: decoded.id,
                userType: decoded.userType,
                iat: decoded.iat,
                exp: decoded.exp
            });

            // we expect decoded to have: { id: '...', userType: 'patient' or 'doctor', iat, exp }
            const { id, userType } = decoded;
            let user;

            if (userType === 'patient') {
                console.log('Looking up patient with ID:', id);
                user = await Patient.findById(id);
                if (!user) {
                    console.log('Patient not found with ID:', id);
                    return res.status(404).json({ error: 'Patient not found' });
                }
                console.log('Patient found:', user.name);
            } else if (userType === 'doctor') {
                console.log('Looking up doctor with ID:', id);
                user = await Doctor.findById(id);
                if (!user) {
                    console.log('Doctor not found with ID:', id);
                    return res.status(404).json({ error: 'Doctor not found' });
                }
                console.log('Doctor found:', user.name);
            } else {
                console.log('Invalid userType in token:', userType);
                return res.status(400).json({ error: 'Invalid userType in token' });
            }

            // Attach user and userType to req
            req.user = user;
            req.userType = userType;
            console.log('Authentication successful for', userType, user.name);

            next();
        } catch (jwtError) {
            console.error('JWT verification error:', jwtError);
            return res.status(401).json({ error: 'Invalid token: ' + jwtError.message });
        }
    } catch (err) {
        console.error('Auth Middleware Error:', err);
        res.status(401).json({ error: 'Invalid or expired token: ' + err.message });
    }
};

module.exports = auth;
