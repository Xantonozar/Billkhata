import express from 'express';
import { body, validationResult } from 'express-validator';
import Room from '../models/Room.js';
import User from '../models/User.js';
import { protect } from '../middleware/auth.js';
import { isManager } from '../middleware/roleCheck.js';

const router = express.Router();

// @route   POST /api/rooms/create
// @desc    Create a new room (Manager only)
// @access  Private (Manager)
router.post('/create', [
    protect,
    isManager,
    body('name').trim().notEmpty().withMessage('Room name is required'),
    body('khataId').trim().notEmpty().withMessage('Khata ID is required')
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        const { name, khataId } = req.body;

        // Check if room already exists
        const roomExists = await Room.findOne({ khataId });
        if (roomExists) {
            return res.status(400).json({ message: 'Room with this Khata ID already exists' });
        }

        // Check if user already has a room
        if (req.user.khataId) {
            return res.status(400).json({ message: 'You already have a room' });
        }

        // Create room
        const room = await Room.create({
            name,
            khataId,
            manager: req.user._id,
            members: []
        });

        // Update user
        await User.findByIdAndUpdate(req.user._id, {
            khataId,
            roomStatus: 'Approved'
        });

        res.status(201).json({
            message: 'Room created successfully',
            room: {
                id: room._id,
                name: room.name,
                khataId: room.khataId
            }
        });
    } catch (error) {
        console.error('Create room error:', error);
        res.status(500).json({ message: 'Server error creating room' });
    }
});

// @route   POST /api/rooms/join
// @desc    Request to join a room
// @access  Private
router.post('/join', [
    protect,
    body('khataId').trim().notEmpty().withMessage('Khata ID is required')
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        const { khataId } = req.body;

        // Check if room exists
        const room = await Room.findOne({ khataId });
        if (!room) {
            return res.status(404).json({ message: 'Room not found' });
        }

        // Check if user already in a room
        if (req.user.khataId) {
            return res.status(400).json({ message: 'You are already in a room' });
        }

        // Check if already requested
        const alreadyRequested = room.members.some(
            m => m.user.toString() === req.user._id.toString()
        );
        if (alreadyRequested) {
            return res.status(400).json({ message: 'Join request already pending' });
        }

        // Add member with pending status
        room.members.push({
            user: req.user._id,
            status: 'Pending'
        });
        await room.save();

        // Update user status
        await User.findByIdAndUpdate(req.user._id, {
            khataId,
            roomStatus: 'Pending'
        });

        res.json({ message: 'Join request sent successfully' });
    } catch (error) {
        console.error('Join room error:', error);
        res.status(500).json({ message: 'Server error joining room' });
    }
});

// @route   GET /api/rooms/:roomId/members
// @desc    Get all members of a room
// @access  Private
router.get('/:roomId/members', protect, async (req, res) => {
    try {
        const { roomId } = req.params;

        const room = await Room.findOne({ khataId: roomId })
            .populate('members.user', 'name email');

        if (!room) {
            return res.status(404).json({ message: 'Room not found' });
        }

        // Only return approved members
        const approvedMembers = room.members
            .filter(m => m.status === 'Approved')
            .map(m => ({
                id: m.user._id,
                name: m.user.name,
                email: m.user.email,
                joinedAt: m.joinedAt
            }));

        res.json(approvedMembers);
    } catch (error) {
        console.error('Get members error:', error);
        res.status(500).json({ message: 'Server error fetching members' });
    }
});

// @route   GET /api/rooms/:roomId/pending
// @desc    Get pending join requests (Manager only)
// @access  Private (Manager)
router.get('/:roomId/pending', protect, isManager, async (req, res) => {
    try {
        const { roomId } = req.params;

        const room = await Room.findOne({ khataId: roomId })
            .populate('members.user', 'name email');

        if (!room) {
            return res.status(404).json({ message: 'Room not found' });
        }

        // Verify manager
        if (room.manager.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Not authorized' });
        }

        const pendingMembers = room.members
            .filter(m => m.status === 'Pending')
            .map(m => ({
                id: m.user._id,
                name: m.user.name,
                email: m.user.email,
                requestedAt: m.joinedAt
            }));

        res.json(pendingMembers);
    } catch (error) {
        console.error('Get pending error:', error);
        res.status(500).json({ message: 'Server error fetching pending requests' });
    }
});

// @route   PUT /api/rooms/:roomId/approve/:userId
// @desc    Approve a member join request (Manager only)
// @access  Private (Manager)
router.put('/:roomId/approve/:userId', protect, isManager, async (req, res) => {
    try {
        const { roomId, userId } = req.params;

        const room = await Room.findOne({ khataId: roomId });

        if (!room) {
            return res.status(404).json({ message: 'Room not found' });
        }

        // Verify manager
        if (room.manager.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Not authorized' });
        }

        // Find member
        const memberIndex = room.members.findIndex(
            m => m.user.toString() === userId && m.status === 'Pending'
        );

        if (memberIndex === -1) {
            return res.status(404).json({ message: 'Pending request not found' });
        }

        // Approve member
        room.members[memberIndex].status = 'Approved';
        await room.save();

        // Update user status
        await User.findByIdAndUpdate(userId, {
            roomStatus: 'Approved'
        });

        res.json({ message: 'Member approved successfully' });
    } catch (error) {
        console.error('Approve member error:', error);
        res.status(500).json({ message: 'Server error approving member' });
    }
});

export default router;
