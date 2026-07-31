import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { initializeApp } from 'firebase/app';
import { createUserWithEmailAndPassword, deleteUser, getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import { doc, getDoc, getFirestore, serverTimestamp, setDoc } from 'firebase/firestore';

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
  const envPath = resolve(process.cwd(), '.env');
  const envText = readFileSync(envPath, 'utf8');
  const env = {};

  for (const line of envText.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const index = trimmed.indexOf('=');
    if (index === -1) continue;
    const key = trimmed.slice(0, index).trim();
    const value = trimmed.slice(index + 1);
    env[key] = cleanEnvValue(value);
  }

  return env;
};

const env = loadEnv();
const firebaseConfig = {
  apiKey: env.VITE_FIREBASE_API_KEY,
  authDomain: env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: env.VITE_FIREBASE_APP_ID,
};

if (!Object.values(firebaseConfig).every(Boolean)) {
  throw new Error('.env Firebase 환경변수를 확인해주세요.');
}

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

let createdUser = false;
let userCredential;

try {
  userCredential = await createUserWithEmailAndPassword(auth, adminEmail, adminPassword);
  createdUser = true;
  console.log('AUTH_CREATED');
} catch (error) {
  if (error.code !== 'auth/email-already-in-use') {
    throw error;
  }

  userCredential = await signInWithEmailAndPassword(auth, adminEmail, adminPassword);
  console.log('AUTH_EXISTS_SIGNED_IN');
}

const { user } = userCredential;
const userRef = doc(db, 'users', user.uid);

try {
  const snapshot = await getDoc(userRef);
  const nextProfile = {
    email: adminEmail,
    nickname: '관리자',
    role: 'admin',
    createAt: snapshot.exists() ? snapshot.data().createAt : serverTimestamp(),
  };

  await setDoc(userRef, nextProfile, { merge: true });
  console.log(`ADMIN_READY uid=${user.uid}`);
} catch (error) {
  if (createdUser) {
    await deleteUser(user);
    console.log('AUTH_ROLLBACK_DONE');
  }
  throw error;
}
