import React from "react";
import PropTypes from "prop-types";
import { Navigate, useLocation } from "react-router-dom";
import { isAdminAuthenticated } from "../utils/auth";

const ProtectedRoute = ({ children }) => {
  const location = useLocation();
  if (!isAdminAuthenticated()) {
    return <Navigate to="/" replace state={{ from: location }} />;
  }
  return children;
};

ProtectedRoute.propTypes = {
  children: PropTypes.node.isRequired,
};

export default ProtectedRoute;

