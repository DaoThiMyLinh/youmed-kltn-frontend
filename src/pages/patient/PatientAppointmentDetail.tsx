import { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { FiArrowLeft, FiCalendar, FiUser, FiFileText, FiClipboard, FiClock, FiActivity, FiCheckCircle } from 'react-icons/fi';
import { selectPatientAppointments } from '../../store/features/patient/patientSlice';
import { consultationService } from '../../services/consultation.service';
import type { MedicalRecord, Prescription } from '../../types/consultation';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';

const PatientAppointmentDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const appointments = useSelector(selectPatientAppointments);
  const { t } = useTranslation();
  
  const [medicalRecord, setMedicalRecord] = useState<MedicalRecord | null>(null);
  const [prescription, setPrescription] = useState<Prescription | null>(null);
  const [loadingRecord, setLoadingRecord] = useState(true);

  const stateAppointment = location.state?.appointment;
  const appointment = stateAppointment || appointments.find(a => a.id === Number(id));

  useEffect(() => {
    if (appointment) {
      fetchDetails();
    }
  }, [appointment]);

  const fetchDetails = async () => {
    try {
      setLoadingRecord(true);
      const record = await consultationService.getMedicalRecordByAppointmentId(Number(id));
      setMedicalRecord(record);

      if (record) {
        const script = await consultationService.getPrescriptionByMedicalRecordId(record.id);
        setPrescription(script);
      }
    } catch (error) {
      console.error('Failed to fetch details:', error);
    } finally {
      setLoadingRecord(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'CONFIRMED': return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'PENDING': return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'CANCELLED': return 'bg-red-50 text-red-700 border-red-200';
      case 'COMPLETED': return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      default: return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  };

  if (!appointment) {
    return (
      <div className="max-w-4xl mx-auto space-y-6 pt-10">
        <button className="flex items-center gap-2 text-slate-500 hover:text-slate-900 font-semibold transition-colors" onClick={() => navigate('/patient/appointments')}>
          <FiArrowLeft /> {t('common.back')}
        </button>
        <div className="bg-white p-16 rounded-3xl text-center shadow-sm border border-slate-100">
           <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <FiCalendar className="w-8 h-8 text-slate-400" />
            </div>
            <h3 className="text-xl font-bold text-slate-800 mb-2">{t('common.noData')}</h3>
            <p className="text-slate-500">Cuộc hẹn bạn đang tìm kiếm không tồn tại.</p>
        </div>
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
    <div className="max-w-5xl mx-auto space-y-8 pb-16 pt-8">
      <motion.div 
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="flex items-center justify-between bg-white/60 backdrop-blur-md px-6 py-4 rounded-full border border-slate-100 shadow-sm sticky top-20 z-40"
      >
        <button className="flex items-center gap-2 text-slate-600 hover:text-emerald-600 font-semibold transition-colors" onClick={() => navigate(-1)}>
          <FiArrowLeft /> Quay lại
        </button>
        <h1 className="text-lg font-bold text-slate-900 hidden sm:block">Chi tiết lịch hẹn</h1>
        <div className={`px-4 py-1.5 rounded-full text-sm font-bold border ${getStatusColor(appointment.status)}`}>
          {t(`status.${appointment.status}`)}
        </div>
      </motion.div>

      <motion.div variants={containerVariants} initial="hidden" animate="visible" className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Doctor Information */}
        <motion.div variants={itemVariants} className="bg-white rounded-3xl shadow-sm border border-slate-100 p-8 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-emerald-50 to-transparent rounded-bl-full opacity-50 -z-0"></div>
          
          <div className="flex items-start gap-6 relative z-10">
            <div className="w-20 h-20 bg-slate-50 rounded-2xl flex items-center justify-center border-4 border-white shadow-sm flex-shrink-0 group-hover:scale-105 transition-transform duration-300">
              <FiUser className="w-10 h-10 text-slate-400" />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-1">{t('dashboard.doctor')}</p>
              <h2 className="text-2xl font-bold text-slate-900 mb-2">{appointment.doctorName}</h2>
              <div className="inline-flex items-center gap-2 bg-emerald-50 text-emerald-700 px-3 py-1 rounded-full text-sm font-semibold border border-emerald-100">
                <FiActivity className="w-4 h-4" /> {appointment.specialization}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Appointment Information */}
        <motion.div variants={itemVariants} className="bg-white rounded-3xl shadow-sm border border-slate-100 p-8 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-amber-50 to-transparent rounded-bl-full opacity-50 -z-0"></div>
          
          <div className="relative z-10 space-y-6">
             <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center text-amber-600">
                  <FiCalendar className="w-5 h-5" />
                </div>
                <h2 className="text-xl font-bold text-slate-900">{t('consultation.appointmentInfo')}</h2>
             </div>
             
             <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                  <span className="text-sm text-slate-500 font-medium block mb-1">{t('common.date')}</span>
                  <span className="font-bold text-slate-900 text-lg">{new Date(appointment.appointmentTime).toLocaleDateString()}</span>
                </div>
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                  <span className="text-sm text-slate-500 font-medium block mb-1 flex items-center gap-1"><FiClock className="w-4 h-4" /> {t('common.time')}</span>
                  <span className="font-bold text-slate-900 text-lg">{new Date(appointment.appointmentTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })}</span>
                </div>
             </div>

             <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                <span className="text-sm text-slate-500 font-medium block mb-1">{t('consultation.reasonForVisit')}</span>
                <p className="font-semibold text-slate-900">{appointment.reason}</p>
             </div>
          </div>
        </motion.div>
      </motion.div>

      {/* Medical Record */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
      >
        <div className="flex items-center gap-3 mb-6 mt-10">
          <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center shadow-sm">
            <FiFileText className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900">{t('consultation.medicalRecord')}</h2>
        </div>
        
        {loadingRecord ? (
          <div className="h-64 bg-white rounded-3xl border border-slate-100 flex items-center justify-center">
            <div className="animate-spin rounded-full h-10 w-10 border-4 border-emerald-500 border-t-transparent"></div>
          </div>
        ) : medicalRecord ? (
          <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-3">
                <span className="text-sm font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                  <FiActivity /> {t('consultation.symptoms')}
                </span>
                <p className="bg-slate-50/50 p-5 rounded-2xl text-slate-800 min-h-[100px] border border-slate-200 shadow-inner font-medium">
                  {medicalRecord.symptoms || 'Không có triệu chứng được ghi nhận.'}
                </p>
              </div>
              <div className="space-y-3">
                <span className="text-sm font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                  <FiCheckCircle /> {t('appointment.diagnosis')}
                </span>
                <p className="bg-emerald-50 p-5 rounded-2xl text-emerald-900 min-h-[100px] border border-emerald-200 shadow-sm font-bold text-lg">
                  {medicalRecord.diagnosis}
                </p>
              </div>
              <div className="md:col-span-2 space-y-3">
                <span className="text-sm font-bold text-slate-400 uppercase tracking-wider block">Ghi chú điều trị</span>
                <p className="bg-slate-50/50 p-5 rounded-2xl text-slate-800 min-h-[100px] border border-slate-200 shadow-inner leading-relaxed">
                  {medicalRecord.notes || 'Không có ghi chú thêm.'}
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white p-12 rounded-3xl text-center shadow-sm border border-slate-100 border-dashed">
            <FiFileText className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <p className="text-lg font-bold text-slate-700 mb-2">{t('consultation.noMedicalRecord')}</p>
            <p className="text-slate-500">{t('consultation.noMedicalRecordDesc')}</p>
          </div>
        )}
      </motion.div>

      {/* Prescription */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
      >
        <div className="flex items-center gap-3 mb-6 mt-10">
           <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center shadow-sm">
            <FiClipboard className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900">{t('consultation.prescription')}</h2>
        </div>

        {loadingRecord ? (
           <div className="h-64 bg-white rounded-3xl border border-slate-100 flex items-center justify-center">
            <div className="animate-spin rounded-full h-10 w-10 border-4 border-emerald-500 border-t-transparent"></div>
          </div>
        ) : prescription ? (
          <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-500 uppercase text-xs tracking-wider">
                  <tr>
                    <th className="px-8 py-5 font-bold">{t('consultation.medicine')}</th>
                    <th className="px-8 py-5 font-bold">{t('consultation.dosage')}</th>
                    <th className="px-8 py-5 font-bold">{t('consultation.frequency')}</th>
                    <th className="px-8 py-5 font-bold">{t('consultation.duration')}</th>
                    <th className="px-8 py-5 font-bold">{t('consultation.instructions')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {prescription.items.map((item) => (
                    <tr key={item.id} className="hover:bg-emerald-50/30 transition-colors">
                      <td className="px-8 py-5 font-bold text-slate-900">{item.medicineName}</td>
                      <td className="px-8 py-5 text-slate-700 font-medium">
                        <span className="bg-slate-100 px-2.5 py-1 rounded-md">{item.dosage}</span>
                      </td>
                      <td className="px-8 py-5 text-slate-700 font-medium">{item.frequency}</td>
                      <td className="px-8 py-5 text-slate-700 font-medium">{item.duration}</td>
                      <td className="px-8 py-5 text-slate-500">{item.instruction || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            {(prescription.note) && (
              <div className="p-6 bg-emerald-50 border-t border-emerald-100">
                <span className="text-sm font-bold text-emerald-700 uppercase tracking-wider block mb-2">{t('consultation.note')}:</span>
                <p className="text-emerald-900 font-medium">{prescription.note}</p>
              </div>
            )}
          </div>
        ) : (
           <div className="bg-white p-12 rounded-3xl text-center shadow-sm border border-slate-100 border-dashed">
            <FiClipboard className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <p className="text-lg font-bold text-slate-700 mb-2">{t('consultation.noPrescription')}</p>
            <p className="text-slate-500">{t('consultation.noPrescriptionDesc')}</p>
          </div>
        )}
      </motion.div>

    </div>
  );
};

export default PatientAppointmentDetail;
