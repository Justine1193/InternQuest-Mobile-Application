import React from "react";
import StudentTableRow from "./StudentTableRow";
import "./StudentTable.css";

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
                  <span
                    className="select-all-link"
                    style={{
                      cursor: "pointer",
                      color: "#111",
                      fontWeight: 600,
                      userSelect: "none",
                      whiteSpace: "nowrap",
                    }}
                    onClick={() => setSelectionMode(false)}
                  >
                    Select
                  </span>
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
            />
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default StudentTable;
