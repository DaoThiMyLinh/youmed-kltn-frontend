import { useEffect, useState, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchAppointmentsThunk, cancelAppointmentThunk, selectPatientAppointments, selectPatientLoading } from '../../store/features/patient/patientSlice';
import { useTranslation } from 'react-i18next';
import { MedicalCalendar, CalendarEventModal } from '../../components';
import type { CalendarEvent } from '../../components/calendar/MedicalCalendar';
import { motion } from 'framer-motion';

const PatientAppointments = () => {
  const dispatch = useDispatch<any>();
  const { t } = useTranslation();
  const appointments = useSelector(selectPatientAppointments);
  const loading = useSelector(selectPatientLoading);

  const [selectedEvent, setSelectedEvent] = useState<any>(null);
  const [isEventModalOpen, setIsEventModalOpen] = useState(false);

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
        if (apt.status === 'CONFIRMED') bgColor = '#10b981'; // emerald-500
        if (apt.status === 'PENDING') bgColor = '#f59e0b'; // amber-500
        if (apt.status === 'CANCELLED') bgColor = '#ef4444'; // red-500
        if (apt.status === 'COMPLETED') bgColor = '#64748b'; // slate-500

        events.push({
          id: `appointment_${apt.id}`,
          title: apt.doctorName,
          start: start,
          end: end,
          backgroundColor: bgColor,
          borderColor: 'transparent',
          textColor: '#ffffff',
          classNames: ['calendar-appointment-event', 'shadow-sm', 'rounded-md', 'border-none'],
          extendedProps: { type: 'appointment', data: apt, status: apt.status, order: 2 }
        });
      } catch (e) {
        console.error("Error mapping appointment event", e);
      }
    });

    return events;
  }, [appointments]);

  if (loading && appointments.length === 0) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-emerald-500 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-10">
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white p-6 sm:p-8 rounded-3xl shadow-sm border border-slate-100 relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-emerald-100 to-transparent rounded-full opacity-50 -mr-20 -mt-20"></div>
        <div className="relative z-10">
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight mb-2">{t('menu.appointments')}</h1>
          <p className="text-slate-500">Quản lý và theo dõi tất cả lịch hẹn khám bệnh của bạn tại đây.</p>
        </div>
      </motion.div>

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
        onCancelAppointment={handleCancel}
        isCancelingAppointment={loading}
      />
    </div>
  );
};

export default PatientAppointments;
