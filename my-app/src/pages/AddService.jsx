import React, { useState, useEffect } from "react";
import { auth, db } from "../firebase";
import { addDoc, collection } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

const AddService = () => {
  const [provider, setProvider] = useState(null);
  const [serviceData, setServiceData] = useState({
    name: "",
    description: "",
    price: "",
    category: "",
    location: "",
    availability: "",
  });

  const navigate = useNavigate();

  // Check Auth
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      if (user) setProvider(user);
      else navigate("/signin");
    });
    return () => unsub();
  }, [navigate]);

  // Auto location
  useEffect(() => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(async (position) => {
        const { latitude, longitude } = position.coords;
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`
          );
          const data = await res.json();
          const city =
            data.address.city ||
            data.address.town ||
            data.address.village ||
            "";
          const state = data.address.state || "";
          setServiceData((prev) => ({
            ...prev,
            location: `${city}, ${state}`,
          }));
        } catch (err) {
          console.error("Location fetch error:", err);
        }
      });
    }
  }, []);

  const handleAddService = async (e) => {
    e.preventDefault();

    try {
      await addDoc(collection(db, "provider_services"), {
        ...serviceData,
        providerEmail: provider.email,
        providerUid: provider.uid,
        createdAt: new Date(),
      });

      alert("Service added successfully!");
      navigate("/provider-admin");
    } catch (err) {
      console.error(err);
      alert("Error adding service.");
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-[#1e1e2e] px-6 py-10 text-black dark:text-white font-['Manrope']">
      <motion.div
        className="max-w-3xl mx-auto"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-3xl font-bold mb-6 text-center text-pink-500">
          Add New Service
        </h1>

        <form
          onSubmit={handleAddService}
          className="space-y-4 bg-white dark:bg-white/5 p-6 rounded-xl shadow-md border border-gray-300 dark:border-white/10"
        >
          <input
            type="text"
            placeholder="Service Name"
            value={serviceData.name}
            onChange={(e) =>
              setServiceData({ ...serviceData, name: e.target.value })
            }
            required
            className="w-full p-3 rounded border bg-gray-100 dark:bg-gray-800 dark:border-gray-600"
          />

          <textarea
            placeholder="Service Description"
            value={serviceData.description}
            onChange={(e) =>
              setServiceData({ ...serviceData, description: e.target.value })
            }
            rows="4"
            required
            className="w-full p-3 rounded border bg-gray-100 dark:bg-gray-800 dark:border-gray-600"
          ></textarea>

          <input
            type="number"
            placeholder="Price in ₹"
            value={serviceData.price}
            onChange={(e) =>
              setServiceData({ ...serviceData, price: e.target.value })
            }
            required
            className="w-full p-3 rounded border bg-gray-100 dark:bg-gray-800 dark:border-gray-600"
          />

          <select
            value={serviceData.category}
            onChange={(e) =>
              setServiceData({ ...serviceData, category: e.target.value })
            }
            className="w-full p-3 rounded border bg-gray-100 dark:bg-gray-800 dark:border-gray-600"
          >
            <option value="">Select Category</option>
            <option value="Cleaning">Cleaning</option>
            <option value="Electrical">Electrical</option>
            <option value="Plumbing">Plumbing</option>
            <option value="Tiffin">Tiffin</option>
            <option value="Laundry">Laundry</option>
            <option value="Gardening">Gardening</option>
            <option value="Babysitting">Babysitting</option>
            <option value="Fitness Trainer">Fitness Trainer</option>
            <option value="Other">Other</option>
          </select>

          <input
            type="text"
            placeholder="Location"
            value={serviceData.location}
            readOnly
            className="w-full p-3 rounded border bg-gray-100 dark:bg-gray-800 dark:border-gray-600 text-gray-600"
          />

          <select
            value={serviceData.availability}
            onChange={(e) =>
              setServiceData({ ...serviceData, availability: e.target.value })
            }
            className="w-full p-3 rounded border bg-gray-100 dark:bg-gray-800 dark:border-gray-600"
          >
            <option value="">Select Availability</option>
            <option value="Weekdays">Weekdays</option>
            <option value="Weekends">Weekends</option>
            <option value="Anytime">Anytime</option>
          </select>

          <button
            type="submit"
            className="w-full py-3 bg-gradient-to-r from-pink-500 to-blue-500 text-white font-semibold rounded-lg hover:scale-105 transition-transform"
          >
            Add Service
          </button>
        </form>
      </motion.div>
    </div>
  );
};

export default AddService;
