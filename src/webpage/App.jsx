import "./App.css";
import React from "react";
import Login from "../components/LoginComponents/AdminLogin.jsx";
import Dashboard from "../components/CompanyManageComponents/CompanyDashboard.jsx";
import StudentDashboard from "../components/StudentManageComponents/StudentDashboard.jsx";
import HelpDeskDashboard from "../components/HelpDeskComponents/HelpDeskDashboard.jsx";
import ProtectedRoute from "../components/ProtectedRoute.jsx";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/StudentDashboard"
          element={
            <ProtectedRoute>
              <StudentDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/helpDesk"
          element={
            <ProtectedRoute>
              <HelpDeskDashboard />
            </ProtectedRoute>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
