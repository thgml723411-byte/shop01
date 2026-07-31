import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { initializeApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import { addDoc, collection, getDocs, getFirestore, query, serverTimestamp, where } from 'firebase/firestore';

const adminEmail = process.env.INITIAL_ADMIN_EMAIL;
const adminPassword = process.env.INITIAL_ADMIN_PASSWORD;

if (!adminEmail || !adminPassword) {
  throw new Error('INITIAL_ADMIN_EMAIL, INITIAL_ADMIN_PASSWORD 환경변수를 설정해주세요.');
}

const cleanEnvValue = (value = '') => value
  .trim()
  .replace(/,$/, '')
  .trim()
  .replace(/^['"]|['"]$/g, '')
  .trim();

const loadEnv = () => {
  const envText = readFileSync(resolve(process.cwd(), '.env'), 'utf8');
  const env = {};

  for (const line of envText.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const index = trimmed.indexOf('=');
    if (index === -1) continue;
    env[trimmed.slice(0, index).trim()] = cleanEnvValue(trimmed.slice(index + 1));
  }

  return env;
};

const env = loadEnv();
const app = initializeApp({
  apiKey: env.VITE_FIREBASE_API_KEY,
  authDomain: env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: env.VITE_FIREBASE_APP_ID,
});
const auth = getAuth(app);
const db = getFirestore(app);

console.log('SIGN_IN_START');
await signInWithEmailAndPassword(auth, adminEmail, adminPassword);
console.log('SIGN_IN_DONE');

const productsText = readFileSync(resolve(process.cwd(), 'public/data/products.json'), 'utf8').replace(/^\uFEFF/, '');
const products = JSON.parse(productsText);
let createdCount = 0;
let skippedCount = 0;

console.log('PRODUCTS_READY count=' + products.length);

for (const product of products) {
  const existsQuery = query(collection(db, 'products'), where('legacyId', '==', product.id));
  const existsSnapshot = await getDocs(existsQuery);

  if (!existsSnapshot.empty) {
    skippedCount += 1;
    continue;
  }

  await addDoc(collection(db, 'products'), {
    legacyId: product.id,
    name: product.name || '',
    nameEn: product.nameEn || '',
    category: product.category || '',
    categoryValue: product.categoryValue || '',
    price: Number(product.price || 0),
    discountRate: Number(product.discountRate || 0),
    stock: Number(product.stock || 20),
    image: product.image || '',
    description: product.description || '',
    isRecommended: Boolean(product.isRecommended),
    createAt: serverTimestamp(),
    updateAt: serverTimestamp(),
  });

  createdCount += 1;
}

console.log(`PRODUCT_MIGRATION_DONE created=${createdCount} skipped=${skippedCount}`);




process.exit(0);
