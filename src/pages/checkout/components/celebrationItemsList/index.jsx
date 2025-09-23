// src/pages/celebration-pages/celebrations/components/CelebrationItemsList.jsx
import React from "react";
import { toINR } from "../../../../utils/util";
import "./styles.scss";

/**
 * Compact CelebrationItemsList
 * Only displays these fields when present on the item:
 *  - title/label (displayed as main line)
 *  - price {min,max} or numeric price
 *  - baseFare (or baseFee)
 *  - baseHours
 *  - extraPerHour (or hourlyRate / extraPerHour)
 *
 * The component is defensive about different shapes (product, selected sub-option,
 * live counter, etc.) and will omit any missing field.
 */

const getTitle = (p) => {
  if (!p) return "Service";
  if (p.parentTitle) {
    const subLabel = p.titleLabel || "";
    return `${subLabel}`;
  }
  return p.label || p.title || p.name || "Service";
};

const getPriceObj = (p) => {
  if (!p) return null;
  // price as object {min,max}
  if (p.price && typeof p.price === "object") {
    const min = Number(p.price.min ?? p.price.max ?? 0);
    const max = Number(p.price.max ?? p.price.min ?? Math.round(min * 1.05));
    return { min, max };
  }
  // price as number
  if (typeof p.price === "number") {
    const min = Number(p.price);
    return { min, max: Math.round(min * 1.05) };
  }
  // fallback: selectedSubOption price
  if (p.selectedSubOption) {
    const sp = p.selectedSubOption;
    if (sp.price && typeof sp.price === "object") {
      const min = Number(sp.price.min ?? sp.price.max ?? 0);
      const max = Number(sp.price.max ?? sp.price.min ?? Math.round(min * 1.05));
      return { min, max };
    }
    if (typeof sp.price === "number") {
      const min = Number(sp.price);
      return { min, max: Math.round(min * 1.05) };
    }
  }
  // fallback null (so we can omit)
  return null;
};

const getBaseFare = (p) => {
  if (!p) return null;
  return typeof p.baseFare === "number" ? p.baseFare : typeof p.baseFee === "number" ? p.baseFee : null;
};

const getBaseHours = (p) => {
  if (!p) return null;
  return typeof p.baseHours === "number" ? p.baseHours : typeof p.baseFareHours === "number" ? p.baseFareHours : null;
};

const getExtraPerHour = (p) => {
  if (!p) return null;
  // common keys: extraPerHour, extraPerHour, hourlyRate, extraPerHour
  if (typeof p.extraPerHour === "number") return p.extraPerHour;
  if (typeof p.hourlyRate === "number") return p.hourlyRate;
  if (typeof p.extraPerHour === "string" && !isNaN(Number(p.extraPerHour))) return Number(p.extraPerHour);
  return null;
};

const CompactRow = ({ label, value }) => (
  <div className="celebration-compact-row">
    <span className="celebration-compact-label">{label}</span>
    <span className="celebration-compact-value">{value}</span>
  </div>
);

const CelebrationItemsList = ({ products = [] }) => {
    console.log(products);
  if (!Array.isArray(products) || products.length === 0) {
    return (
      <div className="celebrationsItemWrapper">
        <p className="celebrationsHeader">Selected services</p>
        <p className="emptyState">No services selected.</p>
      </div>
    );
  }

  return (
    <div className="celebrationsItemWrapper">
      <p className="celebrationsHeader">Selected services</p>

      <ul className="celebrationsCompactList">
        {products.map((rawItem, idx) => {
          const item = rawItem || {};
          const title = getTitle(item);
          const priceObj = getPriceObj(item);
          const baseFare = getBaseFare(item);
          const baseHours = getBaseHours(item);
          const extraPerHour = getExtraPerHour(item);

          const key = item.id || item.key || `${title}-${idx}`;

          return (
            <li className="celebration-compact-item" key={key}>
              <div className="celebration-compact-main">
                <div className="celebration-compact-title">{title}</div>

                {/* Price (show if available) */}
                {priceObj ? (
                  <div className="celebration-compact-price">
                    <span className="originalPrice">{toINR(priceObj.max)}</span>
                    &nbsp;&nbsp;
                    <span className="discountedPrice">{toINR(priceObj.min)}</span>
                  </div>
                ) : null}
              </div>

              <div className="celebration-compact-details">
                {baseFare !== null && <CompactRow label="Base fare" value={toINR(baseFare)} />}
                {baseHours !== null && <CompactRow label="Base hours" value={`${baseHours} hr${baseHours > 1 ? "s" : ""}`} />}
                {extraPerHour !== null && <CompactRow label="Extra / hour" value={toINR(extraPerHour)} />}
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export default CelebrationItemsList;
