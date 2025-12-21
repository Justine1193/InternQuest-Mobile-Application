import React, { useRef, useState, useEffect } from "react";
import { IoCloseOutline } from "react-icons/io5";
import "./CompanyModal.css";

// --- CompanyModal: Modal for adding or editing a company ---
function CompanyModal({
  open,
  isEditMode,
  formData,
  setFormData,
  error,
  setError,
  handleInputChange,
  handleModeOfWorkChange,
  handleAddEntry,
  handleUpdateEntry,
  setIsModalOpen,
  setIsEditMode,
  setEditCompanyId,
  setSkills,
  skills,
  setFields,
  fields,
  isLoading,
  suggestionSkills,
  suggestionFields,
  setTableData,
  editCompanyId,
  setIsLoading,
}) {
  const [skillInput, setSkillInput] = useState("");
  const [fieldInput, setFieldInput] = useState("");
  const [showSkillDropdown, setShowSkillDropdown] = useState(false);
  const [showFieldDropdown, setShowFieldDropdown] = useState(false);
  const skillsInputRef = useRef(null);
  const [localError, setLocalError] = useState("");
  const [shakeKey, setShakeKey] = useState(0);
  const [websiteStatus, setWebsiteStatus] = useState(null);
  const [websiteChecking, setWebsiteChecking] = useState(false);
  const [emailValid, setEmailValid] = useState(true);
  const audioContextRef = useRef(null);
  const [errorTrigger, setErrorTrigger] = useState(0); // Track error occurrences to trigger scroll

  // Initialize audio context (only once)
  useEffect(() => {
    try {
      audioContextRef.current = new (window.AudioContext ||
        window.webkitAudioContext)();
    } catch (e) {
      console.warn("Audio context not available");
    }
  }, []);

  // Track when error prop changes from parent to trigger scroll
  const prevErrorRef = useRef(error);
  useEffect(() => {
    if (error && error !== prevErrorRef.current) {
      setErrorTrigger((prev) => prev + 1); // Increment to trigger scroll
      prevErrorRef.current = error;
    }
  }, [error]);

  // Play error sound and scroll modal to top when error appears
  useEffect(() => {
    if (error || localError) {
      playErrorSound();
      // Only scroll modal content to top, not the entire page
      // Use a small delay to ensure modal content is rendered
      setTimeout(() => {
        const modalContent = document.querySelector('.modal-content');
        if (modalContent) {
          modalContent.scrollTo({ top: 0, behavior: 'smooth' });
        }
      }, 100);
    }
  }, [error, localError, shakeKey, errorTrigger]); // errorTrigger increments each time validation fails, ensuring scroll on repeated errors

  // Function to play error sound
  const playErrorSound = () => {
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

      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);

      // Error sound: lower pitch, quick beep
      oscillator.frequency.value = 300;
      oscillator.type = "sine";

      gainNode.gain.setValueAtTime(0.2, ctx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.2);

      oscillator.start(ctx.currentTime);
      oscillator.stop(ctx.currentTime + 0.2);
    } catch (e) {
      // Silently fail if audio is not available
    }
  };

  const filteredSkills = suggestionSkills.filter(
    (skill) =>
      skill.toLowerCase().includes(skillInput.toLowerCase()) &&
      !skills.includes(skill)
  );

  const filteredFields = suggestionFields.filter(
    (field) =>
      field.toLowerCase().includes(fieldInput.toLowerCase()) &&
      !fields.includes(field)
  );

  const addSkill = (skill) => {
    if (skills.length < 15 && !skills.includes(skill)) {
      setSkills([...skills, skill]);
      setSkillInput("");
    }
  };

  const removeSkill = (skill) => {
    setSkills(skills.filter((s) => s !== skill));
  };

  // Validation function
  const validateForm = () => {
    // MOA is now always required, so always check validity years and start date
    const requiresMoaValidity =
      !formData.moaValidityYears ||
      Number(formData.moaValidityYears) <= 0 ||
      Number.isNaN(Number(formData.moaValidityYears));
    const requiresMoaStartDate = !formData.moaStartDate;
    if (
      !formData.companyName.trim() ||
      !formData.description.trim() ||
      !formData.website.trim() ||
      !formData.address.trim() ||
      !formData.email.trim() ||
      skills.length === 0 ||
      fields.length === 0 ||
      !formData.modeOfWork ||
      formData.modeOfWork.length === 0 ||
      requiresMoaValidity ||
      requiresMoaStartDate
    ) {
      setLocalError(
        requiresMoaStartDate
          ? "Please specify the MOA start date. MOA is required."
          : requiresMoaValidity
          ? "Please specify how many years the MOA is valid. MOA is required."
          : "Please fill in all required fields."
      );
      setErrorTrigger((prev) => prev + 1); // Increment to trigger scroll
      setShakeKey((k) => k + 1); // Force re-render for animation
      return false;
    }
    setLocalError("");
    return true;
  };

  // Handle Add/Update with validation
  const handleValidatedAdd = () => {
    if (validateForm()) {
      handleAddEntry();
    }
  };
  const handleValidatedUpdate = () => {
    if (validateForm()) {
      handleUpdateEntry(
        formData,
        fields,
        skills,
        setIsLoading,
        setTableData,
        setIsModalOpen,
        setIsEditMode,
        setEditCompanyId,
        setFormData,
        setSkills,
        setFields,
        setError,
        editCompanyId
      );
    }
  };

  // New minimal update handler
  const handleUpdate = () => {
    console.log("Update clicked", { formData, fields, skills, editCompanyId });
    // MOA is now always required, so always check validity years and start date
    const requiresMoaValidity =
      !formData.moaValidityYears ||
      Number(formData.moaValidityYears) <= 0 ||
      Number.isNaN(Number(formData.moaValidityYears));
    const requiresMoaStartDate = !formData.moaStartDate;
    if (
      !formData.companyName ||
      !formData.description ||
      !formData.website ||
      !formData.address ||
      !formData.email ||
      skills.length === 0 ||
      fields.length === 0 ||
      !formData.modeOfWork ||
      formData.modeOfWork.length === 0 ||
      requiresMoaValidity ||
      requiresMoaStartDate
    ) {
      setLocalError(
        requiresMoaStartDate
          ? "Please specify the MOA start date. MOA is required."
          : requiresMoaValidity
          ? "Please specify how many years the MOA is valid. MOA is required."
          : "Please fill in all required fields."
      );
      setErrorTrigger((prev) => prev + 1); // Increment to trigger scroll
      setShakeKey((k) => k + 1); // Force re-render for animation
      return;
    }
    setLocalError("");
    handleUpdateEntry(
      formData,
      fields,
      skills,
      setIsLoading,
      setTableData,
      setIsModalOpen,
      setIsEditMode,
      setEditCompanyId,
      setFormData,
      setSkills,
      setFields,
      setError,
      editCompanyId
    );
  };

  // Website status check function
  const checkWebsite = async (url) => {
    setWebsiteChecking(true);
    setWebsiteStatus(null);
    let testUrl = url;
    if (!/^https?:\/\//i.test(testUrl)) testUrl = "https://" + testUrl;
    try {
      await fetch(testUrl, { method: "HEAD", mode: "no-cors" });
      setWebsiteStatus("maybe-up");
    } catch (e) {
      setWebsiteStatus("down");
    }
    setWebsiteChecking(false);
  };

  // Debounce website check on input change
  useEffect(() => {
    if (!formData.website) {
      setWebsiteStatus(null);
      return;
    }
    const handler = setTimeout(() => {
      checkWebsite(formData.website);
    }, 800);
    return () => clearTimeout(handler);
  }, [formData.website]);

  // Email format validation
  useEffect(() => {
    if (!formData.email) {
      setEmailValid(true);
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    setEmailValid(emailRegex.test(formData.email));
  }, [formData.email]);

  // Only clear the field input when entering edit mode
  useEffect(() => {
    if (isEditMode) {
      setFieldInput("");
    }
  }, [isEditMode]);

  // Prefill tag inputs on edit
  useEffect(() => {
    if (isEditMode) {
      setSkillInput("");
      setFieldInput("");
    }
  }, [isEditMode]);

  useEffect(() => {
    // MOA is always required, so ensure it's always true
    if (!formData.moa) {
      setFormData((prev) => ({ ...prev, moa: true }));
    }
  }, [formData.moa, setFormData]);

  if (!open) return null;
  return (
    <div className="modal">
      <div className="modal-content">
        <h2>{isEditMode ? "Edit Company" : "Add New Company"}</h2>
        {(error || localError) && (
          <div className="modal-error-message error-popup">
            <div className="error-content">
              <div className="error-icon-wrapper">
                <span className="error-icon-symbol">⚠</span>
              </div>
              <div className="error-text-wrapper">
                <p className="error-title">Error</p>
                <p className="error-message-text">{error || localError}</p>
              </div>
              <button
                className="error-close-btn"
                onClick={() => {
                  setError && setError("");
                  setLocalError("");
                }}
                aria-label="Close error"
              >
                <IoCloseOutline />
              </button>
            </div>
          </div>
        )}
        <form onSubmit={(e) => e.preventDefault()}>
          <div className="form-group">
            <label htmlFor="companyName">
              Company Name: <span style={{ color: "red" }}>*</span>
            </label>
            <input
              id="companyName"
              type="text"
              name="companyName"
              value={formData.companyName}
              onChange={handleInputChange}
              placeholder="Enter company name"
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="description">
              Description: <span style={{ color: "red" }}>*</span>
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="Enter company description"
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="website">Website (optional)</label>
            <input
              id="website"
              type="text"
              name="website"
              value={formData.website}
              onChange={handleInputChange}
              placeholder="Enter company website"
            />
            {websiteChecking && (
              <span style={{ color: "#1976d2" }}>Checking...</span>
            )}
            {websiteStatus === "maybe-up" && (
              <span style={{ color: "green" }}>
                Website is reachable (not guaranteed)
              </span>
            )}
            {websiteStatus === "down" && (
              <span style={{ color: "red" }}>Website not reachable</span>
            )}
          </div>
          <div className="form-group">
            <label htmlFor="field">
              Field: <span style={{ color: "red" }}>*</span>
            </label>
            <div className="skills-container">
              <div className="skills-input-wrapper">
                <input
                  type="text"
                  className="skills-input"
                  placeholder="Type and press Enter to add a field"
                  value={fieldInput}
                  onChange={(e) => {
                    setFieldInput(e.target.value);
                    setShowFieldDropdown(true);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && fieldInput.trim()) {
                      e.preventDefault();
                      if (
                        fields.length < 5 &&
                        !fields.includes(fieldInput.trim())
                      ) {
                        setFields([...fields, fieldInput.trim()]);
                      }
                      setFieldInput("");
                    }
                  }}
                  onFocus={() => setShowFieldDropdown(true)}
                  onBlur={() =>
                    setTimeout(() => setShowFieldDropdown(false), 150)
                  }
                  disabled={fields.length >= 5}
                />
                {showFieldDropdown && fieldInput && (
                  <div className="skills-dropdown">
                    {filteredFields.length > 0 ? (
                      filteredFields.map((field, index) => (
                        <div
                          key={field + index}
                          className="skills-dropdown-item"
                          onClick={() => {
                            if (fields.length < 5 && !fields.includes(field)) {
                              setFields([...fields, field]);
                            }
                            setFieldInput("");
                            setShowFieldDropdown(false);
                          }}
                        >
                          {field}
                        </div>
                      ))
                    ) : (
                      <div
                        className="skills-dropdown-item"
                        style={{ color: "#888" }}
                      >
                        Press Enter to add "{fieldInput}"
                      </div>
                    )}
                  </div>
                )}
              </div>
              <div className="skills-tags">
                {fields.map((field, idx) => (
                  <span key={field + idx} className="skill-tag">
                    {field}
                    <IoCloseOutline
                      className="remove-skill"
                      onClick={() =>
                        setFields(fields.filter((f) => f !== field))
                      }
                    />
                  </span>
                ))}
              </div>
              <div className="skills-limit">{fields.length}/5 fields added</div>
            </div>
          </div>
          <div className="form-group">
            <label htmlFor="address">
              Address: <span style={{ color: "red" }}>*</span>
            </label>
            <input
              id="address"
              type="text"
              name="address"
              value={formData.address}
              onChange={handleInputChange}
              placeholder="Enter company address"
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="email">
              Email: <span style={{ color: "red" }}>*</span>
            </label>
            <input
              id="email"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              placeholder="Enter company email"
              required
            />
            {formData.email && !emailValid && (
              <span style={{ color: "red" }}>
                Please enter a valid email address.
              </span>
            )}
            {formData.email && emailValid && (
              <span style={{ color: "green" }}>Valid email address.</span>
            )}
          </div>
          <div className="form-group">
            <label htmlFor="contactPersonName">
              Contact Person Name:
            </label>
            <input
              id="contactPersonName"
              type="text"
              name="contactPersonName"
              value={formData.contactPersonName || ""}
              onChange={handleInputChange}
              placeholder="Enter contact person name"
            />
          </div>
          <div className="form-group">
            <label htmlFor="contactPersonEmail">
              Contact Person Email:
            </label>
            <input
              id="contactPersonEmail"
              type="email"
              name="contactPersonEmail"
              value={formData.contactPersonEmail || ""}
              onChange={handleInputChange}
              placeholder="Enter contact person email"
            />
          </div>
          <div className="form-group">
            <label htmlFor="contactPersonPhone">
              Contact Person Phone:
            </label>
            <input
              id="contactPersonPhone"
              type="tel"
              name="contactPersonPhone"
              value={formData.contactPersonPhone || ""}
              onChange={handleInputChange}
              placeholder="Enter contact person phone"
            />
          </div>
          <div className="form-group">
            <label htmlFor="skills">
              Skills Required: <span style={{ color: "red" }}>*</span>
            </label>
            <div className="skills-container">
              <div className="skills-input-wrapper">
                <input
                  type="text"
                  className="skills-input"
                  placeholder="Type and press Enter to add a skill"
                  value={skillInput}
                  onChange={(e) => {
                    setSkillInput(e.target.value);
                    setShowSkillDropdown(true);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && skillInput.trim()) {
                      e.preventDefault();
                      if (
                        skills.length < 15 &&
                        !skills.includes(skillInput.trim())
                      ) {
                        addSkill(skillInput.trim());
                        setSkillInput("");
                      }
                    }
                  }}
                  ref={skillsInputRef}
                />
                {showSkillDropdown && skillInput && (
                  <div className="skills-dropdown">
                    {filteredSkills.length > 0 ? (
                      filteredSkills.map((skill, index) => (
                        <div
                          key={skill + index}
                          className="skills-dropdown-item"
                          onClick={() => addSkill(skill)}
                        >
                          {skill}
                        </div>
                      ))
                    ) : (
                      <div
                        className="skills-dropdown-item"
                        style={{ color: "#888" }}
                      >
                        Press Enter to add "{skillInput}"
                      </div>
                    )}
                  </div>
                )}
              </div>
              <div className="skills-tags">
                {skills.map((skill, idx) => (
                  <span key={skill + idx} className="skill-tag">
                    {skill}
                    <IoCloseOutline
                      className="remove-skill"
                      onClick={() => removeSkill(skill)}
                    />
                  </span>
                ))}
              </div>
              <div className="skills-limit">
                {skills.length}/15 skills added
              </div>
            </div>
          </div>
          <div className="moa-validity-card">
            <div className="moa-toggle">
              <div>
                <span className="moa-title">
                  MOA (Memorandum of Agreement) <span className="moa-required">*</span>
                </span>
                <p className="moa-subtitle">
                  Track current agreements and show validity to students. MOA is required for all companies.
                </p>
              </div>
            </div>
            <div className="moa-validity-input">
              <div className="moa-validity-label">
                <span>Start Date</span>
                <span className="moa-required">*</span>
              </div>
              <div className="moa-input-wrapper">
                <input
                  id="moaStartDate"
                  type="date"
                  name="moaStartDate"
                  value={formData.moaStartDate}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>
            <div className="moa-validity-input">
              <div className="moa-validity-label">
                <span>Validity</span>
                <span className="moa-required">*</span>
              </div>
              <div className="moa-input-wrapper">
                <input
                  id="moaValidityYears"
                  type="number"
                  name="moaValidityYears"
                  min="1"
                  step="1"
                  placeholder="Enter number of years"
                  value={formData.moaValidityYears}
                  onChange={handleInputChange}
                  required
                />
                <span className="moa-unit">years</span>
              </div>
            </div>
            {formData.moaStartDate && formData.moaValidityYears && (
              <div className="moa-expiration-preview">
                <span className="expiration-label">Expiration Date:</span>
                <span className="expiration-value">
                  {(() => {
                    const startDate = new Date(formData.moaStartDate);
                    const years = Number(formData.moaValidityYears);
                    if (!isNaN(years) && years > 0) {
                      const expirationDate = new Date(startDate);
                      expirationDate.setFullYear(expirationDate.getFullYear() + years);
                      return expirationDate.toLocaleDateString('en-US', { 
                        year: 'numeric', 
                        month: 'short', 
                        day: 'numeric' 
                      });
                    }
                    return 'N/A';
                  })()}
                </span>
              </div>
            )}
            <p className="moa-hint">
              This value syncs to the mobile app so interns immediately see how
              long the partnership is active.
            </p>
          </div>
          <div className="form-group">
            <label>
              Mode of Work: <span style={{ color: "red" }}>*</span>
            </label>
            <div className="mode-of-work-options">
              {["On-site", "Remote", "Hybrid"].map((mode) => (
                <label key={mode} className="mode-checkbox">
                  <input
                    type="checkbox"
                    value={mode}
                    checked={formData.modeOfWork.includes(mode)}
                    onChange={handleModeOfWorkChange}
                    required
                  />
                  <span>{mode}</span>
                </label>
              ))}
            </div>
          </div>
        </form>
        <div className="modal-actions">
          {isEditMode ? (
            <button
              type="button"
              className="modal-btn"
              onClick={handleUpdate}
              disabled={isLoading}
            >
              {isLoading ? "Updating..." : "Update"}
            </button>
          ) : (
            <button
              key={localError ? shakeKey : undefined}
              type="button"
              className={`modal-btn${localError ? " error" : ""}`}
              onClick={handleValidatedAdd}
              disabled={isLoading}
            >
              {isLoading ? <span className="spinner"></span> : null}
              {isLoading ? "Adding..." : "Add"}
            </button>
          )}
          <button
            type="button"
            className="modal-btn secondary"
            onClick={() => {
              setIsModalOpen(false);
              setIsEditMode(false);
              setEditCompanyId(null);
              setFormData({
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
                modeOfWork: [],
                contactPersonName: "",
                contactPersonTitle: "",
                contactPersonPhone: "",
              });
              setSkills([]);
              setFields([]);
              setLocalError("");
            }}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

export default CompanyModal;
