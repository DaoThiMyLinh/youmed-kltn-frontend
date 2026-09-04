import React from 'react';
import clsx from 'clsx';

export interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({ icon, title, description, action, className }) => {
  return (
    <div className={clsx('flex flex-col items-center justify-center p-8 text-center bg-surface border border-dashed border-slate-300 rounded-lg', className)}>
      {icon && <div className="text-slate-400 mb-4 text-4xl flex items-center justify-center">{icon}</div>}
      <h3 className="text-lg font-medium text-slate-900 mb-1">{title}</h3>
      {description && <p className="text-sm text-slate-500 mb-4 max-w-md">{description}</p>}
      {action && <div>{action}</div>}
    </div>
  );
};
