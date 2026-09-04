import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { logout } from '../store/features/auth/authSlice';
import { removeToken } from '../utils/token';

export const useLogout = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = () => {
    // Xóa localStorage
    removeToken();
    // Xóa Redux state
    dispatch(logout());
    // Điều hướng về Login
    navigate('/login');
  };

  return handleLogout;
};
