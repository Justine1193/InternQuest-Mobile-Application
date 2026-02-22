import React, { useState } from "react";
import { useTableData } from "../../hooks/useTableData";
import { filterData, paginateData } from "../../utils/tableUtils";
import Pagination from "./Pagination";
import Navbar from "../Navbar/Navbar";
import DashboardOverview from "../DashboardOverview/DashboardOverview";
import SearchBar from "../SearchBar/SearchBar";
import ConfirmModal from "../ConfirmModalComponents/ConfirmModal";
import LoadingSpinner from "../LoadingSpinner";

const BaseDashboard = ({
  title,
  collectionName,
  columns,
  filters,
  onAdd,
  onEdit,
  TableComponent,
  OverviewComponent,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(8);
  const [selectedItems, setSelectedItems] = useState([]);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [openMenuId, setOpenMenuId] = useState(null);
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedRowId, setSelectedRowId] = useState(null);
  const [filterValues, setFilterValues] = useState(
    Object.fromEntries(Object.keys(filters).map((key) => [key, ""]))
  );

  const {
    data,
    isLoading,
    error,
    overviewStats,
    handleDelete,
    handleBulkDelete,
  } = useTableData(collectionName);

  const filteredData = filterData(data, searchQuery, filterValues);
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const currentItems = paginateData(filteredData, currentPage, itemsPerPage);

  const handleDeleteConfirm = async () => {
    setShowConfirm(false);
    setIsDeleting(true);
    const success = await handleBulkDelete(selectedItems);
    if (success) {
      setSelectedItems([]);
      setSelectionMode(false);
    }
    setIsDeleting(false);
  };

  return (
    <div className="dashboard-container">
      <LoadingSpinner
        isLoading={isLoading}
        message={`Loading ${title.toLowerCase()}...`}
      />
      <Navbar />
      <div className="dashboard-content">
        {OverviewComponent ? (
          <OverviewComponent stats={overviewStats} />
        ) : (
          <DashboardOverview stats={overviewStats} />
        )}
        <div className="table-section">
          <h2>{title}</h2>
          <SearchBar
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            filters={filters}
            filterValues={filterValues}
            setFilterValues={setFilterValues}
          />
          <div className="table-container">
            <TableComponent
              data={currentItems}
              columns={columns}
              selectionMode={selectionMode}
              selectedItems={selectedItems}
              setSelectedItems={setSelectedItems}
              openMenuId={openMenuId}
              setOpenMenuId={setOpenMenuId}
              selectedRowId={selectedRowId}
              setSelectedRowId={setSelectedRowId}
              onEdit={onEdit}
              onDelete={handleDelete}
              setSelectionMode={setSelectionMode}
            />
          </div>
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
          <div className="table-actions">
            {onAdd && (
              <button className="add-entry table-action-btn" onClick={onAdd}>
                Add Entry
              </button>
            )}
            {selectionMode && selectedItems.length > 0 && (
              <div className="bulk-actions">
                <button
                  className="delete table-action-btn"
                  onClick={() => setShowConfirm(true)}
                  disabled={isDeleting}
                >
                  {isDeleting
                    ? "Deleting..."
                    : `Delete (${selectedItems.length})`}
                </button>
                <button
                  className="cancel-action table-action-btn"
                  onClick={() => {
                    setSelectionMode(false);
                    setSelectedItems([]);
                    setOpenMenuId(null);
                  }}
                >
                  Cancel
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
      <ConfirmModal
        open={showConfirm}
        message={`Are you sure you want to delete ${selectedItems.length} item(s)?`}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setShowConfirm(false)}
      />
    </div>
  );
};

export default BaseDashboard;
