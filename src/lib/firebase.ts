// src/lib/firebase.ts
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyBcGzNFD73w05on_twt0goXz4xw2AzrzlY",
  authDomain: "teoplay.firebaseapp.com",
  projectId: "teoplay",
  storageBucket: "teoplay.firebasestorage.app",
  messagingSenderId: "10889821242",
  appId: "1:10889821242:web:b9c094a2484aa383c94903",
  measurementId: "G-RDB5MJXWBL"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db   = getFirestore(app);
