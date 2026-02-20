import React from "react";
import { IoCloseOutline, IoPersonOutline, IoMailOutline, IoCallOutline, IoSchoolOutline, IoBusinessOutline, IoDocumentTextOutline, IoCalendarOutline, IoRefreshOutline, IoTimeOutline } from "react-icons/io5";
import "./StudentDetailModal.css";

const StudentDetailModal = ({ open, student, onClose, onRestore }) => {
  if (!open || !student) return null;

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (e) {
      return dateString;
    }
  };

  const studentName = `${student.firstName || ''} ${student.lastName || ''}`.trim() || "Unknown Student";
  const studentId = student.studentId || "N/A";

  return (
    <div className="student-detail-modal-backdrop" onClick={onClose}>
      <div className="student-detail-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="student-detail-header">
          <div className="student-detail-header-left">
            <div className="student-detail-icon-wrapper">
              <IoPersonOutline className="student-detail-icon" />
            </div>
            <div className="student-detail-title-group">
              <h2 className="student-detail-title">{studentName}</h2>
              <p className="student-detail-subtitle">Student ID: {studentId}</p>
              <div className="student-status-badges" style={{ marginTop: '8px', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {student.is_blocked ? (
                  <span className="status-badge blocked" style={{ padding: '4px 8px', borderRadius: '4px', fontSize: '12px', backgroundColor: '#fee', color: '#c33' }}>Blocked</span>
                ) : (
                  <span className="status-badge active" style={{ padding: '4px 8px', borderRadius: '4px', fontSize: '12px', backgroundColor: '#efe', color: '#3c3' }}>Active</span>
                )}
                {student.status === "hired" ? (
                  <span className="status-badge hired" style={{ padding: '4px 8px', borderRadius: '4px', fontSize: '12px', backgroundColor: '#eef', color: '#33c' }}>Hired</span>
                ) : (
                  <span className="status-badge not-hired" style={{ padding: '4px 8px', borderRadius: '4px', fontSize: '12px', backgroundColor: '#ffe', color: '#cc3' }}>Not Hired</span>
                )}
                {student.section && (
                  <span className="status-badge section" style={{ padding: '4px 8px', borderRadius: '4px', fontSize: '12px', backgroundColor: '#f0f0f0', color: '#666' }}>{student.section}</span>
                )}
              </div>
            </div>
          </div>
          <div className="student-detail-header-right">
            {onRestore && (
              <button
                className="student-detail-restore-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  onRestore();
                }}
                title="Restore student"
              >
                <IoRefreshOutline />
                Restore
              </button>
            )}
            <button
              className="student-detail-close-btn"
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onClose();
              }}
              aria-label="Close"
            >
              <span className="student-detail-close-x" aria-hidden="true">
                ×
              </span>
            </button>
          </div>
        </div>

        <div className="student-detail-body">
          {/* Personal Information */}
          <div className="detail-section">
            <h3 className="detail-section-title">
              <IoPersonOutline className="detail-section-icon" />
              Personal Information
            </h3>
            <div className="detail-grid">
              <div className="detail-item">
                <span className="detail-item-label">Student ID</span>
                <span className="detail-item-value">{studentId}</span>
              </div>
              <div className="detail-item">
                <span className="detail-item-label">First Name</span>
                <span className="detail-item-value">{student.firstName || "N/A"}</span>
              </div>
              <div className="detail-item">
                <span className="detail-item-label">Last Name</span>
                <span className="detail-item-value">{student.lastName || "N/A"}</span>
              </div>
              <div className="detail-item">
                <IoMailOutline className="detail-item-icon" />
                <div className="detail-item-content">
                  <span className="detail-item-label">Email</span>
                  {student.email && !student.email.includes("@student.internquest.local") ? (
                    <a 
                      href={`mailto:${student.email}`}
                      className="detail-item-value link"
                    >
                      {student.email}
                    </a>
                  ) : (
                    <span className="detail-item-value empty-value">Not set</span>
                  )}
                </div>
              </div>
              <div className="detail-item">
                <IoCallOutline className="detail-item-icon" />
                <div className="detail-item-content">
                  <span className="detail-item-label">Contact Number</span>
                  <span className="detail-item-value">
                    {student.contact || <span className="empty-value">Not set</span>}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Academic Information */}
          <div className="detail-section">
            <h3 className="detail-section-title">
              <IoSchoolOutline className="detail-section-icon" />
              Academic Information
            </h3>
            <div className="detail-grid">
              <div className="detail-item">
                <span className="detail-item-label">Program</span>
                <span className="detail-item-value">
                  {student.program || <span className="empty-value">Not set</span>}
                </span>
              </div>
              <div className="detail-item">
                <span className="detail-item-label">College</span>
                <span className="detail-item-value">
                  {student.college || <span className="empty-value">Not set</span>}
                </span>
              </div>
              <div className="detail-item">
                <span className="detail-item-label">Field</span>
                <span className="detail-item-value">
                  {student.field ? (
                    <span className="field-tag">{student.field}</span>
                  ) : (
                    <span className="empty-value">Not set</span>
                  )}
                </span>
              </div>
              {student.section && (
                <div className="detail-item">
                  <span className="detail-item-label">Section</span>
                  <span className="detail-item-value">{student.section}</span>
                </div>
              )}
              {student.createdAt && (
                <div className="detail-item">
                  <IoTimeOutline className="detail-item-icon" />
                  <div className="detail-item-content">
                    <span className="detail-item-label">Created At</span>
                    <span className="detail-item-value">
                      {(() => {
                        try {
                          const date = new Date(student.createdAt);
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

          {/* Company Information */}
          <div className="detail-section">
            <h3 className="detail-section-title">
              <IoBusinessOutline className="detail-section-icon" />
              Company Information
            </h3>
            <div className="detail-grid">
              <div className="detail-item">
                <span className="detail-item-label">Company</span>
                <span className="detail-item-value">
                  {student.company || student.companyName || student.selectedCompany || (
                    <span className="empty-value">Not assigned</span>
                  )}
                </span>
              </div>
              {(student.applicationDate || student.companyApplicationDate || student.appliedDate || student.selectedCompanyDate || 
                ((student.selectedCompany || student.company || student.companyName) && student.createdAt)) && (
                <div className="detail-item">
                  <IoCalendarOutline className="detail-item-icon" />
                  <div className="detail-item-content">
                    <span className="detail-item-label">Application Date</span>
                    <span className="detail-item-value">
                      {formatDate(
                        student.applicationDate || 
                        student.companyApplicationDate || 
                        student.appliedDate || 
                        student.selectedCompanyDate ||
                        ((student.selectedCompany || student.company || student.companyName) ? student.createdAt : null)
                      )}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Skills */}
          <div className="detail-section">
            <h3 className="detail-section-title">
              <IoDocumentTextOutline className="detail-section-icon" />
              Skills
            </h3>
            {student.skills && Array.isArray(student.skills) && student.skills.length > 0 ? (
              <div className="skills-container">
                {student.skills.map((skill, index) => (
                  <span key={index} className="skill-tag">
                    {typeof skill === 'object' ? (skill.id || skill.name || JSON.stringify(skill)) : skill}
                  </span>
                ))}
              </div>
            ) : (
              <p className="req-empty">No skills recorded for this archived student.</p>
            )}
          </div>

          {/* Submitted Requirements (from archive snapshot) */}
          <div className="detail-section">
            <h3 className="detail-section-title">
              <IoDocumentTextOutline className="detail-section-icon" />
              Submitted Requirements
            </h3>
            {Array.isArray(student.submittedRequirements) && student.submittedRequirements.length > 0 ? (
              <div className="req-list">
                {student.submittedRequirements.map((req) => (
                  <span key={req} className="req-pill">
                    {req}
                  </span>
                ))}
              </div>
            ) : (
              <p className="req-empty">
                No submitted requirements snapshot found for this archived student.
              </p>
            )}
          </div>

          {/* Archive Information */}
          <div className="detail-section">
            <h3 className="detail-section-title">
              <IoCalendarOutline className="detail-section-icon" />
              Archive Information
            </h3>
            <div className="detail-grid">
              {student.deletedAt && (
                <div className="detail-item">
                  <span className="detail-item-label">Archived At</span>
                  <span className="detail-item-value">{formatDate(student.deletedAt)}</span>
                </div>
              )}
              {student.deletedByRole && (
                <div className="detail-item">
                  <span className="detail-item-label">Archived By</span>
                  <span className="detail-item-value">{student.deletedByRole}</span>
                </div>
              )}
              {student.deletedBy && (
                <div className="detail-item">
                  <span className="detail-item-label">Deleted By User</span>
                  <span className="detail-item-value">{student.deletedBy}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentDetailModal;
