import React, { useState, useEffect } from 'react';
import { IoSearchOutline, IoSettingsOutline, IoMenu, IoEllipsisVertical } from "react-icons/io5";
import { db } from '../../../firebase'; 
import { collection, getDocs, addDoc, deleteDoc, doc } from 'firebase/firestore';
import logo from '../../assets/InternQuest_Logo.png';
import { signOut } from 'firebase/auth';
import { auth } from '../../../firebase';


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
  const [isDeleting, setIsDeleting] = useState(false);
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedItems, setSelectedItems] = useState([]);
  const [openMenuId, setOpenMenuId] = useState(null);
  const [selectedRowId, setSelectedRowId] = useState(null);

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

  // Pagination and search logic
  const filteredData = students.filter(student =>
    (student.firstName && student.firstName.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (student.lastName && student.lastName.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (student.program && student.program.toLowerCase().includes(searchQuery.toLowerCase()))
  );
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

  const handleSelectItem = (id) => {
    setSelectedItems(prev =>
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const handleDeleteSingle = async (id) => {
    try {
      setIsDeleting(true);
      await deleteDoc(doc(db, 'users', id)); // Use 'users' for students
      setStudents(prev => prev.filter(student => student.id !== id));
    } catch (error) {
      setError("Failed to delete student. Please try again.");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      if (!window.confirm(`Are you sure you want to delete ${selectedItems.length} item(s)?`)) {
        setIsDeleting(false);
        return;
      }
      for (const id of selectedItems) {
        await deleteDoc(doc(db, 'companies', id));
      }
      setCompanies(prevCompanies => prevCompanies.filter(company => !selectedItems.includes(company.id)));
      setSelectedItems([]);
      setSelectionMode(false);
    } catch (error) {
      setError("Failed to delete items. Please try again.");
    } finally {
      setIsDeleting(false);
    }
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
            <div className="search-container">
              <IoSearchOutline className="search-icon" />
              <input
                type="text"
                placeholder="Search student..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="search-input"
              />
            </div>
          </div>
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th className="checkbox-cell"></th>
                  <th>First Name</th>
                  <th>Last Name</th>
                  <th>Gender</th>
                  <th>Program</th>
                  <th>Skills</th>
                  <th>Location Preference</th>
                  <th className="kebab-cell"></th>
                </tr>
              </thead>
              <tbody>
                {currentItems.map((row) => (
                  <tr key={row.id} className={selectedItems.includes(row.id) ? 'selected-row' : ''}>
                    <td className="checkbox-cell">
                      {selectedRowId === row.id && (
                        <input
                          type="checkbox"
                          checked={true}
                          readOnly
                        />
                      )}
                    </td>
                    <td>{row.firstName}</td>
                    <td>{row.lastName}</td>
                    <td>{row.gender}</td>
                    <td>{row.program}</td>
                    <td>
                      {Array.isArray(row.skills) && row.skills.map((skill, idx) => (
                        <span key={idx} className="table-skill-tag">{skill}</span>
                      ))}
                    </td>
                    <td>
                      {row.locationPreference && (
                        <>
                          {row.locationPreference.hybrid && "Hybrid "}
                          {row.locationPreference.onsite && "Onsite "}
                          {row.locationPreference.remote && "Remote "}
                        </>
                      )}
                    </td>
                    <td className="kebab-cell">
                      <span className="kebab-icon-wrapper" style={{ position: 'relative', display: 'inline-block' }}>
                        <IoEllipsisVertical
                          className="kebab-icon"
                          onClick={() => {
                            if (openMenuId === row.id) {
                              setOpenMenuId(null);
                              setSelectedRowId(null);
                            } else {
                              setOpenMenuId(row.id);
                              setSelectedRowId(null);
                            }
                          }}
                          title="Options"
                        />
                        {openMenuId === row.id && (
                          <div className="kebab-dropdown">
                            {selectedRowId !== row.id ? (
                              <button onClick={() => setSelectedRowId(row.id)}>Select</button>
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
                          </div>
                        )}
                      </span>
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
          {selectedItems.length > 0 && (
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
  );
};

export default StudentDashboard;
