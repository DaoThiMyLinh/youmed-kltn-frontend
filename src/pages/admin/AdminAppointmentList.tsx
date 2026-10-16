import { useState, useEffect } from 'react';
import { getAllAppointments, checkInPatient } from '../../services/appointment.service';
import type { Appointment, AppointmentStatus } from '../../types/patient';
import { Card, Badge, ErrorMessage, EmptyState, Button } from '../../components';
import { FiCalendar, FiCheckCircle } from 'react-icons/fi';

const AdminAppointmentList = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Pagination & Filter
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getAllAppointments(page, 10, statusFilter);
      setAppointments(data.content);
      setTotalPages(data.totalPages);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Có lỗi xảy ra khi tải danh sách lịch hẹn.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, [page, statusFilter]);

  const handleCheckIn = async (appointmentId: number) => {
    if (!window.confirm('Xác nhận bệnh nhân đã đến và tiến hành check-in?')) return;
    try {
      await checkInPatient(appointmentId);
      alert('Check-in thành công!');
      fetchAppointments();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Có lỗi xảy ra khi check-in.');
    }
  };

  const handleConfirm = async (appointmentId: number) => {
    if (!window.confirm('Xác nhận lịch hẹn này hợp lệ?')) return;
    try {
      await import('../../services/appointment.service').then(m => m.confirmAppointment(appointmentId));
      alert('Đã xác nhận lịch khám!');
      fetchAppointments();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Có lỗi xảy ra khi xác nhận.');
    }
  };

  const getStatusBadge = (status: AppointmentStatus) => {
    switch (status) {
      case 'PENDING': return <Badge variant="warning">Chờ duyệt</Badge>;
      case 'CONFIRMED': return <Badge variant="primary">Đã xác nhận</Badge>;
      case 'CHECKED_IN': return <Badge variant="info">Đã Check-in</Badge>;
      case 'IN_PROGRESS': return <Badge variant="secondary">Đang khám</Badge>;
      case 'COMPLETED': return <Badge variant="success">Hoàn thành</Badge>;
      case 'CANCELLED': return <Badge variant="danger">Đã hủy</Badge>;
      default: return <Badge variant="secondary">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Quản lý Lịch hẹn</h1>
          <p className="text-slate-500 text-sm mt-1">Xem danh sách lịch hẹn và check-in cho bệnh nhân.</p>
        </div>
      </div>

      <Card className="p-4 border-0 shadow-sm ring-1 ring-slate-200">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex gap-4">
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(0);
              }}
              className="px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none bg-white min-w-[150px]"
            >
              <option value="ALL">Tất cả trạng thái</option>
              <option value="PENDING">Chờ duyệt</option>
              <option value="CONFIRMED">Đã xác nhận</option>
              <option value="CHECKED_IN">Đã Check-in</option>
              <option value="IN_PROGRESS">Đang khám</option>
              <option value="COMPLETED">Hoàn thành</option>
              <option value="CANCELLED">Đã hủy</option>
            </select>
          </div>
        </div>
      </Card>

      <ErrorMessage message={error} />

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
        </div>
      ) : !error && appointments.length === 0 ? (
        <EmptyState 
          icon={<FiCalendar />}
          title="Không có lịch hẹn"
          description="Không tìm thấy lịch hẹn nào phù hợp."
        />
      ) : (
        <Card className="overflow-hidden border-0 shadow-sm ring-1 ring-slate-200">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-slate-50 text-slate-500 font-medium border-b border-slate-200">
                <tr>
                  <th className="px-6 py-4">Mã ca</th>
                  <th className="px-6 py-4">Bệnh nhân</th>
                  <th className="px-6 py-4">Bác sĩ</th>
                  <th className="px-6 py-4">Thời gian</th>
                  <th className="px-6 py-4">Trạng thái</th>
                  <th className="px-6 py-4 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {appointments.map((apt) => (
                  <tr key={apt.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4 font-mono font-medium text-slate-900">
                      #{apt.id}
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-semibold text-slate-900">{apt.patientName}</div>
                      <div className="text-xs text-slate-500 mt-1 flex flex-col gap-0.5">
                        {apt.patientPhone && (
                          <span className="flex items-center gap-1">
                            <span className="font-medium text-slate-700">SĐT:</span> {apt.patientPhone}
                          </span>
                        )}
                        {apt.patientGender && (
                          <span className="flex items-center gap-1">
                            <span className="font-medium text-slate-700">Giới tính:</span> {apt.patientGender === 'MALE' ? 'Nam' : apt.patientGender === 'FEMALE' ? 'Nữ' : 'Khác'}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-medium text-slate-900">{apt.doctorName}</div>
                      {apt.specialization && (
                        <div className="text-xs px-2 py-0.5 bg-blue-50 text-blue-700 rounded-full inline-block mt-1">
                          {apt.specialization}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-slate-900 font-medium whitespace-nowrap">
                        {new Date(apt.appointmentTime).toLocaleDateString('vi-VN')}
                      </div>
                      <div className="text-sm text-slate-500 whitespace-nowrap">
                        {new Date(apt.appointmentTime).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                      </div>
                      {apt.reason && (
                        <div className="text-xs text-slate-500 mt-1.5 italic max-w-[150px] truncate" title={apt.reason}>
                          "{apt.reason}"
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {getStatusBadge(apt.status)}
                    </td>
                    <td className="px-6 py-4 text-right">
                      {apt.status === 'PENDING' && (
                        <Button 
                          size="sm"
                          onClick={() => handleConfirm(apt.id)}
                          className="mr-2 bg-blue-600 hover:bg-blue-700"
                        >
                          Xác nhận
                        </Button>
                      )}
                      {apt.status === 'CONFIRMED' && (
                        <Button 
                          size="sm"
                          onClick={() => handleCheckIn(apt.id)}
                          leftIcon={<FiCheckCircle />}
                        >
                          Check-in
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {totalPages > 1 && (
            <div className="flex justify-between items-center p-4 border-t border-slate-100 bg-slate-50">
              <div className="text-sm text-slate-500">
                Trang {page + 1} / {totalPages}
              </div>
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  disabled={page === 0} 
                  onClick={() => setPage(p => p - 1)}
                >
                  Trước
                </Button>
                <Button 
                  variant="outline" 
                  disabled={page >= totalPages - 1} 
                  onClick={() => setPage(p => p + 1)}
                >
                  Sau
                </Button>
              </div>
            </div>
          )}
        </Card>
      )}
    </div>
  );
};

export default AdminAppointmentList;
