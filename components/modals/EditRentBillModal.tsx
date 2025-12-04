import React, { useState } from 'react';
import { Bill } from '../../types';
import { UserCircleIcon } from '../Icons';

interface EditRentBillModalProps {
    billToEdit: Bill;
    onClose: () => void;
    onBillUpdated: (updatedBill: Bill) => void;
}

const EditRentBillModal: React.FC<EditRentBillModalProps> = ({ billToEdit, onClose, onBillUpdated }) => {
    const memberShare = billToEdit.shares[0];
    const [amount, setAmount] = useState(memberShare.amount);

    const handleSave = () => {
        const updatedBill: Bill = {
            ...billToEdit,
            totalAmount: amount,
            shares: [
                {
                    ...memberShare,
                    amount: amount,
                },
            ],
        };
        onBillUpdated(updatedBill);
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 animate-fade-in p-4" onClick={onClose}>
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl w-full max-w-sm animate-scale-in" onClick={e => e.stopPropagation()}>
                <div className="p-6 border-b dark:border-slate-700">
                    <h2 className="text-xl font-bold font-sans text-slate-900 dark:text-white">Edit Rent</h2>
                    <p className="text-sm text-slate-500 dark:text-slate-400">Update the rent amount for {memberShare.userName}.</p>
                </div>
                <div className="p-6 space-y-4">
                    <div className="flex items-center gap-4 p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                        <UserCircleIcon className="w-10 h-10 text-slate-400 flex-shrink-0" />
                        <p className="font-semibold text-slate-800 dark:text-white text-lg">{memberShare.userName}</p>
                    </div>
                    <div>
                        <label htmlFor="rent-amount" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Rent Amount</label>
                        <div className="relative">
                            <span className="absolute inset-y-0 left-3 flex items-center text-slate-500">৳</span>
                            <input
                                id="rent-amount"
                                type="number"
                                value={amount}
                                onChange={(e) => setAmount(parseFloat(e.target.value) || 0)}
                                className="w-full pl-8 pr-4 py-2 text-lg font-semibold bg-slate-100 dark:bg-slate-700 border-2 border-transparent rounded-lg focus:outline-none focus:border-primary-500 transition-colors"
                            />
                        </div>
                    </div>
                </div>
                <div className="p-6 bg-slate-50 dark:bg-slate-700/50 rounded-b-xl flex justify-end gap-3">
                    <button type="button" onClick={onClose} className="px-4 py-2 bg-slate-200 dark:bg-slate-600 font-semibold rounded-lg hover:bg-slate-300 dark:hover:bg-slate-500 transition-colors">Cancel</button>
                    <button type="button" onClick={handleSave} className="px-4 py-2 bg-primary-500 text-white font-semibold rounded-lg hover:bg-primary-600 transition-colors">Confirm</button>
                </div>
            </div>
        </div>
    );
};

export default EditRentBillModal;