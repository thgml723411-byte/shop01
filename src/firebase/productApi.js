import { addDoc, collection, deleteDoc, doc, getDoc, getDocs, onSnapshot, query, serverTimestamp, updateDoc, where, writeBatch } from 'firebase/firestore';
import { db, isFirebaseConfigured } from './firebase';

const firebaseConfigMessage = 'Firebase 환경변수가 설정되지 않았습니다. .env 파일을 확인해주세요.';
const MAX_RECOMMENDED_PRODUCTS = 4;

const checkFirestoreReady = () => {
  if (!isFirebaseConfigured || !db) {
    throw new Error(firebaseConfigMessage);
  }
};

const getProductErrorMessage = (error) => {
  if (!error.code && error.message) return error.message;

  switch (error.code) {
    case 'permission-denied':
      return '상품을 처리할 권한이 없습니다.';
    case 'unavailable':
      return '서버 연결이 원활하지 않습니다. 잠시 후 다시 시도해주세요.';
    default:
      return '상품 처리 중 오류가 발생했습니다.';
  }
};

const getTimeValue = (value) => {
  if (!value) return 0;
  const date = typeof value.toDate === 'function' ? value.toDate() : new Date(value);
  return Number.isNaN(date.getTime()) ? 0 : date.getTime();
};

const normalizeProduct = (productDoc) => ({
  id: productDoc.id,
  ...productDoc.data(),
  isFirestoreProduct: true,
});

const getJsonProductsFallback = async () => {
  if (typeof fetch !== 'function') return [];

  const response = await fetch('/data/products.json');
  const products = await response.json();
  const recommendIds = [1, 3, 5, 7];

  return products.map((product) => ({
    ...product,
    id: String(product.id),
    legacyId: product.id,
    stock: Number(product.stock || 20),
    description: product.description || '',
    isRecommended: Boolean(product.isRecommended || recommendIds.includes(product.id)),
    isFirestoreProduct: false,
  }));
};


const sortProducts = (products) => products.sort((a, b) => {
  const firstDate = getTimeValue(a.createAt);
  const secondDate = getTimeValue(b.createAt);
  if (secondDate !== firstDate) return secondDate - firstDate;
  return String(b.id).localeCompare(String(a.id));
});
const makeProductPayload = (product) => ({
  ...(product.legacyId ? { legacyId: product.legacyId } : {}),
  name: product.name.trim(),
  nameEn: product.nameEn?.trim() || '',
  category: product.category.trim(),
  categoryValue: product.categoryValue.trim(),
  price: Number(product.price || 0),
  discountRate: Number(product.discountRate || 0),
  stock: Number(product.stock || 0),
  image: product.image.trim(),
  description: product.description?.trim() || '',
  isRecommended: Boolean(product.isRecommended),
});

const checkRecommendedLimit = async (productId = '') => {
  const recommendedQuery = query(
    collection(db, 'products'),
    where('isRecommended', '==', true),
  );
  const snapshot = await getDocs(recommendedQuery);
  const isAlreadyRecommended = productId
    ? snapshot.docs.some((productDoc) => productDoc.id === productId)
    : false;

  if (!isAlreadyRecommended && snapshot.size >= MAX_RECOMMENDED_PRODUCTS) {
    throw new Error(`추천 상품은 최대 ${MAX_RECOMMENDED_PRODUCTS}개까지 설정할 수 있습니다.`);
  }
};

const getProducts = async ({ fallbackToJson = true } = {}) => {
  try {
    checkFirestoreReady();

    const snapshot = await getDocs(collection(db, 'products'));
    const products = snapshot.docs.map(normalizeProduct).sort((a, b) => {
      const firstDate = getTimeValue(a.createAt);
      const secondDate = getTimeValue(b.createAt);
      if (secondDate !== firstDate) return secondDate - firstDate;
      return String(b.id).localeCompare(String(a.id));
    });

    if (products.length === 0 && fallbackToJson) {
      return getJsonProductsFallback();
    }

    return products;
  } catch (error) {
    if (fallbackToJson) {
      return getJsonProductsFallback();
    }

    throw new Error(getProductErrorMessage(error));
  }
};

const getProductById = async (productId, { fallbackToJson = true } = {}) => {
  try {
    checkFirestoreReady();

    const productDoc = await getDoc(doc(db, 'products', productId));
    if (!productDoc.exists()) {
      if (!fallbackToJson) return null;
      const fallbackProducts = await getJsonProductsFallback();
      return fallbackProducts.find((product) => String(product.id) === String(productId)) || null;
    }

    return normalizeProduct(productDoc);
  } catch (error) {
    if (fallbackToJson) {
      const fallbackProducts = await getJsonProductsFallback();
      return fallbackProducts.find((product) => String(product.id) === String(productId)) || null;
    }

    throw new Error(getProductErrorMessage(error));
  }
};


const subscribeProducts = ({ onNext, onError, fallbackToJson = true }) => {
  try {
    checkFirestoreReady();

    return onSnapshot(collection(db, 'products'), async (snapshot) => {
      const products = sortProducts(snapshot.docs.map(normalizeProduct));

      if (products.length === 0 && fallbackToJson) {
        onNext(await getJsonProductsFallback());
        return;
      }

      onNext(products);
    }, async (error) => {
      if (fallbackToJson) {
        onNext(await getJsonProductsFallback());
        return;
      }

      onError?.(new Error(getProductErrorMessage(error)));
    });
  } catch (error) {
    if (fallbackToJson) {
      getJsonProductsFallback().then(onNext).catch((fallbackError) => {
        onError?.(new Error(getProductErrorMessage(fallbackError)));
      });
      return () => {};
    }

    onError?.(new Error(getProductErrorMessage(error)));
    return () => {};
  }
};

const subscribeProductById = ({ productId, onNext, onError, fallbackToJson = true }) => {
  try {
    checkFirestoreReady();

    return onSnapshot(doc(db, 'products', productId), async (productDoc) => {
      if (!productDoc.exists()) {
        if (!fallbackToJson) {
          onNext(null);
          return;
        }

        const fallbackProducts = await getJsonProductsFallback();
        onNext(fallbackProducts.find((product) => String(product.id) === String(productId)) || null);
        return;
      }

      onNext(normalizeProduct(productDoc));
    }, async (error) => {
      if (fallbackToJson) {
        const fallbackProducts = await getJsonProductsFallback();
        onNext(fallbackProducts.find((product) => String(product.id) === String(productId)) || null);
        return;
      }

      onError?.(new Error(getProductErrorMessage(error)));
    });
  } catch (error) {
    if (fallbackToJson) {
      getJsonProductsFallback().then((fallbackProducts) => {
        onNext(fallbackProducts.find((product) => String(product.id) === String(productId)) || null);
      }).catch((fallbackError) => {
        onError?.(new Error(getProductErrorMessage(fallbackError)));
      });
      return () => {};
    }

    onError?.(new Error(getProductErrorMessage(error)));
    return () => {};
  }
};
const migrateJsonProducts = async () => {
  try {
    checkFirestoreReady();

    const [jsonProducts, snapshot] = await Promise.all([
      getJsonProductsFallback(),
      getDocs(collection(db, 'products')),
    ]);
    const existingLegacyIds = new Set(
      snapshot.docs
        .map((productDoc) => productDoc.data().legacyId)
        .filter((legacyId) => legacyId !== undefined)
        .map(String),
    );
    let recommendedCount = snapshot.docs.filter(
      (productDoc) => productDoc.data().isRecommended === true,
    ).length;
    let createdCount = 0;
    let skippedCount = 0;
    const batch = writeBatch(db);

    jsonProducts.forEach((product) => {
      if (existingLegacyIds.has(String(product.legacyId))) {
        skippedCount += 1;
        return;
      }

      const isRecommended = product.isRecommended
        && recommendedCount < MAX_RECOMMENDED_PRODUCTS;
      if (isRecommended) recommendedCount += 1;

      const productRef = doc(collection(db, 'products'));
      batch.set(productRef, {
        ...makeProductPayload({ ...product, isRecommended }),
        createAt: serverTimestamp(),
        updateAt: serverTimestamp(),
      });
      createdCount += 1;
    });

    if (createdCount > 0) {
      await batch.commit();
    }

    return { createdCount, skippedCount };
  } catch (error) {
    throw new Error(getProductErrorMessage(error));
  }
};
const createProduct = async (product) => {
  try {
    checkFirestoreReady();
    if (product.isRecommended) {
      await checkRecommendedLimit();
    }

    const productRef = await addDoc(collection(db, 'products'), {
      ...makeProductPayload(product),
      createAt: serverTimestamp(),
      updateAt: serverTimestamp(),
    });

    return productRef.id;
  } catch (error) {
    throw new Error(getProductErrorMessage(error));
  }
};

const updateProduct = async (productId, product) => {
  try {
    checkFirestoreReady();
    if (product.isRecommended) {
      await checkRecommendedLimit(productId);
    }

    await updateDoc(doc(db, 'products', productId), {
      ...makeProductPayload(product),
      updateAt: serverTimestamp(),
    });
  } catch (error) {
    throw new Error(getProductErrorMessage(error));
  }
};

const deleteProduct = async (productId) => {
  try {
    checkFirestoreReady();

    await deleteDoc(doc(db, 'products', productId));
  } catch (error) {
    throw new Error(getProductErrorMessage(error));
  }
};

export { createProduct, deleteProduct, getProductById, getProducts, migrateJsonProducts, subscribeProductById, subscribeProducts, updateProduct };




