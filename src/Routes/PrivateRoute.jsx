import useAuthStore from "@/store/useAuthStore";
import React from "react";
import { Navigate } from "react-router-dom";

const PrivateRoute = ({ children }) => {
  const isAuthenticated = useAuthStore((state) => state.accessToken);
  //  const isAuthenticated= !!localStorage.getItem("accessToken");
  return isAuthenticated ? children : <Navigate to="/login" />;
};

export default PrivateRoute;
