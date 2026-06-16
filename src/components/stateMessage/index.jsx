// src/components/stateMessage/index.jsx
// Reusable, Swiggy-style empty / error / info message block.
//
// Usage:
//   <StateMessage
//     emoji="🍽️"
//     title="No services selected yet."
//     description="Pick a few services to get started 🎉"
//     variant="empty"            // "empty" | "error" | "info"
//     action={<button>Browse</button>}  // optional
//   />
import React from "react";
import { FaGift } from "react-icons/fa";
import "./styles.scss";

const StateMessage = ({
  emoji = <FaGift />,
  title,
  description,
  variant = "empty",
  action,
  className = "",
}) => {
  return (
    <div
      className={`stateMessage stateMessage--${variant} ${className}`.trim()}
      role={variant === "error" ? "alert" : "status"}
    >
      <div className="stateMessage__art" aria-hidden="true">
        <span className="stateMessage__emoji">{emoji}</span>
      </div>

      {title && <h3 className="stateMessage__title">{title}</h3>}
      {description && <p className="stateMessage__desc">{description}</p>}
      {action && <div className="stateMessage__action">{action}</div>}
    </div>
  );
};

export default StateMessage;
