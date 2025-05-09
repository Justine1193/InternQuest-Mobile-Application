import React, { useState, useRef, useEffect } from 'react';
import './CompanyDashboard.css';
import { IoCloseOutline, IoSearchOutline, IoSettingsOutline, IoEllipsisVertical } from "react-icons/io5";
import { db, auth } from '../../../firebase'; 
import { collection, addDoc, getDocs, deleteDoc, doc, updateDoc, getDoc } from 'firebase/firestore';
import logo from '../../assets/InternQuest_Logo.png'; 
import { signOut } from 'firebase/auth';
import ConfirmModal from '../ConfirmModal/ConfirmModal.jsx';
import { FiFilter } from "react-icons/fi";
import { FaFilter } from "react-icons/fa";
import PortalDropdown from '../PortalDropdown'; // adjust path as needed
import { ReactTags } from 'react-tag-autocomplete';

function KebabCell({
  row,
  openMenuId,
  setOpenMenuId,
  selectedRowId,
  setSelectedRowId,
  handleDeleteSingle,
  isDeleting,
  selectionMode,
  setSelectedItems,
  setSelectionMode,
  setIsEditMode,
  setEditCompanyId,
  setFormData,
  setSkills,
  setIsModalOpen
}) {
  const kebabRef = useRef(null);

  return (
    <span
      ref={kebabRef}
      className="kebab-icon-wrapper"
      style={{ position: 'relative', display: 'inline-block' }}
    >
      <IoEllipsisVertical
        className="kebab-icon"
        onClick={() => {
          setOpenMenuId(row.id);
          setSelectedRowId(null);
          if (selectionMode) {
            setSelectionMode(false);
            setSelectedItems([]);
          }
        }}
        title="Options"
      />
      <PortalDropdown
        anchorRef={kebabRef}
        open={openMenuId === row.id}
        onClose={() => setOpenMenuId(null)}
      >
        <button
          className="edit-btn"
          onClick={() => {
            console.log('Edit clicked', row);
            setIsEditMode(true);
            setEditCompanyId(row.id);
            setFormData({
              companyName: row.companyName || '',
              description: row.companyDescription || '',
              website: row.companyWeb || '',
              field: row.field || '',
              address: row.companyAddress || '',
              email: row.companyEmail || '',
              skills: '', // or row.skillsREq if you want to prefill
              moa: row.moa === "Yes",
              modeOfWork: Array.isArray(row.modeOfWork) ? row.modeOfWork : [],
            });
            setSkills(Array.isArray(row.skillsREq) ? row.skillsREq : []);
            setIsModalOpen(true);
            setOpenMenuId(null);
            setSelectedRowId(null);
          }}
        >
          Edit
        </button>
        {selectedRowId !== row.id ? (
          <button
            className="select-btn"
            onClick={() => {
              setSelectionMode(true);
              setSelectedItems([row.id]);
              setOpenMenuId(null);
              setSelectedRowId(null);
            }}
          >
            Select
          </button>
        ) : (
          <button
            className="delete"
            onClick={async () => {
              setIsDeleting(true);
              if (window.confirm('Are you sure you want to delete this student?')) {
                await handleDeleteSingle(row.id);
              }
              setIsDeleting(false);
              setOpenMenuId(null);
              setSelectedRowId(null);
            }}
            disabled={isDeleting}
          >
            {isDeleting ? 'Deleting...' : 'Delete'}
          </button>
        )}
      </PortalDropdown>
    </span>
  );
}

function useSuggestionSkills() {
  const [skills, setSkills] = useState([]);
  useEffect(() => {
    async function fetchSkills() {
      const docSnap = await getDoc(doc(db, 'meta', 'suggestionSkills'));
      if (docSnap.exists()) {
        // Remove trailing spaces if any
        setSkills((docSnap.data().list || []).map(skill => skill.trim()));
      }
    }
    fetchSkills();
  }, []);
  return skills;
}

function useSuggestionFields() {
  const [fields, setFields] = useState([]);
  useEffect(() => {
    async function fetchFields() {
      const docSnap = await getDoc(doc(db, 'meta', 'field'));
      if (docSnap.exists()) {
        setFields((docSnap.data().list || []).map(field => field.trim()));
      }
    }
    fetchFields();
  }, []);
  return fields;
}

const Dashboard = () => {

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    companyName: '',
    description: '',
    website: '', 
    field: '',
    address: '',
    email: '',
    skills: '',
    moa: false,
    modeOfWork: [],
  });

  const [isLoading, setIsLoading] = useState(false);
  const [skills, setSkills] = useState([]);
  const [skillInput, setSkillInput] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const skillsInputRef = useRef(null);

  const suggestionSkills = useSuggestionSkills();
  const suggestions = suggestionSkills.map((skill, idx) => ({ id: idx, name: skill }));

  const [input, setInput] = useState('');
  const [filtered, setFiltered] = useState([]);

  useEffect(() => {
    setFiltered(
      suggestionSkills.filter(skill =>
        skill.toLowerCase().includes(skillInput.toLowerCase())
      )
    );
  }, [skillInput, suggestionSkills]);

  const [overviewStats, setOverviewStats] = useState({
    totalCompanies: 0,
    totalStudents: 0, 
  });

  const [error, setError] = useState(null);
  const [selectedItems, setSelectedItems] = useState([]);
  const [isDeleting, setIsDeleting] = useState(false);
  const [tableData, setTableData] = useState([]);
  const [notificationText, setNotificationText] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  // Add these states at the top with your other states
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(8);

  const [showLogout, setShowLogout] = useState(false);
  const [openMenuRow, setOpenMenuRow] = useState(null);

  const [isEditMode, setIsEditMode] = useState(false);
  const [editCompanyId, setEditCompanyId] = useState(null);

  const [showFilter, setShowFilter] = useState(false);
  const [filterValues, setFilterValues] = useState({
    field: '',
    modeOfWork: '',
    moa: '',
  });

  const [pendingFilterValues, setPendingFilterValues] = useState({
    field: '',
    modeOfWork: '',
    moa: '',
  });

  const [showConfirm, setShowConfirm] = useState(false);

  const [openMenuId, setOpenMenuId] = useState(null);
  const [selectedRowId, setSelectedRowId] = useState(null);

  const [selectionMode, setSelectionMode] = useState(false);

  const [fields, setFields] = useState([]);
  const [fieldInput, setFieldInput] = useState('');
  const [showFieldDropdown, setShowFieldDropdown] = useState(false);

  const suggestionFields = useSuggestionFields();
  const fieldSuggestions = suggestionFields.map((field, idx) => ({ id: idx, name: field }));

  const [filteredFields, setFilteredFields] = useState([]);
  useEffect(() => {
    setFilteredFields(
      suggestionFields.filter(field =>
        field.toLowerCase().includes(fieldInput.toLowerCase())
      )
    );
  }, [fieldInput, suggestionFields]);

  const handleSkillInput = (e) => {
    setSkillInput(e.target.value);
    setShowDropdown(true);
  };

  const addSkill = (skill) => {
    if (skills.length < 15 && !skills.includes(skill)) {
      setSkills([...skills, skill]);
    }
    setSkillInput('');
    setShowDropdown(false);
  };

  const removeSkill = (skillToRemove) => {
    setSkills(skills.filter(skill => skill !== skillToRemove));
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    });
  };

  const handleModeOfWorkChange = (e) => {
    const { value, checked } = e.target;
    setFormData((prev) => {
      if (checked) {
        return { ...prev, modeOfWork: [...prev.modeOfWork, value] };
      } else {
        return { ...prev, modeOfWork: prev.modeOfWork.filter((mode) => mode !== value) };
      }
    });
  };

  // Update the handleAddEntry function
  const handleAddEntry = async () => {
    try {
      // Validate all required fields
      if (!formData.companyName.trim()) {
        throw new Error("Company name is required");
      }
      if (!formData.description.trim()) {
        throw new Error("Description is required");
      }
      if (!formData.website.trim()) {
        throw new Error("Website is required");
      }
      if (fields.length === 0) {
        throw new Error("At least one field is required");
      }
      if (!formData.address.trim()) {
        throw new Error("Address is required");
      }
      if (!formData.email.trim()) {
        throw new Error("Email is required");
      }
      if (skills.length === 0) {
        throw new Error("At least one skill is required");
      }
      if (formData.modeOfWork.length === 0) {
        throw new Error("At least one mode of work is required");
      }

      setIsLoading(true);
      const newCompany = {
        companyName: formData.companyName,
        companyDescription: formData.description,       
        companyWeb: formData.website,                  
        field: formData.field,
        companyAddress: formData.address,             
        companyEmail: formData.email,          
        skillsREq: skills,                  
        moa: formData.moa ? "Yes" : "No",     
        modeOfWork: formData.modeOfWork,    
        createdAt: new Date().toISOString(),
        fields: fields,
      };

      const docRef = await addDoc(collection(db, 'companies'), newCompany);
      
      setTableData(prev => [...prev, { id: docRef.id, ...newCompany }]);
      setIsModalOpen(false);
      
      // Reset form
      setFormData({
        companyName: '',
        description: '',
        website: '', // Add this line
        field: '',
        address: '',
        email: '',
        skills: '',
        moa: false,
        modeOfWork: [],
      });

      setSkills([]); // Clear skills array
      setFields([]);
    } catch (err) {
      setError(err.message);
      return; // Stop execution if validation fails
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    setShowConfirm(true);
  };

  const confirmDelete = async () => {
    setShowConfirm(false);
    try {
      setIsDeleting(true);
      
      // Delete from Firestore
      for (const id of selectedItems) {
        await deleteDoc(doc(db, 'companies', id));
      }
  
      // Update local state
      setTableData(prevData => prevData.filter(item => !selectedItems.includes(item.id)));
      setSelectedItems([]);
      
    } catch (error) {
      console.error("Error deleting items:", error);
      setError("Failed to delete items. Please try again.");
    } finally {
      setIsDeleting(false);
    }
  };

  const cancelDelete = () => {
    setShowConfirm(false);
  };
  
  const handleSelectItem = (id) => {
    setSelectedItems(prev => {
      if (prev.includes(id)) {
        return prev.filter(item => item !== id);
      } else {
        return [...prev, id];
      }
    });
  };
  
  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedItems(tableData.map(item => item.id));
    } else {
      setSelectedItems([]);
    }
  };

  const handleSendNotification = async () => {
    if (!notificationText.trim()) return;
    
    try {
      // Add your notification sending logic here
      // For example, saving to Firebase
      await addDoc(collection(db, 'notifications'), {
        message: notificationText,
        timestamp: new Date().toISOString(),
        read: false
      });
      
      setNotificationText(''); // Clear the input
      // Optional: Show success message
    } catch (error) {
      console.error('Error sending notification:', error);
      setError('Failed to send notification');
    }
  };

  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
  };

  // Add this pagination calculation
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;

  const filteredData = tableData.filter(row => {
    const matchesSearch =
      row.companyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (Array.isArray(row.fields) && row.fields.some(f => f.toLowerCase().includes(searchQuery.toLowerCase()))) ||
      row.companyDescription.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesfield = filterValues.field
      ? (Array.isArray(row.fields) && row.fields.some(f => f.toLowerCase().includes(filterValues.field.toLowerCase())))
      : true;

    const matchesModeOfWork = filterValues.modeOfWork
      ? Array.isArray(row.modeOfWork) && row.modeOfWork.includes(filterValues.modeOfWork)
      : true;

    const matchesMoa = filterValues.moa
      ? row.moa === filterValues.moa
      : true;

    return matchesSearch && matchesfield && matchesModeOfWork && matchesMoa;
  });

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);

  const currentItems = filteredData.slice(indexOfFirstItem, indexOfLastItem);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      window.location.href = '/'; // Redirect to login page
    } catch (error) {
      alert('Logout failed!');
    }
  };

  const handleEdit = (company) => {
    setFormData({
      companyName: company.companyName || '',
      description: company.companyDescription || '',
      website: company.companyWeb || '',
      field: company.field || '',
      address: company.companyAddress || '',
      email: company.companyEmail || '',
      skills: '',
      moa: company.moa === "Yes",
      modeOfWork: Array.isArray(company.modeOfWork) ? company.modeOfWork : [],
    });
    setSkills(Array.isArray(company.skillsREq) ? company.skillsREq : []);
    setIsEditMode(true);
    setEditCompanyId(company.id);
    setIsModalOpen(true);
    setFields(Array.isArray(company.fields) ? company.fields : []);
  };

  const handleUpdateEntry = async () => {
    try {
      if (!formData.companyName.trim()) throw new Error("Company name is required");
      if (!formData.description.trim()) throw new Error("Description is required");
      if (!formData.website.trim()) throw new Error("Website is required");
      if (fields.length === 0) throw new Error("At least one field is required");
      if (!formData.address.trim()) throw new Error("Address is required");
      if (!formData.email.trim()) throw new Error("Email is required");
      if (skills.length === 0) throw new Error("At least one skill is required");
      if (formData.modeOfWork.length === 0) throw new Error("At least one mode of work is required");

      setIsLoading(true);
      const updatedCompany = {
        companyName: formData.companyName,
        companyDescription: formData.description,
        companyWeb: formData.website,
        field: formData.field,
        companyAddress: formData.address,
        companyEmail: formData.email,
        skillsREq: skills,
        moa: formData.moa ? "Yes" : "No",
        modeOfWork: formData.modeOfWork,
        fields: fields,
      };

      await updateDoc(doc(db, 'companies', editCompanyId), updatedCompany);

      setTableData(prev =>
        prev.map(item =>
          item.id === editCompanyId ? { ...item, ...updatedCompany } : item
        )
      );
      setIsModalOpen(false);
      setIsEditMode(false);
      setEditCompanyId(null);
      setFormData({
        companyName: '',
        description: '',
        website: '',
        field: '',
        address: '',
        email: '',
        skills: '',
        moa: false,
        modeOfWork: [],
      });
      setSkills([]);
      setFields([]);
    } catch (err) {
      setError(err.message);
      return;
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteSingle = async (id) => {
    try {
      setIsDeleting(true);
      await deleteDoc(doc(db, 'companies', id));
      setTableData(prev => prev.filter(company => company.id !== id));
      setSelectedRowId(null);
      setOpenMenuId(null);
    } catch (error) {
      setError("Failed to delete company. Please try again.");
    } finally {
      setIsDeleting(false);
    }
  };

  useEffect(() => {
    async function fetchData() {
      // Fetch companies
      const companySnapshot = await getDocs(collection(db, "companies"));
      const companies = [];
      companySnapshot.forEach((doc) => {
        companies.push({ id: doc.id, ...doc.data() });
      });

      // Fetch students
      const studentSnapshot = await getDocs(collection(db, "users")); // or your students collection name
      const students = [];
      studentSnapshot.forEach((doc) => {
        students.push({ id: doc.id, ...doc.data() });
      });

      setTableData(companies);
      setOverviewStats({
        totalCompanies: companies.length,
        totalStudents: students.length,
      });
    }
    fetchData();
  }, []);

  return (
    <div className="dashboard-container">
      <nav className="top-nav">
        <div className="nav-left">
          <div className="logo">
            <img src={logo} alt="Logo" height="32" /> {/* Add your logo image */}
          </div>
          <div className="nav-links">
            <a href="/dashboard" className="nav-link active">Manage Internships</a>
            <a href="/studentDashboard" className="nav-link">Manage Students</a>
          </div>
        </div>
        <div className="nav-right" style={{ position: 'relative' }}>
          <IoSettingsOutline
            className="settings-icon"
            onClick={() => setShowLogout(prev => !prev)}
            style={{ cursor: 'pointer' }}
          />
          {showLogout && (
            <div className="logout-dropdown">
              <button onClick={handleLogout}>Logout</button>
            </div>
          )}
        </div>
      </nav>

      <div className="dashboard-content">
        <div className="overview-section">
          <h1>Dashboard Overview</h1>
          <div className="overview-cards">
            <div className="card">
              <h3>Company</h3>
              <p>Total active company</p>
              <div className="count">{overviewStats.totalCompanies}</div>
            </div>
            <div className="card">
              <h3>Students</h3>
              <p>Total Registed students</p>
              <div className="count">{overviewStats.totalStudents}</div>
            </div>
            <div className="card notification-card">
              <h3>Notifications</h3>
              <p>Quick Notifications</p>
              <div className="notification-content">
                <input 
                  type="text" 
                  placeholder="Send alerts..." 
                  value={notificationText}
                  onChange={(e) => setNotificationText(e.target.value)}
                  className="notification-input"
                />
                <button 
                  className="send-notification-btn"
                  onClick={handleSendNotification}
                >
                  Send Now
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="internships-section">
          <h2>Manage Internships</h2>
          <div className="searchbar-container">
            <span className="searchbar-icon">
              <svg width="20" height="20" fill="none" stroke="#888" strokeWidth="2">
                <circle cx="9" cy="9" r="7" />
                <line x1="15" y1="15" x2="19" y2="19" />
              </svg>
            </span>
            <input
              type="text"
              className="searchbar-input"
              placeholder="Search companies..."
              value={searchQuery}
              onChange={handleSearch}
            />
            <div className="filter-wrapper">
              <button className="searchbar-filter-btn" onClick={() => {
                setPendingFilterValues(filterValues);
                setShowFilter((prev) => !prev);
              }} title="Filter">
                <FaFilter size={18} />
              </button>
              {showFilter && (
                <div className="filter-dropdown">
                  <div>
                    <label>field:</label>
                    <input
                      type="text"
                      value={pendingFilterValues.field}
                      onChange={e => setPendingFilterValues(f => ({ ...f, field: e.target.value }))}
                      placeholder="field"
                    />
                  </div>
                  <div>
                    <label>Mode of Work:</label>
                    <select
                      value={pendingFilterValues.modeOfWork}
                      onChange={e => setPendingFilterValues(f => ({ ...f, modeOfWork: e.target.value }))}
                    >
                      <option value="">All</option>
                      <option value="On-site">On-site</option>
                      <option value="Remote">Remote</option>
                      <option value="Hybrid">Hybrid</option>
                    </select>
                  </div>
                  <div>
                    <label>MOA:</label>
                    <select
                      value={pendingFilterValues.moa}
                      onChange={e => setPendingFilterValues(f => ({ ...f, moa: e.target.value }))}
                    >
                      <option value="">All</option>
                      <option value="Yes">Yes</option>
                      <option value="No">No</option>
                    </select>
                  </div>
                  <button
                    className="apply-filter-btn"
                    onClick={() => {
                      setFilterValues(pendingFilterValues);
                      setShowFilter(false);
                    }}
                    type="button"
                  >
                    Apply
                  </button>
                  <button
                    className="apply-filter-btn"
                    style={{ background: '#f44336', marginTop: 8 }}
                    onClick={() => {
                      const reset = {
                        field: '',
                        modeOfWork: '',
                        moa: '',
                      };
                      setPendingFilterValues(reset);
                      setFilterValues(reset);
                      setShowFilter(false);
                    }}
                    type="button"
                  >
                    Reset
                  </button>
                </div>
              )}
            </div>
          </div>
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th className="checkbox-cell">
                    {selectionMode && <span style={{ fontWeight: 500 }}>Select</span>}
                  </th>
                  <th>Company Name</th>
                  <th>Description</th>
                  <th>Company Website</th>
                  <th>Field</th>
                  <th>Address</th>
                  <th>Email</th>
                  <th>Skills required</th>
                  <th>MOA</th>
                  <th>Mode of work</th>
                  <th className="kebab-cell"></th>
                </tr>
              </thead>
              <tbody>
                {currentItems.map((row) => (
                  <tr key={row.id} className={selectedItems.includes(row.id) ? 'selected-row' : ''}>
                    <td className="checkbox-cell">
                      {selectionMode && (
                        <input
                          type="checkbox"
                          checked={selectedItems.includes(row.id)}
                          onChange={() => {
                            setSelectedItems(prev =>
                              prev.includes(row.id)
                                ? prev.filter(item => item !== row.id)
                                : [...prev, row.id]
                            );
                          }}
                        />
                      )}
                    </td>
                    <td>{row.companyName}</td>
                    <td className="description-cell">
                      <div className="description-content">
                        {row.companyDescription && row.companyDescription.length > 100 
                          ? `${row.companyDescription.substring(0, 100)}...`
                          : row.companyDescription
                        }
                        {row.companyDescription && row.companyDescription.length > 100 && (
                          <div className="description-tooltip">
                            {row.companyDescription}
                          </div>
                        )}
                      </div>
                    </td>
                    <td>
                      <a href={row.companyWeb} target="_blank" rel="noopener noreferrer">
                        {row.companyWeb}
                      </a>
                    </td>
                    <td>
                      <div className="table-fields-tags">
                        {Array.isArray(row.fields) && row.fields.map((field, index) => (
                          <span key={field + index} className="table-field-tag">
                            {field}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td>{row.companyAddress}</td>
                    <td>
                      {row.companyEmail ? (
                        <a
                          href={`https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(row.companyEmail)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{ color: '#1976d2', textDecoration: 'underline' }}
                        >
                          {row.companyEmail}
                        </a>
                      ) : ''}
                    </td>
                    <td>
                      <div className="table-skills-tags">
                        {Array.isArray(row.skillsREq) && row.skillsREq.map((skill, index) => (
                          <span key={skill + index} className="table-skill-tag">
                            {skill}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td>
                      <input type="checkbox" checked={row.moa === "Yes"} readOnly />
                    </td>
                    <td>
                      <div className="table-mode-tags">
                        {Array.isArray(row.modeOfWork)
                          ? row.modeOfWork.map((mode, idx) => (
                              <span
                                key={mode + idx}
                                className={`mode-tag mode-tag-${mode.replace(/\s+/g, '').toLowerCase()}`}
                              >
                                {mode}
                              </span>
                            ))
                          : row.modeOfWork}
                      </div>
                    </td>
                    <td className="kebab-cell">
                      <KebabCell
                        row={row}
                        openMenuId={openMenuId}
                        setOpenMenuId={setOpenMenuId}
                        selectedRowId={selectedRowId}
                        setSelectedRowId={setSelectedRowId}
                        handleDeleteSingle={handleDeleteSingle}
                        isDeleting={isDeleting}
                        selectionMode={selectionMode}
                        setSelectedItems={setSelectedItems}
                        setSelectionMode={setSelectionMode}
                        setIsEditMode={setIsEditMode}
                        setEditCompanyId={setEditCompanyId}
                        setFormData={setFormData}
                        setSkills={setSkills}
                        setIsModalOpen={setIsModalOpen}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="pagination">
            <button 
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="pagination-arrow"
            >
              &lt;
            </button>
            {[...Array(totalPages)].map((_, index) => (
              <button
                key={index + 1}
                onClick={() => setCurrentPage(index + 1)}
                className={`pagination-number ${currentPage === index + 1 ? 'active' : ''}`}
              >
                {index + 1}
              </button>
            ))}
            <button 
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="pagination-arrow"
            >
              &gt;
            </button>
          </div>
          <div className="table-actions">
            <button
              className="add-entry"
              onClick={() => {
                setIsEditMode(false);
                setIsModalOpen(true);
                setFormData({
                  companyName: '',
                  description: '',
                  website: '',
                  field: '',
                  address: '',
                  email: '',
                  skills: '',
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
              <div style={{ margin: '1rem 0' }}>
                <button
                  className="delete"
                  onClick={handleDelete}
                  disabled={isDeleting}
                >
                  {isDeleting ? 'Deleting...' : `Delete (${selectedItems.length})`}
                </button>
                <button
                  onClick={() => {
                    setSelectionMode(false);
                    setSelectedItems([]);
                    setOpenMenuId(null);
                  }}
                  style={{ marginLeft: '1rem' }}
                >
                  Cancel
                </button>
              </div>
            )}
          </div>
          
        </div>
      </div>

      {isModalOpen && (
        <div className="modal">
          <div className="modal-content">
            <h2>{isEditMode ? "Edit Company" : "Add New Company"}</h2>
            {error && (
              <div className="modal-error-message">
                {error}
                <IoCloseOutline className="error-icon" onClick={() => setError(null)} />
              </div>
            )}
            <form>
              <div className="form-group">
                <label htmlFor="companyName">Company Name:</label>
                <input
                  id="companyName"
                  type="text"
                  name="companyName"
                  value={formData.companyName}
                  onChange={handleInputChange}
                  placeholder="Enter company name"
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="description">Description:</label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Enter company description"
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="website">Website:</label>
                <input
                  id="website"
                  type="text"
                  name="website"
                  value={formData.website}
                  onChange={handleInputChange}
                  placeholder="Enter company website"
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="field">Field:</label>
                <div className="fields-container">
                  <div className="fields-input-wrapper">
                    <input
                      type="text"
                      className="fields-input"
                      placeholder="Search fields"
                      value={fieldInput}
                      onChange={e => {
                        setFieldInput(e.target.value);
                        setShowFieldDropdown(true);
                      }}
                    />
                    {showFieldDropdown && fieldInput && (
                      <div className="fields-dropdown">
                        {filteredFields.map((field, index) => (
                          <div
                            key={field + index}
                            className="fields-dropdown-item"
                            onClick={() => {
                              if (!fields.includes(field)) setFields([...fields, field]);
                              setFieldInput('');
                              setShowFieldDropdown(false);
                            }}
                          >
                            {field}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="fields-tags">
                    {fields.map((field, idx) => (
                      <span key={field + idx} className="field-tag">
                        {field}
                        <IoCloseOutline
                          className="remove-field"
                          onClick={() => setFields(fields.filter(f => f !== field))}
                        />
                      </span>
                    ))}
                  </div>
                  <div className="fields-limit">
                    {fields.length}/15 fields added
                  </div>
                </div>
              </div>
              <div className="form-group">
                <label htmlFor="address">Address:</label>
                <input
                  id="address"
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  placeholder="Enter company address"
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="email">Email:</label>
                <input
                  id="email"
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="Enter company email"
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="skills">Skills Required:</label>
                <div className="skills-container">
                  <div className="skills-input-wrapper">
                    <input
                      type="text"
                      className="skills-input"
                      placeholder="Search skills"
                      value={skillInput}
                      onChange={handleSkillInput}
                      ref={skillsInputRef}
                    />
                    {showDropdown && skillInput && (
                      <div className="skills-dropdown">
                        {filtered.map((skill, index) => (
                          <div
                            key={skill + index}
                            className="skills-dropdown-item"
                            onClick={() => addSkill(skill)}
                          >
                            {skill}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  <div 
                    className="skills-tags" 
                    onDragOver={(e) => e.preventDefault()}
                  >
                    {skills.map((skill, idx) => (
                      <span
                        key={skill + idx}
                        className="skill-tag"
                        draggable
                        onDragStart={(e) => {
                          e.dataTransfer.setData('text/plain', idx.toString());
                          e.currentTarget.classList.add('dragging');
                        }}
                        onDragEnd={(e) => {
                          e.currentTarget.classList.remove('dragging');
                        }}
                        onDragOver={(e) => {
                          e.preventDefault();
                          e.currentTarget.classList.add('drag-over');
                        }}
                        onDragLeave={(e) => {
                          e.currentTarget.classList.remove('drag-over');
                        }}
                        onDrop={(e) => {
                          e.preventDefault();
                          e.currentTarget.classList.remove('drag-over');
                          const fromIndex = parseInt(e.dataTransfer.getData('text/plain'));
                          const toIndex = idx;
                          if (fromIndex !== toIndex) {
                            const newSkills = [...skills];
                            const [movedSkill] = newSkills.splice(fromIndex, 1);
                            newSkills.splice(toIndex, 0, movedSkill);
                            setSkills(newSkills);
                          }
                        }}
                      >
                        {skill}
                        <IoCloseOutline
                          className="remove-skill"
                          onClick={() => removeSkill(skill)}
                        />
                      </span>
                    ))}
                  </div>
                  <div className="skills-limit">
                    {skills.length}/15 skills added
                  </div>
                </div>
              </div>
              <div className="form-group">
                <label htmlFor="moa" className="checkbox-label">
                  <input
                    id="moa"
                    type="checkbox"
                    name="moa"
                    checked={formData.moa}
                    onChange={handleInputChange}
                  />
                  MOA (Memorandum of Agreement)
                </label>
              </div>
              <div className="form-group">
                <label>Mode of Work:</label>
                <div className="mode-of-work-options">
                  {['On-site', 'Remote', 'Hybrid'].map(mode => (
                    <label key={mode} className="mode-checkbox">
                      <input
                        type="checkbox"
                        value={mode}
                        checked={formData.modeOfWork.includes(mode)}
                        onChange={handleModeOfWorkChange}
                      />
                      {mode}
                    </label>
                  ))}
                </div>
              </div>
            </form>
            <div className="modal-actions">
              {isEditMode ? (
                <button type="button" onClick={handleUpdateEntry}>Update</button>
              ) : (
                <button type="button" onClick={handleAddEntry}>Add</button>
              )}
              <button
                type="button"
                onClick={() => {
                  setIsModalOpen(false);
                  setIsEditMode(false);
                  setEditCompanyId(null);
                  setFormData({
                    companyName: '',
                    description: '',
                    website: '',
                    field: '',
                    address: '',
                    email: '',
                    skills: '',
                    moa: false,
                    modeOfWork: [],
                  });
                  setSkills([]);
                  setFields([]);
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      <ConfirmModal
        open={showConfirm}
        message={`Are you sure you want to delete ${selectedItems.length} item(s)?`}
        onConfirm={confirmDelete}
        onCancel={cancelDelete}
      />
    </div>
  );
};

export default Dashboard;