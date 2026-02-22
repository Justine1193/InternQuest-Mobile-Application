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
const ResourceManagementDashboard = lazy(() => import("../components/ResourceManagementComponents/ResourceManagementDashboard.jsx"));
const UserRoleManagement = lazy(() => import("../components/UserRoleManagementComponents/UserRoleManagement.jsx"));
const DeletedRecords = lazy(() => import("../components/DeletedRecords/DeletedRecords.jsx"));
const ActivityLogViewer = lazy(() => import("../components/ActivityLog/ActivityLogViewer.jsx"));
const ForgotPassword = lazy(() => import("../components/ForgotPassword/ForgotPassword.jsx"));
const ChangePassword = lazy(() => import("../components/ChangePassword/ChangePassword.jsx"));
const PlatformData = lazy(() => import("../components/PlatformData/PlatformData.jsx"));

// Loading fallback component
const PageLoader = () => (
  <div
    className="page-loader"
    style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '100vh',
      background: 'var(--iq-bg, var(--background-color, #f7f9fb))',
      color: 'var(--iq-text-main, var(--text-color, #213547))',
    }}
  >
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
                <UserRoleManagement />
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
                <ChangePassword />
              </ProtectedRoute>
            }
          />
          <Route
            path="/platform-data"
            element={
              <ProtectedRoute allowedRoles={[ROLES.SUPER_ADMIN]}>
                <PlatformData />
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
