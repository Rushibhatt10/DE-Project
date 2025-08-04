// src/App.jsx
import { Routes, Route } from "react-router-dom";

// 🌐 Public Pages
import Landing from "./pages/Landing";
import Signup from "./pages/Signup";
import Signin from "./pages/Signin";

// 🧑‍💻 User & Provider Pages
import Dashboard from "./pages/Dashboard";
import ProviderDashboard from "./pages/ProviderDashboard";
import UserDashboard from "./pages/UserDashboard";
import ProviderAdmin from "./pages/ProviderAdmin";
import AddService from "./pages/AddService";
import ServiceDetails from "./pages/ServiceDetails";
import AccountSection from "./pages/AccountSection";

// 🔐 Admin Pages
import MainAdminPanel from "./pages/MainAdminPanel";
import Verifications from "./pages/Verifications";

// 🤝 Deal & Chat
import DealPortalPage from "./pages/DealPortalPage";
import RequestPortal from "./pages/RequestPortal";    
 
function App() {
  return (
    <Routes>
      {/* 🌐 Public Routes */}
      <Route path="/" element={<Landing />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/signin" element={<Signin />} />

      {/* 🧑‍💻 User & Provider Routes */}
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/provider-dashboard" element={<ProviderDashboard />} />
      <Route path="/user-dashboard" element={<UserDashboard />} />
      <Route path="/provider-admin" element={<ProviderAdmin />} />
      <Route path="/add-service" element={<AddService />} />
      <Route path="/service/:id" element={<ServiceDetails />} />
      <Route path="/account" element={<AccountSection />} />
    
      {/* 🔐 Admin & Verification */}
      <Route path="/admin" element={<MainAdminPanel />} />
      <Route path="/verifications" element={<Verifications />} />

      {/* 🤝 Deal & Chat Pages */}
      <Route path="/deal/:requestId" element={<DealPortalPage />} />
     <Route path="/request/:id" element={<RequestPortal />} />
       

      {/* ❌ Fallback Route */}
      <Route
        path="*"
        element={
          <div className="relative bg-[#0f0f0f] text-white overflow-hidden">
            <h1 className="text-3xl font-bold text-teal-800">Page under maintanence,please try later. </h1>
          </div>
        }
      />
    </Routes>
  );
}

export default App;
