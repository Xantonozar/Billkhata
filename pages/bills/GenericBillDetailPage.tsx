import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { api } from '../../services/api';
import type { Bill, PaymentStatus } from '../../types';
import { Role } from '../../types';
import { ArrowLeftIcon, HomeIcon, ElectricityIcon, WaterIcon, GasIcon, WifiIcon, MaidIcon, OtherIcon, UserCircleIcon, CheckCircleIcon, PencilIcon, TrashIcon } from '../../components/Icons';
import EditRentBillModal from '../../components/modals/EditRentBillModal';
import EditSharedBillModal from '../../components/modals/EditSharedBillModal';
import { useNotifications } from '../../contexts/NotificationContext';

const categoryIcons: Record<string, React.ReactElement> = {
    'Rent': <HomeIcon className="w-8 h-8 text-red-500" />,
    'Electricity': <ElectricityIcon className="w-8 h-8 text-yellow-500" />,
    'Water': <WaterIcon className="w-8 h-8 text-blue-500" />,
    'Gas': <GasIcon className="w-8 h-8 text-orange-500" />,
    'Wi-Fi': <WifiIcon className="w-8 h-8 text-cyan-500" />,
    'Maid': <MaidIcon className="w-8 h-8 text-purple-500" />,
    'Others': <OtherIcon className="w-8 h-8 text-slate-500" />,
};

const statusColors: Record<PaymentStatus, string> = {
    'Paid': 'text-success-600 dark:text-success-400',
    'Pending Approval': 'text-warning-600 dark:text-warning-400',
    'Unpaid': 'text-slate-800 dark:text-slate-200',
    'Overdue': 'text-danger-600 dark:text-danger-400',
};

interface GenericBillDetailPageProps {
  billId: string;
}

const GenericBillDetailPage: React.FC<GenericBillDetailPageProps> = ({ billId }) => {
    const { user, setPage } = useAuth();
    const [bill, setBill] = useState<Bill | null>(null);
    const [loading, setLoading] = useState(true);
    const [editingBill, setEditingBill] = useState<Bill | null>(null);
    const { addToast } = useNotifications();

    useEffect(() => {
        if (user?.khataId) {
            setLoading(true);
            api.getBillsForRoom(user.khataId).then(data => {
                const foundBill = data.find(b => b.id === billId);
                setBill(foundBill || null);
                setLoading(false);
            });
        }
    }, [user, billId]);
    
    const handlePayNow = () => {
        addToast({ type: 'info', title: 'Payment', message: 'Payment confirmation modal would appear here.' });
    };

    const handleBillUpdate = (updatedBill: Bill) => {
        setBill(updatedBill); // Update the state on the detail page
        addToast({
            type: 'success',
            title: 'Bill Updated',
            message: `The ${updatedBill.title} bill has been successfully updated.`,
        });
        setEditingBill(null); // Close the modal
    };

    const handleDelete = () => {
        if(bill && window.confirm(`Are you sure you want to delete the ${bill.title} bill?`)) {
            addToast({ type: 'error', title: 'Bill Deleted', message: 'This bill has been removed.' });
            setPage('bills-all');
        }
    }

    if (loading) return <div className="text-center p-8">Loading bill details...</div>;
    if (!bill) return <div className="text-center p-8">Bill not found. <button onClick={() => setPage('bills-all')} className="text-primary-600 underline">Go back</button></div>;
    if (!user) return null;

    const myShare = bill.shares.find(s => s.userId === user.id);
    const canPay = myShare?.status === 'Unpaid' || myShare?.status === 'Overdue';
    
    return (
        <>
            <div className="space-y-6 animate-fade-in">
                <div className="flex items-center gap-4">
                    <button onClick={() => setPage('bills-all')} className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-all active:scale-95">
                        <ArrowLeftIcon className="w-6 h-6 text-slate-600 dark:text-slate-300"/>
                    </button>
                    <div className="flex items-center gap-3">
                        {categoryIcons[bill.category]}
                        <h1 className="text-3xl font-bold text-slate-900 dark:text-white font-sans">{bill.title}</h1>
                    </div>
                </div>

                <div className="bg-white dark:bg-slate-800 rounded-xl shadow-md p-6">
                    <div className="flex flex-wrap justify-between items-start gap-4">
                        <div>
                            <p className="text-sm text-slate-500 dark:text-slate-400">Total Amount</p>
                            <p className="text-4xl font-bold text-primary-600 font-numeric">৳{bill.totalAmount.toFixed(2)}</p>
                            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Due Date: {bill.dueDate}</p>
                        </div>
                        {user.role === Role.Manager && (
                            <div className="flex items-center gap-2">
                                <button onClick={() => setEditingBill(bill)} className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-semibold border border-slate-300 dark:border-slate-600 rounded-md hover:bg-slate-100 dark:hover:bg-slate-700 transition-all active:scale-95"><PencilIcon className="w-4 h-4" /> Edit</button>
                                <button onClick={handleDelete} className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-semibold text-danger-600 bg-danger-500/10 rounded-md hover:bg-danger-500/20 transition-all active:scale-95"><TrashIcon className="w-4 h-4" /> Delete</button>
                            </div>
                        )}
                    </div>

                    {bill.description && <p className="mt-4 text-sm text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-700/50 p-3 rounded-md"><strong>Notes:</strong> {bill.description}</p>}
                    
                    <div className="border-t my-4 border-slate-200 dark:border-slate-700"></div>

                    {user.role === Role.Member && myShare && (
                        <div className="mb-6 p-4 bg-primary-50 dark:bg-primary-900/30 rounded-lg">
                            <h3 className="font-bold text-lg text-primary-700 dark:text-primary-300">Your Share</h3>
                            <div className="flex items-center justify-between mt-2">
                                <div>
                                    <p className="text-3xl font-bold text-slate-800 dark:text-white font-numeric">৳{myShare.amount.toFixed(2)}</p>
                                    <p className={`text-sm font-semibold ${statusColors[myShare.status]}`}>{myShare.status}</p>
                                </div>
                                {canPay && (
                                    <button 
                                        onClick={handlePayNow}
                                        className="px-6 py-2.5 text-white font-semibold rounded-md bg-gradient-success hover:shadow-lg transition-all active:scale-[0.98]"
                                    >
                                        Pay Now
                                    </button>
                                )}
                            </div>
                        </div>
                    )}


                    <h3 className="font-bold text-lg text-slate-800 dark:text-white mb-3">Payment Status ({bill.shares.length} Members)</h3>
                    <div className="space-y-3">
                        {bill.shares.map(share => (
                            <div key={share.userId} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                                <div className="flex items-center gap-3">
                                    <UserCircleIcon className="w-8 h-8 text-slate-400" />
                                    <div>
                                        <p className="font-semibold text-slate-800 dark:text-white">{share.userName}</p>
                                        <p className="text-sm text-slate-600 dark:text-slate-400 font-numeric">৳{share.amount.toFixed(2)}</p>
                                    </div>
                                </div>
                                <div className={`text-sm font-semibold flex items-center gap-1.5 ${statusColors[share.status]}`}>
                                    {share.status === 'Paid' ? <CheckCircleIcon className="w-5 h-5"/> : '⏳'}
                                    {share.status}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
            {editingBill && (
                editingBill.category === 'Rent' ? (
                    <EditRentBillModal
                        billToEdit={editingBill}
                        onClose={() => setEditingBill(null)}
                        onBillUpdated={handleBillUpdate}
                    />
                ) : (
                    <EditSharedBillModal
                        billToEdit={editingBill}
                        onClose={() => setEditingBill(null)}
                        onBillUpdated={handleBillUpdate}
                    />
                )
            )}
        </>
    );
};

export default GenericBillDetailPage;
