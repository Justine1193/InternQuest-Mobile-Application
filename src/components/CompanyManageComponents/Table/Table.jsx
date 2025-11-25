/**
 * Table - Renders a table of companies with selection, actions, and custom row rendering
 *
 * @component
 * @param {Array} data - Array of company objects
 * @param {Function} onEdit - Handler for editing a company
 * @param {Function} onDelete - Handler for deleting a company
 * @param {Array} selectedItems - Array of selected company IDs
 * @param {Function} onSelectItem - Handler for selecting a company
 * @param {Function} onSelectAll - Handler for selecting all companies
 * @param {Boolean} selectionMode - Whether selection mode is active
 * @param {String|Number|null} openMenuId - ID of the open kebab menu
 * @param {Function} setOpenMenuId - Setter for openMenuId
 * @param {String|Number|null} selectedRowId - ID of the selected row
 * @param {Function} setSelectedRowId - Setter for selectedRowId
 * @param {Function} setIsEditMode - Setter for edit mode
 * @param {Function} setEditCompanyId - Setter for edit company ID
 * @param {Function} setFormData - Setter for form data
 * @param {Function} setSkills - Setter for skills
 * @param {Function} setIsModalOpen - Setter for modal open state
 * @param {Function} setSelectionMode - Setter for selection mode
 * @param {Function} setSelectedItems - Setter for selected items
 * @param {Function} handleDeleteSingle - Handler for deleting a single company
 * @param {Boolean} isDeleting - Whether a delete operation is in progress
 * @example
 * <Table data={data} ...props />
 */

import React from "react";
import PropTypes from "prop-types";
import TableRow from "./TableRow/TableRow";
import "./Table.css";

// Renders the company table with all rows and selection logic
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
            <th>MOA Validity (Years)</th>
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

Table.propTypes = {
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
  setEditCompanyId: PropTypes.func,
  setFormData: PropTypes.func,
  setSkills: PropTypes.func,
  setIsModalOpen: PropTypes.func,
  setSelectionMode: PropTypes.func,
  setSelectedItems: PropTypes.func,
  handleDeleteSingle: PropTypes.func,
  isDeleting: PropTypes.bool,
};

export default Table;
