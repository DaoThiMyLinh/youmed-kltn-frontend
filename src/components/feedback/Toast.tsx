import React, { useEffect } from 'react';
import clsx from 'clsx';
import { FiCheckCircle, FiXCircle, FiInfo, FiAlertTriangle, FiX } from 'react-icons/fi';

export interface ToastProps {
  id?: string;
  type?: 'success' | 'error' | 'info' | 'warning';
  title: string;
  message?: string;
  onClose?: () => void;
  className?: string;
  duration?: number;
}

export const Toast: React.FC<ToastProps> = ({ 
  type = 'info', 
  title, 
  message, 
  onClose, 
  className,
  duration = 3500,
}) => {
  useEffect(() => {
    if (onClose && duration && duration > 0) {
      const timer = setTimeout(onClose, duration);
      return () => clearTimeout(timer);
    }
  }, [onClose, duration]);

  const config = {
    success: {
      card: 'bg-white border-emerald-200/80 shadow-lg shadow-emerald-500/5',
      iconBox: 'bg-emerald-50 text-emerald-600 border-emerald-100',
      icon: <FiCheckCircle className="w-5 h-5 text-emerald-600" />,
      titleColor: 'text-emerald-950',
    },
    error: {
      card: 'bg-white border-rose-200/80 shadow-lg shadow-rose-500/5',
      iconBox: 'bg-rose-50 text-rose-600 border-rose-100',
      icon: <FiXCircle className="w-5 h-5 text-rose-600" />,
      titleColor: 'text-rose-950',
    },
    info: {
      card: 'bg-white border-blue-200/80 shadow-lg shadow-blue-500/5',
      iconBox: 'bg-blue-50 text-blue-600 border-blue-100',
      icon: <FiInfo className="w-5 h-5 text-blue-600" />,
      titleColor: 'text-blue-950',
    },
    warning: {
      card: 'bg-white border-amber-200/80 shadow-lg shadow-amber-500/5',
      iconBox: 'bg-amber-50 text-amber-600 border-amber-100',
      icon: <FiAlertTriangle className="w-5 h-5 text-amber-600" />,
      titleColor: 'text-amber-950',
    },
  };

  const current = config[type];

  return (
    <div className={clsx(
      'flex items-start p-4 border rounded-2xl shadow-xl max-w-sm sm:max-w-md w-full bg-white backdrop-blur-md transition-all animate-in fade-in slide-in-from-bottom-3 duration-200', 
      current.card, 
      className
    )}>
      <div className={clsx('flex-shrink-0 mr-3.5 p-2 rounded-xl border', current.iconBox)}>
        {current.icon}
      </div>
      <div className="flex-1 min-w-0 pr-2">
        <h4 className={clsx('text-sm font-bold leading-snug', current.titleColor)}>{title}</h4>
        {message && <p className="text-xs text-slate-600 mt-1 leading-relaxed">{message}</p>}
      </div>
      {onClose && (
        <button 
          type="button" 
          onClick={onClose} 
          className="flex-shrink-0 ml-2 p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors focus:outline-none cursor-pointer"
          title="Đóng thông báo"
        >
          <FiX className="w-4 h-4" />
        </button>
      )}
    </div>
  );
};

