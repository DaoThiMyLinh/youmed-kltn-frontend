import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Card, CardHeader, CardTitle, CardContent, Badge, Button, Loading, EmptyState } from '../../components';
import { FiCalendar, FiClock, FiActivity, FiFileText } from 'react-icons/fi';
import { fetchProfileThunk, fetchAppointmentsThunk, cancelAppointmentThunk, selectPatientProfile, selectPatientAppointments, selectPatientLoading } from '../../store/features/patient/patientSlice';
import { selectUserName } from '../../store/features/auth/authSlice';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const PatientDashboard = () => {
  const dispatch = useDispatch<any>();
  const name = useSelector(selectUserName);
  const profile = useSelector(selectPatientProfile);
  const appointments = useSelector(selectPatientAppointments);
  const loading = useSelector(selectPatientLoading);
  const { t } = useTranslation();
  const navigate = useNavigate();

  const handleCancelAppointment = (id: number) => {
    if (window.confirm(t('common.confirmCancel') || 'Bạn có chắc chắn muốn hủy cuộc hẹn này không?')) {
      dispatch(cancelAppointmentThunk(id));
    }
  };

  useEffect(() => {
    dispatch(fetchProfileThunk());
    dispatch(fetchAppointmentsThunk());
  }, [dispatch]);

  const upcomingAppointment = appointments.find(a => a.status === 'CONFIRMED' || a.status === 'PENDING');
  const recentCompleted = appointments.find(a => a.status === 'COMPLETED');

  if (loading && !profile) {
    return <Loading size="lg" className="h-full mt-20" />;
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Welcome Section */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">{t('dashboard.welcomeBack')}, {name || profile?.fullName}!</h1>
          <p className="text-slate-500 mt-1">{t('dashboard.healthOverview')}</p>
        </div>
        <Link to="/booking">
          <Button leftIcon={<FiCalendar />}>{t('menu.bookAppointment')}</Button>
        </Link>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-blue-50 to-white">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center">
                <FiCalendar className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-500">{t('dashboard.upcoming')}</p>
                <p className="text-2xl font-bold text-slate-900">{appointments.filter(a => a.status === 'CONFIRMED').length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-emerald-50 to-white">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center">
                <FiClock className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-500">{t('dashboard.completed')}</p>
                <p className="text-2xl font-bold text-slate-900">{appointments.filter(a => a.status === 'COMPLETED').length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-white">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center">
                <FiFileText className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-500">{t('dashboard.records')}</p>
                <p className="text-2xl font-bold text-slate-900">4</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-amber-50 to-white">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center">
                <FiActivity className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-500">{t('dashboard.healthStatus')}</p>
                <p className="text-xl font-bold text-slate-900 mt-1">{t('dashboard.good')}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Upcoming Appointment Section */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>{t('dashboard.nextAppointment')}</CardTitle>
          </CardHeader>
          <CardContent>
            {upcomingAppointment ? (
              <div className="flex flex-col md:flex-row gap-6 p-4 rounded-lg border border-slate-200 bg-slate-50">
                <div className="flex-shrink-0 flex flex-col items-center justify-center p-4 bg-white rounded-md border border-slate-100 w-32 shadow-sm">
                  <span className="text-sm font-bold text-primary uppercase">{new Date(upcomingAppointment.appointmentTime).toLocaleString('default', { month: 'short' })}</span>
                  <span className="text-3xl font-black text-slate-900">{new Date(upcomingAppointment.appointmentTime).getDate()}</span>
                  <span className="text-xs text-slate-500">{new Date(upcomingAppointment.appointmentTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
                <div className="flex-1 flex flex-col justify-center">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="text-lg font-bold text-slate-900">{upcomingAppointment.doctorName}</h3>
                    <Badge variant={upcomingAppointment.status === 'CONFIRMED' ? 'success' : 'warning'}>
                      {t(`status.${upcomingAppointment.status}`)}
                    </Badge>
                  </div>
                  <p className="text-slate-600 font-medium mb-1">{upcomingAppointment.specialization}</p>
                  <p className="text-sm text-slate-500 line-clamp-2">{t('appointment.reason')}: {upcomingAppointment.reason}</p>

                  <div className="mt-4 flex gap-3">
                    <Button variant="outline" size="sm" onClick={() => navigate(`/booking?reschedule=${upcomingAppointment.id}`)}>{t('appointment.reschedule')}</Button>
                    <Button variant="danger" size="sm" onClick={() => handleCancelAppointment(upcomingAppointment.id)}>{t('appointment.cancel')}</Button>
                  </div>
                </div>
              </div>
            ) : (
              <EmptyState
                icon={<FiCalendar />}
                title={t('dashboard.noAppointments')}
                description={t('dashboard.noAppointmentsDesc')}
                action={<Link to="/booking"><Button size="sm">{t('dashboard.bookNow')}</Button></Link>}
              />
            )}
          </CardContent>
        </Card>

        {/* Recent Records & Prescriptions */}
        <Card>
          <CardHeader>
            <CardTitle>{t('dashboard.recentDocuments')}</CardTitle>
          </CardHeader>
          <CardContent>
            {recentCompleted ? (
              <div className="space-y-6">
                <div className="relative pl-4 border-l-2 border-indigo-200 pb-4">
                  <div className="absolute w-3 h-3 bg-indigo-500 rounded-full -left-[7px] top-1"></div>
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-sm font-semibold text-slate-900">{t('dashboard.medicalRecordAvailable')}</p>
                      <p className="text-xs text-slate-500 mt-1">{t('dashboard.fromDr')} {recentCompleted.doctorName}</p>
                    </div>
                    <Link to={`/appointments/${recentCompleted.id}`} className="text-xs text-indigo-600 font-medium hover:underline">{t('common.view')}</Link>
                  </div>
                  <p className="text-xs text-slate-400 mt-2">{new Date(recentCompleted.appointmentTime).toLocaleDateString()}</p>
                </div>
                
                <div className="relative pl-4 border-l-2 border-teal-200 pb-2">
                  <div className="absolute w-3 h-3 bg-teal-500 rounded-full -left-[7px] top-1"></div>
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-sm font-semibold text-slate-900">{t('dashboard.prescriptionIssued')}</p>
                      <p className="text-xs text-slate-500 mt-1">{t('history.for')}: {recentCompleted.reason}</p>
                    </div>
                    <Link to={`/appointments/${recentCompleted.id}`} className="text-xs text-teal-600 font-medium hover:underline">{t('common.view')}</Link>
                  </div>
                  <p className="text-xs text-slate-400 mt-2">{new Date(recentCompleted.appointmentTime).toLocaleDateString()}</p>
                </div>
              </div>
            ) : (
              <EmptyState 
                icon={<FiFileText />} 
                title={t('dashboard.noRecentDocuments')} 
                description={t('dashboard.noRecentDocumentsDesc')} 
              />
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PatientDashboard;
