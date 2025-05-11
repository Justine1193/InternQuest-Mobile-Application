import { useState, useEffect } from 'react';
import { db, auth } from '../../firebase';
import { collection, addDoc, getDocs, deleteDoc, doc, updateDoc, getDoc } from 'firebase/firestore';
import { signOut } from 'firebase/auth';

// --- useSuggestionSkills: Fetches and returns the list of skill suggestions from Firestore ---
export function useSuggestionSkills() {
  const [skills, setSkills] = useState([]);
  useEffect(() => {
    async function fetchSkills() {
      const docSnap = await getDoc(doc(db, 'meta', 'suggestionSkills'));
      if (docSnap.exists()) {
        setSkills((docSnap.data().list || []).map(skill => skill.trim()));
      }
    }
    fetchSkills();
  }, []);
  return skills;
}

// --- useSuggestionFields: Fetches and returns the list of field suggestions from Firestore ---
export function useSuggestionFields() {
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

// --- Handler Functions ---
export const dashboardHandlers = {
  handleSkillInput: (setSkillInput, setShowDropdown) => (e) => {
    setSkillInput(e.target.value);
    setShowDropdown(true);
  },
  addSkill: (skills, setSkills, skill, setSkillInput, setShowDropdown) => {
    if (skills.length < 15 && !skills.includes(skill)) {
      setSkills([...skills, skill]);
    }
    setSkillInput('');
    setShowDropdown(false);
  },
  removeSkill: (skills, setSkills, skillToRemove) => {
    setSkills(skills.filter(skill => skill !== skillToRemove));
  },
  handleInputChange: (formData, setFormData) => (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    });
  },
  handleModeOfWorkChange: (formData, setFormData) => (e) => {
    const { value, checked } = e.target;
    setFormData((prev) => {
      if (checked) {
        return { ...prev, modeOfWork: [...prev.modeOfWork, value] };
      } else {
        return { ...prev, modeOfWork: prev.modeOfWork.filter((mode) => mode !== value) };
      }
    });
  },
  handleAddEntry: async (formData, fields, skills, setIsLoading, setTableData, setIsModalOpen, setFormData, setSkills, setFields, setError) => {
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
      setTableData(prev => Array.isArray(prev) ? [...prev, { id: docRef.id, ...newCompany }] : [{ id: docRef.id, ...newCompany }]);
      setIsModalOpen(false);
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
  },
  handleUpdateEntry: async (formData, fields, skills, setIsLoading, setTableData, setIsModalOpen, setIsEditMode, setEditCompanyId, setFormData, setSkills, setFields, setError, editCompanyId) => {
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
  },
  handleDeleteSingle: async (id, setIsDeleting, setTableData, setSelectedRowId, setOpenMenuId, setError) => {
    try {
      setIsDeleting(true);
      await deleteDoc(doc(db, 'companies', id));
      setTableData(prev => prev.filter(company => company.id !== id));
      setSelectedRowId && setSelectedRowId(null);
      setOpenMenuId && setOpenMenuId(null);
    } catch (error) {
      setError && setError("Failed to delete company. Please try again.");
    } finally {
      setIsDeleting(false);
    }
  },
  handleEdit: (company, setFormData, setSkills, setIsEditMode, setEditCompanyId, setIsModalOpen, setFields) => {
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
  },
  handleDelete: (setShowConfirm) => {
    setShowConfirm(true);
  },
  confirmDelete: async (selectedItems, setShowConfirm, setIsDeleting, setTableData, setSelectedItems, setError) => {
    setShowConfirm(false);
    try {
      setIsDeleting(true);
      for (const id of selectedItems) {
        await deleteDoc(doc(db, 'companies', id));
      }
      setTableData(prevData => prevData.filter(item => !selectedItems.includes(item.id)));
      setSelectedItems([]);
    } catch (error) {
      setError && setError("Failed to delete items. Please try again.");
    } finally {
      setIsDeleting(false);
    }
  },
  cancelDelete: (setShowConfirm) => {
    setShowConfirm(false);
  },
  handleSelectItem: (id, selectedItems, setSelectedItems) => {
    setSelectedItems(prev => {
      if (prev.includes(id)) {
        return prev.filter(item => item !== id);
      } else {
        return [...prev, id];
      }
    });
  },
  handleSelectAll: (e, tableData, setSelectedItems) => {
    if (e.target.checked) {
      setSelectedItems(tableData.map(item => item.id));
    } else {
      setSelectedItems([]);
    }
  },
  handleSendNotification: async (notificationText, setError, setNotificationText) => {
    if (!notificationText.trim()) return;
    try {
      await addDoc(collection(db, 'notifications'), {
        message: notificationText,
        timestamp: new Date().toISOString(),
        read: false
      });
      setNotificationText && setNotificationText('');
    } catch (error) {
      setError && setError('Failed to send notification');
    }
  },
  handleSearch: (e, setSearchQuery) => {
    setSearchQuery(e.target.value);
  },
  handleLogout: async () => {
    try {
      await signOut(auth);
      window.location.href = '/';
    } catch (error) {
      alert('Logout failed!');
    }
  },
}; 