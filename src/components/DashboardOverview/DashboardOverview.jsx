/**
 * DashboardOverview - Displays dashboard statistics and a notification sender
 *
 * @component
 * @param {object} stats - Dashboard statistics (totalCompanies, totalStudents)
 * @param {function} onSendNotification - Handler for sending notifications
 * @example
 * <DashboardOverview stats={{ totalCompanies: 10, totalStudents: 50 }} onSendNotification={handleSend} />
 */

import React, { useState } from "react";
import PropTypes from "prop-types";
import "./DashboardOverview.css";

const DashboardOverview = ({ stats, onSendNotification }) => {
  // State for notification input
  const [notificationText, setNotificationText] = useState("");

  // Handles sending a notification
  const handleSendNotification = () => {
    if (notificationText.trim()) {
      onSendNotification(notificationText);
      setNotificationText("");
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
          <h3>Notifications</h3>
          <p>Quick Notifications</p>
          <div className="notification-content">
            <input
              type="text"
              placeholder="Send alerts..."
              value={notificationText}
              onChange={(e) => setNotificationText(e.target.value)}
              className="notification-input"
            />
            <button
              className="send-notification-btn"
              onClick={handleSendNotification}
            >
              Send Now
            </button>
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
