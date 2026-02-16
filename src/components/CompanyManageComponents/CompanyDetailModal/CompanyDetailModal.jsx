import React from "react";
import {
  IoCloseOutline,
  IoBusinessOutline,
  IoLocationOutline,
  IoMailOutline,
  IoGlobeOutline,
  IoDocumentTextOutline,
  IoCalendarOutline,
  IoRefreshOutline,
  IoPersonOutline,
  IoCallOutline,
  IoAlertCircle,
  IoWarning,
  IoDownloadOutline,
  IoOpenOutline,
  IoTimeOutline,
} from "react-icons/io5";
import { checkMoaExpiration } from "../../../utils/moaUtils";
import "./CompanyDetailModal.css";

const CompanyDetailModal = ({
  open,
  company,
  onClose,
  onRenewMoa,
  onEdit,
  onRestore,
}) => {
  if (!open || !company) return null;

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    } catch (e) {
      return dateString;
    }
  };

  const getExpirationStatus = () => {
    if (!company.moaExpirationDate)
      return { status: "unknown", text: "N/A", color: "#9e9e9e" };

    const expirationDate = new Date(company.moaExpirationDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const expDate = new Date(expirationDate);
    expDate.setHours(0, 0, 0, 0);

    const daysUntilExpiration = Math.ceil(
      (expDate - today) / (1000 * 60 * 60 * 24),
    );

    if (daysUntilExpiration < 0) {
      return {
        status: "expired",
        text: `Expired ${Math.abs(daysUntilExpiration)} day${
          Math.abs(daysUntilExpiration) !== 1 ? "s" : ""
        } ago`,
        color: "#c62828",
      };
    } else if (daysUntilExpiration <= 30) {
      return {
        status: "expiring-soon",
        text: `${daysUntilExpiration} day${
          daysUntilExpiration !== 1 ? "s" : ""
        } remaining`,
        color: "#f57c00",
      };
    } else {
      return {
        status: "valid",
        text: `${daysUntilExpiration} day${
          daysUntilExpiration !== 1 ? "s" : ""
        } remaining`,
        color: "#2e7d32",
      };
    }
  };

  const expirationStatus = getExpirationStatus();
  const moaStatus = checkMoaExpiration(company);

  return (
    <div className="company-detail-modal-backdrop" onClick={onClose}>
      <div
        className="company-detail-modal-content"
        onClick={(e) => e.stopPropagation()}
      >
        {/* MOA Expiration Warning Banner */}
        {moaStatus.isExpired && (
          <div className="moa-expiration-banner expired">
            <IoAlertCircle className="banner-icon" />
            <div className="banner-content">
              <strong>MOA Expired</strong>
              <span>
                {moaStatus.message}. This company cannot be used for student
                assignments until the MOA is renewed.
              </span>
            </div>
          </div>
        )}
        {moaStatus.status === "expiring-soon" && (
          <div className="moa-expiration-banner expiring">
            <IoWarning className="banner-icon" />
            <div className="banner-content">
              <strong>MOA Expiring Soon</strong>
              <span>
                {moaStatus.message}. Please renew the MOA to avoid expiration.
              </span>
            </div>
          </div>
        )}
        <div className="company-detail-header">
          <div className="company-detail-title">
            <IoBusinessOutline className="company-detail-icon" />
            <h2>{company.companyName}</h2>
          </div>
          <div className="company-detail-actions">
            {onRestore && (
              <button
                className="company-detail-action-btn restore-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  onRestore();
                }}
                title="Restore company"
              >
                <IoRefreshOutline />
                Restore
              </button>
            )}
            {onRenewMoa &&
              company.moa === "Yes" &&
              expirationStatus.status !== "valid" && (
                <button
                  className="company-detail-action-btn renew-moa-btn"
                  onClick={() => onRenewMoa(company)}
                  title="Renew MOA"
                >
                  <IoRefreshOutline />
                  Renew MOA
                </button>
              )}
            {onEdit && (
              <button
                className="company-detail-action-btn edit-btn"
                onClick={() => onEdit(company)}
                title="Edit Company"
              >
                Edit
              </button>
            )}
            <button className="company-detail-close-btn" onClick={onClose}>
              <IoCloseOutline />
            </button>
          </div>
        </div>

        <div className="company-detail-body">
          {/* Description */}
          <div className="detail-section">
            <h3 className="detail-section-title">Description</h3>
            <p className="detail-section-content">
              {company.companyDescription || <span className="empty-value">Not set</span>}
            </p>
          </div>

          <div className="detail-section">
            <h3 className="detail-section-title">Endorsed by College</h3>
            <p className="detail-section-content">
              {company.endorsedByCollege || <span className="empty-value">Not set</span>}
            </p>
          </div>

          {/* Contact Information */}
          <div className="detail-section">
            <h3 className="detail-section-title">Contact Information</h3>
            <div className="detail-grid">
              <div className="detail-item">
                <IoPersonOutline className="detail-item-icon" />
                <div className="detail-item-content">
                  <span className="detail-item-label">Name</span>
                  <span className="detail-item-value">
                    {company.contactPersonName || <span className="empty-value">Not set</span>}
                  </span>
                </div>
              </div>
              <div className="detail-item">
                <IoCallOutline className="detail-item-icon" />
                <div className="detail-item-content">
                  <span className="detail-item-label">Contact Number</span>
                  {company.contactPersonPhone || company.companyContactNumber ? (
                    <a
                      href={`tel:${company.contactPersonPhone || company.companyContactNumber}`}
                      className="detail-item-value link"
                    >
                      {company.contactPersonPhone || company.companyContactNumber}
                    </a>
                  ) : (
                    <span className="detail-item-value empty-value">Not set</span>
                  )}
                </div>
              </div>
              <div className="detail-item">
                <IoLocationOutline className="detail-item-icon" />
                <div className="detail-item-content">
                  <span className="detail-item-label">Address</span>
                  <span className="detail-item-value">
                    {company.companyAddress || <span className="empty-value">Not set</span>}
                  </span>
                </div>
              </div>
              <div className="detail-item">
                <IoMailOutline className="detail-item-icon" />
                <div className="detail-item-content">
                  <span className="detail-item-label">Email</span>
                  {company.companyEmail ? (
                    <a
                      href={`mailto:${company.companyEmail}`}
                      className="detail-item-value link"
                    >
                      {company.companyEmail}
                    </a>
                  ) : (
                    <span className="detail-item-value empty-value">Not set</span>
                  )}
                </div>
              </div>
              <div className="detail-item">
                <IoGlobeOutline className="detail-item-icon" />
                <div className="detail-item-content">
                  <span className="detail-item-label">Website</span>
                  {company.companyWeb ? (
                    <a
                      href={
                        company.companyWeb.startsWith("http")
                          ? company.companyWeb
                          : `https://${company.companyWeb}`
                      }
                      target="_blank"
                      rel="noopener noreferrer"
                      className="detail-item-value link"
                    >
                      {company.companyWeb}
                    </a>
                  ) : (
                    <span className="detail-item-value empty-value">Not set</span>
                  )}
                </div>
              </div>
              {company.createdAt && (
                <div className="detail-item">
                  <IoTimeOutline className="detail-item-icon" />
                  <div className="detail-item-content">
                    <span className="detail-item-label">Created At</span>
                    <span className="detail-item-value">
                      {(() => {
                        try {
                          const date = new Date(company.createdAt);
                          return date.toLocaleString();
                        } catch (e) {
                          return <span className="empty-value">Invalid date</span>;
                        }
                      })()}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Contact Person Information */}
          <div className="detail-section">
            <h3 className="detail-section-title">Contact Person</h3>
            <div className="detail-grid">
              <div className="detail-item">
                <IoPersonOutline className="detail-item-icon" />
                <div className="detail-item-content">
                  <span className="detail-item-label">Name</span>
                  <span className="detail-item-value">
                    {company.contactPersonName || <span className="empty-value">Not set</span>}
                  </span>
                </div>
              </div>
              <div className="detail-item">
                <IoMailOutline className="detail-item-icon" />
                <div className="detail-item-content">
                  <span className="detail-item-label">Email</span>
                  {company.contactPersonEmail || company.companyEmail ? (
                    <a
                      href={`mailto:${
                        company.contactPersonEmail || company.companyEmail
                      }`}
                      className="detail-item-value link"
                    >
                      {company.contactPersonEmail || company.companyEmail}
                    </a>
                  ) : (
                    <span className="detail-item-value empty-value">Not set</span>
                  )}
                </div>
              </div>
              <div className="detail-item">
                <IoCallOutline className="detail-item-icon" />
                <div className="detail-item-content">
                  <span className="detail-item-label">Phone</span>
                  {company.contactPersonPhone ? (
                    <a
                      href={`tel:${company.contactPersonPhone}`}
                      className="detail-item-value link"
                    >
                      {company.contactPersonPhone}
                    </a>
                  ) : (
                    <span className="detail-item-value empty-value">Not set</span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Fields */}
          <div className="detail-section">
            <h3 className="detail-section-title">Fields</h3>
            {company.fields && Array.isArray(company.fields) && company.fields.length > 0 ? (
              <div className="detail-tags">
                {company.fields.map((field, index) => (
                  <span key={index} className="detail-tag field-tag">
                    {field}
                  </span>
                ))}
              </div>
            ) : (
              <p className="detail-section-content empty-value">No fields specified</p>
            )}
          </div>

          {/* Skills Required */}
          <div className="detail-section">
            <h3 className="detail-section-title">Skills Required</h3>
            {company.skillsREq && Array.isArray(company.skillsREq) && company.skillsREq.length > 0 ? (
              <div className="detail-tags">
                {company.skillsREq.map((skill, index) => (
                  <span key={index} className="detail-tag skill-tag">
                    {skill}
                  </span>
                ))}
              </div>
            ) : (
              <p className="detail-section-content empty-value">No skills required specified</p>
            )}
          </div>

          {/* Mode of Work */}
          <div className="detail-section">
            <h3 className="detail-section-title">Mode of Work</h3>
            {company.modeOfWork && Array.isArray(company.modeOfWork) && company.modeOfWork.length > 0 ? (
              <div className="detail-tags">
                {company.modeOfWork.map((mode, index) => (
                  <span
                    key={index}
                    className={`detail-tag mode-tag mode-${mode
                      .toLowerCase()
                      .replace(/\s+/g, "-")}`}
                  >
                    {mode}
                  </span>
                ))}
              </div>
            ) : (
              <p className="detail-section-content empty-value">No mode of work specified</p>
            )}
          </div>

          {/* MOA Information */}
          <div className="detail-section">
            <h3 className="detail-section-title">
              <IoDocumentTextOutline className="detail-section-icon" />
              Memorandum of Agreement (MOA)
            </h3>
            <div className="moa-detail-grid">
              <div className="moa-detail-item">
                <span className="moa-detail-label">Status</span>
                <span
                  className={`moa-detail-value ${
                    company.moa === "Yes" ? "active" : "inactive"
                  }`}
                >
                  {company.moa === "Yes" ? "Active" : "Inactive"}
                </span>
              </div>
              {company.moaValidityYears && (
                <div className="moa-detail-item">
                  <span className="moa-detail-label">Validity</span>
                  <span className="moa-detail-value">
                    {company.moaValidityYears}{" "}
                    {company.moaValidityYears === 1 ? "year" : "years"}
                  </span>
                </div>
              )}
              {company.moaStartDate && (
                <div className="moa-detail-item">
                  <IoCalendarOutline className="moa-detail-icon" />
                  <span className="moa-detail-label">Start Date</span>
                  <span className="moa-detail-value">
                    {formatDate(company.moaStartDate)}
                  </span>
                </div>
              )}
              {company.moaExpirationDate && (
                <div className="moa-detail-item">
                  <IoCalendarOutline className="moa-detail-icon" />
                  <span className="moa-detail-label">Expiration Date</span>
                  <span className="moa-detail-value">
                    {formatDate(company.moaExpirationDate)}
                  </span>
                </div>
              )}
              {company.moaExpirationDate && (
                <div className="moa-detail-item">
                  <span className="moa-detail-label">Status</span>
                  <span
                    className="moa-detail-value expiration-status"
                    style={{ color: expirationStatus.color }}
                  >
                    {expirationStatus.text}
                  </span>
                </div>
              )}
            </div>

            {/* MOA File Section */}
            {company.moaFileUrl && (
              <div className="moa-file-section">
                <h4 className="moa-file-title">
                  <IoDocumentTextOutline className="moa-file-title-icon" />
                  MOA Document
                </h4>
                <div className="moa-file-card">
                  <div className="moa-file-info">
                    <IoDocumentTextOutline className="moa-file-icon" />
                    <div className="moa-file-details">
                      <span className="moa-file-name">
                        {company.moaFileName || "MOA Document"}
                      </span>
                      <span className="moa-file-type">PDF Document</span>
                    </div>
                  </div>
                  <div className="moa-file-actions">
                    <a
                      href={company.moaFileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="moa-file-btn view-btn"
                      title="View MOA Document"
                    >
                      <IoOpenOutline />
                      View
                    </a>
                    <a
                      href={company.moaFileUrl}
                      download={company.moaFileName || "MOA_Document.pdf"}
                      className="moa-file-btn download-btn"
                      title="Download MOA Document"
                    >
                      <IoDownloadOutline />
                      Download
                    </a>
                  </div>
                </div>
              </div>
            )}

            {!company.moaFileUrl && company.moa === "Yes" && (
              <div className="moa-file-section">
                <h4 className="moa-file-title">
                  <IoDocumentTextOutline className="moa-file-title-icon" />
                  MOA Document
                </h4>
                <div className="moa-file-empty">
                  <IoDocumentTextOutline className="moa-file-empty-icon" />
                  <span>No MOA document uploaded</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CompanyDetailModal;
