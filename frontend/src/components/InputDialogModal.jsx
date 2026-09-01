import { useState, useEffect, useRef } from "react";

function InputDialogModal({
  isOpen,
  title,
  placeholder,
  defaultValue = "",
  isConfirm = false,
  confirmText = "Are you sure?",
  onSubmit,
  onClose
}) {
  const [value, setValue] = useState(defaultValue);
  const inputRef = useRef(null);

  useEffect(() => {
    setValue(defaultValue);
    if (isOpen && !isConfirm) {
      setTimeout(() => {
        inputRef.current?.focus();
        inputRef.current?.select();
      }, 50);
    }
  }, [isOpen, defaultValue, isConfirm]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isConfirm) {
      onSubmit();
      onClose();
    } else {
      if (!value.trim()) return;
      onSubmit(value.trim());
      onClose();
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content input-modal-card" onClick={(e) => e.stopPropagation()}>
        {/* MODAL HEADER */}
        <div className="modal-header">
          <h3>{title}</h3>
          <button className="close-modal" onClick={onClose} type="button">
            ✕
          </button>
        </div>

        {/* MODAL BODY */}
        <form onSubmit={handleSubmit} className="modal-body">
          {isConfirm ? (
            <p className="confirm-modal-text">{confirmText}</p>
          ) : (
            <div className="input-group">
              <input
                ref={inputRef}
                type="text"
                className="custom-modal-input"
                placeholder={placeholder}
                value={value}
                onChange={(e) => setValue(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Escape") onClose();
                }}
              />
            </div>
          )}

          <div className="modal-footer-btns">
            <button type="button" className="btn-modal-cancel" onClick={onClose}>
              Cancel
            </button>
            <button
              type="submit"
              className={`btn-modal-submit ${isConfirm ? "btn-danger" : ""}`}
              disabled={!isConfirm && !value.trim()}
            >
              {isConfirm ? "Delete" : "Confirm"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default InputDialogModal;
