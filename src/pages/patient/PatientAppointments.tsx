import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, Badge, Loading, EmptyState, Button } from '../../components';
import { FiCalendar, FiClock, FiUser, FiXCircle, FiInfo } from 'react-icons/fi';
import { fetchAppointmentsThunk, cancelAppointmentThunk, selectPatientAppointments, selectPatientLoading } from '../../store/features/patient/patientSlice';
import { useTranslation } from 'react-i18next';

const PatientAppointments = () => {
  const dispatch = useDispatch<any>();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const appointments = useSelector(selectPatientAppointments);
  const loading = useSelector(selectPatientLoading);

  const activeAppointments = appointments.filter(apt => apt.status !== 'COMPLETED' && apt.status !== 'CANCELLED');

  useEffect(() => {
    dispatch(fetchAppointmentsThunk());
  }, [dispatch]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'CONFIRMED': return 'success';
      case 'PENDING': return 'warning';
      case 'CANCELLED': return 'danger';
      case 'COMPLETED': return 'secondary';
      default: return 'primary';
    }
  };

  const handleCancel = (id: number) => {
    if (window.confirm(t('appointment.confirmCancel'))) {
      dispatch(cancelAppointmentThunk(id));
    }
  };

  if (loading && appointments.length === 0) return <Loading size="lg" className="mt-20" />;

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">{t('menu.appointments')}</h1>
      </div>

      {activeAppointments.length === 0 ? (
        <EmptyState 
          icon={<FiCalendar />}
          title={t('common.noData')}
          description={t('appointment.noActiveAppointments')}
        />
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {activeAppointments.map((apt) => (
            <Card key={apt.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                  
                  {/* Left: Date & Time */}
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
                      <div className="flex items-center gap-2 text-slate-500 text-sm mt-1">
                        <FiCalendar className="w-4 h-4 text-slate-400" /> {new Date(apt.appointmentTime).getFullYear()}
                      </div>
                    </div>
                  </div>

                  {/* Middle: Doctor Info */}
                  <div className="flex-1 border-t md:border-t-0 md:border-l border-slate-200 pt-4 md:pt-0 md:pl-6">
                    <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                      <FiUser className="w-5 h-5 text-primary" /> {apt.doctorName}
                    </h3>
                    <p className="text-primary font-medium text-sm mb-2">{apt.specialization}</p>
                    <p className="text-slate-600 text-sm"><span className="font-medium text-slate-700">{t('appointment.reason')}:</span> {apt.reason}</p>
                  </div>

                  {/* Right: Status & Actions */}
                  <div className="flex flex-col md:items-end justify-between border-t md:border-t-0 md:border-l border-slate-200 pt-4 md:pt-0 md:pl-6 gap-3 md:w-1/4">
                    <Badge variant={getStatusBadge(apt.status) as any} className="px-3 py-1 text-sm uppercase tracking-wide">
                      {t(`status.${apt.status}`)}
                    </Badge>
                    <div className="flex flex-col w-full md:w-auto gap-2 mt-2 md:mt-auto">
                      <Button 
                        size="sm" 
                        variant="outline" 
                        leftIcon={<FiInfo />}
                        onClick={() => navigate(`/appointments/${apt.id}`)}
                      >
                        {t('common.viewDetail')}
                      </Button>
                      {(apt.status === 'PENDING' || apt.status === 'CONFIRMED') && (
                        <Button 
                          size="sm" 
                          variant="danger" 
                          leftIcon={<FiXCircle />}
                          onClick={() => handleCancel(apt.id)}
                        >
                          {t('common.cancel')}
                        </Button>
                      )}
                    </div>
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

export default PatientAppointments;
