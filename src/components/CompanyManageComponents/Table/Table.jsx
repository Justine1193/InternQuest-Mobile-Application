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
import EmptyState from "../../EmptyState/EmptyState";
import { IoBusinessOutline } from "react-icons/io5";
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
  sortConfig,
  onSort,
  onRowClick,
  onClearFilters,
  onAddCompany,
  isReadOnly = false,
}) => {
  const getSortClass = (key) => {
    if (!sortConfig || sortConfig.key !== key) return 'sortable';
    return `sortable ${sortConfig.direction === 'asc' ? 'sorted-asc' : 'sorted-desc'}`;
  };

  const handleHeaderClick = (key) => {
    if (onSort) {
      onSort(key);
    }
  };

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
            <th 
              className={getSortClass('companyName')}
              onClick={() => handleHeaderClick('companyName')}
            >
              Company Name
            </th>
            <th 
              className={getSortClass('fields')}
              onClick={() => handleHeaderClick('fields')}
            >
              Field
            </th>
            <th>Skills required</th>
            <th>Mode of work</th>
            <th 
              className={getSortClass('moa')}
              onClick={() => handleHeaderClick('moa')}
            >
              MOA
            </th>
            <th 
              className={getSortClass('moaValidityYears')}
              onClick={() => handleHeaderClick('moaValidityYears')}
              title="MOA Validity (Years)"
            >
              MOA Validity
            </th>
            <th 
              className={getSortClass('moaExpirationDate')}
              onClick={() => handleHeaderClick('moaExpirationDate')}
            >
              MOA Expiration
            </th>
            <th>MOA File</th>
            {!isReadOnly && <th className="kebab-cell"></th>}
          </tr>
        </thead>
        <tbody>
          {data.length === 0 ? (
            <tr>
              <td colSpan={isReadOnly ? (selectionMode ? 9 : 8) : (selectionMode ? 10 : 9)} style={{ padding: 0, border: 'none' }}>
                <EmptyState
                  type={onClearFilters ? "search" : "document"}
                  title={onClearFilters ? "No companies found" : "No companies yet"}
                  message={
                    onClearFilters
                      ? "No companies match your current search or filters. Try adjusting your criteria or clear filters to see all companies."
                      : "Get started by adding your first company. Use the 'Add Company' button above to create a new entry."
                  }
                  icon={IoBusinessOutline}
                  actionLabel={onClearFilters ? "Clear All Filters" : onAddCompany ? "Add First Company" : undefined}
                  onAction={onClearFilters || onAddCompany}
                />
              </td>
            </tr>
          ) : (
            data.map((row) => (
              <TableRow
                key={row.id}
                row={row}
                onEdit={onEdit}
                onDelete={onDelete}
                isSelected={selectedItems.includes(row.id)}
                onSelect={() => onSelectItem && onSelectItem(row.id)}
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
                onRowClick={onRowClick}
                isReadOnly={isReadOnly}
              />
            ))
          )}
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
  sortConfig: PropTypes.shape({
    key: PropTypes.string,
    direction: PropTypes.oneOf(['asc', 'desc']),
  }),
  onSort: PropTypes.func,
  onClearFilters: PropTypes.func,
  onAddCompany: PropTypes.func,
};

export default Table;
