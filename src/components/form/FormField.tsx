import React from 'react';
import clsx from 'clsx';

export interface FormFieldProps {
  label: string;
  error?: string | null;
  required?: boolean;
  children: React.ReactNode;
  className?: string;
}

export const FormField: React.FC<FormFieldProps> = ({ label, error, required, children, className }) => {
  return (
    <div className={clsx('flex flex-col gap-1.5 w-full', className)}>
      <label className="text-sm font-medium text-slate-700">
        {label}
        {required && <span className="text-danger ml-1">*</span>}
      </label>
      {children}
      {error && <span className="text-xs text-danger mt-0.5">{error}</span>}
    </div>
  );
};
