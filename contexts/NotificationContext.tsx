import React, { createContext, useState, useContext, ReactNode } from 'react';
import type { Page } from './AuthContext';

export type ToastType = 'success' | 'warning' | 'error';
export interface Toast {
    id: number;
    type: ToastType;
    title: string;
    message: string;
}

export type NotificationType = 'bill' | 'payment' | 'meal' | 'room';
export interface Notification {
    id: number;
    type: NotificationType;
    title: string;
    message: string;
    actionText?: string;
    timestamp: string;
    read: boolean;
    link?: Page;
}

// MOCK DATA
const mockNotifications: Notification[] = [
    { id: 1, type: 'bill', title: 'New Bill Assigned', message: 'Electricity bill (₹300) - Due: Oct 15', actionText: 'View Bill', timestamp: '2 hours ago', read: false, link: 'bills-electricity' },
    { id: 2, type: 'payment', title: 'Payment Approved', message: 'Your Rent payment (₹5,000) has been approved by the manager.', timestamp: '5 hours ago', read: true, link: 'bills-rent' },
    { id: 3, type: 'meal', title: 'Meal Reminder', message: "Don't forget to log today's meals.", actionText: 'Log Now', timestamp: '6 hours ago', read: false, link: 'meals' },
    { id: 4, type: 'room', title: 'Member Joined', message: 'Amit Hossain has joined the room.', timestamp: '1 day ago', read: true, link: 'members' },
    { id: 5, type: 'payment', title: 'Payment Reminder', message: 'Your Electricity bill is due in 3 days.', timestamp: '2 days ago', read: false, link: 'bills-electricity' },
    { id: 6, type: 'bill', title: 'Bill Overdue', message: 'Your Rent bill is overdue by 7 days.', timestamp: '7 days ago', read: false, link: 'bills-rent' },
    { id: 7, type: 'meal', title: 'Shopping Approved', message: 'Your shopping expense of ₹850 has been approved.', timestamp: '8 days ago', read: false, link: 'shopping' },
];


interface NotificationContextType {
    toasts: Toast[];
    addToast: (toast: Omit<Toast, 'id'>) => void;
    notifications: Notification[];
    unreadCount: number;
    markAllAsRead: () => void;
    markAsRead: (id: number) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [toasts, setToasts] = useState<Toast[]>([]);
    const [notifications, setNotifications] = useState<Notification[]>(mockNotifications);

    const unreadCount = notifications.filter(n => !n.read).length;
    
    const addToast = (toast: Omit<Toast, 'id'>) => {
        const newToast = { ...toast, id: Date.now() };
        setToasts(prev => [...prev, newToast]);
        setTimeout(() => {
            setToasts(currentToasts => currentToasts.filter(t => t.id !== newToast.id));
        }, 5000); // Auto-dismiss after 5 seconds
    };

    const markAllAsRead = () => {
        setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    };

    const markAsRead = (id: number) => {
        setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    };

    return (
        <NotificationContext.Provider value={{ toasts, addToast, notifications, unreadCount, markAllAsRead, markAsRead }}>
            {children}
        </NotificationContext.Provider>
    );
};

export const useNotifications = () => {
    const context = useContext(NotificationContext);
    if (!context) {
        throw new Error('useNotifications must be used within a NotificationProvider');
    }
    return context;
};