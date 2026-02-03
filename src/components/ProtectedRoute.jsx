import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { Navigate, useLocation } from "react-router-dom";
import { isAdminAuthenticated, hasAnyRole, getAdminRole, ROLES } from "../utils/auth";
import useIdleLogout from "../hooks/useIdleLogout";
import SessionWarning from "./SessionWarning/SessionWarning";
import { signOut, onAuthStateChanged } from "firebase/auth";
import { auth } from "../../firebase";
import { clearAdminSession } from "../utils/auth";

const ProtectedRoute = ({ children, allowedRoles = null }) => {
  const location = useLocation();
  const [showSessionWarning, setShowSessionWarning] = useState(false);
  const [isFirebaseAuthReady, setIsFirebaseAuthReady] = useState(false);
  const [hasFirebaseAuth, setHasFirebaseAuth] = useState(false);
  
  // Check Firebase Auth state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setHasFirebaseAuth(!!user);
      setIsFirebaseAuthReady(true);
    });
    
    return () => unsubscribe();
  }, []);
  
  // Enable idle logout for authenticated users
  useIdleLogout(isAdminAuthenticated());
  
  // Wait for Firebase Auth state to be determined
  if (!isFirebaseAuthReady) {
    return null;
  }
  
  // Check both session and Firebase Auth
  if (!isAdminAuthenticated() || !hasFirebaseAuth) {
    // Clear session if Firebase Auth is not authenticated
    if (!hasFirebaseAuth && isAdminAuthenticated()) {
      clearAdminSession();
    }
    return <Navigate to="/" replace state={{ from: location }} />;
  }

  // If specific roles are required, check them
  if (allowedRoles && !hasAnyRole(allowedRoles)) {
    // Redirect based on role
    const currentRole = getAdminRole();
    if (currentRole === ROLES.ADVISER) {
      return <Navigate to="/StudentDashboard" replace />;
    }
    return <Navigate to="/dashboard" replace />;
  }

  const handleSessionExtend = () => {
    setShowSessionWarning(false);
    // Session is extended by SessionWarning component
  };

  const handleSessionLogout = async () => {
    setShowSessionWarning(false);
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      clearAdminSession();
      window.location.href = "/";
    }
  };

  return (
    <>
      {children}
      <SessionWarning
        onExtend={handleSessionExtend}
        onLogout={handleSessionLogout}
      />
    </>
  );
};

ProtectedRoute.propTypes = {
  children: PropTypes.node.isRequired,
  allowedRoles: PropTypes.arrayOf(PropTypes.string),
};

export default ProtectedRoute;

