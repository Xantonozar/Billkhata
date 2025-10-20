import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { MealIcon, BillsIcon, PlusIcon, ChartBarIcon } from '../Icons';

// FIX: Changed invalid prop types from a-zA-Z to string.
const StatCard: React.FC<{ title: string; value: string; subtitle: string }> = ({ title, value, subtitle }) => (
    <div className="bg-white dark:bg-gray-800 p-5 rounded-xl shadow-md transition-all duration-300 hover:scale-[1.02] hover:shadow-lg">
        <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 font-body">{title}</h3>
        <p className="text-3xl font-bold text-gray-800 dark:text-white mt-1 font-numeric">{value}</p>
        <p className="text-xs text-gray-400 dark:text-gray-500 mt-1 font-body">{subtitle}</p>
    </div>
);

const QuickActionButton: React.FC<{ icon: React.ReactNode; label: string }> = ({ icon, label }) => (
    <button className="flex flex-col items-center justify-center p-4 bg-white dark:bg-gray-800 rounded-xl shadow-md space-y-2 transition-all hover:bg-gray-50 dark:hover:bg-gray-700/50 hover:scale-[1.02] active:scale-[0.98]">
        {icon}
        <span className="text-sm font-semibold text-gray-700 dark:text-gray-200">{label}</span>
    </button>
);

const ApprovedView: React.FC = () => {
    const { user } = useAuth();

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold text-gray-800 dark:text-white font-sans">Assalamu Alaikum, {user?.name} 👋</h1>
                <p className="text-gray-500 dark:text-gray-400 text-base">Wednesday, Oct 8, 2025</p>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <StatCard title="💰 Bills Due" value="৳1,587.50" subtitle="2 bills pending" />
                <StatCard title="🍽️ Your Meals" value="28 quantities" subtitle="This month" />
                <StatCard title="💵 Refund Available" value="+৳452" subtitle="After meal cost" />
                <StatCard title="📅 Next Bill Due" value="Electricity - Oct 15" subtitle="7 days left" />
            </div>

            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md">
                <h3 className="text-xl font-bold font-sans text-gray-800 dark:text-white mb-2">🆕 Today's Meal Status</h3>
                <p className="text-gray-600 dark:text-gray-300">⏰ Not finalized yet</p>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Your plan: <span className="font-numeric">4</span> quantities</p>
                <button className="mt-3 text-sm font-semibold text-primary hover:underline">Update Meal Plan →</button>
            </div>
            
            <div>
                <h3 className="text-xl font-bold font-sans text-gray-800 dark:text-white mb-4">Quick Actions</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <QuickActionButton icon={<MealIcon className="w-8 h-8 text-primary"/>} label="Log Meal" />
                    <QuickActionButton icon={<BillsIcon className="w-8 h-8 text-success-dark"/>} label="Pay Bill" />
                    <QuickActionButton icon={<PlusIcon className="w-8 h-8 text-warning-dark"/>} label="Deposit" />
                    <QuickActionButton icon={<ChartBarIcon className="w-8 h-8 text-indigo-500"/>} label="History" />
                </div>
            </div>

            <div>
                 <h3 className="text-xl font-bold font-sans text-gray-800 dark:text-white mb-4">Recent Activity</h3>
                 <div className="space-y-3">
                    <div className="p-3 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
                        <p className="text-sm font-medium">Electricity bill added (<span className="font-numeric">৳300</span>)</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">2 hours ago</p>
                    </div>
                     <div className="p-3 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
                        <p className="text-sm font-medium">Your rent payment approved ✅</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">5 hours ago</p>
                    </div>
                     <div className="p-3 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
                        <p className="text-sm font-medium">Amit joined the room 👥</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Yesterday</p>
                    </div>
                 </div>
                 <button className="mt-4 text-sm font-semibold text-primary hover:underline">View All →</button>
            </div>
        </div>
    );
};

const MemberDashboard: React.FC = () => {
    // This component now assumes the user is approved and in a room.
    // The routing logic in App.tsx handles the NoRoom and Pending states.
    return <ApprovedView />;
};

export default MemberDashboard;