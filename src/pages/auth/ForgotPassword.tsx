import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button, Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter, FormField, Input, PasswordInput, ErrorMessage } from '../../components';
import { forgotPassword, resetPassword } from '../../services/auth.service';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [showOtpStep, setShowOtpStep] = useState(false);
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const inputRefs = React.useRef<(HTMLInputElement | null)[]>([]);
  const navigate = useNavigate();

  const handleRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setLoading(true);
    setError(null);
    try {
      await forgotPassword({ email });
      setShowOtpStep(true);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Không thể gửi email lúc này');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    const otpString = otp.join('');
    if (otpString.length !== 6) {
      setError('Vui lòng nhập đủ mã OTP 6 số');
      return;
    }
    
    if (newPassword.length < 6) {
      setError('Mật khẩu mới phải có ít nhất 6 ký tự');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Mật khẩu không khớp');
      return;
    }

    setLoading(true);
    try {
      await resetPassword({ email, otp: otpString, newPassword });
      navigate('/login', { state: { message: 'Mật khẩu đã được đặt lại thành công. Vui lòng đăng nhập bằng mật khẩu mới.' } });
    } catch (err: any) {
      setError(err.response?.data?.message || 'Lỗi khi đặt lại mật khẩu');
    } finally {
      setLoading(false);
    }
  };

  const handleOtpChange = (index: number, value: string) => {
    if (isNaN(Number(value))) return;
    const newOtp = [...otp];
    newOtp[index] = value.substring(value.length - 1);
    setOtp(newOtp);
    
    if (value && index < 5 && inputRefs.current[index + 1]) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0 && inputRefs.current[index - 1]) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-4rem)] p-4 bg-background">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-extrabold text-gradient drop-shadow-sm tracking-tight">YOUMED</CardTitle>
          <CardDescription>
            {!showOtpStep 
              ? "Nhập email của bạn để lấy lại mật khẩu" 
              : "Nhập mã xác nhận và mật khẩu mới"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ErrorMessage message={error} className="mb-4" />
          
          {!showOtpStep ? (
            <form onSubmit={handleRequestOtp} className="flex flex-col gap-4">
              <FormField label="Email" required>
                <Input
                  type="email"
                  placeholder="vidu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={loading}
                />
              </FormField>

              <Button type="submit" className="w-full mt-2" isLoading={loading}>
                Nhận Mã Xác Nhận
              </Button>
            </form>
          ) : (
            <form onSubmit={handleResetPassword} className="flex flex-col gap-4">
              <div className="text-center mb-4 text-sm text-slate-600">
                Chúng tôi đã gửi một mã xác nhận gồm 6 số tới hòm thư <strong>{email}</strong>.
              </div>
              
              <div className="font-medium text-sm text-slate-700">Nhập Mã Xác Nhận <span className="text-red-500">*</span></div>
              <div className="flex justify-between gap-2 my-2 px-4">
                {otp.map((digit, index) => (
                  <input
                    key={index}
                    ref={(el) => { inputRefs.current[index] = el; }}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpChange(index, e.target.value)}
                    onKeyDown={(e) => handleOtpKeyDown(index, e)}
                    disabled={loading}
                    className="w-12 h-14 text-center text-2xl font-bold rounded-lg border-2 border-slate-200 focus:border-primary focus:ring-4 focus:ring-primary/20 outline-none transition-all bg-slate-50 focus:bg-white text-slate-800 disabled:opacity-50"
                  />
                ))}
              </div>

              <FormField label="Mật khẩu mới" required>
                <PasswordInput
                  placeholder="Nhập mật khẩu mới"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  disabled={loading}
                />
              </FormField>

              <FormField label="Xác nhận mật khẩu mới" required>
                <PasswordInput
                  placeholder="Nhập lại mật khẩu mới"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  disabled={loading}
                />
              </FormField>

              <Button type="submit" className="w-full mt-2" isLoading={loading}>
                Đặt Lại Mật Khẩu
              </Button>
            </form>
          )}
        </CardContent>
        <CardFooter className="justify-center">
          <p className="text-sm text-slate-600">
            {!showOtpStep ? (
              <>Nhớ ra mật khẩu? <Link to="/login" className="text-primary hover:underline font-medium">Đăng nhập</Link></>
            ) : (
              <button type="button" onClick={() => setShowOtpStep(false)} className="text-primary hover:underline font-medium">Nhập lại Email</button>
            )}
          </p>
        </CardFooter>
      </Card>
    </div>
  );
};

export default ForgotPassword;
