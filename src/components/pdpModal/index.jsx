import React, { useEffect, useState } from "react";
import { toINR } from "../../utils/util";
import "./styles.scss";

/**
 * Props:
 * - isOpen (bool)
 * - item (object) — subOption item
 * - initialIndex (number)
 * - getImages (fn) -> images array for item
 * - onClose (fn)
 * - onPrev (fn)
 * - onNext (fn)
 * - onAdd (fn)
 */
const PDPModal = ({ isOpen, item, initialIndex = 0, getImages = () => [], onClose, onPrev, onNext, onAdd }) => {
  const [idx, setIdx] = useState(initialIndex || 0);

  useEffect(() => {
    setIdx(initialIndex || 0);
  }, [initialIndex, item]);

  if (!isOpen || !item) return null;

  const imgs = getImages(item) || [];
  const title = item.title || item.label || item.typeLabel || "Details";
  const hasMany = imgs.length > 1;

  const step = (delta, cb) => {
    if (!imgs.length) return;
    setIdx((i) => (i + delta + imgs.length) % imgs.length);
    if (cb) cb();
  };

  const sections = [
    { key: "inclusions", title: "Inclusions", list: item.inclusions },
    { key: "thingsToRemember", title: "Things to remember", list: item.thingsToRemember },
    { key: "whatYouCanExpect", title: "What you can expect", list: item.whatYouCanExpect },
  ];

  return (
    <div className="sub-options-modal-backdrop" onClick={onClose}>
      <div
        className="sub-options-panel modal pdp-modal"
        role="dialog"
        aria-modal="true"
        aria-label={title}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sub-panel-header">
          <strong>{title}</strong>
          <button className="sub-cancel" onClick={onClose} aria-label="Close">✕</button>
        </div>

        <div className="pdp-body">
          {imgs.length > 0 && (
            <div className="pdp-media">
              {hasMany && (
                <button
                  type="button"
                  className="carousel-prev"
                  onClick={(e) => { e.stopPropagation(); step(-1, onPrev); }}
                  aria-label="Previous image"
                >‹</button>
              )}

              <img src={imgs[idx]} alt="" />

              {hasMany && (
                <button
                  type="button"
                  className="carousel-next"
                  onClick={(e) => { e.stopPropagation(); step(1, onNext); }}
                  aria-label="Next image"
                >›</button>
              )}

              {hasMany && <span className="pdp-counter">{idx + 1} / {imgs.length}</span>}
            </div>
          )}

          {hasMany && (
            <div className="pdp-thumbs">
              {imgs.map((u, i) => (
                <button
                  key={i}
                  className={`pdp-thumb ${i === idx ? "active" : ""}`}
                  onClick={(e) => { e.stopPropagation(); setIdx(i); }}
                  aria-label={`Image ${i + 1}`}
                >
                  <img src={u} alt="" />
                </button>
              ))}
            </div>
          )}

          <div className="pdp-meta">
            <div className="pdp-meta__title">{title}</div>
            {item.price ? <div className="pdp-meta__price">{toINR(item.price, 0)}</div> : null}
          </div>

          {item.description && (
            <div className="pdp-section">
              <h4>Description</h4>
              <p>{item.description}</p>
            </div>
          )}

          {sections.map(({ key, title: secTitle, list }) =>
            Array.isArray(list) && list.length > 0 ? (
              <div className="pdp-section" key={key}>
                <h4>{secTitle}</h4>
                <ul>{list.map((t, k) => <li key={k}>{t}</li>)}</ul>
              </div>
            ) : null
          )}

          {Array.isArray(item.customerImages) && item.customerImages.length > 0 && (
            <div className="pdp-section">
              <h4>Customer images</h4>
              <div className="customer-images">
                {item.customerImages.map((u, i) => <img key={i} src={u} alt="" loading="lazy" />)}
              </div>
            </div>
          )}

          {Array.isArray(item.customerReviews) && item.customerReviews.length > 0 && (
            <div className="pdp-section">
              <h4>Customer reviews</h4>
              <div className="reviews">
                {item.customerReviews.map((r, k) => (
                  <div key={r.id ?? k} className="review">
                    <div className="review-meta">
                      <strong>{r.name}</strong>
                      <span className="rating">{"★".repeat(r.rating || 0)}</span>
                      <small className="review-date">{r.date}</small>
                    </div>
                    <p>{r.text}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <footer className="pdp-actions">
          <button type="button" className="pdp-btn pdp-btn--ghost" onClick={onClose}>
            Close
          </button>
          <button
            type="button"
            className="pdp-btn pdp-btn--primary"
            onClick={(e) => { e.stopPropagation(); if (onAdd) onAdd(); }}
          >
            Add
          </button>
        </footer>
      </div>
    </div>
  );
};

export default PDPModal;
