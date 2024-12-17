import React, { useRef, useEffect } from "react";

function DropdownMenu({ isOpen, setIsOpen, children }) {
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [setIsOpen]);

  return (
    <div className="relative inline-block text-left" ref={menuRef}>
      {isOpen && (
        <div className="absolute right-0 mt-3 w-56 border border-border/30 rounded-md bg-card shadow-lg ring-1 ring-black ring-opacity-5">
          <div className="p-2">{children}</div>
        </div>
      )}
    </div>
  );
}

export default DropdownMenu;
