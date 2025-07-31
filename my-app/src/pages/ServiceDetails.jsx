import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  doc,
  getDoc,
  addDoc,
  collection,
  serverTimestamp,
} from "firebase/firestore";
import { db, auth } from "../firebase";
import { onAuthStateChanged } from "firebase/auth";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  MapPin,
  Mail,
  Phone,
  User,
  ShieldCheck,
  BadgeCheck,
  CalendarCheck,
  Tag,
  CreditCard,
} from "lucide-react";

const ServiceDetails = () => {
  const { id } = useParams();
  const [service, setService] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userEmail, setUserEmail] = useState(null);
  const [userId, setUserId] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchService = async () => {
      try {
        const docRef = doc(db, "provider_services", id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setService({ id: docSnap.id, ...docSnap.data() });
        } else {
          navigate("/user-dashboard");
        }
      } catch (error) {
        console.error("Error fetching service:", error);
        navigate("/user-dashboard");
      } finally {
        setLoading(false);
      }
    };

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUserEmail(user.email);
        setUserId(user.uid);
      }
    });

    fetchService();
    return () => unsubscribe();
  }, [id, navigate]);

  const handleRequestService = async () => {
    if (!userEmail || !service) return;

    try {
      await addDoc(collection(db, "user_requests"), {
        serviceId: service.id,
        serviceName: service.name,
        providerUid: service.providerUid || "",
        providerEmail: service.providerEmail,
        userId: userId,
        userEmail: userEmail,
        status: "Pending",
        timestamp: serverTimestamp(),
      });
      alert("Request sent to the provider successfully!");
    } catch (error) {
      console.error("Error sending request:", error);
      alert("Failed to send request. Please try again.");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-white to-blue-50 dark:from-[#1e1e2e] dark:to-[#121212]">
        <p className="text-lg text-pink-500 animate-pulse">Loading service...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-white to-blue-50 dark:from-[#1e1e2e] dark:to-[#121212] p-6 font-['Manrope'] text-black dark:text-white">
      <motion.div
        className="max-w-5xl mx-auto"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
      >
        <button
          onClick={() => navigate(-1)}
          className="mb-6 flex items-center gap-2 text-pink-500 hover:underline"
        >
          <ArrowLeft className="w-4 h-4" /> Back
        </button>

        {service.imageUrl && (
          <motion.img
            src={service.imageUrl}
            alt={service.name}
            className="w-full h-72 object-cover rounded-2xl shadow-lg border border-gray-300 dark:border-gray-700 mb-6"
            whileHover={{ scale: 1.01 }}
          />
        )}

        <motion.h1
          className="text-4xl font-extrabold text-pink-500 mb-4"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          {service.name}
        </motion.h1>
        <motion.p
          className="text-lg text-gray-700 dark:text-gray-300 mb-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          {service.description}
        </motion.p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <Tag className="text-pink-500 w-5 h-5" />
              <span><strong>Price:</strong> ₹{service.price}</span>
            </div>
            <div className="flex items-center gap-3">
              <BadgeCheck className="text-blue-500 w-5 h-5" />
              <span><strong>Category:</strong> {service.category}</span>
            </div>
            <div className="flex items-center gap-3">
              <CalendarCheck className="text-green-500 w-5 h-5" />
              <span><strong>Availability:</strong> {service.availability}</span>
            </div>
            <div className="flex items-center gap-3">
              <MapPin className="text-yellow-500 w-5 h-5" />
              <span><strong>Location:</strong> {service.location}</span>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <User className="text-pink-400 w-5 h-5" />
              <span><strong>Provider:</strong> {service.providerName || "Unknown"}</span>
            </div>
            <div className="flex items-center gap-3">
              <Mail className="text-blue-400 w-5 h-5" />
              <span><strong>Email:</strong> {service.providerEmail}</span>
            </div>
            {service.contact && (
              <div className="flex items-center gap-3">
                <Phone className="text-green-500 w-5 h-5" />
                <span><strong>Phone:</strong> {service.contact}</span>
              </div>
            )}
            {service.verified && (
              <div className="flex items-center gap-3">
                <ShieldCheck className="text-emerald-500 w-5 h-5" />
                <span className="text-emerald-500 font-medium">Verified Provider</span>
              </div>
            )}
          </div>
        </div>

        <motion.div
          className="mt-16 flex flex-col sm:flex-row sm:justify-center gap-6 text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <button
            onClick={handleRequestService}
            className="px-8 py-3 bg-pink-500 text-white font-semibold rounded-lg shadow-md hover:shadow-xl hover:bg-pink-600 transition"
          >
            Request Service
          </button>
          
        </motion.div>
      </motion.div>
    </div>
  );
};

export default ServiceDetails;
