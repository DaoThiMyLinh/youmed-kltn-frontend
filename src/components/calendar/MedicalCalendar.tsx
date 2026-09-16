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
        <div className="w-full h-full p-1 opacity-70 flex items-start justify-center text-xs overflow-hidden">
          <span className="font-medium whitespace-nowrap text-ellipsis overflow-hidden">{event.title}</span>
        </div>
      );
    }
    
    // For appointment, use a compact inline layout to prevent text cutoff on 30-min events
    return (
      <div className="w-full h-full px-1 py-0.5 flex flex-col justify-start overflow-hidden text-xs">
        <div className="flex flex-row items-center gap-1 whitespace-nowrap overflow-hidden">
          <span className="font-bold shrink-0">{timeText}</span>
          <span className="font-medium text-ellipsis overflow-hidden shrink">{event.title}</span>
        </div>
      </div>
    );
  };

  return (
    <div className="medical-calendar-wrapper bg-white p-4 rounded-lg shadow-sm border border-slate-200">
      <style>{`
        .calendar-schedule-event { z-index: 1 !important; opacity: 0.8; }
        .calendar-appointment-event { z-index: 10 !important; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
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
        slotMinTime="06:00:00"
        slotMaxTime="22:00:00"
        slotDuration="00:30:00"
        slotLabelInterval="01:00:00"
        allDaySlot={false}
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
