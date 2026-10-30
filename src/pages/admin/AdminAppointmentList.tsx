import { useState, useEffect } from 'react';
import { getAllAppointments, checkInPatient } from '../../services/appointment.service';
import type { Appointment, AppointmentStatus } from '../../types/patient';
import { Card, Badge, ErrorMessage, EmptyState, Button, Toast, ConfirmModal } from '../../components';
import { FiCalendar, FiCheckCircle, FiSearch, FiX, FiRotateCcw } from 'react-icons/fi';
import { formatGender } from '../../utils/formatters';

const AdminAppointmentList = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Toast feedback state
  const [toast, setToast] = useState<{ type: 'success' | 'error' | 'info' | 'warning'; title: string; message?: string } | null>(null);

  // Modern Confirmation Modal state
  const [confirmConfig, setConfirmConfig] = useState<{
    isOpen: boolean;
    badge?: string;
    title: string;
    message: React.ReactNode;
    details?: React.ReactNode;
    confirmText?: string;
    variant?: 'primary' | 'success' | 'danger' | 'warning' | 'info';
    action: () => Promise<void>;
  }>({
    isOpen: false,
    title: '',
    message: '',
    action: async () => {},
  });
  const [actionLoading, setActionLoading] = useState(false);

  // Pagination & Filter
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [keyword, setKeyword] = useState<string>('');
  const [dateFilter, setDateFilter] = useState<string>('');

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getAllAppointments(page, 10, statusFilter, keyword, dateFilter);
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
  }, [page, statusFilter, dateFilter]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(0);
    fetchAppointments();
  };

  const handleResetFilters = () => {
    setKeyword('');
    setDateFilter('');
    setStatusFilter('ALL');
    setPage(0);
  };

  const setQuickDate = (type: 'today' | 'tomorrow' | 'all') => {
    setPage(0);
    if (type === 'all') {
      setDateFilter('');
      return;
    }
    const d = new Date();
    if (type === 'tomorrow') {
      d.setDate(d.getDate() + 1);
    }
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    setDateFilter(`${yyyy}-${mm}-${dd}`);
  };

  const handleCheckIn = (apt: Appointment) => {
    setConfirmConfig({
      isOpen: true,
      badge: 'Tiếp đón người bệnh',
      title: 'Tiếp nhận Check-in',
      message: 'Xác nhận người bệnh đã có mặt tại cơ sở y tế và hoàn tất thủ tục tiếp nhận vào phòng khám?',
      details: (
        <div className="bg-slate-50/80 rounded-2xl p-4 border border-slate-200/80 space-y-2.5">
          <div className="flex items-center justify-between pb-2 border-b border-slate-200/60">
            <span className="text-xs font-semibold text-slate-500">Mã ca khám</span>
            <span className="font-mono font-bold text-sm text-slate-900 bg-white px-2.5 py-0.5 rounded-lg border border-slate-200 shadow-2xs">
              #{apt.id}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Người bệnh</span>
            <strong className="text-slate-900 font-bold uppercase text-sm tracking-tight">{apt.patientName}</strong>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Bác sĩ phụ trách</span>
            <span className="text-slate-800 font-semibold text-sm">{apt.doctorName}</span>
          </div>
          <div className="flex items-center justify-between pt-2 border-t border-slate-200/60">
            <span className="text-xs font-semibold text-slate-500">Giờ hẹn khám</span>
            <span className="font-bold text-emerald-800 text-sm">
              {new Date(apt.appointmentTime).toLocaleDateString('vi-VN')} ({new Date(apt.appointmentTime).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })})
            </span>
          </div>
        </div>
      ),
      confirmText: 'Xác nhận Check-in',
      variant: 'success',
      action: async () => {
        try {
          setActionLoading(true);
          await checkInPatient(apt.id);
          setConfirmConfig(prev => ({ ...prev, isOpen: false }));
          setToast({
            type: 'success',
            title: 'Check-in thành công',
            message: `Đã tiếp nhận bệnh nhân ${apt.patientName} vào phòng khám.`,
          });
          fetchAppointments();
        } catch (err: any) {
          setToast({
            type: 'error',
            title: 'Check-in thất bại',
            message: err.response?.data?.message || 'Có lỗi xảy ra khi check-in cho bệnh nhân.',
          });
        } finally {
          setActionLoading(false);
        }
      },
    });
  };

  const handleConfirm = (apt: Appointment) => {
    setConfirmConfig({
      isOpen: true,
      badge: 'Duyệt lịch hẹn',
      title: 'Xác nhận lịch khám',
      message: 'Xác nhận lịch hẹn khám này hợp lệ và chuyển trạng thái sang đã xác nhận?',
      details: (
        <div className="bg-slate-50/80 rounded-2xl p-4 border border-slate-200/80 space-y-2.5">
          <div className="flex items-center justify-between pb-2 border-b border-slate-200/60">
            <span className="text-xs font-semibold text-slate-500">Mã ca khám</span>
            <span className="font-mono font-bold text-sm text-slate-900 bg-white px-2.5 py-0.5 rounded-lg border border-slate-200 shadow-2xs">
              #{apt.id}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Người bệnh</span>
            <strong className="text-slate-900 font-bold uppercase text-sm tracking-tight">{apt.patientName}</strong>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Bác sĩ khám</span>
            <span className="text-slate-800 font-semibold text-sm">{apt.doctorName}</span>
          </div>
          <div className="flex items-center justify-between pt-2 border-t border-slate-200/60">
            <span className="text-xs font-semibold text-slate-500">Thời gian hẹn</span>
            <span className="font-bold text-emerald-800 text-sm">
              {new Date(apt.appointmentTime).toLocaleDateString('vi-VN')} ({new Date(apt.appointmentTime).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })})
            </span>
          </div>
        </div>
      ),
      confirmText: 'Xác nhận duyệt',
      variant: 'primary',
      action: async () => {
        try {
          setActionLoading(true);
          const { confirmAppointment } = await import('../../services/appointment.service');
          await confirmAppointment(apt.id);
          setConfirmConfig(prev => ({ ...prev, isOpen: false }));
          setToast({
            type: 'success',
            title: 'Duyệt thành công',
            message: `Lịch hẹn #${apt.id} đã được xác nhận thành công.`,
          });
          fetchAppointments();
        } catch (err: any) {
          setToast({
            type: 'error',
            title: 'Duyệt thất bại',
            message: err.response?.data?.message || 'Có lỗi xảy ra khi xác nhận lịch hẹn.',
          });
        } finally {
          setActionLoading(false);
        }
      },
    });
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
        <form onSubmit={handleSearch} className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-end">
            {/* Keyword Search */}
            <div className="md:col-span-5">
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Tìm kiếm thông tin
              </label>
              <div className="relative">
                <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Tên người bệnh, SĐT, mã ca (#465), bác sĩ..."
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                  className="w-full pl-10 pr-8 py-2.5 rounded-xl border border-slate-200 bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none text-sm transition-all placeholder:text-slate-400"
                />
                {keyword && (
                  <button
                    type="button"
                    onClick={() => { setKeyword(''); setPage(0); }}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    <FiX className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>

            {/* Date Filter */}
            <div className="md:col-span-3">
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Ngày khám
              </label>
              <input
                type="date"
                value={dateFilter}
                onChange={(e) => {
                  setDateFilter(e.target.value);
                  setPage(0);
                }}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none text-sm transition-all text-slate-700"
              />
            </div>

            {/* Status Filter */}
            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Trạng thái
              </label>
              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setPage(0);
                }}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none text-sm transition-all text-slate-700"
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

            {/* Action Buttons */}
            <div className="md:col-span-2 flex items-center gap-2">
              <Button type="submit" leftIcon={<FiSearch className="shrink-0" />} className="flex-1 h-[42px] whitespace-nowrap shadow-xs">
                Tìm kiếm
              </Button>
              {(keyword || dateFilter || statusFilter !== 'ALL') && (
                <button
                  type="button"
                  onClick={handleResetFilters}
                  title="Đặt lại bộ lọc"
                  className="h-[42px] px-3 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-600 transition-colors flex items-center justify-center shrink-0"
                >
                  <FiRotateCcw className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* Quick Date Shortcuts */}
          <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100 text-xs">
            <span className="text-slate-400 font-medium">Lọc nhanh theo ngày:</span>
            <button
              type="button"
              onClick={() => setQuickDate('today')}
              className={`px-2.5 py-1 rounded-lg font-medium transition-all ${
                dateFilter === new Date().toISOString().split('T')[0]
                  ? 'bg-emerald-100 text-emerald-800 font-semibold ring-1 ring-emerald-300'
                  : 'bg-slate-100 hover:bg-slate-200/80 text-slate-600'
              }`}
            >
              Hôm nay
            </button>
            <button
              type="button"
              onClick={() => setQuickDate('tomorrow')}
              className="px-2.5 py-1 rounded-lg font-medium bg-slate-100 hover:bg-slate-200/80 text-slate-600 transition-all"
            >
              Ngày mai
            </button>
            {dateFilter && (
              <button
                type="button"
                onClick={() => setQuickDate('all')}
                className="text-emerald-600 hover:text-emerald-700 font-medium ml-2 underline underline-offset-2"
              >
                Xem tất cả các ngày
              </button>
            )}
          </div>
        </form>
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
                  <th className="px-6 py-4 whitespace-nowrap">Mã ca</th>
                  <th className="px-6 py-4 whitespace-nowrap">Bệnh nhân</th>
                  <th className="px-6 py-4 whitespace-nowrap">Bác sĩ</th>
                  <th className="px-6 py-4 whitespace-nowrap">Thời gian</th>
                  <th className="px-6 py-4 whitespace-nowrap text-center">Trạng thái</th>
                  <th className="px-6 py-4 whitespace-nowrap text-right">Thao tác</th>
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
                            <span className="font-medium text-slate-700">Giới tính:</span> {formatGender(apt.patientGender)}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-medium text-slate-900">{apt.doctorName}</div>
                      {apt.specialization && (
                        <div className="text-xs px-2 py-0.5 bg-blue-50 text-blue-700 rounded-full inline-block mt-1 font-medium">
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
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      {getStatusBadge(apt.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      {apt.status === 'PENDING' && (
                        <Button 
                          size="sm"
                          onClick={() => handleConfirm(apt)}
                          className="mr-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold cursor-pointer shadow-xs"
                        >
                          Xác nhận
                        </Button>
                      )}
                      {apt.status === 'CONFIRMED' && (
                        <Button 
                          size="sm"
                          onClick={() => handleCheckIn(apt)}
                          leftIcon={<FiCheckCircle />}
                          className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold cursor-pointer shadow-xs"
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

      {/* Floating Modern Toast Notification */}
      {toast && (
        <div className="fixed top-20 right-6 z-50">
          <Toast
            type={toast.type}
            title={toast.title}
            message={toast.message}
            onClose={() => setToast(null)}
          />
        </div>
      )}

      {/* Unified Confirmation Modal */}
      <ConfirmModal
        isOpen={confirmConfig.isOpen}
        onClose={() => setConfirmConfig(prev => ({ ...prev, isOpen: false }))}
        onConfirm={confirmConfig.action}
        badge={confirmConfig.badge}
        title={confirmConfig.title}
        message={confirmConfig.message}
        confirmText={confirmConfig.confirmText}
        variant={confirmConfig.variant}
        isLoading={actionLoading}
      >
        {confirmConfig.details}
      </ConfirmModal>
    </div>
  );
};

export default AdminAppointmentList;

