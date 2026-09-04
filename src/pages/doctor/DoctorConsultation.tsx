import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent, Button, Badge, Loading, Input, Toast } from '../../components';
import { FiUser, FiClock, FiFileText, FiCheck, FiArrowLeft, FiPlus, FiTrash2 } from 'react-icons/fi';
import { consultationService } from '../../services/consultation.service';
import type { Appointment } from '../../types/patient';
import type { MedicalRecord, Prescription, PrescriptionItem } from '../../types/consultation';
import { useTranslation } from 'react-i18next';

const DoctorConsultation = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const [appointment, setAppointment] = useState<Appointment | null>(null);
  const [medicalRecord, setMedicalRecord] = useState<MedicalRecord | null>(null);
  const [prescription, setPrescription] = useState<Prescription | null>(null);
  
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<{ message: string, type: 'success'|'error' } | null>(null);

  // Medical Record Form state
  const [diagnosis, setDiagnosis] = useState('');
  const [symptoms, setSymptoms] = useState('');
  const [notes, setNotes] = useState('');
  const [savingRecord, setSavingRecord] = useState(false);

  // Prescription Form state
  const [showPrescriptionForm, setShowPrescriptionForm] = useState(false);
  const [prescriptionNote, setPrescriptionNote] = useState('');
  const [items, setItems] = useState<PrescriptionItem[]>([{
    medicineName: '', dosage: '', frequency: '', duration: '', instruction: ''
  }]);
  const [savingPrescription, setSavingPrescription] = useState(false);

  const fetchDetails = async () => {
    if (!id) return;
    try {
      setLoading(true);
      // Fetch appointment detail by ID
      // Since backend has no GET /appointments/{id}, we will use GET /appointments/doctor/my and find it
      // In a real app, there should be an endpoint for fetching a single appointment
      const appointmentsResponse = await consultationService.getDoctorAppointments(0, 100);
      const apt = appointmentsResponse.content.find(a => a.id === Number(id));
      
      if (!apt) throw new Error('Appointment not found');
      setAppointment(apt);

      // Fetch existing medical record
      const record = await consultationService.getMedicalRecordByAppointmentId(Number(id));
      setMedicalRecord(record);

      if (record) {
        setDiagnosis(record.diagnosis || '');
        setSymptoms(record.symptoms || '');
        setNotes(record.notes || '');

        // Fetch prescription if medical record exists
        const pres = await consultationService.getPrescriptionByMedicalRecordId(record.id);
        setPrescription(pres);
      }
    } catch (error) {
      console.error(error);
      setToast({ message: 'Failed to load consultation details', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetails();
  }, [id]);

  const handleStatusChange = async (newStatus: string) => {
    if (!appointment) return;
    try {
      await consultationService.updateAppointmentStatus(appointment.id, newStatus);
      setAppointment({ ...appointment, status: newStatus as any });
      setToast({ message: `Status updated to ${newStatus}`, type: 'success' });
    } catch (error: any) {
      setToast({ message: error.response?.data?.message || 'Failed to update status', type: 'error' });
    }
  };

  const saveMedicalRecord = async () => {
    if (!appointment) return;
    if (!diagnosis) {
      setToast({ message: 'Diagnosis is required', type: 'error' });
      return;
    }
    
    try {
      setSavingRecord(true);
      if (medicalRecord) {
        // Update existing
        const updated = await consultationService.updateMedicalRecord(medicalRecord.id, {
          diagnosis, symptoms, notes
        });
        setMedicalRecord(updated);
        setToast({ message: t('consultation.recordSaved'), type: 'success' });
      } else {
        // Create new
        const created = await consultationService.createMedicalRecord({
          appointmentId: appointment.id,
          diagnosis, symptoms, notes
        });
        setMedicalRecord(created);
        setToast({ message: t('consultation.recordSaved'), type: 'success' });
      }
    } catch (error) {
      setToast({ message: 'Failed to save medical record', type: 'error' });
    } finally {
      setSavingRecord(false);
    }
  };

  const handleAddMedicine = () => {
    setItems([...items, { medicineName: '', dosage: '', frequency: '', duration: '', instruction: '' }]);
  };

  const handleRemoveMedicine = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const handleItemChange = (index: number, field: keyof PrescriptionItem, value: string) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };
    setItems(newItems);
  };

  const savePrescription = async () => {
    if (!medicalRecord) return;
    // Validate items
    const isValid = items.every(i => i.medicineName && i.dosage && i.frequency && i.duration);
    if (!isValid) {
      setToast({ message: 'Please fill all required fields in the prescription items', type: 'error' });
      return;
    }

    try {
      setSavingPrescription(true);
      const created = await consultationService.createPrescription({
        medicalRecordId: medicalRecord.id,
        note: prescriptionNote,
        items
      });
      setPrescription(created);
      setShowPrescriptionForm(false);
      setToast({ message: t('consultation.prescriptionSaved'), type: 'success' });
    } catch (error) {
      setToast({ message: 'Failed to create prescription', type: 'error' });
    } finally {
      setSavingPrescription(false);
    }
  };

  if (loading) return <Loading size="lg" className="mt-20" />;
  if (!appointment) return <div className="text-center p-10 text-slate-500">{t('common.noData')}</div>;

  const isInProgress = appointment.status === 'IN_PROGRESS';

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-20">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => navigate('/doctor-appointments')} leftIcon={<FiArrowLeft />}>
            {t('common.back')}
          </Button>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">{t('consultation.title')}</h1>
        </div>
        <div className="flex items-center gap-2">
          {appointment.status === 'PENDING' || appointment.status === 'CONFIRMED' ? (
            <Button onClick={() => handleStatusChange('CHECKED_IN')}>Check-In</Button>
          ) : appointment.status === 'CHECKED_IN' ? (
            <Button onClick={() => handleStatusChange('IN_PROGRESS')}>Start</Button>
          ) : appointment.status === 'IN_PROGRESS' ? (
            <Button variant="primary" onClick={() => handleStatusChange('COMPLETED')} leftIcon={<FiCheck />}>
              {t('consultation.completeConsultation')}
            </Button>
          ) : null}
          <Badge variant={
            appointment.status === 'COMPLETED' ? 'secondary' : 
            appointment.status === 'IN_PROGRESS' ? 'success' : 
            appointment.status === 'CHECKED_IN' ? 'warning' : 'primary'
          } className="ml-2 px-3 py-1.5 text-sm uppercase">
            {t(`status.${appointment.status}`)}
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Column: Patient Info */}
        <div className="space-y-6 md:col-span-1">
          <Card>
            <CardHeader className="bg-slate-50 border-b">
              <CardTitle className="text-lg flex items-center gap-2">
                <FiUser className="text-primary" /> {t('consultation.patientInformation')}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-4">
              <div>
                <p className="text-sm text-slate-500 font-medium">{t('consultation.fullName')}</p>
                <p className="text-slate-900 font-semibold">{appointment.patientName}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-slate-500 font-medium">{t('consultation.patientId')}</p>
                  <p className="text-slate-900">PT-{appointment.patientId}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="bg-slate-50 border-b">
              <CardTitle className="text-lg flex items-center gap-2">
                <FiClock className="text-primary" /> {t('consultation.appointmentInfo')}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-4">
              <div>
                <p className="text-sm text-slate-500 font-medium">{t('consultation.dateTime')}</p>
                <p className="text-slate-900">
                  {new Date(appointment.appointmentTime).toLocaleString()}
                </p>
              </div>
              <div>
                <p className="text-sm text-slate-500 font-medium">{t('consultation.reasonForVisit')}</p>
                <p className="text-slate-900">{appointment.reason}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Workflow */}
        <div className="md:col-span-2 space-y-6">
          
          {/* Medical Record Form */}
          <Card className={isInProgress ? 'border-primary shadow-sm' : ''}>
            <CardHeader className="bg-slate-50 border-b">
              <CardTitle className="text-lg flex items-center gap-2">
                <FiFileText className="text-primary" /> {t('consultation.medicalRecord')}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              {!isInProgress && !medicalRecord ? (
                <div className="text-center py-6 text-slate-500">
                  <FiFileText className="w-10 h-10 mx-auto text-slate-300 mb-2" />
                  <p>{t('common.noData')}</p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">{t('consultation.symptoms')}</label>
                    <textarea 
                      className="w-full rounded-md border border-slate-300 p-2 text-sm focus:ring-primary focus:border-primary disabled:bg-slate-50"
                      rows={3}
                      value={symptoms}
                      onChange={e => setSymptoms(e.target.value)}
                      disabled={!isInProgress}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">{t('appointment.diagnosis')} <span className="text-red-500">*</span></label>
                    <textarea 
                      className="w-full rounded-md border border-slate-300 p-2 text-sm focus:ring-primary focus:border-primary disabled:bg-slate-50"
                      rows={3}
                      value={diagnosis}
                      onChange={e => setDiagnosis(e.target.value)}
                      disabled={!isInProgress}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">{t('consultation.treatmentNotes')}</label>
                    <textarea 
                      className="w-full rounded-md border border-slate-300 p-2 text-sm focus:ring-primary focus:border-primary disabled:bg-slate-50"
                      rows={3}
                      value={notes}
                      onChange={e => setNotes(e.target.value)}
                      disabled={!isInProgress}
                    />
                  </div>
                  {isInProgress && (
                    <div className="flex justify-end">
                      <Button onClick={saveMedicalRecord} isLoading={savingRecord}>
                        {medicalRecord ? t('consultation.updateRecord') : t('common.save')}
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Prescription Section */}
          {medicalRecord && (
            <Card>
              <CardHeader className="bg-slate-50 border-b flex flex-row items-center justify-between">
                <CardTitle className="text-lg flex items-center gap-2">
                  <FiPlus className="text-primary" /> {t('consultation.prescription')}
                </CardTitle>
                {isInProgress && !prescription && !showPrescriptionForm && (
                  <Button size="sm" onClick={() => setShowPrescriptionForm(true)}>{t('consultation.addMedicine')}</Button>
                )}
              </CardHeader>
              <CardContent className="p-6">
                {prescription ? (
                  <div className="space-y-4">
                    <p className="text-sm text-slate-600"><span className="font-semibold">{t('consultation.note')}:</span> {prescription.note || 'N/A'}</p>
                    <div className="border rounded-md overflow-hidden">
                      <table className="w-full text-sm text-left">
                        <thead className="bg-slate-50 border-b">
                          <tr>
                            <th className="px-4 py-2 font-medium">{t('consultation.medicine')}</th>
                            <th className="px-4 py-2 font-medium">{t('consultation.dosage')}</th>
                            <th className="px-4 py-2 font-medium">{t('consultation.frequency')}</th>
                            <th className="px-4 py-2 font-medium">{t('consultation.duration')}</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y">
                          {prescription.items.map((item, idx) => (
                            <tr key={idx}>
                              <td className="px-4 py-2 font-medium">{item.medicineName}</td>
                              <td className="px-4 py-2 text-slate-600">{item.dosage}</td>
                              <td className="px-4 py-2 text-slate-600">{item.frequency}</td>
                              <td className="px-4 py-2 text-slate-600">{item.duration}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ) : showPrescriptionForm ? (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">{t('consultation.note')}</label>
                      <Input value={prescriptionNote} onChange={e => setPrescriptionNote(e.target.value)} />
                    </div>
                    
                    <div className="space-y-3">
                      <label className="block text-sm font-medium text-slate-700">{t('consultation.medicine')}</label>
                      {items.map((item, index) => (
                        <div key={index} className="flex gap-2 items-start border p-3 rounded-md bg-slate-50">
                          <div className="flex-1 grid grid-cols-2 gap-2">
                            <Input placeholder={`${t('consultation.medicine')} *`} value={item.medicineName} onChange={e => handleItemChange(index, 'medicineName', e.target.value)} />
                            <Input placeholder={`${t('consultation.dosage')} *`} value={item.dosage} onChange={e => handleItemChange(index, 'dosage', e.target.value)} />
                            <Input placeholder={`${t('consultation.frequency')} *`} value={item.frequency} onChange={e => handleItemChange(index, 'frequency', e.target.value)} />
                            <Input placeholder={`${t('consultation.duration')} *`} value={item.duration} onChange={e => handleItemChange(index, 'duration', e.target.value)} />
                            <Input className="col-span-2" placeholder={t('consultation.instructionOptional')} value={item.instruction} onChange={e => handleItemChange(index, 'instruction', e.target.value)} />
                          </div>
                          <button onClick={() => handleRemoveMedicine(index)} className="p-2 text-red-500 hover:bg-red-50 rounded-md">
                            <FiTrash2 />
                          </button>
                        </div>
                      ))}
                      <Button type="button" variant="outline" size="sm" onClick={handleAddMedicine} leftIcon={<FiPlus />}>
                        {t('consultation.addMedicine')}
                      </Button>
                    </div>

                    <div className="flex justify-end gap-2 pt-4">
                      <Button variant="ghost" onClick={() => setShowPrescriptionForm(false)}>{t('common.cancel')}</Button>
                      <Button onClick={savePrescription} isLoading={savingPrescription}>{t('consultation.savePrescription')}</Button>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-6 text-slate-500">
                    {t('common.noData')}
                  </div>
                )}
              </CardContent>
            </Card>
          )}

        </div>
      </div>

      {toast && (
        <div className="fixed bottom-4 right-4 z-50">
          <Toast 
            type={toast.type} 
            title={toast.type === 'success' ? 'Success' : 'Error'} 
            message={toast.message} 
            onClose={() => setToast(null)} 
          />
        </div>
      )}
    </div>
  );
};

export default DoctorConsultation;
