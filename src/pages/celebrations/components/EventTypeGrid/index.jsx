// src/pages/celebration-pages/celebrations/components/EventTypeGrid.jsx
import React, { useMemo } from "react";
import { eventTypeOptions } from "../../../../data/services/celebrationsData";
import "./styles.scss";

const EventTypeGrid = ({ selectedEvent, onSelect }) => {
  const buttons = useMemo(() => {
    return eventTypeOptions.map((event) => {
      const active = selectedEvent === event;
      return (
        <button
          key={event}
          type="button"
          className={`eventType ${active ? "active" : ""}`}
          onClick={() => onSelect(event)}
          aria-pressed={active}
        >
          <span className="label">{event}</span>
        </button>
      );
    });
  }, [selectedEvent, onSelect]);

  return <div className="eventTypeGrid">{buttons}</div>;
};

export default EventTypeGrid;
