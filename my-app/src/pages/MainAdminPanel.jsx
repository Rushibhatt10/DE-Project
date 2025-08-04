import React, { useEffect, useState } from "react";
import {
  collection,
  getDocs,
  doc,
  getDoc
} from "firebase/firestore";
import { db } from "../firebase";
import { motion } from "framer-motion";
import {
  User,
  BadgeCheck,
  ListOrdered,
  Briefcase
} from "lucide-react";

const PASSWORD = "Rushzzz@10";

const MainAdminPanel = () => {
  const [userRequests, setUserRequests] = useState([]);
  const [providerServices, setProviderServices] = useState([]);
  const [verifiedProviders, setVerifiedProviders] = useState([]);
  const [users, setUsers] = useState([]);

  const [accessGranted, setAccessGranted] = useState(false);
  const [enteredPassword, setEnteredPassword] = useState("");

  useEffect(() => {
    if (accessGranted) {
      const fetchAllData = async () => {
        const reqSnap = await getDocs(collection(db, "user_requests"));
        const reqData = await Promise.all(
          reqSnap.docs.map(async (docSnap) => {
            const req = docSnap.data();
            const serviceSnap = await getDoc(doc(db, "provider_services", req.serviceId));
            const userSnap = await getDoc(doc(db, "users", req.userId || "unknown"));
            const providerSnap = await getDoc(doc(db, "verified_providers", req.providerUid || "unknown"));
            const ratingSnap = await getDoc(doc(db, "ratings", req.serviceId));

            return {
              id: docSnap.id,
              ...req,
              serviceName: serviceSnap.exists() ? serviceSnap.data().name : "Unknown",
              userName: userSnap.exists() ? userSnap.data().name : "Unknown User",
              providerName: providerSnap.exists() ? providerSnap.data().name : "Unknown Provider",
              feedback: req.feedback || "No feedback",
              rating: ratingSnap.exists() ? ratingSnap.data().rating : "Not Rated"
            };
          })
        );
        setUserRequests(reqData);

        const servicesSnap = await getDocs(collection(db, "provider_services"));
        setProviderServices(servicesSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));

        const verifiedSnap = await getDocs(collection(db, "verified_providers"));
        setVerifiedProviders(verifiedSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));

        const usersSnap = await getDocs(collection(db, "users"));
        setUsers(usersSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      };

      fetchAllData();
    }
  }, [accessGranted]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (enteredPassword === PASSWORD) {
      setAccessGranted(true);
    } else {
      alert("❌ Incorrect Password");
    }
  };

  if (!accessGranted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0f0f0f] text-white font-['Manrope']">
        <form onSubmit={handleSubmit} className="bg-teal-950/40 p-6 rounded-xl shadow-md w-full max-w-sm border border-teal-600">
          <h2 className="text-xl font-bold mb-4 text-center text-teal-400">🔐 Enter Admin Password</h2>
          <input
            type="password"
            value={enteredPassword}
            onChange={(e) => setEnteredPassword(e.target.value)}
            placeholder="Password"
            required
            className="w-full p-3 rounded-lg bg-[#1a1a1a] border border-teal-600 text-white mb-4"
          />
          <button type="submit" className="w-full bg-teal-600 hover:bg-teal-700 text-white py-2 rounded-lg">
            Access Panel
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6 bg-[#0f0f0f] text-white font-['Manrope']">
      <motion.h1
        className="text-4xl font-bold text-center text-teal-400 mb-8"
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
      >
        Main Admin Panel - Overview
      </motion.h1>

      <section className="mb-12">
        <h2 className="text-2xl font-semibold text-white flex items-center gap-2 mb-4"><ListOrdered className="text-teal-400" /> All Service Requests</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {userRequests.map((r, idx) => (
            <div key={idx} className="bg-[#1a1a1a] rounded-xl p-5 border border-teal-600 shadow">
              <p><strong>User:</strong> {r.userName} ({r.userEmail})</p>
              <p><strong>Service:</strong> {r.serviceName}</p>
              <p><strong>Provider:</strong> {r.providerName}</p>
              <p><strong>Status:</strong> <span className="font-semibold text-teal-400">{r.status}</span></p>
              <p><strong>Feedback:</strong> {r.feedback}</p>
              <p><strong>Rating:</strong> ⭐ {r.rating}</p>
              <p className="text-sm text-white/60 mt-1">
                {r.timestamp?.seconds ? new Date(r.timestamp.seconds * 1000).toLocaleString() : "No timestamp"}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="mb-12">
        <h2 className="text-2xl font-semibold text-white flex items-center gap-2 mb-4"><Briefcase className="text-teal-400" /> All Services by Providers</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {providerServices.map((s, idx) => (
            <div key={idx} className="bg-[#1a1a1a] rounded-xl p-5 border border-teal-600 shadow">
              <p><strong>Name:</strong> {s.name}</p>
              <p><strong>Category:</strong> {s.category}</p>
              <p><strong>Price:</strong> ₹{s.price}</p>
              <p><strong>Provider Email:</strong> {s.providerEmail}</p>
              {s.image && <img src={s.image} alt="Service" className="mt-2 h-32 rounded object-cover" />}
            </div>
          ))}
        </div>
      </section>

      <section className="mb-12">
        <h2 className="text-2xl font-semibold text-white flex items-center gap-2 mb-4"><BadgeCheck className="text-teal-400" /> Verified Providers</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {verifiedProviders.map((p, idx) => (
            <div key={idx} className="bg-[#1a1a1a] rounded-xl p-5 border border-teal-600 shadow">
              <p><strong>Name:</strong> {p.name}</p>
              <p><strong>Email:</strong> {p.email}</p>
              <p><strong>Phone:</strong> {p.phone}</p>
              <p><strong>Service Type:</strong> {p.serviceType}</p>
              {p.photo && <img src={p.photo} alt="Provider" className="mt-2 h-28 rounded-full object-cover" />}
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-semibold text-white flex items-center gap-2 mb-4"><User className="text-teal-400" /> Registered Users</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {users.map((u, idx) => (
            <div key={idx} className="bg-[#1a1a1a] rounded-xl p-5 border border-teal-600 shadow">
              <p><strong>Name:</strong> {u.name}</p>
              <p><strong>Email:</strong> {u.email}</p>
              <p><strong>Phone:</strong> {u.phone || "Not provided"}</p>
              <p><strong>Address:</strong> {u.address || "N/A"}</p>
              <p><strong>DOB:</strong> {u.birthday || "N/A"}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default MainAdminPanel;
