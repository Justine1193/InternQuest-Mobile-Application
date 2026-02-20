import React, { useState, useRef, useEffect } from "react";
import { IoCloseOutline, IoDocumentTextOutline, IoCloudUploadOutline } from "react-icons/io5";
import { storage } from "../../../../firebase";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import "./RenewMoaModal.css";

/**
 * RenewMoaModal - Modal for renewing a company's MOA with start date, validity years, and required document upload.
 */
function RenewMoaModal({
  open,
  company,
  onClose,
  onSubmit,
  isSubmitting,
}) {
  const defaultValidity = company ? (company.moaValidityYears || 1) : 1;

  const [startDate, setStartDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [validityYears, setValidityYears] = useState(defaultValidity);
  const [moaFile, setMoaFile] = useState(null);
  const [moaFileUploading, setMoaFileUploading] = useState(false);
  const [uploadedMoa, setUploadedMoa] = useState(null); // { url, fileName, storagePath }
  const [error, setError] = useState("");
  const moaFileInputRef = useRef(null);

  // Reset form when modal opens with a company
  useEffect(() => {
    if (open && company) {
      const today = new Date().toISOString().slice(0, 10);
      setStartDate(today);
      setValidityYears(company.moaValidityYears || 1);
      setMoaFile(null);
      setUploadedMoa(null);
      setError("");
      if (moaFileInputRef.current) {
        moaFileInputRef.current.value = "";
      }
    }
  }, [open, company]);

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      setError("File size must be 10MB or less.");
      return;
    }

    const allowedTypes = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "image/jpeg",
      "image/png",
      "image/gif",
      "image/webp",
    ];
    if (!allowedTypes.includes(file.type) && !file.name.match(/\.(pdf|doc|docx|jpg|jpeg|png|gif|webp)$/i)) {
      setError("Please upload a PDF, DOC, DOCX, or image file.");
      return;
    }

    setError("");
    setMoaFile(file);
    setMoaFileUploading(true);

    try {
      const timestamp = Date.now();
      const safeFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, "_");
      const storagePath = `moa/${company.id}/${timestamp}-${safeFileName}`;
      const storageRef = ref(storage, storagePath);

      await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(storageRef);

      setUploadedMoa({
        url: downloadURL,
        fileName: file.name,
        storagePath,
      });
    } catch (err) {
      console.error("Error uploading MOA file:", err);
      setError("Failed to upload MOA file. Please try again.");
      setMoaFile(null);
    } finally {
      setMoaFileUploading(false);
      if (moaFileInputRef.current) {
        moaFileInputRef.current.value = "";
      }
    }
  };

  const handleRemoveFile = () => {
    setMoaFile(null);
    setUploadedMoa(null);
    setError("");
    if (moaFileInputRef.current) {
      moaFileInputRef.current.value = "";
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");

    if (!startDate.trim()) {
      setError("Start date is required.");
      return;
    }

    const years = Number(validityYears);
    if (!Number.isInteger(years) || years < 1) {
      setError("Validity must be at least 1 year.");
      return;
    }

    if (!uploadedMoa) {
      setError("MOA document is required. Please upload a file.");
      return;
    }

    const start = new Date(startDate);
    if (Number.isNaN(start.getTime())) {
      setError("Please enter a valid start date.");
      return;
    }

    const expirationDate = new Date(start);
    expirationDate.setFullYear(expirationDate.getFullYear() + years);

    onSubmit({
      startDate: start.toISOString(),
      expirationDate: expirationDate.toISOString(),
      validityYears: years,
      moaFileUrl: uploadedMoa.url,
      moaFileName: uploadedMoa.fileName,
      moaStoragePath: uploadedMoa.storagePath,
    });
  };

  if (!open || !company) return null;

  return (
    <div className="renew-moa-modal-backdrop" onClick={onClose}>
      <div
        className="renew-moa-modal-content"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="renew-moa-modal-header">
          <h2>Renew MOA</h2>
          <p className="renew-moa-modal-subtitle">
            Set new start date, validity, and upload the new MOA document for{" "}
            <strong>{company.companyName}</strong>.
          </p>
          <button
            type="button"
            className="renew-moa-modal-close"
            onClick={onClose}
            aria-label="Close"
          >
            <IoCloseOutline />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="renew-moa-form">
          {error && (
            <div className="renew-moa-error" role="alert">
              {error}
            </div>
          )}

          <div className="renew-moa-field">
            <label htmlFor="renew-moa-start-date">
              Start date <span className="required">*</span>
            </label>
            <input
              id="renew-moa-start-date"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              required
              disabled={isSubmitting}
              className="renew-moa-input"
            />
          </div>

          <div className="renew-moa-field">
            <label htmlFor="renew-moa-validity">
              Validity (years) <span className="required">*</span>
            </label>
            <input
              id="renew-moa-validity"
              type="number"
              min={1}
              max={99}
              value={validityYears}
              onChange={(e) => setValidityYears(e.target.value)}
              required
              disabled={isSubmitting}
              className="renew-moa-input"
            />
          </div>

          <div className="renew-moa-field">
            <label>
              MOA document <span className="required">*</span>
            </label>
            <div className="renew-moa-file-wrapper">
              <input
                ref={moaFileInputRef}
                type="file"
                accept=".pdf,.doc,.docx,image/*"
                onChange={handleFileChange}
                style={{ display: "none" }}
                id="renew-moa-file-input"
                disabled={moaFileUploading || isSubmitting}
              />
              <label
                htmlFor="renew-moa-file-input"
                className={`renew-moa-file-label ${moaFileUploading || isSubmitting ? "uploading" : ""}`}
              >
                <IoCloudUploadOutline className="renew-moa-upload-icon" />
                <span>
                  {moaFileUploading
                    ? "Uploading..."
                    : uploadedMoa
                    ? "Change file"
                    : "Upload MOA document (required)"}
                </span>
              </label>
              {uploadedMoa && !moaFileUploading && (
                <div className="renew-moa-file-preview">
                  <IoDocumentTextOutline className="renew-moa-file-icon" />
                  <span className="renew-moa-file-name" title={uploadedMoa.fileName}>
                    {uploadedMoa.fileName}
                  </span>
                  <button
                    type="button"
                    className="renew-moa-file-remove"
                    onClick={handleRemoveFile}
                    disabled={isSubmitting}
                    aria-label="Remove file"
                  >
                    <IoCloseOutline />
                  </button>
                </div>
              )}
            </div>
            <p className="renew-moa-file-hint">
              PDF, DOC, DOCX, or image. Max 10MB. Required for renewal.
            </p>
          </div>

          <div className="renew-moa-actions">
            <button
              type="button"
              className="renew-moa-btn cancel"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="renew-moa-btn submit"
              disabled={moaFileUploading || isSubmitting || !uploadedMoa}
            >
              {isSubmitting ? "Saving…" : "Renew MOA"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default RenewMoaModal;
