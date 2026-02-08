/**
 * ResourceManagementDashboard - Admin dashboard for managing resource files
 * Allows admins to upload, view, and manage files for student support
 *
 * @component
 * @example
 * <ResourceManagementDashboard />
 */

import React, { useState, useEffect } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import { db, auth, storage } from "../../../firebase";

// Configure PDF.js worker for react-pdf
if (typeof window !== "undefined") {
  pdfjs.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.js";
}

import {
  collection,
  getDocs,
  addDoc,
  deleteDoc,
  doc,
  getDoc,
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
import "./ResourceManagementDashboard.css";
import { getAdminCollegeCode } from "../../utils/auth";

const ResourceManagementDashboard = () => {
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
  // Checklist upload state
  const [selectedChecklistFile, setSelectedChecklistFile] = useState(null);
  const [selectedRequirementType, setSelectedRequirementType] = useState("");
  const [uploadingChecklist, setUploadingChecklist] = useState(false);
  const [checklistSignatureX, setChecklistSignatureX] = useState(100);
  const [checklistSignatureY, setChecklistSignatureY] = useState(100);
  const [checklistSignatureWidth, setChecklistSignatureWidth] = useState(150);
  const [checklistSignatureHeight, setChecklistSignatureHeight] = useState(50);
  // PDF preview and signature drag state
  const [checklistPreviewUrl, setChecklistPreviewUrl] = useState(null);
  const [currentSignature, setCurrentSignature] = useState(null);
  const [previewPageWidth, setPreviewPageWidth] = useState(null);
  const [previewPageHeight, setPreviewPageHeight] = useState(null);
  const [pdfScale, setPdfScale] = useState(1.5);
  const [draggingSignature, setDraggingSignature] = useState(false);
  // Search and filter state
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");
  const [sortBy, setSortBy] = useState("date"); // date, name, size
  // Delete confirmation
  const [deleteConfirm, setDeleteConfirm] = useState({
    open: false,
    fileId: null,
    fileName: "",
  });
  // Drag and drop state
  const [dragActiveTutorial, setDragActiveTutorial] = useState(false);
  const [dragActiveNeeded, setDragActiveNeeded] = useState(false);
  // Upload progress
  const [uploadProgress, setUploadProgress] = useState({
    tutorial: 0,
    needed: 0,
  });

  const adminCollegeCode = getAdminCollegeCode();

  useEffect(() => {
    document.title = "Resource Management | InternQuest Admin";
    fetchFiles();
    fetchCurrentSignature();
  }, []);

  // Fetch current user's signature for preview
  const fetchCurrentSignature = async () => {
    if (!auth.currentUser) return;
    
    try {
      const signatureRef = doc(db, "teacher_signatures", auth.currentUser.uid);
      const signatureSnap = await getDoc(signatureRef);
      
      if (signatureSnap.exists()) {
        const data = signatureSnap.data();
        setCurrentSignature({
          downloadUrl: data.downloadUrl,
          uploadedAt: data.uploadedAt,
        });
      }
    } catch (err) {
      console.error("Error fetching signature:", err);
    }
  };

  // Scroll to top when error occurs
  useEffect(() => {
    if (error) {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [error]);

  // Fetch all help desk files from Firestore
  const fetchFiles = async () => {
    try {
      setIsLoading(true);
      const filesSnapshot = await getDocs(collection(db, "helpDeskFiles"));
      let filesData = filesSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      // For student/college usage we could filter by uploaderCollegeCode here if needed

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

  // Handle checklist file selection
  const handleChecklistFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.type !== "application/pdf") {
        setError("Please select a PDF file for checklist template");
        return;
      }
      setSelectedChecklistFile(file);
      setError(null);
      
      // Create preview URL
      const previewUrl = URL.createObjectURL(file);
      setChecklistPreviewUrl(previewUrl);
    } else {
      // Clean up preview URL if file is deselected
      if (checklistPreviewUrl) {
        URL.revokeObjectURL(checklistPreviewUrl);
        setChecklistPreviewUrl(null);
      }
    }
  };

  // Handle signature drag start
  const handleSignatureDragStart = (e) => {
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", "signature");
    setDraggingSignature(true);
  };

  // Handle PDF drop
  const handlePdfDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    const isSignatureDrag = e.dataTransfer.getData("text/plain") === "signature";
    if (!isSignatureDrag || !previewPageWidth || !previewPageHeight) {
      setDraggingSignature(false);
      return;
    }

    // Find the PDF container
    const pdfContainer = e.currentTarget.querySelector('[style*="position: relative"]');
    if (!pdfContainer) {
      setDraggingSignature(false);
      return;
    }

    const containerRect = pdfContainer.getBoundingClientRect();
    const scale = pdfScale;
    
    // Calculate drop position relative to PDF container
    const dropX = e.clientX - containerRect.left;
    const dropY = e.clientY - containerRect.top;

    // Convert CSS coordinates to PDF coordinates
    // PDF uses bottom-left origin, CSS uses top-left
    const pdfX = Math.max(0, dropX / scale);
    const pdfY = Math.max(0, (previewPageHeight * scale - dropY) / scale);

    // Update signature position
    setChecklistSignatureX(Math.round(pdfX));
    setChecklistSignatureY(Math.round(pdfY));

    setDraggingSignature(false);
    
    // Reset canvas styling
    e.currentTarget.style.backgroundColor = "#f6f8fa";
    e.currentTarget.style.borderColor = "#e1e4e8";
  };

  // Handle drag over PDF canvas
  const handlePdfDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (draggingSignature) {
      e.dataTransfer.dropEffect = "move";
    }
  };

  // Handle drag enter PDF canvas
  const handlePdfDragEnter = (e) => {
    e.preventDefault();
    if (draggingSignature) {
      e.currentTarget.style.backgroundColor = "#e7f3ff";
      e.currentTarget.style.borderColor = "#007bff";
    }
  };

  // Handle drag leave PDF canvas
  const handlePdfDragLeave = (e) => {
    e.preventDefault();
    if (!e.currentTarget.contains(e.relatedTarget)) {
      e.currentTarget.style.backgroundColor = "#f6f8fa";
      e.currentTarget.style.borderColor = "#e1e4e8";
    }
  };

  // Handle checklist upload
  const handleChecklistUpload = async () => {
    if (!selectedChecklistFile || !selectedRequirementType) {
      setError("Please select a PDF file and requirement type");
      return;
    }

    if (!auth.currentUser) {
      setError("You must be logged in to upload files.");
      return;
    }

    try {
      setUploadingChecklist(true);
      setError(null);

      // Create storage path
      const timestamp = Date.now();
      const safeFileName = selectedChecklistFile.name.replace(/[^\w.\-]/g, "_");
      const storagePath = `checklist_templates/${timestamp}-${safeFileName}`;
      const fileRef = storageRef(storage, storagePath);

      // Upload to Storage
      await uploadBytes(fileRef, selectedChecklistFile);

      // Get download URL
      const downloadUrl = await getDownloadURL(fileRef);

      // Save metadata to Firestore
      await addDoc(collection(db, "checklist_templates"), {
        fileName: selectedChecklistFile.name,
        downloadUrl,
        storagePath,
        requirementType: selectedRequirementType,
        signaturePosition: {
          x: parseInt(checklistSignatureX) || 100,
          y: parseInt(checklistSignatureY) || 100,
          width: parseInt(checklistSignatureWidth) || 150,
          height: parseInt(checklistSignatureHeight) || 50,
        },
        active: true,
        uploadedAt: new Date().toISOString(),
        uploadedBy: auth.currentUser.uid,
        uploaderCollegeCode: adminCollegeCode || null,
        fileSize: selectedChecklistFile.size,
      });

      // Reset form
      setSelectedChecklistFile(null);
      setSelectedRequirementType("");
      setChecklistSignatureX(100);
      setChecklistSignatureY(100);
      setChecklistSignatureWidth(150);
      setChecklistSignatureHeight(50);
      document.getElementById("checklist-file-input").value = "";

      success(
        `Checklist template for "${selectedRequirementType}" uploaded successfully!`
      );
    } catch (err) {
      console.error("Checklist upload error:", err);
      const errorMsg = `Failed to upload checklist: ${
        err.message || "Unknown error"
      }`;
      setError(errorMsg);
      showError(errorMsg);
    } finally {
      setUploadingChecklist(false);
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

      // Decide storage folder based on category
      const folder =
        category === "tutorial" ? "helpDesk/tutorial" : "helpDesk/requirement";

      // Create a unique storage path
      const timestamp = Date.now();
      const safeFileName = selectedFile.name.replace(/[^\w.\-]/g, "_");
      const path = `${folder}/${timestamp}-${safeFileName}`;

      const fileRef = storageRef(storage, path);
      await uploadBytes(fileRef, selectedFile);

      // Get download URL from Storage
      const downloadUrl = await getDownloadURL(fileRef);

      // Determine uploader college code if available
      let uploaderCollegeCode = null;
      try {
        const codeFromSession = getAdminCollegeCode();
        if (codeFromSession && typeof codeFromSession === "string") {
          uploaderCollegeCode = codeFromSession;
        }
      } catch (e) {
        // Could not determine uploader college code
      }

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
        uploaderCollegeCode: uploaderCollegeCode || null,
        fileSize: selectedFile.size,
        fileType: mimeType,
        fileExtension: fileExtension.toLowerCase(),
      });

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
      const errorMsg = `Failed to upload file: ${
        err.message || "Unknown error"
      }`;
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
          // Continue to remove Firestore doc
        }
      }

      // Delete metadata from Firestore
      await deleteDoc(doc(db, "helpDeskFiles", fileId));

      // Refresh file list
      await fetchFiles();
      success(
        `File "${fileToDelete?.fileName || "File"}" deleted successfully`
      );
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

    if (
      type.startsWith("image/") ||
      ["jpg", "jpeg", "png", "gif", "webp", "svg"].includes(ext)
    ) {
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
        message="Loading resource files..."
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
        <div className="resource-management-section">
          <h1>Resource Management</h1>
          <p className="resource-management-subtitle">
            Upload and manage files for student support and resources
          </p>

          {/* Statistics Overview */}
          <div className="resource-management-stats">
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
                <div className="stat-value">
                  {formatFileSize(stats.totalSize)}
                </div>
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
                className={`upload-form ${
                  dragActiveTutorial ? "drag-active" : ""
                }`}
                onDragEnter={(e) => handleDrag(e, "tutorial")}
                onDragLeave={(e) => handleDragLeave(e, "tutorial")}
                onDragOver={(e) => handleDrag(e, "tutorial")}
                onDrop={(e) => handleDrop(e, "tutorial")}
              >
                <div className="form-group">
                  <label htmlFor="file-input-tutorial">
                    Select File or Drag & Drop{" "}
                    <span style={{ color: "red" }}>*</span>
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
                      <span className="upload-progress-text">
                        {uploadProgress.tutorial}%
                      </span>
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
                className={`upload-form ${
                  dragActiveNeeded ? "drag-active" : ""
                }`}
                onDragEnter={(e) => handleDrag(e, "needed")}
                onDragLeave={(e) => handleDragLeave(e, "needed")}
                onDragOver={(e) => handleDrag(e, "needed")}
                onDrop={(e) => handleDrop(e, "needed")}
              >
                <div className="form-group">
                  <label htmlFor="file-input-needed">
                    Select File or Drag & Drop{" "}
                    <span style={{ color: "red" }}>*</span>
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
                      <span className="upload-progress-text">
                        {uploadProgress.needed}%
                      </span>
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

            {/* Checklist Template Upload Section */}
            <div className="upload-section">
              <h2>Upload Checklist Template</h2>
              <p className="section-note">
                Upload PDF checklist templates that will be automatically signed
                when teachers approve student requirements. Only admin and
                coordinators can upload checklist templates.
              </p>
              <div className="upload-form">
                <div className="form-group">
                  <label htmlFor="checklist-requirement-type">
                    Requirement Type <span style={{ color: "red" }}>*</span>
                  </label>
                  <select
                    id="checklist-requirement-type"
                    value={selectedRequirementType}
                    onChange={(e) => setSelectedRequirementType(e.target.value)}
                    className="form-select"
                    disabled={uploadingChecklist}
                    style={{
                      padding: "0.75rem",
                      fontSize: "1rem",
                      borderRadius: "4px",
                      border: "1px solid #ccc",
                    }}
                  >
                    <option value="">Select requirement type...</option>
                    <option value="Proof of Enrollment (COM)">
                      Proof of Enrollment (COM)
                    </option>
                    <option value="Notarized Parental Consent">
                      Notarized Parental Consent
                    </option>
                    <option value="Medical Certificate">
                      Medical Certificate
                    </option>
                    <option value="Psychological Test Certification">
                      Psychological Test Certification
                    </option>
                    <option value="Proof of Insurance">
                      Proof of Insurance
                    </option>
                    <option value="OJT Orientation">OJT Orientation</option>
                    <option value="Memorandum of Agreement (MOA)">
                      Memorandum of Agreement (MOA)
                    </option>
                    <option value="Curriculum Vitae">Curriculum Vitae</option>
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="checklist-file-input">
                    Select PDF File <span style={{ color: "red" }}>*</span>
                  </label>
                  <div className="file-input-wrapper">
                    <input
                      id="checklist-file-input"
                      type="file"
                      accept="application/pdf"
                      onChange={handleChecklistFileSelect}
                      className="file-input"
                      disabled={uploadingChecklist}
                    />
                  </div>
                  {selectedChecklistFile && (
                    <div className="file-info">
                      <strong>Selected:</strong> {selectedChecklistFile.name} (
                      {formatFileSize(selectedChecklistFile.size)})
                    </div>
                  )}
                </div>

                {/* Signature Preview and PDF Preview */}
                {checklistPreviewUrl && (
                  <div style={{ 
                    display: "grid", 
                    gridTemplateColumns: "250px 1fr", 
                    gap: "1.5rem",
                    marginTop: "1.5rem"
                  }}>
                    {/* Signature Preview */}
                    <div style={{
                      backgroundColor: "#f8f9fa",
                      border: "1px solid #e1e4e8",
                      borderRadius: "8px",
                      padding: "1rem",
                    }}>
                      <h3 style={{ fontSize: "0.95rem", fontWeight: 600, marginBottom: "0.75rem" }}>
                        Your Signature
                      </h3>
                      {currentSignature ? (
                        <div
                          draggable
                          onDragStart={handleSignatureDragStart}
                          style={{
                            border: "2px dashed #007bff",
                            borderRadius: "8px",
                            padding: "1rem",
                            textAlign: "center",
                            cursor: "grab",
                            backgroundColor: "#ffffff",
                            transition: "all 0.2s ease",
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = "#e7f3ff";
                            e.currentTarget.style.borderColor = "#0056b3";
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = "#ffffff";
                            e.currentTarget.style.borderColor = "#007bff";
                          }}
                          title="Drag signature to PDF"
                        >
                          <img
                            src={currentSignature.downloadUrl}
                            alt="Your signature"
                            style={{
                              maxWidth: "100%",
                              maxHeight: "150px",
                              objectFit: "contain",
                              pointerEvents: "none",
                            }}
                          />
                          <p style={{ fontSize: "0.75rem", color: "#666", marginTop: "0.5rem", margin: 0 }}>
                            Drag to position on PDF
                          </p>
                        </div>
                      ) : (
                        <div style={{
                          border: "2px dashed #ccc",
                          borderRadius: "8px",
                          padding: "1rem",
                          textAlign: "center",
                          color: "#999",
                          fontSize: "0.85rem",
                        }}>
                          No signature uploaded
                          <br />
                          <span style={{ fontSize: "0.75rem" }}>
                            Upload signature in Settings
                          </span>
                        </div>
                      )}
                    </div>

                    {/* PDF Preview */}
                    <div style={{
                      backgroundColor: "#f6f8fa",
                      border: "1px solid #e1e4e8",
                      borderRadius: "8px",
                      padding: "1rem",
                      position: "relative",
                      overflow: "auto",
                    }}>
                      <h3 style={{ fontSize: "0.95rem", fontWeight: 600, marginBottom: "0.75rem" }}>
                        PDF Preview - Drag signature here to position
                      </h3>
                      <Document
                        file={checklistPreviewUrl}
                        onLoadSuccess={() => {}}
                        loading={<div>Loading PDF...</div>}
                      >
                        <Page
                          pageNumber={1}
                          scale={pdfScale}
                          onLoadSuccess={(page) => {
                            setPreviewPageWidth(page.width);
                            setPreviewPageHeight(page.height);
                          }}
                          renderTextLayer={false}
                          renderAnnotationLayer={false}
                        >
                          <div
                            style={{
                              position: "relative",
                              display: "inline-block",
                              border: "2px solid #007bff",
                              borderRadius: "4px",
                              backgroundColor: "#ffffff",
                            }}
                            onDrop={handlePdfDrop}
                            onDragOver={handlePdfDragOver}
                            onDragEnter={handlePdfDragEnter}
                            onDragLeave={handlePdfDragLeave}
                          >
                            {/* Show signature position indicator */}
                            {previewPageWidth && previewPageHeight && (
                              <div
                                style={{
                                  position: "absolute",
                                  left: `${checklistSignatureX * pdfScale}px`,
                                  top: `${(previewPageHeight - checklistSignatureY - checklistSignatureHeight) * pdfScale}px`,
                                  width: `${checklistSignatureWidth * pdfScale}px`,
                                  height: `${checklistSignatureHeight * pdfScale}px`,
                                  border: "2px dashed #007bff",
                                  backgroundColor: "rgba(0, 123, 255, 0.1)",
                                  borderRadius: "4px",
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  pointerEvents: "none",
                                }}
                              >
                                {currentSignature && (
                                  <img
                                    src={currentSignature.downloadUrl}
                                    alt="Signature position"
                                    style={{
                                      width: "100%",
                                      height: "100%",
                                      objectFit: "contain",
                                    }}
                                  />
                                )}
                                {!currentSignature && (
                                  <span style={{ fontSize: "0.75rem", color: "#007bff" }}>
                                    Signature Position
                                  </span>
                                )}
                              </div>
                            )}
                          </div>
                        </Page>
                      </Document>
                    </div>
                  </div>
                )}

                <div className="form-group">
                  <label>Signature Position (PDF coordinates)</label>
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "repeat(2, 1fr)",
                      gap: "1rem",
                      marginTop: "0.5rem",
                    }}
                  >
                    <div>
                      <label
                        style={{
                          display: "block",
                          marginBottom: "0.25rem",
                          fontSize: "0.9rem",
                        }}
                      >
                        X Position:
                      </label>
                      <input
                        type="number"
                        value={checklistSignatureX}
                        onChange={(e) => setChecklistSignatureX(e.target.value)}
                        style={{
                          width: "100%",
                          padding: "0.5rem",
                          borderRadius: "4px",
                          border: "1px solid #ccc",
                        }}
                        disabled={uploadingChecklist}
                      />
                    </div>
                    <div>
                      <label
                        style={{
                          display: "block",
                          marginBottom: "0.25rem",
                          fontSize: "0.9rem",
                        }}
                      >
                        Y Position:
                      </label>
                      <input
                        type="number"
                        value={checklistSignatureY}
                        onChange={(e) => setChecklistSignatureY(e.target.value)}
                        style={{
                          width: "100%",
                          padding: "0.5rem",
                          borderRadius: "4px",
                          border: "1px solid #ccc",
                        }}
                        disabled={uploadingChecklist}
                      />
                    </div>
                    <div>
                      <label
                        style={{
                          display: "block",
                          marginBottom: "0.25rem",
                          fontSize: "0.9rem",
                        }}
                      >
                        Width:
                      </label>
                      <input
                        type="number"
                        value={checklistSignatureWidth}
                        onChange={(e) =>
                          setChecklistSignatureWidth(e.target.value)
                        }
                        style={{
                          width: "100%",
                          padding: "0.5rem",
                          borderRadius: "4px",
                          border: "1px solid #ccc",
                        }}
                        disabled={uploadingChecklist}
                      />
                    </div>
                    <div>
                      <label
                        style={{
                          display: "block",
                          marginBottom: "0.25rem",
                          fontSize: "0.9rem",
                        }}
                      >
                        Height:
                      </label>
                      <input
                        type="number"
                        value={checklistSignatureHeight}
                        onChange={(e) =>
                          setChecklistSignatureHeight(e.target.value)
                        }
                        style={{
                          width: "100%",
                          padding: "0.5rem",
                          borderRadius: "4px",
                          border: "1px solid #ccc",
                        }}
                        disabled={uploadingChecklist}
                      />
                    </div>
                  </div>
                  <p
                    style={{
                      marginTop: "0.5rem",
                      fontSize: "0.85rem",
                      color: "#666",
                    }}
                  >
                    Drag your signature from the preview above onto the PDF to position it, or manually adjust these coordinate values.
                  </p>
                </div>

                <button
                  onClick={handleChecklistUpload}
                  disabled={
                    !selectedChecklistFile ||
                    !selectedRequirementType ||
                    uploadingChecklist
                  }
                  className="upload-btn"
                >
                  {uploadingChecklist ? (
                    <>
                      <span className="spinner"></span> Uploading...
                    </>
                  ) : (
                    <>
                      <IoCloudUploadOutline /> Upload Checklist Template
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
                title={
                  searchQuery || filterCategory !== "all"
                    ? "No files found"
                    : "No files uploaded yet"
                }
                message={
                  searchQuery || filterCategory !== "all"
                    ? "Try adjusting your search or filter criteria."
                    : "Upload your first file above to get started."
                }
              />
            ) : (
              <>
                {/* OJT How to Start */}
                {filteredFiles.filter((f) => f.category === "tutorial").length >
                  0 && (
                  <div className="files-category-section">
                    <h3 className="category-title">
                      OJT How to Start (
                      {
                        filteredFiles.filter((f) => f.category === "tutorial")
                          .length
                      }
                      )
                    </h3>
                    <div className="files-grid">
                      {filteredFiles
                        .filter((f) => f.category === "tutorial")
                        .map((file) => {
                          const FileIcon = getFileTypeIcon(
                            file.fileType,
                            file.fileExtension
                          );
                          return (
                            <div key={file.id} className="file-card">
                              <div className="file-header">
                                <div className="file-title-wrapper">
                                  <FileIcon className="file-type-icon" />
                                  <h3>{file.fileName}</h3>
                                </div>
                                <button
                                  onClick={() =>
                                    handleDeleteClick(file.id, file.fileName)
                                  }
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
                                <span>
                                  Size: {formatFileSize(file.fileSize)}
                                </span>
                                <span>
                                  Uploaded: {formatDate(file.uploadedAt)}
                                </span>
                              </div>
                              <div className="file-actions">
                                {isPreviewable(file.fileType) && (
                                  <button
                                    onClick={() => handlePreview(file)}
                                    className="preview-btn"
                                    style={{
                                      border: "none",
                                      cursor: "pointer",
                                    }}
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
                {filteredFiles.filter((f) => f.category === "fileNeeded")
                  .length > 0 && (
                  <div className="files-category-section">
                    <h3 className="category-title">
                      Requirement Files (
                      {
                        filteredFiles.filter((f) => f.category === "fileNeeded")
                          .length
                      }
                      )
                    </h3>
                    <div className="files-grid">
                      {filteredFiles
                        .filter((f) => f.category === "fileNeeded")
                        .map((file) => {
                          const FileIcon = getFileTypeIcon(
                            file.fileType,
                            file.fileExtension
                          );
                          return (
                            <div key={file.id} className="file-card">
                              <div className="file-header">
                                <div className="file-title-wrapper">
                                  <FileIcon className="file-type-icon" />
                                  <h3>{file.fileName}</h3>
                                </div>
                                <button
                                  onClick={() =>
                                    handleDeleteClick(file.id, file.fileName)
                                  }
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
                                <span>
                                  Size: {formatFileSize(file.fileSize)}
                                </span>
                                <span>
                                  Uploaded: {formatDate(file.uploadedAt)}
                                </span>
                              </div>
                              <div className="file-actions">
                                {isPreviewable(file.fileType) && (
                                  <button
                                    onClick={() => handlePreview(file)}
                                    className="preview-btn"
                                    style={{
                                      border: "none",
                                      cursor: "pointer",
                                    }}
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
                          const FileIcon = getFileTypeIcon(
                            file.fileType,
                            file.fileExtension
                          );
                          return (
                            <div key={file.id} className="file-card">
                              <div className="file-header">
                                <div className="file-title-wrapper">
                                  <FileIcon className="file-type-icon" />
                                  <h3>{file.fileName}</h3>
                                </div>
                                <button
                                  onClick={() =>
                                    handleDeleteClick(file.id, file.fileName)
                                  }
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
                                <span>
                                  Size: {formatFileSize(file.fileSize)}
                                </span>
                                <span>
                                  Uploaded: {formatDate(file.uploadedAt)}
                                </span>
                              </div>
                              <div className="file-actions">
                                {isPreviewable(file.fileType) && (
                                  <button
                                    onClick={() => handlePreview(file)}
                                    className="preview-btn"
                                    style={{
                                      border: "none",
                                      cursor: "pointer",
                                    }}
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

export default ResourceManagementDashboard;
