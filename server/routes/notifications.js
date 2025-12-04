import express from 'express';
import Notification from '../models/Notification.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

console.log('[NOTIFICATIONS] 🔔 Notification routes module loaded');

// @route   GET /api/notifications
// @desc    Get notifications for the logged-in user
// @access  Private
router.get('/', protect, async (req, res) => {
    try {
        console.log(`[NOTIFICATIONS] 📖 GET request - User: ${req.user.name} (${req.user._id})`);

        const limit = parseInt(req.query.limit) || 50;
        const unreadOnly = req.query.unreadOnly === 'true';

        const query = { userId: req.user._id };
        if (unreadOnly) {
            query.read = false;
        }

        const notifications = await Notification.find(query)
            .sort({ createdAt: -1 })
            .limit(limit);

        console.log(`[NOTIFICATIONS] ✅ Found ${notifications.length} notifications (unreadOnly: ${unreadOnly})`);
        res.json(notifications);
    } catch (error) {
        console.error('[NOTIFICATIONS] ❌ Error fetching notifications:', error.message);
        res.status(500).json({ message: 'Server error fetching notifications' });
    }
});

// @route   GET /api/notifications/unread-count
// @desc    Get count of unread notifications
// @access  Private
router.get('/unread-count', protect, async (req, res) => {
    try {
        const count = await Notification.countDocuments({
            userId: req.user._id,
            read: false
        });

        console.log(`[NOTIFICATIONS] 📊 Unread count for user ${req.user.name}: ${count}`);
        res.json({ count });
    } catch (error) {
        console.error('[NOTIFICATIONS] ❌ Error fetching unread count:', error.message);
        res.status(500).json({ message: 'Server error fetching unread count' });
    }
});

// @route   PUT /api/notifications/:id/mark-read
// @desc    Mark a notification as read
// @access  Private
router.put('/:id/mark-read', protect, async (req, res) => {
    try {
        const notification = await Notification.findOneAndUpdate(
            { _id: req.params.id, userId: req.user._id },
            { read: true },
            { new: true }
        );

        if (!notification) {
            console.log(`[NOTIFICATIONS] ⚠️ Notification ${req.params.id} not found or unauthorized`);
            return res.status(404).json({ message: 'Notification not found' });
        }

        console.log(`[NOTIFICATIONS] ✅ Marked notification ${req.params.id} as read`);
        res.json(notification);
    } catch (error) {
        console.error('[NOTIFICATIONS] ❌ Error marking notification as read:', error.message);
        res.status(500).json({ message: 'Server error marking notification as read' });
    }
});

// @route   PUT /api/notifications/mark-all-read
// @desc    Mark all notifications as read
// @access  Private
router.put('/mark-all-read', protect, async (req, res) => {
    try {
        const result = await Notification.updateMany(
            { userId: req.user._id, read: false },
            { read: true }
        );

        console.log(`[NOTIFICATIONS] ✅ Marked ${result.modifiedCount} notifications as read`);
        res.json({ message: 'All notifications marked as read', count: result.modifiedCount });
    } catch (error) {
        console.error('[NOTIFICATIONS] ❌ Error marking all as read:', error.message);
        res.status(500).json({ message: 'Server error marking notifications as read' });
    }
});

// @route   POST /api/notifications
// @desc    Create a new notification (internal use)
// @access  Private
router.post('/', protect, async (req, res) => {
    try {
        const { userId, khataId, type, title, message, actionText, link, relatedId } = req.body;

        const notification = await Notification.create({
            userId,
            khataId,
            type,
            title,
            message,
            actionText,
            link,
            relatedId
        });

        console.log(`[NOTIFICATIONS] ✅ Created notification for user ${userId}: ${title}`);
        res.status(201).json(notification);
    } catch (error) {
        console.error('[NOTIFICATIONS] ❌ Error creating notification:', error.message);
        res.status(500).json({ message: 'Server error creating notification' });
    }
});

// @route   DELETE /api/notifications/:id
// @desc    Delete a notification
// @access  Private
router.delete('/:id', protect, async (req, res) => {
    try {
        const notification = await Notification.findOneAndDelete({
            _id: req.params.id,
            userId: req.user._id
        });

        if (!notification) {
            return res.status(404).json({ message: 'Notification not found' });
        }

        console.log(`[NOTIFICATIONS] ✅ Deleted notification ${req.params.id}`);
        res.json({ message: 'Notification deleted' });
    } catch (error) {
        console.error('[NOTIFICATIONS] ❌ Error deleting notification:', error.message);
        res.status(500).json({ message: 'Server error deleting notification' });
    }
});

export default router;
