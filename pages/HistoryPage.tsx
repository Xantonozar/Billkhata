import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Role } from '../types';
import { ChartBarIcon, ExportIcon } from '../components/Icons';

// --- MOCK DATA ---
const memberHistory = {
    october: {
        totalBills: '₹6,887.50',
        paid: '₹5,300',
        pendingApproval: '₹1,000',
        due: '₹587.50',
        meals: 28,
        mealCost: '₹1,274',
        deposits: '₹2,000',
        refundable: '+₹726'
    },
    september: {
        totalBills: '₹6,500',
        meals: 30,
        mealCost: '₹1,365',
        deposits: '₹2,500',
        refundReceived: '+₹1,135'
    },
    activity: [
        { date: 'Oct 8', description: 'Paid Electricity ₹300', status: 'Pending' },
        { date: 'Oct 7', description: 'Paid Water ₹200', status: 'Pending' },
        { date: 'Oct 5', description: 'Paid Maid ₹500', status: 'Approved' },
        { date: 'Oct 3', description: 'Paid Gas ₹375', status: 'Approved' },
        { date: 'Oct 1', description: 'Paid Rent ₹5,000', status: 'Approved' },
        { date: 'Oct 1', description: 'Deposited ₹2,000', status: 'Approved' },
    ]
};

const managerHistory = {
    october: [
        { name: 'Raj', billsDue: '₹6,887.50', paid: '₹5,300', pending: '₹1,587.50', meals: 28, deposits: '₹2,000', refund: '+₹726' },
        { name: 'Amit', billsDue: '₹6,887.50', paid: '₹6,887.50', pending: '₹0', meals: 25, deposits: '₹2,000', refund: '+₹862.50' },
        { name: 'Priya', billsDue: '₹6,887.50', paid: '₹6,300', pending: '₹587.50', meals: 30, deposits: '₹2,000', refund: '+₹635' },
        { name: 'Ravi', billsDue: '₹6,887.50', paid: '₹6,887.50', pending: '₹0', meals: 22, deposits: '₹2,000', refund: '+₹999' },
    ],
    september: {
        billsCollected: '₹26,000',
        totalMeals: 110,
        totalShopping: '₹5,000',
        totalDeposits: '₹9,000',
        totalRefunds: '₹4,000'
    }
};

// --- VIEWS ---

const MemberHistoryView: React.FC = () => {
    return (
        <div className="space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
                <h3 className="font-bold text-lg mb-3">October 2025 Summary</h3>
                <div className="border-t pt-3 dark:border-gray-700 grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                    <div>Total Bills Assigned: <span className="font-semibold float-right">{memberHistory.october.totalBills}</span></div>
                    <div className="text-green-600 dark:text-green-400">Paid: <span className="font-semibold float-right">{memberHistory.october.paid} ✅</span></div>
                    <div className="text-yellow-600 dark:text-yellow-400">Pending Approval: <span className="font-semibold float-right">{memberHistory.october.pendingApproval} ⏳</span></div>
                    <div className="text-red-600 dark:text-red-400">Due: <span className="font-semibold float-right">{memberHistory.october.due} ⚠️</span></div>
                    <div className="col-span-2 my-1 border-t dark:border-gray-700"></div>
                    <div>Meals: <span className="font-semibold float-right">{memberHistory.october.meals} • Cost: {memberHistory.october.mealCost}</span></div>
                    <div>Deposits: <span className="font-semibold float-right">{memberHistory.october.deposits}</span></div>
                    <div className="col-span-2 font-semibold text-green-600 dark:text-green-400">Refundable: <span className="font-bold float-right">{memberHistory.october.refundable}</span></div>
                </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
                <h3 className="font-bold text-lg mb-3">Recent Activity</h3>
                <div className="border-t pt-3 dark:border-gray-700 space-y-2">
                    {memberHistory.activity.map(item => (
                        <div key={item.description} className="flex justify-between items-center p-2 bg-gray-50 dark:bg-gray-700/50 rounded-md text-sm">
                            <span>{item.date} • {item.description}</span>
                            <span className={`font-semibold ${item.status === 'Approved' ? 'text-green-600 dark:text-green-400' : 'text-yellow-600 dark:text-yellow-400'}`}>
                                {item.status === 'Approved' ? '✅ Approved' : '⏳ Pending'}
                            </span>
                        </div>
                    ))}
                </div>
                <button className="text-sm font-semibold text-primary hover:underline mt-3">Load More →</button>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
                <h3 className="font-bold text-lg mb-3">September 2025 Summary</h3>
                <div className="border-t pt-3 dark:border-gray-700 space-y-1 text-sm">
                    <p>Total Bills: <span className="font-semibold float-right">{memberHistory.september.totalBills} ✅ All Paid</span></p>
                    <p>Meals: <span className="font-semibold float-right">{memberHistory.september.meals} • Cost: {memberHistory.september.mealCost}</span></p>
                    <p>Deposits: <span className="font-semibold float-right">{memberHistory.september.deposits}</span></p>
                    <p className="font-semibold text-green-600 dark:text-green-400">Refund Received: <span className="float-right">{memberHistory.september.refundReceived}</span></p>
                </div>
                <button className="text-sm font-semibold text-primary hover:underline mt-3">View Full Details →</button>
            </div>
        </div>
    );
};

const ManagerHistoryView: React.FC = () => {
    const [activeTab, setActiveTab] = useState('All Members');
    const members = ['All Members', 'Raj', 'Amit', 'Priya', 'Ravi'];

    return (
        <div className="space-y-6">
             <div className="flex flex-wrap gap-2">
                {members.map(member => (
                    <button 
                        key={member} 
                        onClick={() => setActiveTab(member)}
                        className={`px-4 py-2 text-sm font-semibold rounded-lg transition-colors ${activeTab === member ? 'bg-primary text-white shadow' : 'bg-white dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600'}`}
                    >
                        {member}
                    </button>
                ))}
            </div>
            
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-x-auto">
                <h3 className="p-5 font-bold text-lg">October 2025 - All Members Summary</h3>
                <table className="w-full text-sm text-left">
                     <thead className="bg-gray-50 dark:bg-gray-700/50 text-xs text-gray-600 dark:text-gray-300 uppercase">
                        <tr>
                            <th className="px-4 py-3">Member</th>
                            <th className="px-4 py-3">Bills Due</th>
                            <th className="px-4 py-3">Paid</th>
                            <th className="px-4 py-3">Pending</th>
                            <th className="px-4 py-3">Meals</th>
                            <th className="px-4 py-3">Deposits</th>
                            <th className="px-4 py-3">Refund</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                        {managerHistory.october.map(member => (
                            <tr key={member.name} className="hover:bg-gray-50 dark:hover:bg-gray-700/30">
                                <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">{member.name}</td>
                                <td className="px-4 py-3">{member.billsDue}</td>
                                <td className="px-4 py-3 text-green-600 dark:text-green-400">{member.paid}</td>
                                <td className="px-4 py-3 text-red-600 dark:text-red-400">{member.pending}</td>
                                <td className="px-4 py-3">{member.meals}</td>
                                <td className="px-4 py-3">{member.deposits}</td>
                                <td className="px-4 py-3 text-green-600 dark:text-green-400">{member.refund}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
                <h3 className="font-bold text-lg mb-3">September 2025 Summary</h3>
                <div className="border-t pt-3 dark:border-gray-700 grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                    <div>Total Bills Collected: <span className="font-semibold block text-lg"> {managerHistory.september.billsCollected} ✅</span></div>
                    <div>Total Meals: <span className="font-semibold block text-lg">{managerHistory.september.totalMeals}</span></div>
                    <div>Total Shopping: <span className="font-semibold block text-lg">{managerHistory.september.totalShopping}</span></div>
                    <div>Total Deposits: <span className="font-semibold block text-lg">{managerHistory.september.totalDeposits}</span></div>
                    <div>Total Refunds Issued: <span className="font-semibold block text-lg">{managerHistory.september.totalRefunds}</span></div>
                </div>
                <button className="text-sm font-semibold text-primary hover:underline mt-4">View Detailed Report →</button>
            </div>
        </div>
    );
};


const HistoryPage: React.FC = () => {
    const { user } = useAuth();
    if (!user) return null;
  
    return (
      <div className="space-y-6 animate-fade-in">
        <div className="flex flex-wrap justify-between items-center gap-4">
            <div className="flex items-center gap-4">
                <ChartBarIcon className="w-8 h-8 text-primary" />
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                    {user.role === Role.Manager ? 'All Members History' : 'My Payment History'}
                </h1>
            </div>
             <div className="flex items-center gap-2">
                <button className="px-4 py-2 text-sm font-semibold bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm">This Month ▼</button>
                {user.role === Role.Manager && (
                     <button className="px-4 py-2 text-sm font-semibold bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm hidden md:block">Filter by Member ▼</button>
                )}
                <button className="flex items-center gap-2 px-4 py-2 text-sm font-semibold bg-primary text-white rounded-md shadow-sm hover:bg-primary-600">
                    <ExportIcon className="w-4 h-4" />
                    Export
                </button>
            </div>
        </div>
        
        {user.role === Role.Manager ? <ManagerHistoryView /> : <MemberHistoryView />}
      </div>
    );
};

export default HistoryPage;
