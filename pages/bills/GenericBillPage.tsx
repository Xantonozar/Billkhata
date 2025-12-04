import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { api } from '../../services/api';
import type { Bill, PaymentStatus } from '../../types';
import { Role } from '../../types';
import { ArrowLeftIcon, PlusIcon, CheckCircleIcon } from '../../components/Icons';
import { useNotifications } from '../../contexts/NotificationContext';
import AddBillModal from '../../components/modals/AddBillModal';
import EditSharedBillModal from '../../components/modals/EditSharedBillModal';

const statusColors: Record<PaymentStatus, { text: string, bg: string }> = {
    'Paid': { text: 'text-success-700 dark:text-success-400', bg: 'bg-success-500/10' },
    'Pending Approval': { text: 'text-warning-600 dark:text-warning-400', bg: 'bg-warning-500/10' },
    'Unpaid': { text: 'text-slate-800 dark:text-slate-200', bg: 'bg-slate-100 dark:bg-slate-700' },
    'Overdue': { text: 'text-danger-600 dark:text-danger-400', bg: 'bg-danger-500/10' },
};

interface GenericBillPageProps {
    category: string;
    icon: React.ReactElement;
}

const getPastSixMonths = () => {
    const months = [];
    const date = new Date(); // Use current date
    for (let i = 0; i < 6; i++) {
        const d = new Date(date);
        d.setMonth(d.getMonth() - i);
        months.push(d.toLocaleString('default', { month: 'long', year: 'numeric' }));
    }
    return months;
};

const GenericBillPage: React.FC<GenericBillPageProps> = ({ category, icon }) => {
    const { user, setPage } = useAuth();
    const [bills, setBills] = useState<Bill[]>([]);
    const [loading, setLoading] = useState(true);
    const [confirmingPayment, setConfirmingPayment] = useState<Bill | null>(null);
    const [editingBill, setEditingBill] = useState<Bill | null>(null);
    const { addToast } = useNotifications();
    const [availableMonths] = useState<string[]>(getPastSixMonths());
    const [selectedMonth, setSelectedMonth] = useState<string>(availableMonths[0]);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);

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
            addToast({ type: 'success', title: 'Payment Submitted', message: 'Your payment is now pending approval.' });
        }
        setConfirmingPayment(null); // Close modal
    };

    const handleApprovePayment = async (billId: string, userId: string) => {
        const updatedBill = await api.updateBillShareStatus(billId, userId, 'Paid');
        if (updatedBill) {
            setBills(prev => prev.map(b => b.id === updatedBill.id ? updatedBill : b));
            addToast({ type: 'success', title: 'Approved', message: 'Payment approved successfully.' });
        } else {
            addToast({ type: 'error', title: 'Error', message: 'Failed to approve payment.' });
        }
    };

    const handleDenyPayment = async (billId: string, userId: string) => {
        const updatedBill = await api.updateBillShareStatus(billId, userId, 'Unpaid');
        if (updatedBill) {
            setBills(prev => prev.map(b => b.id === updatedBill.id ? updatedBill : b));
            addToast({ type: 'info', title: 'Denied', message: 'Payment rejected. Status reset to Unpaid.' });
        } else {
            addToast({ type: 'error', title: 'Error', message: 'Failed to deny payment.' });
        }
    };

    const handleBillUpdate = (updatedBill: Bill) => {
        setBills(prevBills =>
            prevBills.map(b => b.id === updatedBill.id ? updatedBill : b)
        );
        addToast({
            type: 'success',
            title: 'Bill Updated',
            message: `The ${updatedBill.title} bill has been successfully updated.`,
        });
        setEditingBill(null);
    };

    const handleBillAdded = (newBill: Bill) => {
        setBills(prev => [newBill, ...prev].sort((a, b) => new Date(b.dueDate).getTime() - new Date(a.dueDate).getTime()));
        addToast({
            type: 'success',
            title: 'Bill Added',
            message: `The new ${category} bill has been successfully created.`,
        });
        setIsAddModalOpen(false);
    };

    const handleSendReminder = () => {
        addToast({ type: 'info', title: 'Reminder Sent', message: `Reminders have been sent to all unpaid members.` });
    };

    const handleDelete = (bill: Bill) => {
        if (window.confirm(`Are you sure you want to delete the ${bill.title} bill? This action cannot be undone.`)) {
            setBills(prev => prev.filter(b => b.id !== bill.id));
            addToast({ type: 'error', title: 'Bill Deleted', message: `The ${bill.title} bill has been removed.` });
        }
    };

    const selectedMonthBill = useMemo(() => {
        if (!selectedMonth) return null;

        const [monthStr, yearStr] = selectedMonth.split(' ');
        const year = parseInt(yearStr, 10);
        const monthIndex = new Date(Date.parse(monthStr + " 1, 2012")).getMonth();

        return bills.find(bill => {
            const billDate = new Date(bill.dueDate);
            return billDate.getFullYear() === year && billDate.getMonth() === monthIndex;
        });
    }, [bills, selectedMonth]);

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


    const renderManagerView = (bill: Bill) => (
        <div className="space-y-6">
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-md p-6 space-y-4">
                <h2 className="text-xl font-bold font-sans text-slate-800 dark:text-white">{selectedMonth} Bill</h2>
                <div className="space-y-1 text-sm text-slate-600 dark:text-slate-300">
                    <p><strong>Total Amount:</strong> <span className="font-numeric text-base">৳{bill.totalAmount.toFixed(2)}</span></p>
                    <p><strong>Bill Date:</strong> {new Date(new Date(bill.dueDate).setDate(1)).toLocaleDateString()}</p>
                    <p><strong>Due Date:</strong> {bill.dueDate}</p>
                    {bill.description && <p><strong>Notes:</strong> {bill.description}</p>}
                </div>

                <div>
                    <h3 className="font-bold font-sans text-slate-800 dark:text-white mb-2">Split Among {bill.shares.length} Members:</h3>
                    <div className="p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg space-y-2">
                        {bill.shares.map(s => (
                            <div key={s.userId} className="flex justify-between items-center text-sm">
                                <div>
                                    <p className="font-medium text-slate-800 dark:text-slate-200">{s.userName} - <span className="font-numeric">৳{s.amount.toFixed(2)}</span></p>
                                    <span className={`text-xs font-semibold ${statusColors[s.status].text}`}>
                                        {s.status}
                                    </span>
                                </div>
                                <div className="flex gap-2">
                                    {s.status === 'Pending Approval' && (
                                        <>
                                            <button
                                                onClick={() => handleDenyPayment(bill.id, s.userId)}
                                                className="px-2 py-1 text-xs font-semibold bg-danger-500/10 text-danger-600 rounded-md hover:bg-danger-500/20 transition-all active:scale-95"
                                            >
                                                Deny
                                            </button>
                                            <button
                                                onClick={() => handleApprovePayment(bill.id, s.userId)}
                                                className="px-2 py-1 text-xs font-semibold bg-success-500/10 text-success-600 rounded-md hover:bg-success-500/20 transition-all active:scale-95"
                                            >
                                                Approve
                                            </button>
                                        </>
                                    )}
                                    {s.status === 'Paid' && <span className="text-success-600">✅</span>}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
                <div className="pt-4 border-t border-slate-200 dark:border-slate-700 flex flex-wrap gap-2 justify-end">
                    <button onClick={handleSendReminder} className="px-3 py-1.5 text-sm font-semibold border border-primary-500 text-primary-600 rounded-md hover:bg-primary-500/10 transition-all active:scale-95">Send Reminder</button>
                    <button onClick={() => setEditingBill(bill)} className="px-3 py-1.5 text-sm font-semibold border border-slate-300 dark:border-slate-600 rounded-md hover:bg-slate-100 dark:hover:bg-slate-700 transition-all active:scale-95">Edit Bill</button>
                    <button onClick={() => handleDelete(bill)} className="px-3 py-1.5 text-sm font-semibold text-danger-600 bg-danger-500/10 rounded-md hover:bg-danger-500/20 transition-all active:scale-95">Delete</button>
                </div>
            </div>
        </div>
    );

    const renderMemberView = (bill: Bill) => {
        const myShare = bill.shares.find(s => s.userId === user.id);
        if (!myShare) return <p>Your details for this bill are not available.</p>;

        const dueDateInfo = getDueDateStatus(bill.dueDate);
        const statusInfo = statusColors[myShare.status];
        const canPay = myShare.status === 'Unpaid' || myShare.status === 'Overdue';

        return (
            <div className="space-y-6">
                <div className="bg-white dark:bg-slate-800 rounded-xl shadow-md p-6 space-y-4">
                    <h2 className="text-xl font-bold font-sans text-slate-800 dark:text-white">{selectedMonth}</h2>
                    <div className="text-sm text-slate-600 dark:text-slate-300">
                        <p>Total Bill: <span className="font-semibold text-slate-800 dark:text-white font-numeric">৳{bill.totalAmount.toFixed(2)}</span></p>
                        <p className="text-lg mt-1">Your Share: <span className="font-bold text-xl text-primary-600 font-numeric">৳{myShare.amount.toFixed(2)}</span></p>
                    </div>
                    <div>
                        <p className={`text-sm ${dueDateInfo.isOverdue && !canPay ? 'text-danger-600 font-semibold' : 'text-slate-500 dark:text-slate-400'}`}>
                            Due: {bill.dueDate}
                            {canPay && ` (${dueDateInfo.text})`}
                        </p>
                        <p className="text-sm text-slate-500 dark:text-slate-400">Status: <span className={`font-semibold ${statusInfo.text}`}>{myShare.status}</span></p>
                    </div>
                    <div className="flex flex-wrap gap-3">
                        <button className="px-4 py-2 text-sm font-semibold border border-slate-300 dark:border-slate-600 rounded-md hover:bg-slate-100 dark:hover:bg-slate-700 transition-all active:scale-95">View Bill Image 📷</button>
                        {canPay && (
                            <button
                                onClick={() => setConfirmingPayment(bill)}
                                className="px-4 py-2 text-sm font-semibold bg-gradient-success text-white rounded-md hover:shadow-lg transition-all active:scale-[0.98]"
                            >
                                Pay Now
                            </button>
                        )}
                    </div>
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
                            <ArrowLeftIcon className="w-6 h-6 text-slate-600 dark:text-slate-300" />
                        </button>
                        {icon}
                        <h1 className="text-3xl font-bold text-slate-900 dark:text-white font-sans">{category} Bills</h1>
                    </div>
                    {user.role === Role.Manager && (
                        <button
                            onClick={() => setIsAddModalOpen(true)}
                            className="flex items-center gap-2 px-4 py-2 bg-gradient-success text-white font-semibold rounded-md hover:shadow-lg transition-all active:scale-[0.98]">
                            <PlusIcon className="w-5 h-5" />
                            Add Bill
                        </button>
                    )}
                </div>

                <div className="flex justify-end">
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

                {!selectedMonthBill ? (
                    <div className="text-center py-12 bg-white dark:bg-slate-800 rounded-lg shadow-sm">
                        <h3 className="text-lg font-medium font-sans text-slate-900 dark:text-white">No {category} bill found for {selectedMonth}.</h3>
                        {user.role === Role.Manager && <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Click "Add Bill" to create one.</p>}
                    </div>
                ) : (
                    user.role === Role.Manager ? renderManagerView(selectedMonthBill) : renderMemberView(selectedMonthBill)
                )}
            </div>

            {editingBill && (
                <EditSharedBillModal
                    billToEdit={editingBill}
                    onClose={() => setEditingBill(null)}
                    onBillUpdated={handleBillUpdate}
                />
            )}

            {isAddModalOpen && (
                <AddBillModal
                    onClose={() => setIsAddModalOpen(false)}
                    onBillAdded={handleBillAdded}
                    preselectedCategory={category}
                    availableMonths={availableMonths}
                    selectedMonth={selectedMonth}
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
