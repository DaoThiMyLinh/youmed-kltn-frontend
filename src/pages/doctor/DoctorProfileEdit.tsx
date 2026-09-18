import React, { useState, useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { FormField, Input, PasswordInput, Button, ErrorMessage, Toast } from '../../components';
import { updateProfileThunk, selectPatientProfile, selectPatientLoading, selectPatientError, selectPatientUpdateSuccess, resetUpdateSuccess } from '../../store/features/patient/patientSlice';
import { changePassword } from '../../services/patient.service';
import { useTranslation } from 'react-i18next';
import { FiArrowLeft, FiUser, FiLock, FiCheck } from 'react-icons/fi';
import { motion } from 'framer-motion';

const DoctorProfileEdit = () => {
  const dispatch = useDispatch<any>();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const profile = useSelector(selectPatientProfile);
  const loading = useSelector(selectPatientLoading);
  const error = useSelector(selectPatientError);
  const updateSuccess = useSelector(selectPatientUpdateSuccess);

  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    address: '',
    gender: '',
    dateOfBirth: '',
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [pwdLoading, setPwdLoading] = useState(false);
  const [pwdError, setPwdError] = useState<string | null>(null);
  const [pwdSuccess, setPwdSuccess] = useState<string | null>(null);

  const todayStr = useMemo(() => {
    const now = new Date();
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, '0');
    const d = String(now.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }, []);

  useEffect(() => {
    if (profile) {
      setFormData({
        fullName: profile.fullName || '',
        phone: profile.phone || '',
        address: profile.address || '',
        gender: profile.gender || '',
        dateOfBirth: profile.dateOfBirth || '',
      });
    }
  }, [profile]);

  useEffect(() => {
    if (updateSuccess) {
      const timer = setTimeout(() => {
        dispatch(resetUpdateSuccess());
        navigate('/doctor/profile');
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [updateSuccess, navigate, dispatch]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPasswordData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    dispatch(updateProfileThunk(formData as any));
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPwdError(null);
    setPwdSuccess(null);

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPwdError('Mật khẩu xác nhận không khớp');
      return;
    }

    if (passwordData.newPassword.length < 6) {
      setPwdError('Mật khẩu mới phải có ít nhất 6 ký tự');
      return;
    }

    setPwdLoading(true);
    try {
      await changePassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      });
      setPwdSuccess('Đổi mật khẩu thành công');
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setTimeout(() => setPwdSuccess(null), 3000);
    } catch (err: any) {
      setPwdError(err.response?.data?.message || 'Lỗi khi đổi mật khẩu');
    } finally {
      setPwdLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 relative pb-16 pt-4">
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 sm:p-6 rounded-3xl shadow-sm border border-slate-100"
      >
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate('/doctor/profile')} 
            className="w-10 h-10 rounded-full bg-slate-50 hover:bg-slate-100 flex items-center justify-center text-slate-600 transition-colors"
          >
            <FiArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">{t('profile.editProfile')}</h1>
            <p className="text-sm text-slate-500 font-medium">Cập nhật thông tin cá nhân và bảo mật.</p>
          </div>
        </div>
        <Button variant="outline" onClick={() => navigate('/doctor/profile')} disabled={loading} className="bg-slate-50 hover:bg-slate-100 border-slate-200">
          {t('common.cancel')}
        </Button>
      </motion.div>

      {updateSuccess && (
        <div className="fixed bottom-6 right-6 z-50">
          <Toast type="success" title="Thành công" message={t('profile.updateSuccess')} />
        </div>
      )}

      <motion.div 
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.1 }}
        className="space-y-6"
      >
        {/* Personal Info Form */}
        <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="p-6 border-b border-slate-100 bg-slate-50 flex items-center gap-3">
             <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shadow-sm">
               <FiUser className="w-5 h-5" />
             </div>
             <h2 className="text-xl font-bold text-slate-900">{t('profile.updateInfo')}</h2>
          </div>
          <div className="p-6 sm:p-8">
            <ErrorMessage message={error} className="mb-6" />
            
            <form onSubmit={handleSubmit} className="space-y-5">
              <FormField label={t('profile.fullName')} required>
                <Input 
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  required
                  disabled={loading}
                  className="bg-slate-50 border-slate-200 focus:bg-white h-12 rounded-xl"
                />
              </FormField>

              <FormField label={t('profile.phoneNumber')} required>
                <Input 
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  required
                  disabled={loading}
                  className="bg-slate-50 border-slate-200 focus:bg-white h-12 rounded-xl"
                />
              </FormField>

              <FormField label={t('profile.address')}>
                <Input 
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  disabled={loading}
                  className="bg-slate-50 border-slate-200 focus:bg-white h-12 rounded-xl"
                />
              </FormField>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <FormField label={t('profile.gender')}>
                  <select 
                    name="gender"
                    value={formData.gender}
                    onChange={handleChange}
                    disabled={loading}
                    className="w-full h-12 px-4 border border-slate-200 bg-slate-50 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:outline-none transition-colors"
                  >
                    <option value="">{t('profile.selectGender')}</option>
                    <option value="MALE">{t('profile.male')}</option>
                    <option value="FEMALE">{t('profile.female')}</option>
                    <option value="OTHER">{t('profile.other')}</option>
                  </select>
                </FormField>

                <FormField label={t('profile.dateOfBirth')}>
                  <Input 
                    type="date"
                    name="dateOfBirth"
                    max={todayStr}
                    value={formData.dateOfBirth}
                    onChange={handleChange}
                    disabled={loading}
                    className="bg-slate-50 border-slate-200 focus:bg-white h-12 rounded-xl"
                  />
                </FormField>
              </div>

              <div className="pt-6 flex justify-end">
                <Button type="submit" isLoading={loading} leftIcon={<FiCheck />} className="bg-emerald-600 hover:bg-emerald-700 shadow-md px-8 py-3">
                  {t('common.save')}
                </Button>
              </div>
            </form>
          </div>
        </div>

        {/* Change Password Form */}
        <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="p-6 border-b border-slate-100 bg-slate-50 flex items-center gap-3">
             <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center shadow-sm">
               <FiLock className="w-5 h-5" />
             </div>
             <h2 className="text-xl font-bold text-slate-900">Đổi mật khẩu</h2>
          </div>
          <div className="p-6 sm:p-8">
            {pwdSuccess && <div className="mb-6 p-4 bg-emerald-50 text-emerald-700 font-medium rounded-xl border border-emerald-200 flex items-center gap-2"><FiCheck className="w-5 h-5" /> {pwdSuccess}</div>}
            <ErrorMessage message={pwdError} className="mb-6" />
            
            <form onSubmit={handlePasswordSubmit} className="space-y-5">
              <FormField label="Mật khẩu hiện tại" required>
                <PasswordInput 
                  name="currentPassword"
                  placeholder="Nhập mật khẩu hiện tại"
                  value={passwordData.currentPassword}
                  onChange={handlePasswordChange}
                  required
                  disabled={pwdLoading}
                  className="bg-slate-50 border-slate-200 focus:bg-white h-12 rounded-xl"
                />
              </FormField>

              <FormField label="Mật khẩu mới" required>
                <PasswordInput 
                  name="newPassword"
                  placeholder="Tạo mật khẩu mới"
                  value={passwordData.newPassword}
                  onChange={handlePasswordChange}
                  required
                  disabled={pwdLoading}
                  className="bg-slate-50 border-slate-200 focus:bg-white h-12 rounded-xl"
                />
              </FormField>

              <FormField label="Xác nhận mật khẩu mới" required>
                <PasswordInput 
                  name="confirmPassword"
                  placeholder="Nhập lại mật khẩu mới"
                  value={passwordData.confirmPassword}
                  onChange={handlePasswordChange}
                  required
                  disabled={pwdLoading}
                  className="bg-slate-50 border-slate-200 focus:bg-white h-12 rounded-xl"
                />
              </FormField>

              <div className="pt-6 flex justify-end">
                <Button type="submit" variant="outline" className="border-emerald-200 text-emerald-700 hover:bg-emerald-50 hover:border-emerald-300 font-semibold px-6 py-2.5" isLoading={pwdLoading}>
                  Cập nhật mật khẩu
                </Button>
              </div>
            </form>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default DoctorProfileEdit;
