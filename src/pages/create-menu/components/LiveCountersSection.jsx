// src/pages/create-menu/components/LiveCountersSection.jsx
import React, { useState } from "react";
import ProductCardMini from "../../../components/celebrationProductCard/mini.jsx";
import LiveCounterEditorModal from "./LiveCounterEditorModal.jsx";
import '../styles.scss'
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

  return (
    <section className="selected-live-counters">
      {liveCounters.length > 0 && (
        <h3 className="subSectionTitle">Selected Live Counters</h3>
      )}

      <section className="optionsContainer" aria-live="polite">
        {liveCounters.map((svc, idx) => (
          <section key={`${svc.title}-${idx}`} className="live-counter-block live-counter-card">
            {/* left: mini presentation */}
            <div className="product-mini">
              <ProductCardMini product={svc} />
            </div>

            {/* right: breakdown */}
            <div className="live-counter-breakdown">
              <div className="breakdown-row">
                <strong>Servings:</strong>
                <span className="servings-value">{svc.extraInfo?.plates ?? "-"}</span>
              </div>

              <div className="breakdown-choices">
                {svc.recommendedChoices && Object.keys(svc.extraInfo?.choices || {}).length > 0 ? (
                  <ul className="choices-list">
                    {Object.entries(svc.extraInfo.choices).map(([k, v]) => {
                      const labelObj = (svc.recommendedChoices || []).find((rc) => rc.key === k);
                      const label = labelObj ? labelObj.label : k;
                      return (
                        <li key={k}>
                          <span className="choice-label">{label}</span>
                          <span className="choice-qty-live">{v}</span>
                        </li>
                      );
                    })}
                  </ul>
                ) : (
                  <div className="muted">No choice breakdown available</div>
                )}
              </div>

              {svc.extraInfo?.note && (
                <div className="breakdown-note">Notes: {svc.extraInfo.note}</div>
              )}

              <div className="live-counter-actions">
                <button className="btn btn-outline" onClick={() => openEditor(svc)}>
                  Edit
                </button>
              </div>
            </div>
          </section>
        ))}
      </section>

      {/* Shared modal */}
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
