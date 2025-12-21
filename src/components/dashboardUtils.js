/**
 * Utility functions and hooks for dashboard operations
 * Handles CRUD operations for companies, skills, and fields
 */

import { useState, useEffect } from 'react';
import { db, auth, realtimeDb } from '../../firebase';
import { collection, addDoc, getDocs, deleteDoc, doc, updateDoc, getDoc, setDoc } from 'firebase/firestore';
import { signOut } from 'firebase/auth';
import { ref, update as updateRealtime, remove as removeRealtime } from 'firebase/database';
import { clearAdminSession } from '../utils/auth';
import logger from '../utils/logger';
import { activityLoggers } from '../utils/activityLogger';

/**
 * Custom hook to fetch and return skill suggestions from Firestore
 * @returns {string[]} Array of skill suggestions
 */
export function useSuggestionSkills() {
  const [skills, setSkills] = useState([]);
  
  useEffect(() => {
    async function fetchSkills() {
      try {
        const docSnap = await getDoc(doc(db, 'meta', 'suggestionSkills'));
        if (docSnap.exists()) {
          setSkills((docSnap.data().list || []).map(skill => skill.trim()));
        }
      } catch (error) {
        logger.error('Error fetching skills:', error);
      }
    }
    fetchSkills();
  }, []);
  
  return skills;
}

/**
 * Custom hook to fetch and return field suggestions from Firestore
 * @returns {string[]} Array of field suggestions
 */
export function useSuggestionFields() {
  const [fields, setFields] = useState([]);
  
  useEffect(() => {
    async function fetchFields() {
      try {
        const docSnap = await getDoc(doc(db, 'meta', 'field'));
        if (docSnap.exists()) {
          setFields((docSnap.data().list || []).map(field => field.trim()));
        }
      } catch (error) {
        logger.error('Error fetching fields:', error);
      }
    }
    fetchFields();
  }, []);
  
  return fields;
}

/**
 * Collection of handler functions for dashboard operations
 */
const syncMoaValidityToRealtime = async (companyId, payload) => {
  try {
    // Check if user is authenticated
    if (!auth.currentUser) {
      logger.warn("No authenticated user found. Skipping RTDB sync.");
      logger.warn("This usually means:");
      logger.warn("1. Firebase Auth credentials (firebaseEmail/firebasePassword) are missing from your Firestore admin document");
      logger.warn("2. The Firebase Auth user doesn't exist");
      logger.warn("3. The sign-in failed during login");
      logger.warn("Check the browser console during login for more details.");
      return;
    }
    logger.debug("Syncing to RTDB with user:", auth.currentUser.uid, auth.currentUser.email);
    await updateRealtime(ref(realtimeDb, `companies/${companyId}`), payload);
    logger.debug("Successfully synced MOA validity to RTDB");
  } catch (error) {
    logger.error("Failed to sync MOA validity to Realtime Database:", error);
    logger.error("Auth state:", {
      isAuthenticated: !!auth.currentUser,
      uid: auth.currentUser?.uid,
      email: auth.currentUser?.email,
    });
    if (error.code === 'PERMISSION_DENIED') {
      logger.error("Permission denied. Make sure:");
      logger.error("1. You're signed into Firebase Auth (check login console logs)");
      logger.error("2. Your UID exists in Realtime Database at: userRoles/<your-uid> with value 'admin'");
    }
  }
};

const removeCompanyFromRealtime = async (companyId) => {
  try {
    await removeRealtime(ref(realtimeDb, `companies/${companyId}`));
  } catch (error) {
    logger.error("Failed to remove company from Realtime Database:", error);
  }
};

export const dashboardHandlers = {
  /**
   * Handles skill input changes and shows dropdown
   */
  handleSkillInput: (setSkillInput, setShowDropdown) => (e) => {
    setSkillInput(e.target.value);
    setShowDropdown(true);
  },

  /**
   * Adds a skill to the list if not already present and under limit
   */
  addSkill: (skills, setSkills, skill, setSkillInput, setShowDropdown) => {
    if (skills.length < 15 && !skills.includes(skill)) {
      setSkills([...skills, skill]);
    }
    setSkillInput('');
    setShowDropdown(false);
  },

  /**
   * Removes a skill from the list
   */
  removeSkill: (skills, setSkills, skillToRemove) => {
    setSkills(skills.filter(skill => skill !== skillToRemove));
  },

  /**
   * Generic input change handler for form fields
   */
  handleInputChange: (formData, setFormData) => (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    });
  },

  /**
   * Handles changes to mode of work checkboxes
   */
  handleModeOfWorkChange: (formData, setFormData) => (e) => {
    const { value, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      modeOfWork: checked 
        ? [...prev.modeOfWork, value]
        : prev.modeOfWork.filter(mode => mode !== value)
    }));
  },

  /**
   * Adds a new company entry to Firestore
   */
  handleAddEntry: async (formData, fields, skills, setIsLoading, setTableData, setIsModalOpen, setFormData, setSkills, setFields, setError) => {
    try {
      // Validate required fields
      const requiredFields = {
        companyName: "Company name",
        description: "Description",
        address: "Address",
        email: "Email"
      };

      for (const [field, label] of Object.entries(requiredFields)) {
        if (!formData[field]?.trim()) {
          throw new Error(`${label} is required`);
        }
      }

      if (fields.length === 0) throw new Error("At least one field is required");
      if (skills.length === 0) throw new Error("At least one skill is required");
      if (formData.modeOfWork.length === 0) throw new Error("At least one mode of work is required");
      // MOA is now always required
      if (
        !formData.moaValidityYears ||
        Number(formData.moaValidityYears) <= 0 ||
        Number.isNaN(Number(formData.moaValidityYears))
      ) {
        throw new Error("MOA validity (years) is required. MOA is mandatory for all companies.");
      }
      if (!formData.moaStartDate) {
        throw new Error("MOA start date is required. MOA is mandatory for all companies.");
      }

      setIsLoading(true);
      
      // Calculate expiration date
      const startDate = new Date(formData.moaStartDate);
      const expirationDate = new Date(startDate);
      expirationDate.setFullYear(expirationDate.getFullYear() + Number(formData.moaValidityYears));
      
      const newCompany = {
        companyName: formData.companyName,
        companyDescription: formData.description,
        companyWeb: formData.website,
        companyAddress: formData.address,
        companyEmail: formData.email,
        skillsREq: skills,
        moa: "Yes", // MOA is now always required
        moaValidityYears: Number(formData.moaValidityYears),
        moaStartDate: formData.moaStartDate,
        moaExpirationDate: expirationDate.toISOString(),
        modeOfWork: formData.modeOfWork,
        createdAt: new Date().toISOString(),
        fields: fields,
        contactPersonName: formData.contactPersonName || "",
        contactPersonEmail: formData.contactPersonEmail || "",
        contactPersonPhone: formData.contactPersonPhone || "",
        isVisibleToMobile: true, // Visible to mobile app by default
        moaStatus: 'valid', // Initial status
      };

      const docRef = await addDoc(collection(db, 'companies'), newCompany);
      await syncMoaValidityToRealtime(docRef.id, {
        moa: "Yes", // MOA is now always required
        moaValidityYears: newCompany.moaValidityYears,
        companyName: newCompany.companyName,
        updatedAt: new Date().toISOString(),
      });
      
      // Log activity
      await activityLoggers.createCompany(docRef.id, newCompany.companyName);
      
      setTableData(prev => Array.isArray(prev) 
        ? [...prev, { id: docRef.id, ...newCompany }] 
        : [{ id: docRef.id, ...newCompany }]
      );

      // Reset form and close modal
      setIsModalOpen(false);
      setFormData({
        companyName: '',
        description: '',
        website: '',
        address: '',
        email: '',
        skills: '',
        moa: false,
        modeOfWork: [],
        moaValidityYears: "",
      });
      setSkills([]);
      setFields([]);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  },

  /**
   * Updates an existing company entry in Firestore
   */
  handleUpdateEntry: async (formData, fields, skills, setIsLoading, setTableData, setIsModalOpen, setIsEditMode, setEditCompanyId, setFormData, setSkills, setFields, setError, editCompanyId) => {
    try {
      // Validate required fields
      const requiredFields = {
        companyName: "Company name",
        description: "Description",
        address: "Address",
        email: "Email"
      };

      for (const [field, label] of Object.entries(requiredFields)) {
        if (!formData[field]?.trim()) {
          throw new Error(`${label} is required`);
        }
      }

      if (fields.length === 0) throw new Error("At least one field is required");
      if (skills.length === 0) throw new Error("At least one skill is required");
      if (formData.modeOfWork.length === 0) throw new Error("At least one mode of work is required");
      // MOA is now always required
      if (
        !formData.moaValidityYears ||
        Number(formData.moaValidityYears) <= 0 ||
        Number.isNaN(Number(formData.moaValidityYears))
      ) {
        throw new Error("MOA validity (years) is required. MOA is mandatory for all companies.");
      }
      if (!formData.moaStartDate) {
        throw new Error("MOA start date is required. MOA is mandatory for all companies.");
      }

      setIsLoading(true);

      const updatedCompany = {
        companyName: formData.companyName,
        companyDescription: formData.description,
        companyWeb: formData.website,
        companyAddress: formData.address,
        companyEmail: formData.email,
        skillsREq: skills,
        moa: "Yes", // MOA is now always required
        moaValidityYears: Number(formData.moaValidityYears),
        modeOfWork: formData.modeOfWork,
        fields: fields,
        contactPersonName: formData.contactPersonName || "",
        contactPersonEmail: formData.contactPersonEmail || "",
        contactPersonPhone: formData.contactPersonPhone || "",
      };

      // Calculate expiration date if start date and validity years are provided
      if (formData.moaStartDate && formData.moaValidityYears) {
        const startDate = new Date(formData.moaStartDate);
        const expirationDate = new Date(startDate);
        expirationDate.setFullYear(expirationDate.getFullYear() + Number(formData.moaValidityYears));
        updatedCompany.moaStartDate = formData.moaStartDate;
        updatedCompany.moaExpirationDate = expirationDate.toISOString();
        
        // Update visibility based on expiration
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const expDate = new Date(expirationDate);
        expDate.setHours(0, 0, 0, 0);
        const daysUntilExpiration = Math.ceil((expDate - today) / (1000 * 60 * 60 * 24));
        
        if (daysUntilExpiration < 0) {
          updatedCompany.isVisibleToMobile = false;
          updatedCompany.moaStatus = 'expired';
        } else if (daysUntilExpiration <= 30) {
          updatedCompany.isVisibleToMobile = true;
          updatedCompany.moaStatus = 'expiring-soon';
        } else {
          updatedCompany.isVisibleToMobile = true;
          updatedCompany.moaStatus = 'valid';
        }
      }
      
      await updateDoc(doc(db, 'companies', editCompanyId), updatedCompany);
      await syncMoaValidityToRealtime(editCompanyId, {
        moa: "Yes", // MOA is now always required
        moaValidityYears: updatedCompany.moaValidityYears,
        companyName: updatedCompany.companyName,
        updatedAt: new Date().toISOString(),
      });
      
      // Log activity
      await activityLoggers.updateCompany(editCompanyId, updatedCompany.companyName, updatedCompany);
      
      setTableData(prev =>
        prev.map(item =>
          item.id === editCompanyId ? { ...item, ...updatedCompany } : item
        )
      );

      // Reset form and close modal
      setIsModalOpen(false);
      setIsEditMode(false);
      setEditCompanyId(null);
      setFormData({
        companyName: '',
        description: '',
        website: '',
        address: '',
        email: '',
        skills: '',
        moa: false,
        modeOfWork: [],
        moaValidityYears: "",
      });
      setSkills([]);
      setFields([]);
    } catch (err) {
      logger.error("Update error:", err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  },

  /**
   * Deletes a single company entry from Firestore
   */
  handleDeleteSingle: async (id, setIsDeleting, setTableData, setSelectedRowId, setOpenMenuId, setError) => {
    try {
      setIsDeleting(true);
      const companyRef = doc(db, 'companies', id);
      const snap = await getDoc(companyRef);
      let companyName = "Unknown";
      if (snap.exists()) {
        const data = snap.data();
        companyName = data.companyName || "Unknown";
        await setDoc(doc(db, 'deleted_companies', id), {
          ...data,
          deletedAt: new Date().toISOString(),
        });
      }
      await deleteDoc(companyRef);
      await removeCompanyFromRealtime(id);
      
      // Log activity
      await activityLoggers.deleteCompany(id, companyName);
      
      setTableData(prev => prev.filter(company => company.id !== id));
      setSelectedRowId?.(null);
      setOpenMenuId?.(null);
    } catch (error) {
      logger.error("Delete single error:", error);
      setError?.("Failed to delete company. Please try again.");
    } finally {
      setIsDeleting(false);
    }
  },

  /**
   * Prepares the edit form with company data
   */
  handleEdit: (company, setFormData, setSkills, setIsEditMode, setEditCompanyId, setIsModalOpen, setFields) => {
    setFormData({
      companyName: company.companyName || '',
      description: company.companyDescription || '',
      website: company.companyWeb || '',
      address: company.companyAddress || '',
      email: company.companyEmail || '',
      skills: '',
      moa: company.moa === "Yes",
      moaValidityYears:
        typeof company.moaValidityYears === "number" && company.moaValidityYears > 0
          ? String(company.moaValidityYears)
          : "",
      moaStartDate: company.moaStartDate || "",
      modeOfWork: Array.isArray(company.modeOfWork) ? company.modeOfWork : [],
      contactPersonName: company.contactPersonName || "",
      contactPersonEmail: company.contactPersonEmail || "",
      contactPersonPhone: company.contactPersonPhone || "",
    });
    setSkills(Array.isArray(company.skillsREq) ? company.skillsREq : []);
    setFields(company.fields && Array.isArray(company.fields) ? [...company.fields] : []);
    setIsEditMode(true);
    setEditCompanyId(company.id);
    setIsModalOpen(true);
  },

  /**
   * Shows the delete confirmation modal
   */
  handleDelete: (setShowConfirm) => {
    setShowConfirm(true);
  },

  /**
   * Confirms and executes the deletion of multiple items
   */
  confirmDelete: async (selectedItems, setShowConfirm, setIsDeleting, setTableData, setSelectedItems, setError) => {
    setShowConfirm(false);
    try {
      setIsDeleting(true);
      await Promise.all(
        selectedItems.map(async (id) => {
          const companyRef = doc(db, 'companies', id);
          const snap = await getDoc(companyRef);
          if (snap.exists()) {
            const data = snap.data();
            await setDoc(doc(db, 'deleted_companies', id), {
              ...data,
              deletedAt: new Date().toISOString(),
            });
          }
          await deleteDoc(companyRef);
          await removeCompanyFromRealtime(id);
        })
      );
      
      // Log activity (bulk delete logging is handled in CompanyDashboard)
      // Activity logging for individual deletes happens in handleDeleteSingle
      
      setTableData(prevData => prevData.filter(item => !selectedItems.includes(item.id)));
      setSelectedItems([]);
      return true; // Success
    } catch (error) {
      logger.error("Bulk delete error:", error);
      setError?.("Failed to delete items. Please try again.");
      return false; // Failure
    } finally {
      setIsDeleting(false);
    }
  },

  /**
   * Cancels the delete operation
   */
  cancelDelete: (setShowConfirm) => {
    setShowConfirm(false);
  },

  /**
   * Toggles selection of an item
   */
  handleSelectItem: (id, selectedItems, setSelectedItems) => {
    setSelectedItems(prev => 
      prev.includes(id)
        ? prev.filter(item => item !== id)
        : [...prev, id]
    );
  },

  /**
   * Toggles selection of all items
   */
  handleSelectAll: (e, tableData, setSelectedItems) => {
    setSelectedItems(e.target.checked ? tableData.map(item => item.id) : []);
  },

  /**
   * Sends a notification to Firestore
   * @param {string} notificationText - The notification message
   * @param {function} setError - Error setter function
   * @param {function} setNotificationText - Notification text setter function
   * @param {object} options - Optional notification target (targetType, targetStudentId, targetSection)
   */
  handleSendNotification: async (notificationText, setError, setNotificationText, options = {}) => {
    if (!notificationText.trim()) {
      throw new Error('Notification text cannot be empty');
    }
    
    try {
      // Get current user ID for tracking who sent the notification
      const userId = auth.currentUser?.uid || null;
      
      const notificationData = {
        message: notificationText,
        timestamp: new Date().toISOString(),
        read: false,
        userId: userId,
        targetType: options.targetType || 'all', // "all", "student", "section"
      };

      // Add target information for private notifications
      if (options.targetType === 'student' && options.targetStudentId) {
        notificationData.targetStudentId = options.targetStudentId;
        notificationData.targetStudentName = options.targetStudentName || 'Unknown';
      } else if (options.targetType === 'section' && options.targetSection) {
        notificationData.targetSection = options.targetSection;
      }

      await addDoc(collection(db, 'notifications'), notificationData);
      setNotificationText?.('');
    } catch (error) {
      setError?.('Failed to send notification');
      throw error; // Re-throw so caller can handle it
    }
  },

  /**
   * Handles search input changes
   */
  handleSearch: (e, setSearchQuery) => {
    setSearchQuery(e.target.value);
  },

  /**
   * Handles logout operation
   * Note: Components should use ConfirmAction before calling this
   */
  handleLogout: async () => {
    try {
      await signOut(auth);
    } catch (error) {
      logger.error('Logout failed:', error);
      // Note: Error should be handled by the component calling this function
      throw error; // Re-throw so component can handle it with toast/notification
    } finally {
      clearAdminSession();
      window.location.href = '/';
    }
  },
}; 