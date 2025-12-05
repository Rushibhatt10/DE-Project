import React, { useEffect, useState } from "react";
import { db, auth } from "../firebase";
import {
  collection,
  query,
  where,
  onSnapshot,
  doc,
  getDoc,
  setDoc,
  addDoc,
  serverTimestamp,
  getDocs,
  updateDoc
} from "firebase/firestore";
import { useAuth } from "../context/AuthContext";
import { motion, AnimatePresence } from "framer-motion";
import {
  User,
  ShoppingBag,
  MapPin,
  LogOut,
  Edit2,
  Save,
  X,
  ChevronRight,
  Star,
  Clock,
  CheckCircle,
  XCircle,
  Calendar,
  Phone,
  Mail,
  Briefcase
} from "lucide-react";
import { signOut } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";

const AccountSection = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("profile");
  const [loading, setLoading] = useState(true);

  // Profile State
  const [profileData, setProfileData] = useState({
    name: "",
    email: "",
    phone: "",
    gender: "",
    dob: "",
    age: "",
  });
  const [isEditingProfile, setIsEditingProfile] = useState(false);

  // Provider State
  const [isProvider, setIsProvider] = useState(false);
  const [providerData, setProviderData] = useState(null);

  // Orders State
  const [requests, setRequests] = useState([]);
  const [feedbacks, setFeedbacks] = useState({});

  // Addresses State
  const [addresses, setAddresses] = useState([]);
  const [newAddress, setNewAddress] = useState("");
  const [isAddingAddress, setIsAddingAddress] = useState(false);

  // Fetch User Data
  useEffect(() => {
    if (!currentUser?.uid) return;

    const fetchUserData = async () => {
      try {
        const userDocRef = doc(db, "users", currentUser.uid);
        const userSnap = await getDoc(userDocRef);

        if (userSnap.exists()) {
          const data = userSnap.data();
          setProfileData({
            name: data.name || currentUser.displayName || "",
            email: currentUser.email || "",
            phone: data.phone || "",
            gender: data.gender || "",
            dob: data.dob || "",
            age: calculateAge(data.dob) || "",
          });
          setAddresses(data.addresses || []);
        } else {
          // Initialize user doc if not exists
          setProfileData(prev => ({ ...prev, email: currentUser.email }));
        }

        // Check if provider
        const providerDocRef = doc(db, "verified_providers", currentUser.uid);
        const providerSnap = await getDoc(providerDocRef);
        if (providerSnap.exists()) {
          setIsProvider(true);
          setProviderData(providerSnap.data());
        }

      } catch (error) {
        console.error("Error fetching user data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [currentUser]);

  // Fetch Orders
  useEffect(() => {
    if (!currentUser?.uid) return;

    const q = query(
      collection(db, "user_requests"),
      where("userId", "==", currentUser.uid)
    );

    const unsubscribe = onSnapshot(q, async (snapshot) => {
      const data = await Promise.all(
        snapshot.docs.map(async (docSnap) => {
          const request = docSnap.data();

          // Fetch Service Name
          let serviceName = "Unknown Service";
          if (request.serviceId) {
            const serviceSnap = await getDoc(doc(db, "provider_services", request.serviceId));
            if (serviceSnap.exists()) serviceName = serviceSnap.data().name;
          }

          // Fetch Provider Name
          let providerName = "Unknown Provider";
          if (request.providerUid) {
            const providerSnap = await getDoc(doc(db, "verified_providers", request.providerUid));
            if (providerSnap.exists()) providerName = providerSnap.data().name;
          }

          return {
            id: docSnap.id,
            ...request,
            serviceName,
            providerName,
            timestamp: request.timestamp?.toDate() || null,
          };
        })
      );

      // Sort by newest
      setRequests(data.sort((a, b) => b.timestamp - a.timestamp));
    });

    return () => unsubscribe();
  }, [currentUser]);

  // Fetch Feedbacks
  useEffect(() => {
    const fetchFeedbacks = async () => {
      if (!currentUser?.uid) return;
      const q = query(collection(db, "ratings"), where("userId", "==", currentUser.uid));
      const snapshot = await getDocs(q);

      const fbMap = {};
      snapshot.forEach((doc) => {
        const data = doc.data();
        fbMap[data.requestId] = {
          feedback: data.feedback,
          rating: data.rating,
        };
      });
      setFeedbacks(fbMap);
    };

    fetchFeedbacks();
  }, [currentUser]);

  const calculateAge = (dob) => {
    if (!dob) return "";
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    try {
      const userDocRef = doc(db, "users", currentUser.uid);
      await setDoc(userDocRef, {
        ...profileData,
        addresses // Keep existing addresses
      }, { merge: true });

      setProfileData(prev => ({ ...prev, age: calculateAge(profileData.dob) }));
      setIsEditingProfile(false);
      toast.success("Profile updated successfully!");
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("Failed to update profile.");
    }
  };

  const handleAddAddress = async (e) => {
    e.preventDefault();
    if (!newAddress.trim()) return;

    try {
      const updatedAddresses = [...addresses, newAddress];
      const userDocRef = doc(db, "users", currentUser.uid);
      await updateDoc(userDocRef, {
        addresses: updatedAddresses
      });

      setAddresses(updatedAddresses);
      setNewAddress("");
      setIsAddingAddress(false);
      toast.success("Address added!");
    } catch (error) {
      console.error("Error adding address:", error);
      toast.error("Failed to add address.");
    }
  };

  const submitFeedback = async (e, requestId) => {
    e.preventDefault();
    const feedback = e.target.elements[`feedback-${requestId}`].value.trim();
    const rating = e.target.elements[`rating-${requestId}`].value;
    if (!feedback || !rating) return;

    try {
      await addDoc(collection(db, "ratings"), {
        requestId,
        feedback,
        rating: parseInt(rating),
        userId: currentUser.uid,
        timestamp: serverTimestamp(),
      });

      setFeedbacks((prev) => ({
        ...prev,
        [requestId]: { feedback, rating },
      }));

      e.target.reset();
      toast.success("Feedback submitted!");
    } catch (error) {
      console.error("Error submitting feedback:", error);
      toast.error("Failed to submit feedback.");
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate("/signin");
      toast.success("Logged out successfully");
    } catch (error) {
      console.error("Logout Error:", error);
    }
  };

  const tabs = [
    { id: "profile", label: "Profile", icon: User },
    { id: "orders", label: "My Orders", icon: ShoppingBag },
    { id: "addresses", label: "Addresses", icon: MapPin },
  ];

  if (isProvider) {
    tabs.push({ id: "provider", label: "Provider Profile", icon: Briefcase });
  }

  return (
    <div className="min-h-screen bg-background text-foreground font-sans">
      <div className="max-w-6xl mx-auto px-6 py-10">
        <div className="flex flex-col md:flex-row gap-8">

          {/* Sidebar Navigation */}
          <div className="w-full md:w-64 flex-shrink-0">
            <div className="bg-card border border-border rounded-2xl p-6 sticky top-24">
              <div className="flex items-center gap-4 mb-8">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xl">
                  {profileData.name ? profileData.name[0].toUpperCase() : "U"}
                </div>
                <div className="overflow-hidden">
                  <h2 className="font-bold text-lg truncate">{profileData.name || "User"}</h2>
                  <p className="text-xs text-muted-foreground truncate">{profileData.email}</p>
                  {isProvider && <span className="text-[10px] bg-blue-500/10 text-blue-500 px-2 py-0.5 rounded-full font-bold">PROVIDER</span>}
                </div>
              </div>

              <nav className="space-y-2">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${activeTab === tab.id
                      ? "bg-primary text-primary-foreground shadow-md"
                      : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                      }`}
                  >
                    <tab.icon className="w-4 h-4" />
                    {tab.label}
                  </button>
                ))}
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-red-500 hover:bg-red-500/10 transition-all mt-4"
                >
                  <LogOut className="w-4 h-4" />
                  Logout
                </button>
              </nav>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="flex-1">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                {/* PROFILE TAB */}
                {activeTab === "profile" && (
                  <div className="bg-card border border-border rounded-2xl p-8 shadow-sm">
                    <div className="flex justify-between items-center mb-6">
                      <h2 className="text-2xl font-bold">Personal Information</h2>
                      <button
                        onClick={() => setIsEditingProfile(!isEditingProfile)}
                        className="flex items-center gap-2 text-sm font-medium text-primary hover:underline"
                      >
                        {isEditingProfile ? (
                          <>Cancel</>
                        ) : (
                          <><Edit2 className="w-4 h-4" /> Edit</>
                        )}
                      </button>
                    </div>

                    <form onSubmit={handleProfileUpdate} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-muted-foreground">Full Name</label>
                        <input
                          type="text"
                          disabled={!isEditingProfile}
                          value={profileData.name}
                          onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                          className="w-full px-4 py-2.5 rounded-xl bg-secondary/50 border border-border focus:border-primary outline-none transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-muted-foreground">Phone Number</label>
                        <input
                          type="tel"
                          disabled={!isEditingProfile}
                          value={profileData.phone}
                          onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                          className="w-full px-4 py-2.5 rounded-xl bg-secondary/50 border border-border focus:border-primary outline-none transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-muted-foreground">Gender</label>
                        <select
                          disabled={!isEditingProfile}
                          value={profileData.gender}
                          onChange={(e) => setProfileData({ ...profileData, gender: e.target.value })}
                          className="w-full px-4 py-2.5 rounded-xl bg-secondary/50 border border-border focus:border-primary outline-none transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                        >
                          <option value="">Select Gender</option>
                          <option value="Male">Male</option>
                          <option value="Female">Female</option>
                          <option value="Other">Other</option>
                        </select>
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-muted-foreground">Date of Birth</label>
                        <input
                          type="date"
                          disabled={!isEditingProfile}
                          value={profileData.dob}
                          onChange={(e) => setProfileData({ ...profileData, dob: e.target.value })}
                          className="w-full px-4 py-2.5 rounded-xl bg-secondary/50 border border-border focus:border-primary outline-none transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-muted-foreground">Age</label>
                        <input
                          type="text"
                          disabled
                          value={profileData.age}
                          className="w-full px-4 py-2.5 rounded-xl bg-secondary/30 border border-border outline-none opacity-60 cursor-not-allowed"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-muted-foreground">Email</label>
                        <input
                          type="email"
                          disabled
                          value={profileData.email}
                          className="w-full px-4 py-2.5 rounded-xl bg-secondary/30 border border-border outline-none opacity-60 cursor-not-allowed"
                        />
                      </div>

                      {isEditingProfile && (
                        <div className="md:col-span-2 flex justify-end mt-4">
                          <button
                            type="submit"
                            className="flex items-center gap-2 px-6 py-2.5 bg-primary text-primary-foreground rounded-xl font-medium shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all"
                          >
                            <Save className="w-4 h-4" /> Save Changes
                          </button>
                        </div>
                      )}
                    </form>
                  </div>
                )}

                {/* ORDERS TAB */}
                {activeTab === "orders" && (
                  <div className="space-y-6">
                    <h2 className="text-2xl font-bold mb-6">Order History</h2>
                    {requests.length === 0 ? (
                      <div className="text-center py-20 bg-card border border-border rounded-2xl">
                        <ShoppingBag className="w-12 h-12 mx-auto text-muted-foreground mb-4 opacity-20" />
                        <p className="text-lg font-medium">No orders yet</p>
                        <p className="text-sm text-muted-foreground">Book your first service today!</p>
                      </div>
                    ) : (
                      requests.map((req) => (
                        <div
                          key={req.id}
                          className="bg-card border border-border rounded-2xl p-6 shadow-sm hover:shadow-md transition-all"
                        >
                          <div className="flex flex-col md:flex-row justify-between gap-4 mb-4">
                            <div>
                              <div className="flex items-center gap-3 mb-1">
                                <h3 className="text-lg font-bold text-foreground">{req.serviceName}</h3>
                                <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${req.status === "Completed" ? "bg-green-500/10 text-green-500" :
                                  req.status === "Cancelled" ? "bg-red-500/10 text-red-500" :
                                    "bg-yellow-500/10 text-yellow-500"
                                  }`}>
                                  {req.status}
                                </span>
                              </div>
                              <p className="text-sm text-muted-foreground flex items-center gap-1">
                                <User className="w-3 h-3" /> {req.providerName}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="text-sm font-medium text-foreground flex items-center gap-1 justify-end">
                                <Calendar className="w-3.5 h-3.5 text-muted-foreground" />
                                {req.timestamp?.toLocaleDateString()}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {req.timestamp?.toLocaleTimeString()}
                              </p>
                            </div>
                          </div>

                          {/* Feedback Section */}
                          {req.status === "Completed" && (
                            <div className="mt-4 pt-4 border-t border-border">
                              {!feedbacks[req.id] ? (
                                <form onSubmit={(e) => submitFeedback(e, req.id)} className="space-y-3">
                                  <p className="text-sm font-medium text-foreground">Rate your experience</p>
                                  <div className="flex gap-4">
                                    <select
                                      name={`rating-${req.id}`}
                                      className="px-3 py-2 rounded-lg bg-secondary/50 border border-border text-sm outline-none"
                                    >
                                      <option value="5">⭐⭐⭐⭐⭐ (Excellent)</option>
                                      <option value="4">⭐⭐⭐⭐ (Good)</option>
                                      <option value="3">⭐⭐⭐ (Average)</option>
                                      <option value="2">⭐⭐ (Poor)</option>
                                      <option value="1">⭐ (Terrible)</option>
                                    </select>
                                    <input
                                      name={`feedback-${req.id}`}
                                      placeholder="Write a review..."
                                      className="flex-1 px-3 py-2 rounded-lg bg-secondary/50 border border-border text-sm outline-none"
                                    />
                                    <button
                                      type="submit"
                                      className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90"
                                    >
                                      Submit
                                    </button>
                                  </div>
                                </form>
                              ) : (
                                <div className="bg-secondary/30 rounded-lg p-3 flex items-start gap-3">
                                  <div className="bg-yellow-500/10 p-2 rounded-full">
                                    <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                                  </div>
                                  <div>
                                    <p className="text-sm font-bold text-foreground">You rated: {feedbacks[req.id].rating}/5</p>
                                    <p className="text-sm text-muted-foreground">"{feedbacks[req.id].feedback}"</p>
                                  </div>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                )}

                {/* ADDRESSES TAB */}
                {activeTab === "addresses" && (
                  <div className="bg-card border border-border rounded-2xl p-8 shadow-sm">
                    <div className="flex justify-between items-center mb-6">
                      <h2 className="text-2xl font-bold">Saved Addresses</h2>
                      <button
                        onClick={() => setIsAddingAddress(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-all"
                      >
                        <MapPin className="w-4 h-4" /> Add New
                      </button>
                    </div>

                    {isAddingAddress && (
                      <form onSubmit={handleAddAddress} className="mb-8 bg-secondary/30 p-4 rounded-xl border border-border">
                        <label className="text-sm font-medium text-muted-foreground mb-2 block">New Address</label>
                        <div className="flex gap-3">
                          <input
                            type="text"
                            value={newAddress}
                            onChange={(e) => setNewAddress(e.target.value)}
                            placeholder="Enter full address (e.g., Flat 101, Galaxy Apts, Main Road...)"
                            className="flex-1 px-4 py-2.5 rounded-xl bg-background border border-border focus:border-primary outline-none"
                          />
                          <button
                            type="submit"
                            className="px-6 py-2.5 bg-primary text-primary-foreground rounded-xl font-medium hover:bg-primary/90"
                          >
                            Save
                          </button>
                          <button
                            type="button"
                            onClick={() => setIsAddingAddress(false)}
                            className="px-4 py-2.5 bg-secondary text-foreground rounded-xl font-medium hover:bg-secondary/80"
                          >
                            Cancel
                          </button>
                        </div>
                      </form>
                    )}

                    <div className="grid gap-4">
                      {addresses.length === 0 ? (
                        <p className="text-muted-foreground text-center py-8">No addresses saved yet.</p>
                      ) : (
                        addresses.map((addr, idx) => (
                          <div key={idx} className="flex items-start gap-4 p-4 rounded-xl bg-secondary/20 border border-border hover:border-primary/50 transition-colors">
                            <MapPin className="w-5 h-5 text-primary mt-0.5" />
                            <p className="text-foreground">{addr}</p>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}

                {/* PROVIDER PROFILE TAB */}
                {activeTab === "provider" && isProvider && providerData && (
                  <div className="bg-card border border-border rounded-2xl p-8 shadow-sm">
                    <h2 className="text-2xl font-bold mb-6">Provider Profile</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-muted-foreground">Service Category</label>
                        <div className="w-full px-4 py-3 rounded-xl bg-secondary/30 border border-border">
                          {providerData.serviceCategory || "N/A"}
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-muted-foreground">Experience</label>
                        <div className="w-full px-4 py-3 rounded-xl bg-secondary/30 border border-border">
                          {providerData.experience || "N/A"} Years
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-muted-foreground">Service Area Radius</label>
                        <div className="w-full px-4 py-3 rounded-xl bg-secondary/30 border border-border">
                          5 KM
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-muted-foreground">Verification Status</label>
                        <div className="w-full px-4 py-3 rounded-xl bg-green-500/10 border border-green-500/20 text-green-500 font-bold flex items-center gap-2">
                          <CheckCircle className="w-4 h-4" /> Verified Professional
                        </div>
                      </div>
                    </div>

                    <div className="mt-8 flex justify-end">
                      <button
                        onClick={() => navigate("/provider-admin")}
                        className="px-6 py-2.5 bg-primary text-primary-foreground rounded-xl font-bold hover:bg-primary/90 transition-all"
                      >
                        Go to Provider Dashboard
                      </button>
                    </div>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AccountSection;
