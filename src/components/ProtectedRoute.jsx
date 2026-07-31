import { useEffect } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

const ProtectedRoute = () => {
  const location = useLocation();
  const initAuthListener = useAuthStore((state) => state.initAuthListener);
  const isLoggedIn = useAuthStore((state) => state.isLoggedIn);
  const isAuthLoading = useAuthStore((state) => state.isAuthLoading);

  useEffect(() => {
    initAuthListener();
  }, [initAuthListener]);

  if (isAuthLoading) {
    return <p>인증 상태를 확인중입니다.</p>;
  }

  if (!isLoggedIn) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
