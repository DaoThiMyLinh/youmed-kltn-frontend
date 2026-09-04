import { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent, Loading, ErrorMessage, Badge, Button, EmptyState } from '../../components';
import { FiCalendar, FiClock, FiCheckCircle, FiInbox, FiUser, FiFileText } from 'react-icons/fi';
import { scheduleService } from '../../services/schedule.service';
import { consultationService } from '../../services/consultation.service';
import { useTranslation } from 'react-i18next';
import type { DashboardMetrics } from '../../types/schedule';
import type { Appointment } from '../../types/patient';
import type { MedicalRecord } from '../../types/consultation';
import { Link } from 'react-router-dom';

const DoctorDashboard = () => {
  const { t } = useTranslation();
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [upcomingAppointment, setUpcomingAppointment] = useState<Appointment | null>(null);
  const [recentRecord, setRecentRecord] = useState<MedicalRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        setLoading(true);
        const [metricsData, aptData, recordData] = await Promise.all([
          scheduleService.getDoctorMetrics(),
          consultationService.getDoctorAppointments(0, 50, 'appointmentTime', 'ASC'),
          consultationService.getMedicalRecordsHistory(0, 1)
        ]);
        
        setMetrics(metricsData);
        
        const now = new Date().getTime();
        const upcoming = aptData.content.find(a => 
          (a.status === 'PENDING' || a.status === 'CONFIRMED' || a.status === 'CHECKED_IN') && 
          new Date(a.appointmentTime).getTime() >= now
        );
        setUpcomingAppointment(upcoming || null);

        if (recordData.content.length > 0) {
          setRecentRecord(recordData.content[0]);
        }
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to fetch dashboard metrics');
      } finally {
        setLoading(false);
      }
    };

    fetchMetrics();
  }, []);

  if (loading) return <Loading />;
  if (error) return <ErrorMessage message={error} />;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-900">{t('dashboard.doctorDashboard')}</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6 flex items-center space-x-4">
            <div className="p-3 bg-blue-100 rounded-lg">
              <FiCalendar className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">{t('dashboard.workingDays')}</p>
              <h3 className="text-2xl font-bold text-slate-900">{metrics?.workingDays || 0}</h3>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 flex items-center space-x-4">
            <div className="p-3 bg-indigo-100 rounded-lg">
              <FiClock className="w-6 h-6 text-indigo-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">{t('dashboard.todaysSlots')}</p>
              <h3 className="text-2xl font-bold text-slate-900">{metrics?.todaySlots || 0}</h3>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 flex items-center space-x-4">
            <div className="p-3 bg-green-100 rounded-lg">
              <FiCheckCircle className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">{t('dashboard.bookedSlots')}</p>
              <h3 className="text-2xl font-bold text-slate-900">{metrics?.bookedSlots || 0}</h3>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 flex items-center space-x-4">
            <div className="p-3 bg-purple-100 rounded-lg">
              <FiInbox className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">{t('dashboard.availableSlots')}</p>
              <h3 className="text-2xl font-bold text-slate-900">{metrics?.availableSlots || 0}</h3>
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
                    <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                      <FiUser className="text-slate-400" />
                      {upcomingAppointment.patientName}
                    </h3>
                    <Badge variant={upcomingAppointment.status === 'CONFIRMED' ? 'success' : upcomingAppointment.status === 'CHECKED_IN' ? 'primary' : 'warning'}>
                      {t(`status.${upcomingAppointment.status}`)}
                    </Badge>
                  </div>
                  <p className="text-sm text-slate-500 line-clamp-2">{t('appointment.reason')}: {upcomingAppointment.reason}</p>

                  <div className="mt-4 flex gap-3">
                    <Link to="/doctor-appointments">
                      <Button variant="outline" size="sm">{t('appointment.manage')}</Button>
                    </Link>
                  </div>
                </div>
              </div>
            ) : (
              <EmptyState
                icon={<FiCalendar />}
                title={t('dashboard.noAppointments')}
                description={t('dashboard.noAppointmentsDesc')}
                action={<Link to="/doctor-appointments"><Button size="sm">{t('dashboard.viewSchedule')}</Button></Link>}
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
            {recentRecord ? (
              <div className="space-y-6">
                <div className="relative pl-4 border-l-2 border-indigo-200 pb-4">
                  <div className="absolute w-3 h-3 bg-indigo-500 rounded-full -left-[7px] top-1"></div>
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-sm font-semibold text-slate-900">{t('dashboard.medicalRecordAvailable')}</p>
                      <p className="text-xs text-slate-500 mt-1">{t('history.for')}: {recentRecord.patientName || `PT-${recentRecord.patientId}`}</p>
                    </div>
                    <Link to={`/consultation/${recentRecord.appointmentId}`} className="text-xs text-indigo-600 font-medium hover:underline">{t('common.view')}</Link>
                  </div>
                  <p className="text-xs text-slate-400 mt-2">{recentRecord.createdAt ? new Date(recentRecord.createdAt).toLocaleDateString() : 'N/A'}</p>
                </div>
                
                <div className="relative pl-4 border-l-2 border-teal-200 pb-2">
                  <div className="absolute w-3 h-3 bg-teal-500 rounded-full -left-[7px] top-1"></div>
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-sm font-semibold text-slate-900">{t('dashboard.prescriptionIssued')}</p>
                      <p className="text-xs text-slate-500 mt-1">{t('appointment.diagnosis')}: {recentRecord.diagnosis}</p>
                    </div>
                    <Link to={`/consultation/${recentRecord.appointmentId}`} className="text-xs text-teal-600 font-medium hover:underline">{t('common.view')}</Link>
                  </div>
                  <p className="text-xs text-slate-400 mt-2">{recentRecord.createdAt ? new Date(recentRecord.createdAt).toLocaleDateString() : 'N/A'}</p>
                </div>
              </div>
            ) : (
              <EmptyState 
                icon={<FiFileText />} 
                title={t('common.noData')} 
                description={t('dashboard.noConsultationsDesc')} 
              />
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DoctorDashboard;
