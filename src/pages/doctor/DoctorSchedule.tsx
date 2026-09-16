import React, { useEffect, useState, useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardContent, Button, Badge, Loading, ErrorMessage, Input } from '../../components';
import { FiPlus, FiX } from 'react-icons/fi';
import { scheduleService } from '../../services/schedule.service';
import { consultationService } from '../../services/consultation.service';
import type { ScheduleModel, TimeSlot } from '../../types/schedule';
import type { Appointment } from '../../types/patient';
import { useTranslation } from 'react-i18next';
import { MedicalCalendar, CalendarEventModal } from '../../components';
import type { CalendarEvent } from '../../components/calendar/MedicalCalendar';

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

    // Validate tomorrowStr which is now accessible via component scope
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
      setIsEventModalOpen(false); // Close modal if open
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

  // Map schedules and appointments to Calendar events
  const calendarEvents = useMemo(() => {
    const events: CalendarEvent[] = [];

    // Map Schedules
    schedules.forEach(schedule => {
      try {
        if (!schedule.workingDate || !schedule.startTime || !schedule.endTime) return;
        
        // Manual Date Parsing for safety
        const [year, month, day] = schedule.workingDate.split('-').map(Number);
        const [hStart, mStart] = schedule.startTime.split(':').map(Number);
        const [hEnd, mEnd] = schedule.endTime.split(':').map(Number);
        
        const start = new Date(year, month - 1, day, hStart, mStart, 0);
        const end = new Date(year, month - 1, day, hEnd, mEnd, 0);
        
        if (start < end) {
          const isActive = isScheduleActive(schedule);
          events.push({
            id: `schedule_${schedule.id}`,
            title: t('schedule.working', 'Lịch làm việc'),
            start: start,
            end: end,
            backgroundColor: isActive ? '#f0f9ff' : '#f8fafc', // Very light blue/gray
            borderColor: isActive ? '#e0f2fe' : '#f1f5f9',
            textColor: isActive ? '#0369a1' : '#64748b',
            display: 'block', 
            classNames: ['calendar-schedule-event'],
            extendedProps: { type: 'schedule', data: { ...schedule, active: isActive }, order: 1 }
          });
        }
      } catch (e) {
        console.error("Error mapping schedule event", e);
      }
    });

    // Map Appointments
    appointments.forEach(apt => {
      try {
        if (!apt.appointmentTime) return;
        
        // Backend returns LocalDateTime (e.g. "2026-09-17T08:00:00")
        // Check if string contains 'Z' or offset, if so, use standard parser.
        // If it's purely local (no Z, no +), parse manually.
        let start: Date;
        if (apt.appointmentTime.includes('Z') || apt.appointmentTime.includes('+') || apt.appointmentTime.match(/-\d{2}:\d{2}$/)) {
          start = new Date(apt.appointmentTime);
        } else {
          const [datePart, timePart] = apt.appointmentTime.split('T');
          const [y, m, d] = datePart.split('-').map(Number);
          const [h, min, s] = (timePart || '00:00:00').split(':').map(Number);
          start = new Date(y, m - 1, d, h, min, s || 0);
        }

        const end = new Date(start.getTime() + 30 * 60000); // Add 30 mins
        
        let bgColor = '#3b82f6'; // primary
        if (apt.status === 'CONFIRMED') bgColor = '#22c55e'; // success
        if (apt.status === 'PENDING') bgColor = '#f59e0b'; // warning
        if (apt.status === 'CANCELLED') bgColor = '#ef4444'; // danger
        if (apt.status === 'COMPLETED') bgColor = '#64748b'; // secondary

        events.push({
          id: `appointment_${apt.id}`,
          title: apt.patientName,
          start: start,
          end: end,
          backgroundColor: bgColor,
          borderColor: bgColor,
          textColor: '#ffffff',
          classNames: ['calendar-appointment-event'],
          extendedProps: { type: 'appointment', data: apt, status: apt.status, order: 2 }
        });
      } catch (e) {
        console.error("Error mapping appointment event", e);
      }
    });

    return events;
  }, [schedules, appointments, t]);


  if (loading) return <Loading />;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">{t('schedule.title', 'Lịch làm việc & Lịch hẹn')}</h1>
          <p className="text-slate-500">{t('schedule.subtitle', 'Quản lý lịch làm việc và các cuộc hẹn của bạn trên Calendar')}</p>
        </div>
        <Button
          onClick={() => setIsAdding(!isAdding)}
          leftIcon={isAdding ? <FiX /> : <FiPlus />}
          variant={isAdding ? 'outline' : 'primary'}
        >
          {isAdding ? t('common.cancel') : t('schedule.add')}
        </Button>
      </div>

      {error && <ErrorMessage message={error} />}

      {isAdding && (
        <Card>
          <CardHeader>
            <CardTitle>{t('schedule.add')}</CardTitle>
          </CardHeader>
          <CardContent>
            {formError && <ErrorMessage message={formError} className="mb-4" />}
            <form onSubmit={handleAddSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                <div className="space-y-1">
                  <label className="text-sm font-medium text-slate-700">{t('schedule.startDate', 'Từ ngày')}</label>
                  <Input
                    type="date"
                    min={tomorrowStr}
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium text-slate-700">{t('schedule.endDate', 'Đến ngày')}</label>
                  <Input
                    type="date"
                    min={startDate || tomorrowStr}
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium text-slate-700">{t('schedule.startTime')}</label>
                  <select
                    className="flex h-10 w-full rounded-md border bg-white px-3 py-2 text-sm border-slate-300 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-1 focus:border-primary text-slate-900 transition-colors"
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
                <div className="space-y-1">
                  <label className="text-sm font-medium text-slate-700">{t('schedule.endTime')}</label>
                  <select
                    className="flex h-10 w-full rounded-md border bg-white px-3 py-2 text-sm border-slate-300 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-1 focus:border-primary text-slate-900 transition-colors"
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
              <Button type="submit" isLoading={isSubmitting}>
                {t('common.save', 'Lưu Lịch')}
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Calendar View */}
      <MedicalCalendar 
        events={calendarEvents} 
        onEventClick={handleEventClick} 
        height={700}
      />

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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <Card className="w-full max-w-2xl max-h-[80vh] flex flex-col">
            <CardHeader className="border-b flex flex-row items-center justify-between">
              <div>
                <CardTitle>{t('schedule.generatedSlots')}</CardTitle>
                <p className="text-sm text-slate-500 mt-1">
                  {t('history.for')} {selectedSchedule.workingDate} ({selectedSchedule.startTime} - {selectedSchedule.endTime})
                </p>
              </div>
              <button
                onClick={closeSlotsModal}
                className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
              >
                <FiX className="w-5 h-5" />
              </button>
            </CardHeader>
            <CardContent className="flex-1 overflow-y-auto p-6">
              {loadingSlots ? (
                <div className="flex justify-center py-8">
                  <Loading />
                </div>
              ) : slots.length === 0 ? (
                <div className="text-center py-8 text-slate-500">
                  {t('schedule.noSlots', 'Chưa có ca khám nào được tạo cho lịch này.')}
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                  {slots.map((slot) => (
                    <div
                      key={slot.id}
                      className={`p-3 rounded-lg border text-center space-y-2 ${slot.booked
                          ? 'bg-red-50 border-red-200'
                          : 'bg-green-50 border-green-200'
                        }`}
                    >
                      <div className="font-medium text-sm text-slate-900">
                        {new Date(slot.startDateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })} -
                        {new Date(slot.endDateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })}
                      </div>
                      <div>
                        {slot.booked ? (
                          <Badge variant="danger" className="text-[10px]">{t('schedule.booked')}</Badge>
                        ) : (
                          <Badge variant="success" className="text-[10px]">{t('schedule.available')}</Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default DoctorSchedule;
