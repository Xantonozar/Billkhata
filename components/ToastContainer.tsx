import React from 'react';
import { useNotifications } from '../contexts/NotificationContext';
import Toast from './Toast';

const ToastContainer: React.FC = () => {
    const { toasts, addToast } = useNotifications(); // addToast is not used here but destructuring to show context provides it

    // This is a simple implementation. A more robust one might handle multiple toasts being added in quick succession.
    const activeToast = toasts[toasts.length - 1]; // Show one toast at a time for simplicity

    return (
        <div
            aria-live="assertive"
            className="fixed inset-0 flex items-end px-4 py-6 pointer-events-none sm:p-6 sm:items-start z-[100]"
        >
            <div className="w-full flex flex-col items-center space-y-4 sm:items-end">
                {toasts.map(toast => (
                    <Toast 
                        key={toast.id}
                        toast={toast}
                        onClose={() => { /* Closing is handled by timeout in context for this demo */ }}
                    />
                ))}
            </div>
        </div>
    );
};

export default ToastContainer;