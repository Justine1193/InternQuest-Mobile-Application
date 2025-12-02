/**
 * StudentTableRow - Renders a single row in the student table, including skills, location, and kebab menu
 *
 * @component
 * @param {object} row - The student data for this row
 * @param {function} onEdit - Handler for editing this student
 * @param {function} onDelete - Handler for deleting this student
 * @param {boolean} isSelected - Whether this row is selected
 * @param {function} onSelect - Handler for selecting this row
 * @param {boolean} selectionMode - Whether selection mode is active
 * @param {any} openMenuId - ID of the open kebab menu
 * @param {function} setOpenMenuId - Setter for openMenuId
 * @param {any} selectedRowId - ID of the selected row
 * @param {function} setSelectedRowId - Setter for selectedRowId
 * @param {function} setIsEditMode - Setter for edit mode
 * @param {function} setEditStudentId - Setter for edit student ID
 * @param {function} setFormData - Setter for form data
 * @param {function} setSkills - Setter for skills
 * @param {function} setIsModalOpen - Setter for modal open state
 * @param {function} setSelectionMode - Setter for selection mode
 * @param {function} setSelectedItems - Setter for selected items
 * @param {function} handleDeleteSingle - Handler for deleting a single student
 * @param {boolean} isDeleting - Whether a delete operation is in progress
 * @example
 * <StudentTableRow row={row} ...props />
 */

import React, { useState } from "react";
import PropTypes from "prop-types";
import { IoEllipsisVertical } from "react-icons/io5";
import { getStorage, ref, getDownloadURL } from "firebase/storage";
import { storage } from "../../../../firebase.js";
import KebabCell from "../../KebabcellComponents/KebabCell.jsx";
import "./StudentTableRow.css";

// Renders a single student table row, including skills, location, and kebab menu
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
  onRowClick,
}) => {
  // State for toggling skill tag expansion
  const [showAllSkills, setShowAllSkills] = useState(false);
  const [profilePictureUrl, setProfilePictureUrl] = useState(null);
  const [profilePictureError, setProfilePictureError] = useState(false);

  // Fetch profile picture URL
  React.useEffect(() => {
    const fetchProfilePicture = async () => {
      if (!row?.id) return;

      // Check Firestore profilePictureUrl first (fastest)
      if (row.profilePictureUrl) {
        setProfilePictureUrl(row.profilePictureUrl);
        setProfilePictureError(false);
        return;
      }

      // Only try Storage if user might have a picture (has avatarBase64)
      // Skip Storage check if user has no avatarBase64 and no profilePictureUrl
      // This prevents unnecessary 404 errors
      if (!row.avatarBase64 && !row.avatarbase64) {
        setProfilePictureError(true);
        return;
      }

      // Try Storage - migration creates profile.jpg or profile.png
      const fileNames = ["profile.jpg", "profile.png"];
      let found = false;

      for (const fileName of fileNames) {
        try {
          const profileRef = ref(
            storage,
            `profilePictures/${row.id}/${fileName}`
          );
          const url = await getDownloadURL(profileRef);
          setProfilePictureUrl(url);
          setProfilePictureError(false);
          found = true;
          break;
        } catch (e) {
          // Silently continue if file doesn't exist
          // This means migration hasn't run yet or file doesn't exist
          continue;
        }
      }

      if (!found) {
        setProfilePictureError(true);
      }
    };

    fetchProfilePicture();
  }, [row?.id, row?.profilePictureUrl, row?.avatarBase64, row?.avatarbase64]);

  const handleRowClick = () => {
    if (selectionMode) return;
    if (typeof onRowClick === "function") {
      onRowClick(row);
    }
  };

  const getCompanyName = () => {
    if (!row) return "";
    if (typeof row.company === "string" && row.company.trim())
      return row.company;
    if (typeof row.companyName === "string" && row.companyName.trim())
      return row.companyName;
    if (typeof row.assignedCompany === "string" && row.assignedCompany.trim())
      return row.assignedCompany;
    if (row.company && typeof row.company === "object" && row.company.name) {
      return row.company.name;
    }
    return "";
  };

  return (
    <tr
      className={isSelected ? "student-selected-row" : ""}
      onClick={handleRowClick}
      style={{ cursor: selectionMode ? "default" : "pointer" }}
    >
      {selectionMode && (
        <td
          className="student-checkbox-cell"
          onClick={(event) => event.stopPropagation()}
        >
          <input
            type="checkbox"
            className="table-checkbox"
            checked={isSelected}
            onChange={onSelect}
          />
        </td>
      )}
      <td className="student-profile-picture-cell">
        {profilePictureUrl ? (
          <img
            src={profilePictureUrl}
            alt={`${row.firstName} ${row.lastName}`}
            className="student-profile-picture"
            onError={() => setProfilePictureError(true)}
          />
        ) : (
          <div className="student-profile-picture-placeholder">
            {row.firstName?.[0]?.toUpperCase() || "?"}
            {row.lastName?.[0]?.toUpperCase() || ""}
          </div>
        )}
      </td>
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
      <td>{getCompanyName() || "—"}</td>
      <td>{row.status === "hired" ? "Yes" : "No"}</td>
      <td>
        <div className="student-table-skills-tags">
          {/* Render up to 3 skills, with show more/less toggle */}
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
          {/* Show more/less toggle for skills */}
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
          {/* Render location preference tags */}
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
      <td
        className="student-kebab-cell"
        onClick={(event) => event.stopPropagation()}
      >
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

StudentTableRow.propTypes = {
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
  setEditStudentId: PropTypes.func,
  setFormData: PropTypes.func,
  setSkills: PropTypes.func,
  setIsModalOpen: PropTypes.func,
  setSelectionMode: PropTypes.func,
  setSelectedItems: PropTypes.func,
  handleDeleteSingle: PropTypes.func,
  isDeleting: PropTypes.bool,
  onRowClick: PropTypes.func,
};

export default StudentTableRow;
