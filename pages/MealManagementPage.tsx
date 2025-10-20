import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Role } from '../types';
import { MealIcon, ArrowLeftIcon, BellIcon, XIcon } from '../components/Icons';

const COST_PER_QUANTITY = 45.50;

// MOCK DATA based on wireframes
const mockManagerEdit = {
    date: 'Oct 7',
    change: 'dinner from 2 to 0',
    reason: 'You were out',
};

const mockMemberMonthSummary = {
    totalQuantities: 56,
    totalCost: 2548,
    deposits: 3000,
    refundable: 452,
};

const mockManagerMealList = [
    { id: '1', name: 'Raj Kumar', meals: { breakfast: 2, lunch: 2, dinner: 2 } },
    { id: '2', name: 'Amit Hossain', meals: { breakfast: 1, lunch: 0, dinner: 1 } },
    { id: '3', name: 'Priya Das', meals: { breakfast: 2, lunch: 2, dinner: 0 } },
    { id: '4', name: 'Ravi Islam', meals: { breakfast: 1, lunch: 1, dinner: 1 } },
];

// --- Sub-components ---

const MealQuantitySelector: React.FC<{
    meal: 'breakfast' | 'lunch' | 'dinner';
    label: string;
    icon: string;
    value: number;
    onChange: (value: number) => void;
    disabled: boolean;
    note?: string;
}> = ({ meal, label, icon, value, onChange, disabled, note }) => (
    <div>
        <label className="font-semibold text-gray-800 dark:text-white">{icon} {label}:</label>
        <div className="flex items-center gap-x-3 mt-2 flex-wrap">
            {[0, 0.5, 1, 2].map(q => (
                <button
                    key={q}
                    type="button"
                    onClick={() => onChange(q)}
                    disabled={disabled}
                    className={`w-10 h-10 rounded-full text-sm font-bold flex items-center justify-center border-2 transition-all ${
                        value === q
                            ? 'bg-primary-100 dark:bg-primary-500/20 border-primary text-primary'
                            : 'bg-gray-100 dark:bg-gray-700 border-gray-200 dark:border-gray-600'
                    } ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:border-primary-300'}`}
                >
                    {q}
                </button>
            ))}
        </div>
        {note && <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">({note})</p>}
    </div>
);

const ManagerEditModal: React.FC<{ memberName: string; onClose: () => void }> = ({ memberName, onClose }) => {
    const [reason, setReason] = useState('He was out for dinner');
    const [meals, setMeals] = useState({ breakfast: 2, lunch: 2, dinner: 0 }); // Pre-fill with member's data if available

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 animate-fade-in p-4">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl p-6 w-full max-w-sm" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">Edit Meal - {memberName}</h3>
                    <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700"><XIcon className="w-5 h-5"/></button>
                </div>
                <div className="border-t my-4 border-gray-200 dark:border-gray-700"></div>
                
                <div className="space-y-4">
                    <p className="p-2 text-sm text-yellow-800 bg-yellow-100 dark:text-yellow-200 dark:bg-yellow-900/50 rounded-md text-center">⚠️ Already finalized. Changes need member approval.</p>
                    <MealQuantitySelector meal="breakfast" icon="🌅" label="Breakfast" value={meals.breakfast} onChange={(v) => setMeals(p => ({...p, breakfast: v}))} disabled={false} />
                    <MealQuantitySelector meal="lunch" icon="🌞" label="Lunch" value={meals.lunch} onChange={(v) => setMeals(p => ({...p, lunch: v}))} disabled={false} />
                    <MealQuantitySelector meal="dinner" icon="🌙" label="Dinner" value={meals.dinner} onChange={(v) => setMeals(p => ({...p, dinner: v}))} disabled={false} note="Changing from 2 to 0"/>
                    <div>
                        <label className="font-semibold text-gray-800 dark:text-white text-sm">Reason for Change:</label>
                        <input 
                            type="text" 
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                            className="w-full mt-1 px-3 py-2 bg-gray-100 dark:bg-gray-700 border-2 border-transparent rounded-lg focus:outline-none focus:border-primary transition-colors"
                        />
                    </div>
                </div>

                <div className="flex gap-3 mt-6">
                    <button onClick={onClose} className="flex-1 py-2.5 bg-gray-200 dark:bg-gray-600 font-semibold rounded-lg hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors">Cancel</button>
                    <button onClick={onClose} className="flex-1 py-2.5 bg-primary text-white font-semibold rounded-lg hover:bg-primary-600 transition-colors">Send for Approval</button>
                </div>
            </div>
        </div>
    )
};

// --- Views ---

const MemberMealView: React.FC = () => {
    // This state simulates the manager's action. In a real app, this would come from an API.
    const [isFinalized, setIsFinalized] = useState(false); 
    const [meals, setMeals] = useState({ breakfast: 2, lunch: 2, dinner: 0 }); // Initial state from wireframe
    const totalQty = meals.breakfast + meals.lunch + meals.dinner;
    const totalCost = totalQty * COST_PER_QUANTITY;

    return (
        <div className="space-y-6">
             <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
                <h3 className="text-lg font-semibold mb-2">📅 Today - October 8, 2025</h3>
                <div className="border-t border-gray-200 dark:border-gray-700 my-3"></div>
                {isFinalized ? (
                    <div>
                        <p className="font-semibold text-green-600 dark:text-green-400">✅ Finalized by Manager</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Cannot change now</p>
                        <div className="mt-4 space-y-1 text-gray-700 dark:text-gray-200">
                            <p>🌅 Breakfast: {meals.breakfast}</p>
                            <p>🌞 Lunch: {meals.lunch}</p>
                            <p>🌙 Dinner: {meals.dinner}</p>
                        </div>
                        <div className="border-t border-gray-200 dark:border-gray-700 my-3"></div>
                        <p className="font-semibold">Total: {totalQty} quantities • Cost: ৳{totalCost.toFixed(2)}</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        <p className="font-semibold text-yellow-600 dark:text-yellow-400">🕐 Manager hasn't finalized yet</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">You can still update quantities</p>
                        <div className="border-t border-gray-200 dark:border-gray-700 my-3"></div>
                        <h3 className="font-semibold">Your Meal Plan for Today:</h3>
                        <MealQuantitySelector meal="breakfast" icon="🌅" label="Breakfast" value={meals.breakfast} onChange={(v) => setMeals(p => ({...p, breakfast: v}))} disabled={isFinalized} note="Default: 2" />
                        <MealQuantitySelector meal="lunch" icon="🌞" label="Lunch" value={meals.lunch} onChange={(v) => setMeals(p => ({...p, lunch: v}))} disabled={isFinalized} note="Default: 2" />
                        <MealQuantitySelector meal="dinner" icon="🌙" label="Dinner" value={meals.dinner} onChange={(v) => setMeals(p => ({...p, dinner: v}))} disabled={isFinalized} note={meals.dinner === 0 ? "Not having dinner today" : ""} />
                        <div className="border-t border-gray-200 dark:border-gray-700 my-3"></div>
                        <div className="text-center font-semibold space-y-1">
                            <p>Total Today: {totalQty} quantities</p>
                            <p>Cost: ৳{totalCost.toFixed(2)} (@ ৳{COST_PER_QUANTITY.toFixed(2)}/quantity)</p>
                        </div>
                        {/* Mock "Save Changes" to toggle to the finalized view for demo */}
                        <button onClick={() => alert('Changes saved!')} className="w-full py-2.5 bg-primary text-white font-semibold rounded-lg hover:bg-primary-600">Save Changes</button>
                    </div>
                )}
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
                <h3 className="text-lg font-semibold mb-2 text-yellow-600 dark:text-yellow-400">🔔 Manager Edit Pending Approval</h3>
                <div className="border-t border-gray-200 dark:border-gray-700 my-3"></div>
                <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                    <p className="text-sm font-medium">Oct 7 - Manager changed your dinner from 2 to 0</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Reason: "{mockManagerEdit.reason}"</p>
                    <div className="flex gap-2 mt-3 justify-end">
                        <button className="px-3 py-1 text-sm font-semibold bg-red-100 text-red-700 rounded-md hover:bg-red-200 dark:bg-red-900/50 dark:text-red-300 dark:hover:bg-red-900">Deny</button>
                        <button className="px-3 py-1 text-sm font-semibold bg-green-100 text-green-700 rounded-md hover:bg-green-200 dark:bg-green-900/50 dark:text-green-300 dark:hover:bg-green-900">Approve Change</button>
                    </div>
                </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
                <h3 className="text-lg font-semibold mb-2">This Month Summary</h3>
                <div className="border-t border-gray-200 dark:border-gray-700 my-3"></div>
                <div className="space-y-1 text-sm">
                    <p>Total Quantities: <span className="font-bold float-right">{mockMemberMonthSummary.totalQuantities}</span></p>
                    <p>Total Cost: <span className="font-bold float-right">৳{mockMemberMonthSummary.totalCost.toFixed(2)}</span></p>
                    <p>Deposits: <span className="font-bold float-right">৳{mockMemberMonthSummary.deposits.toFixed(2)}</span></p>
                    <p className="text-green-600 dark:text-green-400 font-semibold">Refundable: <span className="font-bold float-right">+৳{mockMemberMonthSummary.refundable.toFixed(2)}</span></p>
                </div>
            </div>
        </div>
    );
};

const ManagerMealView: React.FC = () => {
    const [isFinalized, setIsFinalized] = useState(false);
    const [isEditingMember, setIsEditingMember] = useState<string | null>(null);
    const totalQuantities = mockManagerMealList.reduce((acc, m) => acc + m.meals.breakfast + m.meals.lunch + m.meals.dinner, 0);

    return (
        <>
        <div className="space-y-6">
             <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
                <h3 className="text-lg font-semibold mb-2">📅 Today - October 8, 2025</h3>
                <div className="border-t border-gray-200 dark:border-gray-700 my-3"></div>
                <p className={`font-semibold ${isFinalized ? 'text-green-600 dark:text-green-400' : 'text-yellow-600 dark:text-yellow-400'}`}>
                    {isFinalized ? '✅ Status: Finalized' : '⏰ Status: Not Finalized'}
                </p>
                {!isFinalized && (
                    <>
                    <button onClick={() => setIsFinalized(true)} className="mt-3 w-full py-2.5 bg-primary text-white font-semibold rounded-lg hover:bg-primary-600">📋 Finalize Today's Meals</button>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 text-center">(After this, members can't change)</p>
                    </>
                )}
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
                <h3 className="text-lg font-semibold mb-2">📊 Today's Meal List</h3>
                <div className="border-t border-gray-200 dark:border-gray-700 my-3"></div>
                <div className="space-y-3">
                    {mockManagerMealList.slice(0, 2).map(member => {
                        const total = member.meals.breakfast + member.meals.lunch + member.meals.dinner;
                        const cost = total * COST_PER_QUANTITY;
                        return (
                            <div key={member.id} className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                                <p className="font-bold text-gray-800 dark:text-white">{member.name}</p>
                                <div className="text-sm mt-1 text-gray-600 dark:text-gray-300">
                                    <p>🌅 Breakfast: {member.meals.breakfast}</p>
                                    <p>🌞 Lunch: {member.meals.lunch} {member.meals.lunch === 0 && '(Not having)'}</p>
                                    <p>🌙 Dinner: {member.meals.dinner}</p>
                                </div>
                                <div className="border-t border-gray-200 dark:border-gray-600 my-2"></div>
                                <div className="flex justify-between items-center">
                                    <p className="text-sm font-semibold">Total: {total} • Cost: ৳{cost.toFixed(2)}</p>
                                    <div className="flex gap-2">
                                        <button onClick={() => setIsEditingMember(member.name)} className="text-xs font-semibold text-primary hover:underline">Edit</button>
                                        <button className="text-xs font-semibold text-primary hover:underline">View Profile</button>
                                    </div>
                                </div>
                            </div>
                        )
                    })}
                    <button className="text-sm font-semibold text-primary hover:underline w-full text-left p-2">+ {mockManagerMealList.length - 2} more members...</button>
                </div>
                <div className="border-t border-gray-200 dark:border-gray-700 my-3"></div>
                 <div className="text-center font-semibold space-y-1">
                    <p>Total Today: {totalQuantities} quantities</p>
                    <p>Estimated Cost: ৳{(totalQuantities * COST_PER_QUANTITY).toFixed(2)}</p>
                </div>
            </div>
        </div>
        {isEditingMember && <ManagerEditModal memberName={isEditingMember} onClose={() => setIsEditingMember(null)} />}
        </>
    );
}

// --- Main Component ---

const MealManagementPage: React.FC = () => {
    const { user, setPage } = useAuth();
    if (!user) return null;

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <button onClick={() => setPage('dashboard')} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 md:hidden">
                        <ArrowLeftIcon className="w-6 h-6 text-gray-600 dark:text-gray-300"/>
                    </button>
                    <MealIcon className="w-8 h-8 text-primary" />
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Meal Management</h1>
                </div>
                 {user.role === Role.Member && (
                    <button className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700">
                        <BellIcon className="w-6 h-6"/>
                    </button>
                )}
            </div>
           
            {user.role === Role.Manager ? <ManagerMealView /> : <MemberMealView />}
        </div>
    );
};

export default MealManagementPage;
