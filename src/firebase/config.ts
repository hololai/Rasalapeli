import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { initializeFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyArSViLuagzKbiJTO5uBv85eAIQRRAgOtM",
  authDomain: "kuvaohjelma.firebaseapp.com",
  projectId: "kuvaohjelma",
  storageBucket: "kuvaohjelma.firebasestorage.app",
  messagingSenderId: "150396211718",
  appId: "1:150396211718:web:3710647f65e37735ff2987"
};

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app, 'kuvaohjelma');
export const storage = getStorage(app);
export const googleProvider = new GoogleAuthProvider();
