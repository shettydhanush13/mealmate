// src/pages/celebration-pages/celebrations/components/EventTypeGrid.jsx
import React, { useMemo } from "react";
import { eventTypeOptions } from "../../../../data/celebrationsData";
import "./styles.scss";

/* Example artwork — replace with your assets or centralize into data file */
const EVENT_TYPE_IMAGES = {
  "Birthday Party":
    "https://img.freepik.com/premium-vector/joyful-family-gathers-celebrate-birthday-they-wear-colorful-party-hats-holding-balloons_87523-776.jpg",
  "House Party":
    "https://cdni.iconscout.com/illustration/premium/thumb/home-party-illustration-svg-download-png-3129034.png",
  "Corporate Event":
    "https://media.istockphoto.com/id/1180823000/vector/business-team-celebrate-birthday-party-flat-vector-illustration-anniversary-entertainment.jpg?s=612x612&w=0&k=20&c=1lfC4WCO1a48ItErLxfoF-O_cw7tserWIyVNcyvjSpo=",
  "Kitty Party":
    "https://img.freepik.com/premium-vector/hen-night-semi-flat-color-vector-characters-standing-figures-full-body-people-white-festive-celebration-simple-cartoon-style-illustration-web-graphic-design-animation_151150-8545.jpg?w=360",
};

const EventTypeGrid = ({ selectedEvent, onSelect }) => {
  const buttons = useMemo(() => {
    return eventTypeOptions.map((event) => {
      const active = selectedEvent === event;
      const imgSrc = EVENT_TYPE_IMAGES[event];
      return (
        <button
          key={event}
          type="button"
          className={`eventType ${active ? "active" : ""}`}
          onClick={() => onSelect(event)}
          aria-pressed={active}
        >
          {imgSrc && (
            <span className="eventThumb" aria-hidden="true">
              <img src={imgSrc} alt={`${event} thumbnail`} className="eventImg" loading="lazy" />
            </span>
          )}
          <span className="label">{event}</span>
        </button>
      );
    });
  }, [selectedEvent, onSelect]);

  return <div className="eventTypeGrid">{buttons}</div>;
};

export default EventTypeGrid;
