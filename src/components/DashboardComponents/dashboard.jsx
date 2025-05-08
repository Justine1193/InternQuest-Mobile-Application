import React, { useState, useRef, useEffect } from 'react';
import './dashboard.css';
import { IoCloseOutline, IoSearchOutline, IoSettingsOutline } from "react-icons/io5";
import { db } from '../../../firebase'; 
import { collection, addDoc, getDocs, deleteDoc, doc} from 'firebase/firestore';
import logo from '../../assets/InternQuest.png'; // Adjust the path to your logo image
import { signOut } from 'firebase/auth';
import { auth } from '../../../firebase';

const Dashboard = () => {

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    companyName: '',
    description: '',
    website: '', 
    industry: '',
    address: '',
    email: '',
    skills: '',
    moa: false,
    modeOfWork: '',
  });

  const [isLoading, setIsLoading] = useState(false);
  const [skills, setSkills] = useState([]);
  const [skillInput, setSkillInput] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const skillsInputRef = useRef(null);

  const suggestedSkills = [
    // Business, Accountancy, and Entrepreneurship
    'Financial Analysis',
    'Financial Reporting',
    'QuickBooks',
    'Xero',
    'Market Research',
    'Market Analysis',
    'Sales',
    'Negotiation',
    'Microsoft Excel (Advanced)',
    'Business Communication',
    'Strategic Planning',
    'CRM Tools',
    
    // IT, Computer Science, and Multimedia
    'HTML',
    'CSS',
    'JavaScript',
    'React',
    'Node.js',
    'PHP',
    'Python',
    'MySQL',
    'Firebase',
    'MongoDB',
    'UI Design',
    'UX Design',
    'Figma',
    'Adobe XD',
    'Git',
    'GitHub',
    'Unity',
    'Unreal Engine',
    'Blender',
    'Maya',
    'Cybersecurity',
    
    // Psychology, Education, and Public Administration
    'Psychological Assessment',
    'Report Writing',
    'Documentation',
    'Classroom Management',
    'Lesson Planning',
    'Google Forms',
    'SurveyMonkey',
    'Community Outreach',
    'Public Speaking',
    'Facilitation',
    'Active Listening',
    
    // Medical, Nursing, and Science
    'Laboratory Safety',
    'Diagnostic Skills',
    'Vital Signs',
    'Health Documentation',
    'EHR Systems',
    'Patient Communication',
    'Research Methods',
    'Data Interpretation',
    'Specimen Handling',
    'First Aid',
    'Emergency Response',
    
    // Communication, Journalism, and Arts
    'Copywriting',
    'Editing',
    'Photography',
    'Videography',
    'Adobe Photoshop',
    'Adobe Premiere Pro',
    'Adobe InDesign',
    'Social Media Content',
    'News Writing',
    'Press Releases',
    'Public Relations',
    'Media Strategy',
    'Storyboarding',
    'Scriptwriting',
    'Podcasting',
    'Audio Editing',
    
    // Engineering and Architecture
    'AutoCAD',
    'SketchUp',
    'Revit',
    'Structural Design',
    'Project Documentation',
    'Technical Drawing',
    'Blueprint Reading',
    'MS Project',
    'Safety Compliance',
    'Problem Solving',
    'Critical Thinking',
    'Technical Writing',
    
    // Music and Performing Arts
    'Instrumental Proficiency',
    'Vocal Proficiency',
    'Music Notation',
    'Music Arrangement',
    'FL Studio',
    'Logic Pro',
    'Event Coordination',
    'Ensemble Collaboration',
    'Conducting',
    'Music Teaching',
    'Audio Recording',
    'Audio Mixing'
];

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

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        // Fetch companies
        const companiesSnapshot = await getDocs(collection(db, 'companies'));
        const companies = companiesSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setTableData(companies);
        
        // Fetch students
        const studentsSnapshot = await getDocs(collection(db, 'users')); // <-- use your actual collection name
        const studentCount = studentsSnapshot.size;

        // Update overview stats
        setOverviewStats(prev => ({
          ...prev,
          totalCompanies: companies.length,
          totalStudents: studentCount, // This will now update dynamically!
          totalApplications: 0
        }));
      } catch (err) {
        console.error("Error fetching data:", err);
        setError("Failed to fetch data. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
}, []);

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
      if (!formData.industry.trim()) {
        throw new Error("Industry is required");
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
      if (!formData.modeOfWork) {
        throw new Error("Mode of work is required");
      }

      setIsLoading(true);
      const newCompany = {
        companyName: formData.companyName,
        companyDescription: formData.description,       
        companyWeb: formData.website,                  
        industry: formData.industry,
        companyAddress: formData.address,             
        companyEmail: formData.email,          
        skillsREq: skills,                  
        moa: formData.moa ? "Yes" : "No",     
        modeofwork: [formData.modeOfWork],    
        createdAt: new Date().toISOString()
      };

      const docRef = await addDoc(collection(db, 'companies'), newCompany);
      
      setTableData(prev => [...prev, { id: docRef.id, ...newCompany }]);
      setIsModalOpen(false);
      
      // Reset form
      setFormData({
        companyName: '',
        description: '',
        website: '', // Add this line
        industry: '',
        address: '',
        email: '',
        skills: '',
        moa: false,
        modeOfWork: '',
      });

      setSkills([]); // Clear skills array
    } catch (err) {
      setError(err.message);
      return; // Stop execution if validation fails
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      
      // Confirm delete
      if (!window.confirm(`Are you sure you want to delete ${selectedItems.length} item(s)?`)) {
        return;
      }
  
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

  const filteredData = tableData.filter(row => 
    row.companyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    row.industry.toLowerCase().includes(searchQuery.toLowerCase()) ||
    row.companyDescription.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
          <div className="search-wrapper">
            <div className="search-container">
              <IoSearchOutline className="search-icon" />
              <input
                type="text"
                placeholder="Search company..."
                value={searchQuery}
                onChange={handleSearch}
                className="search-input"
              />
            </div>
          </div>
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>
                    <div className="select-header">
                      <input 
                        type="checkbox" 
                        onChange={handleSelectAll} 
                        checked={selectedItems.length === tableData.length && tableData.length > 0}
                      />
                      <span>Select All</span>
                    </div>
                  </th>
                  <th>Company Name</th>
                  <th>Description</th>
                  <th>Company Website</th>
                  <th>Industry</th>
                  <th>Address</th>
                  <th>Email</th>
                  <th>Skills required</th>
                  <th>MOA</th>
                  <th>Mode of work</th>
                </tr>
              </thead>
              <tbody>
                {currentItems.map((row) => (
                  <tr key={row.id} className={selectedItems.includes(row.id) ? 'selected-row' : ''}>
                    <td>
                      <input 
                        type="checkbox" 
                        checked={selectedItems.includes(row.id)} 
                        onChange={() => handleSelectItem(row.id)} 
                      />
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
                    <td>{row.industry}</td>
                    <td>{row.companyAddress}</td>
                    <td>{row.companyEmail}</td>
                    <td>
                      <div className="table-skills-tags">
                        {Array.isArray(row.skillsREq) && row.skillsREq.map((skill, index) => (
                          <span key={index} className="table-skill-tag">
                            {skill}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td>
                      <input type="checkbox" checked={row.moa === "Yes"} readOnly />
                    </td>
                    <td>{Array.isArray(row.modeofwork) ? row.modeofwork[0] : row.modeofwork}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {/* Add this after your table component */}
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
            <button className="add-entry" onClick={() => setIsModalOpen(true)}>
              Add Entry
            </button>
            <button 
              className="delete" 
              onClick={handleDelete}
              disabled={selectedItems.length === 0 || isDeleting}
            >
              {isDeleting ? 'Deleting...' : `Delete (${selectedItems.length})`}
            </button>
          </div>
        </div>
      </div>

      {isModalOpen && (
        <div className="modal">
          <div className="modal-content">
            <h2>Add New Company</h2>
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
                  rows="4"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="website">Company Website:</label>
                <input
                  id="website"
                  type="url"
                  name="website"
                  value={formData.website}
                  onChange={handleInputChange}
                  placeholder="Enter company website URL"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="industry">Industry:</label>
                <input
                  id="industry"
                  type="text"
                  name="industry"
                  value={formData.industry}
                  onChange={handleInputChange}
                  placeholder="Enter industry"
                  required
                />
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
                        {suggestedSkills
                          .filter(skill => 
                            skill.toLowerCase().includes(skillInput.toLowerCase()) &&
                            !skills.includes(skill)
                          )
                          .map((skill, index) => (
                            <div
                              key={index}
                              className="skills-dropdown-item"
                              onClick={() => addSkill(skill)}
                            >
                              {skill}
                            </div>
                          ))
                        }
                      </div>
                    )}
                  </div>
                  <div className="skills-tags">
                    {skills.map((skill, index) => (
                      <div key={index} className="skill-tag">
                        {skill}
                        <span 
                          className="remove-skill" 
                          onClick={() => removeSkill(skill)}
                        >
                          <IoCloseOutline />
                        </span>
                      </div>
                    ))}
                  </div>
                  <div className="skills-limit">
                    Maximum 15 skills.
                  </div>
                </div>
              </div>

              <div className="form-group checkbox-group">
                <label htmlFor="moa">
                MOA (Memorandum of Agreement)
                  <input
                    id="moa"
                    type="checkbox"
                    name="moa"
                    checked={formData.moa}
                    onChange={handleInputChange}
                  />
                </label>
              </div>

              <div className="form-group">
                <label htmlFor="modeOfWork">Mode of Work:</label>
                <select
                  id="modeOfWork"
                  name="modeOfWork"
                  value={formData.modeOfWork}
                  onChange={handleInputChange}
                  required
                >
                  <option value="" disabled>Select Mode of Work</option>
                  <option value="On-site">On-site</option>
                  <option value="Remote">Remote</option>
                  <option value="Hybrid">Hybrid</option>
                </select>
              </div>
            </form>
            <div className="modal-actions">
              <button onClick={handleAddEntry}>Add</button>
              <button onClick={() => setIsModalOpen(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;