/**
 * Skeleton placeholders for table, card, or default layout.
 */

import React from "react";
import PropTypes from "prop-types";
import "./SkeletonLoader.css";

const SkeletonLoader = ({ type = "table", rows = 5, columns = 5 }) => {
  if (type === "table") {
    return (
      <div className="skeleton-table">
        <div className="skeleton-header">
          {Array.from({ length: columns }, (_, i) => (
            <div key={i} className="skeleton-cell skeleton-header-cell" />
          ))}
        </div>
        {Array.from({ length: rows }, (_, rowIndex) => (
          <div key={rowIndex} className="skeleton-row">
            {Array.from({ length: columns }, (_, colIndex) => (
              <div key={colIndex} className="skeleton-cell" />
            ))}
          </div>
        ))}
      </div>
    );
  }

  if (type === "card") {
    return (
      <div className="skeleton-card">
        <div className="skeleton-card-header" />
        <div className="skeleton-card-body">
          <div className="skeleton-line" />
          <div className="skeleton-line short" />
        </div>
      </div>
    );
  }

  return (
    <div className="skeleton-default">
      <div className="skeleton-line" />
      <div className="skeleton-line" />
      <div className="skeleton-line short" />
    </div>
  );
};

SkeletonLoader.propTypes = {
  type: PropTypes.oneOf(["table", "card", "default"]),
  rows: PropTypes.number,
  columns: PropTypes.number,
};

export default SkeletonLoader;
