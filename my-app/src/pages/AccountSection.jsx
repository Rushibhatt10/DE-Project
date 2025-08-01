import React, { useEffect, useState } from "react";
import { db } from "../firebase";
import {
  collection,
  query,
  where,
  onSnapshot,
  doc,
  getDoc,
  addDoc,
  serverTimestamp,
  getDocs,
} from "firebase/firestore";
import { useAuth } from "../context/AuthContext";
import { motion } from "framer-motion";

const AccountSection = () => {
  const { currentUser } = useAuth();
  const [requests, setRequests] = useState([]);
  const [feedbacks, setFeedbacks] = useState({});

  useEffect(() => {
    if (!currentUser?.uid) return;

    const q = query(
      collection(db, "user_requests"),
      where("userId", "==", currentUser.uid)
    );

    const unsubscribe = onSnapshot(q, async (snapshot) => {
      const data = await Promise.all(
        snapshot.docs.map(async (docSnap) => {
          const request = docSnap.data();

          const serviceRef = doc(db, "provider_services", request.serviceId);
          const serviceSnap = await getDoc(serviceRef);
          const serviceName = serviceSnap.exists()
            ? serviceSnap.data().name
            : "Unknown Service";

          const providerRef = doc(db, "verified_providers", request.providerUid);
          const providerSnap = await getDoc(providerRef);
          const providerName = providerSnap.exists()
            ? providerSnap.data().name
            : "Unknown Provider";

          return {
            id: docSnap.id,
            ...request,
            serviceName,
            providerName,
            timestamp: request.timestamp?.toDate() || null,
          };
        })
      );

      setRequests(data);
    });

    return () => unsubscribe();
  }, [currentUser]);

  useEffect(() => {
    const fetchFeedbacks = async () => {
      const q = query(collection(db, "ratings"), where("userId", "==", currentUser.uid));
      const snapshot = await getDocs(q);

      const fbMap = {};
      snapshot.forEach((doc) => {
        const data = doc.data();
        fbMap[data.requestId] = {
          feedback: data.feedback,
          rating: data.rating,
        };
      });
      setFeedbacks(fbMap);
    };

    if (currentUser?.uid) {
      fetchFeedbacks();
    }
  }, [currentUser]);

  const submitFeedback = async (e, requestId) => {
    e.preventDefault();
    const feedback = e.target.elements[`feedback-${requestId}`].value.trim();
    const rating = e.target.elements[`rating-${requestId}`].value;
    if (!feedback || !rating) return;

    await addDoc(collection(db, "ratings"), {
      requestId,
      feedback,
      rating: parseInt(rating),
      userId: currentUser.uid,
      timestamp: serverTimestamp(),
    });

    setFeedbacks((prev) => ({
      ...prev,
      [requestId]: { feedback, rating },
    }));

    e.target.reset();
    alert("✅ Feedback submitted. Thank you!");
  };

  return (
    <div className="relative bg-[#0f0f0f] text-white overflow-hidden">
      <motion.h2
        className="text-3xl font-bold bg-gradient-to-r from-teal-300 via-cyan-400 to-teal-600 bg-clip-text text-transparent mb-8"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        Your Service Requests
      </motion.h2>

      {requests.length === 0 ? (
        <motion.div
          className="text-center text-white/60"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          No requests yet.
        </motion.div>
      ) : (
        <div className="grid gap-6">
          {requests.map((req) => (
            <motion.div
              key={req.id}
              className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl shadow-md text-white p-6 flex flex-col gap-3"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="flex flex-col gap-1">
                <h3 className="text-xl font-semibold text-teal-300">{req.serviceName}</h3>
                <p className="text-sm text-white/80">Provider: <span className="text-cyan-400">{req.providerName}</span></p>
                <p className="text-sm text-white/60">
                  Status:{" "}
                  <span className="font-medium capitalize text-cyan-300">
                    {req.status}
                  </span>
                </p>
                {req.timestamp && (
                  <p className="text-sm text-white/50">
                    Requested on:{" "}
                    {req.timestamp.toLocaleDateString()} at{" "}
                    {req.timestamp.toLocaleTimeString()}
                  </p>
                )}
              </div>

              {req.status === "Completed" && !feedbacks[req.id] ? (
                <form onSubmit={(e) => submitFeedback(e, req.id)} className="flex flex-col gap-2 mt-4">
                  <select
                    name={`rating-${req.id}`}
                    className="px-4 py-2 rounded bg-transparent border border-white/20 text-white/90 backdrop-blur-sm appearance-none"
                  >
                    <option value="">Rate the service</option>
                    <option value="1">⭐</option>
                    <option value="2">⭐⭐</option>
                    <option value="3">⭐⭐⭐</option>
                    <option value="4">⭐⭐⭐⭐</option>
                    <option value="5">⭐⭐⭐⭐⭐</option>
                  </select>
                  <textarea
                    name={`feedback-${req.id}`}
                    rows="3"
                    placeholder="Write your feedback..."
                    className="px-4 py-2 rounded bg-transparent border border-white/20 text-white/90 backdrop-blur-sm"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2 bg-cyan-500 hover:bg-cyan-600 rounded text-sm text-white font-medium"
                  >
                    ✍️ Submit
                  </button>
                </form>
              ) : feedbacks[req.id] ? (
                <div className="mt-4 text-white/90">
                  <p className="text-sm text-teal-300">
                    ⭐ Rating: <strong>{feedbacks[req.id].rating} / 5</strong>
                  </p>
                  <p className="text-sm mt-1 text-white/80">
                    💬 Feedback: <em>"{feedbacks[req.id].feedback}"</em>
                  </p>
                </div>
              ) : null}
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AccountSection;
