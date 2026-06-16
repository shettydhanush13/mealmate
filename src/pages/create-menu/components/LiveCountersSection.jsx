// src/pages/create-menu/components/LiveCountersSection.jsx
import React, { useState } from "react";
import { FaPen } from "react-icons/fa";
import LiveCounterEditorModal from "./LiveCounterEditorModal.jsx";
import "./LiveCountersSection.scss";

/**
 * LiveCountersSection
 *
 * Props:
 * - guests (number|null)
 * - liveCounters: array of products (each may have breakdown/extraInfo)
 * - onUpdate(productWithExtraInfo) -> called when user edits and saves changes
 */
const LiveCountersSection = ({ guests, liveCounters = [], onUpdate = () => {} }) => {
  const [editing, setEditing] = useState(null);

  const openEditor = (product) => setEditing(product);
  const closeEditor = () => setEditing(null);

  const handleSave = (updatedProduct) => {
    onUpdate(updatedProduct);
    closeEditor();
  };

  if (!liveCounters.length) return null;

  return (
    <section className="lcSection">
      <h3 className="subSectionTitle">Selected Live Counters</h3>

      <div className="lcGrid" aria-live="polite">
        {liveCounters.map((svc, idx) => {
          const plates = svc.extraInfo?.plates ?? "-";
          const choices = svc.extraInfo?.choices || {};
          const thumb = svc.image || (Array.isArray(svc.imgs) && svc.imgs[0]) || "";
          const rows = Object.entries(choices)
            .filter(([, v]) => Number(v) > 0)
            .map(([k, v]) => {
              const rc = (svc.recommendedChoices || []).find((r) => r.key === k);
              return { key: k, label: rc ? rc.label : k, qty: v };
            });

          return (
            <article className="lcCard" key={`${svc.title}-${idx}`}>
              <header className="lcCard__head">
                {thumb && (
                  <span className="lcCard__thumb">
                    <img src={thumb} alt="" loading="lazy" />
                  </span>
                )}
                <span className="lcCard__title">{svc.title}</span>
                <button
                  type="button"
                  className="lcCard__edit"
                  onClick={() => openEditor(svc)}
                  aria-label={`Edit ${svc.title}`}
                >
                  <FaPen /> Edit
                </button>
              </header>

              <div className="lcCard__servings">
                <span className="lcCard__servingsLabel">Servings</span>
                <span className="lcCard__servingsVal">{plates}</span>
              </div>

              {rows.length > 0 ? (
                <ul className="lcCard__choices">
                  {rows.map((c) => (
                    <li key={c.key}>
                      <span className="choice-label">{c.label}</span>
                      <span className="choice-qty">{c.qty}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="lcCard__empty">No choice breakdown available</div>
              )}

              {svc.extraInfo?.note && (
                <div className="lcCard__note">Notes: {svc.extraInfo.note}</div>
              )}
            </article>
          );
        })}
      </div>

      {editing && (
        <LiveCounterEditorModal
          product={editing}
          guests={guests}
          onSave={handleSave}
          onCancel={closeEditor}
        />
      )}
    </section>
  );
};

export default LiveCountersSection;
