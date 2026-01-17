/**
 * PasswordChange - Component for forced password change after admin reset
 * Users are redirected here when mustChangePassword flag is true
 */

import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { signInWithEmailAndPassword, signOut } from "firebase/auth";
import { db, auth } from "../../../firebase";
import { FaRegEye, FaRegEyeSlash } from "react-icons/fa";
import "./PasswordChange.css";
import InternQuestLogo from "../../assets/InternQuest_with_text_white.png";
import { clearAdminSession } from "../../utils/auth";
import { attemptUpdateAuthPassword } from "../../utils/authPasswordUpdate";

const PasswordChange = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [formData, setFormData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [adminId, setAdminId] = useState(null);
  const [username, setUsername] = useState("");

  useEffect(() => {
    // Get admin ID and username from location state or session
    const state = location.state;
    if (state?.adminId) {
      setAdminId(state.adminId);
      setUsername(state.username || "");
    } else {
      // If no state, redirect to login
      navigate("/", { replace: true });
    }
  }, [location, navigate]);

  const validatePassword = (password) => {
    if (!password || password.length < 8) {
      return "Password must be at least 8 characters long";
    }
    if (!/[A-Z]/.test(password)) {
      return "Password must contain at least one uppercase letter";
    }
    if (!/[a-z]/.test(password)) {
      return "Password must contain at least one lowercase letter";
    }
    if (!/[0-9]/.test(password)) {
      return "Password must contain at least one number";
    }
    if (!/[!@#$%^&*]/.test(password)) {
      return "Password must contain at least one special character (!@#$%^&*)";
    }
    return "";
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear error when user types
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
    setError("");
  };

  const togglePasswordVisibility = (field) => {
    setShowPasswords((prev) => ({
      ...prev,
      [field]: !prev[field],
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setErrors({});

    // Validate all fields
    const newErrors = {};
    
    if (!formData.currentPassword) {
      newErrors.currentPassword = "Current password is required";
    }
    
    const newPasswordError = validatePassword(formData.newPassword);
    if (newPasswordError) {
      newErrors.newPassword = newPasswordError;
    }
    
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Please confirm your new password";
    } else if (formData.newPassword !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsLoading(true);

    try {
      if (!adminId) {
        setError("Admin ID not found. Please log in again.");
        setTimeout(() => {
          clearAdminSession();
          navigate("/", { replace: true });
        }, 2000);
        return;
      }

      // Get admin document
      const adminRef = doc(db, "adminusers", adminId);
      const adminSnap = await getDoc(adminRef);

      if (!adminSnap.exists()) {
        setError("Admin account not found. Please contact administrator.");
        return;
      }

      const adminData = adminSnap.data();

      // Verify current password
      if (adminData.password !== formData.currentPassword) {
        setError("Current password is incorrect");
        setErrors({ currentPassword: "Current password is incorrect" });
        setIsLoading(false);
        return;
      }

      // Check if new password is same as current
      if (formData.newPassword === formData.currentPassword) {
        setError("New password must be different from current password");
        setErrors({ newPassword: "New password must be different from current password" });
        setIsLoading(false);
        return;
      }

      // Ensure user is authenticated with Firebase Auth before updating
      // This is required for Firestore security rules
      let isAuthenticated = !!auth.currentUser;
      
      // If not authenticated, try to sign in with Firebase Auth
      if (!isAuthenticated && adminData.firebaseEmail) {
        // First try with the current password (temporary password)
        try {
          await signInWithEmailAndPassword(
            auth,
            adminData.firebaseEmail,
            formData.currentPassword
          );
          isAuthenticated = true;
        } catch (authError) {
          // If that fails, try with stored firebasePassword (might be different)
          if (adminData.firebasePassword && adminData.firebasePassword !== formData.currentPassword) {
            try {
              await signInWithEmailAndPassword(
                auth,
                adminData.firebaseEmail,
                adminData.firebasePassword
              );
              isAuthenticated = true;
            } catch (authError2) {
              console.warn("Could not authenticate with Firebase Auth using stored password:", authError2);
            }
          }
          
          // Firebase Auth authentication failed, but we can still update Firestore
          // because the Firestore rules now allow password updates without auth
          // (as long as only password-related fields are updated)
          console.warn("Could not authenticate with Firebase Auth, but will proceed with Firestore update");
        }
      }

      // Update password and clear mustChangePassword flag
      await updateDoc(adminRef, {
        password: formData.newPassword,
        firebasePassword: formData.newPassword,
        mustChangePassword: false,
        passwordChangedAt: new Date().toISOString(),
      });

      // Sync password to Firebase Auth
      if (adminData.firebaseEmail || adminData.uid) {
        try {
          const authUpdateSuccess = await attemptUpdateAuthPassword(
            {
              uid: adminData.uid,
              email: adminData.email,
              firebaseEmail: adminData.firebaseEmail,
            },
            formData.newPassword
          );
          
          if (!authUpdateSuccess) {
            console.warn("Firestore password updated, but Firebase Auth sync failed. You may need to contact administrator to sync passwords.");
          } else {
            console.log("Password successfully synced to Firebase Auth");
          }
        } catch (authError) {
          console.warn("Firebase Auth password update failed:", authError);
          // Don't fail the password change if Auth update fails - Firestore is updated
        }
      }

      // Success - clear session and redirect to login
      clearAdminSession();
      navigate("/", { 
        replace: true,
        state: { 
          passwordChanged: true,
          message: "Password changed successfully. Please log in with your new password."
        }
      });
    } catch (err) {
      console.error("Error changing password:", err);
      setError(`Failed to change password: ${err.message || "An unexpected error occurred"}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="password-change-page">
      <div className="password-change-container">
        <div className="left-container">
          <img
            src={InternQuestLogo}
            alt="InternQuest Logo"
            className="brand-logo"
          />
        </div>
        <div className="right-container">
          <div className="password-change-card">
            <h1>Change Password Required</h1>
            <p className="password-change-subtitle">
              Your password has been reset. Please set a new password to continue.
            </p>
            {error && (
              <div className="error-message" role="alert">
                {error}
              </div>
            )}
            <form onSubmit={handleSubmit} className="password-change-form">
              <div className="form-group">
                <label htmlFor="current-password">Current Password (Temporary)</label>
                <div className="password-input-container">
                  <input
                    id="current-password"
                    type={showPasswords.current ? "text" : "password"}
                    name="currentPassword"
                    value={formData.currentPassword}
                    onChange={handleChange}
                    className={`form-input ${errors.currentPassword ? "error" : ""}`}
                    placeholder="Enter temporary password"
                    disabled={isLoading}
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() => togglePasswordVisibility("current")}
                    aria-label={showPasswords.current ? "Hide password" : "Show password"}
                  >
                    {showPasswords.current ? <FaRegEyeSlash /> : <FaRegEye />}
                  </button>
                </div>
                {errors.currentPassword && (
                  <span className="field-error">{errors.currentPassword}</span>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="new-password">New Password</label>
                <div className="password-input-container">
                  <input
                    id="new-password"
                    type={showPasswords.new ? "text" : "password"}
                    name="newPassword"
                    value={formData.newPassword}
                    onChange={handleChange}
                    className={`form-input ${errors.newPassword ? "error" : ""}`}
                    placeholder="Enter new password"
                    disabled={isLoading}
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() => togglePasswordVisibility("new")}
                    aria-label={showPasswords.new ? "Hide password" : "Show password"}
                  >
                    {showPasswords.new ? <FaRegEyeSlash /> : <FaRegEye />}
                  </button>
                </div>
                {errors.newPassword && (
                  <span className="field-error">{errors.newPassword}</span>
                )}
                <small className="form-help">
                  Must be at least 8 characters with uppercase, lowercase, number, and special character
                </small>
              </div>

              <div className="form-group">
                <label htmlFor="confirm-password">Confirm New Password</label>
                <div className="password-input-container">
                  <input
                    id="confirm-password"
                    type={showPasswords.confirm ? "text" : "password"}
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className={`form-input ${errors.confirmPassword ? "error" : ""}`}
                    placeholder="Confirm new password"
                    disabled={isLoading}
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() => togglePasswordVisibility("confirm")}
                    aria-label={showPasswords.confirm ? "Hide password" : "Show password"}
                  >
                    {showPasswords.confirm ? <FaRegEyeSlash /> : <FaRegEye />}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <span className="field-error">{errors.confirmPassword}</span>
                )}
              </div>

              <button
                type="submit"
                className={`change-password-button${isLoading ? " loading" : ""}`}
                disabled={isLoading}
              >
                {isLoading ? "Changing Password..." : "Change Password"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PasswordChange;

