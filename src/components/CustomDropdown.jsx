/**
 * CustomDropdown - A reusable dropdown component for filter options
 * Supports keyboard navigation and accessibility features
 */

import React, { useRef, useState, useEffect } from "react";
import PropTypes from "prop-types";

// --- CustomDropdown: A custom dropdown component for filter options ---
function CustomDropdown({ options, value, onChange }) {
  const [open, setOpen] = useState(false);
  const ref = useRef();

  // Handle clicks outside dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (ref.current && !ref.current.contains(event.target)) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Handle keyboard navigation
  const handleKeyDown = (e) => {
    switch (e.key) {
      case "Enter":
      case " ":
        e.preventDefault();
        setOpen((o) => !o);
        break;
      case "Escape":
        setOpen(false);
        break;
      default:
        break;
    }
  };

  const handleOptionClick = (option) => {
    onChange(option);
    setOpen(false);
  };

  return (
    <div
      className={`custom-dropdown${open ? " open" : ""}`}
      ref={ref}
      role="combobox"
      aria-expanded={open}
      aria-haspopup="listbox"
    >
      <div
        className="custom-dropdown-selected"
        onClick={() => setOpen((o) => !o)}
        onKeyDown={handleKeyDown}
        tabIndex={0}
        role="button"
        aria-label="Select an option"
      >
        {value || options[0]}
      </div>

      {open && (
        <div
          className="custom-dropdown-list"
          role="listbox"
          aria-label="Available options"
        >
          {options.map((option) => {
            const isSelected = value === option || (!value && option === options[0]);
            return (
              <div
                key={option}
                className={`custom-dropdown-option${
                  isSelected ? " selected" : ""
                }`}
                onClick={() => handleOptionClick(option)}
                role="option"
                aria-selected={isSelected}
                tabIndex={-1}
              >
                {option}
                {isSelected && (
                  <span className="custom-dropdown-checkmark" aria-hidden="true">
                    ✓
                  </span>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

CustomDropdown.propTypes = {
  /** Array of options to display in the dropdown */
  options: PropTypes.arrayOf(PropTypes.string).isRequired,
  /** Currently selected value */
  value: PropTypes.string,
  /** Callback when an option is selected */
  onChange: PropTypes.func.isRequired,
};

CustomDropdown.defaultProps = {
  value: "",
};

export default CustomDropdown;
