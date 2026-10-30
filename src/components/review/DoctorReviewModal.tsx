import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiStar, FiX, FiCheckCircle, FiAlertCircle, FiUser, FiCalendar, FiClock, FiActivity } from 'react-icons/fi';
import type { Appointment } from '../../types/patient';
import type { DoctorReview } from '../../types/review';
import { reviewService } from '../../services/review.service';

interface DoctorReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  appointment: Appointment | null;
  onSuccess?: (review: DoctorReview) => void;
  initialReview?: DoctorReview | null;
}

const RATING_LABELS: Record<number, { text: string; color: string; desc: string }> = {
  1: { text: 'Rất không hài lòng', color: 'text-rose-500', desc: 'Dịch vụ và trải nghiệm rất kém' },
  2: { text: 'Chưa hài lòng', color: 'text-amber-500', desc: 'Có nhiều điểm cần cải thiện' },
  3: { text: 'Bình thường', color: 'text-yellow-500', desc: 'Đạt yêu cầu cơ bản' },
  4: { text: 'Hài lòng', color: 'text-emerald-500', desc: 'Bác sĩ tận tâm, khám chu đáo' },
  5: { text: 'Rất hài lòng', color: 'text-emerald-600', desc: 'Bác sĩ tuyệt vời, điều trị rất hiệu quả' },
};

export const DoctorReviewModal: React.FC<DoctorReviewModalProps> = ({
  isOpen,
  onClose,
  appointment,
  onSuccess,
  initialReview,
}) => {
  const [rating, setRating] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [comment, setComment] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [fetchingExisting, setFetchingExisting] = useState<boolean>(false);
  const [existingReview, setExistingReview] = useState<DoctorReview | null>(initialReview || null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);

  useEffect(() => {
    if (isOpen && appointment) {
      setError(null);
      setSuccess(false);

      if (initialReview) {
        setExistingReview(initialReview);
        setRating(initialReview.rating);
        setComment(initialReview.comment || '');
      } else if (appointment.hasReviewed) {
        // Fetch existing review
        setFetchingExisting(true);
        reviewService.getReviewByAppointmentId(appointment.id)
          .then((res) => {
            setExistingReview(res);
            setRating(res.rating);
            setComment(res.comment || '');
          })
          .catch((err) => {
            console.error('Failed to load existing review:', err);
          })
          .finally(() => {
            setFetchingExisting(false);
          });
      } else {
        setExistingReview(null);
        setRating(5);
        setComment('');
      }
    }
  }, [isOpen, appointment, initialReview]);

  if (!isOpen || !appointment) return null;

  const currentActiveRating = hoverRating || rating;
  const isViewOnly = Boolean(existingReview);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isViewOnly) return;

    if (rating < 1 || rating > 5) {
      setError('Vui lòng chọn số sao đánh giá từ 1 đến 5');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const newReview = await reviewService.createReview({
        appointmentId: appointment.id,
        rating,
        comment: comment.trim() || undefined,
      });

      setSuccess(true);
      setExistingReview(newReview);

      if (onSuccess) {
        onSuccess(newReview);
      }

      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (err: any) {
      console.error('Failed to submit review:', err);
      const msg = err.response?.data?.message || err.response?.data?.error || 'Có lỗi xảy ra khi gửi đánh giá. Vui lòng thử lại sau.';
      setError(typeof msg === 'string' ? msg : JSON.stringify(msg));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden z-10"
        >
          {/* Header Bar with subtle gradient */}
          <div className="relative px-6 pt-6 pb-4 border-b border-slate-100 bg-gradient-to-r from-emerald-50/60 via-teal-50/40 to-white flex items-center justify-between">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 bg-emerald-100/70 px-3 py-1 rounded-full">
                {isViewOnly ? 'Đánh giá đã gửi' : 'Đánh giá bác sĩ'}
              </span>
              <h2 className="text-xl font-extrabold text-slate-900 mt-2">
                {isViewOnly ? 'Trải nghiệm khám của bạn' : 'Cảm nhận sau buổi khám'}
              </h2>
            </div>
            <button
              onClick={onClose}
              className="w-10 h-10 rounded-full bg-slate-100/80 hover:bg-slate-200 text-slate-500 hover:text-slate-800 flex items-center justify-center transition-colors"
            >
              <FiX className="w-5 h-5" />
            </button>
          </div>

          <div className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
            {/* Appointment / Doctor Summary Card */}
            <div className="bg-slate-50/80 rounded-2xl p-4 border border-slate-100 flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center flex-shrink-0 shadow-sm">
                <FiUser className="w-6 h-6" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-slate-900 text-base truncate">{appointment.doctorName}</h3>
                <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-0.5">
                  <FiActivity className="w-3.5 h-3.5 text-emerald-500" />
                  <span className="font-medium text-emerald-700">{appointment.specialization}</span>
                </div>
                <div className="flex items-center gap-3 text-xs text-slate-400 mt-2 pt-2 border-t border-slate-200/60">
                  <span className="flex items-center gap-1">
                    <FiCalendar className="w-3.5 h-3.5" />
                    {new Date(appointment.appointmentTime).toLocaleDateString('vi-VN')}
                  </span>
                  <span className="flex items-center gap-1">
                    <FiClock className="w-3.5 h-3.5" />
                    {new Date(appointment.appointmentTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })}
                  </span>
                </div>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-3.5 bg-red-50 border border-red-200 rounded-2xl text-red-700 text-sm flex items-start gap-2.5"
              >
                <FiAlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                <p className="font-medium">{error}</p>
              </motion.div>
            )}

            {/* Success Message */}
            {success && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-800 text-sm flex items-center gap-3"
              >
                <FiCheckCircle className="w-6 h-6 text-emerald-600 flex-shrink-0" />
                <div>
                  <p className="font-bold">Cảm ơn bạn đã gửi đánh giá!</p>
                  <p className="text-emerald-700 text-xs">Đánh giá của bạn đã được ghi nhận trên hệ thống.</p>
                </div>
              </motion.div>
            )}

            {fetchingExisting ? (
              <div className="py-12 flex flex-col items-center justify-center gap-3">
                <div className="animate-spin rounded-full h-8 w-8 border-3 border-emerald-500 border-t-transparent" />
                <span className="text-sm text-slate-500">Đang tải thông tin đánh giá...</span>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Star Rating Section */}
                <div className="text-center py-2">
                  <label className="block text-sm font-bold text-slate-700 mb-3">
                    {isViewOnly ? 'Điểm bạn đã đánh giá' : 'Bạn đánh giá bác sĩ bao nhiêu sao?'}
                  </label>

                  <div className="flex items-center justify-center gap-2 mb-2">
                    {[1, 2, 3, 4, 5].map((star) => {
                      const isActive = star <= currentActiveRating;
                      return (
                        <button
                          key={star}
                          type="button"
                          disabled={isViewOnly || loading}
                          onClick={() => setRating(star)}
                          onMouseEnter={() => !isViewOnly && setHoverRating(star)}
                          onMouseLeave={() => !isViewOnly && setHoverRating(0)}
                          className={`p-1.5 transition-all duration-150 transform ${
                            isViewOnly ? 'cursor-default' : 'cursor-pointer hover:scale-125 focus:outline-none'
                          }`}
                        >
                          <FiStar
                            className={`w-9 h-9 transition-colors ${
                              isActive
                                ? 'fill-amber-400 text-amber-400 drop-shadow-sm'
                                : 'text-slate-200 hover:text-slate-300'
                            }`}
                          />
                        </button>
                      );
                    })}
                  </div>

                  {/* Rating Label and Description */}
                  <div className="h-10 flex flex-col items-center justify-center">
                    <span className={`text-base font-extrabold ${RATING_LABELS[currentActiveRating]?.color || 'text-slate-700'}`}>
                      {currentActiveRating}/5 — {RATING_LABELS[currentActiveRating]?.text}
                    </span>
                    <span className="text-xs text-slate-400">
                      {RATING_LABELS[currentActiveRating]?.desc}
                    </span>
                  </div>
                </div>

                {/* Comment Section */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-sm font-bold text-slate-700">
                      {isViewOnly ? 'Nội dung nhận xét' : 'Nhận xét của bạn (không bắt buộc)'}
                    </label>
                    {!isViewOnly && (
                      <span className="text-xs text-slate-400">{comment.length}/1000 ký tự</span>
                    )}
                  </div>

                  {isViewOnly ? (
                    <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 text-slate-700 text-sm leading-relaxed min-h-[90px]">
                      {existingReview?.comment || (
                        <span className="text-slate-400 italic">Bạn không để lại nhận xét bằng văn bản.</span>
                      )}
                      {existingReview?.createdAt && (
                        <div className="mt-3 pt-2 border-t border-slate-200/60 text-xs text-slate-400 flex items-center justify-between">
                          <span>Đã đánh giá lúc {new Date(existingReview.createdAt).toLocaleString('vi-VN')}</span>
                          <span className="font-semibold text-emerald-600 flex items-center gap-1">
                            <FiCheckCircle className="w-3.5 h-3.5" /> Đã xác thực
                          </span>
                        </div>
                      )}
                    </div>
                  ) : (
                    <textarea
                      rows={4}
                      maxLength={1000}
                      disabled={loading || success}
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      placeholder="Chia sẻ thêm về trải nghiệm khám bệnh, thái độ của bác sĩ hoặc hướng dẫn điều trị để giúp các bệnh nhân khác..."
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-slate-800 placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all resize-none"
                    />
                  )}
                </div>

                {/* Footer Buttons */}
                <div className="pt-2 flex items-center justify-end gap-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={onClose}
                    disabled={loading}
                    className="px-5 py-2.5 rounded-xl font-semibold text-slate-600 hover:bg-slate-100 transition-colors text-sm"
                  >
                    {isViewOnly ? 'Đóng' : 'Hủy bỏ'}
                  </button>

                  {!isViewOnly && (
                    <button
                      type="submit"
                      disabled={loading || success}
                      className="px-6 py-2.5 rounded-xl font-bold bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white shadow-md hover:shadow-lg transition-all text-sm flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {loading ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          <span>Đang gửi...</span>
                        </>
                      ) : success ? (
                        <>
                          <FiCheckCircle className="w-4 h-4" />
                          <span>Đã gửi</span>
                        </>
                      ) : (
                        <span>Gửi đánh giá</span>
                      )}
                    </button>
                  )}
                </div>
              </form>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
