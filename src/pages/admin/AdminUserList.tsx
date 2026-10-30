import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { userService } from '../../services/user.service';
import type { User, Role } from '../../types/user';
import type { AdminUpdateUserRequest } from '../../services/user.service';
import { Card, Badge, ErrorMessage, EmptyState, Button, Toast, ConfirmModal } from '../../components';
import { FiUsers, FiLock, FiUnlock, FiEdit2, FiX, FiPlus } from 'react-icons/fi';
import { selectAuth } from '../../store/features/auth/authSlice';
import { useTranslation } from 'react-i18next';
import { CreateUserModal } from './CreateUserModal';

const AdminUserList = () => {
  const { t } = useTranslation();
  const { token } = useSelector(selectAuth);
  
  const [toast, setToast] = useState<{ type: 'success' | 'error' | 'info' | 'warning'; title: string; message?: string } | null>(null);
  const [confirmConfig, setConfirmConfig] = useState<{
    isOpen: boolean;
    title: string;
    message: React.ReactNode;
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

  let currentAdminEmail = '';
  if (token) {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      currentAdminEmail = payload.sub;
    } catch (e) {
      // Ignore
    }
  }

  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Pagination & Filter
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('ALL');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  
  const [formData, setFormData] = useState({
    role: 'PATIENT' as Role,
    enabled: true
  });

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await userService.getAllUsers(page, 10, searchTerm, roleFilter);
      setUsers(data.content);
      setTotalPages(data.totalPages);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Có lỗi xảy ra khi tải danh sách người dùng.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [page, roleFilter]);

  const handleSearch = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setPage(0);
    fetchUsers();
  };

  const openEditModal = (user: User) => {
    setEditingUser(user);
    setFormData({
      role: user.role,
      enabled: user.enabled
    });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingUser(null);
  };

  const handleToggleStatus = (user: User) => {
    if (user.email === currentAdminEmail) {
      setToast({
        type: 'warning',
        title: 'Thao tác bị từ chối',
        message: 'Bạn không thể khóa tài khoản của chính mình.',
      });
      return;
    }

    const isLocking = user.enabled;
    const actionName = isLocking ? 'khóa' : 'mở khóa kích hoạt';
    setConfirmConfig({
      isOpen: true,
      title: isLocking ? 'Xác nhận khóa tài khoản' : 'Mở khóa tài khoản',
      message: `Bạn có chắc chắn muốn ${actionName} tài khoản của ${user.fullName}?`,
      confirmText: isLocking ? 'Khóa tài khoản' : 'Kích hoạt',
      variant: isLocking ? 'warning' : 'success',
      action: async () => {
        try {
          setActionLoading(true);
          const data: AdminUpdateUserRequest = {
            role: user.role,
            enabled: !user.enabled
          };
          await userService.adminUpdateUserStatus(user.id, data);
          setConfirmConfig(prev => ({ ...prev, isOpen: false }));
          setToast({
            type: 'success',
            title: 'Thành công',
            message: `Đã ${actionName} tài khoản của ${user.fullName}.`,
          });
          fetchUsers();
        } catch (err: any) {
          setToast({
            type: 'error',
            title: 'Thất bại',
            message: err.response?.data?.message || 'Có lỗi xảy ra khi cập nhật trạng thái tài khoản.',
          });
        } finally {
          setActionLoading(false);
        }
      },
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;

    if (editingUser.email === currentAdminEmail && formData.role !== 'ADMIN') {
      setToast({
        type: 'warning',
        title: 'Thao tác bị từ chối',
        message: 'Bạn không thể gỡ quyền ADMIN của chính mình.',
      });
      return;
    }

    try {
      setIsSubmitting(true);
      const data: AdminUpdateUserRequest = {
        role: formData.role,
        enabled: formData.enabled
      };

      await userService.adminUpdateUserStatus(editingUser.id, data);
      closeModal();
      setToast({
        type: 'success',
        title: 'Thành công',
        message: `Đã cập nhật thông tin tài khoản ${editingUser.fullName}.`,
      });
      fetchUsers();
    } catch (err: any) {
      setToast({
        type: 'error',
        title: 'Cập nhật thất bại',
        message: err.response?.data?.message || 'Có lỗi xảy ra khi cập nhật.',
      });
    } finally {
      setIsSubmitting(false);
    }
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

  const getAvailableRoles = (): { value: Role; label: string }[] => {
    if (editingUser?.role === 'DOCTOR') {
      return [
        { value: 'DOCTOR', label: `${t('admin.role.doctor', 'Bác sĩ')} (Hiện tại)` },
        { value: 'DEPARTMENT_MANAGER', label: t('admin.role.manager', 'Trưởng khoa') }
      ];
    }

    if (editingUser?.role === 'DEPARTMENT_MANAGER') {
      return [
        { value: 'DEPARTMENT_MANAGER', label: `${t('admin.role.manager', 'Trưởng khoa')} (Hiện tại)` },
        { value: 'DOCTOR', label: t('admin.role.doctor', 'Bác sĩ') }
      ];
    }

    return [
      { value: 'PATIENT', label: t('admin.role.patient', 'Bệnh nhân') },
      { value: 'RECEPTIONIST', label: t('admin.role.receptionist', 'Lễ tân') },
      { value: 'ADMIN', label: t('admin.role.admin', 'Quản trị viên') }
    ];
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">{t('admin.usersList', 'Quản lý Người dùng')}</h1>
          <p className="text-slate-500 text-sm mt-1">{t('admin.usersDesc', 'Phân quyền và quản lý tài khoản người dùng.')}</p>
        </div>
        <Button onClick={() => setIsCreateModalOpen(true)} leftIcon={<FiPlus />}>
          {t('admin.addUser', 'Thêm Người dùng')}
        </Button>
      </div>

      <Card className="p-4 border-0 shadow-sm ring-1 ring-slate-200">
        <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Tìm kiếm theo tên, email, SĐT..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-shadow"
            />
          </div>
          <div className="flex gap-4">
            <select
              value={roleFilter}
              onChange={(e) => {
                setRoleFilter(e.target.value);
                setPage(0);
              }}
              className="px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none bg-white min-w-[150px]"
            >
              <option value="ALL">{t('admin.role.all', 'Tất cả quyền')}</option>
              <option value="ADMIN">{t('admin.role.admin', 'Quản trị viên')}</option>
              <option value="DOCTOR">{t('admin.role.doctor', 'Bác sĩ')}</option>
              <option value="RECEPTIONIST">{t('admin.role.receptionist', 'Lễ tân')}</option>
              <option value="PATIENT">{t('admin.role.patient', 'Bệnh nhân')}</option>
              <option value="DEPARTMENT_MANAGER">{t('admin.role.manager', 'Quản lý chuyên khoa')}</option>
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
      ) : !error && users.length === 0 ? (
        <EmptyState 
          icon={<FiUsers />}
          title={t('common.noData', 'Không có dữ liệu')}
          description="Không tìm thấy người dùng nào phù hợp."
        />
      ) : (
        <Card className="overflow-hidden border-0 shadow-sm ring-1 ring-slate-200">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-slate-50 text-slate-500 font-medium border-b border-slate-200">
                <tr>
                  <th className="px-6 py-4">{t('admin.table.user', 'Người dùng')}</th>
                  <th className="px-6 py-4">{t('admin.table.contact', 'Liên hệ')}</th>
                  <th className="px-6 py-4">{t('admin.table.role', 'Quyền')}</th>
                  <th className="px-6 py-4">{t('admin.table.status', 'Trạng thái')}</th>
                  <th className="px-6 py-4">{t('admin.table.joinDate', 'Ngày tham gia')}</th>
                  <th className="px-6 py-4 text-right">{t('admin.table.actions', 'Thao tác')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {users.map((user) => {
                  const isMe = user.email === currentAdminEmail;
                  
                  return (
                    <tr key={user.id} className={`hover:bg-slate-50/50 transition-colors ${isMe ? 'bg-indigo-50/30' : ''}`}>
                      <td className="px-6 py-4">
                        <div className="font-semibold text-slate-900 flex items-center gap-2">
                          {user.fullName}
                          {isMe && <span className="text-xs bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full font-medium">{t('admin.status.you', 'Bạn')}</span>}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-slate-600">{user.email}</div>
                        {user.phone && <div className="text-slate-500 text-xs mt-0.5">{user.phone}</div>}
                      </td>
                      <td className="px-6 py-4">
                        <Badge variant={
                          user.role === 'ADMIN' ? 'primary' :
                          user.role === 'DOCTOR' ? 'success' :
                          user.role === 'DEPARTMENT_MANAGER' ? 'warning' : 
                          user.role === 'RECEPTIONIST' ? 'info' : 'secondary'
                        }>
                          {user.role}
                        </Badge>
                      </td>
                      <td className="px-6 py-4">
                        <Badge variant={user.enabled ? 'success' : 'secondary'}>
                          {user.enabled ? 'Đang hoạt động' : 'Bị khóa'}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 text-slate-600">
                        {formatDate(user.createdAt)}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2">
                          <button 
                            onClick={() => openEditModal(user)} 
                            className="p-1 text-slate-400 hover:text-emerald-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed" 
                            title="Sửa quyền"
                            disabled={isMe}
                          >
                            <FiEdit2 />
                          </button>
                          <button 
                            onClick={() => handleToggleStatus(user)} 
                            className={`p-1 transition-colors ${user.enabled ? 'text-slate-400 hover:text-amber-600' : 'text-slate-400 hover:text-emerald-600'} disabled:opacity-50 disabled:cursor-not-allowed`} 
                            title={user.enabled ? 'Khóa tài khoản' : 'Mở khóa tài khoản'}
                            disabled={isMe}
                          >
                            {user.enabled ? <FiLock /> : <FiUnlock />}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
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

      {isModalOpen && editingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md overflow-hidden max-h-[90vh] flex flex-col">
            <div className="flex justify-between items-center p-4 border-b border-slate-100 shrink-0">
              <h3 className="font-semibold text-lg text-slate-800">
                Cập nhật quyền Người dùng
              </h3>
              <button onClick={closeModal} className="text-slate-400 hover:text-slate-600 transition-colors p-1">
                <FiX className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-4 overflow-y-auto">
              <div className="mb-4 p-3 bg-slate-50 rounded-lg border border-slate-100 text-sm">
                <div className="font-medium text-slate-900">{editingUser.fullName}</div>
                <div className="text-slate-500">{editingUser.email}</div>
              </div>

              <form id="user-role-form" onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Cấp quyền (Role)</label>
                  <select
                    value={formData.role}
                    onChange={(e) => setFormData({...formData, role: e.target.value as Role})}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none bg-white"
                  >
                    {getAvailableRoles().map((r) => (
                      <option key={r.value} value={r.value}>
                        {r.label}
                      </option>
                    ))}
                  </select>
                  {editingUser?.role === 'DOCTOR' ? (
                    <p className="mt-1 text-xs text-emerald-600">
                      💡 Bác sĩ có thể được bổ nhiệm lên vai trò <strong>Trưởng khoa</strong>.
                    </p>
                  ) : (
                    <p className="mt-1 text-xs text-amber-600">
                      Lưu ý: Thay đổi quyền có thể ảnh hưởng đến khả năng truy cập hệ thống của người dùng.
                    </p>
                  )}
                </div>
                
                <div className="flex items-center gap-2 pt-2">
                  <input
                    type="checkbox"
                    id="enabled-checkbox"
                    checked={formData.enabled}
                    onChange={(e) => setFormData({...formData, enabled: e.target.checked})}
                    className="w-4 h-4 text-emerald-600 border-slate-300 rounded focus:ring-emerald-500"
                  />
                  <label htmlFor="enabled-checkbox" className="text-sm font-medium text-slate-700">
                    Cho phép hoạt động (Enabled)
                  </label>
                </div>
              </form>
            </div>
            
            <div className="p-4 border-t border-slate-100 flex justify-end gap-2 shrink-0">
              <Button variant="outline" onClick={closeModal} type="button">
                Hủy
              </Button>
              <Button type="submit" form="user-role-form" isLoading={isSubmitting}>
                Lưu thay đổi
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Thêm Người dùng hợp nhất */}
      <CreateUserModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={() => {
          fetchUsers();
        }}
      />

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
        title={confirmConfig.title}
        message={confirmConfig.message}
        confirmText={confirmConfig.confirmText}
        variant={confirmConfig.variant}
        isLoading={actionLoading}
      />
    </div>
  );
};

export default AdminUserList;

