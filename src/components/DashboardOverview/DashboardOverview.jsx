import React, { useState } from 'react';
import './DashboardOverview.css';

const DashboardOverview = ({ stats, onSendNotification }) => {
  const [notificationText, setNotificationText] = useState('');

  const handleSendNotification = () => {
    if (notificationText.trim()) {
      onSendNotification(notificationText);
      setNotificationText('');
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

export default DashboardOverview; 