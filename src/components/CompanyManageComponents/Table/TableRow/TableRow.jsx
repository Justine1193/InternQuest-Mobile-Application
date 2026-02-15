/**
 * TableRow - Renders a single row in the company table, including fields, skills, mode, MOA, and kebab menu
 *
 * @component
 * @param {object} row - The company data for this row
 * @param {function} onEdit - Handler for editing this company
 * @param {function} onDelete - Handler for deleting this company
 * @param {boolean} isSelected - Whether this row is selected
 * @param {function} onSelect - Handler for selecting this row
 * @param {boolean} selectionMode - Whether selection mode is active
 * @param {any} openMenuId - ID of the open kebab menu
 * @param {function} setOpenMenuId - Setter for openMenuId
 * @param {any} selectedRowId - ID of the selected row
 * @param {function} setSelectedRowId - Setter for selectedRowId
 * @param {function} setIsEditMode - Setter for edit mode
 * @param {function} setEditCompanyId - Setter for edit company ID
 * @param {function} setFormData - Setter for form data
 * @param {function} setSkills - Setter for skills
 * @param {function} setIsModalOpen - Setter for modal open state
 * @param {function} setSelectionMode - Setter for selection mode
 * @param {function} setSelectedItems - Setter for selected items
 * @param {function} handleDeleteSingle - Handler for deleting a single company
 * @param {boolean} isDeleting - Whether a delete operation is in progress
 * @example
 * <TableRow row={row} ...props />
 */

import React, { useState } from "react";
import PropTypes from "prop-types";
import {
  IoWarningOutline,
  IoAlertCircle,
  IoDocumentTextOutline,
} from "react-icons/io5";
import KebabCell from "../../../KebabcellComponents/KebabCell.jsx";
import { MOA_EXPIRING_SOON_DAYS } from "../../../../utils/moaUtils.js";
import "./TableRow.css";

// Renders a single company table row, including fields, skills, mode, MOA, and kebab menu
const TableRow = ({
  row,
  onEdit,
  onDelete,
  isSelected,
  onSelect,
  selectionMode,
  openMenuId,
  setOpenMenuId,
  selectedRowId,
  setSelectedRowId,
  setIsEditMode,
  setEditCompanyId,
  setFormData,
  setSkills,
  setIsModalOpen,
  setSelectionMode,
  setSelectedItems,
  handleDeleteSingle,
  isDeleting,
  onRowClick,
  isReadOnly = false,
}) => {
  // State for toggling skill tag expansion
  const [showAllSkills, setShowAllSkills] = useState(false);
  // Determine which skills to show (first 3 or all)
  const skillsToShow = showAllSkills
    ? row.skillsREq
    : Array.isArray(row.skillsREq)
    ? row.skillsREq.slice(0, 3)
    : [];
  const getMoaValidityDisplay = () => {
    if (row.moa !== "Yes") {
      return { text: "No MOA", variant: "muted" };
    }
    const years = Number(row.moaValidityYears);
    if (!Number.isNaN(years) && years > 0) {
      return {
        text: `${years} year${years > 1 ? "s" : ""}`,
        variant: "active",
      };
    }
    return { text: "Not set", variant: "warning" };
  };
  const moaValidity = getMoaValidityDisplay();

  // Check if MOA is expiring soon (within 30 days) or expired
  const getMoaExpirationStatus = () => {
    if (row.moa !== "Yes" || !row.moaExpirationDate) {
      return null;
    }

    try {
      const expirationDate = new Date(row.moaExpirationDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const expDate = new Date(expirationDate);
      expDate.setHours(0, 0, 0, 0);

      const daysUntilExpiration = Math.ceil(
        (expDate - today) / (1000 * 60 * 60 * 24)
      );

      if (daysUntilExpiration < 0) {
        return { status: "expired", days: Math.abs(daysUntilExpiration) };
      } else if (daysUntilExpiration <= MOA_EXPIRING_SOON_DAYS) {
        return { status: "expiring-soon", days: daysUntilExpiration };
      }
      return null;
    } catch (e) {
      return null;
    }
  };

  const expirationStatus = getMoaExpirationStatus();

  const handleRowClick = (e) => {
    // Don't trigger if clicking on checkbox, kebab menu, links, or interactive elements
    const target = e.target;
    const isCheckbox =
      target.type === "checkbox" ||
      target.closest(".table-checkbox") ||
      target.closest('input[type="checkbox"]');
    const isKebab =
      target.closest(".kebab-cell") || target.closest('[class*="kebab"]');
    const isLink = target.tagName === "A" || target.closest("a");
    const isButton = target.tagName === "BUTTON" || target.closest("button");
    const isClickableTag =
      target.closest(".table-skill-tag") || target.closest(".table-field-tag");

    if (isCheckbox || isKebab || isLink || isButton || isClickableTag) {
      return;
    }

    // Prevent default and stop propagation
    e.preventDefault();
    e.stopPropagation();

    if (onRowClick && typeof onRowClick === "function") {
      onRowClick(row);
    }
  };

  // Add class for expiring/expired MOA
  const rowClassName = [
    isSelected ? "selected-row" : "",
    onRowClick ? "clickable-row" : "",
    expirationStatus?.status === "expiring-soon" ? "moa-expiring-soon" : "",
    expirationStatus?.status === "expired" ? "moa-expired" : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <tr className={rowClassName} onClick={handleRowClick}>
      {selectionMode ? (
        <td className="checkbox-cell">
          <input
            type="checkbox"
            className="table-checkbox"
            checked={isSelected}
            onChange={onSelect}
          />
        </td>
      ) : null}
      <td className="company-name-cell">
        <div className="company-name-content" title={row.companyName}>
          <span className="company-name-text">{row.companyName}</span>
          {expirationStatus ? (
            <span
              className={`moa-warning-badge ${expirationStatus.status}`}
              title={
                expirationStatus.status === "expired"
                  ? `MOA expired ${expirationStatus.days} day${
                      expirationStatus.days !== 1 ? "s" : ""
                    } ago`
                  : `MOA expiring in ${expirationStatus.days} day${
                      expirationStatus.days !== 1 ? "s" : ""
                    }`
              }
            >
              {expirationStatus.status === "expired" ? (
                <IoAlertCircle className="warning-icon" />
              ) : (
                <IoWarningOutline className="warning-icon" />
              )}
            </span>
          ) : null}
          <div className="company-name-tooltip">{row.companyName}</div>
        </div>
      </td>
      <td>
        <div className="table-fields-tags">
          {Array.isArray(row.fields) && row.fields.length > 0
            ? row.fields.map((field, index) => (
                <span key={field + index} className="table-field-tag">
                  {field}
                </span>
              ))
            : null}
        </div>
      </td>
      <td>
        <div className="table-skills-tags">
          {Array.isArray(skillsToShow) && skillsToShow.length > 0
            ? skillsToShow.map((skill, index) => (
                <span key={skill + index} className="table-skill-tag">
                  {skill}
                </span>
              ))
            : null}
          {Array.isArray(row.skillsREq) &&
          row.skillsREq.length > 3 &&
          !showAllSkills ? (
            <span
              className="table-skill-tag"
              style={{ cursor: "pointer", background: "#555" }}
              onClick={() => setShowAllSkills(true)}
            >
              +{row.skillsREq.length - 3} more
            </span>
          ) : null}
          {Array.isArray(row.skillsREq) &&
          row.skillsREq.length > 3 &&
          showAllSkills ? (
            <span
              className="table-skill-tag"
              style={{ cursor: "pointer", background: "#aaa", color: "#222" }}
              onClick={() => setShowAllSkills(false)}
            >
              Show less
            </span>
          ) : null}
        </div>
      </td>
      <td>
        <div className="table-mode-tags">
          {Array.isArray(row.modeOfWork) && row.modeOfWork.length > 0 ? (
            row.modeOfWork.map((mode, idx) => (
              <span
                key={mode + idx}
                className={`company-table-mode-tag-${mode
                  .replace(/\s+/g, "")
                  .toLowerCase()}`}
              >
                {mode}
              </span>
            ))
          ) : row.modeOfWork && !Array.isArray(row.modeOfWork) ? (
            <span
              className={`company-table-mode-tag-${row.modeOfWork
                .replace(/\s+/g, "")
                .toLowerCase()}`}
            >
              {row.modeOfWork}
            </span>
          ) : null}
        </div>
      </td>
      <td className="moa-validity-cell">
        <span
          className={`moa-validity-pill moa-validity-pill-${moaValidity.variant}`}
        >
          {moaValidity.text}
        </span>
      </td>
      <td className="moa-expiration-cell">
        {(() => {
          if (row.moa !== "Yes" || !row.moaExpirationDate) {
            return <span className="moa-expiration-text muted">N/A</span>;
          }

          const expirationDate = new Date(row.moaExpirationDate);
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          const expDate = new Date(expirationDate);
          expDate.setHours(0, 0, 0, 0);

          const daysUntilExpiration = Math.ceil(
            (expDate - today) / (1000 * 60 * 60 * 24)
          );
          const isExpired = daysUntilExpiration < 0;
          const isExpiringSoon =
            daysUntilExpiration >= 0 &&
            daysUntilExpiration <= MOA_EXPIRING_SOON_DAYS;

          let statusClass = "valid";
          let statusText = expirationDate.toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
          });

          if (isExpired) {
            statusClass = "expired";
            statusText = `Expired ${Math.abs(daysUntilExpiration)} day${
              Math.abs(daysUntilExpiration) !== 1 ? "s" : ""
            } ago`;
          } else if (isExpiringSoon) {
            statusClass = "expiring-soon";
            statusText = `${daysUntilExpiration} day${
              daysUntilExpiration !== 1 ? "s" : ""
            } left`;
          }

          return (
            <span
              className={`moa-expiration-text ${statusClass}`}
              title={expirationDate.toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            >
              {statusText}
            </span>
          );
        })()}
      </td>
      <td className="moa-file-cell">
        {row.moaFileUrl ? (
          <a
            href={row.moaFileUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="moa-file-btn"
            onClick={(e) => e.stopPropagation()}
            title={row.moaFileName || "View MOA Document"}
          >
            <IoDocumentTextOutline className="moa-file-btn-icon" />
            <span>View</span>
          </a>
        ) : (
          <span className="moa-file-none">No file</span>
        )}
      </td>
      {!isReadOnly ? (
        <td className="kebab-cell">
          <KebabCell
            row={row}
            openMenuId={openMenuId}
            setOpenMenuId={setOpenMenuId}
            selectedRowId={selectedRowId}
            setSelectedRowId={setSelectedRowId}
            setIsEditMode={setIsEditMode}
            setEditCompanyId={setEditCompanyId}
            setFormData={setFormData}
            setSkills={setSkills}
            setIsModalOpen={setIsModalOpen}
            setSelectionMode={setSelectionMode}
            setSelectedItems={setSelectedItems}
            handleDeleteSingle={handleDeleteSingle}
            isDeleting={isDeleting}
            onEdit={onEdit}
          />
        </td>
      ) : null}
    </tr>
  );
};

TableRow.propTypes = {
  row: PropTypes.object.isRequired,
  onEdit: PropTypes.func,
  onDelete: PropTypes.func,
  isSelected: PropTypes.bool,
  onSelect: PropTypes.func,
  selectionMode: PropTypes.bool,
  openMenuId: PropTypes.any,
  setOpenMenuId: PropTypes.func,
  selectedRowId: PropTypes.any,
  setSelectedRowId: PropTypes.func,
  setIsEditMode: PropTypes.func,
  setEditCompanyId: PropTypes.func,
  setFormData: PropTypes.func,
  setSkills: PropTypes.func,
  setIsModalOpen: PropTypes.func,
  setSelectionMode: PropTypes.func,
  setSelectedItems: PropTypes.func,
  handleDeleteSingle: PropTypes.func,
  isDeleting: PropTypes.bool,
  onRowClick: PropTypes.func,
};

export default TableRow;
