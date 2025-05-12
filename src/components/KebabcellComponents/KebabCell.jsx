import React, { useRef, useState } from "react";
import { IoEllipsisVertical } from "react-icons/io5";
import PortalDropdown from "../PortalDropdown";
import "./KebabCell.css";

// --- KebabCell: Renders the kebab menu for each table row, with edit/select/delete actions ---
function KebabCell({
  row,
  openMenuId,
  setOpenMenuId,
  selectedRowId,
  setSelectedRowId,
  handleDeleteSingle,
  isDeleting,
  selectionMode,
  setSelectedItems,
  setSelectionMode,
  setIsEditMode,
  setEditCompanyId,
  setFormData,
  setSkills,
  setIsModalOpen,
  onEdit,
}) {
  const kebabRef = useRef(null);
  const [isClicked, setIsClicked] = useState(false);

  const handleKebabClick = () => {
    setIsClicked(true);
    if (openMenuId === row.id) {
      setOpenMenuId(null); // Close if already open
    } else {
      setOpenMenuId(row.id); // Open for this row
    }
    setSelectedRowId(null);
    if (selectionMode) {
      setSelectionMode(false);
      setSelectedItems([]);
    }
    setTimeout(() => setIsClicked(false), 150); // Reset animation
  };

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
      />
      <PortalDropdown
        anchorRef={kebabRef}
        open={openMenuId === row.id}
        onClose={() => setOpenMenuId(null)}
      >
        {/* Only show Edit button if all edit props are provided */}
        {setIsEditMode &&
          setEditCompanyId &&
          setFormData &&
          setSkills &&
          setIsModalOpen && (
            <button
              className="edit-btn"
              onClick={() => {
                if (typeof onEdit === "function") {
                  onEdit(row);
                }
                setOpenMenuId(null);
                setSelectedRowId(null);
              }}
            >
              Edit
            </button>
          )}
        {selectedRowId !== row.id ? (
          <button
            className="select-btn"
            onClick={() => {
              setSelectionMode(true);
              setSelectedItems([row.id]);
              setOpenMenuId(null);
              setSelectedRowId(null);
            }}
          >
            Select
          </button>
        ) : (
          <button
            className="delete"
            onClick={async () => {
              setIsDeleting(true);
              if (
                window.confirm("Are you sure you want to delete this student?")
              ) {
                await handleDeleteSingle(row.id);
              }
              setIsDeleting(false);
              setOpenMenuId(null);
              setSelectedRowId(null);
            }}
            disabled={isDeleting}
          >
            {isDeleting ? "Deleting..." : "Delete"}
          </button>
        )}
      </PortalDropdown>
    </span>
  );
}

export default KebabCell;
