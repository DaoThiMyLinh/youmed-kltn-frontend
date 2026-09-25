import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { FiUsers, FiHeart, FiGrid, FiUser } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import { doctorService } from '../../services/doctor.service';
import { specialtyService } from '../../services/specialty.service';
import { userService } from '../../services/user.service';
import { Card } from '../../components';

const AdminDashboard = () => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    doctors: 0,
    specialties: 0,
    users: 0,
    patients: 0
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const [docs, specs, usrs, pats] = await Promise.all([
          doctorService.getAllDoctors(0, 1),
          specialtyService.getAllSpecialties(0, 1),
          userService.getAllUsers(0, 1),
          userService.getPatients(0, 1)
        ]);
        
        setStats({
          doctors: docs.totalElements || 0,
          specialties: specs.totalElements || 0,
          users: usrs.totalElements || 0,
          patients: pats.totalElements || 0
        });
      } catch (err) {
        console.error('Failed to load stats', err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchStats();
  }, []);

  const statCards = [
    {
      title: t('admin.dashboard.totalDoctors', 'Tổng số Bác sĩ'),
      value: stats.doctors,
      icon: <FiUser className="w-8 h-8 text-blue-500" />,
      bg: 'bg-blue-50',
      path: '/admin/doctors'
    },
    {
      title: t('admin.dashboard.totalSpecialties', 'Tổng số Chuyên khoa'),
      value: stats.specialties,
      icon: <FiGrid className="w-8 h-8 text-emerald-500" />,
      bg: 'bg-emerald-50',
      path: '/admin/specialties'
    },
    {
      title: t('admin.dashboard.totalUsers', 'Tổng số Người dùng'),
      value: stats.users,
      icon: <FiUsers className="w-8 h-8 text-purple-500" />,
      bg: 'bg-purple-50',
      path: '/admin/users'
    },
    {
      title: t('admin.dashboard.totalPatients', 'Tổng số Bệnh nhân'),
      value: stats.patients,
      icon: <FiHeart className="w-8 h-8 text-rose-500" />,
      bg: 'bg-rose-50',
      path: '/admin/patients'
    }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">{t('menu.dashboard', 'Trang chủ')}</h1>
        <p className="text-slate-500 text-sm mt-1">{t('admin.dashboard.welcome', 'Chào mừng bạn đến với bảng điều khiển dành cho Quản trị viên.')}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((card, idx) => (
          <Link key={idx} to={card.path} className="block group h-full">
            <Card className="p-6 border-0 shadow-sm ring-1 ring-slate-200 hover:shadow-md hover:ring-emerald-500 transition-all duration-300 h-full flex flex-col justify-between cursor-pointer bg-white">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-slate-500 text-sm font-medium">{card.title}</p>
                  <h3 className="text-3xl font-bold text-slate-800 mt-2">
                    {loading ? (
                      <div className="h-9 w-16 bg-slate-200 animate-pulse rounded"></div>
                    ) : (
                      card.value.toLocaleString()
                    )}
                  </h3>
                </div>
                <div className={`p-3 rounded-2xl ${card.bg} group-hover:scale-110 transition-transform duration-300`}>
                  {card.icon}
                </div>
              </div>
              <div className="mt-4 text-sm font-medium text-emerald-600 flex items-center gap-1 group-hover:text-emerald-700">
                {t('common.viewDetail', 'Chi tiết')} <span>&rarr;</span>
              </div>
            </Card>
          </Link>
        ))}
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        <Card className="p-6 border-0 shadow-sm ring-1 ring-slate-200 bg-gradient-to-br from-emerald-50 to-teal-50">
          <h3 className="text-lg font-bold text-slate-800 mb-2">{t('admin.dashboard.quickActions', 'Thao tác nhanh')}</h3>
          <p className="text-slate-600 text-sm mb-6">{t('admin.dashboard.quickActionsDesc', 'Các lối tắt truy cập nhanh vào các chức năng quản lý chính của hệ thống.')}</p>
          
          <div className="grid grid-cols-2 gap-4">
            <Link to="/admin/doctors" className="flex items-center gap-3 p-4 bg-white rounded-xl shadow-sm hover:shadow hover:-translate-y-1 text-slate-700 hover:text-emerald-600 font-medium transition-all">
              <div className="p-2 bg-slate-50 rounded-lg text-slate-500"><FiUser /></div>
              {t('menu.doctors', 'Bác sĩ')}
            </Link>
            <Link to="/admin/specialties" className="flex items-center gap-3 p-4 bg-white rounded-xl shadow-sm hover:shadow hover:-translate-y-1 text-slate-700 hover:text-emerald-600 font-medium transition-all">
              <div className="p-2 bg-slate-50 rounded-lg text-slate-500"><FiGrid /></div>
              {t('menu.specialties', 'Chuyên khoa')}
            </Link>
            <Link to="/admin/users" className="flex items-center gap-3 p-4 bg-white rounded-xl shadow-sm hover:shadow hover:-translate-y-1 text-slate-700 hover:text-emerald-600 font-medium transition-all">
              <div className="p-2 bg-slate-50 rounded-lg text-slate-500"><FiUsers /></div>
              {t('menu.users', 'Người dùng')}
            </Link>
            <Link to="/admin/patients" className="flex items-center gap-3 p-4 bg-white rounded-xl shadow-sm hover:shadow hover:-translate-y-1 text-slate-700 hover:text-emerald-600 font-medium transition-all">
              <div className="p-2 bg-slate-50 rounded-lg text-slate-500"><FiHeart /></div>
              {t('menu.patients', 'Bệnh nhân')}
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboard;
