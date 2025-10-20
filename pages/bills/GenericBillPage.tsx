import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { api } from '../../services/api';
import type { Bill, PaymentStatus } from '../../types';
import { Role } from '../../types';
import { ArrowLeftIcon, PlusIcon, PencilIcon, TrashIcon, CheckCircleIcon } from '../../components/Icons';

const statusColors: Record<PaymentStatus, { text: string, bg: string }> = {
    'Paid': { text: 'text-success-dark dark:text-success-light', bg: 'bg-success/10' },
    'Pending Approval': { text: 'text-warning-dark dark:text-warning-light', bg: 'bg-warning/10' },
    'Unpaid': { text: 'text-gray-800 dark:text-gray-200', bg: 'bg-gray-100 dark:bg-gray-700' },
    'Overdue': { text: 'text-danger-dark dark:text-danger-light', bg: 'bg-danger/10' },
};

interface GenericBillPageProps {
  category: string;
  icon: React.ReactElement;
}

const GenericBillPage: React.FC<GenericBillPageProps> = ({ category, icon }) => {
    const { user, setPage } = useAuth();
    const [bills, setBills] = useState<Bill[]>([]);
    const [loading, setLoading] = useState(true);
    const [confirmingPayment, setConfirmingPayment] = useState<Bill | null>(null);

    useEffect(() => {
        if (user?.khataId) {
            setLoading(true);
            api.getBillsForRoom(user.khataId).then(data => {
                const categoryBills = data
                    .filter(b => b.category === category)
                    .sort((a, b) => new Date(b.dueDate).getTime() - new Date(a.dueDate).getTime());
                setBills(categoryBills);
                setLoading(false);
            });
        }
    }, [user, category]);

    const handleMarkAsPaid = async () => {
        if (!confirmingPayment || !user) return;

        const updatedBill = await api.updateBillShareStatus(confirmingPayment.id, user.id, 'Pending Approval');
        
        if (updatedBill) {
            setBills(prevBills => 
                prevBills.map(b => b.id === updatedBill.id ? updatedBill : b)
            );
        }
        setConfirmingPayment(null); // Close modal
    };

    const latestBill = useMemo(() => bills[0], [bills]);
    const previousBills = useMemo(() => bills.slice(1), [bills]);

    if (loading) return <div className="text-center p-8">Loading {category} bills...</div>;
    if (!user) return null;

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


    const renderManagerView = () => (
        <div className="space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 space-y-4">
                <h2 className="text-xl font-bold font-sans text-gray-800 dark:text-white">October 2025 Bill</h2>
                <div className="space-y-1 text-sm text-gray-600 dark:text-gray-300">
                    <p><strong>Total Amount:</strong> <span className="font-numeric text-base">৳{latestBill.totalAmount.toFixed(2)}</span></p>
                    <p><strong>Bill Date:</strong> Oct 1, 2025</p>
                    <p><strong>Due Date:</strong> {latestBill.dueDate}</p>
                    {latestBill.description && <p><strong>Notes:</strong> {latestBill.description}</p>}
                </div>

                <div>
                    <h3 className="font-bold font-sans text-gray-800 dark:text-white mb-2">Split Among {latestBill.shares.length} Members:</h3>
                    <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg space-y-2">
                        {latestBill.shares.map(s => (
                            <div key={s.userId} className="flex justify-between items-center text-sm">
                                <p className="font-medium text-gray-800 dark:text-gray-200">{s.userName} - <span className="font-numeric">৳{s.amount.toFixed(2)}</span></p>
                                <span className={`font-semibold ${s.status === 'Paid' ? 'text-success' : 'text-gray-500'}`}>
                                    {s.status === 'Paid' ? `✅ Paid Oct ${s.userId === '1' ? 5 : 6}` : '⏳ Not Paid'}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
                 <div className="pt-4 border-t border-gray-200 dark:border-gray-700 flex flex-wrap gap-2 justify-end">
                    <button className="px-3 py-1.5 text-sm font-semibold border border-primary text-primary rounded-md hover:bg-primary/10 transition-all active:scale-95">Send Reminder</button>
                    <button className="px-3 py-1.5 text-sm font-semibold border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-all active:scale-95">Edit Bill</button>
                    <button className="px-3 py-1.5 text-sm font-semibold text-danger bg-danger/10 rounded-md hover:bg-danger/20 transition-all active:scale-95">Delete</button>
                </div>
            </div>
            {previousBills.length > 0 && (
                <div>
                    <h2 className="text-xl font-bold font-sans text-gray-800 dark:text-white mb-3">Previous Bills</h2>
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-4 space-y-3">
                        {previousBills.map(bill => (
                             <div key={bill.id} className="flex justify-between items-center p-3">
                                <div>
                                    <p className="font-semibold text-gray-800 dark:text-white">{bill.title}</p>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">Total: <span className="font-numeric">৳{bill.totalAmount.toFixed(2)}</span></p>
                                </div>
                                <div className="flex items-center gap-2 text-sm text-success-dark dark:text-success-light">
                                    <CheckCircleIcon className="w-5 h-5" />
                                    <span>All Paid</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );

    const renderMemberView = () => {
        const myShare = latestBill.shares.find(s => s.userId === user.id);
        if (!myShare) return <p>Your details for this bill are not available.</p>;

        const dueDateInfo = getDueDateStatus(latestBill.dueDate);
        const statusInfo = statusColors[myShare.status];
        const canPay = myShare.status === 'Unpaid' || myShare.status === 'Overdue';
        
        return (
            <div className="space-y-6">
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 space-y-4">
                    <h2 className="text-xl font-bold font-sans text-gray-800 dark:text-white">October 2025</h2>
                    <div className="text-sm text-gray-600 dark:text-gray-300">
                        <p>Total Bill: <span className="font-semibold text-gray-800 dark:text-white font-numeric">৳{latestBill.totalAmount.toFixed(2)}</span></p>
                        <p className="text-lg mt-1">Your Share: <span className="font-bold text-xl text-primary font-numeric">৳{myShare.amount.toFixed(2)}</span></p>
                    </div>
                    <div>
                        <p className={`text-sm ${dueDateInfo.isOverdue && !canPay ? 'text-danger font-semibold' : 'text-gray-500 dark:text-gray-400'}`}>
                            Due: {latestBill.dueDate}
                            {canPay && ` (${dueDateInfo.text})`}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Status: <span className={`font-semibold ${statusInfo.text}`}>{myShare.status}</span></p>
                    </div>
                     <div className="flex flex-wrap gap-3">
                        <button className="px-4 py-2 text-sm font-semibold border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-all active:scale-95">View Bill Image 📷</button>
                        {canPay && (
                            <button 
                                onClick={() => setConfirmingPayment(latestBill)}
                                className="px-4 py-2 text-sm font-semibold bg-gradient-success text-white rounded-md hover:shadow-lg transition-all active:scale-[0.98]"
                            >
                                Pay Now
                            </button>
                        )}
                     </div>
                </div>
                 {previousBills.length > 0 && (
                    <div>
                        <h2 className="text-xl font-bold font-sans text-gray-800 dark:text-white mb-3">Your Payment History</h2>
                        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-4 space-y-3">
                            {previousBills.map(bill => {
                                const prevShare = bill.shares.find(s => s.userId === user.id);
                                if (!prevShare) return null;
                                return (
                                     <div key={bill.id} className="flex justify-between items-center p-3">
                                        <div>
                                            <p className="font-semibold text-gray-800 dark:text-white">{bill.title.split(' ')[0]}</p>
                                            <p className="text-sm text-gray-500 dark:text-gray-400">You Paid: <span className="font-numeric">৳{prevShare.amount.toFixed(2)}</span></p>
                                        </div>
                                        <div className="flex items-center gap-2 text-sm text-success-dark dark:text-success-light">
                                            <CheckCircleIcon className="w-5 h-5" />
                                            <span>Paid</span>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                )}
            </div>
        );
    };

    return (
        <>
            <div className="space-y-6">
                <div className="flex items-center gap-4">
                    <button onClick={() => setPage('bills')} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-all active:scale-95">
                        <ArrowLeftIcon className="w-6 h-6 text-gray-600 dark:text-gray-300"/>
                    </button>
                    {icon}
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white font-sans">{category} Bills</h1>
                    {user.role === Role.Manager && (
                        <button className="ml-auto flex items-center gap-2 px-4 py-2 bg-gradient-success text-white font-semibold rounded-md hover:shadow-lg transition-all active:scale-[0.98]">
                            <PlusIcon className="w-5 h-5" />
                            Add Bill
                        </button>
                    )}
                </div>

                {!latestBill ? (
                    <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
                        <h3 className="text-lg font-medium font-sans text-gray-900 dark:text-white">No {category} bills found.</h3>
                        {user.role === Role.Manager && <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Click "Add Bill" to get started.</p>}
                    </div>
                ) : (
                    user.role === Role.Manager ? renderManagerView() : renderMemberView()
                )}
            </div>

            {confirmingPayment && (
                 <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 animate-fade-in">
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-sm">
                        <h3 className="text-lg font-bold font-sans text-gray-900 dark:text-white">Confirm Payment</h3>
                        <div className="mt-4 mb-6 text-sm text-gray-600 dark:text-gray-300">
                             <p>Bill: <span className="font-semibold">{confirmingPayment.title}</span></p>
                             <p>Amount to Pay: <span className="font-semibold font-numeric">৳{confirmingPayment.shares.find(s => s.userId === user?.id)?.amount.toFixed(2)}</span></p>
                             <p className="mt-4 p-2 bg-warning/10 text-warning-dark dark:text-warning-light rounded-md">
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

export default GenericBillPage;