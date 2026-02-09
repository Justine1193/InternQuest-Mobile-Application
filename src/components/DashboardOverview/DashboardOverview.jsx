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
import {
  IoTrashOutline,
  IoBusinessOutline,
  IoPeopleOutline,
  IoNotificationsOutline,
  IoDocumentTextOutline,
  IoWarningOutline,
  IoAlertCircle,
  IoCheckmarkCircle,
  IoSearchOutline,
  IoCloseOutline,
} from "react-icons/io5";
import { db } from "../../../firebase.js";
import ConfirmModal from "../ConfirmModalComponents/ConfirmModal.jsx";
import "./DashboardOverview.css";

const DashboardOverview = ({
  stats,
  onSendNotification,
  students = null,
  showNotifications = true,
}) => {
  // State for notification input
  const [notificationText, setNotificationText] = useState("");
  const [notificationType, setNotificationType] = useState("all"); // "all", "student", "section"
  const [selectedNotificationStudent, setSelectedNotificationStudent] =
    useState("");
  const [selectedNotificationSection, setSelectedNotificationSection] =
    useState("");
  const [studentSearchQuery, setStudentSearchQuery] = useState("");
  const [showStudentDropdown, setShowStudentDropdown] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [sentNotifications, setSentNotifications] = useState([]);
  const [showNotificationsList, setShowNotificationsList] = useState(false);
  const [showDeleteNotificationConfirm, setShowDeleteNotificationConfirm] =
    useState(false);
  const [notificationToDelete, setNotificationToDelete] = useState(null);
  const [currentNotificationPage, setCurrentNotificationPage] = useState(1);
  const [notificationsPerPage] = useState(5);
  const audioContextRef = useRef(null);

  // Initialize audio context
  useEffect(() => {
    try {
      audioContextRef.current = new (window.AudioContext ||
        window.webkitAudioContext)();
    } catch (e) {
      // Audio context not available
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

  // Get unique sections from students (if available)
  const getUniqueSections = () => {
    if (!students || students.length === 0) return [];
    const sections = new Set();
    students.forEach((student) => {
      if (student.section) {
        sections.add(student.section);
      }
    });
    return Array.from(sections).sort();
  };

  // Handles sending a notification
  const handleSendNotification = async () => {
    if (!notificationText.trim() || isSending) return;

    // Validate private notification targets
    if (notificationType === "student" && !selectedNotificationStudent) {
      return;
    }
    if (notificationType === "section" && !selectedNotificationSection) {
      return;
    }

    setIsSending(true);
    try {
      // Prepare notification options
      const options = {
        targetType: notificationType,
      };

      if (notificationType === "student" && selectedNotificationStudent) {
        options.targetStudentId = selectedNotificationStudent;
        const targetStudent = students?.find(
          (s) => s.id === selectedNotificationStudent
        );
        options.targetStudentName = targetStudent
          ? `${targetStudent.firstName} ${targetStudent.lastName}`
          : "Unknown";
      } else if (
        notificationType === "section" &&
        selectedNotificationSection
      ) {
        options.targetSection = selectedNotificationSection;
      }

      await onSendNotification(notificationText, null, null, options);

      // Reset form
      setNotificationText("");
      setNotificationType("all");
      setSelectedNotificationStudent("");
      setSelectedNotificationSection("");

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
  };

  // Handle Enter key press
  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !isSending) {
      handleSendNotification();
    }
  };

  // Fetch recent notifications
  const fetchNotifications = async () => {
    if (!showNotifications) return;
    try {
      const notificationsQuery = query(
        collection(db, "notifications"),
        orderBy("timestamp", "desc")
      );
      const snapshot = await getDocs(notificationsQuery);
      const notifications = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setSentNotifications(notifications);
      // Reset to first page when notifications are fetched
      setCurrentNotificationPage(1);
    } catch (error) {
      console.error("Error fetching notifications:", error);
    }
  };

  useEffect(() => {
    if (showNotifications) {
      fetchNotifications();
    }
  }, [showSuccess, showNotifications]); // Refetch when a new notification is sent

  // Close student dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        notificationType === "student" &&
        students &&
        students.length > 0 &&
        !event.target.closest(".searchable-dropdown")
      ) {
        setShowStudentDropdown(false);
      }
    };

    if (notificationType === "student" && students && students.length > 0) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
      };
    }
  }, [notificationType, students]);

  // Handle deleting a notification
  const handleDeleteNotification = (notificationId) => {
    setNotificationToDelete(notificationId);
    setShowDeleteNotificationConfirm(true);
  };

  const confirmDeleteNotification = async () => {
    if (!notificationToDelete) return;
    try {
      await deleteDoc(doc(db, "notifications", notificationToDelete));
      // Remove from local state
      setSentNotifications((prev) =>
        prev.filter((notif) => notif.id !== notificationToDelete)
      );
      setShowDeleteNotificationConfirm(false);
      setNotificationToDelete(null);
    } catch (error) {
      console.error("Error deleting notification:", error);
      setShowDeleteNotificationConfirm(false);
      setNotificationToDelete(null);
      // Note: Parent component should handle error display via toast
    }
  };

  const cancelDeleteNotification = () => {
    setShowDeleteNotificationConfirm(false);
    setNotificationToDelete(null);
  };

  return (
    <div className="overview-section">
      <h1>Dashboard Overview</h1>
      <div className="overview-cards">
        <div className="card company-card">
          <div className="card-icon-wrapper company-icon">
            <IoBusinessOutline />
          </div>
          <h3>Company</h3>
          <p>Total active company</p>
          <div className="count">{stats.totalCompanies}</div>
        </div>
        <div className="card student-card">
          <div className="card-icon-wrapper student-icon">
            <IoPeopleOutline />
          </div>
          <h3>Students</h3>
          <p>Total Registered students</p>
          <div className="count">{stats.totalStudents}</div>
        </div>
        {stats.moaExpiringSoon !== undefined && (
          <div className="card moa-status-card">
            <div className="card-icon-wrapper moa-icon">
              <IoDocumentTextOutline />
            </div>
            <h3>MOA Status</h3>
            <p>Memorandum of Agreement</p>
            <div className="moa-stats-grid">
              <div className="moa-stat-item valid">
                <IoCheckmarkCircle className="moa-stat-icon" />
                <span className="moa-stat-value">{stats.moaValid || 0}</span>
                <span className="moa-stat-label">Valid</span>
              </div>
              <div className="moa-stat-item expiring">
                <IoWarningOutline className="moa-stat-icon" />
                <span className="moa-stat-value">
                  {stats.moaExpiringSoon || 0}
                </span>
                <span className="moa-stat-label">Expiring Soon</span>
              </div>
              <div className="moa-stat-item expired">
                <IoAlertCircle className="moa-stat-icon" />
                <span className="moa-stat-value">{stats.moaExpired || 0}</span>
                <span className="moa-stat-label">Expired</span>
              </div>
            </div>
            {(stats.moaExpiringSoon > 0 || stats.moaExpired > 0) && (
              <div className="moa-stat-hint">
                <span className="moa-warning-text">
                  {stats.moaExpiringSoon + stats.moaExpired} MOA
                  {stats.moaExpiringSoon + stats.moaExpired !== 1
                    ? "s"
                    : ""}{" "}
                  need attention
                </span>
              </div>
            )}
          </div>
        )}
        {showNotifications && (
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
              {/* Notification Type Selector (only if students data is available) */}
              {students && students.length > 0 && (
                <>
                  <div className="notification-type-selector">
                    <label htmlFor="notification-type">Send to:</label>
                    <select
                      id="notification-type"
                      value={notificationType}
                      onChange={(e) => {
                        setNotificationType(e.target.value);
                        setSelectedNotificationStudent("");
                        setSelectedNotificationSection("");
                        setStudentSearchQuery("");
                        setShowStudentDropdown(false);
                      }}
                      className="notification-type-select"
                      disabled={isSending}
                    >
                      <option value="all">All Students</option>
                      <option value="student">Specific Student</option>
                      <option value="section">Specific Section</option>
                    </select>
                  </div>

                  {/* Student Selector (for private student notification) */}
                  {notificationType === "student" && (
                    <div className="notification-target-selector">
                      <label htmlFor="notification-student">
                        Select Student:
                      </label>
                      <div className="searchable-dropdown">
                        <div className="searchable-dropdown-input-wrapper">
                          <IoSearchOutline className="searchable-dropdown-icon" />
                          <input
                            type="text"
                            id="notification-student"
                            placeholder="Search student by name or ID..."
                            value={
                              selectedNotificationStudent
                                ? (() => {
                                    const student = students.find(
                                      (s) =>
                                        s.id === selectedNotificationStudent
                                    );
                                    return student
                                      ? `${student.firstName} ${
                                          student.lastName
                                        } (${
                                          student.studentId
                                        })`
                                      : "";
                                  })()
                                : studentSearchQuery
                            }
                            onChange={(e) => {
                              setStudentSearchQuery(e.target.value);
                              setShowStudentDropdown(true);
                              if (selectedNotificationStudent) {
                                setSelectedNotificationStudent("");
                              }
                            }}
                            onFocus={() => setShowStudentDropdown(true)}
                            className="searchable-dropdown-input"
                            disabled={isSending}
                            autoComplete="off"
                          />
                          {selectedNotificationStudent && (
                            <button
                              type="button"
                              className="searchable-dropdown-clear"
                              onClick={() => {
                                setSelectedNotificationStudent("");
                                setStudentSearchQuery("");
                              }}
                              disabled={isSending}
                            >
                              <IoCloseOutline />
                            </button>
                          )}
                        </div>
                        {showStudentDropdown && (
                          <div className="searchable-dropdown-list">
                            {students
                              .filter((student) => {
                                if (
                                  !studentSearchQuery.trim() &&
                                  !selectedNotificationStudent
                                )
                                  return true;
                                if (selectedNotificationStudent === student.id)
                                  return false;
                                const query = studentSearchQuery.toLowerCase();
                                const fullName =
                                  `${student.firstName} ${student.lastName}`.toLowerCase();
                                const studentId = (student.studentId || "").toLowerCase();
                                const section = (
                                  student.section || ""
                                ).toLowerCase();
                                return (
                                  fullName.includes(query) ||
                                  studentId.includes(query) ||
                                  section.includes(query)
                                );
                              })
                              .slice(0, 10) // Limit to 10 results for performance
                              .map((student) => (
                                <div
                                  key={student.id}
                                  className={`searchable-dropdown-item ${
                                    selectedNotificationStudent === student.id
                                      ? "selected"
                                      : ""
                                  }`}
                                  onClick={() => {
                                    setSelectedNotificationStudent(student.id);
                                    setStudentSearchQuery("");
                                    setShowStudentDropdown(false);
                                  }}
                                >
                                  <div className="dropdown-item-name">
                                    {student.firstName} {student.lastName}
                                  </div>
                                  <div className="dropdown-item-details">
                                    {student.studentId} - {student.section}
                                  </div>
                                </div>
                              ))}
                            {students.filter((student) => {
                              if (!studentSearchQuery.trim()) return false;
                              const query = studentSearchQuery.toLowerCase();
                              const fullName =
                                `${student.firstName} ${student.lastName}`.toLowerCase();
                              const studentId = (student.studentId || "").toLowerCase();
                              const section = (
                                student.section || ""
                              ).toLowerCase();
                              return (
                                fullName.includes(query) ||
                                studentId.includes(query) ||
                                section.includes(query)
                              );
                            }).length === 0 &&
                              studentSearchQuery.trim() && (
                                <div className="searchable-dropdown-no-results">
                                  No students found
                                </div>
                              )}
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Section Selector (for private section notification) */}
                  {notificationType === "section" && (
                    <div className="notification-target-selector">
                      <label htmlFor="notification-section">
                        Select Section:
                      </label>
                      <select
                        id="notification-section"
                        value={selectedNotificationSection}
                        onChange={(e) =>
                          setSelectedNotificationSection(e.target.value)
                        }
                        className="notification-target-select"
                        disabled={isSending}
                      >
                        <option value="">Choose a section...</option>
                        {getUniqueSections().map((section) => (
                          <option key={section} value={section}>
                            {section}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                </>
              )}

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
                className={`send-notification-btn ${
                  isSending ? "sending" : ""
                }`}
                onClick={handleSendNotification}
                disabled={
                  isSending ||
                  !notificationText.trim() ||
                  (students &&
                    notificationType === "student" &&
                    !selectedNotificationStudent) ||
                  (students &&
                    notificationType === "section" &&
                    !selectedNotificationSection)
                }
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
                    <>
                      <div className="notifications-scroll">
                        {(() => {
                          const totalNotificationPages = Math.ceil(
                            sentNotifications.length / notificationsPerPage
                          );
                          const notificationIndexOfLast =
                            currentNotificationPage * notificationsPerPage;
                          const notificationIndexOfFirst =
                            notificationIndexOfLast - notificationsPerPage;
                          const paginatedNotifications =
                            sentNotifications.slice(
                              notificationIndexOfFirst,
                              notificationIndexOfLast
                            );

                          return paginatedNotifications.map((notif) => (
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
                                onClick={() =>
                                  handleDeleteNotification(notif.id)
                                }
                                title="Delete message"
                                aria-label="Delete notification"
                              >
                                <IoTrashOutline />
                              </button>
                            </div>
                          ));
                        })()}
                      </div>
                      {sentNotifications.length > notificationsPerPage && (
                        <div className="notifications-pagination">
                          <div className="notifications-pagination-info">
                            {(() => {
                              const totalNotificationPages = Math.ceil(
                                sentNotifications.length / notificationsPerPage
                              );
                              const notificationIndexOfLast =
                                currentNotificationPage * notificationsPerPage;
                              const notificationIndexOfFirst =
                                notificationIndexOfLast - notificationsPerPage;
                              return (
                                <>
                                  Showing {notificationIndexOfFirst + 1} to{" "}
                                  {Math.min(
                                    notificationIndexOfLast,
                                    sentNotifications.length
                                  )}{" "}
                                  of {sentNotifications.length}
                                </>
                              );
                            })()}
                          </div>
                          <div className="notifications-pagination-controls">
                            {(() => {
                              const totalNotificationPages = Math.ceil(
                                sentNotifications.length / notificationsPerPage
                              );
                              return (
                                <>
                                  <button
                                    className="notification-pagination-btn"
                                    onClick={() =>
                                      setCurrentNotificationPage((prev) =>
                                        Math.max(1, prev - 1)
                                      )
                                    }
                                    disabled={currentNotificationPage === 1}
                                    aria-label="Previous page"
                                  >
                                    ‹
                                  </button>
                                  {[...Array(totalNotificationPages)].map(
                                    (_, index) => {
                                      const page = index + 1;
                                      if (
                                        page === 1 ||
                                        page === totalNotificationPages ||
                                        (page >= currentNotificationPage - 1 &&
                                          page <= currentNotificationPage + 1)
                                      ) {
                                        return (
                                          <button
                                            key={page}
                                            className={`notification-pagination-btn ${
                                              currentNotificationPage === page
                                                ? "active"
                                                : ""
                                            }`}
                                            onClick={() =>
                                              setCurrentNotificationPage(page)
                                            }
                                            aria-label={`Go to page ${page}`}
                                          >
                                            {page}
                                          </button>
                                        );
                                      } else if (
                                        page === currentNotificationPage - 2 ||
                                        page === currentNotificationPage + 2
                                      ) {
                                        return (
                                          <span
                                            key={page}
                                            className="notification-pagination-ellipsis"
                                          >
                                            ...
                                          </span>
                                        );
                                      }
                                      return null;
                                    }
                                  )}
                                  <button
                                    className="notification-pagination-btn"
                                    onClick={() =>
                                      setCurrentNotificationPage((prev) =>
                                        Math.min(
                                          Math.ceil(
                                            sentNotifications.length /
                                              notificationsPerPage
                                          ),
                                          prev + 1
                                        )
                                      )
                                    }
                                    disabled={
                                      currentNotificationPage >=
                                      Math.ceil(
                                        sentNotifications.length /
                                          notificationsPerPage
                                      )
                                    }
                                    aria-label="Next page"
                                  >
                                    ›
                                  </button>
                                </>
                              );
                            })()}
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
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
  onSendNotification: PropTypes.func,
  /** Whether to show the notification card */
  showNotifications: PropTypes.bool,
  /** Students data for notification targeting */
  students: PropTypes.array,
};

export default DashboardOverview;
