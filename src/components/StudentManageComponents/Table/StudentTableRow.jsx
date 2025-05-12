import React, { useState } from "react";
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
  const [showAllSkills, setShowAllSkills] = useState(false);

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
            (showAllSkills ? row.skills : row.skills.slice(0, 3)).map(
              (skill, index) => {
                let displayValue = "";
                if (typeof skill === "object" && skill !== null) {
                  if (
                    typeof skill.id === "string" ||
                    typeof skill.id === "number"
                  ) {
                    displayValue = String(skill.id);
                  } else if (Object.keys(skill).length > 0) {
                    displayValue = JSON.stringify(skill);
                  } else {
                    displayValue = "[object]";
                  }
                } else if (
                  typeof skill === "string" ||
                  typeof skill === "number"
                ) {
                  displayValue = String(skill);
                } else {
                  displayValue = String(skill);
                }
                return (
                  <span key={index} className="student-table-skill-tag">
                    {displayValue}
                  </span>
                );
              }
            )}
          {Array.isArray(row.skills) &&
            row.skills.length > 3 &&
            !showAllSkills && (
              <span
                className="student-table-skill-tag"
                style={{ cursor: "pointer", background: "#555" }}
                onClick={() => setShowAllSkills(true)}
              >
                +{row.skills.length - 3} more
              </span>
            )}
          {Array.isArray(row.skills) &&
            row.skills.length > 3 &&
            showAllSkills && (
              <span
                className="student-table-skill-tag"
                style={{ cursor: "pointer", background: "#aaa", color: "#222" }}
                onClick={() => setShowAllSkills(false)}
              >
                Show less
              </span>
            )}
        </div>
      </td>
      <td>
        <div className="student-table-mode-tags">
          {
            // Convert object to array if needed
            (Array.isArray(row.locationPreference)
              ? row.locationPreference
              : typeof row.locationPreference === "object" &&
                row.locationPreference !== null
              ? Object.entries(row.locationPreference)
                  .filter(
                    ([key, value]) =>
                      ["onsite", "remote", "hybrid"].includes(
                        key.toLowerCase()
                      ) && value
                  )
                  .map(([key]) => key.charAt(0).toUpperCase() + key.slice(1))
              : []
            ).map((mode, idx) => (
              <span
                key={mode + idx}
                className={`student-table-mode-tag-${mode
                  .replace(/\s+/g, "")
                  .toLowerCase()}`}
              >
                {mode}
              </span>
            ))
          }
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
