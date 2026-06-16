// src/pages/admin/OrdersPage.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Wrapper from "../../components/wrapper";
import { formatDateShort } from "../../utils/util";
import { fetchAllOrders } from '../../services/order';
import { fetchVendors } from '../../services/vendors';
import { commissionPctFor, splitOrderEconomics } from '../../services/pricing';
import { useAdminAuth, isVendor } from '../../components/adminAuth/context';
import SubscriptionsPanel from "./components/SubscriptionsPanel";
import "./styles.scss";

const STATUS_FILTERS = [
  { key: "all", label: "All" },
  { key: "new", label: "New" },
  { key: "confirmed", label: "Confirmed" },
  { key: "contacted", label: "Contacted" },
  { key: "advance paid", label: "Advance paid" },
  { key: "delivered", label: "Delivered" },
  { key: "cancelled", label: "Cancelled" },
];

// The monthly chart groups order statuses into three series (3 bars / month).
const STATUS_SERIES = [
  { key: "open", label: "New · Confirmed · Contacted" },
  { key: "completed", label: "Payment Done · Delivered" },
  { key: "cancelled", label: "Cancelled" },
];

const seriesForStatus = (status) => {
  const s = String(status || "new").toLowerCase().trim();
  if (s === "cancelled" || s === "canceled") return "cancelled";
  if (s === "delivered" || s.startsWith("payment")) return "completed";
  return "open"; // new, confirmed, contacted, in_progress, …
};

export default function OrdersPage() {
  const navigate = useNavigate();
  const { profile } = useAdminAuth();
  const vendorScope = isVendor(profile) ? (profile.vendorName || profile.name || '') : null;
  const [orders, setOrders] = useState([]);
  const [vendorsList, setVendorsList] = useState([]);
  const [statusFilter, setStatusFilter] = useState(vendorScope ? "delivered" : "all");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchOrders = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetchAllOrders();
      // API returns { data, page, limit, total }; tolerate legacy array shape.
      const list = Array.isArray(res) ? res : Array.isArray(res?.data) ? res.data : [];
      setOrders(list);
    } catch (err) {
      console.error("Failed fetching orders", err);
      setError(err?.response?.data?.message || err?.message || 'Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  // Vendors carry the per-product-line CaterKart commission %, needed to derive
  // each order's commission & vendor payout for the table columns.
  useEffect(() => {
    let alive = true;
    fetchVendors()
      .then((l) => { if (alive) setVendorsList(Array.isArray(l) ? l : []); })
      .catch(() => {});
    return () => { alive = false; };
  }, []);

  const onRefresh = () => fetchOrders();

  const openOrder = (orderId) => {
    navigate(`/admin/orders/${orderId}`);
  };

  const filtered = useMemo(() => {
    // Map/sort the list by date (prefer top-level date/createdDate, then inner order.date)
    let list = (orders || []).slice().sort((a, b) => {
      const aDate = new Date(a.date || a.createdDate || a.order?.date || 0).getTime();
      const bDate = new Date(b.date || b.createdDate || b.order?.date || 0).getTime();
      return bDate - aDate;
    });

    // vendors only ever see their own delivered orders
    if (vendorScope) {
      const needle = vendorScope.toLowerCase();
      list = list.filter((o) => {
        const status = o.status || o.order?.status || "new";
        if (status !== "delivered") return false;
        const vendorMatch =
          (o.vendor || o.vendorName || o.order?.vendor || "").toLowerCase() === needle ||
          JSON.stringify(o).toLowerCase().includes(needle);
        return vendorMatch;
      });
      return list;
    }

    if (statusFilter !== "all") {
      return list.filter((o) => {
        const status = o.status || o.order?.status || "new";
        return status === statusFilter;
      });
    }
    return list;
  }, [orders, statusFilter, vendorScope]);

  // Date the order was received/created (audit trail).
  const getReceivedDate = (o) => {
    const d = o.createdAt || o.createdDate || o.date;
    return d ? formatDateShort(d) : "-";
  };

  // Event / delivery date with time of delivery.
  const getEventDateTime = (o) => {
    const raw = o.order?.date || o.date;
    if (!raw) return "-";
    const d = new Date(raw);
    if (Number.isNaN(d.getTime())) return "-";
    const hasTime = d.getHours() !== 0 || d.getMinutes() !== 0;
    const time = hasTime ? d.toLocaleTimeString("en-IN", { hour: "numeric", minute: "2-digit", hour12: true }) : "";
    return { date: formatDateShort(raw), time };
  };

  const getEventType = (o) => {
    return (o.order?.eventType || o.eventType || "-").toString();
  };

  // Meal slot: breakfast / lunch / dinner / snacks (from the diet config).
  const getMealSlot = (o) => {
    const dc = o.order?.dietConfig || o.dietConfig || {};
    const slot = dc.mealSlot || o.order?.mealSlot || o.mealSlot;
    return slot ? String(slot) : "-";
  };

  const getVendor = (o) => {
    const v = o.vendor || o.vendorName || o.order?.vendor || o.order?.vendorName;
    return v ? v.toString() : "-";
  };

  const getPriceNumeric = (o) => {
    // single source of truth for the order total; 0 when unknown.
    const priceObj = o.price || o.order?.price;
    if (!priceObj) return 0;
    const n = (priceObj._numeric && typeof priceObj._numeric.finalPrice === "number")
      ? priceObj._numeric.finalPrice
      : (typeof priceObj.finalPrice === "string" ? Number(priceObj.finalPrice.replace(/[^0-9.-]/g, "")) : NaN);
    return Number.isFinite(n) ? n : 0;
  };

  const formatINR = (n) => `₹${(n || 0).toLocaleString("en-IN", { maximumFractionDigits: 0 })}`;

  // Ex-GST food net for an order (mirrors the order-details bill): per item use the
  // negotiated discountedPrice when present, else unit price × quantity.
  const getFoodNet = (o) => {
    const inner = o.order || o;
    const priceObj = o.price || inner?.price || {};
    const numeric = priceObj._numeric || {};
    const menu = Array.isArray(inner?.menu_sections) ? inner.menu_sections : [];
    const gross = menu.reduce((acc, m) => {
      const qty = Number(m.quantity || 0);
      const unit = (m.unitPrice != null) ? Number(m.unitPrice) : (m.price && qty ? Number(m.price) / qty : 0);
      const line = (m.discountedPrice != null) ? Number(m.discountedPrice) : unit * qty;
      return acc + (Number.isFinite(line) ? line : 0);
    }, 0);
    // Subtract discounts that reduce what the customer pays but aren't reflected
    // in the per-item prices: the reusable-carrier saving and the admin's
    // negotiated discount. Keeps the commission base aligned with the real total.
    const carrierDiscount = Number(numeric.carrierDiscount || 0);
    const adminDiscount = Number(inner?.adminDiscount || 0);
    return Math.max(0, Math.round(gross - carrierDiscount - adminDiscount));
  };

  // Canonical economics for an order: CaterKart cut vs vendor payout, split by
  // the vendor's commission % across both the food value and the food GST.
  const getEconomics = (o) => {
    const inner = o.order || o;
    const vendorName = o.vendor || o.vendorName || inner?.vendor || inner?.vendorName || "";
    const vendorObj = (vendorsList || []).find((v) => v?.name === vendorName);
    const pct = commissionPctFor(vendorObj, inner?.mealType);
    return splitOrderEconomics(getFoodNet(o), pct);
  };

  // CaterKart commission revenue (ex GST). Its 18% GST is shown in the GST column.
  const getCommission = (o) => getEconomics(o).commission;

  // Combined GST CaterKart remits = food GST (5%) + commission GST (18%).
  const getGst = (o) => getEconomics(o).govtGst;

  // Vendor net payout = food value − commission − commission GST.
  // Reconciles as: Total = Commission + GST + Payout.
  const getPayout = (o) => getEconomics(o).payout;

  const getPriceDisplay = (o) => {
    const priceObj = o.price || o.order?.price;
    if (!priceObj) return "-";
    let n = (priceObj._numeric && typeof priceObj._numeric.finalPrice === "number")
      ? priceObj._numeric.finalPrice
      : (typeof priceObj.finalPrice === "string" ? Number(priceObj.finalPrice.replace(/[^0-9.-]/g, "")) : NaN);
    if (!Number.isFinite(n)) return "-";
    return formatINR(n);
  };

  // Group the (already date-sorted) list into month buckets, newest month first,
  // tallying order count + total amount per month for the accordion headers.
  const monthGroups = useMemo(() => {
    const groups = [];
    const index = new Map();
    for (const o of filtered) {
      const raw = o.date || o.createdDate || o.order?.date;
      const d = raw ? new Date(raw) : null;
      const valid = d && !Number.isNaN(d.getTime());
      const key = valid ? `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}` : "undated";
      const label = valid ? d.toLocaleDateString("en-IN", { month: "long", year: "numeric" }) : "Undated";
      let g = index.get(key);
      if (!g) {
        g = { key, label, orders: [], total: 0 };
        index.set(key, g);
        groups.push(g);
      }
      g.orders.push(o);
      g.total += getPriceNumeric(o);
    }
    return groups;
  }, [filtered]);

  // Orders per calendar month, split into three status series (open / completed
  // / cancelled). Capped to the most recent ~12 months of activity. This always
  // reflects every order and deliberately ignores the status-pill filter so the
  // chart stays a stable overview; vendor scoping still applies.
  const monthlyStats = useMemo(() => {
    const source = vendorScope ? filtered : (orders || []);
    const monthIndex = (d) => d.getFullYear() * 12 + d.getMonth(); // ordinal month
    const empty = () => ({ open: 0, completed: 0, cancelled: 0 });

    const buckets = new Map();
    let minM = null;
    let maxM = null;
    for (const o of source) {
      const raw = o.date || o.createdDate || o.order?.date;
      const d = raw ? new Date(raw) : null;
      if (!d || Number.isNaN(d.getTime())) continue;
      const m = monthIndex(d);
      const b = buckets.get(m) || empty();
      b[seriesForStatus(o.status || o.order?.status)] += 1;
      buckets.set(m, b);
      if (minM === null || m < minM) minM = m;
      if (maxM === null || m > maxM) maxM = m;
    }
    if (maxM === null) return { months: [], maxCount: 0, sumCount: 0 };

    const span = maxM - minM + 1;
    const n = Math.min(12, Math.max(1, span));

    const months = [];
    for (let i = n - 1; i >= 0; i--) {
      const m = maxM - i;
      const b = buckets.get(m) || empty();
      const date = new Date(Math.floor(m / 12), m % 12, 1);
      months.push({
        key: m,
        label: date.toLocaleDateString("en-IN", { month: "short", year: "2-digit" }),
        open: b.open,
        completed: b.completed,
        cancelled: b.cancelled,
      });
    }

    let maxCount = 1;
    let sumCount = 0;
    for (const mo of months) {
      maxCount = Math.max(maxCount, mo.open, mo.completed, mo.cancelled);
      sumCount += mo.open + mo.completed + mo.cancelled;
    }

    return { months, maxCount, sumCount };
  }, [orders, filtered, vendorScope]);

  return (
    <Wrapper headerLeftType="home" headertext="Orders" footer={false}>
      <div className="admin-orders-page">
        <header className="ao-header">
          <h1 className="ao-title">{vendorScope ? 'My Delivered Orders' : 'Orders'}</h1>
          <div className="ao-header-right">
            <span className="ao-count">
              {filtered.length} order{filtered.length === 1 ? "" : "s"}
            </span>
            <button className="ao-refresh" onClick={onRefresh} disabled={loading}>
              {loading ? "Refreshing…" : "↻ Refresh"}
            </button>
          </div>
        </header>

        {!vendorScope && (
          <div className="ao-filters" role="tablist" aria-label="Filter by status">
            {STATUS_FILTERS.map((s) => (
              <button
                key={s.key}
                type="button"
                role="tab"
                aria-selected={statusFilter === s.key}
                className={`ao-pill ${statusFilter === s.key ? "is-active" : ""}`}
                onClick={() => setStatusFilter(s.key)}
              >
                {s.label}
              </button>
            ))}
          </div>
        )}

        {error && <div className="ao-error">Error: {error}</div>}

        {!loading && monthlyStats.months.length > 0 && (
          <section className="ao-charts" aria-label="Monthly summary">
            <div className="ao-chart">
              <div className="ao-chart-head">
                <span className="ao-chart-title">Orders / month</span>
                <div className="ao-legend">
                  {STATUS_SERIES.map((s) => (
                    <span key={s.key} className="ao-legend-item">
                      <i className={`ao-legend-dot ao-legend-dot--${s.key}`} aria-hidden="true" />
                      {s.label}
                    </span>
                  ))}
                </div>
              </div>
              <div className="ao-bars ao-bars--grouped">
                {monthlyStats.months.map((m) => (
                  <div key={m.key} className="ao-bar-col">
                    <div className="ao-bar-cluster">
                      {STATUS_SERIES.map((s) => (
                        <div
                          key={s.key}
                          className="ao-bar-slot"
                          title={`${m.label} · ${s.label}: ${m[s.key]} order${m[s.key] === 1 ? "" : "s"}`}
                        >
                          <div
                            className={`ao-bar-fill ao-bar-fill--${s.key}`}
                            style={{ height: `${m[s.key] ? Math.max(4, (m[s.key] / monthlyStats.maxCount) * 100) : 0}%` }}
                          >
                            {m[s.key] > 0 && <span className="ao-bar-count">{m[s.key]}</span>}
                          </div>
                        </div>
                      ))}
                    </div>
                    <span className="ao-bar-label">{m.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {!vendorScope && <SubscriptionsPanel />}

        {loading ? (
          <div className="ao-state">Loading orders…</div>
        ) : filtered.length === 0 ? (
          <div className="ao-state">No orders found.</div>
        ) : (
          <div className="ao-groups">
            {monthGroups.map((g) => (
              <details key={g.key} className="ao-group" open>
                <summary className="ao-group-head">
                  <span className="ao-group-month">
                    <span className="ao-chevron" aria-hidden="true">▾</span>
                    {g.label}
                  </span>
                  <span className="ao-group-meta">
                    <span className="ao-count">
                      {g.orders.length} order{g.orders.length === 1 ? "" : "s"}
                    </span>
                    <span className="ao-group-total">{formatINR(g.total)}</span>
                  </span>
                </summary>

                <div className="ao-table-wrap">
                  <table className="ao-table">
                    <colgroup>
                      {vendorScope ? (
                        <>
                          <col style={{ width: "13%" }} />
                          <col style={{ width: "13%" }} />
                          <col style={{ width: "22%" }} />
                          <col style={{ width: "12%" }} />
                          <col style={{ width: "15%" }} />
                          <col style={{ width: "13%" }} />
                          <col style={{ width: "12%" }} />
                        </>
                      ) : (
                        <>
                          <col style={{ width: "9%" }} />
                          <col style={{ width: "9%" }} />
                          <col style={{ width: "15%" }} />
                          <col style={{ width: "8%" }} />
                          <col style={{ width: "11%" }} />
                          <col style={{ width: "11%" }} />
                          <col style={{ width: "9%" }} />
                          <col style={{ width: "9%" }} />
                          <col style={{ width: "10%" }} />
                          <col style={{ width: "9%" }} />
                        </>
                      )}
                    </colgroup>
                    <thead>
                      <tr>
                        <th>Received</th>
                        <th>Event date</th>
                        <th>Type</th>
                        <th>Meal</th>
                        {!vendorScope && <th>Vendor</th>}
                        <th className="right">Total</th>
                        {!vendorScope && <th className="right">Commission</th>}
                        {!vendorScope && <th className="right">GST</th>}
                        <th className="right">Payout</th>
                        <th className="right">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {g.orders.map((o, idx) => {
                        const id = o._id || (o.order && o.order.orderNumber);
                        const key = id || `${g.key}-row-${idx}`;
                        const status = o.status || o.order?.status || "new";
                        return (
                          <tr key={key} onClick={() => openOrder(id)} tabIndex={0}
                            onKeyDown={(e) => { if (e.key === "Enter") openOrder(id); }}>
                            <td>{getReceivedDate(o)}</td>
                            <td className="ao-event-dt">
                              {(() => {
                                const ev = getEventDateTime(o);
                                if (typeof ev === "string") return ev;
                                return (
                                  <>
                                    <span className="ao-event-dt__date">{ev.date}</span>
                                    {ev.time && <span className="ao-event-dt__time">{ev.time}</span>}
                                  </>
                                );
                              })()}
                            </td>
                            <td className="capitalize">{getEventType(o)}</td>
                            <td className="capitalize ao-meal">{getMealSlot(o)}</td>
                            {!vendorScope && <td className="ao-vendor">{getVendor(o)}</td>}
                            <td className="right strong">{getPriceDisplay(o)}</td>
                            {!vendorScope && <td className="right ao-commission">{formatINR(getCommission(o))}</td>}
                            {!vendorScope && <td className="right ao-gst">{formatINR(getGst(o))}</td>}
                            <td className="right ao-payout">{formatINR(getPayout(o))}</td>
                            <td className="right">
                              <span className={`ao-status ${status}`}>{status}</span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </details>
            ))}
          </div>
        )}
      </div>
    </Wrapper>
  );
}
