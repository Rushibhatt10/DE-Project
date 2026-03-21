// src/context/AuthContext.jsx
import React, { createContext, useContext, useState, useEffect } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, authPersistenceReady, db } from "../firebase"; 

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    let unsubscribe = () => {};

    const initAuth = async () => {
      await authPersistenceReady;
      if (cancelled) return;

      unsubscribe = onAuthStateChanged(auth, async (user) => {
        setCurrentUser(user);

        if (user) {
          try {
            const userSnap = await getDoc(doc(db, "users", user.uid));
            setRole(userSnap.exists() ? userSnap.data().role || null : null);
          } catch {
            setRole(null);
          }
        } else {
          setRole(null);
        }

        setLoading(false);
      });
    };

    initAuth();

    return () => {
      cancelled = true;
      unsubscribe();
    };
  }, []);

  return (
    <AuthContext.Provider value={{ currentUser, user: currentUser, role, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
