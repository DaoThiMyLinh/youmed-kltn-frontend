import React, { useState, useEffect } from 'react';
import axiosClient from '../../api/axiosClient';
import { Card, Badge, ErrorMessage, EmptyState, Button, Input } from '../../components';
import { FiDollarSign, FiSearch, FiCheckCircle, FiChevronLeft, FiChevronRight, FiX } from 'react-icons/fi';
import { useTranslation } from 'react-i18next';

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
  const { t } = useTranslation();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Search & Pagination state
  const [keyword, setKeyword] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  // Payment Modal State
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [paymentMethod, setPaymentMethod] = useState('CASH');

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
      alert('Thanh toán thành công!');
      setPaymentModalOpen(false);
      fetchInvoices();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Có lỗi xảy ra khi thanh toán.');
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PENDING': return <Badge variant="warning">Chưa thanh toán</Badge>;
      case 'PAID': return <Badge variant="success">Đã thanh toán</Badge>;
      case 'CANCELLED': return <Badge variant="danger">Đã hủy</Badge>;
      default: return <Badge variant="secondary">{status}</Badge>;
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
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
            >
              <option value="">Tất cả</option>
              <option value="PENDING">Chưa thanh toán</option>
              <option value="PAID">Đã thanh toán</option>
            </select>
          </div>
          <Button type="submit" leftIcon={<FiSearch />} className="w-full md:w-auto h-[46px]">Tìm kiếm</Button>
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
        <Card className="overflow-hidden border-0 shadow-sm ring-1 ring-slate-200">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-slate-50 text-slate-500 font-medium border-b border-slate-200">
                <tr>
                  <th className="px-6 py-4">Mã HĐ</th>
                  <th className="px-6 py-4">Thời gian</th>
                  <th className="px-6 py-4">Loại phí</th>
                  <th className="px-6 py-4">Mô tả</th>
                  <th className="px-6 py-4">Bệnh nhân</th>
                  <th className="px-6 py-4">Số tiền</th>
                  <th className="px-6 py-4">Trạng thái</th>
                  <th className="px-6 py-4 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {invoices.map((inv) => (
                  <tr key={inv.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4 font-mono font-medium text-slate-900">
                      #{inv.id}
                    </td>
                    <td className="px-6 py-4 text-xs">
                      <div className="font-semibold text-slate-900">
                        {inv.createdAt ? new Date(inv.createdAt).toLocaleDateString('vi-VN') : '—'}
                      </div>
                      {inv.paymentDate ? (
                        <div className="text-emerald-600 font-medium text-[11px] mt-0.5">
                          Đã thu: {new Date(inv.paymentDate).toLocaleDateString('vi-VN')} {new Date(inv.paymentDate).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      ) : (
                        <div className="text-amber-500 text-[11px] mt-0.5">Chờ thu tiền</div>
                      )}
                    </td>
                    <td className="px-6 py-4 font-medium text-slate-700">
                      {getTypeLabel(inv.type)}
                    </td>
                    <td className="px-6 py-4 text-slate-500">
                      {inv.description}
                    </td>
                    <td className="px-6 py-4 font-semibold text-slate-900">
                      {inv.patient.fullName}
                      {inv.appointment && <div className="text-xs font-normal text-slate-500">Ca khám: #{inv.appointment.id}</div>}
                    </td>
                    <td className="px-6 py-4 font-bold text-emerald-600">
                      {inv.amount.toLocaleString('vi-VN')} ₫
                      {inv.paymentMethod && <div className="text-xs font-normal text-slate-500 mt-1">Qua {inv.paymentMethod}</div>}
                    </td>
                    <td className="px-6 py-4">
                      {getStatusBadge(inv.status)}
                    </td>
                    <td className="px-6 py-4 text-right">
                      {inv.status === 'PENDING' && (
                        <Button 
                          size="sm"
                          onClick={() => handleOpenPayment(inv)}
                          leftIcon={<FiCheckCircle />}
                        >
                          Thanh toán
                        </Button>
                      )}
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
      {paymentModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <h3 className="font-bold text-lg text-slate-900">Xác nhận thanh toán</h3>
              <button onClick={() => setPaymentModalOpen(false)} className="text-slate-400 hover:text-slate-600 transition-colors">
                <FiX className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6">
              <label className="block text-sm font-medium text-slate-700 mb-3">Chọn phương thức thanh toán</label>
              <div className="grid grid-cols-1 gap-3">
                {['CASH', 'TRANSFER'].map((method) => (
                  <label 
                    key={method}
                    className={`flex items-center p-4 border rounded-xl cursor-pointer transition-all ${paymentMethod === method ? 'border-emerald-500 bg-emerald-50/50 ring-1 ring-emerald-500' : 'border-slate-200 hover:border-slate-300'}`}
                  >
                    <input 
                      type="radio" 
                      name="paymentMethod" 
                      value={method}
                      checked={paymentMethod === method}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="w-4 h-4 text-emerald-600 border-slate-300 focus:ring-emerald-500"
                    />
                    <div className="ml-3 flex-1 flex items-center justify-between">
                      <span className="font-medium text-slate-900">
                        {method === 'CASH' ? 'Tiền mặt' : 'Chuyển khoản / Quét mã QR'}
                      </span>
                      {method !== 'CASH' && (
                        <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full font-medium tracking-wide">Quét mã QR</span>
                      )}
                    </div>
                  </label>
                ))}
              </div>
              
              {/* Show QR Code for VNPAY or MOMO */}
              {paymentMethod !== 'CASH' && (
                <div className="mt-4 p-4 border border-slate-200 rounded-xl bg-slate-50 flex flex-col items-center justify-center animate-in fade-in zoom-in duration-300">
                  <p className="text-sm font-medium text-slate-700 mb-3">Quét mã QR để thanh toán</p>
                  <div className="p-2 bg-white rounded-lg shadow-sm border border-slate-100 mb-3">
                    <img 
                      src={`https://img.vietqr.io/image/${import.meta.env.VITE_BANK_ID || 'vietinbank'}-${import.meta.env.VITE_BANK_ACCOUNT_NO || '100884561855'}-compact2.png?amount=${selectedInvoice?.amount}&addInfo=${encodeURIComponent('Thanh toan HD ' + selectedInvoice?.id)}&accountName=${encodeURIComponent(import.meta.env.VITE_BANK_ACCOUNT_NAME || 'PHONG KHAM YOUMED')}`} 
                      alt="Payment QR Code" 
                      className="w-56 h-56 object-contain"
                    />
                  </div>
                  <p className="text-xs text-slate-500 text-center">
                    Giao dịch sẽ được ghi nhận là thanh toán bằng hình thức Chuyển khoản.<br/>
                  </p>
                </div>
              )}
            </div>
            <div className="px-6 py-4 border-t border-slate-100 flex justify-end gap-3 bg-slate-50">
              <Button variant="outline" onClick={() => setPaymentModalOpen(false)}>Hủy</Button>
              <Button onClick={handlePayInvoice} leftIcon={<FiCheckCircle />}>Xác nhận đã thu tiền</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminInvoiceList;
