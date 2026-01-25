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
const ResourceManagementDashboard = lazy(() => import("../components/HelpDeskComponents/ResourceManagementDashboard.jsx"));
const AdminManagement = lazy(() => import("../components/AdminManagementComponents/AdminManagement.jsx"));
const DeletedRecords = lazy(() => import("../components/DeletedRecords/DeletedRecords.jsx"));
const ActivityLogViewer = lazy(() => import("../components/ActivityLog/ActivityLogViewer.jsx"));
const PasswordChange = lazy(() => import("../components/PasswordChange/PasswordChange.jsx"));
const ForgotPassword = lazy(() => import("../components/ForgotPassword/ForgotPassword.jsx"));
const SecuritySettings = lazy(() => import("../components/SecuritySettings/SecuritySettings.jsx"));
// const SignatureManagement = lazy(() => import("../components/SignatureManagement/SignatureManagement.jsx")); // Removed

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
              path="/forgot-password"
              element={<ForgotPassword />}
            />
            <Route
              path="/change-password"
              element={<PasswordChange />}
            />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
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
          {/* Keep old route for backward compatibility */}
          <Route
            path="/helpDesk"
            element={
              <ProtectedRoute
                allowedRoles={[ROLES.SUPER_ADMIN, ROLES.COORDINATOR]}
              >
                <ResourceManagementDashboard />
              </ProtectedRoute>
            }
          />
          {/* New consistent route */}
          <Route
            path="/resource-management"
            element={
              <ProtectedRoute
                allowedRoles={[ROLES.SUPER_ADMIN, ROLES.COORDINATOR]}
              >
                <ResourceManagementDashboard />
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
                allowedRoles={[ROLES.SUPER_ADMIN]}
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
                  allowedRoles={[ROLES.SUPER_ADMIN]}
                >
                  <DeletedRecords />
                </ProtectedRoute>
              }
            />
          <Route
            path="/activityLog"
            element={
              <ProtectedRoute
                allowedRoles={[ROLES.SUPER_ADMIN]}
              >
                <ActivityLogViewer />
              </ProtectedRoute>
            }
          />
          <Route
            path="/security-settings"
            element={
              <ProtectedRoute>
                <SecuritySettings />
              </ProtectedRoute>
            }
          />
          {/* Signature Management route removed */}
        </Routes>
        </Suspense>
      </Router>
    </ErrorBoundary>
  );
}

export default App;
