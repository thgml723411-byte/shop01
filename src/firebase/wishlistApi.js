import { addDoc, collection, deleteDoc, doc, getDocs, query, serverTimestamp, where } from 'firebase/firestore';
import { db, isFirebaseConfigured } from './firebase';

const firebaseConfigMessage = 'Firebase 환경변수가 설정되지 않았습니다. .env 파일을 확인해주세요.';

const checkFirestoreReady = () => {
  if (!isFirebaseConfigured || !db) {
    throw new Error(firebaseConfigMessage);
  }
};

const getWishlistErrorMessage = (error) => {
  if (!error.code && error.message) {
    return error.message;
  }

  switch (error.code) {
    case 'permission-denied':
      return '찜 목록을 조회하거나 수정할 권한이 없습니다.';
    case 'unavailable':
      return '서버 연결이 원활하지 않습니다. 잠시 후 다시 시도해주세요.';
    default:
      return '찜 목록 처리 중 오류가 발생했습니다.';
  }
};

const getUserWishlistItems = async (uid) => {
  try {
    checkFirestoreReady();

    if (!uid) {
      throw new Error('로그인 상태를 확인할 수 없습니다.');
    }

    const wishlistRef = collection(db, 'wishlists');
    const queryList = [
      query(wishlistRef, where('userId', '==', uid)),
      query(wishlistRef, where('uid', '==', uid)),
    ];
    const wishlistMap = new Map();

    for (const wishlistQuery of queryList) {
      const snapshot = await getDocs(wishlistQuery);
      snapshot.forEach((wishlistDoc) => {
        wishlistMap.set(wishlistDoc.id, { id: wishlistDoc.id, ...wishlistDoc.data() });
      });
    }

    return Array.from(wishlistMap.values());
  } catch (error) {
    throw new Error(getWishlistErrorMessage(error));
  }
};

const addUserWishlistItem = async ({ user, product }) => {
  try {
    checkFirestoreReady();

    if (!user?.uid) {
      throw new Error('로그인 후 찜할 수 있습니다.');
    }

    const savedWishlist = await getUserWishlistItems(user.uid);
    const exists = savedWishlist.some((item) => String(item.productId) === String(product.id));
    if (exists) {
      return null;
    }

    const wishlistRef = await addDoc(collection(db, 'wishlists'), {
      userId: user.uid,
      uid: user.uid,
      productId: product.id,
      productName: product.name,
      name: product.name,
      price: Number(product.price || 0),
      discountPrice: Number(product.price || 0) - (Number(product.price || 0) * Number(product.discountRate || 0)) / 100,
      image: product.image || '',
      category: product.category || '',
      createAt: serverTimestamp(),
    });

    return wishlistRef.id;
  } catch (error) {
    throw new Error(getWishlistErrorMessage(error));
  }
};

const removeUserWishlistProduct = async ({ uid, productId }) => {
  try {
    const savedWishlist = await getUserWishlistItems(uid);
    const removeTargets = savedWishlist.filter((item) => String(item.productId) === String(productId));

    for (const item of removeTargets) {
      await deleteDoc(doc(db, 'wishlists', item.id));
    }
  } catch (error) {
    throw new Error(getWishlistErrorMessage(error));
  }
};

const deleteUserWishlistItem = async (wishlistId) => {
  try {
    checkFirestoreReady();

    if (!wishlistId) {
      throw new Error('삭제할 찜 상품을 확인할 수 없습니다.');
    }

    await deleteDoc(doc(db, 'wishlists', wishlistId));
  } catch (error) {
    throw new Error(getWishlistErrorMessage(error));
  }
};

export { addUserWishlistItem, deleteUserWishlistItem, getUserWishlistItems, removeUserWishlistProduct };
