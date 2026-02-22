/**
 * Activity Log Viewer – displays admin activity logs for audit trail.
 */

import React, { useState, useEffect } from "react";
import {
  collection,
  query,
  orderBy,
  limit,
  getDocs,
  startAfter,
} from "firebase/firestore";
import { signOut } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import {
  IoTimeOutline,
  IoPersonOutline,
  IoCheckmarkCircle,
  IoCloseCircle,
  IoInformationCircle,
  IoSearchOutline,
  IoStatsChartOutline,
  IoCalendarOutline,
} from "react-icons/io5";
import { db, auth } from "../../../firebase";
import { useToast } from "../../hooks/useToast.js";
import { clearAdminSession, ROLES } from "../../utils/auth";
import logger from "../../utils/logger.js";
import ToastContainer from "../Toast/ToastContainer.jsx";
import LoadingSpinner from "../LoadingSpinner.jsx";
import Navbar from "../Navbar/Navbar.jsx";
import Footer from "../Footer/Footer.jsx";
import "./ActivityLogViewer.css";

const PAGE_SIZE = 20;

const getRoleDisplayName = (role) => {
  if (!role) return "unknown";
  const normalizedRole = role === "super_admin" ? "admin" : role;
  switch (normalizedRole) {
    case ROLES.SUPER_ADMIN:
    case "admin":
      return "Admin";
    case ROLES.COORDINATOR:
    case "coordinator":
      return "Coordinator";
    case ROLES.ADVISER:
    case "adviser":
      return "Adviser";
    default:
      return normalizedRole || "unknown";
  }
};

const ActivityLogViewer = () => {
  const [activities, setActivities] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [lastDoc, setLastDoc] = useState(null);
  const [hasMore, setHasMore] = useState(true);
  const [filter, setFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const { toasts, removeToast, error: showError } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    document.title = "Activity Log | InternQuest Admin";
    fetchActivities();
  }, []);

  const fetchActivities = async (loadMore = false) => {
    try {
      setIsLoading(true);
      if (!auth.currentUser) {
        showError("You must be logged in to view activity logs.");
        setIsLoading(false);
        return;
      }

      let q = query(
        collection(db, "activity_logs"),
        orderBy("timestamp", "desc"),
        limit(PAGE_SIZE)
      );
      if (loadMore && lastDoc) {
        q = query(
          collection(db, "activity_logs"),
          orderBy("timestamp", "desc"),
          startAfter(lastDoc),
          limit(PAGE_SIZE)
        );
      }

      const snapshot = await getDocs(q);
      const newActivities = snapshot.docs.map((doc) => {
        const data = doc.data();
        const ts =
          data.timestamp ??
          (data.createdAt ? { toDate: () => new Date(data.createdAt) } : null);
        return { id: doc.id, ...data, timestamp: ts };
      });

      if (loadMore) {
        setActivities((prev) => [...prev, ...newActivities]);
      } else {
        setActivities(newActivities);
      }

      const docCount = snapshot.docs.length;
      setHasMore(docCount >= PAGE_SIZE);
      if (docCount >= PAGE_SIZE) {
        setLastDoc(snapshot.docs[docCount - 1]);
      }
    } catch (err) {
      logger.error("Error fetching activity logs:", err);
      if (err.code === "permission-denied") {
        showError(
          "Permission denied. Please make sure you're logged in and have access to view activity logs."
        );
      } else if (err.code === "failed-precondition") {
        showError(
          "Firestore index required. Please check the Firebase console for index creation link."
        );
        logger.error("Index error details:", err.message);
      } else {
        showError(`Failed to load activity logs: ${err.message}`);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      clearAdminSession();
      navigate("/", { replace: true });
    } catch (err) {
      logger.error("Logout error:", err);
    }
  };

  const getActionIcon = (status) => {
    switch (status) {
      case "success":
        return <IoCheckmarkCircle className="activity-icon success" />;
      case "error":
        return <IoCloseCircle className="activity-icon error" />;
      default:
        return <IoInformationCircle className="activity-icon info" />;
    }
  };

  const formatAction = (action) =>
    (action || "")
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");

  const formatRelativeTime = (timestamp) => {
    if (!timestamp) return "Unknown time";
    try {
      let date;
      if (timestamp.toDate) {
        date = timestamp.toDate();
      } else if (timestamp instanceof Date) {
        date = timestamp;
      } else if (typeof timestamp === "string" || typeof timestamp === "number") {
        date = new Date(timestamp);
      } else {
        return "Unknown time";
      }
      if (isNaN(date.getTime())) return "Unknown time";

      const now = new Date();
      const diffInSeconds = Math.floor((now - date) / 1000);

      if (diffInSeconds < 60) return "Just now";
      if (diffInSeconds < 3600) {
        const minutes = Math.floor(diffInSeconds / 60);
        return `${minutes} minute${minutes !== 1 ? "s" : ""} ago`;
      }
      if (diffInSeconds < 86400) {
        const hours = Math.floor(diffInSeconds / 3600);
        return `${hours} hour${hours !== 1 ? "s" : ""} ago`;
      }
      if (diffInSeconds < 604800) {
        const days = Math.floor(diffInSeconds / 86400);
        return `${days} day${days !== 1 ? "s" : ""} ago`;
      }
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: date.getFullYear() !== now.getFullYear() ? "numeric" : undefined,
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return "Unknown time";
    }
  };

  const getStats = () => {
    const total = activities.length;
    const success = activities.filter((a) => a.status === "success").length;
    const errors = activities.filter((a) => a.status === "error").length;
    return { total, success, errors };
  };

  const filteredActivities = activities.filter((activity) => {
    if (filter !== "all" && activity.status !== filter) return false;
    if (!searchQuery.trim()) return true;

    const searchLower = searchQuery.toLowerCase();
    const action = formatAction(activity.action).toLowerCase();
    const entityType = (activity.entityType || "").toLowerCase();
    const adminUsername = (activity.adminUsername || "").toLowerCase();
    const adminRole = (activity.adminRole || "").toLowerCase();
    const entityId = (activity.entityId || "").toLowerCase();

    return (
      action.includes(searchLower) ||
      entityType.includes(searchLower) ||
      adminUsername.includes(searchLower) ||
      adminRole.includes(searchLower) ||
      entityId.includes(searchLower) ||
      (activity.details &&
        JSON.stringify(activity.details).toLowerCase().includes(searchLower))
    );
  });

  useEffect(() => {
    setCurrentPage(1);
  }, [filter, searchQuery]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredActivities.length / PAGE_SIZE)
  );
  const pageStart = (currentPage - 1) * PAGE_SIZE;
  const pageEnd = pageStart + PAGE_SIZE;
  const visibleActivities = filteredActivities.slice(pageStart, pageEnd);
  const stats = getStats();

  const handleNextPage = async () => {
    if (currentPage < totalPages) {
      setCurrentPage((p) => p + 1);
      return;
    }
    if (hasMore && !isLoading) {
      await fetchActivities(true);
      setCurrentPage((p) => p + 1);
    }
  };

  const handlePrevPage = () => {
    setCurrentPage((p) => Math.max(1, p - 1));
  };

  const getPageButtons = () => {
    const buttons = [];
    const last = totalPages;
    if (last <= 7) {
      for (let i = 1; i <= last; i++) buttons.push(i);
      return buttons;
    }
    buttons.push(1);
    if (currentPage > 3) buttons.push("ellipsis-left");
    const start = Math.max(2, currentPage - 1);
    const end = Math.min(last - 1, currentPage + 1);
    for (let i = start; i <= end; i++) buttons.push(i);
    if (currentPage < last - 2) buttons.push("ellipsis-right");
    buttons.push(last);
    return buttons;
  };

  return (
    <div className="activity-log-container">
      <Navbar onLogout={handleLogout} />
      <div className="activity-log-content">
        <div className="activity-log-header-section">
          <div className="activity-header-content">
            <div className="activity-header-icon-wrapper">
              <IoStatsChartOutline className="activity-header-icon" />
            </div>
            <div>
              <h1>Activity Log</h1>
              <p className="activity-log-subtitle">
                Track all admin actions and system events
              </p>
            </div>
          </div>
        </div>

        <div className="activity-stats-wrapper">
          <div className="activity-stats">
            <div className="activity-stat-card stat-total">
              <div className="stat-icon-wrapper">
                <IoInformationCircle className="stat-icon" />
              </div>
              <div className="stat-content">
                <div className="stat-value">{stats.total}</div>
                <div className="stat-label">Total Activities</div>
              </div>
            </div>
            <div className="activity-stat-card stat-success">
              <div className="stat-icon-wrapper">
                <IoCheckmarkCircle className="stat-icon" />
              </div>
              <div className="stat-content">
                <div className="stat-value">{stats.success}</div>
                <div className="stat-label">Successful</div>
              </div>
            </div>
            <div className="activity-stat-card stat-error">
              <div className="stat-icon-wrapper">
                <IoCloseCircle className="stat-icon" />
              </div>
              <div className="stat-content">
                <div className="stat-value">{stats.errors}</div>
                <div className="stat-label">Errors</div>
              </div>
            </div>
          </div>
        </div>

        <div className="activity-controls-section">
          <div className="activity-search-wrapper">
            <IoSearchOutline className="search-icon" />
            <input
              type="text"
              placeholder="Search activities..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="activity-search-input"
            />
            {searchQuery && (
              <button
                className="search-clear-btn"
                onClick={() => setSearchQuery("")}
                aria-label="Clear search"
              >
                ×
              </button>
            )}
          </div>
          <div className="activity-log-filters">
            <button
              className={`filter-btn ${filter === "all" ? "active" : ""}`}
              onClick={() => setFilter("all")}
            >
              All
            </button>
            <button
              className={`filter-btn ${filter === "success" ? "active" : ""}`}
              onClick={() => setFilter("success")}
            >
              <IoCheckmarkCircle />
              Success
            </button>
            <button
              className={`filter-btn ${filter === "error" ? "active" : ""}`}
              onClick={() => setFilter("error")}
            >
              <IoCloseCircle />
              Errors
            </button>
          </div>
        </div>

        <div className="activity-log-list">
          {isLoading && activities.length === 0 ? (
            <LoadingSpinner
              isLoading={true}
              message="Loading activity logs..."
            />
          ) : filteredActivities.length === 0 ? (
            <div className="no-activities">
              <div className="empty-state-icon">
                <IoStatsChartOutline />
              </div>
              <h3 className="empty-state-title">
                {searchQuery || filter !== "all"
                  ? "No activities found"
                  : "No activity logs yet"}
              </h3>
              <p className="empty-state-description">
                {searchQuery || filter !== "all"
                  ? "Try adjusting your search or filter criteria."
                  : "Activity logs will appear here as admins perform actions."}
              </p>
            </div>
          ) : (
            visibleActivities.map((activity) => {
              const timestamp = activity.createdAt
                ? new Date(activity.createdAt)
                : activity.timestamp?.toDate?.() ?? null;

              return (
                <div
                  key={activity.id}
                  className={`activity-item activity-${
                    activity.status || "info"
                  }`}
                >
                  <div className="activity-icon-wrapper">
                    {getActionIcon(activity.status)}
                  </div>
                  <div className="activity-content">
                    <div className="activity-header">
                      <div className="activity-title-group">
                        <span className="activity-action">
                          {formatAction(activity.action)}
                        </span>
                        {activity.entityType && (
                          <span className="activity-entity">
                            {activity.entityType}
                          </span>
                        )}
                      </div>
                      <span className="activity-time">
                        <IoTimeOutline />
                        {formatRelativeTime(timestamp ?? activity.timestamp)}
                      </span>
                    </div>
                    <div className="activity-details">
                      <div className="activity-meta">
                        <span className="activity-admin">
                          <IoPersonOutline />
                          <span className="admin-name">
                            {activity.adminUsername || "Unknown"}
                          </span>
                          <span className="admin-role">
                            ({getRoleDisplayName(activity.adminRole)})
                          </span>
                        </span>
                        {activity.entityId && (
                          <span className="activity-entity-id">
                            ID: {activity.entityId}
                          </span>
                        )}
                      </div>
                      {activity.details &&
                        Object.keys(activity.details).length > 0 && (
                          <div className="activity-details-content">
                            {Object.entries(activity.details).map(
                              ([key, value]) => (
                                <span
                                  key={key}
                                  className="activity-detail-item"
                                >
                                  <strong>{key}:</strong> {String(value)}
                                </span>
                              )
                            )}
                          </div>
                        )}
                    </div>
                    {timestamp && (
                      <div className="activity-footer">
                        <span className="activity-full-time">
                          <IoCalendarOutline />
                          {timestamp.toLocaleString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {filteredActivities.length > 0 && (
          <div className="activity-pagination">
            <div className="activity-pagination-left">
              <span className="activity-pagination-info">
                Showing {Math.min(pageStart + 1, filteredActivities.length)}–
                {Math.min(pageEnd, filteredActivities.length)} of{" "}
                {filteredActivities.length}
              </span>
              {hasMore && (
                <span
                  className="activity-pagination-badge"
                  title="More logs available to load"
                >
                  More available
                </span>
              )}
            </div>
            <div
              className="activity-pagination-controls"
              role="navigation"
              aria-label="Activity log pages"
            >
              <button
                type="button"
                className="activity-page-btn"
                onClick={handlePrevPage}
                disabled={currentPage === 1 || isLoading}
                aria-label="Previous page"
              >
                ‹
              </button>
              <div className="activity-page-numbers" aria-label="Page numbers">
                {getPageButtons().map((item) => {
                  if (typeof item === "string" && item.startsWith("ellipsis")) {
                    return (
                      <span
                        key={item}
                        className="activity-page-ellipsis"
                        aria-hidden="true"
                      >
                        …
                      </span>
                    );
                  }
                  const page = item;
                  const isActive = page === currentPage;
                  return (
                    <button
                      key={page}
                      type="button"
                      className={`activity-page-btn ${
                        isActive ? "active" : ""
                      }`}
                      onClick={() => setCurrentPage(page)}
                      disabled={isLoading}
                      aria-current={isActive ? "page" : undefined}
                    >
                      {page}
                    </button>
                  );
                })}
              </div>
              <button
                type="button"
                className="activity-page-btn"
                onClick={handleNextPage}
                disabled={(!hasMore && currentPage >= totalPages) || isLoading}
                aria-label={
                  hasMore ? "Next page (loads more if needed)" : "Next page"
                }
              >
                {isLoading ? (
                  <span className="spinner-small" aria-hidden="true"></span>
                ) : (
                  "›"
                )}
              </button>
            </div>
          </div>
        )}
      </div>
      <ToastContainer toasts={toasts} removeToast={removeToast} />
      <Footer />
    </div>
  );
};

export default ActivityLogViewer;
