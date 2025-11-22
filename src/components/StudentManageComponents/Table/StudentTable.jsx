/**
 * StudentTable - Renders a table of students with selection, actions, and custom row rendering
 *
 * @component
 * @param {Array} data - Array of student objects
 * @param {Function} onEdit - Handler for editing a student
 * @param {Function} onDelete - Handler for deleting a student
 * @param {Array} selectedItems - Array of selected student IDs
 * @param {Function} onSelectItem - Handler for selecting a student
 * @param {Function} onSelectAll - Handler for selecting all students
 * @param {Boolean} selectionMode - Whether selection mode is active
 * @param {String|Number|null} openMenuId - ID of the open kebab menu
 * @param {Function} setOpenMenuId - Setter for openMenuId
 * @param {String|Number|null} selectedRowId - ID of the selected row
 * @param {Function} setSelectedRowId - Setter for selectedRowId
 * @param {Function} setIsEditMode - Setter for edit mode
 * @param {Function} setEditStudentId - Setter for edit student ID
 * @param {Function} setFormData - Setter for form data
 * @param {Function} setSkills - Setter for skills
 * @param {Function} setIsModalOpen - Setter for modal open state
 * @param {Function} setSelectionMode - Setter for selection mode
 * @param {Function} setSelectedItems - Setter for selected items
 * @param {Function} handleDeleteSingle - Handler for deleting a single student
 * @param {Boolean} isDeleting - Whether a delete operation is in progress
 * @example
 * <StudentTable data={data} ...props />
 */

import React from "react";
import PropTypes from "prop-types";
import StudentTableRow from "./StudentTableRow";
import "./StudentTable.css";

// Renders the student table with all rows and selection logic
const StudentTable = ({
  data,
  onEdit,
  onDelete,
  selectedItems,
  onSelectItem,
  onSelectAll,
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
  return (
    <div className="student-table-container">
      <table>
        <colgroup>
          <col /> {/* First Name */}
          <col /> {/* Last Name */}
          <col /> {/* Email */}
          <col /> {/* Contact */}
          <col /> {/* Program */}
          <col /> {/* Field */}
          <col /> {/* Skills */}
          <col style={{ width: "60px" }} /> {/* Hired */}
          <col /> {/* Location Preference */}
          <col /> {/* Kebab */}
        </colgroup>
        <thead>
          <tr>
            {selectionMode && (
              <th
                className="student-checkbox-cell"
                style={{ minWidth: "80px", width: "80px", textAlign: "center" }}
              >
                <div
                  className="student-select-header"
                  style={{
                    display: "flex",
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "8px",
                  }}
                >
                  <input
                    type="checkbox"
                    className="table-checkbox"
                    checked={
                      selectedItems.length === data.length && data.length > 0
                    }
                    onChange={onSelectAll}
                    style={{
                      display: "inline-block",
                      opacity: 1,
                      position: "static",
                      zIndex: 10,
                    }}
                  />
                </div>
              </th>
            )}
            <th style={{ paddingLeft: selectionMode ? "8px" : undefined }}>
              First Name
            </th>
            <th>Last Name</th>
            <th>Email</th>
            <th>Contact</th>
            <th>Program</th>
            <th>Field</th>
            <th>Hired</th>
            <th>Skills</th>
            <th>Location Preference</th>
            <th className="student-kebab-cell"></th>
          </tr>
        </thead>
        <tbody>
          {data.map((row) => (
            <StudentTableRow
              key={row.id}
              row={row}
              onEdit={onEdit}
              onDelete={onDelete}
              isSelected={selectedItems.includes(row.id)}
              onSelect={() => onSelectItem(row.id)}
              selectionMode={selectionMode}
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
              onRowClick={onRowClick}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
};

StudentTable.propTypes = {
  data: PropTypes.array.isRequired,
  onEdit: PropTypes.func,
  onDelete: PropTypes.func,
  selectedItems: PropTypes.array.isRequired,
  onSelectItem: PropTypes.func.isRequired,
  onSelectAll: PropTypes.func.isRequired,
  selectionMode: PropTypes.bool.isRequired,
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

export default StudentTable;
