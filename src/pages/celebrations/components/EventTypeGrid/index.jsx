// src/pages/celebration-pages/celebrations/components/EventTypeGrid.jsx
import React, { useMemo } from "react";
import { eventTypeOptions } from "../../../../data/celebrationsData";
import "./styles.scss";

/* Example artwork — replace with your assets or centralize into data file */
const EVENT_TYPE_IMAGES = {
  "Birthday Party":
    "https://img.freepik.com/premium-vector/happy-people-celebrating-birthday-party-flat-style-illustration-vector-design_538610-2262.jpg?w=360",
  "House Party":
    "https://cdni.iconscout.com/illustration/premium/thumb/happy-family-home-party-illustration-svg-png-download-4146607.png",
  "Corporate Event":
    "https://static.vecteezy.com/ti/vecteur-libre/p1/11430989-heureux-petits-hommes-d-affaires-dansant-s-amusant-et-buvant-du-vin-fete-d-entreprise-activite-de-team-building-concept-d-idee-d-evenement-d-entreprise-illustration-moderne-de-vecteur-plat-vectoriel.jpg",
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
