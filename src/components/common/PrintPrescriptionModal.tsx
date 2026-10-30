import React, { useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { FiPrinter, FiX } from 'react-icons/fi';
import type { Appointment } from '../../types/patient';
import type { MedicalRecord, Prescription } from '../../types/consultation';

interface PrintPrescriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  appointment: Appointment | null;
  medicalRecord: MedicalRecord | null;
  prescription: Prescription | null;
}

export const PrintPrescriptionModal: React.FC<PrintPrescriptionModalProps> = ({
  isOpen,
  onClose,
  appointment,
  medicalRecord,
  prescription,
}) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Khóa cuộn trang nền và đặt lại vị trí cuộn lên đầu khi mở modal
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';

      const timer = setTimeout(() => {
        if (scrollContainerRef.current) {
          scrollContainerRef.current.scrollTop = 0;
        }
      }, 20);

      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') onClose();
      };
      window.addEventListener('keydown', handleKeyDown);

      return () => {
        clearTimeout(timer);
        window.removeEventListener('keydown', handleKeyDown);
        document.body.style.overflow = '';
      };
    } else {
      document.body.style.overflow = '';
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  const parseDate = (dateStr?: string) => {
    if (!dateStr) return new Date();
    try {
      if (dateStr.includes('Z') || dateStr.includes('+') || dateStr.match(/-\d{2}:\d{2}$/)) {
        return new Date(dateStr);
      }
      const [datePart, timePart] = dateStr.split('T');
      if (!datePart) return new Date(dateStr);
      const [y, m, d] = datePart.split('-').map(Number);
      const [h, min, s] = (timePart || '00:00:00').split(':').map(Number);
      return new Date(y, m - 1, d, h, min, s || 0);
    } catch {
      return new Date();
    }
  };

  const patientName = appointment?.patientName || medicalRecord?.patientName || 'Bệnh nhân';
  const doctorName = appointment?.doctorName || medicalRecord?.doctorName || 'Bác sĩ phụ trách';
  const specialty = appointment?.specialization || 'Đa khoa';
  const examDate = parseDate(appointment?.appointmentTime);

  const modalContent = (
    <div 
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-900/70 backdrop-blur-xs p-2 sm:p-4 overflow-hidden"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      {/* Container Preview Dialog */}
      <div className="relative w-full max-w-4xl h-[92vh] max-h-[92vh] bg-slate-100 rounded-2xl shadow-2xl overflow-hidden flex flex-col border border-slate-300">
        
        {/* Top Controls Bar - Not Printed */}
        <div className="no-print shrink-0 bg-white px-5 py-3 border-b border-slate-200 flex items-center justify-between shadow-xs z-10">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center">
              <FiPrinter className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-sm sm:text-base">Xem trước bản in (Đơn thuốc & Phiếu khám)</h3>
              <p className="text-xs text-slate-500">Mẫu in khổ A4 chuẩn mực y tế, rõ nét và tiết kiệm mực</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2.5">
            <button
              onClick={handlePrint}
              className="px-4 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 active:scale-95 text-white font-semibold text-xs sm:text-sm shadow-sm transition-all flex items-center gap-2 cursor-pointer"
            >
              <FiPrinter className="w-4 h-4" /> In phiếu / Lưu PDF
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
              title="Đóng (Esc)"
            >
              <FiX className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Paper Area: Use block with mx-auto on paper to avoid negative coordinate clipping */}
        <div 
          ref={scrollContainerRef}
          className="flex-1 min-h-0 overflow-y-auto p-3 sm:p-6 bg-slate-200/90"
        >
          {/* Printable Document (A4 Clean Medical Standard) */}
          <div 
            id="printable-medical-record" 
            className="w-full max-w-[760px] mx-auto bg-white text-slate-900 p-6 sm:p-10 shadow-md border border-slate-300 rounded-lg leading-normal font-sans box-border"
          >
            {/* Header: Clinic Branding & Administrative Codes */}
            <div className="flex justify-between items-start border-b border-slate-800 pb-3 mb-5">
              <div>
                <h1 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight uppercase">
                  Phòng Khám Đa Khoa Quốc Tế YouMed
                </h1>
                <p className="text-xs text-slate-600 mt-0.5">
                  Địa chỉ: 123 Đường Hải Triều, P. Bến Nghé, Quận 1, TP. Hồ Chí Minh
                </p>
                <p className="text-xs text-slate-600">
                  Hotline: <span className="font-semibold text-slate-800">1900 1234</span> &bull; Website: www.youmed.vn
                </p>
              </div>

              <div className="text-right text-xs space-y-0.5 font-mono">
                <div><span className="text-slate-500">Mã đơn:</span> <strong className="text-slate-900">#{prescription?.id || appointment?.id || '—'}</strong></div>
                <div><span className="text-slate-500">Mã hồ sơ:</span> <strong className="text-slate-900">BA-{medicalRecord?.id || '—'}</strong></div>
                <div><span className="text-slate-500">Mã BN:</span> <strong className="text-slate-900">BN-{appointment?.patientId || medicalRecord?.patientId || '—'}</strong></div>
              </div>
            </div>

            {/* Document Title */}
            <div className="text-center my-4">
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 uppercase tracking-wide">
                Phiếu Khám Bệnh & Đơn Thuốc
              </h2>
              <p className="text-xs text-slate-500 mt-1 italic">
                Thời gian khám: {examDate.toLocaleDateString('vi-VN')} &bull; Giờ: {examDate.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>

            {/* Part I: Administrative Information */}
            <div className="mb-5">
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider border-b border-slate-300 pb-1 mb-2">
                I. Thông tin hành chính
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-y-1.5 gap-x-4 text-xs">
                <div>
                  <span className="text-slate-500">Họ và tên:</span>{' '}
                  <strong className="text-slate-900 uppercase font-bold">{patientName}</strong>
                </div>
                <div>
                  <span className="text-slate-500">Giới tính:</span>{' '}
                  <strong className="text-slate-900">
                    {appointment?.patientGender === 'FEMALE' ? 'Nữ' : appointment?.patientGender === 'MALE' ? 'Nam' : (appointment?.patientGender || '—')}
                  </strong>
                </div>
                <div>
                  <span className="text-slate-500">Điện thoại:</span>{' '}
                  <strong className="text-slate-900">{appointment?.patientPhone || '—'}</strong>
                </div>
                <div className="col-span-2 sm:col-span-3">
                  <span className="text-slate-500">Lý do đến khám:</span>{' '}
                  <span className="text-slate-800">{appointment?.reason || 'Khám bệnh'}</span>
                </div>
              </div>
            </div>

            {/* Part II: Examination & Diagnosis */}
            <div className="mb-5">
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider border-b border-slate-300 pb-1 mb-2">
                II. Kết quả khám bệnh & Chẩn đoán
              </h3>
              <div className="space-y-2 text-xs">
                <div className="flex gap-4">
                  <div className="w-1/2">
                    <span className="text-slate-500">Bác sĩ khám:</span>{' '}
                    <strong className="text-slate-900">{doctorName}</strong>
                  </div>
                  <div className="w-1/2">
                    <span className="text-slate-500">Chuyên khoa:</span>{' '}
                    <strong className="text-slate-900">{specialty}</strong>
                  </div>
                </div>

                {medicalRecord?.symptoms && (
                  <div>
                    <span className="text-slate-500 block mb-0.5 font-medium">Triệu chứng lâm sàng:</span>
                    <p className="text-slate-800 pl-2 border-l-2 border-slate-300">
                      {medicalRecord.symptoms}
                    </p>
                  </div>
                )}

                <div>
                  <span className="text-slate-500 block mb-0.5 font-medium">Chẩn đoán xác định:</span>
                  <p className="text-slate-900 font-bold text-sm pl-2 border-l-2 border-slate-800">
                    {medicalRecord?.diagnosis || 'Chưa có kết luận chẩn đoán.'}
                  </p>
                </div>

                {medicalRecord?.notes && (
                  <div>
                    <span className="text-slate-500 block mb-0.5 font-medium">Lời dặn & Hướng điều trị:</span>
                    <p className="text-slate-700 pl-2 border-l-2 border-slate-300 whitespace-pre-line">
                      {medicalRecord.notes}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Part III: Prescription Table */}
            <div className="mb-5">
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider border-b border-slate-300 pb-1 mb-2 flex items-center justify-between">
                <span>III. Đơn thuốc & Chỉ định điều trị</span>
                {prescription && <span className="font-normal font-mono text-[11px] text-slate-500">Mã kê đơn: #{prescription.id}</span>}
              </h3>

              {prescription && prescription.items && prescription.items.length > 0 ? (
                <div className="border border-slate-400 overflow-hidden">
                  <table className="w-full text-xs text-left border-collapse">
                    <thead className="bg-slate-100 border-b border-slate-400 font-bold text-slate-800">
                      <tr>
                        <th className="p-2 text-center w-10 border-r border-slate-300">STT</th>
                        <th className="p-2 border-r border-slate-300">Tên thuốc & Hàm lượng</th>
                        <th className="p-2 text-center w-28 border-r border-slate-300">Số lượng / Liều</th>
                        <th className="p-2">Cách dùng & Hướng dẫn</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-300">
                      {prescription.items.map((item, idx) => (
                        <tr key={idx} className="bg-white">
                          <td className="p-2 text-center font-bold text-slate-600 border-r border-slate-300">{idx + 1}</td>
                          <td className="p-2 font-bold text-slate-900 border-r border-slate-300">
                            {item.medicineName}
                            {item.duration && <span className="text-[11px] font-normal text-slate-600 block">Thời gian: {item.duration}</span>}
                          </td>
                          <td className="p-2 text-center font-semibold text-slate-800 border-r border-slate-300">
                            {item.dosage}
                          </td>
                          <td className="p-2 text-slate-800">
                            <span className="font-medium text-slate-900">{item.frequency}</span>
                            {item.instruction && <span className="text-slate-600 block text-[11px] italic">{item.instruction}</span>}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {prescription.note && (
                    <div className="p-2.5 bg-slate-50 border-t border-slate-300 text-xs text-slate-800">
                      <strong>Lưu ý dùng thuốc:</strong> {prescription.note}
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-xs text-slate-500 italic p-3 border border-slate-200">
                  Bệnh nhân không có chỉ định dùng thuốc kê đơn hoặc theo dõi tái khám.
                </p>
              )}
            </div>

            {/* Part IV: Follow-up Appointment */}
            <div className="mb-6 py-2 px-3 border border-slate-300 text-xs">
              <div>
                <span className="font-bold text-slate-900 uppercase tracking-wide">
                  IV. Lịch hẹn tái khám:
                </span>{' '}
                {medicalRecord?.followUpDate ? (
                  <strong className="text-slate-900 font-bold ml-1">
                    {new Date(medicalRecord.followUpDate).toLocaleDateString('vi-VN', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </strong>
                ) : (
                  <span className="text-slate-700 ml-1">Tái khám khi có dấu hiệu bất thường hoặc hết thuốc.</span>
                )}
              </div>
              <p className="text-[11px] text-slate-500 mt-0.5 italic">
                * Quý bệnh nhân vui lòng mang theo đơn thuốc này khi đến tái khám.
              </p>
            </div>

            {/* Signatures */}
            <div className="grid grid-cols-2 text-center text-xs pt-4 border-t border-slate-300">
              <div className="flex flex-col justify-between h-40">
                <div>
                  <p className="font-bold text-slate-800 uppercase tracking-wide">Người bệnh / Người đại diện</p>
                  <p className="text-[11px] text-slate-500 italic mt-0.5">(Ký và ghi rõ họ tên)</p>
                </div>
                <div>
                  <p className="font-bold text-slate-900 text-sm">{patientName}</p>
                </div>
              </div>

              <div className="flex flex-col justify-between h-40">
                <div>
                  <p className="text-slate-600 italic">
                    TP. Hồ Chí Minh, ngày {examDate.getDate()} tháng {examDate.getMonth() + 1} năm {examDate.getFullYear()}
                  </p>
                  <p className="font-bold text-slate-900 mt-1 uppercase tracking-wide">Bác sĩ khám bệnh</p>
                  <p className="text-[11px] text-slate-500 italic mt-0.5">(Ký, đóng dấu và ghi rõ họ tên)</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 italic mb-1">[Đã ký điện tử xác thực]</p>
                  <p className="font-bold text-slate-900 text-sm">{doctorName}</p>
                  <p className="text-[11px] text-slate-600">Chuyên khoa: {specialty}</p>
                </div>
              </div>
            </div>

            {/* Footer Notice */}
            <div className="mt-6 pt-2 border-t border-slate-200 flex justify-between items-center text-[10px] text-slate-500">
              <span>Hệ thống Quản lý Y tế YouMed</span>
              <span>Đơn thuốc có giá trị trong vòng 05 ngày kể từ ngày kê đơn</span>
              <span>Trang 1/1</span>
            </div>
          </div>

        </div>
      </div>

      {/* Clean, Non-Cutting Print Media Styles */}
      <style>{`
        @media print {
          body {
            visibility: hidden !important;
            background: white !important;
          }
          #printable-medical-record,
          #printable-medical-record * {
            visibility: visible !important;
          }
          #printable-medical-record {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            margin: 0 !important;
            padding: 8mm 12mm !important;
            box-shadow: none !important;
            border: none !important;
            border-radius: 0 !important;
            background: white !important;
          }
          .no-print {
            display: none !important;
          }
          @page {
            size: A4 portrait;
            margin: 8mm;
          }
        }
      `}</style>
    </div>
  );

  return createPortal(modalContent, document.body);
};

