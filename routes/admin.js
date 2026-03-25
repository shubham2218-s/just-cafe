const express = require('express');
const router = express.Router();
const { Order, User, MenuItem, Category } = require('../models/db');

function requireAdmin(req, res, next) {
    if (!req.session.userId || req.session.userRole !== 'admin')
        return res.status(403).json({ error: 'Admin access required' });
    next();
}

// Get all orders (with user info populated)
router.get('/orders', requireAdmin, async (req, res) => {
    try {
        const orders = await Order.find()
            .populate('user', 'name email')
            .sort({ createdAt: -1 })
            .lean();

        const result = orders.map(o => ({
            ...o,
            id: o._id,
            order_time:   o.createdAt,
            user_name:    o.user?.name || 'Unknown',
            email:        o.user?.email || '',
            items_summary: o.items.map(i => `${i.menu_item_name} x${i.quantity}`).join(', '),
        }));

        res.json(result);
    } catch (e) {
        res.status(500).json({ error: 'Failed to fetch orders' });
    }
});

// Update order status
router.put('/orders/:id/status', requireAdmin, async (req, res) => {
    try {
        await Order.findByIdAndUpdate(req.params.id, { status: req.body.status });
        res.json({ success: true });
    } catch (e) {
        res.status(500).json({ error: 'Failed to update status' });
    }
});

// Dashboard stats
router.get('/stats', requireAdmin, async (req, res) => {
    try {
        const [totalOrders, revenueResult, totalUsers, totalItems] = await Promise.all([
            Order.countDocuments(),
            Order.aggregate([{ $group: { _id: null, total: { $sum: '$total_price' } } }]),
            User.countDocuments({ role: 'student' }),
            MenuItem.countDocuments({ available: true }),
        ]);

        res.json({
            totalOrders,
            totalRevenue: revenueResult[0]?.total || 0,
            totalUsers,
            totalItems,
        });
    } catch (e) {
        res.status(500).json({ error: 'Failed to fetch stats' });
    }
});

// Get all menu items for admin (including unavailable)
router.get('/menu', requireAdmin, async (req, res) => {
    try {
        const items = await MenuItem.find().populate('category', 'name').lean();
        res.json(items.map(item => ({
            ...item,
            id: item._id,
            category_id:   item.category?._id,
            category_name: item.category?.name || '',
        })));
    } catch (e) {
        res.status(500).json({ error: 'Failed to fetch menu' });
    }
});

// Add menu item
router.post('/menu', requireAdmin, async (req, res) => {
    try {
        const { name, description, price, category_id, image_url } = req.body;
        const item = await MenuItem.create({ name, description, price, category: category_id, image_url });
        res.json({ success: true, id: item._id });
    } catch (e) {
        res.status(500).json({ error: 'Failed to create item' });
    }
});

// Update menu item
router.put('/menu/:id', requireAdmin, async (req, res) => {
    try {
        const { name, description, price, category_id, image_url, available } = req.body;
        await MenuItem.findByIdAndUpdate(req.params.id, {
            name, description, price,
            category: category_id,
            image_url,
            available: available === 1 || available === true,
        });
        res.json({ success: true });
    } catch (e) {
        res.status(500).json({ error: 'Failed to update item' });
    }
});

// Soft-delete (hide) menu item
router.delete('/menu/:id', requireAdmin, async (req, res) => {
    try {
        await MenuItem.findByIdAndUpdate(req.params.id, { available: false });
        res.json({ success: true });
    } catch (e) {
        res.status(500).json({ error: 'Failed to remove item' });
    }
});

module.exports = router;
