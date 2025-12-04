import React, { useState, useMemo, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Role } from '../types';
import { MealIcon, ArrowLeftIcon, BellIcon, XIcon } from '../components/Icons';
import { useNotifications } from '../contexts/NotificationContext';
import { api } from '../services/api';

const COST_PER_QUANTITY = 45.50;

// MOCK DATA based on wireframes
const mockMemberMonthSummary = {
    totalQuantities: 56,
    totalCost: 2548,
    deposits: 3000,
    refundable: 452,
};

const mockManagerMealList = [
    { id: '9', name: 'Amit Hossain', meals: { breakfast: 1, lunch: 0, dinner: 1 } },
    { id: '3', name: 'Priya Das', meals: { breakfast: 2, lunch: 2, dinner: 0 } },
    { id: '4', name: 'Ravi Islam', meals: { breakfast: 1, lunch: 1, dinner: 1 } },
];

interface MealSet {
    breakfast: number;
    lunch: number;
    dinner: number;
}

interface PendingEditRequest {
    date: string;
    memberName: string;
    originalMeals: MealSet;
    newMeals: MealSet;
    reason: string;
}

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
                    className={`w-10 h-10 rounded-full text-sm font-bold flex items-center justify-center border-2 transition-all ${value === q
                        ? 'bg-primary-100 dark:bg-primary-500/20 border-primary text-primary'
                        : 'bg-gray-100 dark:bg-gray-700 border-gray-200 dark:border-gray-600'
                        } ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:border-primary-300'}`}
                >
                    {q}
                </button>
            ))}
        </div>
        {note && <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{note}</p>}
    </div>
);

const ManagerEditModal: React.FC<{
    memberName: string;
    memberList: typeof mockManagerMealList;
    onClose: () => void;
    onSubmit: (edit: {
        memberName: string;
        newMeals: MealSet;
        originalMeals: MealSet;
        reason: string;
    }) => void;
    isFinalized: boolean;
}> = ({ memberName, memberList, onClose, onSubmit, isFinalized }) => {
    const originalMemberData = useMemo(() => memberList.find(m => m.name === memberName), [memberName, memberList]);
    const originalMeals = useMemo(() => originalMemberData?.meals || { breakfast: 2, lunch: 2, dinner: 2 }, [originalMemberData]);

    const [meals, setMeals] = useState<MealSet>(originalMeals);
    const [reason, setReason] = useState(isFinalized ? 'Was out of town' : '');

    const handleSubmit = () => {
        onSubmit({
            memberName: memberName,
            newMeals: meals,
            originalMeals: originalMeals,
            reason: reason,
        });
        onClose();
    };

    const getChangeNote = (meal: keyof typeof meals) => {
        if (meals[meal] !== originalMeals[meal]) {
            return `(Changing from ${originalMeals[meal]} to ${meals[meal]})`;
        }
        return undefined;
    }

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 animate-fade-in p-4">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl p-6 w-full max-w-sm" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">Edit Meal - {memberName}</h3>
                    <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700"><XIcon className="w-5 h-5" /></button>
                </div>
                <div className="border-t my-4 border-gray-200 dark:border-gray-700"></div>

                <div className="space-y-4">
                    {isFinalized && <p className="p-2 text-sm text-yellow-800 bg-yellow-100 dark:text-yellow-200 dark:bg-yellow-900/50 rounded-md text-center">⚠️ Already finalized. Changes need member approval.</p>}
                    <MealQuantitySelector meal="breakfast" icon="🌅" label="Breakfast" value={meals.breakfast} onChange={(v) => setMeals(p => ({ ...p, breakfast: v }))} disabled={false} note={getChangeNote('breakfast')} />
                    <MealQuantitySelector meal="lunch" icon="🌞" label="Lunch" value={meals.lunch} onChange={(v) => setMeals(p => ({ ...p, lunch: v }))} disabled={false} note={getChangeNote('lunch')} />
                    <MealQuantitySelector meal="dinner" icon="🌙" label="Dinner" value={meals.dinner} onChange={(v) => setMeals(p => ({ ...p, dinner: v }))} disabled={false} note={getChangeNote('dinner')} />

                    {isFinalized && (
                        <div>
                            <label className="font-semibold text-gray-800 dark:text-white text-sm">Reason for Change:</label>
                            <input
                                type="text"
                                value={reason}
                                onChange={(e) => setReason(e.target.value)}
                                className="w-full mt-1 px-3 py-2 bg-gray-100 dark:bg-gray-700 border-2 border-transparent rounded-lg focus:outline-none focus:border-primary transition-colors"
                            />
                        </div>
                    )}
                </div>

                <div className="flex gap-3 mt-6">
                    <button onClick={onClose} className="flex-1 py-2.5 bg-gray-200 dark:bg-gray-600 font-semibold rounded-lg hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors">Cancel</button>
                    <button onClick={handleSubmit} className="flex-1 py-2.5 bg-primary text-white font-semibold rounded-lg hover:bg-primary-600 transition-colors">
                        {isFinalized ? 'Send for Approval' : 'Save Changes'}
                    </button>
                </div>
            </div>
        </div>
    )
};

// --- Views ---

const ChangeSummary: React.FC<{ pendingEdit: PendingEditRequest }> = ({ pendingEdit }) => {
    const changes: string[] = [];
    (Object.keys(pendingEdit.newMeals) as Array<keyof MealSet>).forEach(meal => {
        if (pendingEdit.newMeals[meal] !== pendingEdit.originalMeals[meal]) {
            changes.push(`${meal} from ${pendingEdit.originalMeals[meal]} to ${pendingEdit.newMeals[meal]}`);
        }
    });

    if (changes.length === 0) return null;

    return (
        <p className="text-sm font-medium">
            Manager changed meals for Oct {pendingEdit.date}: {changes.join(', ')}.
        </p>
    );
};

interface MemberMealViewProps {
    isFinalized: boolean;
    meals: MealSet;
    setMeals: React.Dispatch<React.SetStateAction<MealSet>>;
    pendingEdit: PendingEditRequest | null;
    onApprovalAction: (action: 'approve' | 'deny') => void;
    onSaveChanges: () => void;
}

const MemberMealView: React.FC<MemberMealViewProps> = ({ isFinalized, meals, setMeals, pendingEdit, onApprovalAction, onSaveChanges }) => {
    const totalQty = meals.breakfast + meals.lunch + meals.dinner;
    const totalCost = totalQty * COST_PER_QUANTITY;

    return (
        <div className="space-y-6 pb-32">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
                <h3 className="text-lg font-semibold mb-4">Today's Meal Count</h3>
                {isFinalized ? (
                    <div className="space-y-3">
                        <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg mb-4">
                            <p className="text-sm font-semibold text-yellow-800 dark:text-yellow-200">🔒 Finalized by Manager - No changes allowed</p>
                        </div>
                        <div className="space-y-2 text-gray-700 dark:text-gray-200">
                            <p className="flex justify-between"><span>🌅 Breakfast:</span> <span className="font-bold">{meals.breakfast}</span></p>
                            <p className="flex justify-between"><span>🌞 Lunch:</span> <span className="font-bold">{meals.lunch}</span></p>
                            <p className="flex justify-between"><span>🌙 Dinner:</span> <span className="font-bold">{meals.dinner}</span></p>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <label className="font-medium text-gray-700 dark:text-gray-300">🌅 Breakfast</label>
                            <div className="flex items-center gap-3">
                                <button
                                    onClick={() => setMeals(prev => ({ ...prev, breakfast: Math.max(0, prev.breakfast - 1) }))}
                                    className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 font-bold"
                                >−</button>
                                <span className="w-12 text-center font-bold text-xl">{meals.breakfast}</span>
                                <button
                                    onClick={() => setMeals(prev => ({ ...prev, breakfast: prev.breakfast + 1 }))}
                                    className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 font-bold"
                                >+</button>
                            </div>
                        </div>
                        <div className="flex items-center justify-between">
                            <label className="font-medium text-gray-700 dark:text-gray-300">🌞 Lunch</label>
                            <div className="flex items-center gap-3">
                                <button
                                    onClick={() => setMeals(prev => ({ ...prev, lunch: Math.max(0, prev.lunch - 1) }))}
                                    className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 font-bold"
                                >−</button>
                                <span className="w-12 text-center font-bold text-xl">{meals.lunch}</span>
                                <button
                                    onClick={() => setMeals(prev => ({ ...prev, lunch: prev.lunch + 1 }))}
                                    className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 font-bold"
                                >+</button>
                            </div>
                        </div>
                        <div className="flex items-center justify-between">
                            <label className="font-medium text-gray-700 dark:text-gray-300">🌙 Dinner</label>
                            <div className="flex items-center gap-3">
                                <button
                                    onClick={() => setMeals(prev => ({ ...prev, dinner: Math.max(0, prev.dinner - 1) }))}
                                    className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 font-bold"
                                >−</button>
                                <span className="w-12 text-center font-bold text-xl">{meals.dinner}</span>
                                <button
                                    onClick={() => setMeals(prev => ({ ...prev, dinner: prev.dinner + 1 }))}
                                    className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 font-bold"
                                >+</button>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {pendingEdit && (
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
                    <h3 className="text-lg font-semibold mb-2 text-yellow-600 dark:text-yellow-400">🔔 Manager Edit Pending Approval</h3>
                    <div className="border-t border-gray-200 dark:border-gray-700 my-3"></div>
                    <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                        <ChangeSummary pendingEdit={pendingEdit} />
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Reason: "{pendingEdit.reason}"</p>
                        <div className="flex gap-2 mt-3 justify-end">
                            <button onClick={() => onApprovalAction('deny')} className="px-3 py-1 text-sm font-semibold bg-red-100 text-red-700 rounded-md hover:bg-red-200 dark:bg-red-900/50 dark:text-red-300 dark:hover:bg-red-900">Deny</button>
                            <button onClick={() => onApprovalAction('approve')} className="px-3 py-1 text-sm font-semibold bg-green-100 text-green-700 rounded-md hover:bg-green-200 dark:bg-green-900/50 dark:text-green-300 dark:hover:bg-green-900">Approve Change</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Sticky Bottom Bar */}
            <div className="fixed bottom-0 left-0 right-0 bg-gray-700 dark:bg-gray-900 text-white p-4 shadow-lg z-40">
                <div className="max-w-4xl mx-auto text-center space-y-2">
                    <p className="text-lg font-semibold">Total Today: {totalQty} quantities</p>
                    <button
                        onClick={onSaveChanges}
                        disabled={isFinalized}
                        className="w-full max-w-md mx-auto py-2.5 bg-white text-gray-900 font-semibold rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        Save Changes
                    </button>
                </div>
            </div>
        </div>
    );
};

interface ManagerMealViewProps {
    isFinalized: boolean;
    onFinalize: () => void;
    setIsEditingMember: (name: string | null) => void;
    memberList: typeof mockManagerMealList;
}

const ManagerMealView: React.FC<ManagerMealViewProps> = ({ isFinalized, onFinalize, setIsEditingMember, memberList }) => {
    const totalQuantities = memberList.reduce((acc, m) => acc + m.meals.breakfast + m.meals.lunch + m.meals.dinner, 0);

    return (
        <div className="space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
                <h3 className="text-lg font-semibold mb-2">📅 Today - October 8, 2025</h3>
                <div className="border-t border-gray-200 dark:border-gray-700 my-3"></div>
                <p className={`font-semibold ${isFinalized ? 'text-green-600 dark:text-green-400' : 'text-yellow-600 dark:text-yellow-400'}`}>
                    {isFinalized ? '✅ Status: Finalized' : '⏰ Status: Not Finalized'}
                </p>
                {!isFinalized && (
                    <>
                        <button onClick={onFinalize} className="mt-3 w-full py-2.5 bg-primary text-white font-semibold rounded-lg hover:bg-primary-600">📋 Finalize Today's Meals</button>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 text-center">(After this, members can't change)</p>
                    </>
                )}
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
                <h3 className="text-lg font-semibold mb-2">📊 Today's Meal List</h3>
                <div className="border-t border-gray-200 dark:border-gray-700 my-3"></div>
                <div className="space-y-3">
                    {memberList.map(member => {
                        const total = member.meals.breakfast + member.meals.lunch + member.meals.dinner;
                        const cost = total * COST_PER_QUANTITY;
                        return (
                            <div key={member.id} className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                                <p className="font-bold text-gray-800 dark:text-white">{member.name}</p>
                                <div className="text-sm mt-1 text-gray-600 dark:text-gray-300">
                                    <p>🌅 B: {member.meals.breakfast}, 🌞 L: {member.meals.lunch}, 🌙 D: {member.meals.dinner}</p>
                                </div>
                                <div className="border-t border-gray-200 dark:border-gray-600 my-2"></div>
                                <div className="flex justify-between items-center">
                                    <p className="text-sm font-semibold">Total: {total}</p>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => setIsEditingMember(member.name)}
                                            className="text-xs font-semibold text-primary hover:underline"
                                        >
                                            Edit
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )
                    })}
                </div>
                <div className="border-t border-gray-200 dark:border-gray-700 my-3"></div>
                <div className="text-center font-semibold space-y-1">
                    <p>Total Today: {totalQuantities} quantities</p>
                </div>
            </div>
        </div>
    );
}

// --- Main Component ---

const MealManagementPage: React.FC = () => {
    const { user, setPage } = useAuth();
    const { addToast } = useNotifications();

    // Shared state for manager-member interaction
    const [isFinalized, setIsFinalized] = useState(false);
    const [memberMeals, setMemberMeals] = useState<MealSet>({ breakfast: 0, lunch: 0, dinner: 0 });
    const [pendingEdit, setPendingEdit] = useState<PendingEditRequest | null>(null);
    const [isEditingMember, setIsEditingMember] = useState<string | null>(null);
    const [managerMealList, setManagerMealList] = useState<Array<{ id: string; name: string; meals: MealSet }>>([]);
    const [loading, setLoading] = useState(true);

    if (!user) return null;

    // Fetch today's meals
    useEffect(() => {
        const fetchMeals = async () => {
            if (!user?.khataId) {
                setLoading(false);
                return;
            }

            try {
                setLoading(true);

                // Get today's date
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                const todayStr = today.toISOString();

                // Fetch all meals for today
                const meals = await api.getMeals(user.khataId, todayStr, todayStr);

                // Check if today is finalized
                const finalizationStatus = await api.getFinalizationStatus(user.khataId, todayStr);
                setIsFinalized(finalizationStatus.isFinalized);

                if (user.role === Role.Manager) {
                    // For manager: get all members and their meals
                    const members = await api.getMembersForRoom(user.khataId);

                    // Map members to meal list
                    const mealList = members.map(member => {
                        const memberMeal = meals.find(m => m.userId === member.id);
                        return {
                            id: member.id,
                            name: member.name,
                            meals: {
                                breakfast: memberMeal?.breakfast || 0,
                                lunch: memberMeal?.lunch || 0,
                                dinner: memberMeal?.dinner || 0
                            }
                        };
                    });

                    setManagerMealList(mealList);
                } else {
                    // For member: get own meals
                    const myMeal = meals.find(m => m.userId === user.id);
                    if (myMeal) {
                        setMemberMeals({
                            breakfast: myMeal.breakfast,
                            lunch: myMeal.lunch,
                            dinner: myMeal.dinner
                        });
                    } else {
                        // Default to 0 if no meal found
                        setMemberMeals({ breakfast: 0, lunch: 0, dinner: 0 });
                    }
                }
            } catch (error) {
                console.error('Error fetching meals:', error);
                addToast({ type: 'error', title: 'Error', message: 'Failed to load meal data' });
            } finally {
                setLoading(false);
            }
        };

        fetchMeals();
    }, [user?.khataId, user?.role, user?.id]);

    const handleFinalize = async () => {
        if (!user?.khataId) return;

        try {
            // Get today's date
            const today = new Date();
            today.setHours(0, 0, 0, 0);

            const success = await api.finalizeMeals(user.khataId, today.toISOString());
            if (success) {
                setIsFinalized(true);
                addToast({ type: 'success', title: 'Meals Finalized', message: "Today's meal counts are now locked." });
            } else {
                addToast({ type: 'error', title: 'Error', message: 'Failed to finalize meals' });
            }
        } catch (error) {
            console.error('Error finalizing meals:', error);
            addToast({ type: 'error', title: 'Error', message: 'Failed to finalize meals' });
        }
    };

    const handleManagerEditSubmit = async (editData: { memberName: string; newMeals: MealSet; originalMeals: MealSet; reason: string; }) => {
        const { memberName, newMeals, originalMeals, reason } = editData;

        if (!user?.khataId) return;

        // Find the member
        const member = managerMealList.find(m => m.name === memberName);
        if (!member) return;

        try {
            // Get today's date
            const today = new Date();
            today.setHours(0, 0, 0, 0);

            // Submit meal update
            await api.submitMeal(user.khataId, {
                date: today.toISOString(),
                breakfast: newMeals.breakfast,
                lunch: newMeals.lunch,
                dinner: newMeals.dinner,
                userId: member.id,
                userName: member.name
            });

            // Update local state
            setManagerMealList(prevList =>
                prevList.map(m =>
                    m.id === member.id ? { ...m, meals: newMeals } : m
                )
            );

            addToast({ type: 'success', title: 'Meals Updated', message: `${memberName}'s meals have been updated.` });
        } catch (error) {
            console.error('Error updating meal:', error);
            addToast({ type: 'error', title: 'Error', message: 'Failed to update meal' });
        }

        setIsEditingMember(null);
    };

    const handleMemberApprovalAction = (action: 'approve' | 'deny') => {
        if (action === 'approve' && pendingEdit) {
            setMemberMeals(pendingEdit.newMeals);
            addToast({ type: 'success', title: 'Change Approved', message: 'Meal change has been applied.' });
        } else {
            addToast({ type: 'warning', title: 'Change Denied', message: 'The meal change was not applied.' });
        }
        setPendingEdit(null);
    };

    const handleSaveChanges = async () => {
        if (!user?.khataId) return;

        try {
            // Get today's date
            const today = new Date();
            today.setHours(0, 0, 0, 0);

            // Submit meal update
            await api.submitMeal(user.khataId, {
                date: today.toISOString(),
                breakfast: memberMeals.breakfast,
                lunch: memberMeals.lunch,
                dinner: memberMeals.dinner
            });

            addToast({ type: 'success', title: 'Meals Updated', message: 'Your meal plan for today has been saved.' });
        } catch (error) {
            console.error('Error saving meal:', error);
            addToast({ type: 'error', title: 'Error', message: 'Failed to save meal' });
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="w-16 h-16 border-4 border-dashed rounded-full animate-spin border-primary-500"></div>
            </div>
        );
    }

    return (
        <>
            <div className="space-y-6 animate-fade-in">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <button onClick={() => setPage('dashboard')} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 md:hidden">
                            <ArrowLeftIcon className="w-6 h-6 text-gray-600 dark:text-gray-300" />
                        </button>
                        <MealIcon className="w-8 h-8 text-primary" />
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Meal Management</h1>
                    </div>
                    {user.role === Role.Member && (
                        <button className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700">
                            <BellIcon className="w-6 h-6" />
                        </button>
                    )}
                </div>

                {user.role === Role.Manager ? (
                    <ManagerMealView
                        isFinalized={isFinalized}
                        onFinalize={handleFinalize}
                        setIsEditingMember={setIsEditingMember}
                        memberList={managerMealList}
                    />
                ) : (
                    <MemberMealView
                        isFinalized={isFinalized}
                        meals={memberMeals}
                        setMeals={setMemberMeals}
                        pendingEdit={pendingEdit}
                        onApprovalAction={handleMemberApprovalAction}
                        onSaveChanges={handleSaveChanges}
                    />
                )}
            </div>

            {user.role === Role.Manager && isEditingMember && (
                <ManagerEditModal
                    memberName={isEditingMember}
                    memberList={managerMealList}
                    onClose={() => setIsEditingMember(null)}
                    onSubmit={handleManagerEditSubmit}
                    isFinalized={isFinalized}
                />
            )}
        </>
    );
};

export default MealManagementPage;

