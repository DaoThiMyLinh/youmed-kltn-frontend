import React, { useState, useEffect } from 'react';
import { userService } from '../../services/user.service';
import type { User } from '../../types/user';
import { Card, Badge, ErrorMessage, EmptyState, Button } from '../../components';
import { FiUsers, FiSearch, FiEye, FiX, FiCalendar, FiMapPin, FiPhone, FiMail } from 'react-icons/fi';
import { useTranslation } from 'react-i18next';

const AdminPatientList = () => {
  const { t } = useTranslation();
  const [patients, setPatients] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Pagination & Filter
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');

  // Detail Modal State
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<User | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [detailError, setDetailError] = useState<string | null>(null);

  const fetchPatients = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await userService.getPatients(page, 10, searchTerm);
      setPatients(data.content);
      setTotalPages(data.totalPages);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Có lỗi xảy ra khi tải danh sách bệnh nhân.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPatients();
  }, [page]);

  const handleSearch = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setPage(0);
    fetchPatients();
  };

  const openDetailModal = async (patient: User) => {
    setSelectedPatient(null);
    setDetailError(null);
    setIsDetailModalOpen(true);
    setLoadingDetail(true);
    
    try {
      const fullPatientData = await userService.getPatientById(patient.id);
      setSelectedPatient(fullPatientData);
    } catch (err: any) {
      setDetailError(err.response?.data?.message || 'Không thể tải chi tiết bệnh nhân.');
    } finally {
      setLoadingDetail(false);
    }
  };

  const closeDetailModal = () => {
    setIsDetailModalOpen(false);
    setSelectedPatient(null);
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '-';
    try {
      const d = new Date(dateString);
      return d.toLocaleDateString('vi-VN');
    } catch {
      return dateString;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">{t('admin.patientsList', 'Quản lý Bệnh nhân')}</h1>
          <p className="text-slate-500 text-sm mt-1">{t('admin.patientsDesc', 'Tra cứu danh sách và thông tin bệnh nhân trên hệ thống.')}</p>
        </div>
      </div>

      <Card className="p-4 border-0 shadow-sm ring-1 ring-slate-200">
        <form onSubmit={handleSearch} className="flex gap-4">
          <div className="flex-1 relative">
            <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
            <input
              type="text"
              placeholder={t('admin.search.patient', 'Tìm kiếm theo tên, email, số điện thoại...')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-11 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-shadow"
            />
          </div>
          <Button type="submit">{t('common.search', 'Tìm kiếm')}</Button>
        </form>
      </Card>

      <ErrorMessage message={error} />

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
        </div>
      ) : !error && patients.length === 0 ? (
        <EmptyState 
          icon={<FiUsers />}
          title={t('common.noData', 'Không có dữ liệu')}
          description={t('common.noData', 'Không tìm thấy bệnh nhân nào phù hợp.')}
        />
      ) : (
        <Card className="overflow-hidden border-0 shadow-sm ring-1 ring-slate-200">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-slate-50 text-slate-500 font-medium border-b border-slate-200">
                <tr>
                  <th className="px-6 py-4">{t('admin.table.patient', 'Bệnh nhân')}</th>
                  <th className="px-6 py-4">{t('admin.table.contact', 'Liên hệ')}</th>
                  <th className="px-6 py-4">{t('admin.table.gender', 'Giới tính')}</th>
                  <th className="px-6 py-4">{t('admin.table.status', 'Trạng thái')}</th>
                  <th className="px-6 py-4">{t('admin.table.joinDate', 'Ngày tham gia')}</th>
                  <th className="px-6 py-4 text-right">{t('admin.table.detail', 'Chi tiết')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {patients.map((patient) => (
                  <tr key={patient.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-semibold text-slate-900">{patient.fullName}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-slate-600 flex items-center gap-1">
                        <FiMail className="w-3 h-3" /> {patient.email}
                      </div>
                      {patient.phone && (
                        <div className="text-slate-500 text-xs mt-0.5 flex items-center gap-1">
                          <FiPhone className="w-3 h-3" /> {patient.phone}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 text-slate-600">
                      {patient.gender === 'MALE' ? t('admin.modal.male', 'Nam') : patient.gender === 'FEMALE' ? t('admin.modal.female', 'Nữ') : t('admin.modal.other', 'Khác')}
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant={patient.enabled ? 'success' : 'secondary'}>
                        {patient.enabled ? t('admin.status.active', 'Hoạt động') : t('admin.status.inactive', 'Bị khóa')}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-slate-600">
                      {formatDate(patient.createdAt)}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button 
                        onClick={() => openDetailModal(patient)} 
                        className="p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors inline-flex items-center gap-1"
                        title="Xem chi tiết"
                      >
                        <FiEye />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {totalPages > 1 && (
            <div className="flex justify-between items-center p-4 border-t border-slate-100 bg-slate-50">
              <div className="text-sm text-slate-500">
                {t('common.page', 'Trang')} {page + 1} / {totalPages}
              </div>
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  disabled={page === 0} 
                  onClick={() => setPage(p => p - 1)}
                >
                  {t('common.prev', 'Trước')}
                </Button>
                <Button 
                  variant="outline" 
                  disabled={page >= totalPages - 1} 
                  onClick={() => setPage(p => p + 1)}
                >
                  {t('common.next', 'Sau')}
                </Button>
              </div>
            </div>
          )}
        </Card>
      )}

      {/* Patient Detail Modal */}
      {isDetailModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden max-h-[90vh] flex flex-col">
            <div className="flex justify-between items-center p-5 border-b border-slate-100 shrink-0 bg-slate-50/50">
              <h3 className="font-bold text-lg text-slate-800 flex items-center gap-2">
                <FiUsers className="text-emerald-600" />
                {t('admin.modal.patientProfile', 'Hồ sơ Bệnh nhân')}
              </h3>
              <button onClick={closeDetailModal} className="text-slate-400 hover:text-red-500 transition-colors p-1 rounded-full hover:bg-red-50">
                <FiX className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto">
              {loadingDetail ? (
                <div className="flex flex-col items-center justify-center py-10">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600 mb-4"></div>
                  <p className="text-slate-500 text-sm">Đang tải thông tin...</p>
                </div>
              ) : detailError ? (
                <ErrorMessage message={detailError} />
              ) : selectedPatient ? (
                <div className="space-y-6">
                  <div className="flex items-center gap-4 pb-6 border-b border-slate-100">
                    <div className="w-16 h-16 bg-gradient-to-br from-emerald-100 to-teal-100 rounded-full flex items-center justify-center text-emerald-600 text-2xl font-bold shadow-sm">
                      {selectedPatient.fullName.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h4 className="text-xl font-bold text-slate-900">{selectedPatient.fullName}</h4>
                      <Badge variant={selectedPatient.enabled ? 'success' : 'secondary'} className="mt-1">
                        {selectedPatient.enabled ? t('admin.status.active', 'Tài khoản hoạt động') : t('admin.status.inactive', 'Tài khoản bị khóa')}
                      </Badge>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-6 text-sm">
                    <div>
                      <label className="block text-xs font-medium text-slate-500 mb-1">{t('admin.table.joinDate', 'Ngày tham gia')}</label>
                      <div className="font-medium text-slate-800 flex items-center gap-1.5">
                        <FiCalendar className="text-slate-400" />
                        {formatDate(selectedPatient.createdAt)}
                      </div>
                    </div>
                    
                    <div className="md:col-span-2 mt-2 pt-4 border-t border-slate-50">
                      <h5 className="font-semibold text-slate-900 mb-3 text-sm">{t('admin.modal.contactInfo', 'Thông tin liên hệ & Cá nhân')}</h5>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-slate-500 mb-1">{t('admin.modal.email', 'Email')}</label>
                      <div className="font-medium text-slate-800 flex items-center gap-1.5">
                        <FiMail className="text-slate-400 shrink-0" />
                        <span className="truncate">{selectedPatient.email}</span>
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-500 mb-1">{t('admin.modal.phone', 'Số điện thoại')}</label>
                      <div className="font-medium text-slate-800 flex items-center gap-1.5">
                        <FiPhone className="text-slate-400 shrink-0" />
                        {selectedPatient.phone || '-'}
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-slate-500 mb-1">{t('admin.modal.gender', 'Giới tính')}</label>
                      <div className="font-medium text-slate-800">
                        {selectedPatient.gender === 'MALE' ? t('admin.modal.male', 'Nam') : selectedPatient.gender === 'FEMALE' ? t('admin.modal.female', 'Nữ') : t('admin.modal.notUpdated', 'Chưa cập nhật')}
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-500 mb-1">{t('admin.modal.dob', 'Ngày sinh')}</label>
                      <div className="font-medium text-slate-800">
                        {formatDate(selectedPatient.dateOfBirth)}
                      </div>
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-xs font-medium text-slate-500 mb-1">{t('admin.modal.address', 'Địa chỉ')}</label>
                      <div className="font-medium text-slate-800 flex items-start gap-1.5">
                        <FiMapPin className="text-slate-400 shrink-0 mt-0.5" />
                        {selectedPatient.address || t('admin.modal.notUpdated', 'Chưa cập nhật')}
                      </div>
                    </div>
                  </div>
                </div>
              ) : null}
            </div>
            
            <div className="p-4 border-t border-slate-100 flex justify-end shrink-0 bg-slate-50/50">
              <Button variant="outline" onClick={closeDetailModal}>
                {t('admin.modal.close', 'Đóng')}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPatientList;
