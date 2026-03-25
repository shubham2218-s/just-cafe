const express = require('express');
const router = express.Router();
const { Order, MenuItem } = require('../models/db');

function requireAuth(req, res, next) {
    if (!req.session.userId) return res.status(401).json({ error: 'Not authenticated' });
    next();
}

// Place an order
router.post('/', requireAuth, async (req, res) => {
    const { items } = req.body; // [{ menu_item_id, quantity }]
    if (!items || !items.length)
        return res.status(400).json({ error: 'No items provided' });

    try {
        const ids = items.map(i => i.menu_item_id);
        const menuItems = await MenuItem.find({ _id: { $in: ids } }).lean();

        let total = 0;
        const orderItems = items.map(item => {
            const mi = menuItems.find(m => m._id.toString() === item.menu_item_id);
            if (!mi) return null;
            total += mi.price * item.quantity;
            return {
                menu_item:      mi._id,
                menu_item_name: mi.name,
                quantity:       item.quantity,
                price_at_time:  mi.price,
            };
        }).filter(Boolean);

        if (!orderItems.length)
            return res.status(400).json({ error: 'No valid items found' });

        const waitMinutes = Math.floor(Math.random() * 10) + 5;

        const order = await Order.create({
            user:                   req.session.userId,
            items:                  orderItems,
            total_price:            parseFloat(total.toFixed(2)),
            estimated_wait_minutes: waitMinutes,
        });

        res.json({ success: true, orderId: order._id, total: total.toFixed(2), waitMinutes });
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: 'Failed to place order' });
    }
});

// Get current user's orders
router.get('/my', requireAuth, async (req, res) => {
    try {
        const orders = await Order.find({ user: req.session.userId })
            .sort({ createdAt: -1 })
            .lean();

        const result = orders.map(o => ({
            ...o,
            id: o._id,
            order_time: o.createdAt,
            items_summary: o.items.map(i => `${i.menu_item_name} x${i.quantity}`).join(', '),
        }));

        res.json(result);
    } catch (e) {
        res.status(500).json({ error: 'Failed to fetch orders' });
    }
});

module.exports = router;
