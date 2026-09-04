import React from 'react';
import clsx from 'clsx';
import { FiAlertCircle } from 'react-icons/fi';

export interface ErrorMessageProps {
  message?: string | null;
  className?: string;
}

export const ErrorMessage: React.FC<ErrorMessageProps> = ({ message, className }) => {
  if (!message) return null;

  return (
    <div className={clsx('flex items-center gap-2 p-3 rounded-md bg-red-50 text-danger text-sm border border-red-200', className)}>
      <FiAlertCircle className="w-4 h-4 flex-shrink-0" />
      <span>{message}</span>
    </div>
  );
};
