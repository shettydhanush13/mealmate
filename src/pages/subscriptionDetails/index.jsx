// src/pages/subscriptionDetails/index.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { FaArrowLeft, FaPhoneAlt, FaEnvelope } from "react-icons/fa";
import Wrapper from "../../components/wrapper";
import { fetchSubscriptionById, updateSubscription } from "../../services/subscriptions";
import { fetchCombos } from "../../services/combos";
import { fetchVendors } from "../../services/vendors";
import {
  carrierSavingPerBox, CO_BRAND_PRICE, gstOn, GST_RATE, PLATFORM_FEE, DELIVERY_FEE,
  commissionPctFor, splitOrderEconomics,
} from "../../services/pricing";
// load SubscriptionModal.scss before packagingOptions (consistent CSS order, see create-menu)
import "../create-menu/components/SubscriptionModal.scss"; // shared .sub* field styles
import PackagingOptions from "../../components/packagingOptions";
import "./styles.scss";

const STATUSES = ["new", "contacted", "quoted", "confirmed", "closed", "cancelled"];
const MEALS = ["Breakfast", "Lunch/Dinner", "Snacks"];
const BOXES = [3, 5, 8];
const FREQUENCIES = [
  { id: "daily", label: "Daily" },
  { id: "weekdays", label: "Weekdays" },
  { id: "custom", label: "Custom" },
];
const fmtDate = (d) => (d ? new Date(d).toLocaleString("en-IN", {
  day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit",
}) : "—");

const inr = (n) => `₹${Number(n || 0).toLocaleString("en-IN", { maximumFractionDigits: 0 })}`;

const MS_WEEK = 7 * 24 * 60 * 60 * 1000;

// plan length in weeks from start → end dates. No end date = ongoing (0 weeks,
// billed weekly indefinitely). Falls back to "today" as the start if unset.
const weeksBetween = (start, end) => {
  if (!end) return 0;
  const e = new Date(end);
  const s = start ? new Date(start) : new Date();
  const ms = e - s;
  if (!(ms > 0)) return 0;
  return Math.max(1, Math.ceil(ms / MS_WEEK));
};

// dishes packed in a combo (fixed dishes + choosable slots)
const comboDishNames = (c) =>
  (Array.isArray(c?.items) ? c.items : [])
    .map((it) => (it?.kind === "choice" ? (it.label || "Your choice") : (it?.name || "")))
    .filter(Boolean);

const choiceItemsOf = (c) => (Array.isArray(c?.items) ? c.items : []).filter((it) => it?.kind === "choice");

// price of a combo after the chosen options + paid add-ons (before carrier discount)
const customizedPrice = (c, custom) => {
  let p = Number(c?.price) || 0;
  choiceItemsOf(c).forEach((it) => {
    const opt = (it.options || []).find((o) => o.name === custom?.choices?.[it.label]);
    if (opt) p += Number(opt.price) || 0;
  });
  (custom?.addOns || []).forEach((an) => {
    const a = (c?.addOns || []).find((o) => o.name === an);
    if (a) p += Number(a.price) || 0;
  });
  return Math.max(0, p);
};

// default customization: first option for each choice slot, no add-ons
const defaultCustom = (c) => {
  const choices = {};
  choiceItemsOf(c).forEach((it) => { if ((it.options || []).length) choices[it.label] = it.options[0].name; });
  return { choices, addOns: [] };
};

// editable snapshot of a subscription doc
const editable = (s = {}) => ({
  contactName: s.contactName || "",
  phone: s.phone || "",
  email: s.email || "",
  organisation: s.organisation || "",
  pincode: s.pincode || "",
  mealSlot: s.mealSlot || "",
  boxType: s.boxType || null,
  reusableCarrier: !!s.reusableCarrier,
  coBranded: !!s.coBranded,
  totalMeals: s.totalMeals ?? "",
  frequency: ["daily", "weekdays", "custom"].includes(s.frequency) ? s.frequency : "daily",
  startDate: s.startDate || "",
  endDate: s.endDate || "", // blank = ongoing (no end date)
  deliveries: Array.isArray(s.deliveries) ? s.deliveries : [], // marked-delivered combos by day
  preferredCombos: Array.isArray(s.preferredCombos) ? s.preferredCombos : [],
  comboFreq: (Array.isArray(s.comboPlan) ? s.comboPlan : []).reduce((m, x) => {
    if (x?.name) m[x.name] = Number(x.perWeek) || 0;
    return m;
  }, {}),
  comboCustom: (Array.isArray(s.comboPlan) ? s.comboPlan : []).reduce((m, x) => {
    if (x?.name) m[x.name] = { choices: x.choices || {}, addOns: Array.isArray(x.addOns) ? x.addOns : [] };
    return m;
  }, {}),
  paymentType: "weekly", // billing is always weekly
  discountPct: s.discountPct ?? "", // negotiated discount %
  notes: s.notes || "",
  status: s.status || "new",
  adminNotes: s.adminNotes || "",
});

export default function SubscriptionDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [sub, setSub] = useState(null);
  const [form, setForm] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);
  const [savedAt, setSavedAt] = useState(null);
  const [combos, setCombos] = useState([]);
  const [combosLoading, setCombosLoading] = useState(true);
  const [vendors, setVendors] = useState([]);

  // all combos so the admin can adjust the customer's picks before finalising
  useEffect(() => {
    let alive = true;
    setCombosLoading(true);
    fetchCombos()
      .then((list) => { if (alive) setCombos(Array.isArray(list) ? list : []); })
      .catch(() => { if (alive) setCombos([]); })
      .finally(() => { if (alive) setCombosLoading(false); });
    return () => { alive = false; };
  }, []);

  // vendors → CaterKart commission % per combo (internal payout math)
  useEffect(() => {
    let alive = true;
    fetchVendors()
      .then((list) => { if (alive) setVendors(Array.isArray(list) ? list : []); })
      .catch(() => { if (alive) setVendors([]); });
    return () => { alive = false; };
  }, []);

  const vendorByName = useMemo(() => {
    const m = new Map();
    (vendors || []).forEach((v) => { if (v?.name) m.set(v.name, v); });
    return m;
  }, [vendors]);

  useEffect(() => {
    let alive = true;
    setLoading(true);
    setError(null);
    fetchSubscriptionById(id)
      .then((data) => {
        if (!alive) return;
        if (!data) { setError("Subscription not found."); return; }
        setSub(data);
        setForm(editable(data));
      })
      .catch((err) => alive && setError(err?.response?.data?.message || err?.message || "Failed to load"))
      .finally(() => alive && setLoading(false));
    return () => { alive = false; };
  }, [id]);

  const dirty = useMemo(
    () => sub && form && JSON.stringify(form) !== JSON.stringify(editable(sub)),
    [form, sub],
  );

  // Show only combos that match the plan's meal + box size (like the customer
  // flow), but always keep the customer's already-picked combos visible so an
  // admin never loses an existing selection when narrowing the filter.
  const visibleCombos = useMemo(() => {
    if (!form) return [];
    const wantMeal = String(form.mealSlot || "").trim();
    const wantBox = form.boxType != null ? Number(form.boxType) : null;
    const picked = new Set(form.preferredCombos || []);
    return combos.filter((c) => {
      const name = c.name || "Combo";
      if (picked.has(name)) return true;
      const slots = [c.mealSlot, ...(Array.isArray(c.mealSlots) ? c.mealSlots : [])]
        .map((s) => String(s || "").trim()).filter(Boolean);
      const mealOk = !wantMeal || slots.length === 0 || slots.includes(wantMeal);
      const boxOk = wantBox == null || c.boxType == null || Number(c.boxType) === wantBox;
      return mealOk && boxOk;
    });
  }, [combos, form]);

  // Estimated pricing. The per-combo "times a week" mix sets the (weighted)
  // average box price; "Number of meals" is the total quantity (falling back to
  // boxes/week × duration if meals aren't entered). Bulk discount, platform fee
  // and GST are then applied. Estimate only.
  const pricing = useMemo(() => {
    if (!form) return null;
    const byName = new Map(combos.map((c) => [c.name, c]));
    // carrier saving and customized-packaging surcharge are mutually exclusive
    const carrierOff = form.reusableCarrier ? carrierSavingPerBox(form.boxType) : 0;
    const coBrandAdd = form.coBranded ? CO_BRAND_PRICE : 0;

    const people = Number(form.totalMeals) || 0; // fixed headcount for the whole plan
    const lines = [];
    let weeklyTotal = 0;       // money per week (includes people)
    let boxesPerWeek = 0;      // boxes per week (includes people)
    let weeklyCommission = 0;  // CaterKart commission per week (internal)
    let wNum = 0;              // Σ price × perWeek  (for the per-box average)
    let wDen = 0;              // Σ perWeek
    let effSum = 0;
    form.preferredCombos.forEach((name) => {
      const c = byName.get(name);
      const custom = form.comboCustom[name] || { choices: {}, addOns: [] };
      const effective = Math.max(0, customizedPrice(c, custom) - carrierOff) + coBrandAdd; // per box
      const perWeek = Number(form.comboFreq[name]) || 0;
      const boxes = perWeek * people;       // boxes/week for this combo
      const weekly = effective * boxes;     // ₹/week for this combo
      // commission is CaterKart's cut + its 18% GST, per the combo vendor's
      // CaterBox % from vendor config (Sec 9(5) model)
      const vPct = commissionPctFor(vendorByName.get(c?.vendor), "caterbox");
      weeklyCommission += splitOrderEconomics(weekly, vPct).commissionTotal;
      lines.push({ name, perWeek, effective, boxes, weekly });
      effSum += effective;
      weeklyTotal += weekly;
      boxesPerWeek += boxes;
      if (perWeek > 0) { wNum += effective * perWeek; wDen += perWeek; }
    });

    // per-box average, weighted by times/week only (people don't affect it)
    const avgBox = wDen > 0
      ? Math.round(wNum / wDen)
      : (lines.length ? Math.round(effSum / lines.length) : 0);

    const weeks = weeksBetween(form.startDate, form.endDate);
    const totalBoxes = boxesPerWeek * weeks; // total meals across the plan (derived)
    const subtotal = weeklyTotal * weeks;
    // negotiated discount: a % the admin sets during quote generation (no auto bulk)
    const pct = Number(form.discountPct) || 0;
    const negotiatedDiscount = Math.round((subtotal * pct) / 100);
    const discountedFood = Math.max(0, subtotal - negotiatedDiscount);
    const platformFee = PLATFORM_FEE;       // ₹0 for now (shown on the bill)
    const delivery = DELIVERY_FEE;          // ₹0 for now
    const gst = gstOn(discountedFood + platformFee);
    const total = discountedFood + platformFee + delivery + gst;
    const advance = Math.round(total * 0.5);
    const commission = weeklyCommission * weeks; // internal CaterKart cut

    // billed weekly: one invoice per week of the plan
    const installments = weeks;
    const perPayment = installments > 0 ? Math.round(total / installments) : 0;

    // per-week figures (reflect the negotiated discount + GST) — shown for
    // ongoing plans where there's no fixed plan length.
    const weeklyDiscount = Math.round((weeklyTotal * pct) / 100);
    const weeklyNet = Math.max(0, weeklyTotal - weeklyDiscount);
    const weeklyGst = gstOn(weeklyNet + platformFee);
    const weeklyWithGst = weeklyNet + platformFee + delivery + weeklyGst;

    return {
      lines, carrierOff, coBrandAdd, avgBox, weighted: wDen > 0, weeks, people, weeklyTotal, boxesPerWeek, totalBoxes,
      subtotal, pct, negotiatedDiscount, platformFee, delivery, gst, total, advance, balance: total - advance,
      carrierSavings: carrierOff * totalBoxes, coBrandSurcharge: coBrandAdd * totalBoxes, commission,
      installments, perPayment,
      weeklyDiscount, weeklyNet, weeklyGst, weeklyWithGst,
      ready: weeklyTotal > 0,
      hasDuration: weeks > 0,
    };
  }, [form, combos, vendorByName]);

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const toggleCombo = (name) => setForm((f) => {
    const has = f.preferredCombos.includes(name);
    const preferredCombos = has ? f.preferredCombos.filter((c) => c !== name) : [...f.preferredCombos, name];
    const comboFreq = { ...f.comboFreq };
    const comboCustom = { ...f.comboCustom };
    if (has) { delete comboFreq[name]; delete comboCustom[name]; }
    else {
      if (comboFreq[name] == null) comboFreq[name] = 1; // default once a week
      if (!comboCustom[name]) comboCustom[name] = defaultCustom(combos.find((x) => (x.name || "Combo") === name));
    }
    return { ...f, preferredCombos, comboFreq, comboCustom };
  });
  const setComboFreq = (name, val) =>
    setForm((f) => ({ ...f, comboFreq: { ...f.comboFreq, [name]: Math.max(0, Math.min(21, Number(val) || 0)) } }));
  const setComboChoice = (name, label, optName) =>
    setForm((f) => {
      const cur = f.comboCustom[name] || { choices: {}, addOns: [] };
      return { ...f, comboCustom: { ...f.comboCustom, [name]: { ...cur, choices: { ...cur.choices, [label]: optName } } } };
    });
  const toggleComboAddOn = (name, an) =>
    setForm((f) => {
      const cur = f.comboCustom[name] || { choices: {}, addOns: [] };
      const addOns = cur.addOns.includes(an) ? cur.addOns.filter((a) => a !== an) : [...cur.addOns, an];
      return { ...f, comboCustom: { ...f.comboCustom, [name]: { ...cur, addOns } } };
    });

  const save = async () => {
    if (!dirty || saving) return;
    setSaving(true);
    setError(null);
    const payload = {
      contactName: form.contactName.trim(),
      phone: form.phone,
      email: form.email,
      organisation: form.organisation,
      pincode: form.pincode,
      reusableCarrier: form.reusableCarrier,
      preferredCombos: form.preferredCombos,
      comboPlan: form.preferredCombos.map((name) => {
        const c = combos.find((x) => (x.name || "Combo") === name);
        const custom = form.comboCustom[name] || { choices: {}, addOns: [] };
        return {
          name,
          perWeek: Number(form.comboFreq[name]) || 0,
          choices: custom.choices || {},
          addOns: custom.addOns || [],
          unitPrice: customizedPrice(c, custom),
        };
      }),
      notes: form.notes,
      frequency: form.frequency,
      startDate: form.startDate,
      endDate: form.endDate || "",
      ongoing: !form.endDate, // no end date = ongoing until cancelled; billed weekly
      coBranded: !!form.coBranded,
      deliveries: form.deliveries || [],
      status: form.status,
      adminNotes: form.adminNotes,
    };
    if (form.paymentType) payload.paymentType = form.paymentType;
    if (form.mealSlot) payload.mealSlot = form.mealSlot;
    if (form.boxType) payload.boxType = Number(form.boxType);
    if (form.totalMeals) payload.totalMeals = Number(form.totalMeals);
    payload.discountPct = Number(form.discountPct) || 0; // negotiated discount %
    try {
      const updated = await updateSubscription(id, payload);
      const next = updated && updated._id ? updated : { ...sub, ...payload };
      setSub(next);
      setForm(editable(next));
      setSavedAt(Date.now());
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Wrapper headertext="Subscription" footer={false}>
        <div className="subDetail"><div className="subDetail__state">Loading…</div></div>
      </Wrapper>
    );
  }

  if (error && !sub) {
    return (
      <Wrapper headertext="Subscription" footer={false}>
        <div className="subDetail">
          <button className="subDetail__back" onClick={() => navigate(-1)}><FaArrowLeft /> Back</button>
          <div className="subDetail__state subDetail__state--err">{error}</div>
        </div>
      </Wrapper>
    );
  }

  // Once active (confirmed) the quote/plan sections are hidden — the operational
  // work happens on the Active Subscription page; here we keep contact + status.
  const isActive = form.status === "confirmed";

  return (
    <Wrapper headertext="Subscription" footer={false}>
      <div className="subDetail">
        <button className="subDetail__back" onClick={() => navigate(-1)}><FaArrowLeft /> Back to orders</button>

        {/* hero */}
        <div className="sdCard sdHero">
          <div className="sdHero__left">
            <h2 className="sdHero__name">{form.contactName || "—"}</h2>
            {form.organisation && <div className="sdHero__org">{form.organisation}</div>}
            <div className="sdHero__date">Requested {fmtDate(sub.createdAt)}</div>
          </div>
          <span className={`sdStatusBadge status-${form.status}`}>{form.status}</span>
        </div>

        {/* active subscription — operational view lives on its own page */}
        {form.status === "confirmed" && (
          <section className="sdCard sdActive">
            <div className="sdActive__body">
              <h3 className="sdCard__title">This subscription is active</h3>
              <p className="sdCard__note">
                Mark daily deliveries, plan next week's combos, and generate weekly invoices &amp; payment links.
                {dirty && <strong> Save your changes first.</strong>}
              </p>
            </div>
            <button type="button" className="sdBtn sdBtn--primary"
              onClick={() => navigate(`/admin/subscriptions/${id}/active`)} disabled={dirty}>
              Manage deliveries &amp; invoices →
            </button>
          </section>
        )}

        {/* quick contact actions */}
        <section className="sdCard">
          <h3 className="sdCard__title">Contact</h3>
          <div className="sdContact">
            <a className="sdContact__btn" href={`tel:+91${form.phone}`}><FaPhoneAlt /> Call +91 {form.phone}</a>
            {form.email && <a className="sdContact__btn" href={`mailto:${form.email}`}><FaEnvelope /> {form.email}</a>}
          </div>
          <div className="subGrid">
            <div className="subField">
              <label className="subField__label">Name</label>
              <input className="subInput" value={form.contactName} onChange={(e) => set("contactName", e.target.value)} />
            </div>
            <div className="subField">
              <label className="subField__label">Phone</label>
              <div className="subPhone">
                <span className="subPhone__prefix">+91</span>
                <input className="subInput subInput--phone" type="tel" inputMode="numeric" maxLength={10}
                  value={form.phone} onChange={(e) => set("phone", e.target.value.replace(/\D/g, "").slice(0, 10))} />
              </div>
            </div>
            <div className="subField">
              <label className="subField__label">Email</label>
              <input className="subInput" type="email" value={form.email} onChange={(e) => set("email", e.target.value)} />
            </div>
            <div className="subField">
              <label className="subField__label">Organisation</label>
              <input className="subInput" value={form.organisation} onChange={(e) => set("organisation", e.target.value)} />
            </div>
            <div className="subField">
              <label className="subField__label">Delivery pincode</label>
              <input className="subInput" type="tel" inputMode="numeric" maxLength={6}
                value={form.pincode} onChange={(e) => set("pincode", e.target.value.replace(/\D/g, "").slice(0, 6))} />
            </div>
          </div>
        </section>

        {/* plan / quote sections — hidden once the subscription is active */}
        {!isActive && (<>
        <section className="sdCard">
          <h3 className="sdCard__title">Plan</h3>
          <div className="subField">
            <span className="subField__label">Meal</span>
            <div className="subChips">
              {MEALS.map((m) => (
                <button type="button" key={m} className={`subChip__btn ${form.mealSlot === m ? "is-active" : ""}`}
                  onClick={() => set("mealSlot", m)}>{m}</button>
              ))}
            </div>
          </div>
          <div className="subField">
            <span className="subField__label">Box / carrier size</span>
            <div className="subChips">
              {BOXES.map((b) => (
                <button type="button" key={b} className={`subChip__btn ${form.boxType === b ? "is-active" : ""}`}
                  onClick={() => set("boxType", b)}>{b} items</button>
              ))}
            </div>
          </div>

          <PackagingOptions
            value={form.coBranded ? "cobrand" : form.reusableCarrier ? "carrier" : "plain"}
            onChange={(v) => setForm((f) => ({ ...f, reusableCarrier: v === "carrier", coBranded: v === "cobrand" }))}
            boxType={form.boxType}
          />
        </section>

        {/* preferred combos — all combos shown, customer's picks highlighted */}
        <section className="sdCard">
          <h3 className="sdCard__title">
            Preferred combos <span className="sdCard__hint">({form.preferredCombos.length} selected · for rotation)</span>
          </h3>
          <p className="sdCard__note">
            The customer's picks are highlighted. Discuss and adjust the final selection, then Save.
            {form.reusableCarrier && carrierSavingPerBox(form.boxType) > 0 && <strong> ₹{carrierSavingPerBox(form.boxType)} off each with reusable carriers.</strong>}
            {form.coBranded && <strong> +₹{CO_BRAND_PRICE}/box for customized packaging.</strong>}
          </p>
          {combosLoading ? (
            <div className="sdEmpty">Loading combos…</div>
          ) : visibleCombos.length === 0 ? (
            <div className="sdEmpty">
              {combos.length === 0
                ? "No combos available."
                : `No combos match ${form.mealSlot || "this meal"}${form.boxType ? ` · ${form.boxType}-item box` : ""}.`}
            </div>
          ) : (
            <div className="subCombos">
              {visibleCombos.map((c) => {
                const name = c.name || "Combo";
                const active = form.preferredCombos.includes(name);
                const slot = c.mealSlot || (Array.isArray(c.mealSlots) ? c.mealSlots.join(", ") : "");
                const dishes = comboDishNames(c);
                const extras = c.commonItems || [];
                const custom = form.comboCustom[name] || { choices: {}, addOns: [] };
                const choiceItems = choiceItemsOf(c);
                const comboAddOns = Array.isArray(c.addOns) ? c.addOns : [];
                const cp = customizedPrice(c, custom);
                const canCustomize = choiceItems.length > 0 || comboAddOns.length > 0;
                return (
                  <div className="subComboWrap" key={c._id || name}>
                    <div className={`subComboRow ${active ? "is-active" : ""}`}>
                      <button type="button"
                        className={`subCombo ${active ? "is-active" : ""}`} aria-pressed={active}
                        onClick={() => toggleCombo(name)}>
                        <span className="subCombo__check" aria-hidden="true" />
                        <span className="subCombo__body">
                          <span className="subCombo__top">
                            <span className="subCombo__name">{name}</span>
                            {cp ? (
                              form.reusableCarrier ? (
                                <span className="subCombo__price">
                                  <s className="subCombo__was">₹{cp}</s> ₹{Math.max(0, cp - carrierSavingPerBox(form.boxType))}
                                </span>
                              ) : form.coBranded ? (
                                <span className="subCombo__price">₹{cp + CO_BRAND_PRICE}</span>
                              ) : (
                                <span className="subCombo__price">₹{cp}</span>
                              )
                            ) : null}
                          </span>
                          <span className="subCombo__meta">
                            {[slot, c.boxType ? `${c.boxType}-item box` : "", c.vendor].filter(Boolean).join(" · ")}
                          </span>
                          {dishes.length > 0 && (
                            <span className="subCombo__items">{dishes.join(", ")}</span>
                          )}
                          {extras.length > 0 && (
                            <span className="subCombo__extras">Includes: {extras.slice(0, 5).join(", ")}</span>
                          )}
                        </span>
                      </button>
                      {active && (
                        <div className="subComboFreq">
                          <input type="number" min="0" max="21" inputMode="numeric"
                            value={form.comboFreq[name] ?? ""}
                            onChange={(e) => setComboFreq(name, e.target.value)} />
                          <span className="subComboFreq__unit">× / week</span>
                        </div>
                      )}
                    </div>

                    {active && canCustomize && (
                      <div className="subCustom">
                        <span className="subCustom__head">Customize this box</span>
                        {choiceItems.map((it) => (
                          <label className="subCustom__row" key={it.label}>
                            <span className="subCustom__label">{it.label || it.category || "Choice"}</span>
                            <select className="subSelect" value={custom.choices?.[it.label] || ""}
                              onChange={(e) => setComboChoice(name, it.label, e.target.value)}>
                              {(it.options || []).map((o) => (
                                <option key={o.name} value={o.name}>{o.name}{o.price ? ` (+₹${o.price})` : ""}</option>
                              ))}
                            </select>
                          </label>
                        ))}
                        {comboAddOns.length > 0 && (
                          <div className="subCustom__row subCustom__row--col">
                            <span className="subCustom__label">Add-ons</span>
                            <div className="subChips">
                              {comboAddOns.map((a) => {
                                const on = (custom.addOns || []).includes(a.name);
                                return (
                                  <button type="button" key={a.name}
                                    className={`subChip__btn ${on ? "is-active" : ""}`}
                                    onClick={() => toggleComboAddOn(name, a.name)}>
                                    {a.name}{a.price ? ` +₹${a.price}` : ""}
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        )}
                        <div className="subCustom__price">
                          Customized box price <strong>₹{cp}</strong>
                          {form.reusableCarrier ? <em> − ₹{carrierSavingPerBox(form.boxType)} carrier = ₹{Math.max(0, cp - carrierSavingPerBox(form.boxType))}</em> : null}
                          {form.coBranded ? <em> + ₹{CO_BRAND_PRICE} packaging = ₹{cp + CO_BRAND_PRICE}</em> : null}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* quantity & schedule */}
        <section className="sdCard">
          <h3 className="sdCard__title">Quantity &amp; schedule</h3>
          <div className="subField">
            <label className="subField__label">Number of meals (people)</label>
            <input className="subInput" type="number" min="1" inputMode="numeric"
              value={form.totalMeals} onChange={(e) => set("totalMeals", e.target.value)} />
            <span className="subField__hint">Headcount — served by every combo each delivery</span>
          </div>
          <div className="subField">
            <span className="subField__label">Delivery frequency</span>
            <div className="subChips">
              {FREQUENCIES.map((f) => (
                <button type="button" key={f.id} className={`subChip__btn ${form.frequency === f.id ? "is-active" : ""}`}
                  onClick={() => set("frequency", f.id)}>{f.label}</button>
              ))}
            </div>
          </div>
          <div className="subGrid">
            <div className="subField">
              <label className="subField__label">Start date</label>
              <input className="subInput" type="date" value={form.startDate} onChange={(e) => set("startDate", e.target.value)} />
            </div>
            <div className="subField">
              <label className="subField__label">End date <span className="subField__opt">(optional)</span></label>
              <input className="subInput" type="date" min={form.startDate || undefined}
                value={form.endDate} onChange={(e) => set("endDate", e.target.value)} />
              <span className="subField__hint">
                {form.endDate ? "Plan ends on this date." : "Blank = ongoing until the customer cancels."}
              </span>
            </div>
          </div>
          <p className="sdCard__note">Billed weekly — one invoice per week, regardless of plan length.</p>
        </section>

        {/* customer notes (read-only) */}
        {sub.notes && (
          <section className="sdCard">
            <h3 className="sdCard__title">Customer notes</h3>
            <p className="sdNotes__text">“{sub.notes}”</p>
          </section>
        )}

        {/* pricing & payment (estimated) */}
        <section className="sdCard">
          <h3 className="sdCard__title">Pricing &amp; payment <span className="sdCard__hint">(estimated)</span></h3>

          <div className="subField sdInline">
            <span className="subField__label">Payment type</span>
            <span className="sdPayType">Weekly — invoiced every week</span>
          </div>

          <div className="subField sdInline">
            <span className="subField__label">Negotiated discount</span>
            <span className="sdPctInput">
              <input type="number" min="0" max="100" inputMode="numeric"
                value={form.discountPct ?? ""}
                onChange={(e) => set("discountPct", e.target.value === "" ? "" : Math.max(0, Math.min(100, Number(e.target.value) || 0)))} />
              <span>%</span>
            </span>
          </div>

          {!pricing?.ready ? (
            <p className="sdCard__note">Pick combos and set times/week + people to see an estimate.</p>
          ) : (
            <>
              <table className="sdPrice">
                <tbody>
                  {pricing.lines.map((l) => (
                    <tr key={l.name}>
                      <td>{l.name} <em className="sdPrice__qty">{inr(l.effective)} × {l.perWeek}/wk × {pricing.people}</em></td>
                      <td>{inr(l.weekly)} /wk</td>
                    </tr>
                  ))}
                  {pricing.carrierOff > 0 && (
                    <tr className="sdPrice__off">
                      <td>Reusable carrier discount</td>
                      <td>− {inr(pricing.carrierOff)} / box</td>
                    </tr>
                  )}
                  {pricing.coBrandAdd > 0 && (
                    <tr>
                      <td>Customized packaging</td>
                      <td>+ {inr(pricing.coBrandAdd)} / box</td>
                    </tr>
                  )}
                  <tr>
                    <td>Avg. box price{pricing.weighted ? " (weighted)" : ""}</td>
                    <td>{inr(pricing.avgBox)}</td>
                  </tr>
                  <tr className="sdPrice__sub">
                    <td>Per week <em className="sdPrice__qty">{pricing.boxesPerWeek} box{pricing.boxesPerWeek === 1 ? "" : "es"}/wk</em></td>
                    <td>{inr(pricing.weeklyTotal)}</td>
                  </tr>
                  {pricing.hasDuration ? (
                    <>
                      <tr>
                        <td>Plan length</td>
                        <td>× {pricing.weeks} week{pricing.weeks === 1 ? "" : "s"}</td>
                      </tr>
                      <tr className="sdPrice__sub">
                        <td>Subtotal <em className="sdPrice__qty">{pricing.totalBoxes} meals</em></td>
                        <td>{inr(pricing.subtotal)}</td>
                      </tr>
                      {pricing.pct > 0 && (
                        <tr className="sdPrice__off">
                          <td>Negotiated discount ({pricing.pct}%)</td>
                          <td>− {inr(pricing.negotiatedDiscount)}</td>
                        </tr>
                      )}
                      <tr>
                        <td>Platform fee</td>
                        <td>{inr(pricing.platformFee)}</td>
                      </tr>
                      <tr>
                        <td>Delivery</td>
                        <td>{pricing.delivery > 0 ? inr(pricing.delivery) : "Free"}</td>
                      </tr>
                      <tr>
                        <td>GST ({GST_RATE}%)</td>
                        <td>{inr(pricing.gst)}</td>
                      </tr>
                      <tr className="sdPrice__total">
                        <td>Estimated total</td>
                        <td>{inr(pricing.total)}</td>
                      </tr>
                      {pricing.commission > 0 && (
                        <tr className="sdPrice__commission">
                          <td>CaterKart commission <em className="sdPrice__qty">internal</em></td>
                          <td>{inr(pricing.commission)}</td>
                        </tr>
                      )}
                    </>
                  ) : (
                    <>
                      {pricing.weeklyDiscount > 0 && (
                        <tr className="sdPrice__off">
                          <td>Negotiated discount ({pricing.pct}%)</td>
                          <td>− {inr(pricing.weeklyDiscount)}</td>
                        </tr>
                      )}
                      <tr>
                        <td>GST ({GST_RATE}%)</td>
                        <td>{inr(pricing.weeklyGst)}</td>
                      </tr>
                      <tr className="sdPrice__total">
                        <td>Estimated / week</td>
                        <td>{inr(pricing.weeklyWithGst)}</td>
                      </tr>
                    </>
                  )}
                </tbody>
              </table>
              {!pricing.hasDuration && (
                <p className="sdCard__note">
                  {!form.endDate
                    ? "Ongoing plan — billed weekly until the customer cancels, so there's no fixed full-plan total."
                    : "Set an end date after the start date for the full-plan total, discount & taxes."}
                </p>
              )}

              {pricing.perPayment > 0 && (
                <div className="sdPayPlan">
                  <span className="sdPayPlan__label">
                    Weekly invoice <em>× {pricing.installments} week{pricing.installments === 1 ? "" : "s"}</em>
                  </span>
                  <span className="sdPayPlan__val">{inr(pricing.perPayment)}</span>
                </div>
              )}

              {pricing.hasDuration && (
                <div className="sdPay">
                  <div className="sdPay__cell">
                    <span className="sdPay__label">Advance (50%)</span>
                    <span className="sdPay__val">{inr(pricing.advance)}</span>
                  </div>
                  <div className="sdPay__cell">
                    <span className="sdPay__label">Balance on delivery</span>
                    <span className="sdPay__val">{inr(pricing.balance)}</span>
                  </div>
                </div>
              )}

              {pricing.hasDuration && pricing.carrierSavings > 0 && (
                <p className="sdPrice__save">Saves {inr(pricing.carrierSavings)} across the plan with reusable carriers.</p>
              )}
              {pricing.hasDuration && pricing.coBrandSurcharge > 0 && (
                <p className="sdCard__note">Includes {inr(pricing.coBrandSurcharge)} across the plan for customized packaging.</p>
              )}
              <p className="sdCard__note">Incl. {GST_RATE}% GST. Platform fee &amp; delivery are ₹0 for now. Commission is CaterKart's internal cut (not charged to the customer). Estimate only — confirm before quoting.</p>
              {form.status !== "confirmed" && (
                <p className="sdCard__note">Mark this subscription <strong>Confirmed</strong> to activate it — weekly invoices are then generated from the actual deliveries below.</p>
              )}
            </>
          )}
        </section>
        </>)}

        {/* manage */}
        <section className="sdCard">
          <h3 className="sdCard__title">Manage</h3>
          <div className="subField">
            <span className="subField__label">Status</span>
            <select className={`sdSelect status-${form.status}`} value={form.status} onChange={(e) => set("status", e.target.value)}>
              {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div className="subField">
            <label className="subField__label">Internal notes (not shown to customer)</label>
            <textarea className="sdTextarea" rows={3} placeholder="Quote details, follow-up notes, agreed pricing…"
              value={form.adminNotes} onChange={(e) => set("adminNotes", e.target.value)} />
          </div>
        </section>

        {error && <div className="subDetail__state subDetail__state--err">{error}</div>}

        {/* sticky save bar */}
        <div className="sdSaveBar">
          {savedAt && !dirty && <span className="sdSaveBar__saved">Saved ✓</span>}
          {dirty && <span className="sdSaveBar__dirty">Unsaved changes</span>}
          <button className="sdBtn sdBtn--primary" onClick={save} disabled={!dirty || saving}>
            {saving ? "Saving…" : "Save changes"}
          </button>
        </div>
      </div>
    </Wrapper>
  );
}
