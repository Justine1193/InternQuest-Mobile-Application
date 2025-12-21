import React, { useEffect, useState } from "react";
import { collection, getDocs, doc, setDoc, deleteDoc, getDoc } from "firebase/firestore";
import { db, auth, realtimeDb } from "../../../firebase";
import { ref, update as updateRealtime } from "firebase/database";
import { signOut } from "firebase/auth";
import { clearAdminSession } from "../../utils/auth";
import { useNavigate } from "react-router-dom";
import Navbar from "../Navbar/Navbar.jsx";
import LoadingSpinner from "../LoadingSpinner.jsx";
import ConfirmModal from "../ConfirmModalComponents/ConfirmModal.jsx";
import ToastContainer from "../Toast/ToastContainer.jsx";
import { useToast } from "../../hooks/useToast.js";
import { activityLoggers } from "../../utils/activityLogger.js";
import logger from "../../utils/logger.js";
import Footer from "../Footer/Footer.jsx";
import { IoRefreshOutline, IoArchiveOutline, IoSearchOutline, IoPeopleOutline, IoBusinessOutline } from "react-icons/io5";
import EmptyState from "../EmptyState/EmptyState.jsx";
import "./DeletedRecords.css";

const DeletedRecords = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [deletedStudents, setDeletedStudents] = useState([]);
  const [deletedCompanies, setDeletedCompanies] = useState([]);
  const [showConfirm, setShowConfirm] = useState(false);
  const [restoreItem, setRestoreItem] = useState(null);
  const [restoreType, setRestoreType] = useState(null); // 'student' or 'company'
  const [isRestoring, setIsRestoring] = useState(false);
  const { toasts, removeToast, success, error: showError } = useToast();
  const navigate = useNavigate();
  
  // Search and filter state
  const [studentSearchQuery, setStudentSearchQuery] = useState("");
  const [companySearchQuery, setCompanySearchQuery] = useState("");
  const [currentStudentPage, setCurrentStudentPage] = useState(1);
  const [currentCompanyPage, setCurrentCompanyPage] = useState(1);
  const [itemsPerPage] = useState(10);

  useEffect(() => {
    document.title = "Archive Management | InternQuest Admin";
    fetchDeleted();
  }, []);

  // Scroll to top when error occurs
  useEffect(() => {
    if (error) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [error]);

  const fetchDeleted = async () => {
    setIsLoading(true);
    setError("");
    try {
      const studentsSnap = await getDocs(collection(db, "deleted_students"));
      const companiesSnap = await getDocs(collection(db, "deleted_companies"));

      const students = studentsSnap.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      const companies = companiesSnap.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      // Sort by deletedAt desc if present
      const sortByDeletedAt = (arr) =>
        [...arr].sort((a, b) =>
          new Date(b.deletedAt || 0) - new Date(a.deletedAt || 0)
        );

      setDeletedStudents(sortByDeletedAt(students));
      setDeletedCompanies(sortByDeletedAt(companies));
    } catch (err) {
      logger.error("Error fetching deleted records:", err);
      setError("Failed to load deleted records. Please try again.");
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

  const handleRestoreClick = (item, type) => {
    setRestoreItem(item);
    setRestoreType(type);
    setShowConfirm(true);
  };

  const handleRestore = async () => {
    if (!restoreItem || !restoreType) return;

    setIsRestoring(true);
    setShowConfirm(false);

    try {
      if (restoreType === "company") {
        await restoreCompany(restoreItem);
      } else if (restoreType === "student") {
        await restoreStudent(restoreItem);
      }

      // Refresh the list
      await fetchDeleted();
      
      setRestoreItem(null);
      setRestoreType(null);
    } catch (err) {
      logger.error("Restore error:", err);
      
      // Provide more specific error messages
      if (err.code === 'permission-denied' || err.message?.includes('permission')) {
        showError("Permission denied. Please make sure you're logged in with Firebase Auth. Try logging out and logging back in.");
      } else if (err.message?.includes('logged in')) {
        showError(err.message);
      } else {
        showError(`Failed to restore ${restoreType}: ${err.message || 'Unknown error'}. Please try again.`);
      }
    } finally {
      setIsRestoring(false);
    }
  };

  const restoreCompany = async (company) => {
    try {
      // Check if user is authenticated
      if (!auth.currentUser) {
        throw new Error("You must be logged in to restore records. Please log out and log back in.");
      }
      
      // Remove deletedAt field and restore to companies collection
      const { deletedAt, ...companyData } = company;
      
      // Restore to companies collection
      await setDoc(doc(db, "companies", company.id), companyData);
      
      // Sync to Realtime Database if MOA data exists
      if (companyData.moa === "Yes" && companyData.moaValidityYears) {
        try {
          if (auth.currentUser) {
            await updateRealtime(ref(realtimeDb, `companies/${company.id}`), {
              moa: companyData.moa,
              moaValidityYears: companyData.moaValidityYears,
              companyName: companyData.companyName,
              updatedAt: new Date().toISOString(),
            });
          }
        } catch (rtdbError) {
          logger.warn("Failed to sync to Realtime Database:", rtdbError);
          // Don't fail the restore if RTDB sync fails
        }
      }
      
      // Remove from deleted_companies
      await deleteDoc(doc(db, "deleted_companies", company.id));
      
      // Log activity
      await activityLoggers.restoreCompany(
        company.id,
        companyData.companyName || "Unknown"
      );
      
      success(`Company "${companyData.companyName || company.id}" restored successfully`);
    } catch (err) {
      logger.error("Restore company error:", err);
      throw err;
    }
  };

  const restoreStudent = async (student) => {
    try {
      // Check if user is authenticated
      if (!auth.currentUser) {
        throw new Error("You must be logged in to restore records. Please log out and log back in.");
      }
      
      // Remove deletedAt and deletedByRole fields and restore to users collection
      const { deletedAt, deletedByRole, ...studentData } = student;
      
      // Restore to users collection
      await setDoc(doc(db, "users", student.id), studentData);
      
      // Remove from deleted_students
      await deleteDoc(doc(db, "deleted_students", student.id));
      
      // Log activity
      const studentName = `${studentData.firstName || ''} ${studentData.lastName || ''}`.trim() || "Unknown";
      await activityLoggers.restoreStudent(student.id, studentName);
      
      success(`Student "${studentName}" restored successfully`);
    } catch (err) {
      logger.error("Restore student error:", err);
      throw err;
    }
  };

  const cancelRestore = () => {
    setShowConfirm(false);
    setRestoreItem(null);
    setRestoreType(null);
  };

  const getRestoreMessage = () => {
    if (!restoreItem || !restoreType) return "";
    
    if (restoreType === "company") {
      const name = restoreItem.companyName || restoreItem.companyDescription || restoreItem.id;
      return `Are you sure you want to restore company "${name}"?`;
    } else {
      const name = `${restoreItem.firstName || ''} ${restoreItem.lastName || ''}`.trim() || restoreItem.id;
      return `Are you sure you want to restore student "${name}"?`;
    }
  };

  // Filter and paginate students
  const filteredStudents = deletedStudents.filter((student) => {
    if (!studentSearchQuery) return true;
    const query = studentSearchQuery.toLowerCase();
    const fullName = `${student.firstName || ''} ${student.lastName || ''}`.toLowerCase();
    const email = (student.email || '').toLowerCase();
    const program = (student.program || '').toLowerCase();
    return fullName.includes(query) || email.includes(query) || program.includes(query);
  });

  const studentTotalPages = Math.ceil(filteredStudents.length / itemsPerPage);
  const studentIndexOfLast = currentStudentPage * itemsPerPage;
  const studentIndexOfFirst = studentIndexOfLast - itemsPerPage;
  const paginatedStudents = filteredStudents.slice(studentIndexOfFirst, studentIndexOfLast);

  // Filter and paginate companies
  const filteredCompanies = deletedCompanies.filter((company) => {
    if (!companySearchQuery) return true;
    const query = companySearchQuery.toLowerCase();
    const name = (company.companyName || company.companyDescription || '').toLowerCase();
    const email = (company.companyEmail || '').toLowerCase();
    const fields = Array.isArray(company.fields) ? company.fields.join(' ').toLowerCase() : '';
    return name.includes(query) || email.includes(query) || fields.includes(query);
  });

  const companyTotalPages = Math.ceil(filteredCompanies.length / itemsPerPage);
  const companyIndexOfLast = currentCompanyPage * itemsPerPage;
  const companyIndexOfFirst = companyIndexOfLast - itemsPerPage;
  const paginatedCompanies = filteredCompanies.slice(companyIndexOfFirst, companyIndexOfLast);

  return (
    <div className="deleted-records-page">
      <LoadingSpinner isLoading={isLoading || isRestoring} message={isRestoring ? "Restoring..." : "Loading archive..."} />
      <Navbar onLogout={handleLogout} />
      <div className="deleted-records-container">
        <div className="deleted-records-header">
          <div className="header-content">
            <div className="header-icon-wrapper">
              <IoArchiveOutline className="header-icon" />
            </div>
            <div>
              <h1>Archive Management</h1>
              <p>View and restore archived students and companies</p>
            </div>
          </div>
          <div className="header-stats">
            <div className="stat-card">
              <IoPeopleOutline className="stat-icon" />
              <div>
                <span className="stat-value">{deletedStudents.length}</span>
                <span className="stat-label">Archived Students</span>
              </div>
            </div>
            <div className="stat-card">
              <IoBusinessOutline className="stat-icon" />
              <div>
                <span className="stat-value">{deletedCompanies.length}</span>
                <span className="stat-label">Archived Companies</span>
              </div>
            </div>
          </div>
        </div>

        {error && (
          <div className="error-message" role="alert">
            {error}
          </div>
        )}

        <div className="deleted-sections">
          <section className="deleted-section">
            <div className="section-header">
              <div className="section-title-wrapper">
                <IoPeopleOutline className="section-icon" />
                <h2>Archived Students</h2>
                <span className="section-count">({deletedStudents.length})</span>
              </div>
              <div className="search-wrapper">
                <IoSearchOutline className="search-icon" />
                <input
                  type="text"
                  className="search-input"
                  placeholder="Search students..."
                  value={studentSearchQuery}
                  onChange={(e) => {
                    setStudentSearchQuery(e.target.value);
                    setCurrentStudentPage(1);
                  }}
                />
                {studentSearchQuery && (
                  <button
                    className="search-clear"
                    onClick={() => {
                      setStudentSearchQuery("");
                      setCurrentStudentPage(1);
                    }}
                    aria-label="Clear search"
                  >
                    ×
                  </button>
                )}
              </div>
            </div>
            <div className="deleted-table">
              <table>
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Program</th>
                    <th>Archived At</th>
                    <th>Archived By</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {deletedStudents.length === 0 ? (
                    <tr>
                      <td colSpan="6" style={{ padding: 0, border: "none" }}>
                        <EmptyState
                          type="document"
                          title="No archived students"
                          message="There are no archived student records at this time."
                          icon={IoPeopleOutline}
                        />
                      </td>
                    </tr>
                  ) : filteredStudents.length === 0 ? (
                    <tr>
                      <td colSpan="6" style={{ padding: 0, border: "none" }}>
                        <EmptyState
                          type="search"
                          title="No students found"
                          message="No archived students match your search criteria."
                          icon={IoPeopleOutline}
                        />
                      </td>
                    </tr>
                  ) : (
                    paginatedStudents.map((s) => (
                      <tr key={s.id}>
                        <td>
                          {s.firstName || ""} {s.lastName || ""}
                        </td>
                        <td>{s.email || "N/A"}</td>
                        <td>{s.program || "N/A"}</td>
                        <td>
                          {s.deletedAt
                            ? new Date(s.deletedAt).toLocaleString()
                            : "N/A"}
                        </td>
                        <td>{s.deletedByRole || "N/A"}</td>
                        <td>
                          <button
                            className="restore-btn"
                            onClick={() => handleRestoreClick(s, "student")}
                            disabled={isRestoring}
                            title="Restore student"
                          >
                            <IoRefreshOutline />
                            Restore
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            {studentTotalPages > 1 && (
              <div className="pagination">
                <div className="pagination-info">
                  Showing {studentIndexOfFirst + 1} to {Math.min(studentIndexOfLast, filteredStudents.length)} of {filteredStudents.length}
                </div>
                <div className="pagination-controls">
                  <button
                    className="pagination-btn"
                    onClick={() => setCurrentStudentPage((prev) => Math.max(1, prev - 1))}
                    disabled={currentStudentPage === 1}
                    aria-label="Previous page"
                  >
                    ‹
                  </button>
                  {[...Array(studentTotalPages)].map((_, index) => {
                    const page = index + 1;
                    if (
                      page === 1 ||
                      page === studentTotalPages ||
                      (page >= currentStudentPage - 1 && page <= currentStudentPage + 1)
                    ) {
                      return (
                        <button
                          key={page}
                          className={`pagination-btn ${currentStudentPage === page ? "active" : ""}`}
                          onClick={() => setCurrentStudentPage(page)}
                          aria-label={`Go to page ${page}`}
                        >
                          {page}
                        </button>
                      );
                    } else if (page === currentStudentPage - 2 || page === currentStudentPage + 2) {
                      return (
                        <span key={page} className="pagination-ellipsis">
                          ...
                        </span>
                      );
                    }
                    return null;
                  })}
                  <button
                    className="pagination-btn"
                    onClick={() => setCurrentStudentPage((prev) => Math.min(studentTotalPages, prev + 1))}
                    disabled={currentStudentPage === studentTotalPages}
                    aria-label="Next page"
                  >
                    ›
                  </button>
                </div>
              </div>
            )}
          </section>

          <section className="deleted-section">
            <div className="section-header">
              <div className="section-title-wrapper">
                <IoBusinessOutline className="section-icon" />
                <h2>Archived Companies</h2>
                <span className="section-count">({deletedCompanies.length})</span>
              </div>
              <div className="search-wrapper">
                <IoSearchOutline className="search-icon" />
                <input
                  type="text"
                  className="search-input"
                  placeholder="Search companies..."
                  value={companySearchQuery}
                  onChange={(e) => {
                    setCompanySearchQuery(e.target.value);
                    setCurrentCompanyPage(1);
                  }}
                />
                {companySearchQuery && (
                  <button
                    className="search-clear"
                    onClick={() => {
                      setCompanySearchQuery("");
                      setCurrentCompanyPage(1);
                    }}
                    aria-label="Clear search"
                  >
                    ×
                  </button>
                )}
              </div>
            </div>
            <div className="deleted-table">
              <table>
                <thead>
                  <tr>
                    <th>Company</th>
                    <th>Email</th>
                    <th>Field</th>
                    <th>Archived At</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {deletedCompanies.length === 0 ? (
                    <tr>
                      <td colSpan="5" style={{ padding: 0, border: "none" }}>
                        <EmptyState
                          type="document"
                          title="No archived companies"
                          message="There are no archived company records at this time."
                          icon={IoBusinessOutline}
                        />
                      </td>
                    </tr>
                  ) : filteredCompanies.length === 0 ? (
                    <tr>
                      <td colSpan="5" style={{ padding: 0, border: "none" }}>
                        <EmptyState
                          type="search"
                          title="No companies found"
                          message="No archived companies match your search criteria."
                          icon={IoBusinessOutline}
                        />
                      </td>
                    </tr>
                  ) : (
                    paginatedCompanies.map((c) => (
                      <tr key={c.id}>
                        <td>{c.companyName || c.companyDescription || "N/A"}</td>
                        <td>{c.companyEmail || "N/A"}</td>
                        <td>
                          {Array.isArray(c.fields) ? c.fields.join(", ") : "N/A"}
                        </td>
                        <td>
                          {c.deletedAt
                            ? new Date(c.deletedAt).toLocaleString()
                            : "N/A"}
                        </td>
                        <td>
                          <button
                            className="restore-btn"
                            onClick={() => handleRestoreClick(c, "company")}
                            disabled={isRestoring}
                            title="Restore company"
                          >
                            <IoRefreshOutline />
                            Restore
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            {companyTotalPages > 1 && (
              <div className="pagination">
                <div className="pagination-info">
                  Showing {companyIndexOfFirst + 1} to {Math.min(companyIndexOfLast, filteredCompanies.length)} of {filteredCompanies.length}
                </div>
                <div className="pagination-controls">
                  <button
                    className="pagination-btn"
                    onClick={() => setCurrentCompanyPage((prev) => Math.max(1, prev - 1))}
                    disabled={currentCompanyPage === 1}
                    aria-label="Previous page"
                  >
                    ‹
                  </button>
                  {[...Array(companyTotalPages)].map((_, index) => {
                    const page = index + 1;
                    if (
                      page === 1 ||
                      page === companyTotalPages ||
                      (page >= currentCompanyPage - 1 && page <= currentCompanyPage + 1)
                    ) {
                      return (
                        <button
                          key={page}
                          className={`pagination-btn ${currentCompanyPage === page ? "active" : ""}`}
                          onClick={() => setCurrentCompanyPage(page)}
                          aria-label={`Go to page ${page}`}
                        >
                          {page}
                        </button>
                      );
                    } else if (page === currentCompanyPage - 2 || page === currentCompanyPage + 2) {
                      return (
                        <span key={page} className="pagination-ellipsis">
                          ...
                        </span>
                      );
                    }
                    return null;
                  })}
                  <button
                    className="pagination-btn"
                    onClick={() => setCurrentCompanyPage((prev) => Math.min(companyTotalPages, prev + 1))}
                    disabled={currentCompanyPage === companyTotalPages}
                    aria-label="Next page"
                  >
                    ›
                  </button>
                </div>
              </div>
            )}
          </section>
        </div>
      </div>
      <ConfirmModal
        open={showConfirm}
        message={getRestoreMessage()}
        onConfirm={handleRestore}
        onCancel={cancelRestore}
        confirmButtonText="Yes, restore it!"
        confirmButtonClass="confirm-btn restore-confirm-btn"
      />
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </div>
  );
};

export default DeletedRecords;




