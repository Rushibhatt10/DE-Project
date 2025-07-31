import React, { useEffect, useState } from "react";
import { db } from "../firebase";
import { collection, query, where, getDocs } from "firebase/firestore";

const ProviderAdmin = () => {
  const [services, setServices] = useState([]);
  const [requests, setRequests] = useState([]);
  const [provider, setProvider] = useState(null);

  const currentUser = JSON.parse(localStorage.getItem("user"));
  const providerUid = currentUser?.uid;

  useEffect(() => {
    const fetchProviderData = async () => {
      try {
        const providerRef = collection(db, "verified_providers");
        const q = query(providerRef, where("uid", "==", providerUid));
        const snapshot = await getDocs(q);
        if (!snapshot.empty) {
          setProvider(snapshot.docs[0].data());
        }
      } catch (error) {
        console.error("Error fetching provider profile:", error);
      }
    };

    const fetchServices = async () => {
      try {
        const serviceRef = collection(db, "provider_services");
        const q = query(serviceRef, where("providerUid", "==", providerUid));
        const snapshot = await getDocs(q);
        const servicesList = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));
        setServices(servicesList);
      } catch (error) {
        console.error("Error fetching services:", error);
      }
    };

    const fetchRequests = async () => {
      try {
        const requestRef = collection(db, "user_requests");
        const q = query(requestRef, where("providerUid", "==", providerUid));
        const snapshot = await getDocs(q);
        const requestList = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));
        setRequests(requestList);
      } catch (error) {
        console.error("Error fetching requests:", error);
      }
    };

    if (providerUid) {
      fetchProviderData();
      fetchServices();
      fetchRequests();
    }
  }, [providerUid]);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Provider Admin Dashboard</h1>

      {provider && (
        <div className="mb-6 bg-white rounded shadow p-4">
          <h2 className="text-xl font-semibold mb-2">Verified Profile</h2>
          <p><strong>Name:</strong> {provider.name}</p>
          <p><strong>Email:</strong> {provider.email}</p>
          <p><strong>Service Type:</strong> {provider.serviceType}</p>
        </div>
      )}

      <div className="mb-6 bg-white rounded shadow p-4">
        <h2 className="text-xl font-semibold mb-2">Your Added Services</h2>
        {services.length > 0 ? (
          services.map(service => (
            <div key={service.id} className="border p-3 mb-2 rounded">
              <h3 className="font-semibold">{service.serviceName}</h3>
              <p>{service.description}</p>
              <p><strong>Location:</strong> {service.location}</p>
              <p><strong>Price:</strong> ₹{service.price}</p>
            </div>
          ))
        ) : (
          <p>No services added yet.</p>
        )}
      </div>

      <div className="bg-white rounded shadow p-4">
        <h2 className="text-xl font-semibold mb-2">User Requests</h2>
        {requests.length > 0 ? (
          requests.map(request => (
            <div key={request.id} className="border p-3 mb-2 rounded">
              <p><strong>User Email:</strong> {request.userEmail}</p>
              <p><strong>Service:</strong> {request.serviceName}</p>
              <p><strong>Status:</strong> {request.status}</p>
            </div>
          ))
        ) : (
          <p>No requests yet.</p>
        )}
      </div>
    </div>
  );
};

export default ProviderAdmin;
