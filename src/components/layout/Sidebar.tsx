import React from 'react';
import { NavLink } from 'react-router-dom';
import clsx from 'clsx';
import { menuConfig } from '../../config/menu';
import { FiX } from 'react-icons/fi';
import { useTranslation } from 'react-i18next';

interface SidebarProps {
  role: string | null;
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ role, isOpen, onClose }) => {
  const { t } = useTranslation();
  const menuItems = role ? menuConfig[role] || [] : [];

  const getMenuKey = (title: string) => {
    const keyMap: Record<string, string> = {
      'Dashboard': 'dashboard',
      'Appointments': 'appointments',
      'Book Appointment': 'bookAppointment',
      'Medical History': 'medicalHistory',
      'Prescriptions': 'prescriptions',
      'Profile': 'profile',
      'Schedule': 'schedule',
    };
    return keyMap[title] || title.toLowerCase();
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/50 z-20 lg:hidden transition-opacity"
          onClick={onClose}
        />
      )}

      {/* Sidebar Content */}
      <aside className={clsx(
        'fixed top-0 left-0 bottom-0 z-30 w-64 glass-effect flex flex-col transition-transform duration-500 ease-out lg:translate-x-0 lg:static lg:z-0 shadow-[4px_0_24px_rgba(0,0,0,0.02)]',
        isOpen ? 'translate-x-0' : '-translate-x-full'
      )}>
        <div className="h-16 flex items-center justify-between px-6 border-b border-indigo-50/50 bg-white/40">
          <div className="font-bold text-2xl text-gradient tracking-tight drop-shadow-sm">
            YouMed
          </div>
          <button 
            type="button"
            onClick={onClose}
            className="lg:hidden p-2 text-slate-500 hover:bg-slate-100 rounded-md transition-colors"
          >
            <FiX className="w-5 h-5" />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto p-4 flex flex-col gap-1.5">
          {menuItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={() => {
                if (window.innerWidth < 1024) onClose();
              }}
              className={({ isActive }) => clsx(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-300',
                isActive 
                  ? 'bg-gradient-to-r from-indigo-500/10 to-violet-500/10 text-indigo-700 shadow-sm shadow-indigo-100/50' 
                  : 'text-slate-600 hover:bg-white/60 hover:text-indigo-600 hover:shadow-sm hover:-translate-y-0.5'
              )}
            >
              <item.icon className="w-5 h-5 flex-shrink-0" />
              {t(`menu.${getMenuKey(item.title)}`)}
            </NavLink>
          ))}
        </nav>
      </aside>
    </>
  );
};
