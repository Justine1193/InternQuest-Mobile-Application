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
import EmptyState from "../../EmptyState/EmptyState";
import { IoPeopleOutline } from "react-icons/io5";
import "./StudentTable.css";

// Renders the student table with all rows and selection logic
const StudentTable = ({
  data,
  onEdit,
  onDelete,
  onRowClick,
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
  handleAcceptStudent,
  isDeleting,
  isAdviser,
  requirementApprovals,
  sortConfig,
  onSort,
}) => {
  const getSortClass = (key) => {
    if (!sortConfig || sortConfig.key !== key) return "sortable";
    return `sortable ${
      sortConfig.direction === "asc" ? "sorted-asc" : "sorted-desc"
    }`;
  };

  const handleHeaderClick = (key) => {
    if (onSort) {
      onSort(key);
    }
  };
  return (
    <div className="student-table-container">
      <table>
        <thead>
          <tr>
            {selectionMode && (
              <th className="student-checkbox-cell">
                <input
                  type="checkbox"
                  className="student-table-checkbox"
                  checked={selectedItems.length === data.length && data.length > 0}
                  onChange={onSelectAll}
                />
              </th>
            )}
            <th
              className={getSortClass("studentNumber")}
              onClick={() => handleHeaderClick("studentNumber")}
            >
              Student ID
            </th>
            <th
              className={getSortClass("firstName")}
              onClick={() => handleHeaderClick("firstName")}
            >
              First Name
            </th>
            <th
              className={getSortClass("lastName")}
              onClick={() => handleHeaderClick("lastName")}
            >
              Last Name
            </th>
            <th
              className={getSortClass("email")}
              onClick={() => handleHeaderClick("email")}
            >
              Email
            </th>
            <th
              className={getSortClass("contact")}
              onClick={() => handleHeaderClick("contact")}
            >
              Contact
            </th>
            <th
              className={getSortClass("section")}
              onClick={() => handleHeaderClick("section")}
            >
              Section
            </th>
            <th
              className={getSortClass("program")}
              onClick={() => handleHeaderClick("program")}
            >
              Program
            </th>
            <th
              className={getSortClass("field")}
              onClick={() => handleHeaderClick("field")}
            >
              Field
            </th>
            <th>Company</th>
            <th>Hired</th>
            <th>Skills</th>
            <th
              className={getSortClass("requirementStatus")}
              onClick={() => handleHeaderClick("requirementStatus")}
            >
              Status
            </th>
            <th className="student-kebab-cell"></th>
          </tr>
        </thead>
        <tbody>
          {data.length === 0 ? (
            <tr>
              <td colSpan={selectionMode ? 14 : 13}>
                <EmptyState
                  type="filtered"
                  title="No students found"
                  message="Get started by adding your first student."
                  icon={IoPeopleOutline}
                />
              </td>
            </tr>
          ) : (
            data.map((row) => (
              <StudentTableRow
                key={row.id}
                row={row}
                onEdit={onEdit}
                onDelete={onDelete}
                onRowClick={onRowClick}
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
                handleAcceptStudent={handleAcceptStudent}
                isDeleting={isDeleting}
                isAdviser={isAdviser}
                requirementApprovals={requirementApprovals}
              />
            ))
          )}
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
  onRowClick: PropTypes.func,
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
  handleAcceptStudent: PropTypes.func,
  isDeleting: PropTypes.bool,
  isAdviser: PropTypes.bool,
  requirementApprovals: PropTypes.object,
  sortConfig: PropTypes.shape({
    key: PropTypes.string,
    direction: PropTypes.oneOf(["asc", "desc"]),
  }),
  onSort: PropTypes.func,
};

export default StudentTable;
