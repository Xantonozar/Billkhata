import React, { useState, useRef } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { KeyIcon, SpinnerIcon } from '../../components/Icons';
import { RoomStatus } from '../../types';

const JoinRoomPage: React.FC = () => {
    const [codes, setCodes] = useState(Array(6).fill(''));
    const [loading, setLoading] = useState(false);
    const { user, setUser, logout } = useAuth();
    const inputsRef = useRef<(HTMLInputElement | null)[]>([]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
        const { value } = e.target;
        if (/^[a-zA-Z0-9]$/.test(value) || value === '') {
            const newCodes = [...codes];
            newCodes[index] = value.toUpperCase();
            setCodes(newCodes);

            // Focus next input
            if (value && index < 5) {
                inputsRef.current[index + 1]?.focus();
            }
        }
    };
    
    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
        if (e.key === 'Backspace' && !codes[index] && index > 0) {
            inputsRef.current[index - 1]?.focus();
        }
    };

    const handleJoinRoom = (e: React.FormEvent) => {
        e.preventDefault();
        const roomCode = codes.join('');
        if (roomCode.length !== 6) return;
        
        setLoading(true);
        // Mock API call
        setTimeout(() => {
            if (user) {
                const updatedUser = { ...user, roomStatus: RoomStatus.Pending };
                setUser(updatedUser);
                localStorage.setItem('user', JSON.stringify(updatedUser));
            }
            setLoading(false);
        }, 1000);
    };

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
            <div className="text-center mb-8">
                 <h1 className="text-4xl font-bold text-primary">BillKhata</h1>
                 <p className="text-gray-500 dark:text-gray-400">Welcome, {user?.name}!</p>
            </div>

            <div className="w-full max-w-md bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 text-center">
                <KeyIcon className="w-16 h-16 mx-auto text-primary opacity-80" />
                <h2 className="text-2xl font-bold text-gray-800 dark:text-white mt-4">Join a Room</h2>
                <p className="text-gray-500 dark:text-gray-400 mt-2 mb-6">Enter the 6-digit room code from your manager.</p>
                
                <form onSubmit={handleJoinRoom}>
                    <div className="flex justify-center gap-2 mb-4">
                        {codes.map((code, index) => (
                            <input
                                key={index}
                                // FIX: Wrapped ref callback in braces to ensure a void return type.
                                ref={el => { inputsRef.current[index] = el; }}
                                type="text"
                                maxLength={1}
                                value={code}
                                onChange={(e) => handleInputChange(e, index)}
                                onKeyDown={(e) => handleKeyDown(e, index)}
                                className="w-12 h-14 text-center text-2xl font-bold bg-gray-100 dark:bg-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                            />
                        ))}
                    </div>

                    <button
                        type="submit"
                        disabled={loading || codes.join('').length < 6}
                        className="w-full mt-4 px-4 py-3 bg-primary text-white font-semibold rounded-lg hover:bg-primary-600 disabled:opacity-50 transition-colors flex items-center justify-center"
                    >
                        {loading ? <SpinnerIcon className="w-6 h-6" /> : 'Request to Join'}
                    </button>
                </form>
            </div>
             <button onClick={logout} className="mt-8 text-sm text-gray-500 hover:underline">
                Logout
            </button>
        </div>
    );
};

export default JoinRoomPage;