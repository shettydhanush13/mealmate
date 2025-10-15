// src/pages/celebration-pages/bulk-checkout/components/EventSummary.jsx
import React, { useMemo } from "react";
import PropTypes from "prop-types";
import './styles.scss'
/**
 * EventSummary
 * Reusable component to display summary information for celebrations/orders.
 *
 * Props:
 * - eventType (string | null)
 * - date (string | null) - ISO string
 * - guests (number|null)
 * - vegGuests (number|null)
 * - nonVegGuests (number|null)
 * - dietMode (string) - e.g. 'veg-only'
 * - mealType (string|null) - e.g. 'buffet' | 'caterbox'
 */
const EventSummary = ({
  eventType = null,
  date = null,
  guests = null,
  vegGuests = null,
  nonVegGuests = null,
  dietMode = "veg+nonveg",
  mealType = null,
}) => {
  const formatDateTime = (dtStr) => {
    if (!dtStr) return "Not set";
    const dt = new Date(dtStr);
    if (isNaN(dt.getTime())) return "Invalid date/time";
    return dt.toLocaleString(undefined, { timeZone: "Asia/Kolkata" });
  };

  const mealTypeDisplay = useMemo(() => {
    if (!mealType) return null;
    const key = String(mealType).toLowerCase();
    if (key === "buffet") {
      return { label: "Buffet (with service staff)", emoji: "" };
    }
    if (key === "caterbox" || key === "cater box" || key === "caterbox") {
      return { label: "CaterBox (boxed catering)", emoji: "" };
    }
    return { label: String(mealType), emoji: "🍱" };
  }, [mealType]);

  const safeNumber = (v) => {
    if (v === null || v === undefined || v === "") return "-";
    const n = Number(v);
    return Number.isFinite(n) ? n : v;
  };

  return (
    <aside className="eventSummaryCard" aria-label="Event summary" role="region">
      <h3 className="eventSummaryCard__title">Event Summary</h3>

      <ul className="eventSummaryCard__list">
        {eventType && (
          <li>
            <span className="label">Event type:</span>
            <span className="value">{eventType}</span>
          </li>
        )}

        {(date) && (
          <li>
            <span className="label">Date / Time:</span>
            <span className="value">{formatDateTime(date)}</span>
          </li>
        )}

        {guests !== null && guests !== undefined && (
          <li>
            <span className="label">Total Guests:</span>
            <span className="value">{safeNumber(guests)}</span>
          </li>
        )}

        <li>
          <span className="label">Veg Guests:</span>
          <span className="value">{safeNumber(vegGuests)}</span>
        </li>

        <li>
          <span className="label">Non-Veg Guests:</span>
          <span className="value">{dietMode === "veg-only" ? 0 : safeNumber(nonVegGuests)}</span>
        </li>

        {mealTypeDisplay && (
          <li className="mealTypeRow">
            <span className="label">Meal type:</span>
            <span className="value mealTypeValue">
              <span className="mealTypeValue__icon" aria-hidden="true">{mealTypeDisplay.emoji}</span>
              <span className="mealTypeValue__text">{mealTypeDisplay.label}</span>
            </span>
          </li>
        )}
      </ul>
    </aside>
  );
};

EventSummary.propTypes = {
  eventType: PropTypes.string,
  date: PropTypes.string,
  guests: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  vegGuests: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  nonVegGuests: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  dietMode: PropTypes.string,
  mealType: PropTypes.string,
};

export default EventSummary;
