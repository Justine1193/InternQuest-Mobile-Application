/**
 * Utility functions and hooks for dashboard operations
 * Handles CRUD operations for companies, skills, and fields
 */

import { useState, useEffect } from 'react';
import { db, auth, realtimeDb } from '../../firebase';
import { collection, addDoc, getDocs, deleteDoc, doc, updateDoc, getDoc } from 'firebase/firestore';
import { signOut } from 'firebase/auth';
import { ref, update as updateRealtime, remove as removeRealtime } from 'firebase/database';
import { clearAdminSession } from '../utils/auth';

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
        console.error('Error fetching skills:', error);
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
        console.error('Error fetching fields:', error);
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
    await updateRealtime(ref(realtimeDb, `companies/${companyId}`), payload);
  } catch (error) {
    console.error("Failed to sync MOA validity to Realtime Database:", error);
  }
};

const removeCompanyFromRealtime = async (companyId) => {
  try {
    await removeRealtime(ref(realtimeDb, `companies/${companyId}`));
  } catch (error) {
    console.error("Failed to remove company from Realtime Database:", error);
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
      if (
        formData.moa &&
        (!formData.moaValidityYears ||
          Number(formData.moaValidityYears) <= 0 ||
          Number.isNaN(Number(formData.moaValidityYears)))
      ) {
        throw new Error("MOA validity (years) is required when MOA is checked");
      }

      setIsLoading(true);
      
      const newCompany = {
        companyName: formData.companyName,
        companyDescription: formData.description,
        companyWeb: formData.website,
        companyAddress: formData.address,
        companyEmail: formData.email,
        skillsREq: skills,
        moa: formData.moa ? "Yes" : "No",
        moaValidityYears: formData.moa
          ? Number(formData.moaValidityYears)
          : null,
        modeOfWork: formData.modeOfWork,
        createdAt: new Date().toISOString(),
        fields: fields,
      };

      const docRef = await addDoc(collection(db, 'companies'), newCompany);
      await syncMoaValidityToRealtime(docRef.id, {
        moa: newCompany.moa,
        moaValidityYears:
          newCompany.moa === "Yes" ? newCompany.moaValidityYears : null,
        companyName: newCompany.companyName,
        updatedAt: new Date().toISOString(),
      });
      
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
      if (
        formData.moa &&
        (!formData.moaValidityYears ||
          Number(formData.moaValidityYears) <= 0 ||
          Number.isNaN(Number(formData.moaValidityYears)))
      ) {
        throw new Error("MOA validity (years) is required when MOA is checked");
      }

      setIsLoading(true);

      const updatedCompany = {
        companyName: formData.companyName,
        companyDescription: formData.description,
        companyWeb: formData.website,
        companyAddress: formData.address,
        companyEmail: formData.email,
        skillsREq: skills,
        moa: formData.moa ? "Yes" : "No",
        moaValidityYears: formData.moa
          ? Number(formData.moaValidityYears)
          : null,
        modeOfWork: formData.modeOfWork,
        fields: fields,
      };

      await updateDoc(doc(db, 'companies', editCompanyId), updatedCompany);
      await syncMoaValidityToRealtime(editCompanyId, {
        moa: updatedCompany.moa,
        moaValidityYears:
          updatedCompany.moa === "Yes" ? updatedCompany.moaValidityYears : null,
        companyName: updatedCompany.companyName,
        updatedAt: new Date().toISOString(),
      });
      
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
      console.error("Update error:", err);
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
      await deleteDoc(doc(db, 'companies', id));
      await removeCompanyFromRealtime(id);
      setTableData(prev => prev.filter(company => company.id !== id));
      setSelectedRowId?.(null);
      setOpenMenuId?.(null);
    } catch (error) {
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
      modeOfWork: Array.isArray(company.modeOfWork) ? company.modeOfWork : [],
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
          await deleteDoc(doc(db, 'companies', id));
          await removeCompanyFromRealtime(id);
        })
      );
      setTableData(prevData => prevData.filter(item => !selectedItems.includes(item.id)));
      setSelectedItems([]);
    } catch (error) {
      setError?.("Failed to delete items. Please try again.");
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
   */
  handleSendNotification: async (notificationText, setError, setNotificationText) => {
    if (!notificationText.trim()) return;
    
    try {
      await addDoc(collection(db, 'notifications'), {
        message: notificationText,
        timestamp: new Date().toISOString(),
        read: false
      });
      setNotificationText?.('');
    } catch (error) {
      setError?.('Failed to send notification');
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
   */
  handleLogout: async () => {
    try {
      await signOut(auth);
    } catch (error) {
      alert('Logout failed!');
    } finally {
      clearAdminSession();
      window.location.href = '/';
    }
  },
}; 