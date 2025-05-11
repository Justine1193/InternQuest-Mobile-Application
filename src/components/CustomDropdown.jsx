import React, { useRef, useState, useEffect } from 'react';

// --- CustomDropdown: A custom dropdown component for filter options ---
function CustomDropdown({ options, value, onChange }) {
  const [open, setOpen] = useState(false);
  const ref = useRef();

  useEffect(() => {
    function handleClickOutside(event) {
      if (ref.current && !ref.current.contains(event.target)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className={`custom-dropdown${open ? ' open' : ''}`} ref={ref}>
      <div
        className="custom-dropdown-selected"
        onClick={() => setOpen(o => !o)}
        tabIndex={0}
        onKeyDown={e => {
          if (e.key === 'Enter' || e.key === ' ') setOpen(o => !o);
          if (e.key === 'Escape') setOpen(false);
        }}
        role="button"
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        {value || options[0]}
      </div>
      {open && (
        <div className="custom-dropdown-list" role="listbox">
          {options.map(opt => (
            <div
              key={opt}
              className={`custom-dropdown-option${value === opt ? ' selected' : ''}`}
              onClick={() => { onChange(opt); setOpen(false); }}
              role="option"
              aria-selected={value === opt}
              tabIndex={-1}
            >
              {opt}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default CustomDropdown; 