import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { Navigate, useLocation } from "react-router-dom";
import {
  isAdminAuthenticated,
  hasAnyRole,
  getAdminRole,
  ROLES,
} from "../utils/auth";
import useIdleLogout from "../hooks/useIdleLogout";
import SessionWarning from "./SessionWarning/SessionWarning";
import { signOut, onAuthStateChanged } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { auth, db } from "../../firebase";
import { clearAdminSession } from "../utils/auth";

const ProtectedRoute = ({ children, allowedRoles = null }) => {
  const location = useLocation();
  const [showSessionWarning, setShowSessionWarning] = useState(false);
  const [isFirebaseAuthReady, setIsFirebaseAuthReady] = useState(false);
  const [hasFirebaseAuth, setHasFirebaseAuth] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setHasFirebaseAuth(!!user);
      setIsFirebaseAuthReady(true);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (
      !hasFirebaseAuth ||
      !isFirebaseAuthReady ||
      !isAdminAuthenticated() ||
      !auth.currentUser
    )
      return;
    const role = getAdminRole();
    if (!role) return;
    const adminRoleRef = doc(db, "admin_roles", auth.currentUser.uid);
    setDoc(adminRoleRef, { role }, { merge: true }).catch((err) => {
      console.warn("Could not sync admin_roles for rules:", err);
    });
  }, [hasFirebaseAuth, isFirebaseAuthReady]);

  useIdleLogout(isAdminAuthenticated());

  if (!isFirebaseAuthReady) return null;

  if (!isAdminAuthenticated() || !hasFirebaseAuth) {
    if (!hasFirebaseAuth && isAdminAuthenticated()) {
      clearAdminSession();
    }
    return <Navigate to="/" replace state={{ from: location }} />;
  }

  if (allowedRoles && !hasAnyRole(allowedRoles)) {
    const currentRole = getAdminRole();
    if (currentRole === ROLES.ADVISER) {
      return <Navigate to="/StudentDashboard" replace />;
    }
    return <Navigate to="/dashboard" replace />;
  }

  const handleSessionExtend = () => setShowSessionWarning(false);

  const handleSessionLogout = async () => {
    setShowSessionWarning(false);
    try {
      await signOut(auth);
    } catch (err) {
      console.error("Logout error:", err);
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
