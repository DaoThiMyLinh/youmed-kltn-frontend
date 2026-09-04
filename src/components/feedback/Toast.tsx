import React from 'react';
import clsx from 'clsx';
import { FiCheckCircle, FiXCircle, FiInfo, FiAlertTriangle, FiX } from 'react-icons/fi';

export interface ToastProps {
  id?: string;
  type?: 'success' | 'error' | 'info' | 'warning';
  title: string;
  message?: string;
  onClose?: () => void;
  className?: string;
}

export const Toast: React.FC<ToastProps> = ({ type = 'info', title, message, onClose, className }) => {
  const icons = {
    success: <FiCheckCircle className="text-green-500 w-5 h-5" />,
    error: <FiXCircle className="text-red-500 w-5 h-5" />,
    info: <FiInfo className="text-blue-500 w-5 h-5" />,
    warning: <FiAlertTriangle className="text-yellow-500 w-5 h-5" />,
  };

  const bgColors = {
    success: 'bg-green-50 border-green-200',
    error: 'bg-red-50 border-red-200',
    info: 'bg-blue-50 border-blue-200',
    warning: 'bg-yellow-50 border-yellow-200',
  };

  return (
    <div className={clsx('flex items-start p-4 border rounded-lg shadow-md max-w-sm w-full', bgColors[type], className)}>
      <div className="flex-shrink-0 mr-3 mt-0.5">
        {icons[type]}
      </div>
      <div className="flex-1">
        <h4 className="text-sm font-semibold text-slate-900">{title}</h4>
        {message && <p className="text-sm text-slate-600 mt-1">{message}</p>}
      </div>
      {onClose && (
        <button type="button" onClick={onClose} className="flex-shrink-0 ml-4 text-slate-400 hover:text-slate-600 focus:outline-none">
          <FiX className="w-4 h-4" />
        </button>
      )}
    </div>
  );
};
