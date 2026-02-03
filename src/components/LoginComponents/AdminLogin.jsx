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
import { collection, query, where, getDocs } from "firebase/firestore";
import { db, auth } from "../../../firebase";
import { signInWithEmailAndPassword } from "firebase/auth";
import InternQuestLogo from "../../assets/InternQuest_with_text_white.png";
import {
  createAdminSession,
  isAdminAuthenticated,
  getAdminRole,
  ROLES,
} from "../../utils/auth";
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
      setSuccess(
        state.message ||
          "Password changed successfully. Please log in with your new password."
      );
    }
  }, [location]);

  useEffect(() => {
    if (isAdminAuthenticated()) {
      // Redirect based on role if already logged in
      const role = getAdminRole();
      // Normalize legacy 'super_admin' to 'admin' for backward compatibility during migration
      const normalizedRole = role === "super_admin" ? "admin" : role;

      if (normalizedRole === ROLES.ADVISER || normalizedRole === "adviser") {
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

      // Try username with timeout protection
      let adminDoc = null;
      let adminData = null;

      const usernameQuery = query(
        adminsRef,
        where("username", "==", trimmedUsername)
      );

      // Add timeout to prevent infinite hangs (30 seconds)
      const queryPromise = getDocs(usernameQuery);
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(
          () =>
            reject(
              new Error(
                "Request timeout. Please check your connection and try again."
              )
            ),
          30000
        )
      );

      const usernameSnapshot = await Promise.race([
        queryPromise,
        timeoutPromise,
      ]);

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
        setIsLoading(false);
        return;
      }

      // Authenticate with Firebase Auth only (no stored password in database)
      if (!adminData.firebaseEmail) {
        setError(
          "Admin account not properly configured with Firebase authentication. Please contact administrator."
        );
        setIsLoading(false);
        return;
      }

      const firebaseEmail = adminData.firebaseEmail.trim();
      if (!firebaseEmail || !isValidEmail(firebaseEmail)) {
        setError(
          "Admin account has invalid Firebase email configuration. Please contact administrator."
        );
        setIsLoading(false);
        return;
      }

      if (!trimmedPassword || trimmedPassword.length === 0) {
        setError("Password cannot be empty.");
        setIsLoading(false);
        return;
      }

      try {
        // Add timeout to Firebase Auth sign-in (30 seconds)
        const authPromise = signInWithEmailAndPassword(
          auth,
          firebaseEmail,
          trimmedPassword
        );
        const authTimeoutPromise = new Promise((_, reject) =>
          setTimeout(
            () =>
              reject(
                new Error(
                  "Authentication timeout. Please check your connection and try again."
                )
              ),
            30000
          )
        );

        await Promise.race([authPromise, authTimeoutPromise]);
        console.log("Sign-in successful");
      } catch (authError) {
        console.error("Firebase Auth sign-in error:", {
          code: authError.code,
          message: authError.message,
          email: firebaseEmail,
        });
        let errorMessage = "";
        if (authError.code === "auth/user-disabled") {
          errorMessage =
            "This account has been disabled. Please contact administrator.";
        } else if (
          authError.code === "auth/invalid-credential" ||
          authError.code === "auth/wrong-password"
        ) {
          errorMessage = "Invalid username or password";
        } else if (authError.code === "auth/invalid-email") {
          errorMessage =
            "Invalid email format in Firebase Auth. Please contact administrator.";
        } else if (authError.code === "auth/user-not-found") {
          errorMessage =
            "Firebase Auth account not found. Please contact administrator to create your Firebase authentication account.";
        } else if (authError.code === "auth/network-request-failed") {
          errorMessage =
            "Network error. Please check your connection and try again.";
        } else if (authError.code === "auth/invalid-password") {
          errorMessage =
            "Invalid password format. Please contact administrator.";
        } else if (authError.code === "auth/missing-password") {
          errorMessage = "Password is required for authentication.";
        } else {
          errorMessage = `Firebase authentication failed. ${
            authError.message || authError.code || "Unknown error"
          }. Please contact administrator.`;
        }
        setError(errorMessage);
        setFieldErrors({
          username:
            errorMessage === "Invalid username or password"
              ? "Invalid username or password"
              : "",
          password:
            errorMessage === "Invalid username or password"
              ? "Invalid username or password"
              : "",
        });
        setIsLoading(false);
        return;
      }

      // Store role in session (default to 'adviser' if not specified)
      // Normalize legacy 'super_admin' to 'admin' during migration period
      let adminRole = adminData.role || "adviser";
      if (adminRole === "super_admin") {
        adminRole = "admin";
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
    } catch (err) {
      console.error("Login error:", err);
      const errorMessage =
        err.message || "An unexpected error occurred. Please try again.";

      // Handle timeout errors specifically
      if (
        errorMessage.includes("timeout") ||
        errorMessage.includes("Request timeout") ||
        errorMessage.includes("Authentication timeout")
      ) {
        setError(errorMessage);
      } else if (err.code === "auth/network-request-failed") {
        setError(
          "Network error. Please check your internet connection and try again."
        );
      } else {
        setError(`Login failed: ${errorMessage}`);
      }

      setFieldErrors({
        username: "",
        password: "",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-page">
      <a
        href="#login-form"
        className="skip-link"
        style={{
          position: "absolute",
          top: "-40px",
          left: 0,
          background: "#1976d2",
          color: "#fff",
          padding: "8px 16px",
          textDecoration: "none",
          zIndex: 10000,
          borderRadius: "0 0 4px 0",
          fontWeight: 500,
          transition: "top 0.2s",
        }}
        onFocus={(e) => (e.target.style.top = "0")}
        onBlur={(e) => (e.target.style.top = "-40px")}
      >
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
                  } ${
                    touched.username &&
                    !fieldErrors.username &&
                    formData.username
                      ? "success"
                      : ""
                  }`}
                  value={formData.username}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  disabled={isLoading}
                  autoComplete="username"
                  aria-required="true"
                  aria-invalid={
                    touched.username && fieldErrors.username ? "true" : "false"
                  }
                  aria-describedby={
                    touched.username && fieldErrors.username
                      ? "username-error"
                      : undefined
                  }
                />
                {touched.username && fieldErrors.username && (
                  <span
                    id="username-error"
                    className="field-error"
                    role="alert"
                  >
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
                    } ${
                      touched.password &&
                      !fieldErrors.password &&
                      formData.password
                        ? "success"
                        : ""
                    }`}
                    value={formData.password}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    disabled={isLoading}
                    autoComplete="current-password"
                    aria-required="true"
                    aria-invalid={
                      touched.password && fieldErrors.password
                        ? "true"
                        : "false"
                    }
                    aria-describedby={
                      touched.password && fieldErrors.password
                        ? "password-error"
                        : undefined
                    }
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
                  <span
                    id="password-error"
                    className="field-error"
                    role="alert"
                  >
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
                <span className="button-text">
                  {isLoading ? "Signing in..." : "Sign in"}
                </span>
                {isLoading && (
                  <span className="button-spinner" aria-hidden="true"></span>
                )}
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
