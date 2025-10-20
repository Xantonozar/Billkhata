import React, { useState } from 'react';
import { useNotifications, Notification } from '../contexts/NotificationContext';
import { XIcon, BillsIcon, MealIcon, CheckCircleIcon, UsersIcon } from './Icons';

const NotificationIcon: React.FC<{ type: Notification['type'] }> = ({ type }) => {
    switch (type) {
        case 'bill': return <BillsIcon className="w-5 h-5 text-blue-500" />;
        case 'payment': return <CheckCircleIcon className="w-5 h-5 text-green-500" />;
        case 'meal': return <MealIcon className="w-5 h-5 text-orange-500" />;
        case 'room': return <UsersIcon className="w-5 h-5 text-purple-500" />;
        default: return null;
    }
};

interface NotificationsPanelProps {
    isOpen: boolean;
    onClose: () => void;
}

const NotificationsPanel: React.FC<NotificationsPanelProps> = ({ isOpen, onClose }) => {
    const { notifications, unreadCount, markAllAsRead, markAsRead } = useNotifications();
    const [filter, setFilter] = useState<'All' | 'Unread'>('All');

    const filteredNotifications = notifications.filter(n => filter === 'Unread' ? !n.read : true);

    return (
        <div className={`fixed inset-0 z-50 transition-transform transform ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
            <div className="absolute inset-0 bg-black bg-opacity-50" onClick={onClose}></div>
            <div className="relative w-full max-w-sm h-full bg-white dark:bg-gray-800 float-right flex flex-col">
                {/* Header */}
                <div className="flex-shrink-0 p-4 border-b border-gray-200 dark:border-gray-700">
                    <div className="flex justify-between items-center">
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white">Notifications</h2>
                        <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700">
                            <XIcon className="w-6 h-6 text-gray-500" />
                        </button>
                    </div>
                    <div className="mt-4 flex justify-between items-center">
                        <div className="flex gap-2">
                            <button onClick={() => setFilter('All')} className={`px-3 py-1 text-sm rounded-md ${filter === 'All' ? 'bg-primary-100 text-primary dark:bg-primary-500/20' : 'hover:bg-gray-100 dark:hover:bg-gray-700'}`}>All</button>
                            <button onClick={() => setFilter('Unread')} className={`px-3 py-1 text-sm rounded-md ${filter === 'Unread' ? 'bg-primary-100 text-primary dark:bg-primary-500/20' : 'hover:bg-gray-100 dark:hover:bg-gray-700'}`}>Unread ({unreadCount})</button>
                        </div>
                        <button onClick={markAllAsRead} className="text-sm font-medium text-primary hover:underline">Mark all as read</button>
                    </div>
                </div>

                {/* Body */}
                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                    {filteredNotifications.map(notif => (
                        <div key={notif.id} className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg flex gap-4 relative" onClick={() => markAsRead(notif.id)}>
                            {!notif.read && <div className="absolute left-1 top-1/2 -translate-y-1/2 w-2 h-2 bg-blue-500 rounded-full"></div>}
                            <div className="flex-shrink-0 pt-1"><NotificationIcon type={notif.type} /></div>
                            <div>
                                <h3 className="font-semibold text-gray-800 dark:text-white">{notif.title}</h3>
                                <p className="text-sm text-gray-600 dark:text-gray-300">{notif.message}</p>
                                {notif.actionText && <button className="mt-2 text-sm font-semibold text-primary hover:underline">{notif.actionText}</button>}
                                <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">{notif.timestamp}</p>
                            </div>
                        </div>
                    ))}
                    {filteredNotifications.length > 5 && <button className="w-full text-center text-sm font-semibold text-primary hover:underline p-2">Load More...</button>}
                </div>
            </div>
        </div>
    );
};

export default NotificationsPanel;
