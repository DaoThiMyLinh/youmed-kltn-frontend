import { useEffect, useState } from 'react';
import { Card, Badge, ErrorMessage, Loading, Button } from '../../components';
import { FiUsers, FiCalendar, FiClock, FiCheckCircle, FiXCircle, FiArrowRight } from 'react-icons/fi';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { managerService } from '../../services/manager.service';
import type { Doctor } from '../../types/appointment';
import type { ScheduleModel } from '../../types/schedule';
import { useSelector } from 'react-redux';
import { selectUserName } from '../../store/features/auth/authSlice';

const ManagerDashboard = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const userName = useSelector(selectUserName);

  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [schedules, setSchedules] = useState<ScheduleModel[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        setError(null);
        const [doctorsData, schedulesData] = await Promise.all([
          managerService.getManagerDoctors(),
          managerService.getManagerSchedules()
        ]);
        setDoctors(doctorsData);
        setSchedules(schedulesData);
      } catch (err: any) {
        setError(err.response?.data?.message || t('manager.dashboardLoadError', 'Có lỗi xảy ra khi tải dữ liệu tổng quan.'));
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [t]);

  if (loading) {
    return <Loading />;
  }

  const pendingSchedules = schedules.filter(s => s.status === 'PENDING');
  const approvedSchedules = schedules.filter(s => s.status === 'APPROVED');
  const rejectedSchedules = schedules.filter(s => s.status === 'REJECTED');
  
  const recentPending = pendingSchedules.slice(0, 5);
  const doctorPreview = doctors.slice(0, 4);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            {t('manager.welcome', 'Xin chào,')} {userName || t('manager.managerTitle', 'Trưởng Khoa')} 👋
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            {t('manager.dashboardDesc', 'Quản lý bác sĩ và phê duyệt lịch làm việc của khoa.')}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => navigate('/manager/doctors')} leftIcon={<FiUsers />}>
            {t('manager.viewDoctors', 'Xem Bác sĩ')}
          </Button>
          <Button onClick={() => navigate('/manager/schedules')} leftIcon={<FiCalendar />}>
            {t('manager.approveSchedules', 'Duyệt lịch')}
          </Button>
        </div>
      </div>

      <ErrorMessage message={error} />

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4 flex items-center gap-4 border-l-4 border-l-primary hover:shadow-md transition-shadow">
          <div className="p-3 bg-primary/10 rounded-lg text-primary">
            <FiUsers className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm text-slate-500 font-medium">{t('manager.totalDoctors', 'Bác sĩ thuộc khoa')}</p>
            <h3 className="text-2xl font-bold text-slate-800">{doctors.length}</h3>
          </div>
        </Card>
        
        <Card className="p-4 flex items-center gap-4 border-l-4 border-l-amber-500 hover:shadow-md transition-shadow">
          <div className="p-3 bg-amber-50 rounded-lg text-amber-500">
            <FiClock className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm text-slate-500 font-medium">{t('manager.pendingSchedules', 'Lịch chờ duyệt')}</p>
            <h3 className="text-2xl font-bold text-slate-800">{pendingSchedules.length}</h3>
          </div>
        </Card>

        <Card className="p-4 flex items-center gap-4 border-l-4 border-l-emerald-500 hover:shadow-md transition-shadow">
          <div className="p-3 bg-emerald-50 rounded-lg text-emerald-500">
            <FiCheckCircle className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm text-slate-500 font-medium">{t('manager.approvedSchedules', 'Lịch đã duyệt')}</p>
            <h3 className="text-2xl font-bold text-slate-800">{approvedSchedules.length}</h3>
          </div>
        </Card>

        <Card className="p-4 flex items-center gap-4 border-l-4 border-l-rose-500 hover:shadow-md transition-shadow">
          <div className="p-3 bg-rose-50 rounded-lg text-rose-500">
            <FiXCircle className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm text-slate-500 font-medium">{t('manager.rejectedSchedules', 'Lịch bị từ chối')}</p>
            <h3 className="text-2xl font-bold text-slate-800">{rejectedSchedules.length}</h3>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Pending Schedules Section */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold text-slate-800">{t('manager.recentPendingSchedules', 'Lịch đang chờ duyệt gần đây')}</h2>
            <button 
              onClick={() => navigate('/manager/schedules')}
              className="text-sm text-primary hover:text-emerald-700 font-medium flex items-center gap-1 transition-colors"
            >
              {t('manager.viewAll', 'Xem tất cả')} <FiArrowRight />
            </button>
          </div>
          
          <Card className="overflow-hidden">
            {recentPending.length === 0 ? (
              <div className="p-8 text-center text-slate-500">
                {t('manager.noPendingSchedules', 'Không có lịch làm việc nào đang chờ duyệt.')}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left whitespace-nowrap">
                  <thead className="bg-slate-50 text-slate-500 font-medium border-b border-slate-200">
                    <tr>
                      <th className="px-4 py-3">{t('manager.doctor', 'Bác sĩ')}</th>
                      <th className="px-4 py-3">{t('manager.workingDate', 'Ngày làm việc')}</th>
                      <th className="px-4 py-3">{t('manager.time', 'Thời gian')}</th>
                      <th className="px-4 py-3 text-right">{t('manager.actions', 'Thao tác')}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {recentPending.map(schedule => (
                      <tr key={schedule.id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-4 py-3 font-medium text-slate-800">{schedule.doctorName}</td>
                        <td className="px-4 py-3 text-slate-600">{schedule.workingDate}</td>
                        <td className="px-4 py-3 text-slate-600">{schedule.startTime} - {schedule.endTime}</td>
                        <td className="px-4 py-3 text-right">
                          <Button size="sm" variant="outline" onClick={() => navigate('/manager/schedules')}>
                            {t('manager.review', 'Xét duyệt')}
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        </div>

        {/* Doctor Preview Section */}
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold text-slate-800">{t('manager.doctorsInSpecialty', 'Bác sĩ trong khoa')}</h2>
            <button 
              onClick={() => navigate('/manager/doctors')}
              className="text-sm text-primary hover:text-emerald-700 font-medium flex items-center gap-1 transition-colors"
            >
              {t('manager.viewAll', 'Xem tất cả')} <FiArrowRight />
            </button>
          </div>
          
          <div className="space-y-3">
            {doctorPreview.length === 0 ? (
              <Card className="p-6 text-center text-slate-500">
                {t('manager.noDoctors', 'Không có bác sĩ')}
              </Card>
            ) : (
              doctorPreview.map(doctor => (
                <Card key={doctor.id} className="p-4 flex items-center justify-between hover:shadow-md transition-shadow cursor-pointer" onClick={() => navigate('/manager/doctors')}>
                  <div className="flex items-center gap-3 overflow-hidden">
                    <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold flex-shrink-0">
                      {doctor.fullName.charAt(0)}
                    </div>
                    <div className="truncate">
                      <p className="font-medium text-slate-800 truncate">{doctor.fullName}</p>
                      <p className="text-xs text-slate-500 truncate">{doctor.specialty?.name}</p>
                    </div>
                  </div>
                  <Badge variant={doctor.active ? 'success' : 'secondary'} className="ml-2 flex-shrink-0">
                    {doctor.active ? t('manager.active', 'Hoạt động') : t('manager.inactive', 'Tạm khóa')}
                  </Badge>
                </Card>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManagerDashboard;
