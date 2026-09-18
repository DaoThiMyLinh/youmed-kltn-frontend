import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiActivity, FiArrowRight, FiRefreshCw, FiSearch } from 'react-icons/fi';
import { getActiveSpecialties } from '../../services/specialty.service';
import type { Specialty } from '../../types/specialty';
import { motion } from 'framer-motion';

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

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };
  
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 100 } }
  };

  return (
    <div className="bg-[#f8fafc] min-h-screen pt-12 pb-24 relative overflow-hidden">
      {/* Background Decorators */}
      <div className="absolute top-0 left-0 w-full h-96 bg-gradient-to-b from-emerald-50/50 to-transparent -z-10"></div>
      <div className="absolute top-[-5%] right-[-5%] w-[30%] h-[40%] rounded-full bg-teal-200/20 blur-[100px] pointer-events-none -z-10" />
      <div className="absolute top-[20%] left-[-10%] w-[40%] h-[30%] rounded-full bg-emerald-200/20 blur-[120px] pointer-events-none -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Page Header */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-16 text-center"
        >
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 mb-6 shadow-sm border border-white">
            <FiActivity className="w-8 h-8" />
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight mb-6">Khám theo chuyên khoa</h1>
          <p className="text-lg text-slate-500 max-w-2xl mx-auto leading-relaxed">
            Hệ thống cung cấp đa dạng các chuyên khoa khám chữa bệnh, đáp ứng nhu cầu chăm sóc sức khỏe toàn diện của bạn và gia đình.
          </p>
        </motion.div>

        {/* Content Section */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <div key={i} className="animate-pulse bg-white rounded-3xl h-64 border border-slate-100 shadow-sm"></div>
            ))}
          </div>
        ) : error ? (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-3xl p-12 text-center shadow-sm border border-slate-100 max-w-2xl mx-auto"
          >
            <div className="w-20 h-20 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-slate-800 mb-3">Đã xảy ra lỗi</h3>
            <p className="text-slate-500 mb-8 text-lg">{error}</p>
            <button
              onClick={fetchSpecialties}
              className="inline-flex items-center gap-2 bg-slate-900 text-white font-semibold px-8 py-3.5 rounded-full hover:bg-slate-800 transition-colors shadow-md hover:shadow-lg"
            >
              <FiRefreshCw /> Thử lại
            </button>
          </motion.div>
        ) : specialties.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-3xl p-16 text-center shadow-sm border border-slate-100 max-w-2xl mx-auto"
          >
            <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6 border-8 border-white shadow-sm">
              <FiSearch className="w-10 h-10 text-slate-400" />
            </div>
            <h3 className="text-2xl font-bold text-slate-800 mb-3">Không có dữ liệu</h3>
            <p className="text-slate-500 text-lg">
              Hiện tại hệ thống chưa có dữ liệu chuyên khoa khám bệnh nào được cập nhật.
            </p>
          </motion.div>
        ) : (
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
          >
            {specialties.map((specialty) => (
              <motion.div key={specialty.id} variants={itemVariants}>
                <div 
                  onClick={() => handleSpecialtyClick(specialty.id)}
                  className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100 hover:shadow-xl hover:border-emerald-200 transition-all duration-300 cursor-pointer group flex flex-col h-full relative overflow-hidden"
                >
                  <div className="absolute top-0 right-0 -mt-6 -mr-6 w-32 h-32 bg-emerald-50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  
                  <div className="relative z-10 flex flex-col h-full">
                    <div className="w-16 h-16 bg-gradient-to-br from-emerald-50 to-teal-50 text-emerald-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-emerald-600 group-hover:text-white transition-all duration-300 shadow-sm border border-emerald-100/50 group-hover:border-transparent">
                      {specialty.imageUrl && specialty.imageUrl !== 'string' ? (
                        <img 
                          src={specialty.imageUrl} 
                          alt={specialty.name} 
                          className="w-8 h-8 object-contain"
                          onError={(e) => {
                            // Fallback to icon if image fails to load
                            (e.target as HTMLImageElement).style.display = 'none';
                            (e.target as HTMLImageElement).parentElement?.classList.add('fallback-icon');
                          }} 
                        />
                      ) : (
                        <FiActivity className="w-8 h-8 fallback-icon-default" />
                      )}
                      {/* Hidden fallback icon for image error */}
                      {specialty.imageUrl && specialty.imageUrl !== 'string' && (
                        <FiActivity className="w-8 h-8 hidden fallback-icon-show" />
                      )}
                      <style>{`
                        .fallback-icon .fallback-icon-show { display: block !important; }
                      `}</style>
                    </div>
                    
                    <h3 className="font-extrabold text-xl text-slate-900 mb-3 group-hover:text-emerald-700 transition-colors line-clamp-2">{specialty.name}</h3>
                    
                    <p className="text-slate-500 text-sm mb-6 line-clamp-3 leading-relaxed flex-1">
                      {specialty.description && specialty.description !== 'string' 
                        ? specialty.description 
                        : 'Khám, chẩn đoán, tư vấn và điều trị chuyên sâu các bệnh lý liên quan đến chuyên khoa này với trang thiết bị hiện đại.'}
                    </p>
                    
                    <div className="mt-auto flex items-center justify-between text-emerald-600 font-semibold group-hover:text-emerald-700 transition-colors">
                      <span className="text-sm">Xem danh sách Bác sĩ</span>
                      <div className="w-8 h-8 rounded-full bg-emerald-50 group-hover:bg-emerald-100 flex items-center justify-center transition-colors">
                        <FiArrowRight className="group-hover:translate-x-0.5 transition-transform" />
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}

      </div>
    </div>
  );
};

export default PatientSpecialtyList;
