import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { api } from '../../services/api';
import type { Bill, PaymentStatus, User } from '../../types';
import { Role } from '../../types';
import { ArrowLeftIcon, PlusIcon, UserCircleIcon } from '../../components/Icons';
import PushRentBillsModal from '../../components/modals/PushRentBillsModal';
import { useNotifications } from '../../contexts/NotificationContext';
import EditRentBillModal from '../../components/modals/EditRentBillModal';

const statusClasses: Record<PaymentStatus, { bg: string, text: string, border: string }> = {
    'Paid': { bg: 'bg-success-500/10', text: 'text-success-700 dark:text-success-400', border: 'border-success-500/30' },
    'Pending Approval': { bg: 'bg-warning-500/10', text: 'text-warning-600 dark:text-warning-400', border: 'border-warning-500/30' },
    'Unpaid': { bg: 'bg-slate-100 dark:bg-slate-700/20', text: 'text-slate-700 dark:text-slate-300', border: 'border-slate-200 dark:border-slate-600' },
    'Overdue': { bg: 'bg-danger-500/10', text: 'text-danger-600 dark:text-danger-400', border: 'border-danger-500/30' },
};

const RentCard: React.FC<{ bill: Bill, role: Role, onEdit: (bill: Bill) => void }> = ({ bill, role, onEdit }) => {
    const share = bill.shares[0];
    const statusInfo = statusClasses[share.status];

    return (
        <div className={`p-4 rounded-lg border ${statusInfo.border} ${statusInfo.bg}`}>
            <div className="flex justify-between items-start">
                <div className="flex items-center gap-3">
                    <UserCircleIcon className="w-10 h-10 text-slate-400"/>
                    <div>
                        <p className="font-bold text-slate-800 dark:text-white">{share.userName}</p>
                        <p className={`text-sm font-semibold ${statusInfo.text}`}>{share.status}</p>
                    </div>
                </div>
                <div className="text-right">
                    <p className="text-lg font-bold text-slate-800 dark:text-white font-numeric">৳{share.amount.toFixed(2)}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Due: {bill.dueDate}</p>
                </div>
            </div>
            {role === Role.Manager && (
                <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-700/50 flex justify-end gap-2">
                    {share.status === 'Pending Approval' && (
                        <>
                            <button className="px-3 py-1 text-xs font-semibold bg-danger-500/10 text-danger-600 rounded-md hover:bg-danger-500/20 transition-all active:scale-95">Deny</button>
                            <button className="px-3 py-1 text-xs font-semibold bg-success-500/10 text-success-600 rounded-md hover:bg-success-500/20 transition-all active:scale-95">Approve</button>
                        </>
                    )}
                     {share.status === 'Overdue' && (
                        <button className="px-3 py-1 text-xs font-semibold border border-primary-500 text-primary-600 rounded-md hover:bg-primary-500/10 transition-all active:scale-95">Send Reminder</button>
                    )}
                    <button onClick={() => onEdit(bill)} className="px-3 py-1 text-xs font-semibold border border-slate-300 dark:border-slate-600 rounded-md hover:bg-slate-100 dark:hover:bg-slate-700 transition-all active:scale-95">Edit</button>
                </div>
            )}
        </div>
    );
};

const getPastSixMonths = () => {
    const months = [];
    const date = new Date(2025, 9, 1); // Mock current date: October 2025
    for (let i = 0; i < 6; i++) {
        const d = new Date(date);
        d.setMonth(d.getMonth() - i);
        months.push(d.toLocaleString('default', { month: 'long', year: 'numeric' }));
    }
    return months;
};


const RentBillsPage: React.FC = () => {
    const { user, setPage } = useAuth();
    const [rentBills, setRentBills] = useState<Bill[]>([]);
    const [loading, setLoading] = useState(true);
    const [confirmingPayment, setConfirmingPayment] = useState<Bill | null>(null);
    const [editingRentBill, setEditingRentBill] = useState<Bill | null>(null);
    const [isPushModalOpen, setIsPushModalOpen] = useState(false);
    const { addToast } = useNotifications();
    
    const [availableMonths] = useState<string[]>(getPastSixMonths());
    const [selectedMonth, setSelectedMonth] = useState<string>(availableMonths[0]);

    useEffect(() => {
        if (user?.khataId) {
            setLoading(true);
            api.getBillsForRoom(user.khataId).then(data => {
                setRentBills(data.filter(b => b.category === 'Rent'));
                setLoading(false);
            });
        }
    }, [user]);

    const selectedMonthBills = useMemo(() => {
        if (!selectedMonth) return [];

        const [monthStr, yearStr] = selectedMonth.split(' ');
        const year = parseInt(yearStr, 10);
        const monthIndex = new Date(Date.parse(monthStr +" 1, 2012")).getMonth();

        return rentBills.filter(bill => {
            const billDate = new Date(bill.dueDate);
            return billDate.getFullYear() === year && billDate.getMonth() === monthIndex;
        });
    }, [rentBills, selectedMonth]);

    const handleMarkAsPaid = async () => {
        if (!confirmingPayment || !user) return;

        const updatedBill = await api.updateBillShareStatus(confirmingPayment.id, user.id, 'Pending Approval');
        
        if (updatedBill) {
            setRentBills(prevBills => 
                prevBills.map(b => b.id === updatedBill.id ? updatedBill : b)
            );
            addToast({ type: 'success', title: 'Payment Sent', message: 'Your payment is now pending approval.' });
        }
        setConfirmingPayment(null);
    };

    const handleBillUpdate = (updatedBill: Bill) => {
        setRentBills(prev => prev.map(b => b.id === updatedBill.id ? updatedBill : b));
        addToast({
            type: 'success',
            title: 'Rent Updated',
            message: `Rent for ${updatedBill.shares[0].userName} has been updated.`,
        });
        setEditingRentBill(null);
    };

    const handleConfirmPush = (rentData: { userId: string; userName: string; amount: number }[]) => {
        const newBills: Bill[] = rentData.map((rent) => ({
            id: `rent-nov-${rent.userId}`,
            khataId: user!.khataId!,
            title: 'November Rent',
            category: 'Rent',
            totalAmount: rent.amount,
            dueDate: '2025-11-01',
            createdBy: user!.id,
            shares: [{
                userId: rent.userId,
                userName: rent.userName,
                amount: rent.amount,
                status: 'Unpaid'
            }]
        }));
    
        setRentBills(prev => [...newBills, ...prev]);
        addToast({ type: 'success', title: 'Bills Created', message: 'November rent bills have been pushed to all members.' });
    };

    if (loading) return <div className="text-center p-8">Loading rent bills...</div>;
    if (!user) return null;

    const renderManagerView = () => (
        <div>
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold font-sans text-slate-800 dark:text-white">{selectedMonth} Rent Status</h2>
                <button 
                    onClick={() => setIsPushModalOpen(true)}
                    className="px-4 py-2 text-sm font-semibold bg-primary-500 text-white rounded-lg hover:bg-primary-600 shadow-sm transition-all active:scale-95"
                >
                    Push Next Month's Bills
                </button>
            </div>
            <div className="space-y-4">
                {selectedMonthBills.map(bill => <RentCard key={bill.id} bill={bill} role={user.role} onEdit={setEditingRentBill} />)}
            </div>
        </div>
    );
    
    const renderMemberView = () => {
        const myRentBill = selectedMonthBills.find(b => b.shares[0]?.userId === user.id);
        if (!myRentBill) {
             return (
                <div className="text-center py-12 bg-white dark:bg-slate-800 rounded-lg shadow-sm">
                    <p className="text-lg text-slate-600 dark:text-slate-300">Your rent details for {selectedMonth} are not available.</p>
                </div>
            );
        }
        const share = myRentBill.shares[0];
        const statusInfo = statusClasses[share.status];
        const canPay = share.status === 'Unpaid' || share.status === 'Overdue';
        return (
             <div className={`p-6 rounded-xl border-2 ${statusInfo.border} ${statusInfo.bg}`}>
                <p className="text-sm font-semibold">{selectedMonth}</p>
                <p className="text-3xl font-bold text-slate-800 dark:text-white mt-1 font-numeric">৳{share.amount.toFixed(2)}</p>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Due: {myRentBill.dueDate}</p>
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
                <div className="flex flex-wrap items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <button onClick={() => setPage('bills')} className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-all active:scale-95">
                            <ArrowLeftIcon className="w-6 h-6 text-slate-600 dark:text-slate-300"/>
                        </button>
                        <h1 className="text-3xl font-bold text-slate-900 dark:text-white font-sans">Rent Bills</h1>
                    </div>
                     <select
                        value={selectedMonth}
                        onChange={(e) => setSelectedMonth(e.target.value)}
                        className="px-4 py-2 text-sm font-semibold bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm"
                    >
                        {availableMonths.map(month => (
                            <option key={month} value={month}>{month}</option>
                        ))}
                    </select>
                </div>

                {selectedMonthBills.length === 0 ? (
                     <div className="text-center py-12 bg-white dark:bg-slate-800 rounded-lg shadow-sm">
                        <h3 className="text-lg font-medium font-sans text-slate-900 dark:text-white">No rent bills found for {selectedMonth}.</h3>
                        {user.role === Role.Manager && <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Click "Push Next Month's Bills" to create them.</p>}
                    </div>
                ) : (
                     user.role === Role.Manager ? renderManagerView() : renderMemberView()
                )}

            </div>
            
            {editingRentBill && (
                <EditRentBillModal
                    billToEdit={editingRentBill}
                    onClose={() => setEditingRentBill(null)}
                    onBillUpdated={handleBillUpdate}
                />
            )}

            {confirmingPayment && (
                 <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 animate-fade-in">
                    <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl p-6 w-full max-w-sm animate-scale-in">
                        <h3 className="text-lg font-bold font-sans text-slate-900 dark:text-white">Confirm Payment</h3>
                        <div className="mt-4 mb-6 text-sm text-slate-600 dark:text-slate-300">
                             <p>Bill: <span className="font-semibold">{confirmingPayment.title}</span></p>
                             <p>Amount to Pay: <span className="font-semibold font-numeric">৳{confirmingPayment.shares.find(s => s.userId === user?.id)?.amount.toFixed(2)}</span></p>
                             <p className="mt-4 p-2 bg-warning-500/10 text-warning-600 dark:text-warning-400 rounded-md">
                                 ⚠️ This will be sent to the manager for approval.
                             </p>
                        </div>
                        <div className="flex justify-end gap-3">
                            <button 
                                onClick={() => setConfirmingPayment(null)}
                                className="px-4 py-2 bg-slate-200 dark:bg-slate-600 text-slate-800 dark:text-slate-200 font-semibold rounded-md hover:bg-slate-300 dark:hover:bg-slate-500 transition-all active:scale-95"
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

            {isPushModalOpen && user.role === Role.Manager && (
                <PushRentBillsModal
                    onClose={() => setIsPushModalOpen(false)}
                    onConfirm={handleConfirmPush}
                />
            )}
        </>
    );
};

export default RentBillsPage;