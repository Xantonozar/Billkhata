import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { ArrowLeftIcon, CheckCircleIcon, XIcon } from '../../components/Icons';
import { api } from '../../services/api';
import { useNotifications } from '../../contexts/NotificationContext';
import { Bill, BillShare } from '../../types';

interface GenericBillDetailPageProps {
    billId: string;
}

const GenericBillDetailPage: React.FC<GenericBillDetailPageProps> = ({ billId }) => {
    const { setPage, user } = useAuth();
    const [bill, setBill] = useState<Bill | null>(null);
    const [loading, setLoading] = useState(true);
    const { addToast } = useNotifications();

    useEffect(() => {
        const fetchBill = async () => {
            if (!user?.khataId) return;
            try {
                const bills = await api.getBillsForRoom(user.khataId);
                const foundBill = bills.find(b => b.id === billId);
                setBill(foundBill || null);
            } catch (error) {
                console.error('Error fetching bill details:', error);
                addToast({ type: 'error', title: 'Error', message: 'Failed to load bill details' });
            } finally {
                setLoading(false);
            }
        };
        fetchBill();
    }, [billId, user?.khataId]);

    if (loading) return <div className="p-8 text-center">Loading bill details...</div>;
    if (!bill) return <div className="p-8 text-center">Bill not found</div>;

    const totalPaid = bill.shares.filter(s => s.status === 'Paid').reduce((sum, s) => sum + s.amount, 0);
    const progress = (totalPaid / bill.totalAmount) * 100;

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="flex items-center gap-4">
                <button onClick={() => setPage('bills')} className="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
                    <ArrowLeftIcon className="w-6 h-6 text-slate-600 dark:text-slate-300" />
                </button>
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{bill.title}</h1>
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-md p-6">
                <div className="flex justify-between items-start mb-6">
                    <div>
                        <p className="text-sm text-slate-500 dark:text-slate-400">Total Amount</p>
                        <p className="text-3xl font-bold text-primary-600 font-numeric">৳{bill.totalAmount.toFixed(2)}</p>
                    </div>
                    <div className="text-right">
                        <p className="text-sm text-slate-500 dark:text-slate-400">Due Date</p>
                        <p className="font-semibold text-slate-800 dark:text-white">{new Date(bill.dueDate).toLocaleDateString()}</p>
                    </div>
                </div>

                <div className="mb-6">
                    <div className="flex justify-between text-sm mb-2">
                        <span className="text-slate-600 dark:text-slate-300">Payment Progress</span>
                        <span className="font-semibold text-slate-800 dark:text-white">{Math.round(progress)}%</span>
                    </div>
                    <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2.5">
                        <div className="bg-success-500 h-2.5 rounded-full transition-all duration-500" style={{ width: `${progress}%` }}></div>
                    </div>
                </div>

                <h3 className="font-bold text-lg mb-4 text-slate-800 dark:text-white">Share Details</h3>
                <div className="space-y-3">
                    {bill.shares.map(share => (
                        <div key={share.userId} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                            <div className="flex items-center gap-3">
                                <div className={`w-2 h-2 rounded-full ${share.status === 'Paid' ? 'bg-success-500' : share.status === 'Pending Approval' ? 'bg-warning-500' : 'bg-danger-500'}`}></div>
                                <span className="font-medium text-slate-700 dark:text-slate-200">{share.userName}</span>
                            </div>
                            <div className="flex items-center gap-4">
                                <span className="font-numeric font-semibold text-slate-700 dark:text-slate-200">৳{share.amount.toFixed(2)}</span>
                                <span className={`text-xs px-2 py-1 rounded-full font-semibold ${share.status === 'Paid' ? 'bg-success-100 text-success-700 dark:bg-success-900/30 dark:text-success-400' :
                                        share.status === 'Pending Approval' ? 'bg-warning-100 text-warning-700 dark:bg-warning-900/30 dark:text-warning-400' :
                                            'bg-danger-100 text-danger-700 dark:bg-danger-900/30 dark:text-danger-400'
                                    }`}>
                                    {share.status}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default GenericBillDetailPage;

