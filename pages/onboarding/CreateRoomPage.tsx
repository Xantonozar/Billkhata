import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { HouseIcon, SpinnerIcon, ClipboardIcon, CheckCircleIcon } from '../../components/Icons';
import { RoomStatus } from '../../types';

const CreateRoomPage: React.FC = () => {
    const [roomName, setRoomName] = useState('');
    const [loading, setLoading] = useState(false);
    const [generatedCode, setGeneratedCode] = useState('');
    const [copied, setCopied] = useState(false);
    const { user, setUser, logout } = useAuth();

    const handleCreateRoom = (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        // Mock API call
        setTimeout(() => {
            const code = Math.random().toString(36).substring(2, 8).toUpperCase();
            setGeneratedCode(code);
            setLoading(false);
        }, 1000);
    };

    const handleCopy = () => {
        if (!generatedCode) return;
        navigator.clipboard.writeText(generatedCode);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const finishOnboarding = () => {
        if (user) {
            const updatedUser = { ...user, roomStatus: RoomStatus.Approved, khataId: 'ROOM' + generatedCode };
            setUser(updatedUser);
            localStorage.setItem('user', JSON.stringify(updatedUser));
        }
    };

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
            <div className="text-center mb-8">
                 <h1 className="text-4xl font-bold text-primary">BillKhata</h1>
                 <p className="text-gray-500 dark:text-gray-400">Welcome, {user?.name}!</p>
            </div>

            <div className="w-full max-w-md bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 text-center">
                {!generatedCode ? (
                    <>
                        <HouseIcon className="w-16 h-16 mx-auto text-primary opacity-80" />
                        <h2 className="text-2xl font-bold text-gray-800 dark:text-white mt-4">Create Your Room</h2>
                        <p className="text-gray-500 dark:text-gray-400 mt-2 mb-6">Give your shared space a name to get started.</p>
                        <form onSubmit={handleCreateRoom}>
                            <input
                                type="text"
                                placeholder='e.g., "Apartment 3B"'
                                value={roomName}
                                onChange={(e) => setRoomName(e.target.value)}
                                className="w-full px-4 py-3 bg-gray-100 dark:bg-gray-700 border-2 border-transparent rounded-lg focus:outline-none focus:border-primary transition-colors dark:text-white"
                                required
                            />
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full mt-4 px-4 py-3 bg-primary text-white font-semibold rounded-lg hover:bg-primary-600 disabled:opacity-50 transition-colors flex items-center justify-center"
                            >
                                {loading ? <SpinnerIcon className="w-6 h-6" /> : 'Create Room'}
                            </button>
                        </form>
                    </>
                ) : (
                    <>
                        <CheckCircleIcon className="w-16 h-16 mx-auto text-green-500" />
                        <h2 className="text-2xl font-bold text-gray-800 dark:text-white mt-4">Room Created!</h2>
                        <p className="text-gray-500 dark:text-gray-400 mt-2 mb-6">Share this code with your members so they can join.</p>
                        
                        <div 
                            className="w-full flex items-center justify-between p-3 bg-gray-100 dark:bg-gray-700 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600 cursor-pointer"
                            onClick={handleCopy}
                        >
                            <p className="text-3xl font-mono tracking-widest text-gray-700 dark:text-gray-200">{generatedCode}</p>
                            {copied ? <CheckCircleIcon className="w-6 h-6 text-green-500" /> : <ClipboardIcon className="w-6 h-6 text-gray-500" />}
                        </div>

                        <button
                            onClick={finishOnboarding}
                            className="w-full mt-6 px-4 py-3 bg-primary text-white font-semibold rounded-lg hover:bg-primary-600 transition-colors"
                        >
                           Go to Dashboard
                        </button>
                    </>
                )}
            </div>
             <button onClick={logout} className="mt-8 text-sm text-gray-500 hover:underline">
                Logout
            </button>
        </div>
    );
};

export default CreateRoomPage;