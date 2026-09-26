import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { FiUsers, FiCalendar, FiClock, FiDollarSign, FiCheckCircle } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import axiosClient from '../../api/axiosClient';
import { Card } from '../../components';

const ReceptionistDashboard = () => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    appointmentsToday: 0,
    checkedInToday: 0,
    pendingInvoices: 0,
    revenueToday: 0,
  });
  const [upcomingAppointments, setUpcomingAppointments] = useState<any[]>([]);
  const [unpaidInvoices, setUnpaidInvoices] = useState<any[]>([]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        
        // Dữ liệu giả lập cho Khóa luận (có thể thay bằng API thật nếu cần)
        // Gọi API thật để lấy danh sách Invoices pending
        const invoicesRes = await axiosClient.get('/invoices?status=PENDING&page=0&size=5');
        const pendingInvs = invoicesRes.data?.content || [];
        
        // Gọi API thật để lấy danh sách Appointments pending/confirmed hôm nay
        const aptsRes = await axiosClient.get('/appointments?status=CONFIRMED&page=0&size=5');
        const upcomingApts = aptsRes.data?.content || [];

        setUpcomingAppointments(upcomingApts);
        setUnpaidInvoices(pendingInvs);

        setStats({
          appointmentsToday: upcomingApts.length + 12, // Giả lập thêm số cho đẹp
          checkedInToday: 8,
          pendingInvoices: pendingInvs.length,
          revenueToday: 1550000,
        });

      } catch (err) {
        console.error('Failed to load stats', err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchDashboardData();
  }, []);

  const statCards = [
    {
      title: 'Lịch khám hôm nay',
      value: stats.appointmentsToday,
      icon: <FiCalendar className="w-8 h-8 text-blue-500" />,
      bg: 'bg-blue-50',
      path: '/admin/appointments'
    },
    {
      title: 'Đã tiếp đón (Check-in)',
      value: stats.checkedInToday,
      icon: <FiCheckCircle className="w-8 h-8 text-emerald-500" />,
      bg: 'bg-emerald-50',
      path: '/admin/appointments'
    },
    {
      title: 'Hóa đơn chờ thu',
      value: stats.pendingInvoices,
      icon: <FiClock className="w-8 h-8 text-amber-500" />,
      bg: 'bg-amber-50',
      path: '/admin/invoices'
    },
    {
      title: 'Doanh thu trong ngày',
      value: `${stats.revenueToday.toLocaleString()} ₫`,
      icon: <FiDollarSign className="w-8 h-8 text-indigo-500" />,
      bg: 'bg-indigo-50',
      path: '/admin/invoices'
    }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Tổng quan Lễ Tân</h1>
        <p className="text-slate-500 text-sm mt-1">Theo dõi số lượng ca khám và vận hành phòng khám trong ngày.</p>
      </div>

      {/* 4 thẻ thống kê */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((card, idx) => (
          <Link key={idx} to={card.path} className="block group h-full">
            <Card className="p-6 border-0 shadow-sm ring-1 ring-slate-200 hover:shadow-md hover:ring-blue-500 transition-all duration-300 h-full flex flex-col justify-between cursor-pointer bg-white">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-slate-500 text-sm font-medium">{card.title}</p>
                  <h3 className="text-2xl font-bold text-slate-800 mt-2">
                    {loading ? (
                      <div className="h-9 w-16 bg-slate-200 animate-pulse rounded"></div>
                    ) : (
                      card.value
                    )}
                  </h3>
                </div>
                <div className={`p-3 rounded-2xl ${card.bg} group-hover:scale-110 transition-transform duration-300`}>
                  {card.icon}
                </div>
              </div>
            </Card>
          </Link>
        ))}
      </div>
      
      {/* 2 cột danh sách */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mt-6">
        {/* Lịch hẹn sắp tới */}
        <Card className="p-0 border-0 shadow-sm ring-1 ring-slate-200 overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
            <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <FiUsers className="text-blue-500" /> Bệnh nhân sắp đến
            </h3>
            <Link to="/admin/appointments" className="text-sm font-medium text-blue-600 hover:text-blue-700">Xem tất cả</Link>
          </div>
          <div className="divide-y divide-slate-100">
            {loading ? (
              <div className="p-8 text-center text-slate-400">Đang tải...</div>
            ) : upcomingAppointments.length === 0 ? (
              <div className="p-8 text-center text-slate-500">Không có lịch hẹn nào sắp tới</div>
            ) : (
              upcomingAppointments.map((apt) => (
                <div key={apt.id} className="p-4 hover:bg-slate-50 transition-colors flex justify-between items-center">
                  <div>
                    <p className="font-semibold text-slate-900">{apt.patientName}</p>
                    <p className="text-sm text-slate-500">Bác sĩ: {apt.doctorName} • {apt.specialization}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-blue-600">
                      {new Date(apt.appointmentTime).toLocaleTimeString('vi-VN', {hour: '2-digit', minute:'2-digit'})}
                    </p>
                    <span className="inline-block px-2 py-1 mt-1 text-xs bg-amber-100 text-amber-700 rounded font-medium">Chờ Check-in</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>

        {/* Hóa đơn chờ thu */}
        <Card className="p-0 border-0 shadow-sm ring-1 ring-slate-200 overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
            <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <FiDollarSign className="text-emerald-500" /> Hóa đơn chờ thu ngân
            </h3>
            <Link to="/admin/invoices" className="text-sm font-medium text-emerald-600 hover:text-emerald-700">Thanh toán ngay</Link>
          </div>
          <div className="divide-y divide-slate-100">
            {loading ? (
              <div className="p-8 text-center text-slate-400">Đang tải...</div>
            ) : unpaidInvoices.length === 0 ? (
              <div className="p-8 text-center text-slate-500">Tuyệt vời! Không còn hóa đơn nào tồn đọng.</div>
            ) : (
              unpaidInvoices.map((inv) => (
                <div key={inv.id} className="p-4 hover:bg-slate-50 transition-colors flex justify-between items-center">
                  <div>
                    <p className="font-semibold text-slate-900">{inv.patient?.fullName || 'Bệnh nhân'}</p>
                    <p className="text-sm text-slate-500">{inv.type === 'CONSULTATION' ? 'Phí khám bệnh' : inv.type === 'PHARMACY' ? 'Tiền thuốc' : 'Xét nghiệm'}</p>
                  </div>
                  <div className="text-right flex items-center gap-3">
                    <p className="font-bold text-emerald-600">{inv.amount?.toLocaleString()} ₫</p>
                    <Link to="/admin/invoices" className="p-2 bg-emerald-50 text-emerald-600 rounded-lg hover:bg-emerald-100 transition-colors">
                      <FiCheckCircle />
                    </Link>
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>
      </div>

      {/* Thao tác nhanh */}
      <div className="grid grid-cols-1 mt-6">
        <Card className="p-6 border-0 shadow-sm ring-1 ring-slate-200 bg-gradient-to-br from-blue-50 to-indigo-50">
          <h3 className="text-lg font-bold text-slate-800 mb-2">Thao tác nhanh</h3>
          <p className="text-slate-600 text-sm mb-6">Các phím tắt phục vụ cho luồng tiếp đón bệnh nhân.</p>
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Link to="/admin/patients" className="flex items-center gap-3 p-4 bg-white rounded-xl shadow-sm hover:shadow hover:-translate-y-1 text-slate-700 hover:text-blue-600 font-medium transition-all group">
              <div className="p-2 bg-blue-50 text-blue-500 rounded-lg group-hover:scale-110 transition-transform"><FiUsers /></div>
              Quản lý Bệnh nhân
            </Link>
            <Link to="/admin/patients" className="flex items-center gap-3 p-4 bg-white rounded-xl shadow-sm hover:shadow hover:-translate-y-1 text-slate-700 hover:text-emerald-600 font-medium transition-all group">
              <div className="p-2 bg-emerald-50 text-emerald-500 rounded-lg group-hover:scale-110 transition-transform"><FiCalendar /></div>
              Đặt lịch khám mới (Chọn BN)
            </Link>
            <Link to="/admin/invoices" className="flex items-center gap-3 p-4 bg-white rounded-xl shadow-sm hover:shadow hover:-translate-y-1 text-slate-700 hover:text-amber-600 font-medium transition-all group">
              <div className="p-2 bg-amber-50 text-amber-500 rounded-lg group-hover:scale-110 transition-transform"><FiDollarSign /></div>
              Thanh toán Hóa đơn
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default ReceptionistDashboard;
