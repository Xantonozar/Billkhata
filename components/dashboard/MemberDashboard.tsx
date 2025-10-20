import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { MealIcon, BillsIcon, PlusIcon, ChartBarIcon } from '../Icons';
import { TodaysMenu, Bill } from '../../types';
import { api } from '../../services/api';

const initialTodaysMenu: TodaysMenu = {
    breakfast: 'Paratha & Omelette',
    lunch: 'Chicken Curry, Rice, Salad',
    dinner: 'Veg Pulao, Raita',
};

// FIX: Changed invalid prop types from a-zA-Z to string.
const StatCard: React.FC<{ title: string; value: string; subtitle: string }> = ({ title, value, subtitle }) => (
    <div className="bg-white dark:bg-slate-800 p-5 rounded-xl shadow-md transition-all duration-300 hover:scale-[1.02] hover:shadow-lg">
        <h3 className="text-sm font-semibold text-slate-500 dark:text-slate-400 font-body">{title}</h3>
        <p className="text-3xl font-bold text-slate-800 dark:text-white mt-1 font-numeric">{value}</p>
        <p className="text-xs text-slate-400 dark:text-slate-500 mt-1 font-body">{subtitle}</p>
    </div>
);

const QuickActionButton: React.FC<{ icon: React.ReactNode; label: string }> = ({ icon, label }) => (
    <button className="flex flex-col items-center justify-center p-4 bg-white dark:bg-slate-800 rounded-xl shadow-md space-y-2 transition-all hover:bg-slate-50 dark:hover:bg-slate-700/50 hover:scale-[1.02] active:scale-[0.98]">
        {icon}
        <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">{label}</span>
    </button>
);

const ApprovedView: React.FC = () => {
    const { user } = useAuth();
    const [menu, setMenu] = useState(initialTodaysMenu);
    const [bills, setBills] = useState<Bill[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (user?.khataId) {
            setLoading(true);
            api.getBillsForRoom(user.khataId).then(data => {
                setBills(data);
                setLoading(false);
            }).finally(() => setLoading(false));
        } else {
            setLoading(false);
        }
    }, [user]);

    const { billsDueAmount, billsDueCount, nextBillDue } = useMemo(() => {
        if (!user) return { billsDueAmount: 0, billsDueCount: 0, nextBillDue: null };

        const myBillShares = bills.flatMap(bill => 
            bill.shares
                .filter(share => share.userId === user.id && (share.status === 'Unpaid' || share.status === 'Overdue'))
                .map(share => ({ ...bill, myShare: share }))
        );

        const billsDueAmount = myBillShares.reduce((total, bill) => total + bill.myShare.amount, 0);
        const billsDueCount = myBillShares.length;
        
        const upcomingBills = myBillShares
            .filter(bill => new Date(bill.dueDate) >= new Date('2025-10-08')) // Mock today's date from dashboard
            .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());

        const nextBillDue = upcomingBills.length > 0 ? upcomingBills[0] : null;

        return { billsDueAmount, billsDueCount, nextBillDue };
    }, [bills, user]);

    const nextBillDueText = nextBillDue 
        ? `${nextBillDue.category} - ${new Date(nextBillDue.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}` 
        : "No upcoming bills";
    const daysLeft = nextBillDue ? Math.ceil((new Date(nextBillDue.dueDate).getTime() - new Date('2025-10-08').getTime()) / (1000 * 60 * 60 * 24)) : 0;
    const daysLeftText = nextBillDue ? `${daysLeft} days left` : 'All clear!';


    return (
        <div className="space-y-8 animate-fade-in">
            <div>
                <h1 className="text-3xl font-bold text-slate-800 dark:text-white font-sans">Assalamu Alaikum, {user?.name} 👋</h1>
                <p className="text-slate-500 dark:text-slate-400 text-base">Wednesday, Oct 8, 2025</p>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <StatCard title="💰 Bills Due" value={`৳${billsDueAmount.toFixed(2)}`} subtitle={`${billsDueCount} bills pending`} />
                <StatCard title="🍽️ Your Meals" value="28 quantities" subtitle="This month" />
                <StatCard title="💵 Refund Available" value="+৳452" subtitle="After meal cost" />
                <StatCard title="📅 Next Bill Due" value={nextBillDueText} subtitle={daysLeftText} />
            </div>

            <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-md">
                <h3 className="text-xl font-bold font-sans text-slate-800 dark:text-white mb-4">🆕 Today's Menu</h3>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <tbody>
                            <tr className="border-b dark:border-slate-700">
                                <td className="p-3 font-semibold text-slate-800 dark:text-slate-100 w-32">Breakfast</td>
                                <td className="p-3 text-slate-600 dark:text-slate-300">{menu.breakfast}</td>
                            </tr>
                            <tr className="border-b dark:border-slate-700">
                                <td className="p-3 font-semibold text-slate-800 dark:text-slate-100">Lunch</td>
                                <td className="p-3 text-slate-600 dark:text-slate-300">{menu.lunch}</td>
                            </tr>
                            <tr>
                                <td className="p-3 font-semibold text-slate-800 dark:text-slate-100">Dinner</td>
                                <td className="p-3 text-slate-600 dark:text-slate-300">{menu.dinner}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
            
            <div>
                <h3 className="text-xl font-bold font-sans text-slate-800 dark:text-white mb-4">Quick Actions</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <QuickActionButton icon={<MealIcon className="w-8 h-8 text-primary-500"/>} label="Log Meal" />
                    <QuickActionButton icon={<BillsIcon className="w-8 h-8 text-success-600"/>} label="Pay Bill" />
                    <QuickActionButton icon={<PlusIcon className="w-8 h-8 text-warning-600"/>} label="Deposit" />
                    <QuickActionButton icon={<ChartBarIcon className="w-8 h-8 text-indigo-500"/>} label="History" />
                </div>
            </div>

            <div>
                 <h3 className="text-xl font-bold font-sans text-slate-800 dark:text-white mb-4">Recent Activity</h3>
                 <div className="space-y-3">
                    <div className="p-3 bg-white dark:bg-slate-800 rounded-lg shadow-sm">
                        <p className="text-sm font-medium">Electricity bill added (<span className="font-numeric">৳300</span>)</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">2 hours ago</p>
                    </div>
                     <div className="p-3 bg-white dark:bg-slate-800 rounded-lg shadow-sm">
                        <p className="text-sm font-medium">Your rent payment approved ✅</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">5 hours ago</p>
                    </div>
                     <div className="p-3 bg-white dark:bg-slate-800 rounded-lg shadow-sm">
                        <p className="text-sm font-medium">Amit joined the room 👥</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">Yesterday</p>
                    </div>
                 </div>
                 <button className="mt-4 text-sm font-semibold text-primary-600 hover:underline">View All →</button>
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