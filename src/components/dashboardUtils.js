/**
 * Utility functions and hooks for dashboard operations
 * Handles CRUD operations for companies, skills, and fields
 */

import { useState, useEffect } from 'react';
import { db, auth, realtimeDb } from '../../firebase';
import { collection, addDoc, getDocs, deleteDoc, doc, updateDoc, getDoc, setDoc } from 'firebase/firestore';
import { signOut } from 'firebase/auth';
import { ref, update as updateRealtime, remove as removeRealtime } from 'firebase/database';
import { clearAdminSession, getAdminSession } from '../utils/auth';
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
          const data = docSnap.data();
          // Handle both 'list' array and direct array structure
          if (Array.isArray(data.list)) {
            setSkills(data.list.map(skill => skill.trim()).filter(skill => skill.length > 0));
          } else if (Array.isArray(data)) {
            setSkills(data.map(skill => skill.trim()).filter(skill => skill.length > 0));
          } else {
            // Try to extract skills from object values
            const skillValues = Object.values(data).filter(val => typeof val === 'string' && val.trim().length > 0);
            if (skillValues.length > 0) {
              setSkills(skillValues.map(skill => skill.trim()));
            } else {
              logger.warn('Meta suggestionSkills document exists but has no valid skill data structure');
            }
          }
        } else {
          logger.warn('Meta suggestionSkills document does not exist at meta/suggestionSkills');
        }
      } catch (error) {
        logger.error('Error fetching skills:', error);
        console.error('Error fetching skill suggestions:', error);
        console.error('Error code:', error.code);
        console.error('Error message:', error.message);
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
    let isMounted = true;
    
    async function fetchFields() {
      try {
        // Read from meta/field document with list array
        const fieldRef = doc(db, 'meta', 'field');
        const docSnap = await getDoc(fieldRef);
        
        if (!isMounted) return;
        
        if (docSnap.exists()) {
          const data = docSnap.data();
          
          // The document structure is: { list: ["Field1", "Field2", ...] }
          if (data.list && Array.isArray(data.list)) {
            const processedFields = data.list
              .map(field => String(field).trim())
              .filter(field => field.length > 0);
            setFields(processedFields);
          } else {
            setFields([]);
          }
        } else {
          setFields([]);
        }
      } catch (error) {
        console.error('❌ useSuggestionFields: Error fetching fields:', error);
        console.error('Error code:', error.code);
        console.error('Error message:', error.message);
        if (!isMounted) return;
        setFields([]);
      }
    }
    
    fetchFields();
    
    return () => {
      isMounted = false;
    };
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
      return;
    }
    logger.debug("Syncing to RTDB with user:", auth.currentUser.uid, auth.currentUser.email);
    await updateRealtime(ref(realtimeDb, `companies/${companyId}`), payload);
    logger.debug("Successfully synced MOA validity to RTDB");
  } catch (error) {
    // Log error but don't throw - this is a non-critical operation
    // The company is already saved in Firestore, RTDB sync is optional
    if (error.code === 'PERMISSION_DENIED') {
      logger.warn("Realtime Database sync failed (permission denied). This is non-critical.");
      logger.warn("To fix: Add your UID to Realtime Database at: userRoles/" + auth.currentUser?.uid + " with value 'admin'");
      logger.warn("Or update Realtime Database rules to allow authenticated users to write to companies/");
    } else {
      logger.warn("Realtime Database sync failed (non-critical):", error.message);
    }
    // Don't throw error - allow the main operation to succeed
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
   * Handles changes to mode of work radio buttons (single selection)
   */
  handleModeOfWorkChange: (formData, setFormData) => (e) => {
    const { value } = e.target;
    setFormData(prev => ({
      ...prev,
      modeOfWork: value
    }));
  },

  /**
   * Adds a new company entry to Firestore
   */
  handleAddEntry: async (formData, fields, skills, setIsLoading, setTableData, setIsModalOpen, setFormData, setSkills, setFields, setError, onSuccess) => {
    try {
      // Validate required fields
      const requiredFields = {
        companyName: "Company name",
        description: "Description",
        address: "Address",
        email: "Email",
        endorsedByCollege: "Endorsed by College"
      };

      for (const [field, label] of Object.entries(requiredFields)) {
        if (!formData[field]?.trim()) {
          throw new Error(`${label} is required`);
        }
      }

      if (fields.length === 0) throw new Error("At least one field is required");
      if (skills.length === 0) throw new Error("At least one skill is required");
      const modeOfWorkEmpty = !formData.modeOfWork ||
        (Array.isArray(formData.modeOfWork)
          ? formData.modeOfWork.length === 0
          : String(formData.modeOfWork).trim() === "");
      if (modeOfWorkEmpty) throw new Error("Please select at least one mode of work (e.g. On-site, Hybrid, or Remote).");
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
      if (!formData.moaFileUrl) {
        throw new Error("MOA document file is required. Please upload the signed MOA document.");
      }

      setIsLoading(true);
      
      // Calculate expiration date
      const startDate = new Date(formData.moaStartDate);
      const expirationDate = new Date(startDate);
      expirationDate.setFullYear(expirationDate.getFullYear() + Number(formData.moaValidityYears));
      
      // Get creator info
      const session = getAdminSession();
      const createdBy = session ? {
        username: session.username || "Unknown",
        role: session.role || "Unknown",
      } : null;

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
        moaFileUrl: formData.moaFileUrl || "",
        moaFileName: formData.moaFileName || "",
        moaStoragePath: formData.moaStoragePath || "",
        modeOfWork: Array.isArray(formData.modeOfWork) ? formData.modeOfWork : [formData.modeOfWork].filter(Boolean),
        createdAt: new Date().toISOString(),
        fields: fields,
        contactPersonName: formData.contactPersonName || "",
        contactPersonEmail: (formData.contactPersonEmail && formData.contactPersonEmail.trim()) ? formData.contactPersonEmail.trim() : (formData.email || ""),
        contactPersonPhone: formData.contactPersonPhone || "",
        endorsedByCollege: formData.endorsedByCollege || "",
        isVisibleToMobile: true, // Visible to mobile app by default
        moaStatus: 'valid', // Initial status
      };

      // Add createdBy if available
      if (createdBy) {
        newCompany.createdBy = createdBy;
      }

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

      // Notify all students that a new company is available
      try {
        const notifierId = auth.currentUser?.uid || null;
        await addDoc(collection(db, 'notifications'), {
          message: `New company added: ${newCompany.companyName}`,
          timestamp: new Date().toISOString(),
          read: false,
          userId: notifierId,
          targetType: 'all',
        });
      } catch (notifyErr) {
        logger.error("Failed to send notification for new company:", notifyErr);
        // Do not block the main flow if notification fails
      }

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
        modeOfWork: "",
        moaValidityYears: "",
        moaStartDate: "",
        moaFileUrl: "",
        moaFileName: "",
        moaStoragePath: "",
        endorsedByCollege: "",
        contactPersonName: "",
        contactPersonEmail: "",
        contactPersonPhone: "",
      });
      setSkills([]);
      setFields([]);

      if (typeof onSuccess === 'function') {
        onSuccess(newCompany.companyName);
      }
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
        email: "Email",
        endorsedByCollege: "Endorsed by College"
      };

      for (const [field, label] of Object.entries(requiredFields)) {
        if (!formData[field]?.trim()) {
          throw new Error(`${label} is required`);
        }
      }

      if (fields.length === 0) throw new Error("At least one field is required");
      if (skills.length === 0) throw new Error("At least one skill is required");
      const modeOfWorkEmptyEdit = !formData.modeOfWork ||
        (Array.isArray(formData.modeOfWork)
          ? formData.modeOfWork.length === 0
          : String(formData.modeOfWork).trim() === "");
      if (modeOfWorkEmptyEdit) throw new Error("Please select at least one mode of work (e.g. On-site, Hybrid, or Remote).");
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
      if (!formData.moaFileUrl) {
        throw new Error("MOA document file is required. Please upload the signed MOA document.");
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
        moaFileUrl: formData.moaFileUrl || "",
        moaFileName: formData.moaFileName || "",
        moaStoragePath: formData.moaStoragePath || "",
        modeOfWork: Array.isArray(formData.modeOfWork) ? formData.modeOfWork : [formData.modeOfWork].filter(Boolean),
        fields: fields,
        contactPersonName: formData.contactPersonName || "",
        contactPersonEmail: (formData.contactPersonEmail && formData.contactPersonEmail.trim()) ? formData.contactPersonEmail.trim() : (formData.email || ""),
        contactPersonPhone: formData.contactPersonPhone || "",
        endorsedByCollege: formData.endorsedByCollege || "",
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
        modeOfWork: "",
        moaValidityYears: "",
        moaStartDate: "",
        moaFileUrl: "",
        moaFileName: "",
        moaStoragePath: "",
        endorsedByCollege: "",
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
    const modeOfWorkValue = Array.isArray(company.modeOfWork) && company.modeOfWork.length > 0
      ? company.modeOfWork[0]
      : typeof company.modeOfWork === "string" ? company.modeOfWork : "";
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
      modeOfWork: modeOfWorkValue,
      moaFileUrl: company.moaFileUrl || "",
      moaFileName: company.moaFileName || "",
      moaStoragePath: company.moaStoragePath || "",
      contactPersonName: company.contactPersonName || "",
      contactPersonEmail: company.contactPersonEmail || company.companyEmail || "",
      contactPersonPhone: company.contactPersonPhone || "",
      endorsedByCollege: company.endorsedByCollege || "",
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