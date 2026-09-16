import { useEffect, useState, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Loading } from '../../components';
import { fetchAppointmentsThunk, cancelAppointmentThunk, selectPatientAppointments, selectPatientLoading } from '../../store/features/patient/patientSlice';
import { useTranslation } from 'react-i18next';
import { MedicalCalendar, CalendarEventModal } from '../../components';
import type { CalendarEvent } from '../../components/calendar/MedicalCalendar';

const PatientAppointments = () => {
  const dispatch = useDispatch<any>();
  const { t } = useTranslation();
  const appointments = useSelector(selectPatientAppointments);
  const loading = useSelector(selectPatientLoading);

  const [selectedEvent, setSelectedEvent] = useState<any>(null);
  const [isEventModalOpen, setIsEventModalOpen] = useState(false);

  // We still fetch normally via Redux. To get more data, Redux state/Thunk would need updating, 
  // but we stick to current Thunk implementation.
  useEffect(() => {
    dispatch(fetchAppointmentsThunk());
  }, [dispatch]);

  const handleCancel = (id: number) => {
    if (window.confirm(t('appointment.confirmCancel', 'Bạn có chắc muốn hủy lịch hẹn này?'))) {
      dispatch(cancelAppointmentThunk(id));
    }
  };

  const handleEventClick = (info: any) => {
    setSelectedEvent(info.event);
    setIsEventModalOpen(true);
  };

  const calendarEvents = useMemo(() => {
    const events: CalendarEvent[] = [];

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
          title: apt.doctorName,
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
  }, [appointments]);

  if (loading && appointments.length === 0) return <Loading size="lg" className="mt-20" />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">{t('menu.appointments')}</h1>
      </div>

      <MedicalCalendar 
        events={calendarEvents} 
        onEventClick={handleEventClick} 
        height={700}
      />

      <CalendarEventModal
        isOpen={isEventModalOpen}
        onClose={() => setIsEventModalOpen(false)}
        event={selectedEvent}
        onCancelAppointment={handleCancel}
        isCancelingAppointment={loading}
      />
    </div>
  );
};

export default PatientAppointments;
