import React, { type InputHTMLAttributes } from 'react';
import clsx from 'clsx';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  hasError?: boolean;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, hasError, disabled, ...props }, ref) => {
    return (
      <input
        ref={ref}
        disabled={disabled}
        className={clsx(
          'flex h-10 w-full rounded-md border bg-surface px-3 py-2 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-50 transition-colors',
          hasError 
            ? 'border-danger focus:ring-danger text-danger' 
            : 'border-slate-300 focus:ring-primary focus:border-primary text-slate-900',
          className
        )}
        {...props}
      />
    );
  }
);

Input.displayName = 'Input';
