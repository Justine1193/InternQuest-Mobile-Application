/**
 * HelpDeskDashboard - Admin dashboard for managing help desk files and resources
 * Allows admins to upload, view, and manage files for student support
 *
 * @component
 * @example
 * <HelpDeskDashboard />
 */

import React, { useState, useEffect } from "react";
import { db, auth, storage } from "../../../firebase";
import {
  collection,
  getDocs,
  addDoc,
  deleteDoc,
  doc,
} from "firebase/firestore";
import {
  ref as storageRef,
  uploadBytes,
  getDownloadURL,
  deleteObject,
} from "firebase/storage";
import {
  IoCloudUploadOutline,
  IoTrashOutline,
  IoDownloadOutline,
  IoEyeOutline,
  IoCloseOutline,
  IoDocumentTextOutline,
  IoImageOutline,
  IoDocumentOutline,
  IoSearchOutline,
  IoFilterOutline,
  IoStatsChartOutline,
  IoFolderOutline,
} from "react-icons/io5";
import { signOut } from "firebase/auth";
import { clearAdminSession } from "../../utils/auth";
import Navbar from "../Navbar/Navbar.jsx";
import LoadingSpinner from "../LoadingSpinner.jsx";
import { useNavigate } from "react-router-dom";
import { useToast } from "../../hooks/useToast";
import ToastContainer from "../Toast/ToastContainer";
import ConfirmModal from "../ConfirmModalComponents/ConfirmModal";
import EmptyState from "../EmptyState/EmptyState";
import "./HelpDeskDashboard.css";

const HelpDeskDashboard = () => {
  const navigate = useNavigate();
  const { toasts, success, error: showError, removeToast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [files, setFiles] = useState([]);
  const [error, setError] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadingTutorial, setUploadingTutorial] = useState(false);
  const [uploadingFileNeeded, setUploadingFileNeeded] = useState(false);
  const [previewFile, setPreviewFile] = useState(null);
  const [showPreview, setShowPreview] = useState(false);
  // Tutorial upload state
  const [selectedFileTutorial, setSelectedFileTutorial] = useState(null);
  const [fileDescriptionTutorial, setFileDescriptionTutorial] = useState("");
  // Requirement files upload state
  const [selectedFileNeeded, setSelectedFileNeeded] = useState(null);
  const [fileDescriptionNeeded, setFileDescriptionNeeded] = useState("");
  // Search and filter state
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");
  const [sortBy, setSortBy] = useState("date"); // date, name, size
  // Delete confirmation
  const [deleteConfirm, setDeleteConfirm] = useState({ open: false, fileId: null, fileName: "" });
  // Drag and drop state
  const [dragActiveTutorial, setDragActiveTutorial] = useState(false);
  const [dragActiveNeeded, setDragActiveNeeded] = useState(false);
  // Upload progress
  const [uploadProgress, setUploadProgress] = useState({ tutorial: 0, needed: 0 });

  useEffect(() => {
    document.title = "Help Desk | InternQuest Admin";
    fetchFiles();
  }, []);

  // Scroll to top when error occurs
  useEffect(() => {
    if (error) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [error]);

  // Fetch all help desk files from Firestore
  const fetchFiles = async () => {
    try {
      setIsLoading(true);
      const filesSnapshot = await getDocs(collection(db, "helpDeskFiles"));
      const filesData = filesSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      // Sort by upload date (newest first)
      filesData.sort((a, b) => new Date(b.uploadedAt) - new Date(a.uploadedAt));
      setFiles(filesData);
    } catch (err) {
      setError("Failed to fetch files. Please try again.");
      console.error("Error fetching files:", err);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle file selection for tutorial
  const handleFileSelectTutorial = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFileTutorial(file);
      setError(null);
    }
  };

  // Handle file selection for requirement files
  const handleFileSelectNeeded = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFileNeeded(file);
      setError(null);
    }
  };

  // Upload file to Firebase Storage and save metadata to Firestore
  const handleUpload = async (category) => {
    const selectedFile =
      category === "tutorial" ? selectedFileTutorial : selectedFileNeeded;
    const fileDescription =
      category === "tutorial" ? fileDescriptionTutorial : fileDescriptionNeeded;
    const setUploadingState =
      category === "tutorial" ? setUploadingTutorial : setUploadingFileNeeded;

    if (!selectedFile) {
      setError("Please select a file to upload");
      return;
    }

    // Check file size only for "fileNeeded" category (OJT How to Start has no limit)
    if (category === "fileNeeded") {
      const maxSize = 900 * 1024; // 900KB
      if (selectedFile.size > maxSize) {
        setError(
          `File is too large. Maximum size is ${(maxSize / 1024).toFixed(
            0
          )}KB. Your file is ${(selectedFile.size / 1024).toFixed(0)}KB.`
        );
        return;
      }
    }

    try {
      setUploadingState(true);
      setError(null);

      // Check if user is authenticated
      if (!auth.currentUser) {
        setError(
          "You must be logged in to upload files. Please log out and log back in."
        );
        setUploadingState(false);
        return;
      }

      // Debug: Log authentication status
      console.log("=== UPLOAD DEBUG START ===");
      console.log("Auth status:", {
        isAuthenticated: !!auth.currentUser,
        uid: auth.currentUser?.uid,
        email: auth.currentUser?.email,
        token: auth.currentUser?.accessToken ? "Has token" : "No token",
      });

      // Wait a moment for auth to be ready
      if (!auth.currentUser) {
        console.error("ERROR: User is not authenticated!");
        setError("User is not authenticated. Please log out and log back in.");
        setUploadingState(false);
        return;
      }

      // Get file extension from filename
      const fileExtension = selectedFile.name.split(".").pop() || "";

      // Ensure fileType is set (fallback to application/octet-stream if missing)
      const mimeType = selectedFile.type || "application/octet-stream";

      console.log("Uploading file to Firebase Storage...");
      console.log("File info:", {
        name: selectedFile.name,
        size: selectedFile.size,
        type: mimeType,
      });

      // Decide storage folder based on category
      const folder =
        category === "tutorial" ? "helpDesk/tutorial" : "helpDesk/requirement";

      // Create a unique storage path
      const timestamp = Date.now();
      const safeFileName = selectedFile.name.replace(/[^\w.\-]/g, "_");
      const path = `${folder}/${timestamp}-${safeFileName}`;

      // Upload to Storage
      console.log("Storage path:", path);
      console.log("Storage instance:", storage);
      console.log(
        "Storage bucket config:",
        storage._delegate?.bucket || "unknown"
      );

      const fileRef = storageRef(storage, path);
      console.log("File ref created:", fileRef);
      console.log("File ref full path:", fileRef.fullPath);
      console.log("File ref bucket:", fileRef.bucket);
      console.log("Attempting upload...");

      await uploadBytes(fileRef, selectedFile);
      console.log("Upload successful!");
      console.log("=== UPLOAD DEBUG END ===");

      // Get download URL from Storage
      const downloadUrl = await getDownloadURL(fileRef);

      console.log("Saving metadata to Firestore...");

      // Save file metadata (Storage-based only) to Firestore
      await addDoc(collection(db, "helpDeskFiles"), {
        fileName: selectedFile.name,
        // Storage-based fields
        downloadUrl,
        storagePath: path,
        description: fileDescription || "No description",
        category: category, // "tutorial" or "fileNeeded"
        uploadedAt: new Date().toISOString(),
        uploadedBy: auth.currentUser.uid,
        fileSize: selectedFile.size,
        fileType: mimeType,
        fileExtension: fileExtension.toLowerCase(),
      });

      console.log("File uploaded successfully!");

      // Reset form based on category
      if (category === "tutorial") {
        setSelectedFileTutorial(null);
        setFileDescriptionTutorial("");
        document.getElementById("file-input-tutorial").value = "";
      } else {
        setSelectedFileNeeded(null);
        setFileDescriptionNeeded("");
        document.getElementById("file-input-needed").value = "";
      }

      // Refresh file list
      await fetchFiles();
      success(`File "${selectedFile.name}" uploaded successfully!`);
    } catch (err) {
      console.error("Upload error:", err);
      console.error("Error code:", err.code);
      console.error("Error message:", err.message);
      console.error("Full error:", JSON.stringify(err, null, 2));
      const errorMsg = `Failed to upload file: ${err.message || "Unknown error"}`;
      setError(errorMsg);
      showError(errorMsg);
    } finally {
      setUploadingState(false);
      if (category === "tutorial") {
        setUploadProgress({ ...uploadProgress, tutorial: 0 });
      } else {
        setUploadProgress({ ...uploadProgress, needed: 0 });
      }
    }
  };

  // Delete file from Firestore (and Storage if applicable)
  const handleDeleteClick = (fileId, fileName) => {
    setDeleteConfirm({ open: true, fileId, fileName });
  };

  const handleDeleteConfirm = async () => {
    const { fileId } = deleteConfirm;
    if (!fileId) return;

    try {
      setIsLoading(true);
      setError(null);

      // Find file in local state to get its storagePath (if any)
      const fileToDelete = files.find((f) => f.id === fileId);

      // Attempt to delete from Storage first (if storagePath exists)
      if (fileToDelete && fileToDelete.storagePath) {
        try {
          const fileRef = storageRef(storage, fileToDelete.storagePath);
          await deleteObject(fileRef);
        } catch (storageErr) {
          console.warn(
            "Failed to delete file from Firebase Storage. Continuing to remove Firestore doc.",
            storageErr
          );
        }
      }

      // Delete metadata from Firestore
      await deleteDoc(doc(db, "helpDeskFiles", fileId));

      // Refresh file list
      await fetchFiles();
      success(`File "${fileToDelete?.fileName || 'File'}" deleted successfully`);
    } catch (err) {
      const errorMsg = `Failed to delete file: ${err.message}`;
      setError(errorMsg);
      showError(errorMsg);
      console.error("Delete error:", err);
    } finally {
      setIsLoading(false);
      setDeleteConfirm({ open: false, fileId: null, fileName: "" });
    }
  };

  const handleDeleteCancel = () => {
    setDeleteConfirm({ open: false, fileId: null, fileName: "" });
  };

  // Format file size
  const formatFileSize = (bytes) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
  };

  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Preview file
  const handlePreview = (file) => {
    setPreviewFile(file);
    setShowPreview(true);
  };

  // Close preview modal
  const handleClosePreview = () => {
    setShowPreview(false);
    setPreviewFile(null);
  };

  // Check if file type is previewable (images and PDFs)
  const isPreviewable = (fileType) => {
    if (!fileType) return false;
    return (
      fileType.startsWith("image/") ||
      fileType === "application/pdf" ||
      fileType === "application/x-pdf"
    );
  };

  // Get file type icon
  const getFileTypeIcon = (fileType, fileExtension) => {
    if (!fileType && !fileExtension) return IoDocumentOutline;
    
    const type = fileType?.toLowerCase() || "";
    const ext = fileExtension?.toLowerCase() || "";
    
    if (type.startsWith("image/") || ["jpg", "jpeg", "png", "gif", "webp", "svg"].includes(ext)) {
      return IoImageOutline;
    }
    if (type.includes("pdf") || ext === "pdf") {
      return IoDocumentTextOutline;
    }
    return IoDocumentOutline;
  };

  // Filter and sort files
  const getFilteredAndSortedFiles = () => {
    let filtered = [...files];

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (file) =>
          file.fileName?.toLowerCase().includes(query) ||
          file.description?.toLowerCase().includes(query)
      );
    }

    // Filter by category
    if (filterCategory !== "all") {
      filtered = filtered.filter((file) => file.category === filterCategory);
    }

    // Sort files
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "name":
          return (a.fileName || "").localeCompare(b.fileName || "");
        case "size":
          return (b.fileSize || 0) - (a.fileSize || 0);
        case "date":
        default:
          return new Date(b.uploadedAt || 0) - new Date(a.uploadedAt || 0);
      }
    });

    return filtered;
  };

  // Calculate statistics
  const getStatistics = () => {
    const tutorialFiles = files.filter((f) => f.category === "tutorial");
    const requirementFiles = files.filter((f) => f.category === "fileNeeded");
    const totalSize = files.reduce((sum, f) => sum + (f.fileSize || 0), 0);
    
    return {
      total: files.length,
      tutorial: tutorialFiles.length,
      requirement: requirementFiles.length,
      totalSize,
    };
  };

  // Drag and drop handlers
  const handleDrag = (e, category) => {
    e.preventDefault();
    e.stopPropagation();
    if (category === "tutorial") {
      setDragActiveTutorial(true);
    } else {
      setDragActiveNeeded(true);
    }
  };

  const handleDragLeave = (e, category) => {
    e.preventDefault();
    e.stopPropagation();
    if (category === "tutorial") {
      setDragActiveTutorial(false);
    } else {
      setDragActiveNeeded(false);
    }
  };

  const handleDrop = (e, category) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (category === "tutorial") {
      setDragActiveTutorial(false);
    } else {
      setDragActiveNeeded(false);
    }

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (category === "tutorial") {
        setSelectedFileTutorial(file);
      } else {
        setSelectedFileNeeded(file);
      }
      setError(null);
    }
  };

  // Get preview URL from Storage (preferred) or base64 (fallback)
  const getPreviewUrl = (file) => {
    if (file.downloadUrl) {
      return file.downloadUrl;
    }
    if (file.fileData) {
      return file.fileData;
    }
    if (file.base64String && file.fileType) {
      return `data:${file.fileType};base64,${file.base64String}`;
    }
    return null;
  };

  // Download file (prefers Storage URL, falls back to base64)
  const handleDownload = (file) => {
    try {
      // If Storage URL exists, use it directly
      if (file.downloadUrl) {
        const link = document.createElement("a");
        link.href = file.downloadUrl;
        link.download = file.fileName || "download";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        return;
      }

      // Fallback: use base64 data if available
      const fileData = file.fileData || file.base64String;
      if (!fileData) {
        throw new Error("No file data available to download.");
      }

      // Handle both data URL format and plain base64 string
      let base64String = fileData;
      if (base64String.includes(",")) {
        base64String = base64String.split(",")[1];
      }

      const byteCharacters = atob(base64String);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], {
        type: file.fileType || "application/octet-stream",
      });

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = file.fileName || "download";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      setError(`Failed to download file: ${err.message}`);
      console.error("Download error:", err);
    }
  };

  // Handle logout
  const handleLogout = async () => {
    try {
      await signOut(auth);
      clearAdminSession();
      navigate("/", { replace: true });
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const stats = getStatistics();
  const filteredFiles = getFilteredAndSortedFiles();

  return (
    <div className="dashboard-container">
      <LoadingSpinner
        isLoading={isLoading}
        message="Loading help desk files..."
      />
      <Navbar onLogout={handleLogout} />
      <ToastContainer toasts={toasts} removeToast={removeToast} />
      <ConfirmModal
        open={deleteConfirm.open}
        message={`Are you sure you want to delete "${deleteConfirm.fileName}"? This action cannot be undone.`}
        onConfirm={handleDeleteConfirm}
        onCancel={handleDeleteCancel}
        confirmButtonText="Yes, delete it!"
      />

      <div className="dashboard-content">
        <div className="helpdesk-section">
          <h1>Help Desk - Resource Management</h1>
          <p className="helpdesk-subtitle">
            Upload and manage files for student support and resources
          </p>

          {/* Statistics Overview */}
          <div className="helpdesk-stats">
            <div className="stat-card">
              <div className="stat-icon">
                <IoFolderOutline />
              </div>
              <div className="stat-content">
                <div className="stat-value">{stats.total}</div>
                <div className="stat-label">Total Files</div>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon tutorial">
                <IoDocumentTextOutline />
              </div>
              <div className="stat-content">
                <div className="stat-value">{stats.tutorial}</div>
                <div className="stat-label">OJT Guides</div>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon requirement">
                <IoDocumentOutline />
              </div>
              <div className="stat-content">
                <div className="stat-value">{stats.requirement}</div>
                <div className="stat-label">Requirements</div>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon size">
                <IoStatsChartOutline />
              </div>
              <div className="stat-content">
                <div className="stat-value">{formatFileSize(stats.totalSize)}</div>
                <div className="stat-label">Total Size</div>
              </div>
            </div>
          </div>

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

          {/* Upload Sections */}
          <div className="upload-sections-container">
            {/* OJT How to Start Upload Section */}
            <div className="upload-section">
              <h2>OJT How to Start</h2>
              <p className="section-note">
                Upload OJT files. You can upload multiple files.
              </p>

              <div 
                className={`upload-form ${dragActiveTutorial ? "drag-active" : ""}`}
                onDragEnter={(e) => handleDrag(e, "tutorial")}
                onDragLeave={(e) => handleDragLeave(e, "tutorial")}
                onDragOver={(e) => handleDrag(e, "tutorial")}
                onDrop={(e) => handleDrop(e, "tutorial")}
              >
                <div className="form-group">
                  <label htmlFor="file-input-tutorial">
                    Select File or Drag & Drop <span style={{ color: "red" }}>*</span>
                  </label>
                  <div className="file-input-wrapper">
                    <input
                      id="file-input-tutorial"
                      type="file"
                      onChange={handleFileSelectTutorial}
                      className="file-input"
                      disabled={uploadingTutorial}
                      accept="image/*,.pdf"
                    />
                    {dragActiveTutorial && (
                      <div className="drag-overlay">
                        <IoCloudUploadOutline className="drag-icon" />
                        <p>Drop file here</p>
                      </div>
                    )}
                  </div>
                  {selectedFileTutorial && (
                    <div className="file-info">
                      <strong>Selected:</strong> {selectedFileTutorial.name} (
                      {formatFileSize(selectedFileTutorial.size)})
                    </div>
                  )}
                  {uploadingTutorial && uploadProgress.tutorial > 0 && (
                    <div className="upload-progress">
                      <div 
                        className="upload-progress-bar" 
                        style={{ width: `${uploadProgress.tutorial}%` }}
                      ></div>
                      <span className="upload-progress-text">{uploadProgress.tutorial}%</span>
                    </div>
                  )}
                </div>

                <button
                  onClick={() => handleUpload("tutorial")}
                  disabled={!selectedFileTutorial || uploadingTutorial}
                  className="upload-btn"
                >
                  {uploadingTutorial ? (
                    <>
                      <span className="spinner"></span> Uploading...
                    </>
                  ) : (
                    <>
                      <IoCloudUploadOutline /> Upload File
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Requirement Files Upload Section */}
            <div className="upload-section">
              <h2>Upload Requirement Files</h2>
              <p className="section-note">
                Upload the requirement documents that students need to submit
                for their OJT. These files will appear in the mobile app under
                requirement files.
              </p>
              <div 
                className={`upload-form ${dragActiveNeeded ? "drag-active" : ""}`}
                onDragEnter={(e) => handleDrag(e, "needed")}
                onDragLeave={(e) => handleDragLeave(e, "needed")}
                onDragOver={(e) => handleDrag(e, "needed")}
                onDrop={(e) => handleDrop(e, "needed")}
              >
                <div className="form-group">
                  <label htmlFor="file-input-needed">
                    Select File or Drag & Drop <span style={{ color: "red" }}>*</span>
                  </label>
                  <div className="file-input-wrapper">
                    <input
                      id="file-input-needed"
                      type="file"
                      onChange={handleFileSelectNeeded}
                      className="file-input"
                      disabled={uploadingFileNeeded}
                    />
                    {dragActiveNeeded && (
                      <div className="drag-overlay">
                        <IoCloudUploadOutline className="drag-icon" />
                        <p>Drop file here</p>
                      </div>
                    )}
                  </div>
                  {selectedFileNeeded && (
                    <div className="file-info">
                      <strong>Selected:</strong> {selectedFileNeeded.name} (
                      {formatFileSize(selectedFileNeeded.size)})
                      {selectedFileNeeded.size > 900 * 1024 && (
                        <div style={{ color: "#c62828", marginTop: "0.5rem" }}>
                          ⚠️ File is too large. Maximum size is 900KB.
                        </div>
                      )}
                    </div>
                  )}
                  {uploadingFileNeeded && uploadProgress.needed > 0 && (
                    <div className="upload-progress">
                      <div 
                        className="upload-progress-bar" 
                        style={{ width: `${uploadProgress.needed}%` }}
                      ></div>
                      <span className="upload-progress-text">{uploadProgress.needed}%</span>
                    </div>
                  )}
                </div>

                <button
                  onClick={() => handleUpload("fileNeeded")}
                  disabled={!selectedFileNeeded || uploadingFileNeeded}
                  className="upload-btn"
                >
                  {uploadingFileNeeded ? (
                    <>
                      <span className="spinner"></span> Uploading...
                    </>
                  ) : (
                    <>
                      <IoCloudUploadOutline /> Upload File
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Files List Section */}
          <div className="files-section">
            <div className="files-section-header">
              <h2>Uploaded Files ({filteredFiles.length})</h2>
              
              {/* Search and Filter */}
              <div className="files-controls">
                <div className="search-box">
                  <IoSearchOutline className="search-icon" />
                  <input
                    type="text"
                    placeholder="Search files..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="search-input"
                  />
                </div>
                <div className="filter-controls">
                  <select
                    value={filterCategory}
                    onChange={(e) => setFilterCategory(e.target.value)}
                    className="filter-select"
                  >
                    <option value="all">All Categories</option>
                    <option value="tutorial">OJT Guides</option>
                    <option value="fileNeeded">Requirements</option>
                  </select>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="filter-select"
                  >
                    <option value="date">Sort by Date</option>
                    <option value="name">Sort by Name</option>
                    <option value="size">Sort by Size</option>
                  </select>
                </div>
              </div>
            </div>

            {filteredFiles.length === 0 ? (
              <EmptyState
                type="document"
                title={searchQuery || filterCategory !== "all" ? "No files found" : "No files uploaded yet"}
                message={
                  searchQuery || filterCategory !== "all"
                    ? "Try adjusting your search or filter criteria."
                    : "Upload your first file above to get started."
                }
              />
            ) : (
              <>
                {/* OJT How to Start */}
                {filteredFiles.filter((f) => f.category === "tutorial").length > 0 && (
                  <div className="files-category-section">
                    <h3 className="category-title">
                      OJT How to Start (
                      {filteredFiles.filter((f) => f.category === "tutorial").length})
                    </h3>
                    <div className="files-grid">
                      {filteredFiles
                        .filter((f) => f.category === "tutorial")
                        .map((file) => {
                          const FileIcon = getFileTypeIcon(file.fileType, file.fileExtension);
                          return (
                          <div key={file.id} className="file-card">
                            <div className="file-header">
                              <div className="file-title-wrapper">
                                <FileIcon className="file-type-icon" />
                                <h3>{file.fileName}</h3>
                              </div>
                              <button
                                onClick={() => handleDeleteClick(file.id, file.fileName)}
                                className="delete-btn"
                                aria-label="Delete file"
                                disabled={isLoading}
                              >
                                <IoTrashOutline />
                              </button>
                            </div>
                            <div className="file-category-badge tutorial-badge">
                              OJT Guide
                            </div>
                            <p className="file-description">
                              {file.description}
                            </p>
                            <div className="file-meta">
                              <span>Size: {formatFileSize(file.fileSize)}</span>
                              <span>
                                Uploaded: {formatDate(file.uploadedAt)}
                              </span>
                            </div>
                            <div className="file-actions">
                              {isPreviewable(file.fileType) && (
                                <button
                                  onClick={() => handlePreview(file)}
                                  className="preview-btn"
                                  style={{ border: "none", cursor: "pointer" }}
                                  title="Preview file"
                                >
                                  <IoEyeOutline /> Preview
                                </button>
                              )}
                              <button
                                onClick={() => handleDownload(file)}
                                className="download-btn"
                                style={{ border: "none", cursor: "pointer" }}
                              >
                                <IoDownloadOutline /> Download
                              </button>
                            </div>
                          </div>
                          );
                        })}
                    </div>
                  </div>
                )}

                {/* Requirement Files */}
                {filteredFiles.filter((f) => f.category === "fileNeeded").length >
                  0 && (
                  <div className="files-category-section">
                    <h3 className="category-title">
                      Requirement Files (
                      {filteredFiles.filter((f) => f.category === "fileNeeded").length})
                    </h3>
                    <div className="files-grid">
                      {filteredFiles
                        .filter((f) => f.category === "fileNeeded")
                        .map((file) => {
                          const FileIcon = getFileTypeIcon(file.fileType, file.fileExtension);
                          return (
                          <div key={file.id} className="file-card">
                            <div className="file-header">
                              <div className="file-title-wrapper">
                                <FileIcon className="file-type-icon" />
                                <h3>{file.fileName}</h3>
                              </div>
                              <button
                                onClick={() => handleDeleteClick(file.id, file.fileName)}
                                className="delete-btn"
                                aria-label="Delete file"
                                disabled={isLoading}
                              >
                                <IoTrashOutline />
                              </button>
                            </div>
                            <div className="file-category-badge needed-badge">
                              Requirement Files
                            </div>
                            <p className="file-description">
                              {file.description}
                            </p>
                            <div className="file-meta">
                              <span>Size: {formatFileSize(file.fileSize)}</span>
                              <span>
                                Uploaded: {formatDate(file.uploadedAt)}
                              </span>
                            </div>
                            <div className="file-actions">
                              {isPreviewable(file.fileType) && (
                                <button
                                  onClick={() => handlePreview(file)}
                                  className="preview-btn"
                                  style={{ border: "none", cursor: "pointer" }}
                                  title="Preview file"
                                >
                                  <IoEyeOutline /> Preview
                                </button>
                              )}
                              <button
                                onClick={() => handleDownload(file)}
                                className="download-btn"
                                style={{ border: "none", cursor: "pointer" }}
                              >
                                <IoDownloadOutline /> Download
                              </button>
                            </div>
                          </div>
                          );
                        })}
                    </div>
                  </div>
                )}

                {/* Files without category (for backward compatibility) */}
                {filteredFiles.filter(
                  (f) =>
                    !f.category ||
                    (f.category !== "tutorial" && f.category !== "fileNeeded")
                ).length > 0 && (
                  <div className="files-category-section">
                    <h3 className="category-title">
                      Other Files (
                      {
                        filteredFiles.filter(
                          (f) =>
                            !f.category ||
                            (f.category !== "tutorial" &&
                              f.category !== "fileNeeded")
                        ).length
                      }
                      )
                    </h3>
                    <div className="files-grid">
                      {filteredFiles
                        .filter(
                          (f) =>
                            !f.category ||
                            (f.category !== "tutorial" &&
                              f.category !== "fileNeeded")
                        )
                        .map((file) => {
                          const FileIcon = getFileTypeIcon(file.fileType, file.fileExtension);
                          return (
                          <div key={file.id} className="file-card">
                            <div className="file-header">
                              <div className="file-title-wrapper">
                                <FileIcon className="file-type-icon" />
                                <h3>{file.fileName}</h3>
                              </div>
                              <button
                                onClick={() => handleDeleteClick(file.id, file.fileName)}
                                className="delete-btn"
                                aria-label="Delete file"
                                disabled={isLoading}
                              >
                                <IoTrashOutline />
                              </button>
                            </div>
                            <p className="file-description">
                              {file.description}
                            </p>
                            <div className="file-meta">
                              <span>Size: {formatFileSize(file.fileSize)}</span>
                              <span>
                                Uploaded: {formatDate(file.uploadedAt)}
                              </span>
                            </div>
                            <div className="file-actions">
                              {isPreviewable(file.fileType) && (
                                <button
                                  onClick={() => handlePreview(file)}
                                  className="preview-btn"
                                  style={{ border: "none", cursor: "pointer" }}
                                  title="Preview file"
                                >
                                  Preview
                                </button>
                              )}
                              <button
                                onClick={() => handleDownload(file)}
                                className="download-btn"
                                style={{ border: "none", cursor: "pointer" }}
                              >
                                Download
                              </button>
                            </div>
                          </div>
                          );
                        })}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Preview Modal */}
      {showPreview && previewFile && (
        <div className="preview-modal-overlay" onClick={handleClosePreview}>
          <div
            className="preview-modal-content"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="preview-modal-header">
              <h2>{previewFile.fileName}</h2>
              <button
                onClick={handleClosePreview}
                className="preview-close-btn"
                aria-label="Close preview"
              >
                <IoCloseOutline />
              </button>
            </div>
            <div className="preview-modal-body">
              {previewFile.fileType?.startsWith("image/") ? (
                <img
                  src={getPreviewUrl(previewFile)}
                  alt={previewFile.fileName}
                  className="preview-image"
                />
              ) : previewFile.fileType === "application/pdf" ||
                previewFile.fileType === "application/x-pdf" ? (
                <iframe
                  src={getPreviewUrl(previewFile)}
                  title={previewFile.fileName}
                  className="preview-pdf"
                />
              ) : (
                <div className="preview-not-supported">
                  <p>Preview is not available for this file type.</p>
                  <p>Please download the file to view it.</p>
                </div>
              )}
            </div>
            <div className="preview-modal-footer">
              <button
                onClick={() => handleDownload(previewFile)}
                className="download-btn"
              >
                <IoDownloadOutline /> Download
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HelpDeskDashboard;
