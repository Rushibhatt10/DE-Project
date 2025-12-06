// src/App.jsx
import { Routes, Route } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { NotificationProvider } from "./context/NotificationContext";

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

import ResetDatabase from "./pages/ResetDatabase";

// 🤝 Deal & Chat
import DealPortalPage from "./pages/DealPortalPage";
import RequestPortal from "./pages/RequestPortal";
import OrderPortal from "./pages/OrderPortal";
import InvoiceView from "./pages/InvoiceView";

function App() {
  return (
    <NotificationProvider>
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
        <Route path="/admin" element={<MainAdminPanel />} />

        {/* 🤝 Deal & Chat Pages */}
        <Route path="/deal/:requestId" element={<DealPortalPage />} />
        <Route path="/request/:id" element={<RequestPortal />} />
        <Route path="/order/:orderId" element={<OrderPortal />} />
        <Route path="/invoice/:invoiceId" element={<InvoiceView />} />
        <Route path="/reset-db-secure" element={<ResetDatabase />} />


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
      <Toaster
        position="top-center"
        toastOptions={{
          style: {
            background: '#1e1e1e',
            color: '#fff',
            border: '1px solid #2dd4bf',
          },
        }}
      />
    </NotificationProvider>
  );
}

export default App;
