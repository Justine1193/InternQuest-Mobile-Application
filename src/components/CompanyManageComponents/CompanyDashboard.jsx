/**
 * CompanyDashboard - Admin dashboard for managing companies
 * Fetches and displays company/student data, supports search, filter, selection, notification, and CRUD operations.
 *
 * @component
 * @example
 * <CompanyDashboard />
 */

import React, { useState, useRef, useEffect, useMemo } from "react";
import "./CompanyDashboard.css";
import "../DashboardPageHeader/DashboardPageHeader.css";
import Navbar from "../Navbar/Navbar.jsx";
import DashboardOverview from "../DashboardOverview/DashboardOverview.jsx";
import SearchBar from "../SearchBar/SearchBar.jsx";
import Table from "./Table/Table.jsx";
import CompanyModal from "./CompanyModal/CompanyModal.jsx";
import CompanyDetailModal from "./CompanyDetailModal/CompanyDetailModal.jsx";
import RenewMoaModal from "./RenewMoaModal/RenewMoaModal.jsx";
import ConfirmModal from "../ConfirmModalComponents/ConfirmModal.jsx";
import ConfirmAction from "../ConfirmAction/ConfirmAction.jsx";
import LoadingSpinner from "../LoadingSpinner.jsx";
import SkeletonLoader from "../SkeletonLoader/SkeletonLoader.jsx";
import ToastContainer from "../Toast/ToastContainer.jsx";
import { useToast } from "../../hooks/useToast.js";
import {
  useSuggestionSkills,
  useSuggestionFields,
  dashboardHandlers,
} from "../dashboardUtils.js";
import {
  getDocs,
  collection,
  onSnapshot,
  query,
  orderBy,
  addDoc,
  updateDoc,
  doc,
} from "firebase/firestore";
import { ref, update as updateRealtime } from "firebase/database";
import { auth, db, realtimeDb } from "../../../firebase.js";
import {
  downloadCSV,
  prepareCompaniesForExport,
} from "../../utils/exportUtils.js";
import {
  readCSVFile,
  parseCSV,
  convertCSVToCompanies,
} from "../../utils/importUtils.js";
import { activityLoggers } from "../../utils/activityLogger.js";
import {
  checkMoaExpiration,
  MOA_EXPIRING_SOON_DAYS,
} from "../../utils/moaUtils.js";
import {
  IoDownloadOutline,
  IoCloudUploadOutline,
  IoBusinessOutline,
  IoCheckmarkCircleOutline,
  IoWarningOutline,
  IoAlertCircleOutline,
  IoAddOutline,
  IoTrashOutline,
  IoCloseOutline,
} from "react-icons/io5";
import logger from "../../utils/logger.js";
import Footer from "../Footer/Footer.jsx";
import { getAdminRole, ROLES, isAdviserOnly, getAdminSession, hasAnyRole, getAdminCollegeCode } from "../../utils/auth.js";
import { loadColleges } from "../../utils/collegeUtils.js";

// --- Company Dashboard Main Component ---
const Dashboard = () => {
  const isAdviser = isAdviserOnly();
  // --- State declarations ---
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [companyToRenewMoa, setCompanyToRenewMoa] = useState(null);
  const [isRenewMoaModalOpen, setIsRenewMoaModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    companyName: "",
    description: "",
    website: "",
    field: "",
    address: "",
    email: "",
    skills: "",
    moa: true, // MOA is now required
    moaValidityYears: "",
    moaStartDate: "",
    moaFileUrl: "",
    moaFileName: "",
    moaStoragePath: "",
    modeOfWork: "",
    contactPersonName: "",
    contactPersonEmail: "",
    contactPersonPhone: "",
    endorsedByCollege: "",
  });
  const [skills, setSkills] = useState([]);
  const [fields, setFields] = useState([]);
  const [error, setError] = useState(null);
  const [selectedItems, setSelectedItems] = useState([]);
  const [isDeleting, setIsDeleting] = useState(false);
  const [allCompanies, setAllCompanies] = useState([]); // Raw companies from Firestore
  const [tableData, setTableData] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(8);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editCompanyId, setEditCompanyId] = useState(null);
  const [filterValues, setFilterValues] = useState({
    field: "",
    modeOfWork: "",
    moaExpirationStatus: "",
    endorsedByCollege: "",
    skills: "",
  });
  const [showConfirm, setShowConfirm] = useState(false);
  const [openMenuId, setOpenMenuId] = useState(null);
  const [selectionMode, setSelectionMode] = useState(false);
  const [overviewStats, setOverviewStats] = useState({
    totalCompanies: 0,
    totalStudents: 0,
    moaExpiringSoon: 0,
    moaExpired: 0,
    moaValid: 0,
  });
  const [selectedRowId, setSelectedRowId] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });
  const [isImporting, setIsImporting] = useState(false);
  const [importProgress, setImportProgress] = useState({
    current: 0,
    total: 0,
  });
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [showImportPreview, setShowImportPreview] = useState(false);
  const [previewCompanies, setPreviewCompanies] = useState([]);
  const [previewErrors, setPreviewErrors] = useState([]);
  const fileInputRef = useRef(null);
  const { toasts, removeToast, success, error: showError } = useToast();

  // Suggestions for skills and fields
  const suggestionSkills = useSuggestionSkills();
  const suggestionFields = useSuggestionFields();
  const [collegeOptions, setCollegeOptions] = useState([]);
  const [adminCollegeName, setAdminCollegeName] = useState(null);

  useEffect(() => {
    loadColleges()
      .then((colleges) => setCollegeOptions(colleges || []))
      .catch((err) => {
        logger.error("Error loading colleges for company form:", err);
        setCollegeOptions([]);
      });
  }, []);

  // Load admin's college name if they are coordinator/adviser
  useEffect(() => {
    const loadAdminCollege = async () => {
      const currentRole = getAdminRole();
      if (
        hasAnyRole([ROLES.COORDINATOR, ROLES.ADVISER]) &&
        !hasAnyRole([ROLES.SUPER_ADMIN])
      ) {
        const adminCollegeCode = getAdminCollegeCode();
        if (adminCollegeCode) {
          try {
            const colleges = await loadColleges();
            const college = colleges.find(
              (c) => c.college_code === adminCollegeCode
            );
            if (college) {
              setAdminCollegeName(college.college_name);
            } else {
              setAdminCollegeName(null);
            }
          } catch (error) {
            logger.error("Error loading admin college:", error);
            setAdminCollegeName(null);
          }
        } else {
          setAdminCollegeName(null);
        }
      } else {
        setAdminCollegeName(null);
      }
    };

    loadAdminCollege();
  }, []);

  // Filter companies based on role and college endorsement
  const filteredCompanies = useMemo(() => {
    const currentRole = getAdminRole();
    
    // Only admin can see all companies
    if (hasAnyRole([ROLES.SUPER_ADMIN])) {
      return allCompanies;
    }

    // Coordinators/advisers can only see companies endorsed by their college
    if (hasAnyRole([ROLES.COORDINATOR, ROLES.ADVISER])) {
      // If college name is not loaded yet, return empty array (will update when loaded)
      if (!adminCollegeName) {
        return [];
      }

      return allCompanies.filter((company) => {
        // Only show companies where endorsedByCollege matches admin's college
        if (!company.endorsedByCollege) {
          return false; // Hide companies without endorsement
        }
        // Compare case-insensitively
        return (
          company.endorsedByCollege.trim().toLowerCase() ===
          adminCollegeName.trim().toLowerCase()
        );
      });
    }

    // Other roles: hide all
    return [];
  }, [allCompanies, adminCollegeName]);

  // Update tableData and stats when filteredCompanies changes
  useEffect(() => {
    setTableData(filteredCompanies);

    // Recalculate stats based on filtered companies
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const filteredExpiringSoon = filteredCompanies.filter((company) => {
      if (company.moa === "Yes" && company.moaExpirationDate) {
        try {
          const expirationDate = new Date(company.moaExpirationDate);
          const expDate = new Date(expirationDate);
          expDate.setHours(0, 0, 0, 0);
          const daysUntilExpiration = Math.ceil(
            (expDate - today) / (1000 * 60 * 60 * 24),
          );
          return daysUntilExpiration > 0 && daysUntilExpiration <= MOA_EXPIRING_SOON_DAYS;
        } catch (e) {
          return false;
        }
      }
      return false;
    }).length;

    const filteredExpired = filteredCompanies.filter((company) => {
      if (company.moa === "Yes" && company.moaExpirationDate) {
        try {
          const expirationDate = new Date(company.moaExpirationDate);
          const expDate = new Date(expirationDate);
          expDate.setHours(0, 0, 0, 0);
          const daysUntilExpiration = Math.ceil(
            (expDate - today) / (1000 * 60 * 60 * 24),
          );
          return daysUntilExpiration < 0;
        } catch (e) {
          return false;
        }
      }
      return false;
    }).length;

    const filteredValid = filteredCompanies.filter((company) => {
      if (company.moa === "Yes" && company.moaExpirationDate) {
        try {
          const expirationDate = new Date(company.moaExpirationDate);
          const expDate = new Date(expirationDate);
          expDate.setHours(0, 0, 0, 0);
          const daysUntilExpiration = Math.ceil(
            (expDate - today) / (1000 * 60 * 60 * 24),
          );
          return daysUntilExpiration > MOA_EXPIRING_SOON_DAYS;
        } catch (e) {
          return false;
        }
      }
      return false;
    }).length;

    setOverviewStats((prev) => ({
      ...prev,
      totalCompanies: filteredCompanies.length,
      moaExpiringSoon: filteredExpiringSoon,
      moaExpired: filteredExpired,
      moaValid: filteredValid,
    }));
  }, [filteredCompanies]);

  // Clear all filters and search
  const handleClearAllFilters = () => {
    setSearchQuery("");
    setFilterValues({
      field: "",
      modeOfWork: "",
      moaExpirationStatus: "",
      endorsedByCollege: "",
      skills: "",
    });
    success("All filters cleared");
  };

  // Sorting function
  const handleSort = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  // Unique "Endorsed by College" values from current companies (for filter dropdown)
  const endorsedByCollegeOptions = React.useMemo(() => {
    if (!Array.isArray(tableData)) return [];
    const set = new Set();
    tableData.forEach((row) => {
      const v = row.endorsedByCollege;
      if (v && typeof v === "string" && v.trim()) set.add(v.trim());
    });
    return ["All", ...Array.from(set).sort((a, b) => a.localeCompare(b))];
  }, [tableData]);

  // Unique skills from current companies (skillsREq) for filter dropdown
  const skillsFilterOptions = React.useMemo(() => {
    if (!Array.isArray(tableData)) return [];
    const set = new Set();
    tableData.forEach((row) => {
      const skillsArr = row.skillsREq || row.skills;
      if (Array.isArray(skillsArr)) {
        skillsArr.forEach((s) => {
          if (s && typeof s === "string" && s.trim()) set.add(s.trim());
        });
      }
    });
    return ["All", ...Array.from(set).sort((a, b) => a.localeCompare(b))];
  }, [tableData]);

  // --- Filtering and Sorting logic for companies table ---
  const filteredData = Array.isArray(tableData)
    ? tableData.filter((row) => {
        const matchesSearch =
          row.companyName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (Array.isArray(row.fields) &&
            row.fields.some((f) =>
              f.toLowerCase().includes(searchQuery.toLowerCase()),
            )) ||
          row.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (row.address && row.address.toLowerCase().includes(searchQuery.toLowerCase())) ||
          (row.companyAddress && row.companyAddress.toLowerCase().includes(searchQuery.toLowerCase()));
        const matchesField = filterValues.field
          ? Array.isArray(row.fields) &&
            row.fields.some((f) =>
              f.toLowerCase().includes(filterValues.field.toLowerCase()),
            )
          : true;
        const matchesModeOfWork = filterValues.modeOfWork
          ? Array.isArray(row.modeOfWork)
            ? row.modeOfWork.includes(filterValues.modeOfWork)
            : row.modeOfWork === filterValues.modeOfWork
          : true;

        const matchesEndorsedByCollege = filterValues.endorsedByCollege
          ? (row.endorsedByCollege || "").trim().toLowerCase() ===
            filterValues.endorsedByCollege.trim().toLowerCase()
          : true;

        const matchesSkills = filterValues.skills
          ? (() => {
              const skillsArr = row.skillsREq || row.skills;
              if (!Array.isArray(skillsArr)) return false;
              const filterSkill = filterValues.skills.trim().toLowerCase();
              return skillsArr.some(
                (s) =>
                  s &&
                  (String(s).trim().toLowerCase() === filterSkill ||
                    String(s).trim().toLowerCase().includes(filterSkill))
              );
            })()
          : true;

        // MOA Expiration Status filter
        const matchesMoaExpiration = filterValues.moaExpirationStatus
          ? (() => {
              if (row.moa !== "Yes" || !row.moaExpirationDate) {
                return false;
              }
              try {
                const expirationDate = new Date(row.moaExpirationDate);
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                const expDate = new Date(expirationDate);
                expDate.setHours(0, 0, 0, 0);
                const daysUntilExpiration = Math.ceil(
                  (expDate - today) / (1000 * 60 * 60 * 24),
                );

                if (daysUntilExpiration < 0) {
                  return filterValues.moaExpirationStatus === "Expired";
                } else if (daysUntilExpiration <= MOA_EXPIRING_SOON_DAYS) {
                  return filterValues.moaExpirationStatus === "Expiring Soon";
                } else {
                  return filterValues.moaExpirationStatus === "Valid";
                }
              } catch (e) {
                return false;
              }
            })()
          : true;

        return (
          matchesSearch &&
          matchesField &&
          matchesModeOfWork &&
          matchesEndorsedByCollege &&
          matchesSkills &&
          matchesMoaExpiration
        );
      })
    : [];

  // Apply sorting
  const sortedData = [...filteredData].sort((a, b) => {
    if (!sortConfig.key) return 0;

    let aValue = a[sortConfig.key];
    let bValue = b[sortConfig.key];

    // Handle array fields (like fields, modeOfWork, skills)
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

  // Pagination calculation (after sortedData is defined)
  const totalPages = Math.ceil(sortedData.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = sortedData.slice(indexOfFirstItem, indexOfLastItem);

  // Real-time listener for companies and students
  useEffect(() => {
    setIsLoading(true);

    // Set up real-time listener for companies
    const companiesQuery = query(
      collection(db, "companies"),
      orderBy("companyName"),
    );
    const unsubscribeCompanies = onSnapshot(
      companiesQuery,
      async (snapshot) => {
        const companies = [];
        snapshot.forEach((doc) => {
          companies.push({ id: doc.id, ...doc.data() });
        });

        // Calculate MOA expiration statistics and update visibility for mobile app
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        let expiringSoon = 0;
        let expired = 0;
        let valid = 0;

        // Update companies with expired MOAs to hide them from mobile app
        const updatePromises = [];

        companies.forEach((company) => {
          if (company.moa === "Yes" && company.moaExpirationDate) {
            try {
              const expirationDate = new Date(company.moaExpirationDate);
              const expDate = new Date(expirationDate);
              expDate.setHours(0, 0, 0, 0);
              const daysUntilExpiration = Math.ceil(
                (expDate - today) / (1000 * 60 * 60 * 24),
              );

              if (daysUntilExpiration < 0) {
                expired++;
                // Hide from mobile app if MOA is expired
                if (company.isVisibleToMobile !== false) {
                  updatePromises.push(
                    updateDoc(doc(db, "companies", company.id), {
                      isVisibleToMobile: false,
                      moaStatus: "expired",
                    }),
                  );
                }
              } else if (daysUntilExpiration <= MOA_EXPIRING_SOON_DAYS) {
                expiringSoon++;
                // Keep visible but mark as expiring soon
                if (
                  company.isVisibleToMobile === false &&
                  company.moaStatus === "expired"
                ) {
                  // If MOA was renewed, make it visible again
                  updatePromises.push(
                    updateDoc(doc(db, "companies", company.id), {
                      isVisibleToMobile: true,
                      moaStatus: "expiring-soon",
                    }),
                  );
                } else if (company.moaStatus !== "expiring-soon") {
                  updatePromises.push(
                    updateDoc(doc(db, "companies", company.id), {
                      moaStatus: "expiring-soon",
                    }),
                  );
                }
              } else {
                valid++;
                // Ensure valid MOAs are visible
                if (company.isVisibleToMobile === false) {
                  updatePromises.push(
                    updateDoc(doc(db, "companies", company.id), {
                      isVisibleToMobile: true,
                      moaStatus: "valid",
                    }),
                  );
                } else if (company.moaStatus !== "valid") {
                  updatePromises.push(
                    updateDoc(doc(db, "companies", company.id), {
                      moaStatus: "valid",
                    }),
                  );
                }
              }
            } catch (e) {
              // Skip invalid dates
            }
          } else {
            // No MOA - hide from mobile
            if (company.isVisibleToMobile !== false) {
              updatePromises.push(
                updateDoc(doc(db, "companies", company.id), {
                  isVisibleToMobile: false,
                  moaStatus: "no-moa",
                }),
              );
            }
          }
        });

        // Execute all updates in parallel (fire and forget - don't wait)
        if (updatePromises.length > 0) {
          Promise.all(updatePromises).catch((err) => {
            logger.error("Error updating company visibility:", err);
          });
        }

        // Store raw companies - filtering will happen in useMemo
        setAllCompanies(companies);
        setIsLoading(false);
        logger.debug("Companies updated:", companies.length);
      },
      (err) => {
        logger.error("Error fetching companies:", err);
        setError("Failed to fetch companies. Please try again.");
        setIsLoading(false);
      },
    );

    // Set up real-time listener for students
    const studentsQuery = query(collection(db, "users"), orderBy("firstName"));
    const unsubscribeStudents = onSnapshot(
      studentsQuery,
      (snapshot) => {
        const students = [];
        snapshot.forEach((doc) => {
          students.push({ id: doc.id, ...doc.data() });
        });
        setOverviewStats((prev) => ({
          ...prev,
          totalStudents: students.length,
        }));
        logger.debug("Students updated:", students.length);
      },
      (err) => {
        logger.error("Error fetching students:", err);
        setError("Failed to fetch students. Please try again.");
      },
    );

    // Cleanup listeners on unmount
    return () => {
      unsubscribeCompanies();
      unsubscribeStudents();
    };
  }, []);

  // Exit selection mode if no items are selected
  useEffect(() => {
    if (selectionMode && selectedItems.length === 0) {
      setSelectionMode(false);
    }
  }, [selectedItems, selectionMode]);

  // Scroll to top when error occurs
  useEffect(() => {
    if (error) {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [error]);

  // Set document title on mount
  useEffect(() => {
    document.title = "Dashboard | InternQuest Admin";
  }, []);

  // Handle CSV import - preview step
  const handleImportCompanies = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      // Read CSV file
      const csvText = await readCSVFile(file);

      // Parse CSV
      const csvData = parseCSV(csvText);

      // Convert to company objects
      const { companies, errors } = convertCSVToCompanies(csvData);

      if (companies.length === 0) {
        showError("No valid companies found in CSV file");
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
        return;
      }

      if (!auth.currentUser) {
        showError("You must be signed in to import companies. Please sign in and try again.");
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
        return;
      }

      // Show preview modal
      setPreviewCompanies(companies);
      setPreviewErrors(errors);
      setShowImportPreview(true);
    } catch (err) {
      logger.error("Import preview error:", err);
      showError(
        err.message || "Failed to parse CSV file. Please check the format.",
      );
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  // Actual import execution after confirmation
  const executeImport = async () => {
    if (previewCompanies.length === 0) return;

    try {
      setIsImporting(true);
      setShowImportPreview(false);
      setImportProgress({ current: 0, total: previewCompanies.length });

      // Batch import companies
      let successCount = 0;
      let errorCount = 0;
      const importErrors = [];

      for (let i = 0; i < previewCompanies.length; i++) {
        try {
          const company = previewCompanies[i];

          // Compute MOA expiration from start date + validity years when provided
          let moaStartDate = company.moaStartDate || "";
          let moaExpirationDate = "";
          if (moaStartDate && (company.moaValidityYears || 1) > 0) {
            try {
              const start = new Date(moaStartDate);
              const exp = new Date(start);
              exp.setFullYear(exp.getFullYear() + (company.moaValidityYears || 1));
              moaExpirationDate = exp.toISOString();
            } catch (_) {}
          }

          // Get creator info
          const session = getAdminSession();
          const createdBy = session ? {
            username: session.username || "Unknown",
            role: session.role || "Unknown",
          } : null;

          // Map to Firestore format
          const newCompany = {
            companyName: company.companyName,
            companyDescription: company.description,
            companyWeb: company.companyWebsite,
            companyAddress: company.address,
            companyEmail: company.email,
            skillsREq: company.skills,
            moa: "Yes", // MOA is always required
            moaValidityYears: company.moaValidityYears || 1,
            moaFileUrl: company.moaFileUrl || "",
            moaFileName: company.moaFileName || "",
            modeOfWork: company.modeOfWork,
            fields: company.fields,
            endorsedByCollege: company.endorsedByCollege || "",
            contactPersonName: company.contactPersonName || "",
            contactPersonPhone: company.contactPersonPhone || "",
            createdAt: company.createdAt || new Date().toISOString(),
            updatedAt: company.updatedAt || new Date().toISOString(),
          };

          // Only include MOA dates if they have values (Firestore doesn't allow undefined)
          if (moaStartDate) {
            newCompany.moaStartDate = moaStartDate;
          }
          if (moaExpirationDate) {
            newCompany.moaExpirationDate = moaExpirationDate;
          }

          // Add createdBy if available
          if (createdBy) {
            newCompany.createdBy = createdBy;
          }

          const docRef = await addDoc(collection(db, "companies"), newCompany);

          // Sync to Realtime DB
          await updateRealtime(ref(realtimeDb, `companies/${docRef.id}`), {
            moa: "Yes",
            moaValidityYears: newCompany.moaValidityYears,
            companyName: newCompany.companyName,
            updatedAt: new Date().toISOString(),
          });

          // Log activity
          await activityLoggers.createCompany(
            docRef.id,
            newCompany.companyName,
          );

          successCount++;
        } catch (err) {
          errorCount++;
          const isPermissionError =
            err?.code === "permission-denied" ||
            (err?.message && String(err.message).toLowerCase().includes("permission"));
          const userMessage = isPermissionError
            ? "Permission denied. Please sign out, sign in again, and retry the import."
            : err.message;
          importErrors.push({
            company: previewCompanies[i].companyName,
            error: userMessage,
          });
          logger.error(
            `Failed to import company ${previewCompanies[i].companyName}:`,
            err,
          );
        }

        setImportProgress({ current: i + 1, total: previewCompanies.length });
      }

      // Show results
      if (successCount > 0) {
        success(`Successfully imported ${successCount} company/companies`);
        if (errorCount > 0) {
          showError(
            `${errorCount} company/companies failed to import. Check console for details.`,
          );
        }
        if (previewErrors.length > 0) {
          logger.warn(`CSV parsing errors:`, previewErrors);
        }
      } else {
        showError(
          "Failed to import any companies. Please check the CSV format.",
        );
      }

      // Reset file input and preview
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      setPreviewCompanies([]);
      setPreviewErrors([]);
    } catch (err) {
      logger.error("Import error:", err);
      showError(
        err.message || "Failed to import CSV file. Please check the format.",
      );
    } finally {
      setIsImporting(false);
      setImportProgress({ current: 0, total: 0 });
    }
  };

  // --- Render ---
  return (
    <div className="dashboard-container">
      <LoadingSpinner
        isLoading={isLoading}
        message="Loading dashboard data..."
      />
      <Navbar onLogout={() => setShowLogoutConfirm(true)} />
      <ConfirmAction
        isOpen={showLogoutConfirm}
        onClose={() => setShowLogoutConfirm(false)}
        onConfirm={async () => {
          setShowLogoutConfirm(false);
          try {
            await dashboardHandlers.handleLogout();
          } catch (error) {
            showError("Logout failed! Please try again.");
          }
        }}
        title="Confirm Logout"
        message="Are you sure you want to logout?"
        confirmText="Logout"
        cancelText="Cancel"
        type="warning"
      />
      <div className="dashboard-content">
        {/* Page Header (Archive Management style) */}
        <div className="dashboard-page-header">
          <div className="dashboard-header-content">
            <div className="dashboard-header-icon-wrapper dashboard-header-icon--blue" aria-hidden="true">
              <IoBusinessOutline className="dashboard-header-icon dashboard-header-icon--blue" />
            </div>
            <div>
              <h1>{isAdviser ? "View Companies" : "Manage Companies"}</h1>
              <p>
                {isAdviser
                  ? "View partner companies and their MOA status"
                  : "View and manage partner companies and their MOA status"}
              </p>
            </div>
          </div>
          <div className="dashboard-header-stats">
            <div className="dashboard-stat-card">
              <IoBusinessOutline className="dashboard-stat-icon" />
              <div className="dashboard-stat-content">
                <span className="dashboard-stat-value">{overviewStats.totalCompanies || 0}</span>
                <span className="dashboard-stat-label">Total Companies</span>
              </div>
            </div>
            <div className="dashboard-stat-card">
              <IoCheckmarkCircleOutline className="dashboard-stat-icon" />
              <div className="dashboard-stat-content">
                <span className="dashboard-stat-value">{overviewStats.moaValid || 0}</span>
                <span className="dashboard-stat-label">Active MOA</span>
              </div>
            </div>
            <div className="dashboard-stat-card">
              <IoWarningOutline className="dashboard-stat-icon" />
              <div className="dashboard-stat-content">
                <span className="dashboard-stat-value">{overviewStats.moaExpiringSoon || 0}</span>
                <span className="dashboard-stat-label">Expiring Soon</span>
              </div>
            </div>
            <div className="dashboard-stat-card">
              <IoAlertCircleOutline className="dashboard-stat-icon" />
              <div className="dashboard-stat-content">
                <span className="dashboard-stat-value">{overviewStats.moaExpired || 0}</span>
                <span className="dashboard-stat-label">Expired MOA</span>
              </div>
            </div>
          </div>
        </div>

        {/* Table Section */}
        <div className="table-section">
          {/* Alert Banners */}
          {overviewStats.moaExpired > 0 && (
            <div className="moa-alert-banner expired">
              <IoAlertCircleOutline className="alert-icon" />
              <div className="alert-content">
                <strong>
                  {overviewStats.moaExpired} expired MOA
                  {overviewStats.moaExpired !== 1 ? "s" : ""}
                </strong>
                <span>These companies need MOA renewal before use</span>
              </div>
            </div>
          )}
          {overviewStats.moaExpiringSoon > 0 &&
            overviewStats.moaExpired === 0 && (
              <div className="moa-alert-banner expiring">
                <IoWarningOutline className="alert-icon" />
                <div className="alert-content">
                  <strong>
                    {overviewStats.moaExpiringSoon} MOA
                    {overviewStats.moaExpiringSoon !== 1 ? "s" : ""} expiring
                    soon
                  </strong>
                  <span>Renew before expiration to avoid restrictions</span>
                </div>
              </div>
            )}

          {/* Search Bar */}
          <div className="search-filter-area">
            <SearchBar
              onSearch={setSearchQuery}
              onFilter={setFilterValues}
              filterValues={filterValues}
              type="company"
              endorsedByCollegeOptions={endorsedByCollegeOptions}
              skillsFilterOptions={skillsFilterOptions}
            />
          </div>

          {/* Table */}
          {isLoading && tableData.length === 0 ? (
            <SkeletonLoader type="table" rows={8} columns={9} />
          ) : (
            <Table
              data={currentItems}
              sortConfig={sortConfig}
              onSort={handleSort}
              onEdit={
                !isAdviser
                  ? (company) =>
                      dashboardHandlers.handleEdit(
                        company,
                        setFormData,
                        setSkills,
                        setIsEditMode,
                        setEditCompanyId,
                        setIsModalOpen,
                        setFields,
                      )
                  : undefined
              }
              onDelete={
                !isAdviser
                  ? (id) =>
                      dashboardHandlers.handleDeleteSingle(
                        id,
                        setIsDeleting,
                        setTableData,
                        setSelectedItems,
                        setError,
                      )
                  : undefined
              }
              selectedItems={selectedItems}
              onSelectItem={
                !isAdviser
                  ? (id) =>
                      dashboardHandlers.handleSelectItem(
                        id,
                        selectedItems,
                        setSelectedItems,
                      )
                  : undefined
              }
              onSelectAll={
                !isAdviser
                  ? (e) => {
                      if (e.target.checked) {
                        setSelectedItems(currentItems.map((item) => item.id));
                      } else {
                        setSelectedItems([]);
                      }
                    }
                  : undefined
              }
              selectionMode={!isAdviser && selectionMode}
              openMenuId={openMenuId}
              setOpenMenuId={setOpenMenuId}
              selectedRowId={selectedRowId}
              setSelectedRowId={setSelectedRowId}
              setIsEditMode={setIsEditMode}
              setEditCompanyId={setEditCompanyId}
              setFormData={setFormData}
              setSkills={setSkills}
              setIsModalOpen={setIsModalOpen}
              setSelectionMode={setSelectionMode}
              setSelectedItems={setSelectedItems}
              handleDeleteSingle={dashboardHandlers.handleDeleteSingle}
              isDeleting={isDeleting}
              onRowClick={(company) => {
                setSelectedCompany(company);
                setIsDetailModalOpen(true);
              }}
              onClearFilters={handleClearAllFilters}
              onAddCompany={!isAdviser ? () => setIsModalOpen(true) : undefined}
              isReadOnly={isAdviser}
            />
          )}

          {/* Pagination */}
          <div className="pagination">
            <button
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="pagination-arrow"
              aria-label="Previous page"
            >
              ‹
            </button>
            {[...Array(totalPages)].map((_, index) => (
              <button
                key={index + 1}
                onClick={() => setCurrentPage(index + 1)}
                className={`pagination-number ${currentPage === index + 1 ? "active" : ""}`}
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
              aria-label="Next page"
            >
              ›
            </button>
          </div>
          <div className="pagination-info-wrapper">
            <div className="pagination-info">
              Showing {indexOfFirstItem + 1}–
              {Math.min(indexOfLastItem, sortedData.length)} companies
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

          {/* Action Buttons */}
          {!isAdviser && (
            <div className="table-actions">
              {selectionMode && selectedItems.length > 0 && (
                <div className="selection-actions">
                  <span>{selectedItems.length} selected</span>
                  <button
                    className="delete table-action-btn"
                    onClick={() =>
                      dashboardHandlers.handleDelete(setShowConfirm)
                    }
                    disabled={isDeleting}
                  >
                    <IoTrashOutline />
                    {isDeleting ? "Deleting..." : "Delete"}
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
              <input
                type="file"
                accept=".csv"
                ref={fileInputRef}
                onChange={handleImportCompanies}
                style={{ display: "none" }}
                disabled={isImporting}
              />
              <button
                className="import-btn table-action-btn"
                onClick={() => fileInputRef.current?.click()}
                disabled={isImporting}
                title="Import companies from CSV"
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
                    const exportData = prepareCompaniesForExport(filteredData);
                    downloadCSV(
                      exportData,
                      `companies_export_${new Date().toISOString().split("T")[0]}`,
                    );
                    activityLoggers.exportData("companies", exportData.length);
                    success(
                      `Exported ${exportData.length} companies successfully`,
                    );
                  } catch (err) {
                    logger.error("Export error:", err);
                    showError("Failed to export data. Please try again.");
                  }
                }}
                title="Export companies to CSV"
              >
                <IoDownloadOutline />
                Export
              </button>
              <button
                className="add-entry table-action-btn"
                onClick={() => {
                  setIsEditMode(false);
                  setIsModalOpen(true);
                  setFormData({
                    companyName: "",
                    description: "",
                    website: "",
                    field: "",
                    address: "",
                    email: "",
                    skills: "",
                    moa: true,
                    moaValidityYears: "",
                    moaStartDate: "",
                    moaFileUrl: "",
                    moaFileName: "",
                    moaStoragePath: "",
                    modeOfWork: [],
                    contactPersonName: "",
                    contactPersonEmail: "",
                    contactPersonPhone: "",
                    endorsedByCollege: "",
                  });
                  setSkills([]);
                  setFields([]);
                }}
              >
                <IoAddOutline />
                Add Company
              </button>
            </div>
          )}
        </div>
      </div>
      {isModalOpen && (
        <CompanyModal
          open={isModalOpen}
          isEditMode={isEditMode}
          formData={formData}
          setFormData={setFormData}
          error={error}
          setError={setError}
          handleInputChange={dashboardHandlers.handleInputChange(
            formData,
            setFormData,
          )}
          handleModeOfWorkChange={dashboardHandlers.handleModeOfWorkChange(
            formData,
            setFormData,
          )}
          handleAddEntry={() =>
            dashboardHandlers.handleAddEntry(
              formData,
              fields,
              skills,
              setIsLoading,
              setTableData,
              setIsModalOpen,
              setFormData,
              setSkills,
              setFields,
              setError,
              (companyName) => success(`Company "${companyName}" added successfully.`),
            )
          }
          handleUpdateEntry={dashboardHandlers.handleUpdateEntry}
          setIsModalOpen={setIsModalOpen}
          setIsEditMode={setIsEditMode}
          setEditCompanyId={setEditCompanyId}
          setSkills={setSkills}
          setFields={setFields}
          skills={skills}
          fields={fields}
          isLoading={isLoading}
          suggestionSkills={suggestionSkills}
          suggestionFields={suggestionFields}
          suggestionColleges={collegeOptions}
          setTableData={setTableData}
          editCompanyId={editCompanyId}
          setIsLoading={setIsLoading}
        />
      )}
      <CompanyDetailModal
        open={isDetailModalOpen}
        company={selectedCompany}
        onClose={() => {
          setIsDetailModalOpen(false);
          setSelectedCompany(null);
        }}
        onRenewMoa={(company) => {
          setCompanyToRenewMoa(company);
          setIsRenewMoaModalOpen(true);
        }}
        onEdit={(company) => {
          dashboardHandlers.handleEdit(
            company,
            setFormData,
            setSkills,
            setIsEditMode,
            setEditCompanyId,
            setIsModalOpen,
            setFields,
          );
          setIsDetailModalOpen(false);
        }}
      />
      <RenewMoaModal
        open={isRenewMoaModalOpen}
        company={companyToRenewMoa}
        onClose={() => {
          setIsRenewMoaModalOpen(false);
          setCompanyToRenewMoa(null);
        }}
        isSubmitting={isLoading}
        onSubmit={async (payload) => {
          const company = companyToRenewMoa;
          if (!company || !company.id) return;

          try {
            setIsLoading(true);
            await updateDoc(doc(db, "companies", company.id), {
              moaStartDate: payload.startDate,
              moaExpirationDate: payload.expirationDate,
              moaValidityYears: payload.validityYears,
              moaFileUrl: payload.moaFileUrl,
              moaFileName: payload.moaFileName,
              moaStoragePath: payload.moaStoragePath,
              isVisibleToMobile: true,
              moaStatus: "valid",
              updatedAt: new Date().toISOString(),
            });

            await updateRealtime(ref(realtimeDb, `companies/${company.id}`), {
              updatedAt: new Date().toISOString(),
            });

            await activityLoggers.updateCompany(
              company.id,
              company.companyName,
              {
                moaStartDate: payload.startDate,
                moaExpirationDate: payload.expirationDate,
                moaValidityYears: payload.validityYears,
              },
            );

            const expDate = new Date(payload.expirationDate);
            success(
              `MOA renewed for ${company.companyName}. New expiration: ${expDate.toLocaleDateString()}`,
            );
            setIsRenewMoaModalOpen(false);
            setCompanyToRenewMoa(null);
            setIsDetailModalOpen(false);
            setSelectedCompany(null);
          } catch (err) {
            logger.error("Error renewing MOA:", err);
            showError("Failed to renew MOA. Please try again.");
          } finally {
            setIsLoading(false);
          }
        }}
      />
      <ConfirmModal
        open={showConfirm}
        message={`Are you sure you want to delete ${selectedItems.length} item(s)?`}
        onConfirm={async () => {
          const result = await dashboardHandlers.confirmDelete(
            selectedItems,
            setShowConfirm,
            setIsDeleting,
            setTableData,
            setSelectedItems,
            setError,
          );
          if (result) {
            activityLoggers.bulkDeleteCompanies(
              selectedItems.length,
              selectedItems,
            );
            success(
              `Successfully deleted ${selectedItems.length} company(ies)`,
            );
          } else {
            showError("Failed to delete companies. Please try again.");
          }
        }}
        onCancel={() => dashboardHandlers.cancelDelete(setShowConfirm)}
      />
      {/* CSV Import Preview Modal */}
      {showImportPreview && (
        <div className="import-preview-modal-backdrop" onClick={() => {
          setShowImportPreview(false);
          setPreviewCompanies([]);
          setPreviewErrors([]);
          if (fileInputRef.current) {
            fileInputRef.current.value = "";
          }
        }}>
          <div className="import-preview-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="import-preview-header">
              <h2>CSV Import Preview</h2>
              <p className="import-preview-subtitle">
                Review {previewCompanies.length} company/companies before importing
              </p>
              <button
                type="button"
                className="import-preview-close"
                onClick={() => {
                  setShowImportPreview(false);
                  setPreviewCompanies([]);
                  setPreviewErrors([]);
                  if (fileInputRef.current) {
                    fileInputRef.current.value = "";
                  }
                }}
                aria-label="Close"
              >
                <IoCloseOutline />
              </button>
            </div>
            {previewErrors.length > 0 && (
              <div className="import-preview-errors">
                <IoWarningOutline className="error-icon" />
                <div>
                  <strong>Parsing Warnings ({previewErrors.length}):</strong>
                  <ul>
                    {previewErrors.slice(0, 5).map((err, idx) => (
                      <li key={idx}>{err}</li>
                    ))}
                    {previewErrors.length > 5 && (
                      <li>... and {previewErrors.length - 5} more</li>
                    )}
                  </ul>
                </div>
              </div>
            )}
            <div className="import-preview-table-wrapper">
              <table className="import-preview-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Company Name</th>
                    <th>Description</th>
                    <th>Email</th>
                    <th>Website</th>
                    <th>Address</th>
                    <th>Fields</th>
                    <th>Skills</th>
                    <th>Mode of Work</th>
                    <th>Endorsed by College</th>
                    <th>Contact Person Name</th>
                    <th>Contact Number</th>
                    <th>MOA</th>
                    <th>MOA Validity Years</th>
                  </tr>
                </thead>
                <tbody>
                  {previewCompanies.map((company, index) => (
                    <tr key={index}>
                      <td>{index + 1}</td>
                      <td>{company.companyName || "N/A"}</td>
                      <td className="preview-description-cell" title={company.description || "N/A"}>
                        {company.description ? (company.description.length > 50 ? company.description.substring(0, 50) + "..." : company.description) : "N/A"}
                      </td>
                      <td>{company.email || "N/A"}</td>
                      <td>{company.companyWebsite || "N/A"}</td>
                      <td>{company.address || "N/A"}</td>
                      <td>{Array.isArray(company.fields) ? company.fields.join(", ") : (company.fields || "N/A")}</td>
                      <td>{Array.isArray(company.skills) ? company.skills.join(", ") : (company.skills || "N/A")}</td>
                      <td>{Array.isArray(company.modeOfWork) ? company.modeOfWork.join(", ") : (company.modeOfWork || "N/A")}</td>
                      <td>{company.endorsedByCollege || "N/A"}</td>
                      <td>{company.contactPersonName || "N/A"}</td>
                      <td>{company.contactPersonPhone || "N/A"}</td>
                      <td>{company.moa ? "Yes" : "No"}</td>
                      <td>{company.moaValidityYears || (company.moa ? "1 (default)" : "N/A")}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="import-preview-actions">
              <button
                type="button"
                className="import-preview-btn cancel"
                onClick={() => {
                  setShowImportPreview(false);
                  setPreviewCompanies([]);
                  setPreviewErrors([]);
                  if (fileInputRef.current) {
                    fileInputRef.current.value = "";
                  }
                }}
                disabled={isImporting}
              >
                Cancel
              </button>
              <button
                type="button"
                className="import-preview-btn confirm"
                onClick={executeImport}
                disabled={isImporting}
              >
                {isImporting ? (
                  <>
                    <span className="spinner"></span>
                    Importing... ({importProgress.current}/{importProgress.total})
                  </>
                ) : (
                  <>
                    <IoCheckmarkCircleOutline />
                    Confirm & Import ({previewCompanies.length})
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
      <ToastContainer toasts={toasts} removeToast={removeToast} />
      <Footer />
    </div>
  );
};

export default Dashboard;
