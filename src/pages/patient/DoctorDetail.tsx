import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { FiChevronRight, FiUser, FiCheckCircle, FiXCircle, FiArrowLeft, FiRefreshCw, FiInfo, FiMail, FiPhone } from 'react-icons/fi';
import { getActiveDoctors } from '../../services/appointment.service';
import type { Doctor } from '../../types/appointment';
import { Loading } from '../../components/feedback/Loading';

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
      <div className="bg-slate-50 min-h-screen py-20 flex justify-center">
        <Loading size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-slate-50 min-h-screen py-12">
        <div className="max-w-3xl mx-auto px-4">
          <div className="bg-white rounded-2xl p-10 text-center shadow-sm border border-slate-100">
            <h3 className="text-xl font-bold text-slate-800 mb-2">Đã xảy ra lỗi</h3>
            <p className="text-slate-500 mb-6">{error}</p>
            <div className="flex justify-center gap-4">
              <button
                onClick={() => navigate('/patient/doctors')}
                className="bg-slate-100 text-slate-700 font-medium px-6 py-2.5 rounded-lg hover:bg-slate-200 transition-colors flex items-center gap-2"
              >
                <FiArrowLeft /> Quay lại
              </button>
              <button
                onClick={fetchDoctor}
                className="bg-emerald-50 text-emerald-700 font-medium px-6 py-2.5 rounded-lg hover:bg-emerald-100 transition-colors flex items-center gap-2"
              >
                <FiRefreshCw /> Thử lại
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!doctor) {
    return (
      <div className="bg-slate-50 min-h-screen py-12">
        <div className="max-w-3xl mx-auto px-4">
          <div className="bg-white rounded-2xl p-16 text-center shadow-sm border border-slate-100">
            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <FiUser className="w-8 h-8 text-slate-400" />
            </div>
            <h3 className="text-xl font-bold text-slate-800 mb-2">Không tìm thấy bác sĩ</h3>
            <p className="text-slate-500 mb-8">
              Bác sĩ bạn đang tìm kiếm không tồn tại hoặc đã ngừng hoạt động trên hệ thống.
            </p>
            <button
              onClick={() => navigate('/patient/doctors')}
              className="bg-emerald-600 text-white font-medium px-6 py-2.5 rounded-lg hover:bg-emerald-700 transition-colors flex items-center gap-2 mx-auto"
            >
              <FiArrowLeft /> Xem danh sách bác sĩ
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-slate-50 min-h-screen pb-20 pt-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Breadcrumb */}
        <nav className="flex text-sm text-slate-500 mb-8 items-center">
          <Link to="/patient" className="hover:text-emerald-600 transition-colors">Trang chủ</Link>
          <FiChevronRight className="mx-2 w-4 h-4" />
          <Link to="/patient/doctors" className="hover:text-emerald-600 transition-colors">Tìm bác sĩ</Link>
          <FiChevronRight className="mx-2 w-4 h-4" />
          <span className="text-slate-800 font-medium">Chi tiết bác sĩ</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Column: Doctor Info */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Main Profile Card */}
            <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-slate-100 flex flex-col sm:flex-row gap-6 items-start">
              <div className="w-24 h-24 sm:w-32 sm:h-32 bg-slate-100 rounded-full flex items-center justify-center overflow-hidden flex-shrink-0 mx-auto sm:mx-0">
                <FiUser className="w-12 h-12 text-slate-400" />
              </div>
              
              <div className="flex-1 text-center sm:text-left">
                <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-2">{doctor.fullName}</h1>
                <p className="text-emerald-600 font-medium text-lg mb-4">{doctor.specialty?.name || 'Bác sĩ đa khoa'}</p>
                
                <div className="flex flex-col sm:flex-row gap-4 text-sm text-slate-600">
                  <div className="flex items-center justify-center sm:justify-start gap-2">
                    <div className={`flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium ${doctor.active ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>
                      {doctor.active ? <FiCheckCircle /> : <FiXCircle />}
                      {doctor.active ? 'Đang hoạt động' : 'Ngừng hoạt động'}
                    </div>
                  </div>
                  
                  {doctor.email && (
                    <div className="flex items-center justify-center sm:justify-start gap-2">
                      <FiMail className="w-4 h-4 text-slate-400" />
                      <span>{doctor.email}</span>
                    </div>
                  )}
                  
                  {doctor.phone && (
                     <div className="flex items-center justify-center sm:justify-start gap-2">
                      <FiPhone className="w-4 h-4 text-slate-400" />
                      <span>{doctor.phone}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Biography */}
            <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-slate-100">
              <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                <FiInfo className="text-emerald-600" /> Giới thiệu
              </h2>
              <div className="prose prose-slate max-w-none text-slate-600 whitespace-pre-line leading-relaxed">
                {doctor.biography || 'Bác sĩ chưa cập nhật thông tin giới thiệu.'}
              </div>
            </div>

          </div>

          {/* Right Column: Booking Section */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 sticky top-24">
              <h2 className="text-lg font-bold text-slate-900 mb-6">Thông tin đặt khám</h2>
              
              <div className="space-y-4 mb-8">
                <div className="flex justify-between items-center py-3 border-b border-slate-50">
                  <span className="text-slate-500">Chuyên khoa</span>
                  <span className="font-medium text-slate-900">{doctor.specialty?.name || 'Đa khoa'}</span>
                </div>
                <div className="flex justify-between items-center py-3 border-b border-slate-50">
                  <span className="text-slate-500">Phí khám</span>
                  <span className="font-bold text-emerald-600 text-lg">
                    {doctor.consultationFee > 0 ? `${doctor.consultationFee.toLocaleString('vi-VN')} ₫` : 'Miễn phí'}
                  </span>
                </div>
              </div>
              
              {doctor.active ? (
                <Link
                  to={`/patient/booking?doctorId=${doctor.id}`}
                  className="w-full bg-emerald-600 text-white font-medium py-3 rounded-xl hover:bg-emerald-700 transition-colors flex items-center justify-center gap-2 shadow-sm"
                >
                  Đặt lịch khám
                </Link>
              ) : (
                <button
                  disabled
                  className="w-full bg-slate-100 text-slate-400 font-medium py-3 rounded-xl cursor-not-allowed flex items-center justify-center gap-2"
                >
                  Bác sĩ ngừng nhận lịch
                </button>
              )}
              
              <p className="text-xs text-center text-slate-400 mt-4 leading-relaxed">
                Để đặt lịch, vui lòng đảm bảo bạn đã đăng nhập vào hệ thống. Phí khám có thể thay đổi tùy theo dịch vụ phát sinh.
              </p>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default DoctorDetail;
