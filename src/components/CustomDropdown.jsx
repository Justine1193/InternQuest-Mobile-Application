/**
 * CustomDropdown - A reusable dropdown component for filter options
 * Supports keyboard navigation and accessibility features.
 * Renders the options list in a portal so it is not clipped by parent overflow (e.g. filter panel).
 */

import React, { useRef, useState, useEffect, useLayoutEffect } from "react";
import ReactDOM from "react-dom";
import PropTypes from "prop-types";

// --- CustomDropdown: A custom dropdown component for filter options ---
function CustomDropdown({ options, value = "", onChange }) {
  const [open, setOpen] = useState(false);
  const [listPosition, setListPosition] = useState({ top: 0, left: 0, width: 0 });
  const ref = useRef();
  const triggerRef = useRef();

  const updateListPosition = () => {
    if (!triggerRef.current) return;
    const rect = triggerRef.current.getBoundingClientRect();
    setListPosition({
      top: rect.bottom + 4,
      left: rect.left,
      width: rect.width,
    });
  };

  useLayoutEffect(() => {
    if (!open) return;
    updateListPosition();
    window.addEventListener("resize", updateListPosition);
    window.addEventListener("scroll", updateListPosition, true);
    return () => {
      window.removeEventListener("resize", updateListPosition);
      window.removeEventListener("scroll", updateListPosition, true);
    };
  }, [open]);

  // Handle clicks outside dropdown (trigger is in ref, list is in portal so check both)
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!ref.current) return;
      const triggerEl = ref.current.querySelector(".custom-dropdown-selected");
      const listEl = document.querySelector(".custom-dropdown-list-portaled");
      const inTrigger = triggerEl && triggerEl.contains(event.target);
      const inList = listEl && listEl.contains(event.target);
      if (!inTrigger && !inList) {
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

  const listContent = open ? (
    <div
      className="custom-dropdown-list custom-dropdown-list-portaled"
      role="listbox"
      aria-label="Available options"
      style={{
        position: "fixed",
        top: listPosition.top,
        left: listPosition.left,
        width: listPosition.width,
        maxWidth: listPosition.width,
        minWidth: 0,
        zIndex: 10001,
      }}
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
  ) : null;

  return (
    <div
      className={`custom-dropdown${open ? " open" : ""}`}
      ref={ref}
      role="combobox"
      aria-expanded={open}
      aria-haspopup="listbox"
    >
      <div
        ref={triggerRef}
        className="custom-dropdown-selected"
        onClick={() => setOpen((o) => !o)}
        onKeyDown={handleKeyDown}
        tabIndex={0}
        role="button"
        aria-label="Select an option"
      >
        {value || options[0]}
      </div>

      {open && typeof document !== "undefined" && document.body
        ? ReactDOM.createPortal(listContent, document.body)
        : null}
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

export default CustomDropdown;
