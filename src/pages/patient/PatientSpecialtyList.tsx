import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiActivity, FiArrowRight, FiRefreshCw, FiSearch } from 'react-icons/fi';
import { getActiveSpecialties } from '../../services/specialty.service';
import type { Specialty } from '../../types/specialty';
import { Loading } from '../../components/feedback/Loading';

const PatientSpecialtyList = () => {
  const navigate = useNavigate();
  const [specialties, setSpecialties] = useState<Specialty[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSpecialties = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getActiveSpecialties();
      setSpecialties(data);
    } catch (err) {
      console.error('Failed to fetch specialties:', err);
      setError('Không thể tải danh sách chuyên khoa. Vui lòng thử lại sau.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSpecialties();
  }, []);

  const handleSpecialtyClick = (specialtyId: number) => {
    navigate(`/patient/doctors?specialty=${specialtyId}`);
  };

  return (
    <div className="bg-slate-50 min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Page Header */}
        <div className="mb-10 text-center">
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight mb-4">Chuyên khoa khám bệnh</h1>
          <p className="text-slate-500 max-w-2xl mx-auto">
            Hệ thống cung cấp đa dạng các chuyên khoa khám chữa bệnh, đáp ứng nhu cầu chăm sóc sức khỏe toàn diện của bạn và gia đình.
          </p>
        </div>

        {/* Content Section */}
        {loading ? (
          <div className="py-20 flex justify-center">
            <Loading size="lg" />
          </div>
        ) : error ? (
          <div className="bg-white rounded-2xl p-10 text-center shadow-sm border border-slate-100 max-w-3xl mx-auto">
            <div className="text-red-500 mb-4 flex justify-center">
              <svg className="w-16 h-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-slate-800 mb-2">Đã xảy ra lỗi</h3>
            <p className="text-slate-500 mb-6">{error}</p>
            <button
              onClick={fetchSpecialties}
              className="inline-flex items-center gap-2 bg-emerald-50 text-emerald-700 font-medium px-6 py-2.5 rounded-lg hover:bg-emerald-100 transition-colors"
            >
              <FiRefreshCw /> Thử lại
            </button>
          </div>
        ) : specialties.length === 0 ? (
          <div className="bg-white rounded-2xl p-16 text-center shadow-sm border border-slate-100 max-w-3xl mx-auto">
            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <FiSearch className="w-8 h-8 text-slate-400" />
            </div>
            <h3 className="text-xl font-bold text-slate-800 mb-2">Không có chuyên khoa</h3>
            <p className="text-slate-500">
              Hiện tại hệ thống chưa có dữ liệu chuyên khoa khám bệnh nào được cập nhật.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {specialties.map((specialty) => (
              <div 
                key={specialty.id} 
                onClick={() => handleSpecialtyClick(specialty.id)}
                className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 hover:shadow-md hover:border-emerald-100 transition-all cursor-pointer group flex flex-col items-center text-center h-full"
              >
                <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 group-hover:bg-emerald-600 group-hover:text-white transition-all duration-300">
                  <FiActivity className="w-8 h-8" />
                </div>
                <h3 className="font-bold text-lg text-slate-900 mb-2">{specialty.name}</h3>
                <p className="text-slate-500 text-sm mb-4 line-clamp-2">
                  {specialty.description || 'Khám, tư vấn và điều trị các bệnh lý liên quan đến chuyên khoa này.'}
                </p>
                <div className="mt-auto flex items-center text-emerald-600 text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                  Xem bác sĩ <FiArrowRight className="ml-1" />
                </div>
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
};

export default PatientSpecialtyList;
