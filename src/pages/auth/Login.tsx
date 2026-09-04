import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { loginThunk, selectAuthLoading, selectAuthError, clearError } from '../../store/features/auth/authSlice';
import type { LoginRequest } from '../../types/auth';
import { Button, Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter, FormField, Input, PasswordInput, ErrorMessage } from '../../components';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();
  const dispatch = useDispatch<any>();
  const loading = useSelector(selectAuthLoading);
  const error = useSelector(selectAuthError);

  useEffect(() => {
    dispatch(clearError());
  }, [dispatch]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;

    const data: LoginRequest = { email, password };
    const resultAction = await dispatch(loginThunk(data));

    if (loginThunk.fulfilled.match(resultAction)) {
      const role = resultAction.payload.role;
      if (role === 'DOCTOR') {
        navigate('/doctor-dashboard');
      } else if (role === 'ADMIN') {
        navigate('/admin-dashboard');
      } else {
        navigate('/patient-dashboard');
      }
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-4rem)] p-4 bg-background">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-extrabold text-gradient drop-shadow-sm tracking-tight">YOUMED</CardTitle>
          <CardDescription>Nhập thông tin của bạn để đăng nhập</CardDescription>
        </CardHeader>
        <CardContent>
          <ErrorMessage message={error} className="mb-4" />
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
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
              <div className="flex flex-col gap-1">
                <PasswordInput
                  placeholder="Nhập mật khẩu của bạn"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={loading}
                />
                <div className="flex justify-end mt-1">
                  <Link to="/forgot-password" className="text-sm text-primary hover:underline font-medium">Quên mật khẩu?</Link>
                </div>
              </div>
            </FormField>

            <Button type="submit" className="w-full mt-2" isLoading={loading}>
              Đăng Nhập
            </Button>
          </form>
        </CardContent>
        <CardFooter className="justify-center">
          <p className="text-sm text-slate-600">
            Bạn chưa có tài khoản? <Link to="/register" className="text-primary hover:underline font-medium">Đăng ký tại đây</Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
};

export default Login;
