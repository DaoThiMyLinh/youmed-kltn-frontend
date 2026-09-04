import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Card, CardContent, Badge, Loading, EmptyState } from '../../components';
import { FiClock, FiFileText, FiUser, FiCalendar } from 'react-icons/fi';
import { fetchAppointmentsThunk, selectPatientAppointments, selectPatientLoading } from '../../store/features/patient/patientSlice';
import { useTranslation } from 'react-i18next';
// If you want the patient to see their prescription, we would navigate to a patient consultation view.
// Since we don't have one right now, we just list the completed appointments.

const PatientHistory = () => {
  const dispatch = useDispatch<any>();
  const { t } = useTranslation();
  const appointments = useSelector(selectPatientAppointments);
  const loading = useSelector(selectPatientLoading);

  const historyAppointments = appointments.filter(apt => apt.status === 'COMPLETED' || apt.status === 'CANCELLED');

  useEffect(() => {
    dispatch(fetchAppointmentsThunk());
  }, [dispatch]);

  if (loading && appointments.length === 0) return <Loading size="lg" className="mt-20" />;

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">{t('menu.medicalHistory')}</h1>
      </div>

      {historyAppointments.length === 0 ? (
        <EmptyState 
          icon={<FiFileText />}
          title={t('common.noData')}
          description={t('history.noHistory')}
        />
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {historyAppointments.map((apt) => (
            <Card key={apt.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                  
                  {/* Left: Date */}
                  <div className="flex items-center gap-6 md:w-1/4">
                    <div className="flex flex-col items-center justify-center p-3 bg-slate-50 rounded-lg border border-slate-200 min-w-[80px]">
                      <span className="text-xs font-bold text-slate-500 uppercase">
                        {new Date(apt.appointmentTime).toLocaleString('default', { month: 'short' })}
                      </span>
                      <span className="text-2xl font-black text-slate-700">
                        {new Date(apt.appointmentTime).getDate()}
                      </span>
                    </div>
                    <div>
                      <div className="flex items-center gap-2 text-slate-600 font-medium">
                        <FiClock className="w-4 h-4 text-slate-400" /> {new Date(apt.appointmentTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                      </div>
                      <div className="flex items-center gap-2 text-slate-400 text-sm mt-1">
                        <FiCalendar className="w-4 h-4 text-slate-300" /> {new Date(apt.appointmentTime).getFullYear()}
                      </div>
                    </div>
                  </div>

                  {/* Middle: Info */}
                  <div className="flex-1 border-t md:border-t-0 md:border-l border-slate-200 pt-4 md:pt-0 md:pl-6">
                    <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                      <FiUser className="w-5 h-5 text-slate-400" /> {apt.doctorName}
                    </h3>
                    <p className="text-slate-500 font-medium text-sm mb-2">{apt.specialization}</p>
                    <p className="text-slate-600 text-sm"><span className="font-medium text-slate-700">{t('appointment.reason')}:</span> {apt.reason}</p>
                  </div>

                  {/* Right: Action */}
                  <div className="flex flex-col items-end border-t md:border-t-0 md:border-l border-slate-200 pt-4 md:pt-0 md:pl-6 gap-4 md:w-1/4 justify-center">
                    <Badge variant={apt.status === 'CANCELLED' ? 'danger' : 'secondary'} className="px-3 py-1 text-sm uppercase tracking-wide mb-2">
                      {t(`status.${apt.status}`)}
                    </Badge>
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

export default PatientHistory;
