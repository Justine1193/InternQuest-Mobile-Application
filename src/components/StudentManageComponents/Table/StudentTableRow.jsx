import React from "react";
import { IoEllipsisVertical } from "react-icons/io5";
import KebabCell from "../../KebabcellComponents/KebabCell.jsx";
import "./StudentTableRow.css";

const StudentTableRow = ({
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
  setEditStudentId,
  setFormData,
  setSkills,
  setIsModalOpen,
  setSelectionMode,
  setSelectedItems,
  handleDeleteSingle,
  isDeleting,
}) => {
  return (
    <tr className={isSelected ? "student-selected-row" : ""}>
      {selectionMode && (
        <td className="student-checkbox-cell">
          <input
            type="checkbox"
            className="table-checkbox"
            checked={isSelected}
            onChange={onSelect}
          />
        </td>
      )}
      <td>{row.firstName}</td>
      <td>{row.lastName}</td>
      <td>
        {row.email ? (
          <a
            href={`mailto:${row.email}`}
            style={{ color: "#1976d2", textDecoration: "underline" }}
          >
            {row.email}
          </a>
        ) : (
          ""
        )}
      </td>
      <td>{row.contact}</td>
      <td>{row.program}</td>
      <td>{row.field}</td>
      <td>{row.status === "hired" ? "Yes" : "No"}</td>
      <td>
        <div className="student-table-skills-tags">
          {Array.isArray(row.skills) &&
            row.skills.map((skill, index) => {
              let displayValue = "";
              if (typeof skill === "object" && skill !== null) {
                if (
                  typeof skill.id === "string" ||
                  typeof skill.id === "number"
                ) {
                  displayValue = skill.id;
                } else {
                  displayValue = JSON.stringify(skill);
                }
              } else if (
                typeof skill === "string" ||
                typeof skill === "number"
              ) {
                displayValue = skill;
              } else {
                displayValue = String(skill);
              }
              return (
                <span key={index} className="student-table-skill-tag">
                  {displayValue}
                </span>
              );
            })}
        </div>
      </td>
      <td>
        <div className="student-mode-tags">
          {(Array.isArray(row.locationPreference)
            ? row.locationPreference
            : typeof row.locationPreference === "object" &&
              row.locationPreference !== null
            ? Object.entries(row.locationPreference)
                .filter(([_, value]) => value)
                .map(([key]) => key.charAt(0).toUpperCase() + key.slice(1))
            : []
          ).map((mode, idx) => (
            <span
              key={mode + idx}
              className={`student-mode-tag student-mode-tag-${mode
                .replace(/\s+/g, "")
                .toLowerCase()}`}
            >
              {mode}
            </span>
          ))}
        </div>
      </td>
      <td className="student-kebab-cell">
        <KebabCell
          row={row}
          openMenuId={openMenuId}
          setOpenMenuId={setOpenMenuId}
          selectedRowId={selectedRowId}
          setSelectedRowId={setSelectedRowId}
          setIsEditMode={setIsEditMode}
          setEditStudentId={setEditStudentId}
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

export default StudentTableRow;
