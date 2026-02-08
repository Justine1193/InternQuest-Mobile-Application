/**
 * SecuritySettings - Component for managing security settings
 * Includes PIN management and password change
 */

import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { collection, query, where, getDocs, doc, updateDoc } from "firebase/firestore";
import {
  signOut,
  sendPasswordResetEmail,
  updatePassword,
  reauthenticateWithCredential,
  EmailAuthProvider,
} from "firebase/auth";
import { db, auth } from "../../../firebase";
import { FaRegEye, FaRegEyeSlash } from "react-icons/fa";
import { IoShieldCheckmarkOutline, IoLockClosedOutline, IoKeyOutline } from "react-icons/io5";
import Navbar from "../Navbar/Navbar.jsx";
import { getAdminRole, clearAdminSession } from "../../utils/auth";
import LoadingSpinner from "../LoadingSpinner.jsx";
import "./SecuritySettings.css";

const SecuritySettings = () => {
  const navigate = useNavigate();
  const currentRole = getAdminRole();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [info, setInfo] = useState("");

  // Admin migration flags
  const [isAdmin, setIsAdmin] = useState(false);
  const [needsAdminMigration, setNeedsAdminMigration] = useState(false);
  
  // Password change state
  const [showPasswordChange, setShowPasswordChange] = useState(false);
  const [passwordFormData, setPasswordFormData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });
  const [passwordErrors, setPasswordErrors] = useState({});

  // Detect if current user is the legacy admin that still needs to migrate
  useEffect(() => {
    const checkAdminMigration = async () => {
      try {
        if (!auth.currentUser || !auth.currentUser.email) {
          setIsAdmin(false);
          setNeedsAdminMigration(false);
          return;
        }

        const adminsRef = collection(db, "adminusers");
        const emailQuery = query(
          adminsRef,
          where("firebaseEmail", "==", auth.currentUser.email)
        );
        const emailSnapshot = await getDocs(emailQuery);

        if (emailSnapshot.empty) {
          setIsAdmin(false);
          setNeedsAdminMigration(false);
          return;
        }

        const adminDoc = emailSnapshot.docs[0];
        const adminData = adminDoc.data();

        const role = (adminData.role || "").toLowerCase();
        const isAdminRole =
          role === "admin" || role === "super_admin" || role === "administrator";

        setIsAdmin(isAdminRole);

        if (!isAdminRole) {
          setNeedsAdminMigration(false);
          return;
        }

        // If passwordMigrated flag is not true, we consider this admin needing migration.
        const migrated = !!adminData.passwordMigrated;
        setNeedsAdminMigration(!migrated);
      } catch (e) {
        console.error("Error checking admin migration state:", e);
        setIsAdmin(false);
        setNeedsAdminMigration(false);
      }
    };

    checkAdminMigration();
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      clearAdminSession();
      navigate("/", { replace: true });
    } catch (err) {
      console.error("Logout error:", err);
    }
  };

  // Admin-only password migration: send reset email via Firebase Auth
  const handleSendAdminResetEmail = async () => {
    if (!auth.currentUser || !auth.currentUser.email) {
      setError("No authenticated admin email found.");
      return;
    }

    setError("");
    setSuccess("");
    setInfo("");
    setIsLoading(true);

    try {
      await sendPasswordResetEmail(auth, auth.currentUser.email);
      setInfo(
        "A password setup email has been sent to your admin email. Please check your inbox and set a new password."
      );
    } catch (e) {
      console.error("Error sending admin password reset email:", e);
      let msg = "Failed to send password reset email. Please try again.";
      if (e.code === "auth/too-many-requests") {
        msg =
          "Too many password reset attempts. Please wait a while before trying again.";
      }
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const validatePassword = (password) => {
    if (!password || password.length < 8) {
      return "Password must be at least 8 characters long";
    }
    if (password.length > 128) {
      return "Password must be less than 128 characters";
    }
    return null;
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setInfo("");
    setPasswordErrors({});
    setIsLoading(true);

    try {
      // Validate form
      const newPasswordError = validatePassword(passwordFormData.newPassword);
      if (newPasswordError) {
        setPasswordErrors({ newPassword: newPasswordError });
        setIsLoading(false);
        return;
      }

      if (passwordFormData.newPassword !== passwordFormData.confirmPassword) {
        setPasswordErrors({ confirmPassword: "Passwords do not match" });
        setIsLoading(false);
        return;
      }

      if (passwordFormData.currentPassword === passwordFormData.newPassword) {
        setPasswordErrors({
          newPassword: "New password must be different from current password",
        });
        setIsLoading(false);
        return;
      }

      // Get admin document (for metadata only, NEVER for passwords)
      if (!auth.currentUser) {
        setError("You must be logged in to change your password.");
        setIsLoading(false);
        return;
      }

      const adminsRef = collection(db, "adminusers");
      const emailQuery = query(
        adminsRef,
        where("firebaseEmail", "==", auth.currentUser.email)
      );
      const emailSnapshot = await getDocs(emailQuery);

      if (emailSnapshot.empty) {
        setError("Admin account not found.");
        setIsLoading(false);
        return;
      }

      const adminDoc = emailSnapshot.docs[0];
      const adminData = adminDoc.data();
      const adminRef = doc(db, "adminusers", adminDoc.id);

      // Reauthenticate with current password using Firebase Auth only
      try {
        const credential = EmailAuthProvider.credential(
          auth.currentUser.email,
          passwordFormData.currentPassword
        );
        await reauthenticateWithCredential(auth.currentUser, credential);
      } catch (reauthError) {
        console.error("Reauthentication failed:", reauthError);
        setPasswordErrors({
          currentPassword: "Current password is incorrect",
        });
        setIsLoading(false);
        return;
      }

      // Update password in Firebase Auth (no Cloud Function involved)
      try {
        await updatePassword(auth.currentUser, passwordFormData.newPassword);
      } catch (updateErr) {
        console.error("Error updating password via Firebase Auth:", updateErr);
        setError(
          updateErr.code === "auth/weak-password"
            ? "Password is too weak. Please choose a stronger password."
            : "Failed to update password. Please try again."
        );
        setIsLoading(false);
        return;
      }

      // Update metadata in Firestore (never storing passwords)
      await updateDoc(adminRef, {
        mustChangePassword: false,
        passwordMigrated: true,
        passwordChangedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });

      setSuccess("Password changed successfully!");
      setPasswordFormData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      setShowPasswordChange(false);
    } catch (err) {
      console.error("Error changing password:", err);
      setError(`Error changing password: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="security-settings-page">
      <LoadingSpinner isLoading={isLoading} message="Processing request..." />
      <Navbar onLogout={handleLogout} />
      <div className="security-settings-container">
        <div className="security-settings-header">
          <div className="security-settings-header-content">
            <div className="security-settings-header-icon-wrapper" aria-hidden="true">
              <IoShieldCheckmarkOutline className="security-settings-header-icon" />
            </div>
            <div>
              <h1>Security Settings</h1>
              <p className="security-settings-subtitle">
                Manage your account security settings including password
              </p>
            </div>
          </div>
        </div>

        {error && (
          <div className="error-message" role="alert">
            {error}
          </div>
        )}

        {success && (
          <div className="success-message" role="alert">
            {success}
          </div>
        )}

        {info && (
          <div className="info-message" role="status">
            {info}
          </div>
        )}

        <div className="security-settings-content">
          {/* Admin password migration warning (legacy admin only) */}
          {isAdmin && needsAdminMigration && (
            <div className="security-section">
              <div className="security-section-header">
                <IoLockClosedOutline className="section-icon" />
                <div className="section-title-group">
                  <h2>Admin Password Migration Required</h2>
                  <p className="section-description">
                    Your admin account needs to set a new password for security reasons.
                    The old password stored in the legacy system is no longer used.
                  </p>
                </div>
              </div>
              <div className="security-section-content">
                <button
                  type="button"
                  className="security-action-btn"
                  onClick={handleSendAdminResetEmail}
                  disabled={isLoading}
                >
                  <IoKeyOutline />
                  Set Admin Password
                </button>
              </div>
            </div>
          )}

          {/* Password Change Section */}
          <div className="security-section">
            <div className="security-section-header">
              <IoLockClosedOutline className="section-icon" />
              <div className="section-title-group">
                <h2>Password</h2>
                <p className="section-description">
                  Change your account password for Firebase Authentication
                </p>
              </div>
            </div>
            <div className="security-section-content">
              {!showPasswordChange ? (
                <>
                  <div className="password-info">
                    <p>
                      Your password is used to log in to your account. Make sure to use a strong,
                      unique password.
                    </p>
                    <ul className="password-requirements">
                      <li>Minimum 8 characters</li>
                      <li>Use a combination of letters, numbers, and symbols</li>
                      <li>Don't reuse passwords from other accounts</li>
                    </ul>
                  </div>
                  <button
                    type="button"
                    className="security-action-btn"
                    onClick={() => setShowPasswordChange(true)}
                  >
                    <IoKeyOutline />
                    Change Password
                  </button>
                </>
              ) : (
                <form onSubmit={handlePasswordChange} className="password-change-form">
                  <div className="form-group">
                    <label htmlFor="current-password">Current Password</label>
                    <div className="password-input-wrapper">
                      <input
                        type={showPasswords.current ? "text" : "password"}
                        id="current-password"
                        value={passwordFormData.currentPassword}
                        onChange={(e) =>
                          setPasswordFormData({
                            ...passwordFormData,
                            currentPassword: e.target.value,
                          })
                        }
                        className={passwordErrors.currentPassword ? "input-error" : ""}
                        required
                        autoComplete="current-password"
                      />
                      <button
                        type="button"
                        className="password-toggle"
                        onClick={() =>
                          setShowPasswords({
                            ...showPasswords,
                            current: !showPasswords.current,
                          })
                        }
                        aria-label={
                          showPasswords.current ? "Hide password" : "Show password"
                        }
                      >
                        {showPasswords.current ? <FaRegEyeSlash /> : <FaRegEye />}
                      </button>
                    </div>
                    {passwordErrors.currentPassword && (
                      <span className="error-text">{passwordErrors.currentPassword}</span>
                    )}
                  </div>

                  <div className="form-group">
                    <label htmlFor="new-password">New Password</label>
                    <div className="password-input-wrapper">
                      <input
                        type={showPasswords.new ? "text" : "password"}
                        id="new-password"
                        value={passwordFormData.newPassword}
                        onChange={(e) =>
                          setPasswordFormData({
                            ...passwordFormData,
                            newPassword: e.target.value,
                          })
                        }
                        className={passwordErrors.newPassword ? "input-error" : ""}
                        required
                        minLength={8}
                        autoComplete="new-password"
                      />
                      <button
                        type="button"
                        className="password-toggle"
                        onClick={() =>
                          setShowPasswords({
                            ...showPasswords,
                            new: !showPasswords.new,
                          })
                        }
                        aria-label={
                          showPasswords.new ? "Hide password" : "Show password"
                        }
                      >
                        {showPasswords.new ? <FaRegEyeSlash /> : <FaRegEye />}
                      </button>
                    </div>
                    {passwordErrors.newPassword && (
                      <span className="error-text">{passwordErrors.newPassword}</span>
                    )}
                  </div>

                  <div className="form-group">
                    <label htmlFor="confirm-password">Confirm New Password</label>
                    <div className="password-input-wrapper">
                      <input
                        type={showPasswords.confirm ? "text" : "password"}
                        id="confirm-password"
                        value={passwordFormData.confirmPassword}
                        onChange={(e) =>
                          setPasswordFormData({
                            ...passwordFormData,
                            confirmPassword: e.target.value,
                          })
                        }
                        className={passwordErrors.confirmPassword ? "input-error" : ""}
                        required
                        minLength={8}
                        autoComplete="new-password"
                      />
                      <button
                        type="button"
                        className="password-toggle"
                        onClick={() =>
                          setShowPasswords({
                            ...showPasswords,
                            confirm: !showPasswords.confirm,
                          })
                        }
                        aria-label={
                          showPasswords.confirm ? "Hide password" : "Show password"
                        }
                      >
                        {showPasswords.confirm ? <FaRegEyeSlash /> : <FaRegEye />}
                      </button>
                    </div>
                    {passwordErrors.confirmPassword && (
                      <span className="error-text">{passwordErrors.confirmPassword}</span>
                    )}
                  </div>

                  <div className="form-actions">
                    <button
                      type="button"
                      className="cancel-btn"
                      onClick={() => {
                        setShowPasswordChange(false);
                        setPasswordFormData({
                          currentPassword: "",
                          newPassword: "",
                          confirmPassword: "",
                        });
                        setPasswordErrors({});
                      }}
                    >
                      Cancel
                    </button>
                    <button type="submit" className="submit-btn" disabled={isLoading}>
                      {isLoading ? "Changing..." : "Change Password"}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SecuritySettings;
