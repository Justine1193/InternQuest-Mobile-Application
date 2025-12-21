import "./App.css";
import React, { lazy, Suspense } from "react";
import Login from "../components/LoginComponents/AdminLogin.jsx";
import ProtectedRoute from "../components/ProtectedRoute.jsx";
import ErrorBoundary from "../components/ErrorBoundary/ErrorBoundary.jsx";
import LoadingSpinner from "../components/LoadingSpinner.jsx";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { ROLES } from "../utils/auth";

// Code splitting - lazy load components for better performance
const Dashboard = lazy(() => import("../components/CompanyManageComponents/CompanyDashboard.jsx"));
const StudentDashboard = lazy(() => import("../components/StudentManageComponents/StudentDashboard.jsx"));
const HelpDeskDashboard = lazy(() => import("../components/HelpDeskComponents/HelpDeskDashboard.jsx"));
const AdminManagement = lazy(() => import("../components/AdminManagementComponents/AdminManagement.jsx"));
const DeletedRecords = lazy(() => import("../components/DeletedRecords/DeletedRecords.jsx"));
const ActivityLogViewer = lazy(() => import("../components/ActivityLog/ActivityLogViewer.jsx"));

// Loading fallback component
const PageLoader = () => (
  <div style={{ 
    display: 'flex', 
    justifyContent: 'center', 
    alignItems: 'center', 
    minHeight: '100vh',
    background: '#f7f9fb'
  }}>
    <LoadingSpinner isLoading={true} message="Loading page..." />
  </div>
);

function App() {
  return (
    <ErrorBoundary>
      <Router>
        <Suspense fallback={<PageLoader />}>
          <Routes>
            <Route path="/" element={<Login />} />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute
                  allowedRoles={[ROLES.SUPER_ADMIN, ROLES.COORDINATOR]}
                >
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            {/* Keep old route for backward compatibility */}
            <Route
              path="/StudentDashboard"
              element={
                <ProtectedRoute>
                  <StudentDashboard />
                </ProtectedRoute>
              }
            />
            {/* New consistent route */}
            <Route
              path="/students"
              element={
                <ProtectedRoute>
                  <StudentDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/helpDesk"
              element={
                <ProtectedRoute
                  allowedRoles={[ROLES.SUPER_ADMIN, ROLES.COORDINATOR]}
                >
                  <HelpDeskDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/adminManagement"
              element={
                <ProtectedRoute
                  allowedRoles={[ROLES.SUPER_ADMIN, ROLES.COORDINATOR]}
                >
                  <AdminManagement />
                </ProtectedRoute>
              }
            />
            {/* Keep old route for backward compatibility */}
            <Route
              path="/deleted"
              element={
                <ProtectedRoute
                  allowedRoles={[ROLES.SUPER_ADMIN, ROLES.COORDINATOR]}
                >
                  <DeletedRecords />
                </ProtectedRoute>
              }
            />
            {/* New consistent route */}
            <Route
              path="/archive"
              element={
                <ProtectedRoute
                  allowedRoles={[ROLES.SUPER_ADMIN, ROLES.COORDINATOR]}
                >
                  <DeletedRecords />
                </ProtectedRoute>
              }
            />
            <Route
              path="/activityLog"
              element={
                <ProtectedRoute
                  allowedRoles={[ROLES.SUPER_ADMIN, ROLES.COORDINATOR]}
                >
                  <ActivityLogViewer />
                </ProtectedRoute>
              }
            />
          </Routes>
        </Suspense>
      </Router>
    </ErrorBoundary>
  );
}

export default App;
