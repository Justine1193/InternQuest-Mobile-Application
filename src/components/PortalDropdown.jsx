import React, { useEffect, useRef, useState } from "react";
import ReactDOM from "react-dom";

const PortalDropdown = ({ anchorRef, open, children, onClose }) => {
  const dropdownRef = useRef();
  const [position, setPosition] = useState({ top: 0, left: 0 });

  useEffect(() => {
    if (!open || !anchorRef.current) return;

    const DROPDOWN_WIDTH = 140;
    const updatePosition = () => {
      const rect = anchorRef.current.getBoundingClientRect();
      let left = rect.left;
      let top = rect.bottom + 4;
      if (left + DROPDOWN_WIDTH > window.innerWidth) {
        left = window.innerWidth - DROPDOWN_WIDTH - 8;
      }
      setPosition({ top, left });
    };

    updatePosition();

    window.addEventListener("scroll", updatePosition, true);
    window.addEventListener("resize", updatePosition);

    return () => {
      window.removeEventListener("scroll", updatePosition, true);
      window.removeEventListener("resize", updatePosition);
    };
  }, [open, anchorRef]);

  useEffect(() => {
    if (!open) return;
    const handleClick = (e) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target) &&
        anchorRef.current &&
        !anchorRef.current.contains(e.target)
      ) {
        onClose();
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open, onClose, anchorRef]);

  if (!open || !anchorRef.current) return null;

  const DROPDOWN_WIDTH = 140;
  const style = {
    position: "fixed",
    top: position.top,
    left: position.left,
    zIndex: 3000,
    width: DROPDOWN_WIDTH,
  };

  return ReactDOM.createPortal(
    <div ref={dropdownRef} style={style} className="kebab-dropdown">
      {children}
    </div>,
    document.body
  );
};

export default PortalDropdown;
