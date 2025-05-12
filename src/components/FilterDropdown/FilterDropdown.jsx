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
  type = "company",
}) => {
  const [showFieldDropdown, setShowFieldDropdown] = useState(false);

  // Filter field suggestions based on input
  const filteredFields = fieldSuggestions.filter(
    (field) =>
      field
        .toLowerCase()
        .includes((pendingFilterValues.field || "").toLowerCase()) &&
      field !== pendingFilterValues.field
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
          <div>
            <label className="new-filter-label" htmlFor="program-input">
              Program:
            </label>
            <input
              id="program-input"
              type="text"
              className="new-filter-input"
              value={pendingFilterValues.program}
              onChange={(e) =>
                setPendingFilterValues((f) => ({
                  ...f,
                  program: e.target.value,
                }))
              }
              placeholder="Program"
              aria-label="Filter by program"
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
            <label className="new-filter-label" htmlFor="location-dropdown">
              Location Preference:
            </label>
            <CustomDropdown
              id="location-dropdown"
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
            <label className="new-filter-label" htmlFor="moa-dropdown">
              MOA:
            </label>
            <CustomDropdown
              id="moa-dropdown"
              options={["All", "Yes", "No"]}
              value={pendingFilterValues.moa || "All"}
              onChange={(val) => handleDropdownChange("moa", val)}
            />
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
    hired: PropTypes.string,
    locationPreference: PropTypes.string,
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
  /** Type of filter (company or student) */
  type: PropTypes.oneOf(["company", "student"]),
};

FilterDropdown.defaultProps = {
  fieldSuggestions: [],
  type: "company",
};

export default FilterDropdown;
