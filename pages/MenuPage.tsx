import React, { useState, useMemo } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Role } from '../types';
import { MenuBookIcon, PencilIcon, XIcon } from '../components/Icons';
import { useNotifications } from '../contexts/NotificationContext';

// Mock Data
const initialWeeklyMenu = [
    { day: 'Monday', breakfast: 'Paratha & Eggs', lunch: 'Chicken Curry', dinner: 'Veg Pulao' },
    { day: 'Tuesday', breakfast: 'Poha', lunch: 'Fish Fry', dinner: 'Dal Tadka' },
    { day: 'Wednesday', breakfast: 'Upma', lunch: 'Paneer Butter', dinner: 'Roti Sabzi' },
    { day: 'Thursday', breakfast: 'Bread & Jam', lunch: 'Rice & Lentils', dinner: 'Chicken Roast' },
    { day: 'Friday', breakfast: 'Idli Sambar', lunch: 'Egg Curry', dinner: 'Biryani' },
    { day: 'Saturday', breakfast: 'Chole Bhature', lunch: 'Mutton Masala', dinner: 'Noodles' },
    { day: 'Sunday', breakfast: 'Dosa & Chutney', lunch: 'Veg Biryani', dinner: 'Pasta' },
];

type Menu = typeof initialWeeklyMenu[0];

// Edit Modal Component
const EditMenuModal: React.FC<{
    editingDay: string | null;
    menuData: Menu[];
    onClose: () => void;
    onSave: (day: string, newMenu: Omit<Menu, 'day'>) => void;
    onSavePermanent: (newMenu: Menu[]) => void;
}> = ({ editingDay, menuData, onClose, onSave, onSavePermanent }) => {
    const isPermanentEdit = editingDay === 'Permanent';
    const dayData = useMemo(() => menuData.find(m => m.day === editingDay), [editingDay, menuData]);
    
    const [breakfast, setBreakfast] = useState(dayData?.breakfast || '');
    const [lunch, setLunch] = useState(dayData?.lunch || '');
    const [dinner, setDinner] = useState(dayData?.dinner || '');
    const { addToast } = useNotifications();

    const handleSave = () => {
        if (editingDay && !isPermanentEdit) {
            onSave(editingDay, { breakfast, lunch, dinner });
        }
        onClose();
    };

    const handleSavePermanent = () => {
        addToast({ type: 'info', title: 'Feature in Progress', message: 'Saving permanent menus will be available soon.' });
        onClose();
    };
    
    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 animate-fade-in p-4" onClick={onClose}>
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl p-6 w-full max-w-lg" onClick={e => e.stopPropagation()}>
                <h2 className="text-xl font-bold font-sans">
                    Edit Menu for: {isPermanentEdit ? "This Week's Menu" : editingDay}
                </h2>
                <div className="border-t my-4 border-gray-200 dark:border-gray-700"></div>
                
                <div className="space-y-4">
                    <div>
                        <label className="font-semibold text-gray-700 dark:text-gray-300">Breakfast:</label>
                        <input type="text" value={breakfast} onChange={e => setBreakfast(e.target.value)} className="w-full mt-1 px-3 py-2 bg-gray-100 dark:bg-gray-700 border-2 border-transparent rounded-lg focus:outline-none focus:border-primary transition-colors" />
                    </div>
                     <div>
                        <label className="font-semibold text-gray-700 dark:text-gray-300">Lunch:</label>
                        <input type="text" value={lunch} onChange={e => setLunch(e.target.value)} className="w-full mt-1 px-3 py-2 bg-gray-100 dark:bg-gray-700 border-2 border-transparent rounded-lg focus:outline-none focus:border-primary transition-colors" />
                    </div>
                     <div>
                        <label className="font-semibold text-gray-700 dark:text-gray-300">Dinner:</label>
                        <input type="text" value={dinner} onChange={e => setDinner(e.target.value)} className="w-full mt-1 px-3 py-2 bg-gray-100 dark:bg-gray-700 border-2 border-transparent rounded-lg focus:outline-none focus:border-primary transition-colors" />
                    </div>
                </div>

                <div className="flex flex-wrap gap-3 mt-6 justify-end">
                    <button onClick={onClose} className="px-4 py-2 bg-gray-200 dark:bg-gray-600 font-semibold rounded-lg hover:bg-gray-300 dark:hover:bg-gray-500">Cancel</button>
                    <button onClick={handleSave} className="px-4 py-2 bg-primary text-white font-semibold rounded-lg hover:bg-primary-600">Save Changes</button>
                    <button onClick={handleSavePermanent} className="px-4 py-2 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700">Save as Permanent</button>
                </div>
            </div>
        </div>
    );
};

// Main Page Component
const MenuPage: React.FC = () => {
    const { user } = useAuth();
    const { addToast } = useNotifications();
    const [weeklyMenu, setWeeklyMenu] = useState(initialWeeklyMenu);
    const [editingDay, setEditingDay] = useState<string | null>(null);
    
    const handleSaveMenu = (day: string, newMenu: Omit<Menu, 'day'>) => {
        setWeeklyMenu(currentMenu => 
            currentMenu.map(item => item.day === day ? { ...item, ...newMenu } : item)
        );
        addToast({ type: 'success', title: 'Menu Updated', message: `${day}'s menu has been saved for this week.` });
    };

    const handleSavePermanentMenu = (newMenu: Menu[]) => {
        // In a real app, this would be an API call
        addToast({ type: 'success', title: 'Permanent Menu Saved', message: 'The permanent menu has been updated.' });
    };
    
    return (
        <>
            <div className="space-y-6 animate-fade-in">
                <div className="flex items-center gap-4">
                    <MenuBookIcon className="w-8 h-8 text-primary" />
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">This Week's Menu</h1>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-4 overflow-x-auto">
                    <table className="w-full min-w-max text-sm text-left">
                        <thead className="border-b dark:border-gray-700">
                            <tr>
                                <th className="p-3">Day</th>
                                <th className="p-3">Breakfast</th>
                                <th className="p-3">Lunch</th>
                                <th className="p-3">Dinner</th>
                                {user?.role === Role.Manager && <th className="p-3 text-center">Edit</th>}
                            </tr>
                        </thead>
                        <tbody>
                            {weeklyMenu.map(item => (
                                <tr key={item.day} className="border-b dark:border-gray-700 last:border-b-0 hover:bg-gray-50 dark:hover:bg-gray-700/50">
                                    <td className="p-3 font-semibold text-gray-800 dark:text-gray-100">{item.day}</td>
                                    <td className="p-3 text-gray-600 dark:text-gray-300">{item.breakfast}</td>
                                    <td className="p-3 text-gray-600 dark:text-gray-300">{item.lunch}</td>
                                    <td className="p-3 text-gray-600 dark:text-gray-300">{item.dinner}</td>
                                    {user?.role === Role.Manager && (
                                        <td className="p-3 text-center">
                                            <button onClick={() => setEditingDay(item.day)} className="p-1 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600">
                                                <PencilIcon className="w-5 h-5 text-primary" />
                                            </button>
                                        </td>
                                    )}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {user?.role === Role.Manager && (
                        <div className="mt-4 pt-4 border-t dark:border-gray-700 text-right">
                            <button onClick={() => setEditingDay('Permanent')} className="px-4 py-2 text-sm font-semibold bg-primary-100 text-primary dark:bg-primary-500/20 rounded-md hover:bg-primary-200 dark:hover:bg-primary-500/30">
                                Edit Permanent Menu
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {editingDay && (
                <EditMenuModal
                    editingDay={editingDay}
                    menuData={weeklyMenu}
                    onClose={() => setEditingDay(null)}
                    onSave={handleSaveMenu}
                    onSavePermanent={handleSavePermanentMenu}
                />
            )}
        </>
    );
};

export default MenuPage;
