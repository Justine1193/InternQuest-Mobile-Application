import React, { useState, useEffect } from 'react';
import { IoSearchOutline, IoSettingsOutline } from "react-icons/io5";
import { db } from '../../../firebase'; 
import { collection, getDocs, addDoc } from 'firebase/firestore';
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
                  <th>First Name</th>
                  <th>Last Name</th>
                  <th>Gender</th>
                  <th>Program</th>
                  <th>Field</th>
                  <th>Location Preference</th>
                  <th>Skills</th>
                </tr>
              </thead>
              <tbody>
                {currentItems.map((student) => (
                  <tr key={student.id}>
                    <td>{student.firstName}</td>
                    <td>{student.lastName}</td>
                    <td>{student.gender}</td>
                    <td>{student.program}</td>
                    <td>{student.field}</td>
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
    </div>
  );
};

export default StudentDashboard;
