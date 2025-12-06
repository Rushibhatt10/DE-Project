import React, { useEffect, useState } from "react";
import {
  collection,
  getDocs,
  doc,
  getDoc,
  updateDoc,
  serverTimestamp
} from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from "../firebase";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  Users,
  Briefcase,
  ClipboardList,
  MessageSquare,
  Settings,
  LogOut,
  Search,
  Bell,
  Menu,
  X,
  TrendingUp,
  Activity,
  AlertCircle,
  CheckCircle2,
  Clock,
  Star,
  ChevronRight,
  Filter,
  ShieldCheck,
  Eye,
  Banknote,
  Download
} from "lucide-react";
import { toast } from "react-hot-toast";

const PASSWORD = "Rushzzz@10";

// --- Components ---

const SidebarItem = ({ icon: Icon, label, active, onClick }) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${active
      ? "bg-white text-black font-bold shadow-lg"
      : "text-gray-400 hover:bg-white/10 hover:text-white"
      }`}
  >
    <Icon className={`w-5 h-5 ${active ? "text-black" : "group-hover:text-white"}`} />
    <span>{label}</span>
    {active && <ChevronRight className="w-4 h-4 ml-auto" />}
  </button>
);

const StatCard = ({ title, value, icon: Icon, trend, subtext }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="bg-[#111] border border-[#222] p-6 rounded-2xl hover:border-[#333] transition-colors group"
  >
    <div className="flex justify-between items-start mb-4">
      <div className="p-3 bg-[#1a1a1a] rounded-xl group-hover:bg-[#222] transition-colors">
        <Icon className="w-6 h-6 text-white" />
      </div>
      {trend && (
        <span className={`text-xs font-medium px-2 py-1 rounded-full ${trend > 0 ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
          {trend > 0 ? '+' : ''}{trend}%
        </span>
      )}
    </div>
    <h3 className="text-3xl font-bold text-white mb-1">{value}</h3>
    <p className="text-gray-400 text-sm">{title}</p>
    {subtext && <p className="text-xs text-gray-500 mt-2">{subtext}</p>}
  </motion.div>
);

const ActivityItem = ({ type, title, subtitle, time }) => {
  const getIcon = () => {
    switch (type) {
      case 'user': return <Users className="w-4 h-4 text-blue-400" />;
      case 'provider': return <Briefcase className="w-4 h-4 text-purple-400" />;
      case 'service': return <ClipboardList className="w-4 h-4 text-green-400" />;
      case 'request': return <Activity className="w-4 h-4 text-orange-400" />;
      case 'verification': return <ShieldCheck className="w-4 h-4 text-yellow-400" />;
      default: return <Star className="w-4 h-4 text-yellow-400" />;
    }
  };

  return (
    <div className="flex items-start gap-4 p-4 hover:bg-[#1a1a1a] rounded-xl transition-colors border-b border-[#222] last:border-0">
      <div className="mt-1 p-2 bg-[#222] rounded-full">
        {getIcon()}
      </div>
      <div className="flex-1">
        <h4 className="text-sm font-bold text-white">{title}</h4>
        <p className="text-xs text-gray-400 mt-0.5">{subtitle}</p>
      </div>
      <span className="text-xs text-gray-500 whitespace-nowrap">{time}</span>
    </div>
  );
};

const DataTable = ({ headers, data, renderRow }) => (
  <div className="overflow-x-auto">
    <table className="w-full text-left border-collapse">
      <thead>
        <tr className="border-b border-[#222]">
          {headers.map((h, i) => (
            <th key={i} className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider">
              {h}
            </th>
          ))}
        </tr>
      </thead>
      <tbody className="divide-y divide-[#222]">
        {data.length > 0 ? (
          data.map((item, i) => renderRow(item, i))
        ) : (
          <tr>
            <td colSpan={headers.length} className="p-8 text-center text-gray-500">
              No data available
            </td>
          </tr>
        )}
      </tbody>
    </table>
  </div>
);

// --- Modal Component ---
const VerificationModal = ({ provider, onClose, onApprove, onReject }) => {
  const [isRejecting, setIsRejecting] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");

  if (!provider) return null;

  const handleRejectSubmit = () => {
    if (!rejectionReason.trim()) {
      toast.error("Please provide a reason for rejection");
      return;
    }
    onReject(provider.id, rejectionReason);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-[#0a0a0a] border border-[#333] rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl"
      >
        {/* Header */}
        <div className="p-6 border-b border-[#222] flex justify-between items-center bg-[#111]">
          <div>
            <h2 className="text-xl font-bold flex items-center gap-2 text-white">
              <ShieldCheck className="w-6 h-6 text-yellow-500" />
              Verification Request
            </h2>
            <p className="text-sm text-gray-400 mt-1">Review provider details and document</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-[#222] rounded-full transition-colors text-gray-400 hover:text-white"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-8 space-y-8">
          {/* Status Banner */}
          <div className="flex items-center gap-4 p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-xl">
            <AlertCircle className="w-6 h-6 text-yellow-500 shrink-0" />
            <div>
              <h4 className="font-bold text-yellow-500">Pending Verification</h4>
              <p className="text-sm text-yellow-200/70">This provider is waiting for your approval to start accepting services.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Left Column: Details */}
            <div className="space-y-6">
              <div>
                <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-3">Provider Details</h3>
                <div className="space-y-4">
                  <div className="bg-[#111] p-4 rounded-xl border border-[#222]">
                    <label className="text-xs text-gray-500 block mb-1">Full Name</label>
                    <p className="font-medium text-lg text-white">{provider.fullName}</p>
                  </div>
                  <div className="bg-[#111] p-4 rounded-xl border border-[#222]">
                    <label className="text-xs text-gray-500 block mb-1">Contact Information</label>
                    <p className="font-medium text-white">{provider.email}</p>
                    <p className="text-sm text-gray-400 mt-1">{provider.phone}</p>
                  </div>
                  <div className="bg-[#111] p-4 rounded-xl border border-[#222]">
                    <label className="text-xs text-gray-500 block mb-1">Professional Info</label>
                    <div className="flex justify-between items-center">
                      <span className="font-medium text-white">{provider.serviceType}</span>
                      <span className="text-xs bg-[#222] px-2 py-1 rounded text-gray-300">{provider.yearsOfExperience} Years Exp.</span>
                    </div>
                  </div>
                  <div className="bg-[#111] p-4 rounded-xl border border-[#222]">
                    <label className="text-xs text-gray-500 block mb-1">Location</label>
                    <p className="font-medium text-white">{provider.address}</p>
                    <p className="text-sm text-gray-400 mt-1">{provider.city} - {provider.pincode}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Document */}
            <div className="space-y-6">
              <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-3">Identity Proof</h3>
              <div className="bg-[#111] border border-[#222] rounded-xl overflow-hidden group relative">
                <div className="absolute top-4 left-4 bg-black/60 backdrop-blur px-3 py-1 rounded-full text-xs font-bold text-white border border-white/10 z-10">
                  {provider.govIdType}
                </div>
                <img
                  src={provider.idImageURL}
                  alt="ID Proof"
                  className="w-full h-auto object-contain min-h-[300px] bg-[#050505]"
                />
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <a
                    href={provider.idImageURL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-6 py-2 bg-white text-black font-bold rounded-full hover:scale-105 transition-transform"
                  >
                    View Full Size
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Rejection Reason Input */}
          <AnimatePresence>
            {isRejecting && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <div className="bg-red-500/5 border border-red-500/20 rounded-xl p-6">
                  <label className="block text-sm font-bold text-red-400 mb-2">Reason for Rejection</label>
                  <textarea
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    placeholder="Please explain why this verification is being rejected..."
                    className="w-full bg-[#0a0a0a] border border-red-500/20 rounded-lg p-4 text-white focus:outline-none focus:border-red-500/50 min-h-[100px]"
                  />
                  <div className="flex gap-3 mt-4 justify-end">
                    <button
                      onClick={() => setIsRejecting(false)}
                      className="px-4 py-2 text-gray-400 hover:text-white text-sm font-medium"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleRejectSubmit}
                      className="px-6 py-2 bg-red-500 text-white font-bold rounded-lg hover:bg-red-600 transition-colors shadow-lg shadow-red-500/20"
                    >
                      Confirm Rejection
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Footer Actions */}
        {!isRejecting && (
          <div className="p-6 border-t border-[#222] bg-[#111] flex gap-4 justify-end">
            <button
              onClick={() => setIsRejecting(true)}
              className="px-6 py-3 bg-[#222] text-red-400 font-bold rounded-xl hover:bg-red-500/10 hover:text-red-500 transition-all border border-transparent hover:border-red-500/20"
            >
              Reject Request
            </button>
            <button
              onClick={() => onApprove(provider.id)}
              className="px-8 py-3 bg-white text-black font-bold rounded-xl hover:bg-gray-200 transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 flex items-center gap-2"
            >
              <CheckCircle2 className="w-5 h-5" />
              Approve Provider
            </button>
          </div>
        )}
      </motion.div>
    </div>
  );
};

const MainAdminPanel = () => {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [loading, setLoading] = useState(true);

  // Data State
  const [stats, setStats] = useState({
    users: 0,
    providers: 0,
    services: 0,
    requests: 0,
    pendingRequests: 0,
    completedRequests: 0,
    avgRating: 0,
    pendingVerifications: 0,
    totalRevenue: 0,
    platformRevenue: 0,
    gstCollected: 0
  });
  const [invoices, setInvoices] = useState([]);
  const [users, setUsers] = useState([]);
  const [providers, setProviders] = useState([]);
  const [verificationRequests, setVerificationRequests] = useState([]);
  const [services, setServices] = useState([]);
  const [requests, setRequests] = useState([]);
  const [recentActivity, setRecentActivity] = useState([]);

  // Modal State
  const [selectedVerification, setSelectedVerification] = useState(null);

  // Auth State
  const [accessGranted, setAccessGranted] = useState(false);
  const [enteredPassword, setEnteredPassword] = useState("");

  useEffect(() => {
    if (accessGranted) {
      const unsubscribe = onAuthStateChanged(auth, (user) => {
        if (user) {
          fetchData();
        } else {
          toast.error("Database access requires authentication. Please log in.");
          setLoading(false);
        }
      });
      return () => unsubscribe();
    }
  }, [accessGranted]);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch all collections in parallel using allSettled to prevent total failure
      const results = await Promise.allSettled([
        getDocs(collection(db, "users")),
        getDocs(collection(db, "provider_services")),
        getDocs(collection(db, "user_requests")),
        getDocs(collection(db, "verified_providers")),
        getDocs(collection(db, "invoices")),
      ]);

      const [usersResult, servicesResult, requestsResult, verifiedResult, invoicesResult] = results;

      // Helper to get docs or empty array
      const getData = (result) =>
        result.status === 'fulfilled' ? result.value.docs.map(d => ({ id: d.id, ...d.data() })) : [];

      // Process Users
      const usersData = getData(usersResult).map(u => ({ ...u, role: 'user' }));

      // Process Providers (Verified)
      const allVerifications = getData(verifiedResult);
      const approvedProviders = allVerifications.filter(p => p.status === 'APPROVED');
      const pendingVerifications = allVerifications.filter(p => p.status === 'PENDING');

      // Process Services
      const servicesData = getData(servicesResult);

      // Process Requests
      const requestsData = getData(requestsResult);

      // Process Invoices
      const invoicesData = getData(invoicesResult);

      const totalRevenue = invoicesData.reduce((sum, inv) => sum + (inv.financials?.taxableAmount || 0), 0);
      const totalGst = invoicesData.reduce((sum, inv) => sum + (inv.financials?.totalGstAmount || 0), 0);
      const platformEarned = invoicesData.reduce((sum, inv) => sum + (inv.financials?.platformCommission || 0), 0);

      // Log errors if any
      if (usersResult.status === 'rejected') console.error("Error fetching users:", usersResult.reason);
      if (servicesResult.status === 'rejected') console.error("Error fetching services:", servicesResult.reason);
      if (requestsResult.status === 'rejected') console.error("Error fetching requests:", requestsResult.reason);
      if (verifiedResult.status === 'rejected') console.error("Error fetching verifications:", verifiedResult.reason);

      // Calculate Stats
      const pendingReqs = requestsData.filter(r => r.status === 'Pending').length;
      const completedReqs = requestsData.filter(r => r.status === 'Completed').length;
      const avgRating = 4.8;

      setStats({
        users: usersData.length,
        providers: approvedProviders.length,
        services: servicesData.length,
        requests: requestsData.length,
        pendingRequests: pendingReqs,
        completedRequests: completedReqs,
        avgRating,
        pendingVerifications: pendingVerifications.length,
        totalRevenue,
        gstCollected: totalGst,
        platformRevenue: platformEarned
      });

      setInvoices(invoicesData);
      setUsers(usersData);
      setProviders(approvedProviders);
      setVerificationRequests(pendingVerifications);
      setServices(servicesData);
      setRequests(requestsData);

      // Generate Activity Feed
      const activity = [
        ...usersData.map(u => ({ type: 'user', title: 'New User Joined', subtitle: u.name, time: 'Recently', timestamp: u.createdAt || Date.now() })),
        ...approvedProviders.map(p => ({ type: 'provider', title: 'New Provider Verified', subtitle: p.fullName, time: 'Recently', timestamp: p.verifiedAt || Date.now() })),
        ...pendingVerifications.map(p => ({ type: 'verification', title: 'Verification Request', subtitle: p.fullName, time: 'Pending', timestamp: p.createdAt || Date.now() })),
        ...requestsData.map(r => ({ type: 'request', title: 'New Service Request', subtitle: r.serviceName, time: 'Recently', timestamp: r.timestamp?.seconds * 1000 || Date.now() }))
      ].sort((a, b) => b.timestamp - a.timestamp).slice(0, 10);

      setRecentActivity(activity);

    } catch (error) {
      console.error("Error in fetchData:", error);
      toast.error("Failed to process data");
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = (e) => {
    e.preventDefault();
    if (enteredPassword === PASSWORD) setAccessGranted(true);
    else alert("Incorrect Password");
  };

  const handleApproveVerification = async (id) => {
    try {
      await updateDoc(doc(db, "verified_providers", id), {
        status: "APPROVED",
        verifiedAt: serverTimestamp()
      });
      toast.success("Provider Approved Successfully");
      setSelectedVerification(null);
      fetchData(); // Refresh data
    } catch (error) {
      console.error("Error approving provider:", error);
      toast.error("Failed to approve provider");
    }
  };

  const handleRejectVerification = async (id, reason) => {
    try {
      await updateDoc(doc(db, "verified_providers", id), {
        status: "REJECTED",
        rejectionReason: reason,
        verifiedAt: serverTimestamp()
      });
      toast.success("Provider Rejected");
      setSelectedVerification(null);
      fetchData(); // Refresh data
    } catch (error) {
      console.error("Error rejecting provider:", error);
      toast.error("Failed to reject provider");
    }
  };

  if (!accessGranted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black text-white font-sans">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-md p-8 bg-[#111] border border-[#222] rounded-2xl shadow-2xl"
        >
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4">
              <Settings className="w-8 h-8 text-black" />
            </div>
            <h1 className="text-2xl font-bold">Admin Portal</h1>
            <p className="text-gray-400 mt-2">Restricted Access Only</p>
          </div>
          <form onSubmit={handleLogin} className="space-y-4">
            <input
              type="password"
              value={enteredPassword}
              onChange={(e) => setEnteredPassword(e.target.value)}
              placeholder="Enter Access Key"
              className="w-full p-4 bg-[#0a0a0a] border border-[#333] rounded-xl text-white focus:border-white focus:outline-none transition-colors"
              autoFocus
            />
            <button type="submit" className="w-full py-4 bg-white text-black font-bold rounded-xl hover:bg-gray-200 transition-colors">
              Enter Dashboard
            </button>
          </form>
        </motion.div>
      </div>
    );
  }

  const renderContent = () => {
    if (loading) return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white"></div>
      </div>
    );

    switch (activeTab) {
      case "dashboard":
        return (
          <div className="space-y-8">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <StatCard title="Total Users" value={stats.users} icon={Users} trend={12} />
              <StatCard title="Total Providers" value={stats.providers} icon={Briefcase} trend={5} />
              <StatCard title="Pending Verifications" value={stats.pendingVerifications} icon={ShieldCheck} subtext="Action Required" />
              <StatCard title="Total Requests" value={stats.requests} icon={Activity} trend={24} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Main Chart Area */}
              <div className="lg:col-span-2 bg-[#111] border border-[#222] rounded-2xl p-6">
                <h3 className="text-xl font-bold mb-6">Platform Overview</h3>
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="p-4 bg-[#1a1a1a] rounded-xl border border-[#222]">
                    <p className="text-gray-400 text-sm mb-1">Pending Requests</p>
                    <p className="text-2xl font-bold text-yellow-500">{stats.pendingRequests}</p>
                  </div>
                  <div className="p-4 bg-[#1a1a1a] rounded-xl border border-[#222]">
                    <p className="text-gray-400 text-sm mb-1">Completed Requests</p>
                    <p className="text-2xl font-bold text-green-500">{stats.completedRequests}</p>
                  </div>
                </div>
                {/* Simple Bar Chart Visualization */}
                <div className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Service Completion Rate</span>
                      <span>85%</span>
                    </div>
                    <div className="h-2 bg-[#222] rounded-full overflow-hidden">
                      <div className="h-full bg-white w-[85%] rounded-full" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>User Satisfaction</span>
                      <span>92%</span>
                    </div>
                    <div className="h-2 bg-[#222] rounded-full overflow-hidden">
                      <div className="h-full bg-white w-[92%] rounded-full" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Recent Activity */}
              <div className="bg-[#111] border border-[#222] rounded-2xl p-6">
                <h3 className="text-xl font-bold mb-6">Recent Activity</h3>
                <div className="space-y-2">
                  {recentActivity.map((item, i) => (
                    <ActivityItem key={i} {...item} />
                  ))}
                </div>
              </div>
            </div>
          </div>
        );

      case "verifications":
        return (
          <div className="bg-[#111] border border-[#222] rounded-2xl overflow-hidden">
            <div className="p-6 border-b border-[#222] flex justify-between items-center">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <ShieldCheck className="w-6 h-6 text-yellow-500" />
                Pending Verifications
              </h2>
              <span className="bg-yellow-500/10 text-yellow-500 px-3 py-1 rounded-full text-sm font-bold">
                {verificationRequests.length} Pending
              </span>
            </div>
            <DataTable
              headers={["Name", "Service", "ID Type", "Submitted", "Actions"]}
              data={verificationRequests}
              renderRow={(p, i) => (
                <tr key={i} className="hover:bg-[#1a1a1a] transition-colors border-b border-[#222] last:border-0">
                  <td className="p-4">
                    <div className="font-medium">{p.fullName}</div>
                    <div className="text-xs text-gray-500">{p.phone}</div>
                  </td>
                  <td className="p-4 text-gray-400">{p.serviceType}</td>
                  <td className="p-4 text-gray-400">{p.govIdType}</td>
                  <td className="p-4 text-gray-500 text-sm">
                    {p.createdAt ? new Date(p.createdAt.seconds * 1000).toLocaleDateString() : "N/A"}
                  </td>
                  <td className="p-4">
                    <button
                      onClick={() => setSelectedVerification(p)}
                      className="flex items-center gap-2 px-3 py-1.5 bg-white text-black text-xs font-bold rounded-lg hover:bg-gray-200 transition-colors"
                    >
                      <Eye className="w-3 h-3" /> Review
                    </button>
                  </td>
                </tr>
              )}
            />
          </div>
        );

      case "users":
        return (
          <div className="bg-[#111] border border-[#222] rounded-2xl overflow-hidden">
            <div className="p-6 border-b border-[#222] flex justify-between items-center">
              <h2 className="text-xl font-bold">Registered Users</h2>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <input
                  type="text"
                  placeholder="Search users..."
                  className="pl-10 pr-4 py-2 bg-[#1a1a1a] border border-[#333] rounded-lg text-sm focus:outline-none focus:border-white transition-colors"
                />
              </div>
            </div>
            <DataTable
              headers={["Name", "Email", "Phone", "Joined"]}
              data={users}
              renderRow={(u, i) => (
                <tr key={i} className="hover:bg-[#1a1a1a] transition-colors border-b border-[#222] last:border-0">
                  <td className="p-4 font-medium">{u.name}</td>
                  <td className="p-4 text-gray-400">{u.email}</td>
                  <td className="p-4 text-gray-400">{u.phone || "N/A"}</td>
                  <td className="p-4 text-gray-500 text-sm">
                    {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : "N/A"}
                  </td>
                </tr>
              )}
            />
          </div>
        );

      case "providers":
        return (
          <div className="bg-[#111] border border-[#222] rounded-2xl overflow-hidden">
            <div className="p-6 border-b border-[#222] flex justify-between items-center">
              <h2 className="text-xl font-bold">Verified Providers</h2>
              <button className="px-4 py-2 bg-white text-black text-sm font-bold rounded-lg hover:bg-gray-200 transition-colors">
                Export List
              </button>
            </div>
            <DataTable
              headers={["Provider", "Service Type", "Contact", "Status"]}
              data={providers}
              renderRow={(p, i) => (
                <tr key={i} className="hover:bg-[#1a1a1a] transition-colors border-b border-[#222] last:border-0">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-[#222] flex items-center justify-center font-bold text-xs">
                        {p.fullName?.[0]}
                      </div>
                      <span className="font-medium">{p.fullName}</span>
                    </div>
                  </td>
                  <td className="p-4 text-gray-400">{p.serviceType}</td>
                  <td className="p-4 text-gray-400">
                    <div className="text-sm">{p.email}</div>
                    <div className="text-xs text-gray-500">{p.phone}</div>
                  </td>
                  <td className="p-4">
                    <span className="px-2 py-1 bg-green-500/10 text-green-500 text-xs font-bold rounded-full">
                      Verified
                    </span>
                  </td>
                </tr>
              )}
            />
          </div>
        );

      case "services":
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-[#111] p-6 rounded-2xl border border-[#222]">
                <h3 className="text-gray-400 text-sm mb-2">Total Services</h3>
                <p className="text-3xl font-bold">{services.length}</p>
              </div>
              <div className="bg-[#111] p-6 rounded-2xl border border-[#222]">
                <h3 className="text-gray-400 text-sm mb-2">Categories</h3>
                <p className="text-3xl font-bold">{[...new Set(services.map(s => s.category))].length}</p>
              </div>
              <div className="bg-[#111] p-6 rounded-2xl border border-[#222]">
                <h3 className="text-gray-400 text-sm mb-2">Avg Price</h3>
                <p className="text-3xl font-bold">₹{Math.round(services.reduce((acc, s) => acc + Number(s.price || 0), 0) / (services.length || 1))}</p>
              </div>
            </div>

            <div className="bg-[#111] border border-[#222] rounded-2xl overflow-hidden">
              <div className="p-6 border-b border-[#222]">
                <h2 className="text-xl font-bold">All Services</h2>
              </div>
              <DataTable
                headers={["Service Name", "Category", "Price", "Provider"]}
                data={services}
                renderRow={(s, i) => (
                  <tr key={i} className="hover:bg-[#1a1a1a] transition-colors border-b border-[#222] last:border-0">
                    <td className="p-4 font-medium">{s.name}</td>
                    <td className="p-4">
                      <span className="px-2 py-1 bg-[#222] text-gray-300 text-xs rounded-md">
                        {s.category}
                      </span>
                    </td>
                    <td className="p-4 font-bold text-white">₹{s.price}</td>
                    <td className="p-4 text-gray-400 text-sm">{s.providerEmail}</td>
                  </tr>
                )}
              />
            </div>
          </div>
        );

      case "requests":
        return (
          <div className="bg-[#111] border border-[#222] rounded-2xl overflow-hidden">
            <div className="p-6 border-b border-[#222] flex justify-between items-center">
              <h2 className="text-xl font-bold">Service Requests</h2>
              <div className="flex gap-2">
                <button className="px-3 py-1.5 bg-[#222] text-xs font-bold rounded-lg hover:bg-[#333] transition-colors">All</button>
                <button className="px-3 py-1.5 bg-[#1a1a1a] text-xs font-bold rounded-lg text-gray-400 hover:bg-[#222] transition-colors">Pending</button>
                <button className="px-3 py-1.5 bg-[#1a1a1a] text-xs font-bold rounded-lg text-gray-400 hover:bg-[#222] transition-colors">Completed</button>
              </div>
            </div>
            <DataTable
              headers={["Service", "User", "Provider", "Status", "Date"]}
              data={requests}
              renderRow={(r, i) => (
                <tr key={i} className="hover:bg-[#1a1a1a] transition-colors border-b border-[#222] last:border-0">
                  <td className="p-4 font-medium">{r.serviceName}</td>
                  <td className="p-4 text-gray-400">{r.userEmail}</td>
                  <td className="p-4 text-gray-400">{r.providerEmail}</td>
                  <td className="p-4">
                    <span className={`px-2 py-1 text-xs font-bold rounded-full ${r.status === 'Completed' ? 'bg-green-500/10 text-green-500' :
                      r.status === 'Pending' ? 'bg-yellow-500/10 text-yellow-500' :
                        'bg-gray-500/10 text-gray-500'
                      }`}>
                      {r.status}
                    </span>
                  </td>
                  <td className="p-4 text-gray-500 text-sm">
                    {r.timestamp?.seconds ? new Date(r.timestamp.seconds * 1000).toLocaleDateString() : "N/A"}
                  </td>
                </tr>
              )}
            />
          </div>
        );

      case "finance":
        return (
          <div className="space-y-6">
            {/* Finance Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-[#111] p-6 rounded-2xl border border-[#222]">
                <h3 className="text-gray-400 text-sm mb-2">Total Taxable Revenue</h3>
                <p className="text-3xl font-bold">₹{stats.totalRevenue.toFixed(2)}</p>
              </div>
              <div className="bg-[#111] p-6 rounded-2xl border border-[#222]">
                <h3 className="text-gray-400 text-sm mb-2">Total GST Collected</h3>
                <p className="text-3xl font-bold text-blue-400">₹{stats.gstCollected.toFixed(2)}</p>
              </div>
              <div className="bg-[#111] p-6 rounded-2xl border border-[#222]">
                <h3 className="text-gray-400 text-sm mb-2">Platform Earning</h3>
                <p className="text-3xl font-bold text-green-500">₹{stats.platformRevenue.toFixed(2)}</p>
              </div>
            </div>

            <div className="bg-[#111] border border-[#222] rounded-2xl overflow-hidden">
              <div className="p-6 border-b border-[#222] flex justify-between items-center">
                <h2 className="text-xl font-bold flex items-center gap-2">
                  <Banknote className="w-5 h-5 text-green-500" /> Revenue & Invoices
                </h2>
                <button className="px-4 py-2 bg-white text-black text-xs font-bold rounded-lg hover:bg-gray-200">
                  Download Report
                </button>
              </div>
              <DataTable
                headers={["Invoice No", "Date", "User", "Taxable", "GST", "Total", "Action"]}
                data={invoices}
                renderRow={(inv, i) => (
                  <tr key={i} className="hover:bg-[#1a1a1a] transition-colors border-b border-[#222] last:border-0">
                    <td className="p-4 font-mono font-bold text-gray-300">{inv.invoiceNumber}</td>
                    <td className="p-4 text-gray-400 text-sm">
                      {new Date(inv.invoiceDate).toLocaleDateString()}
                    </td>
                    <td className="p-4">
                      <div className="font-medium">{inv.userDetails?.name}</div>
                      <div className="text-xs text-gray-500">{inv.userDetails?.phone}</div>
                    </td>
                    <td className="p-4 font-mono">₹{inv.financials?.taxableAmount}</td>
                    <td className="p-4 font-mono text-xs text-gray-400">₹{inv.financials?.totalGstAmount}</td>
                    <td className="p-4 font-bold text-green-500">₹{inv.financials?.grandTotal}</td>
                    <td className="p-4">
                      <a
                        href={`/invoice/${inv.id}`}
                        target="_blank"
                        className="p-2 bg-[#222] hover:bg-white hover:text-black rounded-lg transition-colors inline-block"
                      >
                        <Eye className="w-4 h-4" />
                      </a>
                    </td>
                  </tr>
                )}
              />
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-black text-white font-sans flex overflow-hidden">
      {/* Sidebar */}
      <motion.aside
        initial={{ x: -20, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        className={`${isSidebarOpen ? "w-64" : "w-20"} bg-[#0a0a0a] border-r border-[#222] flex flex-col transition-all duration-300 z-20`}
      >
        <div className="p-6 flex items-center justify-between">
          {isSidebarOpen ? (
            <h1 className="text-xl font-bold tracking-tight">Admin<span className="text-gray-500">Panel</span></h1>
          ) : (
            <Settings className="w-6 h-6 mx-auto" />
          )}
          <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-1 hover:bg-[#222] rounded-lg hidden lg:block">
            {isSidebarOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>
        </div>

        <nav className="flex-1 px-4 space-y-2 py-4">
          <SidebarItem icon={LayoutDashboard} label={isSidebarOpen ? "Dashboard" : ""} active={activeTab === "dashboard"} onClick={() => setActiveTab("dashboard")} />
          <SidebarItem icon={ShieldCheck} label={isSidebarOpen ? "Verifications" : ""} active={activeTab === "verifications"} onClick={() => setActiveTab("verifications")} />
          <SidebarItem icon={Users} label={isSidebarOpen ? "Users" : ""} active={activeTab === "users"} onClick={() => setActiveTab("users")} />
          <SidebarItem icon={Briefcase} label={isSidebarOpen ? "Providers" : ""} active={activeTab === "providers"} onClick={() => setActiveTab("providers")} />
          <SidebarItem icon={ClipboardList} label={isSidebarOpen ? "Services" : ""} active={activeTab === "services"} onClick={() => setActiveTab("services")} />
          <SidebarItem icon={Activity} label={isSidebarOpen ? "Requests" : ""} active={activeTab === "requests"} onClick={() => setActiveTab("requests")} />
          <SidebarItem icon={Banknote} label={isSidebarOpen ? "Finance" : ""} active={activeTab === "finance"} onClick={() => setActiveTab("finance")} />
        </nav>

        <div className="p-4 border-t border-[#222]">
          <button
            onClick={() => setAccessGranted(false)}
            className="w-full flex items-center gap-3 px-4 py-3 text-red-500 hover:bg-red-500/10 rounded-xl transition-colors"
          >
            <LogOut className="w-5 h-5" />
            {isSidebarOpen && <span className="font-medium">Logout</span>}
          </button>
        </div>
      </motion.aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden relative">
        {/* Top Navbar */}
        <header className="h-16 border-b border-[#222] bg-[#0a0a0a]/80 backdrop-blur-md flex items-center justify-between px-6 z-10">
          <div className="flex items-center gap-4">
            <button className="lg:hidden p-2 hover:bg-[#222] rounded-lg" onClick={() => setIsSidebarOpen(!isSidebarOpen)}>
              <Menu className="w-5 h-5" />
            </button>
            <h2 className="text-lg font-bold capitalize">{activeTab}</h2>
          </div>
          <div className="flex items-center gap-4">
            <button className="p-2 hover:bg-[#222] rounded-full relative">
              <Bell className="w-5 h-5 text-gray-400" />
              <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>
            <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center font-bold text-black text-sm">
              A
            </div>
          </div>
        </header>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6 lg:p-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {renderContent()}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>

      {/* Verification Modal */}
      <AnimatePresence>
        {selectedVerification && (
          <VerificationModal
            provider={selectedVerification}
            onClose={() => setSelectedVerification(null)}
            onApprove={handleApproveVerification}
            onReject={handleRejectVerification}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default MainAdminPanel;
