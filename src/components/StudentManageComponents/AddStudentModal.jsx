/**
 * AddStudentModal - Modal for creating a new student account with a temp password
 */

import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { IoCloseOutline } from "react-icons/io5";
import { db } from "../../../firebase";
import { doc, getDoc } from "firebase/firestore";
import { loadColleges } from "../../utils/collegeUtils";
import "./AddStudentModal.css";

const formatStudentId = (value) => {
  const digitsOnly = value.replace(/\D/g, "").slice(0, 10);
  const part1 = digitsOnly.slice(0, 2);
  const part2 = digitsOnly.slice(2, 7);
  const part3 = digitsOnly.slice(7, 10);
  if (part3) return `${part1}-${part2}-${part3}`;
  if (part2) return `${part1}-${part2}`;
  return part1;
};

const EMAIL_DOMAIN = "neu.edu.ph";

const formatInstitutionalEmail = (value, previousValue = "") => {
  if (!value) return "";
  const trimmed = value.trim();
  const atIndex = trimmed.indexOf("@");
  
  // If no @ found, return as is
  if (atIndex === -1) return trimmed;

  const localPart = trimmed.slice(0, atIndex);
  
  // If user just typed @ (wasn't in previous value) and there's no domain yet, auto-suggest
  const previousHadAt = previousValue && previousValue.includes("@");
  if (!previousHadAt && atIndex === trimmed.length - 1 && localPart) {
    // User just typed @, auto-suggest the domain
    return `${localPart}@${EMAIL_DOMAIN}`;
  }
  
  // Otherwise, allow user to edit freely
  return trimmed;
};

const AddStudentModal = ({
  isOpen,
  onClose,
  onSubmit,
  isLoading,
  defaultCollege = null,
}) => {
  const [formData, setFormData] = useState({
    studentId: "",
    firstName: "",
    lastName: "",
    email: "",
    sectionYear: "",
    sectionProgram: "",
    sectionNumber: "",
    college: "",
  });
  const [errors, setErrors] = useState({});
  const [collegeOptions, setCollegeOptions] = useState([]);
  const [programCodeOptions, setProgramCodeOptions] = useState([]);
  const [programCodesByCollege, setProgramCodesByCollege] = useState({}); // Map college name to program codes array
  const [showCollegeSuggestions, setShowCollegeSuggestions] = useState(false);
  const [filteredColleges, setFilteredColleges] = useState([]);
  const [showProgramCodeSuggestions, setShowProgramCodeSuggestions] =
    useState(false);
  const [filteredProgramCodes, setFilteredProgramCodes] = useState([]);

  // Load colleges and program codes from Firestore
  useEffect(() => {
    const loadCollegesData = async () => {
      try {
        // Load colleges first to get college code to name mapping
        const colleges = await loadColleges();
        const collegeNames = colleges.map((c) => c.college_name);
        setCollegeOptions(collegeNames);

        // Create a mapping from college_code to college_name
        const collegeCodeToNameMap = {};
        colleges.forEach((college) => {
          if (college.college_code && college.college_name) {
            // Map both lowercase and original case
            collegeCodeToNameMap[college.college_code.toLowerCase()] =
              college.college_name;
            collegeCodeToNameMap[college.college_code] = college.college_name;
          }
        });

        // Load program codes from meta/program_code
        const programCodeDocRef = doc(db, "meta", "program_code");
        const programCodeSnap = await getDoc(programCodeDocRef);
        if (programCodeSnap.exists()) {
          const codeData = programCodeSnap.data();
          const codesByCollegeMap = {};
          let allProgramCodes = [];

          // Check if data is organized by college (arrays as values)
          const isCollegeOrganized = Object.keys(codeData).some((key) => {
            const value = codeData[key];
            return (
              Array.isArray(value) &&
              value.length > 0 &&
              typeof value[0] === "string"
            );
          });

          if (isCollegeOrganized) {
            // Structure could be:
            // 1. { "cics": ["BSIT", "BSCS", ...], "cba": ["BSA", ...], ... } - keys are college codes
            // 2. { "College of Engineering & Architecture": ["BSARCH", ...], ... } - keys are full college names
            Object.keys(codeData).forEach((collegeKey) => {
              const codes = codeData[collegeKey];
              if (Array.isArray(codes)) {
                const processedCodes = codes
                  .filter((c) => typeof c === "string" && c.trim().length > 0)
                  .map((c) => c.trim().toUpperCase())
                  .sort((a, b) => a.localeCompare(b));

                // Check if the key is a college code (short, lowercase) or a full college name
                // College codes are typically 2-5 characters, lowercase
                const isCollegeCode =
                  collegeKey.length <= 5 &&
                  collegeKey === collegeKey.toLowerCase();

                let collegeName;
                if (isCollegeCode) {
                  // Key is a college code, try to map to college name
                  collegeName =
                    collegeCodeToNameMap[collegeKey.toLowerCase()] ||
                    collegeCodeToNameMap[collegeKey] ||
                    collegeKey; // Fallback to the key itself if not found
                } else {
                  // Key is already a full college name (may contain &)
                  collegeName = collegeKey;

                  // Also create a normalized version for matching (handle & variations)
                  // Store both the original and normalized versions
                  const normalizedName = collegeName.toLowerCase().trim();

                  // If this college name isn't in our college options, add it
                  if (!collegeNames.includes(collegeName)) {
                    // Try to find a matching college name (handling & variations)
                    const matchingCollege = colleges.find((c) => {
                      const cName = c.college_name || "";
                      // Normalize both names for comparison (handle & and "and")
                      const normalize = (str) =>
                        str
                          .toLowerCase()
                          .replace(/&/g, "and")
                          .replace(/\s+/g, " ")
                          .trim();
                      return normalize(cName) === normalize(collegeName);
                    });

                    if (matchingCollege && matchingCollege.college_name) {
                      // Use the exact name from colleges collection
                      collegeName = matchingCollege.college_name;
                    }
                  }
                }

                codesByCollegeMap[collegeName] = processedCodes;
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

          // Remove duplicates and sort
          allProgramCodes = [...new Set(allProgramCodes)].sort((a, b) =>
            a.localeCompare(b)
          );

          setProgramCodesByCollege(codesByCollegeMap);
          setProgramCodeOptions(allProgramCodes);
          // Initialize filteredProgramCodes with all codes
          setFilteredProgramCodes(allProgramCodes);
        } else {
          setProgramCodeOptions([]);
          setFilteredProgramCodes([]);
        }
      } catch (err) {
        console.error("Error loading program codes:", err);
        setProgramCodeOptions([]);
        setFilteredProgramCodes([]);
      }
    };

    if (isOpen) {
      loadCollegesData();
    }
  }, [isOpen]);

  // Helper function to normalize college names for matching (handles & variations)
  const normalizeCollegeName = (name) => {
    if (!name) return "";
    return name
      .toLowerCase()
      .replace(/&/g, "and") // Replace & with "and"
      .replace(/\s+/g, " ") // Normalize whitespace
      .trim();
  };

  // Helper function to get program codes for a specific college
  const getProgramCodesForCollege = (collegeName) => {
    if (!collegeName || !collegeName.trim()) {
      // Return all program codes if no college selected
      const allCodes = Object.values(programCodesByCollege).flat();
      return [...new Set(allCodes)].sort((a, b) => a.localeCompare(b));
    }

    if (programCodesByCollege[collegeName]) {
      return programCodesByCollege[collegeName];
    }

    // Try case-insensitive match
    const normalizedInput = normalizeCollegeName(collegeName);
    const matchingKey = Object.keys(programCodesByCollege).find(
      (key) => normalizeCollegeName(key) === normalizedInput
    );

    if (matchingKey) {
      return programCodesByCollege[matchingKey];
    }
    return [];
  };

  // Auto-fill college when defaultCollege is provided
  useEffect(() => {
    if (isOpen && defaultCollege) {
      setFormData((prev) => ({
        ...prev,
        college: defaultCollege,
      }));
      // Update program codes for the default college
      const availableCodes = getProgramCodesForCollege(defaultCollege);
      if (availableCodes.length > 0) {
        setProgramCodeOptions(availableCodes);
        setFilteredProgramCodes(availableCodes);
      }
    } else if (isOpen && !defaultCollege) {
      // Clear college if defaultCollege is not provided
      setFormData((prev) => ({
        ...prev,
        college: "",
      }));
    }
  }, [isOpen, defaultCollege]);

  // Update program codes when college changes
  useEffect(() => {
    if (formData.college && formData.college.trim()) {
      const availableCodes = getProgramCodesForCollege(formData.college);
      setProgramCodeOptions(availableCodes);
      setFilteredProgramCodes(availableCodes);

      // Clear program code if it doesn't belong to the new college
      if (formData.sectionProgram) {
        const codeExists = availableCodes.some(
          (code) => code.toUpperCase() === formData.sectionProgram.toUpperCase()
        );
        if (!codeExists && availableCodes.length > 0) {
          setFormData((prev) => ({
            ...prev,
            sectionProgram: "",
          }));
        }
      }
    } else {
      // No college selected, show all program codes
      // Reset to all codes (this will be set when data loads)
      if (Object.keys(programCodesByCollege).length > 0) {
        const allCodes = Object.values(programCodesByCollege).flat();
        const uniqueCodes = [...new Set(allCodes)].sort((a, b) =>
          a.localeCompare(b)
        );
        setProgramCodeOptions(uniqueCodes);
        setFilteredProgramCodes(uniqueCodes);
      }
    }
  }, [formData.college]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    // Prevent changes to college field if defaultCollege is provided
    if (name === "college" && defaultCollege) {
      return;
    }

    // Make sectionNumber uppercase
    if (name === "sectionNumber") {
      const upperValue = value.toUpperCase();
      setFormData((prev) => ({
        ...prev,
        [name]: upperValue,
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }

    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }

    // Handle college autocomplete
    if (name === "college") {
      const searchValue = value.trim();
      if (searchValue.length > 0) {
        // Normalize search term (handle & variations)
        const normalizedSearch = normalizeCollegeName(searchValue);

        // Filter colleges by name
        const filtered = collegeOptions
          .map((college) => {
            const normalizedCollege = normalizeCollegeName(college);
            let score = 0;
            let matched = false;

            // Exact match
            if (normalizedCollege === normalizedSearch) {
              score = 0;
              matched = true;
            } else if (normalizedCollege.startsWith(normalizedSearch)) {
              score = 1; // Starts with
              matched = true;
            } else if (normalizedCollege.includes(normalizedSearch)) {
              score = 2; // Contains
              matched = true;
            }

            return matched ? { college, score } : null;
          })
          .filter((item) => item !== null)
          .sort((a, b) => {
            // Sort by score (lower is better)
            if (a.score !== b.score) {
              return a.score - b.score;
            }
            // If same score, sort alphabetically
            return a.college.localeCompare(b.college);
          })
          .map((item) => item.college);

        setFilteredColleges(filtered);
        setShowCollegeSuggestions(true);

        // Check if the entered value matches a college exactly, then update program codes
        const exactMatch = collegeOptions.find(
          (college) => normalizeCollegeName(college) === normalizedSearch
        );
        if (exactMatch) {
          const availableCodes = getProgramCodesForCollege(exactMatch);
          setProgramCodeOptions(availableCodes);
          setFilteredProgramCodes(availableCodes);
        }
      } else {
        setFilteredColleges(collegeOptions);
        setShowCollegeSuggestions(true);
        // Reset to all program codes when college is cleared
        if (Object.keys(programCodesByCollege).length > 0) {
          const allCodes = Object.values(programCodesByCollege).flat();
          const uniqueCodes = [...new Set(allCodes)].sort((a, b) =>
            a.localeCompare(b)
          );
          setProgramCodeOptions(uniqueCodes);
          setFilteredProgramCodes(uniqueCodes);
        }
      }
    }

    // Handle program code autocomplete
    if (name === "sectionProgram") {
      const searchValue = value.trim();
      // Update formData with uppercase immediately
      const upperValue = searchValue.toUpperCase();
      setFormData((prev) => ({
        ...prev,
        sectionProgram: upperValue,
      }));

      // Clear error when user starts typing
      if (
        errors.sectionProgram &&
        (errors.sectionProgram.includes("not found") ||
          errors.sectionProgram.includes("does not belong"))
      ) {
        setErrors((prev) => ({
          ...prev,
          sectionProgram: "",
        }));
      }

      // Get available program codes based on selected college
      const availableCodes =
        formData.college && formData.college.trim()
          ? getProgramCodesForCollege(formData.college)
          : programCodeOptions;

      if (searchValue.length > 0) {
        const searchUpper = searchValue.toUpperCase();

        // Filter and sort by relevance (only from available codes for selected college)
        const filtered = availableCodes
          .filter((code) => code && typeof code === "string") // Safety check
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
        setShowProgramCodeSuggestions(filtered.length > 0);
      } else {
        setFilteredProgramCodes(availableCodes);
        setShowProgramCodeSuggestions(availableCodes.length > 0);
      }
    }
  };

  const handleCollegeSelect = (college) => {
    const currentProgramCode = formData.sectionProgram;
    const availableCodes = getProgramCodesForCollege(college);

    // Clear program code if it doesn't belong to the selected college
    let newProgramCode = currentProgramCode;
    if (currentProgramCode && availableCodes.length > 0) {
      const codeExists = availableCodes.some(
        (code) => code.toUpperCase() === currentProgramCode.toUpperCase()
      );
      if (!codeExists) {
        newProgramCode = ""; // Clear if doesn't belong to new college
        setErrors((prev) => ({
          ...prev,
          sectionProgram:
            "Program code does not belong to selected college. Please select a new program code.",
        }));
      }
    }

    setFormData((prev) => ({
      ...prev,
      college: college,
      sectionProgram: newProgramCode,
    }));
    setShowCollegeSuggestions(false);
    setFilteredColleges([]);

    // Update filtered program codes based on selected college
    if (availableCodes.length > 0) {
      setProgramCodeOptions(availableCodes);
      setFilteredProgramCodes(availableCodes);
    } else {
      setProgramCodeOptions([]);
      setFilteredProgramCodes([]);
    }
  };

  const handleCollegeBlur = () => {
    // Delay hiding suggestions to allow click events
    setTimeout(() => {
      setShowCollegeSuggestions(false);
    }, 200);
  };

  const handleCollegeFocus = () => {
    if (collegeOptions.length > 0) {
      // If there's already text, filter it; otherwise show all options
      if (formData.college && formData.college.trim().length > 0) {
        // Re-apply filtering with current value (normalized to handle &)
        const normalizedSearch = normalizeCollegeName(formData.college);

        const filtered = collegeOptions
          .map((college) => {
            const normalizedCollege = normalizeCollegeName(college);
            let score = 0;
            let matched = false;

            // Check college name match
            if (normalizedCollege === normalizedSearch) {
              score = 0;
              matched = true;
            } else if (normalizedCollege.startsWith(normalizedSearch)) {
              score = 1;
              matched = true;
            } else if (normalizedCollege.includes(normalizedSearch)) {
              score = 2;
              matched = true;
            }

            return matched ? { college, score } : null;
          })
          .filter((item) => item !== null)
          .sort((a, b) => {
            if (a.score !== b.score) {
              return a.score - b.score;
            }
            return a.college.localeCompare(b.college);
          })
          .map((item) => item.college);

        setFilteredColleges(filtered);
      } else {
        // Show all options when empty
        setFilteredColleges(collegeOptions);
      }
      setShowCollegeSuggestions(true);
    }
  };

  const handleProgramCodeSelect = (code) => {
    setFormData((prev) => ({
      ...prev,
      sectionProgram: code,
    }));
    setShowProgramCodeSuggestions(false);
    setFilteredProgramCodes([]);
  };

  const handleProgramCodeBlur = () => {
    // Delay hiding suggestions to allow click events
    setTimeout(() => {
      setShowProgramCodeSuggestions(false);

      // Validate program code when field loses focus
      if (
        formData.sectionProgram &&
        formData.sectionProgram.trim().length > 0
      ) {
        const enteredCode = formData.sectionProgram.toUpperCase().trim();

        // If college is selected, check if code belongs to that college
        if (formData.college && formData.college.trim()) {
          const availableCodes = getProgramCodesForCollege(formData.college);
          const codeExists = availableCodes.some(
            (code) => code.toUpperCase() === enteredCode
          );
          if (!codeExists) {
            setErrors((prev) => ({
              ...prev,
              sectionProgram:
                "Program code does not belong to selected college. Please select a program code from the dropdown.",
            }));
          } else {
            // Clear error if code is valid
            setErrors((prev) => ({
              ...prev,
              sectionProgram: "",
            }));
          }
        } else {
          // No college selected, check against all program codes
          const codeExists = programCodeOptions.some(
            (code) => code.toUpperCase() === enteredCode
          );
          if (!codeExists) {
            setErrors((prev) => ({
              ...prev,
              sectionProgram:
                "Program code not found. Please select from the dropdown.",
            }));
          } else {
            // Clear error if code is valid
            setErrors((prev) => ({
              ...prev,
              sectionProgram: "",
            }));
          }
        }
      }
    }, 200);
  };

  const handleProgramCodeFocus = () => {
    // Get available program codes based on selected college
    const availableCodes = formData.college
      ? getProgramCodesForCollege(formData.college)
      : programCodeOptions;

    if (availableCodes.length > 0) {
      // If there's already text, filter it; otherwise show all available options
      if (
        formData.sectionProgram &&
        formData.sectionProgram.trim().length > 0
      ) {
        // Re-apply filtering with current value
        const searchUpper = formData.sectionProgram.toUpperCase();
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
        // Show all available options for selected college when empty
        setFilteredProgramCodes(availableCodes);
      }
      setShowProgramCodeSuggestions(true);
    } else {
      // No codes available - show all if no college selected, or empty if college selected
      if (!formData.college || !formData.college.trim()) {
        // No college selected, show all program codes
        setFilteredProgramCodes(programCodeOptions);
        setShowProgramCodeSuggestions(programCodeOptions.length > 0);
      } else {
        setFilteredProgramCodes([]);
        setShowProgramCodeSuggestions(false);
      }
    }
  };

  const validateForm = () => {
    const newErrors = {};

    const studentIdValue = formData.studentId.trim();
    if (!studentIdValue) {
      newErrors.studentId = "Student ID is required";
    } else {
      // Perfect format: XX-XXXXX-XXX (2 digits, dash, 5 digits, dash, 3 digits)
      const perfectFormatRegex = /^\d{2}-\d{5}-\d{3}$/;
      if (!perfectFormatRegex.test(studentIdValue)) {
        newErrors.studentId =
          "Student ID must be in format: XX-XXXXX-XXX (e.g., 12-12345-678)";
      }
    }
    if (!formData.firstName.trim()) {
      newErrors.firstName = "First name is required";
    }
    if (!formData.lastName.trim()) {
      newErrors.lastName = "Last name is required";
    }
    if (!formData.sectionYear.trim()) {
      newErrors.sectionYear = "Year is required";
    }
    if (!formData.sectionProgram.trim()) {
      newErrors.sectionProgram = "Program code is required";
    } else {
      // Check if the entered program code exists in the available options
      const enteredCode = formData.sectionProgram.toUpperCase().trim();

      // If college is selected, validate against college-specific codes
      if (formData.college && formData.college.trim()) {
        const availableCodes = getProgramCodesForCollege(formData.college);
        const codeExists = availableCodes.some(
          (code) => code.toUpperCase() === enteredCode
        );
        if (!codeExists) {
          newErrors.sectionProgram =
            "Program code does not belong to selected college. Please select a program code from the dropdown.";
        }
      } else {
        // No college selected, check against all program codes
        const codeExists = programCodeOptions.some(
          (code) => code.toUpperCase() === enteredCode
        );
        if (!codeExists) {
          newErrors.sectionProgram =
            "Program code not found. Please select from the dropdown.";
        }
      }
    }
    if (!formData.sectionNumber.trim()) {
      newErrors.sectionNumber = "Section number is required";
    }
    if (!formData.college.trim()) {
      newErrors.college = "College is required";
    }

    // Validate email (required for contact purposes)
    // Note: Student ID will be used for login, but email is still required
    // Email must be institutional (ending with .edu or other institutional domains)
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email.trim())) {
        newErrors.email = "Please enter a valid email address";
      } else {
        // Check if email is from .edu.ph domain only
        const emailDomain = formData.email.trim().split("@")[1]?.toLowerCase();
        if (!emailDomain?.endsWith(".edu.ph")) {
          newErrors.email =
            "Please enter an institutional email address ending with .edu.ph (e.g., student@university.edu.ph)";
        }
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      const studentIdValue = formData.studentId.trim();
      // Password is the same as Student ID
      const passwordToUse = studentIdValue;
      // Combine section components into format: [Year][Program]-[Section] (all uppercase)
      const section = `${formData.sectionYear.trim()}${formData.sectionProgram
        .trim()
        .toUpperCase()}-${formData.sectionNumber.trim().toUpperCase()}`;
      onSubmit({
        ...formData,
        studentId: studentIdValue,
        email: formData.email.trim(), // Required for contact purposes
        section: section,
        password: passwordToUse,
      });
    }
  };

  const handleClose = () => {
    setFormData({
      studentId: "",
      firstName: "",
      lastName: "",
      email: "",
      sectionYear: "",
      sectionProgram: "",
      sectionNumber: "",
      college: defaultCollege || "",
    });
    setErrors({});
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="add-student-modal-backdrop">
      <div className="add-student-modal" onClick={(e) => e.stopPropagation()}>
        <div className="add-student-modal-header">
          <h2>Add Student Account</h2>
          <button
            className="add-student-modal-close"
            onClick={handleClose}
            aria-label="Close modal"
          >
            <IoCloseOutline size={24} />
          </button>
        </div>

        <div className="add-student-modal-body">
          <div className="password-notice">
            <p>
              <strong>Note:</strong> The default password for each student account is their <strong>Student ID</strong>.
            </p>
            <p className="password-warning">
              Students should change their password after first login.
            </p>
            <p
              className="login-info"
              style={{
                marginTop: "0.75rem",
                padding: "0.75rem",
                background: "#e3f2fd",
                borderRadius: "6px",
                fontSize: "0.9rem",
                color: "#1976d2",
              }}
            >
              <strong>Login Information:</strong> Students will log in using
              their <strong>Student ID</strong> as both username and password.
            </p>
            <p
              style={{
                marginTop: "0.5rem",
                fontSize: "0.85rem",
                color: "#666",
              }}
            >
              The institutional email is for school records and notifications only.
            </p>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="studentId">
                Student ID <span className="required">*</span>
              </label>
              <input
                type="text"
                id="studentId"
                name="studentId"
                value={formData.studentId}
                onChange={(e) => {
                  const formattedValue = formatStudentId(e.target.value);
                  setFormData((prev) => ({
                    ...prev,
                    studentId: formattedValue,
                  }));
                  // Clear error when user starts typing
                  if (errors.studentId) {
                    setErrors((prev) => ({ ...prev, studentId: "" }));
                  }
                }}
                onBlur={() => {
                  // Validate on blur
                  const studentIdValue = formData.studentId.trim();
                  if (studentIdValue) {
                    const perfectFormatRegex = /^\d{2}-\d{5}-\d{3}$/;
                    if (!perfectFormatRegex.test(studentIdValue)) {
                      setErrors((prev) => ({
                        ...prev,
                        studentId:
                          "Student ID must be in format: XX-XXXXX-XXX (e.g., 12-12345-678)",
                      }));
                    } else {
                      setErrors((prev) => ({ ...prev, studentId: "" }));
                    }
                  }
                }}
                className={
                  errors.studentId
                    ? "error"
                    : formData.studentId && !errors.studentId
                    ? "success"
                    : ""
                }
                placeholder="e.g., 12-12345-678"
                maxLength={12}
              />
              {errors.studentId && (
                <span className="error-message">{errors.studentId}</span>
              )}
              {formData.studentId && !errors.studentId && (
                  <span className="success-message">
                    <span style={{ color: "#2e7d32", marginRight: "4px" }}>
                      ✓
                    </span>
                    Valid Student ID
                  </span>
                )}
              <small
                style={{
                  color: "#666",
                  fontSize: "0.85rem",
                  marginTop: "0.25rem",
                  display: "block",
                }}
              >
                Format: XX-XXXXX-XXX (e.g., 12-12345-678). This will be used for
                login to the mobile app.
              </small>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="firstName">
                  First Name <span className="required">*</span>
                </label>
                <input
                  type="text"
                  id="firstName"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  className={
                    errors.firstName
                      ? "error"
                      : formData.firstName && !errors.firstName
                      ? "success"
                      : ""
                  }
                  placeholder="Enter first name"
                />
                {errors.firstName && (
                  <span className="error-message">{errors.firstName}</span>
                )}
                {formData.firstName && !errors.firstName && (
                  <span className="success-message">✓ Valid</span>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="lastName">
                  Last Name <span className="required">*</span>
                </label>
                <input
                  type="text"
                  id="lastName"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  className={
                    errors.lastName
                      ? "error"
                      : formData.lastName && !errors.lastName
                      ? "success"
                      : ""
                  }
                  placeholder="Enter last name"
                />
                {errors.lastName && (
                  <span className="error-message">{errors.lastName}</span>
                )}
                {formData.lastName && !errors.lastName && (
                  <span className="success-message">✓ Valid</span>
                )}
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="email">
                Institutional Email <span className="required">*</span>
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={(e) => {
                  const previousEmail = formData.email;
                  const formattedEmail = formatInstitutionalEmail(
                    e.target.value,
                    previousEmail
                  );
                  setFormData((prev) => ({
                    ...prev,
                    email: formattedEmail,
                  }));
                  if (errors.email) {
                    setErrors((prev) => ({ ...prev, email: "" }));
                  }
                }}
                className={
                  errors.email
                    ? "error"
                    : formData.email && !errors.email
                    ? "success"
                    : ""
                }
                placeholder="Enter institutional email (e.g., student@university.edu.ph)"
                required
              />
              {errors.email && (
                <span className="error-message">{errors.email}</span>
              )}
              {formData.email && !errors.email && (
                <span className="success-message">
                  ✓ Valid institutional email
                </span>
              )}
            </div>

            <div className="form-group">
              <label>
                Section <span className="required">*</span>
              </label>
              <div className="section-input-group">
                <div className="section-input-item">
                  <label htmlFor="sectionYear" className="section-label">
                    Year
                  </label>
                  <input
                    type="text"
                    id="sectionYear"
                    name="sectionYear"
                    value={formData.sectionYear}
                    onChange={handleChange}
                    className={errors.sectionYear ? "error" : ""}
                    placeholder="4"
                    maxLength={2}
                    style={{ width: "80px" }}
                  />
                  {errors.sectionYear && (
                    <span className="error-message">{errors.sectionYear}</span>
                  )}
                </div>
                <div className="section-input-item program-code-autocomplete-container">
                  <label htmlFor="sectionProgram" className="section-label">
                    Program Code
                  </label>
                  <input
                    type="text"
                    id="sectionProgram"
                    name="sectionProgram"
                    value={formData.sectionProgram}
                    onChange={handleChange}
                    onFocus={handleProgramCodeFocus}
                    onBlur={handleProgramCodeBlur}
                    className={errors.sectionProgram ? "error" : ""}
                    placeholder="BSIT"
                    maxLength={10}
                    style={{ width: "120px" }}
                    autoComplete="off"
                  />
                  {showProgramCodeSuggestions &&
                    filteredProgramCodes.length > 0 && (
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
                  {errors.sectionProgram && (
                    <span className="error-message">
                      {errors.sectionProgram}
                    </span>
                  )}
                </div>
                <div className="section-input-item">
                  <label htmlFor="sectionNumber" className="section-label">
                    Section
                  </label>
                  <input
                    type="text"
                    id="sectionNumber"
                    name="sectionNumber"
                    value={formData.sectionNumber}
                    onChange={handleChange}
                    className={errors.sectionNumber ? "error" : ""}
                    placeholder="2"
                    maxLength={2}
                    style={{ width: "80px" }}
                  />
                  {errors.sectionNumber && (
                    <span className="error-message">
                      {errors.sectionNumber}
                    </span>
                  )}
                </div>
              </div>
              <small
                style={{
                  color: "#666",
                  fontSize: "0.85rem",
                  marginTop: "0.5rem",
                  display: "block",
                }}
              >
                Will be combined as:{" "}
                <strong>
                  {formData.sectionYear || "?"}
                  {formData.sectionProgram || "???"}-
                  {formData.sectionNumber || "?"}
                </strong>{" "}
                (e.g., 4BSIT-2)
              </small>
            </div>

            <div className="form-group program-input-wrapper">
              <label htmlFor="college">
                College <span className="required">*</span>
              </label>
              <div className="program-autocomplete-container">
                <input
                  type="text"
                  id="college"
                  name="college"
                  value={formData.college}
                  onChange={handleChange}
                  onFocus={handleCollegeFocus}
                  onBlur={handleCollegeBlur}
                  className={errors.college ? "error" : ""}
                  placeholder="e.g., College of Informatics and Computing Studies"
                  autoComplete="off"
                  disabled={!!defaultCollege}
                  readOnly={!!defaultCollege}
                />
                {showCollegeSuggestions && filteredColleges.length > 0 && (
                  <div className="program-suggestions-dropdown">
                    {filteredColleges.map((college) => (
                      <div
                        key={college}
                        className="program-suggestion-item"
                        onClick={() => handleCollegeSelect(college)}
                        onMouseDown={(e) => e.preventDefault()}
                      >
                        {college}
                      </div>
                    ))}
                  </div>
                )}
              </div>
              {errors.college && (
                <span className="error-message">{errors.college}</span>
              )}
              {collegeOptions.length > 0 && (
                <small
                  style={{
                    color: "#666",
                    fontSize: "0.85rem",
                    marginTop: "0.25rem",
                    display: "block",
                  }}
                >
                  Type to enter college or select from suggestions
                </small>
              )}
            </div>

            <div className="form-actions">
              <button
                type="button"
                className="cancel-btn"
                onClick={handleClose}
                disabled={isLoading}
              >
                Cancel
              </button>
              <button type="submit" className="submit-btn" disabled={isLoading}>
                {isLoading ? "Creating..." : "Create Student Account"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

AddStudentModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  isLoading: PropTypes.bool,
};

export default AddStudentModal;
