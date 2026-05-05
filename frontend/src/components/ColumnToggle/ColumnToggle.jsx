/**
 * Show/hide table columns with optional essential columns.
 */

import React, { useState, useRef, useEffect } from "react";
import PropTypes from "prop-types";
import { IoEyeOutline, IoChevronDownOutline } from "react-icons/io5";
import Tooltip from "../Tooltip/Tooltip";
import "./ColumnToggle.css";

const ColumnToggle = ({
  columns,
  visibleColumns,
  onToggleColumn,
  essentialColumnKeys = [],
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    if (!isOpen) return;
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  const visibleCount = visibleColumns.length;
  const totalCount = columns.length;

  const nonEssentialColumns = columns.filter(
    (col) => !essentialColumnKeys.includes(col.key)
  );
  const nonEssentialVisible = visibleColumns.filter(
    (key) => !essentialColumnKeys.includes(key)
  );
  const allNonEssentialVisible =
    nonEssentialVisible.length === nonEssentialColumns.length;

  const handleShowHideAll = () => {
    nonEssentialColumns.forEach((col) => {
      const isVisible = visibleColumns.includes(col.key);
      if (allNonEssentialVisible && isVisible) {
        onToggleColumn(col.key);
      } else if (!allNonEssentialVisible && !isVisible) {
        onToggleColumn(col.key);
      }
    });
  };

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
              onClick={handleShowHideAll}
            >
              {allNonEssentialVisible ? "Hide All" : "Show All"}
            </button>
          </div>
          <div className="column-toggle-list">
            {columns.map((column) => {
              const isEssential = essentialColumnKeys.includes(column.key);
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
                    onChange={() =>
                      !isEssential && onToggleColumn(column.key)
                    }
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
  essentialColumnKeys: PropTypes.arrayOf(PropTypes.string),
};

export default ColumnToggle;
