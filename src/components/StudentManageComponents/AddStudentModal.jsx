/**
 * AddStudentModal - Modal for creating a new student account with fixed password
 */

import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { IoCloseOutline } from "react-icons/io5";
import { db } from "../../../firebase";
import { doc, getDoc } from "firebase/firestore";
import { loadColleges } from "../../utils/collegeUtils";
import "./AddStudentModal.css";

// Fixed password for all student accounts
const FIXED_STUDENT_PASSWORD = "Student@123"; // Change this to your desired fixed password

const AddStudentModal = ({
  isOpen,
  onClose,
  onSubmit,
  isLoading,
  defaultCollege = null,
}) => {
  const [formData, setFormData] = useState({
    studentNumber: "",
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
        // Load colleges
        const colleges = await loadColleges();
        const collegeNames = colleges.map((c) => c.college_name);
        setCollegeOptions(collegeNames);

        // Load program codes from meta/program_code
        const programCodeDocRef = doc(db, "meta", "program_code");
        const programCodeSnap = await getDoc(programCodeDocRef);
        if (programCodeSnap.exists()) {
          const codeData = programCodeSnap.data();
          const codesByCollegeMap = {};
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
        } else {
          setProgramCodeOptions([]);
        }
      } catch (err) {
        console.error("Error loading program codes:", err);
        setProgramCodeOptions([]);
      }
    };

    if (isOpen) {
      loadCollegesData();
    }
  }, [isOpen]);

  // Auto-fill college when defaultCollege is provided
  useEffect(() => {
    if (isOpen && defaultCollege) {
      console.log("Auto-filling college in modal:", defaultCollege);
      setFormData((prev) => ({
        ...prev,
        college: defaultCollege,
      }));
    } else if (isOpen && !defaultCollege) {
      // Clear college if defaultCollege is not provided
      setFormData((prev) => ({
        ...prev,
        college: "",
      }));
    }
  }, [isOpen, defaultCollege]);

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
        const searchLower = searchValue.toLowerCase();

        // Filter colleges by name
        const filtered = collegeOptions
          .map((college) => {
            const collegeLower = college.toLowerCase();
            let score = 0;
            let matched = false;

            // Exact match
            if (collegeLower === searchLower) {
              score = 0;
              matched = true;
            } else if (collegeLower.startsWith(searchLower)) {
              score = 1; // Starts with
              matched = true;
            } else if (collegeLower.includes(searchLower)) {
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
      } else {
        setFilteredColleges(collegeOptions);
        setShowCollegeSuggestions(true);
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
        errors.sectionProgram.includes("not found")
      ) {
        setErrors((prev) => ({
          ...prev,
          sectionProgram: "",
        }));
      }

      if (searchValue.length > 0) {
        const searchUpper = searchValue.toUpperCase();

        // Filter and sort by relevance (same logic as program field)
        const filtered = programCodeOptions
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
        // When empty, show all options
        setFilteredProgramCodes(programCodeOptions);
        setShowProgramCodeSuggestions(true);
      }
    }
  };

  const handleCollegeSelect = (college) => {
    setFormData((prev) => ({
      ...prev,
      college: college,
    }));
    setShowCollegeSuggestions(false);
    setFilteredColleges([]);
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
        // Re-apply filtering with current value
        const searchLower = formData.college.toLowerCase();

        const filtered = collegeOptions
          .map((college) => {
            const collegeLower = college.toLowerCase();
            let score = 0;
            let matched = false;

            // Check college name match
            if (collegeLower === searchLower) {
              score = 0;
              matched = true;
            } else if (collegeLower.startsWith(searchLower)) {
              score = 1;
              matched = true;
            } else if (collegeLower.includes(searchLower)) {
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
    }, 200);
  };

  const handleProgramCodeFocus = () => {
    if (programCodeOptions.length > 0) {
      // If there's already text, filter it; otherwise show all options
      if (
        formData.sectionProgram &&
        formData.sectionProgram.trim().length > 0
      ) {
        // Re-apply filtering with current value
        const searchUpper = formData.sectionProgram.toUpperCase();
        const filtered = programCodeOptions
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
        // Show all options when empty
        setFilteredProgramCodes(programCodeOptions);
      }
      setShowProgramCodeSuggestions(true);
    }
  };

  const validateForm = () => {
    const newErrors = {};

    const studentIdValue =
      formData.studentNumber.trim() || formData.studentId.trim();
    if (!studentIdValue) {
      newErrors.studentNumber = "Student ID is required";
    } else if (!/^[A-Za-z0-9-]+$/.test(studentIdValue)) {
      newErrors.studentNumber =
        "Student ID can only contain letters, numbers, and hyphens";
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
      const codeExists = programCodeOptions.some(
        (code) => code.toUpperCase() === enteredCode
      );
      if (!codeExists) {
        newErrors.sectionProgram =
          "Program code not found. Please select from the dropdown.";
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
        const emailDomain = formData.email.trim().split('@')[1]?.toLowerCase();
        
        if (!emailDomain?.endsWith('.edu.ph')) {
          newErrors.email = "Please enter an institutional email address ending with .edu.ph (e.g., student@university.edu.ph)";
        }
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      const studentIdValue =
        formData.studentNumber.trim() || formData.studentId.trim();
      // Combine section components into format: [Year][Program]-[Section] (all uppercase)
      const section = `${formData.sectionYear.trim()}${formData.sectionProgram
        .trim()
        .toUpperCase()}-${formData.sectionNumber.trim().toUpperCase()}`;
      onSubmit({
        ...formData,
        studentNumber: studentIdValue,
        studentId: studentIdValue, // Save to both fields for compatibility
        email: formData.email.trim(), // Required for contact purposes
        section: section,
        password: FIXED_STUDENT_PASSWORD,
      });
    }
  };

  const handleClose = () => {
    setFormData({
      studentNumber: "",
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
              <strong>Note:</strong> All student accounts will be created with a
              fixed password.
            </p>
            <p className="password-display">
              Default Password: <code>{FIXED_STUDENT_PASSWORD}</code>
            </p>
            <p className="password-warning">
              Students should change their password after first login.
            </p>
            <p className="login-info" style={{ 
              marginTop: "0.75rem", 
              padding: "0.75rem", 
              background: "#e3f2fd", 
              borderRadius: "6px",
              fontSize: "0.9rem",
              color: "#1976d2"
            }}>
              <strong>Login Information:</strong> Students will log in using their <strong>Student ID</strong> and the temporary password shown above.
            </p>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="studentNumber">
                Student ID <span className="required">*</span>
              </label>
              <input
                type="text"
                id="studentNumber"
                name="studentNumber"
                value={formData.studentNumber || formData.studentId}
                onChange={(e) => {
                  handleChange(e);
                  // Also update studentId for compatibility
                  setFormData((prev) => ({
                    ...prev,
                    studentId: e.target.value,
                  }));
                }}
                className={errors.studentNumber ? "error" : (formData.studentNumber || formData.studentId) && !errors.studentNumber ? "success" : ""}
                placeholder="e.g., 22-13425-754"
              />
              {errors.studentNumber && (
                <span className="error-message">{errors.studentNumber}</span>
              )}
              {(formData.studentNumber || formData.studentId) && !errors.studentNumber && (
                <span className="success-message">✓ Valid Student ID</span>
              )}
              <small
                style={{
                  color: "#666",
                  fontSize: "0.85rem",
                  marginTop: "0.25rem",
                  display: "block",
                }}
              >
                This will be used for login to the mobile app.
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
                  className={errors.firstName ? "error" : formData.firstName && !errors.firstName ? "success" : ""}
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
                  className={errors.lastName ? "error" : formData.lastName && !errors.lastName ? "success" : ""}
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
                onChange={handleChange}
                className={errors.email ? "error" : formData.email && !errors.email ? "success" : ""}
                placeholder="Enter institutional email (e.g., student@university.edu.ph)"
                required
              />
              {errors.email && (
                <span className="error-message">{errors.email}</span>
              )}
              {formData.email && !errors.email && (
                <span className="success-message">✓ Valid institutional email</span>
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
