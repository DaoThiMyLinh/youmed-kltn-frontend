import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent, Button, Toast, ErrorMessage, Loading } from '../../components';
import { fetchDoctorsThunk, fetchSpecialtiesThunk, fetchTimeSlotsThunk, submitAppointmentThunk, selectDoctors, selectSpecialties, selectAppointmentLoading, selectAppointmentError, selectBookingSuccess, resetBookingSuccess } from '../../store/features/appointment/appointmentSlice';
import { FiUser, FiCalendar, FiClock, FiCheckCircle } from 'react-icons/fi';
import type { Doctor, TimeSlot } from '../../types/appointment';
import type { Specialty } from '../../types/specialty';
import { useTranslation } from 'react-i18next';
import { cancelAppointmentThunk } from '../../store/features/patient/patientSlice';

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

  useEffect(() => {
    dispatch(fetchDoctorsThunk());
    dispatch(fetchSpecialtiesThunk());
  }, [dispatch]);

  useEffect(() => {
    if (success) {
      if (rescheduleId) {
        dispatch(cancelAppointmentThunk(Number(rescheduleId)));
      }
      const timer = setTimeout(() => {
        dispatch(resetBookingSuccess());
        navigate('/appointments');
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

  const renderStepContent = () => {
    switch (step) {
      case 1: // Select Specialty
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-slate-900 mb-4">{t('booking.chooseSpecialtyDesc')}</h3>
            {specialties.length === 0 && !loading && (
              <p className="text-slate-500">{t('booking.noSpecialties')}</p>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {specialties.map(spec => (
                <div 
                  key={spec.id} 
                  onClick={() => {
                    setSelectedSpecialty(spec);
                    setSelectedDoctor(null);
                    handleNextStep();
                  }}
                  className="p-6 border border-slate-200 rounded-xl cursor-pointer hover:border-primary hover:shadow-md transition-all text-center bg-white"
                >
                  <span className="font-semibold text-slate-800">{spec.name}</span>
                </div>
              ))}
            </div>
          </div>
        );
      case 2: // Select Doctor
        const filteredDoctors = doctors.filter(d => d.specialty?.id === selectedSpecialty?.id);
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-slate-900 mb-4">{t('booking.chooseDoctor')}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredDoctors.map(doc => (
                <div 
                  key={doc.id}
                  onClick={() => {
                    setSelectedDoctor(doc);
                    handleNextStep();
                  }}
                  className="p-6 border border-slate-200 rounded-xl cursor-pointer hover:border-primary hover:shadow-md transition-all flex items-start gap-4 bg-white"
                >
                  <div className="w-12 h-12 rounded-full bg-blue-50 text-primary flex items-center justify-center flex-shrink-0">
                    <FiUser className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900">{doc.fullName}</h4>
                    <p className="text-sm font-semibold text-primary mt-1">{doc.consultationFee > 0 ? `${doc.consultationFee.toLocaleString('vi-VN')} ₫` : t('booking.free')}</p>
                    <p className="text-sm text-slate-500 line-clamp-2 mt-1">{doc.biography || t('booking.noBiography')}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      case 3: // Select Date & Time
        // Ensure minimum date is tomorrow
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        const minDate = tomorrow.toISOString().split('T')[0];

        return (
          <div className="space-y-8">
            <div>
              <h3 className="text-lg font-medium text-slate-900 mb-4 flex items-center gap-2">
                <FiCalendar className="text-primary" /> {t('booking.selectDate')}
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
                className="w-full md:w-auto px-4 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-primary focus:outline-none"
              />
            </div>

            {selectedDate && (
              <div>
                <h3 className="text-lg font-medium text-slate-900 mb-4 flex items-center gap-2">
                  <FiClock className="text-primary" /> {t('booking.selectTimeSlot')}
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {timeSlots.map((slot: TimeSlot) => {
                    const time = new Date(slot.startDateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                    const isSelected = selectedTimeSlot?.id === slot.id;
                    return (
                      <button
                        key={slot.id}
                        disabled={slot.booked}
                        onClick={() => setSelectedTimeSlot(slot)}
                        className={`p-3 rounded-md border text-center transition-all ${
                          isSelected 
                            ? 'bg-primary text-white border-primary shadow-md' 
                            : slot.booked
                            ? 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed opacity-50'
                            : 'bg-white border-slate-200 text-slate-700 hover:border-primary'
                        }`}
                      >
                        {time} {slot.booked && `(${t('schedule.booked')})`}
                      </button>
                    );
                  })}
                  {timeSlots.length === 0 && !loading && (
                    <div className="col-span-2 md:col-span-4 text-center py-4 text-slate-500 border border-dashed rounded-md border-slate-300">
                      {t('booking.noTimeSlots')}
                    </div>
                  )}
                </div>
              </div>
            )}

            <div className="flex justify-end pt-4">
              <Button onClick={handleNextStep} disabled={!selectedDate || !selectedTimeSlot}>{t('booking.continue')}</Button>
            </div>
          </div>
        );
      case 4: // Enter Reason
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-slate-900 mb-2">{t('booking.reasonForVisit')}</h3>
            <p className="text-sm text-slate-500 mb-4">{t('booking.reasonDesc')}</p>
            <textarea 
              rows={4}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder={t('booking.reasonPlaceholder')}
              className="w-full p-3 border border-slate-300 rounded-md focus:ring-2 focus:ring-primary focus:outline-none resize-none"
            />
            <div className="flex justify-end pt-4">
              <Button onClick={handleNextStep} disabled={!reason.trim()}>{t('booking.reviewSummary')}</Button>
            </div>
          </div>
        );
      case 5: // Confirm
        return (
          <div className="space-y-6">
            <div className="bg-slate-50 p-6 rounded-xl border border-slate-200 space-y-4">
              <h3 className="text-lg font-bold text-slate-900 border-b border-slate-200 pb-2">{t('booking.appointmentSummary')}</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-slate-500">{t('booking.step1')}</p>
                  <p className="font-semibold text-slate-900">{selectedSpecialty?.name}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-500">{t('booking.step2')}</p>
                  <p className="font-semibold text-slate-900">{selectedDoctor?.fullName}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-500">{t('common.date')}</p>
                  <p className="font-semibold text-slate-900">{selectedDate}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-500">{t('common.time')}</p>
                  <p className="font-semibold text-slate-900">{selectedTimeSlot ? new Date(selectedTimeSlot.startDateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}</p>
                </div>
                <div className="md:col-span-2">
                  <p className="text-sm text-slate-500">{t('booking.step4')}</p>
                  <p className="font-semibold text-slate-900">{reason}</p>
                </div>
              </div>
            </div>

            <ErrorMessage message={error} />
            
            <div className="flex justify-end gap-3 pt-4">
              <Button onClick={handleSubmit} isLoading={loading} leftIcon={<FiCheckCircle />}>{t('booking.confirmAppointment')}</Button>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  if (loading && step === 1 && specialties.length === 0) {
    return <Loading size="lg" className="mt-20" />;
  }

  return (
    <div className="max-w-4xl mx-auto">
      {success && (
        <div className="fixed top-20 right-4 z-50">
          <Toast type="success" title="Success" message={t('booking.bookingSuccess')} />
        </div>
      )}

      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">{t('booking.title')}</h1>
        <p className="text-slate-500 mt-1">{t('booking.subtitle')}</p>
      </div>

      {/* Progress Steps */}
      <div className="flex items-center justify-between mb-8 relative">
        <div className="absolute top-1/2 left-0 w-full h-1 bg-slate-200 -z-10 transform -translate-y-1/2 rounded-full"></div>
        <div className={`absolute top-1/2 left-0 h-1 bg-primary -z-10 transform -translate-y-1/2 rounded-full transition-all duration-300`} style={{ width: `${((step - 1) / 4) * 100}%` }}></div>
        
        {[1, 2, 3, 4, 5].map(s => (
          <div key={s} className="flex flex-col items-center gap-2 bg-surface px-2">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm transition-colors ${step >= s ? 'bg-primary text-white shadow-md shadow-primary/30' : 'bg-slate-100 text-slate-400 border border-slate-200'}`}>
              {s}
            </div>
            <span className={`text-xs font-medium hidden md:block ${step >= s ? 'text-primary' : 'text-slate-400'}`}>
              {s === 1 ? t('booking.step1') : s === 2 ? t('booking.step2') : s === 3 ? t('booking.step3') : s === 4 ? t('booking.step4') : t('booking.step5')}
            </span>
          </div>
        ))}
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between border-b border-slate-100 pb-4">
          <CardTitle>
            {step === 1 ? t('booking.chooseSpecialty') : 
             step === 2 ? `Step 2: ${t('booking.step2')}` : 
             step === 3 ? `Step 3: ${t('booking.step3')}` : 
             step === 4 ? `Step 4: ${t('booking.step4')}` : 
             `Step 5: ${t('booking.step5')}`}
          </CardTitle>
          {step > 1 && step < 6 && !loading && (
            <Button variant="ghost" size="sm" onClick={handlePrevStep}>{t('common.back')}</Button>
          )}
        </CardHeader>
        <CardContent className="pt-6">
          {renderStepContent()}
        </CardContent>
      </Card>
    </div>
  );
};

export default PatientBooking;
