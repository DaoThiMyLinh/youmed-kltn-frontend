import React, { useRef } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import viLocale from '@fullcalendar/core/locales/vi';

export interface CalendarEvent {
  id: string;
  title: string;
  start: Date | string;
  end?: Date | string;
  allDay?: boolean;
  display?: 'auto' | 'block' | 'list-item' | 'background' | 'inverse-background' | 'none';
  backgroundColor?: string;
  borderColor?: string;
  textColor?: string;
  classNames?: string[];
  extendedProps?: any;
}

interface MedicalCalendarProps {
  events: CalendarEvent[];
  onEventClick?: (info: any) => void;
  height?: string | number;
}

const MedicalCalendar: React.FC<MedicalCalendarProps> = ({ events, onEventClick, height = 'auto' }) => {
  const calendarRef = useRef<any>(null);

  const handleEventContent = (eventInfo: any) => {
    const { event, timeText } = eventInfo;
    const type = event.extendedProps?.type;

    if (type === 'schedule') {
      return (
        <div className="w-full h-full" />
      );
    }

    // For appointment, use a compact inline layout to prevent text cutoff on 30-min events
    return (
      <div className="w-full h-full px-1 py-0 flex flex-row items-center gap-1 overflow-hidden text-[11px]">
        <span className="font-bold text-blue-800 shrink-0">{timeText}</span>
        <span className="font-medium text-slate-700 truncate opacity-90">{event.title}</span>
      </div>
    );
  };

  return (
    <div className="medical-calendar-wrapper bg-white p-4 rounded-lg shadow-sm border border-slate-200">
      <div className="flex flex-wrap items-center gap-6 mb-4 pb-3 border-b border-slate-100 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-[#f0fdfa] border-l-4 border-[#0d9488]"></div>
          <span className="font-medium text-slate-700">Lịch làm việc</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-[#3788d8] shadow-sm"></div>
          <span className="font-medium text-slate-700">Lịch hẹn</span>
        </div>
      </div>
      <style>{`
        .calendar-schedule-event {
          z-index: 1 !important;
          background-color: #f0fdfa !important;
          border: none !important;
          border-left: 4px solid #0d9488 !important;
          color: #0f766e !important;
          font-weight: 600 !important;
          border-radius: 4px !important;
          transition: background-color 0.2s;
          opacity: 1 !important;
        }
        .calendar-schedule-event:hover {
          background-color: #ccfbf1 !important;
        }
        .calendar-schedule-event .fc-event-main {
          color: #0f766e !important;
        }
        
        .calendar-schedule-month {
          background-color: #ccfbf1 !important;
          opacity: 0.8 !important;
          border-left: 4px solid #0d9488 !important;
        }
        
        /* Hide Month (allDay) events in TimeGrid (Week/Day) */
        .fc-timeGridWeek-view .calendar-schedule-month,
        .fc-timeGridDay-view .calendar-schedule-month,
        .fc-timeGrid-view .calendar-schedule-month,
        .fc-timeGridWeek .calendar-schedule-month,
        .fc-timeGridDay .calendar-schedule-month {
          display: none !important;
        }
        
        /* Hide Week (timed) events in Month view */
        .fc-dayGridMonth-view .calendar-schedule-event,
        .fc-dayGridMonth .calendar-schedule-event {
          display: none !important;
        }
        .calendar-appointment-event {
          z-index: 10 !important;
          background-color: #eff6ff !important;
          border: none !important;
          border-left: 3px solid #3b82f6 !important;
          border-radius: 4px !important;
          box-shadow: 0 1px 2px rgba(0,0,0,0.05);
          overflow: hidden;
          left: 3px !important;
          right: 0 !important;
        }
        .calendar-appointment-event:hover {
          background-color: #dbeafe !important;
        }
      `}</style>
      <FullCalendar
        ref={calendarRef}
        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin] as any}
        locales={[viLocale]}
        locale="vi"
        initialView="timeGridWeek"
        headerToolbar={{
          left: 'prev,next today',
          center: 'title',
          right: 'dayGridMonth,timeGridWeek,timeGridDay'
        }}
        eventTimeFormat={{ hour: '2-digit', minute: '2-digit', hour12: false }}
        slotMinTime="06:30:00"
        slotMaxTime="17:00:00"
        slotDuration="00:30:00"
        slotLabelInterval="01:00:00"
        allDaySlot={false}
        eventInteractive={true}
        events={events}
        eventOrder="extendedProps.order"
        slotEventOverlap={true}
        eventClick={onEventClick}
        eventContent={handleEventContent}
        height={height}
        nowIndicator={true}
        expandRows={true}
      />
    </div>
  );
};

export default MedicalCalendar;
