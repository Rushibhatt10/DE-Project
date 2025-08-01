import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  doc,
  getDoc,
  addDoc,
  collection,
  serverTimestamp,
  getDocs,
  query,
  where,
} from "firebase/firestore";
import { db, auth } from "../firebase";
import { onAuthStateChanged } from "firebase/auth";
import { motion } from "framer-motion";
import emailjs from "@emailjs/browser";
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
} from "lucide-react";

const ServiceDetails = () => {
  const { id } = useParams();
  const [service, setService] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userEmail, setUserEmail] = useState(null);
  const [userId, setUserId] = useState(null);
  const [feedback, setFeedback] = useState(null);
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

  useEffect(() => {
    const fetchFeedback = async () => {
      if (userId && id) {
        const q = query(
          collection(db, "ratings"),
          where("userId", "==", userId),
          where("serviceId", "==", id)
        );
        const snapshot = await getDocs(q);
        if (!snapshot.empty) {
          const data = snapshot.docs[0].data();
          setFeedback(data);
        }
      }
    };
    fetchFeedback();
  }, [userId, id]);

  const sendEmails = async () => {
    try {
      const templateParamsUser = {
        to_email: userEmail,
        service_name: service.name,
      };

      const templateParamsProvider = {
        to_email: service.providerEmail,
        user_email: userEmail,
        service_name: service.name,
      };

      await emailjs.send(
        "service_hsrbila",
        "template_eiv8arm",
        templateParamsUser,
        "OURe-LROKrYp6YWb_"
      );

      await emailjs.send(
        "service_hsrbila",
        "template_eiv8arm",
        templateParamsProvider,
        "OURe-LROKrYp6YWb_"
      );
    } catch (err) {
      console.error("EmailJS error:", err);
    }
  };

  const handleRequestService = async () => {
  if (!userEmail || !service) return;

  try {
    const requestRef = await addDoc(collection(db, "user_requests"), {
      serviceId: service.id,
      serviceName: service.name,
      providerUid: service.providerUid || "",
      providerEmail: service.providerEmail,
      userId: userId,
      userEmail: userEmail,
      status: "Pending",
      timestamp: serverTimestamp(),
    });

    await sendEmails();

    alert("Request sent successfully! Confirmation email sent.");

    // ✅ Correct navigation to actual request ID
    navigate(`/request/${requestRef.id}`);
  } catch (error) {
    console.error("Error sending request:", error);
    alert("Failed to send request. Please try again.");
  }
};


  if (loading) {
    return (
      <div className="min-h-screen bg-[#0f0f0f] text-white flex justify-center items-center">
        <p className="text-lg text-teal-400 animate-pulse">Loading service...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0f0f0f] text-white py-8 px-4">
      <motion.div
        className="max-w-5xl mx-auto"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
      >
        <button
          onClick={() => navigate(-1)}
          className="mb-6 flex items-center gap-2 text-teal-400 hover:underline"
        >
          <ArrowLeft className="w-4 h-4" /> Back
        </button>

        {service.imageUrls?.length > 0 ? (
          <img
            src={service.imageUrls[0]}
            alt={service.name || "Service Image"}
            className="w-full max-h-[400px] object-cover rounded-xl shadow mb-6"
          />
        ) : (
          <div className="w-full h-[200px] flex items-center justify-center bg-gray-800 text-gray-400 border border-dashed rounded-xl mb-6">
            No image preview available
          </div>
        )}

        <motion.h1
          className="text-4xl font-extrabold text-teal-400 mb-4"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          {service.name}
        </motion.h1>
        <motion.p
          className="text-lg text-gray-300 mb-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          {service.description}
        </motion.p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <Tag className="text-teal-400 w-5 h-5" />
              <span className="text-white"><strong>Price:</strong> ₹{service.price}</span>
            </div>
            <div className="flex items-center gap-3">
              <BadgeCheck className="text-blue-400 w-5 h-5" />
              <span className="text-white"><strong>Category:</strong> {service.category}</span>
            </div>
            <div className="flex items-center gap-3">
              <CalendarCheck className="text-green-400 w-5 h-5" />
              <span className="text-white"><strong>Availability:</strong> {service.availability}</span>
            </div>
            <div className="flex items-center gap-3">
              <MapPin className="text-yellow-400 w-5 h-5" />
              <span className="text-white"><strong>Location:</strong> {service.location}</span>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <User className="text-teal-400 w-5 h-5" />
              <span className="text-white"><strong>Provider:</strong> {service.providerName || "Unknown"}</span>
            </div>
            <div className="flex items-center gap-3">
              <Mail className="text-blue-400 w-5 h-5" />
              <span className="text-white"><strong>Email:</strong> {service.providerEmail}</span>
            </div>
            {service.contact && (
              <div className="flex items-center gap-3">
                <Phone className="text-green-400 w-5 h-5" />
                <span className="text-white"><strong>Phone:</strong> {service.contact}</span>
              </div>
            )}
            {service.verified && (
              <div className="flex items-center gap-3">
                <ShieldCheck className="text-emerald-400 w-5 h-5" />
                <span className="text-emerald-400 font-medium">Verified Provider</span>
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
            className="px-8 py-3 bg-teal-600 text-white font-semibold rounded-lg shadow-md hover:shadow-xl hover:bg-teal-500 transition"
          >
            Request Service
          </button>
        </motion.div>

        {feedback && (
          <div className="mt-12 bg-teal-900/20 backdrop-blur border border-teal-600/30 rounded-xl p-6">
            <h3 className="text-xl font-semibold text-yellow-300 mb-2">Feedback</h3>
            <p className="text-white mb-1">⭐ {feedback.rating} / 5</p>
            <p className="text-white/80 italic">“{feedback.feedback}”</p>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default ServiceDetails;
