import React, { useState, useEffect } from 'react';
import { specialtyService } from '../../services/specialty.service';
import type { SpecialtyRequest } from '../../services/specialty.service';
import type { Specialty } from '../../types/specialty';
import { userService } from '../../services/user.service';
import type { User } from '../../types/user';
import { Card, Badge, ErrorMessage, EmptyState, Button, Input } from '../../components';
import { FiGrid, FiPlus, FiEdit2, FiLock, FiUnlock, FiTrash2, FiX } from 'react-icons/fi';
import { useTranslation } from 'react-i18next';

const AdminSpecialtyList = () => {
  const { t } = useTranslation();
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
  const [editingSpecialty, setEditingSpecialty] = useState<Specialty | null>(null);
  
  // Manager Dropdown State
  const [managers, setManagers] = useState<User[]>([]);
  const [managerSearchTerm, setManagerSearchTerm] = useState('');
  const [showManagerDropdown, setShowManagerDropdown] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    managerId: ''
  });

  const fetchSpecialties = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await specialtyService.getAllSpecialties(page, 10, searchTerm, activeFilter);
      setSpecialties(data.content);
      setTotalPages(data.totalPages);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Có lỗi xảy ra khi tải danh sách chuyên khoa.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSpecialties();
  }, [page, activeFilter]);

  // Fetch managers when modal opens
  useEffect(() => {
    if (isModalOpen) {
      const fetchManagers = async () => {
        try {
          const data = await userService.getAllUsers(0, 1000, '', 'DEPARTMENT_MANAGER');
          setManagers(data.content);
        } catch (err) {
          console.error('Failed to load managers', err);
        }
      };
      fetchManagers();
    } else {
      setShowManagerDropdown(false);
      setManagerSearchTerm('');
    }
  }, [isModalOpen]);

  const filteredManagers = managers.filter(m => 
    m.fullName.toLowerCase().includes(managerSearchTerm.toLowerCase()) || 
    m.email.toLowerCase().includes(managerSearchTerm.toLowerCase())
  );

  const handleSearch = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setPage(0);
    fetchSpecialties();
  };

  const openAddModal = () => {
    setEditingSpecialty(null);
    setFormData({
      name: '',
      description: '',
      managerId: ''
    });
    setIsModalOpen(true);
  };

  const openEditModal = (specialty: Specialty) => {
    setEditingSpecialty(specialty);
    setFormData({
      name: specialty.name,
      description: specialty.description || '',
      managerId: specialty.managerId ? specialty.managerId.toString() : ''
    });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingSpecialty(null);
  };

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      const data: SpecialtyRequest = {
        name: formData.name,
        description: formData.description,
        managerId: formData.managerId ? parseInt(formData.managerId) : undefined
      };

      if (editingSpecialty) {
        await specialtyService.updateSpecialty(editingSpecialty.id, data);
      } else {
        await specialtyService.createSpecialty(data);
      }
      closeModal();
      fetchSpecialties();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Có lỗi xảy ra.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleStatus = async (specialty: Specialty) => {
    const actionName = specialty.active ? 'khóa' : 'mở khóa';
    if (!window.confirm(`Bạn có chắc chắn muốn ${actionName} chuyên khoa ${specialty.name}?`)) return;
    
    try {
      const data: SpecialtyRequest = {
        name: specialty.name,
        description: specialty.description,
        managerId: specialty.managerId,
        active: !specialty.active
      };
      await specialtyService.updateSpecialty(specialty.id, data);
      fetchSpecialties();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Có lỗi xảy ra.');
    }
  };

  const handleDelete = async (specialty: Specialty) => {
    if (!window.confirm(`Bạn có chắc chắn muốn xóa chuyên khoa ${specialty.name}? Thao tác này không thể hoàn tác.`)) return;
    
    try {
      await specialtyService.deleteSpecialty(specialty.id);
      fetchSpecialties();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Không thể xóa chuyên khoa này. Có thể đang có bác sĩ thuộc chuyên khoa.');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">{t('admin.specialtiesList', 'Quản lý Chuyên khoa')}</h1>
          <p className="text-slate-500 text-sm mt-1">{t('admin.specialtiesDesc', 'Quản lý danh sách chuyên khoa trên hệ thống.')}</p>
        </div>
        <Button onClick={openAddModal} leftIcon={<FiPlus />}>
          {t('admin.addSpecialty', 'Thêm Chuyên khoa')}
        </Button>
      </div>

      <Card className="p-4 border-0 shadow-sm ring-1 ring-slate-200">
        <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder={t('admin.search.specialty', 'Tìm kiếm chuyên khoa...')}
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
      ) : !error && specialties.length === 0 ? (
        <EmptyState 
          icon={<FiGrid />}
          title={t('common.noData', 'Không có dữ liệu')}
          description={t('common.noData', 'Không tìm thấy chuyên khoa nào phù hợp.')}
        />
      ) : (
        <Card className="overflow-hidden border-0 shadow-sm ring-1 ring-slate-200">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-slate-50 text-slate-500 font-medium border-b border-slate-200">
                <tr>
                  <th className="px-6 py-4">{t('admin.table.specialty', 'Tên Chuyên khoa')}</th>
                  <th className="px-6 py-4">{t('manager.managerTitle', 'Trưởng khoa')}</th>
                  <th className="px-6 py-4">{t('admin.table.status', 'Trạng thái')}</th>
                  <th className="px-6 py-4 text-right">{t('admin.table.actions', 'Thao tác')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {specialties.map((spec) => (
                  <tr key={spec.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-semibold text-slate-900">{spec.name}</div>
                      <div className="text-slate-500 text-xs mt-0.5 line-clamp-1 max-w-xs">{spec.description}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-slate-600">{spec.managerName || '-'}</div>
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant={spec.active ? 'success' : 'secondary'}>
                        {spec.active ? t('admin.status.active', 'Hoạt động') : t('admin.status.inactive', 'Tạm khóa')}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button onClick={() => openEditModal(spec)} className="p-1 text-slate-400 hover:text-emerald-600 transition-colors" title="Sửa">
                          <FiEdit2 />
                        </button>
                        <button onClick={() => handleToggleStatus(spec)} className={`p-1 transition-colors ${spec.active ? 'text-slate-400 hover:text-amber-600' : 'text-slate-400 hover:text-emerald-600'}`} title={spec.active ? 'Khóa' : 'Mở khóa'}>
                          {spec.active ? <FiLock /> : <FiUnlock />}
                        </button>
                        <button onClick={() => handleDelete(spec)} className="p-1 text-slate-400 hover:text-red-600 transition-colors" title="Xóa">
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

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md overflow-hidden max-h-[90vh] flex flex-col">
            <div className="flex justify-between items-center p-4 border-b border-slate-100 shrink-0">
              <h3 className="font-semibold text-lg text-slate-800">
                {editingSpecialty ? t('admin.editSpecialty', 'Sửa Chuyên khoa') : t('admin.addSpecialty', 'Thêm Chuyên khoa')}
              </h3>
              <button onClick={closeModal} className="text-slate-400 hover:text-slate-600 transition-colors p-1">
                <FiX className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-4 overflow-y-auto">
              <form id="specialty-form" onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">{t('admin.form.specialtyName', 'Tên Chuyên khoa *')}</label>
                  <Input 
                    name="name"
                    value={formData.name}
                    onChange={handleFormChange}
                    required
                  />
                </div>
                <div className="relative">
                  <label className="block text-sm font-medium text-slate-700 mb-1">{t('admin.form.managerId', 'ID Trưởng khoa (Optional)')}</label>
                  
                  <div className="flex flex-col relative">
                    <input 
                      type="text"
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
                      placeholder={
                        formData.managerId 
                          ? managers.find(m => m.id.toString() === formData.managerId)?.fullName || formData.managerId 
                          : "Tìm kiếm và chọn trưởng khoa..."
                      }
                      value={managerSearchTerm}
                      onChange={(e) => {
                        setManagerSearchTerm(e.target.value);
                        setShowManagerDropdown(true);
                      }}
                      onFocus={() => setShowManagerDropdown(true)}
                    />
                    
                    {formData.managerId && !managerSearchTerm && (
                       <button 
                         type="button" 
                         className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-red-500"
                         onClick={(e) => {
                           e.stopPropagation();
                           setFormData(prev => ({ ...prev, managerId: '' }));
                         }}
                       >
                         <FiX />
                       </button>
                    )}
                  </div>

                  {showManagerDropdown && (
                    <div className="absolute z-10 w-full mt-1 bg-white border border-slate-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                      <div className="p-2 border-b border-slate-100 flex justify-between items-center sticky top-0 bg-white">
                        <span className="text-xs text-slate-500 font-medium">Chọn trưởng khoa</span>
                        <button type="button" onClick={() => setShowManagerDropdown(false)} className="text-slate-400 hover:text-slate-700"><FiX /></button>
                      </div>
                      
                      {filteredManagers.length === 0 ? (
                        <div className="p-4 text-center text-sm text-slate-500">Không tìm thấy quản lý nào</div>
                      ) : (
                        filteredManagers.map(manager => (
                          <div 
                            key={manager.id} 
                            className={`p-3 cursor-pointer hover:bg-emerald-50 flex flex-col ${formData.managerId === manager.id.toString() ? 'bg-emerald-50' : ''}`}
                            onMouseDown={(e) => {
                              // Use onMouseDown instead of onClick to prevent onBlur from firing first
                              e.preventDefault();
                              setFormData(prev => ({ ...prev, managerId: manager.id.toString() }));
                              setManagerSearchTerm('');
                              setShowManagerDropdown(false);
                            }}
                          >
                            <span className="font-medium text-slate-800 text-sm">{manager.fullName}</span>
                            <span className="text-xs text-slate-500">{manager.email}</span>
                          </div>
                        ))
                      )}
                    </div>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">{t('admin.form.description', 'Mô tả')}</label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleFormChange}
                    rows={4}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-shadow"
                  />
                </div>
              </form>
            </div>
            
            <div className="p-4 border-t border-slate-100 flex justify-end gap-2 shrink-0">
              <Button variant="outline" onClick={closeModal} type="button">
                {t('common.cancel', 'Hủy')}
              </Button>
              <Button type="submit" form="specialty-form" isLoading={isSubmitting}>
                {t('common.save', 'Lưu')}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminSpecialtyList;
