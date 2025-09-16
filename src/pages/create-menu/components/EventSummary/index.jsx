// src/pages/create-menu/components/EventSummary.jsx
import React from "react";

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
    kidsCount = "",
  } = dietConfig || {};

  // compute numeric total only if parseable
  const vegNum = Number.isFinite(Number(vegGuests)) ? Number(vegGuests) : null;
  const nonVegNum = Number.isFinite(Number(nonVegGuests)) ? Number(nonVegGuests) : null;
  const kidsNum = Number.isFinite(Number(kidsCount)) ? Number(kidsCount) : null;

  const totalGuests =
    (vegNum || 0) + (nonVegNum || 0) + (kidsNum || 0);

  return (
    <div style={{ padding: "0 8px 8px 8px" }}>
      <div className="configSummary compact" aria-live="polite">
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }} className="summaryPills">
            <span className="pill">{dietMode === "veg-only" ? "Veg only" : "Veg + Non-Veg"}</span>
            <span className="pill">Veg: {formatNumber(vegGuests)}</span>
            <span className="pill">Non-veg: {dietMode === "veg-only" ? 0 : formatNumber(nonVegGuests)}</span>
            <span className="pill">Kids: {formatNumber(kidsCount)}</span>
            <span className="pill">Total: {Number.isFinite(totalGuests) ? totalGuests : "-"}</span>
            {guestsFromRoute ? <span className="pill">Party size: {guestsFromRoute}</span> : null}
          </div>
        </div>

        <div className="summaryActions" style={{ marginLeft: "auto" }}>
          <button className="btn btn-outline" onClick={onEdit} aria-label="Edit event configuration">Edit</button>
        </div>
      </div>
    </div>
  );
};

export default EventSummary;
