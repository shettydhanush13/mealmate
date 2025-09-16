// src/pages/celebration-pages/celebrations/components/GuestsCard.jsx
import React from "react";
import "./styles.scss";

const GuestsCard = ({ guests, onChange, error }) => {
  return (
    <section className="guestsCard">
      <label htmlFor="guestsInput" className="subSectionTitle">Number of Guests</label>
      <input
        id="guestsInput"
        type="number"
        min="30"
        max="500"
        value={guests}
        onChange={onChange}
        className="guestsInput"
      />
      {error && <div className="errorText">{error}</div>}
      <div className="guestsHelper">Minimum 30 – Maximum 500 guests</div>
    </section>
  );
};

export default GuestsCard;
