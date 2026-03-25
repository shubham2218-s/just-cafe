// createAdmin.js — Run once to create the admin account
// Usage: node createAdmin.js

require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/campus_cafe';

// ── Admin credentials — change these if you want ──
const ADMIN_NAME     = 'Admin';
const ADMIN_EMAIL    = 'admin@cafe.com';
const ADMIN_PASSWORD = 'admin123';
// ──────────────────────────────────────────────────

const userSchema = new mongoose.Schema({
    name:      { type: String, required: true },
    email:     { type: String, required: true, unique: true, lowercase: true },
    password:  { type: String, required: true },
    role:      { type: String, enum: ['student', 'admin'], default: 'student' },
}, { timestamps: true });

async function main() {
    console.log('🔗 Connecting to MongoDB:', MONGO_URI);

    try {
        await mongoose.connect(MONGO_URI);
        console.log('✅ Connected to MongoDB\n');
    } catch (err) {
        console.error('❌ Cannot connect to MongoDB.');
        console.error('   Error:', err.message);
        console.error('\n👉 Make sure MongoDB is running:');
        console.error('   - Local:  run  mongod  in a separate terminal');
        console.error('   - Atlas:  check your MONGO_URI in .env\n');
        process.exit(1);
    }

    const User = mongoose.model('User', userSchema);

    try {
        // Check if admin already exists
        const existing = await User.findOne({ email: ADMIN_EMAIL.toLowerCase() });

        if (existing) {
            if (existing.role === 'admin') {
                console.log('ℹ️  Admin already exists:', ADMIN_EMAIL);
                console.log('   Password was NOT changed.');
                console.log('\n👉 To reset password, delete the user in MongoDB and run again.');
            } else {
                // Upgrade existing student account to admin
                await User.updateOne(
                    { email: ADMIN_EMAIL.toLowerCase() },
                    { role: 'admin' }
                );
                console.log('✅ Existing account upgraded to admin:', ADMIN_EMAIL);
            }
        } else {
            const hash = await bcrypt.hash(ADMIN_PASSWORD, 10);
            await User.create({
                name:     ADMIN_NAME,
                email:    ADMIN_EMAIL.toLowerCase(),
                password: hash,
                role:     'admin',
            });
            console.log('✅ Admin account created successfully!\n');
            console.log('   Email   :', ADMIN_EMAIL);
            console.log('   Password:', ADMIN_PASSWORD);
            console.log('\n👉 Login at http://localhost:3000/login');
        }
    } catch (err) {
        console.error('❌ Error creating admin:', err.message);
    } finally {
        await mongoose.disconnect();
        console.log('\n🔌 Disconnected from MongoDB');
    }
}

main();
