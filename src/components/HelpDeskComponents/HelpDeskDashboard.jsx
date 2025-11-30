/**
 * HelpDeskDashboard - Admin dashboard for managing help desk files and resources
 * Allows admins to upload, view, and manage files for student support
 *
 * @component
 * @example
 * <HelpDeskDashboard />
 */

import React, { useState, useEffect } from "react";
import { db, auth } from "../../../firebase";
import {
  collection,
  getDocs,
  addDoc,
  deleteDoc,
  doc,
} from "firebase/firestore";
import { IoSettingsOutline } from "react-icons/io5";
import {
  IoCloudUploadOutline,
  IoTrashOutline,
  IoDownloadOutline,
} from "react-icons/io5";
import logo from "../../assets/InternQuest_Logo.png";
import { signOut } from "firebase/auth";
import { clearAdminSession } from "../../utils/auth";
import LoadingSpinner from "../LoadingSpinner.jsx";
import "./HelpDeskDashboard.css";

const HelpDeskDashboard = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [files, setFiles] = useState([]);
  const [showLogout, setShowLogout] = useState(false);
  const [error, setError] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadingTutorial, setUploadingTutorial] = useState(false);
  const [uploadingFileNeeded, setUploadingFileNeeded] = useState(false);
  // Tutorial upload state
  const [selectedFileTutorial, setSelectedFileTutorial] = useState(null);
  const [fileDescriptionTutorial, setFileDescriptionTutorial] = useState("");
  // File needed upload state
  const [selectedFileNeeded, setSelectedFileNeeded] = useState(null);
  const [fileDescriptionNeeded, setFileDescriptionNeeded] = useState("");

  useEffect(() => {
    document.title = "Help Desk | InternQuest Admin";
    fetchFiles();
  }, []);

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

  // Handle file selection for file needed
  const handleFileSelectNeeded = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFileNeeded(file);
      setError(null);
    }
  };

  // Convert file to base64
  const fileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });
  };

  // Upload file to Firestore (stored as base64)
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

    // Check file size only for "fileNeeded" category (Flowchart has no limit)
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

      console.log("Converting file to base64...");

      // Convert file to base64
      const base64Data = await fileToBase64(selectedFile);

      console.log("Saving to Firestore...");

      // Save file data and metadata to Firestore
      await addDoc(collection(db, "helpDeskFiles"), {
        fileName: selectedFile.name,
        fileData: base64Data, // Store file as base64
        description: fileDescription || "No description",
        category: category, // Store category: "tutorial" or "fileNeeded"
        uploadedAt: new Date().toISOString(),
        uploadedBy: auth.currentUser.uid,
        fileSize: selectedFile.size,
        fileType: selectedFile.type,
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
    } catch (err) {
      console.error("Upload error:", err);
      setError(`Failed to upload file: ${err.message || "Unknown error"}`);
    } finally {
      setUploadingState(false);
    }
  };

  // Delete file from Firestore
  const handleDelete = async (fileId) => {
    if (!window.confirm("Are you sure you want to delete this file?")) {
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      // Delete from Firestore
      await deleteDoc(doc(db, "helpDeskFiles", fileId));

      // Refresh file list
      await fetchFiles();
    } catch (err) {
      setError(`Failed to delete file: ${err.message}`);
      console.error("Delete error:", err);
    } finally {
      setIsLoading(false);
    }
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

  // Download file from base64 data
  const handleDownload = (fileData, fileName, fileType) => {
    try {
      // Convert base64 to blob
      const byteCharacters = atob(fileData.split(",")[1]);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: fileType });

      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = fileName;
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
      window.location.href = "/";
    } catch (error) {
      alert("Logout failed!");
    }
  };

  return (
    <div className="dashboard-container">
      <LoadingSpinner
        isLoading={isLoading}
        message="Loading help desk files..."
      />
      <nav className="top-nav">
        <div className="nav-left">
          <div className="logo">
            <img src={logo} alt="Logo" height="32" />
          </div>
          <div className="nav-links">
            <a href="/dashboard" className="nav-link">
              Manage Internships
            </a>
            <a href="/studentDashboard" className="nav-link">
              Manage Students
            </a>
            <a href="/helpDesk" className="nav-link active">
              Help Desk
            </a>
          </div>
        </div>
        <div className="nav-right">
          <button
            className="settings-icon"
            onClick={() => setShowLogout((prev) => !prev)}
            aria-label="Settings"
            style={{ fontSize: "28px" }}
          >
            <IoSettingsOutline />
          </button>
          {showLogout && (
            <div className="logout-dropdown">
              <button onClick={handleLogout} className="logout-btn">
                Logout
              </button>
            </div>
          )}
        </div>
      </nav>

      <div className="dashboard-content">
        <div className="helpdesk-section">
          <h1>Help Desk - Resource Management</h1>
          <p className="helpdesk-subtitle">
            Upload and manage files for student support and resources
          </p>

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
            {/* OJT Flowchart Upload Section */}
            <div className="upload-section">
              <h2>OJT How to Start Flowchart</h2>
              <p className="section-note">
                Upload OJT flowcharts. You can upload multiple flowcharts.
              </p>

              <div className="upload-form">
                <div className="form-group">
                  <label htmlFor="file-input-tutorial">
                    Select Flowchart File{" "}
                    <span style={{ color: "red" }}>*</span>
                  </label>
                  <input
                    id="file-input-tutorial"
                    type="file"
                    onChange={handleFileSelectTutorial}
                    className="file-input"
                    disabled={uploadingTutorial}
                    accept="image/*,.pdf"
                  />
                  {selectedFileTutorial && (
                    <div className="file-info">
                      <strong>Selected:</strong> {selectedFileTutorial.name} (
                      {formatFileSize(selectedFileTutorial.size)})
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
                      <IoCloudUploadOutline /> Upload Flowchart
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* File Needed Upload Section */}
            <div className="upload-section">
              <h2>📄 Upload File Needed</h2>
              <div className="upload-form">
                <div className="form-group">
                  <label htmlFor="file-input-needed">
                    Select File <span style={{ color: "red" }}>*</span>
                  </label>
                  <input
                    id="file-input-needed"
                    type="file"
                    onChange={handleFileSelectNeeded}
                    className="file-input"
                    disabled={uploadingFileNeeded}
                  />
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
                </div>

                <div className="form-group">
                  <label htmlFor="file-description-needed">
                    Description (Optional)
                  </label>
                  <textarea
                    id="file-description-needed"
                    value={fileDescriptionNeeded}
                    onChange={(e) => setFileDescriptionNeeded(e.target.value)}
                    placeholder="Enter a description for this file..."
                    className="description-input"
                    rows="3"
                    disabled={uploadingFileNeeded}
                  />
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
            <h2>Uploaded Files ({files.length})</h2>
            {files.length === 0 ? (
              <div className="empty-state">
                <p>No files uploaded yet. Upload your first file above.</p>
              </div>
            ) : (
              <>
                {/* OJT Flowchart */}
                {files.filter((f) => f.category === "tutorial").length > 0 && (
                  <div className="files-category-section">
                    <h3 className="category-title">
                      📊 OJT How to Start Flowchart (
                      {files.filter((f) => f.category === "tutorial").length})
                    </h3>
                    <div className="files-grid">
                      {files
                        .filter((f) => f.category === "tutorial")
                        .map((file) => (
                          <div key={file.id} className="file-card">
                            <div className="file-header">
                              <h3>{file.fileName}</h3>
                              <button
                                onClick={() => handleDelete(file.id)}
                                className="delete-btn"
                                aria-label="Delete file"
                                disabled={isLoading}
                              >
                                <IoTrashOutline />
                              </button>
                            </div>
                            <div className="file-category-badge tutorial-badge">
                              Flowchart
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
                            <button
                              onClick={() =>
                                handleDownload(
                                  file.fileData,
                                  file.fileName,
                                  file.fileType
                                )
                              }
                              className="download-btn"
                              style={{ border: "none", cursor: "pointer" }}
                            >
                              <IoDownloadOutline /> Download
                            </button>
                          </div>
                        ))}
                    </div>
                  </div>
                )}

                {/* File Needed Files */}
                {files.filter((f) => f.category === "fileNeeded").length >
                  0 && (
                  <div className="files-category-section">
                    <h3 className="category-title">
                      📄 Files Needed (
                      {files.filter((f) => f.category === "fileNeeded").length})
                    </h3>
                    <div className="files-grid">
                      {files
                        .filter((f) => f.category === "fileNeeded")
                        .map((file) => (
                          <div key={file.id} className="file-card">
                            <div className="file-header">
                              <h3>{file.fileName}</h3>
                              <button
                                onClick={() => handleDelete(file.id)}
                                className="delete-btn"
                                aria-label="Delete file"
                                disabled={isLoading}
                              >
                                <IoTrashOutline />
                              </button>
                            </div>
                            <div className="file-category-badge needed-badge">
                              File Needed
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
                            <button
                              onClick={() =>
                                handleDownload(
                                  file.fileData,
                                  file.fileName,
                                  file.fileType
                                )
                              }
                              className="download-btn"
                              style={{ border: "none", cursor: "pointer" }}
                            >
                              <IoDownloadOutline /> Download
                            </button>
                          </div>
                        ))}
                    </div>
                  </div>
                )}

                {/* Files without category (for backward compatibility) */}
                {files.filter(
                  (f) =>
                    !f.category ||
                    (f.category !== "tutorial" && f.category !== "fileNeeded")
                ).length > 0 && (
                  <div className="files-category-section">
                    <h3 className="category-title">
                      📁 Other Files (
                      {
                        files.filter(
                          (f) =>
                            !f.category ||
                            (f.category !== "tutorial" &&
                              f.category !== "fileNeeded")
                        ).length
                      }
                      )
                    </h3>
                    <div className="files-grid">
                      {files
                        .filter(
                          (f) =>
                            !f.category ||
                            (f.category !== "tutorial" &&
                              f.category !== "fileNeeded")
                        )
                        .map((file) => (
                          <div key={file.id} className="file-card">
                            <div className="file-header">
                              <h3>{file.fileName}</h3>
                              <button
                                onClick={() => handleDelete(file.id)}
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
                            <button
                              onClick={() =>
                                handleDownload(
                                  file.fileData,
                                  file.fileName,
                                  file.fileType
                                )
                              }
                              className="download-btn"
                              style={{ border: "none", cursor: "pointer" }}
                            >
                              <IoDownloadOutline /> Download
                            </button>
                          </div>
                        ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HelpDeskDashboard;
