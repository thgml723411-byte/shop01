import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
} from 'firebase/firestore';
import { auth, db, isFirebaseConfigured } from './firebase';

const firebaseConfigMessage = 'Firebase 환경변수가 설정되지 않았습니다. .env 파일을 확인해주세요.';

const checkFirestoreReady = () => {
  if (!isFirebaseConfigured || !db) {
    throw new Error(firebaseConfigMessage);
  }
};

const getNoticeErrorMessage = (error) => {
  if (!error.code && error.message) return error.message;

  switch (error.code) {
    case 'permission-denied':
      return '공지사항을 처리할 권한이 없습니다.';
    case 'unavailable':
      return '서버 연결이 원활하지 않습니다. 잠시 후 다시 시도해주세요.';
    default:
      return '공지사항 처리 중 오류가 발생했습니다.';
  }
};

const normalizeNotice = (noticeDoc) => ({
  id: noticeDoc.id,
  ...noticeDoc.data(),
});

const getNotices = async () => {
  try {
    checkFirestoreReady();
    const noticeQuery = query(collection(db, 'notices'), orderBy('createAt', 'desc'));
    const snapshot = await getDocs(noticeQuery);
    return snapshot.docs.map(normalizeNotice);
  } catch (error) {
    throw new Error(getNoticeErrorMessage(error));
  }
};

const getNoticeById = async (noticeId) => {
  try {
    checkFirestoreReady();
    const noticeDoc = await getDoc(doc(db, 'notices', noticeId));
    return noticeDoc.exists() ? normalizeNotice(noticeDoc) : null;
  } catch (error) {
    throw new Error(getNoticeErrorMessage(error));
  }
};

const createNotice = async ({ title, content }) => {
  try {
    checkFirestoreReady();
    const currentUser = auth?.currentUser;
    if (!currentUser) {
      throw new Error('로그인한 관리자 정보를 확인할 수 없습니다.');
    }

    const noticeRef = await addDoc(collection(db, 'notices'), {
      title: title.trim(),
      content: content.trim(),
      authorUid: currentUser.uid,
      createAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    return noticeRef.id;
  } catch (error) {
    throw new Error(getNoticeErrorMessage(error));
  }
};

const updateNotice = async (noticeId, { title, content }) => {
  try {
    checkFirestoreReady();
    await updateDoc(doc(db, 'notices', noticeId), {
      title: title.trim(),
      content: content.trim(),
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    throw new Error(getNoticeErrorMessage(error));
  }
};

const deleteNotice = async (noticeId) => {
  try {
    checkFirestoreReady();
    await deleteDoc(doc(db, 'notices', noticeId));
  } catch (error) {
    throw new Error(getNoticeErrorMessage(error));
  }
};

export { createNotice, deleteNotice, getNoticeById, getNotices, updateNotice };
