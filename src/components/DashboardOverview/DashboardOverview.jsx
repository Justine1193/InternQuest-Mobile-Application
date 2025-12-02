/**
 * DashboardOverview - Displays dashboard statistics and a notification sender
 *
 * @component
 * @param {object} stats - Dashboard statistics (totalCompanies, totalStudents)
 * @param {function} onSendNotification - Handler for sending notifications
 * @example
 * <DashboardOverview stats={{ totalCompanies: 10, totalStudents: 50 }} onSendNotification={handleSend} />
 */

import React, { useState, useEffect, useRef } from "react";
import PropTypes from "prop-types";
import {
  collection,
  getDocs,
  query,
  orderBy,
  limit,
  deleteDoc,
  doc,
} from "firebase/firestore";
import { IoTrashOutline } from "react-icons/io5";
import { db } from "../../../firebase.js";
import "./DashboardOverview.css";

const DashboardOverview = ({ stats, onSendNotification }) => {
  // State for notification input
  const [notificationText, setNotificationText] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [sentNotifications, setSentNotifications] = useState([]);
  const [showNotificationsList, setShowNotificationsList] = useState(false);
  const audioContextRef = useRef(null);

  // Initialize audio context
  useEffect(() => {
    try {
      audioContextRef.current = new (window.AudioContext ||
        window.webkitAudioContext)();
    } catch (e) {
      console.warn("Audio context not available");
    }
  }, []);

  // Play success sound when notification is sent
  const playSuccessSound = () => {
    try {
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext ||
          window.webkitAudioContext)();
      }

      const ctx = audioContextRef.current;
      // Resume context if suspended (browser autoplay policy)
      if (ctx.state === "suspended") {
        ctx.resume();
      }

      // Success sound: pleasant two-tone chime
      const playTone = (frequency, startTime, duration) => {
        const oscillator = ctx.createOscillator();
        const gainNode = ctx.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(ctx.destination);

        oscillator.frequency.value = frequency;
        oscillator.type = "sine";

        gainNode.gain.setValueAtTime(0, startTime);
        gainNode.gain.linearRampToValueAtTime(0.15, startTime + 0.01);
        gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + duration);

        oscillator.start(startTime);
        oscillator.stop(startTime + duration);
      };

      // Play two tones for a pleasant chime effect
      playTone(523.25, ctx.currentTime, 0.15); // C5
      playTone(659.25, ctx.currentTime + 0.1, 0.2); // E5
    } catch (e) {
      // Silently fail if audio is not available
    }
  };

  // Handles sending a notification
  const handleSendNotification = async () => {
    if (notificationText.trim() && !isSending) {
      setIsSending(true);
      try {
        await onSendNotification(notificationText);
        setNotificationText("");
        // Show success message and play sound
        setShowSuccess(true);
        playSuccessSound();
        // Hide success message after 3 seconds
        setTimeout(() => {
          setShowSuccess(false);
        }, 3000);
      } catch (error) {
        // Error handling is done in parent component
      } finally {
        setIsSending(false);
      }
    }
  };

  // Handle Enter key press
  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !isSending) {
      handleSendNotification();
    }
  };

  // Fetch recent notifications
  const fetchNotifications = async () => {
    try {
      const notificationsQuery = query(
        collection(db, "notifications"),
        orderBy("timestamp", "desc"),
        limit(10)
      );
      const snapshot = await getDocs(notificationsQuery);
      const notifications = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setSentNotifications(notifications);
    } catch (error) {
      console.error("Error fetching notifications:", error);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, [showSuccess]); // Refetch when a new notification is sent

  // Handle deleting a notification
  const handleDeleteNotification = async (notificationId) => {
    if (!window.confirm("Are you sure you want to delete this message?")) {
      return;
    }
    try {
      await deleteDoc(doc(db, "notifications", notificationId));
      // Remove from local state
      setSentNotifications((prev) =>
        prev.filter((notif) => notif.id !== notificationId)
      );
    } catch (error) {
      console.error("Error deleting notification:", error);
      alert("Failed to delete notification. Please try again.");
    }
  };

  return (
    <div className="overview-section">
      <h1>Dashboard Overview</h1>
      <div className="overview-cards">
        <div className="card">
          <h3>Company</h3>
          <p>Total active company</p>
          <div className="count">{stats.totalCompanies}</div>
        </div>
        <div className="card">
          <h3>Students</h3>
          <p>Total Registered students</p>
          <div className="count">{stats.totalStudents}</div>
        </div>
        <div className="card notification-card">
          <div className="notification-header">
            <h3>Notifications</h3>
            <button
              className="view-notifications-btn"
              onClick={() => setShowNotificationsList(!showNotificationsList)}
            >
              {showNotificationsList ? "Hide" : "View"} Messages
            </button>
          </div>
          <p>Quick Notifications</p>
          <div className="notification-content">
            <input
              type="text"
              placeholder="Send alerts..."
              value={notificationText}
              onChange={(e) => setNotificationText(e.target.value)}
              onKeyPress={handleKeyPress}
              className="notification-input"
              disabled={isSending}
            />
            <button
              className={`send-notification-btn ${isSending ? "sending" : ""}`}
              onClick={handleSendNotification}
              disabled={isSending || !notificationText.trim()}
            >
              {isSending ? (
                <>
                  <span className="spinner-small"></span>
                  Sending...
                </>
              ) : (
                "Send Now"
              )}
            </button>
            {showSuccess && (
              <div className="notification-success">
                <span className="success-icon">✓</span>
                Message sent
              </div>
            )}
            {showNotificationsList && (
              <div className="notifications-list">
                <h4>Recent Messages ({sentNotifications.length})</h4>
                {sentNotifications.length === 0 ? (
                  <p className="no-notifications">No messages sent yet.</p>
                ) : (
                  <div className="notifications-scroll">
                    {sentNotifications.map((notif) => (
                      <div key={notif.id} className="notification-item">
                        <div className="notification-item-content">
                          <p className="notification-message">
                            {notif.message}
                          </p>
                          <span className="notification-time">
                            {new Date(notif.timestamp).toLocaleString()}
                          </span>
                        </div>
                        <button
                          className="delete-notification-btn"
                          onClick={() => handleDeleteNotification(notif.id)}
                          title="Delete message"
                          aria-label="Delete notification"
                        >
                          <IoTrashOutline />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

DashboardOverview.propTypes = {
  /** Dashboard statistics */
  stats: PropTypes.shape({
    totalCompanies: PropTypes.number.isRequired,
    totalStudents: PropTypes.number.isRequired,
  }).isRequired,
  /** Handler for sending notifications */
  onSendNotification: PropTypes.func.isRequired,
};

export default DashboardOverview;
