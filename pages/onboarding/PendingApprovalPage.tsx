import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { RoomStatus } from '../../types';
import { useNotifications } from '../../contexts/NotificationContext';

const PendingApprovalPage: React.FC = () => {
    const { user, setUser, logout } = useAuth();
    const { addToast } = useNotifications();
    
    const handleWithdraw = () => {
        // Mock API call to withdraw request
        if(user) {
            const updatedUser = { ...user, roomStatus: RoomStatus.NoRoom };
            setUser(updatedUser);
            localStorage.setItem('user', JSON.stringify(updatedUser));
            addToast({ type: 'warning', title: 'Request Withdrawn', message: 'You have withdrawn your request to join the room.' });
        }
    };

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-900 p-4 text-center">
            <div className="w-full max-w-md bg-white dark:bg-slate-800 rounded-xl shadow-lg p-10">
                <div className="w-16 h-16 bg-yellow-100 dark:bg-yellow-500/20 rounded-full flex items-center justify-center mx-auto">
                    <svg className="w-8 h-8 text-yellow-500 dark:text-yellow-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                    </svg>
                </div>
                <h2 className="text-2xl font-bold text-slate-800 dark:text-white mt-6">Request Sent!</h2>
                <p className="text-slate-500 dark:text-slate-400 mt-2">
                    Your request to join the room is now pending approval from the manager. We'll notify you once it's reviewed.
                </p>
                <div className="mt-8 space-y-3">
                    <button
                        onClick={handleWithdraw}
                        className="w-full px-4 py-2.5 bg-red-500 text-white font-semibold rounded-lg hover:bg-red-600 transition-colors"
                    >
                        Withdraw Request
                    </button>
                    <button onClick={logout} className="w-full px-4 py-2.5 bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 font-semibold rounded-lg hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors">
                        Logout
                    </button>
                </div>
            </div>
        </div>
    );
};

export default PendingApprovalPage;