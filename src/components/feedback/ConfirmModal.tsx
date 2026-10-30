import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { FiAlertTriangle, FiCheckCircle, FiInfo, FiX, FiCheck } from 'react-icons/fi';

export interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void | Promise<void>;
  title: string;
  badge?: string;
  message?: React.ReactNode;
  children?: React.ReactNode;
  confirmText?: string;
  cancelText?: string;
  variant?: 'primary' | 'success' | 'danger' | 'warning' | 'info';
  isLoading?: boolean;
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  badge,
  message,
  children,
  confirmText = 'Xác nhận',
  cancelText = 'Hủy bỏ',
  variant = 'primary',
  isLoading = false,
}) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape' && !isLoading) onClose();
      };
      window.addEventListener('keydown', handleKeyDown);
      return () => {
        window.removeEventListener('keydown', handleKeyDown);
        document.body.style.overflow = '';
      };
    } else {
      document.body.style.overflow = '';
    }
  }, [isOpen, isLoading, onClose]);

  if (!isOpen) return null;

  const config = {
    primary: {
      headerBg: 'bg-gradient-to-r from-emerald-50 via-teal-50/50 to-white',
      badgeBg: 'bg-emerald-100 text-emerald-800 border-emerald-200',
      defaultBadge: 'Xác nhận',
      iconBox: 'bg-emerald-500 text-white shadow-sm shadow-emerald-500/20',
      icon: <FiCheck className="w-5 h-5 stroke-[2.5]" />,
      btnClass: 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 shadow-md shadow-emerald-600/20',
    },
    success: {
      headerBg: 'bg-gradient-to-r from-emerald-50 via-teal-50/50 to-white',
      badgeBg: 'bg-emerald-100 text-emerald-800 border-emerald-200',
      defaultBadge: 'Thành công',
      iconBox: 'bg-emerald-500 text-white shadow-sm shadow-emerald-500/20',
      icon: <FiCheckCircle className="w-5 h-5 stroke-[2.5]" />,
      btnClass: 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 shadow-md shadow-emerald-600/20',
    },
    danger: {
      headerBg: 'bg-gradient-to-r from-rose-50 via-red-50/40 to-white',
      badgeBg: 'bg-rose-100 text-rose-800 border-rose-200',
      defaultBadge: 'Xóa / Hủy',
      iconBox: 'bg-rose-500 text-white shadow-sm shadow-rose-500/20',
      icon: <FiAlertTriangle className="w-5 h-5 stroke-[2.5]" />,
      btnClass: 'bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-700 hover:to-red-700 shadow-md shadow-rose-600/20',
    },
    warning: {
      headerBg: 'bg-gradient-to-r from-amber-50 via-yellow-50/40 to-white',
      badgeBg: 'bg-amber-100 text-amber-800 border-amber-200',
      defaultBadge: 'Cảnh báo',
      iconBox: 'bg-amber-500 text-white shadow-sm shadow-amber-500/20',
      icon: <FiAlertTriangle className="w-5 h-5 stroke-[2.5]" />,
      btnClass: 'bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 shadow-md shadow-amber-500/20',
    },
    info: {
      headerBg: 'bg-gradient-to-r from-blue-50 via-sky-50/40 to-white',
      badgeBg: 'bg-blue-100 text-blue-800 border-blue-200',
      defaultBadge: 'Thông tin',
      iconBox: 'bg-blue-500 text-white shadow-sm shadow-blue-500/20',
      icon: <FiInfo className="w-5 h-5 stroke-[2.5]" />,
      btnClass: 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-md shadow-blue-600/20',
    },
  };

  const current = config[variant];

  const modalContent = (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs transition-opacity"
      onClick={(e) => {
        if (e.target === e.currentTarget && !isLoading) onClose();
      }}
    >
      <div 
        className="bg-white rounded-3xl shadow-2xl border border-slate-100 w-full max-w-md overflow-hidden transform transition-all animate-in fade-in zoom-in-95 duration-150"
        role="dialog"
        aria-modal="true"
      >
        {/* Header Bar with Gradient */}
        <div className={`px-6 pt-5 pb-4 border-b border-slate-100 flex items-center justify-between ${current.headerBg}`}>
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 ${current.iconBox}`}>
              {current.icon}
            </div>
            <div>
              <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${current.badgeBg}`}>
                {badge || current.defaultBadge}
              </span>
              <h3 className="text-lg font-extrabold text-slate-900 mt-0.5 tracking-tight leading-tight">
                {title}
              </h3>
            </div>
          </div>
          
          <button
            onClick={onClose}
            disabled={isLoading}
            className="w-8 h-8 rounded-full bg-white/80 hover:bg-slate-100 text-slate-400 hover:text-slate-700 flex items-center justify-center transition-colors shadow-2xs border border-slate-200/60 disabled:opacity-50 cursor-pointer"
            title="Đóng (Esc)"
          >
            <FiX className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-4">
          {message && (
            <div className="text-sm text-slate-600 leading-relaxed font-medium">
              {message}
            </div>
          )}
          {children}
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 bg-slate-50/80 border-t border-slate-100 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="px-5 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-100 text-slate-700 font-bold text-sm shadow-2xs transition-all cursor-pointer disabled:opacity-50"
          >
            {cancelText}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isLoading}
            className={`px-6 py-2.5 rounded-xl text-white font-bold text-sm shadow-md transition-all flex items-center gap-2 cursor-pointer active:scale-95 disabled:opacity-50 ${current.btnClass}`}
          >
            {isLoading && (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            )}
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};

export default ConfirmModal;
