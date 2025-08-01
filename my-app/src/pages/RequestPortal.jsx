import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db, auth } from "../firebase";
import { onAuthStateChanged } from "firebase/auth";

const RequestPortal = () => {
  const { id } = useParams();
  const [requestData, setRequestData] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) {
      setLoading(false);
      return;
    }

    const unsub = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        setLoading(false);
        return;
      }

      setCurrentUser(user);

      try {
        const docRef = doc(db, "user_requests", id);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          setRequestData(docSnap.data());
        } else {
          console.error("No such request found!");
        }
      } catch (err) {
        console.error("Error fetching request:", err.message);
      } finally {
        setLoading(false);
      }
    });

    return () => unsub();
  }, [id]);

  const handleComplete = async () => {
    try {
      await updateDoc(doc(db, "user_requests", id), {
        status: "Completed",
      });
      setRequestData((prev) => ({
        ...prev,
        status: "Completed",
      }));
    } catch (err) {
      console.error("Error updating status:", err.message);
    }
  };

  if (loading) return <div className="text-white p-6">Loading...</div>;
  if (!requestData) return <div className="text-white p-6">Request not found.</div>;

  const isProvider = currentUser?.email === requestData?.providerEmail;
  const isUser = currentUser?.uid === requestData?.userId;

  const formattedTimestamp = requestData.timestamp?.toDate
    ? requestData.timestamp.toDate().toLocaleString()
    : "N/A";

  return (
    <div className="min-h-screen bg-[#0f0f0f] text-white p-8">
      <div className="max-w-3xl mx-auto bg-teal-950/30 border border-teal-600 rounded-2xl p-6 shadow-xl">
        <h1 className="text-3xl font-bold text-teal-400 mb-4">Service Request Details</h1>

        <div className="space-y-3 text-lg">
          <p>
            <span className="font-semibold text-teal-300">Service:</span>{" "}
            {requestData.serviceName || "N/A"}
          </p>
          <p>
            <span className="font-semibold text-teal-300">Status:</span>{" "}
            {requestData.status}
          </p>
          <p>
            <span className="font-semibold text-teal-300">Requested At:</span>{" "}
            {formattedTimestamp}
          </p>
        </div>

        <hr className="my-5 border-teal-600" />

        {isUser && (
          <div className="space-y-2">
            <h2 className="text-xl font-bold text-teal-300">Provider Details</h2>
            <p><span className="text-teal-200">Name:</span> {requestData.providerName || "N/A"}</p>
            <p><span className="text-teal-200">Email:</span> {requestData.providerEmail}</p>
            <p><span className="text-teal-200">Phone:</span> {requestData.providerPhone || "N/A"}</p>
          </div>
        )}

        {isProvider && (
          <div className="space-y-2">
            <h2 className="text-xl font-bold text-teal-300">User Details</h2>
            <p><span className="text-teal-200">User ID:</span> {requestData.userId}</p>
            <p><span className="text-teal-200">User Email:</span> {requestData.userEmail || "N/A"}</p>

            {requestData.status !== "Completed" && (
              <button
                onClick={handleComplete}
                className="mt-4 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg"
              >
                Mark as Completed
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default RequestPortal;
