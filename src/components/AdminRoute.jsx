import { useEffect } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

const AdminRoute = () => {
  const location = useLocation();
  const initAuthListener = useAuthStore((state) => state.initAuthListener);
  const isLoggedIn = useAuthStore((state) => state.isLoggedIn);
  const isAdmin = useAuthStore((state) => state.isAdmin);
  const isAuthLoading = useAuthStore((state) => state.isAuthLoading);

  useEffect(() => {
    initAuthListener();
  }, [initAuthListener]);

  if (isAuthLoading) {
    return <p>관리자 권한을 확인중입니다.</p>;
  }

  if (!isLoggedIn) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (!isAdmin) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};

export default AdminRoute;
