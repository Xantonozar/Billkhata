import React from 'react';
import type { JoinRequest } from '../../types';
import { useAuth } from '../../contexts/AuthContext';
import { PlusIcon, MealIcon, UsersIcon, ChartBarIcon } from '../Icons';

const mockJoinRequests: JoinRequest[] = [
    { id: 'req1', userName: 'Bob Johnson', userEmail: 'bob@example.com', requestedAt: '2023-10-21T10:00:00Z' },
];

const StatCard: React.FC<{ title: string; value: string; subtitle: string }> = ({ title, value, subtitle }) => (
    <div className="bg-white dark:bg-gray-800 p-5 rounded-xl shadow-md transition-all duration-300 hover:scale-[1.02] hover:shadow-lg">
        <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 font-body">{title}</h3>
        <p className="text-3xl font-bold text-gray-800 dark:text-white mt-1 font-numeric">{value}</p>
        <p className="text-xs text-gray-400 dark:text-gray-500 mt-1 font-body">{subtitle}</p>
    </div>
);

const PriorityActionCard: React.FC<{ title: string; details: string; onReview?: () => void }> = ({ title, details, onReview }) => (
    <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
        <div>
            <p className="font-semibold text-gray-800 dark:text-white">{title}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">{details}</p>
        </div>
        <button onClick={onReview} className="text-sm font-semibold text-primary hover:underline">Review →</button>
    </div>
);

const QuickActionButton: React.FC<{ icon: React.ReactNode; label: string }> = ({ icon, label }) => (
    <button className="flex flex-col items-center justify-center p-4 bg-gray-100 dark:bg-gray-700/50 rounded-xl shadow-sm space-y-2 transition-all hover:bg-gray-200 dark:hover:bg-gray-700 hover:scale-[1.02] active:scale-[0.98]">
        {icon}
        <span className="text-sm font-semibold text-gray-700 dark:text-gray-200">{label}</span>
    </button>
);

const ManagerDashboard: React.FC = () => {
    const { user } = useAuth();
    
    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold text-gray-800 dark:text-white font-sans">Assalamu Alaikum, {user?.name} 👋</h1>
                <p className="text-gray-500 dark:text-gray-400 font-body text-base">Wednesday, October 08, 2025</p>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard title="💰 Total Bills" value="৳27,550" subtitle="8 bills this month" />
                <StatCard title="🔔 Pending Approvals" value="8 items" subtitle="Need your action" />
                <StatCard title="💵 Meal Fund Balance" value="+৳3,540" subtitle="Healthy balance" />
                <StatCard title="👥 Active Members" value="4 members" subtitle="1 join request pending" />
            </div>

            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md">
                <h3 className="text-xl font-bold font-sans text-gray-800 dark:text-white mb-2">🆕 Today's Meal Status</h3>
                <p className="text-gray-600 dark:text-gray-300">⏰ Not finalized</p>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Total: <span className="font-numeric">20</span> quantities planned</p>
                <div className="mt-4 flex flex-wrap gap-3">
                    <button className="text-sm font-semibold text-primary hover:underline">View Today's Meal List →</button>
                    <button className="px-4 py-2 text-sm text-white font-semibold rounded-lg bg-gradient-success hover:shadow-lg transition-all active:scale-[0.98]">Finalize Now</button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md">
                    <h3 className="text-2xl font-bold font-sans text-gray-800 dark:text-white mb-4">Priority Actions</h3>
                     <div className="space-y-4">
                        <PriorityActionCard title="💰 3 Payment Approvals" details="Electricity, Water bills" />
                        <PriorityActionCard title="🛒 2 Shopping Approvals" details="Raj (৳850), Amit (৳620)" />
                        <PriorityActionCard title="💵 2 Deposit Approvals" details="Priya, Ravi" />
                        <PriorityActionCard title="👤 1 Join Request" details="Neha Rahman" />
                    </div>
                </div>

                <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md">
                    <h3 className="text-2xl font-bold font-sans text-gray-800 dark:text-white mb-4">Quick Actions</h3>
                     <div className="grid grid-cols-2 gap-4">
                        <QuickActionButton icon={<PlusIcon className="w-8 h-8 text-primary"/>} label="Add Bill" />
                        <QuickActionButton icon={<MealIcon className="w-8 h-8 text-success-dark"/>} label="Finalize Meals" />
                        <QuickActionButton icon={<UsersIcon className="w-8 h-8 text-warning-dark"/>} label="Members" />
                        <QuickActionButton icon={<ChartBarIcon className="w-8 h-8 text-indigo-500"/>} label="Reports" />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ManagerDashboard;