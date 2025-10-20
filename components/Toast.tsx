import React, { useEffect, useState } from 'react';
import { Toast as ToastType } from '../contexts/NotificationContext';
import { CheckCircleSolidIcon, ExclamationTriangleIcon, XCircleIcon, XIcon } from './Icons';

interface ToastProps {
    toast: ToastType;
    onClose: () => void;
}

const toastConfig = {
    success: { icon: CheckCircleSolidIcon, color: 'bg-success', text: 'text-white' },
    warning: { icon: ExclamationTriangleIcon, color: 'bg-warning', text: 'text-white' },
    error: { icon: XCircleIcon, color: 'bg-danger', text: 'text-white' },
};

const Toast: React.FC<ToastProps> = ({ toast, onClose }) => {
    const { type, title, message } = toast;
    const config = toastConfig[type];
    const Icon = config.icon;
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        // Trigger fade in animation
        const timer = setTimeout(() => setVisible(true), 10);
        return () => clearTimeout(timer);
    }, []);

    const handleClose = () => {
        setVisible(false);
        // Allow fade out animation to complete before calling onClose
        setTimeout(onClose, 300);
    };

    return (
        <div 
            className={`w-full max-w-sm rounded-lg shadow-lg pointer-events-auto ring-1 ring-black ring-opacity-5 overflow-hidden transition-all duration-300 ease-in-out ${config.color} ${visible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'}`}
        >
            <div className="p-4">
                <div className="flex items-start">
                    <div className="flex-shrink-0">
                        <Icon className={`h-6 w-6 ${config.text}`} aria-hidden="true" />
                    </div>
                    <div className="ml-3 w-0 flex-1 pt-0.5">
                        <p className={`text-sm font-bold font-sans ${config.text}`}>{title}</p>
                        <p className={`mt-1 text-sm ${config.text}`}>{message}</p>
                    </div>
                    <div className="ml-4 flex-shrink-0 flex">
                        <button
                            className="inline-flex rounded-md text-white/80 hover:text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-white"
                            onClick={handleClose}
                        >
                            <span className="sr-only">Close</span>
                            <XIcon className="h-5 w-5" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Toast;