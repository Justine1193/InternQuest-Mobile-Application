/**
 * ForgotPassword - Mixed flow:
 * 1) Try to send a password reset email using Firebase Auth (if the account has a valid email)
 * 2) Also shows instructions for who to contact if email reset is not possible
 *
 * @component
 * @example
 * <ForgotPassword />
 */

import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "../../../firebase";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "../../../firebase";
import InternQuestLogo from "../../assets/InternQuest_with_text_white.png";
import "./ForgotPassword.css";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [emailError, setEmailError] = useState("");

  useEffect(() => {
    document.title = "Forgot Password | InternQuest Admin";
  }, []);

  const validateEmail = (emailValue) => {
    if (!emailValue.trim()) {
      return "Email is required";
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(emailValue.trim())) {
      return "Please enter a valid email address";
    }
    return "";
  };

  const handleChange = (e) => {
    const value = e.target.value;
    setEmail(value);
    setEmailError("");
    setError("");
    setSuccess(false);
  };

  const handleBlur = () => {
    const validationError = validateEmail(email);
    setEmailError(validationError);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess(false);
    setEmailError("");

    const trimmedEmail = email.trim();
    const validationError = validateEmail(trimmedEmail);

    if (validationError) {
      setEmailError(validationError);
      return;
    }

    setIsLoading(true);

    try {
      // First, check if this email exists in Firestore adminusers collection
      const adminsRef = collection(db, "adminusers");
      const emailQuery = query(adminsRef, where("email", "==", trimmedEmail));
      const emailSnapshot = await getDocs(emailQuery);

      // Also check firebaseEmail field
      const firebaseEmailQuery = query(
        adminsRef,
        where("firebaseEmail", "==", trimmedEmail)
      );
      const firebaseEmailSnapshot = await getDocs(firebaseEmailQuery);

      let adminData = null;
      let firebaseEmailToUse = null;

      if (!emailSnapshot.empty) {
        adminData = emailSnapshot.docs[0].data();
        firebaseEmailToUse = adminData.firebaseEmail || trimmedEmail;
      } else if (!firebaseEmailSnapshot.empty) {
        adminData = firebaseEmailSnapshot.docs[0].data();
        firebaseEmailToUse = adminData.firebaseEmail || trimmedEmail;
      }

      if (!adminData) {
        setError(
          "No account found with this email address. Please check your email and try again."
        );
        setIsLoading(false);
        return;
      }

      // Use firebaseEmail if available, otherwise use the provided email
      const emailToSend = firebaseEmailToUse || trimmedEmail;

      // Validate emailToSend is not empty and is a valid email
      if (!emailToSend || !emailToSend.trim()) {
        setError(
          "Invalid email address. Please contact your coordinator or admin to reset your password."
        );
        setIsLoading(false);
        return;
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(emailToSend.trim())) {
        setError(
          "Invalid email format. Please contact your coordinator or admin to reset your password."
        );
        setIsLoading(false);
        return;
      }

      // Send password reset email via Firebase Auth
      await sendPasswordResetEmail(auth, emailToSend.trim());

      setSuccess(true);
      setEmail("");
    } catch (err) {
      console.error("Password reset error:", err);
      let errorMessage = "Failed to send password reset email. ";

      if (err.code === "auth/user-not-found") {
        errorMessage =
          "No account found in Firebase Authentication for this email. Please contact your coordinator or admin to reset your password.";
      } else if (err.code === "auth/invalid-email") {
        errorMessage =
          "Invalid email address. Please contact your coordinator or admin to reset your password.";
      } else if (err.code === "auth/network-request-failed") {
        errorMessage =
          "Network error. Please check your connection and try again.";
      } else if (
        err.code === "auth/invalid-argument" ||
        err.message?.includes("400") ||
        err.message?.includes("Bad Request")
      ) {
        errorMessage =
          "Invalid email configuration. Please contact your coordinator or admin to reset your password.";
      } else {
        errorMessage += err.message || "An unexpected error occurred.";
      }

      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="forgot-password-page">
      <div className="forgot-password-container">
        <div className="left-container">
          <img
            src={InternQuestLogo}
            alt="InternQuest Logo"
            className="brand-logo"
          />
        </div>
        <div className="right-container">
          <div className="forgot-password-card">
            <h1>Forgot Password?</h1>
            <p className="instruction-text">
              If your account has a registered email, we can send a reset link.
              If not, please follow the instructions below to contact the right
              person.
            </p>

            {error && (
              <div className="error-message" role="alert">
                {error}
              </div>
            )}

            {success && (
              <div className="success-message" role="alert">
                <strong>Password reset email sent!</strong>
                <p style={{ marginTop: "8px", fontSize: "14px" }}>
                  Please check your email inbox and follow the instructions to
                  reset your password. The email may take a few minutes to
                  arrive.
                </p>
              </div>
            )}

            {!success && (
              <form onSubmit={handleSubmit} className="forgot-password-form">
                <div className="form-group">
                  <label htmlFor="email-input">Email Address</label>
                  <input
                    id="email-input"
                    type="email"
                    name="email"
                    placeholder="Enter your email address"
                    className={`form-input ${emailError ? "error" : ""}`}
                    value={email}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    disabled={isLoading}
                    autoComplete="email"
                    aria-required="true"
                    aria-invalid={emailError ? "true" : "false"}
                    aria-describedby={emailError ? "email-error" : undefined}
                  />
                  {emailError && (
                    <span id="email-error" className="field-error" role="alert">
                      {emailError}
                    </span>
                  )}
                </div>

                <button
                  type="submit"
                  className="reset-password-button"
                  disabled={isLoading}
                  aria-busy={isLoading}
                >
                  {isLoading ? "Sending..." : "Send Reset Link"}
                </button>
              </form>
            )}

            <div
              className="instruction-text"
              style={{ marginTop: "20px", borderTop: "1px solid #eee", paddingTop: "14px" }}
            >
              <h3 style={{ marginBottom: "6px" }}>For Advisers</h3>
              <p style={{ fontSize: "14px", marginBottom: "10px" }}>
                If you are an adviser and forgot your password, please go to
                your coordinator. Your coordinator can reset your account
                password for you in the system.
              </p>

              <h3 style={{ marginBottom: "6px" }}>For Coordinators</h3>
              <p style={{ fontSize: "14px", marginBottom: "10px" }}>
                If you are a coordinator and forgot your password, please go to
                your higher coordinator or an admin. They can change your
                password for you.
              </p>

              <h3 style={{ marginBottom: "6px" }}>For Admin / Higher Coordinator</h3>
              <p style={{ fontSize: "14px" }}>
                If you are an admin or higher coordinator and cannot sign in,
                please contact the system owner or super admin so they can reset
                your password.
              </p>
            </div>

            <div className="back-to-login">
              <Link to="/" className="back-link">
                ← Back to Login
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;

