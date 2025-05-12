/**
 * CompanyDashboard - Admin dashboard for managing companies
 * Fetches and displays company/student data, supports search, filter, selection, notification, and CRUD operations.
 *
 * @component
 * @example
 * <CompanyDashboard />
 */

import React, { useState, useRef, useEffect } from "react";
import "./CompanyDashboard.css";
import Navbar from "../Navbar/Navbar.jsx";
import DashboardOverview from "../DashboardOverview/DashboardOverview.jsx";
import SearchBar from "../SearchBar/SearchBar.jsx";
import Table from "./Table/Table.jsx";
import CompanyModal from "./CompanyModal/CompanyModal.jsx";
import ConfirmModal from "../ConfirmModalComponents/ConfirmModal.jsx";
import LoadingSpinner from "../LoadingSpinner.jsx";
import {
  useSuggestionSkills,
  useSuggestionFields,
  dashboardHandlers,
} from "../dashboardUtils.js";
import { getDocs, collection } from "firebase/firestore";
import Footer from "../Footer/Footer.jsx";

// --- Company Dashboard Main Component ---
const Dashboard = () => {
  // --- State declarations ---
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    companyName: "",
    description: "",
    website: "",
    field: "",
    address: "",
    email: "",
    skills: "",
    moa: false,
    modeOfWork: [],
  });
  const [skills, setSkills] = useState([]);
  const [fields, setFields] = useState([]);
  const [error, setError] = useState(null);
  const [selectedItems, setSelectedItems] = useState([]);
  const [isDeleting, setIsDeleting] = useState(false);
  const [tableData, setTableData] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(8);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editCompanyId, setEditCompanyId] = useState(null);
  const [filterValues, setFilterValues] = useState({
    field: "",
    modeOfWork: "",
    moa: "",
  });
  const [showConfirm, setShowConfirm] = useState(false);
  const [openMenuId, setOpenMenuId] = useState(null);
  const [selectionMode, setSelectionMode] = useState(false);
  const [overviewStats, setOverviewStats] = useState({
    totalCompanies: 0,
    totalStudents: 0,
  });
  const [selectedRowId, setSelectedRowId] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // Suggestions for skills and fields
  const suggestionSkills = useSuggestionSkills();
  const suggestionFields = useSuggestionFields();

  // Pagination calculation
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;

  // --- Filtering logic for companies table ---
  const filteredData = Array.isArray(tableData)
    ? tableData.filter((row) => {
        const matchesSearch =
          row.companyName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (Array.isArray(row.fields) &&
            row.fields.some((f) =>
              f.toLowerCase().includes(searchQuery.toLowerCase())
            )) ||
          row.description?.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesField = filterValues.field
          ? Array.isArray(row.fields) &&
            row.fields.some((f) =>
              f.toLowerCase().includes(filterValues.field.toLowerCase())
            )
          : true;
        const matchesModeOfWork = filterValues.modeOfWork
          ? Array.isArray(row.modeOfWork) &&
            row.modeOfWork.includes(filterValues.modeOfWork)
          : true;
        const matchesMoa = filterValues.moa
          ? row.moa === filterValues.moa
          : true;
        return matchesSearch && matchesField && matchesModeOfWork && matchesMoa;
      })
    : [];
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const currentItems = filteredData.slice(indexOfFirstItem, indexOfLastItem);

  // Fetch companies and students from Firestore on mount
  useEffect(() => {
    async function fetchData() {
      try {
        setIsLoading(true); // Set loading state to true before fetching
        const { db } = await import("../../../firebase.js");
        const companySnapshot = await getDocs(collection(db, "companies"));
        const companies = [];
        companySnapshot.forEach((doc) => {
          companies.push({ id: doc.id, ...doc.data() });
        });
        const studentSnapshot = await getDocs(collection(db, "users"));
        const students = [];
        studentSnapshot.forEach((doc) => {
          students.push({ id: doc.id, ...doc.data() });
        });
        setTableData(companies);
        setOverviewStats({
          totalCompanies: companies.length,
          totalStudents: students.length,
        });
      } catch (error) {
        setError("Failed to fetch data. Please try again.");
      } finally {
        setIsLoading(false); // Set loading state to false after fetching
      }
    }
    fetchData();
  }, []);

  // Exit selection mode if no items are selected
  useEffect(() => {
    if (selectionMode && selectedItems.length === 0) {
      setSelectionMode(false);
    }
  }, [selectedItems, selectionMode]);

  // Set document title on mount
  useEffect(() => {
    document.title = "Dashboard | InternQuest Admin";
  }, []);

  // --- Render ---
  return (
    <div className="dashboard-container">
      <LoadingSpinner
        isLoading={isLoading}
        message="Loading dashboard data..."
      />
      <Navbar onLogout={dashboardHandlers.handleLogout} />
      <div className="dashboard-content">
        <DashboardOverview
          stats={overviewStats}
          onSendNotification={(notificationText) =>
            dashboardHandlers.handleSendNotification(notificationText, setError)
          }
        />
        <div className="table-container">
          <h2>Manage Internships</h2>
          <SearchBar onSearch={setSearchQuery} onFilter={setFilterValues} />
          <Table
            data={currentItems}
            onEdit={(company) =>
              dashboardHandlers.handleEdit(
                company,
                setFormData,
                setSkills,
                setIsEditMode,
                setEditCompanyId,
                setIsModalOpen,
                setFields
              )
            }
            onDelete={(id) =>
              dashboardHandlers.handleDeleteSingle(
                id,
                setIsDeleting,
                setTableData,
                setSelectedItems,
                setError
              )
            }
            selectedItems={selectedItems}
            onSelectItem={(id) =>
              dashboardHandlers.handleSelectItem(
                id,
                selectedItems,
                setSelectedItems
              )
            }
            onSelectAll={(e) => {
              if (e.target.checked) {
                setSelectedItems(currentItems.map((item) => item.id));
              } else {
                setSelectedItems([]);
              }
            }}
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
            handleDeleteSingle={dashboardHandlers.handleDeleteSingle}
            isDeleting={isDeleting}
          />
          <div className="pagination">
            <button
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="pagination-arrow"
            >
              &lt;
            </button>
            {[...Array(totalPages)].map((_, index) => (
              <button
                key={index + 1}
                onClick={() => setCurrentPage(index + 1)}
                className={`pagination-number ${
                  currentPage === index + 1 ? "active" : ""
                }`}
              >
                {index + 1}
              </button>
            ))}
            <button
              onClick={() =>
                setCurrentPage((prev) => Math.min(prev + 1, totalPages))
              }
              disabled={currentPage === totalPages}
              className="pagination-arrow"
            >
              &gt;
            </button>
          </div>
          <div className="table-actions">
            <button
              className="add-entry table-action-btn"
              onClick={() => {
                setIsEditMode(false);
                setIsModalOpen(true);
                setFormData({
                  companyName: "",
                  description: "",
                  website: "",
                  field: "",
                  address: "",
                  email: "",
                  skills: "",
                  moa: false,
                  modeOfWork: [],
                });
                setSkills([]);
                setFields([]);
              }}
            >
              Add Entry
            </button>
            {selectionMode && selectedItems.length > 0 && (
              <div style={{ margin: "1rem 0" }}>
                <button
                  className="delete table-action-btn"
                  onClick={() => dashboardHandlers.handleDelete(setShowConfirm)}
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
                  style={{ marginLeft: "1rem" }}
                >
                  Cancel
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
      {isModalOpen && (
        <CompanyModal
          open={isModalOpen}
          isEditMode={isEditMode}
          formData={formData}
          setFormData={setFormData}
          error={error}
          setError={setError}
          handleInputChange={dashboardHandlers.handleInputChange(
            formData,
            setFormData
          )}
          handleModeOfWorkChange={dashboardHandlers.handleModeOfWorkChange(
            formData,
            setFormData
          )}
          handleAddEntry={() =>
            dashboardHandlers.handleAddEntry(
              formData,
              fields,
              skills,
              setIsLoading,
              setTableData,
              setIsModalOpen,
              setFormData,
              setSkills,
              setFields,
              setError
            )
          }
          handleUpdateEntry={dashboardHandlers.handleUpdateEntry}
          setIsModalOpen={setIsModalOpen}
          setIsEditMode={setIsEditMode}
          setEditCompanyId={setEditCompanyId}
          setSkills={setSkills}
          setFields={setFields}
          skills={skills}
          fields={fields}
          isLoading={isLoading}
          suggestionSkills={suggestionSkills}
          suggestionFields={suggestionFields}
          setTableData={setTableData}
          editCompanyId={editCompanyId}
          setIsLoading={setIsLoading}
        />
      )}
      <ConfirmModal
        open={showConfirm}
        message={`Are you sure you want to delete ${selectedItems.length} item(s)?`}
        onConfirm={() =>
          dashboardHandlers.confirmDelete(
            selectedItems,
            setShowConfirm,
            setIsDeleting,
            setTableData,
            setSelectedItems,
            setError
          )
        }
        onCancel={() => dashboardHandlers.cancelDelete(setShowConfirm)}
      />
      <Footer />
    </div>
  );
};

export default Dashboard;
