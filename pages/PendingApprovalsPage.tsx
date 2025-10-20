import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Role } from '../types';
import { BellIcon, ClipboardCheckIcon } from '../components/Icons';
import { useNotifications } from '../contexts/NotificationContext';

// --- MOCK DATA ---
const initialApprovals = {
    billPayments: [
        { id: 'bp1', type: 'Electricity Bill', user: 'Raj', amount: 300, date: 'Oct 8, 2025 (2 hours ago)' },
        { id: 'bp2', type: 'Water Bill', user: 'Priya', amount: 200, date: 'Oct 7, 2025 (1 day ago)' },
        { id: 'bp3', type: 'Wi-Fi Bill', user: 'Amit', amount: 250, date: 'Oct 6, 2025 (2 days ago)' },
    ],
    shopping: [
        { id: 's1', user: 'Raj', amount: 850, date: 'Oct 7, 2025', items: 'Rice (5kg), dal (2kg), vegetables, cooking oil (1L)', notes: 'Monthly groceries' }
    ],
    deposits: [
        { id: 'd1', user: 'Amit', amount: 2000, date: 'Oct 8, 2025', method: 'UPI', trxId: '1234567890', notes: 'Monthly meal fund' }
    ],
    joinRequests: [], // Initially empty as per wireframe
    mealEntries: [
        { id: 'me1', user: 'Raj Kumar', date: 'Oct 9, 2025', quantities: { b: 1, l: 0.5, d: 0 }, total: 1.5, notes: 'Ate outside for dinner' }
    ],
};

type Tab = 'Bill Payments' | 'Shopping' | 'Deposits' | 'Join Requests' | 'Meal Entries';

const PendingApprovalsPage: React.FC = () => {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState<Tab>('Bill Payments');
    const [approvals, setApprovals] = useState(initialApprovals);
    const { addToast } = useNotifications();

    const handleAction = (category: keyof typeof initialApprovals, id: string, action: 'approve' | 'deny') => {
        const item = approvals[category].find(i => i.id === id);
        setApprovals(prev => ({
            ...prev,
            [category]: prev[category].filter(item => item.id !== id)
        }));
        
        const actionText = action === 'approve' ? 'Approved' : 'Denied';
        const toastType = action === 'approve' ? 'success' : 'error';
        const itemType = category.replace(/([A-Z])/g, ' $1').slice(0, -1); // 'billPayments' -> 'bill payment'
        
        addToast({
            type: toastType,
            title: `${actionText}`,
            message: `The ${itemType} from ${item?.user} has been ${actionText.toLowerCase()}.`
        });
    };
    
    // FIX: The type of `arr` was inferred as `unknown`, causing an error when accessing `arr.length`.
    // Casting `Object.values(approvals)` to `any[][]` ensures `arr` is treated as an array.
    const totalTasks = (Object.values(approvals) as any[][]).reduce((sum, arr) => sum + arr.length, 0);

    if (user?.role !== Role.Manager) {
        return <div className="text-center p-8">Access Denied. This page is for managers only.</div>;
    }

    const renderContent = () => {
        switch (activeTab) {
            case 'Bill Payments':
                return (
                    <div className="space-y-4">
                        {approvals.billPayments.map(item => (
                            <div key={item.id} className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-5">
                                <h4 className="font-bold text-gray-800 dark:text-white">⚡ {item.type} - {item.user}</h4>
                                <p className="text-sm mt-1">Amount: <span className="font-semibold">₹{item.amount}</span></p>
                                <p className="text-xs text-gray-500 dark:text-gray-400">Marked as paid: {item.date}</p>
                                <p className="text-xs text-yellow-600 dark:text-yellow-400">Status: Waiting for your approval</p>
                                <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700 flex flex-wrap gap-2 justify-end">
                                    <button onClick={() => handleAction('billPayments', item.id, 'deny')} className="px-3 py-1 text-sm font-semibold bg-red-100 text-red-700 rounded-md hover:bg-red-200 dark:bg-red-900/50 dark:text-red-300 dark:hover:bg-red-900">Deny</button>
                                    <button onClick={() => handleAction('billPayments', item.id, 'approve')} className="px-3 py-1 text-sm font-semibold bg-green-100 text-green-700 rounded-md hover:bg-green-200 dark:bg-green-900/50 dark:text-green-300 dark:hover:bg-green-900">Approve Payment</button>
                                </div>
                            </div>
                        ))}
                    </div>
                );
            case 'Shopping':
                 return (
                    <div className="space-y-4">
                        {approvals.shopping.map(item => (
                            <div key={item.id} className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-5">
                                <h4 className="font-bold text-gray-800 dark:text-white">🛒 Shopping by {item.user}</h4>
                                <p className="text-sm mt-1"> <span className="font-semibold">₹{item.amount}</span> • {item.date}</p>
                                <p className="text-sm text-gray-600 dark:text-gray-300 mt-2"><strong>Items:</strong> {item.items}</p>
                                <p className="text-sm text-gray-600 dark:text-gray-300"><strong>Notes:</strong> "{item.notes}"</p>
                                <p className="text-sm mt-2"><strong>Receipt:</strong> <button className="font-semibold text-primary hover:underline">[📷 View Image]</button></p>
                                <p className="mt-3 p-2 text-xs text-yellow-800 bg-yellow-100 dark:text-yellow-200 dark:bg-yellow-900/50 rounded-md text-center">⚠️ This will update meal rate calculation</p>
                                <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700 flex flex-wrap gap-2 justify-end">
                                    <button onClick={() => handleAction('shopping', item.id, 'deny')} className="px-3 py-1 text-sm font-semibold bg-red-100 text-red-700 rounded-md hover:bg-red-200 dark:bg-red-900/50 dark:text-red-300 dark:hover:bg-red-900">Deny with Reason</button>
                                    <button onClick={() => handleAction('shopping', item.id, 'approve')} className="px-3 py-1 text-sm font-semibold bg-green-100 text-green-700 rounded-md hover:bg-green-200 dark:bg-green-900/50 dark:text-green-300 dark:hover:bg-green-900">Approve</button>
                                </div>
                            </div>
                        ))}
                    </div>
                );
            case 'Deposits':
                 return (
                    <div className="space-y-4">
                        {approvals.deposits.map(item => (
                             <div key={item.id} className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-5">
                                <h4 className="font-bold text-gray-800 dark:text-white">💰 Deposit by {item.user}</h4>
                                <p className="text-sm mt-1"><span className="font-semibold">₹{item.amount}</span> • {item.date}</p>
                                <p className="text-sm text-gray-600 dark:text-gray-300 mt-2"><strong>Method:</strong> {item.method}</p>
                                <p className="text-sm text-gray-600 dark:text-gray-300"><strong>Transaction ID:</strong> {item.trxId}</p>
                                <p className="text-sm text-gray-600 dark:text-gray-300"><strong>Notes:</strong> "{item.notes}"</p>
                                <p className="mt-3 p-2 text-xs text-yellow-800 bg-yellow-100 dark:text-yellow-200 dark:bg-yellow-900/50 rounded-md text-center">⚠️ This will update fund balance</p>
                                <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700 flex flex-wrap gap-2 justify-end">
                                    <button onClick={() => handleAction('deposits', item.id, 'deny')} className="px-3 py-1 text-sm font-semibold bg-red-100 text-red-700 rounded-md hover:bg-red-200 dark:bg-red-900/50 dark:text-red-300 dark:hover:bg-red-900">Deny with Reason</button>
                                    <button onClick={() => handleAction('deposits', item.id, 'approve')} className="px-3 py-1 text-sm font-semibold bg-green-100 text-green-700 rounded-md hover:bg-green-200 dark:bg-green-900/50 dark:text-green-300 dark:hover:bg-green-900">Approve</button>
                                </div>
                            </div>
                        ))}
                    </div>
                );
            case 'Meal Entries':
                return (
                    <div className="space-y-4">
                        {approvals.mealEntries.map(item => (
                            <div key={item.id} className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-5">
                                <h4 className="font-bold text-gray-800 dark:text-white">🍽️ Meal Entry by {item.user}</h4>
                                <p className="text-sm mt-1"><strong>Date:</strong> {item.date}</p>
                                <p className="text-sm text-gray-600 dark:text-gray-300 mt-2"><strong>Meals:</strong> B: {item.quantities.b}, L: {item.quantities.l}, D: {item.quantities.d} (Total: {item.total})</p>
                                <p className="text-sm text-gray-600 dark:text-gray-300"><strong>Notes:</strong> "{item.notes}"</p>
                                <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700 flex flex-wrap gap-2 justify-end">
                                    <button onClick={() => handleAction('mealEntries', item.id, 'deny')} className="px-3 py-1 text-sm font-semibold bg-red-100 text-red-700 rounded-md hover:bg-red-200 dark:bg-red-900/50 dark:text-red-300 dark:hover:bg-red-900">Reject</button>
                                    <button onClick={() => handleAction('mealEntries', item.id, 'approve')} className="px-3 py-1 text-sm font-semibold bg-green-100 text-green-700 rounded-md hover:bg-green-200 dark:bg-green-900/50 dark:text-green-300 dark:hover:bg-green-900">Approve</button>
                                </div>
                            </div>
                        ))}
                    </div>
                );
            case 'Join Requests':
                 return (
                     <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg">
                        <p className="text-gray-500 dark:text-gray-400">No pending join requests.</p>
                    </div>
                );
            default:
                return null;
        }
    };
    
    const tabs: { name: Tab; count: number }[] = [
        { name: 'Bill Payments', count: approvals.billPayments.length },
        { name: 'Shopping', count: approvals.shopping.length },
        { name: 'Deposits', count: approvals.deposits.length },
        { name: 'Meal Entries', count: approvals.mealEntries.length },
        { name: 'Join Requests', count: approvals.joinRequests.length },
    ];

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Pending Approvals</h1>
                <div className="flex items-center gap-2 px-3 py-1.5 bg-yellow-100 dark:bg-yellow-900/50 text-yellow-700 dark:text-yellow-300 rounded-full font-semibold">
                    <BellIcon className="w-5 h-5" />
                    <span>{totalTasks} Tasks</span>
                </div>
            </div>
            
            <div className="flex items-center border-b border-gray-200 dark:border-gray-700 overflow-x-auto">
                {tabs.map(tab => (
                    <button
                        key={tab.name}
                        onClick={() => setActiveTab(tab.name)}
                        className={`py-3 px-4 text-sm font-semibold flex-shrink-0 transition-colors ${
                            activeTab === tab.name
                                ? 'border-b-2 border-primary text-primary'
                                : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
                        }`}
                    >
                        {tab.name} <span className="ml-2 px-2 py-0.5 text-xs rounded-full bg-gray-200 dark:bg-gray-700">{tab.count}</span>
                    </button>
                ))}
            </div>

            <div>
                {renderContent()}
            </div>
        </div>
    );
};

export default PendingApprovalsPage;