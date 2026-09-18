import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button, Toast, ErrorMessage } from '../../components';
import { fetchDoctorsThunk, fetchSpecialtiesThunk, fetchTimeSlotsThunk, submitAppointmentThunk, selectDoctors, selectSpecialties, selectAppointmentLoading, selectAppointmentError, selectBookingSuccess, resetBookingSuccess } from '../../store/features/appointment/appointmentSlice';
import { FiUser, FiCalendar, FiClock, FiCheckCircle, FiChevronRight, FiActivity } from 'react-icons/fi';
import type { Doctor, TimeSlot } from '../../types/appointment';
import type { Specialty } from '../../types/specialty';
import { useTranslation } from 'react-i18next';
import { cancelAppointmentThunk } from '../../store/features/patient/patientSlice';
import { motion, AnimatePresence } from 'framer-motion';

const PatientBooking = () => {
  const dispatch = useDispatch<any>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const rescheduleId = searchParams.get('reschedule');
  const { t } = useTranslation();

  const doctors = useSelector(selectDoctors);
  const specialties = useSelector(selectSpecialties);
  const loading = useSelector(selectAppointmentLoading);
  const error = useSelector(selectAppointmentError);
  const success = useSelector(selectBookingSuccess);
  const timeSlots = useSelector((state: any) => state.appointment.timeSlots);

  const [step, setStep] = useState(1);
  const [selectedSpecialty, setSelectedSpecialty] = useState<Specialty | null>(null);
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<TimeSlot | null>(null);
  const [reason, setReason] = useState<string>('');
  const [urlDoctorError, setUrlDoctorError] = useState<string | null>(null);

  useEffect(() => {
    dispatch(fetchDoctorsThunk());
    dispatch(fetchSpecialtiesThunk());
  }, [dispatch]);

  // Handle doctorId from URL
  useEffect(() => {
    const targetDoctorId = searchParams.get('doctorId');
    if (targetDoctorId && doctors.length > 0 && !selectedDoctor && step === 1) {
      const doctor = doctors.find(d => d.id.toString() === targetDoctorId);
      if (doctor) {
        setSelectedDoctor(doctor);
        if (doctor.specialty) {
          setSelectedSpecialty(doctor.specialty);
        }
        setStep(3); // Skip to date/time selection
      } else {
        setUrlDoctorError(t('Không tìm thấy bác sĩ theo yêu cầu. Vui lòng chọn bác sĩ từ danh sách.'));
      }
    }
  }, [doctors, searchParams, selectedDoctor, step, t]);

  useEffect(() => {
    if (success) {
      if (rescheduleId) {
        dispatch(cancelAppointmentThunk(Number(rescheduleId)));
      }
      const timer = setTimeout(() => {
        dispatch(resetBookingSuccess());
        navigate('/patient/appointments');
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [success, navigate, dispatch, rescheduleId]);

  const handleNextStep = () => setStep(prev => prev + 1);
  const handlePrevStep = () => setStep(prev => prev - 1);

  const handleSubmit = () => {
    if (!selectedTimeSlot || !reason) return;
    dispatch(submitAppointmentThunk({
      timeSlotId: selectedTimeSlot.id,
      reason
    }));
  };

  const stepVariants = {
    hidden: { opacity: 0, x: 20 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.3 } },
    exit: { opacity: 0, x: -20, transition: { duration: 0.2 } }
  };

  const renderStepContent = () => {
    switch (step) {
      case 1:
        return (
          <motion.div key="step1" variants={stepVariants} initial="hidden" animate="visible" exit="exit" className="space-y-6">
            {urlDoctorError && (
              <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm border border-red-100 flex items-center gap-2">
                <FiClock className="w-5 h-5 flex-shrink-0" />
                {urlDoctorError}
              </div>
            )}
            <div className="mb-6">
              <h3 className="text-xl font-bold text-slate-900 mb-2">{t('booking.chooseSpecialtyDesc')}</h3>
              <p className="text-slate-500">Vui lòng chọn chuyên khoa bạn muốn khám để tiếp tục.</p>
            </div>
            
            {specialties.length === 0 && !loading && (
              <div className="p-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200 text-slate-500">
                {t('booking.noSpecialties')}
              </div>
            )}
            
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {specialties.map(spec => (
                <div 
                  key={spec.id} 
                  onClick={() => {
                    setSelectedSpecialty(spec);
                    setSelectedDoctor(null);
                    handleNextStep();
                  }}
                  className="p-6 border border-slate-200 rounded-2xl cursor-pointer hover:border-emerald-500 hover:shadow-lg hover:shadow-emerald-500/10 transition-all text-center bg-white group relative overflow-hidden"
                >
                  <div className="absolute top-0 right-0 w-16 h-16 bg-emerald-50 rounded-full -mt-8 -mr-8 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                    <FiActivity className="w-6 h-6" />
                  </div>
                  <span className="font-bold text-slate-800 group-hover:text-emerald-700 transition-colors relative z-10">{spec.name}</span>
                </div>
              ))}
            </div>
          </motion.div>
        );
      case 2:
        const filteredDoctors = doctors.filter(d => d.specialty?.id === selectedSpecialty?.id);
        return (
          <motion.div key="step2" variants={stepVariants} initial="hidden" animate="visible" exit="exit" className="space-y-6">
            <div className="mb-6">
              <h3 className="text-xl font-bold text-slate-900 mb-2">{t('booking.chooseDoctor')}</h3>
              <p className="text-slate-500">Chọn bác sĩ phù hợp trong chuyên khoa <span className="font-semibold text-slate-700">{selectedSpecialty?.name}</span>.</p>
            </div>
            
            {filteredDoctors.length === 0 ? (
               <div className="p-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200 text-slate-500">
                Không tìm thấy bác sĩ nào thuộc chuyên khoa này.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredDoctors.map(doc => (
                  <div 
                    key={doc.id}
                    onClick={() => {
                      setSelectedDoctor(doc);
                      handleNextStep();
                    }}
                    className="p-6 border border-slate-200 rounded-2xl cursor-pointer hover:border-emerald-500 hover:shadow-lg hover:shadow-emerald-500/10 transition-all flex items-start gap-4 bg-white group"
                  >
                    <div className="w-16 h-16 rounded-full bg-slate-50 border-2 border-white shadow-sm text-slate-400 flex items-center justify-center flex-shrink-0 group-hover:bg-emerald-50 group-hover:text-emerald-500 transition-colors">
                      <FiUser className="w-8 h-8" />
                    </div>
                    <div>
                      <h4 className="font-bold text-lg text-slate-900 group-hover:text-emerald-700 transition-colors">{doc.fullName}</h4>
                      <div className="inline-block px-3 py-1 bg-emerald-50 text-emerald-700 font-semibold text-sm rounded-full mt-2">
                        {doc.consultationFee > 0 ? `${doc.consultationFee.toLocaleString('vi-VN')} ₫` : t('booking.free')}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        );
      case 3:
        const now = new Date();
        const y = now.getFullYear();
        const m = String(now.getMonth() + 1).padStart(2, '0');
        const d = String(now.getDate()).padStart(2, '0');
        const minDate = `${y}-${m}-${d}`;

        return (
          <motion.div key="step3" variants={stepVariants} initial="hidden" animate="visible" exit="exit" className="space-y-8">
            {selectedDoctor && (
              <div className="bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-100/50 p-5 rounded-2xl flex items-center gap-5 shadow-sm">
                <div className="w-14 h-14 rounded-full bg-white text-emerald-600 flex items-center justify-center flex-shrink-0 shadow-sm border border-emerald-100">
                  <FiUser className="w-7 h-7" />
                </div>
                <div>
                  <p className="text-sm text-slate-500 mb-0.5">Đang đặt lịch với bác sĩ:</p>
                  <h4 className="font-bold text-slate-900 text-lg">{selectedDoctor.fullName}</h4>
                  <p className="text-sm font-semibold text-emerald-600">{selectedDoctor.specialty?.name || 'Đa khoa'}</p>
                </div>
              </div>
            )}
            
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
              <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center"><FiCalendar /></div>
                {t('booking.selectDate')}
              </h3>
              <input 
                type="date" 
                min={minDate}
                value={selectedDate}
                onChange={(e) => {
                  setSelectedDate(e.target.value);
                  setSelectedTimeSlot(null);
                  if (selectedDoctor) {
                    dispatch(fetchTimeSlotsThunk({ doctorId: selectedDoctor.id, date: e.target.value }));
                  }
                }}
                className="w-full md:w-1/2 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none font-medium text-slate-700 transition-all"
              />
            </div>

            {selectedDate && (
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm animate-in fade-in slide-in-from-bottom-4 duration-500">
                <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-teal-100 text-teal-600 flex items-center justify-center"><FiClock /></div>
                  {t('booking.selectTimeSlot')}
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                  {timeSlots.map((slot: TimeSlot) => {
                    const time = new Date(slot.startDateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
                    const isSelected = selectedTimeSlot?.id === slot.id;
                    return (
                      <button
                        key={slot.id}
                        disabled={slot.booked}
                        onClick={() => setSelectedTimeSlot(slot)}
                        className={`py-3 px-4 rounded-xl font-medium text-center transition-all ${
                          isSelected 
                            ? 'bg-slate-900 text-white shadow-md transform scale-[1.02]' 
                            : slot.booked
                            ? 'bg-slate-100 text-slate-400 cursor-not-allowed opacity-60'
                            : 'bg-white border border-slate-200 text-slate-700 hover:border-emerald-500 hover:text-emerald-700 hover:shadow-sm'
                        }`}
                      >
                        {time} {slot.booked && <span className="block text-xs mt-0.5 font-normal">Đã kín</span>}
                      </button>
                    );
                  })}
                  {timeSlots.length === 0 && !loading && (
                    <div className="col-span-2 sm:col-span-3 md:col-span-4 text-center py-8 text-slate-500 border border-dashed rounded-xl border-slate-300 bg-slate-50">
                      Bác sĩ chưa có lịch làm việc trong ngày này.
                    </div>
                  )}
                </div>
              </div>
            )}

            <div className="flex justify-end pt-4">
              <Button onClick={handleNextStep} disabled={!selectedDate || !selectedTimeSlot} className="px-8 py-3 rounded-xl shadow-md text-white bg-emerald-600 hover:bg-emerald-700">
                {t('booking.continue')}
              </Button>
            </div>
          </motion.div>
        );
      case 4:
        return (
          <motion.div key="step4" variants={stepVariants} initial="hidden" animate="visible" exit="exit" className="space-y-6">
            <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm">
              <h3 className="text-xl font-bold text-slate-900 mb-2">{t('booking.reasonForVisit')}</h3>
              <p className="text-slate-500 mb-6">{t('booking.reasonDesc')}</p>
              <textarea 
                rows={5}
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Ví dụ: Đau đầu, chóng mặt kéo dài..."
                className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none resize-none font-medium text-slate-700 transition-all"
              />
            </div>
            <div className="flex justify-end pt-2">
              <Button onClick={handleNextStep} disabled={!reason.trim()} className="px-8 py-3 rounded-xl shadow-md text-white bg-emerald-600 hover:bg-emerald-700">
                {t('booking.reviewSummary')}
              </Button>
            </div>
          </motion.div>
        );
      case 5:
        return (
          <motion.div key="step5" variants={stepVariants} initial="hidden" animate="visible" exit="exit" className="space-y-8">
            <div className="bg-white rounded-3xl border border-slate-200 shadow-xl shadow-slate-200/50 overflow-hidden relative">
              {/* Header Gradient */}
              <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-emerald-400 to-teal-400"></div>
              
              <div className="p-8">
                <div className="flex items-center gap-3 mb-8 pb-6 border-b border-slate-100">
                  <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center">
                    <FiCheckCircle className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-slate-900">{t('booking.appointmentSummary')}</h3>
                    <p className="text-slate-500">Vui lòng kiểm tra lại thông tin trước khi xác nhận.</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-y-8 gap-x-12">
                  <div className="space-y-6">
                    <div>
                      <p className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-1">Bác sĩ phụ trách</p>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center"><FiUser className="text-slate-400" /></div>
                        <div>
                          <p className="font-bold text-slate-900 text-lg">{selectedDoctor?.fullName}</p>
                          <p className="text-emerald-600 font-medium text-sm">{selectedSpecialty?.name}</p>
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <p className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-1">Thời gian</p>
                      <p className="font-bold text-slate-900 text-lg flex items-center gap-2">
                        <span className="bg-emerald-50 text-emerald-700 px-3 py-1 rounded-md">
                          {selectedTimeSlot ? new Date(selectedTimeSlot.startDateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }) : ''}
                        </span>
                        <span className="text-slate-600">ngày</span>
                        <span className="text-slate-900">{selectedDate}</span>
                      </p>
                    </div>
                  </div>
                  
                  <div className="space-y-6">
                    <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100 h-full">
                      <p className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-2">Lý do khám</p>
                      <p className="font-medium text-slate-700 leading-relaxed italic">"{reason}"</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="bg-slate-50 p-6 flex items-center justify-between border-t border-slate-100">
                 <div>
                    <p className="text-sm font-semibold text-slate-500">Phí khám dự kiến</p>
                    <p className="font-extrabold text-2xl text-emerald-600">{selectedDoctor && selectedDoctor.consultationFee > 0 ? `${selectedDoctor.consultationFee.toLocaleString('vi-VN')} ₫` : 'Miễn phí'}</p>
                 </div>
                 <Button onClick={handleSubmit} isLoading={loading} className="px-8 py-3.5 rounded-xl shadow-md text-white bg-slate-900 hover:bg-slate-800 transition-all flex items-center gap-2">
                   Xác nhận đặt lịch <FiChevronRight />
                 </Button>
              </div>
            </div>

            <ErrorMessage message={error} />
          </motion.div>
        );
      default:
        return null;
    }
  };

  if (loading && step === 1 && specialties.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f8fafc]">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-emerald-500 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="bg-[#f8fafc] min-h-screen pt-12 pb-24 relative overflow-hidden">
      {/* Background Decorators */}
      <div className="absolute top-0 left-0 w-full h-64 bg-gradient-to-b from-emerald-50/80 to-transparent -z-10"></div>
      <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-teal-200/20 blur-[120px] pointer-events-none -z-10" />

      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        {success && (
          <div className="fixed top-24 right-6 z-50 animate-in fade-in slide-in-from-top-4 duration-300">
            <Toast type="success" title="Thành công" message={t('booking.bookingSuccess')} />
          </div>
        )}

        <div className="mb-10 text-center">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight mb-3">Đặt lịch khám</h1>
          <p className="text-lg text-slate-500">Hoàn thành 5 bước đơn giản để đăng ký khám bệnh.</p>
        </div>

        {/* Progress Steps (Modern) */}
        <div className="mb-12 relative px-4">
          <div className="absolute top-1/2 left-8 right-8 h-1 bg-slate-200 -translate-y-1/2 rounded-full z-0"></div>
          <div 
            className="absolute top-1/2 left-8 h-1 bg-emerald-500 -translate-y-1/2 rounded-full z-0 transition-all duration-500 ease-in-out" 
            style={{ width: `calc(${((step - 1) / 4) * 100}% - 4rem)` }}
          ></div>
          
          <div className="relative z-10 flex justify-between">
            {[1, 2, 3, 4, 5].map(s => (
              <div key={s} className="flex flex-col items-center gap-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-300 ${
                  step > s 
                    ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/30 ring-4 ring-white' 
                    : step === s 
                    ? 'bg-slate-900 text-white shadow-lg shadow-slate-900/30 ring-4 ring-white scale-110'
                    : 'bg-white text-slate-400 border-2 border-slate-200'
                }`}>
                  {step > s ? <FiCheckCircle className="w-5 h-5" /> : s}
                </div>
                <span className={`text-xs sm:text-sm font-semibold hidden md:block ${
                  step === s ? 'text-slate-900' : step > s ? 'text-emerald-600' : 'text-slate-400'
                }`}>
                  {s === 1 ? 'Chuyên khoa' : s === 2 ? 'Bác sĩ' : s === 3 ? 'Thời gian' : s === 4 ? 'Lý do' : 'Xác nhận'}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Main Content Area */}
        <div className="relative">
          {step > 1 && step < 6 && !loading && (
            <button 
              onClick={handlePrevStep}
              className="absolute -top-14 left-0 text-slate-500 hover:text-slate-900 font-medium flex items-center gap-1 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path></svg>
              Quay lại
            </button>
          )}
          
          <AnimatePresence mode="wait">
            {renderStepContent()}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default PatientBooking;
