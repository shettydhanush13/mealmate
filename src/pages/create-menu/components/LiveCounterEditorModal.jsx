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
 * - Plates is considered canonical here. When user edits a choice quantity:
 *     • plates remains constant
 *     • other choices are adjusted so that sum(choices) === plates
 *     • adjustment uses proportional scaling when possible, or even distribution if others are zero
 */
const LiveCounterEditorModal = ({ product, guests, onSave, onCancel }) => {
  const [state, setState] = useState({
    plates: 0,
    choices: {},
    note: "",
    userEdited: false,
  });

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
        plates: Number(product.extraInfo.plates) || 0,
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

  /** ----- redistribute helpers when one choice changes ----- **/
  const redistributeOthers = useCallback((choicesObj, editedKey, editedVal, plates) => {
    // ensure numeric
    const P = Number(plates) || 0;
    let v = Number(editedVal) || 0;
    if (v < 0) v = 0;
    if (v > P) v = P; // clamp edited value to plates

    const keys = Object.keys(choicesObj);
    const otherKeys = keys.filter((k) => k !== editedKey);
    const targetOtherSum = P - v;
    // Build current other values
    const currentOthers = otherKeys.map((k) => ({ key: k, val: Number(choicesObj[k] || 0) }));

    if (otherKeys.length === 0) {
      // no others — just set edited and done
      return { [editedKey]: v };
    }

    const currentOtherSum = currentOthers.reduce((s, o) => s + o.val, 0);

    const result = {};
    // Set edited key
    result[editedKey] = v;

    if (currentOtherSum <= 0) {
      // All others are zero — distribute targetOtherSum evenly across otherKeys
      const base = Math.floor(targetOtherSum / otherKeys.length);
      let allocated = base * otherKeys.length;
      let remainder = targetOtherSum - allocated;
      otherKeys.forEach((k, idx) => {
        result[k] = base + (idx < remainder ? 1 : 0);
      });
      return result;
    }

    // Proportional scaling of others to meet targetOtherSum
    // compute raw scaled numbers and then integerize (floor) and distribute remainder by fractional part
    const rawScaled = currentOthers.map((o) => {
      const scaled = (o.val * targetOtherSum) / currentOtherSum;
      return { key: o.key, raw: scaled, base: Math.floor(scaled), frac: scaled - Math.floor(scaled) };
    });

    let baseSum = rawScaled.reduce((s, r) => s + r.base, 0);
    let remainder = targetOtherSum - baseSum;

    // sort by fractional descending and allocate remainder
    rawScaled.sort((a, b) => b.frac - a.frac);
    for (let i = 0; i < rawScaled.length; i++) {
      rawScaled[i].allocated = rawScaled[i].base + (i < remainder ? 1 : 0);
    }

    // write into result (restore original key order)
    // create map from key->allocated
    const allocMap = rawScaled.reduce((m, r) => {
      m[r.key] = r.allocated;
      return m;
    }, {});

    otherKeys.forEach((k) => {
      result[k] = allocMap[k] ?? 0;
    });

    return result;
  }, []);

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

  // NEW setChoice: keep plates constant, adjust other choices accordingly
  const setChoice = (key, val) => {
    setState((prev) => {
      const P = Number(prev.plates || 0);
      // clamp edited value between 0 and plates
      let newVal = Number(val || 0);
      if (newVal < 0) newVal = 0;
      if (newVal > P) newVal = P;

      const merged = { ...(prev.choices || {}) };
      // ensure all keys exist
      (product.recommendedChoices || []).forEach((c) => {
        if (!(c.key in merged)) merged[c.key] = 0;
      });

      // compute redistributed choices (edited + others)
      const redistributed = redistributeOthers(merged, key, newVal, P);

      return {
        ...prev,
        choices: redistributed,
        // keep plates unchanged
        userEdited: true,
      };
    });
  };

  const handleSave = () => {
    const updated = {
      ...product,
      extraInfo: {
        plates: Number(state.plates),
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
                            // set to at least 1 (or keep current)
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
            Save
          </button>
        </footer>
      </div>
    </div>
  );
};

export default LiveCounterEditorModal;
