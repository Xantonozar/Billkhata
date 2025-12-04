import express from 'express';
import { body, validationResult } from 'express-validator';
import Expense from '../models/Expense.js';
import { protect } from '../middleware/auth.js';
import { isManager } from '../middleware/roleCheck.js';

const router = express.Router();

console.log('[EXPENSES] 🛒 Expense routes module loaded');

// @route   GET /api/expenses/:khataId
// @desc    Get all expenses for a room
// @access  Private
router.get('/:khataId', protect, async (req, res) => {
    try {
        const { khataId } = req.params;

        console.log(`[EXPENSES] 📖 GET expenses - User: ${req.user.name}, KhataId: ${khataId}`);

        // Check if user belongs to this room
        if (req.user.khataId !== khataId) {
            console.log(`[EXPENSES] ❌ Access denied - User khataId: ${req.user.khataId}, Requested: ${khataId}`);
            return res.status(403).json({ message: 'Access denied' });
        }

        const expenses = await Expense.find({ khataId })
            .sort({ createdAt: -1 })
            .populate('userId', 'name email')
            .populate('approvedBy', 'name');

        console.log(`[EXPENSES] ✅ Returning ${expenses.length} expenses`);
        res.json(expenses);
    } catch (error) {
        console.error('[EXPENSES] ❌ Error fetching expenses:', error.message);
        res.status(500).json({ message: 'Server error fetching expenses' });
    }
});

// @route   POST /api/expenses/:khataId
// @desc    Create a new expense
// @access  Private
router.post('/:khataId', [
    protect,
    body('amount').isNumeric().withMessage('Amount must be a number'),
    body('items').notEmpty().withMessage('Items list is required')
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        console.log('[EXPENSES] ❌ Validation errors:', errors.array());
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        const { khataId } = req.params;
        const { amount, items, notes, receiptUrl } = req.body;

        console.log(`[EXPENSES] 💾 POST expense - User: ${req.user.name}, Amount: ${amount}`);

        // Check if user belongs to this room
        if (req.user.khataId !== khataId) {
            console.log(`[EXPENSES] ❌ Access denied - User khataId: ${req.user.khataId}, Requested: ${khataId}`);
            return res.status(403).json({ message: 'Access denied' });
        }

        const expense = new Expense({
            khataId,
            userId: req.user._id,
            userName: req.user.name,
            amount,
            items,
            notes: notes || '',
            receiptUrl: receiptUrl || '',
            status: 'Pending'
        });

        await expense.save();

        console.log(`[EXPENSES] ✅ Expense created - ID: ${expense._id}`);
        res.status(201).json(expense);
    } catch (error) {
        console.error('[EXPENSES] ❌ Error creating expense:', error.message);
        res.status(500).json({ message: 'Server error creating expense' });
    }
});

// @route   PUT /api/expenses/:khataId/:expenseId/approve
// @desc    Approve an expense (Manager only)
// @access  Private (Manager)
router.put('/:khataId/:expenseId/approve', [protect, isManager], async (req, res) => {
    try {
        const { khataId, expenseId } = req.params;

        console.log(`[EXPENSES] ✅ APPROVE expense - Manager: ${req.user.name}, ExpenseId: ${expenseId}`);

        // Check if user is manager of this room
        if (req.user.khataId !== khataId) {
            console.log(`[EXPENSES] ❌ Access denied`);
            return res.status(403).json({ message: 'Access denied' });
        }

        const expense = await Expense.findOne({ _id: expenseId, khataId });

        if (!expense) {
            return res.status(404).json({ message: 'Expense not found' });
        }

        expense.status = 'Approved';
        expense.approvedBy = req.user._id;
        expense.approvedAt = new Date();

        await expense.save();

        console.log(`[EXPENSES] ✅ Expense approved`);
        res.json(expense);
    } catch (error) {
        console.error('[EXPENSES] ❌ Error approving expense:', error.message);
        res.status(500).json({ message: 'Server error approving expense' });
    }
});

// @route   PUT /api/expenses/:khataId/:expenseId/reject
// @desc    Reject an expense (Manager only)
// @access  Private (Manager)
router.put('/:khataId/:expenseId/reject', [protect, isManager], async (req, res) => {
    try {
        const { khataId, expenseId } = req.params;
        const { reason } = req.body;

        console.log(`[EXPENSES] ❌ REJECT expense - Manager: ${req.user.name}, ExpenseId: ${expenseId}`);

        // Check if user is manager of this room
        if (req.user.khataId !== khataId) {
            console.log(`[EXPENSES] ❌ Access denied`);
            return res.status(403).json({ message: 'Access denied' });
        }

        const expense = await Expense.findOne({ _id: expenseId, khataId });

        if (!expense) {
            return res.status(404).json({ message: 'Expense not found' });
        }

        expense.status = 'Rejected';
        expense.rejectionReason = reason || '';
        expense.approvedBy = req.user._id;
        expense.approvedAt = new Date();

        await expense.save();

        console.log(`[EXPENSES] ✅ Expense rejected`);
        res.json(expense);
    } catch (error) {
        console.error('[EXPENSES] ❌ Error rejecting expense:', error.message);
        res.status(500).json({ message: 'Server error rejecting expense' });
    }
});

export default router;
