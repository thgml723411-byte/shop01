import { create } from 'zustand';
import { login as loginApi, logout as logoutApi, signUp as signUpApi, subscribeAuthState } from '../firebase/authApi';
import { getUser } from '../firebase/userApi';

const makeFallbackProfile = (user) => ({
  email: user.email,
  nickname: user.email,
  role: 'user',
});

const getAuthState = ({ user, profile, loading, error }) => ({
  user,
  profile,
  loading,
  error,
  currentUser: user,
  userProfile: profile,
  isLoggedIn: Boolean(user),
  isAdmin: profile?.role === 'admin',
  isAuthLoading: loading,
  authError: error,
});

const useAuthStore = create((set, get) => ({
  user: null,
  profile: null,
  loading: true,
  error: '',
  currentUser: null,
  userProfile: null,
  isLoggedIn: false,
  isAdmin: false,
  isAuthLoading: true,
  authError: '',
  unsubscribeAuth: null,

  initAuthListener: () => {
    if (get().unsubscribeAuth) {
      return;
    }

    try {
      const unsubscribe = subscribeAuthState(async (user) => {
        if (!user) {
          set(getAuthState({ user: null, profile: null, loading: false, error: '' }));
          return;
        }

        try {
          const profile = await getUser(user);
          set(getAuthState({ user, profile, loading: false, error: '' }));
        } catch (error) {
          const profile = makeFallbackProfile(user);
          set(getAuthState({
            user,
            profile,
            loading: false,
            error: error.message || '사용자 정보를 불러오지 못했습니다.',
          }));
        }
      });

      set({ unsubscribeAuth: unsubscribe });
    } catch (error) {
      set(getAuthState({ user: null, profile: null, loading: false, error: error.message }));
    }
  },

  login: async (email, password) => {
    set({ loading: true, error: '', isAuthLoading: true, authError: '' });
    try {
      const user = await loginApi(email, password);
      const profile = await getUser(user);
      set(getAuthState({ user, profile, loading: false, error: '' }));
      return user;
    } catch (error) {
      set({ loading: false, error: error.message, isAuthLoading: false, authError: error.message });
      throw error;
    }
  },

  signUp: async (email, password, nickname) => {
    set({ loading: true, error: '', isAuthLoading: true, authError: '' });
    try {
      const user = await signUpApi(email, password, nickname.trim());
      const profile = await getUser(user);
      set(getAuthState({ user, profile, loading: false, error: '' }));
      return user;
    } catch (error) {
      set({ loading: false, error: error.message, isAuthLoading: false, authError: error.message });
      throw error;
    }
  },

  resetAuthError: () => {
    set({ error: '', authError: '' });
  },

  setUserProfile: (profile) => {
    set({ profile, userProfile: profile, isAdmin: profile?.role === 'admin' });
  },

  logout: async () => {
    set({ error: '', authError: '' });
    try {
      await logoutApi();
    } catch (error) {
      set({ error: error.message, authError: error.message });
      throw error;
    }
  },

  loginUser: async ({ email, password }) => get().login(email, password),
  signup: async (email, password, nickname) => get().signUp(email, password, nickname),
  signUpUser: async ({ email, password, nickname }) => get().signUp(email, password, nickname),
  logoutUser: async () => get().logout(),
}));

export { useAuthStore };