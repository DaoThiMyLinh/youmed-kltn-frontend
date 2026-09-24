import { useState, useEffect } from 'react';
import { managerService } from '../../services/manager.service';
import type { Doctor } from '../../types/appointment';
import { Card, Badge, ErrorMessage, EmptyState } from '../../components';
import { FiUsers } from 'react-icons/fi';
import { useTranslation } from 'react-i18next';

const ManagerDoctorList = () => {
  const { t } = useTranslation();
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Filter & Search states
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState<string>('ALL');

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await managerService.getManagerDoctors();
        setDoctors(data);
      } catch (err: any) {
        setError(err.response?.data?.message || t('manager.loadDoctorsError', 'Có lỗi xảy ra khi tải danh sách bác sĩ.'));
      } finally {
        setLoading(false);
      }
    };

    fetchDoctors();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  const filteredDoctors = doctors.filter(doctor => {
    const term = searchTerm.toLowerCase();
    const matchesSearch = doctor.fullName.toLowerCase().includes(term) || 
                          (doctor.phone && doctor.phone.includes(term)) ||
                          (doctor.email && doctor.email.toLowerCase().includes(term));
    
    let matchesStatus = true;
    if (activeFilter === 'ACTIVE') matchesStatus = doctor.active === true;
    if (activeFilter === 'INACTIVE') matchesStatus = doctor.active === false;

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">{t('manager.doctorsList', 'Danh sách Bác sĩ')}</h1>
          <p className="text-slate-500 text-sm mt-1">{t('manager.doctorsDesc', 'Danh sách các bác sĩ thuộc khoa bạn đang quản lý.')}</p>
        </div>
      </div>

      <Card className="p-4 border-0 shadow-sm ring-1 ring-slate-200">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder={t('manager.searchDoctorPlaceholder', 'Tìm kiếm theo tên, sđt, email...')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-shadow"
            />
          </div>
          <div className="flex gap-4">
            <select
              value={activeFilter}
              onChange={(e) => setActiveFilter(e.target.value)}
              className="px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none bg-white min-w-[150px]"
            >
              <option value="ALL">{t('manager.allStatus', 'Tất cả trạng thái')}</option>
              <option value="ACTIVE">{t('manager.active', 'Hoạt động')}</option>
              <option value="INACTIVE">{t('manager.inactive', 'Tạm khóa')}</option>
            </select>
          </div>
        </div>
      </Card>

      <ErrorMessage message={error} />

      {!error && doctors.length === 0 ? (
        <EmptyState 
          icon={<FiUsers />}
          title={t('manager.noDoctors', 'Không có bác sĩ')}
          description={t('manager.noDoctorsDesc', 'Chưa có bác sĩ nào được phân công vào khoa này.')}
        />
      ) : filteredDoctors.length === 0 ? (
        <EmptyState 
          icon={<FiUsers />}
          title={t('common.noData', 'Không có dữ liệu')}
          description={t('manager.noFilterResults', 'Không tìm thấy bác sĩ nào phù hợp với bộ lọc.')}
        />
      ) : (
        <Card className="overflow-hidden border-0 shadow-sm ring-1 ring-slate-200">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-slate-50 text-slate-500 font-medium border-b border-slate-200">
                <tr>
                  <th className="px-6 py-4">{t('manager.doctor', 'Bác sĩ')}</th>
                  <th className="px-6 py-4">{t('manager.specialty', 'Chuyên khoa')}</th>
                  <th className="px-6 py-4">{t('manager.contact', 'Liên hệ')}</th>
                  <th className="px-6 py-4">{t('manager.fee', 'Phí khám')}</th>
                  <th className="px-6 py-4">{t('manager.status', 'Trạng thái')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredDoctors.map((doctor) => (
                  <tr key={doctor.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-semibold text-slate-900">{doctor.fullName}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-slate-600">{doctor.specialty?.name || '-'}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-slate-600">{doctor.email}</div>
                      <div className="text-slate-500 text-xs mt-0.5">{doctor.phone}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-medium text-emerald-600">
                        {doctor.consultationFee > 0 ? `${doctor.consultationFee.toLocaleString('vi-VN')} ₫` : t('manager.free', 'Miễn phí')}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant={doctor.active ? 'success' : 'secondary'}>
                        {doctor.active ? t('manager.active', 'Hoạt động') : t('manager.inactive', 'Tạm khóa')}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
};

export default ManagerDoctorList;
