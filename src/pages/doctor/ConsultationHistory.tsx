import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../components';
import { FiFileText, FiSearch, FiClock, FiCalendar, FiUser, FiActivity } from 'react-icons/fi';
import { consultationService } from '../../services/consultation.service';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';

interface HistoryItem {
  id: string | number;
  type: 'COMPLETED' | 'CANCELLED';
  date: string;
  patientName: string;
  patientId: number;
  diagnosisOrReason: string;
  appointmentId: number;
  fullAppointment?: any;
}

const ConsultationHistory = () => {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const [records, setRecords] = useState<HistoryItem[]>([]);
  const [filter, setFilter] = useState<'ALL' | 'COMPLETED' | 'CANCELLED'>('ALL');
  const [loading, setLoading] = useState(true);

  const fetchHistory = async () => {
    try {
      setLoading(true);
      const [medicalRecordsRes, appointmentsRes] = await Promise.all([
        consultationService.getMedicalRecordsHistory(0, 50),
        consultationService.getDoctorAppointments(0, 50, 'appointmentTime', 'DESC')
      ]);

      const myAppointmentIds = appointmentsRes.content.map(a => a.id);
      const myMedicalRecords = medicalRecordsRes.content.filter(mr => myAppointmentIds.includes(mr.appointmentId));

      const completedRecords: HistoryItem[] = myMedicalRecords.map(mr => ({
        id: mr.id,
        type: 'COMPLETED',
        date: mr.createdAt || new Date().toISOString(),
        patientName: mr.patientName || `PT-${mr.patientId}`,
        patientId: mr.patientId,
        diagnosisOrReason: `${t('appointment.diagnosis')}: ${mr.diagnosis}`,
        appointmentId: mr.appointmentId,
        fullAppointment: appointmentsRes.content.find(a => a.id === mr.appointmentId)
      }));

      const cancelledAppointments: HistoryItem[] = appointmentsRes.content
        .filter(apt => apt.status === 'CANCELLED')
        .map(apt => ({
          id: `cancel-${apt.id}`,
          type: 'CANCELLED',
          date: apt.appointmentTime,
          patientName: apt.patientName || `PT-${apt.patientId}`,
          patientId: apt.patientId,
          diagnosisOrReason: `${t('appointment.reason')}: ${apt.reason}`,
          appointmentId: apt.id,
          fullAppointment: apt
        }));

      const combined = [...completedRecords, ...cancelledAppointments].sort((a, b) => 
        new Date(b.date).getTime() - new Date(a.date).getTime()
      );

      setRecords(combined);
    } catch (error) {
      console.error('Failed to fetch history', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const filteredRecords = records.filter(record => filter === 'ALL' || record.type === filter);

  if (loading && records.length === 0) {
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
        className="bg-white p-6 sm:p-8 rounded-3xl shadow-sm border border-slate-100 relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-6"
      >
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-emerald-100 to-transparent rounded-bl-full opacity-40 -mr-20 -mt-20 pointer-events-none"></div>
        <div className="relative z-10 flex items-center gap-4">
           <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center shadow-sm border border-emerald-100">
             <FiFileText className="w-7 h-7" />
           </div>
           <div>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight mb-1">{t('history.consultationHistory')}</h1>
            <p className="text-slate-500 font-medium">Lưu trữ và tra cứu hồ sơ khám bệnh điện tử.</p>
           </div>
        </div>
        
        <div className="relative z-10 flex bg-slate-100 p-1.5 rounded-2xl w-full md:w-auto overflow-hidden shadow-inner border border-slate-200/50">
          <button 
            onClick={() => setFilter('ALL')} 
            className={`flex-1 md:px-6 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 ${filter === 'ALL' ? 'bg-white text-emerald-600 shadow-sm border border-slate-200/50 scale-100' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50 scale-95'}`}
          >
            Tất cả
          </button>
          <button 
            onClick={() => setFilter('COMPLETED')} 
            className={`flex-1 md:px-6 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 ${filter === 'COMPLETED' ? 'bg-white text-emerald-600 shadow-sm border border-slate-200/50 scale-100' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50 scale-95'}`}
          >
            Hoàn thành
          </button>
          <button 
            onClick={() => setFilter('CANCELLED')} 
            className={`flex-1 md:px-6 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 ${filter === 'CANCELLED' ? 'bg-white text-emerald-600 shadow-sm border border-slate-200/50 scale-100' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50 scale-95'}`}
          >
            Đã hủy
          </button>
        </div>
      </motion.div>

      {filteredRecords.length === 0 ? (
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white p-16 rounded-3xl text-center shadow-sm border border-slate-100 border-dashed max-w-2xl mx-auto mt-8"
        >
          <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6 border-8 border-white shadow-sm">
            <FiActivity className="w-10 h-10 text-slate-400" />
          </div>
          <h3 className="text-2xl font-bold text-slate-800 mb-3">{t('common.noData')}</h3>
          <p className="text-slate-500 text-lg">
            Không có dữ liệu phù hợp với bộ lọc hiện tại.
          </p>
        </motion.div>
      ) : (
        <motion.div variants={containerVariants} initial="hidden" animate="visible" className="grid grid-cols-1 gap-5">
          {filteredRecords.map((record) => (
            <motion.div key={record.id} variants={itemVariants} className="bg-white rounded-3xl shadow-sm border border-slate-100 hover:shadow-lg transition-all group overflow-hidden">
              <div className="p-6 md:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 relative">
                <div className={`absolute top-0 left-0 w-1.5 h-full ${record.type === 'COMPLETED' ? 'bg-emerald-500' : 'bg-red-500'}`}></div>
                
                {/* Left: Date */}
                <div className="flex items-center gap-5 md:w-1/4 pl-2">
                  <div className={`flex flex-col items-center justify-center p-4 rounded-2xl border min-w-[90px] shadow-sm transition-colors ${record.type === 'COMPLETED' ? 'bg-emerald-50 border-emerald-100 text-emerald-600' : 'bg-red-50 border-red-100 text-red-600'}`}>
                    <span className="text-sm font-bold uppercase tracking-wider mb-1">
                      {record.date ? new Date(record.date).toLocaleString(i18n.language === 'vi' ? 'vi-VN' : 'en-US', { month: 'short' }) : 'N/A'}
                    </span>
                    <span className="text-4xl font-black text-slate-900">
                      {record.date ? new Date(record.date).getDate() : '-'}
                    </span>
                  </div>
                  <div>
                    <div className="flex items-center gap-2 text-slate-700 font-bold mb-1.5">
                      <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center">
                         <FiClock className="w-4 h-4 text-slate-500" /> 
                      </div>
                      {record.date ? new Date(record.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }) : 'N/A'}
                    </div>
                    <div className="flex items-center gap-2 text-slate-400 text-sm font-semibold ml-1">
                      <FiCalendar className="w-4 h-4 text-slate-300" /> 
                      {record.date ? new Date(record.date).getFullYear() : 'N/A'}
                    </div>
                  </div>
                </div>

                {/* Middle: Patient Info */}
                <div className="flex-1 border-t md:border-t-0 md:border-l border-slate-100 pt-6 md:pt-0 md:pl-8">
                  <div className="flex items-center gap-3 mb-3">
                     <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 shadow-sm">
                       <FiUser className="w-5 h-5" />
                     </div>
                     <h3 className="text-xl font-bold text-slate-900">{record.patientName}</h3>
                  </div>
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                     <p className="text-slate-600 font-medium leading-relaxed">
                        <span className="font-bold text-slate-800 uppercase tracking-wider text-xs block mb-1">
                           {record.diagnosisOrReason.split(': ')[0]}
                        </span>
                        {record.diagnosisOrReason.split(': ')[1]}
                     </p>
                  </div>
                </div>

                {/* Right: Actions */}
                <div className="flex flex-col items-start md:items-end border-t md:border-t-0 md:border-l border-slate-100 pt-6 md:pt-0 md:pl-8 gap-4 md:w-1/4 justify-center">
                  <div className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider border shadow-sm ${record.type === 'COMPLETED' ? 'bg-slate-100 text-slate-600 border-slate-200' : 'bg-red-50 text-red-600 border-red-200'}`}>
                    {t(`status.${record.type}`)}
                  </div>
                  {record.type === 'COMPLETED' && (
                    <Button 
                      className="w-full md:w-auto bg-white border-2 border-emerald-100 text-emerald-600 hover:bg-emerald-50 hover:border-emerald-200 shadow-sm transition-all font-semibold"
                      leftIcon={<FiSearch />}
                      onClick={() => navigate(`/doctor/consultation/${record.appointmentId}`, { state: { appointment: record.fullAppointment } })}
                    >
                      {t('common.viewDetail')}
                    </Button>
                  )}
                </div>

              </div>
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  );
};

export default ConsultationHistory;
