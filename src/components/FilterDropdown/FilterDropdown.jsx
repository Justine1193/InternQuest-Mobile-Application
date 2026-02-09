/**
 * FilterDropdown - A component that renders a filter dropdown with various filter options
 * Supports different filter types for companies and students
 */

import React, { useState, useCallback } from "react";
import PropTypes from "prop-types";
import CustomDropdown from "../CustomDropdown.jsx";
import "./FilterDropdown.css";

const DROPDOWN_CLOSE_DELAY = 150;

const FilterDropdown = ({
  pendingFilterValues,
  setPendingFilterValues,
  onApply,
  onReset,
  fieldSuggestions = [],
  sectionSuggestions = [],
  programSuggestions = [],
  type = "company",
}) => {
  const [showFieldDropdown, setShowFieldDropdown] = useState(false);
  const [showSectionDropdown, setShowSectionDropdown] = useState(false);
  const [showProgramDropdown, setShowProgramDropdown] = useState(false);

  // Filter field suggestions based on input
  const filteredFields = fieldSuggestions.filter(
    (field) =>
      field
        .toLowerCase()
        .includes((pendingFilterValues.field || "").toLowerCase()) &&
      field !== pendingFilterValues.field
  );

  // Filter section suggestions based on input
  const filteredSections = sectionSuggestions.filter(
    (section) =>
      section
        .toLowerCase()
        .includes((pendingFilterValues.section || "").toLowerCase()) &&
      section !== pendingFilterValues.section
  );

  // Filter program suggestions based on input
  const filteredPrograms = (programSuggestions || []).filter(
    (program) =>
      program
        .toLowerCase()
        .includes((pendingFilterValues.program || "").toLowerCase()) &&
      program !== pendingFilterValues.program
  );

  // Handle field input change
  const handleFieldChange = useCallback(
    (e) => {
      setPendingFilterValues((f) => ({ ...f, field: e.target.value }));
      setShowFieldDropdown(true);
    },
    [setPendingFilterValues]
  );

  // Handle field selection
  const handleFieldSelect = useCallback(
    (field) => {
      setPendingFilterValues((f) => ({ ...f, field }));
      setShowFieldDropdown(false);
    },
    [setPendingFilterValues]
  );

  // Handle section input change
  const handleSectionChange = useCallback(
    (e) => {
      setPendingFilterValues((f) => ({ ...f, section: e.target.value }));
      setShowSectionDropdown(true);
    },
    [setPendingFilterValues]
  );

  // Handle section selection
  const handleSectionSelect = useCallback(
    (section) => {
      setPendingFilterValues((f) => ({ ...f, section }));
      setShowSectionDropdown(false);
    },
    [setPendingFilterValues]
  );

  // Handle program input change
  const handleProgramChange = useCallback(
    (e) => {
      setPendingFilterValues((f) => ({ ...f, program: e.target.value }));
      setShowProgramDropdown(true);
    },
    [setPendingFilterValues]
  );

  // Handle program selection
  const handleProgramSelect = useCallback(
    (program) => {
      setPendingFilterValues((f) => ({ ...f, program }));
      setShowProgramDropdown(false);
    },
    [setPendingFilterValues]
  );

  // Handle dropdown value change
  const handleDropdownChange = useCallback(
    (key, value) => {
      setPendingFilterValues((f) => ({
        ...f,
        [key]: value === "All" ? "" : value,
      }));
    },
    [setPendingFilterValues]
  );

  return (
    <div
      className="new-filter-dropdown"
      role="dialog"
      aria-label="Filter options"
    >
      {/* Field Input */}
      <div style={{ position: "relative" }}>
        <label className="new-filter-label" htmlFor="field-input">
          Field:
        </label>
        <input
          id="field-input"
          type="text"
          className="new-filter-input"
          value={pendingFilterValues.field}
          onChange={handleFieldChange}
          onFocus={() => setShowFieldDropdown(true)}
          onBlur={() =>
            setTimeout(() => setShowFieldDropdown(false), DROPDOWN_CLOSE_DELAY)
          }
          placeholder="Field"
          aria-label="Filter by field"
        />
        {showFieldDropdown && filteredFields.length > 0 && (
          <div
            className="skills-dropdown"
            role="listbox"
            aria-label="Field suggestions"
          >
            {filteredFields.map((field, idx) => (
              <div
                key={field + idx}
                className="skills-dropdown-item"
                onClick={() => handleFieldSelect(field)}
                role="option"
                aria-selected={pendingFilterValues.field === field}
              >
                {field}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Student-specific filters */}
      {type === "student" && (
        <>
          <div style={{ position: "relative" }}>
            <label className="new-filter-label" htmlFor="program-input">
              Program:
            </label>
            <input
              id="program-input"
              type="text"
              className="new-filter-input"
              value={pendingFilterValues.program || ""}
              onChange={handleProgramChange}
              onFocus={() => setShowProgramDropdown(true)}
              onBlur={() =>
                setTimeout(() => setShowProgramDropdown(false), DROPDOWN_CLOSE_DELAY)
              }
              placeholder="Program"
              aria-label="Filter by program"
            />
            {showProgramDropdown && filteredPrograms.length > 0 && (
              <div
                className="skills-dropdown"
                role="listbox"
                aria-label="Program suggestions"
              >
                {filteredPrograms.map((program, idx) => (
                  <div
                    key={program + idx}
                    className="skills-dropdown-item"
                    onClick={() => handleProgramSelect(program)}
                    role="option"
                    aria-selected={pendingFilterValues.program === program}
                  >
                    {program}
                  </div>
                ))}
              </div>
            )}
          </div>
          <div style={{ position: "relative" }}>
            <label className="new-filter-label" htmlFor="section-input">
              Section:
            </label>
            <input
              id="section-input"
              type="text"
              className="new-filter-input"
              value={pendingFilterValues.section || ""}
              onChange={handleSectionChange}
              onFocus={() => setShowSectionDropdown(true)}
              onBlur={() =>
                setTimeout(() => setShowSectionDropdown(false), DROPDOWN_CLOSE_DELAY)
              }
              placeholder="Section"
              aria-label="Filter by section"
            />
            {showSectionDropdown && filteredSections.length > 0 && (
              <div
                className="skills-dropdown"
                role="listbox"
                aria-label="Section suggestions"
              >
                {filteredSections.map((section, idx) => (
                  <div
                    key={section + idx}
                    className="skills-dropdown-item"
                    onClick={() => handleSectionSelect(section)}
                    role="option"
                    aria-selected={pendingFilterValues.section === section}
                  >
                    {section}
                  </div>
                ))}
              </div>
            )}
          </div>
          <div>
            <label className="new-filter-label" htmlFor="blocked-dropdown">
              Blocked:
            </label>
            <CustomDropdown
              id="blocked-dropdown"
              options={["All", "Blocked", "Not blocked"]}
              value={pendingFilterValues.blocked || "All"}
              onChange={(val) => handleDropdownChange("blocked", val)}
            />
          </div>
          <div>
            <label className="new-filter-label" htmlFor="hired-dropdown">
              Hired:
            </label>
            <CustomDropdown
              id="hired-dropdown"
              options={["All", "Yes", "No"]}
              value={pendingFilterValues.hired || "All"}
              onChange={(val) => handleDropdownChange("hired", val)}
            />
          </div>
          <div>
            <label className="new-filter-label" htmlFor="mode-dropdown">
              Mode of Work:
            </label>
            <CustomDropdown
              id="mode-dropdown"
              options={["All", "Onsite", "Remote", "Hybrid"]}
              value={pendingFilterValues.locationPreference || "All"}
              onChange={(val) =>
                handleDropdownChange("locationPreference", val)
              }
            />
          </div>
        </>
      )}

      {/* Company-specific filters */}
      {type === "company" && (
        <>
          <div>
            <label className="new-filter-label" htmlFor="mode-dropdown">
              Mode of Work:
            </label>
            <CustomDropdown
              id="mode-dropdown"
              options={["All", "On-site", "Remote", "Hybrid"]}
              value={pendingFilterValues.modeOfWork || "All"}
              onChange={(val) => handleDropdownChange("modeOfWork", val)}
            />
          </div>
          <div>
            <label className="new-filter-label" htmlFor="moa-expiration-dropdown">
              MOA Expiration Status:
            </label>
            <CustomDropdown
              id="moa-expiration-dropdown"
              options={["All", "Valid", "Expiring Soon", "Expired"]}
              value={pendingFilterValues.moaExpirationStatus || "All"}
              onChange={(val) => handleDropdownChange("moaExpirationStatus", val)}
            />
            <small style={{ 
              display: 'block', 
              marginTop: '0.25rem', 
              color: '#666', 
              fontSize: '0.75rem',
              fontStyle: 'italic'
            }}>
              Expiring Soon: 30 days or less
            </small>
          </div>
        </>
      )}

      {/* Action Buttons */}
      <div className="filter-actions">
        <button
          className="new-filter-btn"
          onClick={onApply}
          type="button"
          aria-label="Apply filters"
        >
          Apply
        </button>
        <button
          className="new-filter-btn reset"
          onClick={onReset}
          type="button"
          aria-label="Reset filters"
        >
          Reset
        </button>
      </div>
    </div>
  );
};

FilterDropdown.propTypes = {
  /** Current filter values */
  pendingFilterValues: PropTypes.shape({
    field: PropTypes.string,
    program: PropTypes.string,
    section: PropTypes.string,
    hired: PropTypes.string,
    blocked: PropTypes.string,
    locationPreference: PropTypes.string,
    approvedRequirement: PropTypes.string,
    modeOfWork: PropTypes.string,
    moa: PropTypes.string,
  }).isRequired,
  /** Function to update filter values */
  setPendingFilterValues: PropTypes.func.isRequired,
  /** Function to apply filters */
  onApply: PropTypes.func.isRequired,
  /** Function to reset filters */
  onReset: PropTypes.func.isRequired,
  /** List of field suggestions */
  fieldSuggestions: PropTypes.arrayOf(PropTypes.string),
  /** List of section suggestions */
  sectionSuggestions: PropTypes.arrayOf(PropTypes.string),
  /** List of program suggestions for student filter */
  programSuggestions: PropTypes.arrayOf(PropTypes.string),
  /** Type of filter (company or student) */
  type: PropTypes.oneOf(["company", "student"]),
};

FilterDropdown.defaultProps = {
  fieldSuggestions: [],
  sectionSuggestions: [],
  programSuggestions: [],
  type: "company",
};

export default FilterDropdown;
