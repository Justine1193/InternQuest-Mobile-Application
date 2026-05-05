/**
 * Row kebab menu: edit, select, delete, or accept (adviser).
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
  handleAcceptStudent = null,
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
  isAdviser = false,
}) {
  const kebabRef = useRef(null);
  const [isClicked, setIsClicked] = useState(false);

  const handleKebabClick = () => {
    setIsClicked(true);
    if (openMenuId === row.id) {
      setOpenMenuId(null);
    } else {
      setOpenMenuId(row.id);
    }
    setSelectedRowId(null);
    if (selectionMode) {
      setSelectionMode(false);
      setSelectedItems([]);
    }
    setTimeout(() => setIsClicked(false), ANIMATION_DURATION);
  };

  const handleEdit = () => {
    if (typeof onEdit === "function") onEdit(row);
    setOpenMenuId(null);
    setSelectedRowId(null);
  };

  const handleSelect = () => {
    setSelectionMode(true);
    setSelectedItems([row.id]);
    setOpenMenuId(null);
    setSelectedRowId(null);
  };

  const handleDelete = async () => {
    if (window.confirm("Are you sure you want to delete this item?")) {
      setIsDeleting(true);
      await handleDeleteSingle(row.id);
      setIsDeleting(false);
      setOpenMenuId(null);
      setSelectedRowId(null);
    }
  };

  const handleAccept = async () => {
    if (window.confirm("Are you sure you want to accept this student?")) {
      if (handleAcceptStudent) await handleAcceptStudent(row.id);
      setOpenMenuId(null);
      setSelectedRowId(null);
    }
  };

  const isPending =
    row.status === false ||
    row.status === undefined ||
    row.status === null;

  const hasEditProps = Boolean(
    setIsEditMode &&
      setEditCompanyId &&
      setFormData &&
      setSkills &&
      setIsModalOpen
  );
  const showEdit = typeof onEdit === "function" || hasEditProps;

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
        key={`kebab-${row.id}`}
        anchorRef={kebabRef}
        open={openMenuId === row.id}
        onClose={() => setOpenMenuId(null)}
      >
        {showEdit && (
          <button
            className="edit-btn"
            onClick={handleEdit}
            aria-label="Edit item"
          >
            Edit
          </button>
        )}
        {isAdviser ? (
          isPending && handleAcceptStudent ? (
            <button
              className="accept-btn"
              onClick={handleAccept}
              aria-label="Accept student"
            >
              Accept Student
            </button>
          ) : !showEdit ? (
            <span className="no-action-text">No actions available</span>
          ) : null
        ) : selectedRowId !== row.id ? (
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
  row: PropTypes.shape({
    id: PropTypes.string.isRequired,
    status: PropTypes.any,
  }).isRequired,
  openMenuId: PropTypes.string,
  setOpenMenuId: PropTypes.func.isRequired,
  selectedRowId: PropTypes.string,
  setSelectedRowId: PropTypes.func.isRequired,
  handleDeleteSingle: PropTypes.func.isRequired,
  isDeleting: PropTypes.bool,
  selectionMode: PropTypes.bool,
  setSelectedItems: PropTypes.func.isRequired,
  setSelectionMode: PropTypes.func.isRequired,
  setIsEditMode: PropTypes.func,
  setEditCompanyId: PropTypes.func,
  setFormData: PropTypes.func,
  setSkills: PropTypes.func,
  setIsModalOpen: PropTypes.func,
  onEdit: PropTypes.func,
  handleAcceptStudent: PropTypes.func,
  isAdviser: PropTypes.bool,
};

export default KebabCell;
