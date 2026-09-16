import React from 'react';
import { Button, Badge } from '../';
import { FiClock, FiCalendar, FiUser, FiInfo, FiTrash2, FiEye, FiX } from 'react-icons/fi';
import { useTranslation } from 'react-i18next';

interface CalendarEventModalProps {
  isOpen: boolean;
  onClose: () => void;
  event: any; // FullCalendar event object
  
  // Callbacks passed from parent
  onViewTimeSlots?: (scheduleData: any) => void;
  onDeleteSchedule?: (scheduleId: number) => void;
  onCancelAppointment?: (appointmentId: number) => void;
  
  // Custom states passed from parent
  isDeletingSchedule?: boolean;
  isCancelingAppointment?: boolean;
}

const CalendarEventModal: React.FC<CalendarEventModalProps> = ({
  isOpen,
  onClose,
  event,
  onViewTimeSlots,
  onDeleteSchedule,
  onCancelAppointment,
  isDeletingSchedule,
  isCancelingAppointment
}) => {
  const { t } = useTranslation();
  
  if (!isOpen || !event) return null;

  const { title, start, end, extendedProps } = event;
  const { type, data } = extendedProps;

  // Format dates manually to avoid timezone issues
  const formatDate = (d: Date | null) => d ? d.toLocaleDateString('en-GB') : '';
  const formatTime = (d: Date | null) => d ? d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }) : '';

  const renderScheduleDetails = () => (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-slate-700">
        <FiCalendar className="text-primary" />
        <span className="font-medium">{t('common.date', 'Ngày')}:</span>
        <span>{data.workingDate}</span>
      </div>
      <div className="flex items-center gap-2 text-slate-700">
        <FiClock className="text-primary" />
        <span className="font-medium">{t('common.time', 'Thời gian')}:</span>
        <span>{data.startTime} - {data.endTime}</span>
      </div>
      <div className="flex items-center gap-2 text-slate-700">
        <FiInfo className="text-primary" />
        <span className="font-medium">{t('common.status', 'Trạng thái')}:</span>
        <Badge variant={data.active ? 'success' : 'secondary'}>
          {data.active ? t('schedule.active', 'Đang hoạt động') : t('schedule.inactive', 'Ngưng hoạt động')}
        </Badge>
      </div>
      
      <div className="pt-4 flex justify-end gap-2 border-t border-slate-100">
        {onViewTimeSlots && (
          <Button
            variant="outline"
            leftIcon={<FiEye />}
            onClick={() => {
              onViewTimeSlots(data);
              onClose();
            }}
          >
            {t('common.view', 'Xem Slot')}
          </Button>
        )}
        {onDeleteSchedule && (
          <Button
            variant="danger"
            leftIcon={<FiTrash2 />}
            isLoading={isDeletingSchedule}
            onClick={() => onDeleteSchedule(data.id)}
          >
            {t('common.delete', 'Xóa')}
          </Button>
        )}
      </div>
    </div>
  );

  const renderAppointmentDetails = () => (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-slate-700">
        <FiUser className="text-primary" />
        <span className="font-medium">{data.doctorName ? t('common.doctor', 'Bác sĩ') : t('common.patient', 'Bệnh nhân')}:</span>
        <span>{data.doctorName || data.patientName}</span>
      </div>
      <div className="flex items-center gap-2 text-slate-700">
        <FiCalendar className="text-primary" />
        <span className="font-medium">{t('common.date', 'Ngày')}:</span>
        <span>{formatDate(start)}</span>
      </div>
      <div className="flex items-center gap-2 text-slate-700">
        <FiClock className="text-primary" />
        <span className="font-medium">{t('common.time', 'Thời gian')}:</span>
        <span>{formatTime(start)} {end ? `- ${formatTime(end)}` : ''}</span>
      </div>
      <div className="flex items-center gap-2 text-slate-700">
        <FiInfo className="text-primary" />
        <span className="font-medium">{t('common.status', 'Trạng thái')}:</span>
        <Badge variant={
          data.status === 'CONFIRMED' ? 'success' : 
          data.status === 'PENDING' ? 'warning' : 
          data.status === 'CANCELLED' ? 'danger' : 'primary'
        }>
          {data.status}
        </Badge>
      </div>
      {data.reason && (
        <div className="text-slate-700">
          <span className="font-medium block mb-1">{t('appointment.reason', 'Lý do khám')}:</span>
          <div className="bg-slate-50 p-2 rounded text-sm">{data.reason}</div>
        </div>
      )}

      <div className="pt-4 flex justify-end gap-2 border-t border-slate-100">
        {onCancelAppointment && data.status !== 'CANCELLED' && data.status !== 'COMPLETED' && (
          <Button
            variant="danger"
            isLoading={isCancelingAppointment}
            onClick={() => {
              onCancelAppointment(data.id);
              onClose();
            }}
          >
            {t('appointment.cancel', 'Hủy Lịch')}
          </Button>
        )}
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md overflow-hidden">
        <div className="flex justify-between items-center p-4 border-b border-slate-100">
          <h3 className="font-semibold text-lg text-slate-800 truncate">
            {type === 'schedule' ? t('schedule.title', 'Chi tiết Lịch làm việc') : title}
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors p-1">
            <FiX className="w-5 h-5" />
          </button>
        </div>
        <div className="p-4">
          {type === 'schedule' ? renderScheduleDetails() : renderAppointmentDetails()}
        </div>
      </div>
    </div>
  );
};

export default CalendarEventModal;
