import express from 'express';
import { body, validationResult } from 'express-validator';
import Menu from '../models/Menu.js';
import { protect } from '../middleware/auth.js';
import { isManager } from '../middleware/roleCheck.js';

const router = express.Router();

console.log('[MENU] 🍽️  Menu routes module loaded');

// Helper function to get the start of the current week (Monday)
const getWeekStart = (date = new Date()) => {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Adjust when day is Sunday
    return new Date(d.setDate(diff));
};

// @route   GET /api/menu/:khataId
// @desc    Get menu for a room (current week)
// @access  Private
router.get('/:khataId', protect, async (req, res) => {
    try {
        const { khataId } = req.params;

        // Check if user belongs to this room
        console.log(`[MENU] 📖 GET request - User: ${req.user.name} (${req.user._id}), KhataId: ${khataId}`);

        if (req.user.khataId !== khataId) {
            console.log(`[MENU] ❌ Access denied - User khataId: ${req.user.khataId}, Requested: ${khataId}`);
            return res.status(403).json({ message: 'Access denied' });
        }

        const weekStart = getWeekStart();
        weekStart.setHours(0, 0, 0, 0);

        console.log(`[MENU] 📅 Week start calculated: ${weekStart.toISOString()}`);

        // Try to find menu for current week
        let menu = await Menu.findOne({
            khataId,
            weekStart,
            isPermanent: false
        });

        if (menu) {
            console.log(`[MENU] ✅ Found current week menu - ${menu.items.length} days`);
        } else {
            console.log(`[MENU] ⚠️  No current week menu found, checking for permanent menu`);
            // If no menu for current week, try to find permanent menu
            menu = await Menu.findOne({
                khataId,
                isPermanent: true
            });

            if (menu) {
                console.log(`[MENU] ✅ Found permanent menu - ${menu.items.length} days`);
            } else {
                console.log(`[MENU] 📭 No menu found, returning empty array`);
                return res.json([]);
            }
        }

        console.log(`[MENU] ✅ Returning menu with ${menu.items.length} items`);
        res.json(menu.items);
    } catch (error) {
        console.error('[MENU] ❌ Error fetching menu:', error.message);
        console.error('[MENU] Stack trace:', error.stack);
        res.status(500).json({ message: 'Server error fetching menu' });
    }
});

// @route   POST /api/menu/:khataId
// @desc    Create or update menu for current week
// @access  Private (Manager only)
router.post('/:khataId', [
    protect,
    isManager,
    body('items.*.day').notEmpty().withMessage('Day is required'),
    body('isPermanent').optional().isBoolean()
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        console.log('[MENU] ❌ Validation errors:', errors.array());
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        const { khataId } = req.params;
        const { items, isPermanent = false } = req.body;

        console.log(`[MENU] 💾 POST request - User: ${req.user.name} (${req.user._id})`);
        console.log(`[MENU] 📝 KhataId: ${khataId}, Items count: ${items.length}, Permanent: ${isPermanent}`);

        // Check if user is manager of this room
        if (req.user.khataId !== khataId) {
            console.log(`[MENU] ❌ Access denied - User khataId: ${req.user.khataId}, Requested: ${khataId}`);
            return res.status(403).json({ message: 'Access denied' });
        }

        if (isPermanent) {
            // Update or create permanent menu
            console.log(`[MENU] 🔒 Saving permanent menu`);
            const menu = await Menu.findOneAndUpdate(
                { khataId, isPermanent: true },
                { khataId, items, isPermanent: true, weekStart: new Date() },
                { upsert: true, new: true }
            );
            console.log(`[MENU] ✅ Permanent menu saved successfully - ID: ${menu._id}`);
            return res.json({ message: 'Permanent menu saved', items: menu.items });
        } else {
            // Update or create menu for current week
            const weekStart = getWeekStart();
            weekStart.setHours(0, 0, 0, 0);

            console.log(`[MENU] 📅 Saving weekly menu for week starting: ${weekStart.toISOString()}`);
            const menu = await Menu.findOneAndUpdate(
                { khataId, weekStart, isPermanent: false },
                { khataId, items, weekStart, isPermanent: false },
                { upsert: true, new: true }
            );
            console.log(`[MENU] ✅ Weekly menu saved successfully - ID: ${menu._id}`);
            return res.json({ message: 'Menu saved for this week', items: menu.items });
        }
    } catch (error) {
        console.error('[MENU] ❌ Error saving menu:', error.message);
        console.error('[MENU] Stack trace:', error.stack);
        res.status(500).json({ message: 'Server error saving menu' });
    }
});

// @route   PUT /api/menu/:khataId/day/:day
// @desc    Update menu for a specific day
// @access  Private (Manager only)
router.put('/:khataId/day/:day', [
    protect,
    isManager,
    body('breakfast').optional().isString(),
    body('lunch').optional().isString(),
    body('dinner').optional().isString()
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        console.log('[MENU] ❌ Validation errors:', errors.array());
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        const { khataId, day } = req.params;
        const { breakfast, lunch, dinner } = req.body;

        console.log(`[MENU] ✏️  PUT request - User: ${req.user.name} (${req.user._id})`);
        console.log(`[MENU] 📝 Updating ${day} menu for KhataId: ${khataId}`);
        console.log(`[MENU] 🍽️  Breakfast: ${breakfast || 'not set'}, Lunch: ${lunch || 'not set'}, Dinner: ${dinner || 'not set'}`);

        // Check if user is manager of this room
        if (req.user.khataId !== khataId) {
            console.log(`[MENU] ❌ Access denied - User khataId: ${req.user.khataId}, Requested: ${khataId}`);
            return res.status(403).json({ message: 'Access denied' });
        }

        const weekStart = getWeekStart();
        weekStart.setHours(0, 0, 0, 0);

        console.log(`[MENU] 📅 Week start: ${weekStart.toISOString()}`);

        // Find or create menu for current week
        let menu = await Menu.findOne({
            khataId,
            weekStart,
            isPermanent: false
        });

        if (!menu) {
            // Create new menu with all days
            console.log(`[MENU] 🆕 No existing menu found, creating new menu for the week`);
            const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
            const items = daysOfWeek.map(d => ({
                day: d,
                breakfast: d === day ? (breakfast || '') : '',
                lunch: d === day ? (lunch || '') : '',
                dinner: d === day ? (dinner || '') : ''
            }));

            menu = await Menu.create({
                khataId,
                weekStart,
                items,
                isPermanent: false
            });
        } else {
            // Update existing menu
            const dayIndex = menu.items.findIndex(item => item.day === day);
            if (dayIndex !== -1) {
                if (breakfast !== undefined) menu.items[dayIndex].breakfast = breakfast;
                if (lunch !== undefined) menu.items[dayIndex].lunch = lunch;
                if (dinner !== undefined) menu.items[dayIndex].dinner = dinner;
            } else {
                menu.items.push({ day, breakfast: breakfast || '', lunch: lunch || '', dinner: dinner || '' });
            }
            await menu.save();
        }

        console.log(`[MENU] ✅ Menu updated successfully for ${day}`);
        res.json({ message: 'Menu updated', items: menu.items });
    } catch (error) {
        console.error('[MENU] ❌ Update menu error:', error.message);
        console.error('[MENU] Stack trace:', error.stack);
        res.status(500).json({ message: 'Server error updating menu' });
    }
});

export default router;

