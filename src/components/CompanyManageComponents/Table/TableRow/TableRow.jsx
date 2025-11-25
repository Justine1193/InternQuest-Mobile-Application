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
import { IoEllipsisVertical } from "react-icons/io5";
import KebabCell from "../../../KebabcellComponents/KebabCell.jsx";
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

  return (
    <tr className={isSelected ? "selected-row" : ""}>
      {selectionMode && (
        <td className="checkbox-cell">
          <input
            type="checkbox"
            className="table-checkbox"
            checked={isSelected}
            onChange={onSelect}
          />
        </td>
      )}
      <td>{row.companyName}</td>
      <td className="description-cell">
        <div className="description-content">
          {row.companyDescription && row.companyDescription.length > 100
            ? `${row.companyDescription.substring(0, 100)}...`
            : row.companyDescription}
          {row.companyDescription && row.companyDescription.length > 100 && (
            <div className="description-tooltip">{row.companyDescription}</div>
          )}
        </div>
      </td>
      <td>{row.companyAddress}</td>
      <td>
        {row.companyEmail ? (
          <a
            href={`https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(
              row.companyEmail
            )}`}
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: "#1976d2", textDecoration: "underline" }}
          >
            {row.companyEmail}
          </a>
        ) : (
          ""
        )}
      </td>
      <td>
        {row.companyWeb ? (
          <a
            href={
              row.companyWeb.startsWith("http")
                ? row.companyWeb
                : `https://${row.companyWeb}`
            }
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: "#1976d2", textDecoration: "underline" }}
          >
            {row.companyWeb}
          </a>
        ) : (
          ""
        )}
      </td>
      <td>
        <div className="table-fields-tags">
          {Array.isArray(row.fields) &&
            row.fields.map((field, index) => (
              <span key={field + index} className="table-field-tag">
                {field}
              </span>
            ))}
        </div>
      </td>
      <td>
        <div className="table-skills-tags">
          {Array.isArray(skillsToShow) &&
            skillsToShow.map((skill, index) => (
              <span key={skill + index} className="table-skill-tag">
                {skill}
              </span>
            ))}
          {Array.isArray(row.skillsREq) &&
            row.skillsREq.length > 3 &&
            !showAllSkills && (
              <span
                className="table-skill-tag"
                style={{ cursor: "pointer", background: "#555" }}
                onClick={() => setShowAllSkills(true)}
              >
                +{row.skillsREq.length - 3} more
              </span>
            )}
          {Array.isArray(row.skillsREq) &&
            row.skillsREq.length > 3 &&
            showAllSkills && (
              <span
                className="table-skill-tag"
                style={{ cursor: "pointer", background: "#aaa", color: "#222" }}
                onClick={() => setShowAllSkills(false)}
              >
                Show less
              </span>
            )}
        </div>
      </td>
      <td>
        <div className="table-mode-tags">
          {Array.isArray(row.modeOfWork)
            ? row.modeOfWork.map((mode, idx) => (
                <span
                  key={mode + idx}
                  className={`company-table-mode-tag-${mode
                    .replace(/\s+/g, "")
                    .toLowerCase()}`}
                >
                  {mode}
                </span>
              ))
            : row.modeOfWork}
        </div>
      </td>
      <td>
        <input
          type="checkbox"
          className="table-checkbox"
          checked={row.moa === "Yes"}
          readOnly
        />
      </td>
      <td className="moa-validity-cell">
        <span
          className={`moa-validity-pill moa-validity-pill-${moaValidity.variant}`}
        >
          {moaValidity.text}
        </span>
      </td>
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
};

export default TableRow;
