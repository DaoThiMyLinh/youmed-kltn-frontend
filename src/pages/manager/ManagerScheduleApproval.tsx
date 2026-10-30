import { useState, useEffect } from 'react';
import { managerService } from '../../services/manager.service';
import type { ScheduleModel } from '../../types/schedule';
import { Card, Badge, ErrorMessage, EmptyState, Button, Toast } from '../../components';
import { FiCalendar, FiCheck, FiX } from 'react-icons/fi';
import { useTranslation } from 'react-i18next';

const ManagerScheduleApproval = () => {
  const { t } = useTranslation();
  const [schedules, setSchedules] = useState<ScheduleModel[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filter & Search states
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc');

  // Reject Modal state
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [selectedScheduleId, setSelectedScheduleId] = useState<number | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [rejectLoading, setRejectLoading] = useState(false);
  const [rejectError, setRejectError] = useState<string | null>(null);

  const [approveLoadingId, setApproveLoadingId] = useState<number | null>(null);
  const [toastMessage, setToastMessage] = useState<{ title: string, message?: string, type: 'success' | 'error' } | null>(null);

  const fetchSchedules = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await managerService.getManagerSchedules();
      // Sort so PENDING is at top, or just by date
      setSchedules(data);
    } catch (err: any) {
      setError(err.response?.data?.message || t('manager.loadSchedulesError', 'Có lỗi xảy ra khi tải danh sách lịch làm việc.'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSchedules();
  }, []);

  const handleApprove = async (id: number) => {
    try {
      setApproveLoadingId(id);
      await managerService.approveSchedule(id);
      setToastMessage({ title: t('common.success', 'Thành công'), message: t('manager.approveSuccess', 'Đã duyệt lịch thành công'), type: 'success' });
      await fetchSchedules(); // Refresh list
    } catch (err: any) {
      setToastMessage({ title: t('common.error', 'Lỗi'), message: err.response?.data?.message || t('manager.approveError', 'Không thể duyệt lịch'), type: 'error' });
    } finally {
      setApproveLoadingId(null);
    }
  };

  const openRejectModal = (id: number) => {
    setSelectedScheduleId(id);
    setRejectReason('');
    setRejectError(null);
    setRejectModalOpen(true);
  };

  const closeRejectModal = () => {
    setRejectModalOpen(false);
    setSelectedScheduleId(null);
    setRejectReason('');
    setRejectError(null);
  };

  const handleRejectSubmit = async () => {
    if (!selectedScheduleId || !rejectReason.trim()) return;

    try {
      setRejectLoading(true);
      setRejectError(null);
      await managerService.rejectSchedule(selectedScheduleId, { reason: rejectReason.trim() });
      
      setToastMessage({ title: t('common.success', 'Thành công'), message: t('manager.rejectSuccess', 'Đã từ chối lịch thành công'), type: 'success' });
      closeRejectModal();
      await fetchSchedules(); // Refresh list
    } catch (err: any) {
      setRejectError(err.response?.data?.message || t('manager.rejectError', 'Không thể từ chối lịch. Vui lòng thử lại.'));
    } finally {
      setRejectLoading(false);
    }
  };

  const filteredSchedules = schedules
    .filter(schedule => {
      const matchesSearch = (schedule.doctorName || '').toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'ALL' || schedule.status === statusFilter;
      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      const dateA = new Date(a.workingDate).getTime();
      const dateB = new Date(b.workingDate).getTime();
      return sortOrder === 'desc' ? dateB - dateA : dateA - dateB;
    });

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 relative">
      {toastMessage && (
        <div className="fixed top-24 right-6 z-50">
          <Toast
            type={toastMessage.type}
            title={toastMessage.title}
            message={toastMessage.message}
            onClose={() => setToastMessage(null)}
          />
        </div>
      )}

      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">{t('manager.scheduleApproval', 'Duyệt lịch làm việc')}</h1>
          <p className="text-slate-500 text-sm mt-1">{t('manager.scheduleApprovalDesc', 'Quản lý và xét duyệt lịch làm việc của các bác sĩ trong khoa.')}</p>
        </div>
      </div>

      <Card className="p-4 border-0 shadow-sm ring-1 ring-slate-200">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder={t('manager.searchDoctor', 'Tìm kiếm bác sĩ...')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-shadow"
            />
          </div>
          <div className="flex gap-4">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none bg-white min-w-[150px]"
            >
              <option value="ALL">{t('manager.allStatus', 'Tất cả trạng thái')}</option>
              <option value="PENDING">{t('manager.pending', 'Chờ duyệt')}</option>
              <option value="APPROVED">{t('manager.approved', 'Đã duyệt')}</option>
              <option value="REJECTED">{t('manager.rejected', 'Từ chối')}</option>
            </select>
            <select
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value as 'asc' | 'desc')}
              className="px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none bg-white min-w-[150px]"
            >
              <option value="desc">{t('manager.newest', 'Mới nhất')}</option>
              <option value="asc">{t('manager.oldest', 'Cũ nhất')}</option>
            </select>
          </div>
        </div>
      </Card>

      <ErrorMessage message={error} />

      {!error && schedules.length === 0 ? (
        <EmptyState 
          icon={<FiCalendar />}
          title={t('manager.noSchedules', 'Không có lịch làm việc')}
          description={t('manager.noSchedulesDesc', 'Chưa có lịch làm việc nào được đăng ký trong khoa của bạn.')}
        />
      ) : filteredSchedules.length === 0 ? (
        <EmptyState 
          icon={<FiCalendar />}
          title={t('common.noData', 'Không có dữ liệu')}
          description={t('manager.noFilterResults', 'Không tìm thấy lịch làm việc nào phù hợp với bộ lọc.')}
        />
      ) : (
        <Card className="overflow-hidden border-0 shadow-sm ring-1 ring-slate-200">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-slate-50 text-slate-500 font-medium border-b border-slate-200">
                <tr>
                  <th className="px-6 py-4">{t('manager.doctor', 'Bác sĩ')}</th>
                  <th className="px-6 py-4">{t('manager.workingDate', 'Ngày làm việc')}</th>
                  <th className="px-6 py-4">{t('manager.time', 'Thời gian')}</th>
                  <th className="px-6 py-4">{t('manager.status', 'Trạng thái')}</th>
                  <th className="px-6 py-4">{t('manager.rejectReason', 'Lý do từ chối')}</th>
                  <th className="px-6 py-4 text-right">{t('manager.actions', 'Thao tác')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredSchedules.map((schedule) => (
                  <tr key={schedule.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-semibold text-slate-900">{schedule.doctorName || '-'}</div>
                    </td>
                    <td className="px-6 py-4 text-slate-700">
                      {schedule.workingDate}
                    </td>
                    <td className="px-6 py-4 text-slate-700">
                      {schedule.startTime} - {schedule.endTime}
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant={
                        schedule.status === 'APPROVED' ? 'success' : 
                        schedule.status === 'REJECTED' ? 'danger' : 'warning'
                      }>
                        {schedule.status === 'APPROVED' ? t('manager.approved', 'Đã duyệt') : 
                         schedule.status === 'REJECTED' ? t('manager.rejected', 'Từ chối') : t('manager.pending', 'Chờ duyệt')}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 max-w-[200px] truncate text-slate-500">
                      {schedule.status === 'REJECTED' ? schedule.rejectionReason : '-'}
                    </td>
                    <td className="px-6 py-4 text-right space-x-2">
                      {schedule.status === 'PENDING' && (
                        <>
                          <Button
                            size="sm"
                            variant="primary"
                            className="bg-emerald-600 hover:bg-emerald-700 text-white"
                            isLoading={approveLoadingId === schedule.id}
                            disabled={approveLoadingId !== null || rejectLoading}
                            leftIcon={<FiCheck />}
                            onClick={() => handleApprove(schedule.id)}
                          >
                            {t('manager.approve', 'Duyệt')}
                          </Button>
                          <Button
                            size="sm"
                            variant="danger"
                            disabled={approveLoadingId !== null || rejectLoading}
                            leftIcon={<FiX />}
                            onClick={() => openRejectModal(schedule.id)}
                          >
                            {t('manager.reject', 'Từ chối')}
                          </Button>
                        </>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Reject Modal Overlay */}
      {rejectModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md overflow-hidden flex flex-col">
            <div className="p-4 border-b border-slate-100 flex justify-between items-center">
              <h3 className="font-semibold text-lg text-slate-800">{t('manager.rejectModalTitle', 'Từ chối lịch làm việc')}</h3>
              <button 
                onClick={closeRejectModal} 
                disabled={rejectLoading}
                className="text-slate-400 hover:text-slate-600 transition-colors p-1"
              >
                <FiX className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-4 flex-1">
              <ErrorMessage message={rejectError} className="mb-4" />
              <div className="mb-4">
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  {t('manager.rejectReasonLabel', 'Lý do từ chối')} <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  disabled={rejectLoading}
                  placeholder={t('manager.rejectReasonPlaceholder', 'Nhập lý do từ chối lịch làm việc này...')}
                  className="w-full p-3 border border-slate-300 rounded-md focus:ring-emerald-500 focus:border-emerald-500 min-h-[100px] resize-none"
                />
              </div>
            </div>
            
            <div className="p-4 border-t border-slate-100 flex justify-end gap-3 bg-slate-50">
              <Button 
                variant="outline" 
                onClick={closeRejectModal}
                disabled={rejectLoading}
              >
                {t('manager.cancel', 'Hủy')}
              </Button>
              <Button 
                variant="danger" 
                onClick={handleRejectSubmit}
                isLoading={rejectLoading}
                disabled={!rejectReason.trim()}
              >
                {t('manager.confirmReject', 'Xác nhận từ chối')}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManagerScheduleApproval;
