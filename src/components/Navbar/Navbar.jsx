import React, { useState } from "react";
import { IoSettingsOutline } from "react-icons/io5";
import logo from "../../assets/InternQuest_Logo.png";
import "./Navbar.css";

const Navbar = ({ onLogout }) => {
  const [showLogout, setShowLogout] = useState(false);

  return (
    <nav className="top-nav">
      <div className="nav-left">
        <div className="logo">
          <img src={logo} alt="Logo" height="32" />
        </div>
        <div className="nav-links">
          <a href="/dashboard" className="nav-link active">
            Manage Internships
          </a>
          <a href="/studentDashboard" className="nav-link">
            Manage Students
          </a>
        </div>
      </div>
      <div className="nav-right">
        <IoSettingsOutline
          className="settings-icon"
          onClick={() => setShowLogout((prev) => !prev)}
        />
        {showLogout && (
          <div className="logout-dropdown">
            <button onClick={onLogout}>Logout</button>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
