// src/components/pageIntro/index.jsx
// Reusable, design-language page heading: gradient title, flanked subtitle, optional badge.
import React from "react";
import "./styles.scss";

const PageIntro = ({ title, subtitle, badge, className = "" }) => (
  <section className={`pageIntro ${className}`.trim()}>
    {title && <h1 className="pageIntro__title">{title}</h1>}
    {subtitle && <p className="pageIntro__subtitle">{subtitle}</p>}
    {badge != null && badge !== "" && <div className="pageIntro__badge">{badge}</div>}
  </section>
);

export default React.memo(PageIntro);
