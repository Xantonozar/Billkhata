import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Role } from '../types';
import { ChartBarIcon, CreditCardIcon, ExportIcon } from '../components/Icons';

// --- MOCK DATA to match wireframes ---
const overviewData = {
    totalAmount: '₹27,550',
    totalBills: 8,
    billsPaid: { count: 5, percent: '62.5%' },
    billsPending: { count: 3, percent: '37.5%' }
};

const memberSummaryData = [
    { name: 'Raj', totalDue: '₹6,887.50', paid: '₹5,300', pending: '₹1,587.50', status: '⚠️ 1 Overdue' },
    { name: 'Amit', totalDue: '₹6,887.50', paid: '₹6,887.50', pending: '₹0', status: '✅ All Paid' },
    { name: 'Priya', totalDue: '₹6,887.50', paid: '₹6,300', pending: '₹587.50', status: '⏳ 1 Pending' },
    { name: 'Ravi', totalDue: '₹6,887.50', paid: '₹6,887.50', pending: '₹0', status: '✅ All Paid' }
];

const billDetailsData = [
    { bill: 'Rent', amount: 20000, split: 5000, dueDate: 'Oct 1', statuses: ['✅', '✅', '✅', '✅'], progress: 'Done' },
    { bill: 'Electricity', amount: 1200, split: 300, dueDate: 'Oct 15', statuses: ['⏳', '✅', '✅', '✅'], progress: '75%' },
    { bill: 'Wi-Fi', amount: 1000, split: 250, dueDate: 'Oct 10', statuses: ['✅', '✅', '⏳', '✅'], progress: '75%' },
    { bill: 'Water', amount: 800, split: 200, dueDate: 'Oct 12', statuses: ['⏳', '✅', '✅', '✅'], progress: '75%' },
    { bill: 'Gas', amount: 1500, split: 375, dueDate: 'Oct 8', statuses: ['✅', '✅', '✅', '✅'], progress: 'Done' },
    { bill: 'Maid', amount: 2000, split: 500, dueDate: 'Oct 5', statuses: ['✅', '✅', '✅', '✅'], progress: 'Done' },
    { bill: 'Utilities', amount: 850, split: 212.50, dueDate: 'Oct 18', statuses: ['❌', '❌', '❌', '❌'], progress: '0%' },
    { bill: 'Parking', amount: 200, split: 50, dueDate: 'Oct 20', statuses: ['❌', '❌', '❌', '❌'], progress: '0%' },
];

const paymentPunctualityData = [
    { name: 'Raj', percent: 50 },
    { name: 'Amit', percent: 100 },
    { name: 'Priya', percent: 75 },
    { name: 'Ravi', percent: 100 },
];
// --- Sub-components ---

const StatCard: React.FC<{ title: string; value: string | number; subtitle: string; children?: React.ReactNode }> = ({ title, value, subtitle, children }) => (
    <div className="bg-white dark:bg-gray-800 p-5 rounded-xl shadow-md">
        <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400">{title}</h3>
        <p className="text-3xl font-bold text-gray-800 dark:text-white mt-1">{value}</p>
        <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">{subtitle}</p>
        {children}
    </div>
);

const PunctualityBar: React.FC<{ name: string; percent: number }> = ({ name, percent }) => {
    const getColor = () => {
        if (percent >= 90) return 'bg-green-500';
        if (percent >= 70) return 'bg-yellow-500';
        return 'bg-red-500';
    };

    return (
        <div className="flex items-center gap-4">
            <span className="w-12 font-medium">{name}</span>
            <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-4">
                <div className={`${getColor()} h-4 rounded-full`} style={{ width: `${percent}%` }}></div>
            </div>
            <span className="w-12 text-right font-semibold">{percent}%</span>
        </div>
    );
};


const PaymentDashboardPage: React.FC = () => {
    const { user } = useAuth();

    if (user?.role !== Role.Manager) {
        return (
            <div className="text-center p-8">
                <h2 className="text-xl font-semibold">Access Denied</h2>
                <p className="text-gray-500">This page is only available for managers.</p>
            </div>
        );
    }
    
    return (
        <div className="space-y-8 animate-fade-in">
            <div className="flex flex-wrap justify-between items-center gap-4">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Payment Dashboard</h1>
                <div className="flex items-center gap-2">
                    <button className="px-4 py-2 text-sm font-semibold bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm">This Month ▼</button>
                    <button className="flex items-center gap-2 px-4 py-2 text-sm font-semibold bg-primary text-white rounded-md shadow-sm hover:bg-primary-600">
                        <ExportIcon className="w-4 h-4" />
                        Export
                    </button>
                </div>
            </div>

            {/* Overview Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard title="💰 Total Bills Amount" value={overviewData.totalAmount} subtitle="This Month" />
                <StatCard title="📋 Total Bills" value={overviewData.totalBills} subtitle="Categories" />
                <StatCard title="✅ Bills Fully Paid" value={overviewData.billsPaid.count} subtitle={`${overviewData.billsPaid.percent} Collected`} />
                <StatCard title="⏳ Bills Pending" value={overviewData.billsPending.count} subtitle={`${overviewData.billsPending.percent} Outstanding`} />
            </div>

            {/* Member-wise Bill Status */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-x-auto">
                <h3 className="p-5 text-lg font-semibold text-gray-800 dark:text-white">Member-wise Bill Status</h3>
                <table className="w-full text-sm text-left">
                    <thead className="bg-gray-50 dark:bg-gray-700/50 text-xs text-gray-600 dark:text-gray-300 uppercase">
                        <tr>
                            <th className="px-6 py-3">Member</th>
                            <th className="px-6 py-3 text-right">Total Due</th>
                            <th className="px-6 py-3 text-right">Paid</th>
                            <th className="px-6 py-3 text-right">Pending</th>
                            <th className="px-6 py-3">Status</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                        {memberSummaryData.map(member => (
                            <tr key={member.name} className="hover:bg-gray-50 dark:hover:bg-gray-700/30">
                                <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">{member.name}</td>
                                <td className="px-6 py-4 text-right">{member.totalDue}</td>
                                <td className="px-6 py-4 text-right text-green-600 dark:text-green-400 font-semibold">{member.paid}</td>
                                <td className="px-6 py-4 text-right text-red-600 dark:text-red-400 font-semibold">{member.pending}</td>
                                <td className="px-6 py-4 font-medium">{member.status}</td>
                            </tr>
                        ))}
                    </tbody>
                    <tfoot className="bg-gray-100 dark:bg-gray-700 font-bold">
                        <tr>
                            <td className="px-6 py-3">Total</td>
                            <td className="px-6 py-3 text-right">₹27,550</td>
                            <td className="px-6 py-3 text-right">₹25,375</td>
                            <td className="px-6 py-3 text-right">₹2,175</td>
                            <td className="px-6 py-3"></td>
                        </tr>
                    </tfoot>
                </table>
            </div>
            
            {/* Bill Details */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-x-auto">
                <h3 className="p-5 text-lg font-semibold text-gray-800 dark:text-white">Bill Details</h3>
                <p className="px-5 pb-3 text-xs text-gray-500 dark:text-gray-400">Legend: ✅ Paid & Approved | ⏳ Pending Approval | ❌ Not Paid</p>
                <table className="w-full text-sm text-center">
                    <thead className="bg-gray-50 dark:bg-gray-700/50 text-xs text-gray-600 dark:text-gray-300 uppercase">
                        <tr>
                            <th className="px-4 py-3 text-left">Bill</th>
                            <th className="px-4 py-3">Amount</th>
                            <th className="px-4 py-3">Split</th>
                            <th className="px-4 py-3">Due Date</th>
                            <th className="px-4 py-3">Raj</th>
                            <th className="px-4 py-3">Amit</th>
                            <th className="px-4 py-3">Priya</th>
                            <th className="px-4 py-3">Ravi</th>
                            <th className="px-4 py-3">Status</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                        {billDetailsData.map(bill => (
                             <tr key={bill.bill} className="hover:bg-gray-50 dark:hover:bg-gray-700/30">
                                <td className="px-4 py-3 text-left font-medium text-gray-900 dark:text-white">{bill.bill}</td>
                                <td className="px-4 py-3">₹{bill.amount.toLocaleString()}</td>
                                <td className="px-4 py-3">₹{bill.split.toLocaleString()}</td>
                                <td className="px-4 py-3">{bill.dueDate}</td>
                                {bill.statuses.map((status, index) => <td key={index} className="px-4 py-3">{status}</td>)}
                                <td className="px-4 py-3 font-semibold">{bill.progress}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Payment Punctuality */}
             <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-5">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-white">Payment Punctuality (Last 3 Months)</h3>
                <div className="mt-4 space-y-3 text-sm">
                    {paymentPunctualityData.map(p => <PunctualityBar key={p.name} name={p.name} percent={p.percent} />)}
                </div>
                 <p className="mt-4 text-xs text-gray-500 dark:text-gray-400">Green: &gt;90% | Yellow: 70-90% | Red: &lt;70%</p>
            </div>
        </div>
    );
};

export default PaymentDashboardPage;
