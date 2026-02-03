/**
 * StudentTableRow - Renders a single row in the student table, including skills, location, and kebab menu
 *
 * @component
 * @param {object} row - The student data for this row
 * @param {function} onEdit - Handler for editing this student
 * @param {function} onDelete - Handler for deleting this student
 * @param {boolean} isSelected - Whether this row is selected
 * @param {function} onSelect - Handler for selecting this row
 * @param {boolean} selectionMode - Whether selection mode is active
 * @param {any} openMenuId - ID of the open kebab menu
 * @param {function} setOpenMenuId - Setter for openMenuId
 * @param {any} selectedRowId - ID of the selected row
 * @param {function} setSelectedRowId - Setter for selectedRowId
 * @param {function} setIsEditMode - Setter for edit mode
 * @param {function} setEditStudentId - Setter for edit student ID
 * @param {function} setFormData - Setter for form data
 * @param {function} setSkills - Setter for skills
 * @param {function} setIsModalOpen - Setter for modal open state
 * @param {function} setSelectionMode - Setter for selection mode
 * @param {function} setSelectedItems - Setter for selected items
 * @param {function} handleDeleteSingle - Handler for deleting a single student
 * @param {boolean} isDeleting - Whether a delete operation is in progress
 * @example
 * <StudentTableRow row={row} ...props />
 */

import React, { useState } from "react";
import PropTypes from "prop-types";
import { IoEllipsisVertical } from "react-icons/io5";
import { getStorage, ref, getDownloadURL } from "firebase/storage";
import { storage } from "../../../../firebase.js";
import KebabCell from "../../KebabcellComponents/KebabCell.jsx";
import "./StudentTableRow.css";

// Renders a single student table row, including skills, location, and kebab menu
const StudentTableRow = ({
  row,
  onEdit,
  onDelete,
  isSelected,
  onSelect,
  selectionMode,
  openMenuId,
  setOpenMenuId,
  selectedRowId,
  setSelectedRowId,
  setIsEditMode,
  setEditStudentId,
  setFormData,
  setSkills,
  setIsModalOpen,
  setSelectionMode,
  setSelectedItems,
  handleDeleteSingle,
  handleAcceptStudent,
  isDeleting,
  onRowClick,
  isAdviser,
  requirementApprovals,
}) => {
  // State for toggling skill tag expansion
  const [showAllSkills, setShowAllSkills] = useState(false);
  const [profilePictureUrl, setProfilePictureUrl] = useState(null);
  const [profilePictureError, setProfilePictureError] = useState(false);

  // Fetch profile picture URL
  React.useEffect(() => {
    const fetchProfilePicture = async () => {
      if (!row?.id) return;

      // Check Firestore profilePictureUrl first (fastest)
      if (row.profilePictureUrl) {
        setProfilePictureUrl(row.profilePictureUrl);
        setProfilePictureError(false);
        return;
      }

      // Only try Storage if user might have a picture (has avatarBase64)
      // Skip Storage check if user has no avatarBase64 and no profilePictureUrl
      // This prevents unnecessary 404 errors
      if (!row.avatarBase64 && !row.avatarbase64) {
        setProfilePictureError(true);
        return;
      }

      // Try Storage - migration creates profile.jpg or profile.png
      const fileNames = ["profile.jpg", "profile.png"];
      let found = false;

      for (const fileName of fileNames) {
        try {
          const profileRef = ref(
            storage,
            `profilePictures/${row.id}/${fileName}`
          );
          const url = await getDownloadURL(profileRef);
          setProfilePictureUrl(url);
          setProfilePictureError(false);
          found = true;
          break;
        } catch (e) {
          // Silently continue if file doesn't exist
          // This means migration hasn't run yet or file doesn't exist
          continue;
        }
      }

      if (!found) {
        setProfilePictureError(true);
      }
    };

    fetchProfilePicture();
  }, [row?.id, row?.profilePictureUrl, row?.avatarBase64, row?.avatarbase64]);

  const handleRowClick = () => {
    if (selectionMode) return;
    if (typeof onRowClick === "function") {
      onRowClick(row);
    }
  };

  const getCompanyName = () => {
    if (!row) return "";
    if (typeof row.company === "string" && row.company.trim())
      return row.company;
    if (typeof row.companyName === "string" && row.companyName.trim())
      return row.companyName;
    if (typeof row.assignedCompany === "string" && row.assignedCompany.trim())
      return row.assignedCompany;
    if (row.company && typeof row.company === "object" && row.company.name) {
      return row.company.name;
    }
    return "";
  };

  // Get requirements status indicator and counts
  const getRequirementsStatus = () => {
    if (!row?.id)
      return { status: null, notSubmitted: 7, pending: 0, approved: 0, notSubmittedList: [], pendingList: [], approvedList: [] };

    // Get list of all required documents (must match StudentDashboard and StudentRequirementModal)
    const REQUIRED_DOCUMENTS = [
      "Proof of Enrollment (COM)",
      "Notarized Parental Consent",
      "Medical Certificate",
      "Psychological Test Certification",
      "Proof of Insurance",
      "Memorandum of Agreement (MOA)",
      "Curriculum Vitae",
    ];

    // Get submitted requirements for this student (passed from parent)
    const submittedRequirements = row.submittedRequirements || [];

    // Get approvals for this student
    const studentApprovals = requirementApprovals?.[row.id] || {};

    // Helper function to find approval for a requirement (handles name variations)
    const findApproval = (reqType) => {
      // Debug logging
      if (process.env.NODE_ENV === 'development' && row.id) {
        console.log(`[findApproval] Looking for: "${reqType}"`);
        console.log(`[findApproval] Available approval keys:`, Object.keys(studentApprovals));
      }
      
      // Direct match first
      if (studentApprovals[reqType]) {
        if (process.env.NODE_ENV === 'development') {
          console.log(`[findApproval] Direct match found for: "${reqType}"`);
        }
        return studentApprovals[reqType];
      }

      // Try alternative names (for backward compatibility and name variations)
      const nameVariations = {
        "Proof of Enrollment (COM)": [
          "Proof of Enrollment (COM)",
          "COM",
          "Enrollment",
          "Proof of Enrollment",
        ],
        "Notarized Parental Consent": [
          "Notarized Parental Consent",
          "Parent/Guardian Consent Form",
          "Parental Consent",
          "Notarized Parental Consent Form",
        ],
        "Medical Certificate": [
          "Medical Certificate",
          "Medical",
          "Medical Clearance",
        ],
        "Psychological Test Certification": [
          "Psychological Test Certification",
          "Psychological Test",
          "Psychological",
          "Psychological Certification",
        ],
        "Proof of Insurance": [
          "Proof of Insurance",
          "Insurance Certificate",
          "Insurance",
          "Proof of Insurance Certificate",
        ],
        "Memorandum of Agreement (MOA)": [
          "Memorandum of Agreement (MOA)",
          "Memorandum of Agreement",
          "MOA (Memorandum of Agreement)",
          "MOA",
          "Memorandum",
        ],
        "Curriculum Vitae": [
          "Curriculum Vitae",
          "Resume",
          "CV",
          "Resume/CV",
          "Resume (CV)",
          "Curriculum",
        ],
      };

      // Check all variations for this requirement type
      const variations = nameVariations[reqType] || [reqType];
      for (const variation of variations) {
        if (studentApprovals[variation]) {
          if (process.env.NODE_ENV === 'development') {
            console.log(`[findApproval] Variation match found: "${variation}" for "${reqType}"`);
          }
          return studentApprovals[variation];
        }
      }

      // Also check all approval keys for partial matches (fuzzy matching)
      // Normalize both strings by removing "(MOA)" variations for better matching
      const reqTypeLower = reqType.toLowerCase().replace(/\s*\(moa\)\s*/gi, '').trim();
      
      // Special handling for MOA and CV
      const isMOA = reqTypeLower.includes('memorandum') || reqTypeLower.includes('moa');
      const isCV = reqTypeLower.includes('curriculum') || reqTypeLower.includes('vitae') || reqTypeLower.includes('resume') || reqTypeLower === 'cv';
      
      for (const [key, approval] of Object.entries(studentApprovals)) {
        // Skip if approval is not a valid object
        if (!approval || typeof approval !== "object" || !approval.status) {
          continue;
        }
        
        const keyLower = key.toLowerCase().replace(/\s*\(moa\)\s*/gi, '').trim();
        
        // Exact match (case-insensitive, normalized)
        if (keyLower === reqTypeLower) {
          if (process.env.NODE_ENV === 'development') {
            console.log(`[findApproval] Exact normalized match found: "${key}" for "${reqType}"`);
          }
          return approval;
        }
        
        // Special matching for MOA - must include both "memorandum" AND "agreement" (or "moa")
        if (isMOA) {
          const hasMemorandum = keyLower.includes('memorandum');
          const hasMOA = keyLower.includes('moa');
          const hasAgreement = keyLower.includes('agreement');
          
          // Match if it has "memorandum" AND ("moa" OR "agreement")
          // This prevents false matches like "Parental Agreement"
          if (hasMemorandum && (hasMOA || hasAgreement)) {
            if (process.env.NODE_ENV === 'development') {
              console.log(`[findApproval] MOA fuzzy match found: "${key}" for "${reqType}"`);
            }
            return approval;
          }
          // Also match if it's just "moa" (standalone)
          if (hasMOA && keyLower.length <= 5) {
            if (process.env.NODE_ENV === 'development') {
              console.log(`[findApproval] MOA standalone match found: "${key}" for "${reqType}"`);
            }
            return approval;
          }
        }
        
        // Special matching for CV/Resume
        if (isCV) {
          const hasCurriculum = keyLower.includes('curriculum');
          const hasVitae = keyLower.includes('vitae');
          const hasResume = keyLower.includes('resume');
          const isCVOnly = keyLower === 'cv';
          
          // Match if it has "curriculum" AND "vitae", OR has "resume", OR is just "cv"
          if ((hasCurriculum && hasVitae) || hasResume || isCVOnly) {
            if (process.env.NODE_ENV === 'development') {
              console.log(`[findApproval] CV fuzzy match found: "${key}" for "${reqType}"`);
            }
            return approval;
          }
        }
        
        // General fuzzy matching for other requirements
        // Only match if one string contains the other (not just partial word matches)
        if (
          keyLower.includes(reqTypeLower) ||
          reqTypeLower.includes(keyLower)
        ) {
          if (process.env.NODE_ENV === 'development') {
            console.log(`[findApproval] General fuzzy match found: "${key}" for "${reqType}"`);
          }
          return approval;
        }
      }

      return null;
    };

    // Helper function to check if a requirement is submitted (handles name variations)
    const isRequirementSubmitted = (reqType) => {
      // Exact match first
      if (submittedRequirements.includes(reqType)) return true;

      // Check if any submitted requirement matches this requirement type
      const reqTypeLower = reqType.toLowerCase();
      return submittedRequirements.some((submitted) => {
        const submittedLower = submitted.toLowerCase();

        // Handle common variations
        if (
          (reqType === "Memorandum of Agreement (MOA)" || reqType === "Memorandum of Agreement") &&
          (submittedLower.includes("moa") || submittedLower.includes("memorandum") || submittedLower.includes("agreement"))
        )
          return true;
        if (
          reqType === "Curriculum Vitae" &&
          (submittedLower.includes("resume") || 
           submittedLower.includes("cv") || 
           submittedLower.includes("curriculum") ||
           submittedLower.includes("vitae") ||
           submittedLower === "curriculum vitae")
        )
          return true;
        if (
          reqType === "Proof of Enrollment (COM)" &&
          (submittedLower.includes("enrollment") ||
            submittedLower.includes("com"))
        )
          return true;
        if (
          reqType === "Notarized Parental Consent" &&
          (submittedLower.includes("parent") ||
            submittedLower.includes("consent"))
        )
          return true;
        if (
          reqType === "Medical Certificate" &&
          submittedLower.includes("medical")
        )
          return true;
        if (
          reqType === "Psychological Test Certification" &&
          submittedLower.includes("psychological")
        )
          return true;
        // Only match if BOTH "proof" AND "insurance" are present
        // This prevents company insurance documents from being misidentified
        if (
          reqType === "Proof of Insurance" &&
          submittedLower.includes("proof") &&
          submittedLower.includes("insurance")
        )
          return true;

        return false;
      });
    };

    // Get list of not submitted requirements (for tooltip)
    const notSubmittedList = REQUIRED_DOCUMENTS.filter(
      (req) => !isRequirementSubmitted(req)
    );
    const notSubmitted = notSubmittedList.length;

    // Get lists of pending and approved requirements (for tooltips)
    const pendingList = [];
    const approvedList = [];

    // Count approved and pending requirements
    // Check ALL required documents, not just submitted ones
    let approved = 0;
    let pending = 0;

    REQUIRED_DOCUMENTS.forEach((reqType) => {
      // Check if requirement is submitted using helper function
      const isSubmitted = isRequirementSubmitted(reqType);

      if (isSubmitted) {
        // If submitted, check if it's approved
        const approval = findApproval(reqType);
        if (approval && approval.status === "accepted") {
          approved++;
          approvedList.push(reqType);
        } else {
          pending++;
          pendingList.push(reqType);
        }
      }
      // If not submitted, it's already counted in notSubmitted
    });

    // Check if student has submitted ALL required documents
    const hasAllSubmitted = REQUIRED_DOCUMENTS.every((req) =>
      isRequirementSubmitted(req)
    );

    if (!hasAllSubmitted) {
      return { status: null, notSubmitted, pending, approved, notSubmittedList, pendingList, approvedList }; // Not all requirements submitted
    }

    // Check if ALL required documents are submitted AND approved
    // Only check requirements that are actually submitted
    const submittedReqTypes = REQUIRED_DOCUMENTS.filter((reqType) =>
      isRequirementSubmitted(reqType)
    );
    
    const allApproved =
      submittedReqTypes.length > 0 &&
      submittedReqTypes.every((reqType) => {
        const approval = findApproval(reqType);
        const isApproved = approval && approval.status === "accepted";
        
        // Debug logging
        if (process.env.NODE_ENV === 'development' && row.id) {
          if (!isApproved) {
            console.log(`[Status Check] Requirement "${reqType}" not approved:`, {
              approval,
              approvalStatus: approval?.status,
              studentId: row.id,
              availableApprovals: Object.keys(studentApprovals),
            });
          }
        }
        
        return isApproved;
      });

    if (allApproved) {
      if (process.env.NODE_ENV === 'development' && row.id) {
        console.log(`[Status Check] All requirements approved for student ${row.id}:`, {
          submittedCount: submittedReqTypes.length,
          approvedCount: approved,
          pendingCount: pending,
        });
      }
      
      return {
        status: "checked",
        notSubmitted: 0,
        pending: 0,
        approved: submittedReqTypes.length,
        notSubmittedList: [],
        pendingList: [],
        approvedList: submittedReqTypes,
      }; // All submitted requirements are approved
    }
    
    if (process.env.NODE_ENV === 'development' && row.id && hasAllSubmitted) {
      console.log(`[Status Check] Not all approved for student ${row.id}:`, {
        submittedCount: submittedReqTypes.length,
        approvedCount: approved,
        pendingCount: pending,
        notSubmittedCount: notSubmitted,
        allApproved,
      });
    }

    return { status: null, notSubmitted: 0, pending, approved, notSubmittedList: [], pendingList, approvedList }; // All submitted but not all approved
  };

  const requirementsStatus = getRequirementsStatus();

  // Get overall requirement status for the indicator
  const getOverallRequirementStatus = () => {
    if (!row?.id) return "not-submitted";

    // If no requirements submitted at all
    if (requirementsStatus.notSubmitted === 7 && requirementsStatus.pending === 0 && requirementsStatus.approved === 0) {
      return "not-submitted";
    }

    // If all requirements are approved (check status first, then verify counts)
    if (requirementsStatus.status === "checked") {
      return "approved";
    }

    // Also check: if all 7 requirements are submitted AND all are approved (but status might not be set)
    if (requirementsStatus.notSubmitted === 0 && requirementsStatus.pending === 0 && requirementsStatus.approved > 0) {
      // Double-check: verify all submitted requirements are actually approved
      const REQUIRED_DOCUMENTS = [
        "Proof of Enrollment (COM)",
        "Notarized Parental Consent",
        "Medical Certificate",
        "Psychological Test Certification",
        "Proof of Insurance",
        "Memorandum of Agreement (MOA)",
        "Curriculum Vitae",
      ];
      const submittedRequirements = row.submittedRequirements || [];
      const studentApprovals = requirementApprovals?.[row.id] || {};
      
      // Check if all required documents are submitted
      const allSubmitted = REQUIRED_DOCUMENTS.every((reqType) => {
        const reqTypeLower = reqType.toLowerCase();
        return submittedRequirements.some((submitted) => {
          const submittedLower = submitted.toLowerCase();
          // Handle variations
          if (reqType === "Memorandum of Agreement (MOA)" && (submittedLower.includes("moa") || submittedLower.includes("memorandum") || submittedLower.includes("agreement"))) return true;
          if (reqType === "Curriculum Vitae" && (submittedLower.includes("resume") || submittedLower.includes("cv") || submittedLower.includes("curriculum") || submittedLower.includes("vitae") || submittedLower === "curriculum vitae")) return true;
          if (reqType === "Proof of Enrollment (COM)" && (submittedLower.includes("enrollment") || submittedLower.includes("com"))) return true;
          if (reqType === "Notarized Parental Consent" && (submittedLower.includes("parent") || submittedLower.includes("consent"))) return true;
          if (reqType === "Medical Certificate" && submittedLower.includes("medical")) return true;
          if (reqType === "Psychological Test Certification" && submittedLower.includes("psychological")) return true;
          // Only match if BOTH "proof" AND "insurance" are present
          // This prevents company insurance documents from being misidentified
          if (reqType === "Proof of Insurance" && submittedLower.includes("proof") && submittedLower.includes("insurance")) return true;
          return submittedLower === reqTypeLower;
        });
      });

      if (allSubmitted) {
        // Check if all are approved
        const allApproved = REQUIRED_DOCUMENTS.every((reqType) => {
          // Find approval using the same logic as findApproval
          const reqTypeLower = reqType.toLowerCase().replace(/\s*\(moa\)\s*/gi, '').trim();
          const isMOA = reqTypeLower.includes('memorandum') || reqTypeLower.includes('moa');
          const isCV = reqTypeLower.includes('curriculum') || reqTypeLower.includes('vitae') || reqTypeLower.includes('resume') || reqTypeLower === 'cv';
          
          for (const [key, approval] of Object.entries(studentApprovals)) {
            if (!approval || typeof approval !== "object" || !approval.status) continue;
            
            const keyLower = key.toLowerCase().replace(/\s*\(moa\)\s*/gi, '').trim();
            
            if (keyLower === reqTypeLower) {
              return approval.status === "accepted";
            }
            
            if (isMOA && (keyLower.includes('memorandum') || keyLower.includes('moa') || keyLower.includes('agreement'))) {
              return approval.status === "accepted";
            }
            
            if (isCV && (keyLower.includes('curriculum') || keyLower.includes('vitae') || keyLower.includes('resume') || keyLower === 'cv')) {
              return approval.status === "accepted";
            }
          }
          return false;
        });

        if (allApproved) {
          return "approved";
        }
      }
    }

    // If there are submitted requirements (either pending or approved)
    if (requirementsStatus.pending > 0 || requirementsStatus.approved > 0) {
      return "pending";
    }

    // Default to not submitted
    return "not-submitted";
  };

  const overallStatus = getOverallRequirementStatus();

  return (
    <tr
      className={isSelected ? "student-selected-row" : ""}
      onClick={handleRowClick}
      style={{ cursor: selectionMode ? "default" : "pointer" }}
    >
      {selectionMode && (
        <td
          className="student-checkbox-cell"
          onClick={(event) => event.stopPropagation()}
        >
          <input
            type="checkbox"
            className="student-table-checkbox"
            checked={isSelected}
            onChange={onSelect}
          />
        </td>
      )}
      <td className="student-number-cell">
        {row.studentId ? (
          <span className="student-number-text">
            {row.studentId}
          </span>
        ) : (
          <span className="empty-value">-</span>
        )}
      </td>
      <td>{row.firstName}</td>
      <td>{row.lastName}</td>
      <td className="email-cell">
        {row.email && !row.email.includes("@student.internquest.local") ? (
          <a
            href={`mailto:${row.email}`}
            className="email-link"
            onClick={(e) => e.stopPropagation()}
          >
            {row.email}
          </a>
        ) : (
          <span className="empty-value">—</span>
        )}
      </td>
      <td className={!row.contact ? "empty-cell" : ""}>
        {row.contact || <span className="empty-value">—</span>}
      </td>
      <td className={!row.section ? "empty-cell" : ""}>
        {row.section ? (
          <span className="section-badge">{row.section.toUpperCase()}</span>
        ) : (
          <span className="empty-value">—</span>
        )}
      </td>
      <td className={!row.program ? "empty-cell" : "program-cell"}>
        {row.program ? (
          <span className="program-text">{row.program}</span>
        ) : (
          <span className="empty-value">—</span>
        )}
      </td>
      <td className={!row.field ? "empty-cell" : "field-cell"}>
        {row.field ? (
          <span className="field-badge">{row.field}</span>
        ) : (
          <span className="empty-value">—</span>
        )}
      </td>
      <td className="company-cell">
        {getCompanyName() ? (
          <span className="company-text">{getCompanyName()}</span>
        ) : (
          <span className="empty-value">—</span>
        )}
      </td>
      <td className="hired-status-cell">
        {row.status === "hired" ? (
          <span className="hired-badge hired-yes">Yes</span>
        ) : (
          <span className="hired-badge hired-no">No</span>
        )}
      </td>
      <td className="skills-cell">
        <div className="student-table-skills-tags">
          {/* Render up to 3 skills, with show more/less toggle */}
          {Array.isArray(row.skills) && row.skills.length > 0 ? (
            <>
              {(showAllSkills ? row.skills : row.skills.slice(0, 3)).map(
                (skill, index) => {
                  let displayValue = "";
                  if (typeof skill === "object" && skill !== null) {
                    if (
                      typeof skill.id === "string" ||
                      typeof skill.id === "number"
                    ) {
                      displayValue = String(skill.id);
                    } else if (Object.keys(skill).length > 0) {
                      displayValue = JSON.stringify(skill);
                    } else {
                      displayValue = "[object]";
                    }
                  } else if (
                    typeof skill === "string" ||
                    typeof skill === "number"
                  ) {
                    displayValue = String(skill);
                  } else {
                    displayValue = String(skill);
                  }
                  return (
                    <span key={index} className="student-table-skill-tag">
                      {displayValue}
                    </span>
                  );
                }
              )}
              {/* Show more/less toggle for skills */}
              {row.skills.length > 3 && !showAllSkills && (
                <span
                  className="student-table-skill-tag skill-toggle"
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowAllSkills(true);
                  }}
                >
                  +{row.skills.length - 3} more
                </span>
              )}
              {row.skills.length > 3 && showAllSkills && (
                <span
                  className="student-table-skill-tag skill-toggle"
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowAllSkills(false);
                  }}
                >
                  Show less
                </span>
              )}
            </>
          ) : (
            <span className="empty-value">—</span>
          )}
        </div>
      </td>
      <td className="requirement-status-indicator-cell">
        <div className="requirement-status-container">
          {overallStatus === "not-submitted" ? (
            <span
              className={`requirement-status-badge ${overallStatus}`}
              title={
                requirementsStatus.notSubmittedList && requirementsStatus.notSubmittedList.length > 0
                  ? `Not Submitted:\n• ${requirementsStatus.notSubmittedList.join('\n• ')}`
                  : `${requirementsStatus.notSubmitted} requirements not submitted`
              }
            >
              <span className="status-icon">✗</span>
              <span className="status-count">{requirementsStatus.notSubmitted}</span>
            </span>
          ) : overallStatus === "pending" ? (
            <div className="requirement-status-group">
              {requirementsStatus.notSubmitted > 0 && (
                <span
                  className={`requirement-status-badge not-submitted-mini`}
                  title={
                    requirementsStatus.notSubmittedList && requirementsStatus.notSubmittedList.length > 0
                      ? `Not Submitted:\n• ${requirementsStatus.notSubmittedList.join('\n• ')}`
                      : `${requirementsStatus.notSubmitted} requirements not submitted`
                  }
                >
                  <span className="status-icon">✗</span>
                  <span className="status-count">{requirementsStatus.notSubmitted}</span>
                </span>
              )}
              <span
                className={`requirement-status-badge pending`}
                title={
                  requirementsStatus.pendingList && requirementsStatus.pendingList.length > 0
                    ? `Pending Approval:\n• ${requirementsStatus.pendingList.join('\n• ')}`
                    : `${requirementsStatus.pending} requirements pending approval`
                }
              >
                <span className="status-icon">⏳</span>
                <span className="status-count">{requirementsStatus.pending}</span>
              </span>
              {requirementsStatus.approved > 0 && (
                <span
                  className={`requirement-status-badge approved-mini`}
                  title={
                    requirementsStatus.approvedList && requirementsStatus.approvedList.length > 0
                      ? `Approved:\n• ${requirementsStatus.approvedList.join('\n• ')}`
                      : `${requirementsStatus.approved} requirements approved`
                  }
                >
                  <span className="status-icon">✓</span>
                  <span className="status-count">{requirementsStatus.approved}</span>
                </span>
              )}
            </div>
          ) : (
            <span
              className={`requirement-status-badge ${overallStatus}`}
              title={
                requirementsStatus.approvedList && requirementsStatus.approvedList.length > 0
                  ? `All Approved:\n• ${requirementsStatus.approvedList.join('\n• ')}`
                  : `All ${requirementsStatus.approved} requirements approved`
              }
            >
              <span className="status-icon">✓</span>
              <span className="status-count">{requirementsStatus.approved}</span>
            </span>
          )}
        </div>
      </td>
      <td
        className="student-kebab-cell"
        onClick={(event) => event.stopPropagation()}
      >
        <KebabCell
          row={row}
          openMenuId={openMenuId}
          setOpenMenuId={setOpenMenuId}
          selectedRowId={selectedRowId}
          setSelectedRowId={setSelectedRowId}
          setIsEditMode={setIsEditMode}
          setEditStudentId={setEditStudentId}
          setFormData={setFormData}
          setSkills={setSkills}
          setIsModalOpen={setIsModalOpen}
          setSelectionMode={setSelectionMode}
          setSelectedItems={setSelectedItems}
          handleDeleteSingle={handleDeleteSingle}
          handleAcceptStudent={handleAcceptStudent}
          isDeleting={isDeleting}
          isAdviser={isAdviser}
        />
      </td>
    </tr>
  );
};

StudentTableRow.propTypes = {
  row: PropTypes.object.isRequired,
  onEdit: PropTypes.func,
  onDelete: PropTypes.func,
  isSelected: PropTypes.bool,
  onSelect: PropTypes.func,
  selectionMode: PropTypes.bool,
  openMenuId: PropTypes.any,
  setOpenMenuId: PropTypes.func,
  selectedRowId: PropTypes.any,
  setSelectedRowId: PropTypes.func,
  setIsEditMode: PropTypes.func,
  setEditStudentId: PropTypes.func,
  setFormData: PropTypes.func,
  setSkills: PropTypes.func,
  setIsModalOpen: PropTypes.func,
  setSelectionMode: PropTypes.func,
  setSelectedItems: PropTypes.func,
  handleDeleteSingle: PropTypes.func,
  handleAcceptStudent: PropTypes.func,
  isDeleting: PropTypes.bool,
  onRowClick: PropTypes.func,
  isAdviser: PropTypes.bool,
  requirementApprovals: PropTypes.object,
};

export default StudentTableRow;
