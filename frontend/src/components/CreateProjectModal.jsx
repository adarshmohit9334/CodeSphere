import { useState, useEffect, useRef } from "react";

function CreateProjectModal({
  isOpen,
  onClose,
  onSubmit
}) {
  const [projectName, setProjectName] = useState("");
  const nameInputRef = useRef(null);

  useEffect(() => {
    setProjectName("");
    if (isOpen) {
      setTimeout(() => {
        nameInputRef.current?.focus();
      }, 50);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!projectName.trim()) return;
    onSubmit(projectName.trim());
    onClose();
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content input-modal-card" onClick={(e) => e.stopPropagation()}>
        {/* MODAL HEADER */}
        <div className="modal-header">
          <h3>➕ Create New Project</h3>
          <button className="close-modal" onClick={onClose} type="button">
            ✕
          </button>
        </div>

        {/* MODAL BODY */}
        <form onSubmit={handleSubmit} className="modal-body">
          <div className="input-group">
            <label style={{ display: 'block', marginBottom: '8px', color: '#c9d1d9', fontSize: '14px' }}>Project Name *</label>
            <input
              ref={nameInputRef}
              type="text"
              className="custom-modal-input"
              placeholder="e.g. Portfolio App"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Escape") onClose();
              }}
              required
            />
          </div>

          <div className="modal-footer-btns" style={{ marginTop: '24px' }}>
            <button type="button" className="btn-modal-cancel" onClick={onClose}>
              Cancel
            </button>
            <button
              type="submit"
              className="btn-modal-submit"
              disabled={!projectName.trim()}
            >
              Create Project
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default CreateProjectModal;
