const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const { User } = require('../models/db');

// Register
router.post('/register', async (req, res) => {
    const { name, email, password } = req.body;
    if (!name || !email || !password)
        return res.status(400).json({ error: 'All fields are required' });

    try {
        const existing = await User.findOne({ email: email.toLowerCase() });
        if (existing)
            return res.status(409).json({ error: 'Email already registered' });

        const hash = await bcrypt.hash(password, 10);
        const user = await User.create({ name, email, password: hash });

        req.session.userId = user._id.toString();
        req.session.userName = user.name;
        req.session.userRole = user.role;
        res.json({ success: true, name: user.name, role: user.role });
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: 'Registration failed' });
    }
});

// Login
router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password)
        return res.status(400).json({ error: 'Email and password required' });

    try {
        const user = await User.findOne({ email: email.toLowerCase() });
        if (!user)
            return res.status(401).json({ error: 'Invalid credentials' });

        const match = await bcrypt.compare(password, user.password);
        if (!match)
            return res.status(401).json({ error: 'Invalid credentials' });

        req.session.userId = user._id.toString();
        req.session.userName = user.name;
        req.session.userRole = user.role;
        res.json({ success: true, name: user.name, role: user.role });
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: 'Server error' });
    }
});

// Logout
router.post('/logout', (req, res) => {
    req.session.destroy(() => res.json({ success: true }));
});

// Status
router.get('/status', (req, res) => {
    if (req.session.userId) {
        res.json({ loggedIn: true, name: req.session.userName, role: req.session.userRole });
    } else {
        res.json({ loggedIn: false });
    }
});

module.exports = router;
