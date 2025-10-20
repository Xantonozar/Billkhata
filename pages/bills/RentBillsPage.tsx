import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { api } from '../../services/api';
import type { Bill, PaymentStatus, User } from '../../types';
import { Role } from '../../types';
import { ArrowLeftIcon, PlusIcon, UserCircleIcon } from '../../components/Icons';

const statusClasses: Record<PaymentStatus, { bg: string, text: string, border: string }> = {
    'Paid': { bg: 'bg-success/10', text: 'text-success-dark dark:text-success-light', border: 'border-success/30' },
    'Pending Approval': { bg: 'bg-warning/10', text: 'text-warning-dark dark:text-warning-light', border: 'border-warning/30' },
    'Unpaid': { bg: 'bg-gray-100 dark:bg-gray-700/20', text: 'text-gray-700 dark:text-gray-300', border: 'border-gray-200 dark:border-gray-600' },
    'Overdue': { bg: 'bg-danger/10', text: 'text-danger-dark dark:text-danger-light', border: 'border-danger/30' },
};

const RentCard: React.FC<{ bill: Bill, role: Role }> = ({ bill, role }) => {
    const share = bill.shares[0];
    const statusInfo = statusClasses[share.status];

    return (
        <div className={`p-4 rounded-lg border ${statusInfo.border} ${statusInfo.bg}`}>
            <div className="flex justify-between items-start">
                <div className="flex items-center gap-3">
                    <UserCircleIcon className="w-10 h-10 text-gray-400"/>
                    <div>
                        <p className="font-bold text-gray-800 dark:text-white">{share.userName}</p>
                        <p className={`text-sm font-semibold ${statusInfo.text}`}>{share.status}</p>
                    </div>
                </div>
                <div className="text-right">
                    <p className="text-lg font-bold text-gray-800 dark:text-white font-numeric">৳{share.amount.toFixed(2)}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Due: {bill.dueDate}</p>
                </div>
            </div>
            {role === Role.Manager && (
                <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700/50 flex justify-end gap-2">
                    {share.status === 'Pending Approval' && (
                        <>
                            <button className="px-3 py-1 text-xs font-semibold bg-danger/10 text-danger rounded-md hover:bg-danger/20 transition-all active:scale-95">Deny</button>
                            <button className="px-3 py-1 text-xs font-semibold bg-success/10 text-success rounded-md hover:bg-success/20 transition-all active:scale-95">Approve</button>
                        </>
                    )}
                     {share.status === 'Overdue' && (
                        <button className="px-3 py-1 text-xs font-semibold border border-primary text-primary rounded-md hover:bg-primary/10 transition-all active:scale-95">Send Reminder</button>
                    )}
                </div>
            )}
        </div>
    );
};


const RentBillsPage: React.FC = () => {
    const { user, setPage } = useAuth();
    const [rentBills, setRentBills] = useState<Bill[]>([]);
    const [loading, setLoading] = useState(true);
    const [confirmingPayment, setConfirmingPayment] = useState<Bill | null>(null);

    useEffect(() => {
        if (user?.khataId) {
            setLoading(true);
            api.getBillsForRoom(user.khataId).then(data => {
                setRentBills(data.filter(b => b.category === 'Rent'));
                setLoading(false);
            });
        }
    }, [user]);

    const handleMarkAsPaid = async () => {
        if (!confirmingPayment || !user) return;

        const updatedBill = await api.updateBillShareStatus(confirmingPayment.id, user.id, 'Pending Approval');
        
        if (updatedBill) {
            setRentBills(prevBills => 
                prevBills.map(b => b.id === updatedBill.id ? updatedBill : b)
            );
        }
        setConfirmingPayment(null);
    };

    if (loading) return <div className="text-center p-8">Loading rent bills...</div>;
    if (!user) return null;

    const myRentBill = rentBills.find(b => b.shares[0]?.userId === user.id);

    const renderManagerView = () => (
        <div className="space-y-4">
            {rentBills.map(bill => <RentCard key={bill.id} bill={bill} role={user.role} />)}
        </div>
    );
    
    const renderMemberView = () => {
        if (!myRentBill) {
            return <p>Your rent details are not available.</p>;
        }
        const share = myRentBill.shares[0];
        const statusInfo = statusClasses[share.status];
        const canPay = share.status === 'Unpaid' || share.status === 'Overdue';
        return (
             <div className={`p-6 rounded-xl border-2 ${statusInfo.border} ${statusInfo.bg}`}>
                <p className="text-sm font-semibold">October 2025</p>
                <p className="text-3xl font-bold text-gray-800 dark:text-white mt-1 font-numeric">৳{share.amount.toFixed(2)}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Due: {myRentBill.dueDate}</p>
                 <div className="mt-4 flex items-center gap-4">
                     <span className={`px-3 py-1 text-sm font-bold rounded-full ${statusInfo.bg} ${statusInfo.text}`}>{share.status}</span>
                     {canPay ? (
                        <button 
                            onClick={() => setConfirmingPayment(myRentBill)}
                            className="px-4 py-2 bg-gradient-success text-white font-semibold rounded-md hover:shadow-lg transition-all active:scale-[0.98]">
                                Pay Now
                        </button>
                     ) : null}
                 </div>
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
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white font-sans">Rent Bills</h1>
                    {user.role === Role.Manager && (
                        <button className="ml-auto flex items-center gap-2 px-4 py-2 bg-gradient-success text-white font-semibold rounded-md hover:shadow-lg transition-all active:scale-[0.98]">
                            <PlusIcon className="w-5 h-5" />
                            Add Rent
                        </button>
                    )}
                </div>

                {user.role === Role.Manager ? renderManagerView() : renderMemberView()}
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
                                className="px-4 py-2 bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-200 font-semibold rounded-md hover:bg-gray-300 dark:hover:bg-gray-500 transition-all active:scale-95"
                            >
                                Cancel
                            </button>
                            <button 
                                onClick={handleMarkAsPaid}
                                className="px-4 py-2 bg-gradient-success text-white font-semibold rounded-md hover:shadow-lg transition-all active:scale-95"
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

export default RentBillsPage;