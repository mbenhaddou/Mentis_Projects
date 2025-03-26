import React, { createContext, useContext, useState } from 'react';

// Create a context for the toast
const ToastContext = createContext();

// Create a standalone toast function that can be exported
let toastFn = () => {
  console.error('Toast function called before ToastProvider was mounted');
};

// Toast helper functions
const createToast = (setToasts, { title, description, variant = 'default', duration = 5000 }) => {
  const id = Math.random().toString(36).substring(2, 9);

  // Add the toast to the array
  setToasts((prevToasts) => [
    ...prevToasts,
    { id, title, description, variant, duration },
  ]);

  // Remove the toast after the duration
  setTimeout(() => {
    setToasts((prevToasts) => prevToasts.filter((toast) => toast.id !== id));
  }, duration);
};

// Toast provider component
export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  // Setup the toast functions
  const toast = {
    // Main function that acts as the default
    show: (props) => createToast(setToasts, props),

    // Helper convenience methods
    success: (message) => createToast(setToasts, {
      title: "Success",
      description: message,
      variant: "success"
    }),
    error: (message) => createToast(setToasts, {
      title: "Error",
      description: message,
      variant: "error"
    }),
    warning: (message) => createToast(setToasts, {
      title: "Warning",
      description: message,
      variant: "warning"
    }),
    info: (message) => createToast(setToasts, {
      title: "Info",
      description: message,
      variant: "default"
    }),
  };

  // Update the standalone export
  toastFn = toast;

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div className="toast-container fixed bottom-4 right-4 z-50 flex flex-col gap-2">
        {toasts.map((t) => (
          <Toast key={t.id} toast={t} onClose={() => {
            setToasts((prevToasts) => prevToasts.filter((toast) => toast.id !== t.id));
          }} />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

// Hook for using the toast
export function useToast() {
  const context = useContext(ToastContext);
  if (context === undefined) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}

// Export the standalone toast function
export const toast = toastFn;

// Toast component
function Toast({ toast, onClose }) {
  const { title, description, variant } = toast;

  // Styles based on variant
  const variantStyles = {
    default: 'bg-white border-gray-200',
    success: 'bg-green-50 border-green-400',
    error: 'bg-red-50 border-red-400',
    warning: 'bg-yellow-50 border-yellow-400',
    destructive: 'bg-red-50 border-red-400 text-red-800',
  };

  return (
    <div
      className={`rounded-md border p-4 shadow-md transition-all ${
        variantStyles[variant] || variantStyles.default
      }`}
      role="alert"
    >
      <div className="flex items-start justify-between">
        <div>
          {title && <h3 className="font-medium">{title}</h3>}
          {description && <p className="text-sm mt-1">{description}</p>}
        </div>
        <button
          onClick={onClose}
          className="ml-4 inline-flex h-5 w-5 items-center justify-center rounded-full text-gray-500 hover:bg-gray-200"
        >
          <span className="sr-only">Close</span>
          <svg
            className="h-3 w-3"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
              clipRule="evenodd"
            />
          </svg>
        </button>
      </div>
    </div>
  );
}