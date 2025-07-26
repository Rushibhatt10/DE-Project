import React, { useEffect, useState } from "react";
import { auth, db } from "../firebase";
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  getDoc,
} from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { User, PackageCheck, Mail, Clock } from "lucide-react";

const ProviderAdmin = () => {
  const [services, setServices] = useState([]);
  const [requests, setRequests] = useState([]);
  const [provider, setProvider] = useState(null);
  const [providerProfile, setProviderProfile] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setProvider(user);
        const profileSnap = await getDoc(doc(db, "verified_providers", user.uid));
        if (profileSnap.exists()) {
          setProviderProfile(profileSnap.data());
        }
        await fetchServices(user.uid);
        await fetchRequests(user.uid);
      } else {
        navigate("/signin");
      }
    });
    return () => unsub();
  }, []);

  const fetchServices = async (uid) => {
    const q = query(collection(db, "provider_services"), where("providerUid", "==", uid));
    const querySnapshot = await getDocs(q);
    const data = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    setServices(data);
  };

  const fetchRequests = async (uid) => {
    const q = query(collection(db, "user_requests"), where("providerUid", "==", uid));
    const querySnapshot = await getDocs(q);
    const data = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    setRequests(data);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-white to-blue-50 dark:from-[#1e1e2e] dark:to-[#121212] text-black dark:text-white px-6 py-10 font-['Manrope'] transition-all">
      <motion.div
        className="max-w-6xl mx-auto"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        {/* Title & Add Button */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-4xl font-extrabold text-pink-500">
            Provider Admin Panel
          </h1>
          <button
            onClick={() => navigate("/add-service")}
            className="bg-gradient-to-r from-pink-500 to-purple-500 text-white px-5 py-2 rounded-lg shadow hover:scale-105 transition-transform font-semibold"
          >
            + Add Service
          </button>
        </div>

        {/* Profile Info */}
        {providerProfile && (
          <div className="flex flex-col md:flex-row justify-between items-start gap-8 mb-12 bg-white dark:bg-white/5 p-6 rounded-2xl border border-gray-300 dark:border-white/10 shadow-xl">
            <div className="flex-1 space-y-2">
              <h2 className="text-2xl font-semibold flex items-center gap-2 text-pink-500">
                <User /> Profile Info
              </h2>
              <p><strong>Name:</strong> {providerProfile.fullName}</p>
              <p><strong>Email:</strong> {providerProfile.email}</p>
              <p><strong>Phone:</strong> {providerProfile.phone}</p>
              <p><strong>Service Type:</strong> {providerProfile.serviceType}</p>
              <p><strong>ID Type:</strong> {providerProfile.govIdType}</p>
            </div>
            {providerProfile.idImageURL && (
              <img
                src={providerProfile.idImageURL}
                alt="ID"
                className="w-48 h-auto rounded-xl border border-gray-300 dark:border-white/10 shadow-lg"
              />
            )}
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {[
            { label: "Total Services", value: services.length },
            { label: "User Requests", value: requests.length },
            { label: "Email", value: provider?.email || "" },
            { label: "Status", value: "Active" },
          ].map((item, idx) => (
            <div
              key={idx}
              className="p-5 bg-white dark:bg-gray-800 border border-gray-300 dark:border-white/10 rounded-2xl shadow-md"
            >
              <p className="text-sm text-gray-500">{item.label}</p>
              <h3 className="text-2xl font-bold text-pink-500 break-words">{item.value}</h3>
            </div>
          ))}
        </div>

        {/* Services Section */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold mb-4 flex items-center gap-2 text-pink-500">
            <PackageCheck /> Your Services
          </h2>
          {services.length === 0 ? (
            <p className="text-gray-600 dark:text-gray-400">No services added yet.</p>
          ) : (
            <div className="grid md:grid-cols-2 gap-6">
              {services.map((service) => (
                <div
                  key={service.id}
                  className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-white/10 p-5 rounded-xl shadow-lg space-y-2"
                >
                  <h3 className="font-bold text-lg text-pink-500">{service.name}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300">{service.description}</p>
                  <p className="text-sm font-medium">Price: ₹{service.price}</p>
                  <p className="text-sm">Category: {service.category}</p>
                  <p className="text-sm">Location: {service.location}</p>
                  <p className="text-sm">Availability: {service.availability}</p>
                  {service.imageUrl && (
                    <img
                      src={service.imageUrl}
                      alt="Service"
                      className="w-full h-40 object-cover rounded-xl mt-2"
                    />
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Requests Section */}
        <div>
          <h2 className="text-2xl font-bold mb-4 flex items-center gap-2 text-pink-500">
            <Mail /> User Requests
          </h2>
          {requests.length === 0 ? (
            <p className="text-gray-600 dark:text-gray-400">No requests from users yet.</p>
          ) : (
            <div className="space-y-4">
              {requests.map((req) => (
                <div
                  key={req.id}
                  className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-white/10 p-5 rounded-xl shadow-lg"
                >
                  <p><strong>User Email:</strong> {req.userEmail}</p>
                  <p><strong>Requested Service:</strong> {req.serviceName}</p>
                  <p><strong>Message:</strong> {req.message}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center mt-2">
                    <Clock className="inline w-4 h-4 mr-1" />
                    {new Date(req.timestamp?.seconds * 1000).toLocaleString()}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default ProviderAdmin;
