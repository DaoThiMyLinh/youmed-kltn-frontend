import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Button } from '../../components';
import { FiEdit2, FiMail, FiPhone, FiUser, FiMapPin, FiCalendar, FiUsers, FiBriefcase, FiDollarSign, FiInfo } from 'react-icons/fi';
import { fetchProfileThunk, selectPatientProfile, selectPatientLoading } from '../../store/features/patient/patientSlice';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import axiosClient from '../../api/axiosClient';
import type { Doctor } from '../../types/appointment';
import { motion } from 'framer-motion';

const DoctorProfile = () => {
  const dispatch = useDispatch<any>();
  const { t } = useTranslation();
  const profile = useSelector(selectPatientProfile);
  const loadingUser = useSelector(selectPatientLoading);

  const [doctorInfo, setDoctorInfo] = useState<Doctor | null>(null);
  const [loadingDoctor, setLoadingDoctor] = useState(false);

  useEffect(() => {
    if (!profile) {
      dispatch(fetchProfileThunk());
    }
  }, [dispatch, profile]);

  useEffect(() => {
    const fetchDoctorInfo = async () => {
      if (!profile?.email) return;
      try {
        setLoadingDoctor(true);
        const response = await axiosClient.get('/doctors?size=1000');
        const doctor = response.data.content.find((d: any) => d.email === profile.email);
        if (doctor) {
          setDoctorInfo(doctor);
        }
      } catch (error) {
        console.error('Failed to fetch doctor info:', error);
      } finally {
        setLoadingDoctor(false);
      }
    };

    if (profile) {
      fetchDoctorInfo();
    }
  }, [profile]);

  if ((loadingUser || loadingDoctor) && !profile) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-emerald-500 border-t-transparent"></div>
      </div>
    );
  }

  if (!profile) return null;

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-16 pt-4">
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white p-6 sm:p-8 rounded-3xl shadow-sm border border-slate-100 relative overflow-hidden flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6"
      >
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-emerald-100 to-transparent rounded-full opacity-40 -mr-20 -mt-20 pointer-events-none"></div>
        <div className="relative z-10">
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight mb-2">{t('profile.myProfile')}</h1>
          <p className="text-slate-500 font-medium">Quản lý thông tin cá nhân và hồ sơ chuyên môn của bạn.</p>
        </div>
        <Link to="/doctor/profile/edit" className="relative z-10">
          <Button leftIcon={<FiEdit2 />} className="bg-emerald-600 hover:bg-emerald-700 shadow-sm px-6">
            {t('profile.editProfile')}
          </Button>
        </Link>
      </motion.div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.1 }}
        className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden relative"
      >
        {/* Cover Photo */}
        <div className="h-32 sm:h-48 bg-gradient-to-r from-emerald-500 to-emerald-500 w-full relative">
           <div className="absolute inset-0 bg-black/10"></div>
           <div className="absolute bottom-0 left-0 w-full h-24 bg-gradient-to-t from-black/40 to-transparent"></div>
        </div>

        {/* Avatar & Header Info */}
        <div className="px-6 sm:px-10 pb-8 relative">
           <div className="flex flex-col sm:flex-row sm:items-end gap-6 -mt-16 sm:-mt-20 mb-6">
              <div className="w-32 h-32 sm:w-40 sm:h-40 rounded-full bg-white p-2 shadow-xl border border-slate-100 relative z-10">
                <div className="w-full h-full bg-slate-50 rounded-full flex items-center justify-center border border-slate-100 overflow-hidden relative group">
                  <FiUser className="w-16 h-16 text-slate-300" />
                  <div className="absolute inset-0 bg-emerald-900/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                    <FiEdit2 className="w-6 h-6 text-white" />
                  </div>
                </div>
              </div>

              <div className="flex-1 pb-2">
                <div className="flex flex-wrap items-center gap-3 mb-2">
                  <h2 className="text-3xl font-extrabold text-slate-900">{profile.fullName}</h2>
                  {doctorInfo && (
                    <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border shadow-sm ${
                      doctorInfo.active 
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                        : 'bg-red-50 text-red-700 border-red-200'
                    }`}>
                      {doctorInfo.active ? t('schedule.active') : t('schedule.inactive')}
                    </span>
                  )}
                </div>
                <div className="flex flex-wrap gap-4 text-slate-600 font-medium">
                  <p className="flex items-center gap-2"><FiMail className="w-4 h-4 text-slate-400" /> {profile.email}</p>
                  {doctorInfo?.specialty && (
                    <p className="flex items-center gap-2 text-emerald-600"><FiBriefcase className="w-4 h-4 text-emerald-400" /> Chuyên khoa {doctorInfo.specialty.name}</p>
                  )}
                </div>
              </div>
           </div>

           <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 mt-10">
             
             {/* Personal Information */}
             <div className="space-y-6">
                <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
                  <div className="w-10 h-10 rounded-xl bg-slate-50 text-slate-500 flex items-center justify-center shadow-sm">
                    <FiUser className="w-5 h-5" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900">{t('profile.personalInfo')}</h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 hover:border-emerald-100 transition-colors">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-2">
                      <FiPhone className="w-3.5 h-3.5" /> {t('profile.phoneNumber')}
                    </span>
                    <span className="text-slate-800 font-semibold text-lg">{profile.phone || t('profile.notProvided')}</span>
                  </div>
                  
                  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 hover:border-emerald-100 transition-colors">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-2">
                      <FiUsers className="w-3.5 h-3.5" /> {t('profile.gender')}
                    </span>
                    <span className="text-slate-800 font-semibold text-lg capitalize">
                      {profile.gender ? t(`profile.${profile.gender.toLowerCase()}`) : t('profile.notProvided')}
                    </span>
                  </div>

                  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 hover:border-emerald-100 transition-colors sm:col-span-2">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-2">
                      <FiMapPin className="w-3.5 h-3.5" /> {t('profile.address')}
                    </span>
                    <span className="text-slate-800 font-semibold text-lg">{profile.address || t('profile.notProvided')}</span>
                  </div>

                  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 hover:border-emerald-100 transition-colors sm:col-span-2">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-2">
                      <FiCalendar className="w-3.5 h-3.5" /> {t('profile.dateOfBirth')}
                    </span>
                    <span className="text-slate-800 font-semibold text-lg">
                      {profile.dateOfBirth ? new Date(profile.dateOfBirth).toLocaleDateString('vi-VN', {
                        year: 'numeric', month: 'long', day: 'numeric'
                      }) : t('profile.notProvided')}
                    </span>
                  </div>
                </div>
             </div>

             {/* Professional Information */}
             <div className="space-y-6">
                <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
                  <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shadow-sm">
                    <FiBriefcase className="w-5 h-5" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900">Hồ sơ Chuyên môn</h3>
                </div>

                {loadingDoctor ? (
                  <div className="flex justify-center py-10"><div className="animate-spin rounded-full h-8 w-8 border-4 border-emerald-500 border-t-transparent"></div></div>
                ) : doctorInfo ? (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <div className="bg-emerald-50/50 p-4 rounded-2xl border border-emerald-100 hover:border-emerald-200 transition-colors">
                        <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider mb-1 flex items-center gap-2">
                          <FiBriefcase className="w-3.5 h-3.5" /> {t('appointment.specialty')}
                        </span>
                        <span className="text-emerald-900 font-bold text-lg">
                          {doctorInfo.specialty?.name || t('profile.notProvided')}
                        </span>
                      </div>

                      <div className="bg-emerald-50/50 p-4 rounded-2xl border border-emerald-100 hover:border-emerald-200 transition-colors">
                        <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider mb-1 flex items-center gap-2">
                          <FiDollarSign className="w-3.5 h-3.5" /> {t('appointment.consultationFee')}
                        </span>
                        <span className="text-emerald-900 font-bold text-lg">
                          {doctorInfo.consultationFee ? new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(doctorInfo.consultationFee) : t('appointment.free')}
                        </span>
                      </div>
                    </div>

                    <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100">
                      <span className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                        <FiInfo className="w-4 h-4" /> Tiểu sử / Kinh nghiệm làm việc
                      </span>
                      <p className="text-slate-700 font-medium leading-relaxed whitespace-pre-wrap">
                        {doctorInfo.biography || t('booking.noBiography')}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-12 bg-slate-50 rounded-3xl border border-dashed border-slate-200">
                    <FiBriefcase className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                    <p className="text-slate-600 font-medium">Chưa có thông tin chuyên môn</p>
                    <p className="text-slate-500 text-sm mt-1">Vui lòng liên hệ quản trị viên để cập nhật.</p>
                  </div>
                )}
             </div>

           </div>
        </div>
      </motion.div>
    </div>
  );
};

export default DoctorProfile;
