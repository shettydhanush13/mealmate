// src/pages/admin/OrdersPage.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Wrapper from "../../components/wrapper";
import { formatDateShort } from "../../utils/util";
import { fetchAllOrders } from '../../services/order';
import "./styles.scss";

export default function OrdersPage() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [statusFilter, setStatusFilter] = useState("all");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchOrders = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetchAllOrders();
      setOrders(res);
    } catch (err) {
      console.error("Failed fetching orders", err);
      setError(String(err));
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
    const list = (orders || []).slice().sort((a, b) => {
      const aDate = new Date(a.date || a.createdDate || a.order?.date || 0).getTime();
      const bDate = new Date(b.date || b.createdDate || b.order?.date || 0).getTime();
      return bDate - aDate;
    });

    if (statusFilter !== "all") {
      return list.filter((o) => {
        const status = o.status || o.order?.status || "new";
        return status === statusFilter;
      });
    }
    return list;
  }, [orders, statusFilter]);

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
    // try common properties: finalPrice (string) or _numeric.finalPrice
    if (typeof priceObj.finalPrice === "string" && priceObj.finalPrice.trim()) return priceObj.finalPrice;
    if (priceObj._numeric && typeof priceObj._numeric.finalPrice === "number") return `₹${priceObj._numeric.finalPrice.toLocaleString()}`;
    return "-";
  };

  return (
    <Wrapper headerLeftType="home" headertext="Orders" footer={false}>
      <div className="admin-orders-page">
        <div className="topbar">
          <div className="controls">
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="input">
              <option value="all">All statuses</option>
              <option value="new">New</option>
              <option value="confirmed">Confirmed</option>
              <option value="contacted">Contacted</option>
              <option value="cancelled">Cancelled</option>
              <option value="delivered">Delivered</option>
            </select>
            <button className="btn" onClick={onRefresh} disabled={loading}>
              {loading ? "Refreshing..." : "Refresh"}
            </button>
            {error && <div className="error">Error: {error}</div>}
          </div>
        </div>

        <div className="tableWrap">
          <table className="ordersTable">
            <thead>
              <tr>
                <th>Date</th>
                <th>Event type</th>
                <th>Total (₹)</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((o) => {
                const key = o._id || (o.order && o.order.orderNumber) || Math.random();
                const status = (o.status || o.order?.status || "new");
                return (
                  <tr onClick={() => openOrder(o._id || (o.order && o.order.orderNumber))} key={key}>
                    <td>{getDisplayDate(o)}</td>
                    <td style={{ textTransform: "capitalize" }}>{getEventType(o)}</td>
                    <td className="mono">{getPriceDisplay(o)}</td>
                    <td><span className={`statusBadge ${status}`}>{status}</span></td>
                  </tr>
                );
              })}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan="4" className="empty">No orders found</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </Wrapper>
  );
}
