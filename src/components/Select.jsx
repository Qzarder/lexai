import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";

/**
 * options: [{ value, label, flag?, sub? }]
 * value, onChange, placeholder
 */
export default function Select({ options, value, onChange, placeholder = "Select…" }) {
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState({ top: 0, left: 0, width: 0 });
  const triggerRef = useRef(null);
  const dropRef = useRef(null);

  const selected = options.find(o => o.value === value);

  const openDropdown = () => {
    const rect = triggerRef.current.getBoundingClientRect();
    setPos({
      top: rect.bottom + window.scrollY + 4,
      left: rect.left + window.scrollX,
      width: rect.width,
    });
    setOpen(true);
  };

  useEffect(() => {
    if (!open) return;
    const handler = (e) => {
      if (!triggerRef.current?.contains(e.target) && !dropRef.current?.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  const triggerStyle = {
    display: "flex",
    alignItems: "center",
    gap: 8,
    width: "100%",
    padding: "7px 10px",
    fontSize: 13,
    fontFamily: "inherit",
    background: "#fff",
    border: "0.5px solid #ccc",
    borderRadius: 8,
    cursor: "pointer",
    textAlign: "left",
    color: "#1a1a18",
    transition: "border-color 0.15s",
    userSelect: "none",
  };

  const dropStyle = {
    position: "absolute",
    top: pos.top,
    left: pos.left,
    width: pos.width,
    background: "#fff",
    border: "0.5px solid #d0d0cb",
    borderRadius: 10,
    boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
    zIndex: 9999,
    overflow: "hidden",
    maxHeight: 320,
    overflowY: "auto",
  };

  return (
    <>
      <button
        type="button"
        ref={triggerRef}
        onClick={open ? () => setOpen(false) : openDropdown}
        style={{ ...triggerStyle, borderColor: open ? "#888" : "#ccc" }}
      >
        {selected?.flag && <span style={{ fontSize: 18, lineHeight: 1 }}>{selected.flag}</span>}
        <span style={{ flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {selected ? selected.label : placeholder}
        </span>
        <i
          className={`ti ti-chevron-${open ? "up" : "down"}`}
          style={{ fontSize: 13, color: "#888", flexShrink: 0 }}
        />
      </button>

      {open && createPortal(
        <div ref={dropRef} style={dropStyle}>
          {options.map(opt => {
            const isActive = opt.value === value;
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => { onChange(opt.value); setOpen(false); }}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  width: "100%",
                  padding: "9px 12px",
                  fontSize: 13,
                  fontFamily: "inherit",
                  background: isActive ? "#f4f4f1" : "transparent",
                  border: "none",
                  borderRadius: 0,
                  cursor: "pointer",
                  textAlign: "left",
                  color: "#1a1a18",
                }}
                onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = "#f9f9f7"; }}
                onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = "transparent"; }}
              >
                {opt.flag && <span style={{ fontSize: 20, lineHeight: 1, flexShrink: 0 }}>{opt.flag}</span>}
                <span style={{ flex: 1, minWidth: 0 }}>
                  <span style={{ display: "block", fontWeight: isActive ? 500 : 400 }}>{opt.label}</span>
                  {opt.sub && (
                    <span style={{ display: "block", fontSize: 11, color: "#888", marginTop: 1 }}>{opt.sub}</span>
                  )}
                </span>
                {isActive && <i className="ti ti-check" style={{ fontSize: 13, color: "#378ADD", flexShrink: 0 }} />}
              </button>
            );
          })}
        </div>,
        document.body
      )}
    </>
  );
}
