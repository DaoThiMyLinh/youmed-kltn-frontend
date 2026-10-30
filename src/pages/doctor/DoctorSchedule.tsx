import React, { useEffect, useState, useMemo } from 'react';
import { Card, CardContent, Button, ErrorMessage, Input } from '../../components';
import { FiPlus, FiX, FiCalendar, FiClock, FiActivity } from 'react-icons/fi';
import { scheduleService } from '../../services/schedule.service';
import { consultationService } from '../../services/consultation.service';
import type { ScheduleModel, TimeSlot } from '../../types/schedule';
import type { Appointment } from '../../types/patient';
import { useTranslation } from 'react-i18next';
import { MedicalCalendar, CalendarEventModal } from '../../components';
import type { CalendarEvent } from '../../components/calendar/MedicalCalendar';
import { motion, AnimatePresence } from 'framer-motion';

const DoctorSchedule = () => {
  const { t } = useTranslation();
  const [schedules, setSchedules] = useState<ScheduleModel[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [isAdding, setIsAdding] = useState(false);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [deletingScheduleId, setDeletingScheduleId] = useState<number | null>(null);

  // Slots modal state
  const [selectedSchedule, setSelectedSchedule] = useState<ScheduleModel | null>(null);
  const [slots, setSlots] = useState<TimeSlot[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);

  // Calendar Event Modal state
  const [selectedEvent, setSelectedEvent] = useState<any>(null);
  const [isEventModalOpen, setIsEventModalOpen] = useState(false);

  const tomorrowStr = useMemo(() => {
    const now = new Date();
    const tomorrow = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
    const tmrY = tomorrow.getFullYear();
    const tmrM = String(tomorrow.getMonth() + 1).padStart(2, '0');
    const tmrD = String(tomorrow.getDate()).padStart(2, '0');
    return `${tmrY}-${tmrM}-${tmrD}`;
  }, []);

  const TIME_OPTIONS = [
    '06:30', '07:00', '07:30', '08:00', '08:30', '09:00', '09:30', '10:00', '10:30',
    '11:00', '11:30', '12:00', '12:30', '13:00', '13:30', '14:00', '14:30', '15:00',
    '15:30', '16:00', '16:30'
  ];

  const isScheduleActive = (schedule: ScheduleModel) => {
    if (!schedule.active) return false;
    try {
      const timeParts = schedule.endTime.split(':');
      const h = parseInt(timeParts[0] || '0', 10);
      const m = parseInt(timeParts[1] || '0', 10);
      const s = parseInt(timeParts[2] || '0', 10);

      const dateParts = schedule.workingDate.split('-');
      const year = parseInt(dateParts[0], 10);
      const month = parseInt(dateParts[1], 10) - 1;
      const day = parseInt(dateParts[2], 10);

      const endDateTime = new Date(year, month, day, h, m, s, 0);
      const now = new Date();
      return now < endDateTime;
    } catch (e) {
      return schedule.active;
    }
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      const [schedulesData, appointmentsData] = await Promise.all([
        scheduleService.getMySchedules(),
        consultationService.getDoctorAppointments(0, 100, 'appointmentTime', 'ASC')
      ]);
      setSchedules(schedulesData);
      setAppointments(appointmentsData.content);
      setError(null);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch calendar data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!startDate || !endDate || !startTime || !endTime) {
      setFormError(t('schedule.errorRequired', 'Vui lòng điền đầy đủ ngày bắt đầu, ngày kết thúc và giờ.'));
      return;
    }

    if (startDate < tomorrowStr) {
      setFormError(t('schedule.errorPastDate', 'Bác sĩ chỉ được tạo lịch từ ngày mai trở đi.'));
      return;
    }

    if (startDate > endDate) {
      setFormError(t('schedule.errorDateRange', 'Ngày bắt đầu không được lớn hơn ngày kết thúc.'));
      return;
    }

    const startParts = startTime.split(':');
    const endParts = endTime.split(':');
    if (!['00', '30'].includes(startParts[1]) || !['00', '30'].includes(endParts[1])) {
      setFormError(t('schedule.errorSlotInterval', 'Giờ bắt đầu và kết thúc phải đúng mốc 00 hoặc 30 phút (VD: 08:00, 08:30).'));
      return;
    }

    const toMinutes = (time: string) => {
      const [hour, minute] = time.slice(0, 5).split(':').map(Number);
      return hour * 60 + minute;
    };

    const startMins = toMinutes(startTime);
    const endMins = toMinutes(endTime);
    const minMins = toMinutes('06:30');
    const maxMins = toMinutes('16:30');

    if (startMins < minMins) {
      setFormError(t('schedule.errorMinTime', 'Giờ bắt đầu sớm nhất là 06:30.'));
      return;
    }

    if (endMins > maxMins) {
      setFormError(t('schedule.errorMaxTime', 'Giờ kết thúc muộn nhất là 16:30.'));
      return;
    }

    if (endMins <= startMins) {
      setFormError(t('schedule.errorTime', 'Giờ kết thúc phải lớn hơn giờ bắt đầu.'));
      return;
    }

    try {
      setIsSubmitting(true);
      const res = await scheduleService.createScheduleRange({ startDate, endDate, startTime, endTime });
      setIsAdding(false);
      setStartDate('');
      setEndDate('');
      setStartTime('');
      setEndTime('');

      let alertMsg = res.message;
      if (res.createdDates.length > 0) {
        alertMsg += `\nĐã tạo thành công: ${res.createdDates.length} ngày.`;
      }
      if (res.skippedDates.length > 0) {
        alertMsg += `\nĐã bỏ qua (trùng lịch): ${res.skippedDates.join(', ')}`;
      }
      alert(alertMsg);

      fetchData();
    } catch (err: any) {
      setFormError(err.response?.data?.message || t('common.error', 'Đã có lỗi xảy ra.'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (scheduleId: number) => {
    if (deletingScheduleId) return;
    if (!window.confirm(t('schedule.confirmDelete', 'Bạn có chắc chắn muốn xóa lịch làm việc này?'))) return;

    setDeletingScheduleId(scheduleId);
    try {
      const schedule = schedules.find(s => s.id === scheduleId);
      if (!schedule) throw new Error("Schedule not found");

      const doctorId = await scheduleService.getDoctorId();
      const slots = await scheduleService.getScheduleSlots(doctorId, schedule.workingDate);

      const hasBooked = slots.some(slot => slot.booked);
      if (hasBooked) {
        alert(t('schedule.cannotDeleteBooked', 'Lịch làm việc này đã có bệnh nhân đặt khám, không thể xóa.'));
        return;
      }

      await scheduleService.deleteSchedule(scheduleId);
      fetchData();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to delete schedule');
    } finally {
      setDeletingScheduleId(null);
      setIsEventModalOpen(false);
    }
  };

  const handleViewSlots = async (schedule: ScheduleModel) => {
    setSelectedSchedule(schedule);
    try {
      setLoadingSlots(true);
      const data = await scheduleService.getScheduleSlots(schedule.doctorId!, schedule.workingDate);
      setSlots(data);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to fetch slots');
      setSlots([]);
    } finally {
      setLoadingSlots(false);
    }
  };

  const closeSlotsModal = () => {
    setSelectedSchedule(null);
    setSlots([]);
  };

  const handleEventClick = (info: any) => {
    setSelectedEvent(info.event);
    setIsEventModalOpen(true);
  };

  const calendarEvents = useMemo(() => {
    const events: CalendarEvent[] = [];

    schedules.forEach(schedule => {
      try {
        if (!schedule.workingDate || !schedule.startTime || !schedule.endTime) return;

        const [year, month, day] = schedule.workingDate.split('-').map(Number);
        const [hStart, mStart] = schedule.startTime.split(':').map(Number);
        const [hEnd, mEnd] = schedule.endTime.split(':').map(Number);

        const start = new Date(year, month - 1, day, hStart, mStart, 0);
        const end = new Date(year, month - 1, day, hEnd, mEnd, 0);

        if (start < end) {
          const isActive = isScheduleActive(schedule);
          // Event for Month view (Fills the entire cell)
          events.push({
            id: `schedule_month_${schedule.id}`,
            title: t('schedule.working', 'Lịch làm việc'),
            start: start,
            end: end,
            allDay: true,
            display: 'background',
            classNames: ['calendar-schedule-month'],
            extendedProps: { type: 'schedule', data: { ...schedule, active: isActive }, order: 1 }
          });

          // Event for Week/Day view (Spans specific hours)
          events.push({
            id: `schedule_week_${schedule.id}`,
            title: t('schedule.working', 'Lịch làm việc'),
            start: start,
            end: end,
            allDay: false,
            display: 'background',
            classNames: ['calendar-schedule-event', 'rounded-md'],
            extendedProps: { type: 'schedule', data: { ...schedule, active: isActive }, order: 1 }
          });
        }
      } catch (e) {
        console.error("Error mapping schedule event", e);
      }
    });

    appointments.forEach(apt => {
      try {
        if (!apt.appointmentTime) return;

        let start: Date;
        if (apt.appointmentTime.includes('Z') || apt.appointmentTime.includes('+') || apt.appointmentTime.match(/-\d{2}:\d{2}$/)) {
          start = new Date(apt.appointmentTime);
        } else {
          const [datePart, timePart] = apt.appointmentTime.split('T');
          const [y, m, d] = datePart.split('-').map(Number);
          const [h, min, s] = (timePart || '00:00:00').split(':').map(Number);
          start = new Date(y, m - 1, d, h, min, s || 0);
        }

        const end = new Date(start.getTime() + 30 * 60000);

        let bgColor = '#4f46e5'; // indigo-600
        if (apt.status === 'CONFIRMED') bgColor = '#10b981'; // emerald-500
        if (apt.status === 'PENDING') bgColor = '#f59e0b'; // amber-500
        if (apt.status === 'CANCELLED') bgColor = '#ef4444'; // red-500
        if (apt.status === 'COMPLETED') bgColor = '#64748b'; // slate-500

        events.push({
          id: `appointment_${apt.id}`,
          title: apt.patientName,
          start: start,
          end: end,
          backgroundColor: bgColor,
          borderColor: 'transparent',
          textColor: '#ffffff',
          classNames: ['calendar-appointment-event', 'shadow-sm', 'rounded-md'],
          extendedProps: { type: 'appointment', data: apt, status: apt.status, order: 2 }
        });
      } catch (e) {
        console.error("Error mapping appointment event", e);
      }
    });

    return events;
  }, [schedules, appointments, t]);

  if (loading) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-indigo-500 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-10">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white p-6 sm:p-8 rounded-3xl shadow-sm border border-slate-100 relative overflow-hidden flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6"
      >
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-indigo-100 to-transparent rounded-full opacity-50 -mr-20 -mt-20"></div>
        <div className="relative z-10 flex items-center gap-4">
          <div className="w-14 h-14 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center shadow-sm">
            <FiCalendar className="w-7 h-7" />
          </div>
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight mb-1">{t('schedule.title', 'Lịch làm việc & Lịch hẹn')}</h1>
            <p className="text-slate-500">{t('schedule.subtitle', 'Quản lý lịch làm việc và các cuộc hẹn của bạn trên Calendar')}</p>
          </div>
        </div>
        <Button
          onClick={() => setIsAdding(!isAdding)}
          leftIcon={isAdding ? <FiX /> : <FiPlus />}
          className={`relative z-10 shadow-md hover:shadow-lg transition-all ${isAdding ? 'bg-slate-100 hover:bg-slate-200 text-slate-700' : 'bg-indigo-600 hover:bg-indigo-700 text-white'}`}
        >
          {isAdding ? t('common.cancel') : t('schedule.add')}
        </Button>
      </motion.div>

      {error && <ErrorMessage message={error} />}

      <AnimatePresence>
        {isAdding && (
          <motion.div
            initial={{ opacity: 0, height: 0, scale: 0.95 }}
            animate={{ opacity: 1, height: 'auto', scale: 1 }}
            exit={{ opacity: 0, height: 0, scale: 0.95 }}
            className="overflow-hidden"
          >
            <Card className="border-indigo-100 shadow-md">
              <div className="bg-indigo-50/50 p-6 border-b border-indigo-100">
                <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2"><FiClock className="text-indigo-500" /> Tạo lịch làm việc mới</h3>
              </div>
              <CardContent className="p-8">
                {formError && <ErrorMessage message={formError} className="mb-6" />}
                <form onSubmit={handleAddSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-slate-700 uppercase tracking-wider">{t('schedule.startDate', 'Từ ngày')}</label>
                      <Input
                        type="date"
                        min={tomorrowStr}
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        required
                        className="bg-slate-50"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-slate-700 uppercase tracking-wider">{t('schedule.endDate', 'Đến ngày')}</label>
                      <Input
                        type="date"
                        min={startDate || tomorrowStr}
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        required
                        className="bg-slate-50"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-slate-700 uppercase tracking-wider">{t('schedule.startTime')}</label>
                      <select
                        className="flex h-11 w-full rounded-xl border bg-slate-50 px-3 py-2 border-slate-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-slate-900 transition-all font-medium"
                        value={startTime}
                        onChange={(e) => setStartTime(e.target.value)}
                        required
                      >
                        <option value="" disabled>{t('schedule.selectTime', 'Chọn giờ')}</option>
                        {TIME_OPTIONS.map(time => (
                          <option key={`start-${time}`} value={time}>{time}</option>
                        ))}
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-slate-700 uppercase tracking-wider">{t('schedule.endTime')}</label>
                      <select
                        className="flex h-11 w-full rounded-xl border bg-slate-50 px-3 py-2 border-slate-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-slate-900 transition-all font-medium"
                        value={endTime}
                        onChange={(e) => setEndTime(e.target.value)}
                        required
                      >
                        <option value="" disabled>{t('schedule.selectTime', 'Chọn giờ')}</option>
                        {TIME_OPTIONS.map(time => (
                          <option key={`end-${time}`} value={time}>{time}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div className="pt-4 flex justify-end">
                    <Button type="submit" isLoading={isSubmitting} className="bg-indigo-600 hover:bg-indigo-700 px-8">
                      {t('common.save', 'Lưu Lịch')}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.1 }}
        className="bg-white p-6 rounded-3xl shadow-xl shadow-slate-200/40 border border-slate-100"
      >
        <MedicalCalendar
          events={calendarEvents}
          onEventClick={handleEventClick}
          height={750}
        />
      </motion.div>

      <CalendarEventModal
        isOpen={isEventModalOpen}
        onClose={() => setIsEventModalOpen(false)}
        event={selectedEvent}
        onViewTimeSlots={(data) => handleViewSlots(data)}
        onDeleteSchedule={handleDelete}
        isDeletingSchedule={deletingScheduleId !== null}
      />

      {/* Slots Modal */}
      {selectedSchedule && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md">
          <div className="w-full max-w-4xl max-h-[85vh] bg-white rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-300">
            <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between bg-white relative z-10 shadow-sm">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center">
                  <FiActivity className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-900 mb-1">{t('schedule.generatedSlots')}</h3>
                  <div className="flex items-center gap-2 text-sm text-slate-500 font-medium">
                    <span className="flex items-center gap-1"><FiCalendar /> {selectedSchedule.workingDate}</span>
                    <span className="text-slate-300">|</span>
                    <span className="flex items-center gap-1 text-indigo-600"><FiClock /> {selectedSchedule.startTime} - {selectedSchedule.endTime}</span>
                  </div>
                </div>
              </div>
              <button
                onClick={closeSlotsModal}
                className="p-3 bg-slate-50 text-slate-500 hover:text-slate-900 hover:bg-slate-200 rounded-full transition-colors"
              >
                <FiX className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-8 bg-slate-50/50">
              {loadingSlots ? (
                <div className="flex justify-center py-16">
                  <div className="animate-spin rounded-full h-10 w-10 border-4 border-indigo-500 border-t-transparent"></div>
                </div>
              ) : slots.length === 0 ? (
                <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-slate-300 shadow-sm">
                  <FiClock className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                  <p className="text-lg font-bold text-slate-700 mb-2">Chưa có ca khám</p>
                  <p className="text-slate-500">{t('schedule.noSlots', 'Chưa có ca khám nào được tạo cho lịch này.')}</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                  {slots.map((slot) => {
                    const startTime = new Date(slot.startDateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });

                    return (
                      <div
                        key={slot.id}
                        className={`group relative p-4 rounded-2xl border-2 flex flex-col items-center justify-center gap-3 transition-all duration-300 ${slot.booked
                          ? 'bg-slate-100 border-slate-200 opacity-60 cursor-default grayscale'
                          : 'bg-white border-indigo-100 shadow-sm hover:shadow-md hover:border-indigo-400 cursor-default transform hover:-translate-y-1'
                          }`}
                      >
                        <div className={`text-base font-bold tracking-tight ${slot.booked ? 'text-slate-500' : 'text-slate-800 group-hover:text-indigo-700 transition-colors'}`}>
                          {startTime}
                        </div>
                        <div className={`text-xs px-3 py-1 rounded-full font-bold uppercase tracking-wider ${slot.booked
                          ? 'bg-slate-200 text-slate-600'
                          : 'bg-indigo-50 text-indigo-600'
                          }`}
                        >
                          {slot.booked ? t('schedule.booked', 'Đã đặt') : t('schedule.available', 'Trống')}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DoctorSchedule;
