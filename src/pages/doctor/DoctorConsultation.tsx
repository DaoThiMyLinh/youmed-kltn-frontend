import { useEffect, useState, useMemo } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { Button, Input, Toast, PrintPrescriptionModal, PrintReferralModal } from '../../components';
import { FiUser, FiClock, FiFileText, FiCheck, FiArrowLeft, FiPlus, FiTrash2, FiActivity, FiEdit3, FiTag, FiFilter, FiAlertCircle, FiCalendar, FiPrinter, FiShare2 } from 'react-icons/fi';
import { consultationService } from '../../services/consultation.service';
import { masterDataService } from '../../services/masterData.service';
import { DEFAULT_SYMPTOMS, DEFAULT_DIAGNOSES, DEFAULT_MEDICINES } from '../../constants/masterData';
import type { Symptom, Diagnosis, Medicine } from '../../types/masterData';
import type { Appointment } from '../../types/patient';
import type { MedicalRecord, Prescription, PrescriptionItem } from '../../types/consultation';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';

const REFERRAL_SERVICES_PRESETS = [
  'Chụp X-quang tim phổi thẳng',
  'Chụp X-quang cột sống thắt lưng',
  'Chụp X-quang khớp gối (thẳng + nghiêng)',
  'Chụp cộng hưởng từ MRI cột sống',
  'Chụp cộng hưởng từ MRI sọ não',
  'Chụp cắt lớp vi tính CT-Scanner lồng ngực',
  'Siêu âm Doppler màu tim / mạch máu',
  'Siêu âm bụng tổng quát',
  'Xét nghiệm sinh hóa - huyết học chuyên sâu',
  'Nội soi dạ dày - tá tràng'
];

const REFERRAL_TARGETS_PRESETS = [
  'Trung tâm Y khoa Medic Hòa Hảo TP.HCM',
  'Bệnh viện Đại học Y Dược TP.HCM',
  'Bệnh viện Chợ Rẫy',
  'Bệnh viện Da Liễu TP.HCM',
  'Trung tâm Chẩn đoán Hình ảnh Kỹ thuật cao'
];

const DoctorConsultation = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();

  const [appointment, setAppointment] = useState<Appointment | null>(null);
  const [medicalRecord, setMedicalRecord] = useState<MedicalRecord | null>(null);
  const [prescription, setPrescription] = useState<Prescription | null>(null);
  
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<{ message: string, type: 'success'|'error' } | null>(null);
  const [printModalOpen, setPrintModalOpen] = useState(false);
  const [printReferralModalOpen, setPrintReferralModalOpen] = useState(false);

  // Master Data state initialized with full medical standard presets
  const [masterSymptoms, setMasterSymptoms] = useState<Symptom[]>(DEFAULT_SYMPTOMS);
  const [masterDiagnoses, setMasterDiagnoses] = useState<Diagnosis[]>(DEFAULT_DIAGNOSES);
  const [masterMedicines, setMasterMedicines] = useState<Medicine[]>(DEFAULT_MEDICINES);
  const [filterBySpecialty, setFilterBySpecialty] = useState(true);

  // Medical Record Form state
  const [diagnosis, setDiagnosis] = useState('');
  const [symptoms, setSymptoms] = useState('');
  const [notes, setNotes] = useState('');
  const [followUpDate, setFollowUpDate] = useState('');
  const [hasReferral, setHasReferral] = useState(false);
  const [referralTarget, setReferralTarget] = useState('');
  const [referralServices, setReferralServices] = useState('');
  const [referralReason, setReferralReason] = useState('');
  const [referralNotes, setReferralNotes] = useState('');
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
      
      let apt = stateAppointment;
      if (!apt) {
        try {
          apt = await consultationService.getAppointmentById(Number(id));
        } catch (err) {
          // Fallback: search in doctor's appointments
          try {
            const docApts = await consultationService.getDoctorAppointments(0, 100);
            apt = docApts.content.find(a => a.id === Number(id));
          } catch (e) {
            console.error("Could not fetch fallback appointments", e);
          }
        }
      }

      if (apt) {
        setAppointment(apt);
      } else {
        throw new Error('Không tìm thấy thông tin cuộc hẹn.');
      }

      try {
        const record = await consultationService.getMedicalRecordByAppointmentId(Number(id));
        setMedicalRecord(record);

        if (record) {
          setDiagnosis(record.diagnosis || '');
          setSymptoms(record.symptoms || '');
          setNotes(record.notes || '');
          setFollowUpDate(record.followUpDate ? record.followUpDate.split('T')[0] : '');

          if (record.referralTarget || record.referralServices || record.referralReason || record.referralNotes) {
            setHasReferral(true);
            setReferralTarget(record.referralTarget || '');
            setReferralServices(record.referralServices || '');
            setReferralReason(record.referralReason || '');
            setReferralNotes(record.referralNotes || '');
          }

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
      setToast({ message: error.message || 'Lỗi khi tải thông tin khám bệnh', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetails();

    const loadMasterData = async () => {
      try {
        const symptomsData = await masterDataService.getSymptoms().catch(() => null);
        if (symptomsData && symptomsData.length > 0) setMasterSymptoms(symptomsData);

        const diagnosesData = await masterDataService.getDiagnoses().catch(() => null);
        if (diagnosesData && diagnosesData.length > 0) setMasterDiagnoses(diagnosesData);

        const medicinesData = await masterDataService.getMedicines().catch(() => null);
        if (medicinesData && medicinesData.length > 0) setMasterMedicines(medicinesData);
      } catch (err) {
        // Keep default presets
      }
    };
    loadMasterData();
  }, [id]);

  const handleToggleSymptom = (name: string) => {
    if (!name) return;
    const trimmed = symptoms.trim();
    if (!trimmed) {
      setSymptoms(name);
      return;
    }
    const currentList = trimmed.split(',').map(s => s.trim()).filter(Boolean);
    const existingIndex = currentList.findIndex(s => s.toLowerCase() === name.toLowerCase());
    if (existingIndex >= 0) {
      currentList.splice(existingIndex, 1);
      setSymptoms(currentList.join(', '));
    } else {
      currentList.push(name);
      setSymptoms(currentList.join(', '));
    }
  };

  const handleSelectDiagnosis = (name: string) => {
    if (!name) return;
    const trimmed = diagnosis.trim();
    if (!trimmed) {
      setDiagnosis(name);
      return;
    }
    const currentList = trimmed.split(',').map(d => d.trim()).filter(Boolean);
    if (!currentList.some(d => d.toLowerCase() === name.toLowerCase())) {
      currentList.push(name);
      setDiagnosis(currentList.join(', '));
    }
  };

  const currentSpecialty = appointment?.specialization || '';

  const displayedSymptoms = useMemo(() => {
    if (!filterBySpecialty || !currentSpecialty) return masterSymptoms;
    const filtered = masterSymptoms.filter(s => 
      s.specialtyName?.toLowerCase() === currentSpecialty.toLowerCase() ||
      s.specialty?.name?.toLowerCase() === currentSpecialty.toLowerCase()
    );
    return filtered.length > 0 ? filtered : masterSymptoms;
  }, [masterSymptoms, filterBySpecialty, currentSpecialty]);

  const displayedDiagnoses = useMemo(() => {
    if (!filterBySpecialty || !currentSpecialty) return masterDiagnoses;
    const filtered = masterDiagnoses.filter(d => 
      d.specialtyName?.toLowerCase() === currentSpecialty.toLowerCase() ||
      d.specialty?.name?.toLowerCase() === currentSpecialty.toLowerCase()
    );
    return filtered.length > 0 ? filtered : masterDiagnoses;
  }, [masterDiagnoses, filterBySpecialty, currentSpecialty]);

  const handleStatusChange = async (newStatus: string) => {
    if (!appointment || isStatusUpdating) return;
    try {
      setIsStatusUpdating(true);
      await consultationService.updateAppointmentStatus(appointment.id, newStatus);
      setAppointment({ ...appointment, status: newStatus as any });
      setToast({ 
        message: newStatus === 'COMPLETED' 
          ? 'Đã hoàn tất ca khám và lưu vào mục Lịch sử khám bệnh.' 
          : newStatus === 'IN_PROGRESS' 
          ? 'Đã bắt đầu phiên khám bệnh.' 
          : `Đã cập nhật trạng thái lịch khám`, 
        type: 'success' 
      });
    } catch (error: any) {
      setToast({ message: error.response?.data?.message || 'Không thể cập nhật trạng thái', type: 'error' });
    } finally {
      setIsStatusUpdating(false);
    }
  };

  const handleToggleReferralService = (service: string) => {
    if (!service) return;
    const currentList = referralServices.split(',').map(s => s.trim()).filter(Boolean);
    const index = currentList.findIndex(s => s.toLowerCase() === service.toLowerCase());
    if (index >= 0) {
      currentList.splice(index, 1);
    } else {
      currentList.push(service);
    }
    setReferralServices(currentList.join(', '));
  };

  const saveMedicalRecord = async () => {
    if (!appointment) return;
    if (!diagnosis) {
      setToast({ message: 'Diagnosis is required', type: 'error' });
      return;
    }
    
    try {
      setSavingRecord(true);
      const payload = {
        diagnosis,
        symptoms,
        notes,
        followUpDate: followUpDate || undefined,
        referralTarget: hasReferral ? referralTarget : undefined,
        referralServices: hasReferral ? referralServices : undefined,
        referralReason: hasReferral ? referralReason : undefined,
        referralNotes: hasReferral ? referralNotes : undefined,
      };

      if (medicalRecord) {
        const updated = await consultationService.updateMedicalRecord(medicalRecord.id, payload);
        setMedicalRecord(updated);
        setToast({ message: t('consultation.recordSaved'), type: 'success' });
      } else {
        const created = await consultationService.createMedicalRecord({
          appointmentId: appointment.id,
          ...payload
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
    
    // Tự động gợi ý đơn vị khi bác sĩ chọn thuốc từ danh mục
    if (field === 'medicineName') {
      const matched = masterMedicines.find(m => m.name.toLowerCase() === value.trim().toLowerCase());
      if (matched && matched.unit && !newItems[index].dosage) {
        newItems[index].dosage = `1 ${matched.unit}`;
      }
    }
    
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
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Status Badge */}
          <div className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold uppercase tracking-wider border shadow-2xs select-none ${
            appointment.status === 'COMPLETED' ? 'bg-slate-100 text-slate-700 border-slate-200' : 
            appointment.status === 'IN_PROGRESS' ? 'bg-emerald-50 text-emerald-800 border-emerald-200' : 
            appointment.status === 'CHECKED_IN' ? 'bg-amber-50 text-amber-800 border-amber-200' : 'bg-emerald-50 text-emerald-800 border-emerald-200'
          }`}>
            <span className={`w-2 h-2 rounded-full ${
              appointment.status === 'COMPLETED' ? 'bg-slate-400' :
              appointment.status === 'IN_PROGRESS' ? 'bg-emerald-500 animate-pulse' :
              appointment.status === 'CHECKED_IN' ? 'bg-amber-500' : 'bg-emerald-500'
            }`} />
            <span>{t(`status.${appointment.status}`)}</span>
          </div>

          <div className="h-6 w-px bg-slate-200 hidden sm:block" />

          {/* Nút In đơn thuốc & Bệnh án */}
          {(medicalRecord || prescription) && (
            <button 
              type="button" 
              onClick={() => setPrintModalOpen(true)}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg bg-white hover:bg-emerald-50/70 border border-slate-200 hover:border-emerald-300 text-slate-700 hover:text-emerald-800 text-xs font-semibold shadow-2xs hover:shadow-xs transition-all cursor-pointer group"
              title="In đơn thuốc và hồ sơ bệnh án"
            >
              <div className="w-5 h-5 rounded-md bg-emerald-50 group-hover:bg-emerald-100/90 flex items-center justify-center text-emerald-600 transition-colors">
                <FiPrinter className="w-3.5 h-3.5" />
              </div>
              <span>In đơn thuốc & Bệnh án</span>
            </button>
          )}

          {/* Nút In Giấy giới thiệu */}
          {medicalRecord && (medicalRecord.referralServices || medicalRecord.referralTarget) && (
            <button 
              type="button" 
              onClick={() => setPrintReferralModalOpen(true)}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg bg-white hover:bg-teal-50/70 border border-slate-200 hover:border-teal-300 text-slate-700 hover:text-teal-800 text-xs font-semibold shadow-2xs hover:shadow-xs transition-all cursor-pointer group"
              title="In giấy giới thiệu chuyển tuyến"
            >
              <div className="w-5 h-5 rounded-md bg-teal-50 group-hover:bg-teal-100/90 flex items-center justify-center text-teal-600 transition-colors">
                <FiShare2 className="w-3.5 h-3.5" />
              </div>
              <span>In Giấy giới thiệu</span>
            </button>
          )}

          {/* Nút thao tác chính */}
          {appointment.status === 'PENDING' || appointment.status === 'CONFIRMED' ? (
            <div className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg bg-amber-50 text-amber-800 border border-amber-200 text-xs font-semibold shadow-2xs">
              <FiClock className="w-3.5 h-3.5 text-amber-600 shrink-0" />
              <span>Chờ Lễ tân tiếp nhận & Check-in</span>
            </div>
          ) : appointment.status === 'CHECKED_IN' ? (
            <button 
              type="button"
              onClick={() => handleStatusChange('IN_PROGRESS')} 
              disabled={isStatusUpdating}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold text-xs shadow-sm hover:shadow transition-all cursor-pointer disabled:opacity-50"
            >
              {isStatusUpdating ? (
                <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <FiActivity className="w-3.5 h-3.5" />
              )}
              <span>Bắt đầu Khám</span>
            </button>
          ) : appointment.status === 'IN_PROGRESS' ? (
            <button 
              type="button"
              onClick={() => handleStatusChange('COMPLETED')} 
              disabled={isStatusUpdating}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold text-xs shadow-sm hover:shadow transition-all cursor-pointer disabled:opacity-50"
            >
              {isStatusUpdating ? (
                <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <FiCheck className="w-3.5 h-3.5 stroke-[2.5]" />
              )}
              <span>{t('consultation.completeConsultation')}</span>
            </button>
          ) : null}
        </div>
      </motion.div>

      {(appointment.status === 'PENDING' || appointment.status === 'CONFIRMED') && (
        <div className="p-4 rounded-2xl bg-amber-50/80 border border-amber-200 text-amber-900 flex items-start gap-3 shadow-sm">
          <FiAlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="text-sm">
            <p className="font-semibold text-slate-900">Bệnh nhân chưa Check-in tại quầy Lễ tân</p>
            <p className="text-slate-600 text-xs mt-0.5 leading-relaxed">
              Theo quy trình tiếp nhận của bệnh viện, nhân viên <strong>Lễ tân (Receptionist)</strong> sẽ đón tiếp và thực hiện Check-in cho bệnh nhân. Sau khi Lễ tân hoàn tất Check-in, Bác sĩ mới có thể bấm <strong>"Bắt đầu Khám"</strong>.
            </p>
          </div>
        </div>
      )}

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
            className={`bg-white rounded-2xl shadow-xs border overflow-hidden transition-colors ${isInProgress ? 'border-emerald-200 ring-2 ring-emerald-500/10' : 'border-slate-200'}`}
          >
            <div className={`p-5 sm:p-6 border-b flex items-center gap-3.5 ${isInProgress ? 'bg-emerald-50/70 border-emerald-100' : 'bg-slate-50/80 border-slate-100'}`}>
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center shadow-2xs ${isInProgress ? 'bg-emerald-600 text-white' : 'bg-white text-slate-500 border border-slate-200'}`}>
                <FiEdit3 className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-900">{t('consultation.medicalRecord')}</h2>
                <p className={`text-xs font-medium ${isInProgress ? 'text-emerald-700' : 'text-slate-500'}`}>Hồ sơ bệnh án điện tử</p>
              </div>
            </div>

            <div className="p-5 sm:p-7">
              {!isInProgress && !medicalRecord ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-slate-50 rounded-xl flex items-center justify-center mx-auto mb-4 border border-slate-200">
                    <FiFileText className="w-8 h-8 text-slate-300" />
                  </div>
                  <p className="text-slate-500 text-base">{t('common.noData')}</p>
                  <p className="text-slate-400 text-xs mt-1">Hãy nhấn "Bắt đầu Khám" để viết bệnh án.</p>
                </div>
              ) : !isInProgress && medicalRecord ? (
                /* CHẾ ĐỘ XEM LẠI BỆNH ÁN: Chỉ hiển thị dữ liệu đã lưu, không cho chọn thêm */
                <div className="space-y-6">
                  <div className="bg-slate-50/70 border border-slate-200/80 rounded-xl p-5 space-y-5">
                    {/* Triệu chứng đã lưu */}
                    <div className="space-y-2">
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                        <FiActivity className="text-emerald-600 w-3.5 h-3.5" />
                        {t('consultation.symptoms')}
                      </label>
                      {symptoms ? (
                        <div className="flex flex-wrap gap-1.5 pt-0.5">
                          {symptoms.split(',').map((s, idx) => (
                            <span 
                              key={idx} 
                              className="bg-emerald-50 text-emerald-800 border border-emerald-200/80 px-2.5 py-1 rounded-lg font-medium text-xs shadow-2xs"
                            >
                              ✓ {s.trim()}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-slate-400 italic">Không có triệu chứng được ghi nhận</p>
                      )}
                    </div>

                    <div className="border-t border-slate-200/60" />

                    {/* Chẩn đoán đã lưu */}
                    <div className="space-y-2">
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                        <FiEdit3 className="text-teal-600" />
                        {t('appointment.diagnosis')}
                      </label>
                      <div className="p-4 bg-white border border-slate-200 rounded-xl text-slate-900 font-semibold text-base shadow-2xs">
                        {diagnosis || <span className="text-slate-400 font-normal italic">Chưa có chẩn đoán</span>}
                      </div>
                    </div>

                    {notes && (
                      <>
                        <div className="border-t border-slate-200/60" />
                        {/* Hướng điều trị / ghi chú */}
                        <div className="space-y-2">
                          <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">
                            {t('consultation.treatmentNotes')}
                          </label>
                          <p className="p-4 bg-white border border-slate-200 rounded-xl text-slate-700 text-sm whitespace-pre-line shadow-2xs">
                            {notes}
                          </p>
                        </div>
                      </>
                    )}

                    {/* Hẹn tái khám đã lưu */}
                    <div className="border-t border-slate-200/60" />
                    <div className="space-y-2">
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                        <FiCalendar className="text-emerald-600" />
                        Lịch hẹn tái khám
                      </label>
                      {followUpDate ? (
                        <div className="p-4 bg-emerald-50/70 border border-emerald-200/80 rounded-xl flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold shadow-xs">
                              <FiCalendar className="w-5 h-5" />
                            </div>
                            <div>
                              <div className="font-bold text-slate-900 text-base">
                                {new Date(followUpDate).toLocaleDateString('vi-VN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                              </div>
                              <div className="text-xs text-emerald-700 font-medium mt-0.5">
                                Tái khám định kỳ theo chỉ định của bác sĩ
                              </div>
                            </div>
                          </div>
                          <span className="text-xs font-bold bg-emerald-600 text-white px-3 py-1 rounded-full shadow-2xs">
                            Đã lên lịch
                          </span>
                        </div>
                      ) : (
                        <p className="text-sm text-slate-400 italic">Không có lịch hẹn tái khám (Tái khám khi có dấu hiệu bất thường)</p>
                      )}
                    </div>

                    {/* Giấy giới thiệu chuyển tuyến nếu có */}
                    {medicalRecord && (medicalRecord.referralServices || medicalRecord.referralTarget) && (
                      <>
                        <div className="border-t border-slate-200/60" />
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                              <FiShare2 className="text-teal-600" />
                              Giấy giới thiệu & Chỉ định cận lâm sàng ngoài (X-quang, MRI, xét nghiệm...)
                            </label>
                            <button
                              type="button"
                              onClick={() => setPrintReferralModalOpen(true)}
                              className="px-3 py-1 rounded-xl bg-teal-50 hover:bg-teal-100 text-teal-800 border border-teal-200 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs"
                            >
                              <FiPrinter className="w-3.5 h-3.5" /> In giấy giới thiệu
                            </button>
                          </div>

                          <div className="p-4 bg-teal-50/50 border border-teal-200/80 rounded-2xl space-y-2.5 text-sm">
                            <div className="flex items-start gap-2">
                              <span className="text-xs font-bold text-slate-500 uppercase min-w-[120px]">Nơi tiếp nhận:</span>
                              <span className="font-bold text-teal-950">{medicalRecord.referralTarget || 'Các bệnh viện, trung tâm chẩn đoán hình ảnh chuyên khoa'}</span>
                            </div>
                            <div className="flex items-start gap-2">
                              <span className="text-xs font-bold text-slate-500 uppercase min-w-[120px]">Kỹ thuật chỉ định:</span>
                              <span className="font-semibold text-slate-900 bg-white px-2.5 py-1 rounded-lg border border-teal-200/60 shadow-2xs">
                                {medicalRecord.referralServices}
                              </span>
                            </div>
                            {medicalRecord.referralReason && (
                              <div className="flex items-start gap-2">
                                <span className="text-xs font-bold text-slate-500 uppercase min-w-[120px]">Lý do chỉ định:</span>
                                <span className="text-slate-700 italic">{medicalRecord.referralReason}</span>
                              </div>
                            )}
                            {medicalRecord.referralNotes && (
                              <div className="flex items-start gap-2">
                                <span className="text-xs font-bold text-slate-500 uppercase min-w-[120px]">Dặn dò người bệnh:</span>
                                <span className="text-slate-700 font-medium">{medicalRecord.referralNotes}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              ) : (
                /* CHẾ ĐỘ ĐANG KHÁM: Hiển thị bộ lọc chuyên khoa, dropdown và tags chọn nhanh */
                <div className="space-y-6">
                  {/* Thanh thông tin và bộ lọc chuyên khoa */}
                  {currentSpecialty && (
                    <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-50/80 border border-slate-200/80 rounded-xl px-4 py-2.5">
                      <div className="flex items-center gap-2">
                        <FiFilter className="text-emerald-600 w-4 h-4" />
                        <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Chuyên khoa khám:</span>
                        <span className="text-xs font-bold text-emerald-800 bg-emerald-100/80 border border-emerald-200/60 px-2.5 py-0.5 rounded-md">
                          {currentSpecialty}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setFilterBySpecialty(!filterBySpecialty)}
                        className="text-xs font-medium text-slate-600 hover:text-emerald-700 bg-white hover:bg-emerald-50/50 px-3 py-1.5 rounded-lg border border-slate-200 hover:border-emerald-200 transition-colors cursor-pointer shadow-2xs flex items-center gap-1.5"
                      >
                        {filterBySpecialty ? 'Hiển thị tất cả chuyên khoa' : `Chỉ xem khoa ${currentSpecialty}`}
                      </button>
                    </div>
                  )}

                  {/* Triệu chứng lâm sàng */}
                  <div className="space-y-2">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                        <FiActivity className="text-emerald-600 w-3.5 h-3.5" />
                        {t('consultation.symptoms')}
                      </label>
                      <div className="flex items-center gap-2">
                        <select 
                          className="text-xs bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 font-medium cursor-pointer transition-colors shadow-2xs"
                          onChange={e => {
                            if (e.target.value) {
                              handleToggleSymptom(e.target.value);
                              e.target.value = '';
                            }
                          }}
                          value=""
                        >
                          <option value="" disabled>+ Chọn từ danh mục ({displayedSymptoms.length} triệu chứng)...</option>
                          {displayedSymptoms.map(sym => (
                            <option key={sym.id} value={sym.name}>
                              {sym.name} {sym.description ? `(${sym.description})` : ''}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {/* Quick suggestion tags for symptoms */}
                    <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                      <span className="text-xs font-medium text-slate-400 flex items-center gap-1 mr-1">
                        <FiTag className="w-3 h-3 text-slate-400" /> Gợi ý {filterBySpecialty && currentSpecialty ? `khoa ${currentSpecialty}` : 'nhanh'}:
                      </span>
                      {displayedSymptoms.slice(0, 10).map(sym => {
                        const isSelected = symptoms.toLowerCase().includes(sym.name.toLowerCase());
                        return (
                          <button
                            key={sym.id}
                            type="button"
                            onClick={() => handleToggleSymptom(sym.name)}
                            className={`text-xs px-2.5 py-1 rounded-lg font-medium transition-all cursor-pointer ${
                              isSelected
                                ? 'bg-emerald-600 text-white font-semibold shadow-2xs'
                                : 'bg-slate-100 hover:bg-emerald-50 text-slate-700 hover:text-emerald-700 border border-slate-200/70 hover:border-emerald-300'
                            }`}
                            title={sym.description || sym.name}
                          >
                            {isSelected ? `✓ ${sym.name}` : `+ ${sym.name}`}
                          </button>
                        );
                      })}
                    </div>

                    <textarea 
                      className="w-full rounded-lg border border-slate-200 p-3.5 text-sm text-slate-800 placeholder:text-slate-400 bg-white focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all resize-none shadow-2xs leading-relaxed"
                      rows={3}
                      placeholder="Ghi nhận triệu chứng lâm sàng (chọn từ gợi ý phía trên hoặc tự nhập tự do)..."
                      value={symptoms}
                      onChange={e => setSymptoms(e.target.value)}
                    />
                  </div>

                  {/* Chẩn đoán bệnh */}
                  <div className="space-y-2">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                        <FiEdit3 className="text-teal-600 w-3.5 h-3.5" />
                        {t('appointment.diagnosis')} <span className="text-red-500">*</span>
                      </label>
                      <div className="flex items-center gap-2">
                        <select 
                          className="text-xs bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 font-medium cursor-pointer transition-colors shadow-2xs"
                          onChange={e => {
                            if (e.target.value) {
                              handleSelectDiagnosis(e.target.value);
                              e.target.value = '';
                            }
                          }}
                          value=""
                        >
                          <option value="" disabled>+ Chọn chẩn đoán mẫu ({displayedDiagnoses.length} bệnh)...</option>
                          {displayedDiagnoses.map(diag => (
                            <option key={diag.id} value={diag.name}>
                              {diag.name} {diag.description ? `(${diag.description})` : ''}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {/* Quick suggestion tags for diagnoses */}
                    <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                      <span className="text-xs font-medium text-slate-400 flex items-center gap-1 mr-1">
                        <FiTag className="w-3 h-3 text-slate-400" /> Bệnh lý mẫu {filterBySpecialty && currentSpecialty ? `khoa ${currentSpecialty}` : ''}:
                      </span>
                      {displayedDiagnoses.slice(0, 8).map(diag => {
                        const isSelected = diagnosis.toLowerCase().includes(diag.name.toLowerCase());
                        return (
                          <button
                            key={diag.id}
                            type="button"
                            onClick={() => handleSelectDiagnosis(diag.name)}
                            className={`text-xs px-2.5 py-1 rounded-lg font-medium transition-all cursor-pointer ${
                              isSelected
                                ? 'bg-teal-600 text-white font-semibold shadow-2xs'
                                : 'bg-slate-100 hover:bg-teal-50 text-slate-700 hover:text-teal-700 border border-slate-200/70 hover:border-teal-300'
                            }`}
                            title={diag.description || diag.name}
                          >
                            {isSelected ? `✓ ${diag.name}` : `+ ${diag.name}`}
                          </button>
                        );
                      })}
                    </div>

                    <textarea 
                      className="w-full rounded-lg border border-slate-200 p-3.5 text-sm text-slate-800 placeholder:text-slate-400 bg-white focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all resize-none shadow-2xs font-medium leading-relaxed"
                      rows={3}
                      placeholder="Chẩn đoán bệnh lý chính xác (chọn từ danh mục hoặc tự nhập tự do)..."
                      value={diagnosis}
                      onChange={e => setDiagnosis(e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">{t('consultation.treatmentNotes')}</label>
                    <textarea 
                      className="w-full rounded-lg border border-slate-200 p-3.5 text-sm text-slate-800 placeholder:text-slate-400 bg-white focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all resize-none shadow-2xs leading-relaxed"
                      rows={3}
                      placeholder="Ghi chú điều trị, dặn dò bệnh nhân..."
                      value={notes}
                      onChange={e => setNotes(e.target.value)}
                    />
                  </div>

                  {/* Hẹn ngày tái khám */}
                  <div className="p-4 sm:p-5 bg-slate-50/70 rounded-xl border border-slate-200/80 space-y-3 shadow-2xs">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                        <FiCalendar className="text-emerald-600 w-3.5 h-3.5" />
                        Hẹn ngày tái khám
                      </label>
                      {followUpDate ? (
                        <span className="text-xs font-semibold text-emerald-800 bg-emerald-100/80 px-2.5 py-0.5 rounded-md border border-emerald-200/60">
                          ✓ {new Date(followUpDate).toLocaleDateString('vi-VN')}
                        </span>
                      ) : (
                        <span className="text-xs text-slate-400 font-medium">Chưa chọn ngày</span>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className="text-xs text-slate-400 font-medium mr-1">Mốc nhanh:</span>
                      {[
                        { label: '+3 ngày', days: 3 },
                        { label: '+7 ngày (1 tuần)', days: 7 },
                        { label: '+14 ngày (2 tuần)', days: 14 },
                        { label: '+30 ngày (1 tháng)', days: 30 },
                      ].map(preset => (
                        <button
                          key={preset.label}
                          type="button"
                          onClick={() => {
                            const d = new Date();
                            d.setDate(d.getDate() + preset.days);
                            setFollowUpDate(d.toISOString().split('T')[0]);
                          }}
                          className="text-xs px-2.5 py-1.5 rounded-lg bg-white border border-slate-200 hover:border-emerald-500 hover:bg-emerald-50/80 hover:text-emerald-700 font-medium text-slate-700 transition-all shadow-2xs cursor-pointer"
                        >
                          {preset.label}
                        </button>
                      ))}
                      {followUpDate && (
                        <button
                          type="button"
                          onClick={() => setFollowUpDate('')}
                          className="text-xs px-2.5 py-1.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 hover:bg-rose-100 font-medium transition-all shadow-2xs cursor-pointer ml-auto"
                        >
                          ✕ Bỏ hẹn
                        </button>
                      )}
                    </div>

                    <div className="flex flex-col sm:flex-row sm:items-center gap-3 pt-1">
                      <input
                        type="date"
                        min={new Date().toISOString().split('T')[0]}
                        value={followUpDate}
                        onChange={e => setFollowUpDate(e.target.value)}
                        className="px-3.5 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none text-slate-800 shadow-2xs font-medium cursor-pointer"
                      />
                      <span className="text-xs text-slate-500">
                        {followUpDate
                          ? `Bệnh nhân sẽ quay lại vào: ${new Date(followUpDate).toLocaleDateString('vi-VN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}`
                          : 'Bác sĩ có thể bấm nút mốc nhanh (+7 ngày, +14 ngày...) hoặc chọn ngày cụ thể.'}
                      </span>
                    </div>
                  </div>

                  {/* Giấy Giới Thiệu Chuyển Tuyến / Chỉ định Cận Lâm Sàng Ngoài */}
                  <div className="p-4 sm:p-5 bg-slate-50/70 rounded-xl border border-slate-200/80 space-y-4 shadow-2xs">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <FiShare2 className="text-teal-600 w-4 h-4" />
                        <div>
                          <label className="text-sm font-bold text-slate-800 block">
                            Giấy giới thiệu chuyển tuyến & Chỉ định Cận lâm sàng ngoài
                          </label>
                          <p className="text-xs text-slate-500">Chụp X-quang, MRI, CT hoặc Xét nghiệm chuyên sâu tại cơ sở đối tác</p>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => setHasReferral(!hasReferral)}
                        className={`text-xs font-semibold px-3 py-1.5 rounded-lg border transition-all cursor-pointer shadow-2xs flex items-center gap-1.5 ${
                          hasReferral 
                            ? 'bg-teal-600 text-white border-teal-600' 
                            : 'bg-white text-slate-700 border-slate-300 hover:border-teal-500 hover:text-teal-700'
                        }`}
                      >
                        {hasReferral ? '✓ Đang bật giới thiệu' : '+ Kèm giấy giới thiệu'}
                      </button>
                    </div>

                    {hasReferral && (
                      <div className="space-y-4 pt-2 border-t border-slate-200/60">
                        {/* Chọn nhanh dịch vụ cận lâm sàng */}
                        <div className="space-y-1.5">
                          <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                            1. Dịch vụ / Kỹ thuật chỉ định (Bấm để chọn nhanh):
                          </label>
                          <div className="flex flex-wrap gap-1.5">
                            {REFERRAL_SERVICES_PRESETS.map((service) => {
                              const isSelected = referralServices.toLowerCase().includes(service.toLowerCase());
                              return (
                                <button
                                  key={service}
                                  type="button"
                                  onClick={() => handleToggleReferralService(service)}
                                  className={`text-xs px-2.5 py-1 rounded-lg border font-medium transition-all cursor-pointer ${
                                    isSelected
                                      ? 'bg-teal-600 text-white border-teal-600 shadow-2xs'
                                      : 'bg-white text-slate-700 border-slate-200 hover:border-teal-400 hover:bg-teal-50/50'
                                  }`}
                                >
                                  {isSelected ? '✓ ' : '+ '}
                                  {service}
                                </button>
                              );
                            })}
                          </div>
                          <input
                            type="text"
                            placeholder="Nhập hoặc chỉnh sửa danh sách kỹ thuật chỉ định..."
                            value={referralServices}
                            onChange={(e) => setReferralServices(e.target.value)}
                            className="w-full mt-2 px-3.5 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none text-slate-800 shadow-2xs font-medium"
                          />
                        </div>

                        {/* Chọn nơi tiếp nhận */}
                        <div className="space-y-1.5">
                          <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                            2. Đơn vị / Cơ sở tiếp nhận:
                          </label>
                          <div className="flex flex-wrap gap-1.5 mb-1.5">
                            {REFERRAL_TARGETS_PRESETS.map((target) => (
                              <button
                                key={target}
                                type="button"
                                onClick={() => setReferralTarget(target)}
                                className={`text-[11px] px-2.5 py-1 rounded-lg border transition-all cursor-pointer ${
                                  referralTarget === target
                                    ? 'bg-teal-700 text-white border-teal-700 font-bold'
                                    : 'bg-white text-slate-600 border-slate-200 hover:border-teal-300 font-medium'
                                }`}
                              >
                                {target}
                              </button>
                            ))}
                          </div>
                          <input
                            type="text"
                            placeholder="Tên bệnh viện hoặc trung tâm tiếp nhận..."
                            value={referralTarget}
                            onChange={(e) => setReferralTarget(e.target.value)}
                            className="w-full px-3.5 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none text-slate-800 shadow-2xs font-medium"
                          />
                        </div>

                        {/* Lý do chỉ định & Dặn dò */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1">
                              3. Lý do chuyển tuyến / Chỉ định:
                            </label>
                            <input
                              type="text"
                              placeholder="VD: Cần chụp X-quang/MRI để chẩn đoán phân biệt..."
                              value={referralReason}
                              onChange={(e) => setReferralReason(e.target.value)}
                              className="w-full px-3.5 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none text-slate-800 shadow-2xs font-medium"
                            />
                          </div>
                          <div>
                            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1">
                              4. Lời dặn dò người bệnh:
                            </label>
                            <input
                              type="text"
                              placeholder="VD: Mang kết quả quay lại YouMed để bác sĩ kết luận..."
                              value={referralNotes}
                              onChange={(e) => setReferralNotes(e.target.value)}
                              className="w-full px-3.5 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none text-slate-800 shadow-2xs font-medium"
                            />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="flex justify-end pt-2">
                    <Button onClick={saveMedicalRecord} isLoading={savingRecord} className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-7 py-2.5 rounded-lg shadow-sm">
                      {medicalRecord ? t('consultation.updateRecord') : t('common.save')}
                    </Button>
                  </div>
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
                className="bg-white rounded-2xl shadow-xs border border-slate-200/80 overflow-hidden"
              >
                <div className="p-5 sm:p-6 border-b border-slate-100 bg-slate-50/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-3.5">
                    <div className="w-10 h-10 rounded-lg bg-white text-teal-600 flex items-center justify-center shadow-2xs border border-slate-200">
                      <FiActivity className="w-5 h-5" />
                    </div>
                    <div>
                      <h2 className="text-lg font-bold text-slate-900">{t('consultation.prescription')}</h2>
                      <p className="text-xs font-medium text-slate-500">Đơn thuốc điện tử</p>
                    </div>
                  </div>
                  {isInProgress && !prescription && !showPrescriptionForm && (
                    <Button onClick={() => setShowPrescriptionForm(true)} leftIcon={<FiPlus className="w-4 h-4" />} className="bg-teal-600 hover:bg-teal-700 text-white font-semibold text-xs py-2 px-3.5 rounded-lg shadow-sm">Kê đơn thuốc</Button>
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
                        <div className="flex items-center justify-between">
                          <label className="block text-sm font-bold text-slate-700 uppercase tracking-wider">Danh sách Thuốc</label>
                          {masterMedicines.length > 0 && (
                            <span className="text-xs text-slate-400 font-medium">Hỗ trợ gợi ý tự động từ danh mục ({masterMedicines.length} thuốc)</span>
                          )}
                        </div>

                        {/* Datalist for autocomplete medicine names */}
                        <datalist id="master-medicines-list">
                          {masterMedicines.map(med => (
                            <option key={med.id} value={med.name}>
                              {med.unit ? `Đơn vị: ${med.unit}` : ''} {med.description ? `— ${med.description}` : ''}
                            </option>
                          ))}
                        </datalist>

                        {items.map((item, index) => (
                          <div key={index} className="flex flex-col sm:flex-row gap-3 items-start border-2 border-slate-100 p-5 rounded-2xl bg-white shadow-sm relative group hover:border-teal-200 transition-colors">
                            <div className="absolute -left-3 -top-3 w-8 h-8 bg-slate-900 text-white rounded-full flex items-center justify-center font-bold text-sm shadow-md">
                              {index + 1}
                            </div>
                            <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 w-full">
                              <Input 
                                list="master-medicines-list"
                                placeholder="Tên thuốc *" 
                                value={item.medicineName} 
                                onChange={e => handleItemChange(index, 'medicineName', e.target.value)} 
                                className="bg-slate-50" 
                              />
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

      {/* Print Prescription & Medical Record Modal */}
      <PrintPrescriptionModal
        isOpen={printModalOpen}
        onClose={() => setPrintModalOpen(false)}
        appointment={appointment}
        medicalRecord={medicalRecord}
        prescription={prescription}
      />

      {/* Print Referral Modal */}
      <PrintReferralModal
        isOpen={printReferralModalOpen}
        onClose={() => setPrintReferralModalOpen(false)}
        appointment={appointment}
        medicalRecord={medicalRecord}
      />
    </div>
  );
};

export default DoctorConsultation;
