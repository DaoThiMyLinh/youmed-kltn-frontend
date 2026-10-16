import React from 'react';
import { FiPrinter, FiX, FiCheck } from 'react-icons/fi';
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
  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  const patientName = appointment?.patientName || medicalRecord?.patientName || 'Bệnh nhân';
  const doctorName = appointment?.doctorName || medicalRecord?.doctorName || 'Bác sĩ phụ trách';
  const specialty = appointment?.specialization || 'Đa khoa';
  const examDate = appointment?.appointmentTime ? new Date(appointment.appointmentTime) : new Date();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-2 sm:p-4 overflow-hidden">
      {/* Container Preview */}
      <div className="relative w-full max-w-4xl h-[92vh] max-h-[92vh] bg-slate-100 rounded-3xl shadow-2xl overflow-hidden flex flex-col">
        
        {/* Top Controls Bar - Not Printed */}
        <div className="no-print shrink-0 bg-white px-6 py-4 border-b border-slate-200 flex items-center justify-between shadow-xs z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
              <FiPrinter className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base">Xem trước bản in (Phiếu khám & Đơn thuốc)</h3>
              <p className="text-xs text-slate-500">Mẫu in tiêu chuẩn A4 phục vụ lưu trữ bệnh án và dặn dò bệnh nhân</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <button
              onClick={handlePrint}
              className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-md hover:shadow-lg transition-all flex items-center gap-2 cursor-pointer"
            >
              <FiPrinter className="w-4 h-4" /> In ngay / Lưu PDF
            </button>
            <button
              onClick={onClose}
              className="p-2.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
              title="Đóng"
            >
              <FiX className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Paper Area */}
        <div className="flex-1 min-h-0 overflow-y-auto p-4 sm:p-8 flex justify-center bg-slate-200/70">
          
          {/* Printable Document (A4 Styling) */}
          <div 
            id="printable-medical-record" 
            className="w-full max-w-[210mm] bg-white text-slate-900 p-8 sm:p-12 rounded-xl shadow-lg border border-slate-300/80 leading-normal font-sans"
          >
            {/* Header: Clinic Branding & Codes */}
            <div className="flex justify-between items-start border-b-2 border-slate-900 pb-4 mb-6">
              <div>
                <h1 className="text-xl font-extrabold text-emerald-800 tracking-tight uppercase">
                  Phòng Khám Đa Khoa YouMed
                </h1>
                <p className="text-xs text-slate-600 mt-1 font-medium">
                  Địa chỉ: 123 Đường Hải Triều, Phường Bến Nghé, Quận 1, TP. Hồ Chí Minh
                </p>
                <p className="text-xs text-slate-600 font-medium">
                  Hotline đặt khám: <span className="font-bold text-slate-800">1900 1234</span> — Website: <span className="text-emerald-700 font-semibold">youmed.vn</span>
                </p>
              </div>

              <div className="text-right text-xs space-y-1">
                <div><span className="text-slate-500">Mã ca khám:</span> <strong className="text-slate-900">#{appointment?.id || '—'}</strong></div>
                <div><span className="text-slate-500">Mã hồ sơ:</span> <strong className="text-slate-900">BA-{medicalRecord?.id || '—'}</strong></div>
                <div><span className="text-slate-500">Mã bệnh nhân:</span> <strong className="text-slate-900">BN-{appointment?.patientId || medicalRecord?.patientId || '—'}</strong></div>
              </div>
            </div>

            {/* Document Title */}
            <div className="text-center my-6">
              <h2 className="text-2xl font-black text-slate-900 uppercase tracking-wide">
                Phiếu Khám Bệnh & Đơn Thuốc
              </h2>
              <p className="text-xs text-slate-500 mt-1 italic">
                Thời gian khám: {examDate.toLocaleDateString('vi-VN')} lúc {examDate.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>

            {/* Part I: Patient Info */}
            <div className="mb-6">
              <h3 className="text-xs font-bold text-emerald-900 uppercase tracking-wider bg-emerald-50 px-3 py-1.5 rounded-md mb-3 border border-emerald-100">
                I. Thông tin hành chính
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-y-2 gap-x-4 text-xs">
                <div>
                  <span className="text-slate-500">Họ và tên:</span>{' '}
                  <strong className="text-slate-900 uppercase font-bold">{patientName}</strong>
                </div>
                <div>
                  <span className="text-slate-500">Giới tính:</span>{' '}
                  <strong className="text-slate-900">{appointment?.patientGender || '—'}</strong>
                </div>
                <div>
                  <span className="text-slate-500">Số điện thoại:</span>{' '}
                  <strong className="text-slate-900">{appointment?.patientPhone || '—'}</strong>
                </div>
                <div className="col-span-2 sm:col-span-3">
                  <span className="text-slate-500">Lý do khám ban đầu:</span>{' '}
                  <span className="text-slate-800">{appointment?.reason || 'Khám bệnh tổng quát'}</span>
                </div>
              </div>
            </div>

            {/* Part II: Examination & Diagnosis */}
            <div className="mb-6">
              <h3 className="text-xs font-bold text-emerald-900 uppercase tracking-wider bg-emerald-50 px-3 py-1.5 rounded-md mb-3 border border-emerald-100">
                II. Kết quả khám bệnh & Chẩn đoán
              </h3>
              <div className="space-y-2.5 text-xs">
                <div className="flex gap-4">
                  <div className="w-1/2">
                    <span className="text-slate-500">Bác sĩ khám:</span>{' '}
                    <strong className="text-slate-900">{doctorName}</strong>
                  </div>
                  <div className="w-1/2">
                    <span className="text-slate-500">Chuyên khoa:</span>{' '}
                    <strong className="text-emerald-800">{specialty}</strong>
                  </div>
                </div>

                <div>
                  <span className="text-slate-500 block mb-1">Triệu chứng lâm sàng ghi nhận:</span>
                  <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 font-medium">
                    {medicalRecord?.symptoms || 'Chưa ghi nhận triệu chứng đặc hiệu.'}
                  </div>
                </div>

                <div>
                  <span className="text-slate-500 block mb-1">Chẩn đoán xác định:</span>
                  <div className="p-3 bg-emerald-50/80 border border-emerald-300 rounded-lg text-emerald-950 font-bold text-sm">
                    {medicalRecord?.diagnosis || 'Chưa có kết luận chẩn đoán.'}
                  </div>
                </div>

                {medicalRecord?.notes && (
                  <div>
                    <span className="text-slate-500 block mb-1">Lời dặn & Hướng điều trị:</span>
                    <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 whitespace-pre-line">
                      {medicalRecord.notes}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Part III: Prescription Table */}
            <div className="mb-6">
              <h3 className="text-xs font-bold text-emerald-900 uppercase tracking-wider bg-emerald-50 px-3 py-1.5 rounded-md mb-3 border border-emerald-100 flex items-center justify-between">
                <span>III. Đơn thuốc & Chỉ định điều trị</span>
                {prescription && <span className="font-normal text-[11px] text-emerald-700">Mã đơn: #{prescription.id}</span>}
              </h3>

              {prescription && prescription.items && prescription.items.length > 0 ? (
                <div className="border border-slate-300 rounded-lg overflow-hidden">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-slate-100 border-b border-slate-300 font-bold text-slate-700">
                      <tr>
                        <th className="p-2.5 text-center w-10">STT</th>
                        <th className="p-2.5">Tên thuốc & Nồng độ / Hàm lượng</th>
                        <th className="p-2.5 text-center w-28">Số lượng / Liều</th>
                        <th className="p-2.5">Cách dùng & Hướng dẫn</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {prescription.items.map((item, idx) => (
                        <tr key={idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'}>
                          <td className="p-2.5 text-center font-bold text-slate-500">{idx + 1}</td>
                          <td className="p-2.5 font-bold text-slate-900">
                            {item.medicineName}
                            {item.duration && <span className="text-[11px] font-normal text-slate-500 block">Dùng trong: {item.duration}</span>}
                          </td>
                          <td className="p-2.5 text-center font-semibold text-slate-800">
                            {item.dosage}
                          </td>
                          <td className="p-2.5 text-slate-700">
                            <span className="font-medium text-emerald-800">{item.frequency}</span>
                            {item.instruction && <span className="text-slate-500 block text-[11px]">{item.instruction}</span>}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {prescription.note && (
                    <div className="p-3 bg-emerald-50/60 border-t border-slate-200 text-xs text-emerald-900 font-medium">
                      <strong>Dặn dò dùng thuốc:</strong> {prescription.note}
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-xs text-slate-500 italic p-3 bg-slate-50 rounded-lg border border-slate-200">
                  Bệnh nhân không có chỉ định dùng thuốc kê đơn hoặc theo dõi tái khám.
                </p>
              )}
            </div>

            {/* Part IV: Follow-up Appointment */}
            <div className="mb-8 p-3.5 bg-gradient-to-r from-emerald-50 to-slate-50 border border-emerald-200 rounded-xl">
              <div className="flex items-center justify-between text-xs">
                <div>
                  <span className="font-bold text-emerald-950 uppercase tracking-wide">
                    IV. Lịch hẹn tái khám:
                  </span>{' '}
                  {medicalRecord?.followUpDate ? (
                    <strong className="text-emerald-800 font-extrabold text-sm ml-1">
                      {new Date(medicalRecord.followUpDate).toLocaleDateString('vi-VN', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </strong>
                  ) : (
                    <span className="text-slate-600 ml-1">Tái khám khi có dấu hiệu bất thường hoặc hết thuốc.</span>
                  )}
                </div>
              </div>
              <p className="text-[11px] text-slate-500 mt-1">
                * Quý bệnh nhân vui lòng mang theo phiếu khám này và các kết quả xét nghiệm liên quan khi đến tái khám.
              </p>
            </div>

            {/* Signatures */}
            <div className="grid grid-cols-2 text-center text-xs pt-6 border-t border-slate-200">
              <div className="flex flex-col justify-between h-44">
                <div>
                  <p className="font-bold text-slate-700 uppercase tracking-wide">Người bệnh / Người đại diện</p>
                  <p className="text-[11px] text-slate-400 italic mt-0.5">(Ký và ghi rõ họ tên)</p>
                </div>
                <div>
                  <p className="font-bold text-slate-800 text-sm">{patientName}</p>
                </div>
              </div>

              <div className="flex flex-col justify-between h-44">
                <div>
                  <p className="text-slate-500 italic">
                    TP. Hồ Chí Minh, ngày {examDate.getDate()} tháng {examDate.getMonth() + 1} năm {examDate.getFullYear()}
                  </p>
                  <p className="font-bold text-slate-900 mt-1 uppercase tracking-wide">Bác sĩ khám bệnh</p>
                  <p className="text-[11px] text-slate-400 italic mt-0.5">(Ký, đóng dấu và ghi rõ họ tên)</p>
                </div>
                <div className="my-auto flex flex-col items-center">
                  <span className="text-[11px] text-emerald-700 font-semibold uppercase tracking-wider bg-emerald-50 border border-emerald-300 px-3 py-1 rounded-md shadow-xs">
                    ✓ Đã xác nhận y khoa
                  </span>
                </div>
                <div>
                  <p className="font-bold text-slate-900 text-sm">{doctorName}</p>
                  <p className="text-[10px] text-slate-500">Chuyên khoa: {specialty}</p>
                </div>
              </div>
            </div>

            {/* Footer Notice */}
            <div className="mt-8 pt-3 border-t border-slate-200 flex justify-between items-center text-[10px] text-slate-400">
              <span>Hệ thống quản lý phòng khám YouMed v2.0</span>
              <span>Đơn thuốc có giá trị trong vòng 05 ngày kể từ ngày kê đơn</span>
              <span>Trang 1/1</span>
            </div>
          </div>

        </div>
      </div>

      {/* Global Print Style Injection */}
      <style>{`
        @media print {
          body * {
            visibility: hidden !important;
          }
          #printable-medical-record,
          #printable-medical-record * {
            visibility: visible !important;
          }
          #printable-medical-record {
            position: fixed !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            height: auto !important;
            margin: 0 !important;
            padding: 10mm 15mm !important;
            box-shadow: none !important;
            border: none !important;
            border-radius: 0 !important;
            background: white !important;
            z-index: 999999 !important;
          }
          .no-print {
            display: none !important;
          }
          @page {
            size: A4 portrait;
            margin: 10mm;
          }
        }
      `}</style>
    </div>
  );
};
