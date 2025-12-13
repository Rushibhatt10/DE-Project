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
  onSnapshot,
  addDoc,
  serverTimestamp
} from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import {
  User,
  PackageCheck,
  Mail,
  Clock,
  CheckCircle,
  XCircle,
  Loader2,
  Trash2,
  MapPin,
  Calendar,
  LogOut,
  LayoutDashboard,
  List,
  Navigation,
  AlertTriangle,
  Star
} from "lucide-react";
import Card from "../components/ui/Card";
import MagneticButton from "../components/ui/MagneticButton";
import { toast } from "react-hot-toast";

// Fix for Leaflet marker icons
import L from "leaflet";
import icon from "leaflet/dist/images/marker-icon.png";
import iconShadow from "leaflet/dist/images/marker-shadow.png";

let DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

L.Marker.prototype.options.icon = DefaultIcon;

const ProviderAdmin = () => {
  const [services, setServices] = useState([]);
  const [requests, setRequests] = useState([]);
  const [provider, setProvider] = useState(null);
  const [providerProfile, setProviderProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("dashboard"); // dashboard, requests, services
  const [averageRating, setAverageRating] = useState(0);

  const navigate = useNavigate();

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setProvider(user);
        const profileSnap = await getDoc(doc(db, "verified_providers", user.uid));
        if (profileSnap.exists()) {
          const data = profileSnap.data();
          if (data.status !== "APPROVED") {
            navigate("/provider-dashboard");
            return;
          }
          setProviderProfile(data);
        } else {
          navigate("/provider-dashboard");
          return;
        }
        await fetchServices(user.uid);

        // Real-time listener for requests
        const q = query(collection(db, "user_requests"), where("providerUid", "==", user.uid));
        const unsubscribeRequests = onSnapshot(q, async (snapshot) => {
          const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
          // Sort by timestamp desc
          data.sort((a, b) => (b.timestamp?.seconds || 0) - (a.timestamp?.seconds || 0));
          setRequests(data);

          // Calculate Ratings
          const requestIds = data.map(r => r.id);
          if (requestIds.length > 0) {
            // Note: In a real app with many requests, we'd query ratings differently or aggregate them.
            // For now, we'll fetch all ratings and filter.
            const ratingsSnap = await getDocs(collection(db, "ratings"));
            let totalRating = 0;
            let count = 0;
            ratingsSnap.forEach(doc => {
              const r = doc.data();
              if (requestIds.includes(r.requestId)) {
                totalRating += r.rating;
                count++;
              }
            });
            setAverageRating(count > 0 ? (totalRating / count).toFixed(1) : 0);
          }
        });

        setLoading(false);
        return () => unsubscribeRequests();
      } else {
        navigate("/signin");
      }
    });
    return () => unsub();
  }, [navigate]);

  const fetchServices = async (uid) => {
    const q = query(collection(db, "provider_services"), where("providerUid", "==", uid));
    const querySnapshot = await getDocs(q);
    const data = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    setServices(data);
  };

  const handleStatusUpdate = async (requestId, newStatus) => {
    try {
      const requestRef = doc(db, "user_requests", requestId);
      await updateDoc(requestRef, { status: newStatus });
      toast.success(`Request ${newStatus}`);

      // Fetch request data to get userId
      const requestSnap = await getDoc(requestRef);
      if (requestSnap.exists()) {
        const reqData = requestSnap.data();
        await addDoc(collection(db, "notifications"), {
          toUid: reqData.userId,
          title: `Request ${newStatus}`,
          message: `Your request for ${reqData.serviceName} has been ${newStatus}.`,
          timestamp: serverTimestamp(),
          read: false,
          link: `/order/${requestId}`
        });
      }

      if (newStatus === "Accepted") {
        navigate(`/order/${requestId}`);
      }
    } catch (err) {
      console.error("Error updating request status:", err);
      toast.error("Failed to update status");
    }
  };

  const handleDeleteService = async (serviceId) => {
    if (!window.confirm("Are you sure you want to delete this service?")) return;
    try {
      await deleteDoc(doc(db, "provider_services", serviceId));
      setServices((prev) => prev.filter((s) => s.id !== serviceId));
      toast.success("Service deleted");
    } catch (err) {
      console.error("Error deleting service:", err);
      toast.error("Failed to delete service");
    }
  };

  const handleLogout = () => {
    auth.signOut();
    navigate("/");
  };

  // --- Views ---

  const DashboardView = () => (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: "Total Services", value: services.length, icon: <PackageCheck className="w-5 h-5 text-cyan-500" /> },
          { label: "Pending Requests", value: requests.filter(r => r.status === "Pending").length, icon: <Clock className="w-5 h-5 text-purple-500" /> },
          { label: "Completed Jobs", value: requests.filter(r => r.status === "Completed").length, icon: <CheckCircle className="w-5 h-5 text-green-500" /> },
          { label: "Total Earnings", value: `₹${requests.filter(r => r.status === "Completed").reduce((acc, curr) => acc + (parseInt(curr.price) || 0), 0)}`, icon: <User className="w-5 h-5 text-blue-500" /> },
          { label: "Average Rating", value: averageRating, icon: <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" /> },
        ].map((stat, i) => (
          <Card key={i} className="p-6 flex items-center justify-between border-border/50 bg-card/50 hover:border-cyan-500/30 transition-colors">
            <div>
              <p className="text-sm text-muted-foreground font-medium uppercase tracking-wide">{stat.label}</p>
              <h3 className="text-3xl font-bold text-foreground mt-2">{stat.value}</h3>
            </div>
            <div className="p-4 bg-secondary/50 rounded-2xl">{stat.icon}</div>
          </Card>
        ))}
      </div>

      {/* Map View */}
      <Card className="p-0 overflow-hidden h-[500px] relative border border-border">
        <div className="absolute top-4 left-4 z-[400] bg-background/90 backdrop-blur px-4 py-2 rounded-lg shadow-sm border border-border">
          <h3 className="font-bold flex items-center gap-2">
            <MapPin className="w-4 h-4 text-primary" /> Live Orders Map
          </h3>
        </div>
        <MapContainer
          center={[23.0225, 72.5714]} // Default center (Ahmedabad)
          zoom={12}
          style={{ height: "100%", width: "100%" }}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />
          {requests.map((req) => (
            req.coordinates && (
              <Marker key={req.id} position={req.coordinates}>
                <Popup>
                  <div className="p-2 min-w-[200px]">
                    <h4 className="font-bold text-sm">{req.serviceName}</h4>
                    <p className="text-xs text-muted-foreground">{req.userEmail}</p>
                    <div className={`text-xs font-bold mt-1 px-2 py-0.5 rounded-full inline-block ${req.status === "Pending" ? "bg-yellow-100 text-yellow-700" :
                      req.status === "Accepted" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-700"
                      }`}>
                      {req.status}
                    </div>
                    {req.status === "Pending" && (
                      <button
                        onClick={() => navigate(`/order/${req.id}`)}
                        className="mt-2 text-xs text-primary underline"
                      >
                        View Details
                      </button>
                    )}
                  </div>
                </Popup>
              </Marker>
            )
          ))}
        </MapContainer>
      </Card>
    </div>
  );

  const RequestsView = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Incoming Requests</h2>
      {requests.length === 0 ? (
        <div className="text-center py-20 text-muted-foreground">No requests yet.</div>
      ) : (
        <div className="grid gap-4">
          {requests.map((req) => (
            <Card key={req.id} className="p-6 flex flex-col md:flex-row gap-6 items-start md:items-center justify-between">
              <div className="flex-1 space-y-2">
                <div className="flex items-center gap-3">
                  <h3 className="font-bold text-lg">{req.serviceName}</h3>
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider ${req.status === "Pending" ? "bg-cyan-500/10 text-cyan-500 border border-cyan-500/20" :
                    req.status === "Accepted" ? "bg-green-500/10 text-green-500" :
                      req.status === "Rejected" ? "bg-red-500/10 text-red-500" :
                        "bg-blue-500/10 text-blue-500"
                    }`}>
                    {req.status}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-1 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4" /> {req.userEmail}
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    {req.date ? new Date(req.date).toLocaleDateString() : "Date N/A"} at {req.timeSlot || "Time N/A"}
                  </div>
                  <div className="flex items-center gap-2 col-span-full">
                    <MapPin className="w-4 h-4" /> {req.address || "Address not provided"}
                  </div>
                </div>

                {req.description && (
                  <div className="mt-2 p-3 bg-secondary/50 rounded-lg text-sm italic text-muted-foreground">
                    "{req.description}"
                  </div>
                )}
              </div>

              <div className="flex gap-3 w-full md:w-auto">
                {req.status === "Pending" && (
                  <>
                    <MagneticButton
                      onClick={() => handleStatusUpdate(req.id, "Accepted")}
                      className="flex-1 md:flex-none px-6 py-2 bg-green-600 text-white font-bold rounded-lg hover:bg-green-700 shadow-sm"
                    >
                      Accept
                    </MagneticButton>
                    <MagneticButton
                      onClick={() => handleStatusUpdate(req.id, "Rejected")}
                      className="flex-1 md:flex-none px-6 py-2 bg-red-500 text-white font-bold rounded-lg hover:bg-red-600 shadow-sm"
                    >
                      Reject
                    </MagneticButton>
                  </>
                )}
                {(req.status !== "Pending" && req.status !== "Rejected") && (
                  <MagneticButton
                    onClick={() => navigate(`/order/${req.id}`)}
                    className="flex-1 md:flex-none px-6 py-2 bg-foreground text-background dark:bg-cyan-500 dark:text-black font-bold rounded-lg hover:shadow-[0_0_15px_rgba(34,211,238,0.4)] shadow-sm transition-all"
                  >
                    Open Order Portal
                  </MagneticButton>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );

  const ServicesView = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">My Services</h2>
        <MagneticButton
          onClick={() => navigate("/add-service")}
          className="px-6 py-2 bg-primary text-primary-foreground font-bold rounded-lg hover:bg-primary/90 shadow-sm"
        >
          + Add Service
        </MagneticButton>
      </div>

      {services.length === 0 ? (
        <div className="text-center py-20 text-muted-foreground">No services added yet.</div>
      ) : (
        <div className="grid md:grid-cols-2 gap-6">
          {services.map((service) => (
            <Card key={service.id} className="p-5 flex flex-col gap-4">
              <div className="flex gap-4">
                {service.imageUrls && service.imageUrls[0] && (
                  <img src={service.imageUrls[0]} alt={service.name} className="w-24 h-24 object-cover rounded-lg bg-secondary" />
                )}
                <div className="flex-1">
                  <h3 className="font-bold text-lg">{service.name}</h3>
                  <p className="text-primary font-bold">₹{service.price}</p>
                  <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{service.description}</p>
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-2 border-t border-border">
                <button
                  onClick={() => handleDeleteService(service.id)}
                  className="text-red-500 hover:text-red-600 text-sm font-medium flex items-center gap-1"
                >
                  <Trash2 className="w-4 h-4" /> Delete
                </button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-background"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;

  return (
    <div className="min-h-screen bg-background text-foreground font-sans flex">
      {/* Sidebar */}
      <aside className="w-64 border-r border-border bg-card hidden md:flex flex-col fixed h-full z-20">
        <div className="p-6 border-b border-border/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-cyan-500 text-black rounded-xl flex items-center justify-center font-bold text-xl shadow-[0_0_15px_rgba(34,211,238,0.4)]">P</div>
            <span className="font-bold text-lg tracking-wide">Provider Panel</span>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          <button
            onClick={() => setActiveTab("dashboard")}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${activeTab === "dashboard" ? "bg-cyan-500 text-black shadow-[0_0_15px_rgba(34,211,238,0.3)]" : "text-muted-foreground hover:bg-secondary hover:text-foreground"}`}
          >
            <LayoutDashboard className="w-5 h-5" /> Dashboard
          </button>
          <button
            onClick={() => setActiveTab("requests")}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${activeTab === "requests" ? "bg-cyan-500 text-black shadow-[0_0_15px_rgba(34,211,238,0.3)]" : "text-muted-foreground hover:bg-secondary hover:text-foreground"}`}
          >
            <Mail className="w-5 h-5" /> Requests
            {requests.filter(r => r.status === "Pending").length > 0 && (
              <span className="ml-auto bg-cyan-600 text-black text-[10px] font-black px-2 py-0.5 rounded-full">
                {requests.filter(r => r.status === "Pending").length}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab("services")}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${activeTab === "services" ? "bg-cyan-500 text-black shadow-[0_0_15px_rgba(34,211,238,0.3)]" : "text-muted-foreground hover:bg-secondary hover:text-foreground"}`}
          >
            <List className="w-5 h-5" /> My Services
          </button>
        </nav>

        <div className="p-4 border-t border-border">
          <div className="flex items-center gap-3 mb-4 px-2">
            <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center">
              <User className="w-4 h-4" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold truncate">{providerProfile?.fullName || "Provider"}</p>
              <p className="text-xs text-muted-foreground truncate">{provider?.email}</p>
            </div>
          </div>
          <button onClick={handleLogout} className="w-full flex items-center gap-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 px-4 py-2 rounded-lg text-sm font-medium transition-colors">
            <LogOut className="w-4 h-4" /> Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 md:ml-64 p-6 md:p-10 overflow-y-auto">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {activeTab === "dashboard" && <DashboardView />}
          {activeTab === "requests" && <RequestsView />}
          {activeTab === "services" && <ServicesView />}
        </motion.div>
      </main>
    </div>
  );
};

export default ProviderAdmin;
