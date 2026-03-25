const express = require('express');
const router = express.Router();
const { MenuItem, Category } = require('../models/db');

// Get all available menu items (optionally filter by category)
router.get('/', async (req, res) => {
    try {
        const filter = { available: true };
        if (req.query.category && req.query.category !== 'all') {
            filter.category = req.query.category;
        }
        const items = await MenuItem.find(filter).populate('category', 'name').lean();

        // Flatten so frontend gets category_name just like before
        const result = items.map(item => ({
            ...item,
            id: item._id,
            category_id: item.category?._id,
            category_name: item.category?.name || '',
        }));
        res.json(result);
    } catch (e) {
        res.status(500).json({ error: 'Failed to fetch menu' });
    }
});

// Get all categories
router.get('/categories', async (req, res) => {
    try {
        const cats = await Category.find().lean();
        res.json(cats.map(c => ({ ...c, id: c._id })));
    } catch (e) {
        res.status(500).json({ error: 'Failed to fetch categories' });
    }
});

// Get single menu item  — must come AFTER /categories
router.get('/:id', async (req, res) => {
    try {
        const item = await MenuItem.findById(req.params.id).populate('category', 'name').lean();
        if (!item) return res.status(404).json({ error: 'Not found' });
        res.json({ ...item, id: item._id, category_name: item.category?.name || '' });
    } catch (e) {
        res.status(500).json({ error: 'Error fetching item' });
    }
});

module.exports = router;
