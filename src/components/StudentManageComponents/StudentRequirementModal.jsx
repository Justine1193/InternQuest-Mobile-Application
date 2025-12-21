/**
 * StudentRequirementModal - Modal to display student requirements and documents from Firestore
 * Shows MOA, Resume, and other required documents with uploaded files
 *
 * @component
 * @param {boolean} open - Whether the modal is open
 * @param {object} student - The student data to display
 * @param {function} onClose - Handler to close the modal
 * @example
 * <StudentRequirementModal open={open} student={student} onClose={handleClose} />
 */

import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { IoCloseOutline } from "react-icons/io5";
import { storage, db } from "../../../firebase";
import { ref, getDownloadURL, listAll, getMetadata } from "firebase/storage";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { getAdminRole, hasAnyRole, ROLES } from "../../utils/auth";
import "./StudentRequirementModal.css";

const StudentRequirementModal = ({ open, student, onClose }) => {
  const [viewingFile, setViewingFile] = useState(null);
  const [viewingFileName, setViewingFileName] = useState("");
  const [profilePictureUrl, setProfilePictureUrl] = useState(null);
  const [profilePictureError, setProfilePictureError] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [storageFiles, setStorageFiles] = useState([]); // Files from Storage
  const [isLoadingStorageFiles, setIsLoadingStorageFiles] = useState(false);
  const [approvalStatuses, setApprovalStatuses] = useState({}); // { requirementType: { status, reviewedBy, reviewedAt } }
  const [isLoadingApprovals, setIsLoadingApprovals] = useState(false);
  const [updatingRequirement, setUpdatingRequirement] = useState(null); // Track which requirement is being updated
  // Denial modal state
  const [showDenialModal, setShowDenialModal] = useState(false);
  const [denialRequirementType, setDenialRequirementType] = useState(null);
  const [denialReason, setDenialReason] = useState("");

  // Check if current user can approve requirements (adviser or coordinator)
  const canApproveRequirements = () => {
    const role = getAdminRole();
    return hasAnyRole([ROLES.ADVISER, ROLES.COORDINATOR, ROLES.SUPER_ADMIN]);
  };

  // Fetch files from Storage when modal opens
  useEffect(() => {
    const fetchStorageFiles = async () => {
      if (!open || !student || !student.id) {
        setStorageFiles([]);
        return;
      }

      setIsLoadingStorageFiles(true);
      try {
        // List all folders in the user's requirements folder
        // Path structure: requirements/{userId}/{folderName}/{fileName}
        const storagePath = `requirements/${student.id}`;
        console.log("📂 Fetching files from Storage path:", storagePath);
        const requirementsRef = ref(storage, storagePath);
        const folderList = await listAll(requirementsRef);

        console.log(
          `📁 Found ${folderList.prefixes.length} folder(s) in Storage`
        );

        // Map folder names to requirement types
        const folderMapping = {
          "moa-memorandum-of-agreement": "MOA (Memorandum of Agreement)",
          "parent-guardian-consent-form": "Parent/Guardian Consent Form",
          "medical-certificate": "Medical Certificate",
          "resume-cv": "Resume",
          "police-clearance": "Clearance",
          "academic-records": "Academic Records",
          "cover-letter": "Cover Letter",
          "insurance-certificate": "Insurance Certificate",
        };

        // Fetch files from each folder
        const allFiles = [];
        for (const folderPrefix of folderList.prefixes) {
          const folderName = folderPrefix.name;
          console.log(`📂 Checking folder: ${folderName}`);

          try {
            const folderFiles = await listAll(folderPrefix);
            console.log(
              `  📄 Found ${folderFiles.items.length} file(s) in ${folderName}`
            );

            // Get download URLs and metadata for each file in this folder
            const filesWithUrls = await Promise.all(
              folderFiles.items.map(async (itemRef) => {
                try {
                  const [downloadURL, metadata] = await Promise.all([
                    getDownloadURL(itemRef),
                    getMetadata(itemRef),
                  ]);

                  const fileData = {
                    name: itemRef.name,
                    fullPath: itemRef.fullPath,
                    folderName: folderName,
                    requirementType: folderMapping[folderName] || folderName,
                    downloadURL,
                    size: metadata.size,
                    contentType: metadata.contentType,
                    timeCreated: metadata.timeCreated,
                    updated: metadata.updated,
                  };

                  console.log("✅ File data:", {
                    name: fileData.name,
                    folder: fileData.folderName,
                    requirementType: fileData.requirementType,
                    size: `${(fileData.size / 1024).toFixed(2)} KB`,
                    path: fileData.fullPath,
                  });

                  return fileData;
                } catch (error) {
                  console.warn(
                    `❌ Failed to get URL for ${itemRef.name}:`,
                    error
                  );
                  return null;
                }
              })
            );

            // Filter out null values and add to allFiles
            const validFiles = filesWithUrls.filter((file) => file !== null);
            allFiles.push(...validFiles);
          } catch (error) {
            console.warn(
              `❌ Error fetching files from folder ${folderName}:`,
              error
            );
          }
        }

        console.log(
          `✅ Successfully loaded ${allFiles.length} file(s) from Storage`
        );
        console.log("📋 All files data:", allFiles);
        setStorageFiles(allFiles);
      } catch (error) {
        // If folder doesn't exist or no files, that's okay
        if (error.code === "storage/object-not-found") {
          console.log("No requirements folder found in Storage");
          setStorageFiles([]);
        } else {
          console.error("Error fetching Storage files:", error);
          setStorageFiles([]);
        }
      } finally {
        setIsLoadingStorageFiles(false);
      }
    };

    fetchStorageFiles();
  }, [open, student?.id]);

  // Fetch profile picture from Storage when modal opens
  useEffect(() => {
    const fetchProfilePicture = async () => {
      if (!open || !student?.id) {
        setProfilePictureUrl(null);
        setProfilePictureError(false);
        return;
      }

      // Fetch directly from Storage - prioritize avatars folder
      try {
        // First: Check avatars/{userId}/ folder (direct Storage access)
        const avatarsRef = ref(storage, `avatars/${student.id}`);
        const avatarsList = await listAll(avatarsRef);

        if (avatarsList.items.length > 0) {
          // Get the first file found in avatars folder
          const avatarFile = avatarsList.items[0];
          const url = await getDownloadURL(avatarFile);
          setProfilePictureUrl(url);
          setProfilePictureError(false);
          console.log(
            "✅ Profile picture found in avatars folder:",
            avatarFile.name
          );
          return;
        }
      } catch (error) {
        // If avatars folder doesn't exist, continue to other Storage paths
        console.log("No avatars folder found, trying other Storage paths...");
      }

      // Second: Try profilePictures/{userId}/ folder
      const fileNames = [
        "profile.jpg",
        "profile.png",
        "avatar.jpg",
        "avatar.png",
      ];
      for (const fileName of fileNames) {
        try {
          const profileRef = ref(
            storage,
            `profilePictures/${student.id}/${fileName}`
          );
          const url = await getDownloadURL(profileRef);
          setProfilePictureUrl(url);
          setProfilePictureError(false);
          console.log(
            "✅ Profile picture found in profilePictures folder:",
            fileName
          );
          return;
        } catch (e) {
          // Silently continue if file doesn't exist
          continue;
        }
      }

      // Last fallback: Check Firestore profilePictureUrl (if exists)
      if (student.profilePictureUrl) {
        setProfilePictureUrl(student.profilePictureUrl);
        setProfilePictureError(false);
        return;
      }

      // No picture found in Storage or Firestore
      setProfilePictureError(true);
    };

    fetchProfilePicture();
  }, [open, student?.id]);

  // Fetch approval statuses from Firestore
  useEffect(() => {
    const fetchApprovalStatuses = async () => {
      if (!open || !student?.id) {
        setApprovalStatuses({});
        return;
      }

      setIsLoadingApprovals(true);
      try {
        const approvalRef = doc(db, "requirement_approvals", student.id);
        const approvalSnap = await getDoc(approvalRef);
        
        if (approvalSnap.exists()) {
          setApprovalStatuses(approvalSnap.data());
        } else {
          setApprovalStatuses({});
        }
      } catch (error) {
        console.error("Error fetching approval statuses:", error);
        setApprovalStatuses({});
      } finally {
        setIsLoadingApprovals(false);
      }
    };

    fetchApprovalStatuses();
  }, [open, student?.id]);

  if (!open || !student) return null;

  // Helper function to get file type (for preview)
  const getFileType = (url) => {
    if (!url) return "unknown";
    const urlLower = url.toLowerCase();
    if (urlLower.includes(".pdf") || urlLower.includes("application/pdf"))
      return "pdf";
    if (
      urlLower.includes(".jpg") ||
      urlLower.includes(".jpeg") ||
      urlLower.includes("image/jpeg")
    )
      return "image";
    if (urlLower.includes(".png") || urlLower.includes("image/png"))
      return "image";
    if (urlLower.includes(".gif") || urlLower.includes("image/gif"))
      return "image";
    if (urlLower.includes(".webp") || urlLower.includes("image/webp"))
      return "image";
    if (urlLower.includes(".doc") || urlLower.includes(".docx"))
      return "document";
    if (urlLower.includes(".xls") || urlLower.includes(".xlsx"))
      return "spreadsheet";
    return "other";
  };

  // Helper function to detect document type from filename
  const getDocumentType = (fileName) => {
    if (!fileName) return "Document";
    const nameLower = fileName.toLowerCase();

    // Check for common requirement types
    if (nameLower.includes("moa") || nameLower.includes("memorandum")) {
      return "MOA (Memorandum of Agreement)";
    }
    if (nameLower.includes("resume") || nameLower.includes("cv")) {
      return "Resume";
    }
    if (nameLower.includes("clearance") || nameLower.includes("barangay")) {
      return "Clearance";
    }
    if (nameLower.includes("waiver") || nameLower.includes("consent")) {
      return "Waiver";
    }
    if (nameLower.includes("medical") || nameLower.includes("health")) {
      return "Medical Certificate";
    }
    if (nameLower.includes("parent") || nameLower.includes("guardian")) {
      return "Parent/Guardian Consent";
    }
    if (nameLower.includes("application") || nameLower.includes("form")) {
      return "Application Form";
    }
    if (nameLower.includes("transcript") || nameLower.includes("grades")) {
      return "Transcript of Records";
    }
    if (nameLower.includes("certificate") || nameLower.includes("cert")) {
      return "Certificate";
    }
    if (nameLower.includes("id") || nameLower.includes("identification")) {
      return "ID Document";
    }

    // Check file extension for generic types
    if (nameLower.endsWith(".pdf")) {
      return "PDF Document";
    }
    if (nameLower.match(/\.(jpg|jpeg|png|gif|webp)$/)) {
      return "Image";
    }
    if (nameLower.match(/\.(doc|docx)$/)) {
      return "Word Document";
    }
    if (nameLower.match(/\.(xls|xlsx)$/)) {
      return "Excel Spreadsheet";
    }

    return "Document";
  };

  // Handle file click - open in viewer
  const handleFileClick = (e, fileUrl, fileName) => {
    e.preventDefault();
    e.stopPropagation();
    setViewingFile(fileUrl);
    setViewingFileName(fileName);
  };

  // Close file viewer
  const closeFileViewer = () => {
    setViewingFile(null);
    setViewingFileName("");
  };

  // Handle file download
  const handleDownload = async (e, fileUrl, fileName) => {
    e.preventDefault();
    e.stopPropagation();

    try {
      // Fetch the file
      const response = await fetch(fileUrl);
      if (!response.ok) {
        throw new Error("Failed to fetch file");
      }

      // Get the blob
      const blob = await response.blob();

      // Create a temporary URL for the blob
      const blobUrl = window.URL.createObjectURL(blob);

      // Create a temporary anchor element and trigger download
      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = fileName || "download";
      link.style.display = "none";
      document.body.appendChild(link);
      link.click();

      // Clean up
      setTimeout(() => {
        document.body.removeChild(link);
        window.URL.revokeObjectURL(blobUrl);
      }, 100);
    } catch (error) {
      console.error("Download error:", error);
      // Fallback: open in new tab if download fails
      window.open(fileUrl, "_blank");
    }
  };

  // Handle accepting a requirement
  const handleAcceptRequirement = async (requirementType) => {
    if (!student?.id || !canApproveRequirements()) return;

    setUpdatingRequirement(requirementType);
    try {
      const approvalRef = doc(db, "requirement_approvals", student.id);
      const currentData = approvalStatuses || {};
      
      const updateData = {
        ...currentData,
        [requirementType]: {
          status: "accepted",
          reviewedBy: getAdminRole(),
          reviewedAt: new Date().toISOString(),
        },
      };

      await setDoc(approvalRef, updateData, { merge: true });
      setApprovalStatuses(updateData);
    } catch (error) {
      console.error("Error accepting requirement:", error);
      alert("Failed to accept requirement. Please try again.");
    } finally {
      setUpdatingRequirement(null);
    }
  };

  // Handle opening denial modal
  const handleDenyRequirement = (requirementType) => {
    if (!student?.id || !canApproveRequirements()) return;
    setDenialRequirementType(requirementType);
    setDenialReason("");
    setShowDenialModal(true);
  };

  // Handle closing denial modal
  const handleCloseDenialModal = () => {
    setShowDenialModal(false);
    setDenialRequirementType(null);
    setDenialReason("");
  };

  // Handle submitting denial
  const handleSubmitDenial = async () => {
    if (!student?.id || !denialRequirementType || !canApproveRequirements()) return;

    setUpdatingRequirement(denialRequirementType);
    try {
      const approvalRef = doc(db, "requirement_approvals", student.id);
      const currentData = approvalStatuses || {};
      
      const updateData = {
        ...currentData,
        [denialRequirementType]: {
          status: "denied",
          reviewedBy: getAdminRole(),
          reviewedAt: new Date().toISOString(),
          reason: denialReason.trim() || "",
        },
      };

      await setDoc(approvalRef, updateData, { merge: true });
      setApprovalStatuses(updateData);
      handleCloseDenialModal();
    } catch (error) {
      console.error("Error denying requirement:", error);
      alert("Failed to deny requirement. Please try again.");
    } finally {
      setUpdatingRequirement(null);
    }
  };

  // Get approval status for a requirement
  const getApprovalStatus = (requirementType) => {
    return approvalStatuses[requirementType] || null;
  };

  return (
    <div className="student-requirement-modal-backdrop" onClick={onClose}>
      <div
        className="student-requirement-modal"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="student-requirement-modal-header">
          <h2>Student Files</h2>
          <button
            className="close-btn"
            onClick={onClose}
            aria-label="Close modal"
          >
            <IoCloseOutline />
          </button>
        </div>

        <div className="student-requirement-modal-content">
          <div className="student-info-section">
            <div className="student-profile-header">
              {profilePictureUrl ? (
                <img
                  src={profilePictureUrl}
                  alt={`${student.firstName} ${student.lastName}`}
                  className="student-modal-profile-picture clickable"
                  onClick={() => setShowProfileModal(true)}
                  onError={() => setProfilePictureError(true)}
                  title="Click to view full size"
                />
              ) : (
                <div
                  className="student-modal-profile-picture-placeholder"
                  title="No profile picture"
                >
                  {student.firstName?.[0]?.toUpperCase() || "?"}
                  {student.lastName?.[0]?.toUpperCase() || ""}
                </div>
              )}
              <div className="student-info-text">
                <h3>
                  {student.firstName} {student.lastName}
                </h3>
                <p className="student-email">{student.email || "N/A"}</p>
                <div className="student-additional-info">
                  {student.studentNumber || student.studentId ? (
                    <p className="student-id">
                      <strong>Student ID:</strong> {student.studentNumber || student.studentId}
                    </p>
                  ) : null}
                  {student.section ? (
                    <p className="student-section">
                      <strong>Section:</strong> {student.section}
                    </p>
                  ) : null}
                </div>
              </div>
            </div>
          </div>

          {/* Profile Picture Modal */}
          {showProfileModal && profilePictureUrl && (
            <div
              className="profile-picture-modal-backdrop"
              onClick={() => setShowProfileModal(false)}
            >
              <div
                className="profile-picture-modal-content"
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  className="profile-picture-modal-close"
                  onClick={() => setShowProfileModal(false)}
                  aria-label="Close"
                >
                  ×
                </button>
                <img
                  src={profilePictureUrl}
                  alt={`${student.firstName} ${student.lastName}`}
                  className="profile-picture-modal-image"
                />
                <p className="profile-picture-modal-name">
                  {student.firstName} {student.lastName}
                </p>
              </div>
            </div>
          )}

          {/* Required Documents Section */}
          <div className="requirement-section">
            <h3>Required Documents</h3>
            {isLoadingStorageFiles ? (
              <div className="loading-requirements">
                <p>Loading files from Storage...</p>
              </div>
            ) : (
              <div className="document-list">
                {[
                  {
                    type: "MOA (Memorandum of Agreement)",
                    description:
                      "Signed agreement between your school and the company.",
                    keywords: ["moa", "memorandum", "agreement"],
                    folderName: "moa-memorandum-of-agreement",
                  },
                  {
                    type: "Parent/Guardian Consent Form",
                    description: "Signed consent form from parent or guardian.",
                    keywords: ["parent", "guardian", "consent"],
                    folderName: "parent-guardian-consent-form",
                  },
                  {
                    type: "Medical Certificate",
                    description: "Medical clearance from a licensed physician.",
                    keywords: ["medical", "health", "clearance", "certificate"],
                    folderName: "medical-certificate",
                  },
                  {
                    type: "Resume",
                    description: "Updated resume or curriculum vitae.",
                    keywords: ["resume", "cv", "curriculum"],
                    folderName: "resume-cv",
                  },
                  {
                    type: "Clearance",
                    description: "Barangay or community clearance certificate.",
                    keywords: ["clearance", "barangay"],
                    folderName: "police-clearance",
                  },
                  {
                    type: "Academic Records",
                    description: "Transcript of records or academic documents.",
                    keywords: ["academic", "transcript", "records", "grades"],
                    folderName: "academic-records",
                  },
                  {
                    type: "Cover Letter",
                    description: "Cover letter for internship application.",
                    keywords: ["cover", "letter"],
                    folderName: "cover-letter",
                  },
                  {
                    type: "Insurance Certificate",
                    description: "Insurance certificate or proof of coverage.",
                    keywords: ["insurance", "certificate"],
                    folderName: "insurance-certificate",
                  },
                ].map((requirement, index) => {
                  // Find matching file from Storage by folder name first
                  let matchingFile = storageFiles.find(
                    (file) => file.folderName === requirement.folderName
                  );

                  // If no match by folder name, try requirementType matching
                  if (!matchingFile) {
                    matchingFile = storageFiles.find(
                      (file) => file.requirementType === requirement.type
                    );
                  }

                  // If still no match, try keyword matching as fallback
                  if (!matchingFile) {
                    matchingFile = storageFiles.find((file) => {
                      const fileName = file.name.toLowerCase();
                      const folderName = file.folderName?.toLowerCase() || "";
                      const matches =
                        requirement.keywords.some((keyword) =>
                          fileName.includes(keyword.toLowerCase())
                        ) ||
                        requirement.keywords.some((keyword) =>
                          folderName.includes(keyword.toLowerCase())
                        );
                      if (matches) {
                        console.log(
                          `✅ Matched "${file.name}" (from ${file.folderName}) to "${requirement.type}"`
                        );
                      }
                      return matches;
                    });
                  } else {
                    console.log(
                      `✅ Matched file from folder "${matchingFile.folderName}" to "${requirement.type}"`
                    );
                  }

                  // Debug: Log if no match found
                  if (!matchingFile && storageFiles.length > 0) {
                    console.log(
                      `❌ No match for "${requirement.type}". Available files:`,
                      storageFiles.map((f) => ({
                        name: f.name,
                        folder: f.folderName,
                        type: f.requirementType,
                      }))
                    );
                  }

                  const approvalStatus = getApprovalStatus(requirement.type);
                  const isUpdating = updatingRequirement === requirement.type;
                  
                  // Determine display status
                  let status = matchingFile ? "Submitted" : "Pending";
                  let statusColor = matchingFile ? "#43a047" : "#fb8c00";
                  
                  if (approvalStatus) {
                    if (approvalStatus.status === "accepted") {
                      status = "Accepted";
                      statusColor = "#2e7d32";
                    } else if (approvalStatus.status === "denied") {
                      status = "Denied";
                      statusColor = "#d32f2f";
                    }
                  }

                  return (
                    <div key={index} className="document-item">
                      <div className="document-info">
                        <div className="document-header">
                          <span className="document-name">
                            {requirement.type}
                          </span>
                          <span
                            className="document-status"
                            style={{
                              color: statusColor,
                              backgroundColor: "#f5f5f5",
                            }}
                          >
                            {status}
                          </span>
                        </div>
                        <p className="document-description">
                          {requirement.description}
                        </p>
                        {approvalStatus?.reason && (
                          <p className="denial-reason" style={{ 
                            color: "#d32f2f", 
                            fontSize: "0.85rem", 
                            marginTop: "0.5rem",
                            fontStyle: "italic"
                          }}>
                            Denial reason: {approvalStatus.reason}
                          </p>
                        )}
                        {approvalStatus?.reviewedBy && (
                          <p className="review-info" style={{ 
                            color: "#666", 
                            fontSize: "0.8rem", 
                            marginTop: "0.25rem"
                          }}>
                            Reviewed by {approvalStatus.reviewedBy} on{" "}
                            {new Date(approvalStatus.reviewedAt).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                      {matchingFile ? (
                        <div className="document-files">
                          <button
                            onClick={(e) =>
                              handleFileClick(
                                e,
                                matchingFile.downloadURL,
                                matchingFile.name
                              )
                            }
                            className="document-link"
                            title={`View ${matchingFile.name}`}
                          >
                            📄 {matchingFile.name}
                          </button>
                          {canApproveRequirements() && !approvalStatus && (
                            <div className="approval-actions">
                              <button
                                onClick={() => handleAcceptRequirement(requirement.type)}
                                className="approve-btn"
                                disabled={isUpdating}
                                title="Accept this requirement"
                              >
                                {isUpdating ? "..." : "✓ Accept"}
                              </button>
                              <button
                                onClick={() => handleDenyRequirement(requirement.type)}
                                className="deny-btn"
                                disabled={isUpdating}
                                title="Deny this requirement"
                              >
                                {isUpdating ? "..." : "✗ Deny"}
                              </button>
                            </div>
                          )}
                          {canApproveRequirements() && approvalStatus && (
                            <div className="approval-actions">
                              <button
                                onClick={() => handleAcceptRequirement(requirement.type)}
                                className={`approve-btn ${approvalStatus.status === "accepted" ? "active" : ""}`}
                                disabled={isUpdating}
                                title="Accept this requirement"
                              >
                                {isUpdating ? "..." : "✓ Accept"}
                              </button>
                              <button
                                onClick={() => handleDenyRequirement(requirement.type)}
                                className={`deny-btn ${approvalStatus.status === "denied" ? "active" : ""}`}
                                disabled={isUpdating}
                                title="Deny this requirement"
                              >
                                {isUpdating ? "..." : "✗ Deny"}
                              </button>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div
                          className="document-files"
                          style={{
                            color: "#999",
                            fontSize: "0.9rem",
                            fontStyle: "italic",
                          }}
                        >
                          No files uploaded
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        <div className="student-requirement-modal-actions">
          <button className="close-modal-btn" onClick={onClose}>
            Close
          </button>
        </div>
      </div>

      {/* Denial Reason Modal */}
      {showDenialModal && (
        <div className="denial-modal-backdrop" onClick={handleCloseDenialModal}>
          <div
            className="denial-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="denial-modal-header">
              <h3>Deny Requirement</h3>
              <button
                className="denial-modal-close"
                onClick={handleCloseDenialModal}
                aria-label="Close modal"
              >
                <IoCloseOutline />
              </button>
            </div>
            <div className="denial-modal-content">
              <p className="denial-modal-question">
                Please provide a reason for denying this requirement:
              </p>
              <p className="denial-modal-requirement">
                <strong>Requirement:</strong> {denialRequirementType}
              </p>
              <textarea
                className="denial-reason-input"
                placeholder="Enter denial reason (optional but recommended)..."
                value={denialReason}
                onChange={(e) => setDenialReason(e.target.value)}
                rows={5}
                maxLength={500}
              />
              <div className="denial-modal-char-count">
                {denialReason.length}/500 characters
              </div>
            </div>
            <div className="denial-modal-actions">
              <button
                className="denial-cancel-btn"
                onClick={handleCloseDenialModal}
                disabled={updatingRequirement === denialRequirementType}
              >
                Cancel
              </button>
              <button
                className="denial-submit-btn"
                onClick={handleSubmitDenial}
                disabled={updatingRequirement === denialRequirementType}
              >
                {updatingRequirement === denialRequirementType ? "Submitting..." : "Submit Denial"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* File Viewer Modal */}
      {viewingFile && (
        <div className="file-viewer-backdrop" onClick={closeFileViewer}>
          <div
            className="file-viewer-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="file-viewer-header">
              <h3>{viewingFileName}</h3>
              <div className="file-viewer-header-actions">
                <button
                  className="file-download-header-btn"
                  onClick={(e) =>
                    handleDownload(e, viewingFile, viewingFileName)
                  }
                  title="Download file"
                >
                  ⬇️ Download
                </button>
                <button className="file-viewer-close" onClick={closeFileViewer}>
                  <IoCloseOutline />
                </button>
              </div>
            </div>
            <div className="file-viewer-content">
              {getFileType(viewingFile) === "pdf" ? (
                <iframe
                  src={viewingFile}
                  className="file-viewer-iframe"
                  title={viewingFileName}
                />
              ) : getFileType(viewingFile) === "image" ? (
                <div className="file-viewer-image-container">
                  <img
                    src={viewingFile}
                    alt={viewingFileName}
                    className="file-viewer-image"
                    onError={(e) => {
                      e.target.style.display = "none";
                      e.target.nextSibling.style.display = "block";
                    }}
                  />
                  <div
                    className="file-viewer-image-error"
                    style={{ display: "none" }}
                  >
                    <p>Failed to load image</p>
                    <button
                      onClick={(e) =>
                        handleDownload(e, viewingFile, viewingFileName)
                      }
                      className="file-download-btn"
                    >
                      ⬇️ Download Image
                    </button>
                  </div>
                </div>
              ) : (
                <div className="file-viewer-unsupported">
                  <p>This file type cannot be previewed in the browser.</p>
                  <button
                    onClick={(e) =>
                      handleDownload(e, viewingFile, viewingFileName)
                    }
                    className="file-download-btn"
                  >
                    ⬇️ Download File
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

StudentRequirementModal.propTypes = {
  open: PropTypes.bool.isRequired,
  student: PropTypes.object,
  onClose: PropTypes.func.isRequired,
};

export default StudentRequirementModal;
