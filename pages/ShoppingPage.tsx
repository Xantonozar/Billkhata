import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Role } from '../types';
import { ShoppingCartIcon, ArrowLeftIcon, CameraIcon, FolderIcon, CheckCircleIcon, XIcon } from '../components/Icons';

// MOCK DATA based on wireframes
const mockShoppingDuty = {
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

const DepositModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
    const [amount, setAmount] = useState('1500');
    const [method, setMethod] = useState('bKash');

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 animate-fade-in p-4">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl p-6 w-full max-w-sm" onClick={(e) => e.stopPropagation()}>
                 <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">Deposit to Meal Fund</h3>
                    <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700"><XIcon className="w-5 h-5"/></button>
                </div>
                
                <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); onClose(); }}>
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
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Transaction ID:</label>
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

// --- VIEWS ---

const ManagerShoppingView: React.FC = () => {
    const [approvals, setApprovals] = useState(initialPendingApprovals);
    
    const handleApproval = (type: 'deposits' | 'expenses', id: string) => {
        setApprovals(prev => ({ ...prev, [type]: prev[type].filter(item => item.id !== id) }));
    }
    
    return (
        <div className="space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
                 <h3 className="font-semibold text-lg mb-3">This Week's Shopping Duty</h3>
                 <div className="border-t border-gray-200 dark:border-gray-700 pt-3 space-y-2 text-sm">
                    {Object.entries(mockShoppingDuty).map(([day, duty]) => (
                        <div key={day} className="flex justify-between items-center">
                            <span className="font-medium text-gray-600 dark:text-gray-300">{day}: {duty.name}</span>
                            <span className={`${duty.status === 'Completed' ? 'text-green-600 dark:text-green-400' : 'text-gray-500 dark:text-gray-400'}`}>
                                {duty.status === 'Completed' ? `✅ Completed - ৳${duty.amount}` : duty.status === 'Assigned' ? '🔄 Assigned' : ''}
                            </span>
                        </div>
                    ))}
                 </div>
                 <button className="text-sm font-semibold text-primary hover:underline mt-4">Edit Roster</button>
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
                                    <button onClick={() => handleApproval('deposits', d.id)} className="px-2 py-0.5 text-xs bg-red-100 text-red-700 rounded-md hover:bg-red-200 dark:bg-red-900/50 dark:text-red-300 dark:hover:bg-red-900">Deny</button>
                                    <button onClick={() => handleApproval('deposits', d.id)} className="px-2 py-0.5 text-xs bg-green-100 text-green-700 rounded-md hover:bg-green-200 dark:bg-green-900/50 dark:text-green-300 dark:hover:bg-green-900">Approve</button>
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
                                    <button onClick={() => handleApproval('expenses', e.id)} className="px-2 py-0.5 text-xs bg-red-100 text-red-700 rounded-md hover:bg-red-200 dark:bg-red-900/50 dark:text-red-300 dark:hover:bg-red-900">Deny</button>
                                    <button onClick={() => handleApproval('expenses', e.id)} className="px-2 py-0.5 text-xs bg-green-100 text-green-700 rounded-md hover:bg-green-200 dark:bg-green-900/50 dark:text-green-300 dark:hover:bg-green-900">Approve</button>
                                </div>
                            </div>
                        ))}
                    </div>}
                </div>
            </div>
        </div>
    );
};

const MemberShoppingView: React.FC = () => {
    const [isDepositModalOpen, setIsDepositModalOpen] = useState(false);
    
    return (
        <>
        <div className="space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
                 <h3 className="font-semibold text-lg mb-3">Your Fund Summary</h3>
                 <div className="border-t border-gray-200 dark:border-gray-700 pt-3 space-y-2 text-sm">
                    <p>Total Deposits: <span className="font-bold text-lg float-right">৳{mockMemberSummary.totalDeposits}</span></p>
                    <p>Your Meal Cost: <span className="font-bold text-lg float-right">৳{mockMemberSummary.mealCost}</span></p>
                    <p className="text-green-600 dark:text-green-300 font-semibold">Refundable: <span className="font-bold text-lg float-right">+৳{mockMemberSummary.refundable}</span></p>
                 </div>
                 <button onClick={() => setIsDepositModalOpen(true)} className="w-full mt-4 py-2 bg-primary text-white font-semibold rounded-lg hover:bg-primary-600">Deposit Money</button>
            </div>
            
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
                <h3 className="font-semibold text-lg mb-3">Your Deposit History</h3>
                <div className="border-t border-gray-200 dark:border-gray-700 pt-3">
                    <ul className="space-y-2">
                        {mockDepositHistory.map(d => (
                             <li key={d.id} className="flex justify-between items-center text-sm p-2 bg-gray-50 dark:bg-gray-700/50 rounded-md">
                                <span>{d.date} - {d.method}</span>
                                <span className="font-semibold flex items-center gap-1">৳{d.amount} <CheckCircleIcon className="w-4 h-4 text-green-500"/></span>
                            </li>
                        ))}
                    </ul>
                    <button className="text-sm font-semibold text-primary hover:underline mt-3">View All →</button>
                </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
                <h3 className="font-semibold text-lg mb-3">🛒 Your Shopping Duties</h3>
                <div className="border-t border-gray-200 dark:border-gray-700 pt-3">
                     <ul className="space-y-2">
                        {mockShoppingHistory.map(s => (
                             <li key={s.id} className="flex justify-between items-center text-sm p-2 bg-gray-50 dark:bg-gray-700/50 rounded-md">
                                <span>{s.date}</span>
                                <span className={`font-semibold ${s.status === 'Approved' ? 'text-green-600 dark:text-green-400' : 'text-yellow-600 dark:text-yellow-400'}`}>
                                    ৳{s.amount} {s.status === 'Approved' ? '✅ Approved' : '⏳ Pending'}
                                </span>
                            </li>
                        ))}
                    </ul>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-3">Next Duty: <span className="font-semibold">Oct 25</span></p>
                    <button className="w-full mt-3 py-2 border-2 border-primary text-primary font-semibold rounded-lg hover:bg-primary-50 dark:hover:bg-primary-500/10 transition-colors">Submit Shopping Expense</button>
                </div>
            </div>
        </div>
        {isDepositModalOpen && <DepositModal onClose={() => setIsDepositModalOpen(false)} />}
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
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Shopping</h1>
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
