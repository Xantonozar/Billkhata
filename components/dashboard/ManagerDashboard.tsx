import React, { useState, useEffect } from 'react';
import type { TodaysMenu } from '../../types';
import { useAuth } from '../../contexts/AuthContext';
import { PlusIcon, MealIcon, UsersIcon, ChartBarIcon, PencilIcon, XIcon, CheckCircleIcon, SpinnerIcon } from '../Icons';
import { useNotifications } from '../../contexts/NotificationContext';
import { api } from '../../services/api';

const initialTodaysMenu: TodaysMenu = {
    breakfast: 'Not set',
    lunch: 'Not set',
    dinner: 'Not set',
};

const StatCard: React.FC<{ title: string; value: string; subtitle: string, isLoading: boolean }> = ({ title, value, subtitle, isLoading }) => (
    <div className="bg-white dark:bg-slate-800 p-5 rounded-xl shadow-md transition-all duration-300 hover:scale-[1.02] hover:shadow-lg">
        <h3 className="text-sm font-semibold text-slate-500 dark:text-slate-400 font-body">{title}</h3>
        {isLoading ? (
            <div className="mt-2 h-8 w-3/4 rounded bg-slate-200 dark:bg-slate-700 bg-shimmer-gradient bg-no-repeat animate-shimmer" style={{ backgroundSize: '1000px 100%' }}></div>
        ) : (
            <p className="text-3xl font-bold text-slate-800 dark:text-white mt-1 font-numeric">{value}</p>
        )}
        <p className="text-xs text-slate-400 dark:text-slate-500 mt-1 font-body">{subtitle}</p>
    </div>
);

const PriorityActionCard: React.FC<{ title: string; details: string; onView?: () => void }> = ({ title, details, onView }) => (
    <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
        <div>
            <p className="font-semibold text-slate-800 dark:text-white">{title}</p>
            <p className="text-sm text-slate-500 dark:text-slate-400">{details}</p>
        </div>
        <button onClick={onView} className="text-sm font-semibold text-primary-600 hover:underline">View →</button>
    </div>
);

const QuickActionButton: React.FC<{ icon: React.ReactNode; label: string, onClick: () => void }> = ({ icon, label, onClick }) => (
    <button onClick={onClick} className="flex flex-col items-center justify-center p-4 bg-slate-100 dark:bg-slate-700/50 rounded-xl shadow-sm space-y-2 transition-all hover:bg-slate-200 dark:hover:bg-slate-700 hover:scale-[1.02] active:scale-[0.98]">
        {icon}
        <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">{label}</span>
    </button>
);

const ManagerDashboard: React.FC = () => {
    const { user, setPage } = useAuth();
    const { addToast } = useNotifications();
    const [menu, setMenu] = useState(initialTodaysMenu);
    const [editingMeal, setEditingMeal] = useState<keyof TodaysMenu | null>(null);
    const [editText, setEditText] = useState('');

    const [stats, setStats] = useState({
        totalBillsAmount: 0,
        pendingApprovals: 0,
        fundBalance: 0,
        activeMembers: 0,
        totalBillsCount: 0,
    });
    const [priorityActions, setPriorityActions] = useState<any[]>([]);
    const [loadingStats, setLoadingStats] = useState(true);
    const [todayName, setTodayName] = useState('');

    useEffect(() => {
        const today = new Date();
        setTodayName(today.toLocaleDateString('en-US', { weekday: 'long' }));

        if (user?.khataId) {
            setLoadingStats(true);
            Promise.all([
                api.getBillsForRoom(user.khataId),
                api.getPendingApprovals(user.khataId), // Join requests
                api.getFundStatus(user.khataId),
                api.getMembersForRoom(user.khataId),
                api.getExpenses(user.khataId),
                api.getDeposits(user.khataId),
                api.getMenu(user.khataId)
            ]).then(([bills, joinRequests, fundStatus, members, expenses, deposits, menuItems]) => {
                // Filter bills by current month
                const now = new Date();
                const currentMonth = now.getMonth();
                const currentYear = now.getFullYear();

                const currentMonthBills = bills.filter(bill => {
                    const dueDate = new Date(bill.dueDate);
                    return dueDate.getMonth() === currentMonth && dueDate.getFullYear() === currentYear;
                });

                const totalAmount = currentMonthBills.reduce((sum, bill) => sum + bill.totalAmount, 0);

                // Pending items
                const pendingExpenses = expenses.filter(e => e.status === 'Pending');
                const pendingDeposits = deposits.filter(d => d.status === 'Pending');

                const totalPendingCount = joinRequests.length + pendingExpenses.length + pendingDeposits.length;

                setStats({
                    totalBillsAmount: totalAmount,
                    pendingApprovals: totalPendingCount,
                    fundBalance: fundStatus.balance,
                    activeMembers: members.length,
                    totalBillsCount: currentMonthBills.length
                });

                // Priority Actions
                const actions = [];
                if (joinRequests.length > 0) {
                    actions.push({
                        title: `👤 ${joinRequests.length} Join Request${joinRequests.length > 1 ? 's' : ''}`,
                        details: joinRequests.map((r: any) => r.name).join(', '),
                        page: 'pending-approvals'
                    });
                }
                if (pendingExpenses.length > 0) {
                    actions.push({
                        title: `🛒 ${pendingExpenses.length} Shopping Approval${pendingExpenses.length > 1 ? 's' : ''}`,
                        details: `Total: ৳${pendingExpenses.reduce((sum: number, e: any) => sum + e.amount, 0)}`,
                        page: 'pending-approvals'
                    });
                }
                if (pendingDeposits.length > 0) {
                    actions.push({
                        title: `💵 ${pendingDeposits.length} Deposit Approval${pendingDeposits.length > 1 ? 's' : ''}`,
                        details: `Total: ৳${pendingDeposits.reduce((sum: number, d: any) => sum + d.amount, 0)}`,
                        page: 'pending-approvals'
                    });
                }
                setPriorityActions(actions);

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

                setLoadingStats(false);
            }).catch(err => {
                console.error("Error loading dashboard data", err);
                setLoadingStats(false);
            });
        }
    }, [user]);


    const handleEditClick = (meal: keyof TodaysMenu) => {
        setEditingMeal(meal);
        setEditText(menu[meal] === 'Not set' ? '' : menu[meal]);
    };

    const handleSave = async () => {
        if (editingMeal && user?.khataId) {
            const updatedMenu = { ...menu, [editingMeal]: editText };
            setMenu(updatedMenu);

            try {
                await api.updateMenuDay(user.khataId, todayName, {
                    [editingMeal]: editText
                });

                addToast({
                    type: 'success',
                    title: 'Menu Updated',
                    message: `${editingMeal.charAt(0).toUpperCase() + editingMeal.slice(1)} menu has been updated.`,
                });
            } catch (error) {
                addToast({ type: 'error', title: 'Error', message: 'Failed to save menu' });
            }

            setEditingMeal(null);
            setEditText('');
        }
    };

    const handleCancel = () => {
        setEditingMeal(null);
        setEditText('');
    };

    const renderMealRow = (meal: keyof TodaysMenu, label: string) => {
        if (editingMeal === meal) {
            return (
                <tr className="border-b dark:border-slate-700 bg-slate-50 dark:bg-slate-700/50">
                    <td className="p-3 font-semibold text-slate-800 dark:text-slate-100">{label}</td>
                    <td className="p-3">
                        <input
                            type="text"
                            value={editText}
                            onChange={(e) => setEditText(e.target.value)}
                            className="w-full px-2 py-1 bg-white dark:bg-slate-600 border-2 border-primary-500 rounded-md focus:outline-none"
                            autoFocus
                        />
                    </td>
                    <td className="p-3 text-right">
                        <div className="flex justify-end gap-2">
                            <button onClick={handleCancel} className="p-2 rounded-full text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-600"><XIcon className="w-5 h-5" /></button>
                            <button onClick={handleSave} className="p-2 rounded-full text-success-500 hover:bg-success-100 dark:hover:bg-success-500/20"><CheckCircleIcon className="w-5 h-5" /></button>
                        </div>
                    </td>
                </tr>
            );
        }

        return (
            <tr className="border-b dark:border-slate-700">
                <td className="p-3 font-semibold text-slate-800 dark:text-slate-100">{label}</td>
                <td className="p-3 text-slate-600 dark:text-slate-300">{menu[meal]}</td>
                <td className="p-3 text-right">
                    <button onClick={() => handleEditClick(meal)} className="p-2 rounded-md hover:bg-slate-200 dark:hover:bg-slate-600">
                        <PencilIcon className="w-5 h-5 text-primary-500" />
                    </button>
                </td>
            </tr>
        );
    };

    const currentDate = new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

    return (
        <div className="space-y-8 animate-fade-in">
            <div>
                <h1 className="text-3xl font-bold text-slate-800 dark:text-white font-sans">Assalamu Alaikum, {user?.name} 👋</h1>
                <p className="text-slate-500 dark:text-slate-400 font-body text-base">{currentDate}</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard title="💰 Total Bills" value={`৳${stats.totalBillsAmount.toLocaleString()}`} subtitle={`${stats.totalBillsCount} bills this month`} isLoading={loadingStats} />
                <StatCard title="🔔 Pending Approvals" value={`${stats.pendingApprovals} items`} subtitle="Need your action" isLoading={loadingStats} />
                <StatCard title="💵 Meal Fund Balance" value={`+৳${stats.fundBalance.toLocaleString()}`} subtitle="Healthy balance" isLoading={loadingStats} />
                <StatCard title="👥 Active Members" value={`${stats.activeMembers} members`} subtitle="in your room" isLoading={loadingStats} />
            </div>

            <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-md">
                <h3 className="text-xl font-bold font-sans text-slate-800 dark:text-white mb-4">🆕 Today's Menu ({todayName})</h3>
                <div className="overflow-x-auto">
                    <table className="w-full min-w-max text-sm text-left">
                        <thead>
                            <tr className="border-b dark:border-slate-700">
                                <th className="p-3 w-32">Meal</th>
                                <th className="p-3">What Will Be Cooked</th>
                                <th className="p-3 text-right w-28">Edit</th>
                            </tr>
                        </thead>
                        <tbody>
                            {renderMealRow('breakfast', 'Breakfast')}
                            {renderMealRow('lunch', 'Lunch')}
                            {renderMealRow('dinner', 'Dinner')}
                        </tbody>
                    </table>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 bg-white dark:bg-slate-800 p-6 rounded-xl shadow-md">
                    <h3 className="text-2xl font-bold font-sans text-slate-800 dark:text-white mb-4">Priority Actions</h3>
                    <div className="space-y-4">
                        {priorityActions.length === 0 ? (
                            <p className="text-slate-500 dark:text-slate-400">No pending actions. Great job! 🎉</p>
                        ) : (
                            priorityActions.map((action, index) => (
                                <PriorityActionCard
                                    key={index}
                                    title={action.title}
                                    details={action.details}
                                    onView={() => setPage(action.page)}
                                />
                            ))
                        )}
                    </div>
                </div>

                <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-md">
                    <h3 className="text-2xl font-bold font-sans text-slate-800 dark:text-white mb-4">Quick Actions</h3>
                    <div className="grid grid-cols-2 gap-4">
                        <QuickActionButton icon={<PlusIcon className="w-8 h-8 text-primary-500" />} label="Add Bill" onClick={() => setPage('bills-all')} />
                        <QuickActionButton icon={<MealIcon className="w-8 h-8 text-success-600" />} label="Finalize Meals" onClick={() => setPage('meals')} />
                        <QuickActionButton icon={<UsersIcon className="w-8 h-8 text-warning-600" />} label="Members" onClick={() => setPage('members')} />
                        <QuickActionButton icon={<ChartBarIcon className="w-8 h-8 text-indigo-500" />} label="Reports" onClick={() => setPage('reports-analytics')} />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ManagerDashboard;