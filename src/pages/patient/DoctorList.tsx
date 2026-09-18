import { useState, useEffect, useMemo } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { FiSearch, FiUser, FiStar, FiFilter, FiRefreshCw, FiShield } from 'react-icons/fi';
import { getActiveDoctors } from '../../services/appointment.service';
import { getActiveSpecialties } from '../../services/specialty.service';
import type { Doctor } from '../../types/appointment';
import type { Specialty } from '../../types/specialty';
import { motion } from 'framer-motion';

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

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };
  
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 100 } }
  };

  return (
    <div className="bg-[#f8fafc] min-h-screen relative overflow-hidden pb-24">
      {/* Background Decorators */}
      <div className="absolute top-0 left-0 w-full h-96 bg-gradient-to-b from-emerald-50/60 to-transparent -z-10"></div>
      <div className="absolute top-[-5%] right-[-5%] w-[40%] h-[40%] rounded-full bg-teal-200/20 blur-[120px] pointer-events-none -z-10" />

      {/* Header Section */}
      <section className="pt-16 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center max-w-3xl mx-auto mb-10"
          >
            <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight mb-4">Danh sách Bác sĩ</h1>
            <p className="text-lg text-slate-500">Tìm kiếm và đặt lịch khám với đội ngũ chuyên gia y tế hàng đầu.</p>
          </motion.div>

          {/* Search & Filter Section - Glassmorphism */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="relative max-w-4xl mx-auto group"
          >
             <div className="absolute -inset-1 bg-gradient-to-r from-emerald-400 to-teal-400 rounded-3xl blur opacity-20 group-hover:opacity-30 transition duration-500"></div>
            <div className="relative bg-white/90 backdrop-blur-xl p-3 md:p-4 rounded-3xl shadow-xl flex flex-col md:flex-row gap-3 items-center">
              <form onSubmit={handleSearch} className="flex-1 flex flex-col md:flex-row w-full gap-3">
                
                {/* Search Input */}
                <div className="flex-1 relative flex items-center bg-slate-50/50 hover:bg-slate-50 border border-slate-100 rounded-2xl transition-colors focus-within:bg-white focus-within:ring-2 focus-within:ring-emerald-500/20 focus-within:border-emerald-500">
                  <FiSearch className="absolute left-5 text-emerald-500 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Tên bác sĩ, chuyên khoa..."
                    className="w-full pl-12 pr-4 py-3.5 bg-transparent border-none focus:ring-0 outline-none text-slate-800 placeholder-slate-400 font-medium"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                
                {/* Specialty Select */}
                <div className="md:w-72 relative flex items-center bg-slate-50/50 hover:bg-slate-50 border border-slate-100 rounded-2xl transition-colors focus-within:bg-white focus-within:ring-2 focus-within:ring-emerald-500/20 focus-within:border-emerald-500">
                  <FiFilter className="absolute left-5 text-emerald-500 w-5 h-5 z-10" />
                  <select
                    className="w-full pl-12 pr-10 py-3.5 bg-transparent border-none focus:ring-0 outline-none text-slate-700 font-medium appearance-none cursor-pointer"
                    value={selectedSpecialty}
                    onChange={handleSpecialtyChange}
                  >
                    <option value="">Tất cả chuyên khoa</option>
                    {specialties.map(spec => (
                      <option key={spec.id} value={spec.id.toString()}>{spec.name}</option>
                    ))}
                  </select>
                  <div className="absolute right-5 pointer-events-none text-slate-400">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                  </div>
                </div>

                <button
                  type="submit"
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-2xl px-8 py-3.5 transition-all shadow-md hover:shadow-lg transform hover:-translate-y-0.5 md:w-auto w-full cursor-pointer"
                >
                  Tìm kiếm
                </button>
              </form>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Content Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <div key={i} className="animate-pulse bg-white rounded-3xl h-[28rem] shadow-sm border border-slate-100"></div>
            ))}
          </div>
        ) : error ? (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-3xl p-12 text-center shadow-sm border border-slate-100 max-w-2xl mx-auto mt-8"
          >
            <div className="w-20 h-20 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-slate-800 mb-3">Đã xảy ra lỗi</h3>
            <p className="text-slate-500 mb-8 text-lg">{error}</p>
            <button
              onClick={fetchData}
              className="inline-flex items-center gap-2 bg-slate-900 text-white font-semibold px-8 py-3.5 rounded-full hover:bg-slate-800 transition-colors shadow-md hover:shadow-lg"
            >
              <FiRefreshCw /> Thử lại
            </button>
          </motion.div>
        ) : filteredDoctors.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-3xl p-16 text-center shadow-sm border border-slate-100 max-w-2xl mx-auto mt-8"
          >
            <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6 border-8 border-white shadow-sm">
              <FiSearch className="w-10 h-10 text-slate-400" />
            </div>
            <h3 className="text-2xl font-bold text-slate-800 mb-3">Không tìm thấy bác sĩ</h3>
            <p className="text-slate-500 text-lg">
              Không có kết quả nào phù hợp với điều kiện tìm kiếm của bạn. Hãy thử thay đổi từ khóa hoặc bộ lọc.
            </p>
            {(searchParams.get('search') || searchParams.get('specialty')) && (
              <button
                onClick={() => {
                  setSearchTerm('');
                  setSelectedSpecialty('');
                  setSearchParams({});
                }}
                className="mt-8 text-emerald-600 font-semibold hover:text-emerald-700 bg-emerald-50 px-6 py-2.5 rounded-full transition-colors"
              >
                Xóa bộ lọc
              </button>
            )}
          </motion.div>
        ) : (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-8"
          >
            <div className="flex items-center justify-between mb-8">
              <p className="text-slate-600 text-lg">Tìm thấy <span className="font-bold text-slate-900 text-xl">{filteredDoctors.length}</span> bác sĩ</p>
            </div>
            
            <motion.div 
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8"
            >
              {filteredDoctors.map((doctor) => (
                <motion.div key={doctor.id} variants={itemVariants}>
                  <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group flex flex-col h-full relative overflow-hidden">
                    {/* Card background hover effect */}
                    <div className="absolute top-0 right-0 -mt-8 -mr-8 w-32 h-32 bg-gradient-to-br from-emerald-50 to-teal-50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-0"></div>
                    
                    <div className="relative z-10 flex flex-col h-full">
                      {/* Avatar Profile */}
                      <div className="flex items-center gap-4 mb-6">
                        <div className="relative">
                          <div className="absolute -inset-1 bg-gradient-to-br from-emerald-400 to-teal-400 rounded-full blur opacity-0 group-hover:opacity-40 transition duration-500"></div>
                          <div className="relative w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center border-2 border-white shadow-sm overflow-hidden flex-shrink-0">
                            <FiUser className="w-8 h-8 text-slate-300" />
                          </div>
                          <div className="absolute bottom-0 right-0 bg-emerald-500 border-2 border-white text-white p-1 rounded-full">
                            <FiShield className="w-3 h-3" />
                          </div>
                        </div>
                        <div>
                          <h3 className="font-bold text-lg text-slate-900 leading-tight mb-1 group-hover:text-emerald-700 transition-colors line-clamp-2">{doctor.fullName}</h3>
                          <p className="text-emerald-600 text-sm font-semibold">{doctor.specialty?.name || 'Bác sĩ đa khoa'}</p>
                        </div>
                      </div>
                      
                      {/* Rating */}
                      <div className="flex items-center gap-1.5 text-yellow-400 mb-5 bg-yellow-50/50 w-fit px-3 py-1.5 rounded-full border border-yellow-100/50">
                        <FiStar className="fill-current w-4 h-4" />
                        <span className="text-slate-800 font-bold text-sm">5.0</span>
                        <span className="text-slate-400 text-xs font-medium ml-0.5">(120+)</span>
                      </div>
                      
                      {/* Bio & Info */}
                      <div className="space-y-4 mb-8 flex-grow">
                        <p className="text-sm text-slate-500 line-clamp-3 leading-relaxed">
                          {doctor.biography || 'Chuyên gia y tế với nhiều năm kinh nghiệm khám và điều trị chuyên sâu.'}
                        </p>
                        
                        <div className="pt-4 border-t border-slate-100 border-dashed flex justify-between items-center">
                          <span className="text-sm font-medium text-slate-500">Phí khám:</span>
                          <span className="font-extrabold text-emerald-600 text-lg">
                            {doctor.consultationFee > 0 ? `${doctor.consultationFee.toLocaleString('vi-VN')} ₫` : 'Miễn phí'}
                          </span>
                        </div>
                      </div>
                      
                      {/* Actions */}
                      <div className="flex gap-3 mt-auto">
                        <Link
                          to={`/patient/doctors/${doctor.id}`}
                          className="flex-1 bg-slate-50 text-slate-700 font-semibold py-3 rounded-2xl text-center hover:bg-slate-100 transition-colors"
                        >
                          Hồ sơ
                        </Link>
                        <Link
                          to="/patient/booking"
                          className="flex-[1.5] bg-slate-900 text-white font-semibold py-3 rounded-2xl text-center hover:bg-emerald-600 transition-colors shadow-sm hover:shadow-md"
                        >
                          Đặt lịch
                        </Link>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        )}
      </section>
    </div>
  );
};

export default DoctorList;
