import React, { useState, useMemo, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Role } from '../types';
import { CalendarIcon, XIcon, PencilIcon } from '../components/Icons';
import { useNotifications } from '../contexts/NotificationContext';
import { api } from '../services/api';

const COST_PER_QUANTITY = 45.50;

// --- MODALS ---

interface LogMealsModalProps {
    date: Date;
    onClose: () => void;
    onSubmit: (data: any) => void;
    initialData?: any;
}
const LogMealsModal: React.FC<LogMealsModalProps> = ({ date, onClose, onSubmit, initialData }) => {
    const [meals, setMeals] = useState({
        breakfast: initialData?.breakfast || 0,
        lunch: initialData?.lunch || 0,
        dinner: initialData?.dinner || 0
    });
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
                {[0, 0.5, 1, 2].map(q => (
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
                    <MealRadioSelector label="Breakfast" icon="☕" value={meals.breakfast} onChange={v => setMeals(p => ({ ...p, breakfast: v }))} />
                    <MealRadioSelector label="Lunch" icon="🍛" value={meals.lunch} onChange={v => setMeals(p => ({ ...p, lunch: v }))} />
                    <MealRadioSelector label="Dinner" icon="🍜" value={meals.dinner} onChange={v => setMeals(p => ({ ...p, dinner: v }))} />
                </div>

                <div className="border-t my-4 border-gray-200 dark:border-gray-700"></div>
                <div className="text-center font-semibold">
                    <p>Total: {totalMeals} meals</p>
                    <p>Cost: ৳{totalCost.toFixed(2)} (@ ৳{COST_PER_QUANTITY.toFixed(2)}/meal)</p>
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
    mealsForDay: any[];
}
const ManageMealsModal: React.FC<ManageMealsModalProps> = ({ date, onClose, mealsForDay }) => {

    // Process data for the view
    const dayDetails = useMemo(() => {
        const breakfast = mealsForDay.filter(m => m.breakfast > 0).map(m => ({ name: m.userName || 'Unknown', qty: m.breakfast }));
        const lunch = mealsForDay.filter(m => m.lunch > 0).map(m => ({ name: m.userName || 'Unknown', qty: m.lunch }));
        const dinner = mealsForDay.filter(m => m.dinner > 0).map(m => ({ name: m.userName || 'Unknown', qty: m.dinner }));

        const total = mealsForDay.reduce((acc, curr) => acc + (curr.breakfast || 0) + (curr.lunch || 0) + (curr.dinner || 0), 0);

        return { total, breakfast, lunch, dinner };
    }, [mealsForDay]);

    const MealTable: React.FC<{ title: string, data: { name: string, qty: number }[] }> = ({ title, data }) => (
        <div>
            <h3 className="font-bold text-lg mb-2">{title}</h3>
            <div className="border rounded-lg overflow-hidden dark:border-gray-700">
                <div className="grid grid-cols-3 bg-gray-50 dark:bg-gray-700/50 p-2 font-semibold text-sm">
                    <div>Member Name</div>
                    <div className="text-center">Quantity</div>
                    <div className="text-right">Edit</div>
                </div>
                {data.length === 0 ? (
                    <div className="p-4 text-center text-gray-500 text-sm">No meals recorded</div>
                ) : (
                    data.map((member, idx) => (
                        <div key={`${member.name}-${idx}`} className="grid grid-cols-3 p-2 border-t dark:border-gray-700 items-center">
                            <div>{member.name}</div>
                            <div className="text-center">{member.qty.toFixed(1)}</div>
                            <div className="text-right"><button className="text-primary hover:underline"><PencilIcon className="w-4 h-4 inline" /></button></div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 animate-fade-in p-4" onClick={onClose}>
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center">
                    <h2 className="text-xl font-bold font-sans">Meals - {date.toLocaleDateString('en-US', { weekday: 'long', day: 'numeric' })} (Total: {dayDetails.total} Meals)</h2>
                    <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700"><XIcon className="w-5 h-5" /></button>
                </div>
                <div className="border-t my-4 border-gray-200 dark:border-gray-700"></div>
                <div className="space-y-6">
                    <MealTable title="🥣 Breakfast" data={dayDetails.breakfast} />
                    <MealTable title="🍛 Lunch" data={dayDetails.lunch} />
                    <MealTable title="🍜 Dinner" data={dayDetails.dinner} />
                </div>
            </div>
        </div>
    );
};


// --- MAIN PAGE ---
const CalendarPage: React.FC = () => {
    const { user } = useAuth();
    const { addToast } = useNotifications();
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);
    const [monthlyMeals, setMonthlyMeals] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    const handlePrevMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
    const handleNextMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));

    // Fetch meals for the displayed month
    useEffect(() => {
        const fetchMonthlyMeals = async () => {
            if (!user?.khataId) return;

            setLoading(true);
            try {
                // Calculate start and end of the month
                const year = currentDate.getFullYear();
                const month = currentDate.getMonth();
                const startDate = new Date(year, month, 1);
                const endDate = new Date(year, month + 1, 0);

                // Adjust to ISO string for API
                const startStr = startDate.toISOString();
                const endStr = endDate.toISOString();

                const meals = await api.getMeals(user.khataId, startStr, endStr);
                setMonthlyMeals(meals);
            } catch (error) {
                console.error("Failed to fetch meals", error);
                addToast({ type: 'error', title: 'Error', message: 'Failed to load calendar data' });
            } finally {
                setLoading(false);
            }
        };

        fetchMonthlyMeals();
    }, [currentDate, user?.khataId, addToast]);

    const handleSubmitMealEntry = async (data: any) => {
        if (!user?.khataId) return;

        try {
            await api.submitMeal(user.khataId, {
                date: data.date.toISOString(),
                breakfast: data.meals.breakfast,
                lunch: data.meals.lunch,
                dinner: data.meals.dinner
            });

            addToast({ type: 'success', title: 'Entry Saved', message: 'Your meal entry has been updated.' });

            // Refresh data
            const year = currentDate.getFullYear();
            const month = currentDate.getMonth();
            const startDate = new Date(year, month, 1);
            const endDate = new Date(year, month + 1, 0);
            const meals = await api.getMeals(user.khataId, startDate.toISOString(), endDate.toISOString());
            setMonthlyMeals(meals);

        } catch (error) {
            console.error("Failed to save meal", error);
            addToast({ type: 'error', title: 'Error', message: 'Failed to save meal entry' });
        }
    };

    // Helper to get meals for a specific day
    const getMealsForDay = (day: number) => {
        const targetDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
        return monthlyMeals.filter(meal => {
            const mealDate = new Date(meal.date);
            return mealDate.getDate() === day &&
                mealDate.getMonth() === currentDate.getMonth() &&
                mealDate.getFullYear() === currentDate.getFullYear();
        });
    };

    // Helper to get current user's meal for a specific day
    const getUserMealForDay = (day: number) => {
        const dayMeals = getMealsForDay(day);
        return dayMeals.find(m => m.userId === user?.id);
    };

    const calendarGrid = useMemo(() => {
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();
        const firstDay = new Date(year, month, 1).getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        const today = new Date();

        let days = [];
        for (let i = 0; i < firstDay; i++) {
            days.push(<div key={`empty-${i}`} className="border-r border-b border-gray-200 dark:border-gray-700"></div>);
        }

        for (let day = 1; day <= daysInMonth; day++) {
            const isToday = today.getFullYear() === year && today.getMonth() === month && today.getDate() === day;

            // Calculate display count based on role
            let displayCount: number | undefined;
            const dayMeals = getMealsForDay(day);

            if (user?.role === Role.Manager) {
                // Manager sees total of all meals
                displayCount = dayMeals.reduce((acc, curr) => acc + (curr.breakfast || 0) + (curr.lunch || 0) + (curr.dinner || 0), 0);
            } else {
                // Member sees only their own meals
                const myMeal = dayMeals.find(m => m.userId === user?.id);
                if (myMeal) {
                    displayCount = (myMeal.breakfast || 0) + (myMeal.lunch || 0) + (myMeal.dinner || 0);
                }
            }

            days.push(
                <div
                    key={day}
                    className="border-r border-b border-gray-200 dark:border-gray-700 p-2 min-h-[80px] cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50"
                    onClick={() => setSelectedDate(new Date(year, month, day))}
                >
                    <span className={`font-semibold ${isToday ? 'bg-primary text-white rounded-full w-6 h-6 flex items-center justify-center' : ''}`}>{day}</span>
                    {displayCount !== undefined && displayCount > 0 && <div className="text-sm mt-1">🍽️{displayCount}</div>}
                </div>
            );
        }
        return days;
    }, [currentDate, monthlyMeals, user?.role, user?.id]);

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

                    {loading ? (
                        <div className="py-10 text-center text-gray-500">Loading calendar data...</div>
                    ) : (
                        <div className="grid grid-cols-7 text-center font-semibold text-sm text-gray-600 dark:text-gray-300 border-t border-l border-gray-200 dark:border-gray-700">
                            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                                <div key={day} className="py-2 border-r border-b border-gray-200 dark:border-gray-700">{day}</div>
                            ))}
                            {calendarGrid}
                        </div>
                    )}

                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">Legend: {user?.role === Role.Manager ? 'Total meal count per day (all members)' : 'Your meal count per day'}</p>
                </div>
            </div>

            {selectedDate && user?.role === Role.Member && (
                <LogMealsModal
                    date={selectedDate}
                    onClose={() => setSelectedDate(null)}
                    onSubmit={handleSubmitMealEntry}
                    initialData={getUserMealForDay(selectedDate.getDate())}
                />
            )}
            {selectedDate && user?.role === Role.Manager && (
                <ManageMealsModal
                    date={selectedDate}
                    onClose={() => setSelectedDate(null)}
                    mealsForDay={getMealsForDay(selectedDate.getDate())}
                />
            )}
        </>
    );
};

export default CalendarPage;
