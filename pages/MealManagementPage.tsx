import React, { useState, useMemo } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Role } from '../types';
import { MealIcon, ArrowLeftIcon, BellIcon, XIcon } from '../components/Icons';
import { useNotifications } from '../contexts/NotificationContext';

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
                    <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700"><XIcon className="w-5 h-5"/></button>
                </div>
                <div className="border-t my-4 border-gray-200 dark:border-gray-700"></div>
                
                <div className="space-y-4">
                    {isFinalized && <p className="p-2 text-sm text-yellow-800 bg-yellow-100 dark:text-yellow-200 dark:bg-yellow-900/50 rounded-md text-center">⚠️ Already finalized. Changes need member approval.</p>}
                    <MealQuantitySelector meal="breakfast" icon="🌅" label="Breakfast" value={meals.breakfast} onChange={(v) => setMeals(p => ({...p, breakfast: v}))} disabled={false} note={getChangeNote('breakfast')} />
                    <MealQuantitySelector meal="lunch" icon="🌞" label="Lunch" value={meals.lunch} onChange={(v) => setMeals(p => ({...p, lunch: v}))} disabled={false} note={getChangeNote('lunch')} />
                    <MealQuantitySelector meal="dinner" icon="🌙" label="Dinner" value={meals.dinner} onChange={(v) => setMeals(p => ({...p, dinner: v}))} disabled={false} note={getChangeNote('dinner')} />
                    
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
}

const MemberMealView: React.FC<MemberMealViewProps> = ({ isFinalized, meals, setMeals, pendingEdit, onApprovalAction }) => {
    const { addToast } = useNotifications();
    const totalQty = meals.breakfast + meals.lunch + meals.dinner;
    const totalCost = totalQty * COST_PER_QUANTITY;
    
    const handleSaveChanges = () => {
        addToast({ type: 'success', title: 'Meals Updated', message: 'Your meal plan for today has been saved.' });
    };

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
                        <button onClick={handleSaveChanges} className="w-full py-2.5 bg-primary text-white font-semibold rounded-lg hover:bg-primary-600">Save Changes</button>
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
                                    <p className="text-sm font-semibold">Total: {total} • Cost: ৳{cost.toFixed(2)}</p>
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
                    <p>Estimated Cost: ৳{(totalQuantities * COST_PER_QUANTITY).toFixed(2)}</p>
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
    const [memberMeals, setMemberMeals] = useState<MealSet>({ breakfast: 2, lunch: 2, dinner: 2 });
    const [pendingEdit, setPendingEdit] = useState<PendingEditRequest | null>(null);
    const [isEditingMember, setIsEditingMember] = useState<string | null>(null);
    const [managerMealList, setManagerMealList] = useState(mockManagerMealList);

    if (!user) return null;

    const handleFinalize = () => {
        setIsFinalized(true);
        addToast({ type: 'success', title: 'Meals Finalized', message: "Today's meal counts are now locked." });
    };

    const handleManagerEditSubmit = (editData: { memberName: string; newMeals: MealSet; originalMeals: MealSet; reason: string; }) => {
        const { memberName, newMeals, originalMeals, reason } = editData;
    
        if (isFinalized) {
            const hasChanged = JSON.stringify(newMeals) !== JSON.stringify(originalMeals);
            if (hasChanged) {
                const editRequest: PendingEditRequest = {
                    date: '8',
                    memberName: memberName,
                    originalMeals: originalMeals,
                    newMeals: newMeals,
                    reason: reason || 'Manager update',
                };
                setPendingEdit(editRequest);
                addToast({ type: 'info', title: 'Request Sent', message: `Edit request sent to ${memberName}.` });
            }
        } else {
            // Direct edit before finalization
            setManagerMealList(prevList =>
                prevList.map(member =>
                    member.name === memberName ? { ...member, meals: newMeals } : member
                )
            );
            addToast({ type: 'success', title: 'Meals Updated', message: `${memberName}'s meals have been updated directly.` });
        }
        setIsEditingMember(null); // Close modal
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

    return (
        <>
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