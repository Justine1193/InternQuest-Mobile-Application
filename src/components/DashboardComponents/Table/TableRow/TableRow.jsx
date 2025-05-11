import React from "react";
import { IoEllipsisVertical } from "react-icons/io5";
import KebabCell from "../../../KebabcellComponents/KebabCell.jsx";
import "./TableRow.css";

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
          {Array.isArray(row.skillsREq) &&
            row.skillsREq.map((skill, index) => (
              <span key={skill + index} className="table-skill-tag">
                {skill}
              </span>
            ))}
        </div>
      </td>
      <td>
        <div className="table-mode-tags">
          {Array.isArray(row.modeOfWork)
            ? row.modeOfWork.map((mode, idx) => (
                <span
                  key={mode + idx}
                  className={`mode-tag mode-tag-${mode
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
        />
      </td>
    </tr>
  );
};

export default TableRow;
