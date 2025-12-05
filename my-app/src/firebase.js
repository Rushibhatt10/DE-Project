// src/firebase.js

import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore, enableNetwork } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyDake_cf9YqW8p9rzLsTH0mp_YIyDjVlUE",
  authDomain: "deproject-4912f.firebaseapp.com",
  projectId: "deproject-4912f",
  storageBucket: "deproject-4912f.appspot.com",
  messagingSenderId: "419872732558",
  appId: "1:419872732558:web:bcf245d753d45b4f3660df",
  measurementId: "G-XP5GY029B2",
};

const app = initializeApp(firebaseConfig);

const auth = getAuth(app);
const provider = new GoogleAuthProvider();

const db = getFirestore(app);
enableNetwork(db).catch(console.error);

const storage = getStorage(app);

export { auth, db, provider, storage };
export { app };
