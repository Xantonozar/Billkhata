import React, { useState, useMemo } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Role } from '../types';
import { ChartBarIcon, ExportIcon, XIcon } from '../components/Icons';

// --- MOCK DATA ---
interface Transaction {
    id: string;
    date: string; // "YYYY-MM-DD"
    userId: string;
    userName: string;
    type: 'Bill' | 'Shopping' | 'Deposit' | 'Meal Cost';
    description: string;
    amount: number; // For bills/shopping it's a cost (-), for deposits it's a credit (+)
    status?: 'Paid' | 'Pending' | 'Approved' | 'Overdue' | 'Unpaid';
}

const mockHistory: Transaction[] = [
    // October Data
    { id: 'oct-r1', date: '2025-10-01', userId: '1', userName: 'Raj Kumar', type: 'Bill', description: 'Rent', amount: 5500, status: 'Paid' },
    { id: 'oct-r2', date: '2025-10-01', userId: '2', userName: 'Amit Hossain', type: 'Bill', description: 'Rent', amount: 5500, status: 'Paid' },
    { id: 'oct-r3', date: '2025-10-01', userId: '3', userName: 'Priya Das', type: 'Bill', description: 'Rent', amount: 4500, status: 'Overdue' },
    { id: 'oct-r4', date: '2025-10-01', userId: '4', userName: 'Ravi Islam', type: 'Bill', description: 'Rent', amount: 5000, status: 'Paid' },
    { id: 'oct-e1', date: '2025-10-15', userId: '1', userName: 'Raj Kumar', type: 'Bill', description: 'Electricity', amount: 300, status: 'Paid' },
    { id: 'oct-e2', date: '2025-10-15', userId: '2', userName: 'Amit Hossain', type: 'Bill', description: 'Electricity', amount: 300, status: 'Paid' },
    { id: 'oct-e3', date: '2025-10-15', userId: '3', userName: 'Priya Das', type: 'Bill', description: 'Electricity', amount: 300, status: 'Paid' },
    { id: 'oct-e4', date: '2025-10-15', userId: '4', userName: 'Ravi Islam', type: 'Bill', description: 'Electricity', amount: 300, status: 'Unpaid' },
    { id: 'oct-d1', date: '2025-10-01', userId: '1', userName: 'Raj Kumar', type: 'Deposit', description: 'Meal Fund Deposit', amount: 2000, status: 'Approved' },
    { id: 'oct-d2', date: '2025-10-01', userId: '2', userName: 'Amit Hossain', type: 'Deposit', description: 'Meal Fund Deposit', amount: 2000, status: 'Approved' },
    { id: 'oct-d3', date: '2025-10-01', userId: '3', userName: 'Priya Das', type: 'Deposit', description: 'Meal Fund Deposit', amount: 2000, status: 'Approved' },
    { id: 'oct-d4', date: '2025-10-01', userId: '4', userName: 'Ravi Islam', type: 'Deposit', description: 'Meal Fund Deposit', amount: 2000, status: 'Approved' },
    { id: 'oct-s1', date: '2025-10-07', userId: '1', userName: 'Raj Kumar', type: 'Shopping', description: 'Weekly Groceries', amount: 1850, status: 'Approved' },
    ...Array.from({ length: 30 }, (_, i) => ({ id: `oct-m1-${i}`, date: `2025-10-${String(i + 1).padStart(2, '0')}`, userId: '1', userName: 'Raj Kumar', type: 'Meal Cost', description: `Meals for day ${i + 1}`, amount: 136.5, status: 'Approved' } as Transaction)),
    ...Array.from({ length: 28 }, (_, i) => ({ id: `oct-m2-${i}`, date: `2025-10-${String(i + 1).padStart(2, '0')}`, userId: '2', userName: 'Amit Hossain', type: 'Meal Cost', description: `Meals for day ${i + 1}`, amount: 91, status: 'Approved' } as Transaction)),
    ...Array.from({ length: 31 }, (_, i) => ({ id: `oct-m3-${i}`, date: `2025-10-${String(i + 1).padStart(2, '0')}`, userId: '3', userName: 'Priya Das', type: 'Meal Cost', description: `Meals for day ${i + 1}`, amount: 136.5, status: 'Approved' } as Transaction)),
    ...Array.from({ length: 25 }, (_, i) => ({ id: `oct-m4-${i}`, date: `2025-10-${String(i + 1).padStart(2, '0')}`, userId: '4', userName: 'Ravi Islam', type: 'Meal Cost', description: `Meals for day ${i + 1}`, amount: 91, status: 'Approved' } as Transaction)),
    
    // September Data
    { id: 'sep-r1', date: '2025-09-01', userId: '1', userName: 'Raj Kumar', type: 'Bill', description: 'Rent', amount: 5500, status: 'Paid' },
    { id: 'sep-r2', date: '2025-09-01', userId: '2', userName: 'Amit Hossain', type: 'Bill', description: 'Rent', amount: 5500, status: 'Paid' },
    { id: 'sep-r3', date: '2025-09-01', userId: '3', userName: 'Priya Das', type: 'Bill', description: 'Rent', amount: 4500, status: 'Paid' },
    { id: 'sep-r4', date: '2025-09-01', userId: '4', userName: 'Ravi Islam', type: 'Bill', description: 'Rent', amount: 5000, status: 'Paid' },
    { id: 'sep-e1', date: '2025-09-15', userId: '1', userName: 'Raj Kumar', type: 'Bill', description: 'Electricity', amount: 280, status: 'Paid' },
    { id: 'sep-e2', date: '2025-09-15', userId: '2', userName: 'Amit Hossain', type: 'Bill', description: 'Electricity', amount: 280, status: 'Paid' },
    { id: 'sep-e3', date: '2025-09-15', userId: '3', userName: 'Priya Das', type: 'Bill', description: 'Electricity', amount: 280, status: 'Paid' },
    { id: 'sep-e4', date: '2025-09-15', userId: '4', userName: 'Ravi Islam', type: 'Bill', description: 'Electricity', amount: 280, status: 'Paid' },
    { id: 'sep-d1', date: '2025-09-01', userId: '1', userName: 'Raj Kumar', type: 'Deposit', description: 'Meal Fund Deposit', amount: 2500, status: 'Approved' },
    { id: 'sep-d2', date: '2025-09-01', userId: '2', userName: 'Amit Hossain', type: 'Deposit', description: 'Meal Fund Deposit', amount: 2500, status: 'Approved' },
    { id: 'sep-d3', date: '2025-09-01', userId: '3', userName: 'Priya Das', type: 'Deposit', description: 'Meal Fund Deposit', amount: 2500, status: 'Approved' },
    { id: 'sep-d4', date: '2025-09-01', userId: '4', userName: 'Ravi Islam', type: 'Deposit', description: 'Meal Fund Deposit', amount: 2500, status: 'Approved' },
    { id: 'sep-s1', date: '2025-09-10', userId: '2', userName: 'Amit Hossain', type: 'Shopping', description: 'Mid-month Groceries', amount: 2100, status: 'Approved' },
    ...Array.from({ length: 30 }, (_, i) => ({ id: `sep-m1-${i}`, date: `2025-09-${String(i + 1).padStart(2, '0')}`, userId: '1', userName: 'Raj Kumar', type: 'Meal Cost', description: `Meals for day ${i + 1}`, amount: 130, status: 'Approved' } as Transaction)),
    ...Array.from({ length: 30 }, (_, i) => ({ id: `sep-m2-${i}`, date: `2025-09-${String(i + 1).padStart(2, '0')}`, userId: '2', userName: 'Amit Hossain', type: 'Meal Cost', description: `Meals for day ${i + 1}`, amount: 130, status: 'Approved' } as Transaction)),

    // August Data
    { id: 'aug-r1', date: '2025-08-01', userId: '1', userName: 'Raj Kumar', type: 'Bill', description: 'Rent', amount: 5500, status: 'Paid' },
    { id: 'aug-r2', date: '2025-08-01', userId: '2', userName: 'Amit Hossain', type: 'Bill', description: 'Rent', amount: 5500, status: 'Paid' },
    { id: 'aug-d1', date: '2025-08-01', userId: '1', userName: 'Raj Kumar', type: 'Deposit', description: 'Meal Fund Deposit', amount: 3000, status: 'Approved' },
    { id: 'aug-d2', date: '2025-08-01', userId: '2', userName: 'Amit Hossain', type: 'Deposit', description: 'Meal Fund Deposit', amount: 3000, status: 'Approved' },
    { id: 'aug-s1', date: '2025-08-12', userId: '3', userName: 'Priya Das', type: 'Shopping', description: 'Festivity Shopping', amount: 3500, status: 'Approved' },
    ...Array.from({ length: 31 }, (_, i) => ({ id: `aug-m1-${i}`, date: `2025-08-${String(i + 1).padStart(2, '0')}`, userId: '1', userName: 'Raj Kumar', type: 'Meal Cost', description: `Meals for day ${i + 1}`, amount: 125, status: 'Approved' } as Transaction)),
    ...Array.from({ length: 28 }, (_, i) => ({ id: `aug-m2-${i}`, date: `2025-08-${String(i + 1).padStart(2, '0')}`, userId: '2', userName: 'Amit Hossain', type: 'Meal Cost', description: `Meals for day ${i + 1}`, amount: 125, status: 'Approved' } as Transaction)),
    ...Array.from({ length: 30 }, (_, i) => ({ id: `aug-m3-${i}`, date: `2025-08-${String(i + 1).padStart(2, '0')}`, userId: '3', userName: 'Priya Das', type: 'Meal Cost', description: `Meals for day ${i + 1}`, amount: 125, status: 'Approved' } as Transaction)),
];
const members = [
    { id: '1', name: 'Raj Kumar' }, { id: '2', name: 'Amit Hossain' },
    { id: '3', name: 'Priya Das' }, { id: '4', name: 'Ravi Islam' }
];

// --- MODAL ---
interface DetailedReportModalProps {
    onClose: () => void;
    transactions: Transaction[];
    month: string;
}

const DetailedReportModal: React.FC<DetailedReportModalProps> = ({ onClose, transactions, month }) => {
    
    const { totalExpenses, totalDeposits, balance } = useMemo(() => {
        let totalExpenses = 0;
        let totalDeposits = 0;
        transactions.forEach(t => {
            if (t.type === 'Deposit') {
                totalDeposits += t.amount;
            } else { // Bill, Shopping, Meal Cost are expenses
                totalExpenses += t.amount;
            }
        });
        return { totalExpenses, totalDeposits, balance: totalDeposits - totalExpenses };
    }, [transactions]);
    
    const sortedTransactions = [...transactions].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 animate-fade-in p-4" onClick={onClose}>
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
                <div className="p-5 border-b dark:border-slate-700 flex justify-between items-center sticky top-0 bg-white dark:bg-slate-800 z-10">
                    <div>
                        <h2 className="text-xl font-bold font-sans">Detailed Report - {month}</h2>
                        <p className="text-sm text-slate-500 dark:text-slate-400">A full breakdown of all transactions.</p>
                    </div>
                     <button onClick={onClose} className="p-1 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700"><XIcon className="w-5 h-5"/></button>
                </div>

                <div className="p-5 overflow-y-auto">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4 text-center">
                        <div className="p-3 bg-red-50 dark:bg-red-500/10 rounded-lg">
                            <p className="text-sm text-red-600 dark:text-red-300">Total Expenses</p>
                            <p className="font-bold text-lg text-red-600 dark:text-red-300">-₹{totalExpenses.toFixed(2)}</p>
                        </div>
                        <div className="p-3 bg-green-50 dark:bg-green-500/10 rounded-lg">
                             <p className="text-sm text-green-600 dark:text-green-300">Total Deposits</p>
                            <p className="font-bold text-lg text-green-600 dark:text-green-300">+₹{totalDeposits.toFixed(2)}</p>
                        </div>
                        <div className={`p-3 rounded-lg ${balance >= 0 ? 'bg-green-50 dark:bg-green-500/10' : 'bg-red-50 dark:bg-red-500/10'}`}>
                            <p className={`text-sm ${balance >= 0 ? 'text-green-600 dark:text-green-300' : 'text-red-600 dark:text-red-300'}`}>Final Balance</p>
                            <p className={`font-bold text-lg ${balance >= 0 ? 'text-green-600 dark:text-green-300' : 'text-red-600 dark:text-red-300'}`}>{balance >= 0 ? `+₹${balance.toFixed(2)}` : `-₹${Math.abs(balance).toFixed(2)}`}</p>
                        </div>
                    </div>
                    
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-slate-50 dark:bg-slate-700/50 text-xs text-slate-600 dark:text-slate-300 uppercase">
                                <tr>
                                    <th className="px-4 py-2">Date</th>
                                    <th className="px-4 py-2">Description</th>
                                    <th className="px-4 py-2">Member</th>
                                    <th className="px-4 py-2 text-right">Amount</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                                {sortedTransactions.map(t => (
                                    <tr key={t.id}>
                                        <td className="px-4 py-2">{new Date(t.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}</td>
                                        <td className="px-4 py-2">{t.description} ({t.type})</td>
                                        <td className="px-4 py-2">{t.userName}</td>
                                        <td className={`px-4 py-2 text-right font-semibold ${t.type === 'Deposit' ? 'text-green-600 dark:text-green-400' : 'text-slate-700 dark:text-slate-300'}`}>
                                            {t.type === 'Deposit' ? `+₹${t.amount.toFixed(2)}` : `-₹${t.amount.toFixed(2)}`}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                <div className="p-4 border-t dark:border-slate-700 flex justify-end sticky bottom-0 bg-white dark:bg-slate-800 z-10">
                    <button onClick={onClose} className="px-4 py-2 bg-slate-200 dark:bg-slate-600 font-semibold rounded-lg hover:bg-slate-300 dark:hover:bg-slate-500">Close</button>
                </div>
            </div>
        </div>
    );
};


// --- VIEWS ---

const MemberHistoryView: React.FC<{
    user: any,
    historyData: Transaction[],
    selectedMonth: string,
    setSelectedMonth: (month: string) => void
}> = ({ user, historyData, selectedMonth, setSelectedMonth }) => {
    
    const userSummary = useMemo(() => {
        const userHistory = historyData.filter(h => h.userId === user.id);
        const bills = userHistory.filter(h => h.type === 'Bill');
        const mealCosts = userHistory.filter(h => h.type === 'Meal Cost');
        const deposits = userHistory.filter(h => h.type === 'Deposit');

        const totalBills = bills.reduce((sum, b) => sum + b.amount, 0);
        const paid = bills.filter(b => b.status === 'Paid' || b.status === 'Approved').reduce((sum, b) => sum + b.amount, 0);
        const pendingApproval = bills.filter(b => b.status === 'Pending').reduce((sum, b) => sum + b.amount, 0);
        const due = totalBills - paid - pendingApproval;
        
        const totalMealCost = mealCosts.reduce((sum, m) => sum + m.amount, 0);
        const mealDays = new Set(mealCosts.map(m => m.date)).size;
        const avgMealCost = mealDays > 0 ? totalMealCost / mealDays : 0;
        
        const totalDeposits = deposits.reduce((sum, d) => sum + d.amount, 0);
        const refundable = totalDeposits - totalMealCost;

        return { totalBills, paid, pendingApproval, due, totalMealCost, avgMealCost, totalDeposits, refundable, meals: mealDays };

    }, [historyData, user.id]);

    const [activityFilter, setActivityFilter] = useState('All');

    const filteredActivity = useMemo(() => {
        const userHistory = historyData.filter(h => h.userId === user.id && h.type !== 'Meal Cost');
        if (activityFilter === 'All') return userHistory;
        if (activityFilter === 'Payments') return userHistory.filter(h => h.type === 'Bill' || h.type === 'Shopping');
        if (activityFilter === 'Deposits') return userHistory.filter(h => h.type === 'Deposit');
        return [];
    }, [historyData, user.id, activityFilter]);

    return (
        <div className="space-y-6">
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-md p-6">
                <h3 className="font-bold text-lg mb-3">{selectedMonth} Summary</h3>
                <div className="border-t pt-3 dark:border-slate-700 grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                    <div>Total Bills Assigned: <span className="font-semibold float-right">₹{userSummary.totalBills.toFixed(2)}</span></div>
                    <div className="text-green-600 dark:text-green-400">Paid: <span className="font-semibold float-right">₹{userSummary.paid.toFixed(2)} ✅</span></div>
                    <div className="text-yellow-600 dark:text-yellow-400">Pending Approval: <span className="font-semibold float-right">₹{userSummary.pendingApproval.toFixed(2)} ⏳</span></div>
                    <div className="text-red-600 dark:text-red-400">Due: <span className="font-semibold float-right">₹{userSummary.due.toFixed(2)} ⚠️</span></div>
                    <div className="col-span-2 my-1 border-t dark:border-slate-700"></div>
                    <div>Meals ({userSummary.meals} days): <span className="font-semibold float-right">₹{userSummary.totalMealCost.toFixed(2)}</span></div>
                    <div>Average Meal Cost/Day: <span className="font-semibold float-right">₹{userSummary.avgMealCost.toFixed(2)}</span></div>
                    <div>Deposits: <span className="font-semibold float-right">₹{userSummary.totalDeposits.toFixed(2)}</span></div>
                    <div className="col-span-2 font-semibold text-green-600 dark:text-green-400">Refundable: <span className="font-bold float-right">₹{userSummary.refundable.toFixed(2)}</span></div>
                </div>
            </div>
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-md p-6">
                <h3 className="font-bold text-lg mb-3">Recent Activity</h3>
                 <div className="flex flex-wrap gap-2 mb-3">
                    {['All', 'Payments', 'Deposits'].map(filter => (
                        <button key={filter} onClick={() => setActivityFilter(filter)} className={`px-3 py-1 text-xs font-semibold rounded-full transition-colors ${activityFilter === filter ? 'bg-primary text-white' : 'bg-slate-200 dark:bg-slate-700 hover:bg-slate-300'}`}>
                            {filter}
                        </button>
                    ))}
                </div>
                <div className="border-t pt-3 dark:border-slate-700 space-y-2">
                    {filteredActivity.slice(0, 6).map(item => (
                        <div key={item.id} className="flex justify-between items-center p-2 bg-slate-50 dark:bg-slate-700/50 rounded-md text-sm">
                            <span>{new Date(item.date).toLocaleDateString('en-GB', {day: 'numeric', month: 'short'})} • {item.description} (₹{item.amount})</span>
                            <span className={`font-semibold ${item.status === 'Approved' || item.status === 'Paid' ? 'text-green-600' : 'text-yellow-600'}`}>
                                {item.status}
                            </span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

const ManagerHistoryView: React.FC<{
    summaryTableData: any[];
    summaryCardData: any;
    selectedMonth: string;
    selectedMember: string;
    setSelectedMember: (member: string) => void;
    costCategory: string;
    setCostCategory: (category: string) => void;
    onOpenReport: () => void;
}> = ({ summaryTableData, summaryCardData, selectedMonth, selectedMember, setSelectedMember, costCategory, setCostCategory, onOpenReport }) => {
    
    const isMealCostView = costCategory === 'Meal Costs';

    return (
        <div className="space-y-6">
            <div className="flex flex-wrap gap-2">
                <select value={selectedMember} onChange={(e) => setSelectedMember(e.target.value)} className="px-4 py-2 text-sm font-semibold rounded-lg bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600">
                    <option value="All Members">All Members</option>
                    {members.map(m => <option key={m.id} value={m.name}>{m.name}</option>)}
                </select>
                <select value={costCategory} onChange={(e) => setCostCategory(e.target.value)} className="px-4 py-2 text-sm font-semibold rounded-lg bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600">
                    <option value="All Costs">All Costs</option>
                    <option value="Bills">Bills</option>
                    <option value="Shopping">Shopping</option>
                    <option value="Deposits">Deposits</option>
                </select>
            </div>
            
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-md p-6">
                <h3 className="font-bold text-lg mb-3">{selectedMonth} Summary</h3>
                <div className="border-t pt-3 dark:border-slate-700 grid grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-3 text-sm">
                    <div>Total Bills: <span className="font-semibold float-right">₹{summaryCardData.billsDue.toFixed(2)}</span></div>
                    <div className="text-green-600 dark:text-green-400">Total Paid: <span className="font-semibold float-right">₹{summaryCardData.paid.toFixed(2)}</span></div>
                    <div className="text-red-600 dark:text-red-400">Total Pending: <span className="font-semibold float-right">₹{summaryCardData.pending.toFixed(2)}</span></div>
                    <div className="col-span-full my-1 border-t dark:border-slate-700"></div>
                    <div>Total Deposits: <span className="font-semibold float-right">₹{summaryCardData.deposits.toFixed(2)}</span></div>
                    <div>Total Meal Cost: <span className="font-semibold float-right">₹{summaryCardData.totalMealCost.toFixed(2)}</span></div>
                    <div className={`font-semibold ${summaryCardData.refund >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {summaryCardData.refund >= 0 ? 'Total Refundable:' : 'Total Due:'}
                        <span className="font-bold float-right">{summaryCardData.refund >= 0 ? `+₹${summaryCardData.refund.toFixed(2)}` : `-₹${Math.abs(summaryCardData.refund).toFixed(2)}`}</span>
                    </div>
                    <div className="col-span-full my-1 border-t dark:border-slate-700"></div>
                    <div>Total Meals: <span className="font-semibold float-right">{summaryCardData.totalMeals}</span></div>
                    <div>Avg Meal Cost/Day: <span className="font-semibold float-right">₹{summaryCardData.avgMealCost.toFixed(2)}</span></div>
                    <div>Max Meal Taker: <span className="font-semibold float-right">{summaryCardData.maxTaker.name}</span></div>
                    <div>Min Meal Taker: <span className="font-semibold float-right">{summaryCardData.minTaker.name}</span></div>
                </div>
                <button onClick={onOpenReport} className="text-sm font-semibold text-primary hover:underline mt-4">View Detailed Report →</button>
            </div>

             <div className="bg-white dark:bg-slate-800 rounded-xl shadow-md overflow-x-auto">
                <h3 className="font-bold text-lg p-5">Member Breakdown</h3>
                <table className="w-full text-sm text-left">
                     <thead className="bg-slate-50 dark:bg-slate-700/50 text-xs text-slate-600 dark:text-slate-300 uppercase">
                        <tr>
                            <th className="px-4 py-3">Member</th>
                            <th className="px-4 py-3">Bills Due</th>
                            <th className="px-4 py-3">Paid</th>
                            <th className="px-4 py-3">Pending</th>
                            <th className="px-4 py-3">Deposits</th>
                            <th className="px-4 py-3">Refund/Due</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                        {summaryTableData.map(member => (
                            <tr key={member.name} className="hover:bg-slate-50 dark:hover:bg-slate-700/30">
                                <td className="px-4 py-3 font-medium text-slate-900 dark:text-white">{member.name}</td>
                                <td className="px-4 py-3">₹{member.billsDue.toFixed(2)}</td>
                                <td className="px-4 py-3 text-green-600">₹{member.paid.toFixed(2)}</td>
                                <td className="px-4 py-3 text-red-600">₹{member.pending.toFixed(2)}</td>
                                <td className="px-4 py-3">₹{member.deposits.toFixed(2)}</td>
                                <td className={`px-4 py-3 font-semibold ${member.refund >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                    {member.refund >= 0 ? `+₹${member.refund.toFixed(2)}` : `-₹${Math.abs(member.refund).toFixed(2)}`}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};


const HistoryPage: React.FC = () => {
    const { user } = useAuth();
    const [isReportModalOpen, setIsReportModalOpen] = useState(false);
    const [selectedMonth, setSelectedMonth] = useState('October 2025');
    const [selectedMember, setSelectedMember] = useState('All Members');
    const [costCategory, setCostCategory] = useState('All Costs');

    const monthlyHistory = useMemo(() => {
        const monthMap: Record<string, number> = { 'October 2025': 9, 'September 2025': 8, 'August 2025': 7 };
        const monthIndex = monthMap[selectedMonth];
        return mockHistory.filter(h => new Date(h.date).getMonth() === monthIndex);
    }, [selectedMonth]);

    const managerSummaryData = useMemo(() => {
        const filteredForTable = members
            .filter(m => selectedMember === 'All Members' || m.name === selectedMember)
            .map(member => {
                const memberHistory = monthlyHistory.filter(h => h.userId === member.id);
                const bills = memberHistory.filter(h => h.type === 'Bill');
                const mealCosts = memberHistory.filter(h => h.type === 'Meal Cost');
                const deposits = memberHistory.filter(h => h.type === 'Deposit');

                const billsDue = bills.reduce((s, b) => s + b.amount, 0);
                const paid = bills.filter(b => b.status === 'Paid' || b.status === 'Approved').reduce((s, b) => s + b.amount, 0);
                const pending = billsDue - paid;
                const totalMealCost = mealCosts.reduce((s, m) => s + m.amount, 0);
                const totalDeposits = deposits.reduce((s, d) => s + d.amount, 0);
                const refund = totalDeposits - totalMealCost;
                return { name: member.name, billsDue, paid, pending, deposits: totalDeposits, refund };
            });

        const filteredForCard = monthlyHistory.filter(h => selectedMember === 'All Members' || h.userName === selectedMember);
        
        const bills = filteredForCard.filter(h => h.type === 'Bill');
        const deposits = filteredForCard.filter(h => h.type === 'Deposit');
        const mealCosts = filteredForCard.filter(h => h.type === 'Meal Cost');
        
        const cardSummary = {
            billsDue: bills.reduce((s, b) => s + b.amount, 0),
            paid: bills.filter(b => b.status === 'Paid').reduce((s, b) => s + b.amount, 0),
            pending: bills.filter(b => b.status === 'Unpaid' || b.status === 'Overdue').reduce((s, b) => s + b.amount, 0),
            deposits: deposits.reduce((s, d) => s + d.amount, 0),
            totalMealCost: mealCosts.reduce((s, m) => s + m.amount, 0),
            refund: 0
        };
        cardSummary.refund = cardSummary.deposits - cardSummary.totalMealCost;
        
        const mealsByUser = mealCosts.reduce((acc, meal) => {
            acc[meal.userName] = (acc[meal.userName] || 0) + 1; // Count meal entries
            return acc;
        }, {} as Record<string, number>);
        
        let maxTaker = { name: 'N/A', count: 0 };
        let minTaker = { name: 'N/A', count: Infinity };

        Object.entries(mealsByUser).forEach(([name, count]) => {
            // FIX: The value from Object.entries on a record can be inferred as `unknown`. Cast to number to perform comparisons.
            const numericCount = count as number;
            if (numericCount > maxTaker.count) maxTaker = { name, count: numericCount };
            if (numericCount < minTaker.count) minTaker = { name, count: numericCount };
        });

        if (minTaker.count === Infinity) minTaker.name = 'N/A';
        
        const totalMealDays = new Set(mealCosts.map(m => m.date)).size;
        const avgMealCost = totalMealDays > 0 ? cardSummary.totalMealCost / totalMealDays : 0;

        return {
            tableData: filteredForTable,
            cardData: {
                ...cardSummary,
                totalMeals: mealCosts.length,
                avgMealCost,
                maxTaker,
                minTaker,
            }
        };
    }, [monthlyHistory, selectedMember]);
    
    const filteredTransactionsForReport = useMemo(() => {
        return monthlyHistory.filter(h => 
            selectedMember === 'All Members' || h.userName === selectedMember
        );
    }, [monthlyHistory, selectedMember]);

    if (!user) return null;
  
    return (
      <>
        <div className="space-y-6 animate-fade-in">
            <div className="flex flex-wrap justify-between items-center gap-4">
                <div className="flex items-center gap-4">
                    <ChartBarIcon className="w-8 h-8 text-primary" />
                    <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
                        {user.role === Role.Manager ? 'All Members History' : 'My Payment History'}
                    </h1>
                </div>
                 <div className="flex items-center gap-2">
                    <select value={selectedMonth} onChange={e => setSelectedMonth(e.target.value)} className="px-4 py-2 text-sm font-semibold bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm">
                        <option>October 2025</option>
                        <option>September 2025</option>
                        <option>August 2025</option>
                    </select>
                    <button className="flex items-center gap-2 px-4 py-2 text-sm font-semibold bg-primary text-white rounded-md shadow-sm hover:bg-primary-600">
                        <ExportIcon className="w-4 h-4" />
                        Export
                    </button>
                </div>
            </div>
            
            {user.role === Role.Manager ? (
                <ManagerHistoryView 
                    summaryTableData={managerSummaryData.tableData}
                    summaryCardData={managerSummaryData.cardData}
                    selectedMonth={selectedMonth}
                    selectedMember={selectedMember}
                    setSelectedMember={setSelectedMember}
                    costCategory={costCategory}
                    setCostCategory={setCostCategory}
                    onOpenReport={() => setIsReportModalOpen(true)}
                />
            ) : (
                <MemberHistoryView 
                    user={user}
                    historyData={monthlyHistory}
                    selectedMonth={selectedMonth}
                    setSelectedMonth={setSelectedMonth}
                />
            )}
        </div>
        {isReportModalOpen && <DetailedReportModal onClose={() => setIsReportModalOpen(false)} transactions={filteredTransactionsForReport} month={selectedMonth} />}
      </>
    );
};

export default HistoryPage;