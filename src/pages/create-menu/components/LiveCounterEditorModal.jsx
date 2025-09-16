// src/pages/create-menu/components/LiveCounterEditorModal.jsx
import React, { useState, useEffect, useCallback } from "react";
import '../styles.scss'
/**
 * LiveCounterEditorModal
 *
 * Props:
 * - product: live counter product object
 * - guests: number
 * - onSave(updatedProduct)
 * - onCancel()
 *
 * Behavior:
 * - If product.extraInfo exists -> prefill (edit mode, e.g. CreateMenu)
 * - Else compute defaults from guests (new mode, e.g. Celebrations)
 * - Plates <-> Choices stay in sync:
 *    • Editing plates redistributes choices proportionally
 *    • Editing choices updates plates as sum of choices
 */
const LiveCounterEditorModal = ({ product, guests, onSave, onCancel }) => {
  const [state, setState] = useState({
    plates: 0,
    choices: {},
    note: "",
    userEdited: false,
  });

  /** ----- helpers ----- **/
  const sumChoices = useCallback(
    (choices = {}) => Object.values(choices).reduce((s, v) => s + (Number(v) || 0), 0),
    []
  );

  const distributeByWeights = useCallback((rec, plates) => {
    if (!rec || !rec.length || !plates) return {};
    const weights = rec.map((c) =>
      typeof c.defaultQty === "number" && c.defaultQty > 0 ? c.defaultQty : 1
    );
    const weightSum = weights.reduce((a, b) => a + b, 0) || 1;
    const raw = weights.map((w) => (plates * w) / weightSum);
    const base = raw.map((r) => Math.floor(r));
    let allocated = base.reduce((a, b) => a + b, 0);
    let remainder = plates - allocated;
    const fractional = raw.map((r, idx) => ({ idx, frac: r - Math.floor(r) }));
    fractional.sort((a, b) => b.frac - a.frac);
    for (let i = 0; i < remainder; i++) {
      base[fractional[i % fractional.length].idx] += 1;
    }
    const res = {};
    rec.forEach((c, i) => {
      res[c.key] = base[i];
    });
    return res;
  }, []);

  const recomputeDefault = useCallback(
    (prod, g) => {
      if (!prod) return { plates: 0, choices: {}, note: "" };
      const servingsRatio =
        typeof prod.servingsPerGuest === "number" ? prod.servingsPerGuest : 1 / 4;
      const plates = g ? Math.max(1, Math.ceil(g * servingsRatio)) : 1;
      const choices = distributeByWeights(prod.recommendedChoices || [], plates);
      return { plates, choices, note: "" };
    },
    [distributeByWeights]
  );

  /** ----- initialize ----- **/
  useEffect(() => {
    if (!product) return;

    if (product.extraInfo && product.extraInfo.plates) {
      // Edit mode (CreateMenu or returning user)
      setState({
        plates: product.extraInfo.plates,
        choices: { ...(product.extraInfo.choices || {}) },
        note: product.extraInfo.note || "",
        userEdited: true,
      });
    } else {
      // New mode (Celebrations)
      const def = recomputeDefault(product, guests);
      setState({ ...def, userEdited: false });
    }
  }, [product, guests, recomputeDefault]);

  /** ----- handlers ----- **/
  const handlePlatesChange = (platesVal) => {
    const parsed = Number(platesVal) || 0;
    if (parsed <= 0) {
      setState((s) => ({ ...s, plates: 0, choices: {} }));
      return;
    }
    const newChoices = distributeByWeights(product.recommendedChoices || [], parsed);
    setState((s) => ({
      ...s,
      plates: parsed,
      choices: newChoices,
      userEdited: true,
    }));
  };

  const setChoice = (key, val) => {
    setState((prev) => {
      const newChoices = { ...(prev.choices || {}) };
      newChoices[key] = Number(val || 0);
      const total = sumChoices(newChoices);
      return {
        ...prev,
        choices: newChoices,
        plates: total,
        userEdited: true,
      };
    });
  };

  const handleSave = () => {
    const updated = {
      ...product,
      extraInfo: {
        plates: state.plates,
        choices: state.choices,
        note: state.note,
        _userEdited: true,
      },
    };
    onSave(updated);
  };

  /** ----- render ----- **/
  return (
    <div
      className="live-config-backdrop"
      role="dialog"
      aria-modal="true"
      onClick={onCancel}
    >
      <div className="live-config-modal" onClick={(e) => e.stopPropagation()}>
        <header className="live-config-header">
          <div>
            <h3>{product.title} — Configure</h3>
            <div className="muted">
              Quick defaults picked from your guest count ({guests ?? "—"})
            </div>
          </div>
          <button aria-label="Close" className="close-btn" onClick={onCancel}>
            ✕
          </button>
        </header>

        <div className="live-config-body">
          {/* Plates */}
          <div className="config-row">
            <label className="field-label">How many servings / plates?</label>
            <input
              type="number"
              min="1"
              value={state.plates}
              onChange={(e) => handlePlatesChange(e.target.value)}
              placeholder="e.g. 50"
              className="input"
            />
          </div>

          {/* Recommended choices */}
          <div className="recommended-block">
            <label className="field-label">Recommended choices</label>
            <div className="recommended-list">
              {(product.recommendedChoices || []).map((choice) => {
                const cur = state.choices[choice.key] ?? 0;
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
                      value={state.choices[choice.key] ?? 0}
                      onChange={(e) =>
                        setChoice(
                          choice.key,
                          e.target.value === "" ? 0 : Number(e.target.value)
                        )
                      }
                      className="choice-qty-live"
                    />
                  </div>
                );
              })}

              {(product.recommendedChoices || []).length === 0 && (
                <div className="muted">
                  No quick choices available — use the note below to add specifics.
                </div>
              )}
            </div>
          </div>

          {/* Notes */}
          <div className="notes-block">
            <label className="field-label">Notes (optional)</label>
            <textarea
              value={state.note}
              onChange={(e) => setState((s) => ({ ...s, note: e.target.value }))}
              rows={3}
              placeholder="Any specific requests (e.g., spice level, separate counters, etc.)"
            />
          </div>
        </div>

        <footer className="live-config-actions">
          <button type="button" className="btn btn-outline" onClick={onCancel}>
            Cancel
          </button>
          <button type="button" className="btn btn-primary" onClick={handleSave}>
            Add
          </button>
        </footer>
      </div>
    </div>
  );
};

export default LiveCounterEditorModal;
