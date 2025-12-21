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
import CompanyDetailModal from "./CompanyDetailModal/CompanyDetailModal.jsx";
import ConfirmModal from "../ConfirmModalComponents/ConfirmModal.jsx";
import ConfirmAction from "../ConfirmAction/ConfirmAction.jsx";
import LoadingSpinner from "../LoadingSpinner.jsx";
import SkeletonLoader from "../SkeletonLoader/SkeletonLoader.jsx";
import ToastContainer from "../Toast/ToastContainer.jsx";
import { useToast } from "../../hooks/useToast.js";
import {
  useSuggestionSkills,
  useSuggestionFields,
  dashboardHandlers,
} from "../dashboardUtils.js";
import { getDocs, collection, onSnapshot, query, orderBy, addDoc, updateDoc, doc } from "firebase/firestore";
import { ref, update as updateRealtime } from "firebase/database";
import { db, realtimeDb } from "../../../firebase.js";
import { downloadCSV, prepareCompaniesForExport } from "../../utils/exportUtils.js";
import { readCSVFile, parseCSV, convertCSVToCompanies } from "../../utils/importUtils.js";
import { activityLoggers } from "../../utils/activityLogger.js";
import { checkMoaExpiration } from "../../utils/moaUtils.js";
import { IoDownloadOutline, IoCloudUploadOutline } from "react-icons/io5";
import logger from "../../utils/logger.js";
import Footer from "../Footer/Footer.jsx";

// --- Company Dashboard Main Component ---
const Dashboard = () => {
  // --- State declarations ---
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [formData, setFormData] = useState({
    companyName: "",
    description: "",
    website: "",
    field: "",
    address: "",
    email: "",
    skills: "",
    moa: true, // MOA is now required
    moaValidityYears: "",
    moaStartDate: "",
    modeOfWork: [],
    contactPersonName: "",
    contactPersonEmail: "",
    contactPersonPhone: "",
  });
  const [skills, setSkills] = useState([]);
  const [fields, setFields] = useState([]);
  const [error, setError] = useState(null);
  const [selectedItems, setSelectedItems] = useState([]);
  const [isDeleting, setIsDeleting] = useState(false);
  const [tableData, setTableData] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(8);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editCompanyId, setEditCompanyId] = useState(null);
  const [filterValues, setFilterValues] = useState({
    field: "",
    modeOfWork: "",
    moaExpirationStatus: "",
  });
  const [showConfirm, setShowConfirm] = useState(false);
  const [openMenuId, setOpenMenuId] = useState(null);
  const [selectionMode, setSelectionMode] = useState(false);
  const [overviewStats, setOverviewStats] = useState({
    totalCompanies: 0,
    totalStudents: 0,
    moaExpiringSoon: 0,
    moaExpired: 0,
    moaValid: 0,
  });
  const [selectedRowId, setSelectedRowId] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const [isImporting, setIsImporting] = useState(false);
  const [importProgress, setImportProgress] = useState({ current: 0, total: 0 });
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const fileInputRef = useRef(null);
  const { toasts, removeToast, success, error: showError } = useToast();

  // Suggestions for skills and fields
  const suggestionSkills = useSuggestionSkills();
  const suggestionFields = useSuggestionFields();

  // Clear all filters and search
  const handleClearAllFilters = () => {
    setSearchQuery("");
    setFilterValues({
      field: "",
      modeOfWork: "",
      moaExpirationStatus: "",
    });
    success("All filters cleared");
  };

  // Sorting function
  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  // --- Filtering and Sorting logic for companies table ---
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
        
        // MOA Expiration Status filter
        const matchesMoaExpiration = filterValues.moaExpirationStatus
          ? (() => {
              if (row.moa !== "Yes" || !row.moaExpirationDate) {
                return filterValues.moaExpirationStatus === "No MOA";
              }
              try {
                const expirationDate = new Date(row.moaExpirationDate);
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                const expDate = new Date(expirationDate);
                expDate.setHours(0, 0, 0, 0);
                const daysUntilExpiration = Math.ceil((expDate - today) / (1000 * 60 * 60 * 24));
                
                if (daysUntilExpiration < 0) {
                  return filterValues.moaExpirationStatus === "Expired";
                } else if (daysUntilExpiration <= 30) {
                  return filterValues.moaExpirationStatus === "Expiring Soon";
                } else {
                  return filterValues.moaExpirationStatus === "Valid";
                }
              } catch (e) {
                return false;
              }
            })()
          : true;
        
        return matchesSearch && matchesField && matchesModeOfWork && matchesMoaExpiration;
      })
    : [];

  // Apply sorting
  const sortedData = [...filteredData].sort((a, b) => {
    if (!sortConfig.key) return 0;

    let aValue = a[sortConfig.key];
    let bValue = b[sortConfig.key];

    // Handle array fields (like fields, modeOfWork, skills)
    if (Array.isArray(aValue)) {
      aValue = aValue.join(', ');
    }
    if (Array.isArray(bValue)) {
      bValue = bValue.join(', ');
    }

    // Handle string comparison
    if (typeof aValue === 'string') {
      aValue = aValue.toLowerCase();
    }
    if (typeof bValue === 'string') {
      bValue = bValue.toLowerCase();
    }

    // Handle null/undefined
    if (aValue == null) aValue = '';
    if (bValue == null) bValue = '';

    if (aValue < bValue) {
      return sortConfig.direction === 'asc' ? -1 : 1;
    }
    if (aValue > bValue) {
      return sortConfig.direction === 'asc' ? 1 : -1;
    }
    return 0;
  });

  // Pagination calculation (after sortedData is defined)
  const totalPages = Math.ceil(sortedData.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = sortedData.slice(indexOfFirstItem, indexOfLastItem);

  // Real-time listener for companies and students
  useEffect(() => {
    setIsLoading(true);
    
        // Set up real-time listener for companies
    const companiesQuery = query(collection(db, "companies"), orderBy("companyName"));
    const unsubscribeCompanies = onSnapshot(
      companiesQuery,
      async (snapshot) => {
        const companies = [];
        snapshot.forEach((doc) => {
          companies.push({ id: doc.id, ...doc.data() });
        });
        
        // Calculate MOA expiration statistics and update visibility for mobile app
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        let expiringSoon = 0;
        let expired = 0;
        let valid = 0;
        
        // Update companies with expired MOAs to hide them from mobile app
        const updatePromises = [];
        
        companies.forEach((company) => {
          if (company.moa === "Yes" && company.moaExpirationDate) {
            try {
              const expirationDate = new Date(company.moaExpirationDate);
              const expDate = new Date(expirationDate);
              expDate.setHours(0, 0, 0, 0);
              const daysUntilExpiration = Math.ceil((expDate - today) / (1000 * 60 * 60 * 24));
              
              if (daysUntilExpiration < 0) {
                expired++;
                // Hide from mobile app if MOA is expired
                if (company.isVisibleToMobile !== false) {
                  updatePromises.push(
                    updateDoc(doc(db, 'companies', company.id), {
                      isVisibleToMobile: false,
                      moaStatus: 'expired',
                    })
                  );
                }
              } else if (daysUntilExpiration <= 30) {
                expiringSoon++;
                // Keep visible but mark as expiring soon
                if (company.isVisibleToMobile === false && company.moaStatus === 'expired') {
                  // If MOA was renewed, make it visible again
                  updatePromises.push(
                    updateDoc(doc(db, 'companies', company.id), {
                      isVisibleToMobile: true,
                      moaStatus: 'expiring-soon',
                    })
                  );
                } else if (company.moaStatus !== 'expiring-soon') {
                  updatePromises.push(
                    updateDoc(doc(db, 'companies', company.id), {
                      moaStatus: 'expiring-soon',
                    })
                  );
                }
              } else {
                valid++;
                // Ensure valid MOAs are visible
                if (company.isVisibleToMobile === false) {
                  updatePromises.push(
                    updateDoc(doc(db, 'companies', company.id), {
                      isVisibleToMobile: true,
                      moaStatus: 'valid',
                    })
                  );
                } else if (company.moaStatus !== 'valid') {
                  updatePromises.push(
                    updateDoc(doc(db, 'companies', company.id), {
                      moaStatus: 'valid',
                    })
                  );
                }
              }
            } catch (e) {
              // Skip invalid dates
            }
          } else {
            // No MOA - hide from mobile
            if (company.isVisibleToMobile !== false) {
              updatePromises.push(
                updateDoc(doc(db, 'companies', company.id), {
                  isVisibleToMobile: false,
                  moaStatus: 'no-moa',
                })
              );
            }
          }
        });
        
        // Execute all updates in parallel (fire and forget - don't wait)
        if (updatePromises.length > 0) {
          Promise.all(updatePromises).catch((err) => {
            logger.error("Error updating company visibility:", err);
          });
        }
        
        setTableData(companies);
        
        setOverviewStats((prev) => ({
          ...prev,
          totalCompanies: companies.length,
          moaExpiringSoon: expiringSoon,
          moaExpired: expired,
          moaValid: valid,
        }));
        setIsLoading(false);
        logger.debug("Companies updated:", companies.length);
      },
      (err) => {
        logger.error("Error fetching companies:", err);
        setError("Failed to fetch companies. Please try again.");
        setIsLoading(false);
      }
    );

    // Set up real-time listener for students
    const studentsQuery = query(collection(db, "users"), orderBy("firstName"));
    const unsubscribeStudents = onSnapshot(
      studentsQuery,
      (snapshot) => {
        const students = [];
        snapshot.forEach((doc) => {
          students.push({ id: doc.id, ...doc.data() });
        });
        setOverviewStats((prev) => ({
          ...prev,
          totalStudents: students.length,
        }));
        logger.debug("Students updated:", students.length);
      },
      (err) => {
        logger.error("Error fetching students:", err);
        setError("Failed to fetch students. Please try again.");
      }
    );

    // Cleanup listeners on unmount
    return () => {
      unsubscribeCompanies();
      unsubscribeStudents();
    };
  }, []);

  // Exit selection mode if no items are selected
  useEffect(() => {
    if (selectionMode && selectedItems.length === 0) {
      setSelectionMode(false);
    }
  }, [selectedItems, selectionMode]);

  // Scroll to top when error occurs
  useEffect(() => {
    if (error) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [error]);

  // Set document title on mount
  useEffect(() => {
    document.title = "Dashboard | InternQuest Admin";
  }, []);

  // Handle CSV import
  const handleImportCompanies = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setIsImporting(true);
      setImportProgress({ current: 0, total: 0 });

      // Read CSV file
      const csvText = await readCSVFile(file);
      
      // Parse CSV
      const csvData = parseCSV(csvText);
      
      // Convert to company objects
      const { companies, errors } = convertCSVToCompanies(csvData);

      if (companies.length === 0) {
        showError("No valid companies found in CSV file");
        return;
      }

      setImportProgress({ current: 0, total: companies.length });

      // Batch import companies
      let successCount = 0;
      let errorCount = 0;
      const importErrors = [];

      for (let i = 0; i < companies.length; i++) {
        try {
          const company = companies[i];
          
          // Map to Firestore format
          const newCompany = {
            companyName: company.companyName,
            companyDescription: company.description,
            companyWeb: company.companyWebsite,
            companyAddress: company.address,
            companyEmail: company.email,
            skillsREq: company.skills,
            moa: "Yes", // MOA is always required
            moaValidityYears: company.moaValidityYears || 1,
            modeOfWork: company.modeOfWork,
            fields: company.fields,
            createdAt: company.createdAt || new Date().toISOString(),
            updatedAt: company.updatedAt || new Date().toISOString(),
          };

          const docRef = await addDoc(collection(db, 'companies'), newCompany);
          
          // Sync to Realtime DB
          await updateRealtime(ref(realtimeDb, `companies/${docRef.id}`), {
            moa: "Yes",
            moaValidityYears: newCompany.moaValidityYears,
            companyName: newCompany.companyName,
            updatedAt: new Date().toISOString(),
          });

          // Log activity
          await activityLoggers.createCompany(docRef.id, newCompany.companyName);
          
          successCount++;
        } catch (err) {
          errorCount++;
          importErrors.push({
            company: companies[i].companyName,
            error: err.message,
          });
          logger.error(`Failed to import company ${companies[i].companyName}:`, err);
        }

        setImportProgress({ current: i + 1, total: companies.length });
      }

      // Show results
      if (successCount > 0) {
        success(`Successfully imported ${successCount} company/companies`);
        if (errorCount > 0) {
          showError(`${errorCount} company/companies failed to import. Check console for details.`);
        }
        if (errors.length > 0) {
          logger.warn(`CSV parsing errors:`, errors);
        }
      } else {
        showError("Failed to import any companies. Please check the CSV format.");
      }

      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (err) {
      logger.error("Import error:", err);
      showError(err.message || "Failed to import CSV file. Please check the format.");
    } finally {
      setIsImporting(false);
      setImportProgress({ current: 0, total: 0 });
    }
  };

  // --- Render ---
  return (
    <div className="dashboard-container">
      <LoadingSpinner
        isLoading={isLoading}
        message="Loading dashboard data..."
      />
      <Navbar onLogout={() => setShowLogoutConfirm(true)} />
      <ConfirmAction
        isOpen={showLogoutConfirm}
        onClose={() => setShowLogoutConfirm(false)}
        onConfirm={async () => {
          setShowLogoutConfirm(false);
          try {
            await dashboardHandlers.handleLogout();
          } catch (error) {
            showError("Logout failed! Please try again.");
          }
        }}
        title="Confirm Logout"
        message="Are you sure you want to logout? Any unsaved changes will be lost."
        confirmText="Logout"
        cancelText="Cancel"
        type="warning"
      />
      <div className="dashboard-content">
        <DashboardOverview
          stats={overviewStats}
          showNotifications={false}
        />
        <div className="table-container">
          <h2>Manage Companies</h2>
          {/* MOA Expiration Alert Banner */}
          {overviewStats.moaExpired > 0 && (
            <div className="moa-alert-banner expired">
              <div className="alert-content">
                <strong>⚠️ {overviewStats.moaExpired} company{overviewStats.moaExpired !== 1 ? 'ies' : 'y'} with expired MOA{overviewStats.moaExpired !== 1 ? 's' : ''}</strong>
                <span>These companies cannot be used for student assignments. Please renew their MOAs.</span>
              </div>
            </div>
          )}
          {overviewStats.moaExpiringSoon > 0 && overviewStats.moaExpired === 0 && (
            <div className="moa-alert-banner expiring">
              <div className="alert-content">
                <strong>⚠️ {overviewStats.moaExpiringSoon} company{overviewStats.moaExpiringSoon !== 1 ? 'ies' : 'y'} with MOA{overviewStats.moaExpiringSoon !== 1 ? 's' : ''} expiring soon</strong>
                <span>Please renew these MOAs before they expire to avoid restrictions.</span>
              </div>
            </div>
          )}
          <SearchBar 
            onSearch={setSearchQuery} 
            onFilter={setFilterValues} 
            filterValues={filterValues}
            type="company"
          />
          {isLoading && tableData.length === 0 ? (
            <SkeletonLoader type="table" rows={8} columns={11} />
          ) : (
            <Table
              data={currentItems}
              sortConfig={sortConfig}
              onSort={handleSort}
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
            onRowClick={(company) => {
              setSelectedCompany(company);
              setIsDetailModalOpen(true);
            }}
            onClearFilters={handleClearAllFilters}
            onAddCompany={() => setIsModalOpen(true)}
          />
          )}
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
          <div className="pagination-info">
            Showing {indexOfFirstItem + 1}-{Math.min(indexOfLastItem, sortedData.length)} of {sortedData.length}
          </div>
          <div className="table-actions">
            <input
              type="file"
              accept=".csv"
              ref={fileInputRef}
              onChange={handleImportCompanies}
              style={{ display: 'none' }}
              disabled={isImporting}
            />
            <button
              className="import-btn table-action-btn"
              onClick={() => fileInputRef.current?.click()}
              disabled={isImporting}
              title="Import companies from CSV"
            >
              <IoCloudUploadOutline style={{ marginRight: "0.5rem" }} />
              {isImporting ? `Importing... (${importProgress.current}/${importProgress.total})` : "Import CSV"}
            </button>
            <button
              className="export-btn table-action-btn"
              onClick={() => {
                try {
                  const exportData = prepareCompaniesForExport(filteredData);
                  downloadCSV(exportData, `companies_export_${new Date().toISOString().split('T')[0]}`);
                  activityLoggers.exportData("companies", exportData.length);
                  success(`Exported ${exportData.length} companies successfully`);
                } catch (err) {
                  logger.error("Export error:", err);
                  showError("Failed to export data. Please try again.");
                }
              }}
              title="Export companies to CSV"
            >
              <IoDownloadOutline style={{ marginRight: "0.5rem" }} />
              Export CSV
            </button>
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
                  moa: true, // MOA is now required
                  moaValidityYears: "",
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
      <CompanyDetailModal
        open={isDetailModalOpen}
        company={selectedCompany}
        onClose={() => {
          setIsDetailModalOpen(false);
          setSelectedCompany(null);
        }}
        onRenewMoa={async (company) => {
          if (!company || !company.id) return;
          
          try {
            setIsLoading(true);
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            
            // Calculate new expiration date based on current validity years
            const validityYears = company.moaValidityYears || 1;
            const newExpirationDate = new Date(today);
            newExpirationDate.setFullYear(newExpirationDate.getFullYear() + validityYears);
            
            // Update company in Firestore
            await updateDoc(doc(db, 'companies', company.id), {
              moaStartDate: today.toISOString(),
              moaExpirationDate: newExpirationDate.toISOString(),
              isVisibleToMobile: true, // Make visible to mobile app after renewal
              moaStatus: 'valid', // Set status to valid
              updatedAt: new Date().toISOString(),
            });
            
            // Sync to Realtime DB
            await updateRealtime(ref(realtimeDb, `companies/${company.id}`), {
              updatedAt: new Date().toISOString(),
            });
            
            // Log activity
            await activityLoggers.updateCompany(company.id, company.companyName, {
              moaStartDate: today.toISOString(),
              moaExpirationDate: newExpirationDate.toISOString(),
            });
            
            success(`MOA renewed for ${company.companyName}. New expiration: ${newExpirationDate.toLocaleDateString()}`);
            setIsDetailModalOpen(false);
            setSelectedCompany(null);
          } catch (err) {
            logger.error("Error renewing MOA:", err);
            showError("Failed to renew MOA. Please try again.");
          } finally {
            setIsLoading(false);
          }
        }}
        onEdit={(company) => {
          dashboardHandlers.handleEdit(
            company,
            setFormData,
            setSkills,
            setIsEditMode,
            setEditCompanyId,
            setIsModalOpen,
            setFields
          );
          setIsDetailModalOpen(false);
        }}
      />
      <ConfirmModal
        open={showConfirm}
        message={`Are you sure you want to delete ${selectedItems.length} item(s)?`}
        onConfirm={async () => {
          const result = await dashboardHandlers.confirmDelete(
            selectedItems,
            setShowConfirm,
            setIsDeleting,
            setTableData,
            setSelectedItems,
            setError
          );
          if (result) {
            activityLoggers.bulkDeleteCompanies(selectedItems.length, selectedItems);
            success(`Successfully deleted ${selectedItems.length} company(ies)`);
          } else {
            showError("Failed to delete companies. Please try again.");
          }
        }}
        onCancel={() => dashboardHandlers.cancelDelete(setShowConfirm)}
      />
      <ToastContainer toasts={toasts} removeToast={removeToast} />
      <Footer />
    </div>
  );
};

export default Dashboard;
