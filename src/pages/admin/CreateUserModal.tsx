import React, { useState, useEffect } from 'react';
import { doctorService, type DoctorCreateRequest } from '../../services/doctor.service';
import { userService, type AdminCreateUserRequest } from '../../services/user.service';
import { getActiveSpecialties } from '../../services/specialty.service';
import type { Specialty } from '../../types/specialty';
import type { Role } from '../../types/user';
import { Button, Input } from '../../components';
import { FiX, FiUserPlus, FiAlertCircle, FiLock } from 'react-icons/fi';
import { useTranslation } from 'react-i18next';

interface CreateUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const ROLE_OPTIONS: { value: Role; labelVi: string; labelEn: string; descVi: string }[] = [
  { value: 'PATIENT', labelVi: 'Bệnh nhân', labelEn: 'Patient', descVi: 'Tài khoản đặt lịch khám và xem hồ sơ bệnh án' },
  { value: 'DOCTOR', labelVi: 'Bác sĩ', labelEn: 'Doctor', descVi: 'Tài khoản kèm hồ sơ bác sĩ, chuyên khoa và phí khám' },
  { value: 'DEPARTMENT_MANAGER', labelVi: 'Trưởng khoa', labelEn: 'Department Manager', descVi: 'Tài khoản kèm hồ sơ bác sĩ và phân công quản lý chuyên khoa' },
  { value: 'RECEPTIONIST', labelVi: 'Nhân viên tiếp nhận / Lễ tân', labelEn: 'Receptionist', descVi: 'Tài khoản check-in, lập hóa đơn và hỗ trợ đặt lịch' },
  { value: 'ADMIN', labelVi: 'Quản trị viên', labelEn: 'Admin', descVi: 'Toàn quyền quản trị hệ thống' },
];

export const CreateUserModal: React.FC<CreateUserModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const { t, i18n } = useTranslation();
  const isVi = i18n.language?.startsWith('vi');

  const [role, setRole] = useState<Role>('PATIENT');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');

  // Doctor & Department Manager specific fields
  const [specialtyId, setSpecialtyId] = useState<string>('');
  const [consultationFee, setConsultationFee] = useState<string>('150000');
  const [biography, setBiography] = useState<string>('');

  const [specialties, setSpecialties] = useState<Specialty[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const isDoctorOrManager = role === 'DOCTOR' || role === 'DEPARTMENT_MANAGER';

  // Load specialties when modal is opened
  useEffect(() => {
    if (isOpen) {
      const loadSpecialties = async () => {
        try {
          const data = await getActiveSpecialties();
          setSpecialties(data);
          if (data.length > 0 && !specialtyId) {
            setSpecialtyId(data[0].id.toString());
          }
        } catch (err) {
          console.error('Failed to load specialties', err);
        }
      };
      loadSpecialties();
      setErrorMessage(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const currentRoleConfig = ROLE_OPTIONS.find(r => r.value === role) || ROLE_OPTIONS[0];

  const uniqueSpecialties = React.useMemo(() => {
    const map = new Map<string, typeof specialties[0]>();
    for (const s of specialties) {
      const key = s.name.trim().toLowerCase();
      const existing = map.get(key);
      if (!existing) {
        map.set(key, s);
      } else {
        if (s.id.toString() === specialtyId) {
          map.set(key, s);
        } else if (!existing.managerName && s.managerName) {
          map.set(key, s);
        }
      }
    }
    return Array.from(map.values());
  }, [specialties, specialtyId]);

  const availableSpecialtiesForManager = uniqueSpecialties.filter(s => !s.managerName);
  const noSpecialtyAvailable = role === 'DEPARTMENT_MANAGER' && uniqueSpecialties.length > 0 && availableSpecialtiesForManager.length === 0;

  const handleRoleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newRole = e.target.value as Role;
    setRole(newRole);
    setErrorMessage(null);

    if (newRole === 'DEPARTMENT_MANAGER') {
      const firstAvailable = specialties.find(s => !s.managerName);
      if (firstAvailable) {
        setSpecialtyId(firstAvailable.id.toString());
      } else {
        setSpecialtyId('');
      }
    }
  };

  const handleResetForm = () => {
    setFullName('');
    setEmail('');
    setPhone('');
    setBiography('');
    setConsultationFee('150000');
    setErrorMessage(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    // Validation cơ bản
    if (!fullName.trim()) {
      setErrorMessage(isVi ? 'Vui lòng nhập họ và tên.' : 'Please enter full name.');
      return;
    }
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setErrorMessage(isVi ? 'Vui lòng nhập email hợp lệ.' : 'Please enter a valid email.');
      return;
    }

    if (isDoctorOrManager) {
      if (!phone.trim()) {
        setErrorMessage(
          isVi 
            ? `Vui lòng nhập số điện thoại cho ${role === 'DEPARTMENT_MANAGER' ? 'Trưởng khoa' : 'Bác sĩ'}.` 
            : 'Phone number is required.'
        );
        return;
      }

      if (role === 'DEPARTMENT_MANAGER') {
        if (!specialtyId) {
          setErrorMessage(
            isVi ? 'Vui lòng chọn chuyên khoa phụ trách cho Trưởng khoa.' : 'Specialty is required for Department Manager.'
          );
          return;
        }

        const chosenSpec = specialties.find(s => s.id.toString() === specialtyId);
        if (chosenSpec?.managerName) {
          setErrorMessage(
            isVi 
              ? `Chuyên khoa "${chosenSpec.name}" đã có Trưởng khoa (${chosenSpec.managerName}). Mỗi chuyên khoa chỉ được có 1 Trưởng khoa.`
              : `Specialty "${chosenSpec.name}" already has a Department Manager (${chosenSpec.managerName}).`
          );
          return;
        }
      }

      const feeNum = parseFloat(consultationFee);
      if (isNaN(feeNum) || feeNum < 0) {
        setErrorMessage(isVi ? 'Phí khám phải là số hợp lệ không âm.' : 'Consultation fee must be non-negative.');
        return;
      }

      try {
        setIsSubmitting(true);
        const doctorData: DoctorCreateRequest = {
          fullName: fullName.trim(),
          email: email.trim(),
          phone: phone.trim(),
          specialtyId: specialtyId ? parseInt(specialtyId) : undefined,
          consultationFee: feeNum,
          biography: biography.trim(),
          role: role
        };

        await doctorService.createDoctor(doctorData);
        handleResetForm();
        onSuccess();
        onClose();
      } catch (err: any) {
        const backendMsg = err.response?.data?.message || err.response?.data?.error;
        setErrorMessage(
          backendMsg || (isVi ? `Có lỗi xảy ra khi tạo tài khoản ${currentRoleConfig.labelVi}.` : 'Failed to create account.')
        );
      } finally {
        setIsSubmitting(false);
      }
    } else {
      // Các role: PATIENT, RECEPTIONIST, ADMIN
      try {
        setIsSubmitting(true);
        const userData: AdminCreateUserRequest = {
          fullName: fullName.trim(),
          email: email.trim(),
          phone: phone.trim() ? phone.trim() : undefined,
          role: role
        };

        await userService.createUser(userData);
        handleResetForm();
        onSuccess();
        onClose();
      } catch (err: any) {
        const backendMsg = err.response?.data?.message || err.response?.data?.error;
        setErrorMessage(backendMsg || (isVi ? 'Có lỗi xảy ra khi tạo tài khoản.' : 'Failed to create user account.'));
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden max-h-[90vh] flex flex-col border border-slate-100">
        {/* Header */}
        <div className="flex justify-between items-center px-6 py-4 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
              <FiUserPlus className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-lg text-slate-800">
                {t('admin.addUserTitle', 'Thêm Người dùng mới')}
              </h3>
              <p className="text-xs text-slate-500">
                {t('admin.addUserSubtitle', 'Chọn vai trò và nhập thông tin tài khoản')}
              </p>
            </div>
          </div>
          <button 
            type="button"
            onClick={onClose} 
            className="text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg p-1.5 transition-colors"
          >
            <FiX className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <div className="p-6 overflow-y-auto space-y-4">
          {errorMessage && (
            <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-sm flex gap-2 items-start">
              <FiAlertCircle className="w-5 h-5 shrink-0 mt-0.5 text-rose-500" />
              <span>{errorMessage}</span>
            </div>
          )}

          <form id="unified-user-form" onSubmit={handleSubmit} className="space-y-4">
            {/* Bước 1: Chọn vai trò */}
            <div className="bg-emerald-50/50 p-4 rounded-lg border border-emerald-100/80">
              <label className="block text-sm font-semibold text-slate-800 mb-1.5">
                {t('admin.form.role', 'Vai trò tài khoản')} <span className="text-emerald-600">*</span>
              </label>
              <select
                value={role}
                onChange={handleRoleChange}
                className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm font-medium text-slate-800 outline-none transition-shadow"
              >
                {ROLE_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {isVi ? opt.labelVi : opt.labelEn}
                  </option>
                ))}
              </select>
              <p className="text-xs text-slate-500 mt-1.5">
                {currentRoleConfig.descVi}
              </p>
            </div>

            {/* Bước 2: Các trường thông tin chung */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                {t('admin.form.fullName', 'Họ và tên')} <span className="text-rose-500">*</span>
              </label>
              <Input
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder={isVi ? 'VD: Nguyễn Văn A' : 'e.g. John Doe'}
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  {t('admin.form.email', 'Email')} <span className="text-rose-500">*</span>
                </label>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  {t('admin.form.phone', 'Số điện thoại')} {isDoctorOrManager && <span className="text-rose-500">*</span>}
                </label>
                <Input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="0901234567"
                  required={isDoctorOrManager}
                />
              </div>
            </div>

            {/* Mật khẩu mặc định */}
            <div className="p-3.5 bg-emerald-50/60 border border-emerald-100 rounded-lg text-xs sm:text-sm text-slate-700 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <FiLock className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Mật khẩu mặc định khi tạo tài khoản:</span>
              </div>
              <span className="font-mono font-bold text-emerald-700 bg-white px-2.5 py-1 rounded border border-emerald-200 text-sm tracking-wider shadow-sm">
                123456
              </span>
            </div>

            {/* Trường đặc thù cho Bác sĩ (DOCTOR) & Trưởng khoa (DEPARTMENT_MANAGER) */}
            {isDoctorOrManager && (
              <div className="space-y-4 pt-3 border-t border-slate-200">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-800">
                    {role === 'DEPARTMENT_MANAGER'
                      ? (isVi ? 'Thông tin Trưởng khoa & Chuyên môn' : 'Department Manager & Specialty')
                      : (isVi ? 'Thông tin Bác sĩ & Chuyên môn' : 'Doctor & Specialty Details')}
                  </h4>
                  <span className="text-xs text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded font-medium">
                    {role === 'DEPARTMENT_MANAGER'
                      ? (isVi ? 'Hồ sơ Bác sĩ & Quản lý Khoa' : 'Doctor Profile & Manager')
                      : (isVi ? 'Tạo kèm hồ sơ Bác sĩ' : 'Includes Doctor Profile')}
                  </span>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    {t('admin.form.specialty', 'Chuyên khoa')} {role === 'DEPARTMENT_MANAGER' && <span className="text-rose-500">*</span>}
                  </label>

                  {noSpecialtyAvailable && (
                    <div className="mb-2 p-3 rounded-lg bg-amber-50 border border-amber-200 text-amber-800 text-xs flex gap-2 items-start">
                      <FiAlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-amber-600" />
                      <span>
                        {isVi 
                          ? 'Quy định: Mỗi chuyên khoa chỉ có duy nhất 1 Trưởng khoa. Hiện tại tất cả chuyên khoa đều đã có Trưởng khoa phụ trách.'
                          : 'Rule: Each specialty can only have 1 Department Manager. All current specialties already have a manager assigned.'}
                      </span>
                    </div>
                  )}

                  <select
                    value={specialtyId}
                    onChange={(e) => setSpecialtyId(e.target.value)}
                    required={role === 'DEPARTMENT_MANAGER'}
                    disabled={noSpecialtyAvailable}
                    className="w-full px-3.5 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none bg-white text-sm disabled:bg-slate-100 disabled:cursor-not-allowed"
                  >
                    <option value="">{t('admin.form.selectSpecialty', '-- Chọn chuyên khoa --')}</option>
                    {uniqueSpecialties.map(spec => {
                      const hasManager = !!spec.managerName;
                      const isOptionDisabled = role === 'DEPARTMENT_MANAGER' && hasManager;
                      return (
                        <option 
                          key={spec.id} 
                          value={spec.id}
                          disabled={isOptionDisabled}
                          className={isOptionDisabled ? 'text-slate-400 bg-slate-50' : ''}
                        >
                          {spec.name} {hasManager ? `(Đã có TK: ${spec.managerName})` : ''}
                        </option>
                      );
                    })}
                  </select>
                  {role === 'DEPARTMENT_MANAGER' && (
                    <p className="text-xs text-slate-500 mt-1">
                      {isVi
                        ? 'Quy định: Mỗi chuyên khoa chỉ có tối đa 1 Trưởng khoa. Các khoa đã có Trưởng khoa sẽ bị khóa lựa chọn.'
                        : 'Rule: Each specialty can only have 1 Department Manager. Specialties with an existing manager cannot be selected.'}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    {t('admin.form.fee', 'Phí khám (VNĐ)')} <span className="text-rose-500">*</span>
                  </label>
                  <Input
                    type="number"
                    min="0"
                    step="10000"
                    value={consultationFee}
                    onChange={(e) => setConsultationFee(e.target.value)}
                    placeholder="150000"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    {t('admin.form.biography', 'Tiểu sử / Giới thiệu')}
                  </label>
                  <textarea
                    value={biography}
                    onChange={(e) => setBiography(e.target.value)}
                    rows={3}
                    placeholder={isVi ? 'Kinh nghiệm, bằng cấp, học vị (PGS, TS, BSCKII)...' : 'Experience, degrees, specialization...'}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-shadow"
                  />
                </div>
              </div>
            )}
          </form>
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/50 flex justify-end gap-3 shrink-0">
          <Button 
            variant="outline" 
            onClick={onClose} 
            type="button"
            disabled={isSubmitting}
          >
            {t('common.cancel', 'Hủy')}
          </Button>

          <Button 
            type="submit" 
            form="unified-user-form" 
            isLoading={isSubmitting}
            disabled={isSubmitting || noSpecialtyAvailable}
          >
            {isVi ? `Tạo tài khoản ${currentRoleConfig.labelVi}` : `Create ${currentRoleConfig.labelEn}`}
          </Button>
        </div>
      </div>
    </div>
  );
};
