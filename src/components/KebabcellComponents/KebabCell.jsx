/**
 * KebabCell - A component that renders a kebab menu (three dots) for table rows
 * Provides edit, select, and delete actions through a dropdown menu
 */

import React, { useRef, useState } from "react";
import PropTypes from "prop-types";
import { IoEllipsisVertical } from "react-icons/io5";
import PortalDropdown from "../PortalDropdown";
import "./KebabCell.css";

const ANIMATION_DURATION = 150;

function KebabCell({
  row,
  openMenuId = null,
  setOpenMenuId,
  selectedRowId = null,
  setSelectedRowId,
  handleDeleteSingle,
  isDeleting = false,
  selectionMode = false,
  setSelectedItems,
  setSelectionMode,
  setIsEditMode = null,
  setEditCompanyId = null,
  setFormData = null,
  setSkills = null,
  setIsModalOpen = null,
  onEdit = null,
}) {
  const kebabRef = useRef(null);
  const [isClicked, setIsClicked] = useState(false);

  /**
   * Handles kebab menu click and manages menu state
   */
  const handleKebabClick = () => {
    setIsClicked(true);

    // Toggle menu state
    if (openMenuId === row.id) {
      setOpenMenuId(null);
    } else {
      setOpenMenuId(row.id);
    }

    // Reset selection state
    setSelectedRowId(null);
    if (selectionMode) {
      setSelectionMode(false);
      setSelectedItems([]);
    }

    // Reset animation after duration
    setTimeout(() => setIsClicked(false), ANIMATION_DURATION);
  };

  /**
   * Handles edit action
   */
  const handleEdit = () => {
    if (typeof onEdit === "function") {
      onEdit(row);
    }
    setOpenMenuId(null);
    setSelectedRowId(null);
  };

  /**
   * Handles select action
   */
  const handleSelect = () => {
    setSelectionMode(true);
    setSelectedItems([row.id]);
    setOpenMenuId(null);
    setSelectedRowId(null);
  };

  /**
   * Handles delete action
   */
  const handleDelete = async () => {
    if (window.confirm("Are you sure you want to delete this item?")) {
      setIsDeleting(true);
      await handleDeleteSingle(row.id);
      setIsDeleting(false);
      setOpenMenuId(null);
      setSelectedRowId(null);
    }
  };

  const hasEditProps = Boolean(
    setIsEditMode &&
      setEditCompanyId &&
      setFormData &&
      setSkills &&
      setIsModalOpen
  );

  return (
    <span
      ref={kebabRef}
      className="kebab-icon-wrapper"
      style={{ position: "relative", display: "inline-block" }}
    >
      <IoEllipsisVertical
        className={`kebab-icon${isClicked ? " kebab-animate" : ""}`}
        onClick={handleKebabClick}
        title="Options"
        aria-label="Open options menu"
      />

      <PortalDropdown
        anchorRef={kebabRef}
        open={openMenuId === row.id}
        onClose={() => setOpenMenuId(null)}
      >
        {hasEditProps && (
          <button
            className="edit-btn"
            onClick={handleEdit}
            aria-label="Edit item"
          >
            Edit
          </button>
        )}

        {selectedRowId !== row.id ? (
          <button
            className="select-btn"
            onClick={handleSelect}
            aria-label="Select item"
          >
            Select
          </button>
        ) : (
          <button
            className="delete"
            onClick={handleDelete}
            disabled={isDeleting}
            aria-label={isDeleting ? "Deleting item" : "Delete item"}
          >
            {isDeleting ? "Deleting..." : "Delete"}
          </button>
        )}
      </PortalDropdown>
    </span>
  );
}

KebabCell.propTypes = {
  /** Row data object */
  row: PropTypes.shape({
    id: PropTypes.string.isRequired,
  }).isRequired,
  /** ID of currently open menu */
  openMenuId: PropTypes.string,
  /** Function to set open menu ID */
  setOpenMenuId: PropTypes.func.isRequired,
  /** ID of selected row */
  selectedRowId: PropTypes.string,
  /** Function to set selected row ID */
  setSelectedRowId: PropTypes.func.isRequired,
  /** Function to handle single item deletion */
  handleDeleteSingle: PropTypes.func.isRequired,
  /** Whether deletion is in progress */
  isDeleting: PropTypes.bool,
  /** Whether selection mode is active */
  selectionMode: PropTypes.bool,
  /** Function to set selected items */
  setSelectedItems: PropTypes.func.isRequired,
  /** Function to set selection mode */
  setSelectionMode: PropTypes.func.isRequired,
  /** Function to set edit mode */
  setIsEditMode: PropTypes.func,
  /** Function to set edit company ID */
  setEditCompanyId: PropTypes.func,
  /** Function to set form data */
  setFormData: PropTypes.func,
  /** Function to set skills */
  setSkills: PropTypes.func,
  /** Function to set modal open state */
  setIsModalOpen: PropTypes.func,
  /** Function to handle edit action */
  onEdit: PropTypes.func,
};

export default KebabCell;
