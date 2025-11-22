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
import { db } from "../../../firebase.js";
import { doc, getDoc, collection, getDocs } from "firebase/firestore";
import "./StudentRequirementModal.css";

const StudentRequirementModal = ({ open, student, onClose }) => {
  const [requirements, setRequirements] = useState([]);
  const [isLoadingRequirements, setIsLoadingRequirements] = useState(false);
  const [fetchError, setFetchError] = useState(null);
  const [viewingFile, setViewingFile] = useState(null);
  const [viewingFileName, setViewingFileName] = useState("");
  const [downloadingFile, setDownloadingFile] = useState(null);

  // Fetch requirements from Firestore when modal opens
  useEffect(() => {
    const fetchRequirements = async () => {
      if (!open || !student || !student.id) {
        setRequirements([]);
        return;
      }

      setIsLoadingRequirements(true);
      setFetchError(null);
      try {
        // Try to fetch from user document first (more reliable, avoids Listen channel)
        const userDocRef = doc(db, "users", student.id);
        const userDocSnap = await getDoc(userDocRef);

        if (userDocSnap.exists()) {
          const userData = userDocSnap.data();
          console.log("User data from Firestore:", userData);
          console.log("Requirements field:", userData.requirements);

          // Check if requirements array exists in user document
          if (userData.requirements && Array.isArray(userData.requirements)) {
            console.log("Requirements is an array:", userData.requirements);
            setRequirements(userData.requirements);
          } else if (
            userData.requirements &&
            typeof userData.requirements === "object"
          ) {
            // If requirements is an object, convert to array
            const requirementsArray = Object.values(userData.requirements);
            console.log(
              "Requirements is an object, converted to array:",
              requirementsArray
            );
            setRequirements(requirementsArray);
          } else {
            // If no requirements in document, try subcollection as fallback
            try {
              const requirementsCollectionRef = collection(
                db,
                "users",
                student.id,
                "requirements"
              );
              const requirementsSnapshot = await getDocs(
                requirementsCollectionRef
              );

              if (!requirementsSnapshot.empty) {
                const requirementsData = requirementsSnapshot.docs.map(
                  (doc) => ({
                    id: doc.id,
                    ...doc.data(),
                  })
                );
                console.log(
                  "Found requirements in subcollection:",
                  requirementsData
                );
                setRequirements(requirementsData);
              } else {
                console.log("No requirements found");
                setRequirements([]);
              }
            } catch (subcollectionError) {
              console.log("Subcollection fetch failed, no requirements found");
              setRequirements([]);
            }
          }
        } else {
          console.log("User document does not exist");
          setRequirements([]);
        }
      } catch (error) {
        console.error("Error fetching requirements:", error);

        // Check if it's a blocked request error
        const errorMessage = error.message || error.toString();
        if (
          errorMessage.includes("ERR_BLOCKED_BY_CLIENT") ||
          errorMessage.includes("blocked") ||
          errorMessage.includes("network")
        ) {
          setFetchError(
            "Firestore request was blocked. Please disable ad blockers or privacy extensions and try again."
          );
        } else {
          // If subcollection doesn't exist, try user document
          try {
            const userDocRef = doc(db, "users", student.id);
            const userDocSnap = await getDoc(userDocRef);

            if (userDocSnap.exists()) {
              const userData = userDocSnap.data();
              if (userData.requirements) {
                if (Array.isArray(userData.requirements)) {
                  setRequirements(userData.requirements);
                } else if (typeof userData.requirements === "object") {
                  setRequirements(Object.values(userData.requirements));
                }
              } else {
                setFetchError(null); // No error, just no requirements
              }
            } else {
              setFetchError(null); // No error, document doesn't exist
            }
          } catch (fallbackError) {
            console.error("Error in fallback fetch:", fallbackError);
            const fallbackMessage =
              fallbackError.message || fallbackError.toString();
            if (
              fallbackMessage.includes("ERR_BLOCKED_BY_CLIENT") ||
              fallbackMessage.includes("blocked")
            ) {
              setFetchError(
                "Firestore request was blocked. Please disable ad blockers or privacy extensions and try again."
              );
            } else {
              setFetchError(
                `Failed to fetch requirements: ${
                  fallbackError.message || "Unknown error"
                }`
              );
            }
            setRequirements([]);
          }
        }
      } finally {
        setIsLoadingRequirements(false);
      }
    };

    fetchRequirements();
  }, [open, student]);

  if (!open || !student) return null;

  // Helper function to format status
  const formatStatus = (status) => {
    if (!status) return "Not Submitted";
    const statusLower = status.toLowerCase();
    if (
      statusLower === "completed" ||
      statusLower === "submitted" ||
      statusLower === "yes"
    ) {
      return "Submitted";
    }
    if (statusLower === "pending" || statusLower === "in progress") {
      return "Pending";
    }
    if (
      statusLower === "not submitted" ||
      statusLower === "no" ||
      statusLower === "missing"
    ) {
      return "Not Submitted";
    }
    return status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();
  };

  // Helper function to get status color
  const getStatusColor = (status) => {
    const statusLower = status?.toLowerCase() || "";
    if (
      statusLower === "completed" ||
      statusLower === "submitted" ||
      statusLower === "yes"
    ) {
      return "#43a047"; // Green
    }
    if (statusLower === "pending" || statusLower === "in progress") {
      return "#fb8c00"; // Orange
    }
    return "#f44336"; // Red
  };

  // Helper function to format date
  const formatDate = (dateValue) => {
    if (!dateValue) return "N/A";
    try {
      // If it's a Firestore Timestamp
      if (dateValue.toDate) {
        return dateValue.toDate().toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
        });
      }
      // If it's a string or Date
      const date = new Date(dateValue);
      return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    } catch (error) {
      return dateValue.toString();
    }
  };

  // Helper function to get uploaded files
  const getUploadedFiles = (requirement) => {
    if (!requirement) {
      console.log("No requirement provided to getUploadedFiles");
      return [];
    }

    console.log("Getting uploaded files for requirement:", requirement);
    console.log("uploadedFiles field:", requirement.uploadedFiles);

    // Check if uploadedFiles is an array
    if (Array.isArray(requirement.uploadedFiles)) {
      console.log("uploadedFiles is an array:", requirement.uploadedFiles);
      return requirement.uploadedFiles;
    }

    // Check if uploadedFiles is an object
    if (
      requirement.uploadedFiles &&
      typeof requirement.uploadedFiles === "object"
    ) {
      const filesArray = Object.values(requirement.uploadedFiles);
      console.log(
        "uploadedFiles is an object, converted to array:",
        filesArray
      );
      return filesArray;
    }

    // Check for direct file URL fields (some structures might have files directly)
    if (requirement.fileUrl || requirement.file || requirement.documentUrl) {
      console.log("Found direct file URL fields");
      return [
        requirement.fileUrl || requirement.file || requirement.documentUrl,
      ];
    }

    console.log("No uploaded files found");
    return [];
  };

  // Helper function to get file type
  const getFileType = (url) => {
    if (!url) return "unknown";
    const urlLower = url.toLowerCase();

    // Check for data URLs first (data:application/pdf;base64,... or data:image/png;base64,...)
    if (urlLower.startsWith("data:")) {
      if (urlLower.includes("application/pdf") || urlLower.includes("pdf")) {
        return "pdf";
      }
      if (
        urlLower.includes("image/jpeg") ||
        urlLower.includes("image/jpg") ||
        urlLower.includes("image/png") ||
        urlLower.includes("image/gif") ||
        urlLower.includes("image/webp")
      ) {
        return "image";
      }
    }

    // Check file extensions and MIME types
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

    const downloadId = `${fileUrl}-${fileName}`;
    setDownloadingFile(downloadId);

    try {
      // Handle data URLs (base64 encoded files)
      if (fileUrl.startsWith("data:")) {
        const link = document.createElement("a");
        link.href = fileUrl;
        link.download = fileName || "download";
        link.style.display = "none";
        document.body.appendChild(link);
        link.click();
        setTimeout(() => {
          document.body.removeChild(link);
          setDownloadingFile(null);
        }, 100);
        return;
      }

      // Try to fetch the file with CORS handling
      let blob;
      try {
        const response = await fetch(fileUrl, {
          method: "GET",
          mode: "cors",
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        blob = await response.blob();
      } catch (fetchError) {
        // If fetch fails (CORS issue), try direct download
        console.log("Fetch failed, trying direct download:", fetchError);
        const link = document.createElement("a");
        link.href = fileUrl;
        link.download = fileName || "download";
        link.target = "_blank";
        link.rel = "noopener noreferrer";
        link.style.display = "none";
        document.body.appendChild(link);
        link.click();
        setTimeout(() => {
          document.body.removeChild(link);
          setDownloadingFile(null);
        }, 100);
        return;
      }

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
        setDownloadingFile(null);
      }, 100);
    } catch (error) {
      console.error("Download error:", error);
      setDownloadingFile(null);
      // Final fallback: open in new tab if download fails
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
          <h2>Student Requirements & Documents</h2>
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
            <h3>
              {student.firstName} {student.lastName}
            </h3>
            <p className="student-email">{student.email || "N/A"}</p>
          </div>

          {isLoadingRequirements ? (
            <div className="loading-requirements">
              <p>Loading requirements...</p>
            </div>
          ) : fetchError ? (
            <div className="error-requirements">
              <p style={{ color: "#f44336", marginBottom: "8px" }}>
                ⚠️ {fetchError}
              </p>
              <button
                onClick={async () => {
                  setFetchError(null);
                  setIsLoadingRequirements(true);
                  try {
                    const userDocRef = doc(db, "users", student.id);
                    const userDocSnap = await getDoc(userDocRef);
                    if (userDocSnap.exists()) {
                      const userData = userDocSnap.data();
                      if (userData.requirements) {
                        if (Array.isArray(userData.requirements)) {
                          setRequirements(userData.requirements);
                        } else if (typeof userData.requirements === "object") {
                          setRequirements(Object.values(userData.requirements));
                        }
                      }
                    }
                  } catch (error) {
                    setFetchError(`Retry failed: ${error.message}`);
                  } finally {
                    setIsLoadingRequirements(false);
                  }
                }}
                style={{
                  padding: "8px 16px",
                  background: "#1976d2",
                  color: "#fff",
                  border: "none",
                  borderRadius: "4px",
                  cursor: "pointer",
                  fontSize: "0.9rem",
                }}
              >
                Retry
              </button>
            </div>
          ) : requirements.length > 0 ? (
            <div className="requirement-section">
              <h3>Required Documents</h3>
              <div className="document-list">
                {requirements.map((requirement, index) => {
                  const uploadedFiles = getUploadedFiles(requirement);
                  const status = formatStatus(requirement.status);
                  const statusColor = getStatusColor(requirement.status);

                  return (
                    <div
                      key={requirement.id || index}
                      className="document-item"
                    >
                      <div className="document-info">
                        <div className="document-header">
                          <span className="document-name">
                            {requirement.title || "Untitled Requirement"}
                          </span>
                          <span
                            className="document-status"
                            style={{ color: statusColor }}
                          >
                            {status}
                          </span>
                        </div>
                        {requirement.description && (
                          <p className="document-description">
                            {requirement.description}
                          </p>
                        )}
                        <div className="document-meta">
                          {requirement.dueDate && (
                            <span className="document-due-date">
                              Due: {formatDate(requirement.dueDate)}
                            </span>
                          )}
                        </div>
                      </div>
                      {uploadedFiles.length > 0 ? (
                        <div className="document-files">
                          {uploadedFiles.map((file, fileIndex) => {
                            // Handle different file formats - extract URL
                            let fileUrl = null;
                            let fileName = `File ${fileIndex + 1}`;

                            console.log(`Processing file ${fileIndex}:`, file);

                            if (typeof file === "string") {
                              fileUrl = file;
                              // Try to extract filename from URL
                              try {
                                const urlParts = file.split("/");
                                fileName =
                                  urlParts[urlParts.length - 1] ||
                                  `File ${fileIndex + 1}`;
                              } catch (e) {
                                fileName = `File ${fileIndex + 1}`;
                              }
                            } else if (file && typeof file === "object") {
                              // Prioritize downloadUrl (camelCase) as shown in the data structure
                              // Also handle data URLs (data:application/pdf;base64,...)
                              fileUrl =
                                file.downloadUrl ||
                                file.downloadURL ||
                                file.url ||
                                file.fileUrl ||
                                file.fileURL ||
                                file.link ||
                                file.src ||
                                file.path ||
                                file.uri ||
                                file.downloadUri;

                              // Extract file name - prioritize name property from uploadedFiles
                              fileName =
                                file.name ||
                                file.fileName ||
                                file.originalName ||
                                file.filename ||
                                file.displayName ||
                                (fileUrl
                                  ? fileUrl.includes("data:")
                                    ? `File ${fileIndex + 1}`
                                    : fileUrl.split("/").pop() ||
                                      fileUrl.split("?")[0].split("/").pop() ||
                                      `File ${fileIndex + 1}`
                                  : `File ${fileIndex + 1}`);
                            }

                            console.log(
                              `File ${fileIndex} - URL: ${fileUrl}, Name: ${fileName}`
                            );

                            return fileUrl ? (
                              <div
                                key={fileIndex}
                                className="document-file-item"
                              >
                                <span
                                  onClick={(e) =>
                                    handleFileClick(e, fileUrl, fileName)
                                  }
                                  className="document-file-name document-file-name-clickable"
                                  title={`Click to view ${fileName}`}
                                >
                                  {fileName}
                                </span>
                              </div>
                            ) : (
                              <div
                                key={fileIndex}
                                className="document-link-error"
                                style={{
                                  color: "#f44336",
                                  fontSize: "0.85rem",
                                }}
                              >
                                ⚠️ File {fileIndex + 1} - Invalid URL
                              </div>
                            );
                          })}
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
            </div>
          ) : (
            <div className="no-requirements">
              <p>No requirements found for this student.</p>
            </div>
          )}
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
                  disabled={
                    downloadingFile === `${viewingFile}-${viewingFileName}`
                  }
                >
                  {downloadingFile === `${viewingFile}-${viewingFileName}` ? (
                    <>Downloading...</>
                  ) : (
                    <>Download</>
                  )}
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
                      Download Image
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
                    Download File
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
