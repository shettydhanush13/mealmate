// src/pages/admin/OrdersPage.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Wrapper from "../../components/wrapper";
import { formatDateShort } from "../../utils/util";
import { fetchAllOrders } from '../../services/order';
import { useAdminAuth, isVendor } from '../../components/adminAuth/context';
import "./styles.scss";

const STATUS_FILTERS = [
  { key: "all", label: "All" },
  { key: "new", label: "New" },
  { key: "confirmed", label: "Confirmed" },
  { key: "contacted", label: "Contacted" },
  { key: "delivered", label: "Delivered" },
  { key: "cancelled", label: "Cancelled" },
];

export default function OrdersPage() {
  const navigate = useNavigate();
  const { profile } = useAdminAuth();
  const vendorScope = isVendor(profile) ? (profile.vendorName || profile.name || '') : null;
  const [orders, setOrders] = useState([]);
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

  const getDisplayDate = (o) => {
    // prefer top-level date -> createdDate -> inner order.date
    const d = o.date || o.createdDate || o.order?.date;
    return d ? formatDateShort(d) : "-";
  };

  const getEventType = (o) => {
    return (o.order?.eventType || o.eventType || "-").toString();
  };

  const getPriceDisplay = (o) => {
    // prefer top-level price then inner order.price
    const priceObj = o.price || o.order?.price;
    if (!priceObj) return "-";
    // prefer the numeric final price; fall back to parsing the formatted string,
    // then render consistently (matches the order details page).
    let n = (priceObj._numeric && typeof priceObj._numeric.finalPrice === "number")
      ? priceObj._numeric.finalPrice
      : (typeof priceObj.finalPrice === "string" ? Number(priceObj.finalPrice.replace(/[^0-9.-]/g, "")) : NaN);
    if (!Number.isFinite(n)) return "-";
    return `₹${n.toLocaleString("en-IN", { maximumFractionDigits: 0 })}`;
  };

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

        {loading ? (
          <div className="ao-state">Loading orders…</div>
        ) : filtered.length === 0 ? (
          <div className="ao-state">No orders found.</div>
        ) : (
          <div className="ao-table-wrap">
            <table className="ao-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Event type</th>
                  <th className="right">Total</th>
                  <th className="right">Status</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((o, idx) => {
                  const id = o._id || (o.order && o.order.orderNumber);
                  const key = id || `row-${idx}`;
                  const status = o.status || o.order?.status || "new";
                  return (
                    <tr key={key} onClick={() => openOrder(id)} tabIndex={0}
                      onKeyDown={(e) => { if (e.key === "Enter") openOrder(id); }}>
                      <td>{getDisplayDate(o)}</td>
                      <td className="capitalize">{getEventType(o)}</td>
                      <td className="right strong">{getPriceDisplay(o)}</td>
                      <td className="right">
                        <span className={`ao-status ${status}`}>{status}</span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </Wrapper>
  );
}
