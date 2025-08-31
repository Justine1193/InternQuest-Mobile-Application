/**
 * AdminLogin - Login page for admin users
 * Handles authentication against Firestore adminusers collection
 *
 * @component
 * @example
 * <AdminLogin />
 */

import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { useNavigate } from "react-router-dom";
import "./AdminLogin.css";
import { FaRegEye, FaRegEyeSlash } from "react-icons/fa";
import { collection, query, where, getDocs, addDoc } from "firebase/firestore";
import { db } from "../../../firebase";
import InternQuestLogo from "../../assets/InternQuest_with_text_white.png";

const AdminLogin = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });
  const [error, setError] = useState("");

  // Set the document title on mount
  useEffect(() => {
    document.title = "Login";
  }, []);

  // Handles changes to input fields (username, password)
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  // Toggles the visibility of the password input
  const togglePasswordVisibility = () => {
    setShowPassword((prev) => !prev);
  };



  // Handles form submission and authentication logic
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.username || !formData.password) {
      setError("Please fill in all fields");
      return;
    }
    setIsLoading(true);
    setError("");
    try {
      console.log("Attempting login with:", formData.username);
      // Query the admins collection for the username
      const adminsRef = collection(db, "adminusers");
      const q = query(adminsRef, where("username", "==", formData.username));
      const querySnapshot = await getDocs(q);
      console.log("Query result:", querySnapshot.size, "documents found");

      if (querySnapshot.empty) {
        setError("Invalid username or password");
        return;
      }
      // Get the admin document
      const adminDoc = querySnapshot.docs[0];
      const adminData = adminDoc.data();
      console.log("Admin data found:", adminData);

      // Check if password matches
      if (adminData.password === formData.password) {
        console.log("Password match successful, navigating to dashboard");
        navigate("/dashboard");
      } else {
        console.log("Password mismatch");
        setError("Invalid username or password");
      }
    } catch (err) {
      console.error("Login error:", err);
      setError(`Login error: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-page">
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
                <label htmlFor="username-input">Username</label>
                <input
                  id="username-input"
                  type="text"
                  name="username"
                  placeholder="Enter Your Username"
                  className="form-input"
                  value={formData.username}
                  onChange={handleChange}
                  disabled={isLoading}
                  autoComplete="username"
                  aria-required="true"
                />
              </div>
              <div className="form-group">
                <label htmlFor="password-input">Password</label>
                <div className="password-input-container">
                  <input
                    id="password-input"
                    type={showPassword ? "text" : "password"}
                    name="password"
                    placeholder="Enter your password"
                    className="form-input"
                    value={formData.password}
                    onChange={handleChange}
                    disabled={isLoading}
                    autoComplete="current-password"
                    aria-required="true"
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
