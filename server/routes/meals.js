import express from 'express';
import Meal from '../models/Meal.js';
import MealFinalization from '../models/MealFinalization.js';
import { protect } from '../middleware/auth.js';
import { isManager } from '../middleware/roleCheck.js';

const router = express.Router();

console.log('[MEALS] 🍽️ Meal routes module loaded');

// @route   GET /api/meals/:khataId
// @desc    Get all meals for a khata (with optional date filtering)
// @access  Private
router.get('/:khataId', protect, async (req, res) => {
    try {
        const { khataId } = req.params;
        const { startDate, endDate } = req.query;

        console.log(`[MEALS] 📖 GET meals - User: ${req.user.name}, KhataId: ${khataId}`);

        // Check if user belongs to this room
        if (req.user.khataId !== khataId) {
            return res.status(403).json({ message: 'Access denied' });
        }

        // Build query
        const query = { khataId };
        if (startDate || endDate) {
            query.date = {};
            if (startDate) query.date.$gte = new Date(startDate);
            if (endDate) query.date.$lte = new Date(endDate);
        }

        const meals = await Meal.find(query).sort({ date: -1 });
        res.json(meals);

    } catch (error) {
        console.error('Error fetching meals:', error);
        res.status(500).json({ message: 'Server error fetching meals' });
    }
});

// @route   GET /api/meals/:khataId/user/:userId
// @desc    Get meals for a specific user
// @access  Private
router.get('/:khataId/user/:userId', protect, async (req, res) => {
    try {
        const { khataId, userId } = req.params;

        console.log(`[MEALS] 👤 GET user meals - User: ${req.user.name}, KhataId: ${khataId}, TargetUser: ${userId}`);

        // Check if user belongs to this room
        if (req.user.khataId !== khataId) {
            return res.status(403).json({ message: 'Access denied' });
        }

        const meals = await Meal.find({ khataId, userId }).sort({ date: -1 });
        res.json(meals);

    } catch (error) {
        console.error('Error fetching user meals:', error);
        res.status(500).json({ message: 'Server error fetching user meals' });
    }
});

// @route   POST /api/meals/:khataId
// @desc    Submit/update meal entry for a day
// @access  Private
router.post('/:khataId', protect, async (req, res) => {
    try {
        const { khataId } = req.params;
        const { date, breakfast, lunch, dinner, userId, userName } = req.body;

        console.log(`[MEALS] ✍️ POST meal - User: ${req.user.name}, Date: ${date}, TargetUser: ${userId || req.user._id}`);

        // Check if user belongs to this room
        if (req.user.khataId !== khataId) {
            return res.status(403).json({ message: 'Access denied' });
        }

        // Validate date
        if (!date) {
            return res.status(400).json({ message: 'Date is required' });
        }

        const mealDate = new Date(date);
        mealDate.setHours(0, 0, 0, 0);

        // Check if the date is finalized
        const finalization = await MealFinalization.findOne({
            khataId,
            date: mealDate
        });

        // Determine target user
        let targetUserId = req.user._id;
        let targetUserName = req.user.name;

        // If userId is provided and different from current user, check permissions
        if (userId && userId !== req.user._id.toString()) {
            // Only managers can update other users' meals
            if (req.user.role !== 'Manager') {
                console.log(`[MEALS] ⛔ Access denied: Member ${req.user.name} tried to update meal for ${userId}`);
                return res.status(403).json({ message: 'Only managers can update other members\' meals' });
            }
            targetUserId = userId;
            // If manager is updating, we need the target user's name. 
            // If provided in body use it, otherwise we might need to fetch it or rely on existing meal.
            // For now, we'll rely on what's passed or existing data.
            if (userName) targetUserName = userName;
        } else {
            // Current user is updating their own meal
            // Check if finalized AND user is not a manager
            if (finalization && req.user.role !== 'Manager') {
                console.log(`[MEALS] ⛔ Access denied: Date is finalized, member ${req.user.name} cannot update`);
                return res.status(403).json({
                    message: 'This date has been finalized by the manager. You cannot update your meals.',
                    isFinalized: true
                });
            }
        }

        // Find existing meal entry or create new one
        let meal = await Meal.findOne({
            khataId,
            userId: targetUserId,
            date: mealDate
        });

        if (meal) {
            // Update existing meal
            meal.breakfast = breakfast !== undefined ? breakfast : meal.breakfast;
            meal.lunch = lunch !== undefined ? lunch : meal.lunch;
            meal.dinner = dinner !== undefined ? dinner : meal.dinner;
            await meal.save();
        } else {
            // Create new meal entry
            meal = await Meal.create({
                khataId,
                userId: targetUserId,
                userName: targetUserName, // This might be incorrect if manager creates new meal for user without passing name
                date: mealDate,
                breakfast: breakfast || 0,
                lunch: lunch || 0,
                dinner: dinner || 0
            });
        }

        console.log(`[MEALS] ✅ Meal saved - User: ${targetUserName}, Total: ${meal.totalMeals}`);
        res.status(201).json(meal);

    } catch (error) {
        console.error('Error saving meal:', error);
        res.status(500).json({ message: 'Server error saving meal' });
    }
});

// @route   GET /api/meals/:khataId/summary
// @desc    Get meal statistics for the khata
// @access  Private
router.get('/:khataId/summary', protect, async (req, res) => {
    try {
        const { khataId } = req.params;

        console.log(`[MEALS] 📊 GET summary - User: ${req.user.name}, KhataId: ${khataId}`);

        // Check if user belongs to this room
        if (req.user.khataId !== khataId) {
            return res.status(403).json({ message: 'Access denied' });
        }

        // Calculate total meals for the khata
        const totalMealsStats = await Meal.aggregate([
            { $match: { khataId } },
            { $group: { _id: null, total: { $sum: '$totalMeals' } } }
        ]);
        const totalMeals = totalMealsStats.length > 0 ? totalMealsStats[0].total : 0;

        // Calculate per-user meal counts
        const userMealsStats = await Meal.aggregate([
            { $match: { khataId } },
            {
                $group: {
                    _id: '$userId',
                    userName: { $first: '$userName' },
                    totalMeals: { $sum: '$totalMeals' },
                    breakfast: { $sum: { $cond: ['$breakfast', 1, 0] } },
                    lunch: { $sum: { $cond: ['$lunch', 1, 0] } },
                    dinner: { $sum: { $cond: ['$dinner', 1, 0] } }
                }
            },
            { $sort: { userName: 1 } }
        ]);

        // Get current user's meal count
        const currentUserStats = await Meal.aggregate([
            { $match: { khataId, userId: req.user._id } },
            { $group: { _id: null, total: { $sum: '$totalMeals' } } }
        ]);
        const currentUserMeals = currentUserStats.length > 0 ? currentUserStats[0].total : 0;

        res.json({
            totalMeals,
            currentUserMeals,
            userMeals: userMealsStats
        });

    } catch (error) {
        console.error('Error fetching meal summary:', error);
        res.status(500).json({ message: 'Server error fetching meal summary' });
    }
});

// @route   POST /api/meals/:khataId/finalize
// @desc    Finalize meals for a specific date (manager only)
// @access  Private (Manager)
router.post('/:khataId/finalize', protect, isManager, async (req, res) => {
    try {
        const { khataId } = req.params;
        const { date } = req.body;

        console.log(`[MEALS] 🔒 POST finalize - User: ${req.user.name}, Date: ${date}`);

        // Check if user belongs to this room and is manager
        if (req.user.khataId !== khataId) {
            return res.status(403).json({ message: 'Access denied' });
        }

        // Validate date
        if (!date) {
            return res.status(400).json({ message: 'Date is required' });
        }

        const finalizeDate = new Date(date);
        finalizeDate.setHours(0, 0, 0, 0);

        // Check if already finalized
        let finalization = await MealFinalization.findOne({
            khataId,
            date: finalizeDate
        });

        if (finalization) {
            return res.status(200).json({ message: 'Already finalized', finalization });
        }

        // Create finalization record
        finalization = await MealFinalization.create({
            khataId,
            date: finalizeDate,
            finalizedBy: req.user._id,
            finalizedByName: req.user.name
        });

        console.log(`[MEALS] ✅ Finalized - Date: ${finalizeDate.toISOString()}, By: ${req.user.name}`);
        res.status(201).json(finalization);

    } catch (error) {
        console.error('Error finalizing meals:', error);
        res.status(500).json({ message: 'Server error finalizing meals' });
    }
});

// @route   GET /api/meals/:khataId/finalization/:date
// @desc    Check if a specific date is finalized
// @access  Private
router.get('/:khataId/finalization/:date', protect, async (req, res) => {
    try {
        const { khataId, date } = req.params;

        // Check if user belongs to this room
        if (req.user.khataId !== khataId) {
            return res.status(403).json({ message: 'Access denied' });
        }

        const checkDate = new Date(date);
        checkDate.setHours(0, 0, 0, 0);

        const finalization = await MealFinalization.findOne({
            khataId,
            date: checkDate
        });

        if (finalization) {
            res.json({ isFinalized: true, finalization });
        } else {
            res.json({ isFinalized: false });
        }

    } catch (error) {
        console.error('Error checking finalization:', error);
        res.status(500).json({ message: 'Server error checking finalization' });
    }
});

export default router;

