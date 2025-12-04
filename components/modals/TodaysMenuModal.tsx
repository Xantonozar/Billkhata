import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNotifications } from '../../contexts/NotificationContext';
import { Role, TodaysMenu } from '../../types';
import { XIcon, PencilIcon, CheckCircleIcon } from '../Icons';

// Mock Data
const initialTodaysMenu: TodaysMenu = {
    breakfast: 'Paratha & Omelette',
    lunch: 'Chicken Curry, Rice, Salad',
    dinner: 'Veg Pulao, Raita',
};

interface TodaysMenuModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const TodaysMenuModal: React.FC<TodaysMenuModalProps> = ({ isOpen, onClose }) => {
    const { user } = useAuth();
    const { addToast } = useNotifications();
    const [menu, setMenu] = useState(initialTodaysMenu);
    const [editingMeal, setEditingMeal] = useState<keyof TodaysMenu | null>(null);
    const [editText, setEditText] = useState('');

    if (!isOpen) return null;

    const todayString = new Date().toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric'
    });

    const handleEditClick = (meal: keyof TodaysMenu) => {
        setEditingMeal(meal);
        setEditText(menu[meal]);
    };

    const handleSave = () => {
        if (editingMeal) {
            setMenu(prev => ({ ...prev, [editingMeal]: editText }));
            addToast({
                type: 'success',
                title: 'Menu Updated',
                message: `${editingMeal.charAt(0).toUpperCase() + editingMeal.slice(1)} menu has been updated.`,
            });
            setEditingMeal(null);
            setEditText('');
        }
    };
    
    const handleCancel = () => {
        setEditingMeal(null);
        setEditText('');
    };
    
    const renderMealRow = (meal: keyof TodaysMenu, label: string) => {
        if (user?.role === Role.Manager && editingMeal === meal) {
            return (
                <tr className="border-b dark:border-slate-700 bg-slate-50 dark:bg-slate-700/50">
                    <td className="p-3 font-semibold text-slate-800 dark:text-slate-100">{label}</td>
                    <td className="p-3">
                        <input
                            type="text"
                            value={editText}
                            onChange={(e) => setEditText(e.target.value)}
                            className="w-full px-2 py-1 bg-white dark:bg-slate-600 border-2 border-primary-500 rounded-md focus:outline-none"
                            autoFocus
                        />
                    </td>
                    <td className="p-3 text-right">
                        <div className="flex justify-end gap-2">
                            <button onClick={handleCancel} className="p-2 rounded-full text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-600"><XIcon className="w-5 h-5"/></button>
                            <button onClick={handleSave} className="p-2 rounded-full text-success-500 hover:bg-success-100 dark:hover:bg-success-500/20"><CheckCircleIcon className="w-5 h-5"/></button>
                        </div>
                    </td>
                </tr>
            );
        }

        return (
            <tr className="border-b dark:border-slate-700">
                <td className="p-3 font-semibold text-slate-800 dark:text-slate-100">{label}</td>
                <td className="p-3 text-slate-600 dark:text-slate-300">{menu[meal]}</td>
                {user?.role === Role.Manager && (
                    <td className="p-3 text-right">
                        <button onClick={() => handleEditClick(meal)} className="p-2 rounded-md hover:bg-slate-200 dark:hover:bg-slate-600">
                            <PencilIcon className="w-5 h-5 text-primary-500" />
                        </button>
                    </td>
                )}
            </tr>
        );
    };


    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 animate-fade-in p-4" onClick={onClose}>
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl p-6 w-full max-w-2xl" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center">
                    <h2 className="text-xl font-bold font-sans text-slate-900 dark:text-white">Today's Menu ({todayString})</h2>
                    <button onClick={onClose} className="p-1 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700"><XIcon className="w-5 h-5"/></button>
                </div>
                <div className="border-t my-4 border-slate-200 dark:border-slate-700"></div>

                <div className="overflow-x-auto">
                    <table className="w-full min-w-max text-sm text-left">
                        <thead>
                            <tr className="border-b dark:border-slate-700">
                                <th className="p-3 w-32">Meal</th>
                                <th className="p-3">What Will Be Cooked</th>
                                {user?.role === Role.Manager && <th className="p-3 text-right w-28">Edit</th>}
                            </tr>
                        </thead>
                        <tbody>
                            {renderMealRow('breakfast', 'Breakfast')}
                            {renderMealRow('lunch', 'Lunch')}
                            {renderMealRow('dinner', 'Dinner')}
                        </tbody>
                    </table>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-200 dark:border-slate-700 flex justify-end">
                    <button onClick={onClose} className="px-6 py-2 bg-slate-200 dark:bg-slate-600 font-semibold rounded-lg hover:bg-slate-300 dark:hover:bg-slate-500">Close</button>
                </div>
            </div>
        </div>
    );
};

export default TodaysMenuModal;