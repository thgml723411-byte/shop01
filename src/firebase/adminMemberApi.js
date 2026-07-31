import { collection, getDocs, orderBy, query } from 'firebase/firestore';
import { db, isFirebaseConfigured } from './firebase';

const firebaseConfigMessage = 'Firebase 환경변수가 설정되지 않았습니다. .env 파일을 확인해주세요.';

const checkFirestoreReady = () => {
  if (!isFirebaseConfigured || !db) {
    throw new Error(firebaseConfigMessage);
  }
};

const getAdminErrorMessage = (error) => {
  if (!error.code && error.message) {
    return error.message;
  }

  switch (error.code) {
    case 'permission-denied':
      return '회원 목록을 조회할 관리자 권한이 없습니다.';
    case 'unavailable':
      return '서버 연결이 원활하지 않습니다. 잠시 후 다시 시도해주세요.';
    default:
      return '회원 목록 조회 중 오류가 발생했습니다.';
  }
};

const getAdminMembers = async () => {
  try {
    checkFirestoreReady();

    const usersRef = collection(db, 'users');
    const usersQuery = query(usersRef, orderBy('createAt', 'desc'));
    const snapshot = await getDocs(usersQuery);

    return snapshot.docs.map((userDoc) => ({
      id: userDoc.id,
      ...userDoc.data(),
    }));
  } catch (error) {
    throw new Error(getAdminErrorMessage(error));
  }
};

export { getAdminMembers };
