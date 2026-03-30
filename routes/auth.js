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
        const existingSnap = await User.where('email', '==', email.toLowerCase()).limit(1).get();
        if (!existingSnap.empty)
            return res.status(409).json({ error: 'Email already registered' });

        const hash = await bcrypt.hash(password, 10);
        const userData = { name, email: email.toLowerCase(), password: hash, role: 'student', createdAt: new Date() };
        const userRef = await User.add(userData);

        req.session.userId = userRef.id;
        req.session.userName = userData.name;
        req.session.userRole = userData.role;
        res.json({ success: true, name: userData.name, role: userData.role });
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: 'Registration failed' });
    }
});

router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password)
        return res.status(400).json({ error: 'Email and password required' });

    // Hardcoded Admin Fallback (guarantees login works even if DB is empty)
    if (email.toLowerCase() === 'admin@justcafe.com' && password === 'justcafe123') {
        req.session.userId = 'admin_hardcoded_id';
        req.session.userName = 'Site Admin';
        req.session.userRole = 'admin';
        return res.json({ success: true, name: 'Site Admin', role: 'admin' });
    }

    try {
        const snapshot = await User.where('email', '==', email.toLowerCase()).limit(1).get();
        if (snapshot.empty)
            return res.status(401).json({ error: 'Invalid credentials' });

        const userDoc = snapshot.docs[0];
        const user = userDoc.data();

        const match = await bcrypt.compare(password, user.password);
        if (!match)
            return res.status(401).json({ error: 'Invalid credentials' });

        req.session.userId = userDoc.id;
        req.session.userName = user.name;
        req.session.userRole = user.role || 'student';
        res.json({ success: true, name: user.name, role: user.role || 'student' });
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
