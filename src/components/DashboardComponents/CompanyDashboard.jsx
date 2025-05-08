import React, { useState, useRef, useEffect } from 'react';
import './CompanyDashboard.css';
import { IoCloseOutline, IoSearchOutline, IoSettingsOutline, IoEllipsisVertical } from "react-icons/io5";
import { db } from '../../../firebase'; 
import { collection, addDoc, getDocs, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import logo from '../../assets/InternQuest_Logo.png'; 
import { signOut } from 'firebase/auth';
import { auth } from '../../../firebase';
import ConfirmModal from '../ConfirmModal/ConfirmModal.jsx';
import { FiFilter } from "react-icons/fi";
import { FaFilter } from "react-icons/fa";

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
    modeOfWork: [],
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
  const [openMenuRow, setOpenMenuRow] = useState(null);

  const [isEditMode, setIsEditMode] = useState(false);
  const [editCompanyId, setEditCompanyId] = useState(null);

  const [showFilter, setShowFilter] = useState(false);
  const [filterValues, setFilterValues] = useState({
    industry: '',
    modeOfWork: '',
    moa: '',
  });

  const [pendingFilterValues, setPendingFilterValues] = useState({
    industry: '',
    modeOfWork: '',
    moa: '',
  });

  const [showConfirm, setShowConfirm] = useState(false);

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
      if (formData.modeOfWork.length === 0) {
        throw new Error("At least one mode of work is required");
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
        modeOfWork: formData.modeOfWork,    
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
        modeOfWork: [],
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
      row.industry.toLowerCase().includes(searchQuery.toLowerCase()) ||
      row.companyDescription.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesIndustry = filterValues.industry
      ? row.industry.toLowerCase().includes(filterValues.industry.toLowerCase())
      : true;

    const matchesModeOfWork = filterValues.modeOfWork
      ? Array.isArray(row.modeOfWork) && row.modeOfWork.includes(filterValues.modeOfWork)
      : true;

    const matchesMoa = filterValues.moa
      ? row.moa === filterValues.moa
      : true;

    return matchesSearch && matchesIndustry && matchesModeOfWork && matchesMoa;
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
      industry: company.industry || '',
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
  };

  const handleUpdateEntry = async () => {
    try {
      if (!formData.companyName.trim()) throw new Error("Company name is required");
      if (!formData.description.trim()) throw new Error("Description is required");
      if (!formData.website.trim()) throw new Error("Website is required");
      if (!formData.industry.trim()) throw new Error("Industry is required");
      if (!formData.address.trim()) throw new Error("Address is required");
      if (!formData.email.trim()) throw new Error("Email is required");
      if (skills.length === 0) throw new Error("At least one skill is required");
      if (formData.modeOfWork.length === 0) throw new Error("At least one mode of work is required");

      setIsLoading(true);
      const updatedCompany = {
        companyName: formData.companyName,
        companyDescription: formData.description,
        companyWeb: formData.website,
        industry: formData.industry,
        companyAddress: formData.address,
        companyEmail: formData.email,
        skillsREq: skills,
        moa: formData.moa ? "Yes" : "No",
        modeOfWork: formData.modeOfWork,
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
        industry: '',
        address: '',
        email: '',
        skills: '',
        moa: false,
        modeOfWork: [],
      });
      setSkills([]);
    } catch (err) {
      setError(err.message);
      return;
    } finally {
      setIsLoading(false);
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
                    <label>Industry:</label>
                    <input
                      type="text"
                      value={pendingFilterValues.industry}
                      onChange={e => setPendingFilterValues(f => ({ ...f, industry: e.target.value }))}
                      placeholder="Industry"
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
                </div>
              )}
            </div>
          </div>
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th className="checkbox-cell"></th>
                  <th>Company Name</th>
                  <th>Description</th>
                  <th>Company Website</th>
                  <th>Industry</th>
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
                    <td>{Array.isArray(row.modeOfWork) ? row.modeOfWork.join(", ") : row.modeOfWork}</td>
                    <td className="kebab-cell">
                      <IoEllipsisVertical
                        className="kebab-icon"
                        onClick={() => setOpenMenuRow(openMenuRow === row.id ? null : row.id)}
                        title="Options"
                      />
                      {openMenuRow === row.id && (
                        <div className="options-dropdown">
                          <button
                            className="edit-btn"
                            onClick={() => {
                              setOpenMenuRow(null);
                              handleEdit(row);
                            }}
                          >
                            Edit
                          </button>
                        </div>
                      )}
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
                  industry: '',
                  address: '',
                  email: '',
                  skills: '',
                  moa: false,
                  modeOfWork: [],
                });
                setSkills([]);
              }}
            >
              Add Entry
            </button>
            <button
              className="delete"
              onClick={handleDelete}
              disabled={selectedItems.length === 0}
            >
              Delete
            </button>
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
                <label htmlFor="industry">Industry:</label>
                <input
                  id="industry"
                  type="text"
                  name="industry"
                  value={formData.industry}
                  onChange={handleInputChange}
                  placeholder="Enter company industry"
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
                  <div 
                    className="skills-tags" 
                    onDragOver={(e) => e.preventDefault()}
                  >
                    {skills.map((skill, idx) => (
                      <span
                        key={idx}
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
                    industry: '',
                    address: '',
                    email: '',
                    skills: '',
                    moa: false,
                    modeOfWork: [],
                  });
                  setSkills([]);
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