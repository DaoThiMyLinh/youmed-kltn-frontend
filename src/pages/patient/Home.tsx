import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { FiSearch, FiArrowRight, FiUser, FiCalendar, FiStar, FiHeart, FiShield, FiActivity } from 'react-icons/fi';
import { getActiveDoctorsPublic } from '../../services/appointment.service';
import { getActiveSpecialtiesPublic } from '../../services/specialty.service';
import type { Doctor } from '../../types/appointment';
import type { Specialty } from '../../types/specialty';
import { motion } from 'framer-motion';

const Home = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [specialties, setSpecialties] = useState<Specialty[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [doctorsData, specialtiesData] = await Promise.all([
          getActiveDoctorsPublic(),
          getActiveSpecialtiesPublic()
        ]);
        setDoctors(doctorsData.slice(0, 4));
        setSpecialties(specialtiesData.slice(0, 8));
      } catch (error) {
        console.error('Failed to fetch home data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/patient/doctors?search=${encodeURIComponent(searchQuery)}`);
    } else {
      navigate('/patient/doctors');
    }
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };
  
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 100 } }
  };

  return (
    <div className="bg-[#f8fafc] min-h-screen overflow-hidden">
      {/* Hero Section with modern gradient and glassmorphism */}
      <section className="relative pt-24 pb-32 lg:pt-36 lg:pb-40 overflow-hidden">
        {/* Abstract Background Shapes */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[50%] rounded-full bg-emerald-200/40 blur-[100px] animate-pulse" />
          <div className="absolute top-[20%] right-[-5%] w-[30%] h-[40%] rounded-full bg-teal-200/40 blur-[100px]" style={{ animationDelay: '1s' }} />
          <div className="absolute bottom-[-20%] left-[20%] w-[50%] h-[50%] rounded-full bg-emerald-100/40 blur-[120px]" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="text-center max-w-4xl mx-auto"
          >
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/80 backdrop-blur-sm border border-emerald-100 text-emerald-700 text-sm font-semibold tracking-wide mb-8 shadow-sm"
            >
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              Nền tảng Y tế Thông minh hàng đầu
            </motion.div>
            
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold text-slate-900 tracking-tight mb-8 leading-tight">
              Sức khỏe của bạn, <br className="hidden md:block" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-500">
                chăm sóc trong tầm tay
              </span>
            </h1>
            
            <p className="text-xl text-slate-600 mb-12 leading-relaxed max-w-2xl mx-auto font-medium">
              Tìm kiếm bác sĩ giỏi, phòng khám uy tín và đặt lịch trực tuyến chỉ trong vài giây. Tiết kiệm thời gian, tối ưu trải nghiệm.
            </p>
            
            <motion.form 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
              onSubmit={handleSearch} 
              className="max-w-2xl mx-auto relative group"
            >
              <div className="absolute -inset-1 bg-gradient-to-r from-emerald-400 to-teal-400 rounded-[2rem] blur opacity-25 group-hover:opacity-40 transition duration-500"></div>
              <div className="relative flex items-center bg-white/90 backdrop-blur-xl rounded-[2rem] shadow-xl p-2 focus-within:ring-2 focus-within:ring-emerald-500 transition-all">
                <FiSearch className="w-6 h-6 text-emerald-500 ml-5 flex-shrink-0" />
                <input
                  type="text"
                  placeholder="Tìm kiếm bác sĩ, chuyên khoa..."
                  className="w-full bg-transparent border-none focus:ring-0 text-slate-800 px-5 py-4 text-lg placeholder-slate-400 outline-none"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <button
                  type="submit"
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-[1.5rem] px-8 py-4 transition-all shadow-md hover:shadow-lg transform hover:-translate-y-0.5 flex-shrink-0 cursor-pointer"
                >
                  Tìm kiếm
                </button>
              </div>
            </motion.form>
          </motion.div>
        </div>
      </section>

      {/* Popular Specialties */}
      <section className="py-24 bg-white relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="flex justify-between items-end mb-16"
          >
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4 tracking-tight">Chuyên khoa phổ biến</h2>
              <p className="text-lg text-slate-500">Khám theo chuyên khoa được tìm kiếm nhiều nhất</p>
            </div>
            <Link to="/patient/specialties" className="text-emerald-600 font-semibold hover:text-emerald-700 items-center gap-2 hidden sm:flex group">
              Xem tất cả <FiArrowRight className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </motion.div>

          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                <div key={i} className="animate-pulse bg-slate-100 rounded-2xl h-40"></div>
              ))}
            </div>
          ) : specialties.length > 0 ? (
            <motion.div 
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 gap-6"
            >
              {specialties.map((specialty) => (
                <motion.div key={specialty.id} variants={itemVariants}>
                  <Link
                    to={`/patient/doctors?specialty=${specialty.id}`}
                    className="block bg-white border border-slate-100 p-8 rounded-3xl shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 hover:border-emerald-200 group relative overflow-hidden"
                  >
                    <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-emerald-50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                    <div className="relative z-10 flex flex-col items-center text-center">
                      <div className="w-20 h-20 bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300 shadow-sm border border-emerald-100/50 relative overflow-hidden">
                        {specialty.imageUrl && specialty.imageUrl !== 'string' ? (
                          <img 
                            src={specialty.imageUrl} 
                            alt={specialty.name} 
                            className="w-10 h-10 object-contain"
                            onError={(e) => {
                              (e.target as HTMLImageElement).style.display = 'none';
                              (e.target as HTMLImageElement).parentElement?.classList.add('home-fallback-icon');
                            }} 
                          />
                        ) : (
                          <FiActivity className="w-10 h-10 text-emerald-500 home-fallback-icon-default" />
                        )}
                        {specialty.imageUrl && specialty.imageUrl !== 'string' && (
                          <FiActivity className="w-10 h-10 text-emerald-500 hidden home-fallback-icon-show" />
                        )}
                        <style>{`
                          .home-fallback-icon .home-fallback-icon-show { display: block !important; }
                        `}</style>
                      </div>
                      <h3 className="font-bold text-slate-800 text-lg group-hover:text-emerald-600 transition-colors">{specialty.name}</h3>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </motion.div>
          ) : (
            <div className="text-center py-16 bg-slate-50 rounded-3xl border border-dashed border-slate-200">
              <p className="text-slate-500 text-lg">Chưa có dữ liệu chuyên khoa.</p>
            </div>
          )}
          
          <div className="mt-10 text-center sm:hidden">
             <Link to="/patient/specialties" className="text-emerald-600 font-semibold hover:text-emerald-700 inline-flex items-center gap-2 bg-emerald-50 px-6 py-3 rounded-full">
              Xem tất cả chuyên khoa <FiArrowRight />
            </Link>
          </div>
        </div>
      </section>

      {/* Featured Doctors */}
      <section className="py-24 bg-slate-50 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="flex justify-between items-end mb-16"
          >
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4 tracking-tight">Bác sĩ nổi bật</h2>
              <p className="text-lg text-slate-500">Đội ngũ chuyên gia y tế hàng đầu, giàu kinh nghiệm</p>
            </div>
            <Link to="/patient/doctors" className="text-emerald-600 font-semibold hover:text-emerald-700 items-center gap-2 hidden sm:flex group">
              Xem tất cả <FiArrowRight className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </motion.div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="animate-pulse bg-white rounded-3xl h-[22rem] shadow-sm"></div>
              ))}
            </div>
          ) : doctors.length > 0 ? (
            <motion.div 
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8"
            >
              {doctors.map((doctor) => (
                <motion.div key={doctor.id} variants={itemVariants}>
                  <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 hover:shadow-xl transition-all duration-300 group flex flex-col h-full">
                    <div className="flex flex-col items-center text-center flex-1">
                      <div className="relative mb-6 mt-4">
                        <div className="absolute -inset-2 bg-gradient-to-br from-emerald-400 to-teal-400 rounded-full blur opacity-0 group-hover:opacity-40 transition duration-500"></div>
                        <div className="relative w-28 h-28 bg-slate-50 rounded-full flex items-center justify-center border-4 border-white shadow-md overflow-hidden">
                          <FiUser className="w-12 h-12 text-slate-300" />
                        </div>
                        <div className="absolute bottom-0 right-0 bg-emerald-500 border-2 border-white text-white p-1.5 rounded-full shadow-sm">
                          <FiShield className="w-4 h-4" />
                        </div>
                      </div>
                      
                      <h3 className="font-extrabold text-xl text-slate-900 mb-1.5 group-hover:text-emerald-600 transition-colors line-clamp-1">{doctor.fullName}</h3>
                      <p className="text-emerald-600 font-semibold mb-4 bg-emerald-50 px-3 py-1 rounded-full text-sm inline-block">
                        {doctor.specialty?.name || 'Bác sĩ đa khoa'}
                      </p>
                      
                      <div className="flex items-center gap-1 text-yellow-400 mb-6 bg-yellow-50 px-3 py-1.5 rounded-full">
                        <FiStar className="fill-current w-4 h-4" />
                        <span className="text-slate-800 font-bold text-sm ml-1">5.0</span>
                        <span className="text-slate-400 text-sm ml-1 font-medium">(120+ lượt khám)</span>
                      </div>
                    </div>
                    
                    <Link
                      to={`/patient/doctors/${doctor.id}`}
                      className="w-full bg-slate-900 text-white font-semibold py-3.5 rounded-2xl hover:bg-emerald-600 transition-colors shadow-md hover:shadow-lg text-center mt-auto"
                    >
                      Đặt khám ngay
                    </Link>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          ) : (
             <div className="text-center py-16 bg-white rounded-3xl border border-dashed border-slate-200">
              <p className="text-slate-500 text-lg">Chưa có dữ liệu bác sĩ.</p>
            </div>
          )}
          
           <div className="mt-10 text-center sm:hidden">
             <Link to="/patient/doctors" className="text-emerald-600 font-semibold hover:text-emerald-700 inline-flex items-center gap-2 bg-white border border-emerald-100 px-6 py-3 rounded-full shadow-sm">
              Xem tất cả bác sĩ <FiArrowRight />
            </Link>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4 tracking-tight">3 Bước Đặt Khám Đơn Giản</h2>
            <p className="text-lg text-slate-500 max-w-2xl mx-auto">Trải nghiệm dịch vụ y tế liền mạch, tiện lợi và hoàn toàn chủ động về thời gian của bạn.</p>
          </motion.div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative">
            {/* Connecting Line for Desktop */}
            <div className="hidden md:block absolute top-12 left-[16%] right-[16%] h-0.5 bg-gradient-to-r from-emerald-100 via-emerald-100 to-teal-100 -z-10"></div>
            
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="flex flex-col items-center"
            >
              <div className="w-24 h-24 bg-gradient-to-br from-emerald-50 to-emerald-100 text-emerald-600 rounded-3xl flex items-center justify-center mb-8 shadow-sm border border-white ring-8 ring-white transform hover:-translate-y-2 transition-transform duration-300">
                <FiSearch className="w-10 h-10" />
              </div>
              <h3 className="font-extrabold text-xl mb-3 text-slate-900">1. Tìm kiếm bác sĩ</h3>
              <p className="text-slate-500 max-w-xs leading-relaxed">Lọc và chọn bác sĩ chuyên khoa phù hợp với triệu chứng và nhu cầu của bạn.</p>
            </motion.div>
            
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
              className="flex flex-col items-center"
            >
              <div className="w-24 h-24 bg-gradient-to-br from-emerald-50 to-emerald-100 text-emerald-600 rounded-3xl flex items-center justify-center mb-8 shadow-sm border border-white ring-8 ring-white transform hover:-translate-y-2 transition-transform duration-300">
                <FiCalendar className="w-10 h-10" />
              </div>
              <h3 className="font-extrabold text-xl mb-3 text-slate-900">2. Chọn thời gian</h3>
              <p className="text-slate-500 max-w-xs leading-relaxed">Xem lịch trình thực tế và chốt ngay khung giờ trống mà bạn mong muốn.</p>
            </motion.div>
            
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.5 }}
              className="flex flex-col items-center"
            >
              <div className="w-24 h-24 bg-gradient-to-br from-teal-50 to-teal-100 text-teal-600 rounded-3xl flex items-center justify-center mb-8 shadow-sm border border-white ring-8 ring-white transform hover:-translate-y-2 transition-transform duration-300">
                <FiHeart className="w-10 h-10" />
              </div>
              <h3 className="font-extrabold text-xl mb-3 text-slate-900">3. An tâm khám bệnh</h3>
              <p className="text-slate-500 max-w-xs leading-relaxed">Đến phòng khám đúng giờ hoặc nhận tư vấn trực tuyến mà không cần chờ đợi.</p>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
