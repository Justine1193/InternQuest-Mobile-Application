/**
 * AdminManagement - Component for managing admin accounts
 * Admin can create Coordinator and Adviser accounts
 * Coordinator can create Adviser accounts
 *
 * @component
 * @example
 * <AdminManagement />
 */

import React, { useState, useEffect } from "react";
import { IoTrashOutline, IoPencilOutline } from "react-icons/io5";
import {
  collection,
  addDoc,
  getDocs,
  query,
  where,
  doc,
  getDoc,
  deleteDoc,
  updateDoc,
} from "firebase/firestore";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { db, auth } from "../../../firebase";
import {
  getAdminRole,
  canCreateCoordinator,
  canCreateAccounts,
  getAdminCollegeCode,
  ROLES,
} from "../../utils/auth";
import {
  loadColleges,
  loadProgramToCollegeMap,
} from "../../utils/collegeUtils";
import Navbar from "../Navbar/Navbar.jsx";
import { FaRegEye, FaRegEyeSlash } from "react-icons/fa";
import { signOut } from "firebase/auth";
import { clearAdminSession } from "../../utils/auth";
import { useNavigate } from "react-router-dom";
import "./AdminManagement.css";
import LoadingSpinner from "../LoadingSpinner.jsx";
import ConfirmModal from "../ConfirmModalComponents/ConfirmModal.jsx";
import EmptyState from "../EmptyState/EmptyState.jsx";
import { IoShieldCheckmarkOutline } from "react-icons/io5";

// Format role name for display (normalizes legacy 'super_admin' to 'admin')
const getRoleDisplayName = (role) => {
  if (!role) return "";
  // Normalize legacy 'super_admin' to 'admin' for display
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
      return normalizedRole || "";
  }
};

const AdminManagement = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    username: "",
    password: "",
    email: "",
    role: "adviser", // Default to adviser
    sections: [], // Array to store multiple sections
    college_code: "", // College code for coordinators
  });
  const [currentSection, setCurrentSection] = useState({
    sectionYear: "",
    sectionProgram: "",
    sectionNumber: "",
  });
  const [programOptions, setProgramOptions] = useState([]);
  const [programCodeOptions, setProgramCodeOptions] = useState([]);
  const [programCodesByCollege, setProgramCodesByCollege] = useState({}); // Map college name to program codes
  const [programToCollegeMap, setProgramToCollegeMap] = useState({}); // Map program code to college code
  const [sectionOptions, setSectionOptions] = useState([]);
  const [collegeOptions, setCollegeOptions] = useState([]);
  const [showProgramCodeSuggestions, setShowProgramCodeSuggestions] =
    useState(false);
  const [filteredProgramCodes, setFilteredProgramCodes] = useState([]);
  const [sectionProgramError, setSectionProgramError] = useState("");
  const [showRoleSuggestions, setShowRoleSuggestions] = useState(false);
  const [showProgramSuggestions, setShowProgramSuggestions] = useState(false);
  const [filteredPrograms, setFilteredPrograms] = useState([]);
  const [admins, setAdmins] = useState([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingAdmin, setEditingAdmin] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [pendingDeleteAdmin, setPendingDeleteAdmin] = useState(null);
  const [currentAdminSections, setCurrentAdminSections] = useState([]);
  // Search and filter state
  const [searchQuery, setSearchQuery] = useState("");
  const [filterRole, setFilterRole] = useState("");
  const [filterCollege, setFilterCollege] = useState("");
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const currentRole = getAdminRole();
  const canCreateCoord = canCreateCoordinator();
  const canCreate = canCreateAccounts();
  const isCoordinator = currentRole === "coordinator";
  const adminCollegeCode = getAdminCollegeCode();
  const [showPassword, setShowPassword] = useState(false);

  // Load program-to-college mapping for coordinators
  useEffect(() => {
    if (isCoordinator && adminCollegeCode) {
      loadProgramToCollegeMap()
        .then((map) => {
          setProgramToCollegeMap(map);
        })
        .catch((err) => {
          console.error("Error loading program-to-college map:", err);
        });
    }
  }, [isCoordinator, adminCollegeCode]);

  useEffect(() => {
    document.title = "Admin Management | InternQuest Admin";
    if (!canCreate) {
      navigate("/dashboard", { replace: true });
    }
    loadAdmins();
    loadPrograms();
    loadProgramCodes();
    loadSections();
    loadCollegesData();
    loadCurrentAdminProfile();
  }, [
    canCreate,
    navigate,
    isCoordinator,
    adminCollegeCode,
    programToCollegeMap,
  ]);

  // Load current admin's profile to get their sections (for coordinators)
  const loadCurrentAdminProfile = async () => {
    if (!isCoordinator || !auth.currentUser) {
      return { sections: [] };
    }

    try {
      // Find the current admin's document by email
      const adminsRef = collection(db, "adminusers");
      const emailQuery = query(
        adminsRef,
        where("firebaseEmail", "==", auth.currentUser.email)
      );
      const emailSnapshot = await getDocs(emailQuery);

      if (!emailSnapshot.empty) {
        const adminDoc = emailSnapshot.docs[0];
        const adminData = adminDoc.data();
        // Check if coordinator also has sections (coordinator who is also an adviser)
        const sections =
          adminData.sections &&
          Array.isArray(adminData.sections) &&
          adminData.sections.length > 0
            ? adminData.sections
            : adminData.section
            ? [adminData.section]
            : [];

        if (sections.length > 0) {
          setCurrentAdminSections(sections);
        }

        return { sections };
      }
      return { sections: [] };
    } catch (err) {
      console.error("Error loading current admin profile:", err);
      return { sections: [] };
    }
  };

  // Scroll to top when error occurs
  useEffect(() => {
    if (error) {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [error]);

  // Auto-fill sections when coordinator's profile is loaded and modal is open
  useEffect(() => {
    if (showCreateModal && isCoordinator && formData.role === "adviser") {
      if (currentAdminSections.length > 0 && formData.sections.length === 0) {
        setFormData((prev) => ({
          ...prev,
          sections: [...currentAdminSections],
        }));
      }
    }
  }, [
    showCreateModal,
    currentAdminSections,
    isCoordinator,
    formData.role,
    formData.sections,
  ]);

  // Helper function to extract program code from section string (e.g., "4BSIT-2" -> "BSIT")
  const extractProgramCodeFromSection = (section) => {
    if (!section || typeof section !== "string") return null;
    // Section format: "4BSIT-2" or "2024BSIT-A"
    // Extract the program code part (letters between year and dash/number)
    const match = section.match(/^\d+([A-Z]+)/);
    if (match && match[1]) {
      return match[1].toUpperCase();
    }
    // Fallback: try to find program code pattern
    const programMatch = section.match(/([A-Z]{2,})/);
    if (programMatch && programMatch[1]) {
      return programMatch[1].toUpperCase();
    }
    return null;
  };

  const loadAdmins = async () => {
    try {
      const adminsRef = collection(db, "adminusers");
      const querySnapshot = await getDocs(adminsRef);
      let adminsList = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      // Only admin can see admin/coordinator accounts
      // Coordinators and advisers should NOT see admin/coordinator accounts
      if (currentRole !== "admin" && currentRole !== "super_admin") {
        // Filter out admin and coordinator accounts (support legacy super_admin during migration)
        adminsList = adminsList.filter((admin) => {
          // Hide admin and coordinator accounts
          if (
            admin.role === "admin" ||
            admin.role === "super_admin" ||
            admin.role === "coordinator"
          ) {
            return false;
          }

          // Only show advisers from their college (for coordinators)
          if (isCoordinator && adminCollegeCode && admin.role === "adviser") {
            // 1) Prefer explicit creator college (for newly created accounts)
            if (
              admin.createdByCollegeCode &&
              admin.createdByCollegeCode === adminCollegeCode
            ) {
              return true;
            }

            // 2) Fallback: check if their sections contain programs from coordinator's college
            // If we don't have program-to-college mapping yet, don't try to infer; show adviser
            if (
              !programToCollegeMap ||
              Object.keys(programToCollegeMap).length === 0
            ) {
              return true;
            }

            const adminSections =
              admin.sections || (admin.section ? [admin.section] : []);
            if (adminSections.length === 0) {
              // No sections: we already handled createdByCollegeCode above.
              // Without sections, we can't infer college; safest is to hide.
              return false;
            }

            // Check if any section's program belongs to coordinator's college
            for (const section of adminSections) {
              const programCode = extractProgramCodeFromSection(section);
              if (programCode) {
                const programCollegeCode = programToCollegeMap[programCode];
                if (programCollegeCode === adminCollegeCode) {
                  return true; // Found a matching program
                }
              }
            }
            return false; // No matching programs found
          }

          // For advisers, they shouldn't see any other accounts
          if (currentRole === "adviser") {
            return false;
          }

          return true;
        });
      }

      setAdmins(adminsList);
    } catch (err) {
      console.error("Error loading admins:", err);
    }
  };

  const handleDeleteAdmin = (admin) => {
    if (!admin || !admin.id) return;
    if (admin.role === "admin" || admin.role === "super_admin") {
      setError("Cannot delete admin accounts.");
      return;
    }

    setPendingDeleteAdmin(admin);
    setShowDeleteModal(true);
  };

  const confirmDeleteAdmin = async () => {
    if (!pendingDeleteAdmin) return;
    const admin = pendingDeleteAdmin;
    setError("");
    setSuccess("");
    setDeletingId(admin.id);
    try {
      // Delete Firestore document
      await deleteDoc(doc(db, "adminusers", admin.id));
      await addDoc(collection(db, "admin_deletions"), {
        deletedAdminId: admin.id,
        deletedUsername: admin.username || "",
        deletedEmail: admin.email || "",
        deletedRole: admin.role || "",
        deletedProgram: admin.program || "",
        deletedAt: new Date().toISOString(),
        deletedByRole: currentRole,
      });
      setSuccess(`Deleted admin: ${admin.username}`);
      loadAdmins();
    } catch (err) {
      console.error("Error deleting admin:", err);
      setError(`Failed to delete admin: ${err.message}`);
    } finally {
      setDeletingId(null);
      setShowDeleteModal(false);
      setPendingDeleteAdmin(null);
    }
  };

  const cancelDeleteAdmin = () => {
    setShowDeleteModal(false);
    setPendingDeleteAdmin(null);
  };

  // Handle edit admin
  const handleEditAdmin = (admin) => {
    editAdminAction(admin);
  };

  const editAdminAction = (admin) => {
    // Parse sections from admin data
    const sections = admin.sections || (admin.section ? [admin.section] : []);

    // Parse first section to populate currentSection
    let parsedSection = {
      sectionYear: "",
      sectionProgram: "",
      sectionNumber: "",
    };

    if (sections.length > 0) {
      const firstSection = sections[0];
      // Parse section format: [Year][ProgramCode]-[SectionNumber]
      const match = firstSection.match(/^(\d+)([A-Z]+)-([A-Z0-9]+)$/i);
      if (match) {
        parsedSection = {
          sectionYear: match[1],
          sectionProgram: match[2].toUpperCase(),
          sectionNumber: match[3].toUpperCase(),
        };
      }
    }

    setFormData({
      name: admin.name || "",
      username: admin.username || "",
      password: "", // Password not stored in Firestore - managed via Firebase Auth
      email: admin.email || admin.firebaseEmail || "",
      role: admin.role || "adviser",
      sections: sections,
      college_code: admin.college_code || "",
    });
    setCurrentSection(parsedSection);
    setEditingAdmin(admin);
    setShowCreateModal(true);

    // Initialize filtered program codes based on college (if editing)
    if (admin.college_code) {
      const availableCodes = getAvailableProgramCodes(admin.college_code);
      setFilteredProgramCodes(availableCodes);
    } else {
      // If no college, show all program codes
      setFilteredProgramCodes(programCodeOptions);
    }
  };

  // Handle cancel edit/create
  const handleCancelModal = () => {
    setShowCreateModal(false);
    setEditingAdmin(null);
    setFormData({
      name: "",
      username: "",
      password: "",
      email: "",
      role: "adviser",
      sections: [],
      college_code: "",
    });
    setCurrentSection({
      sectionYear: "",
      sectionProgram: "",
      sectionNumber: "",
    });
    setShowPassword(false);
    setError("");
    setSuccess("");
  };

  const loadPrograms = async () => {
    try {
      // Load programs from meta/programs document
      const metaDocRef = doc(db, "meta", "programs");
      const metaSnap = await getDoc(metaDocRef);
      if (!metaSnap.exists()) {
        setProgramOptions([]);
        return;
      }
      const data = metaSnap.data();
      let allPrograms = [];

      // Check if data is organized by college (college names as keys, arrays as values)
      const isCollegeOrganized = Object.keys(data).some((key) => {
        const value = data[key];
        return (
          Array.isArray(value) &&
          value.length > 0 &&
          typeof value[0] === "string"
        );
      });

      if (isCollegeOrganized) {
        // Structure: { "College Name": ["Program 1", "Program 2", ...] }
        Object.keys(data).forEach((collegeName) => {
          const programs = data[collegeName];
          if (Array.isArray(programs)) {
            const processedPrograms = programs
              .filter((p) => typeof p === "string" && p.trim().length > 0)
              .map((p) => p.trim());
            allPrograms = allPrograms.concat(processedPrograms);
          }
        });
      } else if (Array.isArray(data.list)) {
        // Fallback: flat array structure
        allPrograms = data.list
          .filter((p) => typeof p === "string" && p.trim().length > 0)
          .map((p) => p.trim());
      } else {
        // Fallback: use all field values
        allPrograms = Object.values(data || {})
          .filter((p) => typeof p === "string" && p.trim().length > 0)
          .map((p) => p.trim());
      }

      // Remove duplicates and sort
      allPrograms = [...new Set(allPrograms)].sort((a, b) =>
        a.localeCompare(b)
      );

      setProgramOptions(allPrograms);
    } catch (err) {
      console.error("Error loading programs:", err);
      setProgramOptions([]);
    }
  };

  const loadProgramCodes = async () => {
    try {
      // Load program codes from meta/program_code document
      const programCodeDocRef = doc(db, "meta", "program_code");
      const programCodeSnap = await getDoc(programCodeDocRef);
      if (programCodeSnap.exists()) {
        const codeData = programCodeSnap.data();
        const codesByCollege = {};
        let allProgramCodes = [];

        // Check if data is organized by college (college names as keys, arrays as values)
        const isCollegeOrganized = Object.keys(codeData).some((key) => {
          const value = codeData[key];
          return (
            Array.isArray(value) &&
            value.length > 0 &&
            typeof value[0] === "string"
          );
        });

        if (isCollegeOrganized) {
          // Structure: { "College Name": ["BSIT", "BSCS", ...] }
          Object.keys(codeData).forEach((collegeName) => {
            const codes = codeData[collegeName];
            if (Array.isArray(codes)) {
              const processedCodes = codes
                .filter((c) => typeof c === "string" && c.trim().length > 0)
                .map((c) => c.trim().toUpperCase())
                .sort((a, b) => a.localeCompare(b));

              codesByCollege[collegeName] = processedCodes;
              allProgramCodes = allProgramCodes.concat(processedCodes);
            }
          });
        } else if (Array.isArray(codeData.list)) {
          // Fallback: flat array structure
          allProgramCodes = codeData.list
            .filter((c) => typeof c === "string" && c.trim().length > 0)
            .map((c) => c.trim().toUpperCase())
            .sort((a, b) => a.localeCompare(b));
        } else {
          // Fallback: use all field values
          allProgramCodes = Object.values(codeData || {})
            .filter((c) => typeof c === "string" && c.trim().length > 0)
            .map((c) => c.trim().toUpperCase())
            .sort((a, b) => a.localeCompare(b));
        }

        setProgramCodesByCollege(codesByCollege);
        setProgramCodeOptions([...new Set(allProgramCodes)].sort());
      } else {
        // Fallback: try to extract codes from programs list
        const programsList = programOptions.map((p) => {
          // Try to extract code from program name
          const words = p.split(" ");
          const code = words
            .map((w) => w[0])
            .join("")
            .toUpperCase();
          return code;
        });
        setProgramCodeOptions([...new Set(programsList)].sort());
      }
    } catch (err) {
      console.error("Error loading program codes:", err);
      setProgramCodeOptions([]);
      setProgramCodesByCollege({});
    }
  };

  const loadSections = async () => {
    try {
      // Load sections from existing students
      const usersRef = collection(db, "users");
      const usersSnapshot = await getDocs(usersRef);
      const sectionsSet = new Set();

      usersSnapshot.docs.forEach((doc) => {
        const data = doc.data();
        if (
          data.section &&
          typeof data.section === "string" &&
          data.section.trim().length > 0
        ) {
          sectionsSet.add(data.section.trim());
        }
      });

      const sections = Array.from(sectionsSet).sort((a, b) =>
        a.localeCompare(b)
      );
      setSectionOptions(sections);
    } catch (err) {
      console.error("Error loading sections:", err);
      setSectionOptions([]);
    }
  };

  const loadCollegesData = async () => {
    try {
      const colleges = await loadColleges();
      setCollegeOptions(colleges);
    } catch (err) {
      console.error("Error loading colleges:", err);
      setCollegeOptions([]);
    }
  };

  // Get available program codes based on selected college
  const getAvailableProgramCodes = (collegeCode = null) => {
    // Use provided collegeCode or fall back to formData.college_code
    const selectedCollegeCode = collegeCode || formData.college_code;

    // If a college is selected and we have program codes organized by college
    if (selectedCollegeCode && Object.keys(programCodesByCollege).length > 0) {
      // Find the college name that matches the selected college_code
      const selectedCollege = collegeOptions.find(
        (college) => college.college_code === selectedCollegeCode
      );

      if (selectedCollege) {
        const collegeName = selectedCollege.college_name;

        // Normalize function to handle common variations
        const normalizeCollegeName = (name) => {
          return name
            .toLowerCase()
            .trim()
            .replace(/&/g, "and") // Replace & with "and"
            .replace(/\s+/g, " "); // Normalize whitespace
        };

        // Try exact match first
        if (programCodesByCollege[collegeName]) {
          return programCodesByCollege[collegeName];
        }

        // Try case-insensitive match
        const matchingKey = Object.keys(programCodesByCollege).find(
          (key) => key.toLowerCase().trim() === collegeName.toLowerCase().trim()
        );
        if (matchingKey) {
          return programCodesByCollege[matchingKey];
        }

        // Try normalized match (handles "and" vs "&" variations)
        const normalizedCollegeName = normalizeCollegeName(collegeName);
        const normalizedMatch = Object.keys(programCodesByCollege).find(
          (key) => {
            const normalizedKey = normalizeCollegeName(key);
            return normalizedKey === normalizedCollegeName;
          }
        );
        if (normalizedMatch) {
          return programCodesByCollege[normalizedMatch];
        }

        // Try partial match (in case of slight variations in naming)
        const partialMatch = Object.keys(programCodesByCollege).find((key) => {
          const keyLower = normalizeCollegeName(key);
          const nameLower = normalizedCollegeName;
          // Check if one contains the other (for variations like "College of..." vs just the name)
          return keyLower.includes(nameLower) || nameLower.includes(keyLower);
        });
        if (partialMatch) {
          return programCodesByCollege[partialMatch];
        }

        // Debug: log available keys for troubleshooting (only in development)
        if (process.env.NODE_ENV === "development") {
          console.log(
            "Available college keys in programCodesByCollege:",
            Object.keys(programCodesByCollege)
          );
          console.log("Looking for college:", collegeName);
          console.log("Selected college code:", selectedCollegeCode);
          console.log("Selected college object:", selectedCollege);
        }
      }

      // Fallback: try to match by college_code directly (if college name is the code)
      if (programCodesByCollege[selectedCollegeCode]) {
        return programCodesByCollege[selectedCollegeCode];
      }

      // Try case-insensitive match by college_code
      const matchingKeyByCode = Object.keys(programCodesByCollege).find(
        (key) =>
          key.toLowerCase().trim() === selectedCollegeCode.toLowerCase().trim()
      );
      if (matchingKeyByCode) {
        return programCodesByCollege[matchingKeyByCode];
      }
    }

    // If no college selected or no match found, return empty array instead of all codes
    // This ensures that if a college is selected but no match is found,
    // the user knows something is wrong rather than seeing all codes
    if (selectedCollegeCode) {
      // College is selected but no match found - return empty to indicate issue
      if (process.env.NODE_ENV === "development") {
        console.warn(
          "No program codes found for college:",
          selectedCollegeCode
        );
      }
      return [];
    }

    // If no college selected, return all program codes
    return programCodeOptions;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    // Handle section inputs separately (except sectionProgram which needs college filtering)
    if (name === "sectionYear" || name === "sectionNumber") {
      // Validate Year field - max value is 5
      if (name === "sectionYear") {
        const numValue = parseInt(value, 10);
        if (value !== "" && (isNaN(numValue) || numValue < 1 || numValue > 5)) {
          return; // Don't update if invalid
        }
        setCurrentSection((prev) => ({
          ...prev,
          [name]: value,
        }));
        return;
      }

      // Make sectionNumber uppercase
      if (name === "sectionNumber") {
        const upperValue = value.toUpperCase();
        setCurrentSection((prev) => ({
          ...prev,
          [name]: upperValue,
        }));
        return;
      }
    }

    // Handle program code autocomplete (needs to access formData.college_code)
    if (name === "sectionProgram") {
      const upperValue = value.toUpperCase().trim();
      // Update currentSection with uppercase immediately
      setCurrentSection((prev) => ({
        ...prev,
        sectionProgram: upperValue,
      }));

      // Clear error when user starts typing
      if (sectionProgramError) {
        setSectionProgramError("");
      }

      // Get available program codes based on selected college
      const availableCodes = getAvailableProgramCodes();

      if (upperValue.length > 0) {
        const searchUpper = upperValue;

        // Filter and sort by relevance (same logic as program field)
        const filtered = availableCodes
          .map((code) => {
            const codeUpper = code.toUpperCase();
            let score = 0;
            let matched = false;

            // Exact match gets highest priority (score 0)
            if (codeUpper === searchUpper) {
              score = 0;
              matched = true;
            }
            // Starts with gets second priority (score 1)
            else if (codeUpper.startsWith(searchUpper)) {
              score = 1;
              matched = true;
            }
            // Contains gets third priority (score 2)
            else if (codeUpper.includes(searchUpper)) {
              score = 2;
              matched = true;
            }

            return matched ? { code, score, length: code.length } : null;
          })
          .filter((item) => item !== null)
          .sort((a, b) => {
            // First sort by score (lower is better)
            if (a.score !== b.score) {
              return a.score - b.score;
            }
            // If same score and both start with, shorter codes first
            if (a.score === 1 && b.score === 1) {
              return a.length - b.length;
            }
            // Otherwise, sort alphabetically
            return a.code.localeCompare(b.code);
          })
          .map((item) => item.code);

        setFilteredProgramCodes(filtered);
        setShowProgramCodeSuggestions(true);
      } else {
        // When empty, show all available options (filtered by college if selected)
        setFilteredProgramCodes(availableCodes);
        setShowProgramCodeSuggestions(true);
      }
      return; // Return early after handling sectionProgram
    }

    // When college changes, reset program code and update available options
    if (name === "college_code") {
      // Update formData first
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));

      // Clear the current section program code when college changes
      setCurrentSection((prev) => ({
        ...prev,
        sectionProgram: "",
      }));
      setSectionProgramError("");
      setShowProgramCodeSuggestions(false);

      // Update filtered program codes based on new college selection
      // Pass the new value directly since formData hasn't updated yet
      const availableCodes = getAvailableProgramCodes(value);
      setFilteredProgramCodes(availableCodes);

      setError("");
      setSuccess("");
      return;
    }

    // Update formData for other fields
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setError("");
    setSuccess("");

    // Handle role autocomplete
    if (name === "role") {
      const roleOptions = canCreateCoord
        ? ["OJT Adviser", "OJT Coordinator"]
        : ["OJT Adviser"];
      if (value.trim().length > 0) {
        const filtered = roleOptions.filter((role) =>
          role.toLowerCase().includes(value.toLowerCase())
        );
        if (filtered.length > 0) {
          setShowRoleSuggestions(true);
        }
      } else {
        setShowRoleSuggestions(true);
      }
    }

    // Handle program autocomplete
    if (name === "program") {
      const searchValue = value.trim();
      if (searchValue.length > 0) {
        const searchLower = searchValue.toLowerCase();
        const searchUpper = searchValue.toUpperCase();

        // Filter programs by name or by program code
        const filtered = programOptions
          .map((p) => {
            const pLower = p.toLowerCase();
            let score = 0;
            let matched = false;

            // First, check if it matches program name
            if (pLower === searchLower) {
              score = 0; // Exact program name match
              matched = true;
            } else if (pLower.startsWith(searchLower)) {
              score = 1; // Program name starts with
              matched = true;
            } else if (pLower.includes(searchLower)) {
              score = 2; // Program name contains
              matched = true;
            }

            // Also check if search value matches a program code
            // Extract code from program name (first letter of each word)
            const words = p.split(" ").filter((w) => w.length > 0);
            const extractedCode = words
              .map((w) => w[0])
              .join("")
              .toUpperCase();

            // Check if typed value matches the extracted code
            if (!matched) {
              if (extractedCode === searchUpper) {
                score = 1; // Exact code match - highest priority for codes
                matched = true;
              } else if (extractedCode.startsWith(searchUpper)) {
                score = 2; // Code starts with
                matched = true;
              } else if (extractedCode.includes(searchUpper)) {
                score = 3; // Code contains
                matched = true;
              }
            }

            // Also check if the typed value is in the programCodeOptions list
            // and matches the extracted code
            if (!matched && programCodeOptions.includes(searchUpper)) {
              if (extractedCode === searchUpper) {
                score = 1;
                matched = true;
              }
            }

            return matched ? { program: p, score } : null;
          })
          .filter((item) => item !== null)
          .sort((a, b) => {
            // Sort by score (lower is better)
            if (a.score !== b.score) {
              return a.score - b.score;
            }
            // If same score, sort alphabetically
            return a.program.localeCompare(b.program);
          })
          .map((item) => item.program);

        setFilteredPrograms(filtered);
        setShowProgramSuggestions(true);
      } else {
        setFilteredPrograms(programOptions);
        setShowProgramSuggestions(true);
      }
    }
  };

  const handleProgramCodeSelect = (code) => {
    setCurrentSection((prev) => ({
      ...prev,
      sectionProgram: code,
    }));
    setShowProgramCodeSuggestions(false);
    setFilteredProgramCodes([]);
    // Clear error when selecting from dropdown
    setSectionProgramError("");
  };

  const handleProgramCodeBlur = () => {
    // Delay hiding suggestions to allow click events
    setTimeout(() => {
      setShowProgramCodeSuggestions(false);

      // Validate program code when field loses focus
      if (
        currentSection.sectionProgram &&
        currentSection.sectionProgram.trim().length > 0
      ) {
        const enteredCode = currentSection.sectionProgram.toUpperCase().trim();
        const availableCodes = getAvailableProgramCodes();
        const codeExists = availableCodes.some(
          (code) => code.toUpperCase() === enteredCode
        );
        if (!codeExists) {
          setSectionProgramError(
            "Program code not found. Please select from the dropdown."
          );
        } else {
          setSectionProgramError("");
        }
      } else {
        setSectionProgramError("");
      }
    }, 200);
  };

  const handleAddSection = () => {
    // Validate current section inputs
    if (
      !currentSection.sectionYear ||
      !currentSection.sectionProgram ||
      !currentSection.sectionNumber
    ) {
      setSectionProgramError("Please fill in all section fields.");
      return;
    }

    // Validate program code exists in available codes (filtered by college)
    const enteredCode = currentSection.sectionProgram.toUpperCase().trim();
    const availableCodes = getAvailableProgramCodes();
    const codeExists = availableCodes.some(
      (code) => code.toUpperCase() === enteredCode
    );
    if (!codeExists) {
      setSectionProgramError(
        "Program code not found. Please select from the dropdown."
      );
      return;
    }

    // Build section string
    const sectionString = `${currentSection.sectionYear.trim()}${currentSection.sectionProgram
      .trim()
      .toUpperCase()}-${currentSection.sectionNumber.trim().toUpperCase()}`;

    // Check if section already exists
    if (formData.sections.includes(sectionString)) {
      setSectionProgramError("This section has already been added.");
      return;
    }

    // Add to sections array
    setFormData((prev) => ({
      ...prev,
      sections: [...prev.sections, sectionString],
    }));

    // Clear current section inputs
    setCurrentSection({
      sectionYear: "",
      sectionProgram: "",
      sectionNumber: "",
    });
    setSectionProgramError("");
  };

  const handleRemoveSection = (sectionToRemove) => {
    setFormData((prev) => ({
      ...prev,
      sections: prev.sections.filter((s) => s !== sectionToRemove),
    }));
  };

  const handleProgramCodeFocus = () => {
    // Get available program codes based on selected college
    const availableCodes = getAvailableProgramCodes();

    if (availableCodes.length > 0) {
      // If there's already text, filter it; otherwise show all available options
      if (
        currentSection.sectionProgram &&
        currentSection.sectionProgram.trim().length > 0
      ) {
        // Re-apply filtering with current value
        const searchUpper = currentSection.sectionProgram.toUpperCase();
        const filtered = availableCodes
          .map((code) => {
            const codeUpper = code.toUpperCase();
            let score = 0;
            let matched = false;

            if (codeUpper === searchUpper) {
              score = 0;
              matched = true;
            } else if (codeUpper.startsWith(searchUpper)) {
              score = 1;
              matched = true;
            } else if (codeUpper.includes(searchUpper)) {
              score = 2;
              matched = true;
            }

            return matched ? { code, score, length: code.length } : null;
          })
          .filter((item) => item !== null)
          .sort((a, b) => {
            if (a.score !== b.score) {
              return a.score - b.score;
            }
            if (a.score === 1 && b.score === 1) {
              return a.length - b.length;
            }
            return a.code.localeCompare(b.code);
          })
          .map((item) => item.code);
        setFilteredProgramCodes(filtered);
      } else {
        // Show all available options when empty (filtered by college if selected)
        setFilteredProgramCodes(availableCodes);
      }
      setShowProgramCodeSuggestions(true);
    }
  };

  const handleRoleSelect = (role) => {
    const roleValue = role === "OJT Adviser" ? "adviser" : "coordinator";
    setFormData((prev) => {
      const newData = {
        ...prev,
        role: roleValue,
      };
      // If coordinator is creating an adviser, auto-fill sections and college
      if (roleValue === "adviser" && isCoordinator) {
        if (currentAdminSections.length > 0) {
          newData.sections = [...currentAdminSections];
        }
        if (adminCollegeCode) {
          newData.college_code = adminCollegeCode;
        }
      }
      return newData;
    });
    setShowRoleSuggestions(false);
  };

  const handleRoleBlur = () => {
    setTimeout(() => {
      setShowRoleSuggestions(false);
    }, 200);
  };

  const handleRoleFocus = () => {
    setShowRoleSuggestions(true);
  };

  const handleProgramSelect = (program) => {
    setFormData((prev) => ({
      ...prev,
      program: program,
    }));
    setShowProgramSuggestions(false);
    setFilteredPrograms([]);
  };

  const handleProgramBlur = () => {
    setTimeout(() => {
      setShowProgramSuggestions(false);
    }, 200);
  };

  const handleProgramFocus = () => {
    if (programOptions.length > 0) {
      setFilteredPrograms(programOptions);
      setShowProgramSuggestions(true);
    }
  };

  const openCreateModal = async () => {
    let loadedSections = currentAdminSections;

    // Ensure coordinator's profile is loaded before opening modal
    if (isCoordinator && auth.currentUser) {
      const profile = await loadCurrentAdminProfile();
      loadedSections = profile.sections;
    }

    // Auto-fill sections and college when coordinator opens modal to create adviser
    if (isCoordinator && formData.role === "adviser") {
      setFormData((prev) => ({
        ...prev,
        sections:
          loadedSections.length > 0 ? [...loadedSections] : prev.sections,
        college_code: adminCollegeCode || prev.college_code,
      }));
    }
    setShowCreateModal(true);

    // Initialize filtered program codes (will be filtered by college if one is selected)
    const availableCodes = getAvailableProgramCodes();
    setFilteredProgramCodes(availableCodes);
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      clearAdminSession();
      navigate("/", { replace: true });
    } catch (err) {
      console.error("Logout error:", err);
    }
  };

  const handleSubmit = async (e) => {
    if (e) {
      e.preventDefault();
    }
    setError("");
    setSuccess("");
    setIsLoading(true);

    try {
      const isEditing = !!editingAdmin;

      // SECURITY: Verify user is authenticated with Firebase Auth
      if (!auth.currentUser) {
        setError(
          "You must be authenticated to create or edit admin accounts. Please log out and log back in."
        );
        setIsLoading(false);
        return;
      }

      // SECURITY: Refresh and verify auth token is valid
      let authToken;
      try {
        authToken = await auth.currentUser.getIdToken(true); // Force refresh
        console.log("Auth token verified before account creation/edit", {
          uid: auth.currentUser.uid,
          email: auth.currentUser.email,
          hasToken: !!authToken,
        });
      } catch (tokenError) {
        console.error("Failed to refresh auth token:", tokenError);
        setError(
          "Authentication token expired or invalid. Please log out and log back in."
        );
        setIsLoading(false);
        return;
      }

      // SECURITY: Verify user's role in Firestore matches their session
      // This prevents role tampering
      try {
        const adminsRef = collection(db, "adminusers");
        const currentUserQuery = query(
          adminsRef,
          where("firebaseEmail", "==", auth.currentUser.email)
        );
        const currentUserSnapshot = await getDocs(currentUserQuery);

        if (currentUserSnapshot.empty) {
          setError(
            "Your admin account was not found in the database. Please contact support."
          );
          setIsLoading(false);
          return;
        }

        const currentUserDoc = currentUserSnapshot.docs[0];
        const currentUserData = currentUserDoc.data();
        const currentUserRole = currentUserData.role;

        // Verify the role from Firestore matches the session role
        if (currentUserRole !== currentRole) {
          console.warn("Role mismatch detected", {
            sessionRole: currentRole,
            firestoreRole: currentUserRole,
          });
          setError(
            "Your account role has changed. Please log out and log back in."
          );
          setIsLoading(false);
          return;
        }

        // Additional security: Verify user has permission based on their actual role
        if (!isEditing) {
          // Only admin can create coordinators (support legacy super_admin during migration)
          if (
            formData.role === "coordinator" &&
            currentUserRole !== "admin" &&
            currentUserRole !== "super_admin"
          ) {
            setError(
              "You don't have permission to create coordinator accounts. Only admins can create coordinators."
            );
            setIsLoading(false);
            return;
          }

          // Only admin and coordinators can create advisers
          if (
            formData.role === "adviser" &&
            currentUserRole !== "admin" &&
            currentUserRole !== "super_admin" &&
            currentUserRole !== "coordinator"
          ) {
            setError("You don't have permission to create adviser accounts.");
            setIsLoading(false);
            return;
          }
        }
      } catch (verifyError) {
        console.error("Error verifying user role:", verifyError);
        setError(
          "Failed to verify your account permissions. Please try again or contact support."
        );
        setIsLoading(false);
        return;
      }

      // Validate role permissions (only for creating) - legacy check for UI state
      if (!isEditing) {
        if (formData.role === "coordinator" && !canCreateCoord) {
          setError("You don't have permission to create coordinator accounts.");
          setIsLoading(false);
          return;
        }

        if (formData.role === "admin" || formData.role === "super_admin") {
          setError("Cannot create admin accounts through this interface.");
          setIsLoading(false);
          return;
        }
      }

      // Check if username already exists (only for creating, or if username changed)
      // Skip this check for admin editing (support legacy super_admin during migration)
      const adminsRef = collection(db, "adminusers");
      if (
        !isEditing ||
        (formData.username !== editingAdmin.username &&
          !(
            editingAdmin &&
            (editingAdmin.role === "admin" ||
              editingAdmin.role === "admin" ||
              editingAdmin.role === "super_admin")
          ))
      ) {
        const usernameQuery = query(
          adminsRef,
          where("username", "==", formData.username)
        );
        const usernameSnapshot = await getDocs(usernameQuery);
        if (!usernameSnapshot.empty) {
          // If editing, check if it's the same admin
          const existingAdmin = usernameSnapshot.docs[0];
          if (!isEditing || existingAdmin.id !== editingAdmin.id) {
            setError(
              "Username already exists. Please choose a different username."
            );
            setIsLoading(false);
            return;
          }
        }
      }

      // Use provided email or generate from username (Firebase Auth requires email)
      // Skip email validation for admin editing (support legacy super_admin during migration)
      const emailToUse =
        isEditing &&
        editingAdmin &&
        (editingAdmin.role === "admin" ||
          editingAdmin.role === "admin" ||
          editingAdmin.role === "super_admin")
          ? editingAdmin.email || editingAdmin.firebaseEmail || ""
          : formData.email.trim() ||
            `${formData.username
              .trim()
              .toLowerCase()
              .replace(/\s+/g, "")}@admin.internquest.local`;

      // Validate email format if provided (skip for admin editing)
      if (
        !(
          isEditing &&
          editingAdmin &&
          (editingAdmin.role === "admin" ||
            editingAdmin.role === "admin" ||
            editingAdmin.role === "super_admin")
        ) &&
        formData.email.trim() &&
        !formData.email.includes("@")
      ) {
        setError("Please enter a valid email address.");
        setIsLoading(false);
        return;
      }

      // Validate password only when creating a new account
      // Password is used for Firebase Auth, not stored in Firestore
      if (!isEditing) {
        if (!formData.password || formData.password.trim() === "") {
          setError("Password is required when creating a new admin account.");
          setIsLoading(false);
          return;
        }

        if (formData.password.length < 6) {
          setError("Password must be at least 6 characters long.");
          setIsLoading(false);
          return;
        }
      }

      // NOTE: We no longer store passwords in Firestore
      // All password management is handled through Firebase Auth only

      // Create Firebase Auth user (only when creating a new admin, not when editing)
      let firebaseUser = null;
      if (!isEditing) {
        // Only create Firebase Auth user when creating a new admin
        try {
          // Ensure we're using a clean auth instance
          const userCredential = await createUserWithEmailAndPassword(
            auth,
            emailToUse, // Use provided email or auto-generated
            formData.password
          );
          firebaseUser = userCredential.user;
          console.log(
            "Firebase Auth user created successfully:",
            firebaseUser.uid
          );

          // Note: createUserWithEmailAndPassword automatically signs in as the new user
          // We'll re-authenticate as the original admin after saving to Firestore
        } catch (authError) {
          console.error("Firebase Auth error:", authError);
          console.error("Error code:", authError.code);
          console.error("Error message:", authError.message);

          let errorMessage = "Failed to create Firebase Auth account. ";

          switch (authError.code) {
            case "auth/email-already-in-use": {
              const roleLabel =
                formData.role === "coordinator" ? "coordinator" : "adviser";
              errorMessage =
                `This email is already used by another account in Firebase Authentication. ` +
                `If you are trying to give access to an existing ${roleLabel}, please do not create a new account.\n` +
                `Ask them to use "Forgot Password" on the login page instead.`;
              break;
            }
            case "auth/invalid-email":
              errorMessage = "Invalid email address format.";
              break;
            case "auth/operation-not-allowed":
              errorMessage =
                "Email/password accounts are not enabled. Please check Firebase Authentication settings.";
              break;
            case "auth/weak-password":
              errorMessage =
                "Password is too weak. Please use a stronger password (at least 6 characters).";
              break;
            case "auth/missing-password":
              errorMessage =
                "Password is required to create a Firebase Auth account.";
              break;
            case "auth/network-request-failed":
              errorMessage =
                "Network error. Please check your internet connection.";
              break;
            default:
              errorMessage += authError.message || "Unknown error occurred.";
          }

          setError(errorMessage);
          setIsLoading(false);
          return;
        }
      }

      // Create admin document in Firestore
      // Note: At this point, we're authenticated as the newly created user
      // The Firestore rules should allow authenticated users to create documents
      // Store sections as an array for multiple sections support
      let sections = [];
      if (formData.role === "adviser" || formData.role === "coordinator") {
        // Use sections from formData.sections array (added via "Add Section" button)
        if (formData.sections.length > 0) {
          sections = formData.sections;
        }
        // Fallback: if no sections in array but currentSection is complete, add it
        else if (
          currentSection.sectionYear &&
          currentSection.sectionProgram &&
          currentSection.sectionNumber
        ) {
          // Build section string from currentSection (all uppercase)
          const sectionString = `${currentSection.sectionYear.trim()}${currentSection.sectionProgram
            .trim()
            .toUpperCase()}-${currentSection.sectionNumber
            .trim()
            .toUpperCase()}`;
          sections = [sectionString];
        }
      }

      // Check if any selected section is already assigned to another adviser/coordinator
      if (
        sections.length > 0 &&
        (formData.role === "adviser" || formData.role === "coordinator")
      ) {
        const sectionsToAssign = sections
          .map((s) => (s || "").toString().trim().toUpperCase())
          .filter(Boolean);
        if (sectionsToAssign.length > 0) {
          const allAdminsSnap = await getDocs(collection(db, "adminusers"));
          const currentAdminId = editingAdmin?.id || null;
          const takenBy = {}; // section -> { name/username of other admin }
          for (const adminDoc of allAdminsSnap.docs) {
            if (adminDoc.id === currentAdminId) continue;
            const data = adminDoc.data();
            const role = data.role;
            if (role !== "adviser" && role !== "coordinator") continue;
            const theirSections =
              data.sections || (data.section ? [data.section] : []);
            const label =
              data.name?.trim() ||
              data.username ||
              data.email ||
              "Another user";
            for (const sec of theirSections) {
              const normalized = (sec || "").toString().trim().toUpperCase();
              if (sectionsToAssign.includes(normalized)) {
                takenBy[normalized] = label;
              }
            }
          }
          const takenSections = Object.keys(takenBy);
          if (takenSections.length > 0) {
            const list = takenSections.sort().join(", ");
            const who = takenSections.map((s) => takenBy[s])[0];
            setError(
              `The following section(s) are already assigned to another adviser/coordinator: ${list}. ` +
                (who ? `One or more are assigned to: ${who}. ` : "") +
                "Please remove these sections or choose different ones."
            );
            setIsLoading(false);
            return;
          }
        }
      }

      // For admin editing, only update college_code, sections, and name (support legacy super_admin during migration)
      const adminData =
        isEditing &&
        (editingAdmin.role === "admin" ||
          editingAdmin.role === "admin" ||
          editingAdmin.role === "super_admin")
          ? {
              name: (formData.name || "").trim(),
              college_code: formData.college_code || "",
              sections: sections, // Array of sections
              section: sections.length > 0 ? sections[0] : "", // Keep for backward compatibility
              updatedAt: new Date().toISOString(),
            }
          : {
              name: (formData.name || "").trim(),
              username: formData.username,
              email: emailToUse, // Use provided email or auto-generated
              role: formData.role,
              program: "", // Program field removed - filtering now based on sections only
              sections: sections, // Array of sections
              section: sections.length > 0 ? sections[0] : "", // Keep for backward compatibility
              college_code:
                formData.role === "coordinator"
                  ? formData.college_code
                  : formData.role === "adviser"
                  ? formData.college_code ||
                    (isCoordinator ? adminCollegeCode : "") // From dropdown or coordinator's college
                  : "", // Empty for other cases
              firebaseEmail: firebaseUser
                ? emailToUse
                : editingAdmin?.firebaseEmail || emailToUse, // Use Firebase Auth email if user was created, otherwise keep existing
              updatedAt: new Date().toISOString(),
            };

      // Only include uid if it has a valid value (Firestore doesn't allow undefined)
      const uidValue = firebaseUser ? firebaseUser.uid : editingAdmin?.uid;
      if (uidValue) {
        adminData.uid = uidValue;
      }

      // Only add creation metadata when creating
      // NOTE: Passwords are NOT stored in Firestore - only in Firebase Auth
      if (!isEditing) {
        adminData.createdAt = new Date().toISOString();
        adminData.createdBy = currentRole;
        // Track creator's college for better filtering when a coordinator creates advisers
        if (adminCollegeCode) {
          adminData.createdByCollegeCode = adminCollegeCode;
        }
      }
      // Password updates are handled via Firebase Auth only, not stored in Firestore

      console.log("Current Firebase Auth user:", auth.currentUser?.email);
      console.log("Is authenticated:", !!auth.currentUser);
      console.log("Auth UID:", auth.currentUser?.uid);
      console.log(
        isEditing
          ? "Attempting to update Firestore document..."
          : "Attempting to create Firestore document..."
      );
      console.log("Admin data to save:", adminData);
      console.log("Is editing:", isEditing);
      if (isEditing) {
        console.log("Editing admin ID:", editingAdmin.id);
      }

      // Authentication checks are already performed at the beginning of handleSubmit
      // No need to duplicate them here

      try {
        if (isEditing) {
          const adminRef = doc(db, "adminusers", editingAdmin.id);
          console.log("Updating document:", adminRef.path);

          // Remove undefined values from adminData (Firestore doesn't allow undefined)
          const cleanAdminData = Object.fromEntries(
            Object.entries(adminData).filter(
              ([_, value]) => value !== undefined
            )
          );

          console.log("Update data:", cleanAdminData);
          await updateDoc(adminRef, cleanAdminData);
          console.log("Firestore document updated successfully");

          // Editing now never changes password; use a simple success message
          setSuccess(`Admin account updated successfully.`);
        } else {
          await addDoc(adminsRef, adminData);
          console.log("Firestore document created successfully");
        }
      } catch (firestoreError) {
        console.error("Firestore error:", firestoreError);
        console.error("Error code:", firestoreError.code);
        console.error("Error message:", firestoreError.message);

        // If Firestore write fails, we should still have the Firebase Auth user created (if creating)
        // But we need to inform the user
        if (firestoreError.code === "permission-denied") {
          setError(
            isEditing
              ? "Permission denied. Please make sure Firestore security rules allow authenticated users to update adminusers collection."
              : "Permission denied. Please make sure Firestore security rules allow authenticated users to write to adminusers collection. The Firebase Auth account was created, but the Firestore document could not be saved."
          );
        } else {
          setError(
            isEditing
              ? `Failed to update admin document in Firestore: ${firestoreError.message}.`
              : `Failed to save admin document to Firestore: ${firestoreError.message}. The Firebase Auth account was created, but the Firestore document could not be saved.`
          );
        }
        setIsLoading(false);
        return;
      }

      setSuccess(
        isEditing
          ? `Successfully updated ${getRoleDisplayName(
              formData.role
            )} account: ${formData.username}`
          : `Successfully created ${getRoleDisplayName(
              formData.role
            )} account: ${formData.username}`
      );
      setFormData({
        name: "",
        username: "",
        password: "",
        email: "",
        role: "adviser",
        sections:
          isCoordinator && currentAdminSections.length > 0
            ? [...currentAdminSections]
            : [],
        college_code: "",
      });
      setCurrentSection({
        sectionYear: "",
        sectionProgram: "",
        sectionNumber: "",
      });
      setShowCreateModal(false);
      loadAdmins();
    } catch (err) {
      console.error("Error creating admin:", err);
      setError(`Error creating admin account: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="admin-management-page">
      <LoadingSpinner isLoading={isLoading} message="Processing request..." />
      <Navbar onLogout={handleLogout} />
      <div className="admin-management-container">
        <div className="admin-management-header">
          <h1>User & Role Management</h1>
          <p className="role-indicator">
            {currentRole === "admin" || currentRole === "super_admin"
              ? "Admin"
              : currentRole === "coordinator"
              ? "OJT Coordinator"
              : "OJT Adviser"}
          </p>
        </div>

        {error && !showCreateModal && (
          <div className="error-message" role="alert">
            {error}
          </div>
        )}

        {success && (
          <div className="success-message" role="alert">
            {success}
          </div>
        )}

        <div className="admin-management-actions">
          <button
            type="button"
            className="create-admin-btn"
            onClick={async () => {
              await openCreateModal();
            }}
          >
            + Create New Coordinator/Adviser Account
          </button>
        </div>

        {/* Create Admin Modal */}
        {showCreateModal && (
          <div className="create-admin-modal-backdrop">
            <div
              className="create-admin-modal"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="create-admin-modal-header">
                <h2>
                  {editingAdmin
                    ? editingAdmin.role === "admin" ||
                      editingAdmin.role === "admin" ||
                      editingAdmin.role === "super_admin"
                      ? "Edit Admin Account"
                      : "Edit Coordinator/Adviser Account"
                    : "Create New Coordinator/Adviser Account"}
                </h2>
                <button
                  type="button"
                  className="close-modal-btn"
                  onClick={handleCancelModal}
                  aria-label="Close modal"
                >
                  ×
                </button>
              </div>
              {error && (
                <div className="error-message" role="alert">
                  {error}
                </div>
              )}
              <form onSubmit={handleSubmit} className="admin-form">
                <div className="form-group">
                  <label htmlFor="modal-name">Name</label>
                  <input
                    type="text"
                    id="modal-name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Full name"
                    disabled={
                      editingAdmin &&
                      (editingAdmin.role === "admin" ||
                        editingAdmin.role === "admin" ||
                        editingAdmin.role === "super_admin")
                    }
                    readOnly={
                      editingAdmin &&
                      (editingAdmin.role === "admin" ||
                        editingAdmin.role === "admin" ||
                        editingAdmin.role === "super_admin")
                    }
                  />
                  <small className="form-help">
                    Display name for the account; used for profile icon
                    initials.
                  </small>
                </div>

                <div className="form-group">
                  <label htmlFor="modal-username">Username</label>
                  <input
                    type="text"
                    id="modal-username"
                    name="username"
                    value={formData.username}
                    onChange={handleChange}
                    required
                    placeholder="Enter username"
                    disabled={
                      editingAdmin &&
                      (editingAdmin.role === "admin" ||
                        editingAdmin.role === "admin" ||
                        editingAdmin.role === "super_admin")
                    }
                    readOnly={
                      editingAdmin &&
                      (editingAdmin.role === "admin" ||
                        editingAdmin.role === "admin" ||
                        editingAdmin.role === "super_admin")
                    }
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="modal-email">Email</label>
                  <input
                    type="email"
                    id="modal-email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    placeholder="Enter email address"
                    disabled={
                      editingAdmin &&
                      (editingAdmin.role === "admin" ||
                        editingAdmin.role === "admin" ||
                        editingAdmin.role === "super_admin")
                    }
                    readOnly={
                      editingAdmin &&
                      (editingAdmin.role === "admin" ||
                        editingAdmin.role === "admin" ||
                        editingAdmin.role === "super_admin")
                    }
                  />
                </div>

                {!editingAdmin && (
                  <div className="form-group">
                    <label htmlFor="modal-password">Password</label>
                    <div className="password-input-wrapper">
                      <input
                        type={showPassword ? "text" : "password"}
                        id="modal-password"
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        required
                        placeholder="Enter password (min 6 characters)"
                        minLength="6"
                      />
                      <button
                        type="button"
                        className="password-toggle"
                        onClick={() => setShowPassword((prev) => !prev)}
                        aria-label={
                          showPassword ? "Hide password" : "Show password"
                        }
                      >
                        {showPassword ? <FaRegEyeSlash /> : <FaRegEye />}
                      </button>
                    </div>
                    <small className="form-help">
                      Password is stored securely in Firebase Authentication
                      only, not in the database.
                    </small>
                  </div>
                )}

                <div className="form-group role-autocomplete-container">
                  <label htmlFor="modal-role">Role</label>
                  <div
                    style={{
                      position: "relative",
                      cursor:
                        editingAdmin &&
                        (editingAdmin.role === "admin" ||
                          editingAdmin.role === "admin" ||
                          editingAdmin.role === "super_admin")
                          ? "not-allowed"
                          : "pointer",
                    }}
                    onClick={
                      editingAdmin &&
                      (editingAdmin.role === "admin" ||
                        editingAdmin.role === "admin" ||
                        editingAdmin.role === "super_admin")
                        ? undefined
                        : handleRoleFocus
                    }
                  >
                    <input
                      type="text"
                      id="modal-role"
                      name="role"
                      value={
                        editingAdmin &&
                        (editingAdmin.role === "admin" ||
                          editingAdmin.role === "admin" ||
                          editingAdmin.role === "super_admin")
                          ? (() => {
                              const hasCoordinatorAttributes =
                                editingAdmin.college_code ||
                                (editingAdmin.sections &&
                                  Array.isArray(editingAdmin.sections) &&
                                  editingAdmin.sections.length > 0) ||
                                editingAdmin.section;
                              return hasCoordinatorAttributes
                                ? "Admin/Coordinator"
                                : "Admin";
                            })()
                          : formData.role === "adviser"
                          ? "OJT Adviser"
                          : formData.role === "coordinator"
                          ? "OJT Coordinator"
                          : ""
                      }
                      onChange={() => {}}
                      onFocus={handleRoleFocus}
                      onBlur={handleRoleBlur}
                      required
                      placeholder="Select role"
                      autoComplete="off"
                      readOnly
                      style={{ cursor: "pointer" }}
                      className="role-input-with-icon"
                    />
                    <span className="role-dropdown-icon" aria-hidden="true">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="12"
                        height="12"
                        viewBox="0 0 12 12"
                        fill="none"
                      >
                        <path d="M6 9L1 4h10z" fill="currentColor" />
                      </svg>
                    </span>
                    {showRoleSuggestions && (
                      <div className="role-suggestions-dropdown">
                        {canCreateCoord && (
                          <div
                            className="role-suggestion-item"
                            onClick={() => handleRoleSelect("OJT Coordinator")}
                            onMouseDown={(e) => e.preventDefault()}
                          >
                            OJT Coordinator
                          </div>
                        )}
                        <div
                          className="role-suggestion-item"
                          onClick={() => handleRoleSelect("OJT Adviser")}
                          onMouseDown={(e) => e.preventDefault()}
                        >
                          OJT Adviser
                        </div>
                      </div>
                    )}
                  </div>
                  <small className="form-help">
                    {canCreateCoord
                      ? "You can create Coordinator and Adviser accounts"
                      : "You can only create Adviser accounts"}
                  </small>
                </div>

                {/* College field for coordinators, advisers, and when editing admin */}
                {(formData.role === "coordinator" ||
                  formData.role === "adviser" ||
                  (editingAdmin &&
                    (editingAdmin.role === "admin" ||
                      editingAdmin.role === "admin" ||
                      editingAdmin.role === "super_admin"))) && (
                  <div className="form-group">
                    <label htmlFor="modal-college">College</label>
                    <select
                      id="modal-college"
                      name="college_code"
                      value={formData.college_code}
                      onChange={handleChange}
                      required={
                        formData.role === "coordinator" ||
                        formData.role === "adviser"
                      }
                      disabled={
                        isLoading ||
                        (formData.role === "adviser" && isCoordinator)
                      }
                    >
                      <option value="">Select a college</option>
                      {collegeOptions.map((college, index) => (
                        <option
                          key={`${
                            college.id || college.college_code || index
                          }-${college.college_name}`}
                          value={college.college_code}
                        >
                          {college.college_name}
                        </option>
                      ))}
                    </select>
                    <small className="form-help">
                      {editingAdmin &&
                      (editingAdmin.role === "admin" ||
                        editingAdmin.role === "admin" ||
                        editingAdmin.role === "super_admin")
                        ? "Admin college assignment"
                        : formData.role === "adviser" && isCoordinator
                        ? "Adviser is assigned to your college. Sections must belong to programs in this college."
                        : "Coordinators can only see students from programs in their assigned college"}
                    </small>
                  </div>
                )}

                {(formData.role === "adviser" ||
                  formData.role === "coordinator" ||
                  (editingAdmin &&
                    (editingAdmin.role === "admin" ||
                      editingAdmin.role === "admin" ||
                      editingAdmin.role === "super_admin"))) && (
                  <div className="form-group">
                    <label>Section</label>
                    <div className="section-input-group">
                      <div className="section-input-item">
                        <label
                          htmlFor="modal-sectionYear"
                          className="section-label"
                        >
                          Year
                        </label>
                        <input
                          type="number"
                          id="modal-sectionYear"
                          name="sectionYear"
                          value={currentSection.sectionYear}
                          onChange={handleChange}
                          placeholder="4"
                          min="1"
                          max="5"
                          disabled={isLoading}
                          style={{ width: "80px" }}
                        />
                      </div>
                      <div className="section-input-item program-code-autocomplete-container">
                        <label
                          htmlFor="modal-sectionProgram"
                          className="section-label"
                        >
                          Program Code
                        </label>
                        <input
                          type="text"
                          id="modal-sectionProgram"
                          name="sectionProgram"
                          value={currentSection.sectionProgram}
                          onChange={handleChange}
                          onFocus={handleProgramCodeFocus}
                          onBlur={handleProgramCodeBlur}
                          placeholder="BSIT"
                          maxLength={10}
                          disabled={isLoading}
                          style={{ width: "120px" }}
                          autoComplete="off"
                        />
                        {showProgramCodeSuggestions &&
                          filteredProgramCodes.length > 0 &&
                          programCodeOptions.length > 0 && (
                            <div className="program-code-suggestions-dropdown">
                              {filteredProgramCodes.map((code) => (
                                <div
                                  key={code}
                                  className="program-code-suggestion-item"
                                  onClick={() => handleProgramCodeSelect(code)}
                                  onMouseDown={(e) => e.preventDefault()}
                                >
                                  {code}
                                </div>
                              ))}
                            </div>
                          )}
                        {sectionProgramError && (
                          <span
                            className="error-message"
                            style={{ display: "block", marginTop: "0.25rem" }}
                          >
                            {sectionProgramError}
                          </span>
                        )}
                      </div>
                      <div className="section-input-item">
                        <label
                          htmlFor="modal-sectionNumber"
                          className="section-label"
                        >
                          Section
                        </label>
                        <input
                          type="text"
                          id="modal-sectionNumber"
                          name="sectionNumber"
                          value={currentSection.sectionNumber}
                          onChange={handleChange}
                          placeholder="2"
                          maxLength={2}
                          disabled={isLoading}
                          style={{ width: "80px" }}
                        />
                      </div>
                    </div>
                    <button
                      type="button"
                      className="add-section-btn"
                      onClick={handleAddSection}
                      disabled={isLoading}
                      style={{
                        marginTop: "0.5rem",
                        padding: "0.5rem 1rem",
                        backgroundColor: "#1976d2",
                        color: "white",
                        border: "none",
                        borderRadius: "4px",
                        cursor: "pointer",
                        fontSize: "0.9rem",
                      }}
                    >
                      + Add Section
                    </button>
                    {formData.sections.length > 0 && (
                      <div
                        style={{
                          marginTop: "1rem",
                          padding: "0.75rem",
                          backgroundColor: "#f5f5f5",
                          borderRadius: "4px",
                        }}
                      >
                        <strong
                          style={{ display: "block", marginBottom: "0.5rem" }}
                        >
                          Added Sections ({formData.sections.length}):
                        </strong>
                        <div
                          style={{
                            display: "flex",
                            flexWrap: "wrap",
                            gap: "0.5rem",
                          }}
                        >
                          {formData.sections.map((section, index) => (
                            <span
                              key={index}
                              style={{
                                display: "inline-flex",
                                alignItems: "center",
                                gap: "0.5rem",
                                padding: "0.25rem 0.75rem",
                                backgroundColor: "white",
                                border: "1px solid #ddd",
                                borderRadius: "4px",
                                fontSize: "0.9rem",
                              }}
                            >
                              {section}
                              <button
                                type="button"
                                onClick={() => handleRemoveSection(section)}
                                disabled={isLoading}
                                style={{
                                  background: "none",
                                  border: "none",
                                  color: "#d32f2f",
                                  cursor: "pointer",
                                  fontSize: "1.2rem",
                                  padding: "0",
                                  lineHeight: "1",
                                }}
                                aria-label={`Remove section ${section}`}
                              >
                                ×
                              </button>
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    <small className="form-help">
                      Will be combined as:{" "}
                      <strong>
                        {currentSection.sectionYear || "?"}
                        {currentSection.sectionProgram || "???"}-
                        {currentSection.sectionNumber || "?"}
                      </strong>{" "}
                      (e.g., 4BSIT-2).{" "}
                      {formData.role === "adviser"
                        ? "Advisers will only see students in their assigned sections."
                        : "Coordinators with sections will only see students in their assigned sections."}
                    </small>
                  </div>
                )}

                <div className="modal-form-actions">
                  <button
                    type="button"
                    className="cancel-btn"
                    onClick={() => setShowCreateModal(false)}
                    disabled={isLoading}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="submit-button"
                    disabled={isLoading}
                  >
                    {isLoading
                      ? editingAdmin
                        ? "Updating..."
                        : "Creating..."
                      : editingAdmin
                      ? "Update Account"
                      : "Create Account"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        <div className="admin-management-content">
          <div className="admins-list">
            <h2>Existing User Accounts</h2>

            {/* Search and Filter Bar */}
            <div className="admin-search-filter-bar">
              <div className="admin-search-wrapper">
                <input
                  type="text"
                  className="admin-search-input"
                  placeholder="Search by name, username, email, or role..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setCurrentPage(1);
                  }}
                />
                {searchQuery && (
                  <button
                    type="button"
                    className="admin-search-clear"
                    onClick={() => {
                      setSearchQuery("");
                      setCurrentPage(1);
                    }}
                    aria-label="Clear search"
                  >
                    ×
                  </button>
                )}
              </div>

              <div className="admin-filter-wrapper">
                <select
                  className="admin-filter-select"
                  value={filterRole}
                  onChange={(e) => {
                    setFilterRole(e.target.value);
                    setCurrentPage(1);
                  }}
                >
                  <option value="">All Roles</option>
                  <option value="admin">Admin</option>
                  <option value="coordinator">OJT Coordinator</option>
                  <option value="adviser">OJT Adviser</option>
                </select>

                <select
                  className="admin-filter-select"
                  value={filterCollege}
                  onChange={(e) => {
                    setFilterCollege(e.target.value);
                    setCurrentPage(1);
                  }}
                >
                  <option value="">All Colleges</option>
                  {collegeOptions.map((college) => (
                    <option key={college.id} value={college.college_code}>
                      {college.college_name}
                    </option>
                  ))}
                </select>

                {(searchQuery || filterRole || filterCollege) && (
                  <button
                    type="button"
                    className="admin-filter-clear"
                    onClick={() => {
                      setSearchQuery("");
                      setFilterRole("");
                      setFilterCollege("");
                      setCurrentPage(1);
                    }}
                  >
                    Clear Filters
                  </button>
                )}
              </div>
            </div>

            {isLoading ? (
              <LoadingSpinner
                isLoading={isLoading}
                message="Loading admins..."
              />
            ) : (
              (() => {
                // Filter admins based on search and filters
                const filteredAdmins = admins.filter((admin) => {
                  // Search filter
                  const matchesSearch =
                    !searchQuery ||
                    admin.name
                      ?.toLowerCase()
                      .includes(searchQuery.toLowerCase()) ||
                    admin.username
                      ?.toLowerCase()
                      .includes(searchQuery.toLowerCase()) ||
                    admin.email
                      ?.toLowerCase()
                      .includes(searchQuery.toLowerCase()) ||
                    admin.role
                      ?.toLowerCase()
                      .includes(searchQuery.toLowerCase());

                  // Role filter
                  const matchesRole = !filterRole || admin.role === filterRole;

                  // College filter (for coordinators)
                  const matchesCollege =
                    !filterCollege ||
                    admin.role !== "coordinator" ||
                    admin.college_code === filterCollege;

                  return matchesSearch && matchesRole && matchesCollege;
                });

                // Pagination
                const totalPages = Math.ceil(
                  filteredAdmins.length / itemsPerPage
                );
                const indexOfLastItem = currentPage * itemsPerPage;
                const indexOfFirstItem = indexOfLastItem - itemsPerPage;
                const paginatedAdmins = filteredAdmins.slice(
                  indexOfFirstItem,
                  indexOfLastItem
                );

                return (
                  <>
                    <div className="admins-table">
                      <table>
                        <thead>
                          <tr>
                            <th>Name</th>
                            <th>Username</th>
                            <th>Email</th>
                            <th>Role</th>
                            <th>College</th>
                            <th>Section</th>
                            <th>Created At</th>
                            <th>Created By</th>
                            <th>Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredAdmins.length === 0 ? (
                            <tr>
                              <td
                                colSpan="9"
                                style={{ padding: 0, border: "none" }}
                              >
                                <EmptyState
                                  type={
                                    searchQuery || filterRole || filterCollege
                                      ? "search"
                                      : "document"
                                  }
                                  title={
                                    searchQuery || filterRole || filterCollege
                                      ? "No user accounts match your filters"
                                      : "No user accounts found"
                                  }
                                  message={
                                    searchQuery || filterRole || filterCollege
                                      ? "Try adjusting your search criteria or filters to find user accounts. You can also clear all filters to see all accounts."
                                      : "Get started by creating your first user account. Use the 'Create New Coordinator/Adviser Account' button above."
                                  }
                                  icon={IoShieldCheckmarkOutline}
                                  actionLabel={
                                    searchQuery || filterRole || filterCollege
                                      ? "Clear Filters"
                                      : undefined
                                  }
                                  onAction={
                                    searchQuery || filterRole || filterCollege
                                      ? () => {
                                          setSearchQuery("");
                                          setFilterRole("");
                                          setFilterCollege("");
                                          setCurrentPage(1);
                                        }
                                      : undefined
                                  }
                                />
                              </td>
                            </tr>
                          ) : (
                            paginatedAdmins.map((admin) => (
                              <tr key={admin.id}>
                                <td>
                                  <span className="admin-name-text">
                                    {admin.name?.trim() ||
                                      admin.username ||
                                      "—"}
                                  </span>
                                </td>
                                <td>{admin.username}</td>
                                <td>
                                  {admin.email &&
                                  !admin.email.includes(
                                    "@admin.internquest.local"
                                  ) ? (
                                    <a
                                      href={`mailto:${admin.email}`}
                                      style={{
                                        color: "#1976d2",
                                        textDecoration: "underline",
                                      }}
                                    >
                                      {admin.email}
                                    </a>
                                  ) : (
                                    "—"
                                  )}
                                </td>
                                <td>
                                  {(() => {
                                    // Check if admin also has coordinator attributes (support legacy super_admin during migration)
                                    const isAdminRole =
                                      admin.role === "admin" ||
                                      admin.role === "super_admin";
                                    const isAdminWithCoordinator =
                                      isAdminRole &&
                                      (admin.college_code ||
                                        (admin.sections &&
                                          Array.isArray(admin.sections) &&
                                          admin.sections.length > 0) ||
                                        admin.section);

                                    return (
                                      <span
                                        className={`role-badge role-${
                                          isAdminRole ? "admin" : admin.role
                                        } ${
                                          isAdminWithCoordinator
                                            ? "role-admin-coordinator"
                                            : ""
                                        }`}
                                      >
                                        {isAdminRole
                                          ? isAdminWithCoordinator
                                            ? "Admin/Coordinator"
                                            : "Admin"
                                          : admin.role === "coordinator"
                                          ? "OJT Coordinator"
                                          : "OJT Adviser"}
                                      </span>
                                    );
                                  })()}
                                </td>
                                <td>
                                  {admin.college_code
                                    ? collegeOptions.find(
                                        (c) =>
                                          c.college_code === admin.college_code
                                      )?.college_name || admin.college_code
                                    : "—"}
                                </td>
                                <td>
                                  {admin.sections &&
                                  Array.isArray(admin.sections) &&
                                  admin.sections.length > 0
                                    ? admin.sections
                                        .map((s) => s.toUpperCase())
                                        .join(", ")
                                    : admin.section
                                    ? admin.section.toUpperCase()
                                    : "—"}
                                </td>
                                <td>
                                  {admin.createdAt
                                    ? new Date(
                                        admin.createdAt
                                      ).toLocaleDateString()
                                    : "N/A"}
                                </td>
                                <td>
                                  {admin.createdBy
                                    ? admin.createdBy === "admin" ||
                                      admin.createdBy === "super_admin"
                                      ? "Admin"
                                      : admin.createdBy === "coordinator"
                                      ? "OJT Coordinator"
                                      : admin.createdBy === "adviser"
                                      ? "OJT Adviser"
                                      : admin.createdBy
                                    : "N/A"}
                                </td>
                                <td>
                                  <div className="admin-actions-buttons">
                                    <button
                                      className="edit-admin-btn"
                                      onClick={() => handleEditAdmin(admin)}
                                      title={
                                        admin.role === "admin" ||
                                        admin.role === "super_admin"
                                          ? "Edit admin (only college and section can be changed)"
                                          : "Edit admin"
                                      }
                                      aria-label={`Edit admin ${
                                        admin.username || ""
                                      }`}
                                    >
                                      <IoPencilOutline />
                                      <span className="admin-action-label">
                                        Edit
                                      </span>
                                    </button>
                                    <button
                                      className="delete-admin-btn"
                                      onClick={() => handleDeleteAdmin(admin)}
                                      disabled={
                                        deletingId === admin.id ||
                                        admin.role === "admin" ||
                                        admin.role === "super_admin"
                                      }
                                      title={
                                        admin.role === "admin" ||
                                        admin.role === "super_admin"
                                          ? "Cannot delete admin"
                                          : "Delete admin"
                                      }
                                      aria-label={
                                        admin.role === "admin" ||
                                        admin.role === "super_admin"
                                          ? "Cannot delete admin"
                                          : `Delete admin ${
                                              admin.username || ""
                                            }`
                                      }
                                    >
                                      {deletingId === admin.id ? (
                                        "..."
                                      ) : (
                                        <>
                                          <IoTrashOutline />
                                          <span className="admin-action-label">
                                            Delete
                                          </span>
                                        </>
                                      )}
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>

                    {/* Pagination */}
                    {filteredAdmins.length > 0 && (
                      <div className="admin-pagination">
                        <div className="admin-pagination-left">
                          <div className="admin-pagination-info">
                            <span className="pagination-text">
                              Showing <strong>{indexOfFirstItem + 1}</strong> to{" "}
                              <strong>
                                {Math.min(
                                  indexOfLastItem,
                                  filteredAdmins.length
                                )}
                              </strong>{" "}
                              of <strong>{filteredAdmins.length}</strong> admin
                              {filteredAdmins.length !== 1 ? "s" : ""}
                            </span>
                          </div>
                          <div className="admin-pagination-items-per-page">
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
                              <option value="10">10</option>
                              <option value="20">20</option>
                              <option value="50">50</option>
                            </select>
                            <span className="items-per-page-label">
                              per page
                            </span>
                          </div>
                        </div>
                        {totalPages > 0 && (
                          <div className="admin-pagination-controls">
                            <button
                              className="admin-pagination-btn admin-pagination-btn-nav"
                              onClick={() =>
                                setCurrentPage((prev) => Math.max(1, prev - 1))
                              }
                              disabled={currentPage === 1}
                              aria-label="Previous page"
                              title="Previous page"
                            >
                              <span className="pagination-icon">‹</span>
                            </button>
                            {[...Array(totalPages)].map((_, index) => {
                              const page = index + 1;
                              if (
                                page === 1 ||
                                page === totalPages ||
                                (page >= currentPage - 1 &&
                                  page <= currentPage + 1)
                              ) {
                                return (
                                  <button
                                    key={page}
                                    className={`admin-pagination-btn admin-pagination-btn-number ${
                                      currentPage === page ? "active" : ""
                                    }`}
                                    onClick={() => setCurrentPage(page)}
                                    aria-label={`Go to page ${page}`}
                                    aria-current={
                                      currentPage === page ? "page" : undefined
                                    }
                                  >
                                    {page}
                                  </button>
                                );
                              } else if (
                                page === currentPage - 2 ||
                                page === currentPage + 2
                              ) {
                                return (
                                  <span
                                    key={page}
                                    className="admin-pagination-ellipsis"
                                    aria-hidden="true"
                                  >
                                    ...
                                  </span>
                                );
                              }
                              return null;
                            })}
                            <button
                              className="admin-pagination-btn admin-pagination-btn-nav"
                              onClick={() =>
                                setCurrentPage((prev) =>
                                  Math.min(totalPages, prev + 1)
                                )
                              }
                              disabled={currentPage === totalPages}
                              aria-label="Next page"
                              title="Next page"
                            >
                              <span className="pagination-icon">›</span>
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </>
                );
              })()
            )}
          </div>
        </div>

        <ConfirmModal
          open={showDeleteModal}
          message={
            pendingDeleteAdmin
              ? `Delete admin "${pendingDeleteAdmin.username || "account"}"${
                  pendingDeleteAdmin.role
                    ? ` (${getRoleDisplayName(pendingDeleteAdmin.role)})`
                    : ""
                }?\nThis will remove their admin record and add an entry to deletion history.`
              : ""
          }
          onConfirm={confirmDeleteAdmin}
          onCancel={cancelDeleteAdmin}
        />
      </div>
    </div>
  );
};

export default AdminManagement;
