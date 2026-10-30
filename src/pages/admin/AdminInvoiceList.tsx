import { useState, useEffect } from 'react';
import axiosClient from '../../api/axiosClient';
import { Card, Badge, ErrorMessage, EmptyState, Button, Input, PrintReceiptModal, Toast } from '../../components';
import { FiDollarSign, FiSearch, FiCheckCircle, FiChevronLeft, FiChevronRight, FiX, FiPrinter } from 'react-icons/fi';

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

const AdminInvoiceList = () => {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<{ type: 'success' | 'error' | 'info' | 'warning'; title: string; message?: string } | null>(null);
  
  // Search & Pagination state
  const [keyword, setKeyword] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  // Payment Modal State
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [paymentMethod, setPaymentMethod] = useState('CASH');

  // Receipt Print Modal State
  const [printReceiptModalOpen, setPrintReceiptModalOpen] = useState(false);
  const [receiptInvoice, setReceiptInvoice] = useState<Invoice | null>(null);

  const fetchInvoices = async () => {
    try {
      setLoading(true);
      setError(null);
      let url = `/invoices?page=${page}&size=10`;
      if (keyword) url += `&keyword=${encodeURIComponent(keyword)}`;
      if (statusFilter) url += `&status=${statusFilter}`;
      
      const response = await axiosClient.get<any>(url);
      setInvoices(response.data.content || []);
      setTotalPages(response.data.totalPages || 0);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Có lỗi xảy ra khi tải danh sách hóa đơn.');
      setInvoices([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvoices();
  }, [page, statusFilter]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(0);
    fetchInvoices();
  };

  const handleOpenPayment = (inv: Invoice) => {
    setSelectedInvoice(inv);
    setPaymentMethod('CASH');
    setPaymentModalOpen(true);
  };

  const handlePayInvoice = async () => {
    if (!selectedInvoice) return;
    try {
      await axiosClient.put(`/invoices/${selectedInvoice.id}/pay?paymentMethod=${paymentMethod}`);
      setToast({
        type: 'success',
        title: 'Thanh toán thành công',
        message: `Hóa đơn #${selectedInvoice.id} đã được quyết toán thành công.`,
      });
      setPaymentModalOpen(false);
      fetchInvoices();
    } catch (err: any) {
      setToast({
        type: 'error',
        title: 'Thanh toán thất bại',
        message: err.response?.data?.message || 'Có lỗi xảy ra khi thực hiện thanh toán.',
      });
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PENDING':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200 whitespace-nowrap">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0"></span>
            Chưa thanh toán
          </span>
        );
      case 'PAID':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 whitespace-nowrap">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0"></span>
            Đã thanh toán
          </span>
        );
      case 'CANCELLED':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200 whitespace-nowrap">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500 shrink-0"></span>
            Đã hủy
          </span>
        );
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'CONSULTATION': return 'Phí khám bệnh';
      case 'LAB_TEST': return 'Phí xét nghiệm/CLS';
      case 'PHARMACY': return 'Tiền thuốc';
      default: return type;
    }
  };

  return (
    <div className="space-y-6 relative">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Thanh toán Viện phí</h1>
          <p className="text-slate-500 text-sm mt-1">Tra cứu danh sách hóa đơn và tiến hành thu ngân.</p>
        </div>
      </div>

      <Card className="p-4 border-0 shadow-sm ring-1 ring-slate-200">
        <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4 items-end">
          <div className="flex-1 relative w-full">
            <label className="block text-sm font-medium text-slate-700 mb-1">Tìm kiếm</label>
            <Input
              type="text"
              placeholder="Tên bệnh nhân, số điện thoại..."
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
            />
          </div>
          <div className="w-full md:w-48">
            <label className="block text-sm font-medium text-slate-700 mb-1">Trạng thái</label>
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(0);
              }}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all text-sm"
            >
              <option value="">Tất cả trạng thái</option>
              <option value="PENDING">Chưa thanh toán</option>
              <option value="PAID">Đã thanh toán</option>
            </select>
          </div>
          <Button type="submit" leftIcon={<FiSearch />} className="w-full md:w-auto h-[46px] whitespace-nowrap">
            Tìm kiếm
          </Button>
        </form>
      </Card>

      <ErrorMessage message={error} />

      {!loading && invoices.length === 0 ? (
        <EmptyState 
          icon={<FiDollarSign />}
          title="Không tìm thấy hóa đơn"
          description="Chưa có dữ liệu hóa đơn nào phù hợp với tìm kiếm."
        />
      ) : invoices.length > 0 ? (
        <Card className="border-0 shadow-sm ring-1 ring-slate-200">
          <div className="overflow-hidden">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50/80 text-slate-500 font-semibold border-b border-slate-200">
                <tr>
                  <th className="px-3 py-3 whitespace-nowrap text-slate-600 uppercase tracking-wider w-16">Mã HĐ</th>
                  <th className="px-3 py-3 whitespace-nowrap text-slate-600 uppercase tracking-wider w-28">Thời gian</th>
                  <th className="px-3 py-3 whitespace-nowrap text-slate-600 uppercase tracking-wider w-28">Loại phí</th>
                  <th className="px-3 py-3 text-slate-600 uppercase tracking-wider">Nội dung</th>
                  <th className="px-3 py-3 whitespace-nowrap text-slate-600 uppercase tracking-wider w-36">Bệnh nhân</th>
                  <th className="px-3 py-3 whitespace-nowrap text-slate-600 uppercase tracking-wider w-28">Số tiền</th>
                  <th className="px-3 py-3 whitespace-nowrap text-slate-600 uppercase tracking-wider text-center w-32">Trạng thái</th>
                  <th className="px-3 py-3 whitespace-nowrap text-slate-600 uppercase tracking-wider text-right w-28">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {invoices.map((inv) => (
                  <tr key={inv.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="px-3 py-3 whitespace-nowrap font-mono font-semibold text-slate-900">
                      <span className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 text-[11px] font-bold">#{inv.id}</span>
                    </td>
                    <td className="px-3 py-3 whitespace-nowrap">
                      <div className="font-semibold text-slate-900">
                        {inv.createdAt ? new Date(inv.createdAt).toLocaleDateString('vi-VN') : '—'}
                      </div>
                      {inv.paymentDate ? (
                        <div className="text-emerald-700 font-medium text-[11px] mt-0.5 flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0"></span>
                          Đã thu {new Date(inv.paymentDate).toLocaleDateString('vi-VN')}
                        </div>
                      ) : (
                        <div className="text-amber-600 font-medium text-[11px] mt-0.5 flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0"></span>
                          Chờ thu
                        </div>
                      )}
                    </td>
                    <td className="px-3 py-3 whitespace-nowrap">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium bg-slate-100 text-slate-700 border border-slate-200/60">
                        {getTypeLabel(inv.type)}
                      </span>
                    </td>
                    <td className="px-3 py-3 text-slate-600">
                      <div className="truncate max-w-[150px] lg:max-w-[220px]" title={inv.description}>
                        {inv.description || '—'}
                      </div>
                    </td>
                    <td className="px-3 py-3 whitespace-nowrap">
                      <div className="font-semibold text-slate-900 truncate max-w-[140px]">{inv.patient?.fullName || '—'}</div>
                      {inv.appointment && (
                        <div className="text-[11px] text-slate-500 mt-0.5 font-mono">
                          Ca #{inv.appointment.id}
                        </div>
                      )}
                    </td>
                    <td className="px-3 py-3 whitespace-nowrap">
                      <div className="font-bold text-emerald-600 text-sm">
                        {inv.amount.toLocaleString('vi-VN')} ₫
                      </div>
                      {inv.paymentMethod && (
                        <div className="text-[10px] text-slate-500 mt-0.5">
                          <span className="px-1 py-0.2 bg-slate-100 rounded text-slate-600 font-medium">
                            {inv.paymentMethod}
                          </span>
                        </div>
                      )}
                    </td>
                    <td className="px-3 py-3 whitespace-nowrap text-center">
                      {getStatusBadge(inv.status)}
                    </td>
                    <td className="px-3 py-3 whitespace-nowrap text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {inv.status === 'PAID' && (
                          <Button 
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setReceiptInvoice(inv);
                              setPrintReceiptModalOpen(true);
                            }}
                            leftIcon={<FiPrinter className="text-emerald-600 shrink-0 w-3.5 h-3.5" />}
                            className="whitespace-nowrap border-slate-200 text-slate-700 hover:text-emerald-700 hover:border-emerald-300 font-medium shrink-0 h-8 px-2.5 text-xs shadow-none hover:shadow-sm"
                          >
                            In biên lai
                          </Button>
                        )}
                        {inv.status === 'PENDING' && (
                          <Button 
                            size="sm"
                            onClick={() => handleOpenPayment(inv)}
                            leftIcon={<FiCheckCircle className="shrink-0 w-3.5 h-3.5" />}
                            className="whitespace-nowrap shrink-0 h-8 px-2.5 text-xs"
                          >
                            Thanh toán
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {totalPages > 1 && (
            <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-between bg-slate-50/50">
              <span className="text-sm text-slate-500">
                Trang {page + 1} / {totalPages}
              </span>
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setPage(p => Math.max(0, p - 1))}
                  disabled={page === 0}
                >
                  <FiChevronLeft />
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
                  disabled={page >= totalPages - 1}
                >
                  <FiChevronRight />
                </Button>
              </div>
            </div>
          )}
        </Card>
      ) : null}

      {/* Payment Modal */}
      {paymentModalOpen && selectedInvoice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200 border border-slate-100">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-gradient-to-r from-emerald-50 via-teal-50/50 to-white">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                  <FiDollarSign className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-slate-900 leading-tight">Xác nhận thanh toán</h3>
                  <p className="text-xs text-slate-500">Hóa đơn #{selectedInvoice.id}</p>
                </div>
              </div>
              <button 
                onClick={() => setPaymentModalOpen(false)} 
                className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
              >
                <FiX className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6">
              {/* Summary Card */}
              <div className="bg-slate-50 rounded-xl p-3.5 border border-slate-200/80 mb-5 space-y-2 text-xs">
                <div className="flex justify-between items-center">
                  <span className="text-slate-500">Bệnh nhân:</span>
                  <span className="font-bold text-slate-900 text-sm">{selectedInvoice.patient.fullName}</span>
                </div>
                {selectedInvoice.appointment && (
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500">Mã ca khám:</span>
                    <span className="font-mono text-slate-700 font-medium">#{selectedInvoice.appointment.id}</span>
                  </div>
                )}
                <div className="flex justify-between items-center">
                  <span className="text-slate-500">Nội dung phí:</span>
                  <span className="text-slate-700 font-medium">{getTypeLabel(selectedInvoice.type)}</span>
                </div>
                <div className="pt-2 border-t border-slate-200/60 flex justify-between items-center">
                  <span className="font-semibold text-slate-700">Tổng tiền cần thu:</span>
                  <span className="text-lg font-bold text-emerald-600">
                    {selectedInvoice.amount.toLocaleString('vi-VN')} ₫
                  </span>
                </div>
              </div>

              {/* Payment Method Selector */}
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2.5">
                Phương thức thanh toán
              </label>
              <div className="grid grid-cols-1 gap-2.5">
                {[
                  { id: 'CASH', title: 'Tiền mặt tại quầy', desc: 'Thu tiền trực tiếp từ bệnh nhân' },
                  { id: 'TRANSFER', title: 'Chuyển khoản / Quét VietQR', desc: 'Quét mã ngân hàng tự động' }
                ].map((item) => (
                  <label 
                    key={item.id}
                    className={`flex items-start p-3.5 border rounded-xl cursor-pointer transition-all ${
                      paymentMethod === item.id 
                        ? 'border-emerald-500 bg-emerald-50/40 ring-1 ring-emerald-500 shadow-sm' 
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <input 
                      type="radio" 
                      name="paymentMethod" 
                      value={item.id}
                      checked={paymentMethod === item.id}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="w-4 h-4 mt-0.5 text-emerald-600 border-slate-300 focus:ring-emerald-500"
                    />
                    <div className="ml-3 flex-1">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-slate-900 text-sm">{item.title}</span>
                        {item.id === 'TRANSFER' && (
                          <span className="text-[10px] bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">
                            VietQR
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">{item.desc}</p>
                    </div>
                  </label>
                ))}
              </div>
              
              {/* Show QR Code for VNPAY or VietQR */}
              {paymentMethod !== 'CASH' && (
                <div className="mt-4 p-4 border border-slate-200 rounded-xl bg-slate-50 flex flex-col items-center justify-center animate-in fade-in zoom-in duration-200">
                  <p className="text-xs font-semibold text-slate-700 mb-2.5">Mã thanh toán VietQR chuyển khoản nhanh</p>
                  <div className="p-2 bg-white rounded-xl shadow-sm border border-slate-200 mb-2">
                    <img 
                      src={`https://img.vietqr.io/image/${import.meta.env.VITE_BANK_ID || 'vietinbank'}-${import.meta.env.VITE_BANK_ACCOUNT_NO || '100884561855'}-compact2.png?amount=${selectedInvoice.amount}&addInfo=${encodeURIComponent('Thanh toan HD ' + selectedInvoice.id)}&accountName=${encodeURIComponent(import.meta.env.VITE_BANK_ACCOUNT_NAME || 'PHONG KHAM YOUMED')}`} 
                      alt="Payment QR Code" 
                      className="w-48 h-48 object-contain"
                    />
                  </div>
                  <p className="text-[11px] text-slate-500 text-center">
                    Bệnh nhân mở App ngân hàng quét mã để thanh toán đúng số tiền.
                  </p>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 border-t border-slate-100 flex justify-end gap-3 bg-slate-50/70">
              <Button 
                variant="outline" 
                onClick={() => setPaymentModalOpen(false)}
                className="border-slate-200 text-slate-700 hover:bg-slate-100"
              >
                Hủy bỏ
              </Button>
              <Button 
                onClick={handlePayInvoice} 
                leftIcon={<FiCheckCircle className="shrink-0" />}
                className="shadow-sm"
              >
                Xác nhận đã thu tiền
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Print Receipt Modal */}
      <PrintReceiptModal
        isOpen={printReceiptModalOpen}
        onClose={() => setPrintReceiptModalOpen(false)}
        invoice={receiptInvoice}
      />

      {/* Floating Modern Toast Notification */}
      {toast && (
        <div className="fixed top-20 right-6 z-50">
          <Toast
            type={toast.type}
            title={toast.title}
            message={toast.message}
            onClose={() => setToast(null)}
          />
        </div>
      )}
    </div>
  );
};

export default AdminInvoiceList;
