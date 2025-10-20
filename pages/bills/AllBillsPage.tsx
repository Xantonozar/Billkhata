import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { api } from '../../services/api';
import type { Bill, BillShare, PaymentStatus } from '../../types';
import { Role } from '../../types';
import { 
    PlusIcon, MagnifyingGlassIcon, ElectricityIcon, HomeIcon, WaterIcon, 
    GasIcon, WifiIcon, MaidIcon, OtherIcon, UserCircleIcon, XIcon, PencilIcon, TrashIcon 
} from '../../components/Icons';

const categoryIcons: Record<string, React.ReactElement> = {
    'Rent': <HomeIcon className="w-6 h-6 text-danger" />,
    'Electricity': <ElectricityIcon className="w-6 h-6 text-yellow-500" />,
    'Water': <WaterIcon className="w-6 h-6 text-blue-500" />,
    'Gas': <GasIcon className="w-6 h-6 text-orange-500" />,
    'Wi-Fi': <WifiIcon className="w-6 h-6 text-cyan-500" />,
    'Maid': <MaidIcon className="w-6 h-6 text-purple-500" />,
    'Others': <OtherIcon className="w-6 h-6 text-gray-500" />,
};


const BillDetailModal: React.FC<{ bill: Bill | null; onClose: () => void }> = ({ bill, onClose }) => {
    if (!bill) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 animate-fade-in" onClick={onClose}>
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl p-6 w-full max-w-md m-4" onClick={(e) => e.stopPropagation()}>
                <div className="flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        {categoryIcons[bill.category]}
                        <h2 className="text-xl font-bold font-sans text-gray-900 dark:text-white">{bill.title}</h2>
                    </div>
                    <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700">
                        <XIcon className="w-5 h-5 text-gray-500" />
                    </button>
                </div>
                <div className="my-4 border-t border-gray-200 dark:border-gray-700"></div>
                <div className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
                    <p><strong>Amount:</strong> <span className="font-numeric text-base text-gray-800 dark:text-gray-100">৳{bill.totalAmount.toFixed(2)}</span></p>
                    <p><strong>Due Date:</strong> {bill.dueDate}</p>
                    <p><strong>Created:</strong> Oct 1 by You</p>
                </div>

                <div className="mt-4">
                    <h3 className="font-bold font-sans text-gray-800 dark:text-white mb-2">Split Among:</h3>
                    <ul className="space-y-2">
                        {bill.shares.map(share => (
                             <li key={share.userId} className="flex justify-between items-center p-2 bg-gray-50 dark:bg-gray-700/50 rounded-md">
                                <div>
                                    <span className="font-medium text-gray-800 dark:text-gray-200">{share.userName}</span>
                                    <span className="text-gray-500 dark:text-gray-400 font-numeric"> (৳{share.amount.toFixed(2)})</span>
                                </div>
                                <span className={`text-sm font-medium ${share.status === 'Paid' ? 'text-success-dark' : 'text-warning-dark'}`}>
                                    {share.status === 'Paid' ? '✅ Paid Oct 5' : `⏳ ${share.status}`}
                                </span>
                            </li>
                        ))}
                    </ul>
                </div>
                
                <div className="mt-6 flex justify-end items-center gap-3">
                     <button className="px-4 py-2 text-sm font-semibold text-primary hover:underline">Send Reminder</button>
                     <button className="p-2 text-gray-500 hover:text-primary"><PencilIcon className="w-5 h-5"/></button>
                     <button className="p-2 text-gray-500 hover:text-danger"><TrashIcon className="w-5 h-5"/></button>
                </div>
            </div>
        </div>
    );
};


// Manager View
const ManagerAllBillsView: React.FC<{ bills: Bill[] }> = ({ bills }) => {
    const [statusFilter, setStatusFilter] = useState('All');
    const [searchQuery, setSearchQuery] = useState('');
    const [viewingBill, setViewingBill] = useState<Bill | null>(null);

    const filteredBills = useMemo(() => {
        return bills.filter(bill => {
            const searchMatch = bill.title.toLowerCase().includes(searchQuery.toLowerCase());
            
            if (!searchMatch) return false;

            if (statusFilter === 'All') return true;
            
            const isOverdue = new Date(bill.dueDate) < new Date() && bill.shares.some(s => s.status !== 'Paid');
            if (statusFilter === 'Overdue') return isOverdue;

            const isFullyPaid = bill.shares.every(s => s.status === 'Paid');
            if (statusFilter === 'Approved') return isFullyPaid;
            
            if (statusFilter === 'Pending Payment') return !isFullyPaid && !isOverdue;

            return true;
        });
    }, [bills, statusFilter, searchQuery]);

    const PaymentProgress: React.FC<{ paid: number, total: number }> = ({ paid, total }) => (
        <div className="flex items-center gap-2">
            <div className="flex items-center gap-1">
                {Array.from({ length: total }).map((_, i) => (
                    <div key={i} className={`w-3 h-3 rounded-full ${i < paid ? 'bg-success' : 'bg-gray-300 dark:bg-gray-600'}`}></div>
                ))}
            </div>
            <span className="text-xs text-gray-500 dark:text-gray-400 font-numeric">{paid}/{total} Paid</span>
        </div>
    );

    return (
        <>
            <div className="space-y-4">
                <div className="flex flex-wrap gap-4 items-center">
                    <div className="flex-shrink-0 grid grid-cols-2 sm:grid-cols-4 gap-2 bg-gray-100 dark:bg-gray-800 p-1 rounded-lg">
                        {['All', 'Pending Payment', 'Approved', 'Overdue'].map(status => (
                            <button 
                                key={status}
                                onClick={() => setStatusFilter(status)}
                                className={`px-3 py-1.5 text-sm font-semibold rounded-md transition-colors ${statusFilter === status ? 'bg-white dark:bg-gray-700 text-primary shadow' : 'text-gray-600 dark:text-gray-300 hover:bg-white/50'}`}
                            >
                                {status}
                            </button>
                        ))}
                    </div>
                     <div className="relative flex-grow min-w-[200px]">
                        <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input 
                            type="text"
                            placeholder="Search bills..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg"
                        />
                    </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredBills.map(bill => {
                        const paidCount = bill.shares.filter(s => s.status === 'Paid').length;
                        const totalCount = bill.shares.length;

                        return (
                            <div key={bill.id} className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-5 flex flex-col justify-between transition-all hover:shadow-lg hover:scale-[1.02]">
                                <div>
                                    <div className="flex items-center gap-3 mb-2">
                                        {categoryIcons[bill.category] || <OtherIcon className="w-6 h-6 text-gray-500" />}
                                        <h3 className="font-bold text-xl font-sans text-gray-800 dark:text-white">{bill.title}</h3>
                                    </div>
                                    <p className="text-2xl font-bold text-primary font-numeric">৳{bill.totalAmount.toFixed(2)}</p>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">Due: {bill.dueDate}</p>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">Split: <span className="font-numeric">৳{(bill.totalAmount / totalCount).toFixed(2)}</span> per person</p>
                                </div>
                                <div className="mt-4 space-y-3">
                                    <PaymentProgress paid={paidCount} total={totalCount} />
                                    <div className="flex gap-2">
                                        <button onClick={() => setViewingBill(bill)} className="px-3 py-1 text-sm bg-gray-100 dark:bg-gray-700 rounded-md font-semibold hover:bg-gray-200 dark:hover:bg-gray-600 transition-all active:scale-95">View</button>
                                        <button className="px-3 py-1 text-sm bg-gray-100 dark:bg-gray-700 rounded-md font-semibold hover:bg-gray-200 dark:hover:bg-gray-600 transition-all active:scale-95">Edit</button>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
            <BillDetailModal bill={viewingBill} onClose={() => setViewingBill(null)} />
        </>
    );
};

// Member View
const MemberAllBillsView: React.FC<{ 
    bills: (Bill & { myShare: BillShare })[];
    setConfirmingPayment: (bill: Bill) => void;
}> = ({ bills, setConfirmingPayment }) => {
    
    const getDueDateStatus = (dueDate: string): { text: string; isOverdue: boolean } => {
        const today = new Date();
        const due = new Date(dueDate);
        today.setHours(0, 0, 0, 0);
        due.setHours(0, 0, 0, 0);

        const diffTime = due.getTime() - today.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays < 0) {
            return { text: `Overdue by ${Math.abs(diffDays)} day(s)`, isOverdue: true };
        }
        if (diffDays === 0) {
            return { text: 'Due today', isOverdue: false };
        }
        return { text: `${diffDays} day(s) left`, isOverdue: false };
    };

    return (
        <div className="space-y-4">
            {bills.map(bill => {
                const dueDateInfo = getDueDateStatus(bill.dueDate);
                const status = bill.myShare.status;

                return (
                    <div key={bill.id} className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-5 space-y-3 transition-all hover:shadow-lg">
                        <div className="flex items-center gap-3">
                            {categoryIcons[bill.category]}
                            <h3 className="font-bold text-lg font-sans text-gray-800 dark:text-white">{bill.title}</h3>
                        </div>
                        <p className="text-gray-600 dark:text-gray-300">
                            Your Share: <span className="font-bold text-lg text-gray-800 dark:text-white font-numeric">৳{bill.myShare.amount.toFixed(2)}</span>
                        </p>
                        <p className={`text-sm ${dueDateInfo.isOverdue && status !== 'Paid' ? 'text-danger font-semibold' : 'text-gray-500 dark:text-gray-400'}`}>
                            Due Date: {new Date(bill.dueDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
                            {status !== 'Paid' && ` (${dueDateInfo.text})`}
                        </p>
                        
                        {status === 'Unpaid' || status === 'Overdue' ? (
                            <div>
                                <p className="text-sm text-gray-500 dark:text-gray-400">Status: <span className="font-semibold text-danger">Not Paid</span></p>
                                <button
                                    onClick={() => setConfirmingPayment(bill)}
                                    className="mt-2 px-4 py-2 text-white font-semibold rounded-md bg-gradient-success hover:shadow-lg transition-all active:scale-[0.98]"
                                >
                                    Pay Now
                                </button>
                            </div>
                        ) : status === 'Pending Approval' ? (
                             <div>
                                <p className="text-sm text-warning-dark dark:text-warning-light">Status: <span className="font-semibold">⏳ Waiting for Manager Approval</span></p>
                                <p className="text-xs text-gray-400 dark:text-gray-500">Marked as paid: Oct 2</p>
                            </div>
                        ) : ( // Paid
                             <div>
                                <p className="text-sm text-success-dark dark:text-success-light">Paid: Sept 28, 2025 ✅</p>
                                <p className="text-xs text-gray-400 dark:text-gray-500">Approved: Sept 29 by Manager</p>
                            </div>
                        )}
                    </div>
                );
            })}
        </div>
    );
};


const AllBillsPage: React.FC = () => {
    const { user } = useAuth();
    const [bills, setBills] = useState<Bill[]>([]);
    const [loading, setLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState('Due Now'); // For member view
    const [confirmingPayment, setConfirmingPayment] = useState<Bill | null>(null);

    useEffect(() => {
        if (user?.khataId) {
            setLoading(true);
            api.getBillsForRoom(user.khataId).then(data => {
                setBills(data.sort((a, b) => new Date(b.dueDate).getTime() - new Date(a.dueDate).getTime()));
                setLoading(false);
            });
        }
    }, [user]);

    const handleMarkAsPaid = async () => {
        if (!confirmingPayment || !user) return;
        const updatedBill = await api.updateBillShareStatus(confirmingPayment.id, user.id, 'Pending Approval');
        if (updatedBill) {
            setBills(prevBills => prevBills.map(b => b.id === updatedBill.id ? updatedBill : b));
        }
        setConfirmingPayment(null);
    };

    const memberFilteredBills = useMemo(() => {
        if (!user || user.role === Role.Manager) return [];
        
        const myBills = bills.map(bill => {
            const myShare = bill.shares.find(s => s.userId === user.id);
            return myShare ? { ...bill, myShare } : null;
        }).filter((b): b is Bill & { myShare: BillShare } => b !== null);

        return myBills.filter(bill => {
            const status = bill.myShare.status;
            if (statusFilter === 'History') return true;
            if (statusFilter === 'Due Now') return status === 'Unpaid' || status === 'Overdue';
            return status === statusFilter;
        });
    }, [bills, user, statusFilter]);


    if (loading) return <div className="text-center p-8">Loading all bills...</div>;
    if (!user) return null;

    return (
        <>
            <div className="space-y-6">
                <div className="flex justify-between items-center">
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white font-sans">
                        {user.role === Role.Manager ? 'Bills' : 'My Bills'}
                    </h1>
                    {user.role === Role.Manager && (
                        <button className="flex items-center gap-2 px-4 py-2 text-white font-semibold rounded-lg bg-gradient-success hover:shadow-lg transition-all active:scale-[0.98]">
                            <PlusIcon className="w-5 h-5" />
                            Add New Bill
                        </button>
                    )}
                </div>
                {user.role === Role.Manager 
                    ? <ManagerAllBillsView bills={bills} />
                    : (
                        <div className="space-y-4">
                            <div className="flex-shrink-0 grid grid-cols-2 sm:grid-cols-4 gap-2 bg-gray-100 dark:bg-gray-800 p-1 rounded-lg">
                                {['Due Now', 'Paid', 'Pending Approval', 'History'].map(status => (
                                    <button 
                                        key={status}
                                        onClick={() => setStatusFilter(status)}
                                        className={`px-3 py-1.5 text-sm font-semibold rounded-md transition-colors ${statusFilter === status ? 'bg-white dark:bg-gray-700 text-primary shadow' : 'text-gray-600 dark:text-gray-300 hover:bg-white/50'}`}
                                    >
                                        {status}
                                    </button>
                                ))}
                            </div>
                            <MemberAllBillsView bills={memberFilteredBills} setConfirmingPayment={setConfirmingPayment} />
                        </div>
                    )
                }
            </div>

            {confirmingPayment && user.role === Role.Member && (
                 <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 animate-fade-in">
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-sm m-4">
                        <h3 className="text-lg font-bold font-sans text-gray-900 dark:text-white">Confirm Payment</h3>
                        <div className="my-4 text-sm text-gray-600 dark:text-gray-300 space-y-2">
                             <p><strong>Bill:</strong> {confirmingPayment.title}</p>
                             <p><strong>Amount to Pay:</strong> <span className="font-numeric">৳{confirmingPayment.shares.find(s => s.userId === user?.id)?.amount.toFixed(2)}</span></p>
                             <p className="mt-4 p-3 bg-warning/10 text-warning-dark dark:text-warning-light rounded-md text-center">
                                 ⚠️ This will be sent to the manager for approval.
                             </p>
                        </div>
                        <div className="flex justify-end gap-3">
                            <button 
                                onClick={() => setConfirmingPayment(null)}
                                className="px-4 py-2 bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-200 rounded-md font-semibold hover:bg-gray-300 dark:hover:bg-gray-500 transition-all active:scale-95"
                            >
                                Cancel
                            </button>
                            <button 
                                onClick={handleMarkAsPaid}
                                className="px-4 py-2 bg-gradient-success text-white rounded-md font-semibold hover:shadow-lg transition-all active:scale-95"
                            >
                                Confirm Payment
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default AllBillsPage;