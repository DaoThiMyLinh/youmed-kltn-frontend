import { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { Button, Input, Toast } from '../../components';
import { FiUser, FiClock, FiFileText, FiCheck, FiArrowLeft, FiPlus, FiTrash2, FiActivity, FiEdit3 } from 'react-icons/fi';
import { consultationService } from '../../services/consultation.service';
import type { Appointment } from '../../types/patient';
import type { MedicalRecord, Prescription, PrescriptionItem } from '../../types/consultation';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';

const DoctorConsultation = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();

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
  const [isStatusUpdating, setIsStatusUpdating] = useState(false);

  const location = useLocation();
  const stateAppointment = location.state?.appointment as Appointment | undefined;

  const fetchDetails = async () => {
    if (!id) return;
    try {
      setLoading(true);
      
      if (stateAppointment) {
        setAppointment(stateAppointment);
      } else {
        throw new Error('Không thể tải chi tiết do mất dữ liệu điều hướng (thường xảy ra khi F5 hoặc mở tab mới). Backend hiện không hỗ trợ API lấy chi tiết.');
      }

      try {
        const record = await consultationService.getMedicalRecordByAppointmentId(Number(id));
        setMedicalRecord(record);

        if (record) {
          setDiagnosis(record.diagnosis || '');
          setSymptoms(record.symptoms || '');
          setNotes(record.notes || '');

          try {
            const pres = await consultationService.getPrescriptionByMedicalRecordId(record.id);
            setPrescription(pres);
          } catch (e) {
            console.log("No prescription found or error fetching it.");
          }
        }
      } catch (err) {
        console.log("No medical record found or error fetching it.");
      }
    } catch (error: any) {
      console.error(error);
      if (error.message.includes('Không thể tải chi tiết')) {
        setToast({ message: error.message, type: 'error' });
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetails();
  }, [id]);

  const handleStatusChange = async (newStatus: string) => {
    if (!appointment || isStatusUpdating) return;
    try {
      setIsStatusUpdating(true);
      await consultationService.updateAppointmentStatus(appointment.id, newStatus);
      setAppointment({ ...appointment, status: newStatus as any });
      setToast({ message: `Status updated to ${newStatus}`, type: 'success' });
    } catch (error: any) {
      setToast({ message: error.response?.data?.message || 'Failed to update status', type: 'error' });
    } finally {
      setIsStatusUpdating(false);
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
        const updated = await consultationService.updateMedicalRecord(medicalRecord.id, {
          diagnosis, symptoms, notes
        });
        setMedicalRecord(updated);
        setToast({ message: t('consultation.recordSaved'), type: 'success' });
      } else {
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

  if (loading) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-emerald-500 border-t-transparent"></div>
      </div>
    );
  }
  if (!appointment) return (
    <div className="flex flex-col items-center justify-center h-[60vh] text-center">
      <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mb-4"><FiFileText className="w-8 h-8 text-slate-400" /></div>
      <h2 className="text-xl font-bold text-slate-800 mb-2">Không tìm thấy thông tin</h2>
      <p className="text-slate-500 mb-6 max-w-md">Vui lòng quay lại danh sách lịch hẹn và chọn lại bệnh nhân.</p>
      <Button onClick={() => navigate('/doctor/appointments')} leftIcon={<FiArrowLeft />}>Quay lại danh sách</Button>
    </div>
  );

  const isInProgress = appointment.status === 'IN_PROGRESS';

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-20 pt-4">
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-4 sm:p-6 rounded-3xl shadow-sm border border-slate-100"
      >
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate('/doctor/appointments')} 
            className="w-10 h-10 rounded-full bg-slate-50 hover:bg-slate-100 flex items-center justify-center text-slate-600 transition-colors"
          >
            <FiArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">{t('consultation.title')}</h1>
            <p className="text-sm text-slate-500 font-medium">Phiên làm việc với bệnh nhân</p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <div className={`px-4 py-1.5 rounded-full text-sm font-bold uppercase tracking-wider border shadow-sm ${
            appointment.status === 'COMPLETED' ? 'bg-slate-50 text-slate-700 border-slate-200' : 
            appointment.status === 'IN_PROGRESS' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 
            appointment.status === 'CHECKED_IN' ? 'bg-amber-50 text-amber-700 border-amber-200' : 'bg-emerald-50 text-emerald-700 border-emerald-200'
          }`}>
            {t(`status.${appointment.status}`)}
          </div>
          
          {appointment.status === 'PENDING' || appointment.status === 'CONFIRMED' ? (
            <Button onClick={() => handleStatusChange('CHECKED_IN')} isLoading={isStatusUpdating} className="bg-amber-500 hover:bg-amber-600">Check-In Bệnh nhân</Button>
          ) : appointment.status === 'CHECKED_IN' ? (
            <Button onClick={() => handleStatusChange('IN_PROGRESS')} isLoading={isStatusUpdating} className="bg-emerald-600 hover:bg-emerald-700">Bắt đầu Khám</Button>
          ) : appointment.status === 'IN_PROGRESS' ? (
            <Button onClick={() => handleStatusChange('COMPLETED')} leftIcon={<FiCheck />} isLoading={isStatusUpdating} className="bg-emerald-600 hover:bg-emerald-700">
              {t('consultation.completeConsultation')}
            </Button>
          ) : null}
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Patient Info (Sticky) */}
        <div className="lg:col-span-4 space-y-6">
          <div className="sticky top-24 space-y-6">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden"
            >
              <div className="p-6 bg-gradient-to-br from-emerald-50 to-transparent border-b border-slate-100 flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-white text-emerald-500 flex items-center justify-center shadow-sm">
                  <FiUser className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-lg">{t('consultation.patientInformation')}</h3>
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest">ID: PT-{appointment.patientId || medicalRecord?.patientId || 'N/A'}</p>
                </div>
              </div>
              <div className="p-6">
                <div className="bg-slate-50 p-4 rounded-2xl mb-4 border border-slate-100">
                  <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-1">{t('consultation.fullName')}</p>
                  <p className="text-lg text-slate-900 font-black">{appointment.patientName || medicalRecord?.patientName || 'N/A'}</p>
                </div>
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                  <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-1">{t('consultation.reasonForVisit')}</p>
                  <p className="text-slate-800 font-medium leading-relaxed">{appointment.reason || <span className="text-slate-400 italic">Chưa có thông tin lý do khám</span>}</p>
                </div>
              </div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden"
            >
              <div className="p-6 bg-gradient-to-br from-slate-50 to-transparent border-b border-slate-100 flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-white text-slate-500 flex items-center justify-center shadow-sm border border-slate-100">
                  <FiClock className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-lg">{t('consultation.appointmentInfo')}</h3>
                </div>
              </div>
              <div className="p-6">
                 <div className="flex flex-col gap-1 items-center justify-center py-4 bg-slate-50 rounded-2xl border border-slate-100">
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">{appointment.appointmentTime ? new Date(appointment.appointmentTime).toLocaleString(i18n.language === 'en' ? 'en-US' : 'vi-VN', { month: 'short', year: 'numeric' }) : 'N/A'}</span>
                    <span className="text-4xl font-black text-slate-900 my-1">{appointment.appointmentTime ? new Date(appointment.appointmentTime).getDate() : '-'}</span>
                    <span className="text-sm font-semibold text-slate-600 bg-white px-3 py-1 rounded-md shadow-sm border border-slate-100 mt-2">
                      {appointment.appointmentTime ? new Date(appointment.appointmentTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }) : 'N/A'}
                    </span>
                 </div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Right Column: Workflow */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* Medical Record Form */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className={`bg-white rounded-3xl shadow-sm border overflow-hidden transition-colors ${isInProgress ? 'border-emerald-200 ring-4 ring-emerald-50/50' : 'border-slate-100'}`}
          >
            <div className={`p-6 border-b flex items-center gap-3 ${isInProgress ? 'bg-emerald-50 border-emerald-100' : 'bg-slate-50 border-slate-100'}`}>
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center shadow-sm ${isInProgress ? 'bg-emerald-600 text-white' : 'bg-white text-slate-500 border border-slate-200'}`}>
                <FiEdit3 className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-900">{t('consultation.medicalRecord')}</h2>
                <p className={`text-sm font-medium ${isInProgress ? 'text-emerald-600' : 'text-slate-500'}`}>Hồ sơ bệnh án điện tử</p>
              </div>
            </div>

            <div className="p-6 sm:p-8">
              {!isInProgress && !medicalRecord ? (
                <div className="text-center py-12">
                  <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-100">
                    <FiFileText className="w-10 h-10 text-slate-300" />
                  </div>
                  <p className="text-slate-500 text-lg">{t('common.noData')}</p>
                  <p className="text-slate-400 text-sm mt-2">Hãy nhấn "Bắt đầu Khám" để viết bệnh án.</p>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="block text-sm font-bold text-slate-700 uppercase tracking-wider">{t('consultation.symptoms')}</label>
                    <textarea 
                      className="w-full rounded-2xl border-2 border-slate-100 p-4 text-slate-700 focus:ring-0 focus:border-emerald-400 bg-slate-50 focus:bg-white transition-colors disabled:opacity-70 resize-none"
                      rows={3}
                      placeholder="Ghi nhận triệu chứng lâm sàng..."
                      value={symptoms}
                      onChange={e => setSymptoms(e.target.value)}
                      disabled={!isInProgress}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-bold text-slate-700 uppercase tracking-wider">{t('appointment.diagnosis')} <span className="text-red-500">*</span></label>
                    <textarea 
                      className="w-full rounded-2xl border-2 border-slate-100 p-4 text-slate-700 focus:ring-0 focus:border-emerald-400 bg-slate-50 focus:bg-white transition-colors disabled:opacity-70 resize-none font-medium"
                      rows={3}
                      placeholder="Chẩn đoán bệnh lý chính xác..."
                      value={diagnosis}
                      onChange={e => setDiagnosis(e.target.value)}
                      disabled={!isInProgress}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-bold text-slate-700 uppercase tracking-wider">{t('consultation.treatmentNotes')}</label>
                    <textarea 
                       className="w-full rounded-2xl border-2 border-slate-100 p-4 text-slate-700 focus:ring-0 focus:border-emerald-400 bg-slate-50 focus:bg-white transition-colors disabled:opacity-70 resize-none"
                      rows={3}
                      placeholder="Ghi chú điều trị, dặn dò bệnh nhân..."
                      value={notes}
                      onChange={e => setNotes(e.target.value)}
                      disabled={!isInProgress}
                    />
                  </div>
                  {isInProgress && (
                    <div className="flex justify-end pt-2">
                      <Button onClick={saveMedicalRecord} isLoading={savingRecord} className="bg-emerald-600 hover:bg-emerald-700 px-8 py-2.5 shadow-md">
                        {medicalRecord ? t('consultation.updateRecord') : t('common.save')}
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </motion.div>

          {/* Prescription Section */}
          <AnimatePresence>
            {medicalRecord && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden"
              >
                <div className="p-6 border-b border-slate-100 bg-slate-50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-white text-teal-500 flex items-center justify-center shadow-sm border border-slate-200">
                      <FiActivity className="w-6 h-6" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-slate-900">{t('consultation.prescription')}</h2>
                      <p className="text-sm font-medium text-slate-500">Đơn thuốc điện tử</p>
                    </div>
                  </div>
                  {isInProgress && !prescription && !showPrescriptionForm && (
                    <Button onClick={() => setShowPrescriptionForm(true)} leftIcon={<FiPlus />} className="bg-teal-600 hover:bg-teal-700 shadow-sm">Kê đơn thuốc</Button>
                  )}
                </div>

                <div className="p-6 sm:p-8">
                  {prescription ? (
                    <div className="space-y-6">
                      {prescription.note && (
                        <div className="bg-amber-50 border border-amber-200 text-amber-800 p-4 rounded-2xl flex gap-3">
                           <FiFileText className="w-5 h-5 flex-shrink-0 mt-0.5" />
                           <p className="text-sm font-medium"><span className="font-bold uppercase tracking-wider text-xs block mb-1">Ghi chú</span> {prescription.note}</p>
                        </div>
                      )}
                      
                      <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
                        <table className="w-full text-sm text-left">
                          <thead className="bg-slate-50 border-b border-slate-200">
                            <tr>
                              <th className="px-6 py-4 font-bold text-slate-700 uppercase tracking-wider text-xs">{t('consultation.medicine')}</th>
                              <th className="px-6 py-4 font-bold text-slate-700 uppercase tracking-wider text-xs">{t('consultation.dosage')}</th>
                              <th className="px-6 py-4 font-bold text-slate-700 uppercase tracking-wider text-xs">{t('consultation.frequency')}</th>
                              <th className="px-6 py-4 font-bold text-slate-700 uppercase tracking-wider text-xs">{t('consultation.duration')}</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100 bg-white">
                            {prescription.items.map((item, idx) => (
                              <tr key={idx} className="hover:bg-slate-50 transition-colors">
                                <td className="px-6 py-4 font-bold text-emerald-700">{item.medicineName}</td>
                                <td className="px-6 py-4 text-slate-700 font-medium">{item.dosage}</td>
                                <td className="px-6 py-4 text-slate-700">{item.frequency}</td>
                                <td className="px-6 py-4 text-slate-700">
                                  <span className="bg-slate-100 text-slate-600 px-2.5 py-1 rounded-md font-semibold text-xs">{item.duration}</span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  ) : showPrescriptionForm ? (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                      <div className="space-y-2">
                        <label className="block text-sm font-bold text-slate-700 uppercase tracking-wider">{t('consultation.note')}</label>
                        <Input 
                          placeholder="Lời dặn riêng (không bắt buộc)..."
                          value={prescriptionNote} 
                          onChange={e => setPrescriptionNote(e.target.value)} 
                          className="bg-slate-50 h-12 rounded-xl"
                        />
                      </div>
                      
                      <div className="space-y-4">
                        <label className="block text-sm font-bold text-slate-700 uppercase tracking-wider mb-2">Danh sách Thuốc</label>
                        {items.map((item, index) => (
                          <div key={index} className="flex flex-col sm:flex-row gap-3 items-start border-2 border-slate-100 p-5 rounded-2xl bg-white shadow-sm relative group hover:border-teal-200 transition-colors">
                            <div className="absolute -left-3 -top-3 w-8 h-8 bg-slate-900 text-white rounded-full flex items-center justify-center font-bold text-sm shadow-md">
                              {index + 1}
                            </div>
                            <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 w-full">
                              <Input placeholder="Tên thuốc *" value={item.medicineName} onChange={e => handleItemChange(index, 'medicineName', e.target.value)} className="bg-slate-50" />
                              <Input placeholder="Liều lượng (VD: 500mg) *" value={item.dosage} onChange={e => handleItemChange(index, 'dosage', e.target.value)} className="bg-slate-50" />
                              <Input placeholder="Tần suất (VD: 2 viên/ngày) *" value={item.frequency} onChange={e => handleItemChange(index, 'frequency', e.target.value)} className="bg-slate-50" />
                              <Input placeholder="Thời gian (VD: 5 ngày) *" value={item.duration} onChange={e => handleItemChange(index, 'duration', e.target.value)} className="bg-slate-50" />
                              <Input className="sm:col-span-2 lg:col-span-4 bg-slate-50" placeholder={t('consultation.instructionOptional')} value={item.instruction} onChange={e => handleItemChange(index, 'instruction', e.target.value)} />
                            </div>
                            <button onClick={() => handleRemoveMedicine(index)} className="w-10 h-10 sm:w-auto flex items-center justify-center text-red-500 hover:text-white hover:bg-red-500 rounded-xl transition-colors border border-red-200 hover:border-red-500 px-3">
                              <FiTrash2 className="w-5 h-5" />
                            </button>
                          </div>
                        ))}
                        <div className="pt-2">
                           <Button type="button" variant="outline" onClick={handleAddMedicine} leftIcon={<FiPlus />} className="border-dashed border-2 border-slate-300 text-slate-600 hover:border-teal-500 hover:text-teal-700 bg-slate-50 hover:bg-teal-50 w-full sm:w-auto">
                            {t('consultation.addMedicine')}
                          </Button>
                        </div>
                      </div>

                      <div className="flex justify-end gap-3 pt-6 border-t border-slate-100">
                        <Button variant="ghost" onClick={() => setShowPrescriptionForm(false)} className="text-slate-500">{t('common.cancel')}</Button>
                        <Button onClick={savePrescription} isLoading={savingPrescription} className="bg-teal-600 hover:bg-teal-700 shadow-md px-6">Lưu Đơn thuốc</Button>
                      </div>
                    </motion.div>
                  ) : (
                    <div className="text-center py-10 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                       <FiActivity className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                       <p className="text-slate-500">Chưa có đơn thuốc nào được kê.</p>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

        </div>
      </div>

      {toast && (
        <div className="fixed bottom-6 right-6 z-50">
          <Toast 
            type={toast.type} 
            title={toast.type === 'success' ? 'Thành công' : 'Lỗi'} 
            message={toast.message} 
            onClose={() => setToast(null)} 
          />
        </div>
      )}
    </div>
  );
};

export default DoctorConsultation;
