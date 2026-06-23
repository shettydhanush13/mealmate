import { useState } from "react";
import Seo from "../../components/seo";
import { FaPhoneAlt } from "react-icons/fa";
import Wrapper from "../../components/wrapper";
import { sendOTP, verifyOTP } from "../../services/otp";
import { fetchOrdersByPhone, assignOrderInvoice } from "../../services/order";
import { formatDateShort } from "../../utils/util";
import { liveCounterOptions, calculateLiveCounterPrice } from "../../data/services/celebrationsData";
import { GST_RATE, PLATFORM_FEE, DELIVERY_FEE } from "../../services/pricing";
import { fetchPublicVendor } from "../../services/vendors";
import { buildOrderInvoice } from "../../services/invoice";
import { printInvoice } from "../../services/invoicePrint";
import { payForOrder } from "../../services/payments";
import "./styles.scss";

const GST_FRACTION = GST_RATE / 100; // stored totals are GST-inclusive
const MANAGER_PHONE = "+917204242111"; // TODO: per-manager number once available
const prettyPhone = (p) => p.replace(/^(\+91)(\d{5})(\d{5})$/, "$1 $2 $3");

const num = (v) => {
  const n = Number(String(v ?? "").replace(/[^0-9.-]/g, ""));
  return Number.isFinite(n) ? n : 0;
};
const inr = (n) => `₹${Number(n || 0).toLocaleString("en-IN", { maximumFractionDigits: 0 })}`;

const inner = (o) => o.order || o;

// CaterBox has no event type — resolve the packaging label from whatever the
// order persisted: the explicit flag, the "Customized packaging" add-on line,
// the stored packaging-type eventType, or the carrier flag.
const packagingOf = (o) => {
  const oi = inner(o);
  const menu = oi.menu_sections || [];
  const firstItem = menu[0] || {};
  const evt = String(oi.eventType || o.eventType || "");
  const hasCobrandLine = menu.some((m) => /custom+ ?(branded|packaging)|customized packaging/i.test(String(m.name || "")));
  if (oi.coBranded || firstItem.coBranded || hasCobrandLine || /custom/i.test(evt)) return "Customized packaging";
  if (oi.reusableCarrier || firstItem.reusableCarrier || /carrier/i.test(evt)) return "Reusable carriers";
  return "Standard packaging";
};
// Meal slot (breakfast / lunch / dinner / snacks) from the diet config.
const mealSlotOf = (o) => {
  const oi = inner(o);
  const dc = oi.dietConfig || {};
  const slot = dc.mealSlot || oi.mealSlot || o.mealSlot;
  return slot ? String(slot) : "";
};
const eventOf = (o) => {
  const oi = inner(o);
  if (String(oi.mealType || "").toLowerCase() === "caterbox") return packagingOf(o);
  return (oi.eventType || o.eventType || "Order").toString();
};
const dateOf = (o) => {
  const d = o.date || o.createdDate || inner(o).date;
  return d ? formatDateShort(d) : "—";
};
// Delivery date + time (e.g. "Jun-15 · 1:30 PM"); time omitted if unavailable.
const deliveryDateTimeOf = (o) => {
  const raw = inner(o).date || o.date || o.createdDate;
  if (!raw) return "—";
  const d = new Date(raw);
  if (isNaN(d.getTime())) return "—";
  const hasTime = d.getHours() !== 0 || d.getMinutes() !== 0;
  const time = hasTime ? d.toLocaleTimeString("en-IN", { hour: "numeric", minute: "2-digit", hour12: true }) : "";
  return [formatDateShort(raw), time].filter(Boolean).join(" · ");
};
const statusOf = (o) => o.status || inner(o).status || "new";
const orderNoOf = (o) => inner(o).orderNumber || o._id;
const totalOf = (o) => {
  const p = inner(o).price || o.price || {};
  return (p._numeric && typeof p._numeric.finalPrice === "number") ? p._numeric.finalPrice : num(p.finalPrice);
};
const paidOf = (o) => {
  const oi = inner(o);
  if (o?.paidAmount != null) return num(o.paidAmount);
  if (oi.paidAmount != null) return num(oi.paidAmount);
  return statusOf(o) === "payment done" ? totalOf(o) : 0;
};
const guestsText = (o) => {
  const d = inner(o).dietConfig || {};
  if (d.dietMode === "veg+nonveg") {
    const veg = Number(d.vegGuests || 0);
    const nv = Number(d.nonVegGuests || 0);
    return `${veg} veg · ${nv} non-veg (${veg + nv} total)`;
  }
  const p = inner(o).people ?? o.people;
  return p != null ? `${p} guests` : "—";
};
const lineOf = (m) => {
  const qty = Number(m.quantity || 0);
  const unit = (m.unitPrice != null) ? Number(m.unitPrice) : (m.price && qty ? Number(m.price) / qty : 0);
  return (m.discountedPrice != null) ? Number(m.discountedPrice) : unit * qty;
};
const grossOf = (m) => {
  const qty = Number(m.quantity || 0);
  const unit = (m.unitPrice != null) ? Number(m.unitPrice) : (m.price && qty ? Number(m.price) / qty : 0);
  return unit * qty;
};

const findLiveCounterDef = (title) =>
  liveCounterOptions.find((o) => String(o.title || "").toLowerCase() === String(title || "").toLowerCase());
const choiceUnitPrice = (def, key) => {
  const c = (def?.recommendedChoices || []).find((rc) => rc.key === key);
  return c ? Math.round(Number(c.unitPrice || 0) * 0.95) : 0;
};
const servicePriceOf = (s) => {
  const def = findLiveCounterDef(s?.title);
  if (def) {
    const ei = s?.extraInfo || {};
    return calculateLiveCounterPrice(def, ei, ei.hours ?? def.baseHours, ei.staff ?? def.baseStaff);
  }
  return s?.price != null ? num(s.price) : 0;
};

// Sub-options of a service: live-counter choices (priced) + any explicit options.
const subOptionsOf = (s) => {
  const ei = s.extraInfo || {};
  const out = [];
  const def = findLiveCounterDef(s.title);
  if (ei.choices && typeof ei.choices === "object") {
    Object.entries(ei.choices).forEach(([k, v]) => {
      const unit = def ? choiceUnitPrice(def, k) : 0;
      const label = def?.recommendedChoices?.find((c) => c.key === k)?.label || k;
      out.push({ label: `${label} ×${v}`, price: unit > 0 ? unit * Number(v) : null });
    });
  }
  [s.subOptions, s.options, ei.subOptions, ei.options].filter(Array.isArray).forEach((arr) =>
    arr.forEach((it) => {
      if (typeof it === "string") out.push({ label: it, price: null });
      else if (it && typeof it === "object") out.push({ label: it.title || it.name || it.label || "Option", price: it.price != null ? num(it.price) : null });
    })
  );
  [ei.subOption, ei.option].forEach((v) => { if (typeof v === "string" && v) out.push({ label: v, price: null }); });
  if (ei.note) out.push({ label: ei.note, price: null });
  return out;
};

// Bill breakdown derived from the (authoritative) stored total, GST-inclusive.
const billOf = (o) => {
  const oi = inner(o);
  const total = totalOf(o);
  const menu = oi.menu_sections || [];
  const itemDiscount = Math.max(0, Math.round(
    menu.reduce((a, m) => a + grossOf(m), 0) - menu.reduce((a, m) => a + lineOf(m), 0)
  ));
  const taxable = Math.round(total / (1 + GST_FRACTION));
  const gst = Math.max(0, total - taxable);
  return { total, itemDiscount, taxable, gst, platformFee: PLATFORM_FEE, delivery: DELIVERY_FEE };
};

// Build a proper GST tax invoice (vendor = supplier of record) and open the
// browser print/Save-as-PDF dialog. Pulls the vendor's public profile (FSSAI,
// address, GSTIN where available) so the supplier block is accurate.
async function downloadInvoice(o) {
  const oi = inner(o);
  // Allocate the canonical sequential invoice number from the server (idempotent).
  let invoiceNo = oi.invoiceNo;
  if (!invoiceNo && oi._id) {
    try { invoiceNo = (await assignOrderInvoice(oi._id))?.invoiceNo; } catch { /* fall back to derived no. */ }
  }
  let vendorProfile = {};
  if (oi.vendor) {
    try { vendorProfile = await fetchPublicVendor(oi.vendor) || {}; } catch { /* fall back to name only */ }
  }
  const model = buildOrderInvoice(o, { advancePaid: paidOf(o), vendorProfile, invoiceNo });
  printInvoice(model);
}

export default function TrackOrder() {
  const [step, setStep] = useState("phone"); // "phone" | "otp" | "orders"
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [orders, setOrders] = useState([]);
  const [expanded, setExpanded] = useState(null);
  const [payingId, setPayingId] = useState(null);

  // re-fetch the caller's orders (used after a successful payment)
  const refreshOrders = async () => {
    try {
      const list = await fetchOrdersByPhone(phone.trim());
      setOrders(Array.isArray(list) ? list : (list?.data || []));
    } catch { /* keep current list on failure */ }
  };

  // open Razorpay Checkout for the outstanding balance, verify, then refresh
  const handlePay = async (o) => {
    const id = o?._id;
    if (!id) return;
    setPayingId(id); setError("");
    try {
      await payForOrder(id, "balance");
      await refreshOrders();
    } catch (err) {
      if (err?.message !== "__dismissed__") {
        setError(err?.response?.data?.message || err?.message || "Payment failed. Please try again.");
      }
    } finally {
      setPayingId(null);
    }
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!/^\d{10}$/.test(phone.trim())) { setError("Enter a valid 10-digit phone number."); return; }
    setError(""); setBusy(true);
    try {
      await sendOTP(phone.trim());
      setOtp(""); setStep("otp");
    } catch (err) {
      setError(err?.response?.data?.message || "Couldn't send the OTP. Please try again.");
    } finally {
      setBusy(false);
    }
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    if (otp.trim().length < 4) { setError("Enter the code we sent you."); return; }
    setError(""); setBusy(true);
    try {
      const res = await verifyOTP(phone.trim(), otp.trim());
      const status = res?.status ?? res;
      if (status !== "approved") { setError("Incorrect or expired code. Please try again."); return; }
      const list = await fetchOrdersByPhone(phone.trim());
      const arr = Array.isArray(list) ? list : (list?.data || []);
      setOrders(arr);
      setExpanded(arr.length === 1 ? (orderNoOf(arr[0]) || 0) : null);
      setStep("orders");
    } catch (err) {
      setError(err?.response?.data?.message || "Verification failed. Please try again.");
    } finally {
      setBusy(false);
    }
  };

  const reset = () => { setStep("phone"); setOtp(""); setOrders([]); setError(""); setExpanded(null); };

  return (
    <Wrapper headerLeftType="home" headertext="Track your order" footer={false}>
      <Seo
        title="Track Your Order"
        description="Track your CaterKart catering orders — verify your phone number to view order status, menu and payment details."
        path="/track-order"
        noindex
      />

      <div className="track-order">
        {step === "phone" && (
          <form className="to-card" onSubmit={handleSend}>
            <h1 className="to-title">Track your order</h1>
            <p className="to-sub">Enter the phone number you used to place the order. We'll send a one-time code to verify it.</p>
            <label className="to-label">
              Phone number
              <div className="to-phone">
                <span className="to-cc">+91</span>
                <input type="tel" inputMode="numeric" autoComplete="tel" maxLength={10}
                  value={phone} onChange={(e) => setPhone(e.target.value.replace(/\D/g, ""))}
                  placeholder="10-digit number" autoFocus />
              </div>
            </label>
            {error && <div className="to-error">{error}</div>}
            <button type="submit" className="to-btn" disabled={busy}>{busy ? "Sending…" : "Send OTP"}</button>
          </form>
        )}

        {step === "otp" && (
          <form className="to-card" onSubmit={handleVerify}>
            <h1 className="to-title">Verify your number</h1>
            <p className="to-sub">Enter the code sent to <strong>+91 {phone}</strong>.</p>
            <label className="to-label">
              One-time password
              <input className="to-otp" type="text" inputMode="numeric" maxLength={6}
                value={otp} onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                placeholder="••••" autoFocus />
            </label>
            {error && <div className="to-error">{error}</div>}
            <button type="submit" className="to-btn" disabled={busy}>{busy ? "Verifying…" : "Verify & view orders"}</button>
            <button type="button" className="to-link" onClick={reset}>Change number</button>
          </form>
        )}

        {step === "orders" && (
          <div className="to-orders">
            <div className="to-orders__head">
              <div>
                <h1 className="to-title">Your orders</h1>
                <p className="to-sub">Showing orders for +91 {phone}</p>
              </div>
              <button type="button" className="to-link" onClick={reset}>Use another number</button>
            </div>

            {orders.length === 0 ? (
              <div className="to-empty">No orders found for this number.</div>
            ) : (
              <div className="to-list">
                {orders.map((o, i) => {
                  const key = orderNoOf(o) || i;
                  const open = expanded === key;
                  const oi = inner(o);
                  const total = totalOf(o);
                  const paid = paidOf(o);
                  const pending = Math.max(0, total - paid);
                  const isPaid = total > 0 && pending === 0;
                  const bill = billOf(o);
                  const menu = oi.menu_sections || [];
                  const services = oi.services || [];
                  const cust = oi.customerData || oi.customer || {};
                  const manager = oi.manager || o.manager;
                  const status = statusOf(o);

                  return (
                    <div className={`to-order ${open ? "is-open" : ""}`} key={key}>
                      <button className="to-order__head" onClick={() => setExpanded(open ? null : key)} aria-expanded={open}>
                        <div className="to-order__head-main">
                          <span className="to-order__event">
                            {eventOf(o)}
                            {mealSlotOf(o) && <span className="to-order__meal">{mealSlotOf(o)}</span>}
                          </span>
                          <span className="to-order__sub">
                            {[cust.name, (cust.area || oi.serviceArea)].filter(Boolean).join(" · ") || `#${orderNoOf(o)}`}
                          </span>
                          <span className="to-order__sub to-order__when">🕒 {deliveryDateTimeOf(o)}</span>
                        </div>
                        <div className="to-order__head-right">
                          <span className={`to-status ${status}`}>{status}</span>
                          <span className="to-order__total">{inr(total)}</span>
                        </div>
                        <span className="to-order__chev" aria-hidden>⌄</span>
                      </button>

                      {open && (
                        <div className="to-order__body">
                          <div className="to-sec">
                            <div className="to-sec__title">Event</div>
                            <div className="to-kv"><span>Date</span><span>{dateOf(o)}</span></div>
                            <div className="to-kv"><span>Guests</span><span>{guestsText(o)}</span></div>
                            {(cust.address || cust.area) && (
                              <div className="to-kv"><span>Venue</span><span>{[cust.address, cust.area].filter(Boolean).join(", ")}</span></div>
                            )}
                          </div>

                          <div className="to-sec">
                            <div className="to-sec__title">Menu</div>
                            {menu.length === 0 ? <div className="to-muted">No food items</div> : menu.map((m, idx) => (
                              <div className="to-line" key={idx}>
                                <span className="to-line__name">{m.name} <em>×{Number(m.quantity || 0)}</em></span>
                                <span className="to-line__amt">{inr(lineOf(m))}</span>
                              </div>
                            ))}
                          </div>

                          {services.length > 0 && (
                            <div className="to-sec">
                              <div className="to-sec__title">Services &amp; live counters</div>
                              {services.map((s, idx) => {
                                const sp = servicePriceOf(s);
                                const subs = subOptionsOf(s);
                                return (
                                  <div className="to-svc" key={idx}>
                                    <div className="to-svc__head">
                                      <span className="to-svc__name">{s.title}{s.extraInfo?.plates ? ` · ${s.extraInfo.plates} plates` : ""}</span>
                                      {sp > 0 && <span className="to-svc__price">{inr(sp)}</span>}
                                    </div>
                                    {s.description && <div className="to-muted to-svc__desc">{s.description}</div>}
                                    {subs.length > 0 && (
                                      <ul className="to-subs">
                                        {subs.map((su, j) => (
                                          <li className="to-subs__row" key={j}>
                                            <span className="to-subs__label">{su.label}</span>
                                            {su.price != null && <span className="to-subs__price">{inr(su.price)}</span>}
                                          </li>
                                        ))}
                                      </ul>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          )}

                          {manager && (
                            <div className="to-sec">
                              <div className="to-sec__title">Your event manager</div>
                              <div className="to-manager">
                                <div className="to-manager__avatar">{String(manager).charAt(0).toUpperCase()}</div>
                                <div className="to-manager__info">
                                  <div className="to-manager__name">{String(manager)}</div>
                                  <div className="to-muted">CaterKart event manager · {prettyPhone(MANAGER_PHONE)}</div>
                                </div>
                                <a className="to-call" href={`tel:${MANAGER_PHONE}`} aria-label={`Call ${manager}`}>
                                  <FaPhoneAlt /> Call
                                </a>
                              </div>
                            </div>
                          )}

                          <div className="to-sec to-bill">
                            <div className="to-sec__title">Bill details</div>
                            {bill.itemDiscount > 0 && (
                              <div className="to-kv"><span>Item-level discounts</span><span className="to-paid">−{inr(bill.itemDiscount)}</span></div>
                            )}
                            <div className="to-kv"><span>Subtotal (excl. GST)</span><span>{inr(bill.taxable)}</span></div>
                            <div className="to-kv"><span>Platform fee</span><span>{inr(bill.platformFee)}</span></div>
                            <div className="to-kv"><span>Delivery</span><span>{bill.delivery > 0 ? inr(bill.delivery) : "Free"}</span></div>
                            <div className="to-kv"><span>GST ({GST_RATE}%)</span><span>{inr(bill.gst)}</span></div>
                            <div className="to-kv to-bill__total"><span>Total payable</span><strong>{inr(total)}</strong></div>
                          </div>

                          <div className="to-sec to-pay">
                            <div className="to-kv"><span>Paid</span><span className="to-paid">{inr(paid)}</span></div>
                            <div className="to-kv"><span>Balance due</span><span className={pending > 0 ? "to-pending" : ""}>{inr(pending)}</span></div>
                            <div className="to-pay__foot">
                              {isPaid
                                ? <span className="to-tag to-tag--paid">✓ Paid in full</span>
                                : <span className="to-tag to-tag--due">Payment pending</span>}
                              {!isPaid && pending > 0 && (
                                <button
                                  className="to-pay-btn"
                                  disabled={payingId === o._id}
                                  onClick={() => handlePay(o)}
                                >
                                  {payingId === o._id ? "Opening…" : `Pay ${inr(pending)}`}
                                </button>
                              )}
                              {isPaid && (
                                <button className="to-invoice" onClick={() => downloadInvoice(o)}>⤓ Download invoice</button>
                              )}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </Wrapper>
  );
}
