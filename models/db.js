const mongoose = require('mongoose');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/campus_cafe';

mongoose.connect(MONGO_URI)
    .then(() => {
        console.log('✅ Connected to MongoDB');
        seedData();
    })
    .catch(err => console.error('❌ MongoDB connection error:', err.message));

// ─── SCHEMAS ────────────────────────────────────────────────────────────────

const userSchema = new mongoose.Schema({
    name:       { type: String, required: true },
    email:      { type: String, required: true, unique: true, lowercase: true },
    password:   { type: String, required: true },
    role:       { type: String, enum: ['student', 'admin'], default: 'student' },
}, { timestamps: true });

const categorySchema = new mongoose.Schema({
    name: { type: String, required: true, unique: true },
});

const menuItemSchema = new mongoose.Schema({
    name:        { type: String, required: true },
    description: { type: String, default: '' },
    price:       { type: Number, required: true },
    category:    { type: mongoose.Schema.Types.ObjectId, ref: 'Category' },
    image_url:   { type: String, default: '' },
    available:   { type: Boolean, default: true },
}, { timestamps: true });

const orderItemSchema = new mongoose.Schema({
    menu_item:      { type: mongoose.Schema.Types.ObjectId, ref: 'MenuItem', required: true },
    menu_item_name: { type: String },
    quantity:       { type: Number, required: true },
    price_at_time:  { type: Number, required: true },
});

const orderSchema = new mongoose.Schema({
    user:                   { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    items:                  [orderItemSchema],
    total_price:            { type: Number, required: true },
    status:                 { type: String, enum: ['pending', 'preparing', 'ready', 'delivered'], default: 'pending' },
    estimated_wait_minutes: { type: Number },
}, { timestamps: true });

// ─── MODELS ─────────────────────────────────────────────────────────────────

const User     = mongoose.model('User',     userSchema);
const Category = mongoose.model('Category', categorySchema);
const MenuItem = mongoose.model('MenuItem', menuItemSchema);
const Order    = mongoose.model('Order',    orderSchema);

// ─── SEED DATA ───────────────────────────────────────────────────────────────

async function seedData() {
    try {
        const catCount = await Category.countDocuments();
        if (catCount > 0) return;

        const cats = await Category.insertMany([
            { name: 'Beverages' },
            { name: 'Snacks' },
            { name: 'Meals' },
        ]);

        const [beverages, snacks, meals] = cats;

        await MenuItem.insertMany([
            { name: 'Coffee',       description: 'Hot brewed coffee',       price: 2.50, category: beverages._id, image_url: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=400' },
            { name: 'Burger',       description: 'Veg burger with fries',   price: 5.50, category: meals._id,     image_url: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400' },
            { name: 'Sandwich',     description: 'Grilled veg sandwich',    price: 4.00, category: snacks._id,    image_url: 'https://images.unsplash.com/photo-1553909489-cd47e0907980?w=400' },
            { name: 'Lemon Tea',    description: 'Fresh lemon tea',         price: 1.50, category: beverages._id, image_url: 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=400' },
            { name: 'Samosa',       description: 'Crispy fried samosa',     price: 1.00, category: snacks._id,    image_url: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=400' },
            { name: 'Pasta',        description: 'Creamy veg pasta',        price: 6.00, category: meals._id,     image_url: 'https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?w=400' },
            { name: 'Cold Coffee',  description: 'Iced blended coffee',     price: 3.00, category: beverages._id, image_url: 'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=400' },
            { name: 'Spring Rolls', description: 'Crispy veg spring rolls', price: 2.50, category: snacks._id,    image_url: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=400' },
            { name: 'Fried Rice',   description: 'Veg fried rice bowl',     price: 5.00, category: meals._id,     image_url: 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=400' },
        ]);

        console.log('✅ Database seeded with categories and menu items');
    } catch (err) {
        console.error('Seeding error:', err.message);
    }
}

module.exports = { User, Category, MenuItem, Order };
