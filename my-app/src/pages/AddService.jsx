import React, { useState, useEffect } from "react";
import { auth, db } from "../firebase";
import { addDoc, collection } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import axios from "axios";

const AddService = () => {
  const [provider, setProvider] = useState(null);
  const [imageFiles, setImageFiles] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [uploading, setUploading] = useState(false);

  const [serviceData, setServiceData] = useState({
    name: "",
    description: "",
    price: "",
    category: "",
    location: "",
    address: "",
    availability: "",
  });

  const navigate = useNavigate();

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      if (user) setProvider(user);
      else navigate("/signin");
    });
    return () => unsub();
  }, [navigate]);

  // Accurate location using Geoapify
  useEffect(() => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(async (position) => {
        const { latitude, longitude } = position.coords;
        try {
          const res = await fetch(
            `https://api.geoapify.com/v1/geocode/reverse?lat=${latitude}&lon=${longitude}&apiKey=76470fd0d5294effa24ded7a415a7fdf`
          );
          const data = await res.json();
          const details = data.features[0]?.properties;
          const area = details?.neighbourhood || details?.suburb || details?.city || "";
          const state = details?.state || "";
          const fullLocation = `${area}, ${state}`;
          setServiceData((prev) => ({
            ...prev,
            location: fullLocation,
          }));
        } catch (err) {
          console.error("Geoapify location fetch failed:", err);
        }
      });
    }
  }, []);

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    setImageFiles(files);
    setImagePreviews(files.map((file) => URL.createObjectURL(file)));
  };

  const handleAddService = async (e) => {
    e.preventDefault();

    if (imageFiles.length === 0) {
      alert("Please upload at least one image.");
      return;
    }

    setUploading(true);
    try {
      const imageUrls = await Promise.all(
        imageFiles.map(async (file) => {
          const formData = new FormData();
          formData.append("image", file);
          const res = await axios.post(
            `https://api.imgbb.com/1/upload?key=15b6336c4094168e30360aa37d2f29be`,
            formData
          );
          return res.data.data.url;
        })
      );

      await addDoc(collection(db, "provider_services"), {
        ...serviceData,
        imageUrls,
        providerEmail: provider.email,
        providerUid: provider.uid,
        createdAt: new Date(),
      });

      alert("Service added successfully!");
      navigate("/provider-admin");
    } catch (err) {
      console.error(err);
      alert("Error adding service.");
    } finally {
      setUploading(false);
    }
  };

  const categories = [
    "Cleaning",
    "Electrical",
    "Plumbing",
    "Tiffin",
    "Laundry",
    "Gardening",
    "Babysitting",
    "Fitness Trainer",
    "Carpentry",
    "Other",
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-white to-blue-50 dark:from-[#1e1e2e] dark:to-[#121212] px-6 py-10 text-black dark:text-white font-['Manrope']">
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
            min="0"
            className="w-full p-3 rounded border bg-gray-100 dark:bg-gray-800 dark:border-gray-600"
          />

          <select
            value={serviceData.category}
            onChange={(e) =>
              setServiceData({ ...serviceData, category: e.target.value })
            }
            required
            className="w-full p-3 rounded border bg-gray-100 dark:bg-gray-800 dark:border-gray-600"
          >
            <option value="">Select Category</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>

          <input
            type="text"
            placeholder="Address (e.g. House No, Street, Landmark)"
            value={serviceData.address}
            onChange={(e) =>
              setServiceData({ ...serviceData, address: e.target.value })
            }
            required
            className="w-full p-3 rounded border bg-gray-100 dark:bg-gray-800 dark:border-gray-600"
          />

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
            required
            className="w-full p-3 rounded border bg-gray-100 dark:bg-gray-800 dark:border-gray-600"
          >
            <option value="">Select Availability</option>
            <option value="Weekdays">Weekdays</option>
            <option value="Weekends">Weekends</option>
            <option value="Anytime">Anytime</option>
          </select>

          <div>
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handleImageChange}
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-pink-500 file:text-white hover:file:bg-pink-600"
              required
            />
            {imagePreviews.length > 0 && (
              <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 gap-4">
                {imagePreviews.map((src, idx) => (
                  <img
                    key={idx}
                    src={src}
                    alt={`Preview ${idx + 1}`}
                    className="rounded-lg shadow-md w-full h-40 object-cover"
                  />
                ))}
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={uploading}
            className="w-full py-3 bg-gradient-to-r from-pink-500 to-blue-500 text-white font-semibold rounded-lg hover:scale-105 transition-transform"
          >
            {uploading ? "Uploading..." : "Add Service"}
          </button>
        </form>
      </motion.div>
    </div>
  );
};

export default AddService;
