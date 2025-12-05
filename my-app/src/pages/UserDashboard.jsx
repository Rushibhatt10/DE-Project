import React, { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { auth, db } from "../firebase";
import { onAuthStateChanged } from "firebase/auth";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import {
  MapPin,
  Search,
  User,
  ShieldCheck,
  UserRound,
  Filter,
  Star,
  Clock
} from "lucide-react";
import Card from "../components/ui/Card";
import MagneticButton from "../components/ui/MagneticButton";
import HeroCarousel from "../components/dashboard/HeroCarousel";

const UserDashboard = () => {
  const [services, setServices] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [location, setLocation] = useState("Fetching...");
  const [userEmail, setUserEmail] = useState("");
  const [sortOption, setSortOption] = useState("newest");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [isSearchFocused, setIsSearchFocused] = useState(false);

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
    } finally {
      setLoading(false);
    }
  };

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
            const area =
              details?.neighbourhood ||
              details?.suburb ||
              details?.city ||
              "Your Area";
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

      const matchCategory =
        !categoryFilter || s.category === categoryFilter;

      return matchSearch && matchCategory;
    })
    .sort((a, b) => {
      if (sortOption === "price_low")
        return parseFloat(a.price || 0) - parseFloat(b.price || 0);
      if (sortOption === "price_high")
        return parseFloat(b.price || 0) - parseFloat(a.price || 0);
      if (sortOption === "rating_high")
        return (b.rating || 0) - (a.rating || 0);
      if (sortOption === "newest")
        return (
          (b.timestamp?.toMillis?.() || 0) - (a.timestamp?.toMillis?.() || 0)
        );
      return 0;
    });

  const categories = ["Tiffin", "Household", "Cleaning", "Repair", "Electrician", "Plumber"];

  // Suggestions logic
  const suggestions = services
    .filter(s => s.name.toLowerCase().includes(searchQuery.toLowerCase()) && searchQuery.length > 0)
    .slice(0, 5);

  return (
    <div className="min-h-screen bg-background text-foreground font-sans selection:bg-primary/20">
      {/* Top Navigation Bar */}
      <nav className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border/50 px-6 py-4 transition-all duration-300">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-gradient-to-br from-primary to-primary/80 rounded-xl flex items-center justify-center font-bold text-primary-foreground text-xl shadow-lg shadow-primary/20">D</div>
            <div>
              <h1 className="font-bold text-lg leading-tight text-foreground">Dashboard</h1>
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <MapPin className="w-3 h-3 text-primary" />
                <span className="truncate max-w-[150px]">{location}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden md:block text-right">
              <div className="text-sm font-medium text-foreground">{userEmail?.split('@')[0]}</div>
              <div className="text-xs text-muted-foreground">User</div>
            </div>
            <Link to="/account">
              <div className="w-10 h-10 rounded-full bg-secondary hover:bg-secondary/80 border border-border flex items-center justify-center transition-all cursor-pointer shadow-sm hover:shadow-md">
                <UserRound className="w-5 h-5 text-muted-foreground" />
              </div>
            </Link>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 py-8">

        {/* Hero Carousel */}
        <HeroCarousel />

        {/* Search & Categories */}
        <div className="mb-12 space-y-8">
          <div className="relative max-w-2xl mx-auto z-30">
            <div className={`relative transition-all duration-300 ${isSearchFocused ? 'scale-105' : 'scale-100'}`}>
              <input
                type="text"
                placeholder="Search for services (e.g., 'AC Repair', 'Cleaning')..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setIsSearchFocused(true)}
                onBlur={() => setTimeout(() => setIsSearchFocused(false), 200)}
                className="w-full px-6 py-4 rounded-2xl bg-card/80 backdrop-blur-xl text-foreground border border-border/50 focus:border-primary/50 focus:ring-4 focus:ring-primary/10 outline-none transition-all pl-14 shadow-lg hover:shadow-xl"
              />
              <Search className={`absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 transition-colors ${isSearchFocused ? 'text-primary' : 'text-muted-foreground'}`} />
            </div>

            {/* Real-time Suggestions Dropdown */}
            <AnimatePresence>
              {isSearchFocused && searchQuery && suggestions.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="absolute top-full left-0 right-0 mt-2 bg-card/95 backdrop-blur-xl border border-border/50 rounded-xl shadow-2xl overflow-hidden z-40"
                >
                  {suggestions.map((s) => (
                    <Link
                      key={s.id}
                      to={`/service/${s.id}`}
                      className="flex items-center gap-3 px-5 py-3 hover:bg-primary/5 transition-colors cursor-pointer border-b border-border/50 last:border-none"
                    >
                      <img src={s.imageUrls?.[0]} alt="" className="w-8 h-8 rounded-md object-cover" />
                      <div>
                        <p className="text-sm font-medium text-foreground">{s.name}</p>
                        <p className="text-xs text-muted-foreground">{s.category}</p>
                      </div>
                    </Link>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="flex flex-wrap justify-center gap-3">
            <button
              onClick={() => setCategoryFilter("")}
              className={`px-6 py-2.5 rounded-full text-sm font-medium transition-all duration-300 ${categoryFilter === ""
                ? "bg-primary text-primary-foreground shadow-lg shadow-primary/25 scale-105"
                : "bg-card border border-border text-muted-foreground hover:bg-secondary hover:text-foreground hover:border-primary/30"
                }`}
            >
              All
            </button>
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setCategoryFilter(cat)}
                className={`px-6 py-2.5 rounded-full text-sm font-medium transition-all duration-300 ${categoryFilter === cat
                  ? "bg-primary text-primary-foreground shadow-lg shadow-primary/25 scale-105"
                  : "bg-card border border-border text-muted-foreground hover:bg-secondary hover:text-foreground hover:border-primary/30"
                  }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Filters & Sort */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
          <h2 className="text-2xl font-bold text-foreground flex items-center gap-3">
            {categoryFilter ? `${categoryFilter} Services` : "All Services"}
            <span className="px-2.5 py-0.5 rounded-full bg-secondary text-xs font-medium text-muted-foreground border border-border">
              {filteredServices.length}
            </span>
          </h2>

          <div className="flex items-center gap-3 self-end sm:self-auto">
            <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-card border border-border text-sm text-muted-foreground hover:border-primary/30 transition-colors shadow-sm">
              <Filter className="w-4 h-4" />
              <span className="hidden sm:inline">Sort by:</span>
              <select
                value={sortOption}
                onChange={(e) => setSortOption(e.target.value)}
                className="bg-transparent border-none outline-none text-foreground font-medium cursor-pointer"
              >
                <option value="newest">Newest</option>
                <option value="price_low">Price: Low to High</option>
                <option value="price_high">Price: High to Low</option>
                <option value="rating_high">Top Rated</option>
              </select>
            </div>
          </div>
        </div>

        {/* Services Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-[380px] rounded-3xl bg-card border border-border animate-pulse"></div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            <AnimatePresence mode="popLayout">
              {filteredServices.length > 0 ? (
                filteredServices.map((service, idx) => (
                  <motion.div
                    key={service.id}
                    layout
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.4, delay: idx * 0.05, type: "spring", stiffness: 100 }}
                  >
                    <Link to={`/service/${service.id}`}>
                      <Card className="h-full flex flex-col overflow-hidden group hover:shadow-2xl hover:shadow-primary/10 transition-all duration-500 border-border/50 bg-card/50 backdrop-blur-sm rounded-3xl">
                        <div className="relative h-56 overflow-hidden bg-secondary">
                          {service.imageUrls?.length > 0 ? (
                            <img
                              src={service.imageUrls[0]}
                              alt={service.name}
                              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-secondary">
                              <span className="text-muted-foreground font-medium">No Image</span>
                            </div>
                          )}

                          {/* Floating Category Badge */}
                          <div className="absolute top-4 right-4 px-3 py-1.5 rounded-full bg-background/80 backdrop-blur-md text-xs font-bold text-foreground shadow-lg border border-white/10">
                            {service.category}
                          </div>

                          {/* Verified Badge */}
                          {service.verified && (
                            <div className="absolute bottom-4 left-4 px-2.5 py-1.5 rounded-lg bg-green-500/90 backdrop-blur-md text-xs font-bold text-white flex items-center gap-1.5 shadow-lg">
                              <ShieldCheck className="w-3.5 h-3.5" /> Verified
                            </div>
                          )}
                        </div>

                        <div className="p-6 flex flex-col flex-1">
                          <div className="flex justify-between items-start mb-3 gap-2">
                            <h3 className="text-xl font-bold text-foreground group-hover:text-primary transition-colors line-clamp-1">
                              {service.name}
                            </h3>
                            <div className="text-lg font-bold text-primary whitespace-nowrap">
                              ₹{service.price}
                            </div>
                          </div>

                          <div className="flex items-center gap-1.5 mb-4">
                            <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                            <span className="text-sm font-bold text-foreground">{service.rating || "4.8"}</span>
                            <span className="text-xs text-muted-foreground">({service.reviewCount || "120"} reviews)</span>
                          </div>

                          <p className="text-sm text-muted-foreground mb-6 line-clamp-2 flex-1 leading-relaxed">
                            {service.description}
                          </p>

                          <div className="flex items-center justify-between pt-4 border-t border-border/50 mt-auto">
                            <div className="flex items-center gap-2.5 text-xs text-muted-foreground">
                              <div className="w-6 h-6 rounded-full bg-secondary flex items-center justify-center">
                                <User className="w-3.5 h-3.5" />
                              </div>
                              <span className="font-medium text-foreground">{service.providerName || "Provider"}</span>
                            </div>
                            <div className="flex items-center gap-1.5 text-xs font-medium text-primary/80 bg-primary/5 px-2.5 py-1 rounded-md">
                              <Clock className="w-3.5 h-3.5" />
                              <span>{service.availability || "Available"}</span>
                            </div>
                          </div>
                        </div>
                      </Card>
                    </Link>
                  </motion.div>
                ))
              ) : (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="col-span-full flex flex-col items-center justify-center py-24 text-muted-foreground"
                >
                  <div className="w-20 h-20 bg-secondary/50 rounded-full flex items-center justify-center mb-6">
                    <Search className="w-10 h-10 opacity-20" />
                  </div>
                  <p className="text-xl font-medium text-foreground">No services found.</p>
                  <p className="text-sm mt-2 max-w-xs text-center">Try adjusting your search or filters to find what you're looking for.</p>
                  <button
                    onClick={() => { setSearchQuery(""); setCategoryFilter(""); }}
                    className="mt-6 px-6 py-2 bg-primary text-primary-foreground rounded-full text-sm font-medium hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20"
                  >
                    Clear all filters
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}
      </main>
    </div>
  );
};

export default UserDashboard;
