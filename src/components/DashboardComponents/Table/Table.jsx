import React from "react";
import TableRow from "./TableRow/TableRow";
import "./Table.css";

const Table = ({
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
    <div className="table-container">
      <table>
        <thead>
          <tr>
            {selectionMode && (
              <th className="checkbox-cell">
                <div className="select-header">
                  <input
                    type="checkbox"
                    className="table-checkbox"
                    checked={
                      selectedItems.length === data.length && data.length > 0
                    }
                    onChange={onSelectAll}
                  />
                  <span
                    className="select-all-link"
                    style={{
                      cursor: "pointer",
                      color: "#111",
                      fontWeight: 600,
                      userSelect: "none",
                      marginLeft: "10px",
                    }}
                    onClick={() => setSelectionMode(false)}
                  >
                    Select
                  </span>
                </div>
              </th>
            )}
            <th>Company Name</th>
            <th>Description</th>
            <th>Address</th>
            <th>Email</th>
            <th>Company Website</th>
            <th>Field</th>
            <th>Skills required</th>
            <th>Mode of work</th>
            <th>MOA</th>
            <th className="kebab-cell"></th>
          </tr>
        </thead>
        <tbody>
          {data.map((row) => (
            <TableRow
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
              setEditCompanyId={setEditCompanyId}
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

export default Table;
