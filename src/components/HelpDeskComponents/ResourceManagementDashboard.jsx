/**
 * ResourceManagementDashboard - Admin dashboard for managing resource files
 * Allows admins to upload, view, and manage files for student support
 *
 * @component
 * @example
 * <ResourceManagementDashboard />
 */

import React, { useState, useEffect, useRef } from "react";
import { pdfjs } from "react-pdf";
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
  setDoc,
  query,
  orderBy,
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
  IoLockClosed,
  IoLockOpen,
  IoResize,
  IoCrop,
  IoAdd,
  IoRemove,
  IoRefresh,
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
  const [previewError, setPreviewError] = useState(false);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [panPosition, setPanPosition] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });
  const previewContainerRef = useRef(null);
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

  // Checklist Template Upload State
  const [selectedChecklistFile, setSelectedChecklistFile] = useState(null);
  const [checklistPreviewUrl, setChecklistPreviewUrl] = useState(null);
  const [checklistPreviewFile, setChecklistPreviewFile] = useState(null); // Store File object for react-pdf
  const [uploadingChecklist, setUploadingChecklist] = useState(false);
  const [dragActiveChecklist, setDragActiveChecklist] = useState(false);

  // PDF Preview State
  const [previewPageWidth, setPreviewPageWidth] = useState(null);
  const [previewPageHeight, setPreviewPageHeight] = useState(null);
  const [pdfScale, setPdfScale] = useState(1.2);
  const pdfContainerRef = useRef(null);

  // Requirement Types for Sidebar
  const requirementTypes = [
    "Proof of Enrollment (COM)",
    "Notarized Parental Consent",
    "Medical Certificate",
    "Psychological Test Certification",
    "Proof of Insurance",
    "OJT Orientation",
    "Memorandum of Agreement",
    "Curriculum Vitae",
  ];

  // Table Layout Constants - PDF function removed, this is kept for reference only
  const TABLE_LAYOUT = {
    startX: 50, // Left margin from page edge (PDF coordinates)
    startY: 450, // Top of table (from bottom of page in PDF coordinates)
    headerRowHeight: 20,
    rowHeight: 25,
    columnWidths: {
      requirement: 120,
      dateComplied: 80,
      remarks: 60,
      adviserSignature: 90,
    },
    // Requirement type to row index mapping (0-based, excluding header)
    requirementRowMap: {
      "Proof of Enrollment (COM)": 0,
      "Notarized Parental Consent": 1,
      "Medical Certificate": 2,
      "Psychological Test Certification": 3,
      "Proof of Insurance": 4,
      "OJT Orientation": 5,
      "Memorandum of Agreement": 6,
      "Curriculum Vitae": 7,
    },
  };

  // Helper: Get cell position in PDF coordinates (for backend)
  const getCellPositionPDF = (rowIndex, column) => {
    const { startX, startY, rowHeight, headerRowHeight, columnWidths } =
      TABLE_LAYOUT;
    const rowY = startY - headerRowHeight - rowIndex * rowHeight;
    let cellX = startX + columnWidths.requirement;
    let cellWidth = columnWidths.dateComplied;

    if (column === "adviserSignature") {
      cellX =
        startX +
        columnWidths.requirement +
        columnWidths.dateComplied +
        columnWidths.remarks;
      cellWidth = columnWidths.adviserSignature;
    }

    return {
      x: cellX,
      y: rowY - rowHeight,
      width: cellWidth,
      height: rowHeight,
    };
  };

  // Helper: Get cell position in UI display coordinates (for rendering)
  const getCellPositionUI = (rowIndex, column) => {
    if (!previewPageWidth || !previewPageHeight) return null;

    const cellBounds = getCellPositionPDF(rowIndex, column);
    const scale = pdfScale;

    // Convert PDF coordinates (bottom-left origin) to UI coordinates (top-left origin)
    return {
      x: cellBounds.x * scale,
      y: (previewPageHeight - cellBounds.y - cellBounds.height) * scale,
      width: cellBounds.width * scale,
      height: cellBounds.height * scale,
    };
  };

  // Signature Positions State - Now stores cell-based placement data
  // Format: { [requirementType]: { column: 'dateComplied' | 'adviserSignature', rowIndex: number } }
  const [signaturePositions, setSignaturePositions] = useState({});
  // Counter for reusable (free) signatures not tied to requirements
  const [freeSignatureCount, setFreeSignatureCount] = useState(0);
  // Counter for date stamp elements
  const [dateStampCount, setDateStampCount] = useState(0);
  // Track what is currently being dragged from the sidebar (fallback when dataTransfer is empty)
  const currentDragRef = useRef(null);
  // Track selected element type for cell-based placement
  const [selectedElementType, setSelectedElementType] = useState(null); // 'date-stamp' | 'signature' | 'signature-all' | 'free-signature' | null
  // Track hovered row for placeholder highlighting
  const [hoveredRow, setHoveredRow] = useState(null);

  // Template State - locked signature positions become the template
  const [isTemplateLocked, setIsTemplateLocked] = useState(false);
  // const [showUnlockConfirm, setShowUnlockConfirm] = useState(false); // Removed - no confirmation needed

  // Drag and Resize State
  const [draggingSignature, setDraggingSignature] = useState(null);
  const [dragStartPos, setDragStartPos] = useState({ x: 0, y: 0 });
  const [resizingSignature, setResizingSignature] = useState(null);
  const [resizeStartPos, setResizeStartPos] = useState({ x: 0, y: 0 });
  const [resizeStartSize, setResizeStartSize] = useState({
    width: 0,
    height: 0,
  });
  const [resizeHandle, setResizeHandle] = useState(null);
  const [aspectRatio, setAspectRatio] = useState(null);
  const [isShiftPressed, setIsShiftPressed] = useState(false);

  // Lock and Crop State
  const [lockedSignatures, setLockedSignatures] = useState({});
  const [croppingSignature, setCroppingSignature] = useState(null);
  const [cropArea, setCropArea] = useState(null);

  // User Signature State
  const [currentSignature, setCurrentSignature] = useState(null);

  // Selected Signature State (for blur effect)
  const [selectedSignature, setSelectedSignature] = useState(null);

  // Copy/Paste State
  const [copiedSignature, setCopiedSignature] = useState(null); // { type: 'free-signature' | 'date-stamp', data: {...} }

  // Smart Alignment State
  const [alignmentGuides, setAlignmentGuides] = useState({
    horizontal: null, // { y: number, type: 'center' | 'edge' | 'element' }
    vertical: null, // { x: number, type: 'center' | 'edge' | 'element' }
  });
  const [snapThreshold] = useState(10); // pixels threshold for snapping
  const [gridSize] = useState(20); // grid size in PDF coordinates

  useEffect(() => {
    document.title = "Resource Management | InternQuest Admin";
    fetchFiles();
    fetchCurrentSignature();
    fetchChecklistTemplate();
  }, []);

  // Fetch checklist template from Firestore
  const fetchChecklistTemplate = async () => {
    try {
      const templateRef = doc(db, "checklist_templates", "default");
      const templateSnap = await getDoc(templateRef);
      if (templateSnap.exists()) {
        const data = templateSnap.data();
        setSignaturePositions(data.signaturePositions || {});
        setIsTemplateLocked(data.isLocked || false);
        if (data.pdfUrl) {
          // Use direct Firebase Storage URL - react-pdf should handle it
          // Don't try to fetch as blob - it causes CORS issues
          // If there's a CORS issue, configure CORS in Firebase Storage using cors.json
          setChecklistPreviewUrl(data.pdfUrl);
          setChecklistPreviewFile(null);
        }
      }
    } catch (err) {
      console.error("Error fetching checklist template:", err);
    }
  };

  // Save template to Firestore
  // Upload and save template PDF to Firebase Storage (editable)
  const uploadAndSaveTemplate = async () => {
    if (!selectedChecklistFile) {
      setError("Please select a PDF file first");
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
      const storagePath = `checklist_templates/template_${timestamp}_${safeFileName}`;
      const fileRef = storageRef(storage, storagePath);

      // Upload to Storage
      await uploadBytes(fileRef, selectedChecklistFile);

      // Get download URL
      const downloadUrl = await getDownloadURL(fileRef);

      // Save to Firestore (editable, not locked)
      const templateRef = doc(db, "checklist_templates", "default");
      await setDoc(
        templateRef,
        {
          signaturePositions: signaturePositions,
          isLocked: false, // Keep it editable
          pdfUrl: downloadUrl, // Use the uploaded URL
          storagePath: storagePath,
          fileName: selectedChecklistFile.name,
          updatedAt: new Date().toISOString(),
          updatedBy: auth.currentUser.uid,
        },
        { merge: true }
      );

      // Keep using the selected file object for react-pdf (works better than URLs)
      // The file is already in memory from handleChecklistFileSelect, so we can use it directly
      // Also store the download URL for reference
      setChecklistPreviewUrl(downloadUrl);
      // checklistPreviewFile is already set from handleChecklistFileSelect, no need to change it

      setIsTemplateLocked(false);

      success(
        "Template uploaded and saved successfully! You can still edit it."
      );
    } catch (err) {
      console.error("Error uploading template:", err);
      const errorMsg = `Failed to upload template: ${
        err.message || "Unknown error"
      }`;
      setError(errorMsg);
      showError(errorMsg);
    } finally {
      setUploadingChecklist(false);
    }
  };

  const saveTemplate = async () => {
    try {
      // Convert cell-based positions to format compatible with backend
      // Backend expects: { [requirementType]: { x, y, width, height } } OR cell-based format
      // We'll save both formats for compatibility
      const convertedPositions = {};

      Object.keys(signaturePositions).forEach((key) => {
        const pos = signaturePositions[key];

        // If it's already cell-based, keep it and also add PDF coordinates for backward compatibility
        if (pos?.rowIndex !== undefined && pos?.column) {
          const cellBounds = getCellPositionPDF(pos.rowIndex, pos.column);
          convertedPositions[key] = {
            ...pos, // Keep cell-based data
            // Also include PDF coordinates for backward compatibility
            x: cellBounds.x,
            y: cellBounds.y,
            width: cellBounds.width,
            height: cellBounds.height,
          };
        } else {
          // Legacy format - keep as is
          convertedPositions[key] = pos;
        }
      });

      const templateRef = doc(db, "checklist_templates", "default");
      await setDoc(
        templateRef,
        {
          signaturePositions: convertedPositions,
          isLocked: true,
          pdfUrl: checklistPreviewUrl,
          updatedAt: new Date().toISOString(),
          updatedBy: auth.currentUser?.uid,
        },
        { merge: true }
      );
      setIsTemplateLocked(true);
      success("Template saved and locked successfully!");
    } catch (err) {
      console.error("Error saving template:", err);
      showError("Failed to save template. Please try again.");
    }
  };

  // Unlock template for editing
  const unlockTemplate = async () => {
    try {
      const templateRef = doc(db, "checklist_templates", "default");
      await setDoc(
        templateRef,
        {
          isLocked: false,
          unlockedAt: new Date().toISOString(),
          unlockedBy: auth.currentUser?.uid,
        },
        { merge: true }
      );
      setIsTemplateLocked(false);
      success("Template unlocked. You can now edit it.");
    } catch (err) {
      console.error("Error unlocking template:", err);
      showError("Failed to unlock template. Please try again.");
    }
  };

  // Handle unlock button click - directly unlock without confirmation
  const handleUnlockClick = () => {
    unlockTemplate();
  };

  // Handle click outside to deselect signature
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        pdfContainerRef.current &&
        !pdfContainerRef.current.contains(e.target)
      ) {
        setSelectedSignature(null);
      }
    };

    if (selectedSignature) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [selectedSignature]);

  // Handle copy/paste and arrow key movement for signatures
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Don't trigger shortcuts when typing in inputs
      if (
        e.target.tagName === "INPUT" ||
        e.target.tagName === "TEXTAREA" ||
        e.target.isContentEditable
      ) {
        return;
      }

      // Arrow keys to move selected signature
      if (
        selectedSignature &&
        !isTemplateLocked &&
        !lockedSignatures[selectedSignature]
      ) {
        const arrowKeys = ["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"];
        if (arrowKeys.includes(e.key)) {
          e.preventDefault();
          const pos = signaturePositions[selectedSignature];
          if (!pos) return;

          // Movement amount: 1px normally, 10px with Shift, 5px with Ctrl/Cmd
          const isShift = e.shiftKey;
          const isCtrl = e.ctrlKey || e.metaKey;
          let moveAmount = 1;
          if (isShift) moveAmount = 10;
          else if (isCtrl) moveAmount = 5;

          let newX = pos.x;
          let newY = pos.y;

          switch (e.key) {
            case "ArrowUp":
              newY = Math.max(0, pos.y + moveAmount); // PDF Y increases upward
              break;
            case "ArrowDown":
              newY = Math.min(
                previewPageHeight - (pos.height || 50),
                pos.y - moveAmount
              );
              break;
            case "ArrowLeft":
              newX = Math.max(0, pos.x - moveAmount);
              break;
            case "ArrowRight":
              newX = Math.min(
                previewPageWidth - (pos.width || 150),
                pos.x + moveAmount
              );
              break;
          }

          // Update position
          setSignaturePositions((prev) => ({
            ...prev,
            [selectedSignature]: {
              ...prev[selectedSignature],
              x: Math.round(newX),
              y: Math.round(newY),
            },
          }));
          return;
        }
      }

      const isCtrlOrCmd = e.ctrlKey || e.metaKey;

      // Copy (Ctrl+C or Cmd+C)
      if (
        isCtrlOrCmd &&
        e.key === "c" &&
        selectedSignature &&
        !isTemplateLocked
      ) {
        const pos = signaturePositions[selectedSignature];
        if (pos) {
          const isDateStamp = selectedSignature.startsWith("Date Stamp #");
          const isFreeSignature =
            selectedSignature.startsWith("Free Signature #");

          if (isDateStamp || isFreeSignature) {
            e.preventDefault();
            setCopiedSignature({
              type: isDateStamp ? "date-stamp" : "free-signature",
              data: {
                x: pos.x,
                y: pos.y,
                width: pos.width,
                height: pos.height,
                linkedRequirementType: pos.linkedRequirementType,
                isDateStamp: pos.isDateStamp,
              },
            });
            console.log(
              "Copied:",
              isDateStamp ? "Date Stamp" : "Reusable Signature"
            );
          }
        }
      }

      // Paste (Ctrl+V or Cmd+V)
      if (
        isCtrlOrCmd &&
        e.key === "v" &&
        copiedSignature &&
        previewPageWidth &&
        previewPageHeight &&
        !isTemplateLocked
      ) {
        e.preventDefault();

        // Get current positions for smart placement
        const currentPositions = signaturePositions;
        const offsetX = 20;
        const offsetY = 20;

        // Calculate paste position with offset (in PDF coordinates)
        const pasteX = copiedSignature.data.x + offsetX;
        const pasteY = copiedSignature.data.y + offsetY;

        // Convert PDF coordinates to display coordinates for smart placement function
        const scale = pdfScale;
        const containerRect = pdfContainerRef.current?.getBoundingClientRect();
        if (!containerRect) return;

        // Convert PDF coords to display coords
        const displayX = pasteX * scale;
        const displayY = (previewPageHeight - pasteY) * scale;

        if (copiedSignature.type === "free-signature" && currentSignature) {
          // Paste reusable signature with smart placement
          const smartPos = getSmartPlacement(
            displayX,
            displayY,
            copiedSignature.data.width,
            copiedSignature.data.height,
            currentPositions
          );

          setFreeSignatureCount((prevCount) => {
            const nextCount = prevCount + 1;
            const key = `Free Signature #${nextCount}`;
            setSignaturePositions((prev) => ({
              ...prev,
              [key]: {
                x: smartPos.x,
                y: smartPos.y,
                width: copiedSignature.data.width,
                height: copiedSignature.data.height,
                linkedRequirementType:
                  copiedSignature.data.linkedRequirementType,
              },
            }));
            setSelectedSignature(key);
            return nextCount;
          });
        } else if (copiedSignature.type === "date-stamp") {
          // Paste date stamp with smart placement
          const smartPos = getSmartPlacement(
            displayX,
            displayY,
            copiedSignature.data.width,
            copiedSignature.data.height,
            currentPositions
          );

          setDateStampCount((prevCount) => {
            const nextCount = prevCount + 1;
            const key = `Date Stamp #${nextCount}`;
            setSignaturePositions((prev) => ({
              ...prev,
              [key]: {
                x: smartPos.x,
                y: smartPos.y,
                width: copiedSignature.data.width,
                height: copiedSignature.data.height,
                isDateStamp: true,
                linkedRequirementType:
                  copiedSignature.data.linkedRequirementType,
              },
            }));
            setSelectedSignature(key);
            return nextCount;
          });
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [
    selectedSignature,
    copiedSignature,
    signaturePositions,
    currentSignature,
    previewPageWidth,
    previewPageHeight,
    pdfScale,
    lockedSignatures,
    isTemplateLocked,
  ]);

  // Fetch current user's signature
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

  // Handle keyboard events for Shift key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Shift") {
        setIsShiftPressed(true);
      }
    };
    const handleKeyUp = (e) => {
      if (e.key === "Shift") {
        setIsShiftPressed(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, []);

  // Handle drag for signatures - Improved with better precision
  useEffect(() => {
    if (!draggingSignature || isTemplateLocked) return;

    const handleMouseMove = (e) => {
      if (!draggingSignature || !pdfContainerRef.current || isTemplateLocked)
        return;

      const rect = pdfContainerRef.current.getBoundingClientRect();
      const scale = pdfScale;

      // Get current mouse position relative to PDF container
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;

      // Calculate new position using the offset
      const newDisplayX = mouseX - dragStartPos.x;
      const newDisplayY = mouseY - dragStartPos.y;

      // Convert display coordinates to PDF coordinates
      let newPdfX = newDisplayX / scale;
      let newPdfY = (previewPageHeight * scale - newDisplayY) / scale;

      setSignaturePositions((prev) => {
        const current = prev[draggingSignature];
        if (!current) return prev;

        // Smart Alignment Logic
        let alignedX = newPdfX;
        let alignedY = newPdfY;
        let horizontalGuide = null;
        let verticalGuide = null;

        // Get element dimensions
        const elementWidth = current.width;
        const elementHeight = current.height;
        const elementCenterX = newPdfX + elementWidth / 2;
        const elementCenterY = newPdfY + elementHeight / 2;
        const elementTop = newPdfY;
        const elementBottom = newPdfY + elementHeight;
        const elementLeft = newPdfX;
        const elementRight = newPdfX + elementWidth;

        // 1. Snap to Grid
        const gridX = Math.round(newPdfX / gridSize) * gridSize;
        const gridY = Math.round(newPdfY / gridSize) * gridSize;
        if (Math.abs(newPdfX - gridX) < snapThreshold / scale) {
          alignedX = gridX;
        }
        if (Math.abs(newPdfY - gridY) < snapThreshold / scale) {
          alignedY = gridY;
        }

        // 2. Snap to Page Center (Horizontal)
        const pageCenterX = previewPageWidth / 2;
        const centerOffsetX = elementCenterX - pageCenterX;
        if (Math.abs(centerOffsetX) < snapThreshold / scale) {
          alignedX = pageCenterX - elementWidth / 2;
          verticalGuide = { x: pageCenterX, type: "center" };
        }

        // 3. Snap to Page Center (Vertical)
        const pageCenterY = previewPageHeight / 2;
        const centerOffsetY = elementCenterY - pageCenterY;
        if (Math.abs(centerOffsetY) < snapThreshold / scale) {
          alignedY = pageCenterY - elementHeight / 2;
          horizontalGuide = { y: pageCenterY, type: "center" };
        }

        // 4. Snap to Page Edges
        // Top edge
        if (Math.abs(elementTop) < snapThreshold / scale) {
          alignedY = 0;
          horizontalGuide = { y: 0, type: "edge" };
        }
        // Bottom edge
        const bottomEdge = previewPageHeight - elementBottom;
        if (Math.abs(bottomEdge) < snapThreshold / scale) {
          alignedY = previewPageHeight - elementHeight;
          horizontalGuide = { y: previewPageHeight, type: "edge" };
        }
        // Left edge
        if (Math.abs(elementLeft) < snapThreshold / scale) {
          alignedX = 0;
          verticalGuide = { x: 0, type: "edge" };
        }
        // Right edge
        const rightEdge = previewPageWidth - elementRight;
        if (Math.abs(rightEdge) < snapThreshold / scale) {
          alignedX = previewPageWidth - elementWidth;
          verticalGuide = { x: previewPageWidth, type: "edge" };
        }

        // Priority: If linked to a requirement type, maintain same-row alignment
        if (
          current.linkedRequirementType &&
          prev[current.linkedRequirementType]
        ) {
          const linkedPos = prev[current.linkedRequirementType];
          // Force same Y position (same row) when dragging linked elements
          alignedY = Math.round(linkedPos.y);
          horizontalGuide = { y: linkedPos.y, type: "linked" };
        }

        // 5. Snap to Other Elements
        Object.keys(prev).forEach((key) => {
          if (key === draggingSignature) return;
          const other = prev[key];
          if (!other) return;

          const otherCenterX = other.x + other.width / 2;
          const otherCenterY = other.y + other.height / 2;
          const otherTop = other.y;
          const otherBottom = other.y + other.height;
          const otherLeft = other.x;
          const otherRight = other.x + other.width;

          // If dragging element is linked to same requirement as other element, force same row
          if (
            current.linkedRequirementType &&
            other.linkedRequirementType === current.linkedRequirementType
          ) {
            alignedY = Math.round(otherTop);
            horizontalGuide = { y: otherTop, type: "linked-same" };
          }

          // If other element is linked to a requirement and we're near it, align to that requirement's row
          if (
            other.linkedRequirementType &&
            requirementTypes.includes(other.linkedRequirementType)
          ) {
            const reqPos = prev[other.linkedRequirementType];
            if (reqPos) {
              const distanceY = Math.abs(newPdfY - reqPos.y);
              if (distanceY < 50 / scale && !horizontalGuide) {
                alignedY = Math.round(reqPos.y);
                horizontalGuide = { y: reqPos.y, type: "requirement" };
              }
            }
          }

          // Align centers (horizontal)
          const centerXDiff = elementCenterX - otherCenterX;
          if (Math.abs(centerXDiff) < snapThreshold / scale && !verticalGuide) {
            alignedX = otherCenterX - elementWidth / 2;
            verticalGuide = { x: otherCenterX, type: "element" };
          }

          // Align centers (vertical) - only if not already aligned by linked requirement
          if (!current.linkedRequirementType) {
            const centerYDiff = elementCenterY - otherCenterY;
            if (
              Math.abs(centerYDiff) < snapThreshold / scale &&
              !horizontalGuide
            ) {
              alignedY = otherCenterY - elementHeight / 2;
              horizontalGuide = { y: otherCenterY, type: "element" };
            }
          }

          // Align edges (horizontal) - only if not already aligned by linked requirement
          if (!current.linkedRequirementType) {
            // Top edges
            const topDiff = elementTop - otherTop;
            if (Math.abs(topDiff) < snapThreshold / scale && !horizontalGuide) {
              alignedY = otherTop;
              horizontalGuide = { y: otherTop, type: "element" };
            }
            // Bottom edges
            const bottomDiff = elementBottom - otherBottom;
            if (
              Math.abs(bottomDiff) < snapThreshold / scale &&
              !horizontalGuide
            ) {
              alignedY = otherBottom - elementHeight;
              horizontalGuide = { y: otherBottom, type: "element" };
            }
          }

          // Align edges (vertical)
          // Left edges
          const leftDiff = elementLeft - otherLeft;
          if (Math.abs(leftDiff) < snapThreshold / scale && !verticalGuide) {
            alignedX = otherLeft;
            verticalGuide = { x: otherLeft, type: "element" };
          }
          // Right edges
          const rightDiff = elementRight - otherRight;
          if (Math.abs(rightDiff) < snapThreshold / scale && !verticalGuide) {
            alignedX = otherRight - elementWidth;
            verticalGuide = { x: otherRight, type: "element" };
          }
        });

        // Update alignment guides for visual feedback
        setAlignmentGuides({
          horizontal: horizontalGuide,
          vertical: verticalGuide,
        });

        // Constrain to PDF bounds
        const constrainedX = Math.max(
          0,
          Math.min(alignedX, previewPageWidth - current.width)
        );
        const constrainedY = Math.max(
          0,
          Math.min(alignedY, previewPageHeight - current.height)
        );

        return {
          ...prev,
          [draggingSignature]: {
            ...current,
            x: Math.round(constrainedX),
            y: Math.round(constrainedY),
          },
        };
      });
    };

    const handleMouseUp = () => {
      setDraggingSignature(null);
      setDragStartPos({ x: 0, y: 0 });
      // Clear alignment guides when drag ends
      setAlignmentGuides({ horizontal: null, vertical: null });
    };

    // Prevent text selection during drag
    document.body.style.userSelect = "none";
    document.body.style.cursor = "grabbing";

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
      document.body.style.userSelect = "";
      document.body.style.cursor = "";
    };
  }, [
    draggingSignature,
    dragStartPos,
    pdfScale,
    previewPageWidth,
    previewPageHeight,
    signaturePositions,
    snapThreshold,
    gridSize,
    isTemplateLocked,
  ]);

  // Handle resize for signatures - Improved with better precision and smoothness
  useEffect(() => {
    if (!resizingSignature) return;

    const handleMouseMove = (e) => {
      if (!resizingSignature || !resizeHandle || !pdfContainerRef.current)
        return;

      const rect = pdfContainerRef.current.getBoundingClientRect();
      const scale = pdfScale;

      // Convert mouse position to PDF coordinates
      const currentMouseX = (e.clientX - rect.left) / scale;
      const currentMouseY =
        (previewPageHeight * scale - (e.clientY - rect.top)) / scale;

      setSignaturePositions((prev) => {
        const current = prev[resizingSignature];
        if (!current) return prev;

        let newWidth = resizeStartSize.width;
        let newHeight = resizeStartSize.height;
        let newX = current.x;
        let newY = current.y;

        // Calculate delta from initial mouse position
        const deltaX = currentMouseX - resizeStartPos.x;
        const deltaY = currentMouseY - resizeStartPos.y;

        // Handle different resize handles
        const isCorner = ["nw", "ne", "sw", "se"].includes(resizeHandle);
        const maintainAspect = isCorner && !isShiftPressed;

        switch (resizeHandle) {
          case "nw":
            if (maintainAspect) {
              const scaleFactor = Math.min(
                -deltaX / resizeStartSize.width,
                deltaY / resizeStartSize.height
              );
              newWidth = resizeStartSize.width * (1 + scaleFactor);
              newHeight = resizeStartSize.height * (1 + scaleFactor);
            } else {
              newWidth = resizeStartSize.width - deltaX;
              newHeight = resizeStartSize.height + deltaY;
            }
            newX = current.x + (resizeStartSize.width - newWidth);
            newY = current.y - (newHeight - resizeStartSize.height);
            break;
          case "ne":
            if (maintainAspect) {
              const scaleFactor = Math.min(
                deltaX / resizeStartSize.width,
                deltaY / resizeStartSize.height
              );
              newWidth = resizeStartSize.width * (1 + scaleFactor);
              newHeight = resizeStartSize.height * (1 + scaleFactor);
            } else {
              newWidth = resizeStartSize.width + deltaX;
              newHeight = resizeStartSize.height + deltaY;
            }
            newY = current.y - (newHeight - resizeStartSize.height);
            break;
          case "sw":
            if (maintainAspect) {
              const scaleFactor = Math.min(
                -deltaX / resizeStartSize.width,
                -deltaY / resizeStartSize.height
              );
              newWidth = resizeStartSize.width * (1 + scaleFactor);
              newHeight = resizeStartSize.height * (1 + scaleFactor);
            } else {
              newWidth = resizeStartSize.width - deltaX;
              newHeight = resizeStartSize.height - deltaY;
            }
            newX = current.x + (resizeStartSize.width - newWidth);
            break;
          case "se":
            if (maintainAspect) {
              const scaleFactor = Math.min(
                deltaX / resizeStartSize.width,
                -deltaY / resizeStartSize.height
              );
              newWidth = resizeStartSize.width * (1 + scaleFactor);
              newHeight = resizeStartSize.height * (1 + scaleFactor);
            } else {
              newWidth = resizeStartSize.width + deltaX;
              newHeight = resizeStartSize.height - deltaY;
            }
            break;
          case "n":
            newHeight = resizeStartSize.height + deltaY;
            newY = current.y - (newHeight - resizeStartSize.height);
            break;
          case "s":
            newHeight = resizeStartSize.height - deltaY;
            break;
          case "w":
            newWidth = resizeStartSize.width - deltaX;
            newX = current.x + (resizeStartSize.width - newWidth);
            break;
          case "e":
            newWidth = resizeStartSize.width + deltaX;
            break;
        }

        // Ensure minimum size (30px for better usability)
        const minSize = 30;
        if (newWidth < minSize) {
          const widthDiff = minSize - newWidth;
          if (resizeHandle.includes("w")) {
            newX -= widthDiff;
          }
          newWidth = minSize;
        }
        if (newHeight < minSize) {
          const heightDiff = minSize - newHeight;
          if (resizeHandle.includes("n")) {
            newY -= heightDiff;
          }
          newHeight = minSize;
        }

        // Constrain to PDF bounds
        if (newX < 0) {
          newWidth += newX;
          newX = 0;
        }
        if (newY < 0) {
          newHeight += newY;
          newY = 0;
        }
        if (newX + newWidth > previewPageWidth) {
          newWidth = previewPageWidth - newX;
        }
        if (newY + newHeight > previewPageHeight) {
          newHeight = previewPageHeight - newY;
        }

        // Apply size only to the signature being resized
        return {
          ...prev,
          [resizingSignature]: {
            x: Math.round(newX),
            y: Math.round(newY),
            width: Math.round(newWidth),
            height: Math.round(newHeight),
          },
        };
      });
    };

    const handleMouseUp = () => {
      setResizingSignature(null);
      setResizeHandle(null);
      setResizeStartPos({ x: 0, y: 0 });
      setResizeStartSize({ width: 0, height: 0 });
    };

    // Prevent text selection during resize
    document.body.style.userSelect = "none";

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
      document.body.style.userSelect = "";
    };
  }, [
    resizingSignature,
    resizeHandle,
    resizeStartPos,
    resizeStartSize,
    pdfScale,
    previewPageWidth,
    previewPageHeight,
    isShiftPressed,
    signaturePositions,
    isTemplateLocked,
  ]);

  // Handle crop resize
  useEffect(() => {
    if (!croppingSignature || !resizeHandle || !cropArea) return;

    const handleMouseMove = (e) => {
      if (
        !croppingSignature ||
        !resizeHandle ||
        !cropArea ||
        !pdfContainerRef.current
      )
        return;

      const rect = pdfContainerRef.current.getBoundingClientRect();
      const scale = pdfScale;
      const mouseX = (e.clientX - rect.left) / scale;
      const mouseY =
        (previewPageHeight * scale - (e.clientY - rect.top)) / scale;

      let newCropArea = { ...cropArea };

      switch (resizeHandle) {
        case "nw":
          newCropArea.width = cropArea.x + cropArea.width - mouseX;
          newCropArea.height = mouseY - cropArea.y;
          newCropArea.x = mouseX;
          break;
        case "ne":
          newCropArea.width = mouseX - cropArea.x;
          newCropArea.height = mouseY - cropArea.y;
          break;
        case "sw":
          newCropArea.width = cropArea.x + cropArea.width - mouseX;
          newCropArea.height = cropArea.y + cropArea.height - mouseY;
          newCropArea.x = mouseX;
          newCropArea.y = mouseY;
          break;
        case "se":
          newCropArea.width = mouseX - cropArea.x;
          newCropArea.height = cropArea.y + cropArea.height - mouseY;
          newCropArea.y = mouseY;
          break;
        case "n":
          newCropArea.height = mouseY - cropArea.y;
          break;
        case "s":
          newCropArea.height = cropArea.y + cropArea.height - mouseY;
          newCropArea.y = mouseY;
          break;
        case "w":
          newCropArea.width = cropArea.x + cropArea.width - mouseX;
          newCropArea.x = mouseX;
          break;
        case "e":
          newCropArea.width = mouseX - cropArea.x;
          break;
        default:
          return;
      }

      // Ensure minimum size
      if (newCropArea.width < 20) newCropArea.width = 20;
      if (newCropArea.height < 20) newCropArea.height = 20;
      if (newCropArea.x < 0) {
        newCropArea.width += newCropArea.x;
        newCropArea.x = 0;
      }
      if (newCropArea.y < 0) {
        newCropArea.height += newCropArea.y;
        newCropArea.y = 0;
      }

      setCropArea(newCropArea);
    };

    const handleMouseUp = () => {
      setResizeHandle(null);
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [
    croppingSignature,
    resizeHandle,
    cropArea,
    pdfScale,
    previewPageWidth,
    previewPageHeight,
  ]);

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
  const handlePreview = async (file) => {
    try {
      setPreviewError(false);
      setPreviewLoading(true);
      setShowPreview(true); // Show modal immediately with loading state
      console.log("Preview requested for file:", file);

      // Always try to get a fresh download URL from storage if storagePath exists
      // This ensures we have a valid, non-expired URL
      if (file.storagePath) {
        try {
          const fileRef = storageRef(storage, file.storagePath);
          const downloadUrl = await getDownloadURL(fileRef);
          console.log("Fetched fresh download URL:", downloadUrl);
          // Update the file object with the fresh downloadUrl
          const updatedFile = { ...file, downloadUrl };
          setPreviewFile(updatedFile);
          setPreviewLoading(false);
          return;
        } catch (storageErr) {
          console.warn(
            "Failed to fetch from storage, trying existing URL:",
            storageErr
          );
          // Fall through to use existing downloadUrl if available
        }
      }

      // If we have a downloadUrl, use it (might be expired but worth trying)
      if (file.downloadUrl) {
        console.log("Using existing download URL:", file.downloadUrl);
        setPreviewFile(file);
        setPreviewLoading(false);
      } else {
        // No URL available at all
        console.error(
          "No download URL or storage path available for file:",
          file
        );
        setPreviewError(true);
        setPreviewFile(file);
        setPreviewLoading(false);
        showError(
          "File preview is not available. The file may have been deleted or moved."
        );
      }
    } catch (err) {
      console.error("Error in handlePreview:", err);
      setPreviewError(true);
      setPreviewFile(file);
      setPreviewLoading(false);
      showError(
        "Failed to load preview. Please try downloading the file instead."
      );
    }
  };

  // Close preview modal
  const handleClosePreview = () => {
    setShowPreview(false);
    setPreviewFile(null);
    setPreviewError(false);
    setPreviewLoading(false);
    setZoomLevel(1);
    setPanPosition({ x: 0, y: 0 });
  };

  // Zoom functions
  const handleZoomIn = () => {
    setZoomLevel((prev) => Math.min(prev + 0.25, 3));
  };

  const handleZoomOut = () => {
    setZoomLevel((prev) => Math.max(prev - 0.25, 0.5));
  };

  const handleResetZoom = () => {
    setZoomLevel(1);
    setPanPosition({ x: 0, y: 0 });
  };

  // Pan functions
  const handleMouseDown = (e) => {
    if (zoomLevel > 1) {
      setIsPanning(true);
      setPanStart({
        x: e.clientX - panPosition.x,
        y: e.clientY - panPosition.y,
      });
      e.preventDefault();
    }
  };

  const handleMouseMove = (e) => {
    if (isPanning && zoomLevel > 1) {
      setPanPosition({
        x: e.clientX - panStart.x,
        y: e.clientY - panStart.y,
      });
    }
  };

  const handleMouseUp = () => {
    setIsPanning(false);
  };

  // Mouse wheel zoom
  const handleWheel = (e) => {
    if (e.ctrlKey || e.metaKey) {
      e.preventDefault();
      const delta = e.deltaY > 0 ? -0.1 : 0.1;
      setZoomLevel((prev) => {
        const newZoom = Math.max(0.5, Math.min(3, prev + delta));
        return newZoom;
      });
    }
  };

  // Reset zoom when preview file changes
  useEffect(() => {
    if (previewFile) {
      setZoomLevel(1);
      setPanPosition({ x: 0, y: 0 });
    }
  }, [previewFile?.id]);

  // Handle ESC key to close preview
  useEffect(() => {
    if (!showPreview) return;

    const handleEscKey = (event) => {
      if (event.key === "Escape") {
        setShowPreview(false);
        setPreviewFile(null);
        setPreviewError(false);
        setPreviewLoading(false);
        setZoomLevel(1);
        setPanPosition({ x: 0, y: 0 });
      }
    };

    document.addEventListener("keydown", handleEscKey);
    // Prevent body scroll when modal is open
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleEscKey);
      document.body.style.overflow = "unset";
    };
  }, [showPreview]);

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

      // Store file object for react-pdf (works better than blob URLs)
      setChecklistPreviewFile(file);

      // Create preview URL for other uses
      const previewUrl = URL.createObjectURL(file);
      setChecklistPreviewUrl(previewUrl);

      // Reset signature positions when new file is selected
      setSignaturePositions({});
    } else {
      // Clean up preview URL if file is deselected
      if (checklistPreviewUrl) {
        URL.revokeObjectURL(checklistPreviewUrl);
        setChecklistPreviewUrl(null);
      }
    }
  };

  // Handle drag and drop for checklist file
  const handleChecklistDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActiveChecklist(true);
  };

  const handleChecklistDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActiveChecklist(false);
  };

  const handleChecklistDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActiveChecklist(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.type === "application/pdf") {
        setSelectedChecklistFile(file);
        setError(null);
        // Store file object for react-pdf (works better than blob URLs)
        setChecklistPreviewFile(file);
        // Create preview URL for other uses
        const previewUrl = URL.createObjectURL(file);
        setChecklistPreviewUrl(previewUrl);
        setSignaturePositions({});
      } else {
        setError("Please select a PDF file for checklist template");
      }
    }
  };

  // Handle sidebar drag start
  const handleSidebarDragStart = (e, reqType) => {
    e.stopPropagation();
    try {
      // Set effectAllowed first
      e.dataTransfer.effectAllowed = "move";
      // Set data in multiple formats for browser compatibility
      e.dataTransfer.setData("text/plain", reqType);
      e.dataTransfer.setData("application/x-requirement-type", reqType);
      e.dataTransfer.setData("text", reqType);
      // Store in ref as fallback
      currentDragRef.current = { type: "requirement", key: reqType };
      console.log("Dragging requirement type:", reqType, "DataTransfer:", {
        effectAllowed: e.dataTransfer.effectAllowed,
        types: Array.from(e.dataTransfer.types || []),
      }); // Debug log
    } catch (error) {
      console.error("Error setting drag data:", error);
      currentDragRef.current = { type: "requirement", key: reqType };
    }
  };

  // Handle signature drag start from sidebar
  // Legacy drag handler - kept for backward compatibility but disabled
  const handleSignatureSidebarDragStart = (e) => {
    // Disable drag-and-drop - use click-based selection instead
    e.preventDefault();
    return false;
    if (!currentSignature) return;
    e.dataTransfer.effectAllowed = "copy";
    e.dataTransfer.setData("text/plain", "signature");
    currentDragRef.current = { type: "signature-all" };
  };

  // Handle drag start for reusable / free signature (can be used many times)
  // Legacy drag handler - kept for backward compatibility but disabled
  const handleReusableSignatureDragStart = (e) => {
    // Disable drag-and-drop - use click-based selection instead
    e.preventDefault();
    return false;
    if (!currentSignature) {
      e.preventDefault();
      return;
    }
    e.stopPropagation();
    e.dataTransfer.effectAllowed = "copy";
    // Set in both plain text and custom type to be robust across browsers
    e.dataTransfer.setData("text/plain", "free-signature");
    e.dataTransfer.setData("application/x-requirement-type", "free-signature");
    currentDragRef.current = { type: "free-signature" };
  };

  // Handle drag start for date stamp element
  const handleDateStampDragStart = (e) => {
    e.stopPropagation();
    e.dataTransfer.effectAllowed = "copy";
    e.dataTransfer.setData("text/plain", "date-stamp");
    e.dataTransfer.setData("application/x-requirement-type", "date-stamp");
    currentDragRef.current = { type: "date-stamp" };
  };

  // Smart placement function - improves positioning with grid snapping and alignment
  const getSmartPlacement = (
    dropX,
    dropY,
    elementWidth,
    elementHeight,
    existingPositions = {},
    linkedRequirementType = null
  ) => {
    const scale = pdfScale;

    // Convert CSS coordinates to PDF coordinates
    let pdfX = Math.max(0, dropX / scale);
    let pdfY = Math.max(0, (previewPageHeight * scale - dropY) / scale);

    // Adjust for element center (if needed) - we'll use top-left for now
    const halfWidth = elementWidth / 2;
    const halfHeight = elementHeight / 2;

    // Priority: Align with linked requirement type signature (same row alignment)
    if (linkedRequirementType && existingPositions[linkedRequirementType]) {
      const linkedPos = existingPositions[linkedRequirementType];
      // Align top edge (Y position) with the linked requirement signature for same row
      pdfY = linkedPos.y;
    } else {
      // Check if there are other elements linked to requirement types nearby - align to same row
      Object.entries(existingPositions).forEach(([key, pos]) => {
        if (!pos || !pos.linkedRequirementType) return;

        // Check if this element is close to a requirement type signature
        requirementTypes.forEach((reqType) => {
          if (
            pos.linkedRequirementType === reqType &&
            existingPositions[reqType]
          ) {
            const reqPos = existingPositions[reqType];
            // If dropping near this requirement type, align to same row
            const distanceY = Math.abs(pdfY - reqPos.y);
            if (distanceY < (snapThreshold * 3) / scale) {
              pdfY = reqPos.y; // Align to same row
            }
          }
        });
      });
    }

    // 1. Snap to Grid (20px grid)
    const gridX = Math.round(pdfX / gridSize) * gridSize;
    const gridY = Math.round(pdfY / gridSize) * gridSize;

    // Check if close enough to grid to snap
    if (Math.abs(pdfX - gridX) < snapThreshold / scale) {
      pdfX = gridX;
    }
    if (Math.abs(pdfY - gridY) < snapThreshold / scale) {
      pdfY = gridY;
    }

    // 2. Snap to Page Center (Horizontal)
    const pageCenterX = previewPageWidth / 2;
    const centerOffsetX = Math.abs(pdfX + halfWidth - pageCenterX);
    if (centerOffsetX < snapThreshold / scale) {
      pdfX = pageCenterX - halfWidth;
    }

    // 3. Snap to Page Center (Vertical)
    const pageCenterY = previewPageHeight / 2;
    const centerOffsetY = Math.abs(pdfY + halfHeight - pageCenterY);
    if (centerOffsetY < snapThreshold / scale) {
      pdfY = pageCenterY - halfHeight;
    }

    // 4. Snap to Page Edges (with margin)
    const edgeMargin = 10; // 10px margin from edges
    if (Math.abs(pdfX - edgeMargin) < snapThreshold / scale) {
      pdfX = edgeMargin;
    }
    if (Math.abs(pdfY - edgeMargin) < snapThreshold / scale) {
      pdfY = edgeMargin;
    }
    if (
      Math.abs(pdfX + elementWidth - (previewPageWidth - edgeMargin)) <
      snapThreshold / scale
    ) {
      pdfX = previewPageWidth - elementWidth - edgeMargin;
    }
    if (
      Math.abs(pdfY + elementHeight - (previewPageHeight - edgeMargin)) <
      snapThreshold / scale
    ) {
      pdfY = previewPageHeight - elementHeight - edgeMargin;
    }

    // 5. Align with Existing Elements
    const elementCenterX = pdfX + halfWidth;
    const elementCenterY = pdfY + halfHeight;
    const elementTop = pdfY;
    const elementBottom = pdfY + elementHeight;
    const elementLeft = pdfX;
    const elementRight = pdfX + elementWidth;

    let bestAlignmentX = pdfX;
    let bestAlignmentY = pdfY;
    let minDistanceX = Infinity;
    let minDistanceY = Infinity;

    // Priority alignment: If linked to a requirement type, align with that requirement's signature
    if (linkedRequirementType && existingPositions[linkedRequirementType]) {
      const linkedPos = existingPositions[linkedRequirementType];
      // Align top edge (Y position) with the linked requirement signature for same row
      pdfY = linkedPos.y;
      // Also try to align horizontally if close
      const linkedCenterX = linkedPos.x + (linkedPos.width || 150) / 2;
      if (
        Math.abs(elementCenterX - linkedCenterX) <
        (snapThreshold * 2) / scale
      ) {
        pdfX = linkedCenterX - halfWidth;
      }
    } else {
      // Check if dropping near a requirement type signature - auto-align to same row
      // Use larger threshold for better row detection
      requirementTypes.forEach((reqType) => {
        if (existingPositions[reqType]) {
          const reqPos = existingPositions[reqType];
          const distanceY = Math.abs(pdfY - reqPos.y);
          // If within 50px vertically, align to same row (more aggressive)
          if (distanceY < 50 / scale) {
            pdfY = Math.round(reqPos.y); // Exact alignment
          }
        }
      });

      // Also check for other elements linked to requirements nearby
      Object.entries(existingPositions).forEach(([key, pos]) => {
        if (!pos || !pos.linkedRequirementType) return;
        const distanceY = Math.abs(pdfY - pos.y);
        // If dropping near an element linked to a requirement, align to that requirement's row
        if (
          distanceY < 50 / scale &&
          requirementTypes.includes(pos.linkedRequirementType)
        ) {
          const reqPos = existingPositions[pos.linkedRequirementType];
          if (reqPos) {
            pdfY = Math.round(reqPos.y); // Align to requirement's row
          }
        }
      });
    }

    // Check alignment with all existing elements (including those linked to same requirement)
    Object.entries(existingPositions).forEach(([key, pos]) => {
      if (!pos) return;

      // Skip if this is the linked requirement (already handled above)
      if (linkedRequirementType && key === linkedRequirementType) return;

      // Also align with other elements linked to the same requirement type (force same row)
      if (
        linkedRequirementType &&
        pos.linkedRequirementType === linkedRequirementType
      ) {
        // Force exact Y alignment for same row
        bestAlignmentY = pos.y;
        minDistanceY = 0; // Perfect alignment
      }

      // If this element is linked to a requirement, align with that requirement's signature
      if (
        pos.linkedRequirementType &&
        requirementTypes.includes(pos.linkedRequirementType)
      ) {
        const reqPos = existingPositions[pos.linkedRequirementType];
        if (reqPos) {
          const topDiff = Math.abs(elementTop - reqPos.y);
          if (topDiff < (snapThreshold * 2) / scale && topDiff < minDistanceY) {
            bestAlignmentY = reqPos.y; // Align to requirement's row
            minDistanceY = topDiff;
          }
        }
      }

      const existingCenterX = pos.x + (pos.width || 150) / 2;
      const existingCenterY = pos.y + (pos.height || 50) / 2;
      const existingTop = pos.y;
      const existingBottom = pos.y + (pos.height || 50);
      const existingLeft = pos.x;
      const existingRight = pos.x + (pos.width || 150);

      // Center alignment (horizontal)
      const centerXDiff = Math.abs(elementCenterX - existingCenterX);
      if (centerXDiff < snapThreshold / scale && centerXDiff < minDistanceX) {
        bestAlignmentX = existingCenterX - halfWidth;
        minDistanceX = centerXDiff;
      }

      // Center alignment (vertical)
      const centerYDiff = Math.abs(elementCenterY - existingCenterY);
      if (centerYDiff < snapThreshold / scale && centerYDiff < minDistanceY) {
        bestAlignmentY = existingCenterY - halfHeight;
        minDistanceY = centerYDiff;
      }

      // Edge alignment - Top (for row alignment)
      const topDiff = Math.abs(elementTop - existingTop);
      if (topDiff < snapThreshold / scale && topDiff < minDistanceY) {
        bestAlignmentY = existingTop;
        minDistanceY = topDiff;
      }

      // Edge alignment - Bottom
      const bottomDiff = Math.abs(elementBottom - existingBottom);
      if (bottomDiff < snapThreshold / scale && bottomDiff < minDistanceY) {
        bestAlignmentY = existingBottom - elementHeight;
        minDistanceY = bottomDiff;
      }

      // Edge alignment - Left
      const leftDiff = Math.abs(elementLeft - existingLeft);
      if (leftDiff < snapThreshold / scale && leftDiff < minDistanceX) {
        bestAlignmentX = existingLeft;
        minDistanceX = leftDiff;
      }

      // Edge alignment - Right
      const rightDiff = Math.abs(elementRight - existingRight);
      if (rightDiff < snapThreshold / scale && rightDiff < minDistanceX) {
        bestAlignmentX = existingRight;
        minDistanceX = rightDiff;
      }
    });

    // Apply best alignment if found
    if (minDistanceX < Infinity) {
      pdfX = bestAlignmentX;
    }
    if (minDistanceY < Infinity) {
      pdfY = bestAlignmentY;
    }

    // 6. Avoid overlapping with existing elements
    const padding = 5; // Minimum spacing between elements
    Object.entries(existingPositions).forEach(([key, pos]) => {
      if (!pos) return;

      const existingRight = pos.x + (pos.width || 150);
      const existingBottom = pos.y + (pos.height || 50);

      // Check if overlapping
      if (
        pdfX < existingRight + padding &&
        pdfX + elementWidth > pos.x - padding &&
        pdfY < existingBottom + padding &&
        pdfY + elementHeight > pos.y - padding
      ) {
        // Push to the right if overlapping
        pdfX = existingRight + padding;

        // If still out of bounds, push down
        if (pdfX + elementWidth > previewPageWidth) {
          pdfX = Math.max(edgeMargin, pos.x);
          pdfY = existingBottom + padding;
        }
      }
    });

    // 7. Ensure within bounds
    pdfX = Math.max(
      edgeMargin,
      Math.min(pdfX, previewPageWidth - elementWidth - edgeMargin)
    );
    pdfY = Math.max(
      edgeMargin,
      Math.min(pdfY, previewPageHeight - elementHeight - edgeMargin)
    );

    return {
      x: Math.round(pdfX),
      y: Math.round(pdfY),
    };
  };

  // Handle cell click for table-based placement
  const handleCellClick = (rowIndex, column, requirementType) => {
    if (isTemplateLocked) {
      showError("Template is locked. Please unlock it first to make changes.");
      return;
    }

    // Get the currently selected element type from sidebar (prefer state over ref)
    const selectedType = selectedElementType || currentDragRef.current?.type;

    if (selectedType === "date-stamp" || selectedType === "date") {
      // Place date stamp in dateComplied column
      if (column !== "dateComplied") {
        showError(
          "Date stamps can only be placed in the 'Date Complied' column."
        );
        return;
      }

      // Check if this requirement already has a date stamp
      const existingDate = Object.keys(signaturePositions).find(
        (key) =>
          signaturePositions[key]?.linkedRequirementType === requirementType &&
          signaturePositions[key]?.column === "dateComplied"
      );

      if (existingDate) {
        // Replace existing date stamp (only one date per requirement)
        setSignaturePositions((prev) => {
          const updated = { ...prev };
          delete updated[existingDate];
          const nextCount = dateStampCount + 1;
          const key = `Date Stamp #${nextCount}`;
          updated[key] = {
            rowIndex,
            column: "dateComplied",
            linkedRequirementType: requirementType,
            isDateStamp: true,
          };
          setDateStampCount(nextCount);
          return updated;
        });
        success(`Date stamp updated for ${requirementType}`);
      } else {
        // Create new date stamp
        setDateStampCount((prevCount) => {
          const nextCount = prevCount + 1;
          const key = `Date Stamp #${nextCount}`;
          setSignaturePositions((prev) => ({
            ...prev,
            [key]: {
              rowIndex,
              column: "dateComplied",
              linkedRequirementType: requirementType,
              isDateStamp: true,
            },
          }));
          return nextCount;
        });
      }
    } else if (
      selectedType === "signature-all" ||
      selectedType === "signature" ||
      selectedType === "free-signature"
    ) {
      // Place signature in adviserSignature column
      if (column !== "adviserSignature") {
        showError(
          "Signatures can only be placed in the 'Adviser Signature' column."
        );
        return;
      }

      if (selectedType === "signature-all") {
        // Place signature for all requirements
        requirementTypes.forEach((reqType) => {
          const rowIdx = TABLE_LAYOUT.requirementRowMap[reqType];
          if (rowIdx !== undefined) {
            setSignaturePositions((prev) => ({
              ...prev,
              [reqType]: {
                rowIndex: rowIdx,
                column: "adviserSignature",
              },
            }));
          }
        });
      } else if (requirementType) {
        // Place signature for specific requirement
        // Check if this requirement already has a signature
        if (
          signaturePositions[requirementType]?.column === "adviserSignature"
        ) {
          // Replace existing signature (only one signature per requirement)
          setSignaturePositions((prev) => ({
            ...prev,
            [requirementType]: {
              rowIndex,
              column: "adviserSignature",
            },
          }));
          success(`Signature updated for ${requirementType}`);
        } else {
          setSignaturePositions((prev) => ({
            ...prev,
            [requirementType]: {
              rowIndex,
              column: "adviserSignature",
            },
          }));
          success(`Signature placed for ${requirementType}`);
        }
      } else if (selectedType === "free-signature") {
        // Create free signature
        setFreeSignatureCount((prevCount) => {
          const nextCount = prevCount + 1;
          const key = `Free Signature #${nextCount}`;
          setSignaturePositions((prev) => ({
            ...prev,
            [key]: {
              rowIndex,
              column: "adviserSignature",
              linkedRequirementType: null,
            },
          }));
          return nextCount;
        });
      }
    } else if (requirementType && requirementTypes.includes(requirementType)) {
      // Clicking on a requirement row - place signature by default if signature is selected
      if (
        currentSignature &&
        (selectedType === "signature" || selectedType === null)
      ) {
        // Check if this requirement already has a signature
        if (
          signaturePositions[requirementType]?.column === "adviserSignature"
        ) {
          showError(
            "This requirement already has a signature. Click again to replace it."
          );
          return;
        }
        setSignaturePositions((prev) => ({
          ...prev,
          [requirementType]: {
            rowIndex,
            column: "adviserSignature",
          },
        }));
        success(`Signature placed for ${requirementType}`);
      } else if (!selectedType) {
        showError(
          "Please select an element type (Date Stamp or Signature) from the sidebar first."
        );
      }
    } else if (!selectedType) {
      showError(
        "Please select an element type (Date Stamp or Signature) from the sidebar first."
      );
    }

    // Clear selection after placement
    if (selectedType && selectedType !== "signature-all") {
      setSelectedElementType(null);
      currentDragRef.current = null;
    }
  };

  // Legacy drag-and-drop handler (disabled - use cell-based placement instead)
  const handlePdfDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (isTemplateLocked) {
      showError("Template is locked. Please unlock it first to make changes.");
      return;
    }

    // Drag-and-drop is disabled - use cell-based placement for accurate PDF output
    showError(
      "Drag-and-drop is disabled. Please select an element type from the sidebar, then click on a table cell in the PDF to place it. Placement snaps to table rows for accurate PDF output."
    );
  };

  // Handle PDF drag over
  const handlePdfDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    // Prevent drag over if template is locked
    if (isTemplateLocked) {
      e.dataTransfer.dropEffect = "none";
      return;
    }
    // Set dropEffect to match the effectAllowed from drag start
    // Check what's being dragged based on currentDragRef or dataTransfer
    const draggedType = currentDragRef.current?.type;
    if (draggedType === "requirement") {
      e.dataTransfer.dropEffect = "move";
    } else {
      e.dataTransfer.dropEffect = "copy";
    }
  };

  // Handle PDF drag enter
  const handlePdfDragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  // Handle PDF drag leave
  const handlePdfDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  // Handle signature drag start
  const handleSignatureDragStart = (e, reqType) => {
    if (
      isTemplateLocked ||
      lockedSignatures[reqType] ||
      croppingSignature === reqType
    ) {
      e.preventDefault();
      return;
    }
    e.stopPropagation();
    setDraggingSignature(reqType);
    const pos = signaturePositions[reqType];
    const rect = pdfContainerRef.current?.getBoundingClientRect();
    if (rect && pos) {
      const scale = pdfScale;
      // Calculate the offset from the mouse position to the signature's top-left corner
      const signatureDisplayX = pos.x * scale;
      const signatureDisplayY =
        (previewPageHeight - pos.y - pos.height) * scale;
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;

      setDragStartPos({
        x: mouseX - signatureDisplayX, // Offset from mouse to signature corner
        y: mouseY - signatureDisplayY,
      });
    }
  };

  // Handle resize start - Improved with better precision
  const handleResizeStart = (e, reqType, handle) => {
    e.stopPropagation();
    e.preventDefault();
    if (
      isTemplateLocked ||
      lockedSignatures[reqType] ||
      croppingSignature === reqType
    )
      return;

    setResizingSignature(reqType);
    setResizeHandle(handle);
    const pos = signaturePositions[reqType];
    if (pos) {
      setResizeStartSize({ width: pos.width, height: pos.height });
      setAspectRatio(pos.width / pos.height);
      const rect = pdfContainerRef.current?.getBoundingClientRect();
      const scale = pdfScale;
      if (rect) {
        // Store the initial mouse position and signature position in PDF coordinates
        const initialMouseX = (e.clientX - rect.left) / scale;
        const initialMouseY =
          (previewPageHeight * scale - (e.clientY - rect.top)) / scale;

        setResizeStartPos({
          x: initialMouseX,
          y: initialMouseY,
        });
      }
    }
  };

  // Handle lock toggle
  const toggleLock = (reqType) => {
    if (isTemplateLocked) {
      showError("Template is locked. Please unlock it first to make changes.");
      return;
    }
    setLockedSignatures((prev) => ({
      ...prev,
      [reqType]: !prev[reqType],
    }));
  };

  // Handle crop start
  const handleCropStart = (reqType) => {
    if (isTemplateLocked || lockedSignatures[reqType]) return;
    setCroppingSignature(reqType);
    const pos = signaturePositions[reqType];
    if (pos) {
      setCropArea({
        x: pos.x,
        y: pos.y,
        width: pos.width,
        height: pos.height,
      });
    }
  };

  // Handle crop resize start
  const handleCropResizeStart = (e, handle) => {
    if (!croppingSignature || !cropArea) return;
    e.stopPropagation();
    setResizeHandle(handle);
    const rect = pdfContainerRef.current?.getBoundingClientRect();
    if (rect) {
      setResizeStartPos({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      });
    }
  };

  // Apply crop
  const applyCrop = () => {
    if (isTemplateLocked) {
      showError("Template is locked. Please unlock it first to make changes.");
      return;
    }
    if (!croppingSignature || !cropArea) return;
    setSignaturePositions((prev) => ({
      ...prev,
      [croppingSignature]: {
        ...prev[croppingSignature],
        x: Math.round(cropArea.x),
        y: Math.round(cropArea.y),
        width: Math.round(cropArea.width),
        height: Math.round(cropArea.height),
      },
    }));
    setCroppingSignature(null);
    setCropArea(null);
  };

  // Cancel crop
  const cancelCrop = () => {
    setCroppingSignature(null);
    setCropArea(null);
  };

  // Handle reset signature
  const handleResetSignature = (reqType) => {
    if (isTemplateLocked) {
      showError("Template is locked. Please unlock it first to make changes.");
      return;
    }
    setSignaturePositions((prev) => {
      const updated = { ...prev };
      delete updated[reqType];
      return updated;
    });
    setLockedSignatures((prev) => {
      const updated = { ...prev };
      delete updated[reqType];
      return updated;
    });
  };

  // Handle reset all signatures (remove all signature placements)
  const handleResetAllSignatures = () => {
    if (isTemplateLocked) {
      showError("Template is locked. Please unlock it first to make changes.");
      return;
    }
    setSignaturePositions({});
    setLockedSignatures({});
    setCroppingSignature(null);
    setCropArea(null);
  };

  // Handle checklist upload
  const handleChecklistUpload = async () => {
    if (!selectedChecklistFile) {
      setError("Please select a PDF file for checklist template");
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

      // Save metadata to Firestore for each requirement type with signature positions
      const uploadPromises = Object.keys(signaturePositions).map((reqType) => {
        const pos = signaturePositions[reqType];
        return addDoc(collection(db, "checklist_templates"), {
          fileName: selectedChecklistFile.name,
          downloadUrl,
          storagePath,
          requirementType: reqType,
          signaturePosition: {
            x: pos.x,
            y: pos.y,
            width: pos.width,
            height: pos.height,
          },
          active: true,
          uploadedAt: new Date().toISOString(),
          uploadedBy: auth.currentUser.uid,
          fileSize: selectedChecklistFile.size,
        });
      });

      await Promise.all(uploadPromises);

      // Reset form
      setSelectedChecklistFile(null);
      setChecklistPreviewUrl(null);
      setSignaturePositions({});
      setLockedSignatures({});
      document.getElementById("checklist-file-input")?.value &&
        (document.getElementById("checklist-file-input").value = "");

      success("Checklist template uploaded successfully!");
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
        {/* Page Header */}
        <div className="resource-header">
          <h1>Resource Management</h1>
          <p className="resource-management-subtitle">
            Upload and manage files for student support and resources
          </p>
        </div>

        {/* Statistics Overview */}
        <div className="resource-management-stats">
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
            <div className="stat-card">
              <div className="stat-icon tutorial">
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
        </div>

        <div className="resource-management-section">
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
              <div className="upload-section-header">
                <h2>
                  <IoDocumentTextOutline className="section-icon" />
                  OJT How to Start
                </h2>
                <p className="section-note">
                  Upload OJT guide files. You can upload multiple files for student reference.
                </p>
              </div>

              <div className="upload-section-body">
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
            </div>

            {/* Requirement Files Upload Section */}
            <div className="upload-section">
              <div className="upload-section-header">
                <h2>
                  <IoDocumentOutline className="section-icon" />
                  Upload Requirement Files
                </h2>
                <p className="section-note">
                  Upload the requirement documents that students need to submit
                  for their OJT. These files will appear in the mobile app.
                </p>
              </div>

              <div className="upload-section-body">
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
            </div>

            {/* Checklist Template Upload Section - REMOVED */}
            {/* 
            <div className="upload-section" style={{ 
              gridColumn: "1 / -1",
              background: "linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)",
              border: "2px solid #e1e4e8",
              borderRadius: "12px",
              padding: "2rem",
              boxShadow: "0 4px 6px rgba(0, 0, 0, 0.05)",
            }}>
              <div style={{ marginBottom: "1.5rem" }}>
                <h2 style={{ 
                  fontSize: "1.75rem", 
                  fontWeight: 700, 
                  color: "#1a1a1a",
                  marginBottom: "0.5rem",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.75rem",
                }}>
                  <IoDocumentTextOutline style={{ color: "#6366f1" }} />
                  Checklist Template
                </h2>
                <p className="section-note" style={{
                  fontSize: "0.95rem",
                  color: "#6b7280",
                  lineHeight: "1.6",
                  margin: 0,
                }}>
                  Upload PDF checklist template and position signatures. Once saved, this template
                  will be used for all requirement approvals. Click on table cells to place date stamps
                  and signatures. Placement snaps to table rows for accurate PDF output.
                </p>
              </div>

              <div 
                className={`upload-form ${dragActiveChecklist ? "drag-active" : ""}`}
                onDragEnter={handleChecklistDrag}
                onDragLeave={handleChecklistDragLeave}
                onDragOver={handleChecklistDrag}
                onDrop={handleChecklistDrop}
                style={{
                  backgroundColor: "#ffffff",
                  borderRadius: "10px",
                  padding: "1.5rem",
                  border: dragActiveChecklist ? "2px dashed #6366f1" : "1px solid #e5e7eb",
                  transition: "all 0.3s ease",
                }}
              >
                <div className="form-group">
                  <label htmlFor="checklist-file-input" style={{
                    fontSize: "0.95rem",
                    fontWeight: 600,
                    color: "#374151",
                    marginBottom: "0.75rem",
                    display: "block",
                  }}>
                    Select PDF File or Drag & Drop <span style={{ color: "#ef4444" }}>*</span>
                  </label>
                  <div className="file-input-wrapper" style={{
                    position: "relative",
                    border: "2px dashed #d1d5db",
                    borderRadius: "8px",
                    padding: "2rem",
                    textAlign: "center",
                    backgroundColor: "#f9fafb",
                    transition: "all 0.3s ease",
                    cursor: "pointer",
                  }}>
                    <input
                      id="checklist-file-input"
                      type="file"
                      accept="application/pdf"
                      onChange={handleChecklistFileSelect}
                      className="file-input"
                      disabled={uploadingChecklist}
                      style={{
                        position: "absolute",
                        width: "100%",
                        height: "100%",
                        opacity: 0,
                        cursor: "pointer",
                        top: 0,
                        left: 0,
                      }}
                    />
                    {!dragActiveChecklist && (
                      <div style={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        gap: "0.75rem",
                        pointerEvents: "none",
                      }}>
                        <IoCloudUploadOutline style={{ fontSize: "2.5rem", color: "#9ca3af" }} />
                        <div>
                          <p style={{ margin: 0, color: "#6b7280", fontWeight: 500 }}>
                            Click to browse or drag PDF here
                          </p>
                          <p style={{ margin: "0.25rem 0 0 0", fontSize: "0.85rem", color: "#9ca3af" }}>
                            PDF files only
                          </p>
                        </div>
                      </div>
                    )}
                    {dragActiveChecklist && (
                      <div className="drag-overlay" style={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        gap: "0.75rem",
                        pointerEvents: "none",
                      }}>
                        <IoCloudUploadOutline style={{ fontSize: "3rem", color: "#6366f1" }} />
                        <p style={{ margin: 0, color: "#6366f1", fontWeight: 600, fontSize: "1.1rem" }}>
                          Drop PDF file here
                        </p>
                      </div>
                    )}
                  </div>
                  {selectedChecklistFile && (
                    <div style={{ marginTop: "1rem" }}>
                      <div className="file-info" style={{
                        padding: "0.75rem 1rem",
                        backgroundColor: "#ecfdf5",
                        border: "1px solid #10b981",
                        borderRadius: "6px",
                        display: "flex",
                        alignItems: "center",
                        gap: "0.5rem",
                        marginBottom: "1rem",
                      }}>
                        <IoDocumentTextOutline style={{ color: "#10b981", fontSize: "1.25rem" }} />
                        <div style={{ flex: 1 }}>
                          <strong style={{ color: "#065f46", display: "block" }}>
                            {selectedChecklistFile.name}
                          </strong>
                          <span style={{ fontSize: "0.85rem", color: "#047857" }}>
                            {formatFileSize(selectedChecklistFile.size)}
                          </span>
                        </div>
                      </div>
                      <button
                        onClick={uploadAndSaveTemplate}
                        disabled={uploadingChecklist}
                        style={{
                          width: "100%",
                          padding: "0.875rem 1rem",
                          backgroundColor: uploadingChecklist ? "#9ca3af" : "#6366f1",
                          color: "#ffffff",
                          border: "none",
                          borderRadius: "8px",
                          fontSize: "0.875rem",
                          fontWeight: 600,
                          cursor: uploadingChecklist ? "not-allowed" : "pointer",
                          transition: "all 0.2s ease",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          gap: "0.5rem",
                        }}
                        onMouseEnter={(e) => {
                          if (!uploadingChecklist) {
                            e.currentTarget.style.backgroundColor = "#4f46e5";
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (!uploadingChecklist) {
                            e.currentTarget.style.backgroundColor = "#6366f1";
                          }
                        }}
                      >
                        {uploadingChecklist ? (
                          <>
                            <span>⏳</span>
                            <span>Uploading...</span>
                          </>
                        ) : (
                          <>
                            <IoCloudUploadOutline style={{ fontSize: "1.125rem" }} />
                            <span>Upload & Save Template</span>
                          </>
                        )}
                      </button>
                      <p style={{
                        marginTop: "0.75rem",
                        fontSize: "0.75rem",
                        color: "#6b7280",
                        textAlign: "center",
                        fontStyle: "italic",
                      }}>
                        Template will be saved but remain editable (you can add dates and signatures)
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
            */}
            {/* End of Checklist Template Section - REMOVED */}

            {/* PDF Preview Section - REMOVED - All code removed */}
            {/* End of PDF Preview Section - REMOVED */}
          </div>

          {/* Uploaded Files Section */}
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
                      : "Upload your first file using the forms above."
                  }
                />
              ) : (
                <>
                  {/* OJT How to Start */}
                  {filteredFiles.filter((f) => f.category === "tutorial")
                    .length > 0 && (
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
                                    style={{
                                      border: "none",
                                      cursor: "pointer",
                                    }}
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
                          filteredFiles.filter(
                            (f) => f.category === "fileNeeded"
                          ).length
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
                                    style={{
                                      border: "none",
                                      cursor: "pointer",
                                    }}
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
                                    style={{
                                      border: "none",
                                      cursor: "pointer",
                                    }}
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
      {showPreview && (previewFile || previewLoading) && (
        <div className="preview-modal-overlay" onClick={handleClosePreview}>
          <div
            className="preview-modal-content"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="preview-modal-header">
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.75rem",
                  flex: 1,
                  minWidth: 0,
                }}
              >
                {previewFile && (
                  <>
                    {previewFile.fileType?.startsWith("image/") ? (
                      <IoImageOutline
                        style={{
                          fontSize: "1.5rem",
                          color: "#1976d2",
                          flexShrink: 0,
                        }}
                      />
                    ) : previewFile.fileType === "application/pdf" ||
                      previewFile.fileType === "application/x-pdf" ? (
                      <IoDocumentTextOutline
                        style={{
                          fontSize: "1.5rem",
                          color: "#d32f2f",
                          flexShrink: 0,
                        }}
                      />
                    ) : (
                      <IoDocumentOutline
                        style={{
                          fontSize: "1.5rem",
                          color: "#6b7280",
                          flexShrink: 0,
                        }}
                      />
                    )}
                  </>
                )}
                <h2>{previewFile?.fileName || "Loading..."}</h2>
              </div>
              {/* Zoom Controls - Only show for images and PDFs */}
              {previewFile &&
                !previewLoading &&
                !previewError &&
                (previewFile.fileType?.startsWith("image/") ||
                  previewFile.fileType === "application/pdf" ||
                  previewFile.fileType === "application/x-pdf") && (
                  <div className="preview-zoom-controls">
                    <button
                      onClick={handleZoomOut}
                      className="zoom-btn"
                      title="Zoom Out (Ctrl + Scroll)"
                      disabled={zoomLevel <= 0.5}
                    >
                      <IoRemove />
                    </button>
                    <span className="zoom-level">
                      {Math.round(zoomLevel * 100)}%
                    </span>
                    <button
                      onClick={handleZoomIn}
                      className="zoom-btn"
                      title="Zoom In (Ctrl + Scroll)"
                      disabled={zoomLevel >= 3}
                    >
                      <IoAdd />
                    </button>
                    {zoomLevel !== 1 && (
                      <button
                        onClick={handleResetZoom}
                        className="zoom-btn reset-btn"
                        title="Reset Zoom"
                      >
                        <IoRefresh />
                      </button>
                    )}
                  </div>
                )}
              <button
                onClick={handleClosePreview}
                className="preview-close-btn"
                aria-label="Close preview"
                title="Close (Esc)"
              >
                <IoCloseOutline />
              </button>
            </div>
            <div
              className="preview-modal-body"
              ref={previewContainerRef}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
              onWheel={handleWheel}
              style={{
                cursor:
                  zoomLevel > 1 ? (isPanning ? "grabbing" : "grab") : "default",
              }}
            >
              {previewLoading ? (
                <div className="preview-loading">
                  <LoadingSpinner />
                  <p>Loading preview...</p>
                  <p
                    style={{
                      fontSize: "0.875rem",
                      color: "#9ca3af",
                      marginTop: "0.5rem",
                    }}
                  >
                    Please wait while we fetch the file
                  </p>
                </div>
              ) : previewFile ? (
                (() => {
                  const previewUrl = getPreviewUrl(previewFile);
                  if (previewError || !previewUrl) {
                    return (
                      <div className="preview-not-supported">
                        <div
                          style={{
                            fontSize: "3rem",
                            marginBottom: "1rem",
                            opacity: 0.5,
                          }}
                        >
                          <IoDocumentOutline />
                        </div>
                        <p>Unable to load preview</p>
                        <p
                          style={{
                            fontSize: "0.875rem",
                            color: "#9ca3af",
                            marginTop: "0.5rem",
                          }}
                        >
                          The file URL may be invalid or expired. Please try
                          downloading the file to view it.
                        </p>
                      </div>
                    );
                  }
                  if (previewFile.fileType?.startsWith("image/")) {
                    return (
                      <div
                        className="preview-image-container"
                        style={{
                          transform: `translate(${panPosition.x}px, ${panPosition.y}px) scale(${zoomLevel})`,
                          transformOrigin: "center center",
                          transition: isPanning
                            ? "none"
                            : "transform 0.1s ease-out",
                        }}
                      >
                        <img
                          src={previewUrl}
                          alt={previewFile.fileName}
                          className="preview-image"
                          onError={() => {
                            console.error("Image failed to load:", previewUrl);
                            setPreviewError(true);
                          }}
                          draggable={false}
                        />
                      </div>
                    );
                  } else if (
                    previewFile.fileType === "application/pdf" ||
                    previewFile.fileType === "application/x-pdf"
                  ) {
                    return (
                      <div
                        className="preview-pdf-container"
                        style={{
                          transform: `translate(${panPosition.x}px, ${panPosition.y}px) scale(${zoomLevel})`,
                          transformOrigin: "center center",
                          transition: isPanning
                            ? "none"
                            : "transform 0.1s ease-out",
                        }}
                      >
                        <iframe
                          src={previewUrl}
                          title={previewFile.fileName}
                          className="preview-pdf"
                          onLoad={() => {
                            console.log("PDF iframe loaded successfully");
                          }}
                          onError={() => {
                            console.error(
                              "PDF iframe failed to load:",
                              previewUrl
                            );
                            setPreviewError(true);
                          }}
                        />
                      </div>
                    );
                  } else {
                    return (
                      <div className="preview-not-supported">
                        <div
                          style={{
                            fontSize: "3rem",
                            marginBottom: "1rem",
                            opacity: 0.5,
                          }}
                        >
                          <IoDocumentOutline />
                        </div>
                        <p>Preview not available</p>
                        <p
                          style={{
                            fontSize: "0.875rem",
                            color: "#9ca3af",
                            marginTop: "0.5rem",
                          }}
                        >
                          This file type cannot be previewed. Please download
                          the file to view it.
                        </p>
                      </div>
                    );
                  }
                })()
              ) : (
                <div className="preview-not-supported">
                  <div
                    style={{
                      fontSize: "3rem",
                      marginBottom: "1rem",
                      opacity: 0.5,
                    }}
                  >
                    <IoDocumentOutline />
                  </div>
                  <p>No file data available</p>
                </div>
              )}
            </div>
            <div className="preview-modal-footer">
              {previewFile && (
                <button
                  onClick={() => handleDownload(previewFile)}
                  className="download-btn"
                  disabled={previewLoading}
                >
                  <IoDownloadOutline /> Download File
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ResourceManagementDashboard;
