import React from 'react';
import { FiPrinter, FiX } from 'react-icons/fi';

interface Invoice {
  id: number;
  amount: number;
  type: string;
  description: string;
  status: string;
  createdAt: string;
  paymentDate?: string;
  paymentMethod?: string;
  patient: {
    id: number;
    fullName: string;
  };
  appointment?: {
    id: number;
  };
}

interface PrintReceiptModalProps {
  isOpen: boolean;
  onClose: () => void;
  invoice: Invoice | null;
}

export const PrintReceiptModal: React.FC<PrintReceiptModalProps> = ({
  isOpen,
  onClose,
  invoice,
}) => {
  if (!isOpen || !invoice) return null;

  const handlePrint = () => {
    window.print();
  };

  const paymentDate = invoice.paymentDate ? new Date(invoice.paymentDate) : new Date();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-2 sm:p-4 overflow-hidden">
      <div className="relative w-full max-w-2xl h-[90vh] max-h-[90vh] bg-slate-100 rounded-3xl shadow-2xl overflow-hidden flex flex-col">
        
        {/* Controls Header - Not Printed */}
        <div className="no-print shrink-0 bg-white px-6 py-4 border-b border-slate-200 flex items-center justify-between shadow-xs z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
              <FiPrinter className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base">Xem trước Biên lai thu viện phí</h3>
              <p className="text-xs text-slate-500">Mẫu in phiếu thu tiền viện phí cho bệnh nhân</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <button
              onClick={handlePrint}
              className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-md hover:shadow-lg transition-all flex items-center gap-2 cursor-pointer"
            >
              <FiPrinter className="w-4 h-4" /> In biên lai / Lưu PDF
            </button>
            <button
              onClick={onClose}
              className="p-2.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <FiX className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Paper Area */}
        <div className="flex-1 min-h-0 overflow-y-auto p-4 sm:p-8 flex justify-center bg-slate-200/70">
          <div 
            id="printable-receipt"
            className="w-full max-w-[180mm] bg-white text-slate-900 p-8 sm:p-10 rounded-xl shadow-lg border border-slate-300 leading-normal font-sans"
          >
            {/* Header */}
            <div className="flex justify-between items-start border-b-2 border-slate-900 pb-4 mb-5">
              <div>
                <h1 className="text-lg font-black text-emerald-800 uppercase tracking-tight">
                  Phòng Khám Đa Khoa YouMed
                </h1>
                <p className="text-xs text-slate-600 font-medium mt-0.5">
                  123 Hải Triều, P. Bến Nghé, Quận 1, TP.HCM — Hotline: 1900 1234
                </p>
              </div>
              <div className="text-right text-xs">
                <p><span className="text-slate-500">Số phiếu:</span> <strong className="text-slate-900">HD-{invoice.id}</strong></p>
                <p><span className="text-slate-500">Ca khám:</span> <strong>#{invoice.appointment?.id || '—'}</strong></p>
              </div>
            </div>

            {/* Title */}
            <div className="text-center my-5">
              <h2 className="text-xl font-black text-slate-900 uppercase tracking-wider">
                Biên Lai Thu Tiền Viện Phí
              </h2>
              <p className="text-xs text-slate-500 italic mt-0.5">
                Ngày {paymentDate.getDate()} tháng {paymentDate.getMonth() + 1} năm {paymentDate.getFullYear()} ({paymentDate.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })})
              </p>
            </div>

            {/* Patient & Content Info */}
            <div className="space-y-3 text-xs mb-6">
              <div className="flex justify-between border-b border-dashed border-slate-200 pb-2">
                <span className="text-slate-600">Họ tên người nộp tiền / Bệnh nhân:</span>
                <strong className="text-slate-900 uppercase text-sm font-bold">{invoice.patient.fullName}</strong>
              </div>
              <div className="flex justify-between border-b border-dashed border-slate-200 pb-2">
                <span className="text-slate-600">Nội dung thanh toán:</span>
                <span className="text-slate-800 font-medium">{invoice.description}</span>
              </div>
              <div className="flex justify-between border-b border-dashed border-slate-200 pb-2">
                <span className="text-slate-600">Phương thức thanh toán:</span>
                <span className="font-semibold text-emerald-800 uppercase">{invoice.paymentMethod || 'Tiền mặt'}</span>
              </div>
              <div className="flex justify-between border-b-2 border-slate-900 py-3 items-center">
                <span className="text-sm font-bold text-slate-900">Tổng số tiền đã thu:</span>
                <span className="text-xl font-black text-emerald-700">
                  {invoice.amount.toLocaleString('vi-VN')} VNĐ
                </span>
              </div>
            </div>

            {/* Signatures */}
            <div className="grid grid-cols-2 text-center text-xs pt-6 border-t border-slate-200">
              <div className="flex flex-col justify-between h-36">
                <div>
                  <p className="font-bold text-slate-700 uppercase tracking-wide">Người nộp tiền</p>
                  <p className="text-[11px] text-slate-400 italic mt-0.5">(Ký và ghi rõ họ tên)</p>
                </div>
                <div>
                  <p className="font-bold text-slate-800 text-sm">{invoice.patient.fullName}</p>
                </div>
              </div>

              <div className="flex flex-col justify-between h-36">
                <div>
                  <p className="font-bold text-slate-900 uppercase tracking-wide">Người thu tiền / Thủ quỹ</p>
                  <p className="text-[11px] text-slate-400 italic mt-0.5">(Ký và đóng dấu)</p>
                </div>
                <div className="my-auto flex flex-col items-center">
                  <span className="text-[11px] text-emerald-700 font-semibold uppercase tracking-wider bg-emerald-50 border border-emerald-300 px-3 py-1 rounded-md shadow-xs">
                    ✓ ĐÃ THU TIỀN
                  </span>
                </div>
                <div>
                  <p className="font-bold text-slate-900 text-sm">Bộ phận Thu ngân YouMed</p>
                </div>
              </div>
            </div>

            {/* Notice */}
            <div className="mt-6 pt-3 border-t border-slate-200 flex justify-between items-center text-[10px] text-slate-400 italic">
              <span>Hệ thống quản lý phòng khám YouMed v2.0</span>
              <span>Quý khách vui lòng giữ lại biên lai để đối chiếu khi cần thiết</span>
              <span>Trang 1/1</span>
            </div>
          </div>
        </div>

      </div>

      {/* Global Receipt Print Style */}
      <style>{`
        @media print {
          body * {
            visibility: hidden !important;
          }
          #printable-receipt,
          #printable-receipt * {
            visibility: visible !important;
          }
          #printable-receipt {
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
            size: A5 landscape;
            margin: 10mm;
          }
        }
      `}</style>
    </div>
  );
};
