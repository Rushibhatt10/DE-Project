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

// 🔐 Admin Pages
import MainAdminPanel from "./pages/MainAdminPanel";
import Verifications from "./pages/Verifications";

// 🤝 Deal & Chat
import DealConfirmationPage from "./pages/DealConfirmationPage";
import ChatPage from "./pages/ChatPage"; 

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
    
      {/* 🔐 Admin & Verification */}
      <Route path="/admin" element={<MainAdminPanel />} />
      <Route path="/verifications" element={<Verifications />} />

      {/* 🤝 Deal & Chat Pages */}
      <Route path="/deal/:requestId" element={<DealConfirmationPage />} />
      <Route path="/chat/:requestId" element={<ChatPage />} /> 

      {/* ❌ Fallback Route */}
      <Route
        path="*"
        element={
          <div className="h-screen flex items-center justify-center bg-white dark:bg-gray-900">
            <h1 className="text-3xl font-bold text-red-500">404 - Page Not Found</h1>
          </div>
        }
      />
    </Routes>
  );
}

export default App;
