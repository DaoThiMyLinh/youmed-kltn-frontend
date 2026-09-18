import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Button } from '../../components';
import { FiClipboard, FiClock, FiUser, FiCalendar, FiArrowRight, FiActivity } from 'react-icons/fi';
import { fetchAppointmentsThunk, selectPatientAppointments, selectPatientLoading } from '../../store/features/patient/patientSlice';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';

const PatientPrescriptions = () => {
  const dispatch = useDispatch<any>();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const appointments = useSelector(selectPatientAppointments);
  const loading = useSelector(selectPatientLoading);

  const completedAppointments = appointments.filter(apt => apt.status === 'COMPLETED');

  useEffect(() => {
    dispatch(fetchAppointmentsThunk());
  }, [dispatch]);

  if (loading && appointments.length === 0) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-emerald-500 border-t-transparent"></div>
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
    <div className="space-y-8 max-w-5xl mx-auto pb-16 pt-4">
      
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white p-6 sm:p-8 rounded-3xl shadow-sm border border-slate-100 relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-teal-100 to-transparent rounded-full opacity-50 -mr-20 -mt-20"></div>
        <div className="relative z-10 flex items-center gap-4">
           <div className="w-14 h-14 bg-teal-50 text-teal-600 rounded-2xl flex items-center justify-center shadow-sm">
             <FiClipboard className="w-7 h-7" />
           </div>
           <div>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight mb-1">{t('menu.prescriptions')}</h1>
            <p className="text-slate-500">Quản lý và theo dõi các đơn thuốc điện tử từ bác sĩ.</p>
           </div>
        </div>
      </motion.div>

      {completedAppointments.length === 0 ? (
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white p-16 rounded-3xl text-center shadow-sm border border-slate-100 border-dashed max-w-2xl mx-auto mt-8"
        >
          <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6 border-8 border-white shadow-sm">
            <FiClipboard className="w-10 h-10 text-slate-400" />
          </div>
          <h3 className="text-2xl font-bold text-slate-800 mb-3">{t('common.noData')}</h3>
          <p className="text-slate-500 text-lg">
            {t('history.noPrescriptionHistory')}
          </p>
        </motion.div>
      ) : (
        <motion.div variants={containerVariants} initial="hidden" animate="visible" className="grid grid-cols-1 gap-6">
          {completedAppointments.map((apt) => (
            <motion.div key={apt.id} variants={itemVariants} className="bg-white rounded-3xl shadow-sm border border-slate-100 hover:shadow-lg transition-all group overflow-hidden relative">
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-teal-50 to-transparent rounded-bl-full opacity-0 group-hover:opacity-100 transition-opacity -z-0"></div>
              
              <div className="p-6 relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                
                {/* Left: Date */}
                <div className="flex items-center gap-5 md:w-1/4">
                  <div className="flex flex-col items-center justify-center p-4 bg-teal-50 rounded-2xl border border-teal-100 min-w-[90px] shadow-inner group-hover:border-teal-200 transition-colors">
                    <span className="text-sm font-bold text-teal-500 uppercase tracking-wider mb-1">
                      {new Date(apt.appointmentTime).toLocaleString('default', { month: 'short' })}
                    </span>
                    <span className="text-4xl font-black text-slate-900">
                      {new Date(apt.appointmentTime).getDate()}
                    </span>
                  </div>
                  <div>
                    <div className="flex items-center gap-2 text-slate-700 font-bold mb-1">
                      <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center">
                        <FiClock className="w-4 h-4 text-slate-500" />
                      </div>
                      {new Date(apt.appointmentTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })}
                    </div>
                    <div className="flex items-center gap-2 text-slate-500 text-sm font-medium ml-1">
                      <FiCalendar className="w-4 h-4" /> {new Date(apt.appointmentTime).getFullYear()}
                    </div>
                  </div>
                </div>

                {/* Middle: Info */}
                <div className="flex-1 border-t md:border-t-0 md:border-l border-slate-100 pt-6 md:pt-0 md:pl-8">
                  <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2 mb-2">
                    <FiUser className="w-5 h-5 text-teal-500" /> Bác sĩ {apt.doctorName}
                  </h3>
                  <div className="inline-flex items-center gap-2 bg-slate-50 px-3 py-1 rounded-full text-sm font-semibold text-slate-600 mb-4 border border-slate-100">
                    <FiActivity className="w-4 h-4 text-slate-400" /> {apt.specialization}
                  </div>
                  <div className="bg-slate-50/50 p-4 rounded-xl border border-slate-100">
                    <p className="text-slate-600 font-medium leading-relaxed">
                      <span className="font-bold text-slate-800 block mb-1 uppercase tracking-wider text-xs">{t('history.diagnosisReference')}:</span> 
                      {apt.reason}
                    </p>
                  </div>
                </div>

                {/* Right: Action */}
                <div className="flex flex-col items-start md:items-end border-t md:border-t-0 md:border-l border-slate-100 pt-6 md:pt-0 md:pl-8 gap-4 md:w-1/4 justify-center">
                  <Button 
                    className="w-full md:w-auto bg-slate-900 hover:bg-teal-600 text-white rounded-xl shadow-md transition-colors font-medium px-6 py-3"
                    rightIcon={<FiArrowRight />}
                    onClick={() => navigate(`/patient/appointments/${apt.id}`)}
                  >
                    Xem đơn thuốc
                  </Button>
                </div>

              </div>
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  );
};

export default PatientPrescriptions;
