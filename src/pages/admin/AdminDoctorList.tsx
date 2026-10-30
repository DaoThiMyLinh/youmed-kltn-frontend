import React, { useState, useEffect } from 'react';
import { doctorService } from '../../services/doctor.service';
import type { DoctorUpdateRequest } from '../../services/doctor.service';
import { getActiveSpecialties } from '../../services/specialty.service';
import type { Doctor } from '../../types/appointment';
import type { Specialty } from '../../types/specialty';
import { Card, Badge, ErrorMessage, EmptyState, Button, Input } from '../../components';
import { FiUsers, FiEdit2, FiLock, FiUnlock, FiTrash2, FiX } from 'react-icons/fi';
import { useTranslation } from 'react-i18next';

const AdminDoctorList = () => {
  const { t } = useTranslation();
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [specialties, setSpecialties] = useState<Specialty[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Pagination & Filter
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState<string>('ALL');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingDoctor, setEditingDoctor] = useState<Doctor | null>(null);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    specialtyId: '',
    consultationFee: '0',
    biography: ''
  });

  const uniqueSpecialties = React.useMemo(() => {
    const map = new Map<string, typeof specialties[0]>();
    for (const s of specialties) {
      const key = s.name.trim().toLowerCase();
      const existing = map.get(key);
      if (!existing) {
        map.set(key, s);
      } else {
        if (s.id.toString() === formData.specialtyId) {
          map.set(key, s);
        } else if (!existing.managerName && s.managerName) {
          map.set(key, s);
        }
      }
    }
    return Array.from(map.values());
  }, [specialties, formData.specialtyId]);

  const fetchDoctors = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await doctorService.getAllDoctors(page, 10, searchTerm, activeFilter);
      setDoctors(data.content);
      setTotalPages(data.totalPages);
    } catch (err: any) {
      setError(err.response?.data?.message || t('admin.loadDoctorsError', 'Có lỗi xảy ra khi tải danh sách bác sĩ.'));
    } finally {
      setLoading(false);
    }
  };

  const fetchSpecialties = async () => {
    try {
      const data = await getActiveSpecialties();
      setSpecialties(data);
    } catch (err) {
      console.error('Failed to load specialties', err);
    }
  };

  useEffect(() => {
    fetchDoctors();
  }, [page, activeFilter]);

  // Handle search when user presses Enter or clicks search
  const handleSearch = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setPage(0);
    fetchDoctors();
  };

  useEffect(() => {
    fetchSpecialties();
  }, []);

  const openEditModal = (doctor: Doctor) => {
    setEditingDoctor(doctor);
    setFormData({
      fullName: doctor.fullName,
      email: doctor.email,
      phone: doctor.phone,
      specialtyId: doctor.specialty ? doctor.specialty.id.toString() : '',
      consultationFee: doctor.consultationFee.toString(),
      biography: doctor.biography
    });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingDoctor(null);
  };

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingDoctor) return;

    try {
      setIsSubmitting(true);
      const updateData: DoctorUpdateRequest = {
        fullName: formData.fullName,
        phone: formData.phone,
        specialtyId: formData.specialtyId ? parseInt(formData.specialtyId) : undefined,
        consultationFee: parseInt(formData.consultationFee),
        biography: formData.biography
      };
      await doctorService.updateDoctor(editingDoctor.id, updateData);
      closeModal();
      fetchDoctors();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Có lỗi xảy ra.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleStatus = async (doctor: Doctor) => {
    const actionName = doctor.active ? 'khóa' : 'mở khóa';
    if (!window.confirm(`Bạn có chắc chắn muốn ${actionName} bác sĩ ${doctor.fullName}?`)) return;
    
    try {
      const updateData: DoctorUpdateRequest = {
        fullName: doctor.fullName,
        phone: doctor.phone,
        specialtyId: doctor.specialty?.id,
        consultationFee: doctor.consultationFee,
        biography: doctor.biography,
        active: !doctor.active
      };
      await doctorService.updateDoctor(doctor.id, updateData);
      fetchDoctors();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Có lỗi xảy ra.');
    }
  };

  const handleDelete = async (doctor: Doctor) => {
    if (!window.confirm(`Bạn có chắc chắn muốn xóa bác sĩ ${doctor.fullName}? Thao tác này không thể hoàn tác.`)) return;
    
    try {
      await doctorService.deleteDoctor(doctor.id);
      fetchDoctors();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Không thể xóa bác sĩ này. Có thể bác sĩ đang có lịch khám.');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">{t('admin.doctorsList', 'Quản lý Bác sĩ')}</h1>
          <p className="text-slate-500 text-sm mt-1">{t('admin.doctorsDesc', 'Quản lý danh sách bác sĩ trên toàn hệ thống.')}</p>
        </div>
      </div>

      <Card className="p-4 border-0 shadow-sm ring-1 ring-slate-200">
        <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder={t('admin.search.doctor', 'Tìm kiếm theo tên, sđt, email...')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-shadow"
            />
          </div>
          <div className="flex gap-4">
            <select
              value={activeFilter}
              onChange={(e) => {
                setActiveFilter(e.target.value);
                setPage(0);
              }}
              className="px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none bg-white min-w-[150px]"
            >
              <option value="ALL">{t('admin.allStatus', 'Tất cả trạng thái')}</option>
              <option value="ACTIVE">{t('admin.active', 'Hoạt động')}</option>
              <option value="INACTIVE">{t('admin.inactive', 'Tạm khóa')}</option>
            </select>
            <Button type="submit">{t('common.search', 'Tìm kiếm')}</Button>
          </div>
        </form>
      </Card>

      <ErrorMessage message={error} />

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
        </div>
      ) : !error && doctors.length === 0 ? (
        <EmptyState 
          icon={<FiUsers />}
          title={t('common.noData', 'Không có dữ liệu')}
          description={t('admin.noDoctorsDesc', 'Không tìm thấy bác sĩ nào phù hợp.')}
        />
      ) : (
        <Card className="overflow-hidden border-0 shadow-sm ring-1 ring-slate-200">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-slate-50 text-slate-500 font-medium border-b border-slate-200">
                <tr>
                  <th className="px-6 py-4">{t('admin.table.doctor', 'Bác sĩ')}</th>
                  <th className="px-6 py-4">{t('admin.table.specialty', 'Chuyên khoa')}</th>
                  <th className="px-6 py-4">{t('admin.table.contact', 'Liên hệ')}</th>
                  <th className="px-6 py-4">{t('admin.table.fee', 'Phí khám')}</th>
                  <th className="px-6 py-4">{t('admin.table.status', 'Trạng thái')}</th>
                  <th className="px-6 py-4 text-right">{t('admin.table.actions', 'Thao tác')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {doctors.map((doctor) => (
                  <tr key={doctor.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-semibold text-slate-900 flex items-center gap-2">
                        {doctor.fullName}
                        {doctor.role === 'DEPARTMENT_MANAGER' && (
                          <span className="text-[11px] bg-purple-50 text-purple-700 border border-purple-200 px-2 py-0.5 rounded-full font-medium">
                            {t('admin.role.manager', 'Trưởng khoa')}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-slate-600">{doctor.specialty?.name || '-'}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-slate-600">{doctor.email}</div>
                      <div className="text-slate-500 text-xs mt-0.5">{doctor.phone}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-medium text-emerald-600">
                        {doctor.consultationFee > 0 ? `${doctor.consultationFee.toLocaleString('vi-VN')} ₫` : t('admin.free', 'Miễn phí')}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant={doctor.active ? 'success' : 'secondary'}>
                        {doctor.active ? t('admin.status.active', 'Hoạt động') : t('admin.status.inactive', 'Tạm khóa')}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button onClick={() => openEditModal(doctor)} className="p-1 text-slate-400 hover:text-emerald-600 transition-colors" title="Sửa">
                          <FiEdit2 />
                        </button>
                        <button onClick={() => handleToggleStatus(doctor)} className={`p-1 transition-colors ${doctor.active ? 'text-slate-400 hover:text-amber-600' : 'text-slate-400 hover:text-emerald-600'}`} title={doctor.active ? 'Khóa' : 'Mở khóa'}>
                          {doctor.active ? <FiLock /> : <FiUnlock />}
                        </button>
                        <button onClick={() => handleDelete(doctor)} className="p-1 text-slate-400 hover:text-red-600 transition-colors" title="Xóa">
                          <FiTrash2 />
                        </button>
                      </div>
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

      {isModalOpen && editingDoctor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden max-h-[90vh] flex flex-col border border-slate-100">
            {/* Header */}
            <div className="flex justify-between items-center px-6 py-4 border-b border-slate-100 bg-slate-50/50 shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shadow-sm border border-emerald-100/60 font-bold">
                  <FiEdit2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg text-slate-800">
                    {t('admin.editDoctor', 'Sửa thông tin Bác sĩ')}
                  </h3>
                  <p className="text-xs text-slate-500">
                    {editingDoctor.role === 'DEPARTMENT_MANAGER' 
                      ? 'Hồ sơ chuyên môn & Trưởng khoa phụ trách' 
                      : 'Cập nhật thông tin chuyên khoa và liên hệ'}
                  </p>
                </div>
              </div>
              <button 
                type="button" 
                onClick={closeModal} 
                className="text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg p-1.5 transition-colors"
              >
                <FiX className="w-5 h-5" />
              </button>
            </div>
            
            {/* Body */}
            <div className="p-6 overflow-y-auto space-y-4">
              {editingDoctor.role === 'DEPARTMENT_MANAGER' && (
                <div className="p-3 bg-purple-50/80 border border-purple-100 rounded-lg flex items-center justify-between text-xs text-purple-900">
                  <span className="font-medium flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-purple-600"></span>
                    Vai trò hiện tại: Trưởng khoa
                  </span>
                  <span className="text-purple-700 bg-white px-2 py-0.5 rounded border border-purple-200 font-semibold shadow-xs">
                    {editingDoctor.specialty?.name || 'Chưa gán khoa'}
                  </span>
                </div>
              )}

              <form id="doctor-form" onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    {t('admin.form.fullName', 'Họ và tên')} <span className="text-rose-500">*</span>
                  </label>
                  <Input 
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleFormChange}
                    required
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      {t('admin.form.email', 'Email')}
                    </label>
                    <Input 
                      name="email"
                      type="email"
                      value={formData.email}
                      disabled
                      className="bg-slate-50 cursor-not-allowed opacity-75 text-slate-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      {t('admin.form.phone', 'Số điện thoại')} <span className="text-rose-500">*</span>
                    </label>
                    <Input 
                      name="phone"
                      value={formData.phone}
                      onChange={handleFormChange}
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      {t('admin.form.specialty', 'Chuyên khoa')} <span className="text-rose-500">*</span>
                    </label>
                    <select
                      name="specialtyId"
                      value={formData.specialtyId}
                      onChange={handleFormChange}
                      required
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none bg-white text-sm"
                    >
                      <option value="">{t('admin.form.selectSpecialty', '-- Chọn chuyên khoa --')}</option>
                      {uniqueSpecialties.map(spec => {
                        const isManager = editingDoctor?.role === 'DEPARTMENT_MANAGER';
                        const isCurrent = spec.id.toString() === formData.specialtyId || spec.name?.toLowerCase() === editingDoctor.specialty?.name?.toLowerCase();
                        const hasOtherManager = isManager && !!spec.managerName && !isCurrent;
                        return (
                          <option 
                            key={spec.id} 
                            value={spec.id}
                            disabled={hasOtherManager}
                            className={hasOtherManager ? 'text-slate-400 bg-slate-50' : ''}
                          >
                            {spec.name} {isCurrent ? '(Hiện tại)' : hasOtherManager ? `(Đã có TK: ${spec.managerName})` : ''}
                          </option>
                        );
                      })}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      {t('admin.form.fee', 'Phí khám (VNĐ)')} <span className="text-rose-500">*</span>
                    </label>
                    <Input 
                      name="consultationFee"
                      type="number"
                      min="0"
                      step="10000"
                      value={formData.consultationFee}
                      onChange={handleFormChange}
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    {t('admin.form.biography', 'Tiểu sử / Giới thiệu')}
                  </label>
                  <textarea
                    name="biography"
                    value={formData.biography}
                    onChange={handleFormChange}
                    rows={3}
                    placeholder="Kinh nghiệm, học vị, bằng cấp..."
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-shadow"
                  />
                </div>
              </form>
            </div>
            
            {/* Footer */}
            <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/50 flex justify-end gap-3 shrink-0">
              <Button variant="outline" onClick={closeModal} type="button" disabled={isSubmitting}>
                {t('common.cancel', 'Hủy')}
              </Button>
              <Button type="submit" form="doctor-form" isLoading={isSubmitting}>
                {t('common.save', 'Lưu thay đổi')}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDoctorList;
