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
  const imgs = getImages(item);

  return (
    <div className="sub-options-modal-backdrop" onClick={onClose}>
      <div
        className="sub-options-panel modal pdp-modal"
        role="dialog"
        aria-modal="true"
        aria-label={item.label || "Product details"}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sub-panel-header">
          <strong>{item.label}</strong>
          <button className="sub-cancel" onClick={onClose} aria-label="Close">
            ✕
          </button>
        </div>

        <div className="pdp-content-wrap">
          <div className="pdp-hero">
            <div className="media">
              <button
                type="button"
                className="carousel-prev"
                onClick={(e) => {
                  e.stopPropagation();
                  const next = (idx - 1 + imgs.length) % imgs.length;
                  setIdx(next);
                  if (onPrev) onPrev();
                }}
                aria-label="Previous"
              >
                ‹
              </button>

              <img src={imgs[idx]} alt={`${item.label} ${idx + 1}`} />

              <button
                type="button"
                className="carousel-next"
                onClick={(e) => {
                  e.stopPropagation();
                  const next = (idx + 1) % imgs.length;
                  setIdx(next);
                  if (onNext) onNext();
                }}
                aria-label="Next"
              >
                ›
              </button>
            </div>

            {/* thumbnails */}
          {imgs && imgs.length > 1 && (
            <div className="pdp-thumbs" style={{ marginTop: 10 }}>
              {imgs.map((u, i) => (
                <button
                  key={i}
                  className={`pdp-thumb ${i === idx ? "active" : ""}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    setIdx(i);
                  }}
                >
                  <img src={u} alt={`thumb ${i + 1}`} />
                </button>
              ))}
            </div>
          )}

            <div className="meta" style={{ paddingLeft: 8 }}>
              <div>
                <div className="pdp-meta">
                  <div className="title">{item.label}</div>
                  <div className="price">{item.price ? toINR(item.price) : ""}</div>
                </div>

                {item.description && (
                  <div className="pdp-section" style={{ marginTop: 12 }}>
                    <h4>Description</h4>
                    <p>{item.description}</p>
                  </div>
                )}

                {Array.isArray(item.inclusions) && item.inclusions.length > 0 && (
                  <div className="pdp-section">
                    <h4>Inclusions</h4>
                    <ul>{item.inclusions.map((i, k) => <li key={k}>{i}</li>)}</ul>
                  </div>
                )}

                {Array.isArray(item.thingsToRemember) && item.thingsToRemember.length > 0 && (
                  <div className="pdp-section">
                    <h4>Things to remember</h4>
                    <ul>{item.thingsToRemember.map((t, k) => <li key={k}>{t}</li>)}</ul>
                  </div>
                )}

                {Array.isArray(item.whatYouCanExpect) && item.whatYouCanExpect.length > 0 && (
                  <div className="pdp-section">
                    <h4>What you can expect</h4>
                    <ul>{item.whatYouCanExpect.map((w, k) => <li key={k}>{w}</li>)}</ul>
                  </div>
                )}

                {Array.isArray(item.customerImages) && item.customerImages.length > 0 && (
                  <div className="pdp-section">
                    <h4>Customer images</h4>
                    <div className="customer-images">{item.customerImages.map((u, i) => <img key={i} src={u} alt={`customer ${i + 1}`} />)}</div>
                  </div>
                )}

                {Array.isArray(item.customerReviews) && item.customerReviews.length > 0 && (
                  <div className="pdp-section">
                    <h4>Customer reviews</h4>
                    <div className="reviews">
                      {item.customerReviews.map((r) => (
                        <div key={r.id} className="review">
                          <div className="review-meta">
                            <strong>{r.name}</strong>
                            <span className="rating">{"★".repeat(r.rating)}</span>
                            <small className="review-date">{r.date}</small>
                          </div>
                          <p>{r.text}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* actions bottom */}
          <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 14 }}>
            <button className="btn btn-outline" onClick={onClose}>
              Close
            </button>
            <button
              className="btn btn-primary"
              onClick={(e) => {
                e.stopPropagation();
                if (onAdd) onAdd();
              }}
              style={{ marginLeft: 8 }}
            >
              Add
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PDPModal;
