import React, { useState, useEffect } from "react";
import { fetchCombos } from "../../../../services/combos";
import { fetchPublicVendor } from "../../../../services/vendors";
import { fetchReviews } from "../../../../services/reviews";
import { carrierSavingPerBox, CO_BRAND_PRICE } from "../../../../services/pricing";
import { FaCertificate, FaShieldAlt, FaMapMarkerAlt, FaUtensils, FaStar, FaTimes, FaHandshake, FaBoxOpen } from "react-icons/fa";
import BoxLayoutIcon from "../../../../components/boxLayoutIcon";
import PackagingOptions from "../../../../components/packagingOptions";
import tissueImg from "../../../../assets/tissue.png";
import cutleryImg from "../../../../assets/cutlery.png";
import bottleImg from "../../../../assets/bottle.png";
import cobrand3 from "../../../../assets/cobrand3.png";
import cobrand5 from "../../../../assets/cobrand5.png";
import cobrand8 from "../../../../assets/cobrand8.png";
import carrierImg from "../../../../assets/carrier.png";
import "./styles.scss";

const COBRAND_IMG = { 3: cobrand3, 5: cobrand5, 8: cobrand8 };

// read-only or interactive star row
const Stars = ({ value = 0, onPick }) => (
  <span className={`cbStars ${onPick ? "cbStars--input" : ""}`} role={onPick ? "radiogroup" : "img"} aria-label={`${value} star`}>
    {[1, 2, 3, 4, 5].map((n) => (
      <button
        key={n}
        type="button"
        className={`cbStar ${n <= Math.round(value) ? "is-on" : ""}`}
        onClick={onPick ? () => onPick(n) : undefined}
        tabIndex={onPick ? 0 : -1}
        aria-label={`${n} star`}
      >
        <FaStar />
      </button>
    ))}
  </span>
);

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
  initialReusableCarrier = false,
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
  // packaging choice — mutually exclusive: "" | "cobrand" | "carrier"
  const [packaging, setPackaging] = useState(initialReusableCarrier ? "carrier" : "");
  const coBranded = packaging === "cobrand";       // customized (branded) sleeve, +₹/box
  const reusableCarrier = packaging === "carrier"; // returnable carriers (eco discount at checkout)
  const [showVendor, setShowVendor] = useState(false);
  const [vendorInfo, setVendorInfo] = useState(null);
  const [reviewData, setReviewData] = useState({ summary: { average: 0, count: 0 }, reviews: [] });

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

  // per-box price = base + chosen-option add-ons (the food in the box).
  // Recommended add-ons and co-branded packaging are billed as SEPARATE line
  // items (see the emit below), so they are NOT clubbed into this price.
  const unitPrice = (combo) => {
    const base = Number(combo.price) || 0;
    const choiceAdd = (combo.items || []).reduce(
      (sum, it, idx) => sum + (it && it.kind === "choice" ? optAddOn(it, idx) : 0),
      0
    );
    return base + choiceAdd;
  };

  // The selected add-ons (recommended add-ons + co-branded packaging), each with
  // a per-box price. Billed separately from the combo.
  const selectedAddOns = (combo) => {
    const list = (combo.addOns || []).filter((a) => picked.includes(a.name)).map((a) => ({ name: a.name, price: Number(a.price) || 0 }));
    if (coBranded) list.push({ name: "Customized packaging", price: CO_BRAND_PRICE });
    return list.filter((a) => a.price > 0);
  };

  // No automatic bulk discount — any discount is negotiated by the team during
  // quote generation. Box bill is simply price per box × number of boxes.
  const bill = (combo) => {
    const unit = unitPrice(combo);
    const subtotal = unit * boxes;
    return { unit, subtotal, total: subtotal };
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
    const b = bill(combo);
    const resolved = (combo.items || []).map((it, idx) =>
      it && it.kind === "choice" ? (choices[idx] || optionObjs(it)[0]?.name || it.label) : (it.name || it)
    ).filter(Boolean);
    const chosenAddOns = selectedAddOns(combo);
    // The combo box (food only). Carries the packaging flags for downstream
    // label / event-type logic; its price excludes add-ons.
    const items = [{
      id: `combo-${combo._id}`,
      name: combo.name,
      isCombo: true,
      vendor: combo.vendor || "",
      comboItems: resolved,
      comboCommon: combo.commonItems || [],
      comboAddOns: chosenAddOns,
      coBranded,
      reusableCarrier,
      quantity: boxes,
      pricePerItem: b.unit,
      price: b.subtotal,
      bulkDiscountPct: 0,
    }];
    // Each selected add-on as its own bill line: per-box price × number of boxes.
    chosenAddOns.forEach((a, i) => {
      items.push({
        id: `addon-${combo._id}-${i}`,
        name: a.name,
        isAddOn: true,
        vendor: combo.vendor || "",
        quantity: boxes,
        pricePerItem: a.price,
        price: a.price * boxes,
        bulkDiscountPct: 0,
      });
    });
    onSelectionChange?.({ Items: items });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedComboId, choices, picked, packaging, combos, boxes]);

  const pickCombo = (id) => setSelectedComboId(id);

  // load the fulfilling vendor's public profile (FSSAI, areas, kitchen media)
  const fulfilVendorName = selectedCombo?.vendor || "";
  useEffect(() => {
    if (!fulfilVendorName) { setVendorInfo(null); return; }
    let active = true;
    fetchPublicVendor(fulfilVendorName)
      .then((v) => { if (active) setVendorInfo(v); })
      .catch(() => { if (active) setVendorInfo(null); });
    return () => { active = false; };
  }, [fulfilVendorName]);

  // load reviews when the vendor modal is opened
  const loadReviews = (name) => {
    if (!name) return;
    fetchReviews(name)
      .then((d) => setReviewData(d || { summary: { average: 0, count: 0 }, reviews: [] }))
      .catch(() => setReviewData({ summary: { average: 0, count: 0 }, reviews: [] }));
  };
  useEffect(() => {
    if (showVendor && fulfilVendorName) loadReviews(fulfilVendorName);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showVendor, fulfilVendorName]);

  // what comes with the selected combo — drives the little preview add-on icons
  const includedText = [
    ...((selectedCombo?.commonItems) || []),
    ...((selectedCombo?.addOns) || []).filter((a) => picked.includes(a.name)).map((a) => a.name),
  ].join(" ").toLowerCase();
  const hasTissue = /tissue/.test(includedText);
  const hasCutlery = /cutlery|spoon|fork/.test(includedText);
  const hasWater = /water|bottle/.test(includedText);

  // the vendor fulfilling this box for the customer's area
  const fulfilVendor = selectedCombo?.vendor || combos.find((c) => c.vendor)?.vendor || "";

  return (
    <section className="cbFood" aria-label="Choose your box">
      <header className="cbFood__head">
        <div className="cbFood__headMain">
          <h3 className="cbFood__title">Choose your box</h3>
          <p className="cbFood__sub">{mealSlot ? `${mealSlot} · ` : ""}{count}-item box</p>
        </div>
        {fulfilVendor && (
          <div className="cbFood__vendor">
            <span className="cbFood__vendorName">Vendor: <strong>{fulfilVendor}</strong></span>
            <button type="button" className="cbFood__vendorLink" onClick={() => setShowVendor(true)}>
              View details
            </button>
          </div>
        )}
      </header>

      {showVendor && fulfilVendor && (
        <div className="cbVendorOverlay" role="dialog" aria-modal="true" onClick={() => setShowVendor(false)}>
          <div className="cbVendorModal" onClick={(e) => e.stopPropagation()}>
            <button type="button" className="cbVendorModal__close" onClick={() => setShowVendor(false)} aria-label="Close"><FaTimes /></button>
            <div className="cbVendorModal__head">
              <span className="cbVendorModal__icon" aria-hidden="true"><FaHandshake /></span>
              <div>
                <div className="cbVendorModal__name">{fulfilVendor}</div>
                <div className="cbVendorModal__tag">Verified CaterKart partner</div>
                {reviewData.summary.count > 0 && (
                  <div className="cbVendorModal__rateline">
                    <Stars value={reviewData.summary.average} />
                    <strong>{reviewData.summary.average.toFixed(1)}</strong>
                    <span>({reviewData.summary.count})</span>
                  </div>
                )}
              </div>
            </div>
            <ul className="cbVendorPoints">
              <li className="cbVendorPoint">
                <span className="cbVendorPoint__icon" aria-hidden="true"><FaCertificate /></span>
                <div className="cbVendorPoint__body">
                  <div className="cbVendorPoint__title">FSSAI-licensed kitchen</div>
                  <div className="cbVendorPoint__meta">{vendorInfo?.fssaiNumber ? `Lic. No. ${vendorInfo.fssaiNumber}` : "Government food-safety certified"}</div>
                </div>
              </li>

              <li className="cbVendorPoint">
                <span className="cbVendorPoint__icon" aria-hidden="true"><FaShieldAlt /></span>
                <div className="cbVendorPoint__body">
                  <div className="cbVendorPoint__title">Hygiene &amp; quality checked</div>
                  {(vendorInfo?.kitchenPhotos?.length || vendorInfo?.kitchenVideos?.length) ? (
                    <div className="cbVendorMedia">
                      {(vendorInfo.kitchenPhotos || []).map((src, i) => (
                        <img key={`p${i}`} className="cbVendorMedia__item" src={src} alt="Kitchen" loading="lazy" />
                      ))}
                      {(vendorInfo.kitchenVideos || []).map((src, i) => (
                        <video key={`v${i}`} className="cbVendorMedia__item" src={src} controls preload="metadata" />
                      ))}
                    </div>
                  ) : (
                    <a className="cbVendorPoint__link" href="/our-kitchen" target="_blank" rel="noreferrer">
                      View our kitchen photos →
                    </a>
                  )}
                </div>
              </li>

              {(vendorInfo?.serviceAreas?.length || dietConfig.serviceArea) && (
                <li className="cbVendorPoint">
                  <span className="cbVendorPoint__icon" aria-hidden="true"><FaMapMarkerAlt /></span>
                  <div className="cbVendorPoint__body">
                    <div className="cbVendorPoint__title">Delivery areas</div>
                    <div className="cbVendorPoint__chips">
                      {(vendorInfo?.serviceAreas?.length ? vendorInfo.serviceAreas : [dietConfig.serviceArea]).map((a) => (
                        <span className="cbVendorPoint__chip" key={a}>{a}</span>
                      ))}
                    </div>
                  </div>
                </li>
              )}

              <li className="cbVendorPoint">
                <span className="cbVendorPoint__icon" aria-hidden="true"><FaUtensils /></span>
                <div className="cbVendorPoint__body">
                  <div className="cbVendorPoint__title">Freshly prepared</div>
                  <div className="cbVendorPoint__meta">Cooked &amp; packed on the day of delivery</div>
                </div>
              </li>
            </ul>

            <p className="cbVendorModal__note">
              Food is prepared &amp; supplied by this vendor. CaterKart connects you with vetted local partners.
            </p>
          </div>
        </div>
      )}

      <div className="cbFood__preview" aria-hidden="true">
        {coBranded ? (
          <img className="cbFood__cobrand" src={COBRAND_IMG[count] || cobrand5} alt="Customized packaging preview" />
        ) : reusableCarrier ? (
          <img className="cbFood__cobrand" src={carrierImg} alt="Reusable carrier preview" />
        ) : (
          <BoxLayoutIcon size={count} className="cbFood__box3d" />
        )}
        {(hasTissue || hasCutlery || hasWater) && (
          <div className="cbFood__extras">
            {hasTissue && <img className="cbFood__extra" src={tissueImg} alt="Tissue" />}
            {hasCutlery && <img className="cbFood__extra" src={cutleryImg} alt="Cutlery" />}
            {hasWater && <img className="cbFood__extra" src={bottleImg} alt="Water bottle" />}
          </div>
        )}
      </div>

      {combos.length > 0 && (
        /* Packaging — placed above combos so the preview image updates as you pick. */
        <div className="cbPackBlock">
          <PackagingOptions
            value={packaging || "plain"}
            onChange={(v) => setPackaging(v === "plain" ? "" : v)}
            boxType={count}
          />
        </div>
      )}

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

              {(() => {
                const b = bill(selectedCombo);
                const addOns = selectedAddOns(selectedCombo);
                const addOnsSubtotal = addOns.reduce((s, a) => s + a.price * (boxes || 0), 0);
                const carrierOff = reusableCarrier ? carrierSavingPerBox(count) : 0;
                const carrierSaving = carrierOff * (boxes || 0);
                const netTotal = Math.max(0, b.subtotal + addOnsSubtotal - carrierSaving);
                return (
                  <div className="cbBill">
                    <div className="cbBill__row">
                      <span>Price per box</span><span>₹{b.unit}</span>
                    </div>
                    <div className="cbBill__row">
                      <span>{boxes || 0} {boxes === 1 ? "box" : "boxes"} (₹{b.unit} × {boxes || 0})</span>
                      <span>₹{b.subtotal}</span>
                    </div>
                    {addOns.map((a) => (
                      <div className="cbBill__row cbBill__row--addon" key={a.name}>
                        <span>{a.name} (+₹{a.price} × {boxes || 0})</span>
                        <span>₹{a.price * (boxes || 0)}</span>
                      </div>
                    ))}
                    {carrierSaving > 0 && (
                      <div className="cbBill__row cbBill__row--save">
                        <span>Reusable carrier saving (−₹{carrierOff} × {boxes || 0})</span>
                        <span>−₹{carrierSaving}</span>
                      </div>
                    )}
                    <div className="cbBill__row cbBill__total">
                      <span>Total for {boxes || 0} {boxes === 1 ? "guest" : "guests"}</span>
                      <strong>₹{netTotal}</strong>
                    </div>
                  </div>
                );
              })()}
            </div>
          )}
        </div>
      ) : loaded ? (
        <div className="cbEmpty" role="alert">
          <span className="cbEmpty__icon" aria-hidden="true"><FaBoxOpen /></span>
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
