import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Loading } from '../../components';
import { FiCalendar, FiClock, FiActivity, FiFileText, FiPlus, FiChevronRight, FiCheckCircle } from 'react-icons/fi';
import { fetchProfileThunk, fetchAppointmentsThunk, cancelAppointmentThunk, selectPatientProfile, selectPatientAppointments, selectPatientLoading } from '../../store/features/patient/patientSlice';
import { selectUserName } from '../../store/features/auth/authSlice';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';

const PatientDashboard = () => {
  const dispatch = useDispatch<any>();
  const name = useSelector(selectUserName);
  const profile = useSelector(selectPatientProfile);
  const appointments = useSelector(selectPatientAppointments);
  const loading = useSelector(selectPatientLoading);
  const { t } = useTranslation();
  const navigate = useNavigate();

  const handleCancelAppointment = (id: number) => {
    if (window.confirm(t('common.confirmCancel') || 'Bạn có chắc chắn muốn hủy cuộc hẹn này không?')) {
      dispatch(cancelAppointmentThunk(id));
    }
  };

  useEffect(() => {
    dispatch(fetchProfileThunk());
    dispatch(fetchAppointmentsThunk());
  }, [dispatch]);

  const upcomingAppointment = appointments.find(a => a.status === 'CONFIRMED' || a.status === 'PENDING');
  const recentCompleted = appointments.find(a => a.status === 'COMPLETED');

  if (loading && !profile) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <Loading size="lg" />
      </div>
    );
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };
  
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 100 } }
  };

  return (
    <div className="flex flex-col gap-8 pb-10">
      {/* Welcome Section */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 bg-white p-8 rounded-3xl shadow-sm border border-slate-100 relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-emerald-100 to-transparent rounded-full opacity-50 -mr-20 -mt-20"></div>
        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold tracking-wider mb-4 border border-emerald-100 uppercase">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            Trang tổng quan
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight mb-2">Chào mừng, <span className="text-emerald-600">{name || profile?.fullName}</span>!</h1>
          <p className="text-lg text-slate-500">{t('dashboard.healthOverview')}</p>
        </div>
        <Link to="/patient/booking" className="relative z-10">
          <button className="w-full sm:w-auto bg-slate-900 text-white font-semibold px-6 py-3.5 rounded-2xl hover:bg-emerald-600 transition-all flex items-center justify-center gap-2 shadow-md hover:shadow-lg hover:-translate-y-0.5">
            <FiPlus /> {t('menu.bookAppointment')}
          </button>
        </Link>
      </motion.div>

      {/* Overview Cards */}
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
      >
        <motion.div variants={itemVariants} className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 hover:shadow-md transition-shadow relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity">
            <FiCalendar className="w-20 h-20 text-emerald-500 -mr-6 -mt-6" />
          </div>
          <div className="relative z-10 flex items-center gap-5">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-50 to-emerald-100 text-emerald-600 flex items-center justify-center shadow-sm border border-white ring-4 ring-emerald-50">
              <FiCalendar className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-1">{t('dashboard.upcoming')}</p>
              <p className="text-3xl font-extrabold text-slate-900">{appointments.filter(a => a.status === 'CONFIRMED').length}</p>
            </div>
          </div>
        </motion.div>

        <motion.div variants={itemVariants} className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 hover:shadow-md transition-shadow relative overflow-hidden group">
           <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity">
            <FiClock className="w-20 h-20 text-emerald-500 -mr-6 -mt-6" />
          </div>
          <div className="relative z-10 flex items-center gap-5">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-50 to-emerald-100 text-emerald-600 flex items-center justify-center shadow-sm border border-white ring-4 ring-emerald-50">
              <FiClock className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-1">{t('dashboard.completed')}</p>
              <p className="text-3xl font-extrabold text-slate-900">{appointments.filter(a => a.status === 'COMPLETED').length}</p>
            </div>
          </div>
        </motion.div>

        <motion.div variants={itemVariants} className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 hover:shadow-md transition-shadow relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity">
            <FiFileText className="w-20 h-20 text-purple-500 -mr-6 -mt-6" />
          </div>
          <div className="relative z-10 flex items-center gap-5">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-50 to-purple-100 text-purple-600 flex items-center justify-center shadow-sm border border-white ring-4 ring-purple-50">
              <FiFileText className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-1">{t('dashboard.records')}</p>
              <p className="text-3xl font-extrabold text-slate-900">4</p>
            </div>
          </div>
        </motion.div>

        <motion.div variants={itemVariants} className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 hover:shadow-md transition-shadow relative overflow-hidden group">
           <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity">
            <FiActivity className="w-20 h-20 text-amber-500 -mr-6 -mt-6" />
          </div>
          <div className="relative z-10 flex items-center gap-5">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-50 to-amber-100 text-amber-600 flex items-center justify-center shadow-sm border border-white ring-4 ring-amber-50">
              <FiActivity className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-1">{t('dashboard.healthStatus')}</p>
              <p className="text-xl font-extrabold text-slate-900 mt-1 text-emerald-600">{t('dashboard.good')}</p>
            </div>
          </div>
        </motion.div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-2">
        {/* Upcoming Appointment Section */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
          className="lg:col-span-2 bg-white rounded-3xl shadow-sm border border-slate-100 p-8"
        >
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-xl font-bold text-slate-900">{t('dashboard.nextAppointment')}</h2>
            <Link to="/patient/appointments" className="text-emerald-600 font-semibold text-sm hover:text-emerald-700 flex items-center gap-1">
              Xem tất cả <FiChevronRight />
            </Link>
          </div>

          {upcomingAppointment ? (
            <div className="flex flex-col md:flex-row gap-6 p-6 rounded-2xl border border-slate-100 bg-slate-50/50 hover:bg-slate-50 transition-colors group relative overflow-hidden">
              <div className="absolute top-0 left-0 w-1 h-full bg-emerald-500 rounded-l-2xl"></div>
              
              <div className="flex-shrink-0 flex flex-col items-center justify-center p-5 bg-white rounded-xl border border-slate-100 w-32 shadow-sm group-hover:border-emerald-200 transition-colors">
                <span className="text-sm font-bold text-emerald-600 uppercase mb-1">{new Date(upcomingAppointment.appointmentTime).toLocaleString('default', { month: 'short' })}</span>
                <span className="text-4xl font-black text-slate-900 mb-1">{new Date(upcomingAppointment.appointmentTime).getDate()}</span>
                <span className="text-sm font-medium text-slate-500 bg-slate-100 px-3 py-1 rounded-full">{new Date(upcomingAppointment.appointmentTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })}</span>
              </div>
              
              <div className="flex-1 flex flex-col justify-center">
                <div className="flex items-start justify-between mb-3">
                  <h3 className="text-xl font-bold text-slate-900">{upcomingAppointment.doctorName}</h3>
                  <div className={`px-3 py-1 rounded-full text-xs font-bold border ${
                    upcomingAppointment.status === 'CONFIRMED' 
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                      : 'bg-amber-50 text-amber-700 border-amber-200'
                  }`}>
                    {t(`status.${upcomingAppointment.status}`)}
                  </div>
                </div>
                <p className="text-slate-600 font-medium mb-2 flex items-center gap-2">
                  <FiActivity className="text-emerald-500" /> {upcomingAppointment.specialization}
                </p>
                <div className="bg-white p-3 rounded-xl border border-slate-100 mb-4">
                  <p className="text-sm text-slate-600 leading-relaxed"><span className="font-semibold text-slate-900">{t('appointment.reason')}:</span> {upcomingAppointment.reason}</p>
                </div>

                <div className="mt-auto flex gap-3">
                  <button onClick={() => navigate(`/patient/booking?reschedule=${upcomingAppointment.id}`)} className="flex-1 bg-white border border-slate-200 text-slate-700 font-medium py-2.5 rounded-xl hover:bg-slate-50 hover:border-slate-300 transition-colors text-sm">
                    {t('appointment.reschedule')}
                  </button>
                  <button onClick={() => handleCancelAppointment(upcomingAppointment.id)} className="flex-1 bg-red-50 border border-red-100 text-red-600 font-medium py-2.5 rounded-xl hover:bg-red-100 transition-colors text-sm">
                    {t('appointment.cancel')}
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-12 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200">
              <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-100 shadow-sm">
                <FiCalendar className="w-8 h-8 text-slate-400" />
              </div>
              <h3 className="text-lg font-bold text-slate-800 mb-2">{t('dashboard.noAppointments')}</h3>
              <p className="text-slate-500 mb-6">{t('dashboard.noAppointmentsDesc')}</p>
              <Link to="/patient/booking">
                <button className="bg-emerald-600 text-white font-semibold px-6 py-2.5 rounded-xl hover:bg-emerald-700 transition-colors">
                  {t('dashboard.bookNow')}
                </button>
              </Link>
            </div>
          )}
        </motion.div>

        {/* Recent Records & Prescriptions */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white rounded-3xl shadow-sm border border-slate-100 p-8"
        >
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-xl font-bold text-slate-900">{t('dashboard.recentDocuments')}</h2>
          </div>
          
          {recentCompleted ? (
            <div className="space-y-8 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-200 before:to-transparent">
              <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-white bg-emerald-100 text-emerald-600 shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 shadow-sm z-10">
                  <FiCheckCircle className="w-5 h-5" />
                </div>
                <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded-2xl border border-slate-100 bg-white shadow-sm group-hover:border-emerald-200 transition-colors">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="font-bold text-slate-900">{t('dashboard.medicalRecordAvailable')}</h3>
                  </div>
                  <p className="text-xs text-slate-500 font-medium mb-3">{t('dashboard.fromDr')} {recentCompleted.doctorName}</p>
                  <div className="flex justify-between items-end">
                    <span className="text-xs font-semibold text-slate-400">{new Date(recentCompleted.appointmentTime).toLocaleDateString()}</span>
                    <Link to={`/patient/appointments/${recentCompleted.id}`} className="text-xs font-bold text-emerald-600 hover:text-emerald-700 bg-emerald-50 px-2 py-1 rounded-md">{t('common.view')}</Link>
                  </div>
                </div>
              </div>
              
              <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-white bg-emerald-100 text-emerald-600 shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 shadow-sm z-10">
                  <FiFileText className="w-5 h-5" />
                </div>
                <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded-2xl border border-slate-100 bg-white shadow-sm group-hover:border-emerald-200 transition-colors">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="font-bold text-slate-900">{t('dashboard.prescriptionIssued')}</h3>
                  </div>
                  <p className="text-xs text-slate-500 font-medium mb-3 line-clamp-1">{t('history.for')}: {recentCompleted.reason}</p>
                  <div className="flex justify-between items-end">
                    <span className="text-xs font-semibold text-slate-400">{new Date(recentCompleted.appointmentTime).toLocaleDateString()}</span>
                    <Link to={`/patient/appointments/${recentCompleted.id}`} className="text-xs font-bold text-emerald-600 hover:text-emerald-700 bg-emerald-50 px-2 py-1 rounded-md">{t('common.view')}</Link>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-10 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200 h-64 flex flex-col items-center justify-center">
              <FiFileText className="w-10 h-10 text-slate-300 mb-4" />
              <p className="font-bold text-slate-700 mb-1">{t('dashboard.noRecentDocuments')}</p>
              <p className="text-sm text-slate-500">{t('dashboard.noRecentDocumentsDesc')}</p>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default PatientDashboard;
