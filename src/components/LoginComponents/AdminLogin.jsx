import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./AdminLogin.css";
import { FaRegEye, FaRegEyeSlash } from "react-icons/fa";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "../../../firebase";
import InternQuestLogo from "../../assets/InternQuest_with_text_white.png";

const Login = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });
  const [error, setError] = useState("");

  useEffect(() => {
    document.title = "Login";
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.username || !formData.password) {
      setError("Please fill in all fields");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      // Query the admins collection for the username
      const adminsRef = collection(db, "adminusers");
      const q = query(adminsRef, where("username", "==", formData.username));
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        setError("Invalid username or password");
        return;
      }

      // Get the admin document
      const adminDoc = querySnapshot.docs[0];
      const adminData = adminDoc.data();

      // Check if password matches
      if (adminData.password === formData.password) {
        // If credentials are correct, navigate to dashboard
        navigate("/dashboard");
      } else {
        setError("Invalid username or password");
      }
    } catch (err) {
      console.error("Login error:", err);
      setError("Invalid username or password");
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
            <form className="login-form" onSubmit={handleSubmit}>
              {error && <div className="error-message">{error}</div>}
              <div className="form-group">
                <label>Username</label>
                <input
                  type="text"
                  name="username"
                  placeholder="Enter Your Username"
                  className="form-input"
                  value={formData.username}
                  onChange={handleChange}
                  disabled={isLoading}
                />
              </div>
              <div className="form-group">
                <label>Password</label>
                <div className="password-input-container">
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    placeholder="Enter your password"
                    className="form-input"
                    value={formData.password}
                    onChange={handleChange}
                    disabled={isLoading}
                  />
                  <span
                    className="password-toggle"
                    onClick={togglePasswordVisibility}
                  >
                    {showPassword ? <FaRegEyeSlash /> : <FaRegEye />}
                  </span>
                </div>
              </div>
              <button
                type="submit"
                className={`sign-in-button ${isLoading ? "loading" : ""}`}
                disabled={isLoading}
              >
                Sign in as Admin
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
