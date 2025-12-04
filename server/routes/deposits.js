import express from 'express';
import { body, validationResult } from 'express-validator';
import Deposit from '../models/Deposit.js';
import Room from '../models/Room.js';
import { protect } from '../middleware/auth.js';
import { isManager } from '../middleware/roleCheck.js';

const router = express.Router();

console.log('[DEPOSITS] 💰 Deposit routes module loaded');

// @route   GET /api/deposits/:khataId
// @desc    Get all deposits for a room
// @access  Private
router.get('/:khataId', protect, async (req, res) => {
    try {
        const { khataId } = req.params;

        console.log(`[DEPOSITS] 📖 GET deposits - User: ${req.user.name}, KhataId: ${khataId}`);

        // Check if user belongs to this room
        if (req.user.khataId !== khataId) {
            console.log(`[DEPOSITS] ❌ Access denied - User khataId: ${req.user.khataId}, Requested: ${khataId}`);
            return res.status(403).json({ message: 'Access denied' });
        }

        const deposits = await Deposit.find({ khataId })
            .sort({ createdAt: -1 })
            .populate('userId', 'name email')
            .populate('approvedBy', 'name');

        console.log(`[DEPOSITS] ✅ Returning ${deposits.length} deposits`);
        res.json(deposits);
    } catch (error) {
        console.error('[DEPOSITS] ❌ Error fetching deposits:', error.message);
        res.status(500).json({ message: 'Server error fetching deposits' });
    }
});

// @route   POST /api/deposits/:khataId
// @desc    Create a new deposit
// @access  Private
router.post('/:khataId', [
    protect,
    body('amount').isNumeric().withMessage('Amount must be a number'),
    body('paymentMethod').isIn(['bKash', 'Nagad', 'Rocket', 'Cash', 'Bank Transfer']).withMessage('Invalid payment method'),
    body('transactionId').optional().isString()
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        console.log('[DEPOSITS] ❌ Validation errors:', errors.array());
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        const { khataId } = req.params;
        const { amount, paymentMethod, transactionId, screenshotUrl } = req.body;

        console.log(`[DEPOSITS] 💾 POST deposit - User: ${req.user.name}, Amount: ${amount}`);

        // Check if user belongs to this room
        if (req.user.khataId !== khataId) {
            console.log(`[DEPOSITS] ❌ Access denied - User khataId: ${req.user.khataId}, Requested: ${khataId}`);
            return res.status(403).json({ message: 'Access denied' });
        }

        const deposit = new Deposit({
            khataId,
            userId: req.user._id,
            userName: req.user.name,
            amount,
            paymentMethod,
            transactionId: transactionId || '',
            screenshotUrl: screenshotUrl || '',
            status: 'Pending'
        });

        await deposit.save();

        console.log(`[DEPOSITS] ✅ Deposit created - ID: ${deposit._id}`);
        res.status(201).json(deposit);
    } catch (error) {
        console.error('[DEPOSITS] ❌ Error creating deposit:', error.message);
        res.status(500).json({ message: 'Server error creating deposit' });
    }
});

// @route   PUT /api/deposits/:khataId/:depositId/approve
// @desc    Approve a deposit (Manager only)
// @access  Private (Manager)
router.put('/:khataId/:depositId/approve', [protect, isManager], async (req, res) => {
    try {
        const { khataId, depositId } = req.params;

        console.log(`[DEPOSITS] ✅ APPROVE deposit - Manager: ${req.user.name}, DepositId: ${depositId}`);

        // Check if user is manager of this room
        if (req.user.khataId !== khataId) {
            console.log(`[DEPOSITS] ❌ Access denied`);
            return res.status(403).json({ message: 'Access denied' });
        }

        const deposit = await Deposit.findOne({ _id: depositId, khataId });

        if (!deposit) {
            return res.status(404).json({ message: 'Deposit not found' });
        }

        deposit.status = 'Approved';
        deposit.approvedBy = req.user._id;
        deposit.approvedAt = new Date();

        await deposit.save();

        console.log(`[DEPOSITS] ✅ Deposit approved`);
        res.json(deposit);
    } catch (error) {
        console.error('[DEPOSITS] ❌ Error approving deposit:', error.message);
        res.status(500).json({ message: 'Server error approving deposit' });
    }
});

// @route   PUT /api/deposits/:khataId/:depositId/reject
// @desc    Reject a deposit (Manager only)
// @access  Private (Manager)
router.put('/:khataId/:depositId/reject', [protect, isManager], async (req, res) => {
    try {
        const { khataId, depositId } = req.params;
        const { reason } = req.body;

        console.log(`[DEPOSITS] ❌ REJECT deposit - Manager: ${req.user.name}, DepositId: ${depositId}`);

        // Check if user is manager of this room
        if (req.user.khataId !== khataId) {
            console.log(`[DEPOSITS] ❌ Access denied`);
            return res.status(403).json({ message: 'Access denied' });
        }

        const deposit = await Deposit.findOne({ _id: depositId, khataId });

        if (!deposit) {
            return res.status(404).json({ message: 'Deposit not found' });
        }

        deposit.status = 'Rejected';
        deposit.rejectionReason = reason || '';
        deposit.approvedBy = req.user._id;
        deposit.approvedAt = new Date();

        await deposit.save();

        console.log(`[DEPOSITS] ✅ Deposit rejected`);
        res.json(deposit);
    } catch (error) {
        console.error('[DEPOSITS] ❌ Error rejecting deposit:', error.message);
        res.status(500).json({ message: 'Server error rejecting deposit' });
    }
});

export default router;
