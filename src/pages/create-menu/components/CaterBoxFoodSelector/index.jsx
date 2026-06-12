import React, { useState, useEffect } from "react";
import { fetchCombos } from "../../../../services/combos";
import BoxLayoutIcon from "../../../../components/boxLayoutIcon";
import "./styles.scss";

const itemSummary = (items = []) =>
  items
    .map((it) => (typeof it === "string" ? it : it.kind === "choice" ? (it.label || "Choice") : it.name))
    .filter(Boolean)
    .join(" · ");

/**
 * CaterBox food selector. Shows admin-defined fixed-price combos for the chosen
 * meal + box size; the customer always picks a combo and then customises its
 * "choice" slots. When no combo exists for the combination, an error is shown.
 */
const CaterBoxFoodSelector = ({
  menuItems = {},
  boxType = 3,
  mealSlot,
  guests,
  dietConfig = {},
  onSelectionChange,
}) => {
  const vegOnly = dietConfig.dietMode === "veg-only";
  const boxes = Number(guests) || 0;
  const count = Number(boxType) || 3;

  // ---- combos (fixed price) ----
  const [combos, setCombos] = useState([]);
  const [loaded, setLoaded] = useState(false);
  const [selectedComboId, setSelectedComboId] = useState(null);
  const [choices, setChoices] = useState({}); // { itemIndex: chosenOption }
  const [picked, setPicked] = useState([]); // selected recommended add-on names

  useEffect(() => {
    let active = true;
    setLoaded(false);
    fetchCombos({ mealSlot, boxType: count })
      .then((d) => {
        if (!active) return;
        const list = (Array.isArray(d) ? d : []).filter((c) => c.active !== false).slice(0, 6);
        setCombos(list);
        setSelectedComboId(list[0]?._id || null); // always start on a combo
      })
      .catch(() => { if (active) { setCombos([]); setSelectedComboId(null); } })
      .finally(() => { if (active) setLoaded(true); });
    return () => { active = false; };
  }, [mealSlot, count]);

  const selectedCombo = combos.find((c) => c._id === selectedComboId) || null;

  // valid options for a choice slot, as { name, price } (price = add-on over base).
  // Falls back to category-derived names (no add-on) for legacy combos.
  const optionObjs = (it) => {
    const raw = Array.isArray(it && it.options) ? it.options : [];
    const objs = raw
      .map((o) => (typeof o === "string" ? { name: o, price: 0 } : { name: o && o.name, price: Number(o && o.price) || 0 }))
      .filter((o) => o.name);
    if (objs.length) return objs;
    if (it && it.category && menuItems[it.category]) {
      return Object.values(menuItems[it.category])
        .filter((item) => item && !(vegOnly && item.veg === false))
        .map((item) => ({ name: item.name, price: 0 }))
        .filter((o) => o.name);
    }
    return [];
  };

  // add-on price for the currently chosen option in a choice slot
  const optAddOn = (it, idx) => {
    const opts = optionObjs(it);
    const name = choices[idx] || opts[0]?.name;
    return Number(opts.find((o) => o.name === name)?.price) || 0;
  };

  // total of the selected recommended add-ons
  const addOnsTotal = (combo) =>
    (combo.addOns || [])
      .filter((a) => picked.includes(a.name))
      .reduce((sum, a) => sum + (Number(a.price) || 0), 0);

  // per-box price = base + chosen-option add-ons + selected recommended add-ons
  const unitPrice = (combo) => {
    const base = Number(combo.price) || 0;
    const choiceAdd = (combo.items || []).reduce(
      (sum, it, idx) => sum + (it && it.kind === "choice" ? optAddOn(it, idx) : 0),
      0
    );
    return base + choiceAdd + addOnsTotal(combo);
  };

  // default each choice slot to its first option when a combo is selected
  useEffect(() => {
    setPicked([]);
    if (!selectedCombo) { setChoices({}); return; }
    const init = {};
    (selectedCombo.items || []).forEach((it, idx) => {
      if (it && it.kind === "choice") init[idx] = optionObjs(it)[0]?.name || "";
    });
    setChoices(init);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedComboId]);

  // emit the selection
  useEffect(() => {
    const combo = combos.find((c) => c._id === selectedComboId);
    if (!combo) { onSelectionChange?.({ Items: [] }); return; }
    const ppi = unitPrice(combo);
    const resolved = (combo.items || []).map((it, idx) =>
      it && it.kind === "choice" ? (choices[idx] || optionObjs(it)[0]?.name || it.label) : (it.name || it)
    ).filter(Boolean);
    const chosenAddOns = (combo.addOns || []).filter((a) => picked.includes(a.name));
    onSelectionChange?.({
      Items: [{
        id: `combo-${combo._id}`,
        name: combo.name,
        isCombo: true,
        comboItems: resolved,
        comboCommon: combo.commonItems || [],
        comboAddOns: chosenAddOns,
        quantity: boxes,
        pricePerItem: ppi,
        price: ppi * boxes,
      }],
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedComboId, choices, picked, combos, boxes]);

  const pickCombo = (id) => setSelectedComboId(id);

  return (
    <section className="cbFood" aria-label="Choose your box">
      <header className="cbFood__head">
        <div>
          <h3 className="cbFood__title">Choose your box</h3>
          <p className="cbFood__sub">{mealSlot ? `${mealSlot} · ` : ""}{count}-item box</p>
        </div>
      </header>

      <div className="cbFood__preview" aria-hidden="true">
        <BoxLayoutIcon size={count} className="cbFood__box3d" />
      </div>

      {combos.length > 0 ? (
        <div className="cbCombos">
          <span className="cbCombos__label">Pick a combo, then customise it</span>
          <div className="cbCombos__list">
            {combos.map((c) => (
              <button
                key={c._id}
                type="button"
                className={`cbCombo ${selectedComboId === c._id ? "is-active" : ""}`}
                onClick={() => pickCombo(c._id)}
              >
                <div className="cbCombo__top">
                  <span className="cbCombo__name">{c.name}</span>
                  <span className="cbCombo__price">{(c.items || []).some((it) => it && it.kind === "choice" && optionObjs(it).some((o) => o.price > 0)) ? "from " : ""}₹{Number(c.price || 0)}<small>/box</small></span>
                </div>
                <span className="cbCombo__items">{itemSummary(c.items)}</span>
              </button>
            ))}
          </div>

          {selectedCombo && (
            <div className="cbComboDetail">
              {(selectedCombo.items || []).map((it, idx) =>
                it && it.kind === "choice" ? (
                  <div className="cbDetailRow cbDetailRow--choice" key={idx}>
                    <span className="cbDetailRow__label">{it.label || `Item ${idx + 1}`}</span>
                    <select
                      className="cbDetailRow__select"
                      value={choices[idx] || ""}
                      onChange={(e) => setChoices((p) => ({ ...p, [idx]: e.target.value }))}
                    >
                      {optionObjs(it).map((o) => (
                        <option key={o.name} value={o.name}>{o.name}{o.price > 0 ? ` (+₹${o.price})` : ""}</option>
                      ))}
                    </select>
                  </div>
                ) : (
                  <div className="cbDetailRow" key={idx}>
                    <span className="cbDetailRow__name">{it.name || it}</span>
                    <span className="cbDetailRow__tag">included</span>
                  </div>
                )
              )}
              {(selectedCombo.commonItems || []).length > 0 && (
                <div className="cbCommon">
                  <span className="cbCommon__label">Also included</span>
                  <span className="cbCommon__items">{selectedCombo.commonItems.join(" · ")}</span>
                </div>
              )}
              {(selectedCombo.addOns || []).length > 0 && (
                <div className="cbAddOns">
                  <span className="cbAddOns__label">Add extras</span>
                  {selectedCombo.addOns.map((a) => {
                    const on = picked.includes(a.name);
                    return (
                      <label className={`cbAddOn ${on ? "is-on" : ""}`} key={a.name}>
                        <input
                          type="checkbox"
                          checked={on}
                          onChange={() => setPicked((p) => (on ? p.filter((n) => n !== a.name) : [...p, a.name]))}
                        />
                        <span className="cbAddOn__name">{a.name}</span>
                        <span className="cbAddOn__price">+₹{Number(a.price) || 0}</span>
                      </label>
                    );
                  })}
                </div>
              )}
              <div className="cbDetailTotal">
                <span>Price per box</span>
                <strong>₹{unitPrice(selectedCombo)}</strong>
              </div>
            </div>
          )}
        </div>
      ) : loaded ? (
        <div className="cbEmpty" role="alert">
          <span className="cbEmpty__icon" aria-hidden="true">🍱</span>
          <div className="cbEmpty__title">No combos available yet</div>
          <p className="cbEmpty__text">
            We don't have any {mealSlot ? `${mealSlot} ` : ""}{count}-item combos ready for this selection right now.
            Please try a different meal or box size, or check back soon.
          </p>
        </div>
      ) : (
        <div className="cbEmpty cbEmpty--loading">Loading combos…</div>
      )}
    </section>
  );
};

export default CaterBoxFoodSelector;
