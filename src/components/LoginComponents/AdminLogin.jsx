/**
 * AdminLogin - Login page for admin users
 * Handles authentication against Firestore adminusers collection
 *
 * @component
 * @example
 * <AdminLogin />
 */

import React, { useState, useEffect, useRef } from "react";
import PropTypes from "prop-types";
import { useNavigate, useLocation, Link } from "react-router-dom";
import "./AdminLogin.css";
import { FaRegEye, FaRegEyeSlash } from "react-icons/fa";
import { collection, query, where, getDocs, addDoc, doc, updateDoc } from "firebase/firestore";
import { db, auth } from "../../../firebase";
import { signInWithEmailAndPassword } from "firebase/auth";
import InternQuestLogo from "../../assets/InternQuest_with_text_white.png";
import { createAdminSession, isAdminAuthenticated, getAdminRole, ROLES } from "../../utils/auth";
import { attemptUpdateAuthPassword } from "../../utils/authPasswordUpdate";

const AdminLogin = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const usernameInputRef = useRef(null);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [fieldErrors, setFieldErrors] = useState({
    username: "",
    password: "",
  });
  const [touched, setTouched] = useState({
    username: false,
    password: false,
  });

  // Set the document title on mount and auto-focus username field
  useEffect(() => {
    document.title = "Login";
    // Auto-focus username input on mount
    if (usernameInputRef.current) {
      usernameInputRef.current.focus();
    }
  }, []);

  // Validate email format
  const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // Validate username field
  const validateUsername = (value) => {
    const trimmed = value.trim();
    if (!trimmed) {
      return "Username is required";
    }
    return "";
  };

  // Validate password field
  const validatePassword = (value) => {
    if (!value.trim()) {
      return "Password is required";
    }
    return "";
  };

  // Handles changes to input fields (username, password)
  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Clear error when user starts typing
    if (error) {
      setError("");
    }
    
    // Clear field error when user types
    if (fieldErrors[name]) {
      setFieldErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }

    setFormData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  // Handle blur events for validation
  const handleBlur = (e) => {
    const { name, value } = e.target;
    setTouched((prev) => ({
      ...prev,
      [name]: true,
    }));

    // Validate on blur
    if (name === "username") {
      const error = validateUsername(value);
      setFieldErrors((prev) => ({
        ...prev,
        username: error,
      }));
    } else if (name === "password") {
      const error = validatePassword(value);
      setFieldErrors((prev) => ({
        ...prev,
        password: error,
      }));
    }
  };

  // Toggles the visibility of the password input
  const togglePasswordVisibility = () => {
    setShowPassword((prev) => !prev);
  };

  useEffect(() => {
    // Check for password change success message
    const state = location.state;
    if (state?.passwordChanged) {
      setError(""); // Clear any existing error
      setSuccess(state.message || "Password changed successfully. Please log in with your new password.");
    }
  }, [location]);

  useEffect(() => {
    if (isAdminAuthenticated()) {
      // Redirect based on role if already logged in
      const role = getAdminRole();
      // Map 'admin' to 'super_admin' for backward compatibility
      const mappedRole = role === 'admin' ? 'super_admin' : role;
      
      if (mappedRole === ROLES.ADVISER || mappedRole === 'adviser') {
        navigate("/StudentDashboard", { replace: true });
      } else {
        navigate("/dashboard", { replace: true });
      }
    }
  }, [navigate]);

  // Handles form submission and authentication logic
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Trim input values
    const trimmedUsername = formData.username.trim();
    const trimmedPassword = formData.password.trim();

    // Validate all fields
    const usernameError = validateUsername(trimmedUsername);
    const passwordError = validatePassword(trimmedPassword);

    setFieldErrors({
      username: usernameError,
      password: passwordError,
    });

    setTouched({
      username: true,
      password: true,
    });

    // If there are validation errors, don't submit
    if (usernameError || passwordError) {
      setError("Please correct the errors above");
      return;
    }

    setIsLoading(true);
    setError("");
    setFieldErrors({ username: "", password: "" });

    try {
      const adminsRef = collection(db, "adminusers");

      // Try username
      let adminDoc = null;
      let adminData = null;

      const usernameQuery = query(
        adminsRef,
        where("username", "==", trimmedUsername)
      );
      const usernameSnapshot = await getDocs(usernameQuery);

      if (!usernameSnapshot.empty) {
        adminDoc = usernameSnapshot.docs[0];
        adminData = adminDoc.data();
      }

      if (!adminDoc || !adminData) {
        setError("Invalid username or password");
        setFieldErrors({
          username: "Invalid username or password",
          password: "Invalid username or password",
        });
        return;
      }

      // Check if password matches
      if (adminData.password === trimmedPassword) {

        // Sign into Firebase Auth - REQUIRED for Firestore security rules
        // Firestore rules require request.auth != null to read/write data
        if (adminData.firebaseEmail) {
          // Validate email format before attempting sign-in
          const firebaseEmail = adminData.firebaseEmail.trim();
          if (!firebaseEmail || !isValidEmail(firebaseEmail)) {
            console.error("Invalid Firebase email format:", firebaseEmail);
            setError("Admin account has invalid Firebase email configuration. Please contact administrator.");
            setIsLoading(false);
            return;
          }

          // Validate password is not empty
          if (!trimmedPassword || trimmedPassword.length === 0) {
            console.error("Password is empty");
            setError("Password cannot be empty.");
            setIsLoading(false);
            return;
          }

          // Try to sign in with Firebase Auth
          // First try with the password the user entered
          let authSuccess = false;
          let lastAuthError = null;
          
          try {
            await signInWithEmailAndPassword(
              auth,
              firebaseEmail,
              trimmedPassword
            );
            authSuccess = true;
            console.log("Sign-in successful");
          } catch (authError1) {
            lastAuthError = authError1;
            console.error("Firebase Auth sign-in error (first attempt):", {
              code: authError1.code,
              message: authError1.message,
              email: firebaseEmail
            });
            
            // If that fails, try with the stored firebasePassword (might be different)
            if (adminData.firebasePassword && adminData.firebasePassword !== trimmedPassword) {
              try {
                console.log("Attempting Firebase Auth sign-in with stored firebasePassword");
                await signInWithEmailAndPassword(
                  auth,
                  firebaseEmail,
                  adminData.firebasePassword
                );
                authSuccess = true;
                console.log("Sign-in successful");
              } catch (authError2) {
                lastAuthError = authError2;
                console.error("Firebase Auth sign-in failed with both passwords:", {
                  code: authError2.code,
                  message: authError2.message,
                  email: firebaseEmail
                });
              }
            }
            
            if (!authSuccess) {
              // Firebase Auth authentication failed
              // Since Firestore password matches, the user is legitimate but Firebase Auth is out of sync
              // Try to sync the password to Firebase Auth automatically
              if (lastAuthError.code === "auth/invalid-credential" || lastAuthError.code === "auth/wrong-password") {
                console.log("Password mismatch detected. Attempting to sync password to Firebase Auth...", {
                  hasUid: !!adminData.uid,
                  hasEmail: !!adminData.email,
                  hasFirebaseEmail: !!firebaseEmail,
                  passwordLength: trimmedPassword.length
                });
                
                // Ensure we have the necessary data for password sync
                if (!firebaseEmail) {
                  console.error("Cannot sync password: firebaseEmail is missing");
                } else if (!trimmedPassword || trimmedPassword.trim() === '') {
                  console.error("Cannot sync password: password is empty");
                } else {
                  try {
                    const syncSuccess = await attemptUpdateAuthPassword(
                      {
                        uid: adminData.uid || null,
                        email: adminData.email || null,
                        firebaseEmail: firebaseEmail,
                      },
                      trimmedPassword
                    );
                    
                    if (syncSuccess) {
                      console.log("Password synced successfully. Retrying login...");
                      // Wait a moment for the password to propagate
                      await new Promise(resolve => setTimeout(resolve, 1000));
                      
                      // Retry login after sync
                      try {
                        await signInWithEmailAndPassword(
                          auth,
                          firebaseEmail,
                          trimmedPassword
                        );
                        authSuccess = true;
                        console.log("Login successful after password sync");
                      } catch (retryError) {
                        console.error("Login failed after password sync:", retryError);
                        setError("Password synced but login still failed. Please try again.");
                        setIsLoading(false);
                        return;
                      }
                    } else {
                      console.warn("Password sync failed. User will need admin to reset password.", {
                        uid: adminData.uid,
                        email: adminData.email,
                        firebaseEmail: firebaseEmail
                      });
                    }
                  } catch (syncError) {
                    console.error("Error attempting password sync:", syncError);
                  }
                }
              }
              
              if (!authSuccess) {
                // If sync didn't work or other error, show appropriate message
                let errorMessage = "";
                
                if (lastAuthError.code === "auth/user-disabled") {
                  errorMessage = "This account has been disabled. Please contact administrator.";
                } else if (lastAuthError.code === "auth/invalid-credential" || lastAuthError.code === "auth/wrong-password") {
                  // Password sync was attempted but failed
                  errorMessage = "Password sync issue detected. Automatic sync failed. Please contact the system administrator to reset your password (this will sync it with Firebase Auth).";
                } else if (lastAuthError.code === "auth/invalid-email") {
                  errorMessage = "Invalid email format in Firebase Auth. Please contact administrator.";
                } else if (lastAuthError.code === "auth/user-not-found") {
                  errorMessage = "Firebase Auth account not found. Please contact administrator to create your Firebase authentication account.";
                } else if (lastAuthError.code === "auth/network-request-failed") {
                  errorMessage = "Network error. Please check your connection and try again.";
                } else if (lastAuthError.code === "auth/invalid-password") {
                  errorMessage = "Invalid password format. Please contact administrator.";
                } else if (lastAuthError.code === "auth/missing-password") {
                  errorMessage = "Password is required for authentication.";
                } else {
                  // Log the full error for debugging
                  console.error("Firebase Auth sign-in error (unhandled):", {
                    code: lastAuthError.code,
                    message: lastAuthError.message,
                    email: firebaseEmail,
                    fullError: lastAuthError
                  });
                  errorMessage = `Firebase authentication failed. Error: ${lastAuthError.message || lastAuthError.code || "Unknown error"}. Please contact administrator.`;
                }
                
                setError(errorMessage);
                setIsLoading(false);
                return;
              }
            }
          }
        } else {
          // No Firebase Auth email - cannot access Firestore
          setError("Admin account not properly configured with Firebase authentication. Please contact administrator.");
          setIsLoading(false);
          return;
        }

        // Store role in session (default to 'adviser' if not specified)
        // Map 'admin' to 'super_admin' for backward compatibility
        let adminRole = adminData.role || 'adviser';
        if (adminRole === 'admin') {
          adminRole = 'super_admin';
        }
        
        createAdminSession({ 
          username: trimmedUsername,
          role: adminRole,
          adminId: adminDoc.id,
          college_code: adminData.college_code || null,
          sections: adminData.sections || (adminData.section ? [adminData.section] : []),
          mustChangePassword: adminData.mustChangePassword || false
        });
        
        // Check if password change is required
        if (adminData.mustChangePassword) {
          // Store flag in session and navigate to password change page
          // For now, we'll redirect to a password change route
          // You can create a separate component for this
          navigate("/change-password", { 
            replace: true,
            state: { 
              adminId: adminDoc.id,
              username: trimmedUsername,
              fromLogin: true 
            }
          });
        } else {
        // Navigate based on role - check both string and constant
        if (adminRole === 'adviser' || adminRole === ROLES.ADVISER) {
          // Adviser (Admin 3) goes to Student Dashboard
          navigate("/StudentDashboard", { replace: true });
        } else {
          // Super Admin, Coordinator, or any other role goes to Dashboard
          navigate("/dashboard", { replace: true });
          }
        }
      } else {
        // Firestore password does NOT match what the user typed.
        // This can happen if the user changed their password via email (sendPasswordResetEmail),
        // which updates Firebase Auth but not our Firestore copy yet.
        if (adminData.firebaseEmail) {
          const firebaseEmail = adminData.firebaseEmail.trim();

          if (!firebaseEmail || !isValidEmail(firebaseEmail)) {
            console.error("Invalid Firebase email format when password mismatch:", firebaseEmail);
            setError("Account email configuration is invalid. Please contact the administrator.");
            setIsLoading(false);
            return;
          }

          try {
            // Try signing in directly with Firebase Auth using the entered password.
            await signInWithEmailAndPassword(auth, firebaseEmail, trimmedPassword);
            console.log("Sign-in successful with new password (password was changed outside the system).");

            // If that works, update Firestore to store the new password so everything stays in sync.
            try {
              const adminRef = doc(db, "adminusers", adminDoc.id);
              await updateDoc(adminRef, {
                password: trimmedPassword,
                firebasePassword: trimmedPassword,
                mustChangePassword: false,
                passwordChangedAt: new Date().toISOString(),
              });
              console.log("Updated Firestore password after successful Firebase Auth login with new password.");
              // Also update local adminData so session & redirects use latest state
              adminData = {
                ...adminData,
                password: trimmedPassword,
                firebasePassword: trimmedPassword,
                mustChangePassword: false,
              };
            } catch (syncErr) {
              console.error("Failed to sync new password back to Firestore:", syncErr);
            }

            // Proceed to create session and redirect just like the normal success path
            let adminRole = adminData.role || "adviser";
            if (adminRole === "admin") {
              adminRole = "super_admin";
            }

            createAdminSession({
              username: trimmedUsername,
              role: adminRole,
              adminId: adminDoc.id,
              college_code: adminData.college_code || null,
              sections:
                adminData.sections || (adminData.section ? [adminData.section] : []),
              mustChangePassword: adminData.mustChangePassword || false,
            });

            if (adminData.mustChangePassword) {
              navigate("/change-password", {
                replace: true,
                state: {
                  adminId: adminDoc.id,
                  username: trimmedUsername,
                  fromLogin: true,
                },
              });
            } else {
              if (adminRole === "adviser" || adminRole === ROLES.ADVISER) {
                navigate("/StudentDashboard", { replace: true });
              } else {
                navigate("/dashboard", { replace: true });
              }
            }
          } catch (authError) {
            console.error("Firebase Auth sign-in failed when Firestore password did not match:", authError);
            // If Firebase also rejects the password, treat it as invalid credentials.
            setError("Invalid username or password");
            setFieldErrors({
              username: "Invalid username or password",
              password: "Invalid username or password",
            });
          }
        } else {
          // No firebaseEmail configured; fall back to invalid-credential message.
          setError("Invalid username or password");
          setFieldErrors({
            username: "Invalid username or password",
            password: "Invalid username or password",
          });
        }
      }
    } catch (err) {
      setError(`Login failed: ${err.message || "An unexpected error occurred. Please try again."}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-page">
      <a href="#login-form" className="skip-link" style={{
        position: 'absolute',
        top: '-40px',
        left: 0,
        background: '#1976d2',
        color: '#fff',
        padding: '8px 16px',
        textDecoration: 'none',
        zIndex: 10000,
        borderRadius: '0 0 4px 0',
        fontWeight: 500,
        transition: 'top 0.2s'
      }} onFocus={(e) => e.target.style.top = '0'} onBlur={(e) => e.target.style.top = '-40px'}>
        Skip to login form
      </a>
      <div className="login-container">
        <div className="left-container">
          <img
            src={InternQuestLogo}
            alt="InternQuest Logo"
            className="brand-logo"
          />
        </div>
        <div className="right-container">
          <div className="login-card">
            <h1>Management System</h1>
            <form
              id="login-form"
              className="login-form"
              onSubmit={handleSubmit}
              autoComplete="off"
              aria-label="Admin login form"
            >
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
              <div className="form-group">
                <label htmlFor="username-input">Username</label>
                <input
                  ref={usernameInputRef}
                  id="username-input"
                  type="text"
                  name="username"
                  placeholder="Enter your username"
                  className={`form-input ${
                    touched.username && fieldErrors.username ? "error" : ""
                  } ${touched.username && !fieldErrors.username && formData.username ? "success" : ""}`}
                  value={formData.username}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  disabled={isLoading}
                  autoComplete="username"
                  aria-required="true"
                  aria-invalid={touched.username && fieldErrors.username ? "true" : "false"}
                  aria-describedby={touched.username && fieldErrors.username ? "username-error" : undefined}
                />
                {touched.username && fieldErrors.username && (
                  <span id="username-error" className="field-error" role="alert">
                    {fieldErrors.username}
                  </span>
                )}
              </div>
              <div className="form-group">
                <label htmlFor="password-input">Password</label>
                <div className="password-input-container">
                  <input
                    id="password-input"
                    type={showPassword ? "text" : "password"}
                    name="password"
                    placeholder="Enter your password"
                    className={`form-input ${
                      touched.password && fieldErrors.password ? "error" : ""
                    } ${touched.password && !fieldErrors.password && formData.password ? "success" : ""}`}
                    value={formData.password}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    disabled={isLoading}
                    autoComplete="current-password"
                    aria-required="true"
                    aria-invalid={touched.password && fieldErrors.password ? "true" : "false"}
                    aria-describedby={touched.password && fieldErrors.password ? "password-error" : undefined}
                  />
                  <button
                    type="button"
                    className="password-toggle"
                    onClick={togglePasswordVisibility}
                    tabIndex={0}
                    aria-label={
                      showPassword ? "Hide password" : "Show password"
                    }
                  >
                    {showPassword ? <FaRegEyeSlash /> : <FaRegEye />}
                  </button>
                </div>
                {touched.password && fieldErrors.password && (
                  <span id="password-error" className="field-error" role="alert">
                    {fieldErrors.password}
                  </span>
                )}
              </div>
              <button
                type="submit"
                className={`sign-in-button${isLoading ? " loading" : ""}`}
                disabled={isLoading}
                aria-busy={isLoading}
              >
                {isLoading ? "Signing in..." : "Sign in"}
              </button>
              <div className="forgot-password-link">
                <Link to="/forgot-password" className="forgot-password-text">
                  Forgot password?
                </Link>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

// No props are required for this component, but PropTypes is included for consistency
AdminLogin.propTypes = {};

export default AdminLogin;
