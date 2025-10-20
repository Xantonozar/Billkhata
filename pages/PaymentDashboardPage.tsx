import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Role } from '../types';
import { ChartBarIcon, CreditCardIcon, ExportIcon } from '../components/Icons';

// --- MOCK DATA ---
const mockPaymentsData: { [key: string]: any } = {
    'October 2025': {
        overviewData: { totalAmount: '₹27,550', totalBills: 8, billsPaid: { count: 5, percent: '62.5%' }, billsPending: { count: 3, percent: '37.5%' } },
        memberSummaryData: [
            { name: 'Raj', totalDue: '₹6,887.50', paid: '₹5,300', pending: '₹1,587.50', status: '⚠️ 1 Overdue' },
            { name: 'Amit', totalDue: '₹6,887.50', paid: '₹6,887.50', pending: '₹0', status: '✅ All Paid' },
            { name: 'Priya', totalDue: '₹6,887.50', paid: '₹6,300', pending: '₹587.50', status: '⏳ 1 Pending' },
            { name: 'Ravi', totalDue: '₹6,887.50', paid: '₹6,887.50', pending: '₹0', status: '✅ All Paid' }
        ],
        billDetailsData: [
            { bill: 'Rent', amount: 20000, split: 5000, dueDate: 'Oct 1', statuses: ['✅', '✅', '⚠️', '✅'], progress: '75%' },
            { bill: 'Electricity', amount: 1200, split: 300, dueDate: 'Oct 15', statuses: ['✅', '✅', '✅', '❌'], progress: '75%' },
            { bill: 'Wi-Fi', amount: 1000, split: 250, dueDate: 'Oct 10', statuses: ['✅', '✅', '⏳', '✅'], progress: '75%' },
        ]
    },
    'September 2025': {
        overviewData: { totalAmount: '₹25,800', totalBills: 6, billsPaid: { count: 6, percent: '100%' }, billsPending: { count: 0, percent: '0%' } },
        memberSummaryData: [
            { name: 'Raj', totalDue: '₹6,450', paid: '₹6,450', pending: '₹0', status: '✅ All Paid' },
            { name: 'Amit', totalDue: '₹6,450', paid: '₹6,450', pending: '₹0', status: '✅ All Paid' },
            { name: 'Priya', totalDue: '₹6,450', paid: '₹6,450', pending: '₹0', status: '✅ All Paid' },
            { name: 'Ravi', totalDue: '₹6,450', paid: '₹6,450', pending: '₹0', status: '✅ All Paid' }
        ],
        billDetailsData: [
            { bill: 'Rent', amount: 20000, split: 5000, dueDate: 'Sep 1', statuses: ['✅', '✅', '✅', '✅'], progress: 'Done' },
            { bill: 'Electricity', amount: 1100, split: 275, dueDate: 'Sep 15', statuses: ['✅', '✅', '✅', '✅'], progress: 'Done' },
        ]
    }
};

const mockPunctualityData: { [key: string]: any[] } = {
    'Last Month': [{ name: 'Raj', percent: 90 }, { name: 'Amit', percent: 100 }, { name: 'Priya', percent: 100 }, { name: 'Ravi', percent: 95 }],
    'Last 3 Months': [{ name: 'Raj', percent: 75 }, { name: 'Amit', percent: 100 }, { name: 'Priya', percent: 92 }, { name: 'Ravi', percent: 98 }],
    'Last 6 Months': [{ name: 'Raj', percent: 80 }, { name: 'Amit', percent: 95 }, { name: 'Priya', percent: 94 }, { name: 'Ravi', percent: 97 }],
    'Last 1 Year': [{ name: 'Raj', percent: 82 }, { name: 'Amit', percent: 96 }, { name: 'Priya', percent: 91 }, { name: 'Ravi', percent: 95 }],
    'Last 2 Years': [{ name: 'Raj', percent: 85 }, { name: 'Amit', percent: 98 }, { name: 'Priya', percent: 93 }, { name: 'Ravi', percent: 96 }],
};

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
    const [selectedMonth, setSelectedMonth] = useState('October 2025');
    const [punctualityRange, setPunctualityRange] = useState('Last 3 Months');

    if (user?.role !== Role.Manager) {
        return (
            <div className="text-center p-8">
                <h2 className="text-xl font-semibold">Access Denied</h2>
                <p className="text-gray-500">This page is only available for managers.</p>
            </div>
        );
    }
    
    const currentData = mockPaymentsData[selectedMonth];
    const currentPunctualityData = mockPunctualityData[punctualityRange];

    return (
        <div className="space-y-8 animate-fade-in">
            <div className="flex flex-wrap justify-between items-center gap-4">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Payment Dashboard</h1>
                <div className="flex items-center gap-2">
                    <select value={selectedMonth} onChange={e => setSelectedMonth(e.target.value)} className="px-4 py-2 text-sm font-semibold bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm">
                        <option>October 2025</option>
                        <option>September 2025</option>
                    </select>
                    <button className="flex items-center gap-2 px-4 py-2 text-sm font-semibold bg-primary text-white rounded-md shadow-sm hover:bg-primary-600">
                        <ExportIcon className="w-4 h-4" />
                        Export
                    </button>
                </div>
            </div>

            {/* Overview Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard title="💰 Total Bills Amount" value={currentData.overviewData.totalAmount} subtitle="This Month" />
                <StatCard title="📋 Total Bills" value={currentData.overviewData.totalBills} subtitle="Categories" />
                <StatCard title="✅ Bills Fully Paid" value={currentData.overviewData.billsPaid.count} subtitle={`${currentData.overviewData.billsPaid.percent} Collected`} />
                <StatCard title="⏳ Bills Pending" value={currentData.overviewData.billsPending.count} subtitle={`${currentData.overviewData.billsPending.percent} Outstanding`} />
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
                        {currentData.memberSummaryData.map((member: any) => (
                            <tr key={member.name} className="hover:bg-gray-50 dark:hover:bg-gray-700/30">
                                <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">{member.name}</td>
                                <td className="px-6 py-4 text-right">{member.totalDue}</td>
                                <td className="px-6 py-4 text-right text-green-600 dark:text-green-400 font-semibold">{member.paid}</td>
                                <td className="px-6 py-4 text-right text-red-600 dark:text-red-400 font-semibold">{member.pending}</td>
                                <td className="px-6 py-4 font-medium">{member.status}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            
            {/* Bill Details */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-x-auto">
                <h3 className="p-5 text-lg font-semibold text-gray-800 dark:text-white">Bill Details</h3>
                <p className="px-5 pb-3 text-xs text-gray-500 dark:text-gray-400">Legend: ✅ Paid & Approved | ⏳ Pending Approval | ❌ Not Paid | ⚠️ Overdue</p>
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
                        {currentData.billDetailsData.map((bill: any) => (
                             <tr key={bill.bill} className="hover:bg-gray-50 dark:hover:bg-gray-700/30">
                                <td className="px-4 py-3 text-left font-medium text-gray-900 dark:text-white">{bill.bill}</td>
                                <td className="px-4 py-3">₹{bill.amount.toLocaleString()}</td>
                                <td className="px-4 py-3">₹{bill.split.toLocaleString()}</td>
                                <td className="px-4 py-3">{bill.dueDate}</td>
                                {bill.statuses.map((status: string, index: number) => <td key={index} className="px-4 py-3">{status}</td>)}
                                <td className="px-4 py-3 font-semibold">{bill.progress}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Payment Punctuality */}
             <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-5">
                <div className="flex flex-wrap gap-4 justify-between items-center">
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-white">Payment Punctuality</h3>
                    <div className="flex flex-wrap items-center gap-1 bg-gray-100 dark:bg-gray-700 p-1 rounded-md">
                        {Object.keys(mockPunctualityData).map(range => (
                            <button key={range} onClick={() => setPunctualityRange(range)} className={`px-2 py-1 text-xs font-semibold rounded ${punctualityRange === range ? 'bg-white dark:bg-gray-600 shadow' : 'text-gray-500 dark:text-gray-300'}`}>
                                {range}
                            </button>
                        ))}
                    </div>
                </div>
                <div className="mt-4 space-y-3 text-sm">
                    {currentPunctualityData.map(p => <PunctualityBar key={p.name} name={p.name} percent={p.percent} />)}
                </div>
                 <p className="mt-4 text-xs text-gray-500 dark:text-gray-400">Green: &gt;90% | Yellow: 70-90% | Red: &lt;70%</p>
            </div>
        </div>
    );
};

export default PaymentDashboardPage;