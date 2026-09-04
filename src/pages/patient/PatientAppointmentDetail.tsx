import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Card, CardHeader, CardTitle, CardContent, Badge, Loading, EmptyState, Button } from '../../components';
import { FiArrowLeft, FiCalendar, FiUser, FiFileText, FiClipboard } from 'react-icons/fi';
import { selectPatientAppointments } from '../../store/features/patient/patientSlice';
import { consultationService } from '../../services/consultation.service';
import type { MedicalRecord, Prescription } from '../../types/consultation';
import { useTranslation } from 'react-i18next';

const PatientAppointmentDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const appointments = useSelector(selectPatientAppointments);
  const { t } = useTranslation();
  
  const [medicalRecord, setMedicalRecord] = useState<MedicalRecord | null>(null);
  const [prescription, setPrescription] = useState<Prescription | null>(null);
  const [loadingRecord, setLoadingRecord] = useState(true);

  const appointment = appointments.find(a => a.id === Number(id));

  useEffect(() => {
    if (appointment) {
      fetchDetails();
    }
  }, [appointment]);

  const fetchDetails = async () => {
    try {
      setLoadingRecord(true);
      const record = await consultationService.getMedicalRecordByAppointmentId(Number(id));
      setMedicalRecord(record);

      if (record) {
        const script = await consultationService.getPrescriptionByMedicalRecordId(record.id);
        setPrescription(script);
      }
    } catch (error) {
      console.error('Failed to fetch details:', error);
    } finally {
      setLoadingRecord(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'CONFIRMED': return 'success';
      case 'PENDING': return 'warning';
      case 'CANCELLED': return 'danger';
      case 'COMPLETED': return 'secondary';
      default: return 'primary';
    }
  };

  if (!appointment) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <Button variant="ghost" leftIcon={<FiArrowLeft />} onClick={() => navigate('/appointments')}>{t('common.back')}</Button>
        <EmptyState title={t('common.noData')} description="The appointment you are looking for does not exist." />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-10">
      <div className="flex items-center justify-between">
        <Button variant="ghost" leftIcon={<FiArrowLeft />} onClick={() => navigate(-1)}>{t('common.back')}</Button>
        <h1 className="text-2xl font-bold text-slate-900">{t('appointment.detail')}</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Appointment Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><FiCalendar className="text-primary" /> {t('consultation.appointmentInfo')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center pb-3 border-b border-slate-100">
              <span className="text-slate-500">{t('common.status')}</span>
              <Badge variant={getStatusBadge(appointment.status) as any}>{t(`status.${appointment.status}`)}</Badge>
            </div>
            <div className="flex justify-between items-center pb-3 border-b border-slate-100">
              <span className="text-slate-500">{t('common.date')}</span>
              <span className="font-medium text-slate-900">{new Date(appointment.appointmentTime).toLocaleDateString()}</span>
            </div>
            <div className="flex justify-between items-center pb-3 border-b border-slate-100">
              <span className="text-slate-500">{t('common.time')}</span>
              <span className="font-medium text-slate-900">{new Date(appointment.appointmentTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
            </div>
            <div className="pt-2">
              <span className="text-slate-500 block mb-1">{t('consultation.reasonForVisit')}</span>
              <p className="font-medium text-slate-900 bg-slate-50 p-3 rounded-md">{appointment.reason}</p>
            </div>
          </CardContent>
        </Card>

        {/* Doctor Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><FiUser className="text-primary" /> {t('dashboard.doctor')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center pb-3 border-b border-slate-100">
              <span className="text-slate-500">{t('appointment.doctorName')}</span>
              <span className="font-bold text-slate-900">{appointment.doctorName}</span>
            </div>
            <div className="flex justify-between items-center pb-3 border-b border-slate-100">
              <span className="text-slate-500">{t('appointment.specialty')}</span>
              <span className="font-medium text-primary bg-blue-50 px-3 py-1 rounded-full text-sm">{appointment.specialization}</span>
            </div>
            <div className="flex justify-between items-center pb-3 border-b border-slate-100">
              <span className="text-slate-500">{t('appointment.consultationFee')}</span>
              <span className="font-medium text-green-600">{t('appointment.standard')}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Medical Record */}
      <h2 className="text-xl font-bold text-slate-900 mt-8 mb-4 border-b pb-2 flex items-center gap-2">
        <FiFileText className="text-indigo-500" /> {t('consultation.medicalRecord')}
      </h2>
      
      {loadingRecord ? (
        <Loading />
      ) : medicalRecord ? (
        <Card>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <span className="text-sm font-semibold text-slate-500 uppercase tracking-wider block mb-2">{t('consultation.symptoms')}</span>
                <p className="bg-slate-50 p-4 rounded-lg text-slate-800 min-h-[80px] border border-slate-100">{medicalRecord.symptoms || 'N/A'}</p>
              </div>
              <div>
                <span className="text-sm font-semibold text-slate-500 uppercase tracking-wider block mb-2">{t('appointment.diagnosis')}</span>
                <p className="bg-indigo-50 p-4 rounded-lg text-indigo-900 min-h-[80px] border border-indigo-100 font-medium">{medicalRecord.diagnosis}</p>
              </div>
              <div className="md:col-span-2">
                <span className="text-sm font-semibold text-slate-500 uppercase tracking-wider block mb-2">{t('consultation.treatmentNotes')}</span>
                <p className="bg-slate-50 p-4 rounded-lg text-slate-800 min-h-[80px] border border-slate-100">{medicalRecord.notes || 'N/A'}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <EmptyState title={t('consultation.noMedicalRecord')} description={t('consultation.noMedicalRecordDesc')} />
      )}

      {/* Prescription */}
      <h2 className="text-xl font-bold text-slate-900 mt-8 mb-4 border-b pb-2 flex items-center gap-2">
        <FiClipboard className="text-teal-500" /> {t('consultation.prescription')}
      </h2>

      {loadingRecord ? (
        <Loading />
      ) : prescription ? (
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 border-b text-slate-600 uppercase text-xs">
                  <tr>
                    <th className="px-6 py-4 font-semibold">{t('consultation.medicine')}</th>
                    <th className="px-6 py-4 font-semibold">{t('consultation.dosage')}</th>
                    <th className="px-6 py-4 font-semibold">{t('consultation.frequency')}</th>
                    <th className="px-6 py-4 font-semibold">{t('consultation.duration')}</th>
                    <th className="px-6 py-4 font-semibold">{t('consultation.instructions')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {prescription.items.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50/50">
                      <td className="px-6 py-4 font-medium text-slate-900">{item.medicineName}</td>
                      <td className="px-6 py-4 text-slate-600">{item.dosage}</td>
                      <td className="px-6 py-4 text-slate-600">{item.frequency}</td>
                      <td className="px-6 py-4 text-slate-600">{item.duration}</td>
                      <td className="px-6 py-4 text-slate-600">{item.instruction || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="p-4 bg-slate-50 border-t border-slate-100">
              <span className="text-sm font-semibold text-slate-500 block mb-1">{t('consultation.note')}:</span>
              <p className="text-slate-700">{prescription.note || 'No additional notes.'}</p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <EmptyState title={t('consultation.noPrescription')} description={t('consultation.noPrescriptionDesc')} />
      )}

    </div>
  );
};

export default PatientAppointmentDetail;
