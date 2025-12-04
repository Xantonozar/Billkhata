import express from 'express';
import { body, validationResult } from 'express-validator';
import ShoppingDuty from '../models/ShoppingDuty.js';
import Room from '../models/Room.js';
import Deposit from '../models/Deposit.js';
import Expense from '../models/Expense.js';
import { protect } from '../middleware/auth.js';
import { isManager } from '../middleware/roleCheck.js';

const router = express.Router();

console.log('[SHOPPING] 🛒 Shopping routes module loaded');

// Helper function to get the start of the current week (Monday)
const getWeekStart = (date = new Date()) => {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    return new Date(d.setDate(diff));
};

// @route   GET /api/shopping/:khataId/roster
// @desc    Get shopping duty roster for current week
// @access  Private
router.get('/:khataId/roster', protect, async (req, res) => {
    try {
        const { khataId } = req.params;

        console.log(`[SHOPPING] 📖 GET roster - User: ${req.user.name}, KhataId: ${khataId}`);

        // Check if user belongs to this room
        if (req.user.khataId !== khataId) {
            console.log(`[SHOPPING] ❌ Access denied - User khataId: ${req.user.khataId}, Requested: ${khataId}`);
            return res.status(403).json({ message: 'Access denied' });
        }

        const weekStart = getWeekStart();
        weekStart.setHours(0, 0, 0, 0);

        console.log(`[SHOPPING] 📅 Week start: ${weekStart.toISOString()}`);

        // Find shopping duty for current week
        let shoppingDuty = await ShoppingDuty.findOne({
            khataId,
            weekStart
        });

        if (!shoppingDuty) {
            console.log(`[SHOPPING] 📭 No roster found, returning empty`);
            return res.json({ items: [] });
        }

        console.log(`[SHOPPING] ✅ Returning roster with ${shoppingDuty.items.length} items`);
        res.json({ items: shoppingDuty.items });
    } catch (error) {
        console.error('[SHOPPING] ❌ Error fetching roster:', error.message);
        res.status(500).json({ message: 'Server error fetching shopping roster' });
    }
});

// @route   POST /api/shopping/:khataId/roster
// @desc    Create or update shopping duty roster
// @access  Private (Manager only)
router.post('/:khataId/roster', [
    protect,
    isManager,
    body('items').isArray().withMessage('Items must be an array'),
    body('items.*.day').notEmpty().withMessage('Day is required'),
    body('items.*.userId').optional(),
    body('items.*.userName').optional()
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        console.log('[SHOPPING] ❌ Validation errors:', errors.array());
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        const { khataId } = req.params;
        const { items } = req.body;

        console.log(`[SHOPPING] 💾 POST roster - User: ${req.user.name}, KhataId: ${khataId}`);

        // Check if user is manager of this room
        if (req.user.khataId !== khataId) {
            console.log(`[SHOPPING] ❌ Access denied - User khataId: ${req.user.khataId}, Requested: ${khataId}`);
            return res.status(403).json({ message: 'Access denied' });
        }

        const weekStart = getWeekStart();
        weekStart.setHours(0, 0, 0, 0);

        console.log(`[SHOPPING] 📅 Saving roster for week starting: ${weekStart.toISOString()}`);

        // Update or create shopping duty for current week
        const shoppingDuty = await ShoppingDuty.findOneAndUpdate(
            { khataId, weekStart },
            { khataId, items, weekStart },
            { upsert: true, new: true }
        );

        console.log(`[SHOPPING] ✅ Roster saved successfully - ID: ${shoppingDuty._id}`);
        res.json({ message: 'Shopping roster saved', items: shoppingDuty.items });
    } catch (error) {
        console.error('[SHOPPING] ❌ Error saving roster:', error.message);
        res.status(500).json({ message: 'Server error saving shopping roster' });
    }
});

// @route   GET /api/shopping/:khataId/members
// @desc    Get all approved members for a room (for dropdown)
// @access  Private
router.get('/:khataId/members', protect, async (req, res) => {
    try {
        const { khataId } = req.params;

        console.log(`[SHOPPING] 👥 GET members - KhataId: ${khataId}`);

        // Check access
        if (req.user.khataId !== khataId) {
            return res.status(403).json({ message: 'Access denied' });
        }

        // Find room and get members
        const room = await Room.findOne({ khataId })
            .populate('members.user', 'name email')
            .populate('manager', 'name email');

        if (!room) {
            return res.status(404).json({ message: 'Room not found' });
        }

        // Get approved members
        const approvedMembers = room.members
            .filter(m => m.status === 'Approved')
            .map(m => ({
                id: m.user._id,
                name: m.user.name
            }));

        // Manager is excluded from shopping duty as per requirement

        console.log(`[SHOPPING] ✅ Returning ${approvedMembers.length} members`);
        res.json(approvedMembers);
    } catch (error) {
        console.error('[SHOPPING] ❌ Error fetching members:', error.message);
        res.status(500).json({ message: 'Server error fetching members' });
    }
});

// @route   GET /api/shopping/:khataId/summary
// @desc    Get financial summary for the khata
// @access  Private
router.get('/:khataId/summary', protect, async (req, res) => {
    try {
        const { khataId } = req.params;

        // Check if user belongs to this room
        if (req.user.khataId !== khataId) {
            return res.status(403).json({ message: 'Access denied' });
        }

        // Calculate Total Deposits (Approved only)
        const depositStats = await Deposit.aggregate([
            { $match: { khataId, status: 'Approved' } },
            { $group: { _id: null, total: { $sum: '$amount' } } }
        ]);
        const totalDeposits = depositStats.length > 0 ? depositStats[0].total : 0;

        // Calculate Total Shopping (Approved only)
        const expenseStats = await Expense.aggregate([
            { $match: { khataId, status: 'Approved' } },
            { $group: { _id: null, total: { $sum: '$amount' } } }
        ]);
        const totalShopping = expenseStats.length > 0 ? expenseStats[0].total : 0;

        const balance = totalDeposits - totalShopping;

        // Get total meals for all members
        const Meal = (await import('../models/Meal.js')).default;
        const mealStats = await Meal.aggregate([
            { $match: { khataId } },
            { $group: { _id: null, total: { $sum: '$totalMeals' } } }
        ]);
        const totalMeals = mealStats.length > 0 ? mealStats[0].total : 0;

        // Calculate rate - total shopping / total meals
        const rate = totalMeals > 0 ? (totalShopping / totalMeals) : 0;

        // Member specific stats
        const memberDepositStats = await Deposit.aggregate([
            { $match: { khataId, userId: req.user._id, status: 'Approved' } },
            { $group: { _id: null, total: { $sum: '$amount' } } }
        ]);
        const memberTotalDeposits = memberDepositStats.length > 0 ? memberDepositStats[0].total : 0;

        // Get member's total meals
        const memberMealStats = await Meal.aggregate([
            { $match: { khataId, userId: req.user._id } },
            { $group: { _id: null, total: { $sum: '$totalMeals' } } }
        ]);
        const memberTotalMeals = memberMealStats.length > 0 ? memberMealStats[0].total : 0;

        // Member meal cost = rate * member's total meals
        const memberMealCost = rate * memberTotalMeals;
        const memberRefundable = memberTotalDeposits - memberMealCost;

        res.json({
            fundStatus: {
                totalDeposits,
                totalShopping,
                balance,
                rate
            },
            memberSummary: {
                totalDeposits: memberTotalDeposits,
                mealCost: memberMealCost,
                refundable: memberRefundable
            }
        });

    } catch (error) {
        console.error('Error fetching shopping summary:', error);
        res.status(500).json({ message: 'Server error fetching summary' });
    }
});

export default router;

