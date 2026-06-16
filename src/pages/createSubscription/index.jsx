// src/pages/createSubscription/index.jsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { FaRegCalendarAlt, FaCheckCircle } from "react-icons/fa";
import Wrapper from "../../components/wrapper";
import BoxLayoutIcon from "../../components/boxLayoutIcon";
import OTPModal from "../../components/otpModal";
// load SubscriptionModal.scss BEFORE packagingOptions to keep a single, consistent
// CSS order across the app (matches create-menu) — avoids mini-css "conflicting order".
import "../create-menu/components/SubscriptionModal.scss"; // shared .sub* field styles
import PackagingOptions from "../../components/packagingOptions";
import cobrand3 from "../../assets/cobrand3.png";
import cobrand5 from "../../assets/cobrand5.png";
import cobrand8 from "../../assets/cobrand8.png";
import { carrierSavingPerBox, CO_BRAND_PRICE } from "../../services/pricing";
import { createSubscription } from "../../services/subscriptions";
import { fetchCombos } from "../../services/combos";
import { checkServiceability } from "../../services/pincodes";
import { sendOTP, verifyOTP } from "../../services/otp";
import "./styles.scss";

const MEALS = ["Breakfast", "Lunch/Dinner", "Snacks"];
const BOXES = [3, 5, 8];
const COBRAND_IMG = { 3: cobrand3, 5: cobrand5, 8: cobrand8 };
const FREQUENCIES = [
  { id: "daily", label: "Daily" },
  { id: "weekdays", label: "Weekdays" },
  { id: "custom", label: "Custom" },
];

const newKey = () =>
  (typeof crypto !== "undefined" && crypto.randomUUID)
    ? crypto.randomUUID()
    : `sub-${Date.now()}-${Math.random().toString(36).slice(2)}`;

// "2026-06-22" -> "22 Jun 2026" for friendly hints.
const fmtDate = (iso) => {
  if (!iso) return "";
  const d = new Date(`${iso}T00:00:00`);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
};

const mealFromSlot = (slot) => {
  const s = String(slot || "").trim();
  return MEALS.includes(s) ? s : "";
};

// Names of the dishes packed in a combo (fixed dishes + choosable slots).
const comboDishNames = (c) =>
  (Array.isArray(c?.items) ? c.items : [])
    .map((it) => (it?.kind === "choice" ? (it.label || "Your choice") : (it?.name || "")))
    .filter(Boolean);

export default function CreateSubscriptionPage() {
  const navigate = useNavigate();
  const { state } = useLocation();
  const ctxMealSlot = state?.mealSlot;
  const ctxBoxType = state?.boxType;

  const [contactName, setContactName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [organisation, setOrganisation] = useState("");
  const [pincode, setPincode] = useState("");
  const [meal, setMeal] = useState(mealFromSlot(ctxMealSlot) || "Lunch/Dinner");
  const [box, setBox] = useState(BOXES.includes(Number(ctxBoxType)) ? Number(ctxBoxType) : 5);
  const [totalMeals, setTotalMeals] = useState("");
  const [endDate, setEndDate] = useState(""); // blank = ongoing (no end date) by default
  const ongoing = !endDate;
  const [frequency, setFrequency] = useState("daily");
  const [startDate, setStartDate] = useState("");
  // We need at least 1 week lead time to confirm & schedule a subscription.
  const minStartDate = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() + 7);
    return d.toISOString().slice(0, 10);
  }, []);
  const [reusableCarrier, setReusableCarrier] = useState(false);
  const [coBranded, setCoBranded] = useState(false); // customized packaging (+₹/box)
  const [preferredCombos, setPreferredCombos] = useState([]);
  const [combos, setCombos] = useState([]);
  const [combosLoading, setCombosLoading] = useState(false);
  const [pinCheck, setPinCheck] = useState(null); // { checking, serviceable, area, notConfigured }
  const [notes, setNotes] = useState("");

  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [done, setDone] = useState(false);
  const [showOtp, setShowOtp] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const keyRef = useRef(newKey());
  const pendingRef = useRef(null);

  // Inline serviceability check once a full 6-digit pincode is entered.
  useEffect(() => {
    if (!/^\d{6}$/.test(pincode)) { setPinCheck(null); return; }
    let alive = true;
    setPinCheck({ checking: true });
    checkServiceability(pincode)
      .then((r) => { if (alive) setPinCheck({ checking: false, ...r }); })
      .catch(() => { if (alive) setPinCheck(null); });
    return () => { alive = false; };
  }, [pincode]);

  // Load combos matching the chosen meal + box size so the customer can mark
  // preferences relevant to their plan.
  useEffect(() => {
    let alive = true;
    setCombosLoading(true);
    const params = {};
    if (box) params.boxType = box;
    if (meal) params.mealSlot = meal;
    fetchCombos(params)
      .then((list) => { if (alive) setCombos(Array.isArray(list) ? list : []); })
      .catch(() => { if (alive) setCombos([]); })
      .finally(() => { if (alive) setCombosLoading(false); });
    return () => { alive = false; };
  }, [box, meal]);

  const carrierOff = carrierSavingPerBox(box); // ₹ off per box by size when reusable
  const cleanPhone = () => phone.replace(/\D/g, "").slice(-10);
  const toggleCombo = (name) =>
    setPreferredCombos((prev) =>
      prev.includes(name) ? prev.filter((n) => n !== name) : [...prev, name]);

  // Step 1 — validate, then send an OTP to the contact number.
  const requestOtp = async (e) => {
    e.preventDefault();
    if (submitting) return;

    const next = {};
    if (!contactName.trim()) next.contactName = "Please enter your name.";
    if (!/^\d{10}$/.test(cleanPhone())) next.phone = "Enter a valid 10-digit phone number.";
    if (!/^\d{6}$/.test(pincode)) next.pincode = "Enter a valid 6-digit pincode.";
    if (!startDate) next.startDate = "Please pick a start date.";
    else if (startDate < minStartDate) next.startDate = "We need at least 1 week to schedule — pick a later date.";
    if (endDate && endDate < startDate) next.endDate = "End date can't be before the start date.";
    // combo preferences are required (but not final — the team confirms them)
    if (combos.length > 0 && preferredCombos.length === 0) {
      next.combos = "Pick at least one combo you'd like.";
    }
    if (Object.keys(next).length) {
      setErrors(next);
      if (next.combos) {
        document.getElementById("subComboSection")?.scrollIntoView({ behavior: "smooth", block: "center" });
      }
      return;
    }

    setErrors({});
    setSubmitError("");
    pendingRef.current = {
      contactName: contactName.trim(),
      phone: cleanPhone(),
      email: email.trim() || undefined,
      organisation: organisation.trim() || undefined,
      pincode,
      mealSlot: meal || undefined,
      boxType: box || undefined,
      totalMeals: totalMeals ? Number(totalMeals) : undefined,
      frequency: frequency || undefined,
      startDate: startDate || undefined,
      endDate: endDate || undefined,
      ongoing, // true when no end date — runs until cancelled; billing is weekly
      reusableCarrier,
      coBranded,
      preferredCombos: preferredCombos.length ? preferredCombos : undefined,
      notes: notes.trim() || undefined,
      discountPct: 0,
      idempotencyKey: keyRef.current,
    };

    setSubmitting(true);
    try {
      await sendOTP(cleanPhone());
      setShowOtp(true);
    } catch (err) {
      console.error("subscription OTP send failed", err);
      setSubmitError(err?.response?.data?.message || err?.message || "Couldn't send OTP. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  // Step 2 — verify the OTP, then create the subscription enquiry.
  const verifyAndSubmit = async (otp) => {
    if (verifying) return;
    setVerifying(true);
    setSubmitError("");
    try {
      await verifyOTP(cleanPhone(), otp);
      await createSubscription(pendingRef.current);
      setShowOtp(false);
      setDone(true);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err) {
      console.error("subscription verify/submit failed", err);
      setShowOtp(false);
      setSubmitError(err?.response?.data?.message || err?.message || "Verification failed. Please try again.");
    } finally {
      setVerifying(false);
    }
  };

  return (
    <Wrapper headerLeftType="back" headertext="Subscription" footer={false}>
      <div className="subPage">
        <header className="subPage__head">
          <div className="subPage__icon" aria-hidden="true">🗓️</div>
          <div>
            <h1 className="subPage__title">
              CaterBox Subscription <span className="subModal__badge">New</span>
            </h1>
            <p className="subPage__sub">
              Get the same box delivered on a regular schedule — tell us a few details and we'll send a tailored quote with bulk pricing.
            </p>
          </div>
        </header>

        {done ? (
          <div className="subPage__card subDone">
            <FaCheckCircle className="subDone__icon" aria-hidden="true" />
            <h4 className="subDone__title">Request received!</h4>
            <p className="subDone__text">
              Thanks{contactName ? `, ${contactName.split(" ")[0]}` : ""} — your request has been received.
              Our team will contact you shortly on{" "}
              <strong>+91 {cleanPhone()}</strong> for further verification.
            </p>
            <button type="button" className="subBtn subBtn--primary" onClick={() => navigate("/")}>Back to home</button>
          </div>
        ) : (
          <form className="subPage__form" onSubmit={requestOtp}>
            {/* Contact details */}
            <div className="subSection">
              <span className="subSection__title"><span className="subStep">1</span> Your details</span>
              <div className="subGrid">
                <div className="subField">
                  <label className="subField__label" htmlFor="subName">Name <span className="req">*</span></label>
                  <input id="subName" className={`subInput ${errors.contactName ? "is-err" : ""}`}
                    placeholder="Full name" value={contactName} onChange={(e) => setContactName(e.target.value)} />
                  {errors.contactName && <span className="subField__err">{errors.contactName}</span>}
                </div>
                <div className="subField">
                  <label className="subField__label" htmlFor="subPhone">Phone <span className="req">*</span></label>
                  <div className={`subPhone ${errors.phone ? "is-err" : ""}`}>
                    <span className="subPhone__prefix">+91</span>
                    <input id="subPhone" className="subInput subInput--phone" type="tel" inputMode="numeric"
                      maxLength={10} placeholder="10-digit mobile" value={phone}
                      onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))} />
                  </div>
                  {errors.phone && <span className="subField__err">{errors.phone}</span>}
                </div>
                <div className="subField">
                  <label className="subField__label" htmlFor="subEmail">Email <span className="subField__opt">(optional)</span></label>
                  <input id="subEmail" className="subInput" type="email"
                    placeholder="you@company.com" value={email} onChange={(e) => setEmail(e.target.value)} />
                </div>
                <div className="subField">
                  <label className="subField__label" htmlFor="subPin">Delivery pincode <span className="req">*</span></label>
                  <input id="subPin" className={`subInput ${errors.pincode ? "is-err" : ""}`} type="tel" inputMode="numeric"
                    maxLength={6} placeholder="560001" value={pincode}
                    onChange={(e) => setPincode(e.target.value.replace(/\D/g, "").slice(0, 6))} />
                  {errors.pincode && <span className="subField__err">{errors.pincode}</span>}
                  {pinCheck?.checking && <span className="subField__hint">Checking serviceability…</span>}
                  {pinCheck && !pinCheck.checking && !pinCheck.notConfigured && (
                    pinCheck.serviceable
                      ? <span className="subPin__ok">✓ We deliver to {pinCheck.area}</span>
                      : <span className="subPin__no">We don't deliver here yet — our team will confirm options.</span>
                  )}
                </div>
                <div className="subField">
                  <label className="subField__label" htmlFor="subOrg">Organisation <span className="subField__opt">(optional)</span></label>
                  <input id="subOrg" className="subInput"
                    placeholder="Company / office name" value={organisation} onChange={(e) => setOrganisation(e.target.value)} />
                </div>
              </div>
            </div>

            {/* Plan shape */}
            <div className="subSection">
              <span className="subSection__title"><span className="subStep">2</span> Your plan</span>

              <div className="subField">
                <span className="subField__label">Meal</span>
                <div className="subChips" role="radiogroup" aria-label="Meal">
                  {MEALS.map((m) => (
                    <button type="button" key={m} aria-pressed={meal === m}
                      className={`subChip__btn ${meal === m ? "is-active" : ""}`}
                      onClick={() => setMeal(m)}>{m}</button>
                  ))}
                </div>
              </div>

              {reusableCarrier ? (
                /* carriers don't use the disposable-box visuals — just pick how many items */
                <div className="subField">
                  <span className="subField__label">Carrier size</span>
                  <div className="subChips" role="radiogroup" aria-label="Carrier size">
                    {BOXES.map((b) => (
                      <button type="button" key={b} aria-pressed={box === b}
                        className={`subChip__btn ${box === b ? "is-active" : ""}`}
                        onClick={() => setBox(b)}>{b} items</button>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="subField">
                  <span className="subField__label">Box size</span>
                  <div className="subBoxes" role="radiogroup" aria-label="Box size">
                    {BOXES.map((b) => {
                      const active = box === b;
                      return (
                        <button type="button" key={b} aria-pressed={active}
                          className={`subBox ${active ? "is-active" : ""}`}
                          onClick={() => setBox(b)}>
                          <span className="subBox__media">
                            {coBranded ? (
                              <img src={COBRAND_IMG[b]} alt="" className="subBox__img" />
                            ) : (
                              <BoxLayoutIcon size={b} className="subBox__img" />
                            )}
                          </span>
                          <span className="subBox__label">{b}-item box</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              <div className="subField">
                <PackagingOptions
                  value={coBranded ? "cobrand" : reusableCarrier ? "carrier" : "plain"}
                  onChange={(v) => { setReusableCarrier(v === "carrier"); setCoBranded(v === "cobrand"); }}
                  boxType={box}
                />
              </div>
            </div>

            {/* Preferred combos — required, but not final (team confirms) */}
            <div className="subSection" id="subComboSection">
              <span className="subSection__title"><span className="subStep">3</span> Combos you'd like <span className="req">*</span></span>
              <p className="subCombos__hint">
                Pick the boxes you'd like. This isn't final — our CaterKart team will confirm with you,
                then rotate through your favourites across deliveries.
                {reusableCarrier && carrierOff > 0 && <strong> ₹{carrierOff} off each with reusable carriers.</strong>}
                {coBranded && <strong> +₹{CO_BRAND_PRICE}/box for customized packaging.</strong>}
              </p>
              {combosLoading ? (
                <div className="subCombos__state">Loading combos…</div>
              ) : combos.length === 0 ? (
                <div className="subCombos__state">No combos to show for {meal || "this meal"}{box ? ` · ${box}-item box` : ""} yet. You can continue and we'll suggest options.</div>
              ) : (
                <div className="subCombos">
                  {combos.map((c) => {
                    const name = c.name || "Combo";
                    const active = preferredCombos.includes(name);
                    const dishes = comboDishNames(c);
                    const extras = [...(c.commonItems || []), ...((c.addOns || []).map((a) => a?.name).filter(Boolean))];
                    return (
                      <button type="button" key={c._id || name}
                        className={`subCombo ${active ? "is-active" : ""}`} aria-pressed={active}
                        onClick={() => toggleCombo(name)}>
                        <span className="subCombo__check" aria-hidden="true" />
                        <span className="subCombo__body">
                          <span className="subCombo__top">
                            <span className="subCombo__name">{name}</span>
                            {c.price ? (
                              reusableCarrier && carrierOff > 0 ? (
                                <span className="subCombo__price">
                                  <s className="subCombo__was">₹{c.price}</s> ₹{Math.max(0, c.price - carrierOff)}
                                </span>
                              ) : coBranded ? (
                                <span className="subCombo__price">₹{c.price + CO_BRAND_PRICE}</span>
                              ) : (
                                <span className="subCombo__price">₹{c.price}</span>
                              )
                            ) : null}
                          </span>
                          <span className="subCombo__meta">
                            {[c.boxType ? `${c.boxType}-item box` : "", c.mealSlot, c.vendor]
                              .filter(Boolean).join(" · ")}
                          </span>
                          {dishes.length > 0 && (
                            <span className="subCombo__items">
                              {dishes.slice(0, 5).join(", ")}{dishes.length > 5 ? ` +${dishes.length - 5} more` : ""}
                            </span>
                          )}
                          {extras.length > 0 && (
                            <span className="subCombo__extras">Includes: {extras.slice(0, 4).join(", ")}</span>
                          )}
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}
              {preferredCombos.length > 0 && <span className="subCombos__count">{preferredCombos.length} selected</span>}
              {errors.combos && <span className="subField__err">{errors.combos}</span>}
            </div>

            {/* Quantity & schedule */}
            <div className="subSection">
              <span className="subSection__title"><span className="subStep">4</span> Quantity &amp; schedule</span>

              <div className="subField">
                <label className="subField__label" htmlFor="subTotal">Number of meals</label>
                <input id="subTotal" className="subInput" type="number" min="1" inputMode="numeric"
                  placeholder="e.g. 30" value={totalMeals} onChange={(e) => setTotalMeals(e.target.value)} />
                <span className="subField__hint">Meals per delivery</span>
              </div>

              <div className="subField">
                <span className="subField__label">Delivery frequency</span>
                <div className="subChips" role="radiogroup" aria-label="Frequency">
                  {FREQUENCIES.map((f) => (
                    <button type="button" key={f.id} aria-pressed={frequency === f.id}
                      className={`subChip__btn ${frequency === f.id ? "is-active" : ""}`}
                      onClick={() => setFrequency(f.id)}>{f.label}</button>
                  ))}
                </div>
              </div>

              <div className="subGrid">
                <div className="subField">
                  <label className="subField__label" htmlFor="subStart">Start date <span className="subField__req">*</span></label>
                  <div className={`subDate ${errors.startDate ? "is-err" : ""}`}>
                    <FaRegCalendarAlt className="subDate__icon" aria-hidden="true" />
                    <input id="subStart" className="subInput subInput--date" type="date"
                      min={minStartDate}
                      value={startDate} onChange={(e) => setStartDate(e.target.value)} />
                  </div>
                  {errors.startDate
                    ? <span className="subField__err">{errors.startDate}</span>
                    : <span className="subField__hint">Earliest is {fmtDate(minStartDate)} — we need ~1 week to schedule.</span>}
                </div>
                <div className="subField">
                  <label className="subField__label" htmlFor="subEnd">End date <span className="subField__opt">(optional)</span></label>
                  <div className={`subDate ${errors.endDate ? "is-err" : ""}`}>
                    <FaRegCalendarAlt className="subDate__icon" aria-hidden="true" />
                    <input id="subEnd" className="subInput subInput--date" type="date"
                      min={startDate || minStartDate}
                      value={endDate} onChange={(e) => setEndDate(e.target.value)} />
                  </div>
                  {errors.endDate
                    ? <span className="subField__err">{errors.endDate}</span>
                    : <span className="subField__hint">
                        {ongoing ? "Leave blank — runs until you cancel." : "Plan ends on this date."}
                      </span>}
                </div>
              </div>

              <p className="subModal__note">
                Billed weekly — one invoice per week.{" "}
                {ongoing ? "No end date: it continues until you cancel." : "Runs from the start until the end date you picked."}
              </p>
            </div>

            <div className="subField">
              <label className="subField__label" htmlFor="subNotes">Anything else? <span className="subField__opt">(optional)</span></label>
              <textarea id="subNotes" className="subInput subInput--area" rows={2}
                placeholder="Preferences, delivery window, dietary notes…"
                value={notes} onChange={(e) => setNotes(e.target.value)} />
            </div>

            {submitError && <div className="subModal__error" role="alert">{submitError}</div>}

            <p className="subModal__note">
              No payment now — we'll verify your number with an OTP, then review your request and get back with a tailored quote.
            </p>

            <div className="subPage__actions">
              <button type="button" className="subBtn subBtn--ghost" onClick={() => navigate(-1)}>Cancel</button>
              <button type="submit" className="subBtn subBtn--primary" disabled={submitting}>
                {submitting ? "Sending OTP…" : "Get quote"}
              </button>
            </div>
          </form>
        )}
      </div>

      <OTPModal
        showModal={showOtp}
        phone={cleanPhone()}
        loading={verifying}
        onClose={() => { if (!verifying) setShowOtp(false); }}
        onSubmit={verifyAndSubmit}
      />
    </Wrapper>
  );
}
