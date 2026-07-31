import { updatePassword } from 'firebase/auth';
import { doc, getDoc, serverTimestamp, setDoc, updateDoc } from 'firebase/firestore';
import { db, isFirebaseConfigured } from './firebase';

const firebaseConfigMessage = 'Firebase 환경변수가 설정되지 않았습니다. .env 파일을 확인해주세요.';

const checkFirestoreReady = () => {
  if (!isFirebaseConfigured || !db) {
    throw new Error(firebaseConfigMessage);
  }
};

const getUserErrorMessage = (error) => {
  if (!error.code && error.message) {
    return error.message;
  }

  switch (error.code) {
    case 'auth/weak-password':
      return '비밀번호는 6자 이상 입력해주세요.';
    case 'auth/requires-recent-login':
      return '보안을 위해 다시 로그인한 뒤 비밀번호를 변경해주세요.';
    case 'permission-denied':
      return '회원 정보를 조회하거나 수정할 권한이 없습니다.';
    case 'unavailable':
      return '서버 연결이 원활하지 않습니다. 잠시 후 다시 시도해주세요.';
    default:
      return '회원 정보 처리 중 오류가 발생했습니다.';
  }
};

const makeDefaultUserProfile = (user) => ({
  email: user.email,
  nickname: user.displayName || user.email?.split('@')[0] || '회원',
  role: 'user',
  createAt: serverTimestamp(),
});

const createUserProfile = async ({ user, nickname }) => {
  try {
    checkFirestoreReady();

    if (!user?.uid) {
      throw new Error('회원 정보를 생성할 수 없습니다.');
    }

    const cleanNickname = nickname.trim();
    if (!cleanNickname) {
      throw new Error('닉네임을 입력해주세요.');
    }

    await setDoc(doc(db, 'users', user.uid), {
      email: user.email,
      nickname: cleanNickname,
      role: 'user',
      createAt: serverTimestamp(),
    });
  } catch (error) {
    throw new Error(getUserErrorMessage(error));
  }
};

const getUserProfile = async (user) => {
  try {
    checkFirestoreReady();

    if (!user?.uid) {
      throw new Error('로그인 상태를 확인할 수 없습니다.');
    }

    const userRef = doc(db, 'users', user.uid);
    const userDoc = await getDoc(userRef);

    if (userDoc.exists()) {
      return { id: userDoc.id, ...userDoc.data() };
    }

    await setDoc(userRef, makeDefaultUserProfile(user));

    const createdDoc = await getDoc(userRef);
    if (!createdDoc.exists()) {
      throw new Error('회원 기본 정보를 생성하지 못했습니다.');
    }

    return { id: createdDoc.id, ...createdDoc.data() };
  } catch (error) {
    throw new Error(getUserErrorMessage(error));
  }
};

const updateUserNickname = async ({ uid, nickname }) => {
  try {
    checkFirestoreReady();

    const cleanNickname = nickname.trim();
    if (!cleanNickname) {
      throw new Error('닉네임을 입력해주세요.');
    }

    await updateDoc(doc(db, 'users', uid), {
      nickname: cleanNickname,
    });

    return cleanNickname;
  } catch (error) {
    throw new Error(getUserErrorMessage(error));
  }
};

const updateUserPassword = async ({ user, password }) => {
  try {
    if (!user) {
      throw new Error('로그인 상태를 확인할 수 없습니다.');
    }

    if (password.length < 6) {
      throw new Error('비밀번호는 6자 이상 입력해주세요.');
    }

    await updatePassword(user, password);
  } catch (error) {
    throw new Error(getUserErrorMessage(error));
  }
};

const getUser = getUserProfile;

export { createUserProfile, getUser, getUserProfile, updateUserNickname, updateUserPassword };
