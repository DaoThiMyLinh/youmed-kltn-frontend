import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, Badge, Button, Loading, EmptyState } from '../../components';
import { FiClock, FiUser, FiCalendar, FiArrowRight } from 'react-icons/fi';
import { consultationService } from '../../services/consultation.service';
import type { Appointment } from '../../types/patient';
import { useTranslation } from 'react-i18next';

const DoctorAppointments = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { t } = useTranslation();

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      // Fetch upcoming appointments (sorting by time ASC so the nearest is first)
      const data = await consultationService.getDoctorAppointments(0, 50, 'appointmentTime', 'ASC');
      setAppointments(data.content.filter(apt => apt.status !== 'COMPLETED' && apt.status !== 'CANCELLED'));
    } catch (error) {
      console.error('Failed to fetch appointments', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'CONFIRMED': return 'primary';
      case 'CHECKED_IN': return 'warning';
      case 'IN_PROGRESS': return 'success';
      case 'COMPLETED': return 'secondary';
      case 'CANCELLED': return 'danger';
      default: return 'secondary';
    }
  };

  if (loading && appointments.length === 0) {
    return <Loading size="lg" className="mt-20" />;
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">{t('menu.appointments')}</h1>
        <Button variant="outline" onClick={fetchAppointments}>{t('common.refresh')}</Button>
      </div>

      {appointments.length === 0 ? (
        <EmptyState 
          icon={<FiCalendar />}
          title={t('common.noData')}
          description={t('appointment.noActiveAppointments')}
        />
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {appointments.map((apt) => (
            <Card key={apt.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                  
                  {/* Left: Time */}
                  <div className="flex items-center gap-6 md:w-1/4">
                    <div className="flex flex-col items-center justify-center p-3 bg-blue-50 rounded-lg border border-blue-100 min-w-[80px]">
                      <span className="text-xs font-bold text-blue-600 uppercase">
                        {new Date(apt.appointmentTime).toLocaleString('default', { month: 'short' })}
                      </span>
                      <span className="text-2xl font-black text-slate-900">
                        {new Date(apt.appointmentTime).getDate()}
                      </span>
                    </div>
                    <div>
                      <div className="flex items-center gap-2 text-slate-700 font-medium">
                        <FiClock className="w-4 h-4 text-slate-400" /> {new Date(apt.appointmentTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                      </div>
                    </div>
                  </div>

                  {/* Middle: Patient Info */}
                  <div className="flex-1 border-t md:border-t-0 md:border-l border-slate-200 pt-4 md:pt-0 md:pl-6 flex items-start gap-4">
                    <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 flex-shrink-0">
                      <FiUser className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-slate-900">{apt.patientName}</h3>
                      <p className="text-slate-500 text-sm mb-1">{apt.specialization}</p>
                      <p className="text-slate-700 text-sm"><span className="font-medium">{t('appointment.reason')}:</span> {apt.reason}</p>
                    </div>
                  </div>

                  {/* Right: Status & Action */}
                  <div className="flex flex-col items-end border-t md:border-t-0 md:border-l border-slate-200 pt-4 md:pt-0 md:pl-6 gap-4 md:w-1/4 justify-between h-full">
                    <Badge variant={getStatusBadge(apt.status) as any} className="px-3 py-1 text-xs uppercase tracking-wide">
                      {t(`status.${apt.status}`)}
                    </Badge>
                    <Button 
                      rightIcon={<FiArrowRight />} 
                      onClick={() => navigate(`/consultation/${apt.id}`)}
                    >
                      {t('common.viewDetail')}
                    </Button>
                  </div>

                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default DoctorAppointments;
