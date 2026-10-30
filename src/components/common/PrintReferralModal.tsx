import React from 'react';
import { createPortal } from 'react-dom';
import { FiPrinter, FiX, FiShare2, FiCheck } from 'react-icons/fi';
import type { Appointment } from '../../types/patient';
import type { MedicalRecord } from '../../types/consultation';

interface PrintReferralModalProps {
  isOpen: boolean;
  onClose: () => void;
  appointment: Appointment | null;
  medicalRecord: MedicalRecord | null;
}

export const PrintReferralModal: React.FC<PrintReferralModalProps> = ({
  isOpen,
  onClose,
  appointment,
  medicalRecord,
}) => {
  const scrollContainerRef = React.useRef<HTMLDivElement>(null);

  // Khóa cuộn trang nền và đặt lại vị trí cuộn lên đầu khi mở modal
  React.useEffect(() => {
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

  const patientName = appointment?.patientName || medicalRecord?.patientName || 'Bệnh nhân';
  const doctorName = appointment?.doctorName || medicalRecord?.doctorName || 'Bác sĩ phụ trách';
  const specialty = appointment?.specialization || 'Đa khoa';
  const examDate = appointment?.appointmentTime ? new Date(appointment.appointmentTime) : new Date();

  const servicesList = medicalRecord?.referralServices
    ? medicalRecord.referralServices.split(',').map(s => s.trim()).filter(Boolean)
    : [];

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
              <FiShare2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-sm sm:text-base">Xem trước Giấy giới thiệu chuyển tuyến</h3>
              <p className="text-xs text-slate-500">Mẫu in tiêu chuẩn A4 phục vụ chụp chiếu, xét nghiệm chuyên sâu</p>
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
          {/* Printable Document (A4 Clean Styling) */}
          <div 
            id="printable-referral-record" 
            className="w-full max-w-[760px] mx-auto bg-white text-slate-900 p-6 sm:p-10 rounded-lg shadow-md border border-slate-300 leading-normal font-sans box-border"
          >
            {/* Header: National Emblem & Clinic Info */}
            <div className="flex justify-between items-start border-b-2 border-slate-900 pb-4 mb-6">
              <div>
                <h1 className="text-xl font-extrabold text-emerald-800 tracking-tight uppercase">
                  Phòng Khám Đa Khoa YouMed
                </h1>
                <p className="text-xs text-slate-600 mt-1 font-medium">
                  Địa chỉ: 123 Đường Hải Triều, Phường Bến Nghé, Quận 1, TP. Hồ Chí Minh
                </p>
                <p className="text-xs text-slate-600 font-medium">
                  Hotline hỗ trợ: <span className="font-bold text-slate-800">1900 1234</span> — Website: <span className="text-emerald-700 font-semibold">youmed.vn</span>
                </p>
              </div>

              <div className="text-right text-xs space-y-1">
                <div><span className="text-slate-500">Mã chuyển tuyến:</span> <strong className="text-slate-900">GT-{medicalRecord?.id || '—'}</strong></div>
                <div><span className="text-slate-500">Mã ca khám:</span> <strong className="text-slate-900">#{appointment?.id || '—'}</strong></div>
                <div><span className="text-slate-500">Mã bệnh nhân:</span> <strong className="text-slate-900">BN-{appointment?.patientId || '—'}</strong></div>
              </div>
            </div>

            {/* Document Title */}
            <div className="text-center my-6">
              <h2 className="text-2xl font-black text-slate-900 uppercase tracking-wide">
                Giấy Giới Thiệu Chuyển Tuyến
              </h2>
              <p className="text-sm font-bold text-emerald-800 uppercase mt-1 tracking-wider">
                Phiếu Chỉ Định Cận Lâm Sàng & Chẩn Đoán Hình Ảnh
              </p>
              <p className="text-xs text-slate-500 italic mt-1">
                (Ban hành phục vụ chuyển tiếp bệnh nhân chụp X-quang, MRI, CT và xét nghiệm chuyên sâu)
              </p>
            </div>

            {/* Target Destination Box */}
            <div className="my-5 p-4 bg-slate-50 rounded-xl border border-slate-300 text-sm">
              <div className="flex items-start gap-2">
                <span className="font-bold text-slate-900 uppercase tracking-wider min-w-[130px]">Kính gửi đơn vị:</span>
                <span className="font-extrabold text-emerald-900 text-base">
                  {medicalRecord?.referralTarget || 'Các Bệnh viện / Trung tâm Chẩn đoán Hình ảnh Y khoa Chuyên sâu'}
                </span>
              </div>
              <p className="text-xs text-slate-500 italic mt-1.5 pl-[138px]">
                Phòng khám Đa khoa YouMed trân trọng giới thiệu người bệnh dưới đây đến quý đơn vị để được phối hợp thăm khám và thực hiện các chỉ định cận lâm sàng kỹ thuật cao.
              </p>
            </div>

            {/* Patient General Info Grid */}
            <div className="bg-slate-50/70 p-4 rounded-xl border border-slate-200 text-sm grid grid-cols-2 sm:grid-cols-3 gap-y-3 gap-x-4 mb-6">
              <div>
                <span className="text-slate-500 text-xs block">Họ và tên người bệnh:</span>
                <strong className="text-slate-900 uppercase font-extrabold text-base">{patientName}</strong>
              </div>
              <div>
                <span className="text-slate-500 text-xs block">Giới tính:</span>
                <strong className="text-slate-800">{appointment?.patientGender === 'FEMALE' ? 'Nữ' : 'Nam'}</strong>
              </div>
              <div>
                <span className="text-slate-500 text-xs block">Số điện thoại liên hệ:</span>
                <strong className="text-slate-800">{appointment?.patientPhone || '—'}</strong>
              </div>
              <div>
                <span className="text-slate-500 text-xs block">Bác sĩ giới thiệu:</span>
                <strong className="text-slate-800">{doctorName}</strong>
              </div>
              <div>
                <span className="text-slate-500 text-xs block">Chuyên khoa khám:</span>
                <strong className="text-slate-800">Khoa {specialty}</strong>
              </div>
              <div>
                <span className="text-slate-500 text-xs block">Ngày lập phiếu:</span>
                <strong className="text-slate-800">{examDate.toLocaleDateString('vi-VN')}</strong>
              </div>
            </div>

            {/* Clinical Summary & Initial Diagnosis */}
            <div className="mb-6 space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 border-b border-slate-200 pb-1 flex items-center gap-1.5">
                <span>I. Tóm tắt tình trạng lâm sàng & Chẩn đoán sơ bộ</span>
              </h3>
              <div className="text-sm space-y-2 pl-2">
                <div>
                  <span className="font-semibold text-slate-700">Triệu chứng lâm sàng ghi nhận: </span>
                  <span className="text-slate-900">{medicalRecord?.symptoms || 'Không có triệu chứng bất thường'}</span>
                </div>
                <div>
                  <span className="font-semibold text-slate-700">Chẩn đoán sơ bộ tại YouMed: </span>
                  <span className="font-bold text-slate-950 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    {medicalRecord?.diagnosis || 'Theo dõi và chẩn đoán phân biệt'}
                  </span>
                </div>
                {medicalRecord?.referralReason && (
                  <div>
                    <span className="font-semibold text-slate-700">Lý do chỉ định chuyển tuyến: </span>
                    <span className="text-slate-800 italic">{medicalRecord.referralReason}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Requested Imaging & Lab Tests */}
            <div className="mb-6 space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 border-b border-slate-200 pb-1 flex items-center gap-1.5">
                <span>II. Các kỹ thuật & Dịch vụ cận lâm sàng yêu cầu thực hiện</span>
              </h3>
              
              {servicesList.length > 0 ? (
                <div className="border border-slate-200 rounded-xl overflow-hidden mt-2">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-slate-100 text-xs uppercase tracking-wider text-slate-700 border-b border-slate-200">
                      <tr>
                        <th className="py-2.5 px-4 w-12 text-center">STT</th>
                        <th className="py-2.5 px-4">Tên dịch vụ / Kỹ thuật chỉ định</th>
                        <th className="py-2.5 px-4 w-40 text-center">Yêu cầu chuyên môn</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {servicesList.map((service, idx) => (
                        <tr key={idx} className="hover:bg-slate-50/50">
                          <td className="py-3 px-4 text-center font-bold text-slate-500">{idx + 1}</td>
                          <td className="py-3 px-4 font-bold text-slate-900 flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-emerald-600 inline-block"></span>
                            <span>{service}</span>
                          </td>
                          <td className="py-3 px-4 text-center text-xs text-slate-600 font-medium">
                            Chụp & Trả kết quả phim / Kết quả xét nghiệm
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-sm text-slate-700 italic">
                  Thực hiện các kỹ thuật thăm dò hình ảnh (X-quang / Siêu âm / MRI) theo đánh giá chuyên khoa của cơ sở tiếp nhận.
                </div>
              )}
            </div>

            {/* Instructions & Notes */}
            <div className="mb-8 p-4 bg-emerald-50/60 rounded-xl border border-emerald-200 text-xs text-slate-800 space-y-1.5">
              <div className="font-bold text-emerald-900 uppercase tracking-wide flex items-center gap-1.5">
                <FiCheck className="text-emerald-700" />
                Lời dặn dò người bệnh & Hướng dẫn phối hợp:
              </div>
              <p>• Người bệnh mang theo giấy giới thiệu này kèm CCCD/BHYT khi đến cơ sở tiếp nhận để được ưu tiên thực hiện cận lâm sàng.</p>
              <p>• Sau khi hoàn thành và có kết quả phim chụp / xét nghiệm, người bệnh vui lòng mang kết quả quay lại Phòng khám Đa khoa YouMed để Bác sĩ xem xét và hoàn thiện phác đồ điều trị chính xác.</p>
              {medicalRecord?.referralNotes && (
                <p className="font-semibold text-slate-900 pt-1">
                  • <strong>Dặn dò riêng của Bác sĩ:</strong> {medicalRecord.referralNotes}
                </p>
              )}
            </div>

            {/* Signatures */}
            <div className="grid grid-cols-2 gap-8 text-center text-xs pt-4 border-t border-slate-200">
              <div className="flex flex-col justify-between h-44">
                <div>
                  <p className="font-bold uppercase text-slate-700">Người bệnh / Người nhà</p>
                  <p className="text-slate-400 italic text-[11px] mt-0.5">(Ký và ghi rõ họ tên)</p>
                </div>
                <div>
                  <p className="font-bold text-slate-800 text-sm">{patientName}</p>
                </div>
              </div>

              <div className="flex flex-col justify-between h-44">
                <div>
                  <p className="text-slate-500 italic text-[11px]">
                    TP. Hồ Chí Minh, ngày {examDate.getDate()} tháng {examDate.getMonth() + 1} năm {examDate.getFullYear()}
                  </p>
                  <p className="font-bold uppercase text-slate-900 mt-1">Bác sĩ chỉ định chuyển tuyến</p>
                  <p className="text-slate-400 italic text-[11px] mt-0.5">(Ký, đóng dấu & ghi rõ họ tên)</p>
                </div>

                <div className="flex items-center justify-center my-1">
                  <span className="text-xs text-emerald-700 font-semibold italic tracking-wider border border-emerald-300 bg-emerald-50/80 px-3 py-1 rounded-md shadow-2xs">
                    ✓ Đã ký & Xác nhận chuyên môn
                  </span>
                </div>

                <div>
                  <p className="font-bold text-slate-950 text-sm">{doctorName}</p>
                  <p className="text-slate-500 text-[11px]">Chuyên khoa: {specialty}</p>
                </div>
              </div>
            </div>

            {/* Footer Notice */}
            <div className="mt-8 pt-4 border-t border-slate-100 text-[10px] text-center text-slate-400 flex items-center justify-between">
              <span>Hệ thống quản lý phòng khám YouMed v2.0</span>
              <span>Phiếu này có giá trị trong vòng 10 ngày kể từ ngày ký</span>
              <span>Trang 1/1</span>
            </div>

          </div>
        </div>

      </div>

      {/* Global Print Style Injection */}
      <style>{`
        @media print {
          body {
            visibility: hidden !important;
            background: white !important;
          }
          #printable-referral-record,
          #printable-referral-record * {
            visibility: visible !important;
          }
          #printable-referral-record {
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
export default PrintReferralModal;

