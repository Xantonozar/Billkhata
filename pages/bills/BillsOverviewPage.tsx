import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { api } from '../../services/api';
import type { Bill, PaymentStatus } from '../../types';
import { Role } from '../../types';
import { HomeIcon, ElectricityIcon, WaterIcon, GasIcon, WifiIcon, MaidIcon, OtherIcon } from '../../components/Icons';

const statusColors: Record<PaymentStatus, string> = {
    'Paid': 'bg-success/10 text-success-dark dark:text-success-light',
    'Pending Approval': 'bg-warning/10 text-warning-dark dark:text-warning-light',
    'Unpaid': 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200',
    'Overdue': 'bg-danger/10 text-danger-dark dark:text-danger-light',
};

const categoryIcons: Record<string, React.ReactElement> = {
    'Rent': <HomeIcon className="w-6 h-6 text-danger" />,
    'Electricity': <ElectricityIcon className="w-6 h-6 text-yellow-500" />,
    'Water': <WaterIcon className="w-6 h-6 text-blue-500" />,
    'Gas': <GasIcon className="w-6 h-6 text-orange-500" />,
    'Wi-Fi': <WifiIcon className="w-6 h-6 text-cyan-500" />,
    'Maid': <MaidIcon className="w-6 h-6 text-purple-500" />,
    'Others': <OtherIcon className="w-6 h-6 text-gray-500" />,
};


const BillsOverviewPage: React.FC = () => {
    const { user, setPage } = useAuth();
    const [bills, setBills] = useState<Bill[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (user?.khataId) {
            setLoading(true);
            api.getBillsForRoom(user.khataId).then(data => {
                setBills(data);
                setLoading(false);
            });
        }
    }, [user]);

    const monthSummary = useMemo(() => {
        const userBills = bills.flatMap(b => b.shares.filter(s => s.userId === user?.id));
        const totalShare = userBills.reduce((acc, share) => acc + share.amount, 0);
        const paidShare = userBills.filter(s => s.status === 'Paid').reduce((acc, share) => acc + share.amount, 0);
        const dueShare = totalShare - paidShare;
        return { totalShare, paidShare, dueShare };
    }, [bills, user]);

    const billsByCategory = useMemo(() => {
        return bills.reduce<Record<string, Bill[]>>((acc, bill) => {
            (acc[bill.category] = acc[bill.category] || []).push(bill);
            return acc;
        }, {});
    }, [bills]);

    if (loading) {
        return <div className="text-center p-8">Loading...</div>;
    }
    
    if (!user) return null;

    return (
        <div className="space-y-6">
             <h1 className="text-3xl font-bold text-gray-900 dark:text-white font-sans">Bills Overview</h1>
            
            {/* This Month Summary Card */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md">
                 <h2 className="text-xl font-bold font-sans text-gray-800 dark:text-white mb-4">This Month Summary</h2>
                 <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
                    <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Total Bills</p>
                        <p className="text-2xl font-bold text-gray-800 dark:text-white font-numeric">৳{monthSummary.totalShare.toFixed(2)}</p>
                    </div>
                     <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Paid</p>
                        <p className="text-2xl font-bold text-success-dark dark:text-success-light font-numeric">৳{monthSummary.paidShare.toFixed(2)}</p>
                    </div>
                     <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Due</p>
                        <p className="text-2xl font-bold text-danger-dark dark:text-danger-light font-numeric">৳{monthSummary.dueShare.toFixed(2)}</p>
                    </div>
                 </div>
            </div>

            {/* Bill Category Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {Object.entries(billsByCategory).map(([category, categoryBills]) => {
                    const totalAmount = categoryBills.reduce((sum, bill) => sum + bill.totalAmount, 0);
                    const yourShare = categoryBills.flatMap(b => b.shares).filter(s => s.userId === user.id).reduce((sum, s) => sum + s.amount, 0);
                    const latestBill = categoryBills.sort((a,b) => new Date(b.dueDate).getTime() - new Date(a.dueDate).getTime())[0];
                    const myShareDetails = latestBill?.shares.find(s => s.userId === user.id);

                    return (
                        <div key={category} className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-5 flex flex-col justify-between transition-all hover:shadow-lg hover:scale-[1.02]">
                            <div>
                                <div className="flex items-center gap-3 mb-3">
                                    {categoryIcons[category] || <OtherIcon className="w-6 h-6 text-gray-500" />}
                                    <h3 className="text-xl font-bold font-sans text-gray-900 dark:text-white">{category}</h3>
                                </div>
                                <p className="text-sm text-gray-500 dark:text-gray-400">Total: <span className="font-semibold font-numeric">৳{totalAmount.toFixed(2)}</span></p>
                                <p className="text-sm text-gray-500 dark:text-gray-400">Your Share: <span className="font-semibold font-numeric">৳{yourShare.toFixed(2)}</span></p>
                                {myShareDetails && (
                                     <div className="mt-2">
                                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${statusColors[myShareDetails.status]}`}>
                                            {myShareDetails.status}
                                        </span>
                                     </div>
                                )}
                                {latestBill && <p className="text-xs text-gray-400 mt-2">Last due: {latestBill.dueDate}</p>}
                            </div>
                            <button
                                onClick={() => setPage(`bills-${category.toLowerCase().replace(' ', '-')}` as any)}
                                className="mt-4 text-sm font-semibold text-primary hover:underline self-start"
                            >
                                View Details →
                            </button>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default BillsOverviewPage;