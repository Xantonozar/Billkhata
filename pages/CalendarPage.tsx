import React, { useState, useMemo } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Role } from '../types';
import { CalendarIcon, XIcon, PencilIcon } from '../components/Icons';
import { useNotifications } from '../contexts/NotificationContext';

const COST_PER_QUANTITY = 45.50;

// Mock data for calendar views
const memberMealData: { [day: number]: number } = { 1: 3, 2: 2, 3: 3, 4: 2, 5: 3, 6: 2, 7: 3, 8: 1 };
const managerMealData: { [day: number]: number } = { 1: 22, 2: 19, 3: 21, 4: 18, 5: 24, 6: 20, 7: 19, 8: 20 };
const managerDayDetails = {
    total: 20,
    breakfast: [
        { name: 'Raj Kumar', qty: 1.0 }, { name: 'Amit Hossain', qty: 0.5 }, { name: 'Priya Das', qty: 1.0 }, { name: 'Ravi Islam', qty: 1.0 }
    ],
    lunch: [
        { name: 'Raj Kumar', qty: 0.5 }, { name: 'Amit Hossain', qty: 1.0 }, { name: 'Priya Das', qty: 1.0 }, { name: 'Ravi Islam', qty: 1.0 }
    ],
    dinner: [
        { name: 'Raj Kumar', qty: 0.0 }, { name: 'Amit Hossain', qty: 0.5 }, { name: 'Priya Das', qty: 1.0 }, { name: 'Ravi Islam', qty: 1.0 }
    ]
};


// --- MODALS ---

interface LogMealsModalProps {
    date: Date;
    onClose: () => void;
    onSubmit: (data: any) => void;
}
const LogMealsModal: React.FC<LogMealsModalProps> = ({ date, onClose, onSubmit }) => {
    const [meals, setMeals] = useState({ breakfast: 1, lunch: 0.5, dinner: 0 });
    const [notes, setNotes] = useState('');
    const totalMeals = meals.breakfast + meals.lunch + meals.dinner;
    const totalCost = totalMeals * COST_PER_QUANTITY;

    const handleSubmit = () => {
        onSubmit({ date, meals, notes, totalMeals });
        onClose();
    };

    const MealRadioSelector: React.FC<{ label: string, icon: string, value: number, onChange: (val: number) => void }> = ({ label, icon, value, onChange }) => (
        <div>
            <label className="font-semibold text-lg">{icon} {label}</label>
            <div className="flex items-center gap-x-4 mt-2">
                {[0, 0.5, 1].map(q => (
                    <label key={q} className="flex items-center gap-2 cursor-pointer">
                        <input type="radio" name={label} value={q} checked={value === q} onChange={() => onChange(q)} className="w-5 h-5 text-primary focus:ring-primary" />
                        <span>{q}</span>
                    </label>
                ))}
            </div>
        </div>
    );

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 animate-fade-in p-4" onClick={onClose}>
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl p-6 w-full max-w-sm" onClick={e => e.stopPropagation()}>
                <h2 className="text-xl font-bold font-sans">Log Meals - {date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</h2>
                <div className="border-t my-4 border-gray-200 dark:border-gray-700"></div>
                
                <div className="space-y-4">
                    <MealRadioSelector label="Breakfast" icon="☕" value={meals.breakfast} onChange={v => setMeals(p => ({...p, breakfast: v}))} />
                    <MealRadioSelector label="Lunch" icon="🍛" value={meals.lunch} onChange={v => setMeals(p => ({...p, lunch: v}))} />
                    <MealRadioSelector label="Dinner" icon="🍜" value={meals.dinner} onChange={v => setMeals(p => ({...p, dinner: v}))} />
                </div>

                <div className="border-t my-4 border-gray-200 dark:border-gray-700"></div>
                <div className="text-center font-semibold">
                    <p>Total: {totalMeals} meals</p>
                    <p>Cost: ₹{totalCost.toFixed(2)} (@ ₹{COST_PER_QUANTITY.toFixed(2)}/meal)</p>
                </div>
                <div className="border-t my-4 border-gray-200 dark:border-gray-700"></div>

                <div>
                    <label className="font-semibold text-sm">Notes (optional):</label>
                    <input type="text" value={notes} onChange={e => setNotes(e.target.value)} className="w-full mt-1 px-3 py-2 bg-gray-100 dark:bg-gray-700 border-2 border-transparent rounded-lg focus:outline-none focus:border-primary transition-colors" />
                </div>

                <div className="flex gap-3 mt-6">
                    <button onClick={onClose} className="flex-1 py-2.5 bg-gray-200 dark:bg-gray-600 font-semibold rounded-lg hover:bg-gray-300 dark:hover:bg-gray-500">Cancel</button>
                    <button onClick={handleSubmit} className="flex-1 py-2.5 bg-primary text-white font-semibold rounded-lg hover:bg-primary-600">Save Entry</button>
                </div>
            </div>
        </div>
    );
};


interface ManageMealsModalProps {
    date: Date;
    onClose: () => void;
}
const ManageMealsModal: React.FC<ManageMealsModalProps> = ({ date, onClose }) => {
    
    const MealTable: React.FC<{ title: string, data: { name: string, qty: number }[] }> = ({ title, data }) => (
        <div>
            <h3 className="font-bold text-lg mb-2">{title}</h3>
            <div className="border rounded-lg overflow-hidden dark:border-gray-700">
                <div className="grid grid-cols-3 bg-gray-50 dark:bg-gray-700/50 p-2 font-semibold text-sm">
                    <div>Member Name</div>
                    <div className="text-center">Quantity</div>
                    <div className="text-right">Edit</div>
                </div>
                {data.map(member => (
                    <div key={member.name} className="grid grid-cols-3 p-2 border-t dark:border-gray-700 items-center">
                        <div>{member.name}</div>
                        <div className="text-center">{member.qty.toFixed(1)}</div>
                        <div className="text-right"><button className="text-primary hover:underline"><PencilIcon className="w-4 h-4 inline"/></button></div>
                    </div>
                ))}
            </div>
        </div>
    );

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 animate-fade-in p-4" onClick={onClose}>
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
                 <div className="flex justify-between items-center">
                    <h2 className="text-xl font-bold font-sans">Meals - {date.toLocaleDateString('en-US', { weekday: 'long', day: 'numeric' })} (Total: {managerDayDetails.total} Meals)</h2>
                    <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700"><XIcon className="w-5 h-5"/></button>
                </div>
                <div className="border-t my-4 border-gray-200 dark:border-gray-700"></div>
                <div className="space-y-6">
                    <MealTable title="🥣 Breakfast" data={managerDayDetails.breakfast} />
                    <MealTable title="🍛 Lunch" data={managerDayDetails.lunch} />
                    <MealTable title="🍜 Dinner" data={managerDayDetails.dinner} />
                </div>
            </div>
        </div>
    );
};


// --- MAIN PAGE ---
const CalendarPage: React.FC = () => {
    const { user } = useAuth();
    const { addToast } = useNotifications();
    const [currentDate, setCurrentDate] = useState(new Date(2025, 9, 8)); // October 8, 2025
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);

    const handlePrevMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
    const handleNextMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));

    const handleSubmitMealEntry = (data: any) => {
        addToast({ type: 'success', title: 'Entry Sent', message: 'Your meal entry has been sent to the manager for approval.' });
    };

    const calendarGrid = useMemo(() => {
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();
        const firstDay = new Date(year, month, 1).getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        const today = new Date();
        
        const data = user?.role === Role.Manager ? managerMealData : memberMealData;

        let days = [];
        for (let i = 0; i < firstDay; i++) {
            days.push(<div key={`empty-${i}`} className="border-r border-b border-gray-200 dark:border-gray-700"></div>);
        }

        for (let day = 1; day <= daysInMonth; day++) {
            const isToday = today.getFullYear() === year && today.getMonth() === month && today.getDate() === day;
            const mealCount = data[day];
            
            days.push(
                <div 
                    key={day} 
                    className="border-r border-b border-gray-200 dark:border-gray-700 p-2 min-h-[80px] cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50"
                    onClick={() => setSelectedDate(new Date(year, month, day))}
                >
                    <span className={`font-semibold ${isToday ? 'bg-primary text-white rounded-full w-6 h-6 flex items-center justify-center' : ''}`}>{day}</span>
                    {mealCount !== undefined && <div className="text-sm mt-1">🍽️{mealCount}</div>}
                </div>
            );
        }
        return days;
    }, [currentDate, user?.role]);

    return (
        <>
            <div className="space-y-4 animate-fade-in">
                <div className="flex items-center gap-4">
                    <CalendarIcon className="w-8 h-8 text-primary" />
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Meal Calendar</h1>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-4">
                    <div className="flex justify-between items-center mb-4">
                        <button onClick={handlePrevMonth} className="px-3 py-1 font-semibold rounded-md hover:bg-gray-100 dark:hover:bg-gray-700">{"< Prev"}</button>
                        <h2 className="text-xl font-bold">{currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}</h2>
                        <button onClick={handleNextMonth} className="px-3 py-1 font-semibold rounded-md hover:bg-gray-100 dark:hover:bg-gray-700">{"Next >"}</button>
                    </div>
                    <div className="grid grid-cols-7 text-center font-semibold text-sm text-gray-600 dark:text-gray-300 border-t border-l border-gray-200 dark:border-gray-700">
                        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                            <div key={day} className="py-2 border-r border-b border-gray-200 dark:border-gray-700">{day}</div>
                        ))}
                        {calendarGrid}
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">Legend: {user?.role === Role.Manager ? 'Total meal count per day (all members)' : 'Your meal count per day'}</p>
                </div>
            </div>

            {selectedDate && user?.role === Role.Member && (
                <LogMealsModal date={selectedDate} onClose={() => setSelectedDate(null)} onSubmit={handleSubmitMealEntry} />
            )}
            {selectedDate && user?.role === Role.Manager && (
                <ManageMealsModal date={selectedDate} onClose={() => setSelectedDate(null)} />
            )}
        </>
    );
};

export default CalendarPage;