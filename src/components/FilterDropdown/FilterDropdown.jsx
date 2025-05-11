import React, { useState } from "react";
import CustomDropdown from "../CustomDropdown.jsx";
import "./FilterDropdown.css";

const FilterDropdown = ({
  pendingFilterValues,
  setPendingFilterValues,
  onApply,
  onReset,
  fieldSuggestions = [],
  type = "company",
}) => {
  const [showFieldDropdown, setShowFieldDropdown] = useState(false);

  const filteredFields = fieldSuggestions.filter(
    (field) =>
      field
        .toLowerCase()
        .includes((pendingFilterValues.field || "").toLowerCase()) &&
      field !== pendingFilterValues.field
  );

  return (
    <div className="new-filter-dropdown">
      <div style={{ position: "relative" }}>
        <label className="new-filter-label">Field:</label>
        <input
          type="text"
          className="new-filter-input"
          value={pendingFilterValues.field}
          onChange={(e) => {
            setPendingFilterValues((f) => ({ ...f, field: e.target.value }));
            setShowFieldDropdown(true);
          }}
          onFocus={() => setShowFieldDropdown(true)}
          onBlur={() => setTimeout(() => setShowFieldDropdown(false), 150)}
          placeholder="Field"
        />
        {showFieldDropdown && filteredFields.length > 0 && (
          <div className="skills-dropdown">
            {filteredFields.map((field, idx) => (
              <div
                key={field + idx}
                className="skills-dropdown-item"
                onClick={() => {
                  setPendingFilterValues((f) => ({ ...f, field }));
                  setShowFieldDropdown(false);
                }}
              >
                {field}
              </div>
            ))}
          </div>
        )}
      </div>
      {type === "student" ? (
        <>
          <div>
            <label className="new-filter-label">Program:</label>
            <input
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
            />
          </div>
          <div>
            <label className="new-filter-label">Hired:</label>
            <CustomDropdown
              options={["All", "Yes", "No"]}
              value={pendingFilterValues.hired || "All"}
              onChange={(val) =>
                setPendingFilterValues((f) => ({
                  ...f,
                  hired: val === "All" ? "" : val,
                }))
              }
            />
          </div>
          <div>
            <label className="new-filter-label">Location Preference:</label>
            <CustomDropdown
              options={["All", "Onsite", "Remote", "Hybrid"]}
              value={pendingFilterValues.locationPreference || "All"}
              onChange={(val) =>
                setPendingFilterValues((f) => ({
                  ...f,
                  locationPreference: val === "All" ? "" : val,
                }))
              }
            />
          </div>
        </>
      ) : (
        <>
          <div>
            <label className="new-filter-label">Mode of Work:</label>
            <CustomDropdown
              options={["All", "On-site", "Remote", "Hybrid"]}
              value={pendingFilterValues.modeOfWork || "All"}
              onChange={(val) =>
                setPendingFilterValues((f) => ({
                  ...f,
                  modeOfWork: val === "All" ? "" : val,
                }))
              }
            />
          </div>
          <div>
            <label className="new-filter-label">MOA:</label>
            <CustomDropdown
              options={["All", "Yes", "No"]}
              value={pendingFilterValues.moa || "All"}
              onChange={(val) =>
                setPendingFilterValues((f) => ({
                  ...f,
                  moa: val === "All" ? "" : val,
                }))
              }
            />
          </div>
        </>
      )}
      <button className="new-filter-btn" onClick={onApply} type="button">
        Apply
      </button>
      <button className="new-filter-btn reset" onClick={onReset} type="button">
        Reset
      </button>
    </div>
  );
};

export default FilterDropdown;
