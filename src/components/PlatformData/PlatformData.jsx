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
import { clearCollegeCache } from "../../utils/collegeUtils.js";
import "./PlatformData.css";

const DOCS = {
  skills: { path: ["meta", "suggestionSkills"], title: "Skills" },
  fields: { path: ["meta", "field"], title: "Preferred Fields" },
  programs: { path: ["meta", "programs"], title: "Programs" },
  program_code: { path: ["meta", "program_code"], title: "Program Codes" },
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

/**
 * Read meta/programs into { collegeName: string[] } (program names only).
 * Supports: (1) array of strings; (2) array of { name, code } -> use .name.
 */
const readPrograms = (programsSnap) => {
  if (!programsSnap?.exists()) return {};
  const data = programsSnap.data() || {};
  const out = {};
  Object.keys(data).forEach((collegeName) => {
    const key = collegeName.trim();
    if (!key) return;
    const val = data[key];
    if (!Array.isArray(val)) return;
    const list = val.map((item) => {
      if (item && typeof item === "object" && "name" in item) return String(item.name || "").trim();
      return String(item || "").trim();
    }).filter(Boolean);
    if (list.length) out[key] = list;
  });
  return out;
};

/**
 * Read meta/program_code into { collegeName: string[] } (program codes only, e.g. BSA, BSAIS).
 */
const readProgramCodes = (snap) => {
  if (!snap?.exists()) return {};
  const data = snap.data() || {};
  const out = {};
  Object.keys(data).forEach((collegeName) => {
    const key = collegeName.trim();
    if (!key) return;
    const val = data[key];
    if (!Array.isArray(val)) return;
    const list = val.map((item) => {
      if (item && typeof item === "object" && ("code" in item || "name" in item))
        return String(item.code ?? item.name ?? "").trim();
      return String(item || "").trim();
    }).filter(Boolean);
    if (list.length) out[key] = list;
  });
  return out;
};

const PlatformData = () => {
  const { toasts, removeToast, success, error } = useToast();

  const [activeTab, setActiveTab] = useState("skills"); // "skills" | "fields" | "programs" | "program_codes"
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const [skills, setSkills] = useState([]);
  const [fields, setFields] = useState([]);
  const [programsMap, setProgramsMap] = useState({}); // { collegeName: string[] }
  const [programCodesMap, setProgramCodesMap] = useState({}); // { collegeName: string[] } codes e.g. BSA, BSAIS

  const [search, setSearch] = useState("");

  // Modal state (skills/fields)
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState("add"); // "add" | "edit"
  const [modalValue, setModalValue] = useState("");
  const [editingIndex, setEditingIndex] = useState(-1);
  const [pendingDeleteIndex, setPendingDeleteIndex] = useState(-1);
  const [pendingDeleteName, setPendingDeleteName] = useState("");

  // Programs: edit program names for one college
  const [editingGroupKey, setEditingGroupKey] = useState(null);
  const [editingGroupList, setEditingGroupList] = useState([]); // string[]
  const [addGroupKey, setAddGroupKey] = useState("");
  const [addGroupModalOpen, setAddGroupModalOpen] = useState(false);
  const [pendingDeleteGroupKey, setPendingDeleteGroupKey] = useState(null);
  const [newGroupItemName, setNewGroupItemName] = useState("");
  const [editingItemIndex, setEditingItemIndex] = useState(-1);
  const [editingItemValue, setEditingItemValue] = useState("");

  // Program codes: same pattern as programs
  const [editingCodeGroupKey, setEditingCodeGroupKey] = useState(null);
  const [editingCodeGroupList, setEditingCodeGroupList] = useState([]);
  const [addCodeGroupKey, setAddCodeGroupKey] = useState("");
  const [addCodeGroupModalOpen, setAddCodeGroupModalOpen] = useState(false);
  const [pendingDeleteCodeGroupKey, setPendingDeleteCodeGroupKey] = useState(null);
  const [newCodeGroupItemName, setNewCodeGroupItemName] = useState("");
  const [editingCodeItemIndex, setEditingCodeItemIndex] = useState(-1);
  const [editingCodeItemValue, setEditingCodeItemValue] = useState("");

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
      const [skillsSnap, fieldsSnap, programsSnap, programCodesSnap] = await Promise.all([
        getDoc(doc(db, ...DOCS.skills.path)),
        getDoc(doc(db, ...DOCS.fields.path)),
        getDoc(doc(db, ...DOCS.programs.path)),
        getDoc(doc(db, ...DOCS.program_code.path)),
      ]);
      setSkills(readListFromMetaDoc(skillsSnap));
      setFields(readListFromMetaDoc(fieldsSnap));
      setProgramsMap(readPrograms(programsSnap));
      setProgramCodesMap(readProgramCodes(programCodesSnap));
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
    await setDoc(ref, { list: nextList }, { merge: true });
  };

  /** Persist programs to meta/programs (program names only). */
  const persistPrograms = async (nextProgramsMap) => {
    const programsPayload = {};
    Object.keys(nextProgramsMap).forEach((collegeName) => {
      const list = nextProgramsMap[collegeName] || [];
      programsPayload[collegeName] = list.map((name) => normalizeItem(name)).filter(Boolean);
    });
    await setDoc(doc(db, ...DOCS.programs.path), programsPayload, { merge: true });
    clearCollegeCache();
  };

  /** Persist program codes to meta/program_code. */
  const persistProgramCodes = async (nextMap) => {
    const payload = {};
    Object.keys(nextMap).forEach((collegeName) => {
      const list = nextMap[collegeName] || [];
      payload[collegeName] = list.map((code) => normalizeItem(code)).filter(Boolean);
    });
    await setDoc(doc(db, ...DOCS.program_code.path), payload, { merge: true });
    clearCollegeCache();
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

  // --- Programs: college -> string[] (program names only) ---
  const openEditGroup = (key) => {
    setEditingGroupKey(key);
    setEditingGroupList((programsMap[key] || []).slice());
    setNewGroupItemName("");
    setEditingItemIndex(-1);
    setEditingItemValue("");
  };

  const closeEditGroup = () => {
    setEditingGroupKey(null);
    setEditingGroupList([]);
    setNewGroupItemName("");
    setEditingItemIndex(-1);
    setEditingItemValue("");
  };

  const addGroupListItem = () => {
    const name = normalizeItem(newGroupItemName);
    if (!name) return;
    setEditingGroupList((prev) => [...prev, name]);
    setNewGroupItemName("");
  };

  const startEditGroupItem = (index) => {
    setEditingItemIndex(index);
    setEditingItemValue(editingGroupList[index] || "");
  };

  const saveEditGroupItem = () => {
    if (editingItemIndex < 0) return;
    const name = normalizeItem(editingItemValue);
    if (!name) return;
    setEditingGroupList((prev) => {
      const next = prev.slice();
      next[editingItemIndex] = name;
      return next;
    });
    setEditingItemIndex(-1);
    setEditingItemValue("");
  };

  const removeGroupListItem = (index) => {
    setEditingGroupList((prev) => prev.filter((_, i) => i !== index));
    if (editingItemIndex === index) {
      setEditingItemIndex(-1);
      setEditingItemValue("");
    } else if (editingItemIndex > index) {
      setEditingItemIndex((i) => i - 1);
    }
  };

  const saveEditingGroupList = async () => {
    if (editingGroupKey == null) return;
    const cleaned = editingGroupList.map(normalizeItem).filter(Boolean);
    const nextMap = { ...programsMap, [editingGroupKey]: cleaned };
    setIsSaving(true);
    try {
      await persistPrograms(nextMap);
      setProgramsMap(nextMap);
      success("Updated successfully.");
      closeEditGroup();
    } catch (e) {
      console.error("Save failed:", e);
      error("Failed to save. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const openAddGroup = () => {
    setAddGroupKey("");
    setAddGroupModalOpen(true);
  };

  const saveAddGroup = async () => {
    const key = normalizeItem(addGroupKey);
    if (!key) {
      error("Please enter a college name.");
      return;
    }
    if (programsMap[key]) {
      error("That college already exists.");
      return;
    }
    const nextMap = { ...programsMap, [key]: [] };
    setIsSaving(true);
    try {
      await persistPrograms(nextMap);
      setProgramsMap(nextMap);
      success("Added successfully.");
      setAddGroupModalOpen(false);
      setAddGroupKey("");
    } catch (e) {
      console.error("Save failed:", e);
      error("Failed to save. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const openDeleteGroupConfirm = (key) => setPendingDeleteGroupKey(key);
  const closeDeleteGroupConfirm = () => setPendingDeleteGroupKey(null);

  const confirmDeleteGroup = async () => {
    if (pendingDeleteGroupKey == null) return;
    const key = pendingDeleteGroupKey;
    const nextMap = { ...programsMap };
    delete nextMap[key];
    closeDeleteGroupConfirm();
    setIsSaving(true);
    try {
      await persistPrograms(nextMap);
      setProgramsMap(nextMap);
      success("Deleted successfully.");
    } catch (e) {
      console.error("Delete failed:", e);
      error("Failed to delete. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  // --- Program codes: college -> string[] (codes e.g. BSA, BSAIS) ---
  const openEditCodeGroup = (key) => {
    setEditingCodeGroupKey(key);
    setEditingCodeGroupList((programCodesMap[key] || []).slice());
    setNewCodeGroupItemName("");
    setEditingCodeItemIndex(-1);
    setEditingCodeItemValue("");
  };

  const closeEditCodeGroup = () => {
    setEditingCodeGroupKey(null);
    setEditingCodeGroupList([]);
    setNewCodeGroupItemName("");
    setEditingCodeItemIndex(-1);
    setEditingCodeItemValue("");
  };

  const addCodeGroupListItem = () => {
    const code = normalizeItem(newCodeGroupItemName);
    if (!code) return;
    setEditingCodeGroupList((prev) => [...prev, code]);
    setNewCodeGroupItemName("");
  };

  const startEditCodeGroupItem = (index) => {
    setEditingCodeItemIndex(index);
    setEditingCodeItemValue(editingCodeGroupList[index] || "");
  };

  const saveEditCodeGroupItem = () => {
    if (editingCodeItemIndex < 0) return;
    const code = normalizeItem(editingCodeItemValue);
    if (!code) return;
    setEditingCodeGroupList((prev) => {
      const next = prev.slice();
      next[editingCodeItemIndex] = code;
      return next;
    });
    setEditingCodeItemIndex(-1);
    setEditingCodeItemValue("");
  };

  const removeCodeGroupListItem = (index) => {
    setEditingCodeGroupList((prev) => prev.filter((_, i) => i !== index));
    if (editingCodeItemIndex === index) {
      setEditingCodeItemIndex(-1);
      setEditingCodeItemValue("");
    } else if (editingCodeItemIndex > index) {
      setEditingCodeItemIndex((i) => i - 1);
    }
  };

  const saveEditingCodeGroupList = async () => {
    if (editingCodeGroupKey == null) return;
    const cleaned = editingCodeGroupList.map(normalizeItem).filter(Boolean);
    const nextMap = { ...programCodesMap, [editingCodeGroupKey]: cleaned };
    setIsSaving(true);
    try {
      await persistProgramCodes(nextMap);
      setProgramCodesMap(nextMap);
      success("Updated successfully.");
      closeEditCodeGroup();
    } catch (e) {
      console.error("Save failed:", e);
      error("Failed to save. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const openAddCodeGroup = () => {
    setAddCodeGroupKey("");
    setAddCodeGroupModalOpen(true);
  };

  const saveAddCodeGroup = async () => {
    const key = normalizeItem(addCodeGroupKey);
    if (!key) {
      error("Please enter a college name.");
      return;
    }
    if (programCodesMap[key]) {
      error("That college already exists.");
      return;
    }
    const nextMap = { ...programCodesMap, [key]: [] };
    setIsSaving(true);
    try {
      await persistProgramCodes(nextMap);
      setProgramCodesMap(nextMap);
      success("Added successfully.");
      setAddCodeGroupModalOpen(false);
      setAddCodeGroupKey("");
    } catch (e) {
      console.error("Save failed:", e);
      error("Failed to save. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const openDeleteCodeGroupConfirm = (key) => setPendingDeleteCodeGroupKey(key);
  const closeDeleteCodeGroupConfirm = () => setPendingDeleteCodeGroupKey(null);

  const confirmDeleteCodeGroup = async () => {
    if (pendingDeleteCodeGroupKey == null) return;
    const key = pendingDeleteCodeGroupKey;
    const nextMap = { ...programCodesMap };
    delete nextMap[key];
    closeDeleteCodeGroupConfirm();
    setIsSaving(true);
    try {
      await persistProgramCodes(nextMap);
      setProgramCodesMap(nextMap);
      success("Deleted successfully.");
    } catch (e) {
      console.error("Delete failed:", e);
      error("Failed to delete. Please try again.");
    } finally {
      setIsSaving(false);
    }
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
              <p>Manage skills, preferred fields, and college programs (with program codes)</p>
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
            <button
              type="button"
              className={`tab-btn ${activeTab === "programs" ? "active" : ""}`}
              onClick={() => setActiveTab("programs")}
              role="tab"
              aria-selected={activeTab === "programs"}
            >
              Programs
              <span className="tab-pill">{Object.keys(programsMap).length}</span>
            </button>
            <button
              type="button"
              className={`tab-btn ${activeTab === "program_codes" ? "active" : ""}`}
              onClick={() => setActiveTab("program_codes")}
              role="tab"
              aria-selected={activeTab === "program_codes"}
            >
              Program Codes
              <span className="tab-pill">{Object.keys(programCodesMap).length}</span>
            </button>
          </div>

          <div className="platform-data-toolbar">
            {(activeTab === "skills" || activeTab === "fields") && (
              <>
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
              </>
            )}
            {(activeTab === "programs" || activeTab === "program_codes") && (
              <>
                <div className="platform-data-search">
                  <IoSearchOutline className="search-icon" aria-hidden="true" />
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search colleges..."
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
                  onClick={activeTab === "program_codes" ? openAddCodeGroup : openAddGroup}
                  disabled={isSaving}
                >
                  <IoAddOutline />
                  Add College
                </button>
              </>
            )}
          </div>

          {(activeTab === "skills" || activeTab === "fields") && (
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
          )}

          {activeTab === "programs" && (() => {
            const keys = Object.keys(programsMap).sort((a, b) => a.localeCompare(b));
            const filteredKeys = search.trim()
              ? keys.filter((k) => normalizeKey(k).includes(search.trim().toLowerCase()))
              : keys;
            return (
              <div className="platform-data-table-wrap">
                <table className="platform-data-table platform-data-table--programs" role="table">
                  <thead>
                    <tr>
                      <th>Colleges</th>
                      <th className="actions-col">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredKeys.length === 0 ? (
                      <tr>
                        <td colSpan={2} className="empty-row">
                          <div className="empty-state">
                            <div className="empty-icon" aria-hidden="true">
                              <IoHammerOutline />
                            </div>
                            <div className="empty-text">
                              <div className="empty-title">No colleges found</div>
                              <div className="empty-subtitle">
                                {search ? "Try a different search." : "Add a college to get started."}
                              </div>
                            </div>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      filteredKeys.flatMap((collegeName) => {
                        const programs = programsMap[collegeName] || [];
                        const rows = [
                          <tr key={`college-${collegeName}`} className="pd-college-row">
                            <td className="name-cell pd-college-name">
                              <span className="name-text">{collegeName}</span>
                            </td>
                            <td className="actions-col">
                              <div className="row-actions" aria-label="Row actions">
                                <button type="button" className="icon-btn" onClick={() => openEditGroup(collegeName)} title="Edit programs" aria-label={`Edit programs for ${collegeName}`} disabled={isSaving}><IoPencilOutline /></button>
                                <button type="button" className="icon-btn danger" onClick={() => openDeleteGroupConfirm(collegeName)} title="Delete" aria-label={`Delete ${collegeName}`} disabled={isSaving}><IoTrashOutline /></button>
                              </div>
                            </td>
                          </tr>,
                          ...programs.map((name, idx) => (
                            <tr key={`${collegeName}-${idx}-${name}`} className="pd-program-row">
                              <td className="name-cell pd-program-name">
                                <span className="name-text">{name}</span>
                              </td>
                              <td className="actions-col" />
                            </tr>
                          )),
                        ];
                        return rows;
                      })
                    )}
                  </tbody>
                </table>
              </div>
            );
          })()}

          {activeTab === "program_codes" && (() => {
            const keys = Object.keys(programCodesMap).sort((a, b) => a.localeCompare(b));
            const filteredKeys = search.trim()
              ? keys.filter((k) => normalizeKey(k).includes(search.trim().toLowerCase()))
              : keys;
            return (
              <div className="platform-data-table-wrap">
                <table className="platform-data-table platform-data-table--programs" role="table">
                  <thead>
                    <tr>
                      <th>Colleges</th>
                      <th className="actions-col">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredKeys.length === 0 ? (
                      <tr>
                        <td colSpan={2} className="empty-row">
                          <div className="empty-state">
                            <div className="empty-icon" aria-hidden="true">
                              <IoHammerOutline />
                            </div>
                            <div className="empty-text">
                              <div className="empty-title">No colleges found</div>
                              <div className="empty-subtitle">
                                {search ? "Try a different search." : "Add a college to get started."}
                              </div>
                            </div>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      filteredKeys.flatMap((collegeName) => {
                        const codes = programCodesMap[collegeName] || [];
                        const rows = [
                          <tr key={`code-college-${collegeName}`} className="pd-college-row">
                            <td className="name-cell pd-college-name">
                              <span className="name-text">{collegeName}</span>
                            </td>
                            <td className="actions-col">
                              <div className="row-actions" aria-label="Row actions">
                                <button type="button" className="icon-btn" onClick={() => openEditCodeGroup(collegeName)} title="Edit program codes" aria-label={`Edit program codes for ${collegeName}`} disabled={isSaving}><IoPencilOutline /></button>
                                <button type="button" className="icon-btn danger" onClick={() => openDeleteCodeGroupConfirm(collegeName)} title="Delete" aria-label={`Delete ${collegeName}`} disabled={isSaving}><IoTrashOutline /></button>
                              </div>
                            </td>
                          </tr>,
                          ...codes.map((code, idx) => (
                            <tr key={`${collegeName}-code-${idx}-${code}`} className="pd-program-row">
                              <td className="name-cell pd-program-name">
                                <span className="name-text">{code}</span>
                              </td>
                              <td className="actions-col" />
                            </tr>
                          )),
                        ];
                        return rows;
                      })
                    )}
                  </tbody>
                </table>
              </div>
            );
          })()}
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

      {addGroupModalOpen && (
        <div className="pd-modal-backdrop" role="dialog" aria-modal="true">
          <div className="pd-modal">
            <div className="pd-modal-header">
              <div>
                <div className="pd-modal-title">Add College</div>
                <div className="pd-modal-subtitle">Add a college name. You can add programs after saving.</div>
              </div>
              <button type="button" className="pd-modal-close" onClick={() => { setAddGroupModalOpen(false); setAddGroupKey(""); }} aria-label="Close">
                <IoCloseOutline />
              </button>
            </div>
            <div className="pd-modal-body">
              <label className="pd-field">
                <span className="pd-label">College</span>
                <input type="text" value={addGroupKey} onChange={(e) => setAddGroupKey(e.target.value)} placeholder="e.g., College of Accounting" autoFocus />
              </label>
            </div>
            <div className="pd-modal-footer">
              <button type="button" className="secondary-btn" onClick={() => { setAddGroupModalOpen(false); setAddGroupKey(""); }} disabled={isSaving}>Cancel</button>
              <button type="button" className="primary-btn" onClick={saveAddGroup} disabled={isSaving}>Save</button>
            </div>
          </div>
        </div>
      )}

      {editingGroupKey != null && (
        <div className="pd-modal-backdrop" role="dialog" aria-modal="true">
          <div className="pd-modal pd-modal--wide">
            <div className="pd-modal-header">
              <div>
                <div className="pd-modal-title">Edit programs for {editingGroupKey}</div>
                <div className="pd-modal-subtitle">Add, edit, or remove program names for this college.</div>
              </div>
              <button type="button" className="pd-modal-close" onClick={closeEditGroup} aria-label="Close">
                <IoCloseOutline />
              </button>
            </div>
            <div className="pd-modal-body">
              <ul className="pd-group-list">
                {editingGroupList.map((item, idx) => (
                  <li key={`${editingGroupKey}-${idx}-${item}`} className="pd-group-list-item pd-group-list-item--program">
                    {editingItemIndex === idx ? (
                      <>
                        <input type="text" className="pd-group-list-input" value={editingItemValue} onChange={(e) => setEditingItemValue(e.target.value)} placeholder="Program name (e.g. BS Accountancy)" autoFocus />
                        <button type="button" className="primary-btn pd-group-list-btn" onClick={saveEditGroupItem} disabled={isSaving}>Save</button>
                        <button type="button" className="secondary-btn pd-group-list-btn" onClick={() => { setEditingItemIndex(-1); setEditingItemValue(""); }}>Cancel</button>
                      </>
                    ) : (
                      <>
                        <span className="pd-group-list-text">{item}</span>
                        <button type="button" className="icon-btn" onClick={() => startEditGroupItem(idx)} title="Edit" aria-label={`Edit ${item}`} disabled={isSaving}><IoPencilOutline /></button>
                        <button type="button" className="icon-btn danger" onClick={() => removeGroupListItem(idx)} title="Remove" aria-label={`Remove ${item}`} disabled={isSaving}><IoTrashOutline /></button>
                      </>
                    )}
                  </li>
                ))}
              </ul>
              <div className="pd-group-list-add pd-group-list-add--program">
                <input type="text" className="pd-group-list-input" value={newGroupItemName} onChange={(e) => setNewGroupItemName(e.target.value)} onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addGroupListItem())} placeholder="Program name" />
                <button type="button" className="primary-btn" onClick={addGroupListItem} disabled={isSaving}><IoAddOutline /> Add</button>
              </div>
            </div>
            <div className="pd-modal-footer">
              <button type="button" className="secondary-btn" onClick={closeEditGroup} disabled={isSaving}>Cancel</button>
              <button type="button" className="primary-btn" onClick={saveEditingGroupList} disabled={isSaving}>Save all</button>
            </div>
          </div>
        </div>
      )}

      {pendingDeleteGroupKey != null && (
        <div className="pd-modal-backdrop" role="dialog" aria-modal="true">
          <div className="pd-modal pd-modal--confirm">
            <div className="pd-modal-header">
              <div>
                <div className="pd-modal-title">Delete College?</div>
                <div className="pd-modal-subtitle">
                  This will remove <strong>{pendingDeleteGroupKey}</strong> and all its programs.
                </div>
              </div>
              <button type="button" className="pd-modal-close" onClick={closeDeleteGroupConfirm} aria-label="Close">
                <IoCloseOutline />
              </button>
            </div>
            <div className="pd-modal-footer">
              <button type="button" className="secondary-btn" onClick={closeDeleteGroupConfirm} disabled={isSaving}>Cancel</button>
              <button type="button" className="primary-btn pd-danger-btn" onClick={confirmDeleteGroup} disabled={isSaving}>Delete</button>
            </div>
          </div>
        </div>
      )}

      {addCodeGroupModalOpen && (
        <div className="pd-modal-backdrop" role="dialog" aria-modal="true">
          <div className="pd-modal">
            <div className="pd-modal-header">
              <div>
                <div className="pd-modal-title">Add College (Program Codes)</div>
                <div className="pd-modal-subtitle">Add a college name. You can add program codes (e.g. BSA, BSAIS) after saving.</div>
              </div>
              <button type="button" className="pd-modal-close" onClick={() => { setAddCodeGroupModalOpen(false); setAddCodeGroupKey(""); }} aria-label="Close">
                <IoCloseOutline />
              </button>
            </div>
            <div className="pd-modal-body">
              <label className="pd-field">
                <span className="pd-label">College</span>
                <input type="text" value={addCodeGroupKey} onChange={(e) => setAddCodeGroupKey(e.target.value)} placeholder="e.g., College of Accountancy" autoFocus />
              </label>
            </div>
            <div className="pd-modal-footer">
              <button type="button" className="secondary-btn" onClick={() => { setAddCodeGroupModalOpen(false); setAddCodeGroupKey(""); }} disabled={isSaving}>Cancel</button>
              <button type="button" className="primary-btn" onClick={saveAddCodeGroup} disabled={isSaving}>Save</button>
            </div>
          </div>
        </div>
      )}

      {editingCodeGroupKey != null && (
        <div className="pd-modal-backdrop" role="dialog" aria-modal="true">
          <div className="pd-modal pd-modal--wide">
            <div className="pd-modal-header">
              <div>
                <div className="pd-modal-title">Edit program codes for {editingCodeGroupKey}</div>
                <div className="pd-modal-subtitle">Add, edit, or remove program codes (e.g. BSA, BSAIS) for this college.</div>
              </div>
              <button type="button" className="pd-modal-close" onClick={closeEditCodeGroup} aria-label="Close">
                <IoCloseOutline />
              </button>
            </div>
            <div className="pd-modal-body">
              <ul className="pd-group-list">
                {editingCodeGroupList.map((item, idx) => (
                  <li key={`code-${editingCodeGroupKey}-${idx}-${item}`} className="pd-group-list-item pd-group-list-item--program">
                    {editingCodeItemIndex === idx ? (
                      <>
                        <input type="text" className="pd-group-list-input" value={editingCodeItemValue} onChange={(e) => setEditingCodeItemValue(e.target.value)} placeholder="Program code (e.g. BSA)" autoFocus />
                        <button type="button" className="primary-btn pd-group-list-btn" onClick={saveEditCodeGroupItem} disabled={isSaving}>Save</button>
                        <button type="button" className="secondary-btn pd-group-list-btn" onClick={() => { setEditingCodeItemIndex(-1); setEditingCodeItemValue(""); }}>Cancel</button>
                      </>
                    ) : (
                      <>
                        <span className="pd-group-list-text">{item}</span>
                        <button type="button" className="icon-btn" onClick={() => startEditCodeGroupItem(idx)} title="Edit" aria-label={`Edit ${item}`} disabled={isSaving}><IoPencilOutline /></button>
                        <button type="button" className="icon-btn danger" onClick={() => removeCodeGroupListItem(idx)} title="Remove" aria-label={`Remove ${item}`} disabled={isSaving}><IoTrashOutline /></button>
                      </>
                    )}
                  </li>
                ))}
              </ul>
              <div className="pd-group-list-add pd-group-list-add--program">
                <input type="text" className="pd-group-list-input" value={newCodeGroupItemName} onChange={(e) => setNewCodeGroupItemName(e.target.value)} onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addCodeGroupListItem())} placeholder="Program code (e.g. BSA)" />
                <button type="button" className="primary-btn" onClick={addCodeGroupListItem} disabled={isSaving}><IoAddOutline /> Add</button>
              </div>
            </div>
            <div className="pd-modal-footer">
              <button type="button" className="secondary-btn" onClick={closeEditCodeGroup} disabled={isSaving}>Cancel</button>
              <button type="button" className="primary-btn" onClick={saveEditingCodeGroupList} disabled={isSaving}>Save all</button>
            </div>
          </div>
        </div>
      )}

      {pendingDeleteCodeGroupKey != null && (
        <div className="pd-modal-backdrop" role="dialog" aria-modal="true">
          <div className="pd-modal pd-modal--confirm">
            <div className="pd-modal-header">
              <div>
                <div className="pd-modal-title">Delete College?</div>
                <div className="pd-modal-subtitle">
                  This will remove <strong>{pendingDeleteCodeGroupKey}</strong> and all its program codes.
                </div>
              </div>
              <button type="button" className="pd-modal-close" onClick={closeDeleteCodeGroupConfirm} aria-label="Close">
                <IoCloseOutline />
              </button>
            </div>
            <div className="pd-modal-footer">
              <button type="button" className="secondary-btn" onClick={closeDeleteCodeGroupConfirm} disabled={isSaving}>Cancel</button>
              <button type="button" className="primary-btn pd-danger-btn" onClick={confirmDeleteCodeGroup} disabled={isSaving}>Delete</button>
            </div>
          </div>
        </div>
      )}

      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </div>
  );
};

export default PlatformData;

