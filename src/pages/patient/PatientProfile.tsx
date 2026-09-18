import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Button } from '../../components';
import { FiEdit2, FiMail, FiPhone, FiUser, FiMapPin, FiCalendar, FiUsers, FiShield } from 'react-icons/fi';
import { fetchProfileThunk, selectPatientProfile, selectPatientLoading } from '../../store/features/patient/patientSlice';
import { selectUserRole } from '../../store/features/auth/authSlice';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';

const PatientProfile = () => {
  const dispatch = useDispatch<any>();
  const { t } = useTranslation();
  const profile = useSelector(selectPatientProfile);
  const loading = useSelector(selectPatientLoading);
  const role = useSelector(selectUserRole);

  useEffect(() => {
    if (!profile) {
      dispatch(fetchProfileThunk());
    }
  }, [dispatch, profile]);

  if (loading && !profile) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-emerald-500 border-t-transparent"></div>
      </div>
    );
  }

  if (!profile) return null;

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12 pt-6">
      
      {/* Header Section */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl shadow-sm border border-slate-100"
      >
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">{t('profile.myProfile')}</h1>
          <p className="text-slate-500">Quản lý thông tin cá nhân và tài khoản của bạn.</p>
        </div>
        <Link to={role === 'DOCTOR' ? "/doctor/profile/edit" : "/patient/profile/edit"}>
          <Button leftIcon={<FiEdit2 />} className="w-full sm:w-auto bg-slate-900 hover:bg-emerald-600 rounded-xl shadow-md transition-all">
            {t('profile.editProfile')}
          </Button>
        </Link>
      </motion.div>

      {/* Main Profile Card */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.1 }}
        className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden relative"
      >
        {/* Banner */}
        <div className="h-32 bg-gradient-to-r from-emerald-400 to-teal-400 relative">
           <div className="absolute inset-0 bg-white/20 backdrop-blur-sm"></div>
           <div className="absolute -bottom-12 left-8">
             <div className="relative">
                <div className="w-24 h-24 rounded-full bg-white flex items-center justify-center border-4 border-white shadow-md overflow-hidden relative z-10">
                  <FiUser className="w-12 h-12 text-slate-300" />
                </div>
                <div className="absolute bottom-1 right-0 bg-emerald-500 border-2 border-white text-white p-1.5 rounded-full z-20 shadow-sm">
                  <FiShield className="w-4 h-4" />
                </div>
             </div>
           </div>
        </div>

        {/* Profile Header Info */}
        <div className="pt-16 pb-8 px-8 border-b border-slate-100 bg-slate-50/30">
          <h2 className="text-3xl font-extrabold text-slate-900 mb-2">{profile.fullName}</h2>
          <div className="flex flex-wrap items-center gap-4 text-slate-600 font-medium">
            <span className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-lg border border-slate-200 shadow-sm">
              <FiMail className="w-4 h-4 text-emerald-500" /> {profile.email}
            </span>
            {profile.phone && (
              <span className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-lg border border-slate-200 shadow-sm">
                <FiPhone className="w-4 h-4 text-emerald-500" /> {profile.phone}
              </span>
            )}
          </div>
        </div>
        
        {/* Profile Details Grid */}
        <div className="p-8">
          <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center">
              <FiUser />
            </div>
            {t('profile.personalInfo')}
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100 flex items-start gap-4 hover:border-emerald-200 transition-colors">
              <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-slate-400 shadow-sm flex-shrink-0">
                <FiPhone className="w-5 h-5" />
              </div>
              <div>
                <span className="text-sm font-semibold text-slate-500 uppercase tracking-wider block mb-1">{t('profile.phoneNumber')}</span>
                <span className="text-slate-900 font-bold text-lg">{profile.phone || <span className="text-slate-400 italic font-normal">{t('profile.notProvided')}</span>}</span>
              </div>
            </div>
            
            <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100 flex items-start gap-4 hover:border-emerald-200 transition-colors">
              <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-slate-400 shadow-sm flex-shrink-0">
                <FiMapPin className="w-5 h-5" />
              </div>
              <div>
                <span className="text-sm font-semibold text-slate-500 uppercase tracking-wider block mb-1">{t('profile.address')}</span>
                <span className="text-slate-900 font-bold text-lg leading-snug block">{profile.address || <span className="text-slate-400 italic font-normal">{t('profile.notProvided')}</span>}</span>
              </div>
            </div>

            <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100 flex items-start gap-4 hover:border-emerald-200 transition-colors">
              <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-slate-400 shadow-sm flex-shrink-0">
                <FiUsers className="w-5 h-5" />
              </div>
              <div>
                <span className="text-sm font-semibold text-slate-500 uppercase tracking-wider block mb-1">{t('profile.gender')}</span>
                <span className="text-slate-900 font-bold text-lg capitalize">
                  {profile.gender ? t(`profile.${profile.gender.toLowerCase()}`) : <span className="text-slate-400 italic font-normal">{t('profile.notProvided')}</span>}
                </span>
              </div>
            </div>

            <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100 flex items-start gap-4 hover:border-emerald-200 transition-colors">
              <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-slate-400 shadow-sm flex-shrink-0">
                <FiCalendar className="w-5 h-5" />
              </div>
              <div>
                <span className="text-sm font-semibold text-slate-500 uppercase tracking-wider block mb-1">{t('profile.dateOfBirth')}</span>
                <span className="text-slate-900 font-bold text-lg">
                  {profile.dateOfBirth ? new Date(profile.dateOfBirth).toLocaleDateString() : <span className="text-slate-400 italic font-normal">{t('profile.notProvided')}</span>}
                </span>
              </div>
            </div>

            <div className="md:col-span-2 bg-slate-50 p-5 rounded-2xl border border-slate-100 flex items-start gap-4 hover:border-emerald-200 transition-colors">
              <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 shadow-sm flex-shrink-0">
                <FiShield className="w-5 h-5" />
              </div>
              <div>
                <span className="text-sm font-semibold text-slate-500 uppercase tracking-wider block mb-1">{t('profile.role')}</span>
                <div className="inline-block bg-emerald-500 text-white px-3 py-1 rounded-md font-bold uppercase text-sm tracking-widest mt-1 shadow-sm">
                  {profile.role === 'PATIENT' 
                    ? t('profile.patientRole') 
                    : profile.role === 'DOCTOR' 
                      ? t('profile.doctorRole') 
                      : profile.role}
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default PatientProfile;
