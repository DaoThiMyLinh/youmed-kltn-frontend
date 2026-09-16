import { useState, useEffect, useMemo } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { FiSearch, FiUser, FiStar, FiFilter, FiRefreshCw } from 'react-icons/fi';
import { getActiveDoctors } from '../../services/appointment.service';
import { getActiveSpecialties } from '../../services/specialty.service';
import type { Doctor } from '../../types/appointment';
import type { Specialty } from '../../types/specialty';
import { Loading } from '../../components/feedback/Loading';

const DoctorList = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialSearch = searchParams.get('search') || '';
  const initialSpecialty = searchParams.get('specialty') || '';

  const [searchTerm, setSearchTerm] = useState(initialSearch);
  const [selectedSpecialty, setSelectedSpecialty] = useState(initialSpecialty);
  
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [specialties, setSpecialties] = useState<Specialty[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [doctorsData, specialtiesData] = await Promise.all([
        getActiveDoctors(),
        getActiveSpecialties()
      ]);
      setDoctors(doctorsData);
      setSpecialties(specialtiesData);
    } catch (err) {
      console.error('Failed to fetch data:', err);
      setError('Không thể tải danh sách bác sĩ. Vui lòng thử lại sau.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Sync state to URL when searching/filtering
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    updateSearchParams(searchTerm, selectedSpecialty);
  };

  const handleSpecialtyChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newSpecialty = e.target.value;
    setSelectedSpecialty(newSpecialty);
    updateSearchParams(searchTerm, newSpecialty);
  };

  const updateSearchParams = (search: string, specialty: string) => {
    const params = new URLSearchParams();
    if (search.trim()) params.set('search', search.trim());
    if (specialty) params.set('specialty', specialty);
    setSearchParams(params);
  };

  // Client-side filtering
  const filteredDoctors = useMemo(() => {
    const currentSearch = searchParams.get('search')?.toLowerCase() || '';
    const currentSpecialty = searchParams.get('specialty') || '';

    return doctors.filter((doctor) => {
      const matchName = doctor.fullName.toLowerCase().includes(currentSearch);
      const matchSpecialtyText = doctor.specialty?.name.toLowerCase().includes(currentSearch);
      
      const searchMatch = !currentSearch || matchName || matchSpecialtyText;
      const specialtyMatch = !currentSpecialty || doctor.specialty?.id.toString() === currentSpecialty;

      return searchMatch && specialtyMatch;
    });
  }, [doctors, searchParams]);

  return (
    <div className="bg-slate-50 min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Tìm bác sĩ</h1>
          <p className="text-slate-500 mt-2">Tìm kiếm và đặt lịch khám với các bác sĩ giỏi, chuyên môn cao.</p>
        </div>

        {/* Search & Filter Section */}
        <div className="bg-white p-4 md:p-6 rounded-2xl shadow-sm border border-slate-100 mb-8">
          <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Tên bác sĩ, chuyên khoa..."
                className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <div className="md:w-64 relative">
              <FiFilter className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5 z-10" />
              <select
                className="w-full pl-11 pr-10 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all appearance-none cursor-pointer"
                value={selectedSpecialty}
                onChange={handleSpecialtyChange}
              >
                <option value="">Tất cả chuyên khoa</option>
                {specialties.map(spec => (
                  <option key={spec.id} value={spec.id.toString()}>{spec.name}</option>
                ))}
              </select>
            </div>

            <button
              type="submit"
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-xl px-8 py-3 transition-colors md:w-auto w-full"
            >
              Tìm kiếm
            </button>
          </form>
        </div>

        {/* Content Section */}
        {loading ? (
          <div className="py-20 flex justify-center">
            <Loading size="lg" />
          </div>
        ) : error ? (
          <div className="bg-white rounded-2xl p-10 text-center shadow-sm border border-slate-100">
            <div className="text-red-500 mb-4 flex justify-center">
              <svg className="w-16 h-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-slate-800 mb-2">Đã xảy ra lỗi</h3>
            <p className="text-slate-500 mb-6">{error}</p>
            <button
              onClick={fetchData}
              className="inline-flex items-center gap-2 bg-emerald-50 text-emerald-700 font-medium px-6 py-2.5 rounded-lg hover:bg-emerald-100 transition-colors"
            >
              <FiRefreshCw /> Thử lại
            </button>
          </div>
        ) : filteredDoctors.length === 0 ? (
          <div className="bg-white rounded-2xl p-16 text-center shadow-sm border border-slate-100">
            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <FiSearch className="w-8 h-8 text-slate-400" />
            </div>
            <h3 className="text-xl font-bold text-slate-800 mb-2">Không tìm thấy bác sĩ</h3>
            <p className="text-slate-500">
              Không có kết quả nào phù hợp với điều kiện tìm kiếm của bạn. Hãy thử thay đổi từ khóa hoặc bộ lọc.
            </p>
            {(searchParams.get('search') || searchParams.get('specialty')) && (
              <button
                onClick={() => {
                  setSearchTerm('');
                  setSelectedSpecialty('');
                  setSearchParams({});
                }}
                className="mt-6 text-emerald-600 font-medium hover:text-emerald-700"
              >
                Xóa bộ lọc
              </button>
            )}
          </div>
        ) : (
          <div>
            <p className="text-slate-600 mb-4">Tìm thấy <span className="font-bold text-slate-900">{filteredDoctors.length}</span> bác sĩ</p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredDoctors.map((doctor) => (
                <div key={doctor.id} className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 hover:shadow-md transition-all flex flex-col h-full">
                  <div className="flex items-start gap-4 mb-4">
                    <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center overflow-hidden flex-shrink-0">
                      <FiUser className="w-8 h-8 text-slate-400" />
                    </div>
                    <div>
                      <h3 className="font-bold text-lg text-slate-900 leading-tight mb-1">{doctor.fullName}</h3>
                      <p className="text-emerald-600 text-sm font-medium">{doctor.specialty?.name || 'Bác sĩ đa khoa'}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-1 text-yellow-400 mb-4">
                    <FiStar className="fill-current w-4 h-4" />
                    <span className="text-slate-700 font-medium text-sm ml-1">5.0</span>
                    <span className="text-slate-400 text-sm ml-1">(120+ lượt khám)</span>
                  </div>
                  
                  <div className="space-y-2 mb-6 flex-grow">
                    <p className="text-sm text-slate-600 line-clamp-2">
                      {doctor.biography || 'Chưa có thông tin giới thiệu.'}
                    </p>
                    <div className="pt-2">
                      <span className="text-sm text-slate-500">Phí khám:</span>
                      <span className="font-semibold text-slate-900 ml-2">
                        {doctor.consultationFee > 0 ? `${doctor.consultationFee.toLocaleString('vi-VN')} ₫` : 'Miễn phí'}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex gap-3 mt-auto">
                    <Link
                      to={`/patient/doctors/${doctor.id}`}
                      className="flex-1 bg-slate-50 text-slate-700 font-medium py-2.5 rounded-xl text-center hover:bg-slate-100 transition-colors"
                    >
                      Chi tiết
                    </Link>
                    <Link
                      to="/patient/booking"
                      className="flex-1 bg-emerald-600 text-white font-medium py-2.5 rounded-xl text-center hover:bg-emerald-700 transition-colors"
                    >
                      Đặt lịch
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default DoctorList;
