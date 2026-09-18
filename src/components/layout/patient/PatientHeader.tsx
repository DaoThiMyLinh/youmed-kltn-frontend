import { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { FiUser, FiLogOut, FiMenu, FiX } from 'react-icons/fi';
import { selectIsAuthenticated, selectUserName, logout } from '../../../store/features/auth/authSlice';
import { useTranslation } from 'react-i18next';

export const PatientHeader = () => {
  const { i18n } = useTranslation();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const name = useSelector(selectUserName);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  const navLinks = [
    { name: 'Trang chủ', path: '/patient' },
    { name: 'Bác sĩ', path: '/patient/doctors' },
    { name: 'Chuyên khoa', path: '/patient/specialties' },
    { name: 'Lịch hẹn', path: '/patient/appointments' },
    { name: 'Lịch sử khám', path: '/patient/history' },
  ];

  const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newLang = e.target.value;
    i18n.changeLanguage(newLang);
    localStorage.setItem('language', newLang);
  };

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          {/* Logo */}
          <div className="flex-shrink-0 flex items-center">
            <Link to="/patient" className="font-bold text-2xl text-gradient tracking-tight drop-shadow-sm text-emerald-600">
              YouMed
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-8">
            {navLinks.map((link) => (
              <NavLink
                key={link.path}
                to={link.path}
                className={({ isActive }) =>
                  `text-sm font-medium transition-colors ${isActive ? 'text-emerald-600 border-b-2 border-emerald-600' : 'text-slate-600 hover:text-emerald-600'
                  } py-5`
                }
                end={link.path === '/patient'}
              >
                {link.name}
              </NavLink>
            ))}
          </nav>

          {/* Right Section */}
          <div className="hidden md:flex items-center space-x-4">
            <select
              className="bg-slate-50 border border-slate-200 text-slate-700 text-sm rounded-md focus:ring-emerald-500 focus:border-emerald-500 block p-1.5 outline-none font-medium cursor-pointer"
              value={i18n.language}
              onChange={handleLanguageChange}
            >
              <option value="vi">🇻🇳 VN</option>
              <option value="en">🇺🇸 EN</option>
            </select>

            {isAuthenticated ? (
              <div className="flex items-center space-x-4">
                <Link to="/patient/profile" className="flex items-center space-x-2 text-slate-700 hover:text-emerald-600">
                  <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600">
                    <FiUser className="w-5 h-5" />
                  </div>
                  <span className="text-sm font-medium">{name || 'Cá nhân'}</span>
                </Link>
                <button
                  onClick={handleLogout}
                  className="text-slate-500 hover:text-red-500 transition-colors"
                  title="Đăng xuất"
                >
                  <FiLogOut className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <Link
                  to="/register"
                  className="text-emerald-600 bg-emerald-50 px-4 py-2 rounded-md text-sm font-medium hover:bg-emerald-100 transition-colors"
                >
                  Đăng ký
                </Link>
                <Link
                  to="/login"
                  className="bg-emerald-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-emerald-700 transition-colors shadow-sm"
                >
                  Đăng nhập
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="flex items-center md:hidden">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="text-slate-500 hover:text-emerald-600 focus:outline-none"
            >
              {isMobileMenuOpen ? <FiX className="w-6 h-6" /> : <FiMenu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-white border-t border-slate-100">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className="block px-3 py-2 rounded-md text-base font-medium text-slate-700 hover:text-emerald-600 hover:bg-emerald-50"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {link.name}
              </Link>
            ))}
            {isAuthenticated ? (
              <>
                <Link
                  to="/patient/profile"
                  className="block px-3 py-2 rounded-md text-base font-medium text-slate-700 hover:text-emerald-600 hover:bg-emerald-50"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Hồ sơ cá nhân
                </Link>
                <button
                  onClick={() => {
                    handleLogout();
                    setIsMobileMenuOpen(false);
                  }}
                  className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-red-600 hover:bg-red-50"
                >
                  Đăng xuất
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/register"
                  className="block px-3 py-2 rounded-md text-base font-medium text-slate-700 hover:text-emerald-600 hover:bg-emerald-50"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Đăng ký
                </Link>
                <Link
                  to="/login"
                  className="block px-3 py-2 rounded-md text-base font-medium text-emerald-600 hover:bg-emerald-50"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Đăng nhập
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
