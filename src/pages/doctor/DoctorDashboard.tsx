import { useEffect, useState } from 'react';
import { ErrorMessage, Button } from '../../components';
import { FiCalendar, FiClock, FiCheckCircle, FiInbox, FiUser, FiFileText, FiActivity, FiArrowRight } from 'react-icons/fi';
import { scheduleService } from '../../services/schedule.service';
import { consultationService } from '../../services/consultation.service';
import { useTranslation } from 'react-i18next';
import type { DashboardMetrics } from '../../types/schedule';
import type { Appointment } from '../../types/patient';
import type { MedicalRecord } from '../../types/consultation';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const DoctorDashboard = () => {
  const { t, i18n } = useTranslation();
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [upcomingAppointment, setUpcomingAppointment] = useState<Appointment | null>(null);
  const [recentRecord, setRecentRecord] = useState<MedicalRecord | null>(null);
  const [recentAppointment, setRecentAppointment] = useState<Appointment | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        setLoading(true);
        const [metricsData, aptData, recordData] = await Promise.all([
          scheduleService.getDoctorMetrics(),
          consultationService.getDoctorAppointments(0, 50, 'appointmentTime', 'ASC'),
          consultationService.getMedicalRecordsHistory(0, 20)
        ]);
        
        setMetrics(metricsData);
        
        const now = new Date().getTime();
        const upcoming = aptData.content.find(a => 
          (a.status === 'PENDING' || a.status === 'CONFIRMED' || a.status === 'CHECKED_IN') && 
          new Date(a.appointmentTime).getTime() >= now
        );
        setUpcomingAppointment(upcoming || null);

        const myAppointmentIds = aptData.content.map(a => a.id);
        const myMedicalRecords = recordData.content.filter(mr => myAppointmentIds.includes(mr.appointmentId));

        if (myMedicalRecords.length > 0) {
          const latestRecord = myMedicalRecords[0];
          setRecentRecord(latestRecord);
          
          // Try to find the full appointment details from the fetched list
          const fullApt = aptData.content.find(a => a.id === latestRecord.appointmentId);
          if (fullApt) {
            setRecentAppointment(fullApt);
          } else {
            // If not found in ASC list, try fetching a few recent appointments DESC
            try {
              const recentApts = await consultationService.getDoctorAppointments(0, 20, 'appointmentTime', 'DESC');
              const found = recentApts.content.find(a => a.id === latestRecord.appointmentId);
              if (found) setRecentAppointment(found);
            } catch (e) {
              console.log("Could not fetch recent appointments DESC");
            }
          }
        }
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to fetch dashboard metrics');
      } finally {
        setLoading(false);
      }
    };

    fetchMetrics();
  }, []);

  if (loading) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-emerald-500 border-t-transparent"></div>
      </div>
    );
  }
  if (error) return <ErrorMessage message={error} />;

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };
  
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 100 } }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'CONFIRMED': return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'PENDING': return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'CHECKED_IN': return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      default: return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className="space-y-8 pb-10">
      
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-6"
      >
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-emerald-100 to-transparent rounded-full opacity-40 -mr-20 -mt-20"></div>
        <div className="relative z-10">
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight mb-2 flex items-center gap-3">
            {t('dashboard.doctorDashboard')}
            <span className="bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-sm font-bold tracking-wider">HÔM NAY</span>
          </h1>
          <p className="text-slate-500 font-medium">Chào mừng trở lại! Dưới đây là tổng quan lịch trình làm việc của bạn.</p>
        </div>
        <Link to="/doctor/schedule" className="relative z-10 bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-xl font-semibold shadow-md hover:shadow-lg transition-all flex items-center gap-2">
          <FiCalendar /> Đăng ký lịch làm việc
        </Link>
      </motion.div>

      {/* Metrics Grid */}
      <motion.div variants={containerVariants} initial="hidden" animate="visible" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <motion.div variants={itemVariants} className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex items-center gap-5 hover:border-emerald-200 transition-colors group">
          <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform">
            <FiCalendar className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-1">{t('dashboard.workingDays')}</p>
            <h3 className="text-3xl font-black text-slate-900">{metrics?.workingDays || 0}</h3>
          </div>
        </motion.div>

        <motion.div variants={itemVariants} className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex items-center gap-5 hover:border-emerald-200 transition-colors group">
          <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform">
            <FiClock className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-1">{t('dashboard.todaysSlots')}</p>
            <h3 className="text-3xl font-black text-slate-900">{metrics?.todaySlots || 0}</h3>
          </div>
        </motion.div>

        <motion.div variants={itemVariants} className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex items-center gap-5 hover:border-emerald-200 transition-colors group">
          <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform">
            <FiCheckCircle className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-1">{t('dashboard.bookedSlots')}</p>
            <h3 className="text-3xl font-black text-slate-900">{metrics?.bookedSlots || 0}</h3>
          </div>
        </motion.div>

        <motion.div variants={itemVariants} className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex items-center gap-5 hover:border-amber-200 transition-colors group">
          <div className="w-14 h-14 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform">
            <FiInbox className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-1">{t('dashboard.availableSlots')}</p>
            <h3 className="text-3xl font-black text-slate-900">{metrics?.availableSlots || 0}</h3>
          </div>
        </motion.div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Upcoming Appointment Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="lg:col-span-2 bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden relative"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-emerald-50 to-transparent rounded-bl-full opacity-50 pointer-events-none"></div>
          
          <div className="p-6 sm:p-8 border-b border-slate-100 flex items-center justify-between">
            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <FiUser className="text-emerald-500" /> {t('dashboard.nextAppointment')}
            </h2>
            {upcomingAppointment && (
              <Link to="/doctor/appointments" className="text-sm font-semibold text-emerald-600 hover:text-emerald-700 hidden sm:flex items-center gap-1 group">
                Xem tất cả lịch hẹn <FiArrowRight className="group-hover:translate-x-1 transition-transform" />
              </Link>
            )}
          </div>

          <div className="p-6 sm:p-8 relative z-10">
            {upcomingAppointment ? (
              <div className="flex flex-col sm:flex-row gap-6 p-6 rounded-2xl border border-emerald-100 bg-emerald-50/30 group hover:bg-emerald-50/50 transition-colors">
                
                <div className="flex-shrink-0 flex flex-col items-center justify-center p-4 bg-white rounded-xl border border-emerald-100 w-32 shadow-sm">
                  <span className="text-sm font-bold text-emerald-500 uppercase tracking-widest">{new Date(upcomingAppointment.appointmentTime).toLocaleString(i18n.language === 'en' ? 'en-US' : 'vi-VN', { month: 'short' })}</span>
                  <span className="text-4xl font-black text-slate-900 my-1">{new Date(upcomingAppointment.appointmentTime).getDate()}</span>
                  <span className="text-sm font-semibold text-slate-500 bg-slate-100 px-2.5 py-0.5 rounded-md mt-1">
                    {new Date(upcomingAppointment.appointmentTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })}
                  </span>
                </div>
                
                <div className="flex-1 flex flex-col justify-center">
                  <div className="flex flex-wrap items-start justify-between gap-2 mb-3">
                    <h3 className="text-xl font-bold text-slate-900">{upcomingAppointment.patientName}</h3>
                    <div className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border ${getStatusColor(upcomingAppointment.status)}`}>
                      {t(`status.${upcomingAppointment.status}`)}
                    </div>
                  </div>
                  
                  <div className="bg-white p-3 rounded-lg border border-slate-100 mb-4 shadow-sm">
                     <p className="text-sm text-slate-600 font-medium leading-relaxed">
                       <span className="text-slate-400 font-bold uppercase tracking-wider text-xs block mb-0.5">{t('appointment.reason')}</span> 
                       {upcomingAppointment.reason}
                     </p>
                  </div>

                  <div className="mt-auto">
                    <Link to={`/doctor/consultation/${upcomingAppointment.id}`}>
                      <Button className="w-full sm:w-auto bg-slate-900 hover:bg-emerald-600 shadow-md">
                        Tiến hành Khám bệnh
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            ) : (
              <div className="py-10 text-center flex flex-col items-center">
                <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-4 border-4 border-white shadow-sm">
                   <FiCalendar className="w-8 h-8 text-slate-300" />
                </div>
                <h3 className="text-lg font-bold text-slate-800 mb-2">{t('dashboard.noAppointments')}</h3>
                <p className="text-slate-500 mb-6">{t('dashboard.noAppointmentsDesc')}</p>
                <Link to="/doctor/appointments">
                  <Button variant="outline" className="font-semibold">{t('dashboard.viewSchedule')}</Button>
                </Link>
              </div>
            )}
          </div>
        </motion.div>

        {/* Recent Records & Prescriptions */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden"
        >
          <div className="p-6 border-b border-slate-100 flex items-center gap-2">
            <FiActivity className="text-teal-500" />
            <h2 className="text-lg font-bold text-slate-900">{t('dashboard.recentDocuments')}</h2>
          </div>
          
          <div className="p-6">
            {recentRecord ? (
              <div className="space-y-6">
                <div className="relative pl-6 border-l-2 border-slate-100 pb-2">
                  <div className="absolute w-3.5 h-3.5 bg-emerald-500 border-2 border-white rounded-full -left-[9px] top-1 shadow-sm"></div>
                  <div className="flex justify-between items-start gap-4">
                    <div>
                      <p className="text-sm font-bold text-slate-900">{t('dashboard.medicalRecordAvailable')}</p>
                      <p className="text-sm font-medium text-slate-500 mt-1">{t('history.for')}: <span className="text-slate-700">{recentRecord.patientName || `PT-${recentRecord.patientId}`}</span></p>
                    </div>
                    <Link to={`/doctor/consultation/${recentRecord.appointmentId}`} state={{ appointment: recentAppointment || { id: recentRecord.appointmentId, patientName: recentRecord.patientName || `PT-${recentRecord.patientId}`, patientId: recentRecord.patientId, status: 'COMPLETED' } }} className="text-xs text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md font-bold hover:bg-emerald-100 transition-colors flex-shrink-0">
                      {t('common.view')}
                    </Link>
                  </div>
                  <p className="text-xs font-semibold text-slate-400 mt-3 bg-slate-50 inline-block px-2 py-0.5 rounded">
                    {recentRecord.createdAt ? new Date(recentRecord.createdAt).toLocaleDateString() : 'N/A'}
                  </p>
                </div>
                
                <div className="relative pl-6 border-l-2 border-slate-100 pb-2">
                  <div className="absolute w-3.5 h-3.5 bg-teal-500 border-2 border-white rounded-full -left-[9px] top-1 shadow-sm"></div>
                  <div className="flex justify-between items-start gap-4">
                    <div>
                      <p className="text-sm font-bold text-slate-900">{t('dashboard.prescriptionIssued')}</p>
                      <p className="text-sm font-medium text-slate-500 mt-1">{t('appointment.diagnosis')}: <span className="text-slate-700">{recentRecord.diagnosis}</span></p>
                    </div>
                    <Link to={`/doctor/consultation/${recentRecord.appointmentId}`} state={{ appointment: recentAppointment || { id: recentRecord.appointmentId, patientName: recentRecord.patientName || `PT-${recentRecord.patientId}`, patientId: recentRecord.patientId, status: 'COMPLETED' } }} className="text-xs text-teal-600 bg-teal-50 px-2 py-1 rounded-md font-bold hover:bg-teal-100 transition-colors flex-shrink-0">
                      {t('common.view')}
                    </Link>
                  </div>
                  <p className="text-xs font-semibold text-slate-400 mt-3 bg-slate-50 inline-block px-2 py-0.5 rounded">
                    {recentRecord.createdAt ? new Date(recentRecord.createdAt).toLocaleDateString() : 'N/A'}
                  </p>
                </div>
              </div>
            ) : (
              <div className="py-8 text-center flex flex-col items-center">
                 <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-3">
                   <FiFileText className="w-6 h-6 text-slate-300" />
                 </div>
                 <h3 className="text-base font-bold text-slate-700 mb-1">{t('common.noData')}</h3>
                 <p className="text-sm text-slate-500 px-4">{t('dashboard.noConsultationsDesc')}</p>
              </div>
            )}
          </div>
        </motion.div>

      </div>
    </div>
  );
};

export default DoctorDashboard;
