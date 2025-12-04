import express from 'express';
import { body, validationResult } from 'express-validator';
import Bill from '../models/Bill.js';
import Room from '../models/Room.js';
import User from '../models/User.js';
import { protect } from '../middleware/auth.js';
import { isManager } from '../middleware/roleCheck.js';

const router = express.Router();

// @route   GET /api/bills/:roomId
// @desc    Get all bills for a room
// @access  Private
router.get('/:roomId', protect, async (req, res) => {
    try {
        const { roomId } = req.params;

        // Verify user belongs to this room
        if (req.user.khataId !== roomId) {
            return res.status(403).json({ message: 'Not authorized to view this room\'s bills' });
        }

        const bills = await Bill.find({ khataId: roomId })
            .populate('createdBy', 'name')
            .sort({ dueDate: -1 });

        // Convert to frontend format
        const formattedBills = bills.map(bill => ({
            id: bill._id,
            khataId: bill.khataId,
            title: bill.title,
            category: bill.category,
            totalAmount: bill.totalAmount,
            dueDate: bill.dueDate.toISOString().split('T')[0],
            description: bill.description,
            imageUrl: bill.imageUrl,
            createdBy: bill.createdBy._id,
            shares: bill.shares.map(share => ({
                userId: share.userId.toString(),
                userName: share.userName,
                amount: share.amount,
                status: share.status
            }))
        }));

        res.json(formattedBills);
    } catch (error) {
        console.error('Get bills error:', error);
        res.status(500).json({ message: 'Server error fetching bills' });
    }
});

// @route   POST /api/bills
// @desc    Create a new bill (Manager only)
// @access  Private (Manager)
router.post('/', [
    protect,
    isManager,
    body('title').trim().notEmpty().withMessage('Title is required'),
    body('category').isIn(['Rent', 'Electricity', 'Water', 'Gas', 'Wi-Fi', 'Maid', 'Others']).withMessage('Invalid category'),
    body('totalAmount').isNumeric().withMessage('Total amount must be a number'),
    body('dueDate').isISO8601().withMessage('Valid due date is required'),
    body('shares').isArray().withMessage('Shares must be an array')
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        const { title, category, totalAmount, dueDate, description, imageUrl, shares } = req.body;

        // Verify user has a room
        if (!req.user.khataId) {
            return res.status(400).json({ message: 'You must be in a room to create bills' });
        }

        // Verify room exists
        const room = await Room.findOne({ khataId: req.user.khataId });
        if (!room) {
            return res.status(404).json({ message: 'Room not found' });
        }

        // Verify user is the manager
        if (room.manager.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Only the room manager can create bills' });
        }

        // Create bill
        const bill = await Bill.create({
            khataId: req.user.khataId,
            title,
            category,
            totalAmount,
            dueDate,
            description,
            imageUrl,
            createdBy: req.user._id,
            shares: shares.map(share => ({
                userId: share.userId,
                userName: share.userName,
                amount: share.amount,
                status: share.status || 'Unpaid'
            }))
        });

        res.status(201).json({
            message: 'Bill created successfully',
            bill: {
                id: bill._id,
                khataId: bill.khataId,
                title: bill.title,
                category: bill.category,
                totalAmount: bill.totalAmount,
                dueDate: bill.dueDate.toISOString().split('T')[0],
                shares: bill.shares
            }
        });
    } catch (error) {
        console.error('Create bill error:', error);
        res.status(500).json({ message: 'Server error creating bill' });
    }
});

// @route   PUT /api/bills/:billId/share/:userId
// @desc    Update payment status for a bill share
// @access  Private
router.put('/:billId/share/:userId', [
    protect,
    body('status').isIn(['Unpaid', 'Pending Approval', 'Paid', 'Overdue']).withMessage('Invalid status')
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        const { billId, userId } = req.params;
        const { status } = req.body;

        const bill = await Bill.findById(billId);

        if (!bill) {
            return res.status(404).json({ message: 'Bill not found' });
        }

        // Verify user belongs to this room
        if (req.user.khataId !== bill.khataId) {
            return res.status(403).json({ message: 'Not authorized' });
        }

        // Find the share
        const shareIndex = bill.shares.findIndex(
            s => s.userId.toString() === userId
        );

        if (shareIndex === -1) {
            return res.status(404).json({ message: 'Share not found' });
        }

        // Update status
        bill.shares[shareIndex].status = status;
        await bill.save();

        res.json({
            message: 'Payment status updated successfully',
            share: bill.shares[shareIndex]
        });
    } catch (error) {
        console.error('Update bill status error:', error);
        res.status(500).json({ message: 'Server error updating payment status' });
    }
});

// @route   GET /api/bills/:roomId/stats
// @desc    Get bill statistics for dashboard
// @access  Private
router.get('/:roomId/stats', protect, async (req, res) => {
    try {
        const { roomId } = req.params;

        // Verify user belongs to this room
        if (req.user.khataId !== roomId) {
            return res.status(403).json({ message: 'Not authorized' });
        }

        const bills = await Bill.find({ khataId: roomId });

        // Calculate stats
        let totalUnpaid = 0;
        let totalPaid = 0;
        let totalOverdue = 0;
        let pendingApprovals = 0;

        bills.forEach(bill => {
            bill.shares.forEach(share => {
                if (share.userId.toString() === req.user._id.toString()) {
                    switch (share.status) {
                        case 'Unpaid':
                            totalUnpaid += share.amount;
                            break;
                        case 'Paid':
                            totalPaid += share.amount;
                            break;
                        case 'Overdue':
                            totalOverdue += share.amount;
                            break;
                        case 'Pending Approval':
                            pendingApprovals += 1;
                            break;
                    }
                }
            });
        });

        res.json({
            totalUnpaid,
            totalPaid,
            totalOverdue,
            pendingApprovals
        });
    } catch (error) {
        console.error('Get stats error:', error);
        res.status(500).json({ message: 'Server error fetching statistics' });
    }
});

// @route   DELETE /api/bills/:billId
// @desc    Delete a bill (Manager only)
// @access  Private (Manager)
router.delete('/:billId', [protect, isManager], async (req, res) => {
    try {
        const { billId } = req.params;

        const bill = await Bill.findById(billId);

        if (!bill) {
            return res.status(404).json({ message: 'Bill not found' });
        }

        // Verify user is manager of this room
        if (req.user.khataId !== bill.khataId) {
            return res.status(403).json({ message: 'Not authorized to delete this bill' });
        }

        await Bill.findByIdAndDelete(billId);

        res.json({ message: 'Bill deleted successfully' });
    } catch (error) {
        console.error('Delete bill error:', error);
        res.status(500).json({ message: 'Server error deleting bill' });
    }
});

// @route   PUT /api/bills/:billId
// @desc    Update bill details (Manager only)
// @access  Private (Manager)
router.put('/:billId', [
    protect,
    isManager,
    body('title').optional().trim().notEmpty().withMessage('Title cannot be empty'),
    body('category').optional().isIn(['Rent', 'Electricity', 'Water', 'Gas', 'Wi-Fi', 'Maid', 'Others']).withMessage('Invalid category'),
    body('totalAmount').optional().isNumeric().withMessage('Total amount must be a number'),
    body('dueDate').optional().isISO8601().withMessage('Valid due date is required'),
    body('shares').optional().isArray().withMessage('Shares must be an array')
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        const { billId } = req.params;
        const { title, category, totalAmount, dueDate, description, imageUrl, shares } = req.body;

        const bill = await Bill.findById(billId);

        if (!bill) {
            return res.status(404).json({ message: 'Bill not found' });
        }

        // Verify user is manager of this room
        if (req.user.khataId !== bill.khataId) {
            return res.status(403).json({ message: 'Not authorized to update this bill' });
        }

        // Update fields
        if (title !== undefined) bill.title = title;
        if (category !== undefined) bill.category = category;
        if (totalAmount !== undefined) bill.totalAmount = totalAmount;
        if (dueDate !== undefined) bill.dueDate = dueDate;
        if (description !== undefined) bill.description = description;
        if (imageUrl !== undefined) bill.imageUrl = imageUrl;
        if (shares !== undefined) {
            bill.shares = shares.map(share => ({
                userId: share.userId,
                userName: share.userName,
                amount: share.amount,
                status: share.status || 'Unpaid'
            }));
        }

        await bill.save();

        res.json({
            message: 'Bill updated successfully',
            bill: {
                id: bill._id,
                khataId: bill.khataId,
                title: bill.title,
                category: bill.category,
                totalAmount: bill.totalAmount,
                dueDate: bill.dueDate.toISOString().split('T')[0],
                description: bill.description,
                imageUrl: bill.imageUrl,
                shares: bill.shares.map(share => ({
                    userId: share.userId.toString(),
                    userName: share.userName,
                    amount: share.amount,
                    status: share.status
                }))
            }
        });
    } catch (error) {
        console.error('Update bill error:', error);
        res.status(500).json({ message: 'Server error updating bill' });
    }
});

// @route   POST /api/bills/:billId/remind
// @desc    Send payment reminder notifications (Manager only)
// @access  Private (Manager)
router.post('/:billId/remind', [protect, isManager], async (req, res) => {
    try {
        const { billId } = req.params;

        const bill = await Bill.findById(billId);

        if (!bill) {
            return res.status(404).json({ message: 'Bill not found' });
        }

        // Verify user is manager of this room
        if (req.user.khataId !== bill.khataId) {
            return res.status(403).json({ message: 'Not authorized to send reminders for this bill' });
        }

        // Import Notification model
        const Notification = (await import('../models/Notification.js')).default;

        // Find unpaid shares
        const unpaidShares = bill.shares.filter(share =>
            share.status === 'Unpaid' || share.status === 'Overdue'
        );

        if (unpaidShares.length === 0) {
            return res.json({ message: 'No unpaid shares to remind', count: 0 });
        }

        // Create notifications for each unpaid member
        const notifications = await Promise.all(
            unpaidShares.map(share =>
                Notification.create({
                    userId: share.userId,
                    type: 'payment_reminder',
                    title: 'Payment Reminder',
                    message: `Reminder: You have an unpaid ${bill.category} bill "${bill.title}" of ৳${share.amount.toFixed(2)}. Due date: ${new Date(bill.dueDate).toLocaleDateString()}`,
                    read: false
                })
            )
        );

        res.json({
            message: 'Payment reminders sent successfully',
            count: notifications.length
        });
    } catch (error) {
        console.error('Send reminder error:', error);
        res.status(500).json({ message: 'Server error sending reminders' });
    }
});

export default router;
