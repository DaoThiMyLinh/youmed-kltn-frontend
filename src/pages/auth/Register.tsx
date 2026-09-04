import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { registerThunk, verifyOtpThunk, selectAuthLoading, selectAuthError, clearError } from '../../store/features/auth/authSlice';
import type { RegisterRequest } from '../../types/auth';
import { Button, Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter, FormField, Input, PasswordInput, ErrorMessage } from '../../components';

const Register = () => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [localError, setLocalError] = useState<string | null>(null);
  
  const [showOtp, setShowOtp] = useState(false);
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [otpLoading, setOtpLoading] = useState(false);
  const inputRefs = React.useRef<(HTMLInputElement | null)[]>([]);
  
  const dispatch = useDispatch<any>();
  const navigate = useNavigate();
  const loading = useSelector(selectAuthLoading);
  const serverError = useSelector(selectAuthError);

  useEffect(() => {
    dispatch(clearError());
  }, [dispatch]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);

    // Validation cơ bản
    if (!fullName || !email || !password || !confirmPassword) {
      setLocalError('Vui lòng điền đầy đủ thông tin');
      return;
    }

    if (password !== confirmPassword) {
      setLocalError('Mật khẩu không khớp');
      return;
    }
    
    if (password.length < 6) {
      setLocalError('Mật khẩu phải có ít nhất 6 ký tự');
      return;
    }

    const data: RegisterRequest = { fullName, email, password };
    const resultAction = await dispatch(registerThunk(data));
    
    if (registerThunk.fulfilled.match(resultAction)) {
      setShowOtp(true);
      setLocalError(null);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);
    const otpString = otp.join('');
    if (otpString.length !== 6) {
      setLocalError('Vui lòng nhập đủ mã OTP 6 số');
      return;
    }

    setOtpLoading(true);
    try {
      const resultAction = await dispatch(verifyOtpThunk({ email, otp: otpString }));
      
      if (verifyOtpThunk.fulfilled.match(resultAction)) {
        const role = resultAction.payload.role;
        if (role === 'DOCTOR') {
          navigate('/doctor-dashboard');
        } else if (role === 'ADMIN') {
          navigate('/admin-dashboard');
        } else {
          navigate('/patient-dashboard');
        }
      } else {
        setLocalError(resultAction.payload as string || 'Mã OTP không hợp lệ');
      }
    } catch (error: any) {
      setLocalError('Đã xảy ra lỗi khi xác minh');
    } finally {
      setOtpLoading(false);
    }
  };

  const handleOtpChange = (index: number, value: string) => {
    if (isNaN(Number(value))) return; // Only allow numbers
    const newOtp = [...otp];
    newOtp[index] = value.substring(value.length - 1); // Keep only the last typed character
    setOtp(newOtp);
    
    // Move to next input if value is entered
    if (value && index < 5 && inputRefs.current[index + 1]) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0 && inputRefs.current[index - 1]) {
      // Move to previous input on backspace if current is empty
      inputRefs.current[index - 1]?.focus();
    }
  };

  const displayError = localError || serverError;

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-4rem)] p-4 bg-background">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-extrabold text-gradient drop-shadow-sm tracking-tight">YOUMED</CardTitle>
          <CardDescription>Điền thông tin của bạn để đăng ký tài khoản</CardDescription>
        </CardHeader>
        <CardContent>
          <ErrorMessage message={displayError} className="mb-4" />
          
          {!showOtp ? (
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <FormField label="Họ và tên" required>
                <Input 
                  type="text" 
                  placeholder="Nguyễn Văn A" 
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)} 
                  required 
                  disabled={loading}
                />
              </FormField>
              
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
              
              <FormField label="Mật khẩu" required>
                <PasswordInput 
                  placeholder="Tạo mật khẩu" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)} 
                  required 
                  disabled={loading}
                />
              </FormField>
              
              <FormField label="Xác nhận mật khẩu" required>
                <PasswordInput 
                  placeholder="Nhập lại mật khẩu" 
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)} 
                  required 
                  disabled={loading}
                />
              </FormField>

              <Button type="submit" className="w-full mt-2" isLoading={loading}>
                Đăng Ký
              </Button>
            </form>
          ) : (
            <form onSubmit={handleVerifyOtp} className="flex flex-col gap-4">
              <div className="text-center mb-4 text-sm text-slate-600">
                Chúng tôi đã gửi một mã xác nhận gồm 6 số tới hòm thư <strong>{email}</strong>. 
                Vui lòng kiểm tra hòm thư của bạn.
              </div>
              <div className="font-medium text-sm text-slate-700">Nhập Mã Xác Nhận <span className="text-red-500">*</span></div>
              <div className="flex justify-between gap-2 my-6 px-4">
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
                    disabled={otpLoading}
                    className="w-12 h-14 text-center text-2xl font-bold rounded-lg border-2 border-slate-200 focus:border-primary focus:ring-4 focus:ring-primary/20 outline-none transition-all bg-slate-50 focus:bg-white text-slate-800 disabled:opacity-50"
                  />
                ))}
              </div>
              <Button type="submit" className="w-full mt-2" isLoading={otpLoading}>
                Xác Nhận OTP
              </Button>
            </form>
          )}
        </CardContent>
        <CardFooter className="justify-center">
          <p className="text-sm text-slate-600">
            {!showOtp ? (
              <>Bạn đã có tài khoản? <Link to="/login" className="text-primary hover:underline font-medium">Đăng nhập tại đây</Link></>
            ) : (
              <button type="button" onClick={() => setShowOtp(false)} className="text-primary hover:underline font-medium">Quay lại màn hình Đăng ký</button>
            )}
          </p>
        </CardFooter>
      </Card>
    </div>
  );
};

export default Register;
