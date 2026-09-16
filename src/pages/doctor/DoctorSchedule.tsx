import React, { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent, Button, Badge, Loading, ErrorMessage, Input } from '../../components';
import { FiPlus, FiTrash2, FiEye, FiX } from 'react-icons/fi';
import { scheduleService } from '../../services/schedule.service';
import type { ScheduleModel, TimeSlot } from '../../types/schedule';
import { useTranslation } from 'react-i18next';

const DoctorSchedule = () => {
  const { t } = useTranslation();
  const [schedules, setSchedules] = useState<ScheduleModel[]>([]);
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

  const isScheduleActive = (schedule: ScheduleModel) => {
    if (!schedule.active) return false;
    
    try {
      const timeParts = schedule.endTime.split(':');
      const h = parseInt(timeParts[0] || '0', 10);
      const m = parseInt(timeParts[1] || '0', 10);
      const s = parseInt(timeParts[2] || '0', 10);
      
      // Parse local date explicitly to avoid UTC mismatch
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

  const fetchSchedules = async () => {
    try {
      setLoading(true);
      const data = await scheduleService.getMySchedules();
      const sortedData = data.sort((a, b) => {
        if (a.workingDate !== b.workingDate) {
          return b.workingDate.localeCompare(a.workingDate);
        }
        return b.startTime.localeCompare(a.startTime);
      });
      setSchedules(sortedData);
      setError(null);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch schedules');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSchedules();
  }, []);

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!startDate || !endDate || !startTime || !endTime) {
      setFormError(t('schedule.errorRequired', 'Vui lòng điền đầy đủ ngày bắt đầu, ngày kết thúc và giờ.'));
      return;
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const startD = new Date(startDate);
    const endD = new Date(endDate);

    if (startD < today) {
      setFormError(t('schedule.errorPastDate', 'Không thể tạo lịch cho ngày trong quá khứ.'));
      return;
    }

    if (startD > endD) {
      setFormError(t('schedule.errorDateRange', 'Ngày bắt đầu không được lớn hơn ngày kết thúc.'));
      return;
    }

    const startParts = startTime.split(':');
    const endParts = endTime.split(':');
    if (!['00', '30'].includes(startParts[1]) || !['00', '30'].includes(endParts[1])) {
      setFormError(t('schedule.errorSlotInterval', 'Giờ bắt đầu và kết thúc phải đúng mốc 00 hoặc 30 phút (VD: 08:00, 08:30).'));
      return;
    }

    const start = new Date(`1970-01-01T${startTime}:00`).getTime();
    const end = new Date(`1970-01-01T${endTime}:00`).getTime();
    const minStart = new Date(`1970-01-01T06:30:00`).getTime();
    const maxEnd = new Date(`1970-01-01T16:30:00`).getTime();

    if (start < minStart) {
      setFormError(t('schedule.errorMinTime', 'Giờ bắt đầu sớm nhất là 06:30.'));
      return;
    }

    if (end > maxEnd) {
      setFormError(t('schedule.errorMaxTime', 'Giờ kết thúc muộn nhất là 16:30.'));
      return;
    }

    if (start === end) {
      setFormError(t('schedule.errorSameTime', 'Giờ kết thúc không được trùng với giờ bắt đầu.'));
      return;
    }

    if (end < start) {
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

      fetchSchedules();
    } catch (err: any) {
      setFormError(err.response?.data?.message || t('common.error', 'Đã có lỗi xảy ra.'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (schedule: ScheduleModel) => {
    if (deletingScheduleId) return;
    if (!window.confirm(t('schedule.confirmDelete', 'Bạn có chắc chắn muốn xóa lịch làm việc này?'))) return;

    setDeletingScheduleId(schedule.id);
    try {
      const doctorId = await scheduleService.getDoctorId();
      const slots = await scheduleService.getScheduleSlots(doctorId, schedule.workingDate);

      const hasBooked = slots.some(slot => slot.booked);
      if (hasBooked) {
        alert(t('schedule.cannotDeleteBooked', 'Lịch làm việc này đã có bệnh nhân đặt khám, không thể xóa.'));
        return;
      }

      await scheduleService.deleteSchedule(schedule.id);
      fetchSchedules();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to delete schedule');
    } finally {
      setDeletingScheduleId(null);
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

  if (loading) return <Loading />;
  if (error) return <ErrorMessage message={error} />;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-slate-900">{t('menu.schedule')}</h1>
        <Button onClick={() => {
          setIsAdding(!isAdding);
          if (formError) setFormError(null);
        }} leftIcon={isAdding ? <FiX /> : <FiPlus />}>
          {isAdding ? t('common.cancel') : t('common.create')}
        </Button>
      </div>

      {isAdding && (
        <Card className="border-primary/20 bg-primary/5">
          <CardHeader>
            <CardTitle className="text-lg">{t('schedule.add', 'Thêm Lịch Làm Việc')}</CardTitle>
          </CardHeader>
          <CardContent>
            {formError && (
              <div className="mb-4 p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg">
                {formError}
              </div>
            )}
            <form onSubmit={handleAddSubmit} className="flex flex-col sm:flex-row sm:flex-wrap gap-4 sm:items-end">
              <div className="space-y-1.5 flex-1 w-full sm:w-auto sm:min-w-[200px]">
                <label className="text-sm font-medium text-slate-700">{t('schedule.startDate', 'Từ ngày')}</label>
                <Input
                  type="date"
                  value={startDate}
                  onChange={(e) => {
                    setStartDate(e.target.value);
                    if (formError) setFormError(null);
                  }}
                  required
                />
              </div>
              <div className="space-y-1.5 flex-1 w-full sm:w-auto sm:min-w-[150px]">
                <label className="text-sm font-medium text-slate-700">{t('schedule.endDate', 'Đến ngày')}</label>
                <Input
                  type="date"
                  value={endDate}
                  onChange={(e) => {
                    setEndDate(e.target.value);
                    if (formError) setFormError(null);
                  }}
                  required
                />
              </div>
              <div className="space-y-1.5 flex-1 w-full sm:w-auto sm:min-w-[150px]">
                <label className="text-sm font-medium text-slate-700">{t('schedule.startTime', 'Giờ bắt đầu')}</label>
                <div className="flex gap-2">
                  <select 
                    className="flex h-10 w-full rounded-md border bg-white px-3 py-2 text-sm border-slate-300 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary text-slate-900"
                    value={startTime.split(':')[0] || ''}
                    onChange={(e) => {
                      const hour = e.target.value;
                      const min = startTime.split(':')[1] || '00';
                      setStartTime(`${hour}:${min}`);
                      if (formError) setFormError(null);
                    }}
                    required
                  >
                    <option value="" disabled>Giờ</option>
                    {Array.from({length: 11}, (_, i) => i + 6).map(h => {
                      const hs = h.toString().padStart(2, '0');
                      return <option key={hs} value={hs}>{hs}</option>
                    })}
                  </select>
                  <span className="self-center font-bold text-slate-500">:</span>
                  <select 
                    className="flex h-10 w-full rounded-md border bg-white px-3 py-2 text-sm border-slate-300 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary text-slate-900"
                    value={startTime.split(':')[1] || ''}
                    onChange={(e) => {
                      const min = e.target.value;
                      const hour = startTime.split(':')[0] || '08';
                      setStartTime(`${hour}:${min}`);
                      if (formError) setFormError(null);
                    }}
                    required
                  >
                    <option value="" disabled>Phút</option>
                    <option value="00">00</option>
                    <option value="30">30</option>
                  </select>
                </div>
              </div>
              <div className="space-y-1.5 flex-1 w-full sm:w-auto sm:min-w-[150px]">
                <label className="text-sm font-medium text-slate-700">{t('schedule.endTime', 'Giờ kết thúc')}</label>
                <div className="flex gap-2">
                  <select 
                    className="flex h-10 w-full rounded-md border bg-white px-3 py-2 text-sm border-slate-300 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary text-slate-900"
                    value={endTime.split(':')[0] || ''}
                    onChange={(e) => {
                      const hour = e.target.value;
                      const min = endTime.split(':')[1] || '00';
                      setEndTime(`${hour}:${min}`);
                      if (formError) setFormError(null);
                    }}
                    required
                  >
                    <option value="" disabled>Giờ</option>
                    {Array.from({length: 11}, (_, i) => i + 6).map(h => {
                      const hs = h.toString().padStart(2, '0');
                      return <option key={hs} value={hs}>{hs}</option>
                    })}
                  </select>
                  <span className="self-center font-bold text-slate-500">:</span>
                  <select 
                    className="flex h-10 w-full rounded-md border bg-white px-3 py-2 text-sm border-slate-300 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary text-slate-900"
                    value={endTime.split(':')[1] || ''}
                    onChange={(e) => {
                      const min = e.target.value;
                      const hour = endTime.split(':')[0] || '12';
                      setEndTime(`${hour}:${min}`);
                      if (formError) setFormError(null);
                    }}
                    required
                  >
                    <option value="" disabled>Phút</option>
                    <option value="00">00</option>
                    <option value="30">30</option>
                  </select>
                </div>
              </div>
              <Button type="submit" isLoading={isSubmitting} className="w-full sm:w-auto mt-2 sm:mt-0">
                {t('common.save', 'Lưu Lịch')}
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      <Card>
        {/* Desktop Table View */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-slate-700 uppercase bg-slate-50 border-b">
              <tr>
                <th className="px-6 py-4 font-medium">{t('common.date')}</th>
                <th className="px-6 py-4 font-medium">{t('common.time')}</th>
                <th className="px-6 py-4 font-medium">{t('common.status')}</th>
                <th className="px-6 py-4 font-medium text-right">{t('common.actions')}</th>
              </tr>
            </thead>
            <tbody>
              {schedules.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-slate-500">
                    {t('schedule.noData', 'Chưa có lịch làm việc nào. Hãy tạo một lịch mới.')}
                  </td>
                </tr>
              ) : (
                schedules.map((schedule) => (
                  <tr key={schedule.id} className="border-b hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4 font-medium text-slate-900">
                      {schedule.workingDate}
                    </td>
                    <td className="px-6 py-4 text-slate-600">
                      {schedule.startTime} - {schedule.endTime}
                    </td>
                    <td className="px-6 py-4">
                      <Badge className="whitespace-nowrap" variant={isScheduleActive(schedule) ? 'success' : 'secondary'}>
                        {isScheduleActive(schedule) ? t('schedule.active', 'Đang hoạt động') : t('schedule.inactive', 'Ngưng hoạt động')}
                      </Badge>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col sm:flex-row justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          leftIcon={<FiEye />}
                          onClick={() => handleViewSlots(schedule)}
                        >
                          {t('common.view')}
                        </Button>
                        <Button
                          variant="danger"
                          size="sm"
                          leftIcon={<FiTrash2 />}
                          onClick={() => handleDelete(schedule)}
                          disabled={deletingScheduleId === schedule.id}
                        >
                          {deletingScheduleId === schedule.id ? t('common.loading', 'Đang xử lý...') : t('common.delete')}
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile Stacked View */}
        <div className="md:hidden flex flex-col divide-y divide-slate-100">
          {schedules.length === 0 ? (
            <div className="p-8 text-center text-slate-500">
              {t('schedule.noData', 'Chưa có lịch làm việc nào. Hãy tạo một lịch mới.')}
            </div>
          ) : (
            schedules.map((schedule) => (
              <div key={schedule.id} className="p-4 space-y-3 hover:bg-slate-50/50 transition-colors">
                <div className="flex justify-between items-center">
                  <div className="font-bold text-slate-900 text-base">{schedule.workingDate}</div>
                  <Badge variant={isScheduleActive(schedule) ? 'success' : 'secondary'}>
                    {isScheduleActive(schedule) ? t('schedule.active', 'Đang hoạt động') : t('schedule.inactive', 'Ngưng hoạt động')}
                  </Badge>
                </div>
                <div className="text-slate-600 text-sm font-medium">
                  {schedule.startTime} - {schedule.endTime}
                </div>
                <div className="flex gap-2 pt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 justify-center"
                    leftIcon={<FiEye />}
                    onClick={() => handleViewSlots(schedule)}
                  >
                    {t('common.view')}
                  </Button>
                  <Button
                    variant="danger"
                    size="sm"
                    className="flex-1 justify-center"
                    leftIcon={<FiTrash2 />}
                    onClick={() => handleDelete(schedule)}
                    disabled={deletingScheduleId === schedule.id}
                  >
                    {deletingScheduleId === schedule.id ? t('common.loading', 'Đang xử lý...') : t('common.delete')}
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      </Card>

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
