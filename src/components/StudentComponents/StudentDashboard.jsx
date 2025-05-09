import React, { useState, useEffect, useRef } from 'react';
import { IoSearchOutline, IoSettingsOutline, IoEllipsisVertical, IoCloseOutline } from "react-icons/io5";
import { FaFilter } from "react-icons/fa";
import { db } from '../../../firebase'; 
import { collection, getDocs, addDoc, deleteDoc, doc } from 'firebase/firestore';
import logo from '../../assets/InternQuest_Logo.png';
import { signOut } from 'firebase/auth';
import { auth } from '../../../firebase';
import PortalDropdown from '../PortalDropdown';
import ConfirmModal from '../ConfirmModal/ConfirmModal.jsx';

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

const StudentDashboard = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [students, setStudents] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [overviewStats, setOverviewStats] = useState({
    totalCompanies: 0,
    totalStudents: 0, 
  });
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [notificationText, setNotificationText] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(8);
  const [showLogout, setShowLogout] = useState(false);
  
  // Add new state variables for kebab menu functionality
  const [openMenuId, setOpenMenuId] = useState(null);
  const [selectedRowId, setSelectedRowId] = useState(null);
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedItems, setSelectedItems] = useState([]);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  // Add filter states
  const [showFilter, setShowFilter] = useState(false);
  const [filterValues, setFilterValues] = useState({
    program: '',
    field: '',
    email: '',
    contact: '',
    hired: '',
    locationPreference: '',
  });

  const [pendingFilterValues, setPendingFilterValues] = useState({
    program: '',
    field: '',
    email: '',
    contact: '',
    hired: '',
    locationPreference: '',
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);

        // Fetch companies
        const companiesSnapshot = await getDocs(collection(db, 'companies'));
        const companiesData = companiesSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setCompanies(companiesData);

        // Fetch students
        const studentsSnapshot = await getDocs(collection(db, 'users'));
        const studentsData = studentsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setStudents(studentsData);

        setOverviewStats({
          totalCompanies: companiesData.length,
          totalStudents: studentsData.length
        });
      } catch (err) {
        setError("Failed to fetch data. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  // Notification logic
  const handleSendNotification = async () => {
    if (!notificationText.trim()) return;
    try {
      await addDoc(collection(db, 'notifications'), {
        message: notificationText,
        timestamp: new Date().toISOString(),
        read: false
      });
      setNotificationText('');
    } catch (error) {
      setError('Failed to send notification');
    }
  };

  // Update the filteredData to include filters
  const filteredData = students.filter(student => {
    const matchesSearch =
      (student.firstName && student.firstName.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (student.lastName && student.lastName.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (student.program && student.program.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesProgram = filterValues.program
      ? student.program && student.program.toLowerCase().includes(filterValues.program.toLowerCase())
      : true;

    const matchesField = filterValues.field
      ? student.field && student.field.toLowerCase().includes(filterValues.field.toLowerCase())
      : true;

    const matchesEmail = filterValues.email
      ? student.email && student.email.toLowerCase().includes(filterValues.email.toLowerCase())
      : true;

    const matchesContact = filterValues.contact
      ? student.contact && student.contact.toLowerCase().includes(filterValues.contact.toLowerCase())
      : true;

    const matchesHired = filterValues.hired
      ? (filterValues.hired === 'Yes' ? student.hired === true : student.hired !== true)
      : true;

    const matchesLocation = filterValues.locationPreference
      ? student.locationPreference && student.locationPreference[filterValues.locationPreference.toLowerCase()]
      : true;

    return matchesSearch && matchesProgram && matchesField && matchesEmail && matchesContact && matchesHired && matchesLocation;
  });

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredData.slice(indexOfFirstItem, indexOfLastItem);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      window.location.href = '/'; // Redirect to login page
    } catch (error) {
      alert('Logout failed!');
    }
  };

  const handleDeleteSingle = async (id) => {
    try {
      setIsDeleting(true);
      await deleteDoc(doc(db, 'users', id));
      setStudents(prev => prev.filter(student => student.id !== id));
      setSelectedRowId(null);
      setOpenMenuId(null);
    } catch (error) {
      setError("Failed to delete student. Please try again.");
    } finally {
      setIsDeleting(false);
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
        await deleteDoc(doc(db, 'users', id));
      }
  
      // Update local state
      setStudents(prevData => prevData.filter(item => !selectedItems.includes(item.id)));
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

  return (
    <div className="dashboard-container">
      <nav className="top-nav">
        <div className="nav-left">
          <div className="logo">
            <img src={logo} alt="Logo" height="32" />
          </div>
          <div className="nav-links">
            <a href="/dashboard" className="nav-link">Manage Internships</a>
            <a href="/studentDashboard" className="nav-link active">Manage Students</a>
          </div>
        </div>
        <div className="nav-right" style={{ position: 'relative' }}>
          <IoSettingsOutline
            className="settings-icon"
            onClick={() => setShowLogout(prev => !prev)}
            style={{ cursor: 'pointer' }}
          />
          {showLogout && (
            <div
              style={{
                position: 'absolute',
                right: 0,
                top: '40px',
                background: '#fff',
                border: '1px solid #ddd',
                borderRadius: '4px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                zIndex: 1000,
                minWidth: '120px',
                padding: '8px 0',
              }}
            >
              <button
                onClick={handleLogout}
                style={{
                  width: '100%',
                  background: 'none',
                  border: 'none',
                  padding: '10px 16px',
                  textAlign: 'left',
                  cursor: 'pointer',
                  fontSize: '16px',
                  color: '#333',
                  outline: 'none'
                }}
              >
                Logout
              </button>
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
              <p>Total Registered Students</p>
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
          <h2>Manage Students</h2>
          <div className="search-wrapper">
            <div className="searchbar-container">
              <span className="searchbar-icon">
                <IoSearchOutline />
              </span>
              <input
                type="text"
                className="searchbar-input"
                placeholder="Search student..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
              />
              <div className="filter-wrapper">
                <button
                  className="searchbar-filter-btn"
                  onClick={() => {
                    setPendingFilterValues(filterValues);
                    setShowFilter((prev) => !prev);
                  }}
                  title="Filter"
                >
                  <FaFilter size={18} />
                </button>
                {showFilter && (
                  <div className="filter-dropdown">
                    <div>
                      <label>Program:</label>
                      <input
                        type="text"
                        value={pendingFilterValues.program}
                        onChange={e => setPendingFilterValues(f => ({ ...f, program: e.target.value }))}
                        placeholder="Program"
                      />
                    </div>
                    <div>
                      <label>Field:</label>
                      <input
                        type="text"
                        value={pendingFilterValues.field}
                        onChange={e => setPendingFilterValues(f => ({ ...f, field: e.target.value }))}
                        placeholder="Field"
                      />
                    </div>
                    <div>
                      <label>Email:</label>
                      <input
                        type="text"
                        value={pendingFilterValues.email}
                        onChange={e => setPendingFilterValues(f => ({ ...f, email: e.target.value }))}
                        placeholder="Email"
                      />
                    </div>
                    <div>
                      <label>Contact:</label>
                      <input
                        type="text"
                        value={pendingFilterValues.contact}
                        onChange={e => setPendingFilterValues(f => ({ ...f, contact: e.target.value }))}
                        placeholder="Contact"
                      />
                    </div>
                    <div>
                      <label>Hired:</label>
                      <select
                        value={pendingFilterValues.hired}
                        onChange={e => setPendingFilterValues(f => ({ ...f, hired: e.target.value }))}
                      >
                        <option value="">All</option>
                        <option value="Yes">Yes</option>
                        <option value="No">No</option>
                      </select>
                    </div>
                    <div>
                      <label>Location Preference:</label>
                      <select
                        value={pendingFilterValues.locationPreference}
                        onChange={e => setPendingFilterValues(f => ({ ...f, locationPreference: e.target.value }))}
                      >
                        <option value="">All</option>
                        <option value="Onsite">On-site</option>
                        <option value="Remote">Remote</option>
                        <option value="Hybrid">Hybrid</option>
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
                          program: '',
                          field: '',
                          email: '',
                          contact: '',
                          hired: '',
                          locationPreference: '',
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
          </div>
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th className="checkbox-cell">
                    {selectionMode && <span style={{ fontWeight: 500 }}>Select</span>}
                  </th>
                  <th>First Name</th>
                  <th>Last Name</th>
                  <th>Gender</th>
                  <th>Program</th>
                  <th>Field</th>
                  <th>Email</th>
                  <th>Contact</th>
                  <th>Hired</th>
                  <th>Location Preference</th>
                  <th>Skills</th>
                  <th className="kebab-cell"></th>
                </tr>
              </thead>
              <tbody>
                {currentItems.map((student) => (
                  <tr key={student.id} className={selectedItems.includes(student.id) ? 'selected-row' : ''}>
                    <td className="checkbox-cell">
                      {selectionMode && (
                        <input
                          type="checkbox"
                          checked={selectedItems.includes(student.id)}
                          onChange={() => {
                            setSelectedItems(prev =>
                              prev.includes(student.id)
                                ? prev.filter(item => item !== student.id)
                                : [...prev, student.id]
                            );
                          }}
                        />
                      )}
                    </td>
                    <td>{student.firstName}</td>
                    <td>{student.lastName}</td>
                    <td>{student.gender}</td>
                    <td>{student.program}</td>
                    <td>{student.field}</td>
                    <td>
                      {student.email ? (
                        <a
                          href={`https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(student.email)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{ color: '#1976d2', textDecoration: 'underline' }}
                        >
                          {student.email}
                        </a>
                      ) : ''}
                    </td>
                    <td>{student.contact || ''}</td>
                    <td>{student.hired ? 'Yes' : 'No'}</td>
                    <td>
                      {student.locationPreference && (
                        <>
                          {student.locationPreference.hybrid && "Hybrid "}
                          {student.locationPreference.onsite && "Onsite "}
                          {student.locationPreference.remote && "Remote "}
                        </>
                      )}
                    </td>
                    <td>
                      {Array.isArray(student.skills) && student.skills.map((skill, idx) => (
                        <span key={idx} className="table-skill-tag">{skill}</span>
                      ))}
                    </td>
                    <td className="kebab-cell">
                      <KebabCell
                        row={student}
                        openMenuId={openMenuId}
                        setOpenMenuId={setOpenMenuId}
                        selectedRowId={selectedRowId}
                        setSelectedRowId={setSelectedRowId}
                        handleDeleteSingle={handleDeleteSingle}
                        isDeleting={isDeleting}
                        selectionMode={selectionMode}
                        setSelectedItems={setSelectedItems}
                        setSelectionMode={setSelectionMode}
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
        </div>
      </div>

      <ConfirmModal
        open={showConfirm}
        message={`Are you sure you want to delete ${selectedItems.length} item(s)?`}
        onConfirm={confirmDelete}
        onCancel={cancelDelete}
      />
    </div>
  );
};

export default StudentDashboard;
