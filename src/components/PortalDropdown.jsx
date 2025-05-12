/**
 * PortalDropdown - A portal-based dropdown component that positions itself relative to an anchor element
 * Uses ReactDOM.createPortal to render the dropdown outside the normal DOM hierarchy
 */

import React, { useEffect, useRef, useState } from "react";
import ReactDOM from "react-dom";
import PropTypes from "prop-types";

const DROPDOWN_WIDTH = 140;
const DROPDOWN_OFFSET = 4;
const DROPDOWN_PADDING = 8;

const PortalDropdown = ({ anchorRef, open, children, onClose }) => {
  const dropdownRef = useRef();
  const [position, setPosition] = useState({ top: 0, left: 0 });

  // Update dropdown position when open or anchor position changes
  useEffect(() => {
    if (!open || !anchorRef.current) return;

    const updatePosition = () => {
      const rect = anchorRef.current.getBoundingClientRect();
      let left = rect.left;
      let top = rect.bottom + DROPDOWN_OFFSET;

      // Ensure dropdown stays within viewport
      if (left + DROPDOWN_WIDTH > window.innerWidth) {
        left = window.innerWidth - DROPDOWN_WIDTH - DROPDOWN_PADDING;
      }

      setPosition({ top, left });
    };

    updatePosition();

    // Update position on scroll and resize
    window.addEventListener("scroll", updatePosition, true);
    window.addEventListener("resize", updatePosition);

    return () => {
      window.removeEventListener("scroll", updatePosition, true);
      window.removeEventListener("resize", updatePosition);
    };
  }, [open, anchorRef]);

  // Handle clicks outside dropdown
  useEffect(() => {
    if (!open) return;

    const handleClick = (e) => {
      const isClickOutside =
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target) &&
        anchorRef.current &&
        !anchorRef.current.contains(e.target);

      if (isClickOutside) {
        onClose();
      }
    };

    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open, onClose, anchorRef]);

  if (!open || !anchorRef.current) return null;

  const style = {
    position: "fixed",
    top: position.top,
    left: position.left,
    zIndex: 3000,
    width: DROPDOWN_WIDTH,
  };

  return ReactDOM.createPortal(
    <div
      ref={dropdownRef}
      style={style}
      className="kebab-dropdown"
      role="menu"
      aria-orientation="vertical"
    >
      {children}
    </div>,
    document.body
  );
};

PortalDropdown.propTypes = {
  /** Reference to the anchor element */
  anchorRef: PropTypes.shape({ current: PropTypes.instanceOf(Element) })
    .isRequired,
  /** Whether the dropdown is open */
  open: PropTypes.bool.isRequired,
  /** Dropdown content */
  children: PropTypes.node.isRequired,
  /** Callback when dropdown should close */
  onClose: PropTypes.func.isRequired,
};

export default PortalDropdown;
