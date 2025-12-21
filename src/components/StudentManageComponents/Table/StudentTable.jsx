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
  visibleColumns = [],
  onClearFilters,
  onAddStudent,
}) => {
  // Default to all columns if not provided
  const defaultVisibleColumns = [
    "profilePicture",
    "studentNumber",
    "firstName",
    "lastName",
    "email",
    "contact",
    "program",
    "section",
    "field",
    "company",
    "skills",
    "hired",
    "requirements",
    "actions",
  ];
  // Essential columns that must always be visible
  const essentialColumns = [
    "profilePicture",
    "studentNumber",
    "firstName",
    "lastName",
  ];

  // Always include essential columns, merge with visibleColumns
  // visibleColumns should already include essential columns, but we ensure they're there
  const columnsToShow =
    visibleColumns.length > 0
      ? [...new Set([...essentialColumns, ...visibleColumns])]
      : defaultVisibleColumns;

  const isColumnVisible = (key) => {
    // Essential columns are always visible
    if (essentialColumns.includes(key)) return true;
    // For non-essential columns, check if they're in the visibleColumns array
    const isVisible = visibleColumns.includes(key);
    return isVisible;
  };
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
      <table role="table" aria-label="Students table">
        <colgroup>
          {[
            // Profile Picture
            <col key="profilePicture" style={{ width: "80px" }} />,
            // Student Number
            <col key="studentNumber" style={{ width: "120px" }} />,
            // First Name
            <col key="firstName" />,
            // Last Name
            <col key="lastName" />,
            // Email
            <col key="email" />,
            // Contact
            <col key="contact" />,
            // Program
            <col key="program" />,
            // Section
            <col key="section" style={{ width: "100px" }} />,
            // Field
            <col key="field" />,
            // Company
            <col key="company" />,
            // Skills
            <col key="skills" />,
            // Hired (fixed width)
            <col key="hired" style={{ width: "60px" }} />,
            // Requirements Status
            <col key="requirements" style={{ width: "100px" }} />,
            // Kebab
            <col key="actions" />,
          ]}
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
            <th style={{ paddingLeft: selectionMode ? "8px" : undefined }}></th>
            <th
              className={getSortClass("studentNumber")}
              onClick={() => handleHeaderClick("studentNumber")}
              role="columnheader"
              aria-sort={
                sortConfig?.key === "studentNumber"
                  ? sortConfig.direction === "asc"
                    ? "ascending"
                    : "descending"
                  : "none"
              }
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  handleHeaderClick("studentNumber");
                }
              }}
            >
              Student ID
            </th>
            <th
              className={getSortClass("firstName")}
              onClick={() => handleHeaderClick("firstName")}
              role="columnheader"
              aria-sort={
                sortConfig?.key === "firstName"
                  ? sortConfig.direction === "asc"
                    ? "ascending"
                    : "descending"
                  : "none"
              }
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  handleHeaderClick("firstName");
                }
              }}
            >
              First Name
            </th>
            <th
              className={getSortClass("lastName")}
              onClick={() => handleHeaderClick("lastName")}
              role="columnheader"
              aria-sort={
                sortConfig?.key === "lastName"
                  ? sortConfig.direction === "asc"
                    ? "ascending"
                    : "descending"
                  : "none"
              }
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  handleHeaderClick("lastName");
                }
              }}
            >
              Last Name
            </th>
            <th
              className={getSortClass("email")}
              onClick={() => handleHeaderClick("email")}
              role="columnheader"
              aria-sort={
                sortConfig?.key === "email"
                  ? sortConfig.direction === "asc"
                    ? "ascending"
                    : "descending"
                  : "none"
              }
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  handleHeaderClick("email");
                }
              }}
            >
              Email
            </th>
            <th
              className={getSortClass("contact")}
              onClick={() => handleHeaderClick("contact")}
              role="columnheader"
              aria-sort={
                sortConfig?.key === "contact"
                  ? sortConfig.direction === "asc"
                    ? "ascending"
                    : "descending"
                  : "none"
              }
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  handleHeaderClick("contact");
                }
              }}
            >
              Contact
            </th>
            <th
              className={getSortClass("program")}
              onClick={() => handleHeaderClick("program")}
              role="columnheader"
              aria-sort={
                sortConfig?.key === "program"
                  ? sortConfig.direction === "asc"
                    ? "ascending"
                    : "descending"
                  : "none"
              }
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  handleHeaderClick("program");
                }
              }}
            >
              Program
            </th>
            <th
              className={getSortClass("section")}
              onClick={() => handleHeaderClick("section")}
              role="columnheader"
              aria-sort={
                sortConfig?.key === "section"
                  ? sortConfig.direction === "asc"
                    ? "ascending"
                    : "descending"
                  : "none"
              }
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  handleHeaderClick("section");
                }
              }}
            >
              Section
            </th>
            {isColumnVisible("field") && (
              <th
                className={getSortClass("field")}
                onClick={() => handleHeaderClick("field")}
              >
                Field
              </th>
            )}
            {isColumnVisible("company") && <th>Company</th>}
            {isColumnVisible("hired") && <th>Hired</th>}
            {isColumnVisible("skills") && <th>Skills</th>}
            {isColumnVisible("requirements") && <th>Requirements</th>}
            {isColumnVisible("actions") && (
              <th className="student-kebab-cell"></th>
            )}
          </tr>
        </thead>
        <tbody>
          {data.length === 0 ? (
            <tr>
              <td
                colSpan={
                  selectionMode
                    ? columnsToShow.length + 1
                    : columnsToShow.length
                }
                style={{ padding: 0, border: "none" }}
              >
                <EmptyState
                  type={onClearFilters ? "filtered" : "students"}
                  title={onClearFilters ? "No students found" : "No students yet"}
                  message={
                    onClearFilters
                      ? "No students match your current search or filters. Try adjusting your criteria or clear filters to see all students."
                      : "Get started by adding your first student. You can add students individually or import them from a CSV file."
                  }
                  icon={IoPeopleOutline}
                  actionLabel={onClearFilters ? "Clear All Filters" : onAddStudent ? "Add First Student" : undefined}
                  onAction={onClearFilters || onAddStudent}
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
                visibleColumns={columnsToShow}
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
  onClearFilters: PropTypes.func,
  onAddStudent: PropTypes.func,
};

export default StudentTable;
