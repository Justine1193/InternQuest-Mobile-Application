/**
 * StudentDashboard - Admin dashboard for managing students
 * Fetches and displays student/company data, supports search, filter, selection, notification, and deletion.
 *
 * @component
 * @example
 * <StudentDashboard />
 */

import React, { useState, useEffect, useRef } from "react";
import { IoSettingsOutline } from "react-icons/io5";
import { db } from "../../../firebase.js";
import {
  collection,
  getDocs,
  addDoc,
  deleteDoc,
  doc,
  query,
  orderBy,
  limit,
  updateDoc,
} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage } from "../../../firebase.js";
import { IoTrashOutline } from "react-icons/io5";
import logo from "../../assets/InternQuest_Logo.png";
import { signOut } from "firebase/auth";
import { auth } from "../../../firebase.js";
import { clearAdminSession } from "../../utils/auth";
import SearchBar from "../SearchBar/SearchBar.jsx";
import StudentTable from "./Table/StudentTable.jsx";
import ConfirmModal from "../ConfirmModalComponents/ConfirmModal.jsx";
import LoadingSpinner from "../LoadingSpinner.jsx";
import StudentRequirementModal from "./StudentRequirementModal.jsx";
import "./StudentDashboard.css";
import "../DashboardOverview/DashboardOverview.css";
import Footer from "../Footer/Footer.jsx";

// --- Student Dashboard Main Component ---
const StudentDashboard = () => {
  // Set document title on mount
  useEffect(() => {
    document.title = "Student Dashboard | InternQuest Admin";
  }, []);

  // --- State ---
  const [isLoading, setIsLoading] = useState(false);
  const [students, setStudents] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [overviewStats, setOverviewStats] = useState({
    totalCompanies: 0,
    totalStudents: 0,
  });
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [notificationText, setNotificationText] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(8);
  const [showLogout, setShowLogout] = useState(false);
  // Kebab/Selection
  const [openMenuId, setOpenMenuId] = useState(null);
  const [selectedRowId, setSelectedRowId] = useState(null);
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedItems, setSelectedItems] = useState([]);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  // Requirement Modal
  const [showRequirementModal, setShowRequirementModal] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  // Filters
  const [showFilter, setShowFilter] = useState(false);
  const [filterValues, setFilterValues] = useState({
    program: "",
    field: "",
    email: "",
    contact: "",
    hired: "",
    locationPreference: "",
  });
  const [pendingFilterValues, setPendingFilterValues] = useState({
    program: "",
    field: "",
    email: "",
    contact: "",
    hired: "",
    locationPreference: "",
  });

  // Auto-migrate avatars from Firestore to Storage
  const migrateAvatarToStorage = async (userId, base64Data) => {
    try {
      // Detect MIME type
      const mimeType = base64Data.startsWith("data:image/")
        ? (base64Data.match(/data:image\/(\w+);base64,/) || [])[1] || "jpeg"
        : base64Data.startsWith("iVBORw0KGgo")
        ? "png"
        : "jpeg";
      const extension = mimeType === "png" ? "png" : "jpg";
      const fileName = `profile.${extension}`;
      const storagePath = `profilePictures/${userId}/${fileName}`;

      // Convert base64 to blob
      const base64DataClean = base64Data.replace(
        /^data:image\/\w+;base64,/,
        ""
      );
      const byteCharacters = atob(base64DataClean);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: `image/${mimeType}` });

      // Upload to Storage
      const storageRef = ref(storage, storagePath);
      await uploadBytes(storageRef, blob, { contentType: `image/${mimeType}` });

      // Get download URL
      const downloadUrl = await getDownloadURL(storageRef);

      // Update user document - remove base64 fields
      const userRef = doc(db, "users", userId);
      await updateDoc(userRef, {
        profilePictureUrl: downloadUrl,
        avatarBase64: null,
        avatarbase64: null,
      });

      return { success: true, userId, downloadUrl };
    } catch (error) {
      console.warn(`Failed to migrate avatar for user ${userId}:`, error);
      return { success: false, userId, error: error.message };
    }
  };

  // Fetch companies and students from Firestore on mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const companiesSnapshot = await getDocs(collection(db, "companies"));
        const companiesData = companiesSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setCompanies(companiesData);
        const studentsSnapshot = await getDocs(collection(db, "users"));
        const studentsData = studentsSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setStudents(studentsData);
        setOverviewStats({
          totalCompanies: companiesData.length,
          totalStudents: studentsData.length,
        });

        // Auto-migrate avatars in background (silently)
        const usersWithAvatars = studentsData.filter(
          (user) =>
            (user.avatarBase64 || user.avatarbase64) && !user.profilePictureUrl
        );

        if (usersWithAvatars.length > 0) {
          console.log(
            `🔄 Auto-migrating ${usersWithAvatars.length} avatar(s) to Storage...`
          );
          // Run migration in background (don't block UI)
          Promise.all(
            usersWithAvatars.map((user) =>
              migrateAvatarToStorage(
                user.id,
                user.avatarBase64 || user.avatarbase64
              )
            )
          )
            .then((results) => {
              const successful = results.filter((r) => r.success).length;
              const failed = results.filter((r) => !r.success).length;
              console.log(
                `✅ Avatar migration complete: ${successful} successful, ${failed} failed`
              );

              // Refresh students data after migration
              if (successful > 0) {
                getDocs(collection(db, "users")).then((snapshot) => {
                  const updatedStudents = snapshot.docs.map((doc) => ({
                    id: doc.id,
                    ...doc.data(),
                  }));
                  setStudents(updatedStudents);
                });
              }
            })
            .catch((err) => {
              console.warn("Avatar migration error:", err);
            });
        }
      } catch (err) {
        setError("Failed to fetch data. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  // Exit selection mode if no items are selected
  useEffect(() => {
    if (selectionMode && selectedItems.length === 0) {
      setSelectionMode(false);
    }
  }, [selectedItems, selectionMode]);

  // Handles sending a notification to Firestore
  const [isSendingNotification, setIsSendingNotification] = useState(false);
  const [showNotificationSuccess, setShowNotificationSuccess] = useState(false);
  const [sentNotifications, setSentNotifications] = useState([]);
  const [showNotificationsList, setShowNotificationsList] = useState(false);
  const audioContextRef = useRef(null);

  // Initialize audio context
  useEffect(() => {
    try {
      audioContextRef.current = new (window.AudioContext ||
        window.webkitAudioContext)();
    } catch (e) {
      console.warn("Audio context not available");
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

  // Fetch recent notifications
  const fetchNotifications = async () => {
    try {
      const notificationsQuery = query(
        collection(db, "notifications"),
        orderBy("timestamp", "desc"),
        limit(10)
      );
      const snapshot = await getDocs(notificationsQuery);
      const notifications = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setSentNotifications(notifications);
    } catch (error) {
      console.error("Error fetching notifications:", error);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, [showNotificationSuccess]); // Refetch when a new notification is sent

  // Handle deleting a notification
  const handleDeleteNotification = async (notificationId) => {
    if (!window.confirm("Are you sure you want to delete this message?")) {
      return;
    }
    try {
      await deleteDoc(doc(db, "notifications", notificationId));
      // Remove from local state
      setSentNotifications((prev) =>
        prev.filter((notif) => notif.id !== notificationId)
      );
    } catch (error) {
      console.error("Error deleting notification:", error);
      setError("Failed to delete notification. Please try again.");
    }
  };

  const handleSendNotification = async () => {
    if (!notificationText.trim() || isSendingNotification) return;
    setIsSendingNotification(true);
    try {
      // Get current user ID for tracking who sent the notification
      const userId = auth.currentUser?.uid || null;
      await addDoc(collection(db, "notifications"), {
        message: notificationText,
        timestamp: new Date().toISOString(),
        read: false,
        userId: userId, // Add userId so rules can check ownership
      });
      setNotificationText("");
      // Show success message and play sound
      setShowNotificationSuccess(true);
      playSuccessSound();
      setTimeout(() => {
        setShowNotificationSuccess(false);
      }, 3000);
    } catch (error) {
      setError("Failed to send notification");
    } finally {
      setIsSendingNotification(false);
    }
  };

  // --- Filtering logic for students table ---
  const filteredData = students.filter((student) => {
    const matchesSearch =
      (typeof student.firstName === "string" &&
        student.firstName.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (typeof student.lastName === "string" &&
        student.lastName.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (typeof student.program === "string" &&
        student.program.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesProgram = filterValues.program
      ? typeof student.program === "string" &&
        student.program
          .toLowerCase()
          .includes(filterValues.program.toLowerCase())
      : true;
    const matchesField = filterValues.field
      ? typeof student.field === "string" &&
        student.field.toLowerCase().includes(filterValues.field.toLowerCase())
      : true;
    const matchesEmail = filterValues.email
      ? typeof student.email === "string" &&
        student.email.toLowerCase().includes(filterValues.email.toLowerCase())
      : true;
    const matchesContact = filterValues.contact
      ? typeof student.contact === "string" &&
        student.contact
          .toLowerCase()
          .includes(filterValues.contact.toLowerCase())
      : true;
    const matchesHired = filterValues.hired
      ? filterValues.hired === "Yes"
        ? student.status === true
        : student.status !== true
      : true;
    const matchesLocation = filterValues.locationPreference
      ? student.locationPreference &&
        student.locationPreference[
          filterValues.locationPreference.toLowerCase()
        ]
      : true;
    return (
      matchesSearch &&
      matchesProgram &&
      matchesField &&
      matchesEmail &&
      matchesContact &&
      matchesHired &&
      matchesLocation
    );
  });
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredData.slice(indexOfFirstItem, indexOfLastItem);

  // Handles logout for admin
  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      alert("Logout failed!");
    } finally {
      clearAdminSession();
      window.location.href = "/";
    }
  };

  // Handles deleting a single student
  const handleDeleteSingle = async (id) => {
    try {
      setIsDeleting(true);
      await deleteDoc(doc(db, "users", id));
      setStudents((prev) => prev.filter((student) => student.id !== id));
      setSelectedRowId(null);
      setOpenMenuId(null);
    } catch (error) {
      setError("Failed to delete student. Please try again.");
    } finally {
      setIsDeleting(false);
    }
  };

  // Shows the confirm modal for bulk delete
  const handleDelete = async () => setShowConfirm(true);

  // Confirms and deletes selected students
  const confirmDelete = async () => {
    setShowConfirm(false);
    try {
      setIsDeleting(true);
      for (const id of selectedItems) {
        await deleteDoc(doc(db, "users", id));
      }
      setStudents((prevData) =>
        prevData.filter((item) => !selectedItems.includes(item.id))
      );
      setSelectedItems([]);
    } catch (error) {
      setError("Failed to delete items. Please try again.");
    } finally {
      setIsDeleting(false);
    }
  };

  // Cancels the delete confirmation modal
  const cancelDelete = () => setShowConfirm(false);

  // Handles selection of a student row
  const handleSelectItem = (id) => {
    setSelectedItems((prev) =>
      prev.includes(id) ? prev.filter((itemId) => itemId !== id) : [...prev, id]
    );
  };

  // Handles row click - opens requirement modal
  const handleRowClick = (student) => {
    setSelectedStudent(student);
    setShowRequirementModal(true);
  };

  // Handles closing the requirement modal
  const handleCloseRequirementModal = () => {
    setShowRequirementModal(false);
    setSelectedStudent(null);
  };

  // --- Render ---
  return (
    <div className="dashboard-container">
      <LoadingSpinner isLoading={isLoading} message="Loading student data..." />
      <nav className="top-nav">
        <div className="nav-left">
          <div className="logo">
            <img src={logo} alt="Logo" height="32" />
          </div>
          <div className="nav-links">
            <a href="/dashboard" className="nav-link">
              Manage Internships
            </a>
            <a href="/studentDashboard" className="nav-link active">
              Manage Students
            </a>
            <a href="/helpDesk" className="nav-link">
              Help Desk
            </a>
          </div>
        </div>
        <div className="nav-right">
          <button
            className="settings-icon"
            onClick={() => setShowLogout((prev) => !prev)}
            aria-label="Settings"
            style={{ fontSize: "28px" }}
          >
            <IoSettingsOutline />
          </button>
          {showLogout && (
            <div className="logout-dropdown">
              <button onClick={handleLogout} className="logout-btn">
                Logout
              </button>
            </div>
          )}
        </div>
      </nav>
      <div className="dashboard-content">
        <div className="overview-section">
          <h1>Dashboard Overview</h1>
          <div className="overview-cards">
            <div className="card">
              <h3>Company</h3>
              <p>Total active company</p>
              <div className="count">{overviewStats.totalCompanies}</div>
            </div>
            <div className="card">
              <h3>Students</h3>
              <p>Total Registered Students</p>
              <div className="count">{overviewStats.totalStudents}</div>
            </div>
            <div className="card notification-card">
              <div className="notification-header">
                <h3>Notifications</h3>
                <button
                  className="view-notifications-btn"
                  onClick={() =>
                    setShowNotificationsList(!showNotificationsList)
                  }
                >
                  {showNotificationsList ? "Hide" : "View"} Messages
                </button>
              </div>
              <p>Quick Notifications</p>
              <div className="notification-content">
                <input
                  type="text"
                  placeholder="Send alerts..."
                  value={notificationText}
                  onChange={(e) => setNotificationText(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === "Enter" && !isSendingNotification) {
                      handleSendNotification();
                    }
                  }}
                  className="notification-input"
                  disabled={isSendingNotification}
                />
                <button
                  className={`send-notification-btn ${
                    isSendingNotification ? "sending" : ""
                  }`}
                  onClick={handleSendNotification}
                  disabled={isSendingNotification || !notificationText.trim()}
                >
                  {isSendingNotification ? (
                    <>
                      <span className="spinner-small"></span>
                      Sending...
                    </>
                  ) : (
                    "Send Now"
                  )}
                </button>
                {showNotificationSuccess && (
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
                      <div className="notifications-scroll">
                        {sentNotifications.map((notif) => (
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
                              onClick={() => handleDeleteNotification(notif.id)}
                              title="Delete message"
                              aria-label="Delete notification"
                            >
                              <IoTrashOutline />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
        <div className="table-section">
          <div className="student-table-container">
            <h2>Manage Students</h2>
            <SearchBar
              onSearch={setSearchQuery}
              onFilter={setFilterValues}
              type="student"
            />
            <StudentTable
              data={currentItems}
              selectionMode={selectionMode}
              selectedItems={selectedItems}
              setSelectedItems={setSelectedItems}
              openMenuId={openMenuId}
              setOpenMenuId={setOpenMenuId}
              selectedRowId={selectedRowId}
              setSelectedRowId={setSelectedRowId}
              handleDeleteSingle={handleDeleteSingle}
              isDeleting={isDeleting}
              setSelectionMode={setSelectionMode}
              onSelectAll={(e) => {
                if (e.target.checked) {
                  setSelectedItems(currentItems.map((item) => item.id));
                } else {
                  setSelectedItems([]);
                }
              }}
              onSelectItem={handleSelectItem}
              onDelete={handleDelete}
              onRowClick={handleRowClick}
            />
            <div className="pagination">
              <button
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="pagination-arrow"
              >
                &lt;
              </button>
              {[...Array(totalPages)].map((_, index) => (
                <button
                  key={index + 1}
                  onClick={() => setCurrentPage(index + 1)}
                  className={`pagination-number ${
                    currentPage === index + 1 ? "active" : ""
                  }`}
                >
                  {index + 1}
                </button>
              ))}
              <button
                onClick={() =>
                  setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                }
                disabled={currentPage === totalPages}
                className="pagination-arrow"
              >
                &gt;
              </button>
            </div>
            {selectionMode && selectedItems.length > 0 && (
              <div className="table-actions">
                <button
                  className="delete table-action-btn"
                  onClick={handleDelete}
                  disabled={isDeleting}
                >
                  {isDeleting
                    ? "Deleting..."
                    : `Delete (${selectedItems.length})`}
                </button>
                <button
                  className="cancel-action table-action-btn"
                  onClick={() => {
                    setSelectionMode(false);
                    setSelectedItems([]);
                    setOpenMenuId(null);
                  }}
                >
                  Cancel
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
      <ConfirmModal
        open={showConfirm}
        message="Are you sure you want to delete the selected items?"
        onConfirm={confirmDelete}
        onCancel={cancelDelete}
      />
      <StudentRequirementModal
        open={showRequirementModal}
        student={selectedStudent}
        onClose={handleCloseRequirementModal}
      />
      <Footer />
    </div>
  );
};

export default StudentDashboard;
