import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute() {
  const { user, loading } = useAuth();
  const location = useLocation();
  if (loading) return <p style={{ padding: '60px', textAlign: 'center' }}>로그인 상태 확인 중...</p>;
  return user ? <Outlet /> : <Navigate to="/login" state={{ from: location }} replace />;
}
