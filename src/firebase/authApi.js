import { createUserWithEmailAndPassword, onAuthStateChanged, signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { auth, isFirebaseConfigured } from './firebase';
import { createUserProfile } from './userApi';

const firebaseConfigMessage = 'Firebase 환경변수가 설정되지 않았습니다. .env 파일을 확인해주세요.';

const checkFirebaseReady = () => {
  if (!isFirebaseConfigured || !auth) {
    throw new Error(firebaseConfigMessage);
  }
};

const getAuthErrorMessage = (error) => {
  if (!error.code && error.message) {
    return error.message;
  }

  switch (error.code) {
    case 'auth/email-already-in-use':
      return '이미 가입된 이메일입니다.';
    case 'auth/invalid-email':
      return '이메일 형식이 올바르지 않습니다.';
    case 'auth/weak-password':
      return '비밀번호는 6자 이상 입력해주세요.';
    case 'auth/missing-password':
      return '비밀번호를 입력해주세요.';
    case 'auth/invalid-api-key':
      return firebaseConfigMessage;
    case 'auth/invalid-credential':
    case 'auth/user-not-found':
    case 'auth/wrong-password':
      return '이메일 또는 비밀번호가 올바르지 않습니다.';
    case 'auth/network-request-failed':
      return '네트워크 연결을 확인해주세요.';
    default:
      return '처리 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.';
  }
};

const signUp = async (email, password, nickname) => {
  try {
    checkFirebaseReady();

    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const { user } = userCredential;

    await createUserProfile({ user, nickname });

    return user;
  } catch (error) {
    throw new Error(getAuthErrorMessage(error));
  }
};

const login = async (email, password) => {
  try {
    checkFirebaseReady();

    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return userCredential.user;
  } catch (error) {
    throw new Error(getAuthErrorMessage(error));
  }
};

const logout = async () => {
  try {
    checkFirebaseReady();
    await signOut(auth);
  } catch (error) {
    throw new Error(getAuthErrorMessage(error));
  }
};

const subscribeAuthState = (callback) => {
  checkFirebaseReady();
  return onAuthStateChanged(auth, callback);
};

const loginWithEmail = ({ email, password }) => login(email, password);
const signUpWithEmail = ({ email, password, nickname }) => signUp(email, password, nickname);

export { getAuthErrorMessage, login, loginWithEmail, logout, signUp, signUpWithEmail, subscribeAuthState };