// src/pages/celebrations/components/PageHeader/index.jsx
import React from "react";
import { FaUtensils, FaBoxOpen, FaLeaf, FaTruck, FaMapMarkerAlt } from "react-icons/fa";
import "./styles.scss";

const CHIPS = [
  { Icon: FaUtensils, label: "Catering for special occasions" },
  { Icon: FaBoxOpen, label: "Boxed meals & subscriptions" },
  { Icon: FaLeaf, label: "Hygienic kitchens" },
  { Icon: FaTruck, label: "On-time delivery, every time" },
  { Icon: FaMapMarkerAlt, label: "All across Bengaluru" },
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
      Parties, offices &amp; bulk orders — fresh boxed meals delivered across Bengaluru.
    </p>

    <ul className="pageChips" aria-label="What we offer">
      {CHIPS.map(({ Icon, label }) => (
        <li key={label} className="pageChip">
          <span className="pageChip__icon" aria-hidden="true"><Icon /></span>
          {label}
        </li>
      ))}
    </ul>
  </section>
);

export default PageHeader;
