import { Link } from 'react-router-dom';
import { FiPhone, FiMail, FiMapPin, FiFacebook, FiTwitter, FiInstagram } from 'react-icons/fi';

export const PatientFooter = () => {
  return (
    <footer className="bg-slate-900 text-slate-300 pt-12 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
          {/* Company Info */}
          <div>
            <h2 className="text-2xl font-bold text-white tracking-tight mb-4">YouMed</h2>
            <p className="text-sm text-slate-400 mb-6 leading-relaxed">
              Nền tảng đặt lịch khám bệnh trực tuyến hàng đầu, kết nối bệnh nhân với các bác sĩ và chuyên gia y tế giỏi nhất.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-slate-400 hover:text-white transition-colors">
                <FiFacebook className="w-5 h-5" />
              </a>
              <a href="#" className="text-slate-400 hover:text-white transition-colors">
                <FiTwitter className="w-5 h-5" />
              </a>
              <a href="#" className="text-slate-400 hover:text-white transition-colors">
                <FiInstagram className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-4">Dịch vụ</h3>
            <ul className="space-y-3 text-sm">
              <li>
                <Link to="/patient/doctors" className="hover:text-white transition-colors">Tìm bác sĩ</Link>
              </li>
              <li>
                <Link to="/patient/specialties" className="hover:text-white transition-colors">Chuyên khoa</Link>
              </li>
              <li>
                <Link to="/patient/booking" className="hover:text-white transition-colors">Đặt lịch khám</Link>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors">Tư vấn trực tuyến</a>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-4">Hỗ trợ</h3>
            <ul className="space-y-3 text-sm">
              <li>
                <a href="#" className="hover:text-white transition-colors">Câu hỏi thường gặp</a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors">Điều khoản sử dụng</a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors">Chính sách bảo mật</a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors">Quy trình khiếu nại</a>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-4">Liên hệ</h3>
            <ul className="space-y-4 text-sm">
              <li className="flex items-start">
                <FiMapPin className="w-5 h-5 mr-3 flex-shrink-0 text-emerald-400" />
                <span>123 Đường ABC, Quận X, TP.HCM</span>
              </li>
              <li className="flex items-center">
                <FiPhone className="w-5 h-5 mr-3 flex-shrink-0 text-emerald-400" />
                <span>1900 xxxx (Hỗ trợ 24/7)</span>
              </li>
              <li className="flex items-center">
                <FiMail className="w-5 h-5 mr-3 flex-shrink-0 text-emerald-400" />
                <span>support@youmed.vn</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-slate-800 pt-8 mt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-sm text-slate-400">
            &copy; {new Date().getFullYear()} YouMed. All rights reserved.
          </p>
          <div className="mt-4 md:mt-0 flex space-x-4 text-sm text-slate-400">
            <a href="#" className="hover:text-white transition-colors">Terms</a>
            <span>•</span>
            <a href="#" className="hover:text-white transition-colors">Privacy</a>
          </div>
        </div>
      </div>
    </footer>
  );
};
