/**
 * StudentDashboard - Admin dashboard for managing students
 * Fetches and displays student/company data, supports search, filter, selection, notification, and deletion.
 *
 * @component
 * @example
 * <StudentDashboard />
 */

import React, { useState, useEffect, useRef, useCallback } from "react";
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
} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL, listAll } from "firebase/storage";
import { storage } from "../../../firebase.js";
import {
  IoTrashOutline,
  IoDownloadOutline,
  IoPersonAddOutline,
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
} from "react-icons/io5";
import logo from "../../assets/InternQuest_Logo.png";
import { signOut, createUserWithEmailAndPassword } from "firebase/auth";
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
import ColumnToggle from "../ColumnToggle/ColumnToggle.jsx";
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
  const [adminProgram, setAdminProgram] = useState(null);
  const [adminCollegeName, setAdminCollegeName] = useState(null);

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
        const studentId = student.studentNumber || student.studentId || "";
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

          // Check if student number/ID already exists
          const importStudentIdValue =
            student.studentNumber || student.studentId || "";
          if (importStudentIdValue) {
            // First check if this ID was already imported in this CSV batch
            if (importedInBatch.has(importStudentIdValue.trim())) {
              throw new Error(
                `Duplicate Student ID in CSV file - already imported earlier in this batch`
              );
            }

            // Then check if it exists in Firestore database
            const studentNumberQuery = query(
              collection(db, "users"),
              where("studentNumber", "==", importStudentIdValue.trim())
            );
            const studentNumberSnapshot = await getDocs(studentNumberQuery);

            // Check studentId field
            const studentIdQuery = query(
              collection(db, "users"),
              where("studentId", "==", importStudentIdValue.trim())
            );
            const studentIdSnapshot = await getDocs(studentIdQuery);

            if (!studentNumberSnapshot.empty || !studentIdSnapshot.empty) {
              throw new Error(
                `Student ID/Number ${importStudentIdValue} already exists in database`
              );
            }
          }

          // Create auth email from Student ID for login
          const authEmail = importStudentIdValue 
            ? `${importStudentIdValue}@student.internquest.local`
            : "";
          
          // Validate email is provided
          if (!student.email) {
            throw new Error('Email is required');
          }
          
          const newStudent = {
            studentNumber: importStudentIdValue,
            studentId: importStudentIdValue, // Save to both fields for compatibility
            firstName: student.firstName,
            lastName: student.lastName,
            email: student.email, // Store provided email (required)
            authEmail: authEmail, // Store the auth email used for login
            program: student.program,
            yearLevel: student.yearLevel || "",
            contact: student.contact || "",
            companyName: student.companyName || "",
            status: student.status || false,
            createdAt: student.createdAt || new Date().toISOString(),
            updatedAt: student.updatedAt || new Date().toISOString(),
          };

          const docRef = await addDoc(collection(db, "users"), newStudent);

          // Mark this student ID as imported in this batch
          if (importStudentIdValue) {
            importedInBatch.add(importStudentIdValue.trim());
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
      // Fetch for advisers, coordinators, and super admins
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
                console.log(
                  "Setting admin college name:",
                  college.college_name
                );
                setAdminCollegeName(college.college_name);
              } else if (!college && isMounted) {
                console.warn("College not found for code:", adviserCollegeCode);
                setAdminCollegeName(null);
              }
            } catch (err) {
              logger.error("Error loading colleges:", err);
            }
          } else if (!adviserCollegeCode && isMounted) {
            // If no college found, clear the college name
            console.log("No college code found for admin");
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
  const [notificationText, setNotificationText] = useState("");
  const [notificationType, setNotificationType] = useState("all"); // "all", "student", "section"
  const [selectedNotificationStudents, setSelectedNotificationStudents] = useState([]); // Array of student IDs
  const [selectedNotificationSection, setSelectedNotificationSection] = useState("");
  const [studentSearchQuery, setStudentSearchQuery] = useState("");
  const [showStudentDropdown, setShowStudentDropdown] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(8);
  // Kebab/Selection
  const [openMenuId, setOpenMenuId] = useState(null);
  const [selectedRowId, setSelectedRowId] = useState(null);
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedItems, setSelectedItems] = useState([]);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [showDeleteNotificationConfirm, setShowDeleteNotificationConfirm] = useState(false);
  const [notificationToDelete, setNotificationToDelete] = useState(null);
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
  });
  const [pendingFilterValues, setPendingFilterValues] = useState({
    program: "",
    field: "",
    email: "",
    contact: "",
    hired: "",
    locationPreference: "",
    approvedRequirement: "",
  });
  // View mode: 'all' or 'pending'
  const [viewMode, setViewMode] = useState("all");
  const [pendingStudentsWithRequirements, setPendingStudentsWithRequirements] =
    useState([]);
  const [isLoadingPendingStudents, setIsLoadingPendingStudents] =
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

  // Essential columns that cannot be hidden
  const essentialColumns = [
    "profilePicture",
    "studentNumber",
    "firstName",
    "lastName",
  ];

  // Column definitions
  const columnDefinitions = [
    { key: "profilePicture", label: "Profile Picture" },
    { key: "studentNumber", label: "Student ID" },
    { key: "firstName", label: "First Name" },
    { key: "lastName", label: "Last Name" },
    { key: "email", label: "Email" },
    { key: "contact", label: "Contact" },
    { key: "program", label: "Program" },
    { key: "section", label: "Section" },
    { key: "field", label: "Field" },
    { key: "company", label: "Company" },
    { key: "skills", label: "Skills" },
    { key: "hired", label: "Hired" },
    { key: "requirements", label: "Requirements" },
    { key: "actions", label: "Actions" },
  ];

  // Column visibility state (all columns visible by default, essential columns always included)
  const [visibleColumns, setVisibleColumns] = useState(() => {
    const allColumns = columnDefinitions.map((col) => col.key);
    // Ensure essential columns are always included
    const essentialSet = new Set(essentialColumns);
    const result = [
      ...essentialSet,
      ...allColumns.filter((key) => !essentialSet.has(key)),
    ];
    return result;
  });

  // Handle column toggle
  const handleToggleColumn = (columnKey) => {
    // Prevent hiding essential columns
    if (essentialColumns.includes(columnKey)) {
      return;
    }

    setVisibleColumns((prev) => {
      // Create a new array without essential columns for manipulation
      const nonEssentialPrev = prev.filter(
        (key) => !essentialColumns.includes(key)
      );
      const newSet = new Set(nonEssentialPrev);

      if (newSet.has(columnKey)) {
        // Remove the column
        newSet.delete(columnKey);
      } else {
        // Add the column
        newSet.add(columnKey);
      }

      // Always include essential columns + the new set of non-essential columns
      const result = [...essentialColumns, ...Array.from(newSet)];
      return result;
    });
  };

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

      // Filter students who are not approved (status !== true)
      const unapprovedStudents = students.filter(
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
  }, [students]);

  // Real-time listeners for companies and students
  useEffect(() => {
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
        setOverviewStats((prev) => ({
          ...prev,
          totalStudents: studentsData.length,
        }));
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
  }, []);

  // Legacy migration code (keep for backward compatibility)
  useEffect(() => {
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
          logger.debug(
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
              logger.debug(
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
  }, []);

  // Fetch pending students when view mode changes or students data changes
  useEffect(() => {
    if (viewMode === "pending" && students.length > 0) {
      fetchPendingStudentsWithRequirements();
    }
  }, [viewMode, students.length, fetchPendingStudentsWithRequirements]);

  // List of all required documents
  const REQUIRED_DOCUMENTS = [
    "MOA (Memorandum of Agreement)",
    "Parent/Guardian Consent Form",
    "Medical Certificate",
    "Resume",
    "Clearance",
    "Academic Records",
    "Cover Letter",
    "Insurance Certificate",
  ];

  // Check which requirements a student has submitted
  const checkStudentSubmittedRequirements = async (studentId) => {
    try {
      const storagePath = `requirements/${studentId}`;
      const requirementsRef = ref(storage, storagePath);
      const folderList = await listAll(requirementsRef);

      const folderMapping = {
        "moa-memorandum-of-agreement": "MOA (Memorandum of Agreement)",
        "parent-guardian-consent-form": "Parent/Guardian Consent Form",
        "medical-certificate": "Medical Certificate",
        "resume-cv": "Resume",
        "police-clearance": "Clearance",
        "academic-records": "Academic Records",
        "cover-letter": "Cover Letter",
        "insurance-certificate": "Insurance Certificate",
      };

      const submittedRequirements = [];

      for (const folderPrefix of folderList.prefixes) {
        const folderName = folderPrefix.name;
        const folderFiles = await listAll(folderPrefix);

        if (folderFiles.items.length > 0) {
          const requirementType = folderMapping[folderName] || folderName;
          submittedRequirements.push(requirementType);
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

  // Real-time listeners for requirement approvals and submitted requirements
  useEffect(() => {
    if (students.length === 0) {
      setRequirementApprovals({});
      setStudentSubmittedRequirements({});
      return;
    }

    const unsubscribes = [];
    const approvals = {};
    const submittedReqs = {};

    // Set up real-time listeners for each student's requirement approvals
    students.forEach((student) => {
      try {
        // Real-time listener for approvals
        const approvalRef = doc(db, "requirement_approvals", student.id);
        const unsubscribeApproval = onSnapshot(
          approvalRef,
          (snap) => {
            if (snap.exists()) {
              setRequirementApprovals((prev) => ({
                ...prev,
                [student.id]: snap.data(),
              }));
            } else {
              setRequirementApprovals((prev) => {
                const updated = { ...prev };
                delete updated[student.id];
                return updated;
              });
            }
          },
          (error) => {
            logger.warn(`Error listening to approvals for ${student.id}:`, error);
          }
        );
        unsubscribes.push(unsubscribeApproval);

        // Fetch submitted requirements (one-time, as they're from Storage)
        checkStudentSubmittedRequirements(student.id)
          .then((submitted) => {
            setStudentSubmittedRequirements((prev) => ({
              ...prev,
              [student.id]: submitted,
            }));
          })
          .catch((error) => {
            logger.warn(
              `Error fetching submitted requirements for ${student.id}:`,
              error
            );
          });
      } catch (error) {
        logger.warn(`Error setting up listeners for ${student.id}:`, error);
      }
    });

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

  // Calculate enhanced statistics
  useEffect(() => {
    if (students.length === 0) return;

    const hiredCount = students.filter((s) => s.status === true).length;
    let pendingCount = 0;
    let approvedCount = 0;
    let totalReqs = 0;

    students.forEach((student) => {
      const submitted = studentSubmittedRequirements[student.id] || [];
      const approvals = requirementApprovals[student.id] || {};
      
      submitted.forEach((reqType) => {
        totalReqs++;
        const approval = approvals[reqType];
        if (approval?.status === "accepted") {
          approvedCount++;
        } else if (approval?.status !== "denied") {
          pendingCount++;
        }
      });
    });

    setOverviewStats((prev) => ({
      ...prev,
      pendingRequirements: pendingCount,
      approvedRequirements: approvedCount,
      totalRequirements: totalReqs,
      hiredStudents: hiredCount,
    }));
  }, [students, studentSubmittedRequirements, requirementApprovals]);

  // Update active filter chips
  useEffect(() => {
    const currentFilters = viewMode === "pending" ? pendingFilterValues : filterValues;
    const chips = [];
    
    Object.entries(currentFilters).forEach(([key, value]) => {
      if (value && value.trim() !== "") {
        chips.push({ key, label: key.charAt(0).toUpperCase() + key.slice(1), value });
      }
    });
    
    if (searchQuery.trim() !== "") {
      chips.push({ key: "search", label: "Search", value: searchQuery });
    }
    
    setActiveFilterChips(chips);
    setOverviewStats((prev) => ({
      ...prev,
      activeFilters: chips.length,
    }));
  }, [filterValues, pendingFilterValues, searchQuery, viewMode]);

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

  // Handles sending a notification to Firestore
  const [isSendingNotification, setIsSendingNotification] = useState(false);
  const [showNotificationSuccess, setShowNotificationSuccess] = useState(false);
  const [sentNotifications, setSentNotifications] = useState([]);
  const [showNotificationsList, setShowNotificationsList] = useState(false);
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
    fetchNotifications();
  }, [showNotificationSuccess]); // Refetch when a new notification is sent

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
      success("Notification deleted successfully");
      setShowDeleteNotificationConfirm(false);
      setNotificationToDelete(null);
    } catch (error) {
      logger.error("Error deleting notification:", error);
      showError("Failed to delete notification. Please try again.");
      setShowDeleteNotificationConfirm(false);
      setNotificationToDelete(null);
    }
  };

  const cancelDeleteNotification = () => {
    setShowDeleteNotificationConfirm(false);
    setNotificationToDelete(null);
  };

  const handleSendNotification = async () => {
    if (!notificationText.trim() || isSendingNotification) return;

    // Validate private notification targets
    if (notificationType === "student" && selectedNotificationStudents.length === 0) {
      return;
    }
    if (notificationType === "section" && !selectedNotificationSection) {
      return;
    }

    setIsSendingNotification(true);
    try {
      // Get current user ID for tracking who sent the notification
      const userId = auth.currentUser?.uid || null;

      // Prepare notification data
      const notificationData = {
        message: notificationText,
        timestamp: new Date().toISOString(),
        read: false,
        userId: userId,
        targetType: notificationType,
      };

      // Add target information for private notifications
      if (notificationType === "student" && selectedNotificationStudents.length > 0) {
        notificationData.targetStudentIds = selectedNotificationStudents;
        const targetStudentNames = selectedNotificationStudents.map((studentId) => {
          const student = baseStudents.find((s) => s.id === studentId);
          return student
            ? `${student.firstName} ${student.lastName}`
            : "Unknown";
        });
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
      const allNotificationsQuery = query(
        collection(db, "notifications"),
        orderBy("timestamp", "desc")
      );
      const allNotificationsSnapshot = await getDocs(allNotificationsQuery);
      const allNotifications = allNotificationsSnapshot.docs;
      
      // If we have more than MAX_NOTIFICATIONS, delete the oldest ones
      if (allNotifications.length > MAX_NOTIFICATIONS) {
        const notificationsToDelete = allNotifications.slice(MAX_NOTIFICATIONS);
        const deletePromises = notificationsToDelete.map((docSnapshot) =>
          deleteDoc(doc(db, "notifications", docSnapshot.id))
        );
        await Promise.all(deletePromises);
      }

      // Log activity - count target students
      let targetCount = students.length;
      if (notificationType === "student" && selectedNotificationStudents.length > 0) {
        targetCount = selectedNotificationStudents.length;
      } else if (notificationType === "section" && selectedNotificationSection) {
        targetCount = baseStudents.filter(
          (s) => s.section === selectedNotificationSection
        ).length;
      }
      await activityLoggers.sendNotification(notificationText, targetCount);

      // Reset form
      setNotificationText("");
      setNotificationType("all");
      setSelectedNotificationStudents([]);
      setSelectedNotificationSection("");
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
  const baseStudents = (() => {
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
      // If coordinator has a college assigned, filter by college
      if (adminCollegeCode) {
        return students.filter((student) => {
          // Get the college code for this student's program
          const studentProgram = student.program;
          if (!studentProgram || typeof studentProgram !== "string") {
            return false; // No program, can't determine college
          }

          // Check if student's program belongs to coordinator's college
          const studentCollegeCode = programToCollegeMap[studentProgram];
          if (!studentCollegeCode) {
            // If we can't find the college for this program, don't show it
            // (safer to exclude than include)
            return false;
          }

          const matchesCollege = studentCollegeCode === adminCollegeCode;

          // If coordinator also has sections assigned, filter by both college AND section
          if (adminSection) {
            const adminSections = Array.isArray(adminSection)
              ? adminSection
              : adminSection
              ? [adminSection]
              : [];
            if (adminSections.length > 0) {
              const matchesSection =
                typeof student.section === "string" &&
                adminSections.some(
                  (section) =>
                    typeof section === "string" &&
                    student.section.toLowerCase() === section.toLowerCase()
                );
              return matchesCollege && matchesSection;
            }
          }

          return matchesCollege;
        });
      }

      // If coordinator has sections but no college, filter by sections only
      if (adminSection) {
        const adminSections = Array.isArray(adminSection)
          ? adminSection
          : adminSection
          ? [adminSection]
          : [];
        if (adminSections.length > 0) {
          return students.filter((student) => {
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
      }

      // Coordinator without college or sections: show all (for backward compatibility)
      return students;
    }

    // Super admin: show all students
    return students;
  })();

  // Get unique sections from students
  const getUniqueSections = () => {
    const sections = new Set();
    baseStudents.forEach((student) => {
      if (student.section) {
        sections.add(student.section);
      }
    });
    return Array.from(sections).sort();
  };

  // Determine which data source to use based on view mode
  const dataSource =
    viewMode === "pending" ? pendingStudentsWithRequirements : baseStudents;

  // Use appropriate filter values based on view mode
  const activeFilterValues =
    viewMode === "pending" ? pendingFilterValues : filterValues;

  const filteredData = dataSource.filter((student) => {
    const matchesSearch =
      (typeof student.firstName === "string" &&
        student.firstName.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (typeof student.lastName === "string" &&
        student.lastName.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (typeof student.program === "string" &&
        student.program.toLowerCase().includes(searchQuery.toLowerCase()));
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
    const matchesHired = activeFilterValues.hired
      ? activeFilterValues.hired === "Yes"
        ? student.status === true
        : student.status !== true
      : true;
    const matchesLocation = activeFilterValues.locationPreference
      ? student.locationPreference &&
        student.locationPreference[
          activeFilterValues.locationPreference.toLowerCase()
        ]
      : true;
    const matchesApprovedRequirement = activeFilterValues.approvedRequirement
      ? (() => {
          const REQUIRED_DOCUMENTS = [
            "MOA (Memorandum of Agreement)",
            "Parent/Guardian Consent Form",
            "Medical Certificate",
            "Resume",
            "Clearance",
            "Academic Records",
            "Cover Letter",
            "Insurance Certificate",
          ];

          const submittedRequirements =
            studentSubmittedRequirements[student.id] || [];
          const studentApprovals = requirementApprovals[student.id] || {};

          // Check if student has submitted ALL required documents
          const hasAllSubmitted = REQUIRED_DOCUMENTS.every((req) =>
            submittedRequirements.includes(req)
          );

          if (!hasAllSubmitted) {
            return activeFilterValues.approvedRequirement === "No";
          }

          // Check if ALL submitted requirements are approved (accepted)
          const allApproved = submittedRequirements.every((reqType) => {
            const approval = studentApprovals[reqType];
            return approval?.status === "accepted";
          });

          return activeFilterValues.approvedRequirement === "Yes"
            ? allApproved
            : !allApproved;
        })()
      : true;
    return (
      matchesSearch &&
      matchesProgram &&
      matchesField &&
      matchesEmail &&
      matchesContact &&
      matchesHired &&
      matchesLocation &&
      matchesApprovedRequirement
    );
  });

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

  // Apply sorting
  const sortedData = [...filteredData].sort((a, b) => {
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
        try {
          await attemptDeleteAuthUser({
            uid: data.uid,
            email: data.email,
          });
        } catch (authError) {
          // Log but don't fail - Firestore deletion should still proceed
          logger.warn("Could not delete Firebase Auth user:", authError);
        }

        await setDoc(doc(db, "deleted_students", id), {
          ...data,
          deletedAt: new Date().toISOString(),
          deletedByRole: currentRole,
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
      success(`Student ${studentName} deleted successfully`);
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
      .map(id => {
        const student = students.find(s => s.id === id);
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
      for (const id of selectedItems) {
        const studentRef = doc(db, "users", id);
        const studentSnap = await getDoc(studentRef);
        if (studentSnap.exists()) {
          const data = studentSnap.data();

          // Attempt to delete Firebase Auth user
          try {
            await attemptDeleteAuthUser({
              uid: data.uid,
              email: data.email,
            });
          } catch (authError) {
            // Log but don't fail - Firestore deletion should still proceed
            logger.warn("Could not delete Firebase Auth user:", authError);
          }

          await setDoc(doc(db, "deleted_students", id), {
            ...data,
            deletedAt: new Date().toISOString(),
            deletedByRole: currentRole,
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
      success(`Successfully deleted ${selectedItems.length} student(s)`);
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

  // Handle creating a new student account with fixed password
  const handleCreateStudentAccount = async (studentData) => {
    try {
      setIsCreatingStudent(true);

      // Check if student number/ID already exists in Firestore
      const usersRef = collection(db, "users");
      const newStudentIdValue =
        studentData.studentNumber?.trim() || studentData.studentId?.trim();

      if (newStudentIdValue) {
        // Check studentNumber field
        const studentNumberQuery = query(
          usersRef,
          where("studentNumber", "==", newStudentIdValue)
        );
        const studentNumberSnapshot = await getDocs(studentNumberQuery);

        // Check studentId field
        const studentIdQuery = query(
          usersRef,
          where("studentId", "==", newStudentIdValue)
        );
        const studentIdSnapshot = await getDocs(studentIdQuery);

        if (!studentNumberSnapshot.empty || !studentIdSnapshot.empty) {
          showError(
            "A student with this Student ID/Number already exists. Student IDs must be unique."
          );
          setIsCreatingStudent(false);
          return;
        }
      }

      // Use Student ID as the email for Firebase Auth login
      // Format: studentId@student.internquest.local
      const studentIdForAuth = newStudentIdValue || studentData.studentId?.trim() || studentData.studentNumber?.trim();
      if (!studentIdForAuth) {
        showError("Student ID is required to create an account.");
        setIsCreatingStudent(false);
        return;
      }
      
      // Create email format for Firebase Auth (Student ID + domain)
      const authEmail = `${studentIdForAuth}@student.internquest.local`;
      
      // Use provided email for contact purposes (required)
      const providedEmail = studentData.email?.trim();
      if (!providedEmail) {
        showError("Email is required. Please provide a valid email address.");
        setIsCreatingStudent(false);
        return;
      }
      
      // Validate institutional email
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(providedEmail)) {
        showError("Please enter a valid email address.");
        setIsCreatingStudent(false);
        return;
      }
      
      // Check if email is from .edu.ph domain only
      const emailDomain = providedEmail.split('@')[1]?.toLowerCase();
      
      if (!emailDomain?.endsWith('.edu.ph')) {
        showError("Please enter an institutional email address ending with .edu.ph (e.g., student@university.edu.ph)");
        setIsCreatingStudent(false);
        return;
      }

      // Check if auth email already exists in Firebase Auth
      // Note: We'll let Firebase Auth handle this check during account creation

      // Create Firebase Auth account with Student ID as email and fixed password
      let firebaseUser;
      try {
        const userCredential = await createUserWithEmailAndPassword(
          auth,
          authEmail, // Use Student ID formatted as email
          studentData.password
        );
        firebaseUser = userCredential.user;
      } catch (authError) {
        let errorMessage = "Failed to create student account. ";

        switch (authError.code) {
          case "auth/email-already-in-use":
            errorMessage =
              "A student account with this Student ID already exists. Please use a different Student ID.";
            break;
          case "auth/invalid-email":
            errorMessage =
              "Invalid Student ID format. Student ID must be alphanumeric and not contain special characters.";
            break;
          case "auth/weak-password":
            errorMessage = "Password is too weak.";
            break;
          default:
            errorMessage += authError.message || "Unknown error occurred.";
        }

        showError(errorMessage);
        setIsCreatingStudent(false);
        return;
      }

      // Create student document in Firestore
      const createdStudentIdValue =
        studentData.studentNumber?.trim() ||
        studentData.studentId?.trim() ||
        "";
      const newStudent = {
        studentNumber: createdStudentIdValue,
        studentId: createdStudentIdValue, // Save to both fields for compatibility
        firstName: studentData.firstName.trim(),
        lastName: studentData.lastName.trim(),
        section: studentData.section?.trim() || "",
        college: studentData.college?.trim() || "",
        email: providedEmail, // Store provided email (required)
        authEmail: authEmail, // Store the auth email used for login
        status: false, // Default to not hired
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        // Link to Firebase Auth UID
        uid: firebaseUser.uid,
      };

      const docRef = await addDoc(collection(db, "users"), newStudent);

      // Log activity
      await activityLoggers.createStudent(
        docRef.id,
        `${newStudent.firstName} ${newStudent.lastName}`
      );

      success(
        `Student account created successfully! Login with Student ID: ${createdStudentIdValue}, Password: ${studentData.password}`
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
        message="Are you sure you want to logout? Any unsaved changes will be lost."
        confirmText="Logout"
        cancelText="Cancel"
        type="warning"
      />
      <Navbar onLogout={handleLogoutClick} />
      <div className="dashboard-content">
        {!isAdviser && (
          <div className="overview-section">
            <h1>Dashboard Overview</h1>
            <div className="overview-cards">
              <div className="card company-card">
                <div className="card-icon-wrapper company-icon">
                  <IoBusinessOutline />
                </div>
                <h3>Company</h3>
                <p>Total active company</p>
                <div className="count">{overviewStats.totalCompanies}</div>
              </div>
              <div className="card student-card">
                <div className="card-icon-wrapper student-icon">
                  <IoPeopleOutline />
                </div>
                <h3>Students</h3>
                <p>Total Registered students</p>
                <div className="count">{overviewStats.totalStudents}</div>
              </div>
              <div className="card requirements-card">
                <div className="card-icon-wrapper requirements-icon">
                  <IoDocumentTextOutline />
                </div>
                <h3>Requirements</h3>
                <p>Total files submitted</p>
                <div className="count" title={`${overviewStats.totalRequirements} requirement files submitted across all students`}>
                  {overviewStats.totalRequirements}
                </div>
                <div className="card-stats">
                  <span className="stat-item approved" title={`${overviewStats.approvedRequirements} files approved`}>
                    <IoCheckmarkCircle /> {overviewStats.approvedRequirements}
                  </span>
                  <span className="stat-item pending" title={`${overviewStats.pendingRequirements} files pending approval`}>
                    <IoTimeOutline /> {overviewStats.pendingRequirements}
                  </span>
                </div>
                <div className="card-footer-note">
                  <span className="footer-note-text" title="Each student needs to submit 8 different document types">
                    8 document types required per student
                  </span>
                </div>
              </div>
              <div className="card hired-card">
                <div className="card-icon-wrapper hired-icon">
                  <IoCheckmarkCircle />
                </div>
                <h3>Hired</h3>
                <p>Students with status</p>
                <div className="count">{overviewStats.hiredStudents}</div>
                <div className="card-percentage">
                  {overviewStats.totalStudents > 0
                    ? Math.round(
                        (overviewStats.hiredStudents / overviewStats.totalStudents) * 100
                      )
                    : 0}
                  %
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* Separate Notification Section */}
        {!isAdviser && (
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
                onClick={() => setShowNotificationsList(!showNotificationsList)}
                aria-label={showNotificationsList ? "Hide messages" : "View messages"}
              >
                <IoNotificationsOutline />
                {showNotificationsList ? "Hide" : "View"} Messages
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
                    <option value="all">All Students</option>
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
                          const student = baseStudents.find((s) => s.id === studentId);
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
                                    selectedNotificationStudents.filter((id) => id !== studentId)
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
                          onClick={() => setSelectedNotificationStudents([])}
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
                              if (!studentSearchQuery.trim()) return true;
                              const query = studentSearchQuery.toLowerCase();
                              const fullName = `${student.firstName} ${student.lastName}`.toLowerCase();
                              const studentId = (
                                student.studentNumber ||
                                student.studentId ||
                                ""
                              ).toLowerCase();
                              const section = (student.section || "").toLowerCase();
                              return (
                                fullName.includes(query) ||
                                studentId.includes(query) ||
                                section.includes(query)
                              );
                            })
                            .slice(0, 10)
                            .map((student) => {
                              const isSelected = selectedNotificationStudents.includes(student.id);
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
                                        selectedNotificationStudents.filter((id) => id !== student.id)
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
                                      {student.studentNumber || student.studentId} -{" "}
                                      {student.section}
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                          {baseStudents.filter((student) => {
                            if (!studentSearchQuery.trim()) return false;
                            const query = studentSearchQuery.toLowerCase();
                            const fullName = `${student.firstName} ${student.lastName}`.toLowerCase();
                            const studentId = (
                              student.studentNumber ||
                              student.studentId ||
                              ""
                            ).toLowerCase();
                            const section = (student.section || "").toLowerCase();
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
                      {getUniqueSections().map((section) => (
                        <option key={section} value={section}>
                          {section}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                <div className="notification-input-wrapper">
                  <label htmlFor="notification-message-input" className="notification-input-label">
                    <IoDocumentTextOutline className="label-icon" />
                    Message:
                  </label>
                  <input
                    type="text"
                    id="notification-message-input"
                    placeholder="Type your notification message here..."
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
                    disabled={
                      isSendingNotification ||
                      !notificationText.trim() ||
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

              {/* Notifications History */}
              {showNotificationsList && (
                <div className="notifications-history">
                  <div className="notifications-history-header">
                    <h3>
                      <IoNotificationsOutline />
                      Message History
                    </h3>
                    <span className="notifications-total">
                      {sentNotifications.length} message
                      {sentNotifications.length !== 1 ? "s" : ""}
                    </span>
                  </div>
                  {sentNotifications.length === 0 ? (
                    <div className="notifications-empty-state">
                      <IoNotificationsOutline className="empty-icon" />
                      <p>No messages sent yet</p>
                      <span>Your sent notifications will appear here</span>
                    </div>
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
                          const paginatedNotifications = sentNotifications.slice(
                            notificationIndexOfFirst,
                            notificationIndexOfLast
                          );

                          return paginatedNotifications.map((notif) => (
                            <div key={notif.id} className="notification-item">
                              <div className="notification-item-content">
                                <p className="notification-message">
                                  {notif.message}
                                </p>
                                <div className="notification-meta">
                                  <span className="notification-time">
                                    {new Date(
                                      notif.timestamp
                                    ).toLocaleString()}
                                  </span>
                                  {notif.targetType && notif.targetType !== "all" && (
                                    <span className="notification-target">
                                      {notif.targetType === "student"
                                        ? `To: ${notif.targetStudentName || "Student"}`
                                        : `To: Section ${notif.targetSection}`}
                                    </span>
                                  )}
                                </div>
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
                      {sentNotifications.length > 0 && (() => {
                        const totalNotificationPages = Math.ceil(
                          sentNotifications.length / notificationsPerPage
                        );
                        const notificationIndexOfLast =
                          currentNotificationPage * notificationsPerPage;
                        const notificationIndexOfFirst =
                          notificationIndexOfLast - notificationsPerPage;
                        return (
                          <div className="notifications-pagination">
                            <div className="notifications-pagination-info">
                              Showing {notificationIndexOfFirst + 1}-{Math.min(
                                notificationIndexOfLast,
                                sentNotifications.length
                              )} of {sentNotifications.length}
                            </div>
                            {totalNotificationPages > 1 && (
                              <div className="notifications-pagination-controls">
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
                                  &lt;
                                </button>
                                {[...Array(totalNotificationPages)].map(
                                  (_, index) => (
                                    <button
                                      key={index + 1}
                                      className={`notification-pagination-btn ${
                                        currentNotificationPage === index + 1
                                          ? "active"
                                          : ""
                                      }`}
                                      onClick={() =>
                                        setCurrentNotificationPage(index + 1)
                                      }
                                      aria-label={`Page ${index + 1}`}
                                    >
                                      {index + 1}
                                    </button>
                                  )
                                )}
                                <button
                                  className="notification-pagination-btn"
                                  onClick={() =>
                                    setCurrentNotificationPage((prev) =>
                                      Math.min(totalNotificationPages, prev + 1)
                                    )
                                  }
                                  disabled={
                                    currentNotificationPage >= totalNotificationPages
                                  }
                                  aria-label="Next page"
                                >
                                  &gt;
                                </button>
                              </div>
                            )}
                          </div>
                        );
                      })()}
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        <div className="table-section">
          <div className="student-table-container">
            <div className="table-header-with-tabs">
              <h2>Manage Students</h2>
              <div className="view-mode-tabs">
                <button
                  className={`view-mode-tab ${
                    viewMode === "all" ? "active" : ""
                  }`}
                  onClick={() => setViewMode("all")}
                >
                  All Students
                </button>
                <button
                  className={`view-mode-tab ${
                    viewMode === "pending" ? "active" : ""
                  }`}
                  onClick={() => setViewMode("pending")}
                >
                  Pending Requirements
                  {pendingStudentsWithRequirements.length > 0 && (
                    <span className="pending-badge">
                      {pendingStudentsWithRequirements.length}
                    </span>
                  )}
                </button>
              </div>
            </div>
            {viewMode === "pending" && (
              <div className="pending-requirements-info">
                <div className="pending-info-header">
                  <div className="pending-info-icon">
                    <IoTimeOutline />
                  </div>
                  <div className="pending-info-content">
                    <h3 className="pending-info-title">Pending Requirements Review</h3>
                    <p className="pending-info-description">
                      Students who have submitted requirements are waiting for approval. 
                      Review and approve their documents to help them proceed.
                    </p>
                  </div>
                </div>
                {pendingStudentsWithRequirements.length > 0 && (
                  <div className="pending-stats">
                    <div className="pending-stat-item">
                      <span className="stat-number">{pendingStudentsWithRequirements.length}</span>
                      <span className="stat-label">Students Pending</span>
                    </div>
                    <div className="pending-stat-divider"></div>
                    <div className="pending-stat-item" title="Total number of requirement files submitted by pending students">
                      <span className="stat-number">
                        {pendingStudentsWithRequirements.reduce((total, student) => {
                          const submitted = studentSubmittedRequirements[student.id] || [];
                          return total + submitted.length;
                        }, 0)}
                      </span>
                      <span className="stat-label">Files Submitted</span>
                    </div>
                    <div className="pending-stat-divider"></div>
                    <div className="pending-stat-item">
                      <span className="stat-number">
                        {Math.round(
                          (pendingStudentsWithRequirements.length / 
                           (students.length || 1)) * 100
                        )}%
                      </span>
                      <span className="stat-label">Of All Students</span>
                    </div>
                  </div>
                )}
                {pendingStudentsWithRequirements.length === 0 && !isLoadingPendingStudents && (
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
                      <span>Click on a student row to view and review their requirements</span>
                    </div>
                  </div>
                )}
              </div>
            )}
            {/* Filter Chips */}
            {activeFilterChips.length > 0 && (
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
                    {selectedItems.length} item{selectedItems.length !== 1 ? "s" : ""} selected
                  </span>
                </div>
                <div className="bulk-toolbar-actions">
                  <button
                    className="bulk-action-btn export-btn"
                    onClick={() => {
                      const selectedStudents = students.filter((s) =>
                        selectedItems.includes(s.id)
                      );
                      const exportData = prepareStudentsForExport(selectedStudents);
                      downloadCSV(exportData, `selected-students-${new Date().toISOString().split("T")[0]}.csv`);
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
                      aria-label={`Delete ${selectedItems.length} selected student${selectedItems.length !== 1 ? 's' : ''}`}
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
                    viewMode === "pending" ? pendingFilterValues : filterValues
                  }
                  type="student"
                  searchInputRef={searchInputRef}
                />
              </div>
              <ColumnToggle
                columns={columnDefinitions}
                visibleColumns={visibleColumns}
                onToggleColumn={handleToggleColumn}
              />
            </div>
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
                visibleColumns={visibleColumns}
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
          <div className="pagination-info">
            Showing {indexOfFirstItem + 1}-{Math.min(indexOfLastItem, sortedData.length)} of {sortedData.length}
          </div>
            <div className="table-actions">
              {!isAdviser && (
                <Tooltip content="Add a new student account manually">
                  <button
                    className="add-student-btn table-action-btn"
                    onClick={() => setShowAddStudentModal(true)}
                    title="Add new student account"
                  >
                    <IoPersonAddOutline style={{ marginRight: "0.5rem" }} />
                    Add Student Account
                  </button>
                </Tooltip>
              )}
              <input
                type="file"
                accept=".csv"
                ref={fileInputRef}
                onChange={handleImportStudents}
                style={{ display: "none" }}
                disabled={isImporting}
              />
              <Tooltip content="Import multiple students from CSV file (Ctrl+I)">
                <button
                  className="import-btn table-action-btn"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isImporting}
                  title="Import students from CSV"
                >
                  <IoCloudUploadOutline style={{ marginRight: "0.5rem" }} />
                  {isImporting
                    ? `Importing... (${importProgress.current}/${importProgress.total})`
                    : "Import CSV"}
                </button>
              </Tooltip>
              <Tooltip content="Export current student list to CSV file (Ctrl+E)">
                <button
                  className="export-btn table-action-btn"
                  onClick={() => {
                    try {
                      const exportData = prepareStudentsForExport(filteredData);
                      downloadCSV(
                        exportData,
                        `students_export_${
                          new Date().toISOString().split("T")[0]
                        }`
                      );
                      activityLoggers.exportData("students", exportData.length);
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
                  <IoDownloadOutline style={{ marginRight: "0.5rem" }} />
                  Export CSV
                </button>
              </Tooltip>
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
        confirmButtonText={`Yes, delete ${selectedItems.length} student${selectedItems.length !== 1 ? 's' : ''}`}
      />
      <ConfirmModal
        open={showDeleteNotificationConfirm}
        message="This notification will be permanently deleted. This action cannot be undone."
        onConfirm={confirmDeleteNotification}
        onCancel={cancelDeleteNotification}
        title="Delete Notification?"
        confirmButtonText="Yes, delete it"
      />
      <StudentRequirementModal
        open={showRequirementModal}
        student={selectedStudent}
        onClose={handleCloseRequirementModal}
      />
      <AddStudentModal
        isOpen={showAddStudentModal}
        onClose={() => setShowAddStudentModal(false)}
        onSubmit={handleCreateStudentAccount}
        isLoading={isCreatingStudent}
        defaultCollege={adminCollegeName}
      />
      <ToastContainer toasts={toasts} removeToast={removeToast} />
      <Footer />
    </div>
  );
};

export default StudentDashboard;
