/**
 * Activity Log Viewer Component
 * Displays admin activity logs for audit trail
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
import { db } from "../../../firebase.js";
import { useToast } from "../../hooks/useToast.js";
import ToastContainer from "../Toast/ToastContainer.jsx";
import LoadingSpinner from "../LoadingSpinner.jsx";
import logger from "../../utils/logger.js";
import Navbar from "../Navbar/Navbar.jsx";
import Footer from "../Footer/Footer.jsx";
import { signOut } from "firebase/auth";
import { auth } from "../../../firebase.js";
import { clearAdminSession } from "../../utils/auth";
import { useNavigate } from "react-router-dom";
import "./ActivityLogViewer.css";
import {
  IoTimeOutline,
  IoPersonOutline,
  IoCheckmarkCircle,
  IoCloseCircle,
  IoInformationCircle,
} from "react-icons/io5";

const ActivityLogViewer = () => {
  const [activities, setActivities] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [lastDoc, setLastDoc] = useState(null);
  const [hasMore, setHasMore] = useState(true);
  const [filter, setFilter] = useState("all"); // all, success, error
  const { toasts, removeToast, error: showError } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    document.title = "Activity Log | InternQuest Admin";
    fetchActivities();
  }, [filter]);

  const fetchActivities = async (loadMore = false) => {
    try {
      setIsLoading(true);

      // Check if user is authenticated
      if (!auth.currentUser) {
        showError("You must be logged in to view activity logs.");
        setIsLoading(false);
        return;
      }

      let q = query(
        collection(db, "activity_logs"),
        orderBy("timestamp", "desc"),
        limit(20)
      );

      if (loadMore && lastDoc) {
        q = query(
          collection(db, "activity_logs"),
          orderBy("timestamp", "desc"),
          startAfter(lastDoc),
          limit(20)
        );
      }

      const snapshot = await getDocs(q);
      const newActivities = snapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          // Ensure timestamp is available
          timestamp:
            data.timestamp ||
            (data.createdAt
              ? { toDate: () => new Date(data.createdAt) }
              : null),
        };
      });

      if (loadMore) {
        setActivities((prev) => [...prev, ...newActivities]);
      } else {
        setActivities(newActivities);
      }

      if (snapshot.docs.length < 20) {
        setHasMore(false);
      } else {
        setLastDoc(snapshot.docs[snapshot.docs.length - 1]);
        setHasMore(true);
      }
    } catch (err) {
      logger.error("Error fetching activity logs:", err);

      // Check if it's a permissions error or index error
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

  const formatAction = (action) => {
    return action
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  const filteredActivities =
    filter === "all"
      ? activities
      : activities.filter((activity) => activity.status === filter);

  return (
    <div className="activity-log-container">
      <Navbar onLogout={handleLogout} />
      <div className="activity-log-content">
        <div className="activity-log-header">
          <h1>Activity Log</h1>
          <p className="activity-log-subtitle">
            View all admin actions and system events
          </p>
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
            Success
          </button>
          <button
            className={`filter-btn ${filter === "error" ? "active" : ""}`}
            onClick={() => setFilter("error")}
          >
            Errors
          </button>
        </div>

        <div className="activity-log-list">
          {isLoading && activities.length === 0 ? (
            <LoadingSpinner
              isLoading={true}
              message="Loading activity logs..."
            />
          ) : filteredActivities.length === 0 ? (
            <div className="no-activities">
              <p>No activity logs found.</p>
            </div>
          ) : (
            filteredActivities.map((activity) => (
              <div key={activity.id} className="activity-item">
                <div className="activity-icon-wrapper">
                  {getActionIcon(activity.status)}
                </div>
                <div className="activity-content">
                  <div className="activity-header">
                    <span className="activity-action">
                      {formatAction(activity.action)}
                    </span>
                    <span className="activity-entity">
                      {activity.entityType}
                    </span>
                  </div>
                  <div className="activity-details">
                    <div className="activity-meta">
                      <span className="activity-admin">
                        <IoPersonOutline />
                        {activity.adminUsername || "Unknown"} (
                        {activity.adminRole || "unknown"})
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
                              <span key={key} className="activity-detail-item">
                                <strong>{key}:</strong> {String(value)}
                              </span>
                            )
                          )}
                        </div>
                      )}
                  </div>
                  <div className="activity-footer">
                    <span className="activity-time">
                      <IoTimeOutline />
                      {activity.createdAt
                        ? new Date(activity.createdAt).toLocaleString()
                        : activity.timestamp
                        ? new Date(activity.timestamp.toDate()).toLocaleString()
                        : "Unknown time"}
                    </span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {hasMore && !isLoading && (
          <div className="load-more-container">
            <button
              className="load-more-btn"
              onClick={() => fetchActivities(true)}
              disabled={isLoading}
            >
              {isLoading ? "Loading..." : "Load More"}
            </button>
          </div>
        )}
      </div>
      <ToastContainer toasts={toasts} removeToast={removeToast} />
      <Footer />
    </div>
  );
};

export default ActivityLogViewer;
