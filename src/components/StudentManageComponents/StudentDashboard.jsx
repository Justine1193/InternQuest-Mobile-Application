/**
 * StudentDashboard - Admin dashboard for managing students
 * Fetches and displays student/company data, supports search, filter, selection, notification, and deletion.
 *
 * @component
 * @example
 * <StudentDashboard />
 */

import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
  useMemo,
} from "react";
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
  getDoc,
  setDoc,
  onSnapshot,
  where,
  serverTimestamp,
} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL, listAll } from "firebase/storage";
import { storage } from "../../../firebase.js";
import {
  IoTrashOutline,
  IoDownloadOutline,
  IoPersonAddOutline,
  IoAddOutline,
  IoCloudUploadOutline,
  IoBusinessOutline,
  IoPeopleOutline,
  IoCheckmarkCircle,
  IoTimeOutline,
  IoCloseCircle,
  IoDocumentTextOutline,
  IoFilterOutline,
  IoClose,
  IoSearchOutline,
  IoCloseOutline,
  IoNotificationsOutline,
  IoPaperPlaneOutline,
  IoPersonOutline,
  IoSchoolOutline,
  IoCalendarOutline,
  IoImageOutline,
  IoAttachOutline,
  IoCloseCircleOutline,
} from "react-icons/io5";
import logo from "../../assets/InternQuest_Logo.png";
import { signOut, createUserWithEmailAndPassword, onAuthStateChanged } from "firebase/auth";
import { auth } from "../../../firebase.js";
import { attemptDeleteAuthUser } from "../../utils/authDelete";
import {
  clearAdminSession,
  getAdminRole,
  getAdminSession,
  isAdviserOnly,
  getAdminCollegeCode,
  ROLES,
} from "../../utils/auth";
import {
  loadProgramToCollegeMap,
  loadColleges,
} from "../../utils/collegeUtils";
import Navbar from "../Navbar/Navbar.jsx";
import SearchBar from "../SearchBar/SearchBar.jsx";
import StudentTable from "./Table/StudentTable.jsx";
import ConfirmModal from "../ConfirmModalComponents/ConfirmModal.jsx";
import ConfirmAction from "../ConfirmAction/ConfirmAction.jsx";
import LoadingSpinner from "../LoadingSpinner.jsx";
import SkeletonLoader from "../SkeletonLoader/SkeletonLoader.jsx";
import StudentRequirementModal from "./StudentRequirementModal.jsx";
import AddStudentModal from "./AddStudentModal.jsx";
import ToastContainer from "../Toast/ToastContainer.jsx";
import { useToast } from "../../hooks/useToast.js";
import useKeyboardShortcuts from "../../hooks/useKeyboardShortcuts.js";
import Tooltip from "../Tooltip/Tooltip.jsx";
import {
  downloadCSV,
  prepareStudentsForExport,
} from "../../utils/exportUtils.js";
import {
  readCSVFile,
  parseCSV,
  convertCSVToStudents,
} from "../../utils/importUtils.js";
import { activityLoggers } from "../../utils/activityLogger.js";
import logger from "../../utils/logger.js";
import "./StudentDashboard.css";
import "../DashboardOverview/DashboardOverview.css";
import "./NotificationSection.css";
import "../dashboardTheme.css";
import Footer from "../Footer/Footer.jsx";

// --- Student Dashboard Main Component ---
const StudentDashboard = () => {
  const currentRole = getAdminRole();
  const isAdviser = isAdviserOnly();
  const session = getAdminSession();
  const adminId = session?.adminId || null;
  const [adminSection, setAdminSection] = useState(null);
  const adminCollegeCode = getAdminCollegeCode();
  const [programToCollegeMap, setProgramToCollegeMap] = useState({});
  const [adminPrograms, setAdminPrograms] = useState([]); // coordinator scope (programs)
  const [adminCollegeName, setAdminCollegeName] = useState(null);
  // Auth user from Firebase (only set after onAuthStateChanged fires so Firestore has token)
  const [authUser, setAuthUser] = useState(null);

  // Sync auth state so Firestore requests run only after token is available
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setAuthUser(user ?? null);
    });
    return () => unsubscribe();
  }, []);

  // Set document title on mount
  useEffect(() => {
    document.title = "Student Dashboard | InternQuest Admin";
  }, []);

  // Handle CSV import for students
  const handleImportStudents = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setIsImporting(true);
      setImportProgress({ current: 0, total: 0 });

      // Read CSV file
      const csvText = await readCSVFile(file);

      // Parse CSV
      const csvData = parseCSV(csvText);

      // Convert to student objects
      const { students, errors } = convertCSVToStudents(csvData);

      if (students.length === 0) {
        showError("No valid students found in CSV file");
        return;
      }

      // Check for duplicate student IDs within the CSV file
      const studentIdMap = new Map();
      const csvDuplicates = [];
      students.forEach((student, index) => {
        const studentId = student.studentId || "";
        if (studentId) {
          if (studentIdMap.has(studentId)) {
            csvDuplicates.push({
              studentId: studentId,
              firstRow: studentIdMap.get(studentId) + 2, // +2 for header and 0-index
              duplicateRow: index + 2,
              firstName: student.firstName,
              lastName: student.lastName,
            });
          } else {
            studentIdMap.set(studentId, index);
          }
        }
      });

      if (csvDuplicates.length > 0) {
        const duplicateMessages = csvDuplicates.map(
          (dup) =>
            `Student ID "${dup.studentId}" (${dup.firstName} ${dup.lastName}) appears in rows ${dup.firstRow} and ${dup.duplicateRow}`
        );
        showError(
          `Found ${
            csvDuplicates.length
          } duplicate student ID(s) in CSV file:\n${duplicateMessages.join(
            "\n"
          )}\n\nOnly the first occurrence will be imported.`
        );
        // Continue with import - duplicates will be skipped during import
      }

      setImportProgress({ current: 0, total: students.length });

      // Track which student IDs have been imported in this batch
      const importedInBatch = new Set();

      // Batch import students
      let successCount = 0;
      let errorCount = 0;
      const importErrors = [];

      for (let i = 0; i < students.length; i++) {
        try {
          const student = students[i];

          // Check if student ID already exists
          const importStudentIdValue = student.studentId || "";
          let trimmedId = "";

          if (importStudentIdValue) {
            // Validate Student ID format: XX-XXXXX-XXX
            trimmedId = importStudentIdValue.trim();
            const perfectFormatRegex = /^\d{2}-\d{5}-\d{3}$/;
            if (!perfectFormatRegex.test(trimmedId)) {
              throw new Error(
                `Invalid Student ID format: "${trimmedId}". Must be in format XX-XXXXX-XXX (e.g., 12-12345-678)`
              );
            }

            // First check if this ID was already imported in this CSV batch
            if (importedInBatch.has(trimmedId)) {
              throw new Error(
                `Duplicate Student ID in CSV file - already imported earlier in this batch`
              );
            }

            // Then check if it exists in Firestore database
            // Check studentId field
            const studentIdQuery = query(
              collection(db, "users"),
              where("studentId", "==", trimmedId)
            );
            const studentIdSnapshot = await getDocs(studentIdQuery);

            if (!studentIdSnapshot.empty) {
              throw new Error(
                `Student ID ${trimmedId} already exists in database`
              );
            }
          }

          // Validate email is provided
          if (!student.email) {
            throw new Error("Email is required");
          }

          // Validate email format with stricter Firebase-compatible regex
          const emailRegex =
            /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
          const trimmedEmail = student.email.trim();
          if (!emailRegex.test(trimmedEmail)) {
            throw new Error("Invalid email format");
          }

          // Validate email length
          if (trimmedEmail.length > 256) {
            throw new Error("Email address is too long");
          }

          // Validate password
          const password = student.password || "DefaultPassword123!";
          if (!password || password.length < 6) {
            throw new Error("Password must be at least 6 characters long");
          }

          // Create Firebase Auth account with actual student email
          let firebaseUser;
          try {
            // Normalize email (lowercase, trimmed)
            const normalizedEmail = trimmedEmail.toLowerCase();

            const userCredential = await createUserWithEmailAndPassword(
              auth,
              normalizedEmail, // Use normalized email for Firebase Auth
              password
            );
            firebaseUser = userCredential.user;
          } catch (authError) {
            if (authError.code === "auth/email-already-in-use") {
              throw new Error(`Email ${trimmedEmail} is already in use`);
            }
            if (authError.code === "auth/invalid-email") {
              throw new Error(`Invalid email format: ${trimmedEmail}`);
            }
            if (authError.code === "auth/weak-password") {
              throw new Error(
                "Password is too weak. Password must be at least 6 characters long."
              );
            }
            // Log full error for debugging
            console.error("Firebase Auth error during CSV import:", {
              code: authError.code,
              message: authError.message,
              email: trimmedEmail,
            });
            throw new Error(
              `Failed to create Firebase Auth account: ${authError.message}`
            );
          }

          // Normalize email (lowercase, trimmed) - same format used for Firebase Auth
          const normalizedEmail = trimmedEmail.toLowerCase();

          const newStudent = {
            studentId: trimmedId || importStudentIdValue?.trim() || "",
            firstName: student.firstName,
            lastName: student.lastName,
            email: normalizedEmail, // Store institutional email (same as authEmail - both use normalized email)
            authEmail: normalizedEmail, // Store email used for Firebase Auth (same as email - both use institutional email)
            uid: firebaseUser.uid, // Link to Firebase Auth UID
            section: student.section || "",
            college: student.college || "",
            program: student.program,
            yearLevel: student.yearLevel || "",
            contact: student.contact || "",
            companyName: student.companyName || "",
            status: student.status || false,
            createdAt: student.createdAt || new Date().toISOString(),
            updatedAt: student.updatedAt || new Date().toISOString(),
            // Track who created this student
            createdBy: (() => {
              const session = getAdminSession();
              return session
                ? {
                    username: session.username || "Unknown",
                    role: session.role || "Unknown",
                    adminId: session.adminId || null,
                  }
                : null;
            })(),
          };

          const docRef = await addDoc(collection(db, "users"), newStudent);

          // Mark this student ID as imported in this batch
          if (importStudentIdValue) {
            importedInBatch.add(trimmedId);
          }

          // Log activity
          await activityLoggers.createStudent(
            docRef.id,
            `${newStudent.firstName} ${newStudent.lastName}`
          );

          successCount++;
        } catch (err) {
          errorCount++;
          importErrors.push({
            student: `${students[i].firstName} ${students[i].lastName}`,
            error: err.message,
          });
          logger.error(
            `Failed to import student ${students[i].firstName} ${students[i].lastName}:`,
            err
          );
        }

        setImportProgress({ current: i + 1, total: students.length });
      }

      // Show results
      if (successCount > 0) {
        success(`Successfully imported ${successCount} student/students`);
        if (errorCount > 0) {
          showError(
            `${errorCount} student/students failed to import. Check console for details.`
          );
        }
        if (errors.length > 0) {
          logger.warn(`CSV parsing errors:`, errors);
        }
      } else {
        showError(
          "Failed to import any students. Please check the CSV format."
        );
      }

      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } catch (err) {
      logger.error("Import error:", err);
      showError(
        err.message || "Failed to import CSV file. Please check the format."
      );
    } finally {
      setIsImporting(false);
      setImportProgress({ current: 0, total: 0 });
    }
  };

  // Fetch admin profile to get assigned sections and college (for advisers and coordinators with sections)
  useEffect(() => {
    let isMounted = true; // Track if component is still mounted

    const fetchAdminProfile = async () => {
      // Fetch for advisers, coordinators, and admins
      if (!adminId) return;
      try {
        const adminRef = doc(db, "adminusers", adminId);
        const adminSnap = await getDoc(adminRef);
        if (!isMounted) return; // Component unmounted, don't update state

        if (adminSnap.exists()) {
          const data = adminSnap.data();
          // Support both old single section and new multiple sections
          const sections =
            data.sections || (data.section ? [data.section] : []);
          if (isMounted) {
            setAdminSection(sections.length > 0 ? sections : null);
          }

          // Coordinator program scope (preferred): program/programs fields
          // Fallback: derive from assigned section format (e.g., 4BSIT-2 -> BSIT)
          if (isMounted && currentRole === ROLES.COORDINATOR) {
            const rawPrograms =
              data.programs || (data.program ? [data.program] : []);
            let normalized = Array.isArray(rawPrograms)
              ? rawPrograms
                  .filter((p) => typeof p === "string" && p.trim())
                  .map((p) => p.trim().toUpperCase())
              : [];

            if (normalized.length === 0 && sections.length > 0) {
              const derived = new Set();
              sections.forEach((s) => {
                if (typeof s !== "string") return;
                const match = s.match(/^\d+([A-Z]+)-/i);
                if (match?.[1]) derived.add(match[1].toUpperCase());
              });
              normalized = Array.from(derived);
            }

            setAdminPrograms(normalized);
          }

          // Get college for adviser or coordinator
          // First, try to get college_code directly from admin document
          let adviserCollegeCode = data.college_code;

          // If no college_code but has sections, extract college from section's program code
          if (!adviserCollegeCode && sections.length > 0) {
            // Extract program code from first section (format: 4BSIT-2 -> BSIT)
            const firstSection = sections[0];
            if (typeof firstSection === "string") {
              const match = firstSection.match(/^\d+([A-Z]+)-/i);
              if (match && match[1]) {
                const programCode = match[1].toUpperCase();
                // Use meta/program_code to find which college this program code belongs to
                try {
                  const programCodeDocRef = doc(db, "meta", "program_code");
                  const programCodeSnap = await getDoc(programCodeDocRef);
                  if (programCodeSnap.exists()) {
                    const codeData = programCodeSnap.data();
                    // Check if data is organized by college
                    const isCollegeOrganized = Object.keys(codeData).some(
                      (key) => {
                        const value = codeData[key];
                        return (
                          Array.isArray(value) &&
                          value.length > 0 &&
                          typeof value[0] === "string"
                        );
                      }
                    );

                    if (isCollegeOrganized) {
                      // Find which college contains this program code
                      let foundCollegeName = null;
                      for (const [collegeName, codes] of Object.entries(
                        codeData
                      )) {
                        if (Array.isArray(codes)) {
                          const codeExists = codes.some(
                            (c) =>
                              typeof c === "string" &&
                              c.trim().toUpperCase() === programCode
                          );
                          if (codeExists) {
                            foundCollegeName = collegeName;
                            break;
                          }
                        }
                      }

                      // If we found the college, get the college code
                      if (foundCollegeName) {
                        const colleges = await loadColleges();
                        const college = colleges.find(
                          (c) => c.college_name === foundCollegeName
                        );
                        if (college) {
                          adviserCollegeCode = college.college_code;
                        }
                      }
                    }
                  }
                } catch (err) {
                  logger.error(
                    "Error loading program code to college mapping:",
                    err
                  );
                }
              }
            }
          }

          // If we found a college code, get the college name
          if (adviserCollegeCode && isMounted) {
            try {
              const colleges = await loadColleges();
              if (!isMounted) return; // Component unmounted, don't update state
              const college = colleges.find(
                (c) => c.college_code === adviserCollegeCode
              );
              if (college && isMounted) {
                setAdminCollegeName(college.college_name);
              } else if (!college && isMounted) {
                setAdminCollegeName(null);
              }
            } catch (err) {
              logger.error("Error loading colleges:", err);
            }
          } else if (!adviserCollegeCode && isMounted) {
            setAdminCollegeName(null);
          }
        } else {
          if (isMounted) {
            setAdminSection(null);
            setAdminCollegeName(null);
          }
        }
      } catch (err) {
        logger.error("Error fetching admin profile:", err);
        if (isMounted) {
          setAdminSection(null);
          setAdminCollegeName(null);
        }
      }
    };

    fetchAdminProfile();

    // Cleanup function to prevent state updates if component unmounts
    return () => {
      isMounted = false;
    };
  }, [isAdviser, currentRole, adminId]);

  // Load program-to-college mapping for coordinator filtering
  useEffect(() => {
    const loadMapping = async () => {
      if (currentRole === ROLES.COORDINATOR && adminCollegeCode) {
        try {
          const map = await loadProgramToCollegeMap();
          setProgramToCollegeMap(map);

          // Load colleges to get college name from code
          const colleges = await loadColleges();
          const college = colleges.find(
            (c) => c.college_code === adminCollegeCode
          );
          if (college) {
            setAdminCollegeName(college.college_name);
          }
        } catch (err) {
          logger.error("Error loading program to college map:", err);
        }
      }
    };
    loadMapping();
  }, [currentRole, adminCollegeCode]);

  // --- State ---
  const [isLoading, setIsLoading] = useState(false);
  const [students, setStudents] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [overviewStats, setOverviewStats] = useState({
    totalCompanies: 0,
    totalStudents: 0,
    pendingRequirements: 0,
    approvedRequirements: 0,
    totalRequirements: 0,
    hiredStudents: 0,
    activeFilters: 0,
  });
  const [activeFilterChips, setActiveFilterChips] = useState([]);
  const [showBulkToolbar, setShowBulkToolbar] = useState(false);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");
  const [notificationText, setNotificationText] = useState("");
  const [notificationSubject, setNotificationSubject] = useState("");
  const [notificationFile, setNotificationFile] = useState(null);
  const [notificationFilePreview, setNotificationFilePreview] = useState(null);
  const notificationMessageRef = useRef(null);
  const [notificationHtmlContent, setNotificationHtmlContent] = useState("");
  // Only admin can send to "all"; coordinators and advisers default to "section"
  const [notificationType, setNotificationType] = useState(() =>
    getAdminRole() === ROLES.SUPER_ADMIN ? "all" : "section"
  );
  const [selectedNotificationStudents, setSelectedNotificationStudents] =
    useState([]); // Array of student IDs
  const [selectedNotificationSection, setSelectedNotificationSection] =
    useState("");

  // Set default notification type: only admin can use "all"; coordinators and advisers use "section"
  useEffect(() => {
    if (isAdviser && adminSection) {
      // If adviser has a section, default to "section" and auto-select their section
      const adminSectionsArray = Array.isArray(adminSection)
        ? adminSection
        : [adminSection];
      if (notificationType === "all") {
        setNotificationType("section");
      }
      if (adminSectionsArray.length === 1 && !selectedNotificationSection) {
        setSelectedNotificationSection(adminSectionsArray[0]);
      }
    } else if (
      currentRole === ROLES.COORDINATOR &&
      notificationType === "all"
    ) {
      // Coordinators cannot send to "all" (admin only); default to "section"
      setNotificationType("section");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAdviser, adminSection, currentRole]);
  const [studentSearchQuery, setStudentSearchQuery] = useState("");
  const [showStudentDropdown, setShowStudentDropdown] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(8);
  // Kebab/Selection
  const [openMenuId, setOpenMenuId] = useState(null);
  const [selectedRowId, setSelectedRowId] = useState(null);
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedItems, setSelectedItems] = useState([]);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [showDeleteNotificationConfirm, setShowDeleteNotificationConfirm] =
    useState(false);
  const [notificationToDelete, setNotificationToDelete] = useState(null);
  const [isDeletingNotifications, setIsDeletingNotifications] = useState(false);
  const [selectedNotificationForView, setSelectedNotificationForView] =
    useState(null);
  const [showNotificationDetailModal, setShowNotificationDetailModal] =
    useState(false);
  const [messageHistorySearchQuery, setMessageHistorySearchQuery] =
    useState("");
  const [messageHistoryFilterSection, setMessageHistoryFilterSection] =
    useState("");
  const [messageHistoryFilterStudent, setMessageHistoryFilterStudent] =
    useState("");
  const [showDeleteAllConfirm, setShowDeleteAllConfirm] = useState(false);
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
    approvedRequirement: "",
    section: "",
    blocked: "",
  });
  const [pendingFilterValues, setPendingFilterValues] = useState({
    program: "",
    field: "",
    email: "",
    contact: "",
    hired: "",
    locationPreference: "",
    approvedRequirement: "",
    section: "",
    blocked: "",
  });
  // View mode: 'all', 'pending', 'applications', or 'notifications'
  const [viewMode, setViewMode] = useState("all");
  const [pendingStudentsWithRequirements, setPendingStudentsWithRequirements] =
    useState([]);
  const [isLoadingPendingStudents, setIsLoadingPendingStudents] =
    useState(false);
  const [applicationsList, setApplicationsList] = useState([]);
  const [isLoadingApplications, setIsLoadingApplications] = useState(false);
  const [updatingApplicationId, setUpdatingApplicationId] = useState(null);
  const [applicationsPage, setApplicationsPage] = useState(1);
  const [applicationsPageSize, setApplicationsPageSize] = useState(10);
  const [applicationsSearchQuery, setApplicationsSearchQuery] = useState("");
  const [applicationsStatusFilter, setApplicationsStatusFilter] =
    useState("all");
  const [applicationsSectionFilter, setApplicationsSectionFilter] =
    useState("");
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [showApplicationDetailModal, setShowApplicationDetailModal] =
    useState(false);
  const [applicationToRemove, setApplicationToRemove] = useState(null);
  const [showRemoveApplicationConfirm, setShowRemoveApplicationConfirm] =
    useState(false);
  const [isRemovingApplication, setIsRemovingApplication] = useState(false);
  const [applicationStatusConfirm, setApplicationStatusConfirm] =
    useState(null); // { app, action: 'accept' | 'reject' }
  const [showApplicationStatusConfirm, setShowApplicationStatusConfirm] =
    useState(false);
  const [requirementApprovals, setRequirementApprovals] = useState({}); // { studentId: { requirementType: { status, ... } } }
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });
  const [isImporting, setIsImporting] = useState(false);
  const [importProgress, setImportProgress] = useState({
    current: 0,
    total: 0,
  });
  const fileInputRef = useRef(null);
  const [studentSubmittedRequirements, setStudentSubmittedRequirements] =
    useState({}); // { studentId: [requirementTypes] }
  const [showAddStudentModal, setShowAddStudentModal] = useState(false);
  const [isCreatingStudent, setIsCreatingStudent] = useState(false);
  const { toasts, removeToast, success, error: showError } = useToast();
  const searchInputRef = useRef(null);

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
      logger.warn(`Failed to migrate avatar for user ${userId}:`, error);
      return { success: false, userId, error: error.message };
    }
  };

  // Check if a student has submitted requirements
  const checkStudentHasRequirements = async (studentId) => {
    try {
      const storagePath = `requirements/${studentId}`;
      const requirementsRef = ref(storage, storagePath);
      const folderList = await listAll(requirementsRef);

      // Check if there are any folders (requirement types) with files
      for (const folderPrefix of folderList.prefixes) {
        const folderFiles = await listAll(folderPrefix);
        if (folderFiles.items.length > 0) {
          return true; // Student has at least one requirement file
        }
      }
      return false;
    } catch (error) {
      // If folder doesn't exist or error, student has no requirements
      if (error.code === "storage/object-not-found") {
        return false;
      }
      logger.warn(
        `Error checking requirements for student ${studentId}:`,
        error
      );
      return false;
    }
  };

  // Fetch pending students with requirements
  const fetchPendingStudentsWithRequirements = useCallback(async () => {
    setIsLoadingPendingStudents(true);
    try {
      const pendingStudents = [];

      // Filter students who are not approved (status !== true) within role scope
      const scopedStudents = (() => {
        // Adviser: scope by section(s)
        if (currentRole === ROLES.ADVISER) {
          if (!adminSection) return [];
          const sections = Array.isArray(adminSection)
            ? adminSection
            : [adminSection];
          const sectionSet = new Set(
            sections
              .filter((s) => typeof s === "string" && s.trim())
              .map((s) => s.trim().toLowerCase())
          );
          if (sectionSet.size === 0) return [];
          return students.filter(
            (s) =>
              typeof s.section === "string" &&
              sectionSet.has(s.section.trim().toLowerCase())
          );
        }

        // Coordinator: if has assigned sections, use them; else use programs/college mapping
        if (currentRole === ROLES.COORDINATOR) {
          const coordinatorSections = adminSection
            ? Array.isArray(adminSection)
              ? adminSection
              : [adminSection]
            : [];
          const sectionSet = new Set(
            coordinatorSections
              .filter((s) => typeof s === "string" && s.trim())
              .map((s) => s.trim().toLowerCase())
          );
          if (sectionSet.size > 0) {
            return students.filter(
              (s) =>
                typeof s.section === "string" &&
                sectionSet.has(s.section.trim().toLowerCase())
            );
          }

          let allowedPrograms = Array.isArray(adminPrograms)
            ? adminPrograms
            : [];
          if (allowedPrograms.length === 0 && adminCollegeCode) {
            allowedPrograms = Object.entries(programToCollegeMap)
              .filter(([, code]) => code === adminCollegeCode)
              .map(([program]) =>
                typeof program === "string" ? program.trim().toUpperCase() : ""
              )
              .filter(Boolean);
          }
          if (allowedPrograms.length === 0) return [];
          const allowedSet = new Set(
            allowedPrograms.map((p) => (p || "").toString().toUpperCase())
          );
          return students.filter((s) => {
            const p = s.program;
            if (typeof p !== "string" || !p.trim()) return false;
            return allowedSet.has(p.trim().toUpperCase());
          });
        }

        // Admin / others: all students
        return students;
      })();

      const unapprovedStudents = scopedStudents.filter(
        (student) => student.status !== true
      );

      // Check each unapproved student for requirements
      for (const student of unapprovedStudents) {
        const hasRequirements = await checkStudentHasRequirements(student.id);
        if (hasRequirements) {
          pendingStudents.push(student);
        }
      }

      setPendingStudentsWithRequirements(pendingStudents);
    } catch (error) {
      logger.error("Error fetching pending students with requirements:", error);
      setError("Failed to fetch pending students with requirements.");
    } finally {
      setIsLoadingPendingStudents(false);
    }
  }, [
    students,
    currentRole,
    adminSection,
    adminPrograms,
    adminCollegeCode,
    programToCollegeMap,
  ]);

  // Real-time listeners for companies and students (only after auth state is ready)
  useEffect(() => {
    if (!authUser) {
      return;
    }
    setIsLoading(true);

    // Real-time listener for companies
    const companiesQuery = query(
      collection(db, "companies"),
      orderBy("companyName")
    );
    const unsubscribeCompanies = onSnapshot(
      companiesQuery,
      (snapshot) => {
        const companiesData = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setCompanies(companiesData);
        setOverviewStats((prev) => ({
          ...prev,
          totalCompanies: companiesData.length,
        }));
        logger.debug("Companies updated:", companiesData.length);
      },
      (err) => {
        logger.error("Error fetching companies:", err);
        setError("Failed to fetch companies. Please try again.");
      }
    );

    // Real-time listener for students
    const studentsQuery = query(collection(db, "users"), orderBy("firstName"));
    const unsubscribeStudents = onSnapshot(
      studentsQuery,
      (snapshot) => {
        const studentsData = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setStudents(studentsData);
        setIsLoading(false);
        logger.debug("Students updated:", studentsData.length);
      },
      (err) => {
        logger.error("Error fetching students:", err);
        setError("Failed to fetch students. Please try again.");
        setIsLoading(false);
      }
    );

    // Cleanup listeners on unmount
    return () => {
      unsubscribeCompanies();
      unsubscribeStudents();
    };
  }, [authUser?.uid]);

  // Legacy migration code (keep for backward compatibility) — only run when auth is ready
  useEffect(() => {
    if (!authUser) return;
    const fetchData = async () => {
      try {
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
        setOverviewStats((prev) => ({
          ...prev,
          totalCompanies: companiesData.length,
          totalStudents: studentsData.length,
        }));

        // Auto-migrate avatars in background (silently)
        const usersWithAvatars = studentsData.filter(
          (user) =>
            (user.avatarBase64 || user.avatarbase64) && !user.profilePictureUrl
        );

        if (usersWithAvatars.length > 0) {
          logger.debug(
            `ðŸ”„ Auto-migrating ${usersWithAvatars.length} avatar(s) to Storage...`
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
              logger.debug(
                `âœ… Avatar migration complete: ${successful} successful, ${failed} failed`
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
              logger.warn("Avatar migration error:", err);
            });
        }
      } catch (err) {
        setError("Failed to fetch data. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [authUser?.uid]);

  // Fetch pending students when view mode changes or students data changes
  useEffect(() => {
    if (viewMode === "pending" && students.length > 0) {
      fetchPendingStudentsWithRequirements();
    }
  }, [viewMode, students.length, fetchPendingStudentsWithRequirements]);

  // Helper: get time in ms from Firestore appliedAt/approvedAt (Timestamp, string, or number)
  const getApplicationTime = (val) => {
    if (val == null) return 0;
    if (typeof val === "string") return new Date(val).getTime();
    if (typeof val === "number") return val;
    if (val && typeof val.toDate === "function") return val.toDate().getTime();
    return 0;
  };

  // Fetch company applications (for Applications tab) — uses Firestore applications collection
  const fetchApplications = useCallback(async () => {
    try {
      setIsLoadingApplications(true);
      const applicationsRef = collection(db, "applications");
      const snapshot = await getDocs(applicationsRef);
      const list = snapshot.docs.map((d) => ({
        id: d.id,
        ...d.data(),
      }));
      list.sort((a, b) => {
        const tA = getApplicationTime(
          a.appliedAt || a.createdAt || a.timestamp
        );
        const tB = getApplicationTime(
          b.appliedAt || b.createdAt || b.timestamp
        );
        return tB - tA;
      });
      setApplicationsList(list);
    } catch (err) {
      logger.error("Error fetching applications:", err);
      showError("Failed to load applications. Please try again.");
    } finally {
      setIsLoadingApplications(false);
    }
  }, [showError]);

  useEffect(() => {
    if (viewMode === "applications") {
      fetchApplications();
    }
  }, [viewMode, fetchApplications]);

  // Applications search & filter: resolve display fields then filter
  const applicationsFiltered = useMemo(() => {
    const q = (applicationsSearchQuery || "").trim().toLowerCase();
    const statusFilter = (applicationsStatusFilter || "all").toLowerCase();
    const sectionFilter = (applicationsSectionFilter || "")
      .trim()
      .toLowerCase();
    return applicationsList.filter((app) => {
      const student = students.find((s) => s.id === app.userId);
      const studentName = (
        app.userProfile?.name ||
        app.userProfile?.email ||
        (student
          ? `${student.firstName || ""} ${student.lastName || ""}`.trim() ||
            student.email
          : null) ||
        app.studentName ||
        ""
      )
        .toString()
        .toLowerCase();
      const studentIdDisplay = (
        student?.studentId ??
        app.userProfile?.studentId ??
        ""
      )
        .toString()
        .toLowerCase();
      const sectionDisplay = (
        student?.section ??
        app.userProfile?.section ??
        ""
      )
        .toString()
        .toLowerCase();
      const companyName = (app.companyName || app.companyId || "")
        .toString()
        .toLowerCase();
      const status = (app.status || "pending").toLowerCase();
      if (
        q &&
        !studentName.includes(q) &&
        !studentIdDisplay.includes(q) &&
        !sectionDisplay.includes(q) &&
        !companyName.includes(q)
      )
        return false;
      if (statusFilter !== "all" && status !== statusFilter) return false;
      if (sectionFilter && sectionDisplay !== sectionFilter) return false;
      return true;
    });
  }, [
    applicationsList,
    students,
    applicationsSearchQuery,
    applicationsStatusFilter,
    applicationsSectionFilter,
  ]);

  // Applications pagination (on filtered list)
  const applicationsTotalPages = Math.max(
    1,
    Math.ceil(applicationsFiltered.length / applicationsPageSize)
  );
  const applicationsPaginated = useMemo(() => {
    const start = (applicationsPage - 1) * applicationsPageSize;
    return applicationsFiltered.slice(start, start + applicationsPageSize);
  }, [applicationsFiltered, applicationsPage, applicationsPageSize]);

  useEffect(() => {
    if (applicationsPage > applicationsTotalPages) {
      setApplicationsPage(applicationsTotalPages);
    }
  }, [
    applicationsFiltered.length,
    applicationsPageSize,
    applicationsPage,
    applicationsTotalPages,
  ]);

  // Unique sections from applications (for section filter dropdown)
  const applicationsSections = useMemo(() => {
    const set = new Set();
    applicationsList.forEach((app) => {
      const student = students.find((s) => s.id === app.userId);
      const section = (
        student?.section ??
        app.userProfile?.section ??
        ""
      ).trim();
      if (section) set.add(section);
    });
    return Array.from(set).sort();
  }, [applicationsList, students]);

  const openApplicationDetail = (app) => {
    setSelectedApplication(app);
    setShowApplicationDetailModal(true);
  };

  const closeApplicationDetailModal = () => {
    setShowApplicationDetailModal(false);
    setSelectedApplication(null);
  };

  // Send a notification to the student when their application is accepted, denied, or removed
  const sendApplicationStatusNotification = async (app, status) => {
    if (!app?.userId) return;
    const student = students.find((s) => s.id === app.userId);
    const studentName =
      app.userProfile?.name?.trim() ||
      app.userProfile?.email ||
      (student
        ? `${student.firstName || ""} ${student.lastName || ""}`.trim() ||
          student.email
        : null) ||
      "Student";
    const companyName = app.companyName || app.companyId || "the company";
    const subject =
      status === "accepted"
        ? `Application Accepted – ${companyName}`
        : status === "denied"
        ? `Application Denied – ${companyName}`
        : `Application Removed – ${companyName}`;
    const message =
      status === "accepted"
        ? `Your application to ${companyName} has been accepted.`
        : status === "denied"
        ? `Your application to ${companyName} was denied.`
        : `Your application to ${companyName} was removed.`;
    const notificationData = {
      subject,
      message,
      timestamp: new Date().toISOString(),
      read: false,
      userId: auth.currentUser?.uid || null,
      targetType: "student",
      targetStudentId: app.userId,
      targetStudentName: studentName,
      targetStudentIds: [app.userId],
      targetStudentNames: [studentName],
    };
    try {
      await addDoc(collection(db, "notifications"), notificationData);
    } catch (notifErr) {
      logger.error("Failed to send application status notification:", notifErr);
    }
  };

  const handleAcceptApplication = async (applicationId) => {
    const app = applicationsList.find((a) => a.id === applicationId);
    if (!app) {
      showError("Application not found. Please refresh and try again.");
      return;
    }
    const currentStatus = (app.status || "pending").toLowerCase();
    if (currentStatus !== "pending") {
      showError("Only pending applications can be approved.");
      return;
    }
    try {
      setUpdatingApplicationId(applicationId);
      const appRef = doc(db, "applications", applicationId);
      await updateDoc(appRef, {
        status: "approved",
        approvedAt: serverTimestamp(),
      });
      setApplicationsList((prev) =>
        prev.map((a) =>
          a.id === applicationId ? { ...a, status: "approved" } : a
        )
      );
      if (selectedApplication?.id === applicationId) {
        setSelectedApplication((prev) =>
          prev ? { ...prev, status: "approved" } : null
        );
      }
      await sendApplicationStatusNotification(app, "accepted");
      success("Application approved.");
    } catch (err) {
      logger.error("Error accepting application:", err);
      showError("Failed to approve application. Please try again.");
    } finally {
      setUpdatingApplicationId(null);
    }
  };

  const openApplicationStatusConfirm = (app, action) => {
    setApplicationStatusConfirm({ app, action });
    setShowApplicationStatusConfirm(true);
  };

  const cancelApplicationStatusConfirm = () => {
    setShowApplicationStatusConfirm(false);
    setApplicationStatusConfirm(null);
  };

  const handleConfirmApplicationStatus = async () => {
    if (!applicationStatusConfirm?.app || !applicationStatusConfirm.action) {
      return;
    }
    const { app, action } = applicationStatusConfirm;
    setShowApplicationStatusConfirm(false);
    setApplicationStatusConfirm(null);
    if (action === "accept") {
      await handleAcceptApplication(app.id);
    } else if (action === "reject") {
      await handleRejectApplication(app.id);
    }
  };

  const handleRejectApplication = async (applicationId) => {
    const app = applicationsList.find((a) => a.id === applicationId);
    if (!app) {
      showError("Application not found. Please refresh and try again.");
      return;
    }
    const currentStatus = (app.status || "pending").toLowerCase();
    if (currentStatus !== "pending") {
      showError("Only pending applications can be denied.");
      return;
    }
    try {
      setUpdatingApplicationId(applicationId);
      const appRef = doc(db, "applications", applicationId);
      // Optionally mark as rejected for audit, then remove
      await updateDoc(appRef, {
        status: "rejected",
      });
      await deleteDoc(appRef);
      setApplicationsList((prev) => prev.filter((a) => a.id !== applicationId));
      if (selectedApplication?.id === applicationId) {
        closeApplicationDetailModal();
      }
      await sendApplicationStatusNotification(app, "denied");
      success("Application rejected and removed.");
    } catch (err) {
      logger.error("Error rejecting application:", err);
      showError("Failed to reject application. Please try again.");
    } finally {
      setUpdatingApplicationId(null);
    }
  };

  const openRemoveApplicationConfirm = (app) => {
    setApplicationToRemove(app);
    setShowRemoveApplicationConfirm(true);
  };

  const cancelRemoveApplication = () => {
    setShowRemoveApplicationConfirm(false);
    setApplicationToRemove(null);
  };

  const handleRemoveApplication = async () => {
    if (!applicationToRemove) return;
    const applicationId = applicationToRemove.id;
    const app = applicationToRemove;
    try {
      setIsRemovingApplication(true);
      await deleteDoc(doc(db, "applications", applicationId));
      setApplicationsList((prev) => prev.filter((a) => a.id !== applicationId));
      if (selectedApplication?.id === applicationId) {
        closeApplicationDetailModal();
      }
      setShowRemoveApplicationConfirm(false);
      setApplicationToRemove(null);
      await sendApplicationStatusNotification(app, "removed");
      success("Application removed.");
    } catch (err) {
      logger.error("Error removing application:", err);
      showError("Failed to remove application. Please try again.");
    } finally {
      setIsRemovingApplication(false);
    }
  };

  // List of all required documents (sorted in display order)
  const REQUIRED_DOCUMENTS = [
    "Proof of Enrollment (COM)",
    "Notarized Parental Consent",
    "Medical Certificate",
    "Psychological Test Certification",
    "Proof of Insurance",
    "Memorandum of Agreement (MOA)",
    "Curriculum Vitae",
  ];

  // Check which requirements a student has submitted
  const checkStudentSubmittedRequirements = async (studentId) => {
    try {
      const storagePath = `requirements/${studentId}`;
      const requirementsRef = ref(storage, storagePath);
      const folderList = await listAll(requirementsRef);

      const folderMapping = {
        "proof-of-enrollment-com": "Proof of Enrollment (COM)",
        "parent-guardian-consent-form": "Notarized Parental Consent",
        "medical-certificate": "Medical Certificate",
        "psychological-test-certification": "Psychological Test Certification",
        "proof-of-insurance": "Proof of Insurance",
        "ojt-orientation": "OJT Orientation",
        "moa-memorandum-of-agreement": "Memorandum of Agreement (MOA)",
        "resume-cv": "Curriculum Vitae",
        "curriculum-vitae": "Curriculum Vitae",
        resume: "Curriculum Vitae",
        cv: "Curriculum Vitae",
        // Legacy mappings for backward compatibility
        "insurance-certificate": "Proof of Insurance",
        com: "Proof of Enrollment (COM)",
      };

      const submittedRequirements = [];

      for (const folderPrefix of folderList.prefixes) {
        const folderName = folderPrefix.name;
        const folderFiles = await listAll(folderPrefix);

        if (folderFiles.items.length > 0) {
          // First try exact mapping
          let requirementType = folderMapping[folderName];

          // If no exact match, try keyword matching for CV/Resume
          if (!requirementType) {
            const folderNameLower = folderName.toLowerCase();
            if (
              folderNameLower.includes("resume") ||
              folderNameLower.includes("cv") ||
              folderNameLower.includes("curriculum") ||
              folderNameLower.includes("vitae")
            ) {
              requirementType = "Curriculum Vitae";
            } else if (
              folderNameLower.includes("moa") ||
              folderNameLower.includes("memorandum") ||
              folderNameLower.includes("agreement")
            ) {
              requirementType = "Memorandum of Agreement (MOA)";
            } else {
              requirementType = folderName; // Fallback to folder name
            }
          }

          // Only add if not already in the array
          if (!submittedRequirements.includes(requirementType)) {
            submittedRequirements.push(requirementType);
          }
        }
      }

      return submittedRequirements;
    } catch (error) {
      if (error.code === "storage/object-not-found") {
        return [];
      }
      logger.warn(
        `Error checking submitted requirements for student ${studentId}:`,
        error
      );
      return [];
    }
  };

  // Debounce search query to reduce filtering computations
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 300); // 300ms debounce delay

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Real-time listeners for requirement approvals and submitted requirements
  useEffect(() => {
    if (students.length === 0) {
      setRequirementApprovals({});
      setStudentSubmittedRequirements({});
      return;
    }

    const unsubscribes = [];
    const studentIds = students.map((s) => s.id);

    // OPTIMIZATION: Use a single collection query instead of individual document listeners
    // This is more efficient for large numbers of students
    try {
      // Listen to the entire requirement_approvals collection
      // Filter by student IDs in memory (Firestore doesn't support 'in' queries with >10 items efficiently)
      const approvalsCollectionRef = collection(db, "requirement_approvals");
      const unsubscribeAllApprovals = onSnapshot(
        approvalsCollectionRef,
        (snapshot) => {
          const approvalsMap = {};
          snapshot.docs.forEach((docSnap) => {
            const studentId = docSnap.id;
            // Only process approvals for students we're currently viewing
            if (studentIds.includes(studentId)) {
              approvalsMap[studentId] = docSnap.data();
            }
          });
          setRequirementApprovals(approvalsMap);
        },
        (error) => {
          logger.warn(
            "Error listening to requirement approvals collection:",
            error
          );
        }
      );
      unsubscribes.push(unsubscribeAllApprovals);
    } catch (error) {
      logger.warn("Error setting up approvals listener:", error);
    }

    // OPTIMIZATION: Batch requirement checks with a delay to avoid overwhelming Storage API
    // Process in batches of 5 with 100ms delay between batches
    const batchSize = 5;
    const batchDelay = 100;
    let currentBatch = 0;

    const processBatch = async (batchIndex) => {
      const start = batchIndex * batchSize;
      const end = Math.min(start + batchSize, students.length);
      const batch = students.slice(start, end);

      const batchPromises = batch.map(async (student) => {
        try {
          const submitted = await checkStudentSubmittedRequirements(student.id);
          return { studentId: student.id, submitted };
        } catch (error) {
          logger.warn(
            `Error fetching submitted requirements for ${student.id}:`,
            error
          );
          return { studentId: student.id, submitted: [] };
        }
      });

      const results = await Promise.all(batchPromises);

      // Update state with batch results
      setStudentSubmittedRequirements((prev) => {
        const updated = { ...prev };
        let hasChanges = false;

        results.forEach(({ studentId, submitted }) => {
          // Only update if value actually changed to avoid unnecessary re-renders
          if (
            prev[studentId]?.length !== submitted.length ||
            JSON.stringify(prev[studentId]) !== JSON.stringify(submitted)
          ) {
            updated[studentId] = submitted;
            hasChanges = true;
          }
        });

        return hasChanges ? updated : prev;
      });

      // Process next batch if there are more students
      if (end < students.length) {
        setTimeout(() => processBatch(batchIndex + 1), batchDelay);
      }
    };

    // Start processing batches
    if (students.length > 0) {
      processBatch(0);
    }

    // Cleanup listeners on unmount or when students change
    return () => {
      unsubscribes.forEach((unsubscribe) => unsubscribe());
    };
  }, [students]);

  // Exit selection mode if no items are selected
  useEffect(() => {
    if (selectionMode && selectedItems.length === 0) {
      setSelectionMode(false);
      setShowBulkToolbar(false);
    } else if (selectedItems.length > 0) {
      setShowBulkToolbar(true);
    }
  }, [selectedItems, selectionMode]);

  // Calculate enhanced statistics - OPTIMIZED with useMemo
  const enhancedStats = useMemo(() => {
    const statsStudents = (() => {
      // Adviser: scope by section(s)
      if (currentRole === ROLES.ADVISER) {
        if (!adminSection) return [];
        const sections = Array.isArray(adminSection)
          ? adminSection
          : [adminSection];
        const sectionSet = new Set(
          sections
            .filter((s) => typeof s === "string" && s.trim())
            .map((s) => s.trim().toLowerCase())
        );
        if (sectionSet.size === 0) return [];
        return students.filter(
          (s) =>
            typeof s.section === "string" &&
            sectionSet.has(s.section.trim().toLowerCase())
        );
      }

      // Coordinator: if has assigned sections, use them; else use programs/college mapping
      if (currentRole === ROLES.COORDINATOR) {
        const coordinatorSections = adminSection
          ? Array.isArray(adminSection)
            ? adminSection
            : [adminSection]
          : [];
        const sectionSet = new Set(
          coordinatorSections
            .filter((s) => typeof s === "string" && s.trim())
            .map((s) => s.trim().toLowerCase())
        );
        if (sectionSet.size > 0) {
          return students.filter(
            (s) =>
              typeof s.section === "string" &&
              sectionSet.has(s.section.trim().toLowerCase())
          );
        }

        let allowedPrograms = Array.isArray(adminPrograms) ? adminPrograms : [];
        if (allowedPrograms.length === 0 && adminCollegeCode) {
          allowedPrograms = Object.entries(programToCollegeMap)
            .filter(([, code]) => code === adminCollegeCode)
            .map(([program]) =>
              typeof program === "string" ? program.trim().toUpperCase() : ""
            )
            .filter(Boolean);
        }
        if (allowedPrograms.length === 0) return [];
        const allowedSet = new Set(
          allowedPrograms.map((p) => (p || "").toString().toUpperCase())
        );
        return students.filter((s) => {
          const p = s.program;
          if (typeof p !== "string" || !p.trim()) return false;
          return allowedSet.has(p.trim().toUpperCase());
        });
      }

      // Super admin / others: all students
      return students;
    })();

    if (statsStudents.length === 0) {
      return {
        hiredCount: 0,
        pendingCount: 0,
        approvedCount: 0,
        totalReqs: 0,
      };
    }

    const hiredCount = statsStudents.filter((s) => s.status === true).length;
    let pendingCount = 0;
    let approvedCount = 0;
    let totalReqs = 0;

    statsStudents.forEach((student) => {
      const submitted = studentSubmittedRequirements[student.id] || [];
      const approvals = requirementApprovals[student.id] || {};

      submitted.forEach((reqType) => {
        totalReqs++;
        // Handle migration: check both old and new name for Parent/Guardian Consent
        const normalizedReqType =
          reqType === "Parent/Guardian Consent Form"
            ? "Notarized Parental Consent"
            : reqType;
        const approval = approvals[normalizedReqType] || approvals[reqType];
        if (
          approval?.status === "approved" ||
          approval?.status === "accepted"
        ) {
          approvedCount++;
        } else if (
          approval?.status !== "rejected" &&
          approval?.status !== "denied"
        ) {
          pendingCount++;
        }
      });
    });

    return {
      hiredCount,
      pendingCount,
      approvedCount,
      totalReqs,
    };
  }, [
    students,
    currentRole,
    adminSection,
    adminPrograms,
    adminCollegeCode,
    programToCollegeMap,
    studentSubmittedRequirements,
    requirementApprovals,
  ]);

  // Update overview stats when enhanced stats change
  useEffect(() => {
    setOverviewStats((prev) => ({
      ...prev,
      pendingRequirements: enhancedStats.pendingCount,
      approvedRequirements: enhancedStats.approvedCount,
      totalRequirements: enhancedStats.totalReqs,
      hiredStudents: enhancedStats.hiredCount,
    }));
  }, [enhancedStats]);

  // Update active filter chips
  useEffect(() => {
    const currentFilters =
      viewMode === "pending" ? pendingFilterValues : filterValues;
    const chips = [];

    Object.entries(currentFilters).forEach(([key, value]) => {
      if (value && value.trim() !== "") {
        chips.push({
          key,
          label: key.charAt(0).toUpperCase() + key.slice(1),
          value,
        });
      }
    });

    if (debouncedSearchQuery.trim() !== "") {
      chips.push({
        key: "search",
        label: "Search",
        value: debouncedSearchQuery,
      });
    }

    setActiveFilterChips(chips);
    setOverviewStats((prev) => ({
      ...prev,
      activeFilters: chips.length,
    }));
  }, [filterValues, pendingFilterValues, debouncedSearchQuery, viewMode]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Ctrl/Cmd + F: Focus search
      if ((e.ctrlKey || e.metaKey) && e.key === "f" && !e.shiftKey) {
        e.preventDefault();
        if (searchInputRef.current) {
          searchInputRef.current.focus();
        }
      }
      // Ctrl/Cmd + K: Focus search (alternative)
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        if (searchInputRef.current) {
          searchInputRef.current.focus();
        }
      }
      // Escape: Clear selection
      if (e.key === "Escape" && selectedItems.length > 0) {
        setSelectedItems([]);
        setShowBulkToolbar(false);
      }
      // Delete: Delete selected items
      if (e.key === "Delete" && selectedItems.length > 0 && !isDeleting) {
        handleDelete();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedItems, isDeleting]);

  // Scroll to top when error occurs
  useEffect(() => {
    if (error) {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [error]);

  // Close student dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        notificationType === "student" &&
        !event.target.closest(".searchable-dropdown")
      ) {
        setShowStudentDropdown(false);
      }
    };

    if (notificationType === "student") {
      document.addEventListener("mousedown", handleClickOutside);
      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
      };
    }
  }, [notificationType]);

  // Remove file from notification
  const handleRemoveNotificationFile = () => {
    setNotificationFile(null);
    setNotificationFilePreview(null);
  };

  // Handle content change in message editor
  const handleMessageContentChange = () => {
    if (notificationMessageRef.current) {
      setNotificationHtmlContent(notificationMessageRef.current.innerHTML);
      // Also update plain text version for backward compatibility
      setNotificationText(
        notificationMessageRef.current.innerText ||
          notificationMessageRef.current.textContent
      );
    }
  };

  // Handles sending a notification to Firestore
  const [isSendingNotification, setIsSendingNotification] = useState(false);
  const [showNotificationSuccess, setShowNotificationSuccess] = useState(false);
  const [sentNotifications, setSentNotifications] = useState([]);
  const [showNotificationsList, setShowNotificationsList] = useState(false);
  const [showMessageHistoryModal, setShowMessageHistoryModal] = useState(false);
  const [currentNotificationPage, setCurrentNotificationPage] = useState(1);
  const [notificationsPerPage] = useState(5);
  const MAX_NOTIFICATIONS = 20; // Maximum notifications to keep (auto-delete older ones)
  const audioContextRef = useRef(null);

  // Initialize audio context
  useEffect(() => {
    try {
      audioContextRef.current = new (window.AudioContext ||
        window.webkitAudioContext)();
    } catch (e) {
      logger.warn("Audio context not available");
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
      logger.error("Error fetching notifications:", error);
    }
  };

  useEffect(() => {
    if (authUser) {
      fetchNotifications();
    }
  }, [showNotificationSuccess, authUser?.uid]);

  // Handle deleting a notification
  const handleDeleteNotification = (notificationId) => {
    setNotificationToDelete(notificationId);
    setShowDeleteNotificationConfirm(true);
  };

  const confirmDeleteNotification = async () => {
    if (!notificationToDelete) return;
    setIsDeletingNotifications(true);
    try {
      await deleteDoc(doc(db, "notifications", notificationToDelete));
      // Remove from local state
      setSentNotifications((prev) =>
        prev.filter((notif) => notif.id !== notificationToDelete)
      );
      success("Notification deleted successfully");
      setShowDeleteNotificationConfirm(false);
      setNotificationToDelete(null);
    } catch (error) {
      logger.error("Error deleting notification:", error);
      showError("Failed to delete notification. Please try again.");
      setShowDeleteNotificationConfirm(false);
      setNotificationToDelete(null);
    } finally {
      setIsDeletingNotifications(false);
    }
  };

  const cancelDeleteNotification = () => {
    setShowDeleteNotificationConfirm(false);
    setNotificationToDelete(null);
  };

  // Handle delete all notifications
  const handleDeleteAllNotifications = () => {
    if (sentNotifications.length === 0) return;
    setShowDeleteAllConfirm(true);
  };

  const confirmDeleteAllNotifications = async () => {
    setIsDeletingNotifications(true);
    try {
      // Delete all notifications from Firestore
      const deletePromises = sentNotifications.map((notif) =>
        deleteDoc(doc(db, "notifications", notif.id))
      );
      await Promise.all(deletePromises);

      // Clear local state
      setSentNotifications([]);
      setMessageHistorySearchQuery("");
      setCurrentNotificationPage(1);
      success("All messages deleted successfully");
      setShowDeleteAllConfirm(false);
    } catch (error) {
      logger.error("Error deleting all notifications:", error);
      showError("Failed to delete all messages. Please try again.");
      setShowDeleteAllConfirm(false);
    } finally {
      setIsDeletingNotifications(false);
    }
  };

  const cancelDeleteAllNotifications = () => {
    setShowDeleteAllConfirm(false);
  };

  // Get unique sections and students from notifications for filter options
  const notificationSections = useMemo(() => {
    const sections = new Set();
    sentNotifications.forEach((notif) => {
      if (notif.targetSection) {
        sections.add(notif.targetSection);
      }
    });
    return Array.from(sections).sort();
  }, [sentNotifications]);

  const notificationStudents = useMemo(() => {
    const students = new Map();
    sentNotifications.forEach((notif) => {
      if (
        notif.targetType === "student" &&
        notif.targetStudentId &&
        notif.targetStudentName
      ) {
        if (!students.has(notif.targetStudentId)) {
          students.set(notif.targetStudentId, notif.targetStudentName);
        }
      }
    });
    return Array.from(students.entries())
      .map(([id, name]) => ({ id, name }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [sentNotifications]);

  // Filter notifications based on search query, section, and student
  const filteredNotifications = useMemo(() => {
    let filtered = sentNotifications;

    // Filter by search query
    if (messageHistorySearchQuery.trim()) {
      const query = messageHistorySearchQuery.toLowerCase();
      filtered = filtered.filter((notif) => {
        const message = (notif.message || "").toLowerCase();
        const targetName = (notif.targetStudentName || "").toLowerCase();
        const targetSection = (notif.targetSection || "").toLowerCase();
        return (
          message.includes(query) ||
          targetName.includes(query) ||
          targetSection.includes(query)
        );
      });
    }

    // Filter by section
    if (messageHistoryFilterSection) {
      filtered = filtered.filter((notif) => {
        return notif.targetSection === messageHistoryFilterSection;
      });
    }

    // Filter by student
    if (messageHistoryFilterStudent) {
      filtered = filtered.filter((notif) => {
        return notif.targetStudentId === messageHistoryFilterStudent;
      });
    }

    return filtered;
  }, [
    sentNotifications,
    messageHistorySearchQuery,
    messageHistoryFilterSection,
    messageHistoryFilterStudent,
  ]);

  // Calculate total pages for notification pagination
  const notificationTotalPages = useMemo(() => {
    return Math.ceil(filteredNotifications.length / notificationsPerPage);
  }, [filteredNotifications.length, notificationsPerPage]);

  // Reset pagination when filters change
  useEffect(() => {
    setCurrentNotificationPage(1);
  }, [
    messageHistorySearchQuery,
    messageHistoryFilterSection,
    messageHistoryFilterStudent,
  ]);

  const handleSendNotification = async () => {
    // Check if message has content (either text or HTML)
    const hasContent =
      notificationMessageRef.current?.innerText?.trim() ||
      notificationMessageRef.current?.textContent?.trim() ||
      notificationText.trim() ||
      notificationHtmlContent.trim();

    if (!hasContent || isSendingNotification) return;

    // Only admin can send to "All Students" (every college & section)
    if (
      notificationType === "all" &&
      currentRole !== ROLES.SUPER_ADMIN &&
      currentRole !== "super_admin"
    ) {
      showError(
        "Only Admin can send to all students (every college and section). Use Specific Section or Specific Student."
      );
      return;
    }

    // For advisers, validate they can only notify their section/students
    if (isAdviser) {
      if (!adminSection) {
        showError("You must be assigned to a section to send notifications");
        return;
      }

      const adminSectionsArray = Array.isArray(adminSection)
        ? adminSection
        : [adminSection];

      if (notificationType === "all") {
        showError(
          "Advisers can only notify their assigned section or students in their section"
        );
        return;
      }

      if (notificationType === "section") {
        if (
          !selectedNotificationSection ||
          !adminSectionsArray.includes(selectedNotificationSection)
        ) {
          showError("You can only notify your assigned section");
          return;
        }
      }

      if (notificationType === "student") {
        if (selectedNotificationStudents.length === 0) {
          return; // Will be caught by validation below
        }

        // Validate all selected students are in the adviser's section
        const invalidStudents = selectedNotificationStudents.filter(
          (studentId) => {
            const student = baseStudents.find((s) => s.id === studentId);
            return !student || !adminSectionsArray.includes(student.section);
          }
        );

        if (invalidStudents.length > 0) {
          showError("You can only notify students in your assigned section");
          return;
        }
      }
    }

    // Validate private notification targets
    if (
      notificationType === "student" &&
      selectedNotificationStudents.length === 0
    ) {
      return;
    }
    if (notificationType === "section" && !selectedNotificationSection) {
      return;
    }

    setIsSendingNotification(true);
    try {
      // Get current user ID for tracking who sent the notification
      const userId = auth.currentUser?.uid || null;

      // Upload file if one is selected
      let fileUrl = null;
      let fileName = null;
      let fileType = null;

      if (notificationFile) {
        setNotificationFileUploading(true);
        try {
          const timestamp = Date.now();
          const safeFileName = notificationFile.name.replace(
            /[^a-zA-Z0-9.-]/g,
            "_"
          );
          const storagePath = `notifications/${timestamp}-${safeFileName}`;
          const storageRef = ref(storage, storagePath);

          // Upload file to Firebase Storage
          await uploadBytes(storageRef, notificationFile);

          // Get download URL
          fileUrl = await getDownloadURL(storageRef);
          fileName = notificationFile.name;
          fileType = notificationFile.type;
        } catch (fileError) {
          console.error("Error uploading file:", fileError);
          showError("Failed to upload file. Please try again.");
          setIsSendingNotification(false);
          setNotificationFileUploading(false);
          return;
        } finally {
          setNotificationFileUploading(false);
        }
      }

      // Get HTML content from contentEditable div
      const messageHtml = notificationMessageRef.current?.innerHTML || "";
      const messageText =
        notificationMessageRef.current?.innerText ||
        notificationMessageRef.current?.textContent ||
        notificationText;

      // Extract image URLs from HTML for mobile app compatibility
      const imageUrls = [];
      if (messageHtml) {
        const tempDiv = document.createElement("div");
        tempDiv.innerHTML = messageHtml;
        const images = tempDiv.querySelectorAll("img");
        images.forEach((img) => {
          if (img.src && !imageUrls.includes(img.src)) {
            imageUrls.push(img.src);
          }
        });
      }

      // Append image indicator to plain text message for mobile app
      let finalMessageText = messageText;
      if (imageUrls.length > 0) {
        finalMessageText += `\n\n[${imageUrls.length} image${
          imageUrls.length > 1 ? "s" : ""
        } attached]`;
      }

      // Prepare notification data (Firestore does not accept undefined; omit optional fields or use valid values)
      const notificationData = {
        subject: notificationSubject.trim() || "",
        message: finalMessageText, // Plain text for search/compatibility (includes image count)
        timestamp: new Date().toISOString(),
        read: false,
        userId: userId,
        targetType: notificationType,
      };
      if (messageHtml && messageHtml.trim()) {
        notificationData.messageHtml = messageHtml.trim();
      }
      if (imageUrls.length > 0) {
        notificationData.images = imageUrls;
        notificationData.imageUrls = imageUrls;
        notificationData.hasImages = true;
        notificationData.imageCount = imageUrls.length;
        notificationData.firstImageUrl = imageUrls[0];
      }

      // Add file information if file was uploaded (for backward compatibility)
      if (fileUrl) {
        notificationData.fileUrl = fileUrl;
        notificationData.fileName = fileName;
        notificationData.fileType = fileType;
      }

      // Add target information for private notifications
      if (
        notificationType === "student" &&
        selectedNotificationStudents.length > 0
      ) {
        notificationData.targetStudentIds = selectedNotificationStudents;
        const targetStudentNames = selectedNotificationStudents.map(
          (studentId) => {
            const student = baseStudents.find((s) => s.id === studentId);
            return student
              ? `${student.firstName} ${student.lastName}`
              : "Unknown";
          }
        );
        notificationData.targetStudentNames = targetStudentNames;
        // For backward compatibility, also include first student
        notificationData.targetStudentId = selectedNotificationStudents[0];
        notificationData.targetStudentName = targetStudentNames[0];
      } else if (
        notificationType === "section" &&
        selectedNotificationSection
      ) {
        notificationData.targetSection = selectedNotificationSection;
      }

      await addDoc(collection(db, "notifications"), notificationData);

      // Auto-delete old notifications if limit exceeded (keep only most recent MAX_NOTIFICATIONS)
      // Only delete notifications created by the current user (rules allow delete only for own docs)
      const allNotificationsQuery = query(
        collection(db, "notifications"),
        orderBy("timestamp", "desc")
      );
      const allNotificationsSnapshot = await getDocs(allNotificationsQuery);
      const allNotifications = allNotificationsSnapshot.docs;
      const myUid = auth.currentUser?.uid;
      const myNotifications = myUid
        ? allNotifications.filter((d) => d.data().userId === myUid)
        : [];

      if (myNotifications.length > MAX_NOTIFICATIONS) {
        const notificationsToDelete = myNotifications.slice(MAX_NOTIFICATIONS);
        const deletePromises = notificationsToDelete.map((docSnapshot) =>
          deleteDoc(doc(db, "notifications", docSnapshot.id))
        );
        await Promise.all(deletePromises);
      }

      // Log activity - count target students
      let targetCount = students.length;
      if (
        notificationType === "student" &&
        selectedNotificationStudents.length > 0
      ) {
        targetCount = selectedNotificationStudents.length;
      } else if (
        notificationType === "section" &&
        selectedNotificationSection
      ) {
        targetCount = baseStudents.filter(
          (s) => s.section === selectedNotificationSection
        ).length;
      }
      await activityLoggers.sendNotification(notificationText, targetCount);

      // Reset form
      setNotificationText("");
      setNotificationSubject("");
      setNotificationHtmlContent("");
      setNotificationFile(null);
      setNotificationFilePreview(null);
      if (notificationMessageRef.current) {
        notificationMessageRef.current.innerHTML = "";
      }
      // Only admin resets to "all"; coordinators and advisers reset to "section"
      setNotificationType(
        currentRole === ROLES.SUPER_ADMIN || currentRole === "super_admin"
          ? "all"
          : "section"
      );
      setSelectedNotificationStudents([]);
      // For advisers, auto-select their section if they have one
      if (isAdviser && adminSection) {
        const adminSectionsArray = Array.isArray(adminSection)
          ? adminSection
          : [adminSection];
        if (adminSectionsArray.length === 1) {
          setSelectedNotificationSection(adminSectionsArray[0]);
        } else {
          setSelectedNotificationSection("");
        }
      } else {
        setSelectedNotificationSection("");
      }
      setStudentSearchQuery("");

      // Show success message and play sound
      setShowNotificationSuccess(true);
      playSuccessSound();
      success("Notification sent successfully");
      setTimeout(() => {
        setShowNotificationSuccess(false);
      }, 3000);
    } catch (error) {
      logger.error("Send notification error:", error);
      setError("Failed to send notification");
      showError("Failed to send notification");
    } finally {
      setIsSendingNotification(false);
    }
  };

  // --- Filtering logic for students table ---
  // Memoize baseStudents to avoid recalculating on every render
  const baseStudents = useMemo(() => {
    // For advisers: filter by sections only
    if (isAdviser) {
      if (!adminSection) {
        return []; // if adviser but no sections set, show nothing
      }
      const adminSections = Array.isArray(adminSection)
        ? adminSection
        : adminSection
        ? [adminSection]
        : [];
      return students.filter((student) => {
        if (adminSections.length === 0) return false;
        return (
          typeof student.section === "string" &&
          adminSections.some(
            (section) =>
              typeof section === "string" &&
              student.section.toLowerCase() === section.toLowerCase()
          )
        );
      });
    }

    // For coordinators: filter by college (if assigned) and optionally by sections
    if (currentRole === ROLES.COORDINATOR) {
      // Coordinator scope = programs (preferred), else derive programs from college mapping
      let allowedPrograms = Array.isArray(adminPrograms) ? adminPrograms : [];

      if (allowedPrograms.length === 0 && adminCollegeCode) {
        allowedPrograms = Object.entries(programToCollegeMap)
          .filter(([, collegeCode]) => collegeCode === adminCollegeCode)
          .map(([program]) =>
            typeof program === "string" ? program.trim().toUpperCase() : ""
          )
          .filter(Boolean);
      }

      if (allowedPrograms.length === 0) return [];

      const allowedSet = new Set(allowedPrograms.map((p) => p.toUpperCase()));
      return students.filter((student) => {
        const p = student.program;
        if (typeof p !== "string" || !p.trim()) return false;
        return allowedSet.has(p.trim().toUpperCase());
      });
    }

    // Admin: show all students
    return students;
  }, [
    students,
    isAdviser,
    adminSection,
    currentRole,
    adminCollegeCode,
    programToCollegeMap,
    adminPrograms,
  ]);

  // Keep "Total Students" stat scoped by role:
  // - adviser/coordinator: only students they can access (usually their section/college)
  // - admin: overall total
  useEffect(() => {
    const isScopedRole =
      currentRole === ROLES.ADVISER || currentRole === ROLES.COORDINATOR;
    const totalStudents = isScopedRole ? baseStudents.length : students.length;
    setOverviewStats((prev) => ({
      ...prev,
      totalStudents,
    }));
  }, [baseStudents.length, students.length, currentRole]);

  // Get unique sections from students - memoized
  // For advisers, only show their assigned sections
  const sectionSuggestions = useMemo(() => {
    const sections = new Set();
    if (isAdviser && adminSection) {
      // For advisers, only show their assigned sections
      const adminSectionsArray = Array.isArray(adminSection)
        ? adminSection
        : [adminSection];
      adminSectionsArray.forEach((section) => {
        if (section) sections.add(section);
      });
    } else {
      // For non-advisers, show all sections
      baseStudents.forEach((student) => {
        if (student.section) {
          sections.add(student.section);
        }
      });
    }
    return Array.from(sections).sort();
  }, [baseStudents, isAdviser, adminSection]);

  // Get unique programs from students for filter dropdown suggestions
  const programSuggestions = useMemo(() => {
    const programs = new Set();
    baseStudents.forEach((student) => {
      if (student.program && typeof student.program === "string" && student.program.trim()) {
        programs.add(student.program.trim());
      }
    });
    return Array.from(programs).sort();
  }, [baseStudents]);

  // Determine which data source to use based on view mode
  const dataSource = useMemo(
    () =>
      viewMode === "pending" ? pendingStudentsWithRequirements : baseStudents,
    [viewMode, pendingStudentsWithRequirements, baseStudents]
  );

  // Use appropriate filter values based on view mode
  const activeFilterValues = useMemo(
    () => (viewMode === "pending" ? pendingFilterValues : filterValues),
    [viewMode, pendingFilterValues, filterValues]
  );

  // Memoize filteredData to avoid recalculating on every render
  // Use debouncedSearchQuery instead of searchQuery for better performance
  const filteredData = useMemo(() => {
    return dataSource.filter((student) => {
      const q = debouncedSearchQuery.toLowerCase();
      const matchesSearch =
        (!q ? true : false) ||
        (typeof student.firstName === "string" &&
          student.firstName.toLowerCase().includes(q)) ||
        (typeof student.lastName === "string" &&
          student.lastName.toLowerCase().includes(q)) ||
        (typeof student.studentId === "string" &&
          student.studentId.toLowerCase().includes(q)) ||
        (typeof student.program === "string" &&
          student.program.toLowerCase().includes(q)) ||
        (typeof student.section === "string" &&
          student.section.toLowerCase().includes(q)) ||
        (typeof student.email === "string" &&
          student.email.toLowerCase().includes(q));
      const matchesProgram = activeFilterValues.program
        ? typeof student.program === "string" &&
          student.program
            .toLowerCase()
            .includes(activeFilterValues.program.toLowerCase())
        : true;
      const matchesField = activeFilterValues.field
        ? typeof student.field === "string" &&
          student.field
            .toLowerCase()
            .includes(activeFilterValues.field.toLowerCase())
        : true;
      const matchesEmail = activeFilterValues.email
        ? typeof student.email === "string" &&
          student.email
            .toLowerCase()
            .includes(activeFilterValues.email.toLowerCase())
        : true;
      const matchesContact = activeFilterValues.contact
        ? typeof student.contact === "string" &&
          student.contact
            .toLowerCase()
            .includes(activeFilterValues.contact.toLowerCase())
        : true;
      const matchesHired = (() => {
        if (!activeFilterValues.hired || activeFilterValues.hired === "") {
          return true; // Show all if no filter or "All" selected
        }
        if (activeFilterValues.hired === "Yes") {
          return student.status === true;
        }
        if (activeFilterValues.hired === "No") {
          return (
            student.status === false ||
            student.status === undefined ||
            student.status === null
          );
        }
        return true; // Default: show all
      })();
      const matchesLocation = activeFilterValues.locationPreference
        ? student.locationPreference &&
          student.locationPreference[
            activeFilterValues.locationPreference.toLowerCase()
          ]
        : true;
      const matchesApprovedRequirement = activeFilterValues.approvedRequirement
        ? (() => {
            const REQUIRED_DOCUMENTS = [
              "Proof of Enrollment (COM)",
              "Notarized Parental Consent",
              "Medical Certificate",
              "Psychological Test Certification",
              "Proof of Insurance",
              "Memorandum of Agreement (MOA)",
              "Curriculum Vitae",
            ];

            let submittedRequirements =
              studentSubmittedRequirements[student.id] || [];
            const studentApprovals = requirementApprovals[student.id] || {};

            // Migrate old "Parent/Guardian Consent Form" to "Notarized Parental Consent"
            submittedRequirements = submittedRequirements.map((req) =>
              req === "Parent/Guardian Consent Form"
                ? "Notarized Parental Consent"
                : req
            );

            // Check if student has submitted ALL required documents
            const hasAllSubmitted = REQUIRED_DOCUMENTS.every((req) =>
              submittedRequirements.includes(req)
            );

            if (!hasAllSubmitted) {
              return activeFilterValues.approvedRequirement === "No";
            }

            // Check if ALL submitted requirements are approved
            const allApproved = submittedRequirements.every((reqType) => {
              // Handle migration: check both old and new name for approvals
              const approval =
                studentApprovals[reqType] ||
                (reqType === "Notarized Parental Consent"
                  ? studentApprovals["Parent/Guardian Consent Form"]
                  : null);
              return (
                approval?.status === "approved" ||
                approval?.status === "accepted"
              );
            });

            return activeFilterValues.approvedRequirement === "Yes"
              ? allApproved
              : !allApproved;
          })()
        : true;
      const matchesSection = activeFilterValues.section
        ? typeof student.section === "string" &&
          student.section
            .toLowerCase()
            .includes(activeFilterValues.section.toLowerCase())
        : true;
      const matchesBlocked = (() => {
        if (!activeFilterValues.blocked || activeFilterValues.blocked === "") return true;
        if (activeFilterValues.blocked === "Blocked") return student.is_blocked === true;
        if (activeFilterValues.blocked === "Not blocked") return !student.is_blocked;
        return true;
      })();
      return (
        matchesSearch &&
        matchesProgram &&
        matchesField &&
        matchesEmail &&
        matchesContact &&
        matchesHired &&
        matchesLocation &&
        matchesApprovedRequirement &&
        matchesSection &&
        matchesBlocked
      );
    });
  }, [
    dataSource,
    debouncedSearchQuery,
    activeFilterValues,
    studentSubmittedRequirements,
    requirementApprovals,
  ]);

  // Keyboard shortcuts (moved here to access filteredData)
  useKeyboardShortcuts({
    onSearchFocus: () => {
      searchInputRef.current?.focus();
    },
    onModalClose: () => {
      if (showAddStudentModal) setShowAddStudentModal(false);
      if (showRequirementModal) setShowRequirementModal(false);
      if (showConfirm) setShowConfirm(false);
    },
    onExport: () => {
      if (filteredData && filteredData.length > 0) {
        try {
          const exportData = prepareStudentsForExport(filteredData);
          downloadCSV(
            exportData,
            `students_export_${new Date().toISOString().split("T")[0]}`
          );
          activityLoggers.exportData("students", exportData.length);
          success(`Exported ${exportData.length} students successfully`);
        } catch (err) {
          logger.error("Export error:", err);
          showError("Failed to export data. Please try again.");
        }
      }
    },
    onImport: () => {
      if (!isAdviser && fileInputRef.current) {
        fileInputRef.current.click();
      }
    },
  });

  // Sorting function
  const handleSort = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  // Apply sorting - memoized
  const sortedData = useMemo(() => {
    return [...filteredData].sort((a, b) => {
      if (!sortConfig.key) return 0;

      let aValue = a[sortConfig.key];
      let bValue = b[sortConfig.key];

      // Handle array fields
      if (Array.isArray(aValue)) {
        aValue = aValue.join(", ");
      }
      if (Array.isArray(bValue)) {
        bValue = bValue.join(", ");
      }

      // Handle string comparison
      if (typeof aValue === "string") {
        aValue = aValue.toLowerCase();
      }
      if (typeof bValue === "string") {
        bValue = bValue.toLowerCase();
      }

      // Handle null/undefined
      if (aValue == null) aValue = "";
      if (bValue == null) bValue = "";

      if (aValue < bValue) {
        return sortConfig.direction === "asc" ? -1 : 1;
      }
      if (aValue > bValue) {
        return sortConfig.direction === "asc" ? 1 : -1;
      }
      return 0;
    });
  }, [filteredData, sortConfig]);

  const totalPages = Math.ceil(sortedData.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = sortedData.slice(indexOfFirstItem, indexOfLastItem);

  // Handles logout for admin with confirmation
  const handleLogoutClick = () => {
    setShowLogoutConfirm(true);
  };

  const handleLogout = async () => {
    setShowLogoutConfirm(false);
    try {
      await signOut(auth);
    } catch (error) {
      logger.error("Logout error:", error);
      showError("Logout failed! Please try again.");
      return;
    }
    clearAdminSession();
    window.location.href = "/";
  };

  // Handles accepting/approving a pending student (for advisers)
  const handleAcceptStudent = async (studentId) => {
    try {
      const studentRef = doc(db, "users", studentId);
      await updateDoc(studentRef, {
        status: true, // Set status to approved/hired
        approvedAt: new Date().toISOString(),
        approvedBy: currentRole,
      });
      // Update local state
      setStudents((prev) =>
        prev.map((student) =>
          student.id === studentId
            ? { ...student, status: true, approvedAt: new Date().toISOString() }
            : student
        )
      );
      setError(null);
    } catch (error) {
      logger.error("Error accepting student:", error);
      setError("Failed to accept student. Please try again.");
    }
  };

  // Handles deleting a single student
  const handleDeleteSingle = async (id) => {
    if (isAdviser) {
      setError("You don't have permission to delete students.");
      return;
    }
    try {
      setIsDeleting(true);
      // Save deleted student snapshot before removal
      const studentRef = doc(db, "users", id);
      const studentSnap = await getDoc(studentRef);
      if (studentSnap.exists()) {
        const data = studentSnap.data();

        // Attempt to delete Firebase Auth user
        // Students now use their actual email for Firebase Auth
        let authDeleted = false;
        if (data.uid || data.email) {
          try {
            authDeleted = await attemptDeleteAuthUser({
              uid: data.uid,
              email: data.email, // Use actual student email (same as Firebase Auth email)
            });
            if (authDeleted) {
              logger.log("Firebase Auth user deleted successfully");
            } else {
              logger.warn(
                "Firebase Auth user deletion failed or Cloud Function not available"
              );
            }
          } catch (authError) {
            logger.error("Error deleting Firebase Auth user:", authError);
            // Continue with Firestore deletion even if Auth deletion fails
          }
        } else {
          logger.warn("No UID or email found for Firebase Auth deletion");
        }

        await setDoc(doc(db, "deleted_students", id), {
          ...data,
          deletedAt: new Date().toISOString(),
          deletedByRole: currentRole,
          // Snapshot submitted requirements at deletion time for Archive UI
          submittedRequirements: studentSubmittedRequirements[id] || [],
        });
      }
      await deleteDoc(studentRef);

      // Log activity
      const studentName = studentSnap.exists()
        ? `${studentSnap.data().firstName || ""} ${
            studentSnap.data().lastName || ""
          }`.trim() || "Unknown"
        : "Unknown";
      await activityLoggers.deleteStudent(id, studentName);

      setStudents((prev) => prev.filter((student) => student.id !== id));
      setSelectedRowId(null);
      setOpenMenuId(null);

      // Show success message with Auth deletion status
      const authStatus = authDeleted
        ? " (Firebase Auth account also deleted)"
        : " (Note: Firebase Auth account may still exist if Cloud Function is not deployed)";
      success(`Student ${studentName} deleted successfully${authStatus}`);
    } catch (error) {
      logger.error("Delete single student error:", error);
      setError("Failed to delete student. Please try again.");
      showError("Failed to delete student. Please try again.");
    } finally {
      setIsDeleting(false);
    }
  };

  // Get preview of selected students for confirmation
  const getSelectedStudentsPreview = () => {
    return selectedItems
      .map((id) => {
        const student = students.find((s) => s.id === id);
        return student ? `${student.firstName} ${student.lastName}` : null;
      })
      .filter(Boolean)
      .slice(0, 10); // Limit to 10 for preview
  };

  // Shows the confirm modal for bulk delete
  const handleDelete = async () => setShowConfirm(true);

  // Confirms and deletes selected students
  const confirmDelete = async () => {
    if (isAdviser) {
      setError("You don't have permission to delete students.");
      setShowConfirm(false);
      return;
    }
    setShowConfirm(false);
    try {
      setIsDeleting(true);
      let authDeletedCount = 0; // Track successful Auth deletions
      const totalDeleted = selectedItems.length; // Total number of students to delete

      for (const id of selectedItems) {
        const studentRef = doc(db, "users", id);
        const studentSnap = await getDoc(studentRef);
        if (studentSnap.exists()) {
          const data = studentSnap.data();

          // Attempt to delete Firebase Auth user
          // Students now use their actual email for Firebase Auth
          let authDeleted = false;
          if (data.uid || data.email) {
            try {
              authDeleted = await attemptDeleteAuthUser({
                uid: data.uid,
                email: data.email, // Use actual student email (same as Firebase Auth email)
              });
              if (authDeleted) {
                authDeletedCount++;
                logger.log(
                  `Firebase Auth user deleted successfully for student ${id}`
                );
              } else {
                logger.warn(
                  `Firebase Auth user deletion failed for student ${id} or Cloud Function not available`
                );
              }
            } catch (authError) {
              logger.error(
                `Error deleting Firebase Auth user for student ${id}:`,
                authError
              );
              // Continue with Firestore deletion even if Auth deletion fails
            }
          } else {
            logger.warn(
              `No UID or email found for Firebase Auth deletion for student ${id}`
            );
          }

          await setDoc(doc(db, "deleted_students", id), {
            ...data,
            deletedAt: new Date().toISOString(),
            deletedByRole: currentRole,
            // Snapshot submitted requirements at deletion time for Archive UI
            submittedRequirements: studentSubmittedRequirements[id] || [],
          });
        }
        await deleteDoc(studentRef);
      }
      setStudents((prevData) =>
        prevData.filter((item) => !selectedItems.includes(item.id))
      );

      // Log activity
      await activityLoggers.bulkDeleteStudents(
        selectedItems.length,
        selectedItems
      );

      setSelectedItems([]);

      // Show success message with Auth deletion status
      if (authDeletedCount === totalDeleted && totalDeleted > 0) {
        success(
          `Successfully deleted ${totalDeleted} student(s). All Firebase Auth accounts deleted.`
        );
      } else if (authDeletedCount > 0) {
        success(
          `Successfully deleted ${totalDeleted} student(s). ${authDeletedCount} Firebase Auth account(s) deleted.`
        );
      } else {
        success(
          `Successfully deleted ${totalDeleted} student(s). Note: Firebase Auth account deletion may have failed - check if Cloud Function is deployed.`
        );
      }
    } catch (error) {
      logger.error("Bulk delete error:", error);
      setError("Failed to delete items. Please try again.");
      showError("Failed to delete items. Please try again.");
    } finally {
      setIsDeleting(false);
    }
  };

  // Cancels the delete confirmation modal
  const cancelDelete = () => setShowConfirm(false);

  // Clear all filters and search
  const handleClearAllFilters = () => {
    setSearchQuery("");
    setCurrentPage(1); // Reset to first page
    if (viewMode === "pending") {
      setPendingFilterValues({
        program: "",
        field: "",
        email: "",
        contact: "",
        hired: "",
        locationPreference: "",
        approvedRequirement: "",
        section: "",
        blocked: "",
      });
    } else {
      setFilterValues({
        program: "",
        field: "",
        email: "",
        contact: "",
        hired: "",
        locationPreference: "",
        approvedRequirement: "",
        section: "",
        blocked: "",
      });
    }
    success("All filters cleared");
  };

  // Reset page when filters or search change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, filterValues, pendingFilterValues, viewMode]);

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

  // Handle requirement update callback - force refresh of approvals
  const handleRequirementUpdated = async (
    studentId,
    requirementType,
    status
  ) => {
    // Force a refresh by re-fetching the approval document immediately
    try {
      const approvalRef = doc(db, "requirement_approvals", studentId);
      const approvalDoc = await getDoc(approvalRef);

      if (approvalDoc.exists()) {
        const approvalData = approvalDoc.data();
        // Update the requirementApprovals state directly for immediate UI update
        setRequirementApprovals((prev) => ({
          ...prev,
          [studentId]: approvalData,
        }));

      } else {
        // If document doesn't exist, remove it from state
        setRequirementApprovals((prev) => {
          const updated = { ...prev };
          delete updated[studentId];
          return updated;
        });
      }
    } catch (error) {
      console.error("Error refreshing requirement approval:", error);
      // The real-time listener should still pick it up, so this is just a fallback
    }
  };

  // Handle creating a new student account with fixed password
  const handleCreateStudentAccount = async (studentData) => {
    try {
      setIsCreatingStudent(true);

      // Check if student ID already exists in Firestore
      const usersRef = collection(db, "users");
      const newStudentIdValue = studentData.studentId?.trim();

      if (newStudentIdValue) {
        // Validate Student ID format: XX-XXXXX-XXX
        const perfectFormatRegex = /^\d{2}-\d{5}-\d{3}$/;
        if (!perfectFormatRegex.test(newStudentIdValue)) {
          showError(
            "Invalid Student ID format. Must be in format: XX-XXXXX-XXX (e.g., 12-12345-678)"
          );
          setIsCreatingStudent(false);
          return;
        }

        // Check studentId field
        const studentIdQuery = query(
          usersRef,
          where("studentId", "==", newStudentIdValue)
        );
        const studentIdSnapshot = await getDocs(studentIdQuery);

        if (!studentIdSnapshot.empty) {
          showError(
            "A student with this Student ID already exists. Student IDs must be unique."
          );
          setIsCreatingStudent(false);
          return;
        }
      }

      // Use provided email for Firebase Auth (actual student email)
      const providedEmail = studentData.email?.trim();
      if (!providedEmail) {
        showError("Email is required. Please provide a valid email address.");
        setIsCreatingStudent(false);
        return;
      }

      // Basic email validation - Firebase will do stricter validation
      // Simple check: must contain @ and basic format
      if (
        !providedEmail.includes("@") ||
        providedEmail.split("@").length !== 2
      ) {
        showError("Please enter a valid email address.");
        setIsCreatingStudent(false);
        return;
      }

      // Check if email is from .edu.ph domain only
      const emailDomain = providedEmail.split("@")[1]?.toLowerCase();
      if (!emailDomain?.endsWith(".edu.ph")) {
        showError(
          "Please enter an institutional email address ending with .edu.ph (e.g., student@university.edu.ph)"
        );
        setIsCreatingStudent(false);
        return;
      }

      // Additional validation: ensure email is not too long (Firebase limit is 256 chars)
      if (providedEmail.length > 256) {
        showError(
          "Email address is too long. Maximum length is 256 characters."
        );
        setIsCreatingStudent(false);
        return;
      }

      // Validate password
      const providedPassword = studentData.password?.trim();
      if (!providedPassword) {
        showError("Password is required. Please provide a valid password.");
        setIsCreatingStudent(false);
        return;
      }

      if (providedPassword.length < 6) {
        showError("Password must be at least 6 characters long.");
        setIsCreatingStudent(false);
        return;
      }

      // Check if email already exists in Firebase Auth
      // Note: We'll let Firebase Auth handle this check during account creation

      // Create Firebase Auth account with actual student email
      // Normalize email (lowercase, trimmed) - this is what will be used for authentication
      // IMPORTANT: This normalized email will be used for BOTH email and authEmail fields
      const normalizedEmail = providedEmail.toLowerCase().trim();

      // Ensure we're using the institutional email, not generating any old format
      if (normalizedEmail.includes("@student.internquest.local")) {
        showError(
          "Invalid email format. Please use your institutional email (e.g., name@neu.edu.ph)"
        );
        setIsCreatingStudent(false);
        return;
      }

      let firebaseUser;
      try {
        const userCredential = await createUserWithEmailAndPassword(
          auth,
          normalizedEmail, // Use normalized institutional email for Firebase Auth
          providedPassword
        );
        firebaseUser = userCredential.user;
      } catch (authError) {
        // Log comprehensive error details for debugging
        console.error("=== Firebase Auth Error Details ===");
        console.error("Full error object:", authError);
        console.error("Error code:", authError.code);
        console.error("Error message:", authError.message);
        console.error("Error name:", authError.name);
        console.error("Stack trace:", authError.stack);
        console.error("Request details:", {
          email: providedEmail,
          normalizedEmail: providedEmail.toLowerCase().trim(),
          emailLength: providedEmail.length,
          passwordLength: providedPassword?.length,
          passwordType: typeof providedPassword,
          hasPassword: !!providedPassword,
        });

        // Try to extract more details from the error
        if (authError.customData) {
          console.error("Custom error data:", authError.customData);
        }
        if (authError.response) {
          console.error("Error response:", authError.response);
        }
        console.error("===================================");

        let errorMessage = "Failed to create student account. ";

        // Handle known error codes
        if (authError.code) {
          switch (authError.code) {
            case "auth/email-already-in-use":
              errorMessage =
                "A student account with this email already exists. Please use a different email address.";
              break;
            case "auth/invalid-email":
              errorMessage =
                "Invalid email format. Please enter a valid email address.";
              break;
            case "auth/weak-password":
              errorMessage =
                "Password is too weak. Password must be at least 6 characters long.";
              break;
            case "auth/operation-not-allowed":
              errorMessage =
                "Email/password accounts are not enabled. Please contact the administrator.";
              break;
            case "auth/network-request-failed":
              errorMessage =
                "Network error. Please check your internet connection and try again.";
              break;
            case "auth/missing-password":
              errorMessage =
                "Password is required to create a Firebase Auth account.";
              break;
            case "auth/invalid-password":
              errorMessage = "Invalid password format.";
              break;
            case "auth/internal-error":
              errorMessage =
                "Internal Firebase error. Please try again or contact support.";
              break;
            default:
              errorMessage += `Error: ${authError.code} - ${
                authError.message || "Unknown error occurred."
              }`;
          }
        } else {
          // No error code - this might be a 400 Bad Request
          errorMessage += authError.message || "Bad Request (400). ";
          errorMessage +=
            "Please check: 1) Email format is correct, 2) Email ends with .edu.ph, 3) Password is at least 6 characters. ";
          errorMessage += "Check the browser console for more details.";
        }

        showError(errorMessage);
        setIsCreatingStudent(false);
        return;
      }

      // Create student document in Firestore
      const createdStudentIdValue = studentData.studentId?.trim() || "";

      const newStudent = {
        studentId: createdStudentIdValue,
        firstName: studentData.firstName.trim(),
        lastName: studentData.lastName.trim(),
        section: studentData.section?.trim() || "",
        college: studentData.college?.trim() || "",
        email: normalizedEmail, // Store institutional email (same as authEmail - both use normalized email)
        authEmail: normalizedEmail, // Store email used for Firebase Auth (same as email - both use institutional email)
        status: false, // Default to not hired
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        // Link to Firebase Auth UID
        uid: firebaseUser.uid,
        // Track who created this student
        createdBy: (() => {
          const session = getAdminSession();
          return session
            ? {
                username: session.username || "Unknown",
                role: session.role || "Unknown",
                adminId: session.adminId || null,
              }
            : null;
        })(),
      };

      const docRef = await addDoc(collection(db, "users"), newStudent);

      // Log activity
      await activityLoggers.createStudent(
        docRef.id,
        `${newStudent.firstName} ${newStudent.lastName}`
      );

      success(
        `Student account created successfully! Login: Student ID: ${createdStudentIdValue} (used as both username and password)`
      );

      // Close modal
      setShowAddStudentModal(false);

      // Note: The real-time listener will automatically update the students list
    } catch (err) {
      logger.error("Error creating student account:", err);
      showError(
        err.message || "Failed to create student account. Please try again."
      );
    } finally {
      setIsCreatingStudent(false);
    }
  };

  // --- Render ---
  return (
    <div className="dashboard-container">
      <LoadingSpinner isLoading={isLoading} message="Loading student data..." />
      <ConfirmAction
        isOpen={showLogoutConfirm}
        onClose={() => setShowLogoutConfirm(false)}
        onConfirm={handleLogout}
        title="Confirm Logout"
        message="Are you sure you want to logout?"
        confirmText="Logout"
        cancelText="Cancel"
        type="warning"
      />
      <Navbar onLogout={handleLogoutClick} />
      <div className="dashboard-content">
        {/* Page Header */}
        <div className="student-page-header">
          <h1>Manage Students</h1>
          <p>Track student progress and manage internship requirements</p>
        </div>

        {/* Stats Cards Row */}
        <div className="iq-stats-wrapper">
          <div className="iq-stats-grid">
            <div className="iq-stat-card iq-stat--purple">
              <div className="iq-stat-icon-wrapper" aria-hidden="true">
                <IoPeopleOutline className="iq-stat-icon" />
              </div>
              <div className="iq-stat-content">
                <div className="iq-stat-value">
                  {overviewStats.totalStudents || 0}
                </div>
                <div className="iq-stat-label">
                  {currentRole === ROLES.SUPER_ADMIN ||
                  currentRole === "super_admin"
                    ? "Total Students"
                    : currentRole === ROLES.COORDINATOR
                    ? adminSection &&
                      (Array.isArray(adminSection)
                        ? adminSection.length > 0
                        : true)
                      ? "Students (Your Sections)"
                      : adminCollegeCode
                      ? "Students (Your College)"
                      : "Students (Not Assigned)"
                    : currentRole === ROLES.ADVISER
                    ? "Students (Your Section)"
                    : "Total Students"}
                </div>
              </div>
            </div>
            <div className="iq-stat-card iq-stat--warning">
              <div className="iq-stat-icon-wrapper" aria-hidden="true">
                <IoTimeOutline className="iq-stat-icon" />
              </div>
              <div className="iq-stat-content">
                <div className="iq-stat-value">
                  {overviewStats.pendingRequirements || 0}
                </div>
                <div className="iq-stat-label">Pending Review</div>
              </div>
            </div>
            <div className="iq-stat-card iq-stat--success">
              <div className="iq-stat-icon-wrapper" aria-hidden="true">
                <IoCheckmarkCircle className="iq-stat-icon" />
              </div>
              <div className="iq-stat-content">
                <div className="iq-stat-value">
                  {overviewStats.hiredStudents || 0}
                </div>
                <div className="iq-stat-label">Hired Students</div>
              </div>
            </div>
          </div>
        </div>

        {/* Notification section is now integrated into view mode tabs */}

        <div className="table-section">
          <div className="student-table-wrapper">
            <div className="table-header-with-tabs">
              <div className="view-mode-tabs">
                <button
                  className={`view-mode-tab ${
                    viewMode === "all" ? "active" : ""
                  }`}
                  onClick={() => setViewMode("all")}
                >
                  <IoPeopleOutline className="view-mode-tab-icon" />
                  <span>All Student</span>
                </button>
                <button
                  className={`view-mode-tab ${
                    viewMode === "pending" ? "active" : ""
                  }`}
                  onClick={() => setViewMode("pending")}
                >
                  <IoTimeOutline className="view-mode-tab-icon" />
                  <span>Pending Requirements</span>
                  {pendingStudentsWithRequirements.length > 0 && (
                    <span className="pending-badge">
                      {pendingStudentsWithRequirements.length}
                    </span>
                  )}
                </button>
                <button
                  className={`view-mode-tab ${
                    viewMode === "applications" ? "active" : ""
                  }`}
                  onClick={() => setViewMode("applications")}
                >
                  <IoDocumentTextOutline className="view-mode-tab-icon" />
                  <span>Applications</span>
                  {applicationsList.filter(
                    (a) => (a.status || "pending").toLowerCase() === "pending"
                  ).length > 0 && (
                    <span className="pending-badge">
                      {
                        applicationsList.filter(
                          (a) =>
                            (a.status || "pending").toLowerCase() === "pending"
                        ).length
                      }
                    </span>
                  )}
                </button>
                <button
                  className={`view-mode-tab ${
                    viewMode === "notifications" ? "active" : ""
                  }`}
                  onClick={() => setViewMode("notifications")}
                >
                  <IoNotificationsOutline style={{ marginRight: "0.5rem" }} />
                  Student Notifications
                  {sentNotifications.length > 0 && (
                    <span className="pending-badge">
                      {sentNotifications.length}
                    </span>
                  )}
                </button>
              </div>
            </div>
            {viewMode === "notifications" && (
              <div className="notification-section">
                <div className="notification-section-header">
                  <div className="notification-header-content">
                    <div className="notification-header-icon">
                      <IoNotificationsOutline />
                    </div>
                    <div>
                      <h2>Student Notifications</h2>
                      <p>Send messages and alerts to students</p>
                    </div>
                  </div>
                  <button
                    className="toggle-notifications-btn"
                    onClick={() => setShowMessageHistoryModal(true)}
                    aria-label="View message history"
                  >
                    <IoNotificationsOutline />
                    View Message History
                    {sentNotifications.length > 0 && (
                      <span className="notification-count-badge">
                        {sentNotifications.length}
                      </span>
                    )}
                  </button>
                </div>

                <div className="notification-section-content">
                  <div className="notification-form-container">
                    {/* Notification Type Selector */}
                    <div className="notification-type-selector">
                      <label htmlFor="notification-type">
                        <IoPeopleOutline className="label-icon" />
                        Send to:
                      </label>
                      <select
                        id="notification-type"
                        value={notificationType}
                        onChange={(e) => {
                          setNotificationType(e.target.value);
                          setSelectedNotificationStudents([]);
                          setSelectedNotificationSection("");
                        }}
                        className="notification-type-select"
                        disabled={isSendingNotification}
                      >
                        {(currentRole === ROLES.SUPER_ADMIN ||
                          currentRole === "super_admin") && (
                          <option value="all">
                            All Students (every college & section)
                          </option>
                        )}
                        <option value="student">Specific Student</option>
                        <option value="section">Specific Section</option>
                      </select>
                    </div>

                    {/* Student Selector (for private student notification) */}
                    {notificationType === "student" && (
                      <div className="notification-target-selector">
                        <label htmlFor="notification-student">
                          <IoPersonAddOutline className="label-icon" />
                          Select Students:
                          {selectedNotificationStudents.length > 0 && (
                            <span className="selected-count">
                              ({selectedNotificationStudents.length} selected)
                            </span>
                          )}
                        </label>

                        {/* Selected Students Chips */}
                        {selectedNotificationStudents.length > 0 && (
                          <div className="selected-students-chips">
                            {selectedNotificationStudents.map((studentId) => {
                              const student = baseStudents.find(
                                (s) => s.id === studentId
                              );
                              if (!student) return null;
                              return (
                                <div key={studentId} className="student-chip">
                                  <span className="chip-name">
                                    {student.firstName} {student.lastName}
                                  </span>
                                  <button
                                    type="button"
                                    className="chip-remove"
                                    onClick={() => {
                                      setSelectedNotificationStudents(
                                        selectedNotificationStudents.filter(
                                          (id) => id !== studentId
                                        )
                                      );
                                    }}
                                    disabled={isSendingNotification}
                                    aria-label={`Remove ${student.firstName} ${student.lastName}`}
                                  >
                                    <IoCloseOutline />
                                  </button>
                                </div>
                              );
                            })}
                            <button
                              type="button"
                              className="clear-all-students"
                              onClick={() =>
                                setSelectedNotificationStudents([])
                              }
                              disabled={isSendingNotification}
                            >
                              Clear All
                            </button>
                          </div>
                        )}

                        <div className="searchable-dropdown">
                          <div className="searchable-dropdown-input-wrapper">
                            <IoSearchOutline className="searchable-dropdown-icon" />
                            <input
                              type="text"
                              id="notification-student"
                              placeholder={
                                selectedNotificationStudents.length > 0
                                  ? "Search to add more students..."
                                  : "Search student by name or ID..."
                              }
                              value={studentSearchQuery}
                              onChange={(e) => {
                                setStudentSearchQuery(e.target.value);
                                setShowStudentDropdown(true);
                              }}
                              onFocus={() => setShowStudentDropdown(true)}
                              className="searchable-dropdown-input"
                              disabled={isSendingNotification}
                              autoComplete="off"
                            />
                            {studentSearchQuery && (
                              <button
                                type="button"
                                className="searchable-dropdown-clear"
                                onClick={() => {
                                  setStudentSearchQuery("");
                                }}
                                disabled={isSendingNotification}
                              >
                                <IoCloseOutline />
                              </button>
                            )}
                          </div>
                          {showStudentDropdown && (
                            <div className="searchable-dropdown-list">
                              {baseStudents
                                .filter((student) => {
                                  // For advisers, only show students in their section
                                  if (isAdviser && adminSection) {
                                    const adminSectionsArray = Array.isArray(
                                      adminSection
                                    )
                                      ? adminSection
                                      : [adminSection];
                                    if (
                                      !adminSectionsArray.includes(
                                        student.section
                                      )
                                    ) {
                                      return false;
                                    }
                                  }
                                  if (!studentSearchQuery.trim()) return true;
                                  const query =
                                    studentSearchQuery.toLowerCase();
                                  const fullName =
                                    `${student.firstName} ${student.lastName}`.toLowerCase();
                                  const studentId = (
                                    student.studentId || ""
                                  ).toLowerCase();
                                  const section = (
                                    student.section || ""
                                  ).toLowerCase();
                                  return (
                                    fullName.includes(query) ||
                                    studentId.includes(query) ||
                                    section.includes(query)
                                  );
                                })
                                .slice(0, 10)
                                .map((student) => {
                                  const isSelected =
                                    selectedNotificationStudents.includes(
                                      student.id
                                    );
                                  return (
                                    <div
                                      key={student.id}
                                      className={`searchable-dropdown-item ${
                                        isSelected ? "selected" : ""
                                      }`}
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        if (isSelected) {
                                          setSelectedNotificationStudents(
                                            selectedNotificationStudents.filter(
                                              (id) => id !== student.id
                                            )
                                          );
                                        } else {
                                          setSelectedNotificationStudents([
                                            ...selectedNotificationStudents,
                                            student.id,
                                          ]);
                                        }
                                        setStudentSearchQuery("");
                                      }}
                                    >
                                      <div className="dropdown-item-checkbox">
                                        <input
                                          type="checkbox"
                                          checked={isSelected}
                                          onChange={() => {}} // Handled by parent onClick
                                          onClick={(e) => e.stopPropagation()}
                                        />
                                      </div>
                                      <div className="dropdown-item-content">
                                        <div className="dropdown-item-name">
                                          {student.firstName} {student.lastName}
                                        </div>
                                        <div className="dropdown-item-details">
                                          {student.studentId} -{" "}
                                          {student.section}
                                        </div>
                                      </div>
                                    </div>
                                  );
                                })}
                              {baseStudents.filter((student) => {
                                if (!studentSearchQuery.trim()) return false;
                                const query = studentSearchQuery.toLowerCase();
                                const fullName =
                                  `${student.firstName} ${student.lastName}`.toLowerCase();
                                const studentId = (
                                  student.studentId || ""
                                ).toLowerCase();
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
                          <IoPeopleOutline className="label-icon" />
                          Select Section:
                        </label>
                        <select
                          id="notification-section"
                          value={selectedNotificationSection}
                          onChange={(e) =>
                            setSelectedNotificationSection(e.target.value)
                          }
                          className="notification-target-select"
                          disabled={isSendingNotification}
                        >
                          <option value="">Choose a section...</option>
                          {sectionSuggestions.map((section) => (
                            <option key={section} value={section}>
                              {section}
                            </option>
                          ))}
                        </select>
                      </div>
                    )}

                    <div className="notification-input-wrapper">
                      <label
                        htmlFor="notification-subject-input"
                        className="notification-input-label"
                      >
                        <IoDocumentTextOutline className="label-icon" />
                        Subject:
                      </label>
                      <input
                        type="text"
                        id="notification-subject-input"
                        placeholder="Subject"
                        value={notificationSubject}
                        onChange={(e) => setNotificationSubject(e.target.value)}
                        className="notification-input"
                        disabled={isSendingNotification}
                        style={{ marginBottom: "1rem" }}
                      />
                    </div>

                    <div className="notification-input-wrapper">
                      <label
                        htmlFor="notification-message-input"
                        className="notification-input-label"
                      >
                        <IoDocumentTextOutline className="label-icon" />
                        Message:
                      </label>
                      <div
                        ref={notificationMessageRef}
                        contentEditable={!isSendingNotification}
                        id="notification-message-input"
                        className="notification-message-editor"
                        onInput={handleMessageContentChange}
                        data-placeholder="Type your notification message here..."
                        suppressContentEditableWarning={true}
                      />
                    </div>

                    <div className="notification-input-wrapper">
                      <button
                        className={`send-notification-btn ${
                          isSendingNotification ? "sending" : ""
                        }`}
                        onClick={handleSendNotification}
                        disabled={
                          isSendingNotification ||
                          !(
                            notificationMessageRef.current?.innerText?.trim() ||
                            notificationMessageRef.current?.textContent?.trim() ||
                            notificationText.trim() ||
                            notificationHtmlContent.trim()
                          ) ||
                          (notificationType === "student" &&
                            selectedNotificationStudents.length === 0) ||
                          (notificationType === "section" &&
                            !selectedNotificationSection)
                        }
                      >
                        {isSendingNotification ? (
                          <>
                            <span className="spinner-small"></span>
                            Sending...
                          </>
                        ) : (
                          <>
                            <IoPaperPlaneOutline />
                            Send Message
                          </>
                        )}
                      </button>
                    </div>
                    {showNotificationSuccess && (
                      <div className="notification-success">
                        <span className="success-icon">✓</span>
                        Message sent successfully!
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
            {viewMode === "applications" && (
              <div className="applications-section">
                <div className="applications-section-header">
                  <div className="applications-header-content">
                    <div className="applications-header-icon">
                      <IoDocumentTextOutline />
                    </div>
                    <div>
                      <h3 className="applications-section-title">
                        Company Applications
                      </h3>
                      <p className="applications-section-description">
                        Search, filter, and review student applications. Click a
                        row to view full details.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Search & Filter toolbar */}
                {!isLoadingApplications && applicationsList.length > 0 && (
                  <div className="applications-toolbar">
                    <div className="applications-search-wrap">
                      <IoSearchOutline className="applications-search-icon" />
                      <input
                        type="text"
                        placeholder="Search by student, ID, section, or company..."
                        value={applicationsSearchQuery}
                        onChange={(e) => {
                          setApplicationsSearchQuery(e.target.value);
                          setApplicationsPage(1);
                        }}
                        className="applications-search-input"
                        aria-label="Search applications"
                      />
                      {applicationsSearchQuery && (
                        <button
                          type="button"
                          className="applications-search-clear"
                          onClick={() => {
                            setApplicationsSearchQuery("");
                            setApplicationsPage(1);
                          }}
                          aria-label="Clear search"
                        >
                          <IoCloseOutline />
                        </button>
                      )}
                    </div>
                    <div className="applications-filters">
                      <div className="applications-filter-group">
                        <IoFilterOutline className="applications-filter-icon" />
                        <select
                          value={applicationsStatusFilter}
                          onChange={(e) => {
                            setApplicationsStatusFilter(e.target.value);
                            setApplicationsPage(1);
                          }}
                          className="applications-filter-select"
                          aria-label="Filter by status"
                        >
                          <option value="all">All status</option>
                          <option value="pending">Pending</option>
                          <option value="approved">Approved</option>
                          <option value="rejected">Rejected</option>
                        </select>
                      </div>
                      {applicationsSections.length > 0 && (
                        <select
                          value={applicationsSectionFilter}
                          onChange={(e) => {
                            setApplicationsSectionFilter(e.target.value);
                            setApplicationsPage(1);
                          }}
                          className="applications-filter-select"
                          aria-label="Filter by section"
                        >
                          <option value="">All sections</option>
                          {applicationsSections.map((sec) => (
                            <option key={sec} value={sec}>
                              {sec}
                            </option>
                          ))}
                        </select>
                      )}
                      {(applicationsSearchQuery ||
                        applicationsStatusFilter !== "all" ||
                        applicationsSectionFilter) && (
                        <button
                          type="button"
                          className="applications-filter-clear"
                          onClick={() => {
                            setApplicationsSearchQuery("");
                            setApplicationsStatusFilter("all");
                            setApplicationsSectionFilter("");
                            setApplicationsPage(1);
                          }}
                        >
                          <IoCloseOutline /> Clear filters
                        </button>
                      )}
                    </div>
                  </div>
                )}

                {isLoadingApplications ? (
                  <div className="applications-loading">
                    <LoadingSpinner message="Loading applications..." />
                  </div>
                ) : applicationsList.length === 0 ? (
                  <div className="applications-empty">
                    <IoDocumentTextOutline className="applications-empty-icon" />
                    <p className="applications-empty-message">
                      No applications yet.
                    </p>
                    <p className="applications-empty-hint">
                      Student applications to companies will appear here for
                      review.
                    </p>
                  </div>
                ) : applicationsFiltered.length === 0 ? (
                  <div className="applications-empty applications-empty-filtered">
                    <IoSearchOutline className="applications-empty-icon" />
                    <p className="applications-empty-message">
                      No applications match your search or filters.
                    </p>
                    <p className="applications-empty-hint">
                      Try adjusting your search or clear filters.
                    </p>
                    <button
                      type="button"
                      className="applications-empty-clear-btn"
                      onClick={() => {
                        setApplicationsSearchQuery("");
                        setApplicationsStatusFilter("all");
                        setApplicationsSectionFilter("");
                        setApplicationsPage(1);
                      }}
                    >
                      Clear all filters
                    </button>
                  </div>
                ) : (
                  <div className="applications-table-card">
                    <div className="applications-table-wrapper">
                      <table
                        className="applications-table"
                        aria-label="Company applications"
                      >
                        <thead>
                          <tr>
                            <th>Student ID</th>
                            <th>Student</th>
                            <th>Section</th>
                            <th>Company</th>
                            <th>Status</th>
                            <th>Date</th>
                            <th>Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {applicationsPaginated.map((app) => {
                            const profileName = app.userProfile?.name?.trim();
                            const profileEmail = app.userProfile?.email;
                            const student = students.find(
                              (s) => s.id === app.userId
                            );
                            const studentName =
                              profileName ||
                              profileEmail ||
                              (student
                                ? `${student.firstName || ""} ${
                                    student.lastName || ""
                                  }`.trim() || student.email
                                : null) ||
                              app.studentName ||
                              app.userId ||
                              "—";
                            const studentIdDisplay =
                              student?.studentId ??
                              app.userProfile?.studentId ??
                              "—";
                            const sectionDisplay =
                              student?.section ??
                              app.userProfile?.section ??
                              "—";
                            const companyName =
                              app.companyName || app.companyId || "—";
                            const status = (
                              app.status || "pending"
                            ).toLowerCase();
                            const dateVal =
                              app.appliedAt || app.createdAt || app.timestamp;
                            const dateStr = dateVal
                              ? (() => {
                                  const t = getApplicationTime(dateVal);
                                  if (!t) return "—";
                                  return new Date(t).toLocaleDateString(
                                    "en-US",
                                    {
                                      month: "short",
                                      day: "numeric",
                                      year: "numeric",
                                    }
                                  );
                                })()
                              : "—";
                            const isPending = status === "pending";
                            const isUpdating = updatingApplicationId === app.id;
                            const statusLabel =
                              status === "approved" || status === "accepted"
                                ? "Approved"
                                : status === "rejected"
                                ? "Rejected"
                                : "Pending";
                            return (
                              <tr
                                key={app.id}
                                className={`applications-row applications-row-clickable status-${status}`}
                                onClick={() => openApplicationDetail(app)}
                                role="button"
                                tabIndex={0}
                                onKeyDown={(e) => {
                                  if (e.key === "Enter" || e.key === " ") {
                                    e.preventDefault();
                                    openApplicationDetail(app);
                                  }
                                }}
                                aria-label={`View details for ${studentName}, ${companyName}`}
                              >
                                <td>{studentIdDisplay}</td>
                                <td>{studentName}</td>
                                <td>{sectionDisplay}</td>
                                <td>{companyName}</td>
                                <td>
                                  <span
                                    className={`application-status-badge status-${status}`}
                                  >
                                    {statusLabel}
                                  </span>
                                </td>
                                <td>{dateStr}</td>
                                <td onClick={(e) => e.stopPropagation()}>
                                  <div className="applications-actions">
                                    {isPending ? (
                                      <>
                                        <button
                                          type="button"
                                          className="application-btn accept-btn"
                                          onClick={() =>
                                            openApplicationStatusConfirm(
                                              app,
                                              "accept"
                                            )
                                          }
                                          disabled={isUpdating}
                                          aria-label="Accept application"
                                        >
                                          {isUpdating ? (
                                            <span className="spinner-small" />
                                          ) : (
                                            <>
                                              <IoCheckmarkCircle /> Accept
                                            </>
                                          )}
                                        </button>
                                        <button
                                          type="button"
                                          className="application-btn reject-btn"
                                          onClick={() =>
                                            openApplicationStatusConfirm(
                                              app,
                                              "reject"
                                            )
                                          }
                                          disabled={isUpdating}
                                          aria-label="Reject application"
                                        >
                                          Reject
                                        </button>
                                      </>
                                    ) : (
                                      <span className="applications-no-action">
                                        —
                                      </span>
                                    )}
                                    <button
                                      type="button"
                                      className="application-btn remove-btn"
                                      onClick={() =>
                                        openRemoveApplicationConfirm(app)
                                      }
                                      disabled={isRemovingApplication}
                                      aria-label="Remove application"
                                      title="Remove application"
                                    >
                                      <IoTrashOutline /> Remove
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                    <div className="applications-pagination-wrapper">
                      <div className="pagination applications-pagination">
                        <button
                          type="button"
                          onClick={() =>
                            setApplicationsPage((p) => Math.max(1, p - 1))
                          }
                          disabled={applicationsPage === 1}
                          className="pagination-arrow"
                          aria-label="Previous page"
                        >
                          &lt;
                        </button>
                        {[...Array(applicationsTotalPages)].map((_, index) => (
                          <button
                            key={index + 1}
                            type="button"
                            onClick={() => setApplicationsPage(index + 1)}
                            className={`pagination-number ${
                              applicationsPage === index + 1 ? "active" : ""
                            }`}
                          >
                            {index + 1}
                          </button>
                        ))}
                        <button
                          type="button"
                          onClick={() =>
                            setApplicationsPage((p) =>
                              Math.min(applicationsTotalPages, p + 1)
                            )
                          }
                          disabled={applicationsPage === applicationsTotalPages}
                          className="pagination-arrow"
                          aria-label="Next page"
                        >
                          &gt;
                        </button>
                      </div>
                      <div className="pagination-info-wrapper">
                        <div className="pagination-info">
                          Showing{" "}
                          {applicationsFiltered.length === 0
                            ? "0"
                            : (applicationsPage - 1) * applicationsPageSize + 1}
                          –
                          {Math.min(
                            applicationsPage * applicationsPageSize,
                            applicationsFiltered.length
                          )}{" "}
                          of {applicationsFiltered.length} application
                          {applicationsFiltered.length !== 1 ? "s" : ""}
                        </div>
                        <div className="pagination-items-per-page">
                          <label htmlFor="applications-items-per-page">
                            Show:
                          </label>
                          <select
                            id="applications-items-per-page"
                            value={applicationsPageSize}
                            onChange={(e) => {
                              setApplicationsPageSize(Number(e.target.value));
                              setApplicationsPage(1);
                            }}
                            className="items-per-page-select"
                            aria-label="Applications per page"
                          >
                            <option value={5}>5</option>
                            <option value={10}>10</option>
                            <option value={15}>15</option>
                            <option value={20}>20</option>
                            <option value={50}>50</option>
                          </select>
                          <span className="items-per-page-label">per page</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
            {viewMode === "pending" && (
              <div className="pending-requirements-info">
                <div className="pending-info-header">
                  <div className="pending-info-icon">
                    <IoTimeOutline />
                  </div>
                  <div className="pending-info-content">
                    <h3 className="pending-info-title">
                      Pending Requirements Review
                    </h3>
                    <p className="pending-info-description">
                      Students who have submitted requirements are waiting for
                      approval. Review and approve their documents to help them
                      proceed.
                    </p>
                  </div>
                </div>
                {pendingStudentsWithRequirements.length > 0 && (
                  <div className="pending-stats">
                    <div className="pending-stat-item">
                      <span className="stat-number">
                        {pendingStudentsWithRequirements.length}
                      </span>
                      <span className="stat-label">Students Pending</span>
                    </div>
                    <div className="pending-stat-divider"></div>
                    <div
                      className="pending-stat-item"
                      title="Total number of requirement files submitted by pending students"
                    >
                      <span className="stat-number">
                        {pendingStudentsWithRequirements.reduce(
                          (total, student) => {
                            const submitted =
                              studentSubmittedRequirements[student.id] || [];
                            return total + submitted.length;
                          },
                          0
                        )}
                      </span>
                      <span className="stat-label">Files Submitted</span>
                    </div>
                    <div className="pending-stat-divider"></div>
                    <div className="pending-stat-item">
                      <span className="stat-number">
                        {Math.round(
                          (pendingStudentsWithRequirements.length /
                            (students.length || 1)) *
                            100
                        )}
                        %
                      </span>
                      <span className="stat-label">Of All Students</span>
                    </div>
                  </div>
                )}
                {pendingStudentsWithRequirements.length === 0 &&
                  !isLoadingPendingStudents && (
                    <div className="pending-empty-state">
                      <IoCheckmarkCircle className="pending-empty-icon" />
                      <p className="pending-empty-message">
                        Great! All submitted requirements have been reviewed.
                      </p>
                      <p className="pending-empty-hint">
                        New submissions will appear here for review.
                      </p>
                    </div>
                  )}
                {pendingStudentsWithRequirements.length > 0 && (
                  <div className="pending-actions">
                    <div className="pending-action-hint">
                      <IoDocumentTextOutline className="hint-icon" />
                      <span>
                        Click on a student row to view and review their
                        requirements
                      </span>
                    </div>
                  </div>
                )}
              </div>
            )}
            {/* Filter Chips */}
            {viewMode !== "applications" && activeFilterChips.length > 0 && (
              <div className="filter-chips-container">
                <div className="filter-chips">
                  <IoFilterOutline className="filter-icon" />
                  <span className="filter-label">Active Filters:</span>
                  {activeFilterChips.map((chip, index) => (
                    <span key={index} className="filter-chip">
                      <span className="chip-label">{chip.label}:</span>
                      <span className="chip-value">{chip.value}</span>
                      <button
                        className="chip-remove"
                        onClick={() => {
                          if (chip.key === "search") {
                            setSearchQuery("");
                          } else {
                            const currentFilters =
                              viewMode === "pending"
                                ? pendingFilterValues
                                : filterValues;
                            const setFilters =
                              viewMode === "pending"
                                ? setPendingFilterValues
                                : setFilterValues;
                            setFilters({
                              ...currentFilters,
                              [chip.key]: "",
                            });
                          }
                        }}
                        aria-label={`Remove ${chip.label} filter`}
                      >
                        <IoClose />
                      </button>
                    </span>
                  ))}
                  <button
                    className="clear-all-filters"
                    onClick={() => {
                      setSearchQuery("");
                      setCurrentPage(1); // Reset to first page
                      if (viewMode === "pending") {
                        setPendingFilterValues({
                          program: "",
                          field: "",
                          email: "",
                          contact: "",
                          hired: "",
                          locationPreference: "",
                          approvedRequirement: "",
                          section: "",
                        });
                      } else {
                        setFilterValues({
                          program: "",
                          field: "",
                          email: "",
                          contact: "",
                          hired: "",
                          locationPreference: "",
                          approvedRequirement: "",
                          section: "",
                        });
                      }
                    }}
                  >
                    Clear All
                  </button>
                </div>
              </div>
            )}

            {/* Bulk Operations Toolbar */}
            {showBulkToolbar && selectedItems.length > 0 && (
              <div className="bulk-operations-toolbar">
                <div className="bulk-toolbar-left">
                  <span className="bulk-selection-count">
                    {selectedItems.length} item
                    {selectedItems.length !== 1 ? "s" : ""} selected
                  </span>
                </div>
                <div className="bulk-toolbar-actions">
                  <button
                    className="bulk-action-btn export-btn"
                    onClick={() => {
                      const selectedStudents = students.filter((s) =>
                        selectedItems.includes(s.id)
                      );
                      const exportData =
                        prepareStudentsForExport(selectedStudents);
                      downloadCSV(
                        exportData,
                        `selected-students-${
                          new Date().toISOString().split("T")[0]
                        }.csv`
                      );
                      success(`Exported ${selectedItems.length} student(s)`);
                    }}
                    title="Export selected students"
                  >
                    <IoDownloadOutline />
                    Export
                  </button>
                  {!isAdviser && (
                    <button
                      className="bulk-action-btn delete-btn"
                      onClick={handleDelete}
                      disabled={isDeleting}
                      title="Delete selected students"
                      aria-label={`Delete ${
                        selectedItems.length
                      } selected student${
                        selectedItems.length !== 1 ? "s" : ""
                      }`}
                    >
                      <IoTrashOutline />
                      {isDeleting ? "Deleting..." : "Delete"}
                    </button>
                  )}
                  <button
                    className="bulk-action-btn clear-btn"
                    onClick={() => {
                      setSelectedItems([]);
                      setShowBulkToolbar(false);
                    }}
                    title="Clear selection"
                    aria-label="Clear selection"
                  >
                    <IoClose />
                    Clear
                  </button>
                </div>
              </div>
            )}

            {viewMode !== "notifications" && viewMode !== "applications" && (
              <div
                style={{
                  display: "flex",
                  gap: "1rem",
                  alignItems: "center",
                  marginBottom: "1rem",
                }}
              >
                <div style={{ flex: 1 }}>
                  <SearchBar
                    onSearch={setSearchQuery}
                    onFilter={
                      viewMode === "pending"
                        ? setPendingFilterValues
                        : setFilterValues
                    }
                    filterValues={
                      viewMode === "pending"
                        ? pendingFilterValues
                        : filterValues
                    }
                    type="student"
                    searchInputRef={searchInputRef}
                    sectionSuggestions={sectionSuggestions}
                    programSuggestions={programSuggestions}
                  />
                </div>
              </div>
            )}
            {viewMode !== "notifications" && viewMode !== "applications" && (
              <>
                {viewMode === "pending" && isLoadingPendingStudents ? (
                  <SkeletonLoader type="table" rows={8} columns={13} />
                ) : isLoading && students.length === 0 ? (
                  <SkeletonLoader type="table" rows={8} columns={13} />
                ) : (
                  <StudentTable
                    data={currentItems.map((item) => ({
                      ...item,
                      submittedRequirements:
                        studentSubmittedRequirements[item.id] || [],
                    }))}
                    selectionMode={selectionMode && !isAdviser}
                    selectedItems={selectedItems}
                    setSelectedItems={setSelectedItems}
                    openMenuId={openMenuId}
                    setOpenMenuId={setOpenMenuId}
                    selectedRowId={selectedRowId}
                    setSelectedRowId={setSelectedRowId}
                    handleDeleteSingle={handleDeleteSingle}
                    handleAcceptStudent={handleAcceptStudent}
                    isDeleting={isDeleting}
                    setSelectionMode={setSelectionMode}
                    isAdviser={isAdviser}
                    requirementApprovals={requirementApprovals}
                    sortConfig={sortConfig}
                    onSort={handleSort}
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
                    onClearFilters={handleClearAllFilters}
                    onAddStudent={() => setShowAddStudentModal(true)}
                  />
                )}
                {viewMode !== "applications" &&
                  viewMode !== "notifications" && (
                    <>
                      <div className="pagination">
                        <button
                          onClick={() =>
                            setCurrentPage((prev) => Math.max(prev - 1, 1))
                          }
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
                            setCurrentPage((prev) =>
                              Math.min(prev + 1, totalPages)
                            )
                          }
                          disabled={currentPage === totalPages}
                          className="pagination-arrow"
                        >
                          &gt;
                        </button>
                      </div>
                      <div className="pagination-info-wrapper">
                        <div className="pagination-info">
                          Showing {indexOfFirstItem + 1}-
                          {Math.min(indexOfLastItem, sortedData.length)}{" "}
                          students
                        </div>
                        <div className="pagination-items-per-page">
                          <label htmlFor="items-per-page">Show:</label>
                          <select
                            id="items-per-page"
                            value={itemsPerPage}
                            onChange={(e) => {
                              setItemsPerPage(Number(e.target.value));
                              setCurrentPage(1);
                            }}
                            className="items-per-page-select"
                            aria-label="Items per page"
                          >
                            <option value="5">5</option>
                            <option value="8">8</option>
                            <option value="10">10</option>
                            <option value="20">20</option>
                            <option value="50">50</option>
                          </select>
                          <span className="items-per-page-label">per page</span>
                        </div>
                      </div>
                    </>
                  )}
                {/* Action Buttons */}
                <div className="table-actions">
                  <input
                    type="file"
                    accept=".csv"
                    ref={fileInputRef}
                    onChange={handleImportStudents}
                    style={{ display: "none" }}
                    disabled={isImporting}
                  />
                  <button
                    className="import-btn table-action-btn"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isImporting}
                    title="Import students from CSV"
                  >
                    <IoCloudUploadOutline />
                    {isImporting
                      ? `${importProgress.current}/${importProgress.total}`
                      : "Import"}
                  </button>
                  <button
                    className="export-btn table-action-btn"
                    onClick={() => {
                      try {
                        const exportData =
                          prepareStudentsForExport(filteredData);
                        downloadCSV(
                          exportData,
                          `students_export_${
                            new Date().toISOString().split("T")[0]
                          }`
                        );
                        activityLoggers.exportData(
                          "students",
                          exportData.length
                        );
                        success(
                          `Exported ${exportData.length} students successfully`
                        );
                      } catch (err) {
                        logger.error("Export error:", err);
                        showError("Failed to export data. Please try again.");
                      }
                    }}
                    title="Export students to CSV"
                  >
                    <IoDownloadOutline />
                    Export
                  </button>
                  <button
                    className="add-student-btn table-action-btn"
                    onClick={() => setShowAddStudentModal(true)}
                    title="Add new student"
                  >
                    <IoAddOutline />
                    Add Student
                  </button>
                </div>
                {selectionMode && selectedItems.length > 0 && !isAdviser && (
                  <div className="table-actions">
                    <Tooltip
                      content={`Delete ${selectedItems.length} selected student(s)`}
                    >
                      <button
                        className="delete table-action-btn"
                        onClick={handleDelete}
                        disabled={isDeleting}
                      >
                        {isDeleting
                          ? "Deleting..."
                          : `Delete (${selectedItems.length})`}
                      </button>
                    </Tooltip>
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
              </>
            )}
          </div>
        </div>
      </div>
      <ConfirmModal
        open={showConfirm}
        message="This action cannot be undone. The selected students will be permanently deleted and moved to deleted records."
        onConfirm={confirmDelete}
        onCancel={cancelDelete}
        itemCount={selectedItems.length}
        itemPreview={getSelectedStudentsPreview()}
        title="Delete Students?"
        confirmButtonText={`Yes, delete ${selectedItems.length} student${
          selectedItems.length !== 1 ? "s" : ""
        }`}
      />
      <ConfirmModal
        open={showDeleteNotificationConfirm}
        message="This notification will be permanently deleted. This action cannot be undone."
        onConfirm={confirmDeleteNotification}
        onCancel={cancelDeleteNotification}
        title="Delete Notification?"
        confirmButtonText="Yes, delete it"
      />
      <ConfirmModal
        open={showDeleteAllConfirm}
        message={`Are you sure you want to delete all ${
          filteredNotifications.length
        } message${
          filteredNotifications.length !== 1 ? "s" : ""
        }? This action cannot be undone.`}
        onConfirm={confirmDeleteAllNotifications}
        onCancel={cancelDeleteAllNotifications}
        title="Delete All Messages?"
        confirmButtonText="Yes, delete all"
      />
      <StudentRequirementModal
        open={showRequirementModal}
        student={selectedStudent}
        onClose={handleCloseRequirementModal}
        onRequirementUpdated={handleRequirementUpdated}
        onStudentUpdated={(updated) => setSelectedStudent((prev) => (prev?.id === updated?.id ? { ...prev, ...updated } : prev))}
        onShowSuccess={success}
        onShowError={showError}
      />
      <AddStudentModal
        isOpen={showAddStudentModal}
        onClose={() => setShowAddStudentModal(false)}
        onSubmit={handleCreateStudentAccount}
        isLoading={isCreatingStudent}
        defaultCollege={adminCollegeName}
      />

      {/* Message History Modal */}
      {showMessageHistoryModal && (
        <div
          className="message-history-modal-backdrop"
          onClick={() => setShowMessageHistoryModal(false)}
          role="dialog"
          aria-modal="true"
          aria-labelledby="message-history-modal-title"
        >
          <div
            className="message-history-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="message-history-modal-header">
              <div className="message-history-modal-header-content">
                <div className="message-history-modal-icon">
                  <IoNotificationsOutline />
                </div>
                <div>
                  <h2
                    id="message-history-modal-title"
                    className="message-history-modal-title"
                  >
                    Message History
                  </h2>
                  <p className="message-history-modal-subtitle">
                    View and manage all sent notifications
                  </p>
                </div>
              </div>
              <button
                type="button"
                className="message-history-modal-close-btn"
                onClick={() => setShowMessageHistoryModal(false)}
                aria-label="Close"
              >
                <IoCloseOutline />
              </button>
            </div>

            <div className="message-history-modal-body">
              {/* Search Bar, Filters, and Delete All Button */}
              {sentNotifications.length > 0 && (
                <div className="message-history-modal-controls">
                  <div className="message-history-search-wrap">
                    <IoSearchOutline className="message-history-search-icon" />
                    <input
                      type="text"
                      placeholder="Search messages..."
                      value={messageHistorySearchQuery}
                      onChange={(e) =>
                        setMessageHistorySearchQuery(e.target.value)
                      }
                      className="message-history-search-input"
                      aria-label="Search messages"
                    />
                    {messageHistorySearchQuery && (
                      <button
                        type="button"
                        className="message-history-search-clear"
                        onClick={() => setMessageHistorySearchQuery("")}
                        aria-label="Clear search"
                      >
                        <IoCloseOutline />
                      </button>
                    )}
                  </div>
                  <div className="message-history-filters">
                    <select
                      value={messageHistoryFilterStudent}
                      onChange={(e) =>
                        setMessageHistoryFilterStudent(e.target.value)
                      }
                      className="message-history-filter-select"
                      aria-label="Filter by student"
                    >
                      <option value="">All Students</option>
                      {notificationStudents.map((student) => (
                        <option key={student.id} value={student.id}>
                          {student.name}
                        </option>
                      ))}
                    </select>
                    <button
                      type="button"
                      onClick={() => {
                        setShowDeleteAllConfirm(true);
                      }}
                      disabled={isDeletingNotifications}
                      className="message-history-delete-all-btn"
                    >
                      {isDeletingNotifications ? (
                        <>
                          <span className="spinner-small" /> Deleting...
                        </>
                      ) : (
                        <>
                          <IoTrashOutline /> Delete All
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}

              {/* Notifications List */}
              <div className="message-history-list">
                {filteredNotifications.length === 0 ? (
                  <div className="message-history-empty-state">
                    <div className="message-history-empty-icon">
                      <IoNotificationsOutline />
                    </div>
                    <h3 className="message-history-empty-title">
                      {sentNotifications.length === 0
                        ? "No messages sent yet"
                        : "No messages found"}
                    </h3>
                    <p className="message-history-empty-description">
                      {sentNotifications.length === 0
                        ? "Start sending notifications to students to see them here."
                        : "Try adjusting your search or filter criteria."}
                    </p>
                    {(messageHistorySearchQuery ||
                      messageHistoryFilterStudent) && (
                      <button
                        type="button"
                        className="message-history-empty-clear-btn"
                        onClick={() => {
                          setMessageHistorySearchQuery("");
                          setMessageHistoryFilterStudent("");
                        }}
                      >
                        Clear filters
                      </button>
                    )}
                  </div>
                ) : (
                  filteredNotifications
                    .slice(
                      (currentNotificationPage - 1) * notificationsPerPage,
                      currentNotificationPage * notificationsPerPage
                    )
                    .map((notification) => {
                      const notificationDate = new Date(notification.timestamp);
                      const formattedDate = notificationDate.toLocaleDateString(
                        "en-US",
                        {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        }
                      );
                      const formattedTime = notificationDate.toLocaleTimeString(
                        "en-US",
                        {
                          hour: "2-digit",
                          minute: "2-digit",
                        }
                      );

                      return (
                        <div
                          key={notification.id}
                          className="message-history-item"
                        >
                          <div className="message-history-item-left-border"></div>
                          <div className="message-history-item-content">
                            <div className="message-history-item-header">
                              <div className="message-history-item-meta">
                                <span className="message-history-item-recipient">
                                  {notification.targetType === "all" ? (
                                    <span className="recipient-badge recipient-all">
                                      <IoPeopleOutline />
                                      All Students
                                    </span>
                                  ) : notification.targetType === "student" ? (
                                    <span className="recipient-badge recipient-student">
                                      <IoPersonOutline />
                                      {notification.targetStudentName ||
                                        "Specific Student"}
                                    </span>
                                  ) : (
                                    <span className="recipient-badge recipient-section">
                                      <IoSchoolOutline />
                                      Section: {notification.targetSection}
                                    </span>
                                  )}
                                </span>
                                {notification.subject && (
                                  <span
                                    className="message-history-item-subject"
                                    onClick={() => {
                                      setSelectedNotificationForView(
                                        notification
                                      );
                                      setShowNotificationDetailModal(true);
                                    }}
                                    style={{ cursor: "pointer" }}
                                    title="Click to view full notification"
                                  >
                                    <strong>{notification.subject}</strong>
                                  </span>
                                )}
                                <span className="message-history-item-date">
                                  <IoCalendarOutline />
                                  {formattedDate} • {formattedTime}
                                </span>
                              </div>
                            </div>
                            <div className="message-history-item-message">
                              {notification.messageHtml ? (
                                <div
                                  className="notification-message-html"
                                  dangerouslySetInnerHTML={{
                                    __html: notification.messageHtml,
                                  }}
                                />
                              ) : (
                                <div className="notification-message-text">
                                  {notification.message}
                                </div>
                              )}
                            </div>
                            {notification.fileUrl && (
                              <div className="message-history-item-file">
                                {notification.fileType?.startsWith("image/") ? (
                                  <div className="notification-file-display">
                                    <img
                                      src={notification.fileUrl}
                                      alt={
                                        notification.fileName || "Attachment"
                                      }
                                      className="notification-attached-image"
                                      onClick={() =>
                                        window.open(
                                          notification.fileUrl,
                                          "_blank"
                                        )
                                      }
                                    />
                                    <a
                                      href={notification.fileUrl}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="notification-file-link"
                                    >
                                      <IoImageOutline /> View Image
                                    </a>
                                  </div>
                                ) : (
                                  <a
                                    href={notification.fileUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="notification-file-link"
                                  >
                                    <IoAttachOutline />
                                    {notification.fileName ||
                                      "Download Attachment"}
                                  </a>
                                )}
                              </div>
                            )}
                          </div>
                          <button
                            type="button"
                            className="message-history-item-delete-btn"
                            onClick={() =>
                              handleDeleteNotification(notification.id)
                            }
                            disabled={isDeletingNotifications}
                            aria-label="Delete notification"
                            title="Delete message"
                          >
                            <IoTrashOutline />
                          </button>
                        </div>
                      );
                    })
                )}
              </div>

              {/* Pagination */}
              {notificationTotalPages > 1 && (
                <div className="message-history-pagination">
                  <div className="message-history-pagination-info">
                    Showing{" "}
                    {filteredNotifications.length === 0
                      ? 0
                      : (currentNotificationPage - 1) * notificationsPerPage +
                        1}
                    –
                    {Math.min(
                      currentNotificationPage * notificationsPerPage,
                      filteredNotifications.length
                    )}{" "}
                    of {filteredNotifications.length} messages
                  </div>
                  <div className="message-history-pagination-controls">
                    <button
                      type="button"
                      onClick={() =>
                        setCurrentNotificationPage((prev) =>
                          Math.max(1, prev - 1)
                        )
                      }
                      disabled={currentNotificationPage === 1}
                      className="message-history-pagination-btn"
                    >
                      ‹
                    </button>
                    {[...Array(notificationTotalPages)].map((_, index) => {
                      const page = index + 1;
                      if (
                        page === 1 ||
                        page === notificationTotalPages ||
                        (page >= currentNotificationPage - 1 &&
                          page <= currentNotificationPage + 1)
                      ) {
                        return (
                          <button
                            key={page}
                            type="button"
                            className={`message-history-pagination-btn ${
                              currentNotificationPage === page ? "active" : ""
                            }`}
                            onClick={() => setCurrentNotificationPage(page)}
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
                            className="message-history-pagination-ellipsis"
                          >
                            ...
                          </span>
                        );
                      }
                      return null;
                    })}
                    <button
                      type="button"
                      onClick={() =>
                        setCurrentNotificationPage((prev) =>
                          Math.min(notificationTotalPages, prev + 1)
                        )
                      }
                      disabled={
                        currentNotificationPage === notificationTotalPages
                      }
                      className="message-history-pagination-btn"
                    >
                      ›
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Notification Detail Modal */}
      {showNotificationDetailModal && selectedNotificationForView && (
        <div
          className="notification-detail-modal-backdrop"
          onClick={() => {
            setShowNotificationDetailModal(false);
            setSelectedNotificationForView(null);
          }}
        >
          <div
            className="notification-detail-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="notification-detail-modal-header">
              <h3>{selectedNotificationForView.subject || "Notification"}</h3>
              <button
                type="button"
                className="notification-detail-close-btn"
                onClick={() => {
                  setShowNotificationDetailModal(false);
                  setSelectedNotificationForView(null);
                }}
                aria-label="Close modal"
              >
                <IoCloseOutline />
              </button>
            </div>
            <div className="notification-detail-modal-content">
              {/* Recipient Info */}
              <div className="notification-detail-recipient">
                {selectedNotificationForView.targetType === "all" ? (
                  <span className="recipient-badge recipient-all">
                    <IoPeopleOutline />
                    All Students
                  </span>
                ) : selectedNotificationForView.targetType === "student" ? (
                  <span className="recipient-badge recipient-student">
                    <IoPersonOutline />
                    {selectedNotificationForView.targetStudentName ||
                      "Specific Student"}
                  </span>
                ) : (
                  <span className="recipient-badge recipient-section">
                    <IoSchoolOutline />
                    Section: {selectedNotificationForView.targetSection}
                  </span>
                )}
              </div>

              {/* Message Content */}
              <div className="notification-detail-message">
                {selectedNotificationForView.messageHtml ? (
                  <div
                    className="notification-detail-message-html"
                    dangerouslySetInnerHTML={{
                      __html: selectedNotificationForView.messageHtml,
                    }}
                  />
                ) : (
                  <div className="notification-detail-message-text">
                    {selectedNotificationForView.message}
                  </div>
                )}
              </div>

              {/* Display Images */}
              {(selectedNotificationForView.images ||
                selectedNotificationForView.imageUrls) && (
                <div className="notification-detail-images">
                  {(
                    selectedNotificationForView.images ||
                    selectedNotificationForView.imageUrls
                  ).map((imageUrl, index) => (
                    <div
                      key={index}
                      className="notification-detail-image-wrapper"
                    >
                      <img
                        src={imageUrl}
                        alt={`Notification image ${index + 1}`}
                        className="notification-detail-image"
                        onClick={() => window.open(imageUrl, "_blank")}
                      />
                    </div>
                  ))}
                </div>
              )}

              {/* Display fileUrl if exists (backward compatibility) */}
              {selectedNotificationForView.fileUrl &&
                !selectedNotificationForView.images &&
                !selectedNotificationForView.imageUrls && (
                  <div className="notification-detail-images">
                    {selectedNotificationForView.fileType?.startsWith(
                      "image/"
                    ) ? (
                      <div className="notification-detail-image-wrapper">
                        <img
                          src={selectedNotificationForView.fileUrl}
                          alt={
                            selectedNotificationForView.fileName || "Attachment"
                          }
                          className="notification-detail-image"
                          onClick={() =>
                            window.open(
                              selectedNotificationForView.fileUrl,
                              "_blank"
                            )
                          }
                        />
                      </div>
                    ) : (
                      <a
                        href={selectedNotificationForView.fileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="notification-detail-file-link"
                      >
                        <IoAttachOutline />
                        {selectedNotificationForView.fileName ||
                          "Download Attachment"}
                      </a>
                    )}
                  </div>
                )}

              {/* Timestamp */}
              <div className="notification-detail-timestamp">
                <IoCalendarOutline />
                {selectedNotificationForView.timestamp
                  ? new Date(
                      selectedNotificationForView.timestamp
                    ).toLocaleString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })
                  : "N/A"}
              </div>
            </div>
            <div className="notification-detail-modal-actions">
              <button
                className="notification-detail-delete-btn"
                onClick={() => {
                  setShowNotificationDetailModal(false);
                  handleDeleteNotification(selectedNotificationForView.id);
                  setSelectedNotificationForView(null);
                }}
                disabled={isDeletingNotifications}
              >
                <IoTrashOutline />
                Delete
              </button>
              <button
                className="notification-detail-close-action-btn"
                onClick={() => {
                  setShowNotificationDetailModal(false);
                  setSelectedNotificationForView(null);
                }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Application Detail Modal */}
      {showApplicationDetailModal && selectedApplication && (
        <div
          className="application-detail-modal-backdrop"
          onClick={closeApplicationDetailModal}
          role="dialog"
          aria-modal="true"
          aria-labelledby="application-detail-title"
        >
          <div
            className="application-detail-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="application-detail-modal-header">
              <h2
                id="application-detail-title"
                className="application-detail-modal-title"
              >
                Application Details
              </h2>
              <button
                type="button"
                className="application-detail-close-btn"
                onClick={closeApplicationDetailModal}
                aria-label="Close"
              >
                <IoCloseOutline />
              </button>
            </div>
            <div className="application-detail-modal-body">
              {(() => {
                const app = selectedApplication;
                const student = students.find((s) => s.id === app.userId);
                const studentName =
                  app.userProfile?.name?.trim() ||
                  app.userProfile?.email ||
                  (student
                    ? `${student.firstName || ""} ${
                        student.lastName || ""
                      }`.trim() || student.email
                    : null) ||
                  app.studentName ||
                  app.userId ||
                  "—";
                const studentId =
                  student?.studentId ?? app.userProfile?.studentId ?? "—";
                const section =
                  student?.section ?? app.userProfile?.section ?? "—";
                const email = app.userProfile?.email || student?.email || "—";
                const skills = (app.userProfile?.skills || []).length
                  ? app.userProfile.skills
                  : student?.skills || [];
                const companyName = app.companyName || app.companyId || "—";
                const status = (app.status || "pending").toLowerCase();
                const statusLabel =
                  status === "approved" || status === "accepted"
                    ? "Approved"
                    : status === "rejected"
                    ? "Rejected"
                    : "Pending";
                const appliedAt =
                  app.appliedAt || app.createdAt || app.timestamp;
                const appliedStr = appliedAt
                  ? (() => {
                      const t = getApplicationTime(appliedAt);
                      return t
                        ? new Date(t).toLocaleString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })
                        : "—";
                    })()
                  : "—";
                const approvedAt = app.approvedAt;
                const approvedStr = approvedAt
                  ? (() => {
                      const t = getApplicationTime(approvedAt);
                      return t
                        ? new Date(t).toLocaleString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })
                        : "—";
                    })()
                  : "—";
                const isPending = status === "pending";
                const isUpdating = updatingApplicationId === app.id;
                return (
                  <>
                    <div className="application-detail-blocks">
                      <section className="application-detail-block application-detail-student">
                        <h3 className="application-detail-block-title">
                          <IoPersonOutline /> Student
                        </h3>
                        <dl className="application-detail-dl">
                          <dt>Student ID</dt>
                          <dd>{studentId}</dd>
                          <dt>Name</dt>
                          <dd>{studentName}</dd>
                          <dt>Section</dt>
                          <dd>{section}</dd>
                          <dt>Email</dt>
                          <dd>
                            <a
                              href={`mailto:${email}`}
                              className="application-detail-link"
                            >
                              {email}
                            </a>
                          </dd>
                          {Array.isArray(skills) && skills.length > 0 && (
                            <>
                              <dt>Skills</dt>
                              <dd>
                                <div className="application-detail-skills">
                                  {skills.map((sk, i) => (
                                    <span
                                      key={i}
                                      className="application-detail-skill-tag"
                                    >
                                      {sk}
                                    </span>
                                  ))}
                                </div>
                              </dd>
                            </>
                          )}
                        </dl>
                      </section>
                      <section className="application-detail-block application-detail-company">
                        <h3 className="application-detail-block-title">
                          <IoBusinessOutline /> Company
                        </h3>
                        <dl className="application-detail-dl">
                          <dt>Company</dt>
                          <dd>{companyName}</dd>
                          {app.companyId && (
                            <>
                              <dt>Company ID</dt>
                              <dd>
                                <code className="application-detail-code">
                                  {app.companyId}
                                </code>
                              </dd>
                            </>
                          )}
                        </dl>
                      </section>
                    </div>
                    <section className="application-detail-block application-detail-status">
                      <h3 className="application-detail-block-title">
                        <IoTimeOutline /> Status &amp; Timeline
                      </h3>
                      <div className="application-detail-timeline">
                        <div className="application-detail-timeline-item">
                          <span className="application-detail-timeline-label">
                            Status
                          </span>
                          <span
                            className={`application-status-badge application-detail-status-badge status-${status}`}
                          >
                            {statusLabel}
                          </span>
                        </div>
                        <div className="application-detail-timeline-item">
                          <span className="application-detail-timeline-label">
                            Applied
                          </span>
                          <span>{appliedStr}</span>
                        </div>
                        {(status === "approved" || status === "accepted") && (
                          <div className="application-detail-timeline-item">
                            <span className="application-detail-timeline-label">
                              Approved
                            </span>
                            <span>{approvedStr}</span>
                          </div>
                        )}
                      </div>
                    </section>
                    {(isPending ||
                      status === "approved" ||
                      status === "accepted") && (
                      <div
                        className="application-detail-actions"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {isPending && (
                          <>
                            <button
                              type="button"
                              className="application-btn accept-btn application-detail-btn"
                              onClick={() =>
                                openApplicationStatusConfirm(app, "accept")
                              }
                              disabled={isUpdating}
                            >
                              {isUpdating ? (
                                <span className="spinner-small" />
                              ) : (
                                <>
                                  <IoCheckmarkCircle /> Approve
                                </>
                              )}
                            </button>
                            <button
                              type="button"
                              className="application-btn reject-btn application-detail-btn"
                              onClick={() =>
                                openApplicationStatusConfirm(app, "reject")
                              }
                              disabled={isUpdating}
                            >
                              Reject
                            </button>
                          </>
                        )}
                      </div>
                    )}
                  </>
                );
              })()}
            </div>
            <div className="application-detail-modal-footer">
              {selectedApplication && (
                <button
                  type="button"
                  className="application-detail-remove-btn"
                  onClick={() =>
                    openRemoveApplicationConfirm(selectedApplication)
                  }
                  disabled={isRemovingApplication}
                  aria-label="Remove application"
                >
                  <IoTrashOutline /> Remove
                </button>
              )}
              <button
                type="button"
                className="application-detail-close-action-btn"
                onClick={closeApplicationDetailModal}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Application status (accept/reject) confirmation */}
      <ConfirmModal
        open={showApplicationStatusConfirm}
        message={(() => {
          if (!applicationStatusConfirm?.app) return "";
          const { app, action } = applicationStatusConfirm;
          const student = students.find((s) => s.id === app.userId);
          const studentName =
            app.userProfile?.name?.trim() ||
            app.userProfile?.email ||
            (student
              ? `${student.firstName || ""} ${student.lastName || ""}`.trim() ||
                student.email
              : "this student");
          const companyName = app.companyName || app.companyId || "the company";
          const verb = action === "accept" ? "approve" : "deny";
          return `Are you sure you want to ${verb} this application for ${studentName} at ${companyName}?`;
        })()}
        onConfirm={handleConfirmApplicationStatus}
        onCancel={cancelApplicationStatusConfirm}
        title={
          applicationStatusConfirm?.action === "accept"
            ? "Approve application?"
            : "Deny application?"
        }
        confirmButtonText={
          applicationStatusConfirm?.action === "accept"
            ? "Yes, approve"
            : "Yes, deny"
        }
      />

      <ConfirmModal
        open={showRemoveApplicationConfirm}
        message="This application will be permanently removed. This action cannot be undone."
        onConfirm={handleRemoveApplication}
        onCancel={cancelRemoveApplication}
        title="Remove application?"
        confirmButtonText={isRemovingApplication ? "Removing…" : "Yes, remove"}
      />

      <ToastContainer toasts={toasts} removeToast={removeToast} />
      <Footer />
    </div>
  );
};

export default StudentDashboard;
