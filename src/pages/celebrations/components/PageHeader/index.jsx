// src/pages/celebrations/components/PageHeader/index.jsx
import React from "react";
import "./styles.scss";

const CHIPS = [
  "🍽️ Buffet for your special occasion",
  "🍱 Boxed meals/subscriptions",
  "✨ Hygienic kitchens",
  "🚚 On-time delivery, every time",
  "📍 All across Bengaluru",
];

const PageHeader = () => (
  <section className="pageHeader">
    <span className="pageHeader__eyebrow">
      <span className="pageHeader__dot" aria-hidden="true" />
      Bengaluru’s event &amp; bulk catering
    </span>
    <h1 className="pageTitle">
      Good Food, for any <span className="pageTitle__accent">Occasion</span>
    </h1>
    <p className="pageSubtitle">
      Parties, offices &amp; bulk orders — buffet or boxed meals with live counters, delivered across Bengaluru.
    </p>

    <ul className="pageChips" aria-label="What we offer">
      {CHIPS.map((c) => (
        <li key={c} className="pageChip">{c}</li>
      ))}
    </ul>
  </section>
);

export default PageHeader;
