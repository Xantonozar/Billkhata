import React, { useState, useMemo, useEffect } from 'react';
import { Bill, BillShare, Role } from '../../types';
import { XIcon, CameraIcon } from '../Icons';
import { useNotifications } from '../../contexts/NotificationContext';
// FIX: Import useAuth to access user information like khataId.
import { useAuth } from '../../contexts/AuthContext';

// Consistent mock data of all users. Logic will filter this list.
const mockUsers = [
    { id: '1', name: 'Alice Manager', role: Role.Manager },
    { id: '3', name: 'Priya Das', role: Role.Member },
    { id: '4', name: 'Ravi Islam', role: Role.Member },
    { id: '9', name: 'Amit Hossain', role: Role.Member },
    { id: '2', name: 'Bob Member', role: Role.Member },
    { id: '8', name: 'John Doe', role: Role.Member },
];

interface AddBillModalProps {
    onClose: () => void;
    onBillAdded: (newBill: Bill) => void;
    preselectedCategory?: string;
    availableMonths?: string[];
    selectedMonth?: string;
}

const AddBillModal: React.FC<AddBillModalProps> = ({ onClose, onBillAdded, preselectedCategory, availableMonths, selectedMonth }) => {
    const { user } = useAuth();
    const [title, setTitle] = useState('');
    const [category, setCategory] = useState(preselectedCategory || 'Electricity');
    const [totalAmount, setTotalAmount] = useState<number | ''>('');
    const [description, setDescription] = useState('');
    const [splitType, setSplitType] = useState<'equally' | 'custom'>('equally');
    
    // Display only members for selection
    const membersToDisplay = useMemo(() => mockUsers.filter(u => u.role === Role.Member), []);
    
    const [selectedMembers, setSelectedMembers] = useState<string[]>(membersToDisplay.map(m => m.id));
    const [customAmounts, setCustomAmounts] = useState<Record<string, number>>({});
    const { addToast } = useNotifications();

    const getInitialDateForMonth = (monthString?: string) => {
        if (monthString) {
            try {
                const [monthStr, yearStr] = monthString.split(' ');
                const year = parseInt(yearStr, 10);
                const monthIndex = new Date(Date.parse(monthStr +" 1, 2012")).getMonth();
                const defaultDate = new Date(year, monthIndex, 1);
                return defaultDate.toISOString().split('T')[0];
            } catch (e) {
                 return new Date().toISOString().split('T')[0];
            }
        }
        return new Date().toISOString().split('T')[0];
    };

    const [currentMonth, setCurrentMonth] = useState(selectedMonth || (availableMonths ? availableMonths[0] : ''));
    const [dueDate, setDueDate] = useState(getInitialDateForMonth(selectedMonth));

    const handleMonthChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const newMonth = e.target.value;
        setCurrentMonth(newMonth);

        const [monthStr, yearStr] = newMonth.split(' ');
        const year = parseInt(yearStr, 10);
        const monthIndex = new Date(Date.parse(monthStr + " 1, 2012")).getMonth();
        
        const newDate = new Date(year, monthIndex, 1);
        setDueDate(newDate.toISOString().split('T')[0]);
    };

    const handleMemberToggle = (memberId: string) => {
        const newSelected = selectedMembers.includes(memberId)
            ? selectedMembers.filter(id => id !== memberId)
            : [...selectedMembers, memberId];
        setSelectedMembers(newSelected);
    };

    const handleCustomAmountChange = (memberId: string, value: string) => {
        const amount = parseFloat(value) || 0;
        setCustomAmounts(prev => ({ ...prev, [memberId]: amount }));
    };

    const customTotal = useMemo(() => {
        return selectedMembers.reduce((sum, memberId) => sum + (customAmounts[memberId] || 0), 0);
    }, [customAmounts, selectedMembers]);

    const isCustomTotalValid = Math.abs(customTotal - (totalAmount || 0)) < 0.01;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (totalAmount === '' || totalAmount <= 0) {
            addToast({ type: 'error', title: 'Invalid Amount', message: 'Please enter a valid total amount.' });
            return;
        }
        if (selectedMembers.length === 0) {
             addToast({ type: 'error', title: 'No Members Selected', message: 'Please select at least one member to split the bill.' });
            return;
        }
        if (splitType === 'custom' && !isCustomTotalValid) {
            addToast({ type: 'error', title: 'Invalid Amounts', message: 'Custom split amounts must add up to the total bill amount.' });
            return;
        }
        if (!user) {
            addToast({ type: 'error', title: 'Error', message: 'You must be logged in to add a bill.' });
            return;
        }

        const newShares: BillShare[] = selectedMembers.map(memberId => {
            const member = membersToDisplay.find(m => m.id === memberId);
            const amount = splitType === 'equally'
                ? totalAmount / selectedMembers.length
                : customAmounts[memberId] || 0;
            
            return {
                userId: memberId,
                userName: member!.name,
                amount: parseFloat(amount.toFixed(2)),
                status: 'Unpaid',
            };
        });

        const newBill: Bill = {
            id: `bill-${Date.now()}`,
            // FIX: The 'khataId' property was missing, causing a type error.
            khataId: user.khataId!,
            title,
            category,
            totalAmount,
            dueDate,
            description,
            shares: newShares,
            // FIX: Replaced mock manager ID with the actual user's ID.
            createdBy: user.id,
        };

        onBillAdded(newBill);
        onClose();
    };
    
    const renderMemberSplits = () => {
        if (selectedMembers.length === 0) {
            return <p className="text-sm text-slate-500 text-center">Select members to split the bill.</p>;
        }

        if (splitType === 'equally') {
            const splitAmount = (totalAmount || 0) / selectedMembers.length;
            return <p className="text-center font-semibold">৳{splitAmount.toFixed(2)} per person</p>;
        }

        return (
            <div className="space-y-2">
                {selectedMembers.map(memberId => {
                    const member = membersToDisplay.find(m => m.id === memberId);
                    return (
                        <div key={memberId} className="flex items-center justify-between gap-2">
                            <span className="text-sm">{member?.name}</span>
                            <div className="relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">৳</span>
                                <input
                                    type="number"
                                    step="0.01"
                                    placeholder="0.00"
                                    value={customAmounts[memberId] || ''}
                                    onChange={(e) => handleCustomAmountChange(memberId, e.target.value)}
                                    className="w-28 pl-7 pr-2 py-1 text-right bg-slate-100 dark:bg-slate-700 border-2 border-transparent rounded-md focus:outline-none focus:border-primary-500"
                                />
                            </div>
                        </div>
                    );
                })}
                 <div className={`mt-2 pt-2 border-t dark:border-slate-600 flex justify-between font-semibold ${isCustomTotalValid ? 'text-success-600' : 'text-danger-600'}`}>
                    <span>Total Custom:</span>
                    <span>৳{customTotal.toFixed(2)}</span>
                </div>
            </div>
        );
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 animate-fade-in p-4" onClick={onClose}>
            <form onSubmit={handleSubmit} className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl w-full max-w-lg animate-scale-in" onClick={e => e.stopPropagation()}>
                 <div className="p-6 border-b dark:border-slate-700 flex justify-between items-center">
                    <h2 className="text-xl font-bold font-sans text-slate-900 dark:text-white">Add New Bill</h2>
                    <button type="button" onClick={onClose} className="p-1 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700"><XIcon className="w-5 h-5"/></button>
                </div>
                
                <div className="p-6 max-h-[60vh] overflow-y-auto space-y-4 text-sm">
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="md:col-span-2">
                            <label className="font-semibold text-slate-700 dark:text-slate-300">Title</label>
                            <input type="text" placeholder="e.g., October Electricity" value={title} onChange={e => setTitle(e.target.value)} className="w-full mt-1 px-3 py-2 bg-slate-100 dark:bg-slate-700 border-2 border-transparent rounded-lg focus:outline-none focus:border-primary-500" required/>
                        </div>
                        <div>
                            <label className="font-semibold text-slate-700 dark:text-slate-300">Category</label>
                            <select value={category} onChange={e => setCategory(e.target.value)} className="w-full mt-1 px-3 py-2 bg-slate-100 dark:bg-slate-700 border-2 border-transparent rounded-lg focus:outline-none focus:border-primary-500" required>
                                 {['Electricity', 'Water', 'Gas', 'Wi-Fi', 'Maid', 'Others'].map(cat => <option key={cat} value={cat}>{cat}</option>)}
                            </select>
                        </div>
                        {availableMonths && availableMonths.length > 0 && (
                            <div>
                                <label className="font-semibold text-slate-700 dark:text-slate-300">Month</label>
                                <select value={currentMonth} onChange={handleMonthChange} className="w-full mt-1 px-3 py-2 bg-slate-100 dark:bg-slate-700 border-2 border-transparent rounded-lg focus:outline-none focus:border-primary-500" required>
                                    {availableMonths.map(month => <option key={month} value={month}>{month}</option>)}
                                </select>
                            </div>
                        )}
                        <div>
                            <label className="font-semibold text-slate-700 dark:text-slate-300">Total Amount</label>
                            <input type="number" step="0.01" value={totalAmount} onChange={e => setTotalAmount(parseFloat(e.target.value) || '')} className="w-full mt-1 px-3 py-2 bg-slate-100 dark:bg-slate-700 border-2 border-transparent rounded-lg focus:outline-none focus:border-primary-500" required/>
                        </div>
                         <div>
                            <label className="font-semibold text-slate-700 dark:text-slate-300">Due Date</label>
                            <input type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} className="w-full mt-1 px-3 py-2 bg-slate-100 dark:bg-slate-700 border-2 border-transparent rounded-lg focus:outline-none focus:border-primary-500" required/>
                        </div>
                    </div>
                     <div>
                         <label className="font-semibold text-slate-700 dark:text-slate-300">Description (Optional)</label>
                         <textarea value={description} onChange={e => setDescription(e.target.value)} rows={2} className="w-full mt-1 px-3 py-2 bg-slate-100 dark:bg-slate-700 border-2 border-transparent rounded-lg focus:outline-none focus:border-primary-500" />
                    </div>
                     <div>
                        <label className="font-semibold text-slate-700 dark:text-slate-300">Receipt Image (Optional)</label>
                        <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-slate-300 dark:border-slate-600 border-dashed rounded-md">
                            <div className="space-y-1 text-center">
                                <CameraIcon className="mx-auto h-12 w-12 text-slate-400" />
                                <div className="flex text-sm text-slate-600 dark:text-slate-400">
                                    <label htmlFor="file-upload" className="relative cursor-pointer bg-white dark:bg-slate-800 rounded-md font-medium text-primary-600 hover:text-primary-500">
                                        <span>Upload a file</span>
                                        <input id="file-upload" name="file-upload" type="file" className="sr-only" />
                                    </label>
                                    <p className="pl-1">or drag and drop</p>
                                </div>
                                <p className="text-xs text-slate-500 dark:text-slate-500">PNG, JPG, GIF up to 10MB</p>
                            </div>
                        </div>
                    </div>
                    <div className="border-t pt-4 dark:border-slate-600">
                        <h3 className="font-bold text-slate-800 dark:text-white">Split Bill With</h3>
                        <div className="mt-2 grid grid-cols-2 gap-2">
                             {membersToDisplay.map(member => (
                                <label key={member.id} className="flex items-center gap-3 p-2 rounded-md hover:bg-slate-100 dark:hover:bg-slate-700/50 cursor-pointer">
                                    <input type="checkbox" checked={selectedMembers.includes(member.id)} onChange={() => handleMemberToggle(member.id)} className="h-5 w-5 rounded border-slate-300 text-primary-600 focus:ring-primary-500" />
                                    <span>{member.name}</span>
                                </label>
                            ))}
                        </div>
                    </div>
                    {selectedMembers.length > 0 && (
                         <div className="border-t pt-4 dark:border-slate-600">
                             <h3 className="font-bold text-slate-800 dark:text-white">Split Method</h3>
                             <div className="mt-2 flex gap-2 p-1 bg-slate-100 dark:bg-slate-700 rounded-lg">
                                 <button type="button" onClick={() => setSplitType('equally')} className={`flex-1 py-1.5 text-sm font-semibold rounded-md ${splitType === 'equally' ? 'bg-white dark:bg-slate-600 shadow' : ''}`}>Split Equally</button>
                                 <button type="button" onClick={() => setSplitType('custom')} className={`flex-1 py-1.5 text-sm font-semibold rounded-md ${splitType === 'custom' ? 'bg-white dark:bg-slate-600 shadow' : ''}`}>Custom Amount</button>
                             </div>
                             <div className="mt-4 p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                                {renderMemberSplits()}
                            </div>
                         </div>
                    )}

                </div>

                <div className="p-6 bg-slate-50 dark:bg-slate-700/50 rounded-b-xl flex justify-end gap-3">
                    <button type="button" onClick={onClose} className="px-4 py-2 bg-slate-200 dark:bg-slate-600 font-semibold rounded-lg hover:bg-slate-300 dark:hover:bg-slate-500">Cancel</button>
                    <button type="submit" className="px-4 py-2 bg-primary-500 text-white font-semibold rounded-lg hover:bg-primary-600">Add Bill</button>
                </div>
            </form>
        </div>
    );
};

export default AddBillModal;