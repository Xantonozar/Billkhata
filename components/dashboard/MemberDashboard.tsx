import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { MealIcon, BillsIcon, PlusIcon, ChartBarIcon } from '../Icons';
import { TodaysMenu, Bill } from '../../types';
import { api } from '../../services/api';

const initialTodaysMenu: TodaysMenu = {
    breakfast: 'Not set',
    lunch: 'Not set',
    dinner: 'Not set',
};

// FIX: Changed invalid prop types from a-zA-Z to string.
const StatCard: React.FC<{ title: string; value: string; subtitle: string }> = ({ title, value, subtitle }) => (
    <div className="bg-white dark:bg-slate-800 p-5 rounded-xl shadow-md transition-all duration-300 hover:scale-[1.02] hover:shadow-lg">
        <h3 className="text-sm font-semibold text-slate-500 dark:text-slate-400 font-body">{title}</h3>
        <p className="text-3xl font-bold text-slate-800 dark:text-white mt-1 font-numeric">{value}</p>
        <p className="text-xs text-slate-400 dark:text-slate-500 mt-1 font-body">{subtitle}</p>
    </div>
);

const QuickActionButton: React.FC<{ icon: React.ReactNode; label: string, onClick: () => void }> = ({ icon, label, onClick }) => (
    <button onClick={onClick} className="flex flex-col items-center justify-center p-4 bg-white dark:bg-slate-800 rounded-xl shadow-md space-y-2 transition-all hover:bg-slate-50 dark:hover:bg-slate-700/50 hover:scale-[1.02] active:scale-[0.98]">
        {icon}
        <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">{label}</span>
    </button>
);

const ApprovedView: React.FC = () => {
    const { user, setPage } = useAuth();
    const [menu, setMenu] = useState(initialTodaysMenu);
    const [bills, setBills] = useState<Bill[]>([]);
    const [loading, setLoading] = useState(true);
    const [totalMealCount, setTotalMealCount] = useState(0);
    const [refundAmount, setRefundAmount] = useState(0);
    const [recentActivity, setRecentActivity] = useState<any[]>([]);
    const [todayName, setTodayName] = useState('');

    useEffect(() => {
        const today = new Date();
        setTodayName(today.toLocaleDateString('en-US', { weekday: 'long' }));

        if (user?.khataId) {
            setLoading(true);

            Promise.all([
                api.getBillsForRoom(user.khataId),
                api.getMealSummary(user.khataId),
                api.getDeposits(user.khataId),
                api.getExpenses(user.khataId),
                api.getMenu(user.khataId),
                api.getMeals(user.khataId) // Fetch all meals for rate calculation
            ]).then(([billsData, mealSummary, deposits, expenses, menuItems, allMeals]) => {
                setBills(billsData);

                if (mealSummary && user.id) {
                    setTotalMealCount(mealSummary.currentUserMeals || 0);
                }

                // Calculate Refund/Surplus
                // Refund = Total Deposits - (My Meal Cost)
                // My Meal Cost = (Total Shopping / Total Meals) * My Meals
                const approvedDeposits = deposits.filter((d: any) => d.userId === user.id && d.status === 'Approved');
                const totalDeposits = approvedDeposits.reduce((sum: number, d: any) => sum + d.amount, 0);

                const approvedExpenses = expenses.filter((e: any) => e.status === 'Approved');
                const totalShopping = approvedExpenses.reduce((sum: number, e: any) => sum + e.amount, 0);

                const totalMeals = allMeals.reduce((sum: number, m: any) => sum + (m.totalMeals || 0), 0);
                const mealRate = totalMeals > 0 ? totalShopping / totalMeals : 0;

                const myMeals = mealSummary?.currentUserMeals || 0;
                const myMealCost = myMeals * mealRate;

                setRefundAmount(totalDeposits - myMealCost);

                // Set Menu
                const todayStr = today.toLocaleDateString('en-US', { weekday: 'long' });
                const todayMenu = menuItems.find((item: any) => item.day === todayStr);
                if (todayMenu) {
                    setMenu({
                        breakfast: todayMenu.breakfast || 'Not set',
                        lunch: todayMenu.lunch || 'Not set',
                        dinner: todayMenu.dinner || 'Not set'
                    });
                }

                // Recent Activity
                // Combine bills, deposits, expenses
                const activities = [
                    ...billsData.map(b => ({ type: 'bill', date: new Date(b.createdAt), text: `New bill: ${b.title}`, amount: b.totalAmount })),
                    ...deposits.filter((d: any) => d.userId === user.id).map((d: any) => ({ type: 'deposit', date: new Date(d.createdAt), text: `Deposit ${d.status.toLowerCase()}`, amount: d.amount })),
                    ...expenses.filter((e: any) => e.userId === user.id).map((e: any) => ({ type: 'expense', date: new Date(e.createdAt), text: `Expense added`, amount: e.amount }))
                ].sort((a, b) => b.date.getTime() - a.date.getTime()).slice(0, 5);

                setRecentActivity(activities);

            }).finally(() => setLoading(false));
        } else {
            setLoading(false);
        }
    }, [user]);

    // Calculate bills for current month
    const { billsDueAmount, billsDueCount, nextBillDue } = useMemo(() => {
        if (!user) return { billsDueAmount: 0, billsDueCount: 0, nextBillDue: null };

        // Filter bills for current month
        const now = new Date();
        const currentMonth = now.getMonth();
        const currentYear = now.getFullYear();

        const currentMonthBills = bills.filter(bill => {
            const dueDate = new Date(bill.dueDate);
            return dueDate.getMonth() === currentMonth && dueDate.getFullYear() === currentYear;
        });

        const myBillShares = currentMonthBills.flatMap(bill => {
            const shares = bill.shares || [];
            return shares
                .filter(share => share.userId === user.id && (share.status === 'Unpaid' || share.status === 'Overdue'))
                .map(share => ({ ...bill, myShare: share }));
        });

        const billsDueAmount = myBillShares.reduce((total, bill) => total + bill.myShare.amount, 0);
        const billsDueCount = myBillShares.length;

        const upcomingBills = myBillShares
            .filter(bill => new Date(bill.dueDate) >= now)
            .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());

        const nextBillDue = upcomingBills.length > 0 ? upcomingBills[0] : null;

        return { billsDueAmount, billsDueCount, nextBillDue };
    }, [bills, user]);

    const nextBillDueText = nextBillDue
        ? `${nextBillDue.title} - ${new Date(nextBillDue.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`
        : "No upcoming bills";

    const daysLeft = nextBillDue
        ? Math.ceil((new Date(nextBillDue.dueDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
        : 0;

    const daysLeftText = nextBillDue
        ? `${daysLeft} day${daysLeft !== 1 ? 's' : ''} left`
        : 'All clear!';

    const currentDate = new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

    return (
        <div className="space-y-8 animate-fade-in">
            <div>
                <h1 className="text-3xl font-bold text-slate-800 dark:text-white font-sans">Assalamu Alaikum, {user?.name} 👋</h1>
                <p className="text-slate-500 dark:text-slate-400 text-base">{currentDate}</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <StatCard title="💰 Bills Due" value={`৳${billsDueAmount.toFixed(2)}`} subtitle={`${billsDueCount} bills pending`} />
                <StatCard title="🍽️ Your Meals" value={`${totalMealCount} quantities`} subtitle="This month" />
                <StatCard
                    title="💵 Refund Available"
                    value={`${refundAmount >= 0 ? '+' : ''}৳${refundAmount.toFixed(0)}`}
                    subtitle="After meal cost"
                />
                <StatCard title="📅 Next Bill Due" value={nextBillDueText} subtitle={daysLeftText} />
            </div>

            <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-md">
                <h3 className="text-xl font-bold font-sans text-slate-800 dark:text-white mb-4">🆕 Today's Menu ({todayName})</h3>
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
                    <QuickActionButton icon={<MealIcon className="w-8 h-8 text-primary-500" />} label="Log Meal" onClick={() => setPage('meals')} />
                    <QuickActionButton icon={<BillsIcon className="w-8 h-8 text-success-600" />} label="Pay Bill" onClick={() => setPage('bills-all')} />
                    <QuickActionButton icon={<PlusIcon className="w-8 h-8 text-warning-600" />} label="Deposit" onClick={() => setPage('history')} />
                    <QuickActionButton icon={<ChartBarIcon className="w-8 h-8 text-indigo-500" />} label="History" onClick={() => setPage('history')} />
                </div>
            </div>

            <div>
                <h3 className="text-xl font-bold font-sans text-slate-800 dark:text-white mb-4">Recent Activity</h3>
                <div className="space-y-3">
                    {recentActivity.length === 0 ? (
                        <p className="text-slate-500 dark:text-slate-400">No recent activity.</p>
                    ) : (
                        recentActivity.map((activity, index) => (
                            <div key={index} className="p-3 bg-white dark:bg-slate-800 rounded-lg shadow-sm flex justify-between items-center">
                                <div>
                                    <p className="text-sm font-medium text-slate-800 dark:text-white">{activity.text} (<span className="font-numeric">৳{activity.amount}</span>)</p>
                                    <p className="text-xs text-slate-500 dark:text-slate-400">{activity.date.toLocaleString()}</p>
                                </div>
                            </div>
                        ))
                    )}
                </div>
                {recentActivity.length > 0 && (
                    <button onClick={() => setPage('history')} className="mt-4 text-sm font-semibold text-primary-600 hover:underline">View All →</button>
                )}
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