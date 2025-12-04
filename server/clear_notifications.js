import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '.env') });

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ MongoDB Connected');
    } catch (error) {
        console.error('❌ MongoDB connection error:', error);
        process.exit(1);
    }
};

const clearNotifications = async () => {
    try {
        await connectDB();

        const Notification = mongoose.model('Notification', new mongoose.Schema({}, { strict: false }));

        // Delete all notifications
        const result = await Notification.deleteMany({});

        console.log(`✅ Deleted ${result.deletedCount} notifications from database`);
        console.log('🎉 Database cleared! New notifications will now be created only when actual events occur.');

        process.exit(0);
    } catch (error) {
        console.error('❌ Error clearing notifications:', error);
        process.exit(1);
    }
};

clearNotifications();
