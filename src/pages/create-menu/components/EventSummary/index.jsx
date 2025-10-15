// src/pages/create-menu/components/EventSummary.jsx
import React from "react";
import EditIcon from "@mui/icons-material/Edit"; // ✅ import MUI edit icon

/*
  Props:
  - dietConfig: { dietMode, vegGuests, nonVegGuests, kidsCount, eventTime, ... }
  - guestsFromRoute: optional number
  - onEdit: function
*/
const formatNumber = (v) => {
  if (v === null || v === undefined || v === "") return "-";
  const n = Number(v);
  return Number.isFinite(n) ? n : v;
};

const EventSummary = ({ dietConfig = {}, guestsFromRoute = null, onEdit }) => {
  const {
    dietMode = "veg+nonveg",
    vegGuests = "",
    nonVegGuests = "",
    // kidsCount = "",
  } = dietConfig || {};

  return (
    <div className="configSummary compact" aria-live="polite">
        <div className="summaryPills">
            <div style={{ display: "flex", gap: '5px' }}>
                <span className="pill">Veg: {formatNumber(vegGuests)}</span>
                <span className="pill">Non-veg: {dietMode === "veg-only" ? 0 : formatNumber(nonVegGuests)}</span>
                {/* <span className="pill">Kids: {formatNumber(kidsCount)}</span> */}
            </div>
            <button
                className="btn btn-icon"
                onClick={onEdit}
                aria-label="Edit event configuration"
                style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: 2 }}
            >
                <EditIcon fontSize="small" />
            </button>
        </div>
    </div>
  );
};

export default EventSummary;
