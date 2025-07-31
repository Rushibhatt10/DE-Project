// src/pages/Verifications.jsx
import React, { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebase";
import { motion } from "framer-motion";
import { ShieldCheck, Lock } from "lucide-react";

const Verifications = () => {
  const [providers, setProviders] = useState([]);
  const [authenticated, setAuthenticated] = useState(false);
  const [inputPassword, setInputPassword] = useState("");

  const PASSWORD = "Rushzzz@10"; 

  useEffect(() => {
    if (authenticated) {
      const fetchVerifications = async () => {
        try {
          const querySnapshot = await getDocs(collection(db, "verified_providers"));
          const data = querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
          }));
          setProviders(data);
        } catch (error) {
          console.error("Error fetching verifications:", error);
        }
      };

      fetchVerifications();
    }
  }, [authenticated]);

  const handlePasswordSubmit = (e) => {
    e.preventDefault();
    if (inputPassword === PASSWORD) {
      setAuthenticated(true);
    } else {
      alert("Incorrect password!");
      setInputPassword("");
    }
  };

  // 🔒 Password Screen
  if (!authenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-white to-blue-100 dark:from-[#1e1e2e] dark:to-[#121212] font-['Manrope']">
        <motion.form
          onSubmit={handlePasswordSubmit}
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-white/10 p-8 rounded-xl shadow-md w-full max-w-sm"
        >
          <h2 className="text-xl font-bold text-center text-pink-500 mb-4 flex items-center justify-center gap-2">
            <Lock className="w-5 h-5" />
            Admin Access Required
          </h2>
          <input
            type="password"
            value={inputPassword}
            onChange={(e) => setInputPassword(e.target.value)}
            placeholder="Enter Password"
            className="w-full p-3 rounded border bg-gray-100 dark:bg-gray-900 text-black dark:text-white mb-4"
            required
          />
          <button
            type="submit"
            className="w-full bg-pink-500 hover:bg-pink-600 text-white font-semibold py-2 rounded-lg"
          >
            Enter
          </button>
        </motion.form>
      </div>
    );
  }

  // ✅ Render Actual Page If Authenticated
  return (
    <div className="min-h-screen bg-gradient-to-br from-white to-blue-50 dark:from-[#1e1e2e] dark:to-[#121212] p-6 font-['Manrope'] text-black dark:text-white">
      <motion.div
        className="max-w-7xl mx-auto"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <h1 className="text-3xl font-bold text-pink-500 mb-8 flex items-center gap-2">
          <ShieldCheck className="w-6 h-6 text-pink-500" />
          Provider Verifications
        </h1>

        {providers.length === 0 ? (
          <p className="text-gray-600 dark:text-gray-400">No verifications found.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {providers.map(provider => (
              <motion.div
                key={provider.id}
                className="bg-white dark:bg-gray-800 p-5 rounded-xl shadow-md border border-gray-200 dark:border-white/10"
                whileHover={{ scale: 1.02 }}
              >
                <h2 className="text-xl font-bold text-pink-600">{provider.fullName}</h2>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  <strong>Email:</strong> {provider.email}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  <strong>Phone:</strong> {provider.phone}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  <strong>Service:</strong> {provider.serviceType}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
                  <strong>ID Type:</strong> {provider.govIdType}
                </p>

                <div className="space-y-2">
                  <div>
                    <p className="text-xs text-gray-500 mb-1">ID Proof</p>
                    <img
                      src={provider.idImageURL}
                      alt="ID Proof"
                      className="w-full h-40 object-cover rounded border"
                    />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Profile Photo</p>
                    <img
                      src={provider.profilePhotoURL}
                      alt="Profile"
                      className="w-20 h-20 object-cover rounded-full border"
                    />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default Verifications;
