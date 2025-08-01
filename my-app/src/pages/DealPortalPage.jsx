import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { db } from "../firebase";
import { doc, getDoc, onSnapshot } from "firebase/firestore";

const DealPortalPage = () => {
  const { requestId } = useParams(); // passed from route /deal/:requestId
  const [request, setRequest] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!requestId) return;

    const unsubscribe = onSnapshot(doc(db, "service_requests", requestId), (snapshot) => {
      if (snapshot.exists()) {
        setRequest(snapshot.data());
      } else {
        setRequest(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [requestId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0f0f0f] text-white">
        <p>Loading deal details...</p>
      </div>
    );
  }

  if (!request) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0f0f0f] text-red-500">
        <p>Request not found</p>
      </div>
    );
  }

  const {
    userName,
    userEmail,
    providerName,
    providerEmail,
    serviceName,
    serviceDescription,
    status,
    scheduledDate,
    address,
    price,
  } = request;

  return (
    <div className="min-h-screen bg-[#0f0f0f] text-white p-6">
      <div className="max-w-4xl mx-auto bg-[#1a1a1a] rounded-2xl shadow-lg p-8">
        <h2 className="text-3xl font-bold text-teal-400 mb-6 text-center">📝 Deal Summary</h2>

        <div className="grid sm:grid-cols-2 gap-6">
          <div>
            <h3 className="text-lg font-semibold text-teal-300 mb-2">User Details</h3>
            <p><span className="text-gray-400">Name:</span> {userName}</p>
            <p><span className="text-gray-400">Email:</span> {userEmail}</p>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-teal-300 mb-2">Provider Details</h3>
            <p><span className="text-gray-400">Name:</span> {providerName}</p>
            <p><span className="text-gray-400">Email:</span> {providerEmail}</p>
          </div>
        </div>

        <hr className="my-6 border-white/10" />

        <div>
          <h3 className="text-lg font-semibold text-teal-300 mb-2">Service Information</h3>
          <p><span className="text-gray-400">Service:</span> {serviceName}</p>
          <p><span className="text-gray-400">Description:</span> {serviceDescription}</p>
          <p><span className="text-gray-400">Price:</span> ₹{price}</p>
          <p><span className="text-gray-400">Scheduled Date:</span> {scheduledDate || "TBD"}</p>
          <p><span className="text-gray-400">Address:</span> {address}</p>
        </div>

        <div className="mt-6 p-4 bg-teal-900/20 border border-teal-500 rounded-lg text-center">
          <span className="text-teal-300 font-semibold">Current Status:</span>{" "}
          <span className="font-bold text-white uppercase">{status}</span>
        </div>
      </div>
    </div>
  );
};

export default DealPortalPage;
