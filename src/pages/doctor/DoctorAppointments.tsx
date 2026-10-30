import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Toast, ConfirmModal } from '../../components';
import { FiClock, FiUser, FiCalendar, FiArrowRight, FiActivity, FiRefreshCw, FiCheckCircle } from 'react-icons/fi';
import { consultationService } from '../../services/consultation.service';
import type { Appointment } from '../../types/patient';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';

const DoctorAppointments = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { t } = useTranslation();

  // Toast & ConfirmModal states
  const [toast, setToast] = useState<{ type: 'success' | 'error' | 'info' | 'warning'; title: string; message?: string } | null>(null);
  const [confirmConfig, setConfirmConfig] = useState<{
    isOpen: boolean;
    badge?: string;
    title: string;
    message: React.ReactNode;
    details?: React.ReactNode;
    confirmText?: string;
    variant?: 'primary' | 'success' | 'danger' | 'warning' | 'info';
    action: () => Promise<void>;
  }>({
    isOpen: false,
    title: '',
    message: '',
    action: async () => {},
  });
  const [actionLoading, setActionLoading] = useState(false);

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const data = await consultationService.getDoctorAppointments(0, 50, 'appointmentTime', 'ASC');
      setAppointments(data.content.filter(apt => apt.status !== 'COMPLETED' && apt.status !== 'CANCELLED'));
    } catch (error) {
      console.error('Failed to fetch appointments', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCompleteAppointment = (apt: Appointment) => {
    setConfirmConfig({
      isOpen: true,
      badge: 'Hoàn tất ca khám',
      title: 'Xác nhận hoàn tất khám',
      message: 'Xác nhận đã hoàn thành khám cho bệnh nhân này? Ca khám sẽ được lưu vào mục Lịch sử khám bệnh.',
      details: (
        <div className="bg-slate-50/80 rounded-2xl p-4 border border-slate-200/80 space-y-2 text-xs">
          <div className="flex justify-between items-center">
            <span className="text-slate-500 font-semibold">Mã ca:</span>
            <span className="font-mono font-bold text-slate-900 bg-white px-2 py-0.5 rounded border border-slate-200">#{apt.id}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-slate-500 font-semibold">Bệnh nhân:</span>
            <span className="font-bold text-slate-900 text-sm">{apt.patientName}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-slate-500 font-semibold">Giờ hẹn:</span>
            <span className="font-medium text-slate-800">{new Date(apt.appointmentTime).toLocaleDateString('vi-VN')} {new Date(apt.appointmentTime).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}</span>
          </div>
        </div>
      ),
      confirmText: 'Hoàn tất khám',
      variant: 'success',
      action: async () => {
        try {
          setActionLoading(true);
          await consultationService.updateAppointmentStatus(apt.id, 'COMPLETED');
          setConfirmConfig(prev => ({ ...prev, isOpen: false }));
          setToast({
            type: 'success',
            title: 'Khám thành công',
            message: `Ca khám của bệnh nhân ${apt.patientName} đã hoàn thành và chuyển sang mục Lịch sử.`,
          });
          fetchAppointments();
        } catch (err: any) {
          setToast({
            type: 'error',
            title: 'Lỗi cập nhật',
            message: err.response?.data?.message || 'Có lỗi xảy ra khi hoàn tất ca khám.',
          });
        } finally {
          setActionLoading(false);
        }
      },
    });
  };

  useEffect(() => {
    fetchAppointments();
  }, []);


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
        className="bg-white p-6 sm:p-8 rounded-3xl shadow-sm border border-slate-100 relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-6"
      >
        <div className="absolute top-0 left-0 w-64 h-64 bg-gradient-to-br from-emerald-100 to-transparent rounded-full opacity-40 -ml-20 -mt-20"></div>
        <div className="relative z-10 flex items-center gap-4">
           <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center shadow-sm">
             <FiCalendar className="w-7 h-7" />
           </div>
           <div>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight mb-1">{t('menu.appointments')}</h1>
            <p className="text-slate-500">Quản lý danh sách bệnh nhân đặt khám hôm nay.</p>
           </div>
        </div>
        <Button 
          variant="outline" 
          onClick={fetchAppointments} 
          leftIcon={<FiRefreshCw className={loading ? 'animate-spin' : ''} />}
          className="relative z-10 bg-white shadow-sm hover:bg-slate-50 border-slate-200 text-slate-700"
        >
          {t('common.refresh')}
        </Button>
      </motion.div>

      {appointments.length === 0 ? (
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white p-16 rounded-3xl text-center shadow-sm border border-slate-100 border-dashed max-w-2xl mx-auto mt-8"
        >
          <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6 border-8 border-white shadow-sm">
            <FiUser className="w-10 h-10 text-slate-400" />
          </div>
          <h3 className="text-2xl font-bold text-slate-800 mb-3">{t('common.noData')}</h3>
          <p className="text-slate-500 text-lg">
            {t('appointment.noActiveAppointments')}
          </p>
        </motion.div>
      ) : (
        <motion.div variants={containerVariants} initial="hidden" animate="visible" className="grid grid-cols-1 gap-5">
          {appointments.map((apt) => (
            <motion.div 
              key={apt.id} 
              variants={itemVariants} 
              className="bg-white rounded-3xl shadow-sm border border-slate-200/70 hover:border-emerald-300 hover:shadow-lg transition-all group overflow-hidden relative"
            >
              <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-bl from-emerald-50/60 to-transparent rounded-bl-full pointer-events-none -z-0"></div>

              {/* Status Badge at Top Right */}
              <div className="absolute top-5 right-5 sm:top-6 sm:right-6 z-10">
                {apt.status === 'IN_PROGRESS' ? (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold tracking-wide bg-emerald-50 text-emerald-700 border border-emerald-200 shadow-2xs">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0"></span>
                    Đang khám
                  </span>
                ) : apt.status === 'CHECKED_IN' ? (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold tracking-wide bg-amber-50 text-amber-700 border border-amber-200 shadow-2xs">
                    <span className="w-2 h-2 rounded-full bg-amber-500 shrink-0"></span>
                    Đã Check-in
                  </span>
                ) : apt.status === 'CONFIRMED' ? (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold tracking-wide bg-sky-50 text-sky-700 border border-sky-200 shadow-2xs">
                    <span className="w-2 h-2 rounded-full bg-sky-500 shrink-0"></span>
                    Đã xác nhận
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold tracking-wide bg-slate-100 text-slate-700 border border-slate-200 shadow-2xs">
                    <span className="w-2 h-2 rounded-full bg-slate-400 shrink-0"></span>
                    Chờ duyệt
                  </span>
                )}
              </div>
              
              <div className="p-5 sm:p-6 relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-5">
                
                {/* Left: Date & Time */}
                <div className="flex md:flex-col items-center justify-start md:justify-center gap-3.5 md:w-28 shrink-0 pr-4 md:border-r border-slate-100">
                  <div className="flex flex-col items-center justify-center w-18 h-18 rounded-2xl bg-gradient-to-b from-emerald-50 to-teal-50 border border-emerald-100/90 shadow-2xs">
                    <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider">
                      Tháng {new Date(apt.appointmentTime).getMonth() + 1}
                    </span>
                    <span className="text-2xl font-black text-slate-900 leading-none mt-1">
                      {new Date(apt.appointmentTime).getDate()}
                    </span>
                  </div>
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100/80 text-slate-700 text-xs font-bold whitespace-nowrap border border-slate-200/50">
                    <FiClock className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                    <span>{new Date(apt.appointmentTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })}</span>
                  </div>
                </div>

                {/* Middle: Patient Info */}
                <div className="flex-1 flex items-start gap-3.5 min-w-0 pr-2">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-100 to-teal-100 text-emerald-700 border border-emerald-200/60 flex items-center justify-center font-black text-base shadow-2xs shrink-0">
                    {apt.patientName ? apt.patientName.charAt(0).toUpperCase() : <FiUser className="w-5 h-5" />}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-lg font-bold text-slate-900 tracking-tight leading-snug truncate">
                        {apt.patientName}
                      </h3>
                      {apt.specialization && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/60 shrink-0">
                          <FiActivity className="w-3 h-3 text-emerald-500" />
                          {apt.specialization}
                        </span>
                      )}
                    </div>
                    <div className="bg-slate-50/80 rounded-xl px-3.5 py-2.5 border border-slate-200/60 text-xs mt-2.5">
                      <span className="font-bold text-slate-400 uppercase tracking-wider text-[10px] block mb-0.5">
                        Lý do khám:
                      </span>
                      <p className="text-slate-700 font-medium leading-relaxed line-clamp-2">
                        {apt.reason || 'Khám bệnh theo lịch hẹn'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Right: Actions */}
                <div className="pt-3 md:pt-0 border-t md:border-t-0 flex items-center md:items-end justify-end shrink-0 md:min-w-[200px]">
                  {apt.status === 'IN_PROGRESS' ? (
                    <div className="flex items-center gap-2.5 w-full md:w-auto justify-end">
                      {/* Secondary: Hoàn tất khám */}
                      <button
                        type="button"
                        onClick={() => handleCompleteAppointment(apt)}
                        className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-xl text-xs font-bold text-emerald-800 bg-white hover:bg-emerald-50 border border-emerald-300 hover:border-emerald-400 shadow-2xs hover:shadow-xs transition-all duration-200 whitespace-nowrap cursor-pointer active:scale-95"
                      >
                        <FiCheckCircle className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span>Hoàn tất khám</span>
                      </button>

                      {/* Primary: Tiếp tục Khám */}
                      <button
                        type="button"
                        onClick={() => navigate(`/doctor/consultation/${apt.id}`, { state: { appointment: apt } })}
                        className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 shadow-md shadow-emerald-500/20 hover:shadow-lg hover:shadow-emerald-500/30 transition-all duration-200 whitespace-nowrap cursor-pointer active:scale-95"
                      >
                        <span>Tiếp tục Khám</span>
                        <FiArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ) : apt.status === 'CHECKED_IN' ? (
                    <button
                      type="button"
                      onClick={() => navigate(`/doctor/consultation/${apt.id}`, { state: { appointment: apt } })}
                      className="inline-flex items-center justify-center gap-1.5 px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 shadow-md shadow-emerald-500/20 hover:shadow-lg hover:shadow-emerald-500/30 transition-all duration-200 whitespace-nowrap cursor-pointer active:scale-95 w-full md:w-auto"
                    >
                      <span>Tiến hành Khám</span>
                      <FiArrowRight className="w-3.5 h-3.5" />
                    </button>
                  ) : (
                    <div className="inline-flex items-center gap-1.5 text-xs text-amber-700 bg-amber-50 px-3 py-1.5 rounded-xl border border-amber-200/70 font-medium">
                      <FiClock className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                      <span>Chờ Check-in</span>
                    </div>
                  )}
                </div>

              </div>
            </motion.div>
          ))}
        </motion.div>
      )}

      {/* Confirmation Modal */}
      <ConfirmModal
        isOpen={confirmConfig.isOpen}
        onClose={() => setConfirmConfig(prev => ({ ...prev, isOpen: false }))}
        onConfirm={confirmConfig.action}
        badge={confirmConfig.badge}
        title={confirmConfig.title}
        message={confirmConfig.message}
        confirmText={confirmConfig.confirmText}
        variant={confirmConfig.variant}
        isLoading={actionLoading}
      >
        {confirmConfig.details}
      </ConfirmModal>

      {/* Modern Floating Toast Notification */}
      {toast && (
        <div className="fixed top-20 right-6 z-50">
          <Toast
            type={toast.type}
            title={toast.title}
            message={toast.message}
            onClose={() => setToast(null)}
          />
        </div>
      )}
    </div>
  );
};

export default DoctorAppointments;
