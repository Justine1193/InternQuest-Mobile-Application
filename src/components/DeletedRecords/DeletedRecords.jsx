import React, { useEffect, useState, useMemo } from "react";
import { collection, getDocs, doc, setDoc, deleteDoc, getDoc } from "firebase/firestore";
import { db, auth, realtimeDb } from "../../../firebase";
import { ref, update as updateRealtime } from "firebase/database";
import { signOut } from "firebase/auth";
import { clearAdminSession, getAdminRole } from "../../utils/auth";
import { useNavigate } from "react-router-dom";
import Navbar from "../Navbar/Navbar.jsx";
import LoadingSpinner from "../LoadingSpinner.jsx";
import ConfirmModal from "../ConfirmModalComponents/ConfirmModal.jsx";
import ToastContainer from "../Toast/ToastContainer.jsx";
import { useToast } from "../../hooks/useToast.js";
import { activityLoggers, logActivity } from "../../utils/activityLogger.js";
import logger from "../../utils/logger.js";
import Footer from "../Footer/Footer.jsx";
import { IoRefreshOutline, IoArchiveOutline, IoSearchOutline, IoPeopleOutline, IoBusinessOutline, IoShieldOutline, IoDocumentTextOutline, IoDownloadOutline, IoOpenOutline, IoCalendarOutline, IoChevronDownOutline, IoChevronUpOutline, IoImageOutline, IoDocumentOutline, IoCloseOutline, IoEyeOutline } from "react-icons/io5";
import EmptyState from "../EmptyState/EmptyState.jsx";
import StudentDetailModal from "./StudentDetailModal.jsx";
import CompanyDetailModal from "../CompanyManageComponents/CompanyDetailModal/CompanyDetailModal.jsx";
import "./DeletedRecords.css";

const DeletedRecords = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [deletedStudents, setDeletedStudents] = useState([]);
  const [deletedCompanies, setDeletedCompanies] = useState([]);
  const [deletedAdmins, setDeletedAdmins] = useState([]);
  const [rejectedRequirements, setRejectedRequirements] = useState([]);
  const [activeTab, setActiveTab] = useState("students"); // students | companies | users | requirements
  const [showConfirm, setShowConfirm] = useState(false);
  const [restoreItem, setRestoreItem] = useState(null);
  const [restoreType, setRestoreType] = useState(null); // 'student', 'company', 'user', or 'requirement'
  const [isRestoring, setIsRestoring] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [showStudentModal, setShowStudentModal] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [showCompanyModal, setShowCompanyModal] = useState(false);
  const { toasts, removeToast, success, error: showError } = useToast();
  const navigate = useNavigate();
  
  // Search and filter state
  const [studentSearchQuery, setStudentSearchQuery] = useState("");
  const [companySearchQuery, setCompanySearchQuery] = useState("");
  const [adminSearchQuery, setAdminSearchQuery] = useState("");
  const [requirementSearchQuery, setRequirementSearchQuery] = useState("");
  const [studentProgramFilter, setStudentProgramFilter] = useState("all");
  const [studentArchivedByFilter, setStudentArchivedByFilter] = useState("all");
  const [companyFieldFilter, setCompanyFieldFilter] = useState("all");
  const [adminRoleFilter, setAdminRoleFilter] = useState("all");
  const [requirementTypeFilter, setRequirementTypeFilter] = useState("all");
  const [requirementStudentFilter, setRequirementStudentFilter] = useState("all");
  const [requirementSortBy, setRequirementSortBy] = useState("rejectedAt"); // "rejectedAt" | "studentName" | "requirementType" | "uploadedAt"
  const [requirementSortOrder, setRequirementSortOrder] = useState("desc"); // "asc" | "desc"
  const [expandedReasonId, setExpandedReasonId] = useState(null);
  const [expandedStudentGroups, setExpandedStudentGroups] = useState(new Set()); // Track which student groups are expanded
  const [selectedRequirementGroup, setSelectedRequirementGroup] = useState(null); // Selected group for modal view
  const [currentStudentPage, setCurrentStudentPage] = useState(1);
  const [currentCompanyPage, setCurrentCompanyPage] = useState(1);
  const [currentAdminPage, setCurrentAdminPage] = useState(1);
  const [currentRequirementPage, setCurrentRequirementPage] = useState(1);
  const [itemsPerPage] = useState(10);

  useEffect(() => {
    document.title = "Archive Management | InternQuest Admin";
    fetchDeleted();
  }, []);

  const formatDateTime = (value) => {
    if (!value) return "N/A";
    try {
      // Firestore Timestamp support
      let date;
      if (typeof value === "object" && typeof value.toDate === "function") {
        date = value.toDate();
      } else {
        date = new Date(value);
      }
      if (Number.isNaN(date.getTime())) return String(value);
      
      const now = new Date();
      const diffMs = now - date;
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
      
      if (diffDays === 0) {
        return `Today, ${date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}`;
      } else if (diffDays === 1) {
        return `Yesterday, ${date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}`;
      } else if (diffDays < 7) {
        return `${diffDays} days ago`;
      } else {
        return date.toLocaleDateString('en-US', { 
          year: 'numeric', 
          month: 'short', 
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        });
      }
    } catch (e) {
      return String(value);
    }
  };

  const formatFileSize = (bytes) => {
    if (!bytes || bytes === 0) return "N/A";
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  const getFileTypeIcon = (fileName, contentType) => {
    if (!fileName && !contentType) return IoDocumentOutline;
    const name = (fileName || '').toLowerCase();
    const type = (contentType || '').toLowerCase();
    
    if (name.match(/\.(jpg|jpeg|png|gif|webp|svg)$/) || type.startsWith('image/')) {
      return IoImageOutline;
    }
    if (name.match(/\.(pdf)$/) || type === 'application/pdf') {
      return IoDocumentTextOutline;
    }
    return IoDocumentOutline;
  };

  const handleDownloadFile = async (url, fileName) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = fileName || 'requirement_file';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
      success(`File "${fileName || 'requirement_file'}" downloaded successfully`);
    } catch (error) {
      console.error('Download error:', error);
      showError('Failed to download file. Please try again.');
    }
  };

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
      const adminsSnap = await getDocs(collection(db, "admin_deletions"));
      const requirementsSnap = await getDocs(collection(db, "rejected_requirements"));

      const students = studentsSnap.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      const companies = companiesSnap.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      const admins = adminsSnap.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      const requirements = requirementsSnap.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      // Sort by deletedAt/rejectedAt desc if present
      const sortByDeletedAt = (arr) =>
        [...arr].sort((a, b) =>
          new Date(b.deletedAt || b.rejectedAt || 0) - new Date(a.deletedAt || a.rejectedAt || 0)
        );

      setDeletedStudents(sortByDeletedAt(students));
      setDeletedCompanies(sortByDeletedAt(companies));
      setDeletedAdmins(sortByDeletedAt(admins));
      setRejectedRequirements(sortByDeletedAt(requirements));
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
      } else if (restoreType === "user") {
        await restoreUser(restoreItem);
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

  const restoreUser = async (user) => {
    try {
      // Check if user is authenticated
      if (!auth.currentUser) {
        throw new Error("You must be logged in to restore records. Please log out and log back in.");
      }
      
      // Recreate admin document in adminusers collection with available data
      const adminData = {
        username: user.deletedUsername || "",
        email: user.deletedEmail || "",
        role: user.deletedRole || "",
        program: user.deletedProgram || "",
        firebaseEmail: user.deletedEmail || "",
        updatedAt: new Date().toISOString(),
        restoredAt: new Date().toISOString(),
        restoredBy: getAdminRole(),
      };
      
      // Restore to adminusers collection using deletedAdminId as document ID
      await setDoc(doc(db, "adminusers", user.deletedAdminId), adminData, { merge: true });
      
      // Remove from admin_deletions
      await deleteDoc(doc(db, "admin_deletions", user.id));
      
      // Log activity
      const userName = user.deletedUsername || user.deletedEmail || "Unknown";
      await logActivity("restore_admin", "admin", user.deletedAdminId, { userName });
      
      success(`User "${userName}" restored successfully`);
    } catch (err) {
      logger.error("Restore user error:", err);
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
    } else if (restoreType === "user") {
      const name = restoreItem.deletedUsername || restoreItem.deletedEmail || restoreItem.id;
      return `Are you sure you want to restore user "${name}"?`;
    } else {
      const name = `${restoreItem.firstName || ''} ${restoreItem.lastName || ''}`.trim() || restoreItem.id;
      return `Are you sure you want to restore student "${name}"?`;
    }
  };

  const getUniqueOptions = (values) =>
    [...new Set(values.filter(Boolean).map((v) => String(v).trim()))].sort((a, b) =>
      a.localeCompare(b)
    );

  const studentProgramOptions = getUniqueOptions(
    deletedStudents.map((s) => s.program).filter(Boolean)
  );
  const studentArchivedByOptions = getUniqueOptions(
    deletedStudents.map((s) => s.deletedByRole).filter(Boolean)
  );
  const companyFieldOptions = getUniqueOptions(
    deletedCompanies
      .flatMap((c) => (Array.isArray(c.fields) ? c.fields : []))
      .filter(Boolean)
  );
  const adminRoleOptions = getUniqueOptions(
    deletedAdmins.map((a) => a.deletedRole).filter(Boolean)
  );
  const requirementTypeOptions = getUniqueOptions(
    rejectedRequirements.map((r) => r.requirementType).filter(Boolean)
  );
  const requirementStudentOptions = getUniqueOptions(
    rejectedRequirements.map((r) => r.studentName).filter(Boolean)
  );

  // Filter and paginate students
  const filteredStudents = deletedStudents.filter((student) => {
    if (studentProgramFilter !== "all") {
      if ((student.program || "") !== studentProgramFilter) return false;
    }
    if (studentArchivedByFilter !== "all") {
      if ((student.deletedByRole || "") !== studentArchivedByFilter) return false;
    }
    if (!studentSearchQuery) return true;
    const query = studentSearchQuery.toLowerCase();
    const fullName = `${student.firstName || ''} ${student.lastName || ''}`.toLowerCase();
    const email = (student.email || '').toLowerCase();
    const program = (student.program || '').toLowerCase();
    const studentId = ((student.studentId) || '').toLowerCase();
    return fullName.includes(query) || email.includes(query) || program.includes(query) || studentId.includes(query);
  });

  const studentTotalPages = Math.ceil(filteredStudents.length / itemsPerPage);
  const studentIndexOfLast = currentStudentPage * itemsPerPage;
  const studentIndexOfFirst = studentIndexOfLast - itemsPerPage;
  const paginatedStudents = filteredStudents.slice(studentIndexOfFirst, studentIndexOfLast);

  // Filter and paginate companies
  const filteredCompanies = deletedCompanies.filter((company) => {
    if (companyFieldFilter !== "all") {
      const fields = Array.isArray(company.fields) ? company.fields : [];
      if (!fields.includes(companyFieldFilter)) return false;
    }
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

  // Filter and paginate admins
  const filteredAdmins = deletedAdmins.filter((admin) => {
    if (adminRoleFilter !== "all") {
      if ((admin.deletedRole || "") !== adminRoleFilter) return false;
    }
    if (!adminSearchQuery) return true;
    const query = adminSearchQuery.toLowerCase();
    const username = (admin.deletedUsername || '').toLowerCase();
    const email = (admin.deletedEmail || '').toLowerCase();
    const role = (admin.deletedRole || '').toLowerCase();
    return username.includes(query) || email.includes(query) || role.includes(query);
  });

  const adminTotalPages = Math.ceil(filteredAdmins.length / itemsPerPage);
  const adminIndexOfLast = currentAdminPage * itemsPerPage;
  const adminIndexOfFirst = adminIndexOfLast - itemsPerPage;
  const paginatedAdmins = filteredAdmins.slice(adminIndexOfFirst, adminIndexOfLast);

  // Filter and sort rejected requirements
  const filteredRequirements = rejectedRequirements
    .filter((req) => {
      if (requirementTypeFilter !== "all") {
        if ((req.requirementType || "") !== requirementTypeFilter) return false;
      }
      if (requirementStudentFilter !== "all") {
        if ((req.studentName || "") !== requirementStudentFilter) return false;
      }
      if (!requirementSearchQuery) return true;
      const query = requirementSearchQuery.toLowerCase();
      const studentName = (req.studentName || '').toLowerCase();
      const requirementType = (req.requirementType || '').toLowerCase();
      const fileName = (req.fileName || '').toLowerCase();
      const reason = (req.rejectionReason || '').toLowerCase();
      return studentName.includes(query) || requirementType.includes(query) || fileName.includes(query) || reason.includes(query);
    })
    .sort((a, b) => {
      let aValue, bValue;
      switch (requirementSortBy) {
        case "studentName":
          aValue = (a.studentName || '').toLowerCase();
          bValue = (b.studentName || '').toLowerCase();
          break;
        case "requirementType":
          aValue = (a.requirementType || '').toLowerCase();
          bValue = (b.requirementType || '').toLowerCase();
          break;
        case "uploadedAt":
          aValue = new Date(a.originalUploadedAt || 0).getTime();
          bValue = new Date(b.originalUploadedAt || 0).getTime();
          break;
        case "rejectedAt":
        default:
          aValue = new Date(a.rejectedAt || 0).getTime();
          bValue = new Date(b.rejectedAt || 0).getTime();
          break;
      }
      
      if (requirementSortOrder === "asc") {
        return aValue > bValue ? 1 : aValue < bValue ? -1 : 0;
      } else {
        return aValue < bValue ? 1 : aValue > bValue ? -1 : 0;
      }
    });

  // Group requirements by student name
  const groupedRequirements = useMemo(() => {
    const groups = {};
    filteredRequirements.forEach((req) => {
      const studentKey = req.studentName || "Unknown Student";
      if (!groups[studentKey]) {
        groups[studentKey] = {
          studentName: studentKey,
          requirements: [],
          latestRejectedAt: null,
        };
      }
      groups[studentKey].requirements.push(req);
      // Track latest rejection date for sorting
      const rejectedAt = new Date(req.rejectedAt || 0).getTime();
      if (!groups[studentKey].latestRejectedAt || rejectedAt > groups[studentKey].latestRejectedAt) {
        groups[studentKey].latestRejectedAt = rejectedAt;
      }
    });
    
    // Convert to array and sort
    return Object.values(groups).sort((a, b) => {
      if (requirementSortBy === "studentName") {
        const comparison = a.studentName.localeCompare(b.studentName);
        return requirementSortOrder === "asc" ? comparison : -comparison;
      }
      // Default: sort by latest rejected date
      return requirementSortOrder === "asc" 
        ? (a.latestRejectedAt - b.latestRejectedAt)
        : (b.latestRejectedAt - a.latestRejectedAt);
    });
  }, [filteredRequirements, requirementSortBy, requirementSortOrder]);

  // Paginate groups instead of individual requirements
  const requirementTotalPages = Math.ceil(groupedRequirements.length / itemsPerPage);
  const requirementIndexOfLast = currentRequirementPage * itemsPerPage;
  const requirementIndexOfFirst = requirementIndexOfLast - itemsPerPage;
  const paginatedGroups = groupedRequirements.slice(requirementIndexOfFirst, requirementIndexOfLast);

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
              <p>View and restore archived records, students, companies, users, and rejected requirements</p>
            </div>
          </div>
          <div className="header-stats">
            <div
              className={`stat-card clickable ${activeTab === "students" ? "active" : ""}`}
              role="button"
              tabIndex={0}
              onClick={() => setActiveTab("students")}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") setActiveTab("students");
              }}
              title="View archived students"
            >
              <IoPeopleOutline className="stat-icon" />
              <div>
                <span className="stat-value">{deletedStudents.length}</span>
                <span className="stat-label">Archived Students</span>
              </div>
            </div>
            <div
              className={`stat-card clickable ${activeTab === "companies" ? "active" : ""}`}
              role="button"
              tabIndex={0}
              onClick={() => setActiveTab("companies")}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") setActiveTab("companies");
              }}
              title="View archived companies"
            >
              <IoBusinessOutline className="stat-icon" />
              <div>
                <span className="stat-value">{deletedCompanies.length}</span>
                <span className="stat-label">Archived Companies</span>
              </div>
            </div>
            <div
              className={`stat-card clickable ${activeTab === "admins" ? "active" : ""}`}
              role="button"
              tabIndex={0}
              onClick={() => setActiveTab("admins")}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") setActiveTab("admins");
              }}
              title="View archived admins"
            >
              <IoShieldOutline className="stat-icon" />
              <div>
                <span className="stat-value">{deletedAdmins.length}</span>
                <span className="stat-label">Archived Admins</span>
              </div>
            </div>
            <div
              className={`stat-card clickable ${activeTab === "requirements" ? "active" : ""}`}
              role="button"
              tabIndex={0}
              onClick={() => setActiveTab("requirements")}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") setActiveTab("requirements");
              }}
              title="View rejected requirements"
            >
              <IoDocumentTextOutline className="stat-icon" />
              <div>
                <span className="stat-value">{rejectedRequirements.length}</span>
                <span className="stat-label">Rejected Requirements</span>
              </div>
            </div>
          </div>
        </div>

        {error && (
          <div className="error-message" role="alert">
            {error}
          </div>
        )}

        {/* Tabs (no scrolling between tables) */}
        <div className="archive-tabs-wrapper" role="tablist" aria-label="Archive sections">
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === "students"}
            className={`archive-tab ${activeTab === "students" ? "active" : ""}`}
            onClick={() => setActiveTab("students")}
          >
            <IoPeopleOutline className="tab-icon" />
            Students
            <span className="tab-badge">{deletedStudents.length}</span>
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === "companies"}
            className={`archive-tab ${activeTab === "companies" ? "active" : ""}`}
            onClick={() => setActiveTab("companies")}
          >
            <IoBusinessOutline className="tab-icon" />
            Companies
            <span className="tab-badge">{deletedCompanies.length}</span>
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === "admins"}
            className={`archive-tab ${activeTab === "admins" ? "active" : ""}`}
            onClick={() => setActiveTab("admins")}
          >
            <IoShieldOutline className="tab-icon" />
            Users
            <span className="tab-badge">{deletedAdmins.length}</span>
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === "requirements"}
            className={`archive-tab ${activeTab === "requirements" ? "active" : ""}`}
            onClick={() => setActiveTab("requirements")}
          >
            <IoDocumentTextOutline className="tab-icon" />
            Requirements
            <span className="tab-badge">{rejectedRequirements.length}</span>
          </button>
        </div>

        <div className="deleted-sections">
          {activeTab === "students" && (
          <section className="deleted-section" role="tabpanel">
            <div className="section-header">
              <div className="section-title-wrapper">
                <IoPeopleOutline className="section-icon" />
                <h2>Archived Students</h2>
                <span className="section-count">({deletedStudents.length})</span>
              </div>
              <div className="filters-wrapper" aria-label="Student archive filters">
                <select
                  className="filter-select"
                  value={studentProgramFilter}
                  onChange={(e) => {
                    setStudentProgramFilter(e.target.value);
                    setCurrentStudentPage(1);
                  }}
                  aria-label="Filter by program"
                >
                  <option value="all">All Programs</option>
                  {studentProgramOptions.map((p) => (
                    <option key={p} value={p}>
                      {p}
                    </option>
                  ))}
                </select>
                <select
                  className="filter-select"
                  value={studentArchivedByFilter}
                  onChange={(e) => {
                    setStudentArchivedByFilter(e.target.value);
                    setCurrentStudentPage(1);
                  }}
                  aria-label="Filter by archived by"
                >
                  <option value="all">All Archived By</option>
                  {studentArchivedByOptions.map((r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  className="filter-clear-btn"
                  onClick={() => {
                    setStudentProgramFilter("all");
                    setStudentArchivedByFilter("all");
                    setStudentSearchQuery("");
                    setCurrentStudentPage(1);
                  }}
                  title="Clear student filters"
                >
                  Clear
                </button>
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
                    <th>Student ID</th>
                    <th>Email</th>
                    <th>Program</th>
                    <th>Created At</th>
                    <th>Archived At</th>
                    <th>Archived By</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {deletedStudents.length === 0 ? (
                    <tr>
                      <td colSpan="8" style={{ padding: 0, border: "none" }}>
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
                      <td colSpan="8" style={{ padding: 0, border: "none" }}>
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
                      <tr 
                        key={s.id}
                        className="clickable-row"
                        onClick={() => {
                          setSelectedStudent(s);
                          setShowStudentModal(true);
                        }}
                        style={{ cursor: 'pointer' }}
                      >
                        <td>
                          {s.firstName || ""} {s.lastName || ""}
                        </td>
                        <td>{s.studentId || "N/A"}</td>
                        <td>{s.email || "N/A"}</td>
                        <td>{s.program || "N/A"}</td>
                        <td>
                          {formatDateTime(s.createdAt)}
                        </td>
                        <td>
                          {formatDateTime(s.deletedAt)}
                        </td>
                        <td>{s.deletedByRole || "N/A"}</td>
                        <td>
                          <button
                            className="restore-btn"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleRestoreClick(s, "student");
                            }}
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
          )}

          {activeTab === "companies" && (
          <section className="deleted-section" role="tabpanel">
            <div className="section-header">
              <div className="section-title-wrapper">
                <IoBusinessOutline className="section-icon" />
                <h2>Archived Companies</h2>
                <span className="section-count">({deletedCompanies.length})</span>
              </div>
              <div className="filters-wrapper" aria-label="Company archive filters">
                <select
                  className="filter-select"
                  value={companyFieldFilter}
                  onChange={(e) => {
                    setCompanyFieldFilter(e.target.value);
                    setCurrentCompanyPage(1);
                  }}
                  aria-label="Filter by field"
                >
                  <option value="all">All Fields</option>
                  {companyFieldOptions.map((f) => (
                    <option key={f} value={f}>
                      {f}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  className="filter-clear-btn"
                  onClick={() => {
                    setCompanyFieldFilter("all");
                    setCompanySearchQuery("");
                    setCurrentCompanyPage(1);
                  }}
                  title="Clear company filters"
                >
                  Clear
                </button>
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
                    <th>Created At</th>
                    <th>Archived At</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {deletedCompanies.length === 0 ? (
                    <tr>
                      <td colSpan="6" style={{ padding: 0, border: "none" }}>
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
                      <td colSpan="6" style={{ padding: 0, border: "none" }}>
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
                      <tr 
                        key={c.id}
                        className="clickable-row"
                        onClick={() => {
                          setSelectedCompany(c);
                          setShowCompanyModal(true);
                        }}
                        style={{ cursor: 'pointer' }}
                      >
                        <td>{c.companyName || c.companyDescription || "N/A"}</td>
                        <td>{c.companyEmail || "N/A"}</td>
                        <td>
                          {Array.isArray(c.fields) ? c.fields.join(", ") : "N/A"}
                        </td>
                        <td>
                          {formatDateTime(c.createdAt)}
                        </td>
                        <td>
                          {formatDateTime(c.deletedAt)}
                        </td>
                        <td>
                          <button
                            className="restore-btn"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleRestoreClick(c, "company");
                            }}
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
          )}

          {activeTab === "admins" && (
          <section className="deleted-section" role="tabpanel">
            <div className="section-header">
              <div className="section-title-wrapper">
                <IoShieldOutline className="section-icon" />
                <h2>Archived Users</h2>
                <span className="section-count">({deletedAdmins.length})</span>
              </div>
              <div className="filters-wrapper" aria-label="User archive filters">
                <select
                  className="filter-select"
                  value={adminRoleFilter}
                  onChange={(e) => {
                    setAdminRoleFilter(e.target.value);
                    setCurrentAdminPage(1);
                  }}
                  aria-label="Filter by user role"
                >
                  <option value="all">All Roles</option>
                  {adminRoleOptions.map((r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  className="filter-clear-btn"
                  onClick={() => {
                    setAdminRoleFilter("all");
                    setAdminSearchQuery("");
                    setCurrentAdminPage(1);
                  }}
                  title="Clear user filters"
                >
                  Clear
                </button>
              </div>
              <div className="search-wrapper">
                <IoSearchOutline className="search-icon" />
                <input
                  type="text"
                  className="search-input"
                  placeholder="Search users..."
                  value={adminSearchQuery}
                  onChange={(e) => {
                    setAdminSearchQuery(e.target.value);
                    setCurrentAdminPage(1);
                  }}
                />
                {adminSearchQuery && (
                  <button
                    className="search-clear"
                    onClick={() => {
                      setAdminSearchQuery("");
                      setCurrentAdminPage(1);
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
                    <th>Username</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Program</th>
                    <th>Created At</th>
                    <th>Archived At</th>
                    <th>Archived By</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {deletedAdmins.length === 0 ? (
                    <tr>
                      <td colSpan="8" style={{ padding: 0, border: "none" }}>
                        <EmptyState
                          type="document"
                          title="No archived users"
                          message="There are no archived user records at this time."
                          icon={IoShieldOutline}
                        />
                      </td>
                    </tr>
                  ) : filteredAdmins.length === 0 ? (
                    <tr>
                      <td colSpan="8" style={{ padding: 0, border: "none" }}>
                        <EmptyState
                          type="search"
                          title="No users found"
                          message="No archived users match your search criteria."
                          icon={IoShieldOutline}
                        />
                      </td>
                    </tr>
                  ) : (
                    paginatedAdmins.map((admin) => (
                      <tr key={admin.id}>
                        <td>{admin.deletedUsername || "N/A"}</td>
                        <td>{admin.deletedEmail || "N/A"}</td>
                        <td>{admin.deletedRole || "N/A"}</td>
                        <td>{admin.deletedProgram || "N/A"}</td>
                        <td>
                          {formatDateTime(admin.createdAt)}
                        </td>
                        <td>
                          {formatDateTime(admin.deletedAt)}
                        </td>
                        <td>{admin.deletedByRole || "N/A"}</td>
                        <td>
                          <button
                            type="button"
                            className="restore-btn"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleRestoreClick(admin, "user");
                            }}
                            disabled={isRestoring}
                            title="Restore user"
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
            {adminTotalPages > 1 && (
              <div className="pagination">
                <div className="pagination-info">
                  Showing {adminIndexOfFirst + 1} to {Math.min(adminIndexOfLast, filteredAdmins.length)} of {filteredAdmins.length}
                </div>
                <div className="pagination-controls">
                  <button
                    className="pagination-btn"
                    onClick={() => setCurrentAdminPage((prev) => Math.max(1, prev - 1))}
                    disabled={currentAdminPage === 1}
                    aria-label="Previous page"
                  >
                    ‹
                  </button>
                  {[...Array(adminTotalPages)].map((_, index) => {
                    const page = index + 1;
                    if (
                      page === 1 ||
                      page === adminTotalPages ||
                      (page >= currentAdminPage - 1 && page <= currentAdminPage + 1)
                    ) {
                      return (
                        <button
                          key={page}
                          className={`pagination-btn ${currentAdminPage === page ? "active" : ""}`}
                          onClick={() => setCurrentAdminPage(page)}
                          aria-label={`Go to page ${page}`}
                        >
                          {page}
                        </button>
                      );
                    } else if (page === currentAdminPage - 2 || page === currentAdminPage + 2) {
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
                    onClick={() => setCurrentAdminPage((prev) => Math.min(adminTotalPages, prev + 1))}
                    disabled={currentAdminPage === adminTotalPages}
                    aria-label="Next page"
                  >
                    ›
                  </button>
                </div>
              </div>
            )}
          </section>
          )}

          {activeTab === "requirements" && (
          <section className="deleted-section" role="tabpanel">
            <div className="section-header">
              <div className="section-title-wrapper">
                <IoDocumentTextOutline className="section-icon" />
                <h2>Rejected Requirements</h2>
                <span className="section-count">({rejectedRequirements.length})</span>
              </div>
              <div className="filters-wrapper" aria-label="Rejected requirements filters">
                <select
                  className="filter-select"
                  value={requirementTypeFilter}
                  onChange={(e) => {
                    setRequirementTypeFilter(e.target.value);
                    setCurrentRequirementPage(1);
                  }}
                  aria-label="Filter by requirement type"
                >
                  <option value="all">All Types</option>
                  {requirementTypeOptions.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
                <select
                  className="filter-select"
                  value={requirementStudentFilter}
                  onChange={(e) => {
                    setRequirementStudentFilter(e.target.value);
                    setCurrentRequirementPage(1);
                  }}
                  aria-label="Filter by student"
                >
                  <option value="all">All Students</option>
                  {requirementStudentOptions.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
                <select
                  className="filter-select"
                  value={requirementSortBy}
                  onChange={(e) => {
                    setRequirementSortBy(e.target.value);
                    setCurrentRequirementPage(1);
                  }}
                  aria-label="Sort by"
                >
                  <option value="rejectedAt">Sort by Rejected Date</option>
                  <option value="uploadedAt">Sort by Uploaded Date</option>
                  <option value="studentName">Sort by Student Name</option>
                  <option value="requirementType">Sort by Requirement Type</option>
                </select>
                <button
                  type="button"
                  className="filter-select"
                  onClick={() => {
                    setRequirementSortOrder(prev => prev === "asc" ? "desc" : "asc");
                    setCurrentRequirementPage(1);
                  }}
                  title={`Sort ${requirementSortOrder === "asc" ? "Descending" : "Ascending"}`}
                  style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}
                >
                  {requirementSortOrder === "asc" ? <IoChevronUpOutline /> : <IoChevronDownOutline />}
                  {requirementSortOrder === "asc" ? "Asc" : "Desc"}
                </button>
                <button
                  type="button"
                  className="filter-clear-btn"
                  onClick={() => {
                    setRequirementTypeFilter("all");
                    setRequirementStudentFilter("all");
                    setRequirementSearchQuery("");
                    setRequirementSortBy("rejectedAt");
                    setRequirementSortOrder("desc");
                    setCurrentRequirementPage(1);
                  }}
                  title="Clear requirement filters"
                >
                  Clear
                </button>
              </div>
              <div className="search-wrapper">
                <IoSearchOutline className="search-icon" />
                <input
                  type="text"
                  className="search-input"
                  placeholder="Search rejected requirements..."
                  value={requirementSearchQuery}
                  onChange={(e) => {
                    setRequirementSearchQuery(e.target.value);
                    setCurrentRequirementPage(1);
                  }}
                />
                {requirementSearchQuery && (
                  <button
                    className="search-clear"
                    onClick={() => {
                      setRequirementSearchQuery("");
                      setCurrentRequirementPage(1);
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
                    <th>Student</th>
                    <th>Requirements</th>
                    <th>Latest Rejection</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {rejectedRequirements.length === 0 ? (
                    <tr>
                      <td colSpan="4" style={{ padding: 0, border: "none" }}>
                        <EmptyState
                          type="document"
                          title="No rejected requirements"
                          message="There are no rejected requirement files at this time."
                          icon={IoDocumentTextOutline}
                        />
                      </td>
                    </tr>
                  ) : groupedRequirements.length === 0 ? (
                    <tr>
                      <td colSpan="4" style={{ padding: 0, border: "none" }}>
                        <EmptyState
                          type="search"
                          title="No requirements found"
                          message="No rejected requirements match your search criteria."
                          icon={IoDocumentTextOutline}
                        />
                      </td>
                    </tr>
                  ) : (
                    paginatedGroups.map((group) => {
                      return (
                        <tr key={group.studentName} className="requirement-group-row">
                          <td>
                            <div className="group-student-cell">
                              <IoPeopleOutline className="student-icon" />
                              <span className="group-student-name">{group.studentName}</span>
                            </div>
                          </td>
                          <td>
                            <span className="group-requirement-count-badge">
                              {group.requirements.length} requirement{group.requirements.length !== 1 ? 's' : ''}
                            </span>
                          </td>
                          <td>
                            <div className="date-cell">
                              <IoCalendarOutline className="date-icon" />
                              <span>{formatDateTime(group.latestRejectedAt ? new Date(group.latestRejectedAt) : null)}</span>
                            </div>
                          </td>
                          <td>
                            <button
                              type="button"
                              className="view-details-btn"
                              onClick={() => setSelectedRequirementGroup(group)}
                              title="View requirement details"
                            >
                              <IoEyeOutline />
                              <span>View Details</span>
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
            {requirementTotalPages > 1 && (
              <div className="pagination">
                <div className="pagination-info">
                  Showing {requirementIndexOfFirst + 1} to {Math.min(requirementIndexOfLast, groupedRequirements.length)} of {groupedRequirements.length} group{groupedRequirements.length !== 1 ? 's' : ''} ({filteredRequirements.length} total requirement{filteredRequirements.length !== 1 ? 's' : ''})
                </div>
                <div className="pagination-controls">
                  <button
                    className="pagination-btn"
                    onClick={() => setCurrentRequirementPage((prev) => Math.max(1, prev - 1))}
                    disabled={currentRequirementPage === 1}
                    aria-label="Previous page"
                  >
                    ‹
                  </button>
                  {[...Array(requirementTotalPages)].map((_, index) => {
                    const page = index + 1;
                    if (
                      page === 1 ||
                      page === requirementTotalPages ||
                      (page >= currentRequirementPage - 1 && page <= currentRequirementPage + 1)
                    ) {
                      return (
                        <button
                          key={page}
                          className={`pagination-btn ${currentRequirementPage === page ? "active" : ""}`}
                          onClick={() => setCurrentRequirementPage(page)}
                          aria-label={`Go to page ${page}`}
                        >
                          {page}
                        </button>
                      );
                    } else if (page === currentRequirementPage - 2 || page === currentRequirementPage + 2) {
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
                    onClick={() => setCurrentRequirementPage((prev) => Math.min(requirementTotalPages, prev + 1))}
                    disabled={currentRequirementPage === requirementTotalPages}
                    aria-label="Next page"
                  >
                    ›
                  </button>
                </div>
              </div>
            )}
          </section>
          )}
        </div>
      </div>
      <StudentDetailModal
        open={showStudentModal}
        student={selectedStudent}
        onClose={() => {
          setShowStudentModal(false);
          setSelectedStudent(null);
        }}
        onRestore={() => {
          if (selectedStudent) {
            handleRestoreClick(selectedStudent, "student");
            setShowStudentModal(false);
          }
        }}
      />
      <CompanyDetailModal
        open={showCompanyModal}
        company={selectedCompany}
        onClose={() => {
          setShowCompanyModal(false);
          setSelectedCompany(null);
        }}
        onRestore={() => {
          if (selectedCompany) {
            handleRestoreClick(selectedCompany, "company");
            setShowCompanyModal(false);
          }
        }}
      />
      <ConfirmModal
        open={showConfirm}
        message={getRestoreMessage()}
        onConfirm={handleRestore}
        onCancel={cancelRestore}
        confirmButtonText="Yes, restore it!"
        confirmButtonClass="confirm-btn restore-confirm-btn"
      />
      
      {/* Requirement Group Details Modal */}
      {selectedRequirementGroup && (
        <div 
          className="requirement-group-modal-backdrop"
          onClick={() => setSelectedRequirementGroup(null)}
        >
          <div 
            className="requirement-group-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="requirement-group-modal-header">
              <div className="modal-header-content">
                <h2>
                  <IoPeopleOutline className="header-icon" />
                  {selectedRequirementGroup.studentName}
                </h2>
                <p className="modal-subtitle">
                  {selectedRequirementGroup.requirements.length} rejected requirement{selectedRequirementGroup.requirements.length !== 1 ? 's' : ''}
                </p>
              </div>
              <button
                type="button"
                className="modal-close-btn"
                onClick={() => setSelectedRequirementGroup(null)}
                aria-label="Close modal"
              >
                <IoCloseOutline />
              </button>
            </div>
            
            <div className="requirement-group-modal-body">
              <div className="requirements-list">
                {selectedRequirementGroup.requirements.map((req) => {
                  const FileIcon = getFileTypeIcon(req.fileName, req.contentType);
                  const isReasonExpanded = expandedReasonId === req.id;
                  const reasonText = req.rejectionReason || "No reason provided";
                  const shouldTruncateReason = reasonText.length > 50;
                  
                  return (
                    <div key={req.id} className="requirement-item-card">
                      <div className="requirement-item-header">
                        <div className="requirement-item-title">
                          <FileIcon className="file-type-icon" />
                          <div className="requirement-item-info">
                            <span className="requirement-type-badge">{req.requirementType || "N/A"}</span>
                            <span className="requirement-file-name">{req.fileName || "N/A"}</span>
                            {req.fileSize && (
                              <span className="requirement-file-size">{formatFileSize(req.fileSize)}</span>
                            )}
                          </div>
                        </div>
                        <div className="requirement-item-actions">
                          {req.archiveURL && (
                            <>
                              <button
                                type="button"
                                className="action-btn view-btn"
                                onClick={() => window.open(req.archiveURL, '_blank', 'noopener,noreferrer')}
                                title="View file"
                              >
                                <IoOpenOutline />
                              </button>
                              <button
                                type="button"
                                className="action-btn download-btn"
                                onClick={() => handleDownloadFile(req.archiveURL, req.fileName)}
                                title="Download file"
                              >
                                <IoDownloadOutline />
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                      
                      <div className="requirement-item-details">
                        <div className="detail-row">
                          <span className="detail-label">
                            <IoCalendarOutline />
                            Uploaded At:
                          </span>
                          <span className="detail-value">{formatDateTime(req.originalUploadedAt)}</span>
                        </div>
                        <div className="detail-row">
                          <span className="detail-label">
                            <IoCalendarOutline />
                            Rejected At:
                          </span>
                          <span className="detail-value">{formatDateTime(req.rejectedAt)}</span>
                        </div>
                        <div className="detail-row">
                          <span className="detail-label">Rejected By:</span>
                          <span className="detail-value rejected-by-badge">{req.rejectedBy || "N/A"}</span>
                        </div>
                        <div className="detail-row reason-row">
                          <span className="detail-label">Rejection Reason:</span>
                          <div className="reason-content">
                            {shouldTruncateReason ? (
                              <>
                                <span className={`rejection-reason-text ${isReasonExpanded ? 'expanded' : ''}`}>
                                  {isReasonExpanded ? reasonText : reasonText.substring(0, 50) + '...'}
                                </span>
                                <button
                                  type="button"
                                  className="expand-reason-btn"
                                  onClick={() => setExpandedReasonId(isReasonExpanded ? null : req.id)}
                                  title={isReasonExpanded ? "Collapse reason" : "Expand reason"}
                                >
                                  {isReasonExpanded ? <IoChevronUpOutline /> : <IoChevronDownOutline />}
                                </button>
                              </>
                            ) : (
                              <span className="rejection-reason-text">{reasonText}</span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
            
            <div className="requirement-group-modal-footer">
              <button
                type="button"
                className="modal-close-button"
                onClick={() => setSelectedRequirementGroup(null)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
      
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </div>
  );
};

export default DeletedRecords;




