/**
 * ColumnToggle Component
 * Allows users to show/hide table columns
 */

import React, { useState, useRef, useEffect } from "react";
import PropTypes from "prop-types";
import {
  IoEyeOutline,
  IoEyeOffOutline,
  IoChevronDownOutline,
} from "react-icons/io5";
import Tooltip from "../Tooltip/Tooltip";
import "./ColumnToggle.css";

const ColumnToggle = ({ columns, visibleColumns, onToggleColumn }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () =>
        document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [isOpen]);

  const handleToggle = (columnKey) => {
    onToggleColumn(columnKey);
  };

  // Essential columns are always visible, so count them separately
  const essentialColumns = [
    "profilePicture",
    "studentNumber",
    "firstName",
    "lastName",
  ];
  const essentialCount = essentialColumns.length;
  const nonEssentialVisible = visibleColumns.filter(
    (key) => !essentialColumns.includes(key)
  ).length;
  const visibleCount = essentialCount + nonEssentialVisible;
  const totalCount = columns.length;

  return (
    <div className="column-toggle-container" ref={dropdownRef}>
      <Tooltip content="Show/Hide Columns" position="bottom">
        <button
          className="column-toggle-btn"
          onClick={() => setIsOpen(!isOpen)}
          aria-label="Toggle column visibility"
          aria-expanded={isOpen}
        >
          <IoEyeOutline className="column-toggle-icon" />
          <span className="column-toggle-text">
            Columns ({visibleCount}/{totalCount})
          </span>
          <IoChevronDownOutline
            className={`column-toggle-chevron ${isOpen ? "open" : ""}`}
          />
        </button>
      </Tooltip>

      {isOpen && (
        <div className="column-toggle-dropdown">
          <div className="column-toggle-header">
            <span>Show/Hide Columns</span>
            <button
              className="column-toggle-select-all"
              onClick={() => {
                // Get non-essential columns
                const essentialColumns = [
                  "profilePicture",
                  "studentNumber",
                  "firstName",
                  "lastName",
                ];
                const nonEssentialColumns = columns.filter(
                  (col) => !essentialColumns.includes(col.key)
                );
                const nonEssentialVisible = visibleColumns.filter(
                  (key) => !essentialColumns.includes(key)
                );

                // Toggle all non-essential columns
                const allNonEssentialVisible =
                  nonEssentialVisible.length === nonEssentialColumns.length;

                // Toggle each non-essential column
                nonEssentialColumns.forEach((col) => {
                  const isCurrentlyVisible = visibleColumns.includes(col.key);
                  if (allNonEssentialVisible && isCurrentlyVisible) {
                    // Hide it
                    handleToggle(col.key);
                  } else if (!allNonEssentialVisible && !isCurrentlyVisible) {
                    // Show it
                    handleToggle(col.key);
                  }
                });
              }}
            >
              {(() => {
                const essentialColumns = [
                  "profilePicture",
                  "studentNumber",
                  "firstName",
                  "lastName",
                ];
                const nonEssentialColumns = columns.filter(
                  (col) => !essentialColumns.includes(col.key)
                );
                const nonEssentialVisible = visibleColumns.filter(
                  (key) => !essentialColumns.includes(key)
                );
                return nonEssentialVisible.length === nonEssentialColumns.length
                  ? "Hide All"
                  : "Show All";
              })()}
            </button>
          </div>
          <div className="column-toggle-list">
            {columns.map((column) => {
              const isEssential = [
                "profilePicture",
                "studentNumber",
                "firstName",
                "lastName",
              ].includes(column.key);
              // Essential columns are always visible, so always show as checked
              const isVisible = isEssential
                ? true
                : visibleColumns.includes(column.key);

              return (
                <label
                  key={column.key}
                  className={`column-toggle-item ${
                    isEssential ? "essential" : ""
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={isVisible}
                    onChange={() => !isEssential && handleToggle(column.key)}
                    disabled={isEssential}
                    aria-label={`Toggle ${column.label} column`}
                  />
                  <span className="column-toggle-label">{column.label}</span>
                  {isEssential && (
                    <span className="column-toggle-essential-badge">
                      Required
                    </span>
                  )}
                </label>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

ColumnToggle.propTypes = {
  columns: PropTypes.arrayOf(
    PropTypes.shape({
      key: PropTypes.string.isRequired,
      label: PropTypes.string.isRequired,
    })
  ).isRequired,
  visibleColumns: PropTypes.arrayOf(PropTypes.string).isRequired,
  onToggleColumn: PropTypes.func.isRequired,
};

export default ColumnToggle;
