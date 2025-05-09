import React from "react";
import { Navigate, useLocation } from "react-router-dom";

const RequireAuth = ({ children }) => {
  // You could also read the cookie if you prefer
  const token = localStorage.getItem("adminInfo")
    ? JSON.parse(localStorage.getItem("adminInfo")).token
    : null;
  const location = useLocation();

  if (!token) {
    // Redirect to /login, preserving where they were going
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
};

export default RequireAuth;
