import { useEffect } from 'react';
import { useAuthStore } from '../store/authStore';

const useAuth = () => {
  const initAuthListener = useAuthStore((state) => state.initAuthListener);

  useEffect(() => {
    initAuthListener();
  }, [initAuthListener]);

  return useAuthStore();
};

export default useAuth;
