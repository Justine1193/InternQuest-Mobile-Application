import React, { useEffect, useState } from "react";
import {
  collection,
  doc,
  getDocs,
  orderBy,
  query,
  setDoc,
} from "firebase/firestore";
import {
  IoAdd,
  IoReorderThreeOutline,
  IoCloseOutline,
  IoCloudUploadOutline,
  IoDocumentOutline,
  IoTrashOutline,
} from "react-icons/io5";
import { useNavigate } from "react-router-dom";

import { db, auth } from "../../../firebase";
import Navbar from "../Navbar/Navbar.jsx";
import LoadingSpinner from "../LoadingSpinner.jsx";
import { clearAdminSession } from "../../utils/auth";
import { useToast } from "../../hooks/useToast";
import ToastContainer from "../Toast/ToastContainer";
import "./ResourceManagementDashboard.css";

const ResourceManagementDashboard = () => {
  const navigate = useNavigate();
  const { toasts, success, error: showError, removeToast } = useToast();

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Student Guide Steps
  const [guideSteps, setGuideSteps] = useState([]);
  const [guideStepsLoading, setGuideStepsLoading] = useState(false);
  const [isSavingGuideOrder, setIsSavingGuideOrder] = useState(false);

  const [isStepModalOpen, setIsStepModalOpen] = useState(false);
  const [editingStep, setEditingStep] = useState(null);
  const [stepFormError, setStepFormError] = useState("");

  const [stepForm, setStepForm] = useState({
    title: "",
    description: "",
    instructions: [""],
    required_documents: [""],
    required_document_attachments: [],
    action_type: "none",
    action_label: "",
    is_active: true,
  });
  const [requiredDocFiles, setRequiredDocFiles] = useState({});
  const [draggedStepId, setDraggedStepId] = useState(null);

  useEffect(() => {
    document.title = "Guide Management | InternQuest Admin";
    fetchGuideSteps();
  }, []);

  const handleLogout = async () => {
    try {
      await clearAdminSession();
      navigate("/", { replace: true });
    } catch (err) {
      // fall back to hard redirect if needed
      console.error("Logout error:", err);
      navigate("/", { replace: true });
    }
  };

  const fetchGuideSteps = async () => {
    try {
      setGuideStepsLoading(true);
      const stepsQuery = query(
        collection(db, "resource_steps"),
        orderBy("order", "asc")
      );
      const snapshot = await getDocs(stepsQuery);

      const steps = snapshot.docs.map((stepDoc, index) => {
        const data = stepDoc.data() || {};
        return {
          id: stepDoc.id,
          order:
            typeof data.order === "number" && !Number.isNaN(data.order)
              ? data.order
              : index + 1,
          title: data.title || "",
          description: data.description || "",
          instructions: Array.isArray(data.instructions)
            ? data.instructions
            : [],
          required_documents: Array.isArray(data.required_documents)
            ? data.required_documents
            : [],
          required_document_attachments: Array.isArray(
            data.required_document_attachments
          )
            ? data.required_document_attachments
            : [],
          action_type: data.action_type || "none",
          action_label: data.action_label || "",
          is_active: data.is_active !== false,
        };
      });

      steps.sort((a, b) => (a.order || 0) - (b.order || 0));
      setGuideSteps(steps);
    } catch (err) {
      console.error("Error fetching student guide steps:", err);
      showError("Failed to load student guide steps. Please try again.");
    } finally {
      setGuideStepsLoading(false);
    }
  };

  const resetStepForm = () => {
    setStepForm({
      title: "",
      description: "",
      instructions: [""],
      required_documents: [""],
      required_document_attachments: [],
      action_type: "none",
      action_label: "",
      is_active: true,
    });
    setRequiredDocFiles({});
    setStepFormError("");
  };

  const openCreateStepModal = () => {
    setEditingStep(null);
    resetStepForm();
    setIsStepModalOpen(true);
  };

  const openEditStepModal = (step) => {
    setEditingStep(step);
    setStepForm({
      title: step.title || "",
      description: step.description || "",
      instructions:
        Array.isArray(step.instructions) && step.instructions.length > 0
          ? step.instructions
          : [""],
      required_documents:
        Array.isArray(step.required_documents) &&
        step.required_documents.length > 0
          ? step.required_documents
          : [""],
      required_document_attachments: Array.isArray(
        step.required_document_attachments
      )
        ? step.required_document_attachments
        : [],
      action_type: step.action_type || "none",
      action_label: step.action_label || "",
      is_active: step.is_active !== false,
    });
    setRequiredDocFiles({});
    setStepFormError("");
    setIsStepModalOpen(true);
  };

  const closeStepModal = () => {
    setIsStepModalOpen(false);
    setEditingStep(null);
    setStepFormError("");
    setRequiredDocFiles({});
  };

  const handleInstructionChange = (index, value) => {
    setStepForm((prev) => {
      const next = [...prev.instructions];
      next[index] = value;
      return { ...prev, instructions: next };
    });
  };

  const addInstructionField = () => {
    setStepForm((prev) => ({
      ...prev,
      instructions: [...prev.instructions, ""],
    }));
  };

  const removeInstructionField = (index) => {
    setStepForm((prev) => {
      const next = [...prev.instructions];
      if (next.length === 1) {
        next[0] = "";
      } else {
        next.splice(index, 1);
      }
      return { ...prev, instructions: next };
    });
  };

  const handleRequiredDocChange = (index, value) => {
    setStepForm((prev) => {
      const next = [...prev.required_documents];
      next[index] = value;
      return { ...prev, required_documents: next };
    });
  };

  const addRequiredDocField = () => {
    setStepForm((prev) => ({
      ...prev,
      required_documents: [...prev.required_documents, ""],
      required_document_attachments: [
        ...(Array.isArray(prev.required_document_attachments)
          ? prev.required_document_attachments
          : []),
        null,
      ],
    }));
  };

  const removeRequiredDocField = (index) => {
    setStepForm((prev) => {
      const nextDocs = [...prev.required_documents];
      if (nextDocs.length === 1) {
        nextDocs[0] = "";
      } else {
        nextDocs.splice(index, 1);
      }

      const nextAttachments = Array.isArray(prev.required_document_attachments)
        ? [...prev.required_document_attachments]
        : [];
      if (nextAttachments.length > index) {
        nextAttachments.splice(index, 1);
      }

      return {
        ...prev,
        required_documents: nextDocs,
        required_document_attachments: nextAttachments,
      };
    });
    setRequiredDocFiles((prev) => {
      const copy = { ...prev };
      delete copy[index];
      return copy;
    });
  };

  const handleRequiredDocFileChange = (index, event) => {
    const file = event.target.files && event.target.files[0];
    setRequiredDocFiles((prev) => ({
      ...prev,
      [index]: file || undefined,
    }));
  };

  const handleClearRequiredDocAttachment = (index) => {
    setStepForm((prev) => {
      const next = Array.isArray(prev.required_document_attachments)
        ? [...prev.required_document_attachments]
        : [];
      if (next.length <= index) {
        for (let i = next.length; i <= index; i += 1) {
          next[i] = null;
        }
      } else {
        next[index] = null;
      }
      return { ...prev, required_document_attachments: next };
    });
    setRequiredDocFiles((prev) => {
      const updated = { ...prev };
      delete updated[index];
      return updated;
    });
  };

  const handleSaveStep = async (event) => {
    if (event && event.preventDefault) {
      event.preventDefault();
    }

    setStepFormError("");

    const trimmedTitle = stepForm.title.trim();
    if (!trimmedTitle) {
      setStepFormError("Title is required.");
      return;
    }

    if (stepForm.action_type !== "none" && !stepForm.action_label.trim()) {
      setStepFormError(
        "Action label is required when an action type is selected."
      );
      return;
    }

    const cleanInstructions = (stepForm.instructions || []).map((item) =>
      item.trim()
    );
    const cleanRequiredDocs = (stepForm.required_documents || []).map((item) =>
      item.trim()
    );

    try {
      setIsLoading(true);

      const buildRequiredDocAttachments = async (stepId, existing = []) => {
        const attachments = [];
        for (let i = 0; i < cleanRequiredDocs.length; i += 1) {
          const file = requiredDocFiles[i];
          if (file) {
            if (!auth.currentUser) {
              throw new Error(
                "You must be logged in to upload files. Please log in again."
              );
            }
            const safeName = file.name || `document_${i + 1}`;
            const path = `resource_steps/${stepId}/required_docs/${Date.now()}_${i}_${safeName}`;
            const {
              ref: storageRef,
              uploadBytes,
              getDownloadURL,
            } = await import("firebase/storage").then((m) => ({
              ref: m.ref,
              uploadBytes: m.uploadBytes,
              getDownloadURL: m.getDownloadURL,
            }));
            const { storage } = await import("../../../firebase");
            const fileRef = storageRef(storage, path);
            await uploadBytes(fileRef, file);
            const url = await getDownloadURL(fileRef);
            attachments.push({
              attachment_url: url,
              attachment_name: safeName,
              attachment_type: file.type || "application/octet-stream",
            });
          } else if (existing[i]) {
            attachments.push(existing[i]);
          } else {
            attachments.push(null);
          }
        }
        return attachments;
      };

      if (editingStep) {
        const stepRef = doc(db, "resource_steps", editingStep.id);
        const existingAttachments = Array.isArray(
          stepForm.required_document_attachments
        )
          ? stepForm.required_document_attachments
          : [];
        const requiredDocAttachments = await buildRequiredDocAttachments(
          editingStep.id,
          existingAttachments
        );

        await setDoc(
          stepRef,
          {
            title: trimmedTitle,
            description: stepForm.description.trim(),
            instructions: cleanInstructions,
            required_documents: cleanRequiredDocs,
            required_document_attachments: requiredDocAttachments,
            action_type: stepForm.action_type,
            action_label:
              stepForm.action_type === "none"
                ? ""
                : stepForm.action_label.trim(),
            is_active: stepForm.is_active,
            updated_at: new Date().toISOString(),
            updated_by: auth.currentUser?.uid || null,
          },
          { merge: true }
        );
        success("Guide step updated successfully.");
      } else {
        const maxOrder = guideSteps.reduce((max, step) => {
          const value =
            typeof step.order === "number" && !Number.isNaN(step.order)
              ? step.order
              : 0;
          return value > max ? value : max;
        }, 0);
        const newOrder = maxOrder + 1;

        const stepsCollection = collection(db, "resource_steps");
        const newStepRef = doc(stepsCollection);
        const requiredDocAttachments = await buildRequiredDocAttachments(
          newStepRef.id,
          []
        );

        await setDoc(newStepRef, {
          title: trimmedTitle,
          description: stepForm.description.trim(),
          instructions: cleanInstructions,
          required_documents: cleanRequiredDocs,
          required_document_attachments: requiredDocAttachments,
          action_type: stepForm.action_type,
          action_label:
            stepForm.action_type === "none" ? "" : stepForm.action_label.trim(),
          order: newOrder,
          is_active: stepForm.is_active,
          created_at: new Date().toISOString(),
          created_by: auth.currentUser?.uid || null,
        });
        success("Guide step added successfully.");
      }

      await fetchGuideSteps();
      closeStepModal();
    } catch (err) {
      console.error("Error saving guide step:", err);
      setStepFormError(
        "Failed to save guide step. Please try again in a moment."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleStepActive = async (step) => {
    try {
      const nextActive = !step.is_active;
      const stepRef = doc(db, "resource_steps", step.id);
      await setDoc(
        stepRef,
        {
          is_active: nextActive,
          updated_at: new Date().toISOString(),
          updated_by: auth.currentUser?.uid || null,
        },
        { merge: true }
      );

      setGuideSteps((prev) =>
        prev.map((item) =>
          item.id === step.id ? { ...item, is_active: nextActive } : item
        )
      );
    } catch (err) {
      console.error("Error toggling guide step active state:", err);
      showError("Failed to update step status. Please try again.");
    }
  };

  const persistGuideStepOrder = async (steps) => {
    try {
      setIsSavingGuideOrder(true);
      const updatePromises = steps.map((step, index) => {
        const stepRef = doc(db, "resource_steps", step.id);
        return setDoc(
          stepRef,
          {
            order: index + 1,
            updated_at: new Date().toISOString(),
            updated_by: auth.currentUser?.uid || null,
          },
          { merge: true }
        );
      });
      await Promise.all(updatePromises);
    } catch (err) {
      console.error("Error saving guide step order:", err);
      showError("Failed to save step order. It will reset on refresh.");
    } finally {
      setIsSavingGuideOrder(false);
    }
  };

  const handleGuideStepDrop = async (targetStepId) => {
    if (!draggedStepId || draggedStepId === targetStepId) return;

    const current = [...guideSteps];
    const fromIndex = current.findIndex((step) => step.id === draggedStepId);
    const toIndex = current.findIndex((step) => step.id === targetStepId);

    if (fromIndex === -1 || toIndex === -1) {
      setDraggedStepId(null);
      return;
    }

    const [moved] = current.splice(fromIndex, 1);
    current.splice(toIndex, 0, moved);
    setGuideSteps(current);
    setDraggedStepId(null);

    await persistGuideStepOrder(current);
  };

  return (
    <div className="dashboard-container">
      <LoadingSpinner
        isLoading={isLoading}
        message="Loading guide management..."
      />
      <Navbar onLogout={handleLogout} />
      <ToastContainer toasts={toasts} removeToast={removeToast} />

      <div className="dashboard-content">
        {/* Page Header */}
        <div className="resource-header">
          <h1>Guide Management</h1>
          <p className="resource-management-subtitle">
            Configure the student guide steps that appear in the mobile app.
          </p>
        </div>

        {/* Student Guide Steps Section */}
        <div className="resource-management-section">
          {error && (
            <div className="error-message" role="alert">
              {error}
              <button
                onClick={() => setError(null)}
                className="error-close"
                aria-label="Close error"
              >
                ×
              </button>
            </div>
          )}

          <div className="student-guide-section">
            <div className="student-guide-header">
              <div>
                <h2>Student Guide Steps</h2>
                <p className="student-guide-subtitle">
                  Define and reorder the steps students see in the app.
                </p>
              </div>
              <button
                type="button"
                className="guide-add-btn"
                onClick={openCreateStepModal}
                disabled={isLoading}
              >
                <IoAdd />
                <span>Add Step</span>
              </button>
            </div>

            <div className="student-guide-body">
              {guideStepsLoading ? (
                <div className="guide-steps-loading">Loading steps...</div>
              ) : guideSteps.length === 0 ? (
                <div className="guide-steps-empty">
                  <p className="guide-steps-empty-title">No guide steps yet</p>
                  <p className="guide-steps-empty-text">
                    Create your first step to help students understand how to
                    start and complete their requirements.
                  </p>
                  <button
                    type="button"
                    className="guide-add-btn secondary"
                    onClick={openCreateStepModal}
                    disabled={isLoading}
                  >
                    <IoAdd />
                    <span>Create First Step</span>
                  </button>
                </div>
              ) : (
                <div
                  className="guide-steps-table"
                  aria-label="Student guide steps"
                >
                  <div className="guide-steps-header-row">
                    <div className="guide-col-order">Order</div>
                    <div className="guide-col-title">Step</div>
                    <div className="guide-col-status">Status</div>
                    <div className="guide-col-action-type">Action</div>
                    <div className="guide-col-attachments">Attachments</div>
                    <div className="guide-col-actions">Actions</div>
                  </div>
                  <div className="guide-steps-rows">
                    {guideSteps.map((step, index) => (
                      <div
                        key={step.id}
                        className={`guide-step-row ${
                          step.is_active ? "" : "guide-step-row-inactive"
                        }`}
                        draggable
                        onDragStart={() => setDraggedStepId(step.id)}
                        onDragOver={(e) => e.preventDefault()}
                        onDrop={() => handleGuideStepDrop(step.id)}
                      >
                        <div className="guide-col-order">
                          <button
                            type="button"
                            className="drag-handle-btn"
                            aria-label="Drag to reorder step"
                          >
                            <IoReorderThreeOutline />
                          </button>
                          <span className="guide-order-label">
                            {(step.order || index + 1)
                              .toString()
                              .padStart(2, "0")}
                          </span>
                        </div>
                        <div className="guide-col-title">
                          <div className="guide-step-title">{step.title}</div>
                          {step.description && (
                            <div className="guide-step-description">
                              {step.description}
                            </div>
                          )}
                          {Array.isArray(step.instructions) &&
                            step.instructions.length > 0 && (
                              <ul className="guide-step-instructions">
                                {step.instructions.map((item, idx) => (
                                  <li key={idx}>{item}</li>
                                ))}
                              </ul>
                            )}
                        </div>
                        <div className="guide-col-status">
                          <span
                            className={`guide-status-pill ${
                              step.is_active ? "active" : "inactive"
                            }`}
                          >
                            {step.is_active ? "Active" : "Hidden"}
                          </span>
                        </div>
                        <div className="guide-col-action-type">
                          {step.action_type && step.action_type !== "none" ? (
                            <span className="guide-action-chip">
                              {step.action_label || step.action_type}
                            </span>
                          ) : (
                            <span className="guide-action-chip neutral">
                              None
                            </span>
                          )}
                        </div>
                        <div className="guide-col-attachments">
                          {(() => {
                            const attachments = Array.isArray(
                              step.required_document_attachments
                            )
                              ? step.required_document_attachments
                              : [];
                            const count = attachments.filter(
                              (a) => a && a.attachment_url
                            ).length;
                            const total = Math.max(
                              attachments.length,
                              Array.isArray(step.required_documents)
                                ? step.required_documents.length
                                : 0
                            );
                            if (total === 0) {
                              return (
                                <span className="guide-attachments-count none">
                                  —
                                </span>
                              );
                            }
                            return (
                              <span
                                className={`guide-attachments-count ${
                                  count > 0 ? "has-files" : "no-files"
                                }`}
                                title={`${count} of ${total} document(s) have an attached file`}
                              >
                                {count}/{total} file{count !== 1 ? "s" : ""}
                              </span>
                            );
                          })()}
                        </div>
                        <div className="guide-col-actions">
                          <button
                            type="button"
                            className="guide-action-btn"
                            onClick={() => openEditStepModal(step)}
                            disabled={isLoading}
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            className="guide-action-btn subtle"
                            onClick={() => handleToggleStepActive(step)}
                            disabled={isLoading}
                          >
                            {step.is_active ? "Disable" : "Enable"}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                  {isSavingGuideOrder && (
                    <div className="guide-steps-saving">
                      Saving new order...
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Guide Step Modal */}
      {isStepModalOpen && (
        <div className="guide-modal-backdrop">
          <div className="guide-modal">
            <div className="guide-modal-header">
              <h2>{editingStep ? "Edit Guide Step" : "Add Guide Step"}</h2>
              <button
                type="button"
                className="guide-modal-close-btn"
                onClick={closeStepModal}
                aria-label="Close"
              >
                <IoCloseOutline />
              </button>
            </div>
            <form className="guide-modal-body" onSubmit={handleSaveStep}>
              {stepFormError && (
                <div className="guide-modal-error" role="alert">
                  {stepFormError}
                </div>
              )}

              <div className="guide-field-group">
                <label className="guide-field-label">
                  Title <span className="required-indicator">*</span>
                </label>
                <input
                  type="text"
                  className="guide-text-input"
                  value={stepForm.title}
                  onChange={(e) =>
                    setStepForm((prev) => ({
                      ...prev,
                      title: e.target.value,
                    }))
                  }
                  placeholder="Example: Submit OJT Requirements"
                />
              </div>

              <div className="guide-field-group">
                <label className="guide-field-label">Description</label>
                <textarea
                  className="guide-textarea"
                  rows={3}
                  value={stepForm.description}
                  onChange={(e) =>
                    setStepForm((prev) => ({
                      ...prev,
                      description: e.target.value,
                    }))
                  }
                  placeholder="Short explanation of what this step is about."
                />
              </div>

              <div className="guide-field-group">
                <label className="guide-field-label">Instructions</label>
                <p className="guide-field-help">
                  Add clear, simple bullet points that guide students through
                  this step.
                </p>
                {stepForm.instructions.map((item, index) => (
                  <div className="guide-multi-row" key={index}>
                    <input
                      type="text"
                      className="guide-text-input"
                      value={item}
                      onChange={(e) =>
                        handleInstructionChange(index, e.target.value)
                      }
                      placeholder={`Instruction ${index + 1}`}
                    />
                    {stepForm.instructions.length > 1 && (
                      <button
                        type="button"
                        className="guide-icon-btn danger"
                        onClick={() => removeInstructionField(index)}
                        aria-label="Remove instruction"
                      >
                        <span className="guide-icon-x">×</span>
                      </button>
                    )}
                  </div>
                ))}
                <button
                  type="button"
                  className="guide-inline-btn"
                  onClick={addInstructionField}
                >
                  <IoAdd />
                  <span>Add instruction</span>
                </button>
              </div>

              <div className="guide-field-group">
                <label className="guide-field-label">Required documents</label>
                <p className="guide-field-help">
                  Add documents students must prepare for this step. You can
                  attach one reference file per document (e.g. sample or
                  template).
                </p>
                <div className="guide-required-docs-list">
                  {stepForm.required_documents.map((item, index) => {
                    const existingAttachment =
                      Array.isArray(stepForm.required_document_attachments) &&
                      stepForm.required_document_attachments[index] &&
                      stepForm.required_document_attachments[index]
                        .attachment_url
                        ? stepForm.required_document_attachments[index]
                        : null;
                    const stagedFile = requiredDocFiles[index];

                    return (
                      <div
                        className="guide-required-doc-card"
                        key={index}
                        data-doc-index={index}
                      >
                        <div className="guide-required-doc-card-header">
                          <span className="guide-required-doc-number">
                            Document {index + 1}
                          </span>
                          {stepForm.required_documents.length > 1 && (
                            <button
                              type="button"
                              className="guide-remove-doc-btn"
                              onClick={() => removeRequiredDocField(index)}
                              aria-label="Remove this document"
                              title="Remove this document"
                            >
                              <IoTrashOutline className="guide-remove-doc-icon" />
                              <span>Remove document</span>
                            </button>
                          )}
                        </div>
                        <div className="guide-required-doc-name-row">
                          <label className="guide-required-doc-sublabel">
                            Document name
                          </label>
                          <input
                            type="text"
                            className="guide-text-input"
                            value={item}
                            onChange={(e) =>
                              handleRequiredDocChange(index, e.target.value)
                            }
                            placeholder="e.g. Medical Certificate, COM Form"
                          />
                        </div>
                        <div className="guide-required-doc-attachment-box">
                          <span className="guide-required-doc-sublabel">
                            Reference file (optional)
                          </span>
                          {existingAttachment && !stagedFile && (
                            <div className="guide-attachment-current">
                              <IoDocumentOutline className="guide-attachment-file-icon" />
                              <a
                                href={existingAttachment.attachment_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="guide-attachment-link"
                              >
                                {existingAttachment.attachment_name ||
                                  "View file"}
                              </a>
                              <button
                                type="button"
                                className="guide-attachment-remove-btn"
                                onClick={() =>
                                  handleClearRequiredDocAttachment(index)
                                }
                                title="Remove this file only"
                              >
                                Remove file
                              </button>
                            </div>
                          )}
                          {stagedFile && (
                            <div className="guide-attachment-selected">
                              <IoDocumentOutline className="guide-attachment-file-icon" />
                              <span className="guide-attachment-filename">
                                {stagedFile.name}
                              </span>
                              <button
                                type="button"
                                className="guide-attachment-remove-btn"
                                onClick={() =>
                                  handleClearRequiredDocAttachment(index)
                                }
                                title="Remove this file only"
                              >
                                Remove file
                              </button>
                            </div>
                          )}
                          {!existingAttachment && !stagedFile && (
                            <div className="guide-attachment-empty">
                              No file attached
                            </div>
                          )}
                          <label className="guide-file-input-label">
                            <IoCloudUploadOutline className="guide-file-input-icon" />
                            <span>
                              {stagedFile || existingAttachment
                                ? "Change file"
                                : "Attach file"}
                            </span>
                            <input
                              type="file"
                              className="guide-file-input"
                              onChange={(e) =>
                                handleRequiredDocFileChange(index, e)
                              }
                            />
                          </label>
                        </div>
                      </div>
                    );
                  })}
                </div>
                <button
                  type="button"
                  className="guide-add-doc-btn"
                  onClick={addRequiredDocField}
                >
                  <IoAdd />
                  <span>Add document</span>
                </button>
              </div>

              <div className="guide-field-inline">
                <div className="guide-field-group">
                  <label className="guide-field-label">Action type</label>
                  <select
                    className="guide-select"
                    value={stepForm.action_type}
                    onChange={(e) =>
                      setStepForm((prev) => ({
                        ...prev,
                        action_type: e.target.value,
                      }))
                    }
                  >
                    <option value="none">None</option>
                    <option value="upload">Upload</option>
                    <option value="download">Download</option>
                    <option value="view">View</option>
                  </select>
                </div>

                <div className="guide-field-group">
                  <label className="guide-field-label">
                    Action label{" "}
                    {stepForm.action_type !== "none" && (
                      <span className="required-indicator">*</span>
                    )}
                  </label>
                  <input
                    type="text"
                    className="guide-text-input"
                    value={stepForm.action_label}
                    onChange={(e) =>
                      setStepForm((prev) => ({
                        ...prev,
                        action_label: e.target.value,
                      }))
                    }
                    placeholder={
                      stepForm.action_type === "upload"
                        ? "Upload COM Form"
                        : stepForm.action_type === "download"
                        ? "Download OJT Guide"
                        : stepForm.action_type === "view"
                        ? "View requirements"
                        : "No primary action"
                    }
                  />
                </div>
              </div>

              <div className="guide-field-group">
                <label className="guide-toggle-label">
                  <input
                    type="checkbox"
                    checked={stepForm.is_active}
                    onChange={(e) =>
                      setStepForm((prev) => ({
                        ...prev,
                        is_active: e.target.checked,
                      }))
                    }
                  />
                  <span>Step is visible to students</span>
                </label>
              </div>

              <div className="guide-modal-footer">
                <button
                  type="button"
                  className="guide-secondary-btn"
                  onClick={closeStepModal}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="guide-primary-btn"
                  disabled={isLoading}
                >
                  {editingStep ? "Save Changes" : "Create Step"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ResourceManagementDashboard;
