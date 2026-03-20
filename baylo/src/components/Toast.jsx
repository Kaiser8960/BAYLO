import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const Toast = ({ message, type = 'success', onClose, duration = null }) => {
  // Default durations: success/error = 3s, warning = 6s
  const defaultDuration = duration !== null ? duration : (type === 'warning' ? 6000 : 3000);

  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, defaultDuration);

    return () => clearTimeout(timer);
  }, [onClose, defaultDuration]);

  const getBorderColor = () => {
    if (type === 'success') return 'border-green-500';
    if (type === 'warning') return 'border-yellow-500';
    return 'border-red-500';
  };

  const getIconColor = () => {
    if (type === 'success') return 'text-green-500';
    if (type === 'warning') return 'text-yellow-500';
    return 'text-red-500';
  };

  const getTextColor = () => {
    if (type === 'success') return 'text-green-800';
    if (type === 'warning') return 'text-yellow-800';
    return 'text-red-800';
  };

  const getButtonColor = () => {
    if (type === 'success') return 'text-green-500 hover:text-green-600 focus:ring-green-600';
    if (type === 'warning') return 'text-yellow-500 hover:text-yellow-600 focus:ring-yellow-600';
    return 'text-red-500 hover:text-red-600 focus:ring-red-600';
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -50, scale: 0.3 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.5, transition: { duration: 0.2 } }}
      className={`fixed top-4 right-4 z-50 max-w-sm w-full bg-white rounded-lg shadow-xl border-l-4 ${getBorderColor()} ${
        type === 'warning' ? 'ring-2 ring-yellow-200' : ''
      }`}
    >
      <div className="p-4">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            {type === 'success' ? (
              <svg className={`h-5 w-5 ${getIconColor()}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            ) : type === 'warning' ? (
              <svg className={`h-5 w-5 ${getIconColor()}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            ) : (
              <svg className={`h-5 w-5 ${getIconColor()}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            )}
          </div>
          <div className="ml-3 w-0 flex-1">
            <p className={`text-sm font-medium ${getTextColor()} whitespace-pre-line`}>
              {message}
            </p>
          </div>
          <div className="ml-4 flex-shrink-0 flex">
            <button
              className={`inline-flex rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 ${getButtonColor()}`}
              onClick={onClose}
            >
              <span className="sr-only">Close</span>
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

const ToastContainer = ({ toasts, removeToast }) => {
  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      <AnimatePresence>
        {toasts.map((toast) => (
          <Toast
            key={toast.id}
            message={toast.message}
            type={toast.type}
            duration={toast.duration}
            onClose={() => removeToast(toast.id)}
          />
        ))}
      </AnimatePresence>
    </div>
  );
};

// Hook for managing toasts
export const useToast = () => {
  const [toasts, setToasts] = useState([]);

  const addToast = (message, type = 'success', duration = null) => {
    const id = Date.now() + Math.random();
    setToasts(prev => [...prev, { id, message, type, duration }]);
  };

  const removeToast = (id) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  const showSuccess = (message, duration = null) => addToast(message, 'success', duration);
  const showError = (message, duration = null) => addToast(message, 'error', duration);
  const showWarning = (message, duration = 6000) => addToast(message, 'warning', duration);

  return {
    toasts,
    addToast,
    removeToast,
    showSuccess,
    showError,
    showWarning,
    ToastContainer: () => <ToastContainer toasts={toasts} removeToast={removeToast} />
  };
};

export default Toast;



