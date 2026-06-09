import React from "react";
import './styles.scss';

const ICONS = { success: "✓", warning: "⚠️", info: "ℹ️" };

const Modal = ({ showModal, title, content, onClose, type = "success", closeLabel = "Done" }) => {
  if (!showModal) return null;

  return (
    <div className="okModalOverlay" onClick={onClose}>
      <div
        className="okModal"
        role="dialog"
        aria-modal="true"
        aria-label={title || "Notification"}
        onClick={(e) => e.stopPropagation()}
      >
        <div className={`okModal__icon okModal__icon--${type}`} aria-hidden="true">
          {ICONS[type] || ICONS.success}
        </div>

        {title && <h2 className="okModal__title">{title}</h2>}
        {content && <p className="okModal__content">{content}</p>}

        {onClose && (
          <button type="button" className="okModal__btn" onClick={onClose}>
            {closeLabel}
          </button>
        )}
      </div>
    </div>
  );
};

export default Modal;
