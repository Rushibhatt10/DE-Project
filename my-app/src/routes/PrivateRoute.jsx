// src/routes/PrivateRoute.jsx
import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const PrivateRoute = ({ children, allowedRole }) => {
  const { user, role, loading } = useAuth();

  if (loading) return <div className="text-center mt-10 text-xl">Loading...</div>;

  if (!user) return <Navigate to="/signin" />;

  if (allowedRole && role !== allowedRole) return <Navigate to="/" />;

  return children;
};

export default PrivateRoute;
