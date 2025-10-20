import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { RoomStatus } from '../../types';

const PendingApprovalPage: React.FC = () => {
    const { user, setUser, logout } = useAuth();
    
    const handleWithdraw = () => {
        // Mock API call to withdraw request
        if(user) {
            const updatedUser = { ...user, roomStatus: RoomStatus.NoRoom };
            setUser(updatedUser);
            localStorage.setItem('user', JSON.stringify(updatedUser));
        }
    };

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-900 p-4 text-center">
            <div className="w-full max-w-md bg-white dark:bg-gray-800 rounded-xl shadow-lg p-10">
                <div className="w-16 h-16 bg-yellow-100 dark:bg-yellow-500/20 rounded-full flex items-center justify-center mx-auto">
                    <svg className="w-8 h-8 text-yellow-500 dark:text-yellow-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                    </svg>
                </div>
                <h2 className="text-2xl font-bold text-gray-800 dark:text-white mt-6">Request Sent!</h2>
                <p className="text-gray-500 dark:text-gray-400 mt-2">
                    Your request to join the room is now pending approval from the manager. We'll notify you once it's reviewed.
                </p>
                <div className="mt-8 space-y-3">
                    <button
                        onClick={handleWithdraw}
                        className="w-full px-4 py-2.5 bg-red-500 text-white font-semibold rounded-lg hover:bg-red-600 transition-colors"
                    >
                        Withdraw Request
                    </button>
                    <button onClick={logout} className="w-full px-4 py-2.5 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 font-semibold rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors">
                        Logout
                    </button>
                </div>
            </div>
        </div>
    );
};

export default PendingApprovalPage;
