// src/firebase.js
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, RecaptchaVerifier } from "firebase/auth";
import { getFirestore, enableNetwork } from "firebase/firestore";

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
const db = getFirestore(app);
const provider = new GoogleAuthProvider();

// Enable Firestore network
enableNetwork(db).catch(console.error);

export { auth, db, provider, RecaptchaVerifier };
