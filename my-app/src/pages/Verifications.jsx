import React, { useEffect, useState } from "react";
import { collection, getDocs, updateDoc, doc } from "firebase/firestore";
import { db } from "../firebase";
import { motion } from "framer-motion";
import { ShieldCheck, Lock, CheckCircle2 } from "lucide-react";

const Verifications = () => {
  const [providers, setProviders] = useState([]);
  const [authenticated, setAuthenticated] = useState(false);
  const [inputPassword, setInputPassword] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  const PASSWORD = "Rushzzz@10";

  useEffect(() => {
    if (authenticated) {
      const fetchVerifications = async () => {
        try {
          const querySnapshot = await getDocs(collection(db, "verified_providers"));
          const data = querySnapshot.docs.map((doc) => ({
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

  const handleApprove = async (id) => {
    try {
      const providerRef = doc(db, "verified_providers", id);
      await updateDoc(providerRef, { approved: true });
      setProviders((prev) =>
        prev.map((p) =>
          p.id === id ? { ...p, approved: true } : p
        )
      );
    } catch (err) {
      console.error("Approval failed:", err);
    }
  };

  const filteredProviders = providers.filter((provider) => {
    const query = searchQuery.toLowerCase();
    return (
      provider.fullName?.toLowerCase().includes(query) ||
      provider.email?.toLowerCase().includes(query) ||
      provider.serviceType?.toLowerCase().includes(query)
    );
  });

  if (!authenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0f0f0f] text-white font-['Manrope']">
        <motion.form
          onSubmit={handlePasswordSubmit}
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/10 border border-white/10 p-8 rounded-xl shadow-md w-full max-w-sm"
        >
          <h2 className="text-xl font-bold text-center text-teal-400 mb-4 flex items-center justify-center gap-2">
            <Lock className="w-5 h-5" />
            Admin Access Required
          </h2>
          <input
            type="password"
            value={inputPassword}
            onChange={(e) => setInputPassword(e.target.value)}
            placeholder="Enter Password"
            className="w-full p-3 rounded-lg border border-white/20 bg-white/10 text-white mb-4"
            required
          />
          <button
            type="submit"
            className="w-full bg-teal-600 hover:bg-teal-700 text-white font-semibold py-2 rounded-lg"
          >
            Enter
          </button>
        </motion.form>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0f0f0f] p-6 font-['Manrope'] text-white">
      <motion.div
        className="max-w-7xl mx-auto"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <h1 className="text-3xl font-bold text-teal-400 mb-8 flex items-center gap-2">
          <ShieldCheck className="w-6 h-6 text-teal-400" />
          Provider Verifications
        </h1>

        <input
          type="text"
          placeholder="Search by name, email, or service..."
          className="w-full mb-8 p-3 rounded-lg border border-white/20 bg-white/5 text-white placeholder-white/50"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />

        {filteredProviders.length === 0 ? (
          <p className="text-white/60">No verifications found.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProviders.map((provider) => (
              <motion.div
                key={provider.id}
                className="bg-white/5 p-5 rounded-xl shadow-md border border-white/10"
                whileHover={{ scale: 1.02 }}
              >
                <h2 className="text-xl font-bold text-teal-300">{provider.fullName}</h2>
                <p className="text-sm text-white/70">
                  <strong>Email:</strong> {provider.email}
                </p>
                <p className="text-sm text-white/70">
                  <strong>Phone:</strong> {provider.phone}
                </p>
                <p className="text-sm text-white/70">
                  <strong>Service:</strong> {provider.serviceType}
                </p>
                <p className="text-sm text-white/70 mb-2">
                  <strong>ID Type:</strong> {provider.govIdType}
                </p>

                <div className="space-y-2 mb-4">
                  <div>
                    <p className="text-xs text-white/50 mb-1">ID Proof</p>
                    <img
                      src={provider.idImageURL}
                      alt="ID Proof"
                      className="w-full h-40 object-cover rounded border border-white/20"
                    />
                  </div>
                  <div>
                    <p className="text-xs text-white/50 mb-1">Profile Photo</p>
                    <img
                      src={provider.profilePhotoURL}
                      alt="Profile"
                      className="w-20 h-20 object-cover rounded-full border border-white/20"
                    />
                  </div>
                </div>

                {provider.approved ? (
                  <div className="flex items-center text-green-400 gap-1">
                    <CheckCircle2 className="w-5 h-5" />
                    <span>Approved</span>
                  </div>
                ) : (
                  <button
                    onClick={() => handleApprove(provider.id)}
                    className="w-full bg-teal-600 hover:bg-teal-700 text-white font-semibold py-2 rounded-lg"
                  >
                    Approve
                  </button>
                )}
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default Verifications;
