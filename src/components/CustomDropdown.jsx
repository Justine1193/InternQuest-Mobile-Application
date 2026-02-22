/**
 * Reusable dropdown with keyboard navigation and portal-rendered list.
 */

import React, { useRef, useState, useEffect, useLayoutEffect } from "react";
import ReactDOM from "react-dom";
import PropTypes from "prop-types";

function CustomDropdown({ options, value = "", onChange }) {
  const [open, setOpen] = useState(false);
  const [listPosition, setListPosition] = useState({
    top: 0,
    left: 0,
    width: 0,
  });
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

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!ref.current) return;
      const triggerEl = ref.current.querySelector(".custom-dropdown-selected");
      const listEl = document.querySelector(".custom-dropdown-list-portaled");
      const inTrigger = triggerEl?.contains(event.target);
      const inList = listEl?.contains(event.target);
      if (!inTrigger && !inList) setOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

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
        const isSelected =
          value === option || (!value && option === options[0]);
        return (
          <div
            key={option}
            className={`custom-dropdown-option${isSelected ? " selected" : ""}`}
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
      {open && document?.body
        ? ReactDOM.createPortal(listContent, document.body)
        : null}
    </div>
  );
}

CustomDropdown.propTypes = {
  options: PropTypes.arrayOf(PropTypes.string).isRequired,
  value: PropTypes.string,
  onChange: PropTypes.func.isRequired,
};

export default CustomDropdown;
