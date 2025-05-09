import React, { useEffect, useRef } from 'react';
import ReactDOM from 'react-dom';

const PortalDropdown = ({ anchorRef, open, children, onClose }) => {
  const dropdownRef = useRef();

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
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [open, onClose, anchorRef]);

  if (!open || !anchorRef.current) return null;

  // Get anchor position
  const rect = anchorRef.current.getBoundingClientRect();
  const style = {
    position: 'fixed',
    top: rect.bottom + window.scrollY,
    left: rect.right - 120 + window.scrollX, // 120 = dropdown width
    zIndex: 3000,
  };

  return ReactDOM.createPortal(
    <div ref={dropdownRef} style={style} className="kebab-dropdown">
      {children}
    </div>,
    document.body
  );
};

export default PortalDropdown;
