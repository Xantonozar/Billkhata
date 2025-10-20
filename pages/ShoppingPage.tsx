import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Role } from '../types';
import { ShoppingCartIcon, ArrowLeftIcon, CameraIcon, FolderIcon, CheckCircleIcon, XIcon } from '../components/Icons';
import { useNotifications } from '../contexts/NotificationContext';

// MOCK DATA based on wireframes
// FIX: Added ShoppingDuty interface to strongly type the roster data, resolving type errors when iterating over it.
interface ShoppingDuty {
    name: string;
    status: string;
    amount: number;
}

const mockShoppingDutyData: Record<string, ShoppingDuty> = {
    'Monday': { name: 'Raj', status: 'Completed', amount: 850 },
    'Tuesday': { name: 'Amit', status: 'Assigned', amount: 0 },
    'Wednesday': { name: 'Priya', status: 'Upcoming', amount: 0 },
    'Thursday': { name: 'Ravi', status: 'Upcoming', amount: 0 },
    'Friday': { name: 'Raj', status: 'Upcoming', amount: 0 },
};

const mockFundStatus = {
    totalDeposits: 12000,
    totalShopping: 8460,
    balance: 3540,
    rate: 45.50,
};

const initialPendingApprovals = {
    deposits: [
        { id: 'd1', name: 'Amit', amount: 1500, method: 'Nagad', date: 'Oct 8', trxId: 'TRX12345' },
        { id: 'd2', name: 'Priya', amount: 1500, method: 'bKash', date: 'Oct 8', trxId: 'TRX98765' }
    ],
    expenses: [
        { id: 'e1', name: 'Raj', amount: 850, date: 'Oct 7', items: 'Rice, vegetables' }
    ]
};

const mockMemberSummary = {
    totalDeposits: 3000,
    mealCost: 2548,
    refundable: 452,
};

const mockDepositHistory = [
    { id: 'h1', date: 'Oct 1', amount: 1500, method: 'bKash', status: 'Approved' },
    { id: 'h2', date: 'Oct 15', amount: 1500, method: 'Nagad', status: 'Approved' },
];

const mockShoppingHistory = [
    { id: 's1', date: 'Oct 7', amount: 850, status: 'Approved' },
    { id: 's2', date: 'Oct 20', amount: 620, status: 'Pending' },
];

// --- MODALS ---
type Roster = typeof mockShoppingDutyData;

interface EditRosterModalProps {
    onClose: () => void;
    roster: Roster;
    onSave: (newRoster: Roster) => void;
}

const EditRosterModal: React.FC<EditRosterModalProps> = ({ onClose, roster, onSave }) => {
    const [editedRoster, setEditedRoster] = useState(roster);
    
    // Hardcoding members list for simplicity since it's mock data
    const members = ['Raj', 'Amit', 'Priya', 'Ravi'];

    const handleAssignmentChange = (day: string, newName: string) => {
        setEditedRoster(prev => ({
            ...prev,
            [day]: {
                ...prev[day],
                name: newName,
                status: prev[day].name === newName ? prev[day].status : 'Assigned', 
                amount: prev[day].name === newName ? prev[day].amount : 0
            }
        }));
    };

    const handleSaveChanges = () => {
        onSave(editedRoster);
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 animate-fade-in p-4" onClick={onClose}>
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl p-6 w-full max-w-md" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">Edit Shopping Roster</h3>
                    <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700"><XIcon className="w-5 h-5"/></button>
                </div>
                <div className="space-y-4">
                    {/* FIX: Cast `duty` to `ShoppingDuty` to resolve type inference issues with `Object.entries`. */}
                    {Object.entries(editedRoster).map(([day, duty]) => {
                        const shoppingDuty = duty as ShoppingDuty;
                        return (
                            <div key={day} className="flex items-center justify-between">
                                <label className="font-semibold text-gray-700 dark:text-gray-300">{day}:</label>
                                <select 
                                    value={shoppingDuty.name} 
                                    onChange={(e) => handleAssignmentChange(day, e.target.value)}
                                    className="px-3 py-2 bg-gray-100 dark:bg-gray-700 border-2 border-transparent rounded-lg focus:outline-none focus:border-primary transition-colors"
                                >
                                    {members.map(member => <option key={member} value={member}>{member}</option>)}
                                </select>
                            </div>
                        );
                    })}
                </div>
                <div className="flex gap-3 mt-6 justify-end">
                    <button onClick={onClose} className="px-4 py-2 bg-gray-200 dark:bg-gray-600 font-semibold rounded-lg hover:bg-gray-300 dark:hover:bg-gray-500">Cancel</button>
                    <button onClick={handleSaveChanges} className="px-4 py-2 bg-primary text-white font-semibold rounded-lg hover:bg-primary-600">Save Changes</button>
                </div>
            </div>
        </div>
    );
};


const AddDepositModal: React.FC<{ onClose: () => void, onSubmit: () => void }> = ({ onClose, onSubmit }) => {
    const [amount, setAmount] = useState('1500');
    const [method, setMethod] = useState('bKash');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit();
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 animate-fade-in p-4">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl p-6 w-full max-w-sm" onClick={(e) => e.stopPropagation()}>
                 <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">Deposit to Meal Fund</h3>
                    <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700"><XIcon className="w-5 h-5"/></button>
                </div>
                
                <form className="space-y-4" onSubmit={handleSubmit}>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Amount:</label>
                        <div className="relative mt-1">
                            <span className="absolute inset-y-0 left-3 flex items-center text-gray-500">৳</span>
                            <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} className="w-full pl-8 pr-4 py-2 bg-gray-100 dark:bg-gray-700 border-2 border-transparent rounded-lg focus:outline-none focus:border-primary transition-colors" />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Payment Method:</label>
                        <div className="grid grid-cols-3 gap-2 mt-1">
                            {['bKash', 'Nagad', 'Rocket', 'Cash', 'Bank Transfer'].map(m => (
                                <button type="button" key={m} onClick={() => setMethod(m)} className={`px-2 py-2 text-xs font-semibold rounded-md border-2 ${method === m ? 'border-primary bg-primary-50 dark:bg-primary-500/20' : 'border-gray-200 dark:border-gray-600'}`}>{m}</button>
                            ))}
                        </div>
                    </div>
                     <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Transaction ID (optional):</label>
                        <input type="text" placeholder="TRX12345678" className="w-full mt-1 px-4 py-2 bg-gray-100 dark:bg-gray-700 border-2 border-transparent rounded-lg focus:outline-none focus:border-primary transition-colors" />
                    </div>
                     <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Upload Screenshot (optional):</label>
                        <div className="flex gap-2 mt-1">
                            <button type="button" className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm bg-gray-100 dark:bg-gray-700 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600"><CameraIcon className="w-5 h-5"/>Take Photo</button>
                            <button type="button" className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm bg-gray-100 dark:bg-gray-700 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600"><FolderIcon className="w-5 h-5"/>Gallery</button>
                        </div>
                    </div>
                    <button type="submit" className="w-full mt-2 py-2.5 bg-primary text-white font-semibold rounded-lg hover:bg-primary-600">Submit for Approval</button>
                </form>
            </div>
        </div>
    )
}

const AddExpenseModal: React.FC<{ onClose: () => void; onSubmit: () => void }> = ({ onClose, onSubmit }) => {
    const [amount, setAmount] = useState('');
    const [items, setItems] = useState('');
    const [notes, setNotes] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit();
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 animate-fade-in p-4" onClick={onClose}>
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl p-6 w-full max-w-sm" onClick={(e) => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">Add Shopping Expense</h3>
                    <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700"><XIcon className="w-5 h-5"/></button>
                </div>
                <form className="space-y-4" onSubmit={handleSubmit}>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Amount:</label>
                        <div className="relative mt-1">
                            <span className="absolute inset-y-0 left-3 flex items-center text-gray-500">৳</span>
                            <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} className="w-full pl-8 pr-4 py-2 bg-gray-100 dark:bg-gray-700 border-2 border-transparent rounded-lg focus:outline-none focus:border-primary transition-colors" required />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Items Purchased:</label>
                        <textarea value={items} onChange={e => setItems(e.target.value)} rows={3} placeholder="e.g., Rice (5kg), Vegetables, Oil (1L)" className="w-full mt-1 px-4 py-2 bg-gray-100 dark:bg-gray-700 border-2 border-transparent rounded-lg focus:outline-none focus:border-primary transition-colors" required />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Notes (optional):</label>
                        <input type="text" value={notes} onChange={(e) => setNotes(e.target.value)} className="w-full mt-1 px-4 py-2 bg-gray-100 dark:bg-gray-700 border-2 border-transparent rounded-lg focus:outline-none focus:border-primary transition-colors" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Upload Receipt (optional):</label>
                        <div className="flex gap-2 mt-1">
                            <button type="button" className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm bg-gray-100 dark:bg-gray-700 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600"><CameraIcon className="w-5 h-5"/>Take Photo</button>
                            <button type="button" className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm bg-gray-100 dark:bg-gray-700 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600"><FolderIcon className="w-5 h-5"/>Gallery</button>
                        </div>
                    </div>
                    <button type="submit" className="w-full mt-2 py-2.5 bg-primary text-white font-semibold rounded-lg hover:bg-primary-600">Submit for Approval</button>
                </form>
            </div>
        </div>
    );
};


// --- VIEWS ---

const ManagerShoppingView: React.FC = () => {
    const [approvals, setApprovals] = useState(initialPendingApprovals);
    const [isRosterModalOpen, setIsRosterModalOpen] = useState(false);
    const [roster, setRoster] = useState(mockShoppingDutyData);
    const { addToast } = useNotifications();
    
    const handleAction = (type: 'deposits' | 'expenses', id: string, action: 'approve' | 'deny') => {
        const item = approvals[type].find(i => i.id === id);
        setApprovals(prev => ({ ...prev, [type]: prev[type].filter(item => item.id !== id) }));
        if (action === 'approve') {
            addToast({ type: 'success', title: 'Approved', message: `${type === 'deposits' ? 'Deposit from' : 'Expense by'} ${item?.name} has been approved.` });
        } else {
            addToast({ type: 'error', title: 'Denied', message: `${type === 'deposits' ? 'Deposit from' : 'Expense by'} ${item?.name} has been denied.` });
        }
    }

    const handleSaveRoster = (newRoster: Roster) => {
        setRoster(newRoster);
        addToast({ type: 'success', title: 'Roster Updated', message: 'The shopping duty roster has been saved.' });
        setIsRosterModalOpen(false);
    };
    
    return (
        <>
            <div className="space-y-6">
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
                     <h3 className="font-semibold text-lg mb-3">This Week's Shopping Duty</h3>
                     <div className="border-t border-gray-200 dark:border-gray-700 pt-3 space-y-2 text-sm">
                        {/* FIX: Cast `duty` to `ShoppingDuty` to resolve type inference issues with `Object.entries`. */}
                        {Object.entries(roster).map(([day, duty]) => {
                            const shoppingDuty = duty as ShoppingDuty;
                            return (
                                <div key={day} className="flex justify-between items-center">
                                    <span className="font-medium text-gray-600 dark:text-gray-300">{day}: {shoppingDuty.name}</span>
                                    <span className={`${shoppingDuty.status === 'Completed' ? 'text-green-600 dark:text-green-400' : 'text-gray-500 dark:text-gray-400'}`}>
                                        {shoppingDuty.status === 'Completed' ? `✅ Completed - ৳${shoppingDuty.amount}` : shoppingDuty.status === 'Assigned' ? '🔄 Assigned' : ''}
                                    </span>
                                </div>
                            );
                        })}
                     </div>
                     <button onClick={() => setIsRosterModalOpen(true)} className="text-sm font-semibold text-primary hover:underline mt-4">Edit Roster</button>
                </div>
                
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
                     <h3 className="font-semibold text-lg mb-3">Fund Status</h3>
                     <div className="border-t border-gray-200 dark:border-gray-700 pt-3 grid grid-cols-2 gap-4">
                         <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-md">
                            <p className="text-sm text-gray-500 dark:text-gray-400">Total Deposits</p><p className="font-bold text-lg text-gray-800 dark:text-white">৳{mockFundStatus.totalDeposits}</p>
                         </div>
                         <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-md">
                            <p className="text-sm text-gray-500 dark:text-gray-400">Total Shopping</p><p className="font-bold text-lg text-gray-800 dark:text-white">৳{mockFundStatus.totalShopping}</p>
                         </div>
                         <div className="p-3 bg-green-50 dark:bg-green-500/10 rounded-md">
                            <p className="text-sm text-green-600 dark:text-green-300">Fund Balance</p><p className="font-bold text-lg text-green-600 dark:text-green-300">+৳{mockFundStatus.balance}</p>
                         </div>
                         <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-md">
                            <p className="text-sm text-gray-500 dark:text-gray-400">Current Rate</p><p className="font-bold text-lg text-gray-800 dark:text-white">৳{mockFundStatus.rate}/qty</p>
                         </div>
                     </div>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
                    <h3 className="font-semibold text-lg mb-3 text-yellow-600 dark:text-yellow-400">🔔 Pending Approvals ({approvals.deposits.length + approvals.expenses.length})</h3>
                    <div className="border-t border-gray-200 dark:border-gray-700 pt-3 space-y-4">
                        {approvals.deposits.length > 0 && <div>
                            <h4 className="font-semibold mb-2">💰 Deposits ({approvals.deposits.length})</h4>
                            {approvals.deposits.map(d => (
                                <div key={d.id} className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                                    <p className="font-bold">{d.name} - ৳{d.amount} - {d.method}</p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">{d.date} • {d.trxId}</p>
                                    <div className="flex justify-end gap-2 mt-2">
                                        <button className="text-xs font-semibold text-primary hover:underline">View Screenshot</button>
                                        <button onClick={() => handleAction('deposits', d.id, 'deny')} className="px-2 py-0.5 text-xs bg-red-100 text-red-700 rounded-md hover:bg-red-200 dark:bg-red-900/50 dark:text-red-300 dark:hover:bg-red-900">Deny</button>
                                        <button onClick={() => handleAction('deposits', d.id, 'approve')} className="px-2 py-0.5 text-xs bg-green-100 text-green-700 rounded-md hover:bg-green-200 dark:bg-green-900/50 dark:text-green-300 dark:hover:bg-green-900">Approve</button>
                                    </div>
                                </div>
                            ))}
                        </div>}
                         {approvals.expenses.length > 0 && <div>
                            <h4 className="font-semibold mb-2">🛒 Shopping Expenses ({approvals.expenses.length})</h4>
                            {approvals.expenses.map(e => (
                                 <div key={e.id} className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                                    <p className="font-bold">{e.name} - ৳{e.amount}</p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">{e.date} • {e.items}</p>
                                    <div className="flex justify-end gap-2 mt-2">
                                        <button className="text-xs font-semibold text-primary hover:underline">View Receipt</button>
                                        <button onClick={() => handleAction('expenses', e.id, 'deny')} className="px-2 py-0.5 text-xs bg-red-100 text-red-700 rounded-md hover:bg-red-200 dark:bg-red-900/50 dark:text-red-300 dark:hover:bg-red-900">Deny</button>
                                        <button onClick={() => handleAction('expenses', e.id, 'approve')} className="px-2 py-0.5 text-xs bg-green-100 text-green-700 rounded-md hover:bg-green-200 dark:bg-green-900/50 dark:text-green-300 dark:hover:bg-green-900">Approve</button>
                                    </div>
                                </div>
                            ))}
                        </div>}
                    </div>
                </div>
            </div>
            {isRosterModalOpen && (
                <EditRosterModal
                    onClose={() => setIsRosterModalOpen(false)}
                    roster={roster}
                    onSave={handleSaveRoster}
                />
            )}
        </>
    );
};

const MemberShoppingView: React.FC = () => {
    const { user } = useAuth();
    const [isDepositModalOpen, setIsDepositModalOpen] = useState(false);
    const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
    const { addToast } = useNotifications();
    const [historyTab, setHistoryTab] = useState<'deposits' | 'expenses'>('deposits');
    
    // Mock today is Wednesday, Oct 8, 2025.
    const todayDay = 'Wednesday';
    const myName = user?.name || ''; 

    const myDutyToday = mockShoppingDutyData[todayDay]?.name === myName;
    
    const nextDutyDay = Object.entries(mockShoppingDutyData).find(([day, duty]) => {
        const dayOrder = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
        return duty.name === myName && dayOrder.indexOf(day) > dayOrder.indexOf(todayDay);
    });

    const dutyText = myDutyToday 
        ? "Today is your shopping day! 🛒" 
        : nextDutyDay 
        ? `Your next shopping duty is on ${nextDutyDay[0]}.` 
        : "You have no upcoming shopping duties this week.";

    const handleDepositSubmit = () => {
        addToast({ type: 'success', title: 'Deposit Submitted', message: 'Your deposit is now pending manager approval.' });
    };

    const handleExpenseSubmit = () => {
         addToast({ type: 'success', title: 'Expense Submitted', message: 'Your shopping expense is now pending manager approval.' });
    };

    return (
        <>
            <div className="space-y-6">
                <div className="bg-primary-50 dark:bg-primary-500/10 p-4 rounded-lg text-center">
                    <p className="font-semibold text-primary-700 dark:text-primary-300">{dutyText}</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <button onClick={() => setIsDepositModalOpen(true)} className="py-4 text-center bg-white dark:bg-slate-800 rounded-xl shadow-md font-semibold text-slate-700 dark:text-slate-200 hover:scale-105 transition-transform active:scale-95">
                        💰 Add Deposit
                    </button>
                    <button onClick={() => setIsExpenseModalOpen(true)} className="py-4 text-center bg-white dark:bg-slate-800 rounded-xl shadow-md font-semibold text-slate-700 dark:text-slate-200 hover:scale-105 transition-transform active:scale-95">
                        🛒 Add Expense
                    </button>
                </div>
                <div className="bg-white dark:bg-slate-800 rounded-xl shadow-md p-6 grid grid-cols-2 divide-x dark:divide-slate-700 text-center">
                    <div>
                        <p className="text-sm text-slate-500 dark:text-slate-400">Deposit Balance</p>
                        <p className="text-2xl font-bold text-slate-800 dark:text-white font-numeric">৳{mockMemberSummary.totalDeposits.toLocaleString()}</p>
                    </div>
                    <div>
                        <p className="text-sm text-slate-500 dark:text-slate-400">Due / Refund</p>
                        <p className="text-2xl font-bold text-green-600 dark:text-green-400 font-numeric">+৳{mockMemberSummary.refundable.toLocaleString()}</p>
                    </div>
                </div>
                <div className="bg-white dark:bg-slate-800 rounded-xl shadow-md">
                    <div className="p-4 border-b dark:border-slate-700">
                        <div className="flex gap-2 p-1 bg-slate-100 dark:bg-slate-700 rounded-lg">
                            <button onClick={() => setHistoryTab('deposits')} className={`flex-1 py-1.5 text-sm font-semibold rounded-md transition-colors ${historyTab === 'deposits' ? 'bg-white dark:bg-slate-600 shadow' : ''}`}>
                                Deposit History
                            </button>
                             <button onClick={() => setHistoryTab('expenses')} className={`flex-1 py-1.5 text-sm font-semibold rounded-md transition-colors ${historyTab === 'expenses' ? 'bg-white dark:bg-slate-600 shadow' : ''}`}>
                                Expense History
                            </button>
                        </div>
                    </div>
                    <div className="p-4 space-y-2">
                        {historyTab === 'deposits' && (
                            mockDepositHistory.map(d => (
                                <div key={d.id} className="flex justify-between items-center text-sm p-2 bg-slate-50 dark:bg-slate-700/50 rounded-md">
                                    <span>{d.date} - {d.method}</span>
                                    <span className="font-semibold flex items-center gap-1">৳{d.amount.toLocaleString()} <CheckCircleIcon className="w-4 h-4 text-green-500"/></span>
                                </div>
                            ))
                        )}
                         {historyTab === 'expenses' && (
                             mockShoppingHistory.map(s => (
                                <div key={s.id} className="flex justify-between items-center text-sm p-2 bg-slate-50 dark:bg-slate-700/50 rounded-md">
                                    <span>{s.date}</span>
                                    <span className={`font-semibold ${s.status === 'Approved' ? 'text-green-600 dark:text-green-400' : 'text-yellow-600 dark:text-yellow-400'}`}>
                                        ৳{s.amount.toLocaleString()} {s.status === 'Approved' ? '✅ Approved' : '⏳ Pending'}
                                    </span>
                                </div>
                            ))
                        )}
                        <button className="text-sm font-semibold text-primary hover:underline mt-2 w-full text-center p-2">View All →</button>
                    </div>
                </div>
            </div>
            
            {isDepositModalOpen && <AddDepositModal onClose={() => setIsDepositModalOpen(false)} onSubmit={handleDepositSubmit} />}
            {isExpenseModalOpen && <AddExpenseModal onClose={() => setIsExpenseModalOpen(false)} onSubmit={handleExpenseSubmit} />}
        </>
    );
};

// --- MAIN PAGE ---

const ShoppingPage: React.FC = () => {
    const { user, setPage } = useAuth();
    if (!user) return null;

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                     <button onClick={() => setPage('dashboard')} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 md:hidden">
                        <ArrowLeftIcon className="w-6 h-6 text-gray-600 dark:text-gray-300"/>
                    </button>
                    <ShoppingCartIcon className="w-8 h-8 text-primary" />
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Shopping & Funds</h1>
                </div>
                 {user.role === Role.Manager && (
                    <button className="px-4 py-2 text-sm bg-primary text-white font-semibold rounded-lg hover:bg-primary-600">Assign Duty</button>
                )}
            </div>
           
            {user.role === Role.Manager ? <ManagerShoppingView /> : <MemberShoppingView />}
        </div>
    );
};

export default ShoppingPage;