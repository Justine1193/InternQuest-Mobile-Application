import React, { useRef, useState, useEffect } from "react";
import { IoCloseOutline, IoDocumentTextOutline, IoCloudUploadOutline } from "react-icons/io5";
import { storage } from "../../../../firebase";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
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
  const [moaFile, setMoaFile] = useState(null);
  const [moaFileUploading, setMoaFileUploading] = useState(false);
  const [moaFilePreview, setMoaFilePreview] = useState(formData.moaFileUrl || null);
  const moaFileInputRef = useRef(null);

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
    (field) => {
      const matchesInput = fieldInput.trim() === '' || 
        field.toLowerCase().includes(fieldInput.toLowerCase());
      return matchesInput && !fields.includes(field);
    }
  );

  // Debug: Log suggestionFields to console
  useEffect(() => {
    console.log('CompanyModal - suggestionFields:', suggestionFields);
    console.log('CompanyModal - suggestionFields length:', suggestionFields.length);
    console.log('CompanyModal - filteredFields:', filteredFields);
    console.log('CompanyModal - filteredFields length:', filteredFields.length);
  }, [suggestionFields, filteredFields]);

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
      requiresMoaStartDate ||
      !formData.moaFileUrl
    ) {
      setLocalError(
        !formData.moaFileUrl
          ? "Please upload the MOA document. MOA file is required."
          : requiresMoaStartDate
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
    const requiresMoaFile = !formData.moaFileUrl;
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
      requiresMoaStartDate ||
      requiresMoaFile
    ) {
      setLocalError(
        requiresMoaFile
          ? "Please upload the MOA document. MOA file is required."
          : requiresMoaStartDate
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

  // Handle MOA file upload
  const handleMoaFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type (PDF, DOC, DOCX, or image files)
    const validTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'image/jpeg',
      'image/png',
      'image/jpg'
    ];
    
    if (!validTypes.includes(file.type)) {
      setLocalError('Please upload a valid file (PDF, DOC, DOCX, or image)');
      setErrorTrigger((prev) => prev + 1);
      setShakeKey((k) => k + 1);
      if (moaFileInputRef.current) {
        moaFileInputRef.current.value = '';
      }
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      setLocalError('File size must be less than 10MB');
      setErrorTrigger((prev) => prev + 1);
      setShakeKey((k) => k + 1);
      if (moaFileInputRef.current) {
        moaFileInputRef.current.value = '';
      }
      return;
    }

    setMoaFile(file);
    setMoaFileUploading(true);
    setLocalError('');

    try {
      // Create storage path: moa/{companyId or 'temp'}/{timestamp}-{filename}
      const timestamp = Date.now();
      const safeFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
      const storagePath = `moa/${isEditMode && editCompanyId ? editCompanyId : 'temp'}/${timestamp}-${safeFileName}`;
      const storageRef = ref(storage, storagePath);

      // Upload file to Firebase Storage
      await uploadBytes(storageRef, file);

      // Get download URL
      const downloadURL = await getDownloadURL(storageRef);

      // Update formData with file URL
      setFormData((prev) => ({
        ...prev,
        moaFileUrl: downloadURL,
        moaFileName: file.name,
        moaStoragePath: storagePath,
      }));

      setMoaFilePreview(downloadURL);
      setMoaFileUploading(false);
    } catch (error) {
      console.error('Error uploading MOA file:', error);
      setLocalError('Failed to upload MOA file. Please try again.');
      setErrorTrigger((prev) => prev + 1);
      setShakeKey((k) => k + 1);
      setMoaFileUploading(false);
      setMoaFile(null);
      if (moaFileInputRef.current) {
        moaFileInputRef.current.value = '';
      }
    }
  };

  // Reset MOA file when modal closes or edit mode changes
  useEffect(() => {
    if (!open) {
      setMoaFile(null);
      setMoaFilePreview(null);
      if (moaFileInputRef.current) {
        moaFileInputRef.current.value = '';
      }
    }
  }, [open]);

  // Load existing MOA file URL when editing
  useEffect(() => {
    if (isEditMode && formData.moaFileUrl) {
      setMoaFilePreview(formData.moaFileUrl);
    } else if (!isEditMode) {
      setMoaFilePreview(null);
    }
  }, [isEditMode, formData.moaFileUrl]);

  if (!open) return null;
  return (
    <div className="modal">
      <div className="modal-content">
        <div className="modal-header">
          <div className="modal-header-content">
            <h2>{isEditMode ? "Edit Company" : "Add New Company"}</h2>
            <p className="modal-subtitle">
              {isEditMode 
                ? "Update company information and details" 
                : "Fill in the details below to add a new company to the system"}
            </p>
          </div>
          <button
            className="modal-close-btn"
            onClick={() => {
              setIsModalOpen(false);
              setIsEditMode(false);
              setEditCompanyId(null);
            }}
            aria-label="Close modal"
          >
            <IoCloseOutline />
          </button>
        </div>
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
        <form onSubmit={(e) => e.preventDefault()} className="company-form">
          {/* Basic Information Section */}
          <div className="form-section-header">
            <h3 className="form-section-title">Basic Information</h3>
            <p className="form-section-subtitle">Essential details about the company</p>
          </div>
          
          <div className="form-group">
            <label htmlFor="companyName">
              <span className="label-text">Company Name</span>
              <span className="required-asterisk">*</span>
            </label>
            <input
              id="companyName"
              type="text"
              name="companyName"
              value={formData.companyName}
              onChange={handleInputChange}
              placeholder="e.g., Tech Solutions Inc."
              className="form-input"
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="description">
              <span className="label-text">Description</span>
              <span className="required-asterisk">*</span>
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="Provide a brief description of the company, its mission, and what it does..."
              className="form-textarea"
              rows="4"
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="website">
              <span className="label-text">Website</span>
              <span className="optional-badge">Optional</span>
            </label>
            <input
              id="website"
              type="text"
              name="website"
              value={formData.website}
              onChange={handleInputChange}
              placeholder="e.g., www.company.com"
              className="form-input"
            />
            <div className="input-feedback">
              {websiteChecking && (
                <span className="feedback-checking">Checking website...</span>
              )}
              {websiteStatus === "maybe-up" && (
                <span className="feedback-success">✓ Website appears to be reachable</span>
              )}
              {websiteStatus === "down" && (
                <span className="feedback-error">⚠ Website may not be reachable</span>
              )}
            </div>
          </div>
          {/* Field Section */}
          <div className="form-section-divider"></div>
          <div className="form-section-header">
            <h3 className="form-section-title">Company Field</h3>
            <p className="form-section-subtitle">Select the field(s) this company operates in</p>
          </div>
          
          <div className="form-group">
            <label htmlFor="field">
              <span className="label-text">Field</span>
              <span className="required-asterisk">*</span>
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
                {showFieldDropdown && (
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
                    ) : fieldInput ? (
                      <div
                        className="skills-dropdown-item"
                        style={{ color: "#888" }}
                      >
                        Press Enter to add "{fieldInput}"
                      </div>
                    ) : suggestionFields.length === 0 ? (
                      <div
                        className="skills-dropdown-item"
                        style={{ color: "#888" }}
                      >
                        No field suggestions available. Type to add a custom field.
                      </div>
                    ) : null}
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
          {/* Contact Information Section */}
          <div className="form-section-divider"></div>
          <div className="form-section-header">
            <h3 className="form-section-title">Contact Information</h3>
            <p className="form-section-subtitle">Company's primary contact details</p>
          </div>
          
          <div className="form-group">
            <label htmlFor="address">
              <span className="label-text">Address</span>
              <span className="required-asterisk">*</span>
            </label>
            <input
              id="address"
              type="text"
              name="address"
              value={formData.address}
              onChange={handleInputChange}
              placeholder="e.g., 123 Business St., City, Country"
              className="form-input"
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="email">
              <span className="label-text">Email</span>
              <span className="required-asterisk">*</span>
            </label>
            <input
              id="email"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              placeholder="e.g., contact@company.com"
              className="form-input"
              required
            />
            <div className="input-feedback">
              {formData.email && !emailValid && (
                <span className="feedback-error">Please enter a valid email address</span>
              )}
              {formData.email && emailValid && (
                <span className="feedback-success">✓ Valid email address</span>
              )}
            </div>
            <p className="field-hint">This email will be used for both company and contact person communication</p>
          </div>
          {/* Contact Person Section */}
          <div className="form-section-divider"></div>
          <div className="form-section-header">
            <h3 className="form-section-title">Contact Person Information</h3>
            <p className="form-section-subtitle">Optional contact details for the company representative</p>
          </div>
          
          <div className="contact-person-grid">
            <div className="form-group">
              <label htmlFor="contactPersonName">
                <span className="label-text">Contact Person Name</span>
              </label>
              <input
                id="contactPersonName"
                type="text"
                name="contactPersonName"
                value={formData.contactPersonName || ""}
                onChange={handleInputChange}
                placeholder="e.g., John Doe"
                className="form-input"
              />
            </div>
            <div className="form-group">
              <label htmlFor="contactPersonPhone">
                <span className="label-text">Contact Person Phone</span>
              </label>
              <input
                id="contactPersonPhone"
                type="tel"
                name="contactPersonPhone"
                value={formData.contactPersonPhone || ""}
                onChange={handleInputChange}
                placeholder="e.g., +63 912 345 6789"
                className="form-input"
                pattern="[0-9+\s\-()]+"
                maxLength="20"
              />
            </div>
          </div>
          {/* Skills Section */}
          <div className="form-section-divider"></div>
          <div className="form-section-header">
            <h3 className="form-section-title">Skills Required</h3>
            <p className="form-section-subtitle">Add up to 15 skills that are required for this position</p>
          </div>
          
          <div className="form-group">
            <label htmlFor="skills">
              <span className="label-text">Skills Required</span>
              <span className="required-asterisk">*</span>
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
            
            {/* MOA File Upload */}
            <div className="moa-file-upload-section">
              <div className="moa-validity-label">
                <span>MOA Document</span>
                <span className="moa-required">*</span>
              </div>
              <div className="moa-file-upload-wrapper">
                <input
                  ref={moaFileInputRef}
                  type="file"
                  accept=".pdf,.doc,.docx,image/*"
                  onChange={handleMoaFileChange}
                  style={{ display: 'none' }}
                  id="moa-file-input"
                  disabled={moaFileUploading}
                  required
                />
                <label
                  htmlFor="moa-file-input"
                  className={`moa-file-upload-label ${moaFileUploading ? 'uploading' : ''}`}
                >
                  <IoCloudUploadOutline className="upload-icon" />
                  <span>
                    {moaFileUploading
                      ? 'Uploading...'
                      : moaFilePreview
                      ? 'Change MOA File'
                      : 'Upload MOA Document'}
                  </span>
                </label>
                {moaFile && !moaFileUploading && (
                  <span className="moa-file-name">{moaFile.name}</span>
                )}
                {moaFilePreview && (
                  <div className="moa-file-preview">
                    <IoDocumentTextOutline className="file-icon" />
                    <a
                      href={moaFilePreview}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="moa-file-link"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {formData.moaFileName || 'View MOA Document'}
                    </a>
                    <button
                      type="button"
                      className="moa-file-remove"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setMoaFile(null);
                        setMoaFilePreview(null);
                        setFormData((prev) => ({
                          ...prev,
                          moaFileUrl: '',
                          moaFileName: '',
                          moaStoragePath: '',
                        }));
                        if (moaFileInputRef.current) {
                          moaFileInputRef.current.value = '';
                        }
                      }}
                    >
                      <IoCloseOutline />
                    </button>
                  </div>
                )}
              </div>
              <p className="moa-file-hint">
                Upload the signed MOA document (PDF, DOC, DOCX, or image). Max size: 10MB. Required for all companies.
              </p>
            </div>
            
            <p className="moa-hint">
              This value syncs to the mobile app so interns immediately see how
              long the partnership is active.
            </p>
          </div>
          {/* Mode of Work Section */}
          <div className="form-section-divider"></div>
          <div className="form-section-header">
            <h3 className="form-section-title">Work Arrangement</h3>
            <p className="form-section-subtitle">Select the available work modes for this company</p>
          </div>
          
          <div className="form-group">
            <label>
              <span className="label-text">Mode of Work</span>
              <span className="required-asterisk">*</span>
            </label>
            <div className="mode-of-work-options">
              {["On-site", "Remote", "Hybrid"].map((mode) => (
                <label key={mode} className="mode-checkbox">
                  <input
                    type="radio"
                    name="modeOfWork"
                    value={mode}
                    checked={formData.modeOfWork === mode}
                    onChange={handleModeOfWorkChange}
                    required
                  />
                  <span>{mode}</span>
                </label>
              ))}
            </div>
          </div>
        </form>
        <div className="modal-footer">
          <div className="modal-actions">
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
                  moa: true,
                  moaValidityYears: "",
                  moaStartDate: "",
                  modeOfWork: "",
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
            {isEditMode ? (
              <button
                type="button"
                className="modal-btn primary"
                onClick={handleUpdate}
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <span className="spinner"></span>
                    Updating...
                  </>
                ) : (
                  "Update Company"
                )}
              </button>
            ) : (
              <button
                key={localError ? shakeKey : undefined}
                type="button"
                className={`modal-btn primary${localError ? " error" : ""}`}
                onClick={handleValidatedAdd}
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <span className="spinner"></span>
                    Adding...
                  </>
                ) : (
                  "Add Company"
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default CompanyModal;
