/**
 * SignatureManagement - Component for teachers/advisers to upload and manage their digital signature
 * Allows uploading PNG signature with transparent background
 *
 * @component
 */

import React, { useState, useEffect } from "react";
import { db, storage, auth } from "../../../firebase";
import {
  ref as storageRef,
  uploadBytes,
  getDownloadURL,
  getMetadata,
} from "firebase/storage";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { getAdminRole, hasAnyRole, ROLES } from "../../utils/auth";
import { useToast } from "../../hooks/useToast";
import ToastContainer from "../Toast/ToastContainer";
import LoadingSpinner from "../LoadingSpinner";
import Navbar from "../Navbar/Navbar";
import { signOut } from "firebase/auth";
import { clearAdminSession } from "../../utils/auth";
import { useNavigate } from "react-router-dom";
import {
  IoCloudUploadOutline,
  IoImageOutline,
  IoCheckmarkCircleOutline,
  IoTrashOutline,
} from "react-icons/io5";
import "./SignatureManagement.css";

const SignatureManagement = () => {
  const navigate = useNavigate();
  const { toasts, success, error: showError, removeToast } = useToast();
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [currentSignature, setCurrentSignature] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [removeWhiteBackground, setRemoveWhiteBackground] = useState(false);
  const [processingImage, setProcessingImage] = useState(false);

  useEffect(() => {
    document.title = "Signature Management | InternQuest Admin";
    fetchCurrentSignature();
  }, []);

  // Check if user can manage signature (adviser or coordinator)
  const canManageSignature = () => {
    return hasAnyRole([ROLES.ADVISER, ROLES.COORDINATOR, ROLES.SUPER_ADMIN]);
  };

  // Fetch current signature from Firestore
  const fetchCurrentSignature = async () => {
    if (!auth.currentUser || !canManageSignature()) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const signatureRef = doc(db, "teacher_signatures", auth.currentUser.uid);
      const signatureSnap = await getDoc(signatureRef);

      if (signatureSnap.exists()) {
        const data = signatureSnap.data();
        setCurrentSignature({
          downloadUrl: data.downloadUrl,
          storagePath: data.storagePath,
          uploadedAt: data.uploadedAt,
        });
        setPreviewUrl(data.downloadUrl);
      }
    } catch (error) {
      console.error("Error fetching signature:", error);
      showError("Failed to load current signature");
    } finally {
      setLoading(false);
    }
  };

  // Remove white background from image
  const removeWhiteBackgroundFromImage = async (imageUrl, threshold = 240) => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      
      // Only set crossOrigin for external URLs, not data URLs
      if (!imageUrl.startsWith('data:')) {
        img.crossOrigin = "anonymous";
      }
      
      img.onload = () => {
        try {
          const canvas = document.createElement("canvas");
          canvas.width = img.width;
          canvas.height = img.height;
          const ctx = canvas.getContext("2d", { willReadFrequently: true });
          
          // Clear canvas completely to ensure transparency
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          
          // Draw image on canvas
          ctx.drawImage(img, 0, 0);
          
          // Get image data
          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          const data = imageData.data;
          
          // Process each pixel
          let pixelsProcessed = 0;
          for (let i = 0; i < data.length; i += 4) {
            const r = data[i];
            const g = data[i + 1];
            const b = data[i + 2];
            const a = data[i + 3];
            
            // Check if pixel is white or near-white (within threshold)
            // Also check if it's not already transparent
            if (a > 0 && r >= threshold && g >= threshold && b >= threshold) {
              // Make pixel fully transparent
              data[i + 3] = 0;
              pixelsProcessed++;
            }
          }
          
          console.log(`Processed ${pixelsProcessed} white pixels out of ${data.length / 4} total pixels`);
          
          // Clear canvas again before putting processed data
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          
          // Put processed data back
          ctx.putImageData(imageData, 0, 0);
          
          // Convert to blob with transparency support (PNG format)
          canvas.toBlob((blob) => {
            if (blob) {
              const processedUrl = URL.createObjectURL(blob);
              console.log("Image processed successfully, blob size:", blob.size, "type:", blob.type);
              
              // Verify the blob is PNG
              if (blob.type !== "image/png") {
                console.warn("Warning: Blob type is", blob.type, "expected image/png");
              }
              
              resolve({ blob, url: processedUrl });
            } else {
              console.error("Failed to create blob from canvas");
              reject(new Error("Failed to process image"));
            }
          }, "image/png", 1.0); // Use quality 1.0 for PNG (lossless)
        } catch (error) {
          console.error("Error processing image:", error);
          reject(error);
        }
      };
      
      img.onerror = (error) => {
        console.error("Failed to load image:", error);
        reject(new Error("Failed to load image"));
      };
      
      img.src = imageUrl;
    });
  };

  // Handle file selection
  const handleFileSelect = async (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith("image/")) {
        showError("Please select an image file (PNG, JPG, etc.)");
        return;
      }

      // Validate file size (max 2MB)
      const maxSize = 2 * 1024 * 1024; // 2MB
      if (file.size > maxSize) {
        showError("File size must be less than 2MB");
        return;
      }

      setProcessingImage(true);
      
      try {
        // Create preview URL
        const reader = new FileReader();
        reader.onloadend = async () => {
          const originalUrl = reader.result;
          
          // If white background removal is enabled, process the image
          if (removeWhiteBackground) {
            try {
              console.log("Processing image to remove white background...");
              const processed = await removeWhiteBackgroundFromImage(originalUrl);
              setPreviewUrl(processed.url);
              // Create a new File object from the processed blob
              const processedFile = new File([processed.blob], file.name.replace(/\.[^/.]+$/, ".png"), {
                type: "image/png",
                lastModified: Date.now(),
              });
              setSelectedFile(processedFile);
              console.log("White background removed successfully");
            } catch (error) {
              console.error("Error processing image:", error);
              showError("Failed to remove white background. Using original image.");
              setPreviewUrl(originalUrl);
              setSelectedFile(file);
            }
          } else {
            setPreviewUrl(originalUrl);
            setSelectedFile(file);
          }
          
          setProcessingImage(false);
        };
        reader.readAsDataURL(file);
      } catch (error) {
        console.error("Error reading file:", error);
        showError("Failed to read image file");
        setProcessingImage(false);
      }
    }
  };

  // Handle signature upload
  const handleUpload = async () => {
    if (!selectedFile || !auth.currentUser || !canManageSignature()) {
      showError("Please select a signature image to upload");
      return;
    }

    try {
      setUploading(true);

      // Create storage path
      const timestamp = Date.now();
      const fileExtension = selectedFile.name.split(".").pop() || "png";
      const storagePath = `teacher_signatures/${auth.currentUser.uid}/${timestamp}.${fileExtension}`;
      const fileRef = storageRef(storage, storagePath);

      // Upload to Storage
      await uploadBytes(fileRef, selectedFile, {
        contentType: selectedFile.type,
      });

      // Get download URL
      const downloadUrl = await getDownloadURL(fileRef);

      // Save metadata to Firestore
      const signatureRef = doc(db, "teacher_signatures", auth.currentUser.uid);
      await setDoc(
        signatureRef,
        {
          downloadUrl,
          storagePath,
          uploadedAt: new Date().toISOString(),
          uploadedBy: auth.currentUser.uid,
        },
        { merge: true }
      );

      // Update local state
      setCurrentSignature({
        downloadUrl,
        storagePath,
        uploadedAt: new Date().toISOString(),
      });
      setSelectedFile(null);
      document.getElementById("signature-file-input").value = "";

      success("Signature uploaded successfully!");
      await fetchCurrentSignature();
    } catch (error) {
      console.error("Error uploading signature:", error);
      showError(`Failed to upload signature: ${error.message}`);
    } finally {
      setUploading(false);
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

  if (!canManageSignature()) {
    return (
      <div className="signature-management-container">
        <Navbar onLogout={handleLogout} />
        <div className="signature-management-content">
          <div className="error-message">
            You do not have permission to manage signatures. Only teachers and
            coordinators can manage signatures.
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="signature-management-container">
      <LoadingSpinner isLoading={loading} message="Loading signature..." />
      <Navbar onLogout={handleLogout} />
      <ToastContainer toasts={toasts} removeToast={removeToast} />

      <div className="signature-management-content">
        <div className="signature-management-header">
          <h1>Digital Signature Management</h1>
          <p className="subtitle">
            Upload or update your digital signature. This signature will be
            automatically inserted into checklist PDFs when you approve student
            requirements.
          </p>
        </div>

        <div className="signature-management-section">
          {/* Current Signature Display */}
          {currentSignature && (
            <div className="current-signature-section">
              <h2>Current Signature</h2>
              <div className="signature-preview-container">
                <img
                  src={currentSignature.downloadUrl}
                  alt="Current signature"
                  className="signature-preview"
                />
                <div className="signature-info">
                  <p>
                    <strong>Uploaded:</strong>{" "}
                    {new Date(currentSignature.uploadedAt).toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Upload Section */}
          <div className="upload-signature-section">
            <h2>{currentSignature ? "Update Signature" : "Upload Signature"}</h2>
            <div className="upload-form">
              <div className="form-group">
                <label htmlFor="signature-file-input">
                  Select Signature Image (PNG with transparent background
                  recommended) <span style={{ color: "red" }}>*</span>
                </label>
                <div className="file-input-wrapper">
                  <input
                    id="signature-file-input"
                    type="file"
                    accept="image/png,image/jpeg,image/jpg"
                    onChange={handleFileSelect}
                    className="file-input"
                    disabled={uploading || processingImage}
                  />
                </div>
                {selectedFile && (
                  <div className="file-info">
                    <strong>Selected:</strong> {selectedFile.name} (
                    {(selectedFile.size / 1024).toFixed(2)} KB)
                  </div>
                )}
                
                {/* White Background Remover Toggle */}
                <div className="white-background-remover-section" style={{ marginTop: "1rem" }}>
                  <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", cursor: "pointer" }}>
                    <input
                      type="checkbox"
                      checked={removeWhiteBackground}
                      onChange={async (e) => {
                        const newValue = e.target.checked;
                        setRemoveWhiteBackground(newValue);
                        
                        // Reprocess image if file is already selected
                        if (selectedFile) {
                          setProcessingImage(true);
                          try {
                            const fileInput = document.getElementById("signature-file-input");
                            if (fileInput && fileInput.files && fileInput.files[0]) {
                              // Re-read the original file
                              const reader = new FileReader();
                              reader.onloadend = async () => {
                                const originalUrl = reader.result;
                                
                                if (newValue) {
                                  // Process to remove white background
                                  try {
                                    console.log("Processing image to remove white background...");
                                    const processed = await removeWhiteBackgroundFromImage(originalUrl);
                                    setPreviewUrl(processed.url);
                                    const processedFile = new File([processed.blob], fileInput.files[0].name.replace(/\.[^/.]+$/, ".png"), {
                                      type: "image/png",
                                      lastModified: Date.now(),
                                    });
                                    setSelectedFile(processedFile);
                                    console.log("White background removed successfully");
                                  } catch (error) {
                                    console.error("Error processing image:", error);
                                    showError("Failed to remove white background. Using original image.");
                                    setPreviewUrl(originalUrl);
                                    setSelectedFile(fileInput.files[0]);
                                  }
                                } else {
                                  // Use original file
                                  console.log("Reverting to original image");
                                  setPreviewUrl(originalUrl);
                                  setSelectedFile(fileInput.files[0]);
                                }
                                setProcessingImage(false);
                              };
                              reader.onerror = () => {
                                console.error("Error reading file");
                                showError("Failed to read image file");
                                setProcessingImage(false);
                              };
                              reader.readAsDataURL(fileInput.files[0]);
                            } else {
                              setProcessingImage(false);
                            }
                          } catch (error) {
                            console.error("Error toggling white background removal:", error);
                            showError("Failed to toggle white background removal");
                            setProcessingImage(false);
                          }
                        }
                      }}
                      disabled={uploading}
                      style={{ 
                        width: "18px", 
                        height: "18px", 
                        cursor: uploading ? "not-allowed" : "pointer",
                        opacity: uploading ? 0.6 : 1
                      }}
                    />
                    <span style={{ fontSize: "0.9rem", color: "#333" }}>
                      Remove white background automatically
                    </span>
                  </label>
                  <p style={{ fontSize: "0.8rem", color: "#666", marginTop: "0.5rem", marginLeft: "1.75rem" }}>
                    This will automatically make white pixels transparent. Useful for scanned signatures or images with white backgrounds.
                  </p>
                </div>
                
                {processingImage && (
                  <div style={{ marginTop: "0.5rem", color: "#007bff", fontSize: "0.9rem" }}>
                    Processing image...
                  </div>
                )}
              </div>

              {previewUrl && (
                <div className="preview-section">
                  <h3>Signature Preview</h3>
                  <p style={{ fontSize: "0.9rem", color: "#666", marginBottom: "1rem" }}>
                    This is how your signature will appear in the checklist PDF:
                  </p>
                  <div className="preview-container">
                    {/* Simulated PDF background */}
                    <div className="pdf-preview-background">
                      <div className="pdf-preview-content">
                        <div className="pdf-preview-header">
                          <h4>Sample Document</h4>
                        </div>
                        <div className="pdf-preview-body">
                          <p>This is a preview of how your signature will look when inserted into the checklist PDF.</p>
                          <div className="signature-preview-box">
                            <div className="signature-label">Adviser's Signature:</div>
                            <div className="signature-display-area">
                              <img
                                src={previewUrl}
                                alt="Signature preview"
                                className="preview-image-in-pdf"
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    {/* Standalone preview */}
                    <div className="standalone-preview">
                      <h4 style={{ fontSize: "0.9rem", marginBottom: "0.5rem", color: "#666" }}>
                        Standalone Signature:
                      </h4>
                      <div className="preview-image-container">
                        <img
                          src={previewUrl}
                          alt="Signature preview"
                          className="preview-image"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <button
                onClick={handleUpload}
                disabled={!selectedFile || uploading}
                className="upload-btn"
              >
                {uploading ? (
                  <>
                    <span className="spinner"></span> Uploading...
                  </>
                ) : (
                  <>
                    <IoCloudUploadOutline />{" "}
                    {currentSignature ? "Update Signature" : "Upload Signature"}
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Instructions */}
          <div className="instructions-section">
            <h3>Instructions</h3>
            <ul>
              <li>
                Upload a PNG image with a transparent background for best
                results
              </li>
              <li>
                Recommended size: 300x100 pixels or similar aspect ratio
              </li>
              <li>Maximum file size: 2MB</li>
              <li>
                Your signature will be automatically inserted into checklist
                PDFs when you approve student requirements
              </li>
              <li>
                Updating your signature will only affect future approvals, not
                previously signed PDFs
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignatureManagement;

