/**
 * StudentDashboard - Admin dashboard for managing students
 * Fetches and displays student/company data, supports search, filter, selection, notification, and deletion.
 *
 * @component
 * @example
 * <StudentDashboard />
 */

import React, { useState, useEffect } from "react";
import { IoSettingsOutline } from "react-icons/io5";
import { db } from "../../../firebase.js";
import {
  collection,
  getDocs,
  addDoc,
  deleteDoc,
  doc,
} from "firebase/firestore";
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
  const handleSendNotification = async () => {
    if (!notificationText.trim()) return;
    try {
      await addDoc(collection(db, "notifications"), {
        message: notificationText,
        timestamp: new Date().toISOString(),
        read: false,
      });
      setNotificationText("");
    } catch (error) {
      setError("Failed to send notification");
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
