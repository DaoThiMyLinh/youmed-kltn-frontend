import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Card, CardContent, Loading, EmptyState, Button } from '../../components';
import { FiClipboard, FiClock, FiUser, FiCalendar, FiArrowRight } from 'react-icons/fi';
import { fetchAppointmentsThunk, selectPatientAppointments, selectPatientLoading } from '../../store/features/patient/patientSlice';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const PatientPrescriptions = () => {
  const dispatch = useDispatch<any>();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const appointments = useSelector(selectPatientAppointments);
  const loading = useSelector(selectPatientLoading);

  const completedAppointments = appointments.filter(apt => apt.status === 'COMPLETED');

  useEffect(() => {
    dispatch(fetchAppointmentsThunk());
  }, [dispatch]);

  if (loading && appointments.length === 0) return <Loading size="lg" className="mt-20" />;

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">{t('menu.prescriptions')}</h1>
      </div>

      {completedAppointments.length === 0 ? (
        <EmptyState 
          icon={<FiClipboard />}
          title={t('common.noData')}
          description={t('history.noPrescriptionHistory')}
        />
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {completedAppointments.map((apt) => (
            <Card key={apt.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                  
                  {/* Left: Date */}
                  <div className="flex items-center gap-6 md:w-1/4">
                    <div className="flex flex-col items-center justify-center p-3 bg-teal-50 rounded-lg border border-teal-100 min-w-[80px]">
                      <span className="text-xs font-bold text-teal-600 uppercase">
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

                  {/* Middle: Info */}
                  <div className="flex-1 border-t md:border-t-0 md:border-l border-slate-200 pt-4 md:pt-0 md:pl-6">
                    <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                      <FiUser className="w-5 h-5 text-teal-500" /> Dr. {apt.doctorName}
                    </h3>
                    <p className="text-teal-600 font-medium text-sm mb-2">{apt.specialization}</p>
                    <p className="text-slate-600 text-sm"><span className="font-medium text-slate-700">{t('history.diagnosisReference')}:</span> {apt.reason}</p>
                  </div>

                  {/* Right: Action */}
                  <div className="flex flex-col items-end border-t md:border-t-0 md:border-l border-slate-200 pt-4 md:pt-0 md:pl-6 gap-4 md:w-1/4 justify-center">
                    <Button 
                      variant="outline" 
                      rightIcon={<FiArrowRight />}
                      onClick={() => navigate(`/appointments/${apt.id}`)}
                    >
                      {t('common.view')}
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

export default PatientPrescriptions;
