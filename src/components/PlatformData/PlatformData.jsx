/**
 * PlatformData - Manage platform-wide Skills and Preferred Fields
 * Settings → Platform Data
 */
import React, { useEffect, useMemo, useState } from "react";
import {
  IoAppsOutline,
  IoSearchOutline,
  IoAddOutline,
  IoPencilOutline,
  IoTrashOutline,
  IoCloseOutline,
  IoHammerOutline,
} from "react-icons/io5";
import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore";
import { db, auth } from "../../../firebase";
import { signOut } from "firebase/auth";
import Navbar from "../Navbar/Navbar.jsx";
import LoadingSpinner from "../LoadingSpinner.jsx";
import ToastContainer from "../Toast/ToastContainer.jsx";
import { useToast } from "../../hooks/useToast.js";
import { clearAdminSession } from "../../utils/auth";
import "./PlatformData.css";

const DOCS = {
  skills: { path: ["meta", "suggestionSkills"], title: "Skills" },
  fields: { path: ["meta", "field"], title: "Preferred Fields" },
};

const normalizeItem = (value) => String(value || "").trim().replace(/\s+/g, " ");
const normalizeKey = (value) => normalizeItem(value).toLowerCase();

const readListFromMetaDoc = (snap) => {
  if (!snap.exists()) return [];
  const data = snap.data() || {};
  if (Array.isArray(data.list)) return data.list.filter(Boolean).map(normalizeItem).filter(Boolean);
  if (Array.isArray(data)) return data.filter(Boolean).map(normalizeItem).filter(Boolean);
  return [];
};

const PlatformData = () => {
  const { toasts, removeToast, success, error } = useToast();

  const [activeTab, setActiveTab] = useState("skills"); // "skills" | "fields"
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const [skills, setSkills] = useState([]);
  const [fields, setFields] = useState([]);

  const [search, setSearch] = useState("");

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState("add"); // "add" | "edit"
  const [modalValue, setModalValue] = useState("");
  const [editingIndex, setEditingIndex] = useState(-1);
  const [pendingDeleteIndex, setPendingDeleteIndex] = useState(-1);
  const [pendingDeleteName, setPendingDeleteName] = useState("");

  const currentItems = activeTab === "skills" ? skills : fields;
  const setCurrentItems = activeTab === "skills" ? setSkills : setFields;

  const filteredItems = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return currentItems;
    return currentItems.filter((name) => normalizeKey(name).includes(q));
  }, [currentItems, search]);

  const loadAll = async () => {
    setIsLoading(true);
    try {
      const [skillsSnap, fieldsSnap] = await Promise.all([
        getDoc(doc(db, ...DOCS.skills.path)),
        getDoc(doc(db, ...DOCS.fields.path)),
      ]);
      setSkills(readListFromMetaDoc(skillsSnap));
      setFields(readListFromMetaDoc(fieldsSnap));
    } catch (e) {
      console.error("Failed to load platform data:", e);
      error("Failed to load platform data. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    document.title = "Platform Data | InternQuest Admin";
    loadAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const openAdd = () => {
    setModalMode("add");
    setModalValue("");
    setEditingIndex(-1);
    setIsModalOpen(true);
  };

  const openEdit = (index) => {
    setModalMode("edit");
    setEditingIndex(index);
    setModalValue(currentItems[index] || "");
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setModalValue("");
    setEditingIndex(-1);
  };

  const persist = async (nextList) => {
    const key = activeTab;
    const ref = doc(db, ...DOCS[key].path);
    // Use setDoc with merge so doc can be created if missing
    await setDoc(ref, { list: nextList }, { merge: true });
  };

  const handleSave = async () => {
    const value = normalizeItem(modalValue);
    if (!value) {
      error("Please enter a value.");
      return;
    }

    const exists = currentItems.some((x, idx) => {
      if (modalMode === "edit" && idx === editingIndex) return false;
      return normalizeKey(x) === normalizeKey(value);
    });
    if (exists) {
      error("That item already exists.");
      return;
    }

    const next = [...currentItems];
    if (modalMode === "add") {
      next.unshift(value);
    } else {
      if (editingIndex < 0 || editingIndex >= next.length) {
        error("Could not edit item. Please try again.");
        return;
      }
      next[editingIndex] = value;
    }

    // Keep a stable, clean list
    const cleaned = next
      .map(normalizeItem)
      .filter(Boolean)
      .filter((v, idx, arr) => arr.findIndex((x) => normalizeKey(x) === normalizeKey(v)) === idx)
      .sort((a, b) => a.localeCompare(b));

    setIsSaving(true);
    try {
      await persist(cleaned);
      setCurrentItems(cleaned);
      success(modalMode === "add" ? "Added successfully." : "Updated successfully.");
      closeModal();
    } catch (e) {
      console.error("Save failed:", e);
      error("Failed to save. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (index) => {
    const next = currentItems.filter((_, i) => i !== index);
    setIsSaving(true);
    try {
      // Use updateDoc when document exists; fall back to setDoc merge.
      const key = activeTab;
      const ref = doc(db, ...DOCS[key].path);
      try {
        await updateDoc(ref, { list: next });
      } catch {
        await setDoc(ref, { list: next }, { merge: true });
      }
      setCurrentItems(next);
      success("Deleted successfully.");
    } catch (e) {
      console.error("Delete failed:", e);
      error("Failed to delete. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const openDeleteConfirm = (index) => {
    if (index < 0 || index >= currentItems.length) return;
    setPendingDeleteIndex(index);
    setPendingDeleteName(currentItems[index] || "");
  };

  const closeDeleteConfirm = () => {
    setPendingDeleteIndex(-1);
    setPendingDeleteName("");
  };

  const confirmDelete = async () => {
    if (pendingDeleteIndex < 0) return;
    const index = pendingDeleteIndex;
    closeDeleteConfirm();
    await handleDelete(index);
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      clearAdminSession();
      window.location.href = "/";
    } catch (e) {
      console.error("Logout failed:", e);
    }
  };

  return (
    <div className="platform-data-page">
      <LoadingSpinner isLoading={isLoading} message="Loading platform data..." />
      <Navbar onLogout={handleLogout} />

      <main className="platform-data-container">
        <header className="platform-data-header">
          <div className="platform-data-title">
            <div className="platform-data-title-icon" aria-hidden="true">
              <IoAppsOutline />
            </div>
            <div>
              <h1>Platform Data</h1>
              <p>Manage skills and preferred fields across the platform</p>
            </div>
          </div>
        </header>

        <section className="platform-data-card" aria-label="Platform data manager">
          <div className="platform-data-tabs" role="tablist" aria-label="Platform Data Tabs">
            <button
              type="button"
              className={`tab-btn ${activeTab === "skills" ? "active" : ""}`}
              onClick={() => {
                setActiveTab("skills");
                setSearch("");
              }}
              role="tab"
              aria-selected={activeTab === "skills"}
            >
              Skills
              <span className="tab-pill">{skills.length}</span>
            </button>
            <button
              type="button"
              className={`tab-btn ${activeTab === "fields" ? "active" : ""}`}
              onClick={() => {
                setActiveTab("fields");
                setSearch("");
              }}
              role="tab"
              aria-selected={activeTab === "fields"}
            >
              Preferred Fields
              <span className="tab-pill">{fields.length}</span>
            </button>
          </div>

          <div className="platform-data-toolbar">
            <div className="platform-data-search">
              <IoSearchOutline className="search-icon" aria-hidden="true" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={`Search ${DOCS[activeTab].title.toLowerCase()}...`}
                aria-label="Search"
              />
              {search && (
                <button
                  type="button"
                  className="search-clear"
                  onClick={() => setSearch("")}
                  aria-label="Clear search"
                >
                  <IoCloseOutline />
                </button>
              )}
            </div>

            <button
              type="button"
              className="primary-btn"
              onClick={openAdd}
              disabled={isSaving}
            >
              <IoAddOutline />
              {activeTab === "skills" ? "Add Skill" : "Add Field"}
            </button>
          </div>

          <div className="platform-data-table-wrap">
            <table className="platform-data-table" role="table">
              <thead>
                <tr>
                  <th>{activeTab === "skills" ? "Skill" : "Preferred Field"}</th>
                  <th className="actions-col">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredItems.length === 0 ? (
                  <tr>
                    <td colSpan={2} className="empty-row">
                      <div className="empty-state">
                        <div className="empty-icon" aria-hidden="true">
                          <IoHammerOutline />
                        </div>
                        <div className="empty-text">
                          <div className="empty-title">No items found</div>
                          <div className="empty-subtitle">
                            Try a different search or add a new one.
                          </div>
                        </div>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredItems.map((name) => {
                    // Map back to original index for edit/delete
                    const originalIndex = currentItems.findIndex((x) => x === name);
                    return (
                      <tr key={`${activeTab}-${name}`}>
                        <td className="name-cell">
                          <span className="name-text">{name}</span>
                        </td>
                        <td className="actions-col">
                          <div className="row-actions" aria-label="Row actions">
                            <button
                              type="button"
                              className="icon-btn"
                              onClick={() => openEdit(originalIndex)}
                              title="Edit"
                              aria-label={`Edit ${name}`}
                              disabled={isSaving}
                            >
                              <IoPencilOutline />
                            </button>
                            <button
                              type="button"
                              className="icon-btn danger"
                              onClick={() => openDeleteConfirm(originalIndex)}
                              title="Delete"
                              aria-label={`Delete ${name}`}
                              disabled={isSaving}
                            >
                              <IoTrashOutline />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </section>
      </main>

      {isModalOpen && (
        <div className="pd-modal-backdrop" role="dialog" aria-modal="true">
          <div className="pd-modal">
            <div className="pd-modal-header">
              <div>
                <div className="pd-modal-title">
                  {modalMode === "add"
                    ? activeTab === "skills"
                      ? "Add Skill"
                      : "Add Preferred Field"
                    : activeTab === "skills"
                    ? "Edit Skill"
                    : "Edit Preferred Field"}
                </div>
                <div className="pd-modal-subtitle">
                  Keep names short, clear, and consistent.
                </div>
              </div>
              <button
                type="button"
                className="pd-modal-close"
                onClick={closeModal}
                aria-label="Close modal"
              >
                <IoCloseOutline />
              </button>
            </div>

            <div className="pd-modal-body">
              <label className="pd-field">
                <span className="pd-label">
                  {activeTab === "skills" ? "Skill Name" : "Field Name"}
                </span>
                <input
                  type="text"
                  value={modalValue}
                  onChange={(e) => setModalValue(e.target.value)}
                  placeholder={activeTab === "skills" ? "e.g., React" : "e.g., Software Development"}
                  autoFocus
                />
              </label>
            </div>

            <div className="pd-modal-footer">
              <button type="button" className="secondary-btn" onClick={closeModal} disabled={isSaving}>
                Cancel
              </button>
              <button type="button" className="primary-btn" onClick={handleSave} disabled={isSaving}>
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {pendingDeleteIndex >= 0 && (
        <div className="pd-modal-backdrop" role="dialog" aria-modal="true">
          <div className="pd-modal pd-modal--confirm">
            <div className="pd-modal-header">
              <div>
                <div className="pd-modal-title">Delete {activeTab === "skills" ? "Skill" : "Field"}?</div>
                <div className="pd-modal-subtitle">
                  This will remove <strong>{pendingDeleteName || "this item"}</strong> from the platform list.
                </div>
              </div>
              <button
                type="button"
                className="pd-modal-close"
                onClick={closeDeleteConfirm}
                aria-label="Close"
              >
                <IoCloseOutline />
              </button>
            </div>
            <div className="pd-modal-footer">
              <button type="button" className="secondary-btn" onClick={closeDeleteConfirm} disabled={isSaving}>
                Cancel
              </button>
              <button type="button" className="primary-btn pd-danger-btn" onClick={confirmDelete} disabled={isSaving}>
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </div>
  );
};

export default PlatformData;

