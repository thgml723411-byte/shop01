import { collection, deleteDoc, doc, getDocs, query, setDoc, updateDoc, where } from 'firebase/firestore';
import { db, isFirebaseConfigured } from './firebase';

const firebaseConfigMessage = 'Firebase 환경변수가 설정되지 않았습니다. .env 파일을 확인해주세요.';

const checkFirestoreReady = () => {
  if (!isFirebaseConfigured || !db) {
    throw new Error(firebaseConfigMessage);
  }
};

const getCartErrorMessage = (error) => {
  if (!error.code && error.message) {
    return error.message;
  }

  switch (error.code) {
    case 'permission-denied':
      return '장바구니를 조회하거나 수정할 권한이 없습니다.';
    case 'unavailable':
      return '서버 연결이 원활하지 않습니다. 잠시 후 다시 시도해주세요.';
    default:
      return '장바구니 처리 중 오류가 발생했습니다.';
  }
};

const getCartDocId = (uid, productId) => `${uid}_${productId}`;

const normalizeCartItem = (cartDoc) => {
  const data = cartDoc.data();
  const productId = data.productId || data.id || cartDoc.id;

  return {
    id: cartDoc.id,
    cartId: cartDoc.id,
    productId,
    name: data.productName || data.name || data.title || '상품명 없음',
    productName: data.productName || data.name || data.title || '상품명 없음',
    price: Number(data.price || data.productPrice || data.discountPrice || 0),
    discountPrice: Number(data.discountPrice || data.price || data.productPrice || 0),
    quantity: Number(data.quantity || 1),
    image: data.image || data.productImage || '/img/empty/empty-cart.svg',
    category: data.category || '',
    ...data,
  };
};

const getUserCartItems = async (uid) => {
  try {
    checkFirestoreReady();

    if (!uid) {
      throw new Error('로그인 상태를 확인할 수 없습니다.');
    }

    const cartsRef = collection(db, 'carts');
    const queryList = [
      query(cartsRef, where('userId', '==', uid)),
      query(cartsRef, where('uid', '==', uid)),
    ];
    const cartMap = new Map();

    for (const cartQuery of queryList) {
      const snapshot = await getDocs(cartQuery);
      snapshot.forEach((cartDoc) => {
        cartMap.set(cartDoc.id, normalizeCartItem(cartDoc));
      });
    }

    return Array.from(cartMap.values());
  } catch (error) {
    throw new Error(getCartErrorMessage(error));
  }
};

const addUserCartItem = async ({ user, product, quantity = 1 }) => {
  try {
    checkFirestoreReady();

    if (!user?.uid) {
      throw new Error('로그인 후 장바구니에 담을 수 있습니다.');
    }

    const cartRef = doc(db, 'carts', getCartDocId(user.uid, product.id));
    const originalPrice = Number(product.originalPrice || product.price || 0);
    const discountRate = Number(product.discountRate || 0);
    const discountPrice = product.discountPrice
      ? Number(product.discountPrice)
      : originalPrice - (originalPrice * discountRate) / 100;

    await setDoc(cartRef, {
      userId: user.uid,
      uid: user.uid,
      productId: product.id,
      productName: product.name,
      name: product.name,
      price: originalPrice,
      discountPrice,
      quantity: Number(quantity || 1),
      image: product.image || '',
      category: product.category || '',
    }, { merge: true });

    return cartRef.id;
  } catch (error) {
    throw new Error(getCartErrorMessage(error));
  }
};

const updateUserCartItemQuantity = async ({ cartId, quantity }) => {
  try {
    checkFirestoreReady();

    if (!cartId) {
      throw new Error('수정할 장바구니 상품을 확인할 수 없습니다.');
    }

    await updateDoc(doc(db, 'carts', cartId), {
      quantity: Number(quantity || 1),
    });
  } catch (error) {
    throw new Error(getCartErrorMessage(error));
  }
};

const deleteUserCartItem = async (cartId) => {
  try {
    checkFirestoreReady();

    if (!cartId) {
      throw new Error('삭제할 장바구니 상품을 확인할 수 없습니다.');
    }

    await deleteDoc(doc(db, 'carts', cartId));
  } catch (error) {
    throw new Error(getCartErrorMessage(error));
  }
};

const clearUserCartItems = async (uid) => {
  try {
    const cartItems = await getUserCartItems(uid);

    for (const item of cartItems) {
      await deleteUserCartItem(item.cartId || item.id);
    }
  } catch (error) {
    throw new Error(getCartErrorMessage(error));
  }
};

export { addUserCartItem, clearUserCartItems, deleteUserCartItem, getUserCartItems, updateUserCartItemQuantity };
