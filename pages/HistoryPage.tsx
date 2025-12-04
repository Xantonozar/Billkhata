import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../services/api';
import { useNotifications } from '../contexts/NotificationContext';

interface MemberSummary {
    memberId: string;
    memberName: string;
    billsDue: number;
    paid: number;
    pending: number;
    deposits: number;
    refundOrDue: number;
}

const HistoryPage: React.FC = () => {
    const { user, setPage } = useAuth();
    const { addToast } = useNotifications();
    const [loading, setLoading] = useState(true);
    const [selectedMonth, setSelectedMonth] = useState(new Date());
    const [selectedMember, setSelectedMember] = useState<string>('all');
    const [selectedCostType, setSelectedCostType] = useState<string>('all');

    // Data states
    const [meals, setMeals] = useState<any[]>([]);
    const [deposits, setDeposits] = useState<any[]>([]);
    const [expenses, setExpenses] = useState<any[]>([]);
    const [bills, setBills] = useState<any[]>([]);
    const [members, setMembers] = useState<any[]>([]);

    useEffect(() => {
        const fetchData = async () => {
            if (!user?.khataId) return;

            setLoading(true);
            try {
                // Calculate month range
                const year = selectedMonth.getFullYear();
                const month = selectedMonth.getMonth();
                const startDate = new Date(year, month, 1);
                const endDate = new Date(year, month + 1, 0);

                // Fetch all data
                const [mealsData, depositsData, expensesData, billsData, membersData] = await Promise.all([
                    api.getMeals(user.khataId, startDate.toISOString(), endDate.toISOString()),
                    api.getDeposits(user.khataId),
                    api.getExpenses(user.khataId),
                    api.getBillsForRoom(user.khataId),
                    api.getMembersForRoom(user.khataId)
                ]);

                // Filter deposits and expenses by month
                const filteredDeposits = depositsData.filter(d => {
                    const date = new Date(d.createdAt);
                    return date.getMonth() === month && date.getFullYear() === year;
                });

                const filteredExpenses = expensesData.filter(e => {
                    const date = new Date(e.createdAt);
                    return date.getMonth() === month && date.getFullYear() === year;
                });

                const filteredBills = billsData.filter(b => {
                    const date = new Date(b.dueDate);
                    return date.getMonth() === month && date.getFullYear() === year;
                });

                setMeals(mealsData);
                setDeposits(filteredDeposits);
                setExpenses(filteredExpenses);
                setBills(filteredBills);
                setMembers(membersData);
            } catch (error) {
                console.error('Error fetching history data:', error);
                addToast({ type: 'error', title: 'Error', message: 'Failed to load history data' });
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [user?.khataId, selectedMonth, addToast]);

    // Calculate monthly summary
    const monthlySummary = useMemo(() => {
        // Calculate total bills
        const totalBills = bills.reduce((sum, bill) => sum + bill.totalAmount, 0);

        // Calculate total paid and pending from bills
        let totalPaid = 0;
        let totalPending = 0;
        bills.forEach(bill => {
            bill.shares.forEach((share: any) => {
                if (share.status === 'Paid') {
                    totalPaid += share.amount;
                } else {
                    totalPending += share.amount;
                }
            });
        });

        // Calculate total deposits (approved only)
        const totalDeposits = deposits
            .filter(d => d.status === 'Approved')
            .reduce((sum, d) => sum + d.amount, 0);

        // Calculate total meal cost from Approved expenses (Shopping)
        const totalMealCost = expenses
            .filter(e => e.status === 'Approved')
            .reduce((sum, e) => sum + e.amount, 0);

        // Calculate total meals count
        const totalMealCount = meals.reduce((sum, meal) => sum + (meal.totalMeals || 0), 0);

        // Calculate dynamic meal rate
        const mealRate = totalMealCount > 0 ? totalMealCost / totalMealCount : 0;

        // Calculate total due (Deposits - Meal Cost)
        // Negative means Deficit (Red), Positive means Surplus (Green)
        const totalDue = totalDeposits - totalMealCost;

        // Calculate meal statistics
        const daysInMonth = new Date(selectedMonth.getFullYear(), selectedMonth.getMonth() + 1, 0).getDate();
        const avgMealCostPerDay = totalMealCount > 0 ? totalMealCost / daysInMonth : 0;

        // Find min and max meal takers
        const memberMealCounts: { [key: string]: { name: string; count: number } } = {};
        meals.forEach(meal => {
            const userId = meal.userId;
            const userName = meal.userName || 'Unknown';
            if (!memberMealCounts[userId]) {
                memberMealCounts[userId] = { name: userName, count: 0 };
            }
            memberMealCounts[userId].count += meal.totalMeals || 0;
        });

        const mealCountValues = Object.values(memberMealCounts);
        const minMealTaker = mealCountValues.length > 0
            ? mealCountValues.reduce((min, curr) => curr.count < min.count ? curr : min)
            : { name: 'N/A', count: 0 };
        const maxMealTaker = mealCountValues.length > 0
            ? mealCountValues.reduce((max, curr) => curr.count > max.count ? curr : max)
            : { name: 'N/A', count: 0 };

        return {
            totalBills,
            totalPaid,
            totalPending,
            totalDeposits,
            totalMealCost,
            totalDue,
            totalMeals: totalMealCount,
            avgMealCostPerDay,
            minMealTaker: minMealTaker.name,
            maxMealTaker: maxMealTaker.name,
            mealRate // Export for member breakdown usage
        };
    }, [meals, deposits, bills, expenses, selectedMonth]);

    // Calculate member breakdown
    const memberBreakdown = useMemo(() => {
        const breakdown: MemberSummary[] = [];
        const mealRate = monthlySummary.mealRate;

        members.forEach(member => {
            // Calculate member's share of bills
            let memberBillsDue = 0;
            let memberPaid = 0;
            let memberPending = 0;

            bills.forEach(bill => {
                const share = bill.shares.find((s: any) => s.userId === member.id);
                if (share) {
                    memberBillsDue += share.amount;
                    if (share.status === 'Paid') {
                        memberPaid += share.amount;
                    } else {
                        memberPending += share.amount;
                    }
                }
            });

            // Calculate member's meal cost using dynamic rate
            const memberMeals = meals.filter(m => {
                const mealUserId = m.userId?._id || m.userId;
                return String(mealUserId) === String(member.id);
            });
            const memberMealCount = memberMeals.reduce((sum, m) => sum + (m.totalMeals || 0), 0);
            const memberMealCost = memberMealCount * mealRate;

            // Calculate member's deposits
            const memberDeposits = deposits
                .filter(d => {
                    const depositUserId = d.userId?._id || d.userId;
                    return String(depositUserId) === String(member.id) && d.status === 'Approved';
                })
                .reduce((sum, d) => sum + d.amount, 0);

            // Calculate refund or due (Deposits - Meal Cost)
            // Negative means Due (Red), Positive means Refund (Green)
            const refundOrDue = memberDeposits - memberMealCost;

            breakdown.push({
                memberId: member.id,
                memberName: member.name,
                billsDue: memberBillsDue,
                paid: memberPaid,
                pending: memberPending,
                deposits: memberDeposits,
                refundOrDue
            });
        });

        return breakdown;
    }, [members, meals, deposits, bills, monthlySummary.mealRate]);

    // Filter member breakdown based on selected member
    const filteredBreakdown = useMemo(() => {
        if (selectedMember === 'all') return memberBreakdown;
        return memberBreakdown.filter(m => m.memberId === selectedMember);
    }, [memberBreakdown, selectedMember]);

    const formatCurrency = (amount: number) => `₹${amount.toFixed(2)}`;

    const getMonthYearString = () => {
        return selectedMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    };

    // Generate month options (last 12 months)
    const monthOptions = useMemo(() => {
        const options = [];
        for (let i = 0; i < 12; i++) {
            const date = new Date();
            date.setMonth(date.getMonth() - i);
            options.push(date);
        }
        return options;
    }, []);

    if (!user) return null;

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px] bg-slate-900">
                <div className="w-16 h-16 border-4 border-dashed rounded-full animate-spin border-emerald-500"></div>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-fade-in text-slate-300 pb-12">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-slate-800 rounded-xl shadow-lg border border-slate-700/50">
                        <span className="text-3xl">📊</span>
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold text-white tracking-tight">History & Reports</h1>
                        <p className="text-slate-400 text-sm mt-1">Financial overview and member insights</p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <div className="relative group">
                        <select
                            value={selectedMonth.toISOString()}
                            onChange={(e) => setSelectedMonth(new Date(e.target.value))}
                            className="appearance-none pl-4 pr-10 py-2.5 bg-slate-800 border border-slate-600 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/50 hover:bg-slate-700 transition-all cursor-pointer shadow-lg"
                        >
                            {monthOptions.map(month => (
                                <option key={month.toISOString()} value={month.toISOString()}>
                                    {month.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                                </option>
                            ))}
                        </select>
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                            ▼
                        </div>
                    </div>
                    <button className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-xl transition-all shadow-lg hover:shadow-emerald-500/20 flex items-center gap-2 active:scale-95">
                        <span>📥</span> Export
                    </button>
                </div>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-3 bg-slate-800/50 p-2 rounded-2xl border border-slate-700/30 backdrop-blur-sm w-fit">
                <select
                    value={selectedMember}
                    onChange={(e) => setSelectedMember(e.target.value)}
                    className="px-4 py-2 bg-slate-800 border-0 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/50 hover:bg-slate-700 transition-colors cursor-pointer min-w-[150px]"
                >
                    <option value="all">All Members</option>
                    {members.map(member => (
                        <option key={member.id} value={member.id}>{member.name}</option>
                    ))}
                </select>
                <div className="w-px bg-slate-700 my-1"></div>
                <select
                    value={selectedCostType}
                    onChange={(e) => setSelectedCostType(e.target.value)}
                    className="px-4 py-2 bg-slate-800 border-0 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/50 hover:bg-slate-700 transition-colors cursor-pointer min-w-[150px]"
                >
                    <option value="all">All Costs</option>
                    <option value="bills">Bills Only</option>
                    <option value="meals">Meals Only</option>
                    <option value="deposits">Deposits Only</option>
                </select>
            </div>

            {/* Monthly Summary Card */}
            <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl shadow-xl border border-slate-700/50 p-8 relative overflow-hidden group">
                {/* Background decoration */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:bg-emerald-500/10 transition-colors duration-500"></div>

                <div className="flex items-center justify-between mb-8 relative z-10">
                    <h2 className="text-xl font-bold text-white flex items-center gap-2">
                        <span className="w-1 h-6 bg-emerald-500 rounded-full"></span>
                        {getMonthYearString()} Summary
                    </h2>
                    <div className="px-3 py-1 bg-slate-700/50 rounded-full border border-slate-600/50 text-xs font-medium text-slate-400">
                        Real-time Data
                    </div>
                </div>

                <div className="space-y-8 relative z-10">
                    {/* Row 1 */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div className="flex justify-between items-center p-4 bg-slate-800/50 rounded-xl border border-slate-700/30 hover:border-slate-600 transition-colors">
                            <div className="flex flex-col">
                                <span className="text-slate-400 text-sm font-medium">Total Bills</span>
                                <span className="text-2xl font-bold text-white mt-1">{formatCurrency(monthlySummary.totalBills)}</span>
                            </div>
                            <span className="text-2xl opacity-50">📄</span>
                        </div>
                        <div className="flex justify-between items-center p-4 bg-slate-800/50 rounded-xl border border-slate-700/30 hover:border-slate-600 transition-colors">
                            <div className="flex flex-col">
                                <span className="text-slate-400 text-sm font-medium">Total Paid</span>
                                <span className="text-2xl font-bold text-emerald-400 mt-1">{formatCurrency(monthlySummary.totalPaid)}</span>
                            </div>
                            <span className="text-2xl opacity-50">✅</span>
                        </div>
                        <div className="flex justify-between items-center p-4 bg-slate-800/50 rounded-xl border border-slate-700/30 hover:border-slate-600 transition-colors">
                            <div className="flex flex-col">
                                <span className="text-slate-400 text-sm font-medium">Total Pending</span>
                                <span className="text-2xl font-bold text-red-400 mt-1">{formatCurrency(monthlySummary.totalPending)}</span>
                            </div>
                            <span className="text-2xl opacity-50">⏳</span>
                        </div>
                    </div>

                    {/* Row 2 */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 border-t border-slate-700/50 pt-8">
                        <div className="flex justify-between items-center group/item">
                            <p className="text-slate-400 group-hover/item:text-slate-300 transition-colors">Total Deposits:</p>
                            <p className="text-xl font-bold text-white">{formatCurrency(monthlySummary.totalDeposits)}</p>
                        </div>
                        <div className="flex justify-between items-center group/item">
                            <p className="text-slate-400 group-hover/item:text-slate-300 transition-colors">Total Meal Cost:</p>
                            <p className="text-xl font-bold text-white">{formatCurrency(monthlySummary.totalMealCost)}</p>
                        </div>
                        <div className="flex justify-between items-center group/item">
                            <p className="text-slate-400 group-hover/item:text-slate-300 transition-colors">Total Due:</p>
                            <p className={`text-xl font-bold ${monthlySummary.totalDue < 0 ? 'text-red-400' : 'text-emerald-400'}`}>
                                {formatCurrency(monthlySummary.totalDue)}
                            </p>
                        </div>
                    </div>

                    {/* Row 3 */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 border-t border-slate-700/50 pt-8">
                        <div className="flex justify-between items-center group/item">
                            <p className="text-slate-400 group-hover/item:text-slate-300 transition-colors">Total Meals:</p>
                            <p className="text-xl font-bold text-white">{monthlySummary.totalMeals}</p>
                        </div>
                        <div className="flex justify-between items-center group/item">
                            <p className="text-slate-400 group-hover/item:text-slate-300 transition-colors">Meal Rate:</p>
                            <p className="text-xl font-bold text-emerald-400">{formatCurrency(monthlySummary.mealRate)}</p>
                        </div>
                        <div className="flex justify-between items-center group/item">
                            <p className="text-slate-400 group-hover/item:text-slate-300 transition-colors">Max Meal Taker:</p>
                            <p className="text-xl font-bold text-white">{monthlySummary.maxMealTaker}</p>
                        </div>
                    </div>

                    {/* Row 4 */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 border-t border-slate-700/50 pt-8">
                        <div className="flex justify-between items-center group/item">
                            <p className="text-slate-400 group-hover/item:text-slate-300 transition-colors">Min Meal Taker:</p>
                            <p className="text-xl font-bold text-white">{monthlySummary.minMealTaker}</p>
                        </div>
                        <div className="hidden md:block"></div>
                        <div className="hidden md:block"></div>
                    </div>
                </div>

                <div className="mt-8 pt-6 border-t border-slate-700/30 flex justify-end">
                    <button
                        onClick={() => setPage('reports-analytics')}
                        className="text-emerald-400 hover:text-emerald-300 font-semibold flex items-center gap-2 transition-all hover:translate-x-1 group/btn"
                    >
                        View Detailed Report
                        <span className="group-hover/btn:translate-x-1 transition-transform">→</span>
                    </button>
                </div>
            </div>

            {/* Member Breakdown Table */}
            <div className="bg-slate-800 rounded-2xl shadow-xl border border-slate-700/50 overflow-hidden">
                <div className="p-6 border-b border-slate-700/50 flex items-center justify-between">
                    <h2 className="text-xl font-bold text-white flex items-center gap-2">
                        <span className="w-1 h-6 bg-emerald-500 rounded-full"></span>
                        Member Breakdown
                    </h2>
                    <span className="text-sm text-slate-400">{filteredBreakdown.length} Members</span>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-slate-900/50">
                            <tr>
                                <th className="px-8 py-5 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Member</th>
                                <th className="px-8 py-5 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Bills Due</th>
                                <th className="px-8 py-5 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Paid</th>
                                <th className="px-8 py-5 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Pending</th>
                                <th className="px-8 py-5 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Deposits</th>
                                <th className="px-8 py-5 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Refund/Due</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-700/50">
                            {filteredBreakdown.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-8 py-12 text-center text-slate-500">
                                        <div className="flex flex-col items-center gap-2">
                                            <span className="text-3xl opacity-50">📭</span>
                                            <p>No data available for this period</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                filteredBreakdown.map((member, index) => (
                                    <tr
                                        key={member.memberId}
                                        className="hover:bg-slate-700/30 transition-colors group"
                                        style={{ animationDelay: `${index * 50}ms` }}
                                    >
                                        <td className="px-8 py-5 whitespace-nowrap">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-xs font-bold text-emerald-400 border border-slate-600">
                                                    {member.memberName.charAt(0)}
                                                </div>
                                                <span className="font-semibold text-white group-hover:text-emerald-400 transition-colors">
                                                    {member.memberName}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-5 whitespace-nowrap text-slate-300 font-medium">
                                            {formatCurrency(member.billsDue)}
                                        </td>
                                        <td className="px-8 py-5 whitespace-nowrap text-emerald-400 font-bold">
                                            {formatCurrency(member.paid)}
                                        </td>
                                        <td className="px-8 py-5 whitespace-nowrap text-red-400 font-bold">
                                            {formatCurrency(member.pending)}
                                        </td>
                                        <td className="px-8 py-5 whitespace-nowrap text-slate-300 font-medium">
                                            {formatCurrency(member.deposits)}
                                        </td>
                                        <td className={`px-8 py-5 whitespace-nowrap font-bold ${member.refundOrDue < 0
                                                ? 'text-red-400'
                                                : 'text-emerald-400'
                                            }`}>
                                            {formatCurrency(member.refundOrDue)}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default HistoryPage;
