// src/pages/create-menu/components/LiveCountersSection.jsx
import React, { useState } from "react";
import ProductCardMini from "../../../components/celebrationProductCard/mini.jsx";

/**
 * LiveCountersSection
 *
 * Props:
 * - guests (number|null)
 * - liveCounters: array of products (each may have breakdown)
 * - onUpdate(productWithExtraInfo) -> called when user edits and saves changes
 */
const LiveCountersSection = ({ guests, liveCounters = [], onUpdate = () => {} }) => {
  const [editing, setEditing] = useState(null); // product being edited
  const [editorState, setEditorState] = useState({ plates: "", choices: {}, note: "" });

  const openEditor = (product) => {
    setEditing(product);
    setEditorState({
      plates: product.breakdown?.plates ?? (product.extraInfo?.plates ?? ""),
      choices: product.breakdown?.choices ? { ...product.breakdown.choices } : (product.extraInfo?.choices ? { ...product.extraInfo.choices } : {}),
      note: product.extraInfo?.note ?? "",
    });
  };

  const closeEditor = () => {
    setEditing(null);
    setEditorState({ plates: "", choices: {}, note: "" });
  };

  const setChoice = (key, value) => {
    setEditorState((p) => ({ ...p, choices: { ...(p.choices || {}), [key]: Number(value || 0) } }));
  };

  const onSave = () => {
    if (!editing) return;
    const updated = {
      ...editing,
      extraInfo: {
        plates: Number(editorState.plates) || 0,
        choices: editorState.choices || {},
        note: editorState.note || "",
      },
    };
    onUpdate(updated);
    closeEditor();
  };

  return (
    <section className="selected-live-counters">
      {liveCounters.length === 0 ? null : (
        <h3 className="subSectionTitle">Selected Live Counters</h3>
      )}

      <section className="optionsContainer" aria-live="polite">
        {liveCounters.map((svc, idx) => (
          <section key={`${svc.title}-${idx}`} className="live-counter-block live-counter-card">
            {/* left: mini presentation (image/title) */}
            <div className="product-mini">
              {/* ProductCardMini may render its own wrapper; if so this keeps it compact */}
              <ProductCardMini product={svc} />
            </div>

            {/* right: breakdown / extra info */}
            <div className="live-counter-breakdown">
              <div className="breakdown-row">
                <strong>Servings:</strong>
                <span className="servings-value">{svc.breakdown?.plates ?? "-"}</span>
              </div>

              <div className="breakdown-choices">
                {svc.recommendedChoices && Object.keys(svc.breakdown?.choices || {}).length > 0 ? (
                  <ul className="choices-list">
                    {Object.entries(svc.breakdown.choices).map(([k, v]) => {
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

              {svc.breakdown?.note ? <div className="breakdown-note">Notes: {svc.breakdown.note}</div> : null}

              <div className="live-counter-actions">
                <button className="btn btn-outline" onClick={() => openEditor(svc)}>Edit</button>
              </div>
            </div>
          </section>
        ))}
      </section>

      {/* Editor modal */}
      {editing && (
        <div className="live-config-backdrop" role="dialog" aria-modal="true" onClick={closeEditor}>
          <div className="live-config-modal" onClick={(e) => e.stopPropagation()}>
            <header className="live-config-header">
              <div>
                <h3>{editing.title} — Configure</h3>
                <div className="muted">Quick defaults picked from your guest count ({guests ?? " — "})</div>
              </div>
              <button aria-label="Close" className="close-btn" onClick={closeEditor}>✕</button>
            </header>

            <div className="live-config-body">
              <div className="config-row">
                <label className="field-label">How many servings / plates?</label>
                <input
                  type="number"
                  min="1"
                  value={editorState.plates}
                  onChange={(e) => setEditorState((s) => ({ ...s, plates: e.target.value }))}
                  placeholder="e.g. 50"
                  className="input"
                />
              </div>

              <div className="recommended-block">
                <label className="field-label">Recommended choices</label>
                <div className="recommended-list">
                  {(editing.recommendedChoices || []).map((choice) => {
                    const cur = editorState.choices[choice.key] ?? 0;
                    return (
                      <div className="choice-row" key={choice.key}>
                        <div className="choice-left">
                          <input
                            type="checkbox"
                            checked={Boolean(cur && Number(cur) > 0)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setChoice(choice.key, cur > 0 ? cur : 1);
                              } else {
                                setChoice(choice.key, 0);
                              }
                            }}
                          />
                          <div className="choice-meta">
                            <div className="choice-label">{choice.label}</div>
                          </div>
                        </div>

                        <input
                          type="number"
                          min="0"
                          value={editorState.choices[choice.key] ?? 0}
                          onChange={(e) => setChoice(choice.key, e.target.value === "" ? 0 : Number(e.target.value))}
                          className="choice-qty-live"
                        />
                      </div>
                    );
                  })}

                  {(editing.recommendedChoices || []).length === 0 && (
                    <div className="muted">No quick choices available — use the note below to add specifics.</div>
                  )}
                </div>
              </div>

              <div className="notes-block">
                <label className="field-label">Notes (optional)</label>
                <textarea
                  value={editorState.note}
                  onChange={(e) => setEditorState((s) => ({ ...s, note: e.target.value }))}
                  rows={3}
                  placeholder="Any specific requests (e.g., spice level, separate counters, etc.)"
                />
              </div>
            </div>

            <footer className="live-config-actions">
              <button type="button" className="btn btn-outline" onClick={closeEditor}>Cancel</button>
              <button type="button" className="btn btn-primary" onClick={onSave}>Save</button>
            </footer>
          </div>
        </div>
      )}
    </section>
  );
};

export default LiveCountersSection;
