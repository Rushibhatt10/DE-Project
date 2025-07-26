import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { auth, db } from "../firebase";
import {
  doc,
  getDoc,
  setDoc,
  serverTimestamp,
} from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { motion } from "framer-motion";

const ProviderDashboard = () => {
  const [provider, setProvider] = useState(null);
  const [isVerified, setIsVerified] = useState(false);
  const [idImage, setIdImage] = useState(null);
  const navigate = useNavigate();

  const [providerInfo, setProviderInfo] = useState({
    fullName: "",
    phone: "",
    serviceType: "",
    govIdType: "Aadhaar",
  });

  // Auth + check if already verified
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setProvider(user);
        const docSnap = await getDoc(doc(db, "verified_providers", user.uid));
        if (docSnap.exists()) {
          // ✅ Already verified → redirect to ProviderAdmin
          navigate("/provider-admin");
        } else {
          setIsVerified(false);
        }
      } else {
        navigate("/signin");
      }
    });
    return () => unsub();
  }, [navigate]);

  const handleVerify = async (e) => {
    e.preventDefault();
    if (!idImage) return alert("Upload your ID image.");

    const imgbbAPIKey = "15b6336c4094168e30360aa37d2f29be";
    const formImg = new FormData();
    formImg.set("image", idImage);

    try {
      const res = await fetch(`https://api.imgbb.com/1/upload?key=${imgbbAPIKey}`, {
        method: "POST",
        body: formImg,
      });
      const imgData = await res.json();
      const imageUrl = imgData.data.url;

      const providerDoc = {
        ...providerInfo,
        email: provider.email,
        uid: provider.uid,
        idImageURL: imageUrl,
        timestamp: serverTimestamp(),
      };

      await setDoc(doc(db, "verified_providers", provider.uid), providerDoc);

      const formData = new FormData();
      Object.entries(providerDoc).forEach(([key, value]) =>
        formData.append(key, value)
      );

      await fetch("https://formcarry.com/s/HaIM26F2_cu", {
        method: "POST",
        body: formData,
      });

      alert("Verification submitted!");
      setIsVerified(true);
      navigate("/provider-admin");
    } catch (err) {
      console.error(err);
      alert("Error during verification.");
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-[#1e1e2e] px-6 py-10 text-black dark:text-white font-['Manrope']">
      <div className="max-w-3xl mx-auto">
        <motion.h1
          className="text-3xl font-bold mb-6 text-center text-pink-500"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          Provider Dashboard
        </motion.h1>

        {!provider ? (
          <p className="text-center">Please sign in to access the dashboard.</p>
        ) : !isVerified ? (
          <motion.form
            onSubmit={handleVerify}
            className="space-y-4 bg-white dark:bg-white/5 p-6 rounded-xl shadow-md border border-gray-300 dark:border-white/10"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <h2 className="text-xl font-semibold mb-2">Identity Verification</h2>

            <input
              type="text"
              placeholder="Full Name"
              value={providerInfo.fullName}
              onChange={(e) => setProviderInfo({ ...providerInfo, fullName: e.target.value })}
              required
              className="w-full p-3 rounded border bg-gray-100 dark:bg-gray-800 dark:border-gray-600"
            />

            <input
              type="tel"
              placeholder="Phone Number"
              value={providerInfo.phone}
              onChange={(e) => setProviderInfo({ ...providerInfo, phone: e.target.value })}
              required
              className="w-full p-3 rounded border bg-gray-100 dark:bg-gray-800 dark:border-gray-600"
            />

            <input
              type="text"
              placeholder="Service Type"
              value={providerInfo.serviceType}
              onChange={(e) => setProviderInfo({ ...providerInfo, serviceType: e.target.value })}
              required
              className="w-full p-3 rounded border bg-gray-100 dark:bg-gray-800 dark:border-gray-600"
            />

            <select
              value={providerInfo.govIdType}
              onChange={(e) => setProviderInfo({ ...providerInfo, govIdType: e.target.value })}
              className="w-full p-3 rounded border bg-gray-100 dark:bg-gray-800 dark:border-gray-600"
            >
              <option value="Aadhaar">Aadhaar</option>
              <option value="PAN">PAN</option>
              <option value="Driving License">Driving License</option>
              <option value="Passport">Passport</option>
            </select>

            <div className="flex flex-col">
              <label className="mb-2">Upload ID Image</label>
              <input
                type="file"
                accept="image/*,.pdf"
                onChange={(e) => setIdImage(e.target.files[0])}
                required
                className="w-full p-2 rounded border bg-gray-100 dark:bg-gray-800 dark:border-gray-600"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-gradient-to-r from-pink-500 to-blue-500 text-white font-semibold rounded-lg hover:scale-105 transition-transform"
            >
              Submit Verification
            </button>
          </motion.form>
        ) : null}
      </div>
    </div>
  );
};

export default ProviderDashboard;
