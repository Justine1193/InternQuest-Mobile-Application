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
import { useNavigate } from "react-router-dom";
import "./AdminLogin.css";
import { FaRegEye, FaRegEyeSlash } from "react-icons/fa";
import { collection, query, where, getDocs, addDoc } from "firebase/firestore";
import { db, auth } from "../../../firebase";
import { signInWithEmailAndPassword } from "firebase/auth";
import InternQuestLogo from "../../assets/InternQuest_with_text_white.png";
import { createAdminSession, isAdminAuthenticated, getAdminRole, ROLES } from "../../utils/auth";

const AdminLogin = () => {
  const navigate = useNavigate();
  const usernameInputRef = useRef(null);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });
  const [error, setError] = useState("");
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

  // Validate username/email field
  const validateUsername = (value) => {
    const trimmed = value.trim();
    if (!trimmed) {
      return "Username or email is required";
    }
    // If it looks like an email, validate format
    if (trimmed.includes("@") && !isValidEmail(trimmed)) {
      return "Please enter a valid email address";
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

      // Try username first, then email
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
      } else {
        const emailQuery = query(adminsRef, where("email", "==", trimmedUsername));
        const emailSnapshot = await getDocs(emailQuery);
        if (!emailSnapshot.empty) {
          adminDoc = emailSnapshot.docs[0];
          adminData = emailSnapshot.docs[0].data();
        }
      }

      if (!adminDoc || !adminData) {
        setError("Invalid username/email or password");
        setFieldErrors({
          username: "Invalid username/email or password",
          password: "Invalid username/email or password",
        });
        return;
      }

      // Check if password matches
      if (adminData.password === trimmedPassword) {

        // Sign into Firebase Auth so RTDB rules can verify admin role
        if (adminData.firebaseEmail && adminData.firebasePassword) {
          try {
            await signInWithEmailAndPassword(
              auth,
              adminData.firebaseEmail,
              adminData.firebasePassword
            );
          } catch (authError) {
            // Provide user-friendly error messages
            let errorMessage = "Authentication failed. Please contact administrator.";
            if (authError.code === "auth/user-disabled") {
              errorMessage = "This account has been disabled. Please contact administrator.";
            } else if (authError.code === "auth/invalid-credential" || authError.code === "auth/wrong-password") {
              errorMessage = "Invalid credentials. Please check your username and password.";
            } else if (authError.code === "auth/network-request-failed") {
              errorMessage = "Network error. Please check your connection and try again.";
            }
            setError(errorMessage);
            return;
          }
        } else {
          setError(
            "Admin account not properly configured. Please contact administrator."
          );
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
          sections: adminData.sections || (adminData.section ? [adminData.section] : [])
        });
        
        // Navigate based on role - check both string and constant
        if (adminRole === 'adviser' || adminRole === ROLES.ADVISER) {
          // Adviser (Admin 3) goes to Student Dashboard
          navigate("/StudentDashboard", { replace: true });
        } else {
          // Super Admin, Coordinator, or any other role goes to Dashboard
          navigate("/dashboard", { replace: true });
        }
      } else {
        setError("Invalid username/email or password");
        setFieldErrors({
          username: "Invalid username/email or password",
          password: "Invalid username/email or password",
        });
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
            <h1>Admin Management System</h1>
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
              <div className="form-group">
                <label htmlFor="username-input">Username or Email</label>
                <input
                  ref={usernameInputRef}
                  id="username-input"
                  type="text"
                  name="username"
                  placeholder="Enter your username or email"
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
                {isLoading ? "Signing in..." : "Sign in as Admin"}
              </button>
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
