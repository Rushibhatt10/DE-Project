// src/App.jsx
import { Routes, Route } from "react-router-dom";
import Landing from "./pages/Landing";
import Signup from "./pages/Signup";
import Signin from "./pages/Signin";
import Dashboard from "./pages/Dashboard";
import ProviderDashboard from "./pages/ProviderDashboard";
import UserDashboard from "./pages/UserDashboard";
import ProviderAdmin from "./pages/ProviderAdmin";
import AddService from "./pages/AddService";
import ServiceDetails from "./pages/ServiceDetails"; 

function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/signin" element={<Signin />} />
      <Route path="/provider-dashboard" element={<ProviderDashboard />} />
      <Route path="/user-dashboard" element={<UserDashboard />} />
      <Route path="/provider-admin" element={<ProviderAdmin />} />
      <Route path="/add-service" element={<AddService />} />
      <Route path="/service/:id" element={<ServiceDetails />} />

      {/* 404 fallback */}
      <Route
        path="*"
        element={
          <h1 className="text-center mt-20 text-2xl text-red-500">
            404 - Page Not Found
          </h1>
        }
      />
    </Routes>
  );
}

export default App;
