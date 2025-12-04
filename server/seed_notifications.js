import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Notification from './models/Notification.js';
import User from './models/User.js';

dotenv.config();

const seedNotifications = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected to MongoDB');

        const users = await User.find({});
        if (users.length === 0) {
            console.log('❌ No users found');
            process.exit(1);
        }

        console.log(`Found ${users.length} users. Creating notifications...`);

        const notifications = [
            {
                type: 'bill',
                title: 'New Electricity Bill',
                message: 'Electricity bill for October has been generated. Amount: ৳1,200',
                actionText: 'View Bill',
                link: 'bills-electricity',
                read: false
            },
            {
                type: 'payment',
                title: 'Payment Received',
                message: 'Your payment of ৳5,000 for Rent has been approved.',
                read: true
            },
            {
                type: 'meal',
                title: 'Meal Log Reminder',
                message: "Don't forget to log your meals for today.",
                actionText: 'Log Meals',
                link: 'meals',
                read: false
            },
            {
                type: 'deposit',
                title: 'Deposit Approved',
                message: 'Your deposit of ৳2,000 has been verified.',
                read: false
            },
            {
                type: 'room',
                title: 'New Member Joined',
                message: 'Rahim has joined the room.',
                read: true
            }
        ];

        let count = 0;
        for (const user of users) {
            if (!user.khataId) continue;

            for (const notif of notifications) {
                await Notification.create({
                    userId: user._id,
                    khataId: user.khataId,
                    ...notif,
                    createdAt: new Date(Date.now() - Math.random() * 1000000000) // Random time in past
                });
                count++;
            }
        }

        console.log(`✅ Successfully created ${count} notifications for ${users.length} users`);
        process.exit(0);
    } catch (error) {
        console.error('❌ Error seeding notifications:', error);
        process.exit(1);
    }
};

seedNotifications();
