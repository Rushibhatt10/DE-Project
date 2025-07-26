import React, { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { auth, db } from "../firebase";
import { onAuthStateChanged } from "firebase/auth";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import {
  MapPin,
  Search,
  Mail,
  Phone,
  User,
  ShieldCheck,
} from "lucide-react";

const UserDashboard = () => {
  const [services, setServices] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [location, setLocation] = useState("Fetching...");
  const [userEmail, setUserEmail] = useState("");

  const fetchServices = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "provider_services"));
      const servicesData = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setServices(servicesData);
    } catch (err) {
      console.error("Service Fetch Error:", err);
    }
  };

  const fetchLocation = () => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`
          );
          const data = await res.json();
          setLocation(data.address.city || "Your Area");
        },
        () => setLocation("Location blocked")
      );
    } else {
      setLocation("Unsupported");
    }
  };

  useEffect(() => {
    fetchLocation();
    fetchServices();
    onAuthStateChanged(auth, (user) => {
      if (user) setUserEmail(user.email);
    });
  }, []);

  const filteredServices = services.filter(
    (s) =>
      s.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.category?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-white to-blue-50 dark:from-[#1e1e2e] dark:to-[#121212] p-6 font-['Manrope'] transition-all">
      <motion.div
        className="max-w-7xl mx-auto"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
      >
        {/* Header */}
        <div className="flex justify-between items-center mb-6 flex-wrap gap-2">
          <h1 className="text-2xl sm:text-3xl font-bold text-pink-500">
            Welcome {userEmail ? `(${userEmail})` : ""}
          </h1>
          <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
            <MapPin className="w-4 h-4" />
            <span>{location}</span>
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative mb-8">
          <input
            type="text"
            placeholder="Search by name or category..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-5 py-3 rounded-xl bg-white dark:bg-gray-800 text-gray-800 dark:text-white border border-gray-300 dark:border-gray-700 shadow-sm pl-10 focus:outline-none focus:ring-2 focus:ring-pink-500 transition"
          />
          <Search className="absolute left-3 top-3.5 text-gray-400 w-5 h-5" />
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredServices.length > 0 ? (
            filteredServices.map((service) => (
              <Link to={`/service/${service.id}`} key={service.id}>
                <motion.div
                  className="bg-white dark:bg-[#1f1f2e] p-5 rounded-2xl shadow-xl hover:shadow-pink-500/40 transition-all border border-gray-100 dark:border-gray-800 flex flex-col"
                  whileHover={{ scale: 1.03 }}
                >
                  {service.imageUrl && (
                    <img
                      src={service.imageUrl}
                      alt={service.name}
                      className="w-full h-48 object-cover rounded-lg mb-4 border border-gray-300 dark:border-gray-700"
                    />
                  )}
                  <h2 className="text-xl font-extrabold text-pink-500 mb-1">{service.name}</h2>
                  <p className="text-sm text-gray-600 dark:text-gray-300 mb-2 line-clamp-2">{service.description}</p>
                  <p className="text-sm font-semibold text-gray-900 dark:text-white mb-1">₹{service.price}</p>
                  <div className="flex flex-wrap justify-between text-xs text-gray-500 dark:text-gray-400 mb-3">
                    <span>{service.category}</span>
                    <span>{service.availability}</span>
                  </div>

                  <div className="mt-auto text-sm text-gray-600 dark:text-gray-300 space-y-2 pt-3 border-t border-dashed border-gray-300 dark:border-gray-600">
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-pink-400" />
                      <span>{service.providerName || "Unknown Provider"}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4 text-blue-400" />
                      <span>{service.providerEmail || "Not provided"}</span>
                    </div>
                    {service.contact && (
                      <div className="flex items-center gap-2">
                        <Phone className="w-4 h-4 text-green-500" />
                        <span>{service.contact}</span>
                      </div>
                    )}
                    {service.location && (
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-yellow-500" />
                        <span>{service.location}</span>
                      </div>
                    )}
                    {service.verified && (
                      <div className="flex items-center gap-2">
                        <ShieldCheck className="w-4 h-4 text-emerald-500" />
                        <span className="text-emerald-500 font-medium">Verified Provider</span>
                      </div>
                    )}
                  </div>
                </motion.div>
              </Link>
            ))
          ) : (
            <p className="text-gray-600 dark:text-gray-400 col-span-full text-center mt-8">
              No services found.
            </p>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default UserDashboard;
