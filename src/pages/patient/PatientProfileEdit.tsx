import React, { useState, useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { FormField, Input, PasswordInput, Button, ErrorMessage, Toast } from '../../components';
import { updateProfileThunk, selectPatientProfile, selectPatientLoading, selectPatientError, selectPatientUpdateSuccess, resetUpdateSuccess } from '../../store/features/patient/patientSlice';
import { changePassword } from '../../services/patient.service';
import { selectUserRole } from '../../store/features/auth/authSlice';
import { useTranslation } from 'react-i18next';
import { FiArrowLeft, FiLock, FiSave, FiEdit3, FiCheckCircle } from 'react-icons/fi';
import { motion } from 'framer-motion';

const PatientProfileEdit = () => {
  const dispatch = useDispatch<any>();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const profile = useSelector(selectPatientProfile);
  const loading = useSelector(selectPatientLoading);
  const error = useSelector(selectPatientError);
  const updateSuccess = useSelector(selectPatientUpdateSuccess);
  const role = useSelector(selectUserRole);

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
        navigate(role === 'DOCTOR' ? '/doctor/profile' : '/patient/profile');
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [updateSuccess, navigate, dispatch, role]);

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

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };
  
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 100 } }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-16 pt-8 relative">
      <motion.div 
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="flex items-center justify-between bg-white/60 backdrop-blur-md px-6 py-4 rounded-full border border-slate-100 shadow-sm sticky top-20 z-40"
      >
        <button className="flex items-center gap-2 text-slate-600 hover:text-emerald-600 font-semibold transition-colors" onClick={() => navigate(role === 'DOCTOR' ? '/doctor/profile' : '/patient/profile')}>
          <FiArrowLeft /> {t('common.cancel')}
        </button>
        <h1 className="text-lg font-bold text-slate-900">{t('profile.editProfile')}</h1>
        <div className="w-24"></div> {/* Spacer for alignment */}
      </motion.div>

      {updateSuccess && (
        <div className="fixed top-24 right-6 z-50 animate-in fade-in slide-in-from-top-4 duration-300">
          <Toast type="success" title="Thành công" message={t('profile.updateSuccess')} />
        </div>
      )}

      <motion.div variants={containerVariants} initial="hidden" animate="visible" className="grid grid-cols-1 gap-8">
        
        {/* Profile Info Form */}
        <motion.div variants={itemVariants} className="bg-white rounded-3xl shadow-sm border border-slate-100 p-8 sm:p-10 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-bl from-emerald-50 to-transparent rounded-bl-full opacity-50 -z-0"></div>
          
          <div className="relative z-10">
            <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center">
                <FiEdit3 className="w-5 h-5" />
              </div>
              {t('profile.updateInfo')}
            </h2>
            
            <ErrorMessage message={error} className="mb-6" />
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField label={t('profile.fullName')} required>
                  <Input 
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleChange}
                    required
                    disabled={loading}
                    className="bg-slate-50 border-slate-200 focus:bg-white"
                  />
                </FormField>

                <FormField label={t('profile.phoneNumber')} required>
                  <Input 
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    required
                    disabled={loading}
                    className="bg-slate-50 border-slate-200 focus:bg-white"
                  />
                </FormField>

                <div className="md:col-span-2">
                  <FormField label={t('profile.address')}>
                    <Input 
                      name="address"
                      value={formData.address}
                      onChange={handleChange}
                      disabled={loading}
                      className="bg-slate-50 border-slate-200 focus:bg-white"
                    />
                  </FormField>
                </div>

                <FormField label={t('profile.gender')}>
                  <select 
                    name="gender"
                    value={formData.gender}
                    onChange={handleChange}
                    disabled={loading}
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none text-slate-700 font-medium transition-all"
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
                    className="bg-slate-50 border-slate-200 focus:bg-white"
                  />
                </FormField>
              </div>

              <div className="pt-6 border-t border-slate-100 flex justify-end">
                <Button type="submit" isLoading={loading} leftIcon={<FiSave />} className="bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-3 rounded-xl shadow-md">
                  {t('common.save')}
                </Button>
              </div>
            </form>
          </div>
        </motion.div>

        {/* Change Password Form */}
        <motion.div variants={itemVariants} className="bg-white rounded-3xl shadow-sm border border-slate-100 p-8 sm:p-10 relative overflow-hidden">
           <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-bl from-amber-50 to-transparent rounded-bl-full opacity-50 -z-0"></div>
          
          <div className="relative z-10">
            <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center">
                <FiLock className="w-5 h-5" />
              </div>
              Đổi mật khẩu
            </h2>
            
            {pwdSuccess && (
              <div className="mb-6 p-4 bg-emerald-50 text-emerald-700 rounded-2xl border border-emerald-200 flex items-center gap-2 font-medium">
                <FiCheckCircle className="w-5 h-5" /> {pwdSuccess}
              </div>
            )}
            <ErrorMessage message={pwdError} className="mb-6" />
            
            <form onSubmit={handlePasswordSubmit} className="space-y-6 max-w-2xl">
              <FormField label="Mật khẩu hiện tại" required>
                <PasswordInput 
                  name="currentPassword"
                  placeholder="Nhập mật khẩu hiện tại"
                  value={passwordData.currentPassword}
                  onChange={handlePasswordChange}
                  required
                  disabled={pwdLoading}
                />
              </FormField>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField label="Mật khẩu mới" required>
                  <PasswordInput 
                    name="newPassword"
                    placeholder="Tạo mật khẩu mới"
                    value={passwordData.newPassword}
                    onChange={handlePasswordChange}
                    required
                    disabled={pwdLoading}
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
                  />
                </FormField>
              </div>

              <div className="pt-6 border-t border-slate-100 flex justify-end">
                <Button type="submit" isLoading={pwdLoading} className="bg-slate-900 hover:bg-slate-800 text-white px-8 py-3 rounded-xl shadow-md">
                  Cập nhật mật khẩu
                </Button>
              </div>
            </form>
          </div>
        </motion.div>

      </motion.div>
    </div>
  );
};

export default PatientProfileEdit;
