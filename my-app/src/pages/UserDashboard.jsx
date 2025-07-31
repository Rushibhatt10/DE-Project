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
  UserRound,
} from "lucide-react";

const UserDashboard = () => {
  const [services, setServices] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [location, setLocation] = useState("Fetching...");
  const [userEmail, setUserEmail] = useState("");
  const [sortOption, setSortOption] = useState("newest");
  const [locationFilter, setLocationFilter] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");


  // Fetch all services
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

  // Geoapify-based location
  const fetchLocation = () => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          try {
            const res = await fetch(
              `https://api.geoapify.com/v1/geocode/reverse?lat=${latitude}&lon=${longitude}&apiKey=76470fd0d5294effa24ded7a415a7fdf`
            );
            const data = await res.json();
            const details = data.features[0]?.properties;
            const area = details?.neighbourhood || details?.suburb || details?.city || "Your Area";
            const state = details?.state || "";
            setLocation(`${area}, ${state}`);
          } catch (error) {
            console.error("Geoapify error:", error);
            setLocation("Unable to fetch");
          }
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

 const filteredServices = services
  .filter((s) => {
    const matchSearch =
      s.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.category?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchLocation =
      !locationFilter ||
      s.location?.toLowerCase().includes(locationFilter.toLowerCase());

    const matchCategory =
      !categoryFilter || s.category === categoryFilter;

    return matchSearch && matchLocation && matchCategory;
  })
  .sort((a, b) => {
  if (sortOption === "price_low") return parseFloat(a.price || 0) - parseFloat(b.price || 0);
  if (sortOption === "price_high") return parseFloat(b.price || 0) - parseFloat(a.price || 0);
  if (sortOption === "rating_high") return (b.rating || 0) - (a.rating || 0);
  if (sortOption === "newest")
    return (b.timestamp?.toMillis?.() || 0) - (a.timestamp?.toMillis?.() || 0);
  return 0;
});

  return (
    <div className="min-h-screen bg-gradient-to-br from-white to-blue-50 dark:from-[#1e1e2e] dark:to-[#121212] p-6 font-['Manrope'] transition-all">
      <motion.div
        className="max-w-7xl mx-auto"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
      >
        {/* Header */}
        <div className="flex justify-between items-center flex-wrap gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-pink-500">
              Welcome {userEmail ? `(${userEmail})` : ""}
            </h1>
            <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300 mt-1">
              <MapPin className="w-4 h-4" />
              <span>{location}</span>
            </div>
          </div>

          <Link
            to="/account"
            className="flex items-center gap-2 bg-pink-500 text-white px-4 py-2 rounded-lg shadow hover:bg-pink-600 transition text-sm font-medium"
          >
            <UserRound className="w-4 h-4" />
            Account
          </Link>
        </div>

        {/* Search Bar */}
        <div className="relative mb-10">
          <input
            type="text"
            placeholder="Search services by name or category..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-5 py-3 rounded-xl bg-white dark:bg-gray-800 text-gray-800 dark:text-white border border-gray-300 dark:border-gray-700 shadow-sm pl-10 focus:outline-none focus:ring-2 focus:ring-pink-500 transition"
          />
          <Search className="absolute left-3 top-3.5 text-gray-400 w-5 h-5" />
        </div>
      {/* 🔽 Sort & Filter Options */}
<div className="flex flex-wrap gap-4 justify-between items-center mb-8">
  {/* Sort Dropdown */}
  <div className="flex items-center gap-2">
    <label htmlFor="sort" className="text-sm font-medium text-gray-700 dark:text-gray-300">
      Sort by:
    </label>
    <select
      id="sort"
      onChange={(e) => setSortOption(e.target.value)}
      className="px-3 py-2 rounded-lg bg-white dark:bg-gray-800 text-gray-800 dark:text-white border border-gray-300 dark:border-gray-700"
    >
      <option value="newest">Newest</option>
      <option value="price_low">Price: Low to High</option>
      <option value="price_high">Price: High to Low</option>
      <option value="rating_high">Rating: High to Low</option>
    </select>
  </div>

  {/* Filter by Location & Category */}
  <div className="flex flex-wrap gap-2">
    <input
      type="text"
      placeholder="Filter by location"
      value={locationFilter}
      onChange={(e) => setLocationFilter(e.target.value)}
      className="px-3 py-2 rounded-lg bg-white dark:bg-gray-800 text-gray-800 dark:text-white border border-gray-300 dark:border-gray-700"
    />
    <select
      value={categoryFilter}
      onChange={(e) => setCategoryFilter(e.target.value)}
      className="px-3 py-2 rounded-lg bg-white dark:bg-gray-800 text-gray-800 dark:text-white border border-gray-300 dark:border-gray-700"
    >
      <option value="">All Categories</option>
      <option value="Tiffin">Tiffin</option>
      <option value="Household">Household</option>
      <option value="Cleaning">Cleaning</option>
      <option value="Repair">Repair</option>
    </select>
  </div>
</div>

        {/* Service Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredServices.length > 0 ? (
            filteredServices.map((service) => (
              <Link to={`/service/${service.id}`} key={service.id}>
                <motion.div
                  whileHover={{ scale: 1.03 }}
                  className="bg-white dark:bg-[#1f1f2e] rounded-2xl shadow-xl border border-gray-200 dark:border-white/10 overflow-hidden flex flex-col transition-all hover:shadow-pink-500/30"
                >
                  {service.imageUrls?.length > 0 && (
                 <img
                 src={service.imageUrls[0]}
                 alt={service.name}
                 className="w-full h-48 object-cover"
                 />
                  )}

                  <div className="p-5 flex flex-col h-full">
                    <h2 className="text-xl font-bold text-pink-500 mb-1">{service.name}</h2>
                    <p className="text-sm text-gray-600 dark:text-gray-300 mb-2 line-clamp-2">
                      {service.description}
                    </p>
                    <p className="text-base font-semibold text-gray-900 dark:text-white mb-2">
                      ₹{service.price}
                    </p>
                    <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mb-3">
                      <span>{service.category}</span>
                      <span>{service.availability}</span>
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-300 space-y-1 mt-auto border-t pt-3 border-dashed border-gray-300 dark:border-gray-700">
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-pink-400" />
                        <span>{service.providerName || "Provider"}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Mail className="w-4 h-4 text-blue-400" />
                        <span>{service.providerEmail}</span>
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
                  </div>
                </motion.div>
              </Link>
            ))
          ) : (
            <p className="text-center col-span-full text-gray-500 dark:text-gray-400 mt-12">
              No matching services found.
            </p>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default UserDashboard;