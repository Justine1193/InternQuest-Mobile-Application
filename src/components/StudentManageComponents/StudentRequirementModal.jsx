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

import React, { useState, useEffect, useRef } from "react";
import PropTypes from "prop-types";
import {
  IoCloseOutline,
  IoDocumentTextOutline,
  IoDownloadOutline,
  IoBanOutline,
  IoCheckmarkCircleOutline,
  IoRefreshOutline,
} from "react-icons/io5";
import { storage, db, auth, functions } from "../../../firebase";
import {
  ref,
  getDownloadURL,
  listAll,
  getMetadata,
  deleteObject,
  uploadBytes,
} from "firebase/storage";
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  collection,
  addDoc,
  query,
  where,
  orderBy,
  getDocs,
  limit,
} from "firebase/firestore";
// import { httpsCallable } from "firebase/functions"; // Removed - PDF function disabled
import { getAdminRole, hasAnyRole, ROLES } from "../../utils/auth";
import { activityLoggers } from "../../utils/activityLogger";
import { useToast } from "../../hooks/useToast";
import ToastContainer from "../Toast/ToastContainer";
import ConfirmModal from "../ConfirmModalComponents/ConfirmModal";
import "./StudentRequirementModal.css";

const StudentRequirementModal = ({
  open,
  student,
  onClose,
  onRequirementUpdated,
  onStudentUpdated,
  onShowSuccess,
  onShowError,
}) => {
  const { toasts, success, error: showError, removeToast } = useToast();
  const showSuccessToast = onShowSuccess ?? success;
  const showErrorToast = onShowError ?? showError;
  const [viewingFile, setViewingFile] = useState(null);
  const [viewingFileName, setViewingFileName] = useState("");
  const [profilePictureUrl, setProfilePictureUrl] = useState(null);
  const [profilePictureError, setProfilePictureError] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [storageFiles, setStorageFiles] = useState([]); // Files from Storage
  const [isLoadingStorageFiles, setIsLoadingStorageFiles] = useState(false);
  const [approvalStatuses, setApprovalStatuses] = useState({}); // { requirementType: { status, reviewedBy, reviewedAt } }
  const [isLoadingApprovals, setIsLoadingApprovals] = useState(false);
  const [updatingRequirement, setUpdatingRequirement] = useState(null); // Track which requirement is being updated
  // Rejection modal state
  const [showRejectionModal, setShowRejectionModal] = useState(false);
  const [rejectionRequirementType, setRejectionRequirementType] =
    useState(null);
  const [rejectionReason, setRejectionReason] = useState("");
  // Approval confirmation modal state
  const [showApprovalConfirmModal, setShowApprovalConfirmModal] =
    useState(false);
  const [approvalRequirementType, setApprovalRequirementType] = useState(null);
  const [creatorInfo, setCreatorInfo] = useState(null); // { username, role, createdAt }
  const [currentSignature, setCurrentSignature] = useState(null); // Current signature for preview
  const [popupMessage, setPopupMessage] = useState(null); // { type: 'success' | 'error', message: string }
  const [showBlockConfirm, setShowBlockConfirm] = useState(false);
  const [showUnblockConfirm, setShowUnblockConfirm] = useState(false);
  const [isBlocking, setIsBlocking] = useState(false);
  const canBlockUnblock = hasAnyRole([
    ROLES.SUPER_ADMIN,
    ROLES.COORDINATOR,
    ROLES.ADVISER,
  ]);
  const isBlocked = Boolean(student?.is_blocked);

  // Fetch creator information from student document or activity logs
  useEffect(() => {
    const fetchCreatorInfo = async () => {
      if (!student?.id || !auth.currentUser) {
        setCreatorInfo(null);
        return;
      }

      try {
        // First, check if student has createdBy field (preferred method)
        if (student.createdBy && typeof student.createdBy === "object") {
          setCreatorInfo({
            username: student.createdBy.username || "Unknown",
            role: student.createdBy.role || "Unknown",
            createdAt: student.createdAt || null,
          });
          return;
        }

        // Fallback: Query activity logs for the first "create_student" action for this student
        const activityLogsRef = collection(db, "activity_logs");
        const q = query(
          activityLogsRef,
          where("action", "==", "create_student"),
          where("entityId", "==", student.id),
          orderBy("timestamp", "asc"),
          limit(1),
        );

        const querySnapshot = await getDocs(q);
        if (!querySnapshot.empty) {
          const activityDoc = querySnapshot.docs[0];
          const activityData = activityDoc.data();
          setCreatorInfo({
            username: activityData.adminUsername || "Unknown",
            role: activityData.adminRole || "Unknown",
            createdAt:
              activityData.createdAt ||
              activityData.timestamp?.toDate?.()?.toISOString() ||
              null,
          });
        } else {
          setCreatorInfo(null);
        }
      } catch (error) {
        console.error("Error fetching creator info:", error);
        setCreatorInfo(null);
      }
    };

    if (open && student?.id && auth.currentUser) {
      fetchCreatorInfo();
    }
  }, [open, student?.id, student?.createdBy, student?.createdAt]);

  // Check if current user can approve requirements (adviser or coordinator)
  const canApproveRequirements = () => {
    const role = getAdminRole();
    return hasAnyRole([ROLES.ADVISER, ROLES.COORDINATOR, ROLES.SUPER_ADMIN]);
  };

  // Fetch files from Storage when modal opens - OPTIMIZED for speed
  useEffect(() => {
    const fetchStorageFiles = async () => {
      if (!open || !student || !student.id) {
        setStorageFiles([]);
        return;
      }

      setIsLoadingStorageFiles(true);
      try {
        // Path structure: requirements/{userId}/{folderName}/{fileName}
        const storagePath = `requirements/${student.id}`;
        const requirementsRef = ref(storage, storagePath);
        const folderList = await listAll(requirementsRef);

        // Map folder names to requirement types (STRICT MAPPING - no ambiguous matches)
        const folderMapping = {
          "proof-of-enrollment-com": "Proof of Enrollment (COM)",
          "parent-guardian-consent-form": "Notarized Parental Consent",
          "medical-certificate": "Medical Certificate",
          "psychological-test-certification":
            "Psychological Test Certification",
          "proof-of-insurance": "Proof of Insurance",
          "ojt-orientation": "OJT Orientation",
          "moa-memorandum-of-agreement": "Memorandum of Agreement (MOA)",
          "resume-cv": "Curriculum Vitae",
          "curriculum-vitae": "Curriculum Vitae",
          resume: "Curriculum Vitae",
          cv: "Curriculum Vitae",
          // Legacy mappings for backward compatibility (but these should not conflict)
          "insurance-certificate": "Proof of Insurance",
          // Explicitly map any variations to prevent confusion
          enrollment: "Proof of Enrollment (COM)",
          com: "Proof of Enrollment (COM)",
        };

        // OPTIMIZATION: Fetch all folders in PARALLEL instead of sequentially
        const folderPromises = folderList.prefixes.map(async (folderPrefix) => {
          const folderName = folderPrefix.name;
          try {
            const folderFiles = await listAll(folderPrefix);

            // Get download URLs for all files in this folder in parallel
            const filesWithUrls = await Promise.all(
              folderFiles.items.map(async (itemRef) => {
                try {
                  // Only fetch download URL first (faster), skip metadata initially
                  const downloadURL = await getDownloadURL(itemRef);

                  return {
                    name: itemRef.name,
                    fullPath: itemRef.fullPath,
                    folderName: folderName,
                    requirementType: folderMapping[folderName] || folderName,
                    downloadURL,
                    // Metadata will be fetched lazily when needed
                    size: null,
                    contentType:
                      itemRef.name.split(".").pop()?.toLowerCase() || "unknown",
                    timeCreated: null,
                    updated: null,
                  };
                } catch (error) {
                  return null;
                }
              }),
            );

            return filesWithUrls.filter((file) => file !== null);
          } catch (error) {
            return [];
          }
        });

        // Wait for all folders to be processed in parallel
        const allFolderResults = await Promise.all(folderPromises);
        const allFiles = allFolderResults.flat();

        setStorageFiles(allFiles);
      } catch (error) {
        if (error.code === "storage/object-not-found") {
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
          return;
        }
      } catch (error) {
        // If avatars folder doesn't exist, continue to other Storage paths
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
            `profilePictures/${student.id}/${fileName}`,
          );
          const url = await getDownloadURL(profileRef);
          setProfilePictureUrl(url);
          setProfilePictureError(false);
          return;
        } catch (e) {
          // Silently continue if file doesn't exist (404 is expected)
          // Only log if it's not a "not found" error
          if (
            e.code !== "storage/object-not-found" &&
            e.code !== "storage/unauthorized"
          ) {
            // Skip logging
          }
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

  // Fetch approval statuses from Firestore
  useEffect(() => {
    const fetchApprovalStatuses = async () => {
      if (!open || !student?.id || !auth.currentUser) {
        setApprovalStatuses({});
        return;
      }

      setIsLoadingApprovals(true);
      try {
        const approvalRef = doc(db, "requirement_approvals", student.id);
        const approvalSnap = await getDoc(approvalRef);

        if (approvalSnap.exists()) {
          setApprovalStatuses(approvalSnap.data());
        } else {
          setApprovalStatuses({});
        }
      } catch (error) {
        console.error("Error fetching approval statuses:", error);
        setApprovalStatuses({});
      } finally {
        setIsLoadingApprovals(false);
      }
    };

    if (auth.currentUser) {
      fetchApprovalStatuses();
    } else {
      setApprovalStatuses({});
    }
  }, [open, student?.id, auth.currentUser?.uid]);

  // Fetch current signature for preview
  useEffect(() => {
    const fetchCurrentSignature = async () => {
      if (!open || !auth.currentUser) {
        setCurrentSignature(null);
        return;
      }

      try {
        const signatureRef = doc(
          db,
          "teacher_signatures",
          auth.currentUser.uid,
        );
        const signatureSnap = await getDoc(signatureRef);

        if (signatureSnap.exists()) {
          const data = signatureSnap.data();
          setCurrentSignature({
            downloadUrl: data.downloadUrl,
            uploadedAt: data.uploadedAt,
          });
        } else {
          setCurrentSignature(null);
        }
      } catch (error) {
        console.error("Error fetching signature:", error);
        setCurrentSignature(null);
      }
    };

    fetchCurrentSignature();
  }, [open]);

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
      return "Memorandum of Agreement (MOA)";
    }
    if (
      nameLower.includes("resume") ||
      nameLower.includes("cv") ||
      nameLower.includes("curriculum vitae")
    ) {
      return "Curriculum Vitae";
    }
    if (nameLower.includes("enrollment") || nameLower.includes("com")) {
      return "Proof of Enrollment (COM)";
    }
    if (
      nameLower.includes("parent") ||
      nameLower.includes("guardian") ||
      nameLower.includes("consent")
    ) {
      return "Notarized Parental Consent";
    }
    if (nameLower.includes("medical") || nameLower.includes("health")) {
      return "Medical Certificate";
    }
    if (nameLower.includes("psychological") || nameLower.includes("psych")) {
      return "Psychological Test Certification";
    }
    // Only detect as Proof of Insurance if BOTH "proof" AND "insurance" are present
    // This prevents company insurance documents from being misidentified
    if (nameLower.includes("proof") && nameLower.includes("insurance")) {
      return "Proof of Insurance";
    }
    if (nameLower.includes("ojt") && nameLower.includes("orientation")) {
      return "OJT Orientation";
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

  // Handle opening approval confirmation modal
  const handleApproveRequirementClick = (requirementType) => {
    if (!student?.id || !canApproveRequirements()) return;
    setApprovalRequirementType(requirementType);
    setShowApprovalConfirmModal(true);
  };

  // Handle closing approval confirmation modal
  const handleCloseApprovalConfirmModal = () => {
    setShowApprovalConfirmModal(false);
    setApprovalRequirementType(null);
  };

  const handleBlockStudent = async () => {
    if (!student?.id || !canBlockUnblock) return;
    setIsBlocking(true);
    setShowBlockConfirm(false);
    try {
      const userRef = doc(db, "users", student.id);
      await updateDoc(userRef, { is_blocked: true });
      const studentName =
        [student.firstName, student.lastName].filter(Boolean).join(" ") ||
        student.studentId ||
        student.id;
      activityLoggers.blockStudent(student.id, studentName);
      showSuccessToast(
        "Student has been blocked. They will not be able to access the mobile app.",
      );
      onStudentUpdated?.({ ...student, is_blocked: true });
    } catch (err) {
      console.error("Error blocking student:", err);
      showErrorToast(err?.message || "Failed to block student.");
    } finally {
      setIsBlocking(false);
    }
  };

  const handleUnblockStudent = async () => {
    if (!student?.id || !canBlockUnblock) return;
    setIsBlocking(true);
    setShowUnblockConfirm(false);
    try {
      const userRef = doc(db, "users", student.id);
      await updateDoc(userRef, { is_blocked: false });
      const studentName =
        [student.firstName, student.lastName].filter(Boolean).join(" ") ||
        student.studentId ||
        student.id;
      activityLoggers.unblockStudent(student.id, studentName);
      showSuccessToast(
        "Student has been unblocked. They can access the mobile app again.",
      );
      onStudentUpdated?.({ ...student, is_blocked: false });
    } catch (err) {
      console.error("Error unblocking student:", err);
      showErrorToast(err?.message || "Failed to unblock student.");
    } finally {
      setIsBlocking(false);
    }
  };

  // Handle approving a requirement (called after confirmation)
  const handleAcceptRequirement = async () => {
    if (!student?.id || !approvalRequirementType || !canApproveRequirements())
      return;

    // Verify user is authenticated
    if (!auth.currentUser) {
      showError("You must be logged in to approve requirements.");
      handleCloseApprovalConfirmModal();
      return;
    }

    setShowApprovalConfirmModal(false);
    setUpdatingRequirement(approvalRequirementType);
    const requirementType = approvalRequirementType;
    setApprovalRequirementType(null);
    try {
      // Save approval without PDF generation
      const approvalDate = new Date().toISOString();

      // Save approval without signed PDF URL
      const approvalRef = doc(db, "requirement_approvals", student.id);

      // Get current document data if it exists
      let currentData = approvalStatuses || {};
      let documentExists = false;

      try {
        const currentDoc = await getDoc(approvalRef);
        if (currentDoc.exists()) {
          currentData = currentDoc.data();
          documentExists = true;
        }
      } catch (getError) {
        // If document doesn't exist, start with empty object
      }

      const updateData = {
        ...currentData,
        [requirementType]: {
          status: "accepted",
          reviewedBy: getAdminRole(),
          reviewedAt: approvalDate,
          // signedPdfUrl and signedPdfPath removed - PDF function disabled
        },
      };

      // Use setDoc with merge to create or update
      // This works for both creating new documents and updating existing ones
      if (documentExists) {
        // Document exists, use updateDoc for better permission handling
        await updateDoc(approvalRef, {
          [requirementType]: {
            status: "accepted",
            reviewedBy: getAdminRole(),
            reviewedAt: approvalDate,
          },
        });
        // Update local state with merged data
        setApprovalStatuses(updateData);
      } else {
        // Document doesn't exist, use setDoc to create
        await setDoc(approvalRef, updateData);
        setApprovalStatuses(updateData);
      }

      setApprovalStatuses(updateData);

      // Send notification to student
      const studentName =
        `${student.firstName || ""} ${student.lastName || ""}`.trim() ||
        "Student";
      const notificationMessage = `${studentName}, your ${requirementType} has been approved.`;

      try {
        const notificationData = {
          message: notificationMessage,
          timestamp: new Date().toISOString(),
          read: false,
          userId: student.id || null, // Student's ID so they can see the notification
          targetType: "student",
          targetStudentId: student.id,
          targetStudentName: studentName,
          sentBy: auth.currentUser?.uid || null, // Track who sent it (admin)
        };

        await addDoc(collection(db, "notifications"), notificationData);
      } catch (notifError) {
        console.error("Error sending notification:", notifError);
        // Don't fail the approval if notification fails
      }

      // Show success toast
      success(
        `${requirementType} approved successfully! ${studentName} has been notified.`,
      );

      // Show popup message in modal
      setPopupMessage({
        type: "success",
        message: `${requirementType} approved successfully! ${studentName} has been notified.`,
      });

      // Auto-hide popup after 5 seconds
      setTimeout(() => {
        setPopupMessage(null);
      }, 5000);

      // Notify parent component that requirement was updated
      if (onRequirementUpdated) {
        onRequirementUpdated(student.id, requirementType, "accepted");
      }
    } catch (error) {
      console.error("Error approving requirement:", error);
      console.error("Error details:", {
        code: error.code,
        message: error.message,
        details: error.details,
        stack: error.stack,
        studentId: student?.id,
        requirementType: requirementType,
        currentUser: auth.currentUser?.uid,
        isAuthenticated: !!auth.currentUser,
      });

      // Show error toast with more helpful message
      const errorMessage =
        error.code === "permission-denied"
          ? "Permission denied. Please make sure you are logged in and have the correct permissions. If the issue persists, contact your administrator."
          : `Failed to approve requirement: ${
              error.message || error.code || "Please try again."
            }`;

      showError(errorMessage);

      // Show popup message in modal
      setPopupMessage({
        type: "error",
        message: errorMessage,
      });

      // Auto-hide popup after 5 seconds
      setTimeout(() => {
        setPopupMessage(null);
      }, 5000);
    } finally {
      setUpdatingRequirement(null);
    }
  };

  // Handle opening rejection modal
  const handleRejectRequirement = (requirementType) => {
    if (!student?.id || !canApproveRequirements()) return;
    setRejectionRequirementType(requirementType);
    setRejectionReason("");
    setShowRejectionModal(true);
  };

  // Handle closing rejection modal
  const handleCloseRejectionModal = () => {
    setShowRejectionModal(false);
    setRejectionRequirementType(null);
    setRejectionReason("");
  };

  // Handle submitting rejection
  const handleSubmitRejection = async () => {
    if (!student?.id || !rejectionRequirementType || !canApproveRequirements())
      return;

    // Verify user is authenticated
    if (!auth.currentUser) {
      showError("You must be logged in to reject requirements.");
      return;
    }

    setUpdatingRequirement(rejectionRequirementType);
    try {
      const approvalRef = doc(db, "requirement_approvals", student.id);

      // Get current document data if it exists
      let currentData = approvalStatuses || {};
      let documentExists = false;

      try {
        const currentDoc = await getDoc(approvalRef);
        if (currentDoc.exists()) {
          currentData = currentDoc.data();
          documentExists = true;
        }
      } catch (getError) {
        // If document doesn't exist, start with empty object
      }

      const updateData = {
        ...currentData,
        [rejectionRequirementType]: {
          status: "denied",
          reviewedBy: getAdminRole(),
          reviewedAt: new Date().toISOString(),
          reason: rejectionReason.trim() || "",
        },
      };

      // Use setDoc with merge to create or update
      // This works for both creating new documents and updating existing ones
      if (documentExists) {
        // Document exists, use updateDoc for better permission handling
        await updateDoc(approvalRef, {
          [rejectionRequirementType]: {
            status: "denied",
            reviewedBy: getAdminRole(),
            reviewedAt: new Date().toISOString(),
            reason: rejectionReason.trim() || "",
          },
        });
        // Update local state with merged data
        setApprovalStatuses(updateData);
      } else {
        // Document doesn't exist, use setDoc to create
        await setDoc(approvalRef, updateData);
        setApprovalStatuses(updateData);
      }

      // Delete files from Firebase Storage for this requirement
      try {
        // Map requirement type to folder name
        const requirementToFolderMap = {
          "Proof of Enrollment (COM)": "proof-of-enrollment-com",
          "Notarized Parental Consent": "parent-guardian-consent-form",
          "Medical Certificate": "medical-certificate",
          "Psychological Test Certification":
            "psychological-test-certification",
          "Proof of Insurance": "proof-of-insurance",
          "Memorandum of Agreement (MOA)": "moa-memorandum-of-agreement",
          "Curriculum Vitae": "resume-cv",
          Resume: "resume-cv",
          CV: "resume-cv",
          "Resume/CV": "resume-cv",
        };

        // Get folder name for this requirement
        let folderName = requirementToFolderMap[rejectionRequirementType];

        // If no exact match, try to find by keywords
        if (!folderName) {
          const reqLower = rejectionRequirementType.toLowerCase();
          if (reqLower.includes("enrollment") || reqLower.includes("com")) {
            folderName = "proof-of-enrollment-com";
          } else if (
            reqLower.includes("parent") ||
            reqLower.includes("consent")
          ) {
            folderName = "parent-guardian-consent-form";
          } else if (reqLower.includes("medical")) {
            folderName = "medical-certificate";
          } else if (reqLower.includes("psychological")) {
            folderName = "psychological-test-certification";
          } else if (reqLower.includes("insurance")) {
            folderName = "proof-of-insurance";
          } else if (
            reqLower.includes("moa") ||
            reqLower.includes("memorandum") ||
            reqLower.includes("agreement")
          ) {
            folderName = "moa-memorandum-of-agreement";
          } else if (
            reqLower.includes("resume") ||
            reqLower.includes("cv") ||
            reqLower.includes("curriculum") ||
            reqLower.includes("vitae")
          ) {
            folderName = "resume-cv";
          }
        }

        if (folderName) {
          const storagePath = `requirements/${student.id}/${folderName}`;
          const folderRef = ref(storage, storagePath);

          try {
            // List all files in the folder
            const folderFiles = await listAll(folderRef);

            // Archive and delete each file
            const archiveAndDeletePromises = folderFiles.items.map(
              async (fileRef) => {
                try {
                  // Get file metadata and download URL before deleting
                  const [downloadURL, metadata] = await Promise.all([
                    getDownloadURL(fileRef),
                    getMetadata(fileRef),
                  ]);

                  // Download the file
                  const response = await fetch(downloadURL);
                  const blob = await response.blob();

                  // Archive path: archive/rejected_requirements/{studentId}/{requirementType}/{timestamp}-{filename}
                  const timestamp = Date.now();
                  const safeRequirementType = rejectionRequirementType.replace(
                    /[^a-zA-Z0-9]/g,
                    "_",
                  );
                  const archivePath = `archive/rejected_requirements/${student.id}/${safeRequirementType}/${timestamp}-${fileRef.name}`;
                  const archiveRef = ref(storage, archivePath);

                  // Upload to archive location
                  await uploadBytes(archiveRef, blob, {
                    contentType:
                      metadata.contentType || "application/octet-stream",
                  });

                  const archiveURL = await getDownloadURL(archiveRef);

                  // Save archive metadata to Firestore
                  await addDoc(collection(db, "rejected_requirements"), {
                    studentId: student.id,
                    studentName:
                      `${student.firstName || ""} ${
                        student.lastName || ""
                      }`.trim() || "Unknown",
                    requirementType: rejectionRequirementType,
                    fileName: fileRef.name,
                    originalPath: fileRef.fullPath,
                    archivePath: archivePath,
                    archiveURL: archiveURL,
                    fileSize: metadata.size,
                    contentType: metadata.contentType,
                    rejectedAt: new Date().toISOString(),
                    rejectedBy: getAdminRole(),
                    rejectionReason: rejectionReason.trim() || "",
                    originalUploadedAt: metadata.timeCreated || null,
                  });

                  // Now delete the original file
                  await deleteObject(fileRef);
                } catch (error) {
                  // Try to delete anyway even if archive failed
                  try {
                    await deleteObject(fileRef);
                  } catch (deleteError) {
                    // Ignore
                  }
                }
              },
            );

            await Promise.all(archiveAndDeletePromises);

            // Refresh storage files list to update UI
            const storagePathRoot = `requirements/${student.id}`;
            const requirementsRef = ref(storage, storagePathRoot);
            const folderList = await listAll(requirementsRef);

            const folderMapping = {
              "proof-of-enrollment-com": "Proof of Enrollment (COM)",
              "parent-guardian-consent-form": "Notarized Parental Consent",
              "medical-certificate": "Medical Certificate",
              "psychological-test-certification":
                "Psychological Test Certification",
              "proof-of-insurance": "Proof of Insurance",
              "ojt-orientation": "OJT Orientation",
              "moa-memorandum-of-agreement": "Memorandum of Agreement (MOA)",
              "resume-cv": "Curriculum Vitae",
              "curriculum-vitae": "Curriculum Vitae",
              resume: "Curriculum Vitae",
              cv: "Curriculum Vitae",
              "insurance-certificate": "Proof of Insurance",
            };

            const allFiles = [];
            for (const folderPrefix of folderList.prefixes) {
              const folderNameItem = folderPrefix.name;
              try {
                const folderFiles = await listAll(folderPrefix);
                const filesWithUrls = await Promise.all(
                  folderFiles.items.map(async (itemRef) => {
                    try {
                      const [downloadURL, metadata] = await Promise.all([
                        getDownloadURL(itemRef),
                        getMetadata(itemRef),
                      ]);
                      return {
                        name: itemRef.name,
                        fullPath: itemRef.fullPath,
                        folderName: folderNameItem,
                        requirementType:
                          folderMapping[folderNameItem] || folderNameItem,
                        downloadURL,
                        size: metadata.size,
                        contentType: metadata.contentType,
                        timeCreated: metadata.timeCreated,
                        updated: metadata.updated,
                      };
                    } catch (error) {
                      return null;
                    }
                  }),
                );
                allFiles.push(...filesWithUrls.filter((file) => file !== null));
              } catch (error) {
                // Skip failed folder
              }
            }
            setStorageFiles(allFiles);
          } catch (listError) {
            // Ignore list errors
          }
        }
      } catch (storageError) {
        // Non-critical
      }

      // Notify parent component that requirement was updated
      if (onRequirementUpdated) {
        onRequirementUpdated(student.id, rejectionRequirementType, "denied");
      }

      // Send notification to student
      const studentName =
        `${student.firstName || ""} ${student.lastName || ""}`.trim() ||
        "Student";
      const reasonText = rejectionReason.trim()
        ? ` Reason: ${rejectionReason.trim()}`
        : "";
      const notificationMessage = `${studentName}, your ${rejectionRequirementType} has been rejected.${reasonText}`;

      try {
        const notificationData = {
          message: notificationMessage,
          timestamp: new Date().toISOString(),
          read: false,
          userId: student.id || null, // Student's ID so they can see the notification
          targetType: "student",
          targetStudentId: student.id,
          targetStudentName: studentName,
          sentBy: auth.currentUser?.uid || null, // Track who sent it (admin)
        };

        await addDoc(collection(db, "notifications"), notificationData);
      } catch (notifError) {
        console.error("Error sending notification:", notifError);
        // Don't fail the rejection if notification fails
      }

      handleCloseRejectionModal();

      // Show success toast
      success(
        `${rejectionRequirementType} rejected. ${studentName} has been notified.`,
      );

      // Show popup message in modal
      setPopupMessage({
        type: "success",
        message: `${rejectionRequirementType} rejected. ${studentName} has been notified.`,
      });

      // Auto-hide popup after 5 seconds
      setTimeout(() => {
        setPopupMessage(null);
      }, 5000);
    } catch (error) {
      console.error("Error rejecting requirement:", error);
      const errorMessage = "Failed to reject requirement. Please try again.";
      showError(errorMessage);

      // Show popup message in modal
      setPopupMessage({
        type: "error",
        message: errorMessage,
      });

      // Auto-hide popup after 5 seconds
      setTimeout(() => {
        setPopupMessage(null);
      }, 5000);
    } finally {
      setUpdatingRequirement(null);
    }
  };

  // Get approval status for a requirement
  const getApprovalStatus = (requirementType) => {
    return approvalStatuses[requirementType] || null;
  };

  return (
    <>
      <ToastContainer toasts={toasts} removeToast={removeToast} />
      <div className="student-requirement-modal-backdrop" onClick={onClose}>
        <div
          className="student-requirement-modal"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="student-requirement-modal-header">
            <div className="modal-header-content">
              <h2>Student Files</h2>
              <p className="modal-subtitle">
                View and manage student documents
              </p>
            </div>
            <button
              className="close-btn"
              onClick={onClose}
              aria-label="Close modal"
            >
              <IoCloseOutline />
            </button>
          </div>

          {/* Popup Message Banner */}
          {popupMessage && (
            <div className={`student-modal-popup-message ${popupMessage.type}`}>
              <div className="popup-message-content">
                <span className="popup-icon">
                  {popupMessage.type === "success" ? "✓" : "✗"}
                </span>
                <span className="popup-text">{popupMessage.message}</span>
              </div>
              <button
                className="popup-close-btn"
                onClick={() => setPopupMessage(null)}
                aria-label="Close message"
              >
                <IoCloseOutline />
              </button>
            </div>
          )}

          <div className="student-requirement-modal-content">
            {/* Student Profile Card */}
            <div className="student-profile-card">
              <div className="profile-card-header">
                <div className="profile-avatar-section">
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
                  <div className="profile-main-info">
                    <h3 className="student-name">
                      {student.firstName} {student.lastName}
                    </h3>
                    <p className="student-id-display">
                      {student.studentId || "No ID"}
                    </p>
                    <div className="student-status-badges">
                      {isBlocked ? (
                        <span className="status-badge blocked">Blocked</span>
                      ) : (
                        <span className="status-badge active">Active</span>
                      )}
                      {student.status === "hired" ? (
                        <span className="status-badge hired">Hired</span>
                      ) : (
                        <span className="status-badge not-hired">
                          Not Hired
                        </span>
                      )}
                      {student.section && (
                        <span className="status-badge section">
                          {student.section}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                {creatorInfo && (
                  <div className="profile-meta">
                    <span className="meta-label">Added by</span>
                    <span className="meta-value">{creatorInfo.username}</span>
                  </div>
                )}
              </div>

              {/* Student Details Grid */}
              <div className="student-details-grid">
                <div className="detail-item">
                  <span className="detail-icon">📧</span>
                  <div className="detail-content">
                    <span className="detail-label">Email</span>
                    <span className="detail-value">
                      {student.email &&
                      !student.email.includes("@student.internquest.local") ? (
                        student.email
                      ) : (
                        <span className="empty-value">Not set</span>
                      )}
                    </span>
                  </div>
                </div>

                <div className="detail-item">
                  <span className="detail-icon">📱</span>
                  <div className="detail-content">
                    <span className="detail-label">Contact</span>
                    <span className="detail-value">
                      {student.contact || (
                        <span className="empty-value">Not set</span>
                      )}
                    </span>
                  </div>
                </div>

                <div className="detail-item">
                  <span className="detail-icon">🎓</span>
                  <div className="detail-content">
                    <span className="detail-label">Program</span>
                    <span className="detail-value">
                      {student.program || (
                        <span className="empty-value">Not set</span>
                      )}
                    </span>
                  </div>
                </div>

                <div className="detail-item">
                  <span className="detail-icon">🏫</span>
                  <div className="detail-content">
                    <span className="detail-label">College</span>
                    <span className="detail-value">
                      {student.college || (
                        <span className="empty-value">Not set</span>
                      )}
                    </span>
                  </div>
                </div>

                <div className="detail-item">
                  <span className="detail-icon">🕒</span>
                  <div className="detail-content">
                    <span className="detail-label">Created At</span>
                    <span className="detail-value">
                      {student.createdAt ? (
                        (() => {
                          try {
                            const date = new Date(student.createdAt);
                            return date.toLocaleString();
                          } catch (e) {
                            return (
                              <span className="empty-value">Invalid date</span>
                            );
                          }
                        })()
                      ) : (
                        <span className="empty-value">Not set</span>
                      )}
                    </span>
                  </div>
                </div>

                <div className="detail-item">
                  <span className="detail-icon">💼</span>
                  <div className="detail-content">
                    <span className="detail-label">Field</span>
                    <span className="detail-value">
                      {student.field ? (
                        <span className="field-tag">{student.field}</span>
                      ) : (
                        <span className="empty-value">Not set</span>
                      )}
                    </span>
                  </div>
                </div>

                <div className="detail-item">
                  <span className="detail-icon">🏢</span>
                  <div className="detail-content">
                    <span className="detail-label">Company</span>
                    <span className="detail-value">
                      {student.company ||
                        student.companyName ||
                        student.selectedCompany || (
                          <span className="empty-value">Not assigned</span>
                        )}
                    </span>
                  </div>
                </div>

                {(student.applicationDate ||
                  student.companyApplicationDate ||
                  student.appliedDate ||
                  student.selectedCompanyDate ||
                  (student.selectedCompany ||
                  student.company ||
                  student.companyName
                    ? student.createdAt
                    : null)) && (
                  <div className="detail-item">
                    <span className="detail-icon">📅</span>
                    <div className="detail-content">
                      <span className="detail-label">Application Date</span>
                      <span className="detail-value">
                        {(() => {
                          const applicationDate =
                            student.applicationDate ||
                            student.companyApplicationDate ||
                            student.appliedDate ||
                            student.selectedCompanyDate ||
                            (student.selectedCompany ||
                            student.company ||
                            student.companyName
                              ? student.createdAt
                              : null);

                          if (applicationDate) {
                            try {
                              const date = new Date(applicationDate);
                              return date.toLocaleDateString("en-US", {
                                year: "numeric",
                                month: "long",
                                day: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                              });
                            } catch (e) {
                              return (
                                <span className="empty-value">
                                  Invalid date
                                </span>
                              );
                            }
                          }
                          return <span className="empty-value">Not set</span>;
                        })()}
                      </span>
                    </div>
                  </div>
                )}

                {student.skills &&
                  Array.isArray(student.skills) &&
                  student.skills.length > 0 && (
                    <div className="detail-item full-width">
                      <span className="detail-icon">🛠️</span>
                      <div className="detail-content">
                        <span className="detail-label">Skills</span>
                        <div className="skills-list">
                          {student.skills.slice(0, 5).map((skill, index) => (
                            <span key={index} className="skill-tag">
                              {typeof skill === "object"
                                ? skill.id ||
                                  skill.name ||
                                  JSON.stringify(skill)
                                : skill}
                            </span>
                          ))}
                          {student.skills.length > 5 && (
                            <span className="skill-tag more">
                              +{student.skills.length - 5} more
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
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
            <div className="documents-section">
              <div className="section-header">
                <div className="section-title-group">
                  <h3 className="section-title">
                    <IoDocumentTextOutline className="section-icon" />
                    Required Documents
                  </h3>
                  <p className="section-subtitle">
                    Upload and manage student requirements
                  </p>
                </div>
                <div className="documents-progress">
                  {(() => {
                    const REQUIRED_FOLDERS = new Set([
                      "proof-of-enrollment-com",
                      "parent-guardian-consent-form",
                      "medical-certificate",
                      "psychological-test-certification",
                      "proof-of-insurance",
                      "moa-memorandum-of-agreement",
                      "resume-cv",
                    ]);
                    const submittedFolderNames = new Set(
                      (storageFiles || [])
                        .map((f) => f.folderName)
                        .filter(
                          (n) =>
                            typeof n === "string" && REQUIRED_FOLDERS.has(n),
                        ),
                    );
                    const submittedCount = submittedFolderNames.size;
                    return (
                      <span className="progress-text">
                        {submittedCount} / 7 submitted
                      </span>
                    );
                  })()}
                  <div className="progress-bar">
                    {(() => {
                      const REQUIRED_FOLDERS = new Set([
                        "proof-of-enrollment-com",
                        "parent-guardian-consent-form",
                        "medical-certificate",
                        "psychological-test-certification",
                        "proof-of-insurance",
                        "moa-memorandum-of-agreement",
                        "resume-cv",
                      ]);
                      const submittedFolderNames = new Set(
                        (storageFiles || [])
                          .map((f) => f.folderName)
                          .filter(
                            (n) =>
                              typeof n === "string" && REQUIRED_FOLDERS.has(n),
                          ),
                      );
                      const submittedCount = submittedFolderNames.size;
                      const pct = Math.min(
                        100,
                        Math.max(0, (submittedCount / 7) * 100),
                      );
                      return (
                        <div
                          className="progress-fill"
                          style={{ width: `${pct}%` }}
                        />
                      );
                    })()}
                  </div>
                </div>
              </div>
              <div className="requirement-section">
                {isLoadingStorageFiles ? (
                  <div className="loading-requirements">
                    <div className="loading-skeleton-grid">
                      {[1, 2, 3, 4, 5, 6, 7].map((i) => (
                        <div key={i} className="skeleton-card">
                          <div className="skeleton-header">
                            <div className="skeleton-icon"></div>
                            <div className="skeleton-title"></div>
                          </div>
                          <div className="skeleton-desc"></div>
                          <div className="skeleton-status"></div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="document-list">
                    {(() => {
                      const REQUIRED_DOCUMENTS_LIST = [
                        {
                          type: "Proof of Enrollment (COM)",
                          description:
                            "Proof of enrollment certificate from the school.",
                          keywords: ["enrollment", "com", "proof"],
                          folderName: "proof-of-enrollment-com",
                        },
                        {
                          type: "Notarized Parental Consent",
                          description:
                            "Notarized consent form from parent or guardian.",
                          keywords: [
                            "parent",
                            "guardian",
                            "consent",
                            "notarized",
                          ],
                          folderName: "parent-guardian-consent-form",
                        },
                        {
                          type: "Medical Certificate",
                          description:
                            "Medical clearance from a licensed physician.",
                          keywords: [
                            "medical",
                            "health",
                            "clearance",
                            "certificate",
                          ],
                          folderName: "medical-certificate",
                        },
                        {
                          type: "Psychological Test Certification",
                          description:
                            "Psychological test certification or clearance.",
                          keywords: ["psychological", "test", "certification"],
                          folderName: "psychological-test-certification",
                        },
                        {
                          type: "Proof of Insurance",
                          description:
                            "Insurance certificate or proof of coverage.",
                          keywords: ["insurance", "proof", "certificate"],
                          folderName: "proof-of-insurance",
                        },
                        {
                          type: "Memorandum of Agreement (MOA)",
                          description:
                            "Signed agreement between your school and the company.",
                          keywords: ["moa", "memorandum", "agreement"],
                          folderName: "moa-memorandum-of-agreement",
                        },
                        {
                          type: "Curriculum Vitae",
                          description: "Updated resume or curriculum vitae.",
                          keywords: ["resume", "cv", "curriculum", "vitae"],
                          folderName: "resume-cv",
                        },
                      ];

                      return REQUIRED_DOCUMENTS_LIST;
                    })().map((requirement, index) => {
                      // Find matching file from Storage by folder name first (STRICT MATCHING)
                      let matchingFile = storageFiles.find(
                        (file) => file.folderName === requirement.folderName,
                      );

                      // If no match by folder name, try requirementType matching (exact match only)
                      if (!matchingFile) {
                        matchingFile = storageFiles.find(
                          (file) => file.requirementType === requirement.type,
                        );
                      }

                      const approvalStatus = getApprovalStatus(
                        requirement.type,
                      );
                      const isUpdating =
                        updatingRequirement === requirement.type;

                      // Determine display status
                      // Priority: Approval status > File submission status
                      let status = "Pending";
                      let statusColor = "#fb8c00";

                      if (approvalStatus) {
                        if (approvalStatus.status === "accepted") {
                          status = "Approved";
                          statusColor = "#2e7d32";
                        } else if (approvalStatus.status === "denied") {
                          status = "Rejected";
                          statusColor = "#d32f2f";
                        } else {
                          // If approvalStatus exists but status is not accepted/denied (e.g., pending_review)
                          // and file exists, show as "Pending Review"
                          status = matchingFile ? "Pending Review" : "Pending";
                          statusColor = "#fb8c00";
                        }
                      } else if (matchingFile) {
                        // File exists but no approval status yet
                        status = "Submitted";
                        statusColor = "#43a047";
                      }

                      return (
                        <div
                          key={index}
                          className={`document-item ${
                            matchingFile ? "has-file" : "no-file"
                          }`}
                        >
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
                            {approvalStatus?.reason && (
                              <p
                                className="rejection-reason"
                                style={{
                                  color: "#d32f2f",
                                  marginTop: "6px",
                                  fontStyle: "italic",
                                }}
                              >
                                Rejection reason: {approvalStatus.reason}
                              </p>
                            )}
                            {approvalStatus?.reviewedBy && (
                              <p className="review-info">
                                Reviewed by {approvalStatus.reviewedBy} on{" "}
                                {new Date(
                                  approvalStatus.reviewedAt,
                                ).toLocaleDateString()}
                              </p>
                            )}
                          </div>
                          {matchingFile ? (
                            <div className="document-files">
                              <button
                                onClick={(e) =>
                                  handleFileClick(
                                    e,
                                    matchingFile.downloadURL,
                                    matchingFile.name,
                                  )
                                }
                                className="document-link"
                                title={`View ${matchingFile.name}`}
                              >
                                📄 {matchingFile.name}
                              </button>
                              {canApproveRequirements() && !approvalStatus && (
                                <div className="approval-actions">
                                  <button
                                    onClick={() =>
                                      handleApproveRequirementClick(
                                        requirement.type,
                                      )
                                    }
                                    className="approve-btn"
                                    disabled={isUpdating}
                                    title="Approve this requirement"
                                  >
                                    {isUpdating ? "..." : "✓ Approve"}
                                  </button>
                                  <button
                                    onClick={() =>
                                      handleRejectRequirement(requirement.type)
                                    }
                                    className="reject-btn"
                                    disabled={isUpdating}
                                    title="Reject this requirement"
                                  >
                                    {isUpdating ? "..." : "✗ Reject"}
                                  </button>
                                </div>
                              )}
                              {canApproveRequirements() && approvalStatus && (
                                <div className="approval-actions">
                                  <button
                                    onClick={() =>
                                      handleApproveRequirementClick(
                                        requirement.type,
                                      )
                                    }
                                    className={`approve-btn ${
                                      approvalStatus.status === "accepted"
                                        ? "active"
                                        : ""
                                    }`}
                                    disabled={isUpdating}
                                    title="Approve this requirement"
                                  >
                                    {isUpdating ? "..." : "✓ Approve"}
                                  </button>
                                  <button
                                    onClick={() =>
                                      handleRejectRequirement(requirement.type)
                                    }
                                    className={`reject-btn ${
                                      approvalStatus.status === "denied"
                                        ? "active"
                                        : ""
                                    }`}
                                    disabled={isUpdating}
                                    title="Reject this requirement"
                                  >
                                    {isUpdating ? "..." : "✗ Reject"}
                                  </button>
                                </div>
                              )}
                            </div>
                          ) : (
                            <div
                              className="document-files"
                              style={{
                                color: "#94a3b8",
                                fontSize: "0.85rem",
                                fontStyle: "italic",
                                padding: "8px 0",
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
          </div>

          <div className="student-requirement-modal-actions">
            {canBlockUnblock &&
              (isBlocked ? (
                <button
                  type="button"
                  className="unblock-student-btn"
                  onClick={() => setShowUnblockConfirm(true)}
                  disabled={isBlocking}
                  aria-label={isBlocking ? "Unblocking..." : "Unblock student"}
                >
                  {isBlocking ? (
                    <>
                      <IoRefreshOutline
                        className="block-unblock-spinner"
                        aria-hidden="true"
                      />
                      Unblocking...
                    </>
                  ) : (
                    <>
                      <IoCheckmarkCircleOutline />
                      Unblock Student
                    </>
                  )}
                </button>
              ) : (
                <button
                  type="button"
                  className="block-student-btn"
                  onClick={() => setShowBlockConfirm(true)}
                  disabled={isBlocking}
                  aria-label={isBlocking ? "Blocking..." : "Block student"}
                >
                  {isBlocking ? (
                    <>
                      <IoRefreshOutline
                        className="block-unblock-spinner"
                        aria-hidden="true"
                      />
                      Blocking...
                    </>
                  ) : (
                    <>
                      <IoBanOutline />
                      Block Student
                    </>
                  )}
                </button>
              ))}
            <button className="close-modal-btn" onClick={onClose}>
              Close
            </button>
          </div>
        </div>

        {/* Block student confirmation */}
        <ConfirmModal
          open={showBlockConfirm}
          title="Block Student?"
          message="Are you sure you want to block this student? They will no longer be able to access the mobile app."
          confirmButtonText="Yes, block student"
          confirmButtonClass="confirm-btn block-confirm-btn"
          onConfirm={handleBlockStudent}
          onCancel={() => setShowBlockConfirm(false)}
        />

        {/* Unblock student confirmation */}
        <ConfirmModal
          open={showUnblockConfirm}
          title="Unblock Student?"
          message="This student will be able to log in and use the mobile app again."
          confirmButtonText="Yes, unblock student"
          confirmButtonClass="confirm-btn unblock-confirm-btn"
          onConfirm={handleUnblockStudent}
          onCancel={() => setShowUnblockConfirm(false)}
        />

        {/* Rejection Reason Modal */}
        {showRejectionModal && (
          <div
            className="rejection-modal-backdrop"
            onClick={handleCloseRejectionModal}
          >
            <div
              className="rejection-modal"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="rejection-modal-header">
                <h3>Reject Requirement</h3>
                <button
                  className="rejection-modal-close"
                  onClick={handleCloseRejectionModal}
                  aria-label="Close modal"
                >
                  <IoCloseOutline />
                </button>
              </div>
              <div className="rejection-modal-content">
                <p className="rejection-modal-question">
                  Please provide a reason for rejecting this requirement.
                </p>
                <p className="rejection-modal-requirement">
                  <strong>Requirement:</strong> {rejectionRequirementType}
                </p>
                <textarea
                  className="rejection-reason-input"
                  placeholder="Enter rejection reason (optional but recommended)..."
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  rows={5}
                  maxLength={500}
                />
                <div className="rejection-modal-char-count">
                  {rejectionReason.length}/500 characters
                </div>
              </div>
              <div className="rejection-modal-actions">
                <button
                  className="rejection-cancel-btn"
                  onClick={handleCloseRejectionModal}
                  disabled={updatingRequirement === rejectionRequirementType}
                >
                  Cancel
                </button>
                <button
                  className="rejection-submit-btn"
                  onClick={handleSubmitRejection}
                  disabled={updatingRequirement === rejectionRequirementType}
                >
                  {updatingRequirement === rejectionRequirementType
                    ? "Submitting..."
                    : "Submit Rejection"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Approval Confirmation Modal */}
        {showApprovalConfirmModal && (
          <div
            className="rejection-modal-backdrop"
            onClick={handleCloseApprovalConfirmModal}
          >
            <div
              className="rejection-modal"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="rejection-modal-header">
                <h3>Confirm Approval</h3>
                <button
                  className="rejection-modal-close"
                  onClick={handleCloseApprovalConfirmModal}
                  aria-label="Close modal"
                >
                  <IoCloseOutline />
                </button>
              </div>
              <div className="rejection-modal-content">
                <p className="rejection-modal-question">
                  Are you sure you want to approve this requirement?
                </p>
                <p className="rejection-modal-requirement">
                  <strong>Requirement:</strong> {approvalRequirementType}
                </p>
                <p
                  style={{
                    color: "#666",
                    fontSize: "0.9rem",
                    marginTop: "1rem",
                  }}
                >
                  The student will be notified once you confirm.
                </p>
              </div>
              <div className="rejection-modal-actions">
                <button
                  className="rejection-cancel-btn"
                  onClick={handleCloseApprovalConfirmModal}
                  disabled={updatingRequirement === approvalRequirementType}
                >
                  Cancel
                </button>
                <button
                  className="rejection-submit-btn"
                  onClick={handleAcceptRequirement}
                  disabled={updatingRequirement === approvalRequirementType}
                  style={{
                    background: "linear-gradient(135deg, #43a047, #388e3c)",
                  }}
                >
                  {updatingRequirement === approvalRequirementType
                    ? "Approving..."
                    : "Confirm Approval"}
                </button>
              </div>
            </div>
          </div>
        )}

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
                  <button
                    className="file-viewer-close"
                    onClick={closeFileViewer}
                  >
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
    </>
  );
};

StudentRequirementModal.propTypes = {
  open: PropTypes.bool.isRequired,
  student: PropTypes.object,
  onClose: PropTypes.func.isRequired,
  onRequirementUpdated: PropTypes.func,
  onStudentUpdated: PropTypes.func,
  onShowSuccess: PropTypes.func,
  onShowError: PropTypes.func,
};

export default StudentRequirementModal;
