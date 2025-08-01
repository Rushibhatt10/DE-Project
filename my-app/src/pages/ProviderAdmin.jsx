import React, { useEffect, useState } from "react";
import { auth, db } from "../firebase";
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  getDoc,
  updateDoc,
  deleteDoc,
} from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  User,
  PackageCheck,
  Mail,
  Clock,
  CheckCircle,
  XCircle,
  Loader2,
  Pencil,
  Trash2,
} from "lucide-react";

const ProviderAdmin = () => {
  const [services, setServices] = useState([]);
  const [requests, setRequests] = useState([]);
  const [provider, setProvider] = useState(null);
  const [providerProfile, setProviderProfile] = useState(null);
  const [loading, setLoading] = useState(true);

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
        setLoading(false);
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

 const handleStatusUpdate = async (requestId, newStatus) => {
  try {
    const requestRef = doc(db, "user_requests", requestId);
    await updateDoc(requestRef, { status: newStatus });
    setRequests((prev) =>
      prev.map((req) =>
        req.id === requestId ? { ...req, status: newStatus } : req
      )
    );

    // 👇 Redirect after accepting
    if (newStatus === "Accepted") {
      navigate(`/request/${requestId}`);
    }
  } catch (err) {
    console.error("Error updating request status:", err);
    alert("Failed to update request status.");
  }
};


  const handleDeleteService = async (serviceId) => {
    if (!window.confirm("Are you sure you want to delete this service?")) return;
    try {
      await deleteDoc(doc(db, "provider_services", serviceId));
      setServices((prev) => prev.filter((s) => s.id !== serviceId));
    } catch (err) {
      console.error("Error deleting service:", err);
      alert("Failed to delete service.");
    }
  };

  const handleEditService = (serviceId) => {
    navigate(`/edit-service/${serviceId}`);
  };

  return (
    <div className="relative bg-[#0f0f0f] text-white overflow-hidden">
      <motion.div
        className="max-w-6xl mx-auto"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-4xl font-extrabold text-teal-800">
            Provider Admin Panel
          </h1>
          <button
            onClick={() => navigate("/add-service")}
            className="bg-teal-800 hover:bg-teal-700 text-white px-5 py-2 rounded-lg shadow transition font-semibold"
          >
            + Add Service
          </button>
        </div>

        {providerProfile && (
          <div className="flex flex-col md:flex-row gap-8 mb-12 bg-white dark:bg-[#2c2c2c] p-6 rounded-xl border border-gray-200 dark:border-white/10 shadow">
            <div className="flex-1 space-y-2">
              <h2 className="text-2xl font-semibold text-teal-800 dark:text-teal-600">
                Provider Profile
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
                className="w-48 h-auto rounded border border-gray-300 dark:border-white/10 shadow"
              />
            )}
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {[
            { label: "Total Services", value: services.length },
            { label: "User Requests", value: requests.length },
            {
              label: "Completed",
              value: requests.filter((r) => r.status === "Completed").length,
            },
            { label: "Status", value: "Active" },
          ].map((stat, i) => (
            <div
              key={i}
              className="p-5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-white/10 rounded-xl shadow"
            >
              <p className="text-sm text-gray-500">{stat.label}</p>
              <h3 className="text-2xl font-bold text-teal-800 dark:text-teal-600">{stat.value}</h3>
            </div>
          ))}
        </div>

        <div className="mb-12">
          <h2 className="text-2xl font-bold mb-4 text-teal-800 dark:text-teal-600">
            <PackageCheck className="inline w-5 h-5 mr-2" />
            Your Services
          </h2>
          {services.length === 0 ? (
            <p className="text-gray-600 dark:text-gray-400">No services added yet.</p>
          ) : (
            <div className="grid md:grid-cols-2 gap-6">
              {services.map((service) => (
                <div
                  key={service.id}
                  className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-white/10 p-5 rounded-xl shadow space-y-2"
                >
                  <h3 className="font-bold text-lg text-teal-800 dark:text-teal-600">{service.name}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300">{service.description}</p>
                  <p className="text-sm font-medium">₹{service.price}</p>
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
                  <div className="flex gap-3 pt-2">
                    <button
                      onClick={() => handleDeleteService(service.id)}
                      className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 flex items-center gap-1"
                    >
                      <Trash2 className="w-4 h-4" /> Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div>
          <h2 className="text-2xl font-bold mb-4 text-teal-800 dark:text-teal-600">
            <Mail className="inline w-5 h-5 mr-2" />
            User Requests
          </h2>
          {requests.length === 0 ? (
            <p className="text-gray-600 dark:text-gray-400">No requests from users yet.</p>
          ) : (
            <div className="space-y-4">
              {requests.map((req) => (
                <div
                  key={req.id}
                  className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-white/10 p-5 rounded-xl shadow space-y-2"
                >
                  <p><strong>User Email:</strong> {req.userEmail}</p>
                  <p><strong>Service:</strong> {req.serviceName}</p>
                  <p><strong>Status:</strong>{" "}
                    <span className={`font-semibold ${req.status === "Pending"
                      ? "text-yellow-500"
                      : req.status === "Accepted"
                        ? "text-green-500"
                        : req.status === "Rejected"
                          ? "text-red-500"
                          : "text-blue-500"
                      }`}>
                      {req.status}
                    </span>
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    {req.timestamp?.seconds
                      ? new Date(req.timestamp.seconds * 1000).toLocaleString()
                      : "No timestamp"}
                  </p>

                  {req.status === "Pending" && (
                    <div className="flex gap-3 pt-2">
                      <button
                        onClick={() => handleStatusUpdate(req.id, "Accepted")}
                        className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 flex items-center gap-1"
                      >
                        <CheckCircle className="w-4 h-4" /> Accept
                      </button>
                      <button
                        onClick={() => handleStatusUpdate(req.id, "Rejected")}
                        className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 flex items-center gap-1"
                      >
                        <XCircle className="w-4 h-4" /> Reject
                      </button>
                    </div>
                  )}
                  {req.status === "Accepted" && (
                    <button
                      onClick={() => handleStatusUpdate(req.id, "Completed")}
                      className="mt-2 px-4 py-2 bg-teal-800 text-white rounded hover:bg-teal-700 flex items-center gap-1"
                    >
                      <Loader2 className="w-4 h-4 animate-spin" /> Mark Completed
                    </button>
                  )}
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
