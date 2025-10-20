import React, { useState } from 'react';
import { UserCircleIcon } from '../Icons';
import { Role } from '../../types';

// Updated mock data to only contain members, not the manager.
const mockMembersForRent = [
    { id: '3', name: 'Priya Das', role: Role.Member, lastRent: 4500 },
    { id: '4', name: 'Ravi Islam', role: Role.Member, lastRent: 5000 },
    { id: '9', name: 'Amit Hossain', role: Role.Member, lastRent: 5200 },
];

interface PushRentBillsModalProps {
    onClose: () => void;
    onConfirm: (rentData: { userId: string; userName: string; amount: number }[]) => void;
}

const PushRentBillsModal: React.FC<PushRentBillsModalProps> = ({ onClose, onConfirm }) => {
    const [rents, setRents] = useState(
        mockMembersForRent.map(m => ({ userId: m.id, userName: m.name, amount: m.lastRent }))
    );

    const handleAmountChange = (userId: string, newAmount: string) => {
        const amount = parseInt(newAmount, 10) || 0;
        setRents(prevRents =>
            prevRents.map(r => (r.userId === userId ? { ...r, amount } : r))
        );
    };

    const totalRent = rents.reduce((sum, r) => sum + r.amount, 0);

    const handleSubmit = () => {
        onConfirm(rents);
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 animate-fade-in p-4" onClick={onClose}>
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl w-full max-w-lg animate-scale-in" onClick={e => e.stopPropagation()}>
                <div className="p-6 border-b dark:border-slate-700">
                    <h2 className="text-xl font-bold font-sans text-slate-900 dark:text-white">Push November Rent Bills</h2>
                    <p className="text-sm text-slate-500 dark:text-slate-400">Review amounts and confirm to create bills for all members.</p>
                </div>
                <div className="p-6 max-h-[60vh] overflow-y-auto space-y-4">
                    {rents.map(rent => (
                        <div key={rent.userId} className="flex items-center gap-4">
                            <UserCircleIcon className="w-10 h-10 text-slate-400 flex-shrink-0" />
                            <div className="flex-grow">
                                <p className="font-semibold text-slate-800 dark:text-white">{rent.userName}</p>
                                <p className="text-xs text-slate-500 dark:text-slate-400">Previous: ৳{mockMembersForRent.find(m => m.id === rent.userId)?.lastRent.toLocaleString()}</p>
                            </div>
                            <div className="relative">
                                <span className="absolute inset-y-0 left-3 flex items-center text-slate-500">৳</span>
                                <input
                                    type="number"
                                    value={rent.amount}
                                    onChange={(e) => handleAmountChange(rent.userId, e.target.value)}
                                    className="w-32 pl-8 pr-2 py-2 text-right bg-slate-100 dark:bg-slate-700 border-2 border-transparent rounded-lg focus:outline-none focus:border-primary-500 transition-colors"
                                />
                            </div>
                        </div>
                    ))}
                </div>
                <div className="p-6 bg-slate-50 dark:bg-slate-700/50 rounded-b-xl flex justify-between items-center">
                    <div>
                        <span className="font-semibold">Total: </span>
                        <span className="font-bold text-lg font-numeric">৳{totalRent.toLocaleString()}</span>
                    </div>
                    <div className="flex gap-3">
                        <button onClick={onClose} className="px-4 py-2 bg-slate-200 dark:bg-slate-600 font-semibold rounded-lg hover:bg-slate-300 dark:hover:bg-slate-500 transition-colors">Cancel</button>
                        <button onClick={handleSubmit} className="px-4 py-2 bg-primary-500 text-white font-semibold rounded-lg hover:bg-primary-600 transition-colors">Confirm & Push</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PushRentBillsModal;