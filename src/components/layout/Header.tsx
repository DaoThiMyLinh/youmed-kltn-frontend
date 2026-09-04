import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { FiMenu, FiLogOut, FiUser } from 'react-icons/fi';
import { logout, selectUserRole, selectUserName } from '../../store/features/auth/authSlice';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

interface HeaderProps {
  onMenuClick: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onMenuClick }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const role = useSelector(selectUserRole);
  const name = useSelector(selectUserName);
  const { t, i18n } = useTranslation();

  const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newLang = e.target.value;
    i18n.changeLanguage(newLang);
    localStorage.setItem('language', newLang);
  };

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  return (
    <header className="glass-effect h-16 flex items-center justify-between px-4 sticky top-0 z-10">
      <div className="flex items-center gap-4">
        <button 
          type="button"
          onClick={onMenuClick}
          className="lg:hidden p-2 text-slate-500 hover:bg-slate-100 rounded-md focus:outline-none transition-colors"
        >
          <FiMenu className="w-5 h-5" />
        </button>
        <div className="font-bold text-xl text-gradient tracking-tight hidden lg:block drop-shadow-sm">
          YouMed
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-semibold text-slate-900">{name || 'Guest User'}</p>
            <p className="text-xs text-indigo-600 font-bold">{role || 'GUEST'}</p>
          </div>
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-100 to-violet-100 flex items-center justify-center text-indigo-500 overflow-hidden border border-indigo-200 shadow-sm">
             <FiUser className="w-6 h-6 mt-1" />
          </div>
        </div>

        <div className="flex items-center">
          <select 
            className="bg-slate-50 border border-slate-200 text-slate-700 text-sm rounded-md focus:ring-primary focus:border-primary block p-1.5 outline-none font-medium cursor-pointer"
            value={i18n.language}
            onChange={handleLanguageChange}
          >
            <option value="vi">🇻🇳 Tiếng Việt</option>
            <option value="en">🇺🇸 English</option>
          </select>
        </div>

        <div className="h-6 w-px bg-slate-200 mx-1"></div>
        <button 
          type="button"
          onClick={handleLogout}
          className="p-2 text-slate-500 hover:text-danger hover:bg-red-50 rounded-md transition-colors flex items-center gap-2"
          title="Logout"
        >
          <FiLogOut className="w-5 h-5" />
          <span className="hidden sm:inline text-sm font-medium">{t('common.logout')}</span>
        </button>
      </div>
    </header>
  );
};
