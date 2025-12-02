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
import { storage } from "../../../firebase.js";
import { ref, getDownloadURL, listAll, getMetadata } from "firebase/storage";
import "./StudentRequirementModal.css";

const StudentRequirementModal = ({ open, student, onClose }) => {
  const [viewingFile, setViewingFile] = useState(null);
  const [viewingFileName, setViewingFileName] = useState("");
  const [profilePictureUrl, setProfilePictureUrl] = useState(null);
  const [profilePictureError, setProfilePictureError] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [storageFiles, setStorageFiles] = useState([]); // Files from Storage
  const [isLoadingStorageFiles, setIsLoadingStorageFiles] = useState(false);

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

                  const status = matchingFile ? "Submitted" : "Pending";
                  const statusColor = matchingFile ? "#43a047" : "#fb8c00";

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
