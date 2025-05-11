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
    if (
      !formData.companyName.trim() ||
      !formData.description.trim() ||
      !formData.website.trim() ||
      !formData.address.trim() ||
      !formData.email.trim() ||
      skills.length === 0 ||
      fields.length === 0 ||
      !formData.modeOfWork ||
      formData.modeOfWork.length === 0
    ) {
      setLocalError("Please fill in all required fields.");
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
      handleUpdateEntry();
    }
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

  if (!open) return null;
  return (
    <div className="modal">
      <div className="modal-content">
        <h2>{isEditMode ? "Edit Company" : "Add New Company"}</h2>
        {(error || localError) && (
          <div className="modal-error-message">
            {error || localError}
            <IoCloseOutline
              className="error-icon"
              onClick={() => {
                setError(null);
                setLocalError("");
              }}
            />
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
            <label htmlFor="website">
              Website: <span style={{ color: "red" }}>*</span>
            </label>
            <input
              id="website"
              type="text"
              name="website"
              value={formData.website}
              onChange={handleInputChange}
              placeholder="Enter company website"
              required
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
                        setFieldInput("");
                      }
                    }
                  }}
                  onFocus={() => setShowFieldDropdown(true)}
                  onBlur={() =>
                    setTimeout(() => setShowFieldDropdown(false), 150)
                  }
                />
                {showFieldDropdown && fieldInput && (
                  <div className="skills-dropdown">
                    {filteredFields.length > 0 ? (
                      filteredFields.map((field, index) => (
                        <div
                          key={field + index}
                          className="skills-dropdown-item"
                          onClick={() => {
                            if (fields.length < 15 && !fields.includes(field)) {
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
          <div className="form-group">
            <label htmlFor="moa" className="checkbox-label">
              <input
                id="moa"
                type="checkbox"
                name="moa"
                checked={formData.moa}
                onChange={handleInputChange}
              />
              <span>MOA (Memorandum of Agreement)</span>
            </label>
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
              key={localError ? shakeKey : undefined}
              type="button"
              className={`modal-btn${localError ? " error" : ""}`}
              onClick={handleValidatedUpdate}
              disabled={isLoading}
            >
              {isLoading ? <span className="spinner"></span> : null}
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
                moa: false,
                modeOfWork: [],
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
