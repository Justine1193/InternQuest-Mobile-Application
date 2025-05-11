import React, { useState } from "react";
import { FaFilter } from "react-icons/fa";
import "./SearchBar.css";
import FilterDropdown from "../FilterDropdown/FilterDropdown";
import { useSuggestionFields } from "../dashboardUtils";

const SearchBar = ({ onSearch, onFilter, type = "company" }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [showFilter, setShowFilter] = useState(false);
  const [pendingFilterValues, setPendingFilterValues] = useState({
    field: "",
    modeOfWork: "",
    moa: "",
    program: "",
    hired: "",
    locationPreference: "",
  });
  const fieldSuggestions = useSuggestionFields();

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
    const reset = {
      field: "",
      modeOfWork: "",
      moa: "",
      program: "",
      hired: "",
      locationPreference: "",
    };
    setPendingFilterValues(reset);
    onFilter(reset);
    setShowFilter(false);
  };

  return (
    <div className="new-searchbar-wrapper">
      <form className="new-searchbar" onSubmit={(e) => e.preventDefault()}>
        <span
          className="new-searchbar-btn"
          style={{ pointerEvents: "none", cursor: "default" }}
        >
          <svg width="20" height="20" fill="none" stroke="#888" strokeWidth="2">
            <circle cx="9" cy="9" r="7" />
            <line x1="15" y1="15" x2="19" y2="19" />
          </svg>
        </span>
        <input
          type="text"
          className="new-searchbar-input"
          placeholder={
            type === "student" ? "Search students..." : "Search companies..."
          }
          value={searchQuery}
          onChange={handleSearch}
        />
        <div className="filter-dropdown-container">
          <button
            className="new-searchbar-btn"
            type="button"
            onClick={() => setShowFilter((prev) => !prev)}
          >
            <FaFilter size={18} />
          </button>
          {showFilter && (
            <FilterDropdown
              pendingFilterValues={pendingFilterValues}
              setPendingFilterValues={setPendingFilterValues}
              onApply={handleFilterApply}
              onReset={handleFilterReset}
              fieldSuggestions={fieldSuggestions}
              type={type}
            />
          )}
        </div>
      </form>
    </div>
  );
};

export default SearchBar;
