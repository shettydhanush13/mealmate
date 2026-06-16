// src/pages/activeSubscription/index.jsx
// Operational view for a CONFIRMED subscription: mark daily deliveries, plan
// next week's combos, and generate/send the weekly invoice + payment link.
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { FaArrowLeft, FaCheck, FaRegCalendarAlt, FaBoxOpen, FaUserFriends, FaTimes, FaDownload, FaPaperPlane, FaPen, FaStore } from "react-icons/fa";
import Wrapper from "../../components/wrapper";
import {
  fetchSubscriptionById,
  updateSubscription,
  assignSubscriptionWeekInvoice,
} from "../../services/subscriptions";
import { fetchCombos } from "../../services/combos";
import { fetchVendors } from "../../services/vendors";
import { createDirectPaymentLink } from "../../services/payments";
import { carrierSavingPerBox, CO_BRAND_PRICE, GST_RATE, COMMISSION_GST_RATE, gstOn, commissionPctFor, splitOrderEconomics } from "../../services/pricing";
import { buildSubscriptionWeekInvoice } from "../../services/invoice";
import { printInvoice } from "../../services/invoicePrint";
import PackagingOptions from "../../components/packagingOptions";
import "../create-menu/components/SubscriptionModal.scss"; // shared .sub* field styles
import "../subscriptionDetails/styles.scss";               // reuse sd* card styles
import "./styles.scss";

const MEALS = ["Breakfast", "Lunch/Dinner", "Snacks"];
const BOXES = [3, 5, 8];
const FREQS = [
  { id: "daily", label: "Daily" },
  { id: "weekdays", label: "Weekdays" },
  { id: "custom", label: "Custom" },
];
const inr = (n) => `₹${Number(n || 0).toLocaleString("en-IN", { maximumFractionDigits: 0 })}`;
const pad2 = (n) => String(n).padStart(2, "0");
const toDayStr = (d) => `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
const fmtDay = (s) => {
  try { return new Date(`${s}T00:00:00`).toLocaleDateString("en-IN", { day: "2-digit", month: "short" }); }
  catch { return s; }
};
// Monday-start week containing a yyyy-mm-dd date (invoiced together).
const weekRangeOf = (dateStr) => {
  const d = new Date(`${dateStr}T00:00:00`);
  const dow = (d.getDay() + 6) % 7;
  const start = new Date(d); start.setDate(d.getDate() - dow);
  const end = new Date(start); end.setDate(start.getDate() + 6);
  return { key: toDayStr(start), start: toDayStr(start), end: toDayStr(end) };
};
const choiceItemsOf = (c) => (Array.isArray(c?.items) ? c.items : []).filter((it) => it?.kind === "choice");
// per-box price after the chosen options + paid add-ons (before carrier/co-brand).
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

export default function ActiveSubscriptionPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [sub, setSub] = useState(null);
  const [combos, setCombos] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [newDelivery, setNewDelivery] = useState({ date: toDayStr(new Date()), combo: "", people: "" });
  const [editForm, setEditForm] = useState(null); // null = closed; object = edit-plan modal open
  const [editSaving, setEditSaving] = useState(false);
  const [linkBusy, setLinkBusy] = useState(""); // weekKey currently generating a payment link

  useEffect(() => {
    let alive = true;
    setLoading(true);
    fetchSubscriptionById(id)
      .then((s) => {
        if (!alive) return;
        setSub(s);
        return fetchCombos({ mealSlot: s?.mealSlot, boxType: s?.boxType });
      })
      .then((list) => { if (alive) setCombos(Array.isArray(list) ? list : []); })
      .catch((e) => { if (alive) setError(e?.response?.data?.message || "Failed to load subscription"); })
      .finally(() => { if (alive) setLoading(false); });
    fetchVendors().then((l) => { if (alive) setVendors(Array.isArray(l) ? l : []); }).catch(() => {});
    return () => { alive = false; };
  }, [id]);

  const vendorByName = useMemo(() => {
    const m = new Map();
    (vendors || []).forEach((v) => { if (v?.name) m.set(v.name, v); });
    return m;
  }, [vendors]);

  // memoised so the `|| []` fallback doesn't create a fresh array each render
  // (which would re-fire every useMemo that depends on it)
  const preferredCombos = useMemo(() => sub?.preferredCombos || [], [sub]);
  const deliveries = sub?.deliveries || [];
  const people = Number(sub?.totalMeals) || 0;

  // map of combo customisation from the saved plan
  const comboCustom = useMemo(() => {
    const m = {};
    (sub?.comboPlan || []).forEach((x) => { if (x?.name) m[x.name] = { choices: x.choices || {}, addOns: x.addOns || [] }; });
    return m;
  }, [sub]);

  // combos shown in the edit modal — filtered by the (modal) meal + box size,
  // always keeping already-picked ones so a selection is never hidden.
  const editCombos = useMemo(() => {
    if (!editForm) return [];
    const wantMeal = String(editForm.mealSlot || "").trim();
    const wantBox = editForm.boxType != null ? Number(editForm.boxType) : null;
    const picked = new Set(editForm.preferredCombos || []);
    return combos.filter((c) => {
      const name = c.name || "Combo";
      if (picked.has(name)) return true;
      const slots = [c.mealSlot, ...(Array.isArray(c.mealSlots) ? c.mealSlots : [])]
        .map((s) => String(s || "").trim()).filter(Boolean);
      const mealOk = !wantMeal || slots.length === 0 || slots.includes(wantMeal);
      const boxOk = wantBox == null || c.boxType == null || Number(c.boxType) === wantBox;
      return mealOk && boxOk;
    });
  }, [combos, editForm]);

  const comboUnit = (comboName) => {
    const c = combos.find((x) => (x.name || "Combo") === comboName);
    const base = customizedPrice(c, comboCustom[comboName] || { choices: {}, addOns: [] });
    const carrierOff = sub?.reusableCarrier ? carrierSavingPerBox(sub.boxType) : 0;
    const coBrandAdd = sub?.coBranded ? CO_BRAND_PRICE : 0;
    return Math.max(0, base - carrierOff) + coBrandAdd;
  };

  // vendor(s) serving this plan — derived from the preferred combos
  const subVendors = useMemo(() => {
    const set = new Set();
    (preferredCombos || []).forEach((name) => {
      const c = combos.find((x) => (x.name || "Combo") === name);
      if (c?.vendor) set.add(c.vendor);
    });
    return [...set];
  }, [preferredCombos, combos]);

  const deliveryWeeks = useMemo(() => {
    const map = new Map();
    deliveries.forEach((d, idx) => {
      if (!d?.date) return;
      const wk = weekRangeOf(d.date);
      if (!map.has(wk.key)) map.set(wk.key, { ...wk, items: [] });
      map.get(wk.key).items.push({ ...d, idx });
    });
    const pct = Number(sub?.discountPct) || 0; // negotiated discount on this plan
    return [...map.values()]
      .sort((a, b) => (a.key < b.key ? 1 : -1))
      .map((w) => {
        const lines = w.items.map((d) => ({
          name: `${d.combo} · ${fmtDay(d.date)}`,
          qty: d.people,
          amount: comboUnit(d.combo) * (Number(d.people) || 0),
        }));
        const taxable = lines.reduce((s, l) => s + l.amount, 0);

        // per-line payout split (commission varies by the combo's vendor)
        let commission = 0, commissionGst = 0, payout = 0;
        const vendorSet = new Set();
        w.items.forEach((d) => {
          const amt = comboUnit(d.combo) * (Number(d.people) || 0);
          const c = combos.find((x) => (x.name || "Combo") === d.combo);
          if (c?.vendor) vendorSet.add(c.vendor);
          const vPct = commissionPctFor(vendorByName.get(c?.vendor), "caterbox");
          const e = splitOrderEconomics(amt, vPct);
          commission += e.commission; commissionGst += e.commissionGst; payout += e.payout;
        });
        const vendors = [...vendorSet];

        // customer invoice (negotiated discount absorbed by CaterKart's margin)
        const discount = Math.round((taxable * pct) / 100);
        const netFood = Math.max(0, taxable - discount);
        const gst = gstOn(netFood);
        const total = netFood + gst;
        const ckNet = commission - discount;             // platform margin after concession
        const govtGst = gst + commissionGst;             // total GST CaterKart remits

        return {
          ...w, lines, taxable, pct, discount, netFood, gst, total, vendors,
          commission, commissionGst, commissionTotal: commission + commissionGst,
          payout, ckNet, govtGst,
        };
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [deliveries, combos, comboCustom, sub, vendorByName]);

  // patch a few fields on the subscription and keep local state in sync
  const patch = async (fields) => {
    setSub((s) => ({ ...s, ...fields }));
    try { await updateSubscription(id, fields); } catch (e) { setError("Couldn't save — try again."); }
  };

  // per-week vendor payout settlement (status + method), stored on sub.payouts
  const payouts = sub?.payouts || {};
  const setPayout = (key, fields) => patch({
    payouts: { ...(sub?.payouts || {}), [key]: { ...(sub?.payouts?.[key] || {}), ...fields } },
  });

  // per-week customer payment links (Razorpay), stored on sub.weekPayments
  const weekPayments = sub?.weekPayments || {};
  const setWeekPayment = (key, fields) => patch({
    weekPayments: { ...(sub?.weekPayments || {}), [key]: { ...(sub?.weekPayments?.[key] || {}), ...fields } },
  });

  const addDelivery = () => {
    const date = newDelivery.date || toDayStr(new Date());
    const combo = newDelivery.combo || preferredCombos[0] || "";
    const ppl = Number(newDelivery.people) || people || 0;
    if (!combo) return;
    patch({ deliveries: [...deliveries, { date, combo, people: ppl, delivered: true, deliveredAt: new Date().toISOString() }] });
    setNewDelivery({ date: toDayStr(new Date()), combo: "", people: "" });
  };
  const removeDelivery = (idx) => patch({ deliveries: deliveries.filter((_, i) => i !== idx) });

  // open the plan-details edit modal, seeded from the current subscription
  const openEdit = () => setEditForm({
    contactName: sub.contactName || "",
    phone: sub.phone || "",
    email: sub.email || "",
    organisation: sub.organisation || "",
    pincode: sub.pincode || "",
    mealSlot: sub.mealSlot || "",
    boxType: sub.boxType || null,
    frequency: ["daily", "weekdays", "custom"].includes(sub.frequency) ? sub.frequency : "custom",
    totalMeals: sub.totalMeals ?? "",
    packaging: sub.coBranded ? "cobrand" : sub.reusableCarrier ? "carrier" : "plain",
    preferredCombos: [...(sub.preferredCombos || [])],
  });
  const setEdit = (k, v) => setEditForm((f) => ({ ...f, [k]: v }));
  const toggleEditCombo = (name) => setEditForm((f) => ({
    ...f,
    preferredCombos: f.preferredCombos.includes(name)
      ? f.preferredCombos.filter((n) => n !== name)
      : [...f.preferredCombos, name],
  }));

  const saveEdit = async () => {
    if (!editForm || editSaving) return;
    setEditSaving(true);
    try {
      await patch({
        contactName: editForm.contactName.trim(),
        phone: String(editForm.phone).replace(/\D/g, "").slice(-10),
        email: editForm.email.trim(),
        organisation: editForm.organisation.trim(),
        pincode: String(editForm.pincode).replace(/\D/g, "").slice(0, 6),
        mealSlot: editForm.mealSlot,
        boxType: editForm.boxType ? Number(editForm.boxType) : null,
        frequency: editForm.frequency,
        totalMeals: editForm.totalMeals === "" ? null : Number(editForm.totalMeals),
        coBranded: editForm.packaging === "cobrand",
        reusableCarrier: editForm.packaging === "carrier",
        preferredCombos: editForm.preferredCombos,
      });
      setEditForm(null);
    } finally {
      setEditSaving(false);
    }
  };

  const downloadWeekInvoice = async (w) => {
    const vendorName = combos.find((c) => preferredCombos.includes(c.name))?.vendor || "";
    const vendorProfile = vendorByName.get(vendorName) || {};
    let invoiceNo;
    try { invoiceNo = (await assignSubscriptionWeekInvoice(id, w.key))?.invoiceNo; } catch { /* derived fallback */ }
    printInvoice(buildSubscriptionWeekInvoice(
      sub,
      { number: w.key, from: w.start, to: w.end, taxableTotal: w.taxable, lines: w.lines },
      { vendorName, vendorProfile, invoiceNo },
    ));
  };

  // create a hosted Razorpay payment link for the week's total; Razorpay notifies
  // the customer over SMS/email, and we also share it over WhatsApp.
  const sendPaymentLink = async (w) => {
    if (linkBusy) return;
    setLinkBusy(w.key);
    setError("");
    try {
      const { url } = await createDirectPaymentLink({
        amount: w.total,
        name: sub?.contactName || "Customer",
        phone: sub?.phone || "",
        email: sub?.email || "",
        description: `CaterKart weekly invoice ${fmtDay(w.start)}–${fmtDay(w.end)}`,
        notes: { subscriptionId: id, week: w.key },
      });
      await setWeekPayment(w.key, { linkUrl: url, amount: w.total, sentAt: new Date().toISOString() });
      const digits = String(sub?.phone || "").replace(/\D/g, "");
      const wphone = digits.length === 10 ? `91${digits}` : digits;
      const msg = encodeURIComponent(
        `Hi ${sub?.contactName || ""}, your CaterKart weekly invoice (${fmtDay(w.start)}–${fmtDay(w.end)}) is ₹${w.total} incl. GST for ${w.items.length} ${w.items.length === 1 ? "delivery" : "deliveries"}. Please complete your payment here: ${url}`
      );
      window.open(`https://wa.me/${wphone}?text=${msg}`, "_blank");
    } catch (e) {
      setError(e?.response?.data?.message || "Couldn't create the payment link. Check Razorpay keys & try again.");
    } finally {
      setLinkBusy("");
    }
  };

  if (loading) return <Wrapper headertext="Active subscription" footer={false}><div className="subDetail"><div className="subDetail__state">Loading…</div></div></Wrapper>;
  if (error && !sub) return <Wrapper headertext="Active subscription" footer={false}><div className="subDetail"><div className="subDetail__state subDetail__state--err">{error}</div></div></Wrapper>;
  if (!sub) return null;

  const packaging = sub.coBranded ? "Customized packaging" : sub.reusableCarrier ? "Reusable carriers" : "Standard packaging";
  const isActive = sub.status === "confirmed";

  return (
    <Wrapper headertext="Active subscription" footer={false}>
      <div className="subDetail asPage">
        <button type="button" className="subDetail__back" onClick={() => navigate(`/admin/subscriptions/${id}`)}>
          <FaArrowLeft /> Back to subscription
        </button>

        {!isActive && (
          <div className="subDetail__state subDetail__state--err">
            This subscription isn't active yet. Mark it <strong>Confirmed</strong> on the details page to start deliveries.
          </div>
        )}

        {error && sub && (
          <div className="subDetail__state subDetail__state--err" role="alert">
            {error}
            <button type="button" className="subDetail__errClose" onClick={() => setError("")} aria-label="Dismiss"><FaTimes aria-hidden="true" /></button>
          </div>
        )}

        {/* plan summary */}
        <section className="sdCard asHero">
          <div className="asHero__top">
            <div>
              <h2 className="asHero__name">{sub.contactName || "Customer"}</h2>
              <div className="asHero__meta">{[sub.organisation, sub.pincode].filter(Boolean).join(" · ")}</div>
            </div>
            <button type="button" className="asHero__edit" onClick={openEdit}>
              <FaPen aria-hidden="true" /> Edit
            </button>
          </div>
          <div className="asChips">
            {sub.mealSlot && <span className="asChip">{sub.mealSlot}</span>}
            {sub.boxType && <span className="asChip">{sub.boxType}-item box</span>}
            <span className="asChip">{sub.frequency || "custom"}</span>
            <span className="asChip">{people} meals/delivery</span>
            <span className="asChip asChip--accent">{packaging}</span>
            {subVendors.length > 0 && (
              <span className="asChip asChip--vendor"><FaStore aria-hidden="true" /> {subVendors.join(", ")}</span>
            )}
          </div>
        </section>

        {/* mark deliveries */}
        <section className="sdCard">
          <h3 className="sdCard__title">Mark deliveries</h3>
          <p className="sdCard__note">Mark the combo handed out each day. Deliveries are grouped into weeks (Mon–Sun) for billing.</p>
          <div className="sdDeliver">
            <div className="sdDeliver__fields">
              <label className="sdDeliver__field">
                <span className="sdDeliver__label"><FaRegCalendarAlt aria-hidden="true" /> Date</span>
                <input className="subInput" type="date" min={sub.startDate || undefined}
                  value={newDelivery.date} onChange={(e) => setNewDelivery((d) => ({ ...d, date: e.target.value }))} />
              </label>
              <label className="sdDeliver__field sdDeliver__field--grow">
                <span className="sdDeliver__label"><FaBoxOpen aria-hidden="true" /> Combo</span>
                <select className="subSelect" value={newDelivery.combo}
                  onChange={(e) => setNewDelivery((d) => ({ ...d, combo: e.target.value }))}>
                  <option value="">{preferredCombos[0] ? `${preferredCombos[0]} (default)` : "Choose a combo…"}</option>
                  {preferredCombos.map((n) => <option key={n} value={n}>{n}</option>)}
                </select>
              </label>
              <label className="sdDeliver__field sdDeliver__field--sm">
                <span className="sdDeliver__label"><FaUserFriends aria-hidden="true" /> People</span>
                <input className="subInput" type="number" min="1" inputMode="numeric"
                  placeholder={String(people || "")} value={newDelivery.people}
                  onChange={(e) => setNewDelivery((d) => ({ ...d, people: e.target.value }))} />
              </label>
            </div>
            <button type="button" className="sdDeliver__add" onClick={addDelivery}>
              <FaCheck aria-hidden="true" /> Mark delivered
            </button>
          </div>
        </section>

        {/* weekly billing */}
        <section className="sdCard">
          <h3 className="sdCard__title">Weekly invoices &amp; payments</h3>
          <p className="sdCard__note">Each week (Mon–Sun) is billed separately. Customer invoice, vendor payout and CaterKart margin are broken down below.</p>
          {deliveryWeeks.length === 0 ? (
            <div className="sdEmpty">No deliveries marked yet.</div>
          ) : deliveryWeeks.map((w) => {
            const po = payouts[w.key] || {};
            const method = po.method || "bank";
            return (
              <div className="sdWeek" key={w.key}>
                <div className="sdWeek__head">
                  <span className="sdWeek__range">{fmtDay(w.start)} – {fmtDay(w.end)}</span>
                  <span className="sdWeek__total">{inr(w.total)} <em>incl. GST</em></span>
                </div>
                <ul className="sdWeek__list">
                  {w.items.map((d) => (
                    <li className="sdWeek__row" key={d.idx}>
                      <span className="sdWeek__name">{d.combo} · {fmtDay(d.date)} · {d.people} ppl</span>
                      <span className="sdWeek__amt">{inr(comboUnit(d.combo) * (Number(d.people) || 0))}</span>
                      <button type="button" className="sdWeek__rm" onClick={() => removeDelivery(d.idx)} aria-label="Remove delivery"><FaTimes aria-hidden="true" /></button>
                    </li>
                  ))}
                </ul>

                {/* in-depth payment breakdown */}
                <div className="sdBreak">
                  <div className="sdBreak__col">
                    <span className="sdBreak__head">Customer invoice</span>
                    <div className="sdBreak__row"><span>Food subtotal</span><span>{inr(w.taxable)}</span></div>
                    {w.discount > 0 && (
                      <div className="sdBreak__row sdBreak__row--off"><span>Negotiated discount ({w.pct}%)</span><span>− {inr(w.discount)}</span></div>
                    )}
                    <div className="sdBreak__row"><span>Platform fee</span><span>{inr(0)}</span></div>
                    <div className="sdBreak__row"><span>Delivery</span><span>Free</span></div>
                    <div className="sdBreak__row"><span>GST ({GST_RATE}%)</span><span>{inr(w.gst)}</span></div>
                    <div className="sdBreak__row sdBreak__row--total"><span>Total payable</span><span>{inr(w.total)}</span></div>
                  </div>
                  <div className="sdBreak__col">
                    <span className="sdBreak__head">Payout &amp; settlement</span>
                    <div className="sdBreak__row"><span>Vendor payout</span><span>{inr(w.payout)}</span></div>
                    <div className="sdBreak__row sdBreak__row--muted"><span>CaterKart commission</span><span>{inr(w.commission)}</span></div>
                    <div className="sdBreak__row sdBreak__row--muted"><span>Commission GST ({COMMISSION_GST_RATE}%)</span><span>{inr(w.commissionGst)}</span></div>
                    {w.discount > 0 && (
                      <div className="sdBreak__row sdBreak__row--off"><span>Discount absorbed</span><span>− {inr(w.discount)}</span></div>
                    )}
                    <div className="sdBreak__row sdBreak__row--total"><span>CaterKart net margin</span><span>{inr(w.ckNet)}</span></div>
                    <div className="sdBreak__row sdBreak__row--muted"><span>GST remitted to govt</span><span>{inr(w.govtGst)}</span></div>
                  </div>
                </div>

                {/* payout options */}
                <div className="sdPayout">
                  <div className="sdPayout__left">
                    <span className="sdPayout__label">
                      Pay {w.vendors.length === 1 ? w.vendors[0] : w.vendors.length > 1 ? "vendors" : "vendor"} {inr(w.payout)} via
                    </span>
                    <select className="subSelect sdPayout__method" value={method}
                      onChange={(e) => setPayout(w.key, { method: e.target.value })}>
                      <option value="bank">Bank transfer</option>
                      <option value="upi">UPI</option>
                      <option value="cash">Cash</option>
                    </select>
                  </div>
                  {po.paid ? (
                    <button type="button" className="sdPayout__done" onClick={() => setPayout(w.key, { paid: false, paidAt: null })}>
                      <FaCheck aria-hidden="true" /> Vendor paid{po.paidAt ? ` · ${fmtDay(po.paidAt.slice(0, 10))}` : ""}
                    </button>
                  ) : (
                    <button type="button" className="sdPayout__mark" onClick={() => setPayout(w.key, { paid: true, paidAt: new Date().toISOString(), amount: w.payout })}>
                      Mark vendor paid
                    </button>
                  )}
                </div>

                <div className="sdWeek__actions">
                  <button type="button" className="sdInvoiceBtn" onClick={() => downloadWeekInvoice(w)}><FaDownload aria-hidden="true" /> Weekly invoice</button>
                  <button type="button" className="sdInvoiceBtn sdInvoiceBtn--pay" onClick={() => sendPaymentLink(w)} disabled={linkBusy === w.key}>
                    <FaPaperPlane aria-hidden="true" /> {linkBusy === w.key ? "Creating link…" : weekPayments[w.key]?.linkUrl ? "Resend payment link" : "Send payment link"}
                  </button>
                </div>
                {weekPayments[w.key]?.linkUrl && (
                  <a className="sdWeek__link" href={weekPayments[w.key].linkUrl} target="_blank" rel="noreferrer">
                    Payment link active — open ↗
                  </a>
                )}
              </div>
            );
          })}
        </section>
      </div>

      {editForm && (
        <div className="subOverlay" onClick={() => !editSaving && setEditForm(null)}>
          <div className="subModal asEdit" onClick={(e) => e.stopPropagation()}>
            <div className="subModal__head">
              <span className="subModal__icon"><FaPen aria-hidden="true" /></span>
              <div className="subModal__heading">
                <h3 className="subModal__title">Edit plan details</h3>
                <p className="subModal__sub">Update the customer &amp; plan basics. Changes save to this subscription.</p>
              </div>
              <button type="button" className="subModal__close" aria-label="Close" onClick={() => setEditForm(null)}>
                <FaTimes aria-hidden="true" />
              </button>
            </div>

            <div className="subModal__body asEdit__body">
              <div className="subGrid">
                <div className="subField">
                  <label className="subField__label" htmlFor="aeName">Contact name</label>
                  <input id="aeName" className="subInput" type="text"
                    value={editForm.contactName} onChange={(e) => setEdit("contactName", e.target.value)} />
                </div>
                <div className="subField">
                  <label className="subField__label" htmlFor="aeOrg">Organisation <span className="subField__opt">(optional)</span></label>
                  <input id="aeOrg" className="subInput" type="text"
                    value={editForm.organisation} onChange={(e) => setEdit("organisation", e.target.value)} />
                </div>
              </div>

              <div className="subGrid">
                <div className="subField">
                  <label className="subField__label" htmlFor="aePhone">Phone</label>
                  <input id="aePhone" className="subInput" type="tel" inputMode="numeric" maxLength={10}
                    value={editForm.phone} onChange={(e) => setEdit("phone", e.target.value.replace(/\D/g, "").slice(0, 10))} />
                </div>
                <div className="subField">
                  <label className="subField__label" htmlFor="aeEmail">Email <span className="subField__opt">(optional)</span></label>
                  <input id="aeEmail" className="subInput" type="email"
                    value={editForm.email} onChange={(e) => setEdit("email", e.target.value)} />
                </div>
              </div>

              <div className="subGrid">
                <div className="subField">
                  <label className="subField__label" htmlFor="aePin">Pincode</label>
                  <input id="aePin" className="subInput" type="tel" inputMode="numeric" maxLength={6}
                    value={editForm.pincode} onChange={(e) => setEdit("pincode", e.target.value.replace(/\D/g, "").slice(0, 6))} />
                </div>
                <div className="subField">
                  <label className="subField__label" htmlFor="aeMeals">Number of meals / delivery</label>
                  <input id="aeMeals" className="subInput" type="number" min="1" inputMode="numeric"
                    value={editForm.totalMeals} onChange={(e) => setEdit("totalMeals", e.target.value)} />
                </div>
              </div>

              <div className="subField">
                <span className="subField__label">Meal</span>
                <div className="subChips">
                  {MEALS.map((m) => (
                    <button type="button" key={m} className={`subChip__btn ${editForm.mealSlot === m ? "is-active" : ""}`}
                      onClick={() => setEdit("mealSlot", m)}>{m}</button>
                  ))}
                </div>
              </div>

              <div className="subField">
                <span className="subField__label">Box / carrier size</span>
                <div className="subChips">
                  {BOXES.map((b) => (
                    <button type="button" key={b} className={`subChip__btn ${editForm.boxType === b ? "is-active" : ""}`}
                      onClick={() => setEdit("boxType", b)}>{b} items</button>
                  ))}
                </div>
              </div>

              <div className="subField">
                <span className="subField__label">Frequency</span>
                <div className="subChips">
                  {FREQS.map((f) => (
                    <button type="button" key={f.id} className={`subChip__btn ${editForm.frequency === f.id ? "is-active" : ""}`}
                      onClick={() => setEdit("frequency", f.id)}>{f.label}</button>
                  ))}
                </div>
              </div>

              <div className="subField">
                <span className="subField__label">Packaging</span>
                <PackagingOptions
                  value={editForm.packaging}
                  onChange={(v) => setEdit("packaging", v)}
                  boxType={editForm.boxType}
                />
              </div>

              <div className="subField">
                <span className="subField__label">
                  Preference list <span className="subField__opt">({editForm.preferredCombos.length} selected)</span>
                </span>
                <p className="subField__hint">Combos this customer can be served. Filtered by the meal &amp; box size above.</p>
                {editCombos.length === 0 ? (
                  <div className="sdEmpty">
                    No combos available for {editForm.mealSlot || "this meal"}{editForm.boxType ? ` · ${editForm.boxType}-item box` : ""}.
                  </div>
                ) : (
                  <div className="asChoose">
                    {editCombos.map((c) => {
                      const name = c.name || "Combo";
                      const on = editForm.preferredCombos.includes(name);
                      return (
                        <button type="button" key={c._id || name} className={`asPick ${on ? "is-on" : ""}`} aria-pressed={on}
                          onClick={() => toggleEditCombo(name)}>
                          <span className="asPick__check" aria-hidden="true" />
                          <span className="asPick__name">{name}</span>
                          <span className="asPick__price">{inr(comboUnit(name))}/box</span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            <div className="subModal__actions">
              <button type="button" className="subBtn subBtn--ghost" onClick={() => setEditForm(null)} disabled={editSaving}>Cancel</button>
              <button type="button" className="subBtn subBtn--primary" onClick={saveEdit} disabled={editSaving}>
                <FaCheck aria-hidden="true" /> {editSaving ? "Saving…" : "Save changes"}
              </button>
            </div>
          </div>
        </div>
      )}
    </Wrapper>
  );
}
