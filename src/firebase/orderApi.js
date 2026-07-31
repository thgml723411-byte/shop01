import { collection, doc, getDocs, query, runTransaction, serverTimestamp, where } from 'firebase/firestore';
import { db, isFirebaseConfigured } from './firebase';

const firebaseConfigMessage = 'Firebase 환경변수가 설정되지 않았습니다. .env 파일을 확인해주세요.';

const checkFirestoreReady = () => {
  if (!isFirebaseConfigured || !db) {
    throw new Error(firebaseConfigMessage);
  }
};

const getOrderErrorMessage = (error) => {
  if (!error.code && error.message) {
    return error.message;
  }

  switch (error.code) {
    case 'permission-denied':
      return '주문을 처리할 권한이 없습니다.';
    case 'unavailable':
      return '서버 연결이 원활하지 않습니다. 잠시 후 다시 시도해주세요.';
    default:
      return '주문 처리 중 오류가 발생했습니다.';
  }
};

const getTimeValue = (value) => {
  if (!value) {
    return 0;
  }

  const date = typeof value.toDate === 'function' ? value.toDate() : new Date(value);
  return Number.isNaN(date.getTime()) ? 0 : date.getTime();
};

const getUserOrders = async (uid) => {
  try {
    checkFirestoreReady();

    if (!uid) {
      throw new Error('로그인 상태를 확인할 수 없습니다.');
    }

    const ordersRef = collection(db, 'orders');
    const queryList = [
      query(ordersRef, where('userId', '==', uid)),
      query(ordersRef, where('uid', '==', uid)),
    ];
    const orderMap = new Map();

    for (const orderQuery of queryList) {
      const snapshot = await getDocs(orderQuery);
      snapshot.forEach((orderDoc) => {
        orderMap.set(orderDoc.id, { id: orderDoc.id, ...orderDoc.data() });
      });
    }

    return Array.from(orderMap.values()).sort((a, b) => {
      const firstDate = a.createAt || a.createdAt || a.orderDate;
      const secondDate = b.createAt || b.createdAt || b.orderDate;
      return getTimeValue(secondDate) - getTimeValue(firstDate);
    });
  } catch (error) {
    throw new Error(getOrderErrorMessage(error));
  }
};

const normalizeOrderItem = (item) => ({
  productId: item.productId || item.id,
  productName: item.productName || item.name || item.title || '상품명 없음',
  name: item.productName || item.name || item.title || '상품명 없음',
  image: item.image || item.productImage || '',
  quantity: Number(item.quantity || 1),
  price: Number(item.discountPrice || item.price || item.productPrice || 0),
  originalPrice: Number(item.price || item.originalPrice || item.productPrice || 0),
  discountRate: Number(item.discountRate || 0),
  category: item.category || '',
});

const createCartOrder = async ({ user, items, subtotal, deliveryfree, totalPrice }) => {
  try {
    checkFirestoreReady();

    if (!user?.uid) {
      throw new Error('로그인 후 주문할 수 있습니다.');
    }

    if (!Array.isArray(items) || items.length === 0) {
      throw new Error('주문할 상품이 없습니다.');
    }

    const orderItems = items.map(normalizeOrderItem);

    orderItems.forEach((item) => {
      if (!item.productId) {
        throw new Error('상품 정보를 확인할 수 없어 주문할 수 없습니다.');
      }

      if (!Number.isInteger(item.quantity) || item.quantity <= 0) {
        throw new Error('주문 수량은 1개 이상의 정수만 가능합니다.');
      }
    });

    const orderRef = doc(collection(db, 'orders'));
    const stockTargets = orderItems.reduce((targets, item) => {
      const productKey = String(item.productId);
      const prev = targets.get(productKey) || { quantity: 0, productName: item.productName };
      targets.set(productKey, {
        productName: prev.productName,
        quantity: prev.quantity + item.quantity,
      });
      return targets;
    }, new Map());

    await runTransaction(db, async (transaction) => {
      const stockUpdates = [];

      for (const [productId, target] of stockTargets) {
        const productRef = doc(db, 'products', productId);
        const productSnap = await transaction.get(productRef);

        if (!productSnap.exists()) {
          throw new Error(`${target.productName} 상품 정보를 찾을 수 없습니다.`);
        }

        const productData = productSnap.data();
        const currentStock = Number(productData.stock || 0);

        if (!Number.isInteger(currentStock) || currentStock < target.quantity) {
          throw new Error(`${target.productName} 재고가 부족합니다. 현재 재고는 ${currentStock.toLocaleString()}개입니다.`);
        }

        stockUpdates.push({
          productRef,
          nextStock: currentStock - target.quantity,
        });
      }

      transaction.set(orderRef, {
        userId: user.uid,
        uid: user.uid,
        email: user.email,
        items: orderItems,
        subtotal: Number(subtotal || 0),
        deliveryfree: Number(deliveryfree || 0),
        totalPrice: Number(totalPrice || 0),
        createAt: serverTimestamp(),
        status: 'ordered',
      });

      stockUpdates.forEach(({ productRef, nextStock }) => {
        transaction.update(productRef, {
          stock: nextStock,
          updateAt: serverTimestamp(),
        });
      });
    });

    return orderRef.id;
  } catch (error) {
    throw new Error(getOrderErrorMessage(error));
  }
};

export { createCartOrder, getUserOrders };

