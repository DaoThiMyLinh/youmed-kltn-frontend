import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { FiChevronRight, FiUser, FiCheckCircle, FiXCircle, FiArrowLeft, FiRefreshCw, FiInfo, FiMail, FiPhone, FiShield } from 'react-icons/fi';
import { getActiveDoctors } from '../../services/appointment.service';
import type { Doctor } from '../../types/appointment';
import { Loading } from '../../components/feedback/Loading';
import { motion } from 'framer-motion';

const DoctorDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const [doctor, setDoctor] = useState<Doctor | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDoctor = async () => {
    if (!id) return;
    
    try {
      setLoading(true);
      setError(null);
      // Fallback: Fetch all active doctors and find the one with matching ID
      const doctorsData = await getActiveDoctors();
      const foundDoctor = doctorsData.find(d => d.id.toString() === id);
      
      if (foundDoctor) {
        setDoctor(foundDoctor);
      } else {
        setDoctor(null);
      }
    } catch (err) {
      console.error('Failed to fetch doctor detail:', err);
      setError('Đã xảy ra lỗi khi tải thông tin bác sĩ.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDoctor();
  }, [id]);

  if (loading) {
    return (
      <div className="bg-[#f8fafc] min-h-screen py-20 flex justify-center items-center">
        <Loading size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-[#f8fafc] min-h-screen py-12 flex items-center justify-center">
        <div className="max-w-3xl mx-auto px-4 w-full">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-3xl p-12 text-center shadow-sm border border-slate-100"
          >
            <div className="w-20 h-20 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <FiXCircle className="w-10 h-10" />
            </div>
            <h3 className="text-2xl font-bold text-slate-800 mb-3">Đã xảy ra lỗi</h3>
            <p className="text-slate-500 mb-8 text-lg">{error}</p>
            <div className="flex justify-center gap-4">
              <button
                onClick={() => navigate('/patient/doctors')}
                className="bg-slate-100 text-slate-700 font-semibold px-6 py-3 rounded-full hover:bg-slate-200 transition-colors flex items-center gap-2"
              >
                <FiArrowLeft /> Quay lại
              </button>
              <button
                onClick={fetchDoctor}
                className="bg-slate-900 text-white font-semibold px-6 py-3 rounded-full hover:bg-slate-800 transition-colors flex items-center gap-2 shadow-md"
              >
                <FiRefreshCw /> Thử lại
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  if (!doctor) {
    return (
      <div className="bg-[#f8fafc] min-h-screen py-12 flex items-center justify-center">
        <div className="max-w-3xl mx-auto px-4 w-full">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-3xl p-16 text-center shadow-sm border border-slate-100"
          >
            <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6 border-8 border-white shadow-sm">
              <FiUser className="w-10 h-10 text-slate-400" />
            </div>
            <h3 className="text-2xl font-bold text-slate-800 mb-3">Không tìm thấy bác sĩ</h3>
            <p className="text-slate-500 mb-8 text-lg">
              Bác sĩ bạn đang tìm kiếm không tồn tại hoặc đã ngừng hoạt động trên hệ thống.
            </p>
            <button
              onClick={() => navigate('/patient/doctors')}
              className="bg-emerald-600 text-white font-semibold px-8 py-3.5 rounded-full hover:bg-emerald-700 transition-colors flex items-center gap-2 mx-auto shadow-md hover:shadow-lg"
            >
              <FiArrowLeft /> Xem danh sách bác sĩ
            </button>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#f8fafc] min-h-screen pb-24 pt-8 relative overflow-hidden">
      {/* Background Decorators */}
      <div className="absolute top-0 left-0 w-full h-80 bg-gradient-to-b from-emerald-50/60 to-transparent -z-10"></div>
      <div className="absolute top-[-5%] right-[-10%] w-[40%] h-[40%] rounded-full bg-teal-200/20 blur-[120px] pointer-events-none -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Breadcrumb */}
        <motion.nav 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex text-sm text-slate-500 mb-10 items-center bg-white/60 backdrop-blur-md w-fit px-4 py-2 rounded-full border border-slate-100 shadow-sm"
        >
          <Link to="/patient" className="hover:text-emerald-600 font-medium transition-colors">Trang chủ</Link>
          <FiChevronRight className="mx-2 w-4 h-4 text-slate-400" />
          <Link to="/patient/doctors" className="hover:text-emerald-600 font-medium transition-colors">Danh sách bác sĩ</Link>
          <FiChevronRight className="mx-2 w-4 h-4 text-slate-400" />
          <span className="text-emerald-700 font-semibold truncate max-w-[150px] sm:max-w-xs">{doctor.fullName}</span>
        </motion.nav>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Column: Doctor Info */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* Main Profile Card */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-3xl p-6 sm:p-10 shadow-sm border border-slate-100 flex flex-col sm:flex-row gap-8 items-center sm:items-start relative overflow-hidden"
            >
              {/* Decorative gradient corner */}
              <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-emerald-50 to-teal-50 rounded-bl-full opacity-50 -z-0"></div>

              <div className="relative z-10 flex-shrink-0">
                <div className="absolute -inset-2 bg-gradient-to-br from-emerald-400 to-teal-400 rounded-full blur opacity-30"></div>
                <div className="relative w-32 h-32 sm:w-40 sm:h-40 bg-slate-50 rounded-full flex items-center justify-center border-4 border-white shadow-lg overflow-hidden">
                  <FiUser className="w-16 h-16 text-slate-300" />
                </div>
                <div className="absolute bottom-1 right-1 bg-emerald-500 border-4 border-white text-white p-2 rounded-full shadow-md">
                  <FiShield className="w-5 h-5" />
                </div>
              </div>
              
              <div className="flex-1 text-center sm:text-left relative z-10">
                <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 mb-3 tracking-tight">{doctor.fullName}</h1>
                <p className="text-emerald-600 font-bold text-lg mb-6 inline-block bg-emerald-50 px-4 py-1.5 rounded-full border border-emerald-100">{doctor.specialty?.name || 'Bác sĩ đa khoa'}</p>
                
                <div className="flex flex-col sm:flex-row flex-wrap gap-4 text-sm text-slate-600">
                  <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full font-semibold border ${doctor.active ? 'bg-emerald-50 text-emerald-700 border-emerald-200/50' : 'bg-red-50 text-red-700 border-red-200/50'}`}>
                    {doctor.active ? <FiCheckCircle className="w-4 h-4" /> : <FiXCircle className="w-4 h-4" />}
                    {doctor.active ? 'Đang hoạt động' : 'Ngừng hoạt động'}
                  </div>
                  
                  {doctor.email && (
                    <div className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-full border border-slate-100">
                      <FiMail className="w-4 h-4 text-slate-400" />
                      <span className="font-medium text-slate-700">{doctor.email}</span>
                    </div>
                  )}
                  
                  {doctor.phone && (
                     <div className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-full border border-slate-100">
                      <FiPhone className="w-4 h-4 text-slate-400" />
                      <span className="font-medium text-slate-700">{doctor.phone}</span>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>

            {/* Biography */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-3xl p-6 sm:p-10 shadow-sm border border-slate-100"
            >
              <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
                  <FiInfo className="w-5 h-5" />
                </div>
                Giới thiệu chuyên môn
              </h2>
              <div className="prose prose-slate prose-lg max-w-none text-slate-600 whitespace-pre-line leading-relaxed">
                {doctor.biography || 'Bác sĩ chưa cập nhật thông tin giới thiệu chi tiết về quá trình công tác và kinh nghiệm lâm sàng.'}
              </div>
            </motion.div>

          </div>

          {/* Right Column: Booking Section */}
          <div className="lg:col-span-1">
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-3xl p-8 shadow-xl shadow-slate-200/40 border border-slate-100 sticky top-24 relative overflow-hidden"
            >
              {/* Subtle top gradient */}
              <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-emerald-400 to-teal-400"></div>

              <h2 className="text-xl font-extrabold text-slate-900 mb-6 mt-2">Thông tin đặt khám</h2>
              
              <div className="space-y-4 mb-8 bg-slate-50 p-5 rounded-2xl border border-slate-100/50">
                <div className="flex justify-between items-center py-2 border-b border-slate-200/60 border-dashed">
                  <span className="text-slate-500 font-medium">Chuyên khoa</span>
                  <span className="font-bold text-slate-900 text-right">{doctor.specialty?.name || 'Đa khoa'}</span>
                </div>
                <div className="flex justify-between items-center py-2 pt-4">
                  <span className="text-slate-500 font-medium">Phí khám</span>
                  <span className="font-extrabold text-emerald-600 text-2xl">
                    {doctor.consultationFee > 0 ? `${doctor.consultationFee.toLocaleString('vi-VN')} ₫` : 'Miễn phí'}
                  </span>
                </div>
              </div>
              
              {doctor.active ? (
                <Link
                  to={`/patient/booking?doctorId=${doctor.id}`}
                  className="w-full bg-slate-900 text-white font-semibold py-4 rounded-2xl hover:bg-emerald-600 transition-all duration-300 flex items-center justify-center gap-2 shadow-md hover:shadow-xl hover:-translate-y-0.5"
                >
                  Đặt lịch khám ngay
                </Link>
              ) : (
                <button
                  disabled
                  className="w-full bg-slate-100 text-slate-400 font-semibold py-4 rounded-2xl cursor-not-allowed flex items-center justify-center gap-2 border border-slate-200"
                >
                  Bác sĩ ngừng nhận lịch
                </button>
              )}
              
              <div className="mt-6 flex gap-3 p-4 bg-emerald-50/50 rounded-2xl border border-emerald-100/50 items-start">
                <FiInfo className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-slate-600 leading-relaxed">
                  Để đặt lịch, vui lòng đảm bảo bạn đã đăng nhập vào hệ thống. Phí khám có thể thay đổi tùy theo các dịch vụ xét nghiệm phát sinh.
                </p>
              </div>
            </motion.div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default DoctorDetail;
