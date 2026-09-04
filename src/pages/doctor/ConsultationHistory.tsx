import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, Button, Loading, EmptyState, Badge } from '../../components';
import { FiFileText, FiSearch, FiClock, FiCalendar, FiUser } from 'react-icons/fi';
import { consultationService } from '../../services/consultation.service';
import { useTranslation } from 'react-i18next';

interface HistoryItem {
  id: string | number;
  type: 'COMPLETED' | 'CANCELLED';
  date: string;
  patientName: string;
  patientId: number;
  diagnosisOrReason: string;
  appointmentId: number;
}

const ConsultationHistory = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [records, setRecords] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchHistory = async () => {
    try {
      setLoading(true);
      const [medicalRecordsRes, appointmentsRes] = await Promise.all([
        consultationService.getMedicalRecordsHistory(0, 50),
        consultationService.getDoctorAppointments(0, 50, 'appointmentTime', 'DESC')
      ]);

      const completedRecords: HistoryItem[] = medicalRecordsRes.content.map(mr => ({
        id: mr.id,
        type: 'COMPLETED',
        date: mr.createdAt || new Date().toISOString(),
        patientName: mr.patientName || `PT-${mr.patientId}`,
        patientId: mr.patientId,
        diagnosisOrReason: `${t('appointment.diagnosis')}: ${mr.diagnosis}`,
        appointmentId: mr.appointmentId
      }));

      const cancelledAppointments: HistoryItem[] = appointmentsRes.content
        .filter(apt => apt.status === 'CANCELLED')
        .map(apt => ({
          id: `cancel-${apt.id}`,
          type: 'CANCELLED',
          date: apt.appointmentTime,
          patientName: apt.patientName || `PT-${apt.patientId}`,
          patientId: apt.patientId,
          diagnosisOrReason: `${t('appointment.reason')}: ${apt.reason}`,
          appointmentId: apt.id
        }));

      const combined = [...completedRecords, ...cancelledAppointments].sort((a, b) => 
        new Date(b.date).getTime() - new Date(a.date).getTime()
      );

      setRecords(combined);
    } catch (error) {
      console.error('Failed to fetch history', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  if (loading && records.length === 0) {
    return <Loading size="lg" className="mt-20" />;
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">{t('history.consultationHistory')}</h1>
      </div>

      {records.length === 0 ? (
        <EmptyState 
          icon={<FiFileText />}
          title={t('common.noData')}
          description="There are no completed consultations yet."
        />
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {records.map((record) => (
            <Card key={record.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                  
                  {/* Left: Date */}
                  <div className="flex items-center gap-6 md:w-1/4">
                    <div className="flex flex-col items-center justify-center p-3 bg-slate-50 rounded-lg border border-slate-200 min-w-[80px]">
                      <span className="text-xs font-bold text-slate-500 uppercase">
                      {record.date ? new Date(record.date).toLocaleString('default', { month: 'short' }) : 'N/A'}
                    </span>
                    <span className="text-2xl font-black text-slate-700">
                      {record.date ? new Date(record.date).getDate() : '-'}
                    </span>
                  </div>
                  <div>
                    <div className="flex items-center gap-2 text-slate-600 font-medium">
                      <FiClock className="w-4 h-4 text-slate-400" /> 
                      {record.date ? new Date(record.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : 'N/A'}
                    </div>
                    <div className="flex items-center gap-2 text-slate-400 text-sm mt-1">
                      <FiCalendar className="w-4 h-4 text-slate-300" /> 
                      {record.date ? new Date(record.date).getFullYear() : 'N/A'}
                    </div>
                  </div>
                </div>

                {/* Middle: Patient Info */}
                <div className="flex-1 border-t md:border-t-0 md:border-l border-slate-200 pt-4 md:pt-0 md:pl-6">
                  <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                    <FiUser className="w-5 h-5 text-slate-400" /> {record.patientName}
                  </h3>
                  <p className="text-slate-600 text-sm mt-2 line-clamp-2">
                    <span className="font-medium text-slate-700">{record.diagnosisOrReason.split(': ')[0]}:</span> {record.diagnosisOrReason.split(': ')[1]}
                  </p>
                  </div>

                  {/* Right: Actions */}
                  <div className="flex flex-col items-end border-t md:border-t-0 md:border-l border-slate-200 pt-4 md:pt-0 md:pl-6 gap-4 md:w-1/4 justify-center">
                    <Badge variant={record.type === 'CANCELLED' ? 'danger' : 'secondary'} className="px-3 py-1 text-sm uppercase tracking-wide mb-2">
                      {t(`status.${record.type}`)}
                    </Badge>
                    {record.type === 'COMPLETED' && (
                      <Button 
                        variant="outline" 
                        size="sm" 
                        leftIcon={<FiSearch />}
                        onClick={() => navigate(`/consultation/${record.appointmentId}`)}
                      >
                        {t('common.viewDetail')}
                      </Button>
                    )}
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

export default ConsultationHistory;
