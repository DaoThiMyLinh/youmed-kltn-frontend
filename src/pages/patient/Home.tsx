import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { FiSearch, FiArrowRight, FiUser, FiCalendar, FiClock, FiStar } from 'react-icons/fi';
import { getActiveDoctors } from '../../services/appointment.service';
import { getActiveSpecialties } from '../../services/specialty.service';
import type { Doctor } from '../../types/appointment';
import type { Specialty } from '../../types/specialty';

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
          getActiveDoctors(),
          getActiveSpecialties()
        ]);
        // Only show top 4 for the home page
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

  return (
    <div className="bg-white">
      {/* Hero Section */}
      <section className="bg-emerald-50 py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight mb-6">
              Đặt khám dễ dàng, <span className="text-emerald-600">chăm sóc sức khỏe toàn diện</span>
            </h1>
            <p className="text-lg text-slate-600 mb-10 leading-relaxed">
              Tìm kiếm bác sĩ, phòng khám chuyên khoa phù hợp và đặt lịch trực tuyến nhanh chóng chỉ với vài thao tác. Tiết kiệm thời gian chờ đợi.
            </p>
            
            <form onSubmit={handleSearch} className="max-w-2xl mx-auto">
              <div className="relative flex items-center bg-white rounded-full shadow-lg p-1.5 focus-within:ring-2 focus-within:ring-emerald-500">
                <FiSearch className="w-6 h-6 text-slate-400 ml-4 flex-shrink-0" />
                <input
                  type="text"
                  placeholder="Tìm tên bác sĩ, chuyên khoa..."
                  className="w-full bg-transparent border-none focus:ring-0 text-slate-700 px-4 py-3 placeholder-slate-400 outline-none"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <button
                  type="submit"
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-full px-8 py-3 transition-colors flex-shrink-0"
                >
                  Tìm kiếm
                </button>
              </div>
            </form>
          </div>
        </div>
      </section>

      {/* Popular Specialties */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-end mb-10">
            <div>
              <h2 className="text-2xl font-bold text-slate-900 mb-2">Chuyên khoa phổ biến</h2>
              <p className="text-slate-500">Khám theo chuyên khoa mà bạn cần</p>
            </div>
            <Link to="/patient/specialties" className="text-emerald-600 font-medium hover:text-emerald-700 flex items-center gap-1 hidden sm:flex">
              Xem tất cả <FiArrowRight />
            </Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                <div key={i} className="animate-pulse bg-slate-100 rounded-xl h-32"></div>
              ))}
            </div>
          ) : specialties.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 gap-4">
              {specialties.map((specialty) => (
                <Link
                  key={specialty.id}
                  to={`/patient/doctors?specialty=${specialty.id}`}
                  className="bg-white border border-slate-100 p-6 rounded-xl shadow-sm hover:shadow-md transition-all hover:border-emerald-100 group flex flex-col items-center text-center"
                >
                  <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mb-4 group-hover:bg-emerald-100 transition-colors">
                    {specialty.imageUrl ? (
                      <img src={specialty.imageUrl} alt={specialty.name} className="w-8 h-8 object-contain" />
                    ) : (
                      <span className="text-2xl">🩺</span>
                    )}
                  </div>
                  <h3 className="font-semibold text-slate-800 group-hover:text-emerald-600 transition-colors">{specialty.name}</h3>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-10 bg-slate-50 rounded-xl">
              <p className="text-slate-500">Chưa có dữ liệu chuyên khoa.</p>
            </div>
          )}
          
          <div className="mt-8 text-center sm:hidden">
             <Link to="/patient/specialties" className="text-emerald-600 font-medium hover:text-emerald-700 inline-flex items-center gap-1">
              Xem tất cả <FiArrowRight />
            </Link>
          </div>
        </div>
      </section>

      {/* Featured Doctors */}
      <section className="py-16 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-end mb-10">
            <div>
              <h2 className="text-2xl font-bold text-slate-900 mb-2">Bác sĩ nổi bật</h2>
              <p className="text-slate-500">Đặt khám với các bác sĩ giỏi, nhiều kinh nghiệm</p>
            </div>
            <Link to="/patient/doctors" className="text-emerald-600 font-medium hover:text-emerald-700 flex items-center gap-1 hidden sm:flex">
              Xem tất cả <FiArrowRight />
            </Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="animate-pulse bg-white rounded-2xl h-72 shadow-sm"></div>
              ))}
            </div>
          ) : doctors.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {doctors.map((doctor) => (
                <div key={doctor.id} className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
                  <div className="flex flex-col items-center text-center">
                    <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center overflow-hidden mb-4">
                      <FiUser className="w-10 h-10 text-slate-400" />
                    </div>
                    <h3 className="font-bold text-lg text-slate-900 mb-1">{doctor.fullName}</h3>
                    <p className="text-emerald-600 text-sm font-medium mb-3">{doctor.specialty?.name || 'Bác sĩ đa khoa'}</p>
                    <div className="flex items-center gap-1 text-yellow-400 mb-4">
                      <FiStar className="fill-current w-4 h-4" />
                      <FiStar className="fill-current w-4 h-4" />
                      <FiStar className="fill-current w-4 h-4" />
                      <FiStar className="fill-current w-4 h-4" />
                      <FiStar className="fill-current w-4 h-4" />
                      <span className="text-slate-500 text-sm ml-1">(5.0)</span>
                    </div>
                    <Link
                      to={`/patient/doctors/${doctor.id}`}
                      className="w-full bg-emerald-50 text-emerald-700 font-medium py-2 rounded-lg hover:bg-emerald-600 hover:text-white transition-colors"
                    >
                      Đặt khám ngay
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          ) : (
             <div className="text-center py-10 bg-white rounded-xl">
              <p className="text-slate-500">Chưa có dữ liệu bác sĩ.</p>
            </div>
          )}
          
           <div className="mt-8 text-center sm:hidden">
             <Link to="/patient/doctors" className="text-emerald-600 font-medium hover:text-emerald-700 inline-flex items-center gap-1">
              Xem tất cả <FiArrowRight />
            </Link>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl font-bold text-slate-900 mb-12">Quy trình đặt khám đơn giản</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center mb-6">
                <FiSearch className="w-8 h-8" />
              </div>
              <h3 className="font-bold text-lg mb-2">1. Tìm kiếm bác sĩ</h3>
              <p className="text-slate-500 max-w-xs">Chọn bác sĩ hoặc chuyên khoa phù hợp với tình trạng sức khỏe của bạn.</p>
            </div>
            
            <div className="flex flex-col items-center relative">
               <div className="hidden md:block absolute top-8 left-1/2 w-full h-0.5 bg-slate-100 -z-10"></div>
              <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center mb-6 bg-white border-8 border-white">
                <FiCalendar className="w-8 h-8" />
              </div>
              <h3 className="font-bold text-lg mb-2">2. Chọn thời gian</h3>
              <p className="text-slate-500 max-w-xs">Xem lịch trình của bác sĩ và chọn khung giờ phù hợp nhất với bạn.</p>
            </div>
            
            <div className="flex flex-col items-center relative">
               <div className="hidden md:block absolute top-8 -left-1/2 w-full h-0.5 bg-slate-100 -z-10"></div>
              <div className="w-16 h-16 bg-green-100 text-green-600 rounded-2xl flex items-center justify-center mb-6 bg-white border-8 border-white">
                <FiClock className="w-8 h-8" />
              </div>
              <h3 className="font-bold text-lg mb-2">3. Khám bệnh</h3>
              <p className="text-slate-500 max-w-xs">Đến phòng khám theo đúng giờ đã hẹn hoặc tham gia tư vấn trực tuyến.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
