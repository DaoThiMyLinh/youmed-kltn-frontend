import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  FiChevronRight,
  FiUser,
  FiCheckCircle,
  FiXCircle,
  FiArrowLeft,
  FiRefreshCw,
  FiInfo,
  FiMail,
  FiPhone,
  FiShield,
  FiStar,
  FiMessageSquare,
  FiChevronLeft,
} from 'react-icons/fi';
import { getActiveDoctors } from '../../services/appointment.service';
import { reviewService } from '../../services/review.service';
import type { Doctor } from '../../types/appointment';
import type { DoctorReview, DoctorRatingSummary } from '../../types/review';
import { Loading } from '../../components/feedback/Loading';
import { motion } from 'framer-motion';
import DoctorAvatar from '../../components/common/DoctorAvatar';

const DoctorDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [doctor, setDoctor] = useState<Doctor | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Review states
  const [ratingSummary, setRatingSummary] = useState<DoctorRatingSummary | null>(null);
  const [reviews, setReviews] = useState<DoctorReview[]>([]);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [reviewsError, setReviewsError] = useState<string | null>(null);
  const [reviewPage, setReviewPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);

  const fetchDoctor = async () => {
    if (!id) return;

    try {
      setLoading(true);
      setError(null);
      const doctorsData = await getActiveDoctors();
      const foundDoctor = doctorsData.find((d) => d.id.toString() === id);

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

  const fetchRatingSummary = async () => {
    if (!id) return;
    try {
      const summary = await reviewService.getDoctorRatingSummary(Number(id));
      setRatingSummary(summary);
    } catch (err) {
      console.error('Failed to fetch doctor rating summary:', err);
    }
  };

  const fetchReviews = async (page = 0) => {
    if (!id) return;
    try {
      setReviewsLoading(true);
      setReviewsError(null);
      const res = await reviewService.getReviewsByDoctorId(Number(id), page, 5);
      setReviews(res.content || []);
      setTotalPages(res.totalPages || 0);
      setTotalElements(res.totalElements || 0);
      setReviewPage(res.number || 0);
    } catch (err) {
      console.error('Failed to fetch doctor reviews:', err);
      setReviewsError('Không thể tải danh sách đánh giá từ bệnh nhân.');
    } finally {
      setReviewsLoading(false);
    }
  };

  useEffect(() => {
    fetchDoctor();
    fetchRatingSummary();
    fetchReviews(0);
  }, [id]);

  const handlePageChange = (newPage: number) => {
    if (newPage >= 0 && newPage < totalPages) {
      fetchReviews(newPage);
      const reviewsSection = document.getElementById('doctor-reviews-section');
      if (reviewsSection) {
        reviewsSection.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  const renderStars = (score: number, size = 'w-4 h-4') => {
    const rounded = Math.round(score);
    return (
      <div className="flex items-center gap-1 text-amber-400">
        {[1, 2, 3, 4, 5].map((star) => (
          <FiStar
            key={star}
            className={`${size} ${
              star <= rounded ? 'fill-amber-400 text-amber-400' : 'text-slate-200'
            }`}
          />
        ))}
      </div>
    );
  };

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
                className="bg-slate-100 text-slate-700 font-semibold px-6 py-3 rounded-full hover:bg-slate-200 transition-colors flex items-center gap-2 cursor-pointer"
              >
                <FiArrowLeft /> Quay lại
              </button>
              <button
                onClick={fetchDoctor}
                className="bg-slate-900 text-white font-semibold px-6 py-3 rounded-full hover:bg-slate-800 transition-colors flex items-center gap-2 shadow-md cursor-pointer"
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
              className="bg-emerald-600 text-white font-semibold px-8 py-3.5 rounded-full hover:bg-emerald-700 transition-colors flex items-center gap-2 mx-auto shadow-md hover:shadow-lg cursor-pointer"
            >
              <FiArrowLeft /> Xem danh sách bác sĩ
            </button>
          </motion.div>
        </div>
      </div>
    );
  }

  const avgRating = ratingSummary?.averageRating ?? doctor.averageRating ?? 0;
  const totalRev = ratingSummary?.totalReviews ?? doctor.totalReviews ?? 0;

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
          <Link to="/patient" className="hover:text-emerald-600 font-medium transition-colors">
            Trang chủ
          </Link>
          <FiChevronRight className="mx-2 w-4 h-4 text-slate-400" />
          <Link to="/patient/doctors" className="hover:text-emerald-600 font-medium transition-colors">
            Danh sách bác sĩ
          </Link>
          <FiChevronRight className="mx-2 w-4 h-4 text-slate-400" />
          <span className="text-emerald-700 font-semibold truncate max-w-[150px] sm:max-w-xs">{doctor.fullName}</span>
        </motion.nav>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: Doctor Info & Reviews */}
          <div className="lg:col-span-2 space-y-8">
            {/* Main Profile Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-3xl p-6 sm:p-10 shadow-sm border border-slate-100 flex flex-col sm:flex-row gap-8 items-center sm:items-start relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-emerald-50 to-teal-50 rounded-bl-full opacity-50 -z-0"></div>

              <div className="relative z-10 flex-shrink-0">
                <div className="absolute -inset-2 bg-gradient-to-br from-emerald-400 to-teal-400 rounded-full blur opacity-30"></div>
                <DoctorAvatar
                  imageUrl={doctor.imageUrl}
                  email={doctor.email}
                  fullName={doctor.fullName}
                  doctorId={doctor.id}
                  size="xl"
                />
                <div className="absolute bottom-1 right-1 bg-emerald-500 border-4 border-white text-white p-2 rounded-full shadow-md">
                  <FiShield className="w-5 h-5" />
                </div>
              </div>

              <div className="flex-1 text-center sm:text-left relative z-10">
                <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 mb-2 tracking-tight">
                  {doctor.fullName}
                </h1>
                
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 mb-5">
                  <p className="text-emerald-700 font-bold text-sm bg-emerald-50 px-4 py-1.5 rounded-full border border-emerald-100">
                    {doctor.specialty?.name || 'Bác sĩ đa khoa'}
                  </p>

                  {/* Real Rating Badge */}
                  <a
                    href="#doctor-reviews-section"
                    className="inline-flex items-center gap-1.5 bg-amber-50/80 hover:bg-amber-100/80 px-3.5 py-1.5 rounded-full border border-amber-200/60 transition-colors cursor-pointer"
                  >
                    <FiStar className="fill-amber-400 text-amber-400 w-4 h-4" />
                    <span className="font-extrabold text-slate-900 text-sm">
                      {avgRating > 0 ? avgRating.toFixed(1) : 'Chưa có'}
                    </span>
                    <span className="text-xs text-slate-500 font-medium">
                      ({totalRev} đánh giá)
                    </span>
                  </a>
                </div>

                <div className="flex flex-col sm:flex-row flex-wrap gap-4 text-sm text-slate-600">
                  <div
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full font-semibold border ${
                      doctor.active
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200/50'
                        : 'bg-red-50 text-red-700 border-red-200/50'
                    }`}
                  >
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
                {doctor.biography ||
                  'Bác sĩ chưa cập nhật thông tin giới thiệu chi tiết về quá trình công tác và kinh nghiệm lâm sàng.'}
              </div>
            </motion.div>

            {/* Doctor Reviews & Ratings Section */}
            <motion.div
              id="doctor-reviews-section"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="bg-white rounded-3xl p-6 sm:p-10 shadow-sm border border-slate-100 space-y-8"
            >
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600 shadow-sm">
                    <FiMessageSquare className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-extrabold text-slate-900">Đánh giá từ bệnh nhân</h2>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Dữ liệu thực tế từ các buổi khám bệnh đã hoàn thành
                    </p>
                  </div>
                </div>
                <span className="text-sm font-bold text-emerald-700 bg-emerald-50 px-3.5 py-1 rounded-full border border-emerald-100">
                  {totalRev} đánh giá
                </span>
              </div>

              {/* Rating Overview Summary Box */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-6 p-6 rounded-2xl bg-gradient-to-br from-slate-50 via-amber-50/20 to-emerald-50/20 border border-slate-100">
                {/* Left: Big Score Display */}
                <div className="md:col-span-5 flex flex-col items-center justify-center text-center p-4 border-b md:border-b-0 md:border-r border-slate-200/60">
                  <span className="text-5xl font-black text-slate-900 tracking-tight mb-2">
                    {avgRating > 0 ? avgRating.toFixed(1) : '0.0'}
                  </span>
                  <div className="mb-2">{renderStars(avgRating, 'w-6 h-6')}</div>
                  <p className="text-sm font-bold text-slate-700">
                    {avgRating >= 4.5
                      ? 'Xuất sắc'
                      : avgRating >= 4.0
                      ? 'Rất tốt'
                      : avgRating >= 3.0
                      ? 'Hài lòng'
                      : totalRev === 0
                      ? 'Chưa có lượt đánh giá'
                      : 'Đạt yêu cầu'}
                  </p>
                  <p className="text-xs text-slate-400 mt-1">
                    Dựa trên {totalRev} lượt đánh giá thực tế
                  </p>
                </div>

                {/* Right: Star Distribution Bar Breakdown */}
                <div className="md:col-span-7 flex flex-col justify-center space-y-2">
                  {[5, 4, 3, 2, 1].map((star) => {
                    const count = ratingSummary?.ratingDistribution?.[star] || 0;
                    const percent = totalRev > 0 ? Math.round((count / totalRev) * 100) : 0;
                    return (
                      <div key={star} className="flex items-center gap-3 text-xs">
                        <span className="w-10 font-bold text-slate-600 flex items-center gap-1">
                          {star} <FiStar className="fill-amber-400 text-amber-400 w-3 h-3" />
                        </span>
                        <div className="flex-1 h-2.5 bg-slate-200/70 rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${percent}%` }}
                            transition={{ duration: 0.6, ease: 'easeOut' }}
                            className={`h-full rounded-full ${
                              star >= 4 ? 'bg-emerald-500' : star === 3 ? 'bg-amber-400' : 'bg-rose-400'
                            }`}
                          />
                        </div>
                        <span className="w-12 text-right font-medium text-slate-400">
                          {count} ({percent}%)
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Reviews List */}
              <div className="space-y-4">
                <h3 className="text-lg font-bold text-slate-900 flex items-center justify-between">
                  <span>Nhận xét gần đây</span>
                  {totalRev > 0 && (
                    <span className="text-xs font-normal text-slate-400">
                      Hiển thị {reviews.length} trên tổng số {totalRev}
                    </span>
                  )}
                </h3>

                {reviewsLoading ? (
                  <div className="py-12 flex justify-center items-center">
                    <Loading size="md" />
                  </div>
                ) : reviewsError ? (
                  <div className="p-6 bg-red-50 border border-red-100 rounded-2xl text-center">
                    <p className="text-red-600 font-semibold mb-3">{reviewsError}</p>
                    <button
                      onClick={() => fetchReviews(reviewPage)}
                      className="px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800 transition-colors"
                    >
                      Thử lại
                    </button>
                  </div>
                ) : reviews.length === 0 ? (
                  <div className="p-10 bg-slate-50 rounded-2xl border border-slate-100 text-center">
                    <div className="w-14 h-14 bg-white rounded-full flex items-center justify-center mx-auto mb-3 shadow-sm border border-slate-100 text-slate-400">
                      <FiMessageSquare className="w-6 h-6" />
                    </div>
                    <p className="font-bold text-slate-700 text-base mb-1">Chưa có đánh giá nào</p>
                    <p className="text-xs text-slate-400 max-w-sm mx-auto">
                      Bác sĩ chưa có lượt đánh giá nào từ bệnh nhân. Đánh giá sẽ xuất hiện khi có bệnh nhân hoàn thành buổi khám.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {reviews.map((rev) => (
                      <motion.div
                        key={rev.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="p-5 rounded-2xl bg-white border border-slate-100 hover:border-slate-200 hover:shadow-md transition-all space-y-3"
                      >
                        {/* Reviewer Header */}
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center text-sm shadow-sm flex-shrink-0">
                              {rev.patientName ? rev.patientName.charAt(0).toUpperCase() : 'B'}
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <h4 className="font-bold text-slate-900 text-sm">
                                  {rev.patientName || 'Bệnh nhân ẩn danh'}
                                </h4>
                                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100/60">
                                  <FiShield className="w-3 h-3" /> Đã khám
                                </span>
                              </div>
                              <span className="text-xs text-slate-400">
                                {new Date(rev.createdAt).toLocaleDateString('vi-VN')}
                              </span>
                            </div>
                          </div>

                          {/* Review Stars */}
                          <div className="flex items-center gap-1">
                            {renderStars(rev.rating, 'w-4 h-4')}
                          </div>
                        </div>

                        {/* Comment Content */}
                        <p className="text-sm text-slate-700 leading-relaxed pl-13">
                          {rev.comment ? (
                            rev.comment
                          ) : (
                            <span className="text-slate-400 italic">Bệnh nhân không để lại nhận xét bằng chữ.</span>
                          )}
                        </p>
                      </motion.div>
                    ))}

                    {/* Pagination */}
                    {totalPages > 1 && (
                      <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                        <span className="text-xs text-slate-500 font-medium">
                          Trang {reviewPage + 1} / {totalPages} (Tổng {totalElements} đánh giá)
                        </span>

                        <div className="flex items-center gap-2">
                          <button
                            disabled={reviewPage === 0 || reviewsLoading}
                            onClick={() => handlePageChange(reviewPage - 1)}
                            className="p-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
                          >
                            <FiChevronLeft className="w-4 h-4" />
                          </button>
                          <button
                            disabled={reviewPage >= totalPages - 1 || reviewsLoading}
                            onClick={() => handlePageChange(reviewPage + 1)}
                            className="p-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
                          >
                            <FiChevronRight className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
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
              <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-emerald-400 to-teal-400"></div>

              <h2 className="text-xl font-extrabold text-slate-900 mb-6 mt-2">Thông tin đặt khám</h2>

              <div className="space-y-4 mb-8 bg-slate-50 p-5 rounded-2xl border border-slate-100/50">
                <div className="flex justify-between items-center py-2 border-b border-slate-200/60 border-dashed">
                  <span className="text-slate-500 font-medium">Chuyên khoa</span>
                  <span className="font-bold text-slate-900 text-right">{doctor.specialty?.name || 'Đa khoa'}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-slate-200/60 border-dashed">
                  <span className="text-slate-500 font-medium">Đánh giá</span>
                  <span className="font-bold text-slate-900 text-right flex items-center gap-1 text-amber-500">
                    <FiStar className="fill-current w-4 h-4" />
                    <span>{avgRating > 0 ? avgRating.toFixed(1) : 'Chưa có'}</span>
                    <span className="text-slate-400 text-xs font-normal">({totalRev})</span>
                  </span>
                </div>
                <div className="flex justify-between items-center py-2 pt-2">
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
