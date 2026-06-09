// src/pages/celebrations/components/PageHeader/index.jsx
import React from "react";
import "./styles.scss";

const CHIPS = ["🥗 Veg & Non-veg", "📍 Bangalore", "👥 30–500 guests", "⚡ Live counters"];

const PageHeader = () => (
  <section className="pageHeader">
    <header>
      <h1 className="pageTitle">CREATE A CELEBRATION</h1>
      <p className="pageSubtitle">PICK YOUR EVENT TYPE AND REQUIRED SERVICES</p>
    </header>

    <ul className="pageChips" aria-label="What we offer">
      {CHIPS.map((c) => (
        <li key={c} className="pageChip">{c}</li>
      ))}
    </ul>
  </section>
);

export default PageHeader;
