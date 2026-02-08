import React, { useState, useEffect } from "react";
import { FaFilter } from "react-icons/fa";
import { IoCloseOutline, IoCloseCircle } from "react-icons/io5";
import "./SearchBar.css";
import FilterDropdown from "../FilterDropdown/FilterDropdown";
import { useSuggestionFields } from "../dashboardUtils";

const SearchBar = ({ onSearch, onFilter, type = "company", filterValues = {}, searchInputRef = null, sectionSuggestions = [], programSuggestions = [] }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [showFilter, setShowFilter] = useState(false);
  const [pendingFilterValues, setPendingFilterValues] = useState({
    field: "",
    modeOfWork: "",
    moaExpirationStatus: "",
    program: "",
    hired: "",
    locationPreference: "",
    approvedRequirement: "",
    blocked: "",
  });
  const fieldSuggestions = useSuggestionFields();

  // Sync pending filters with active filters
  useEffect(() => {
    if (filterValues) {
      setPendingFilterValues(prev => ({ ...prev, ...filterValues }));
    }
  }, [filterValues]);

  const handleSearch = (e) => {
    const value = e.target.value;
    setSearchQuery(value);
    onSearch(value);
  };

  const handleFilterApply = () => {
    onFilter(pendingFilterValues);
    setShowFilter(false);
  };

  const handleFilterReset = () => {
    const reset = type === "student" 
      ? {
          field: "",
          modeOfWork: "",
          moaExpirationStatus: "",
          program: "",
          section: "",
          hired: "",
          locationPreference: "",
          approvedRequirement: "",
          blocked: "",
        }
      : {
          field: "",
          modeOfWork: "",
          moaExpirationStatus: "",
          program: "",
          hired: "",
          locationPreference: "",
          approvedRequirement: "",
          blocked: "",
        };
    setPendingFilterValues(reset);
    onFilter(reset);
    setShowFilter(false);
  };

  const handleClearSearch = () => {
    setSearchQuery("");
    onSearch("");
  };

  // Get active filters for display
  const activeFilters = Object.entries(filterValues || {}).filter(([key, value]) => {
    if (key === 'locationPreference') return false; // Skip old locationPreference
    return value && value !== "" && value !== "All";
  });

  const removeFilter = (filterKey) => {
    const updated = { ...filterValues, [filterKey]: "" };
    onFilter(updated);
  };

  return (
    <div className="new-searchbar-wrapper">
      <form className="new-searchbar" onSubmit={(e) => e.preventDefault()}>
        <span
          className="new-searchbar-btn search-icon"
          style={{ pointerEvents: "none", cursor: "default" }}
        >
          <svg width="20" height="20" fill="none" stroke="#888" strokeWidth="2">
            <circle cx="9" cy="9" r="7" />
            <line x1="15" y1="15" x2="19" y2="19" />
          </svg>
        </span>
        <input
          ref={searchInputRef}
          type="text"
          className="new-searchbar-input"
          placeholder={
            type === "student" ? "Search students... (Ctrl+F)" : "Search companies... (Ctrl+F)"
          }
          value={searchQuery}
          onChange={handleSearch}
        />
        {searchQuery && (
          <button
            type="button"
            className="new-searchbar-btn clear-search-btn"
            onClick={handleClearSearch}
            aria-label="Clear search"
          >
            <IoCloseCircle size={20} />
          </button>
        )}
        <div className="filter-dropdown-container">
          <button
            className={`new-searchbar-btn filter-btn ${activeFilters.length > 0 ? 'has-filters' : ''}`}
            type="button"
            onClick={() => setShowFilter((prev) => !prev)}
            title="Filter"
          >
            <FaFilter size={18} />
            {activeFilters.length > 0 && (
              <span className="filter-badge">{activeFilters.length}</span>
            )}
          </button>
          {showFilter && (
            <FilterDropdown
              pendingFilterValues={pendingFilterValues}
              setPendingFilterValues={setPendingFilterValues}
              onApply={handleFilterApply}
              onReset={handleFilterReset}
              fieldSuggestions={fieldSuggestions}
              sectionSuggestions={sectionSuggestions}
              programSuggestions={programSuggestions}
              type={type}
            />
          )}
        </div>
      </form>
      {activeFilters.length > 0 && (
        <div className="filter-chips">
          {activeFilters.map(([key, value]) => (
            <span key={key} className="filter-chip">
              <span className="filter-chip-label">
                {key === 'field' ? 'Field' : 
                 key === 'modeOfWork' ? 'Mode' :
                 key === 'moaExpirationStatus' ? 'MOA Status' :
                 key === 'program' ? 'Program' :
                 key === 'hired' ? 'Hired' :
                 key === 'blocked' ? 'Blocked' :
                 key === 'approvedRequirement' ? 'Approved' : key}: {value}
              </span>
              <button
                type="button"
                className="filter-chip-remove"
                onClick={() => removeFilter(key)}
                aria-label={`Remove ${key} filter`}
              >
                <IoCloseOutline size={14} />
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
};

export default SearchBar;
