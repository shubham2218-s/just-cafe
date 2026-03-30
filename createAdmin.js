// createAdmin.js — Run once to create the admin account
// Usage: node createAdmin.js

require('dotenv').config();
const bcrypt = require('bcrypt');
const { User } = require('./models/db');

// ── Admin credentials — change these if you want ──
const ADMIN_NAME     = 'Admin';
const ADMIN_EMAIL    = 'admin@justcafe.com';
const ADMIN_PASSWORD = 'justcafe123';
// ──────────────────────────────────────────────────

async function main() {
    console.log('🔗 Connecting to Firestore...');

    try {
        // Remove old admin if exists
        const oldSnapshot = await User.where('email', '==', 'admin@cafe.com').get();
        if (!oldSnapshot.empty) {
            for (const doc of oldSnapshot.docs) {
                await doc.ref.delete();
            }
            console.log('🗑️ Removed old admin account (admin@cafe.com)');
        }

        // Check if new admin already exists
        const snapshot = await User.where('email', '==', ADMIN_EMAIL.toLowerCase()).limit(1).get();

        if (!snapshot.empty) {
            const adminDoc = snapshot.docs[0];
            const existing = adminDoc.data();

            if (existing.role === 'admin') {
                console.log('ℹ️  Admin already exists:', ADMIN_EMAIL);
                console.log('   Password was NOT changed.');
            } else {
                // Upgrade existing student account to admin
                await adminDoc.ref.update({ role: 'admin' });
                console.log('✅ Existing account upgraded to admin:', ADMIN_EMAIL);
            }
        } else {
            const hash = await bcrypt.hash(ADMIN_PASSWORD, 10);
            await User.add({
                name:     ADMIN_NAME,
                email:    ADMIN_EMAIL.toLowerCase(),
                password: hash,
                role:     'admin',
                createdAt: new Date()
            });
            console.log('✅ Admin account created successfully!\n');
            console.log('   Email   :', ADMIN_EMAIL);
            console.log('   Password:', ADMIN_PASSWORD);
            console.log('\n👉 Login at http://localhost:3000/login');
        }
    } catch (err) {
        console.error('❌ Error creating admin:', err.message);
        process.exit(1);
    }

    process.exit(0);
}

main();
