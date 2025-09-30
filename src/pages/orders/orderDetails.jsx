// src/pages/admin/OrderDetailsPage.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Wrapper from "../../components/wrapper";
import "./styles.scss";

const ORDERS_KEY = "admin_orders_data_v1";

const readOrders = () => {
  try {
    const raw = localStorage.getItem(ORDERS_KEY);
    if (raw) {
        console.log(JSON.parse(raw))
        return JSON.parse(raw);
    } 
  }
  catch (e) {}
  return [];
};
const persistOrders = (s) => { try { localStorage.setItem(ORDERS_KEY, JSON.stringify(s)); } catch (e) {} };

/**
 * Helpers to normalize menu sections and services
 */
function parseMenuEntry(entry) {
  // Accept either object {id,name,quantity,price,...} or string "Name : qty"
  if (!entry && entry !== 0) return null;
  if (typeof entry === "string") {
    const parts = entry.split(":").map((p) => p.trim());
    const name = parts[0] || entry;
    const quantity = parts[1] ? Number(parts[1].replace(/[^\d]/g, "")) || 0 : 0;
    return { id: `menu-${name.replace(/\s+/g, "-").toLowerCase()}`, name, quantity, price: 0, discount: 0, discountedPrice: 0 };
  }
  // If object, attempt to normalize fields
  if (typeof entry === "object") {
    return {
      id: entry.id || entry._id || `menu-${(entry.name || entry.label || "item").replace(/\s+/g, "-").toLowerCase()}`,
      name: entry.name || entry.label || entry.title || "Item",
      quantity: Number(entry.quantity || entry.qty || 1),
      price: Number(entry.price || entry.unitPrice || entry.pricePerItem || 0),
      discount: Number(entry.discount || 0),
      discountedPrice: Number(entry.discountedPrice || entry.discountedPrice === 0 ? entry.discountedPrice : (entry.price || 0) - (entry.discount || 0)),
      raw: entry,
    };
  }
  return null;
}

function normalizeMenuSections(order) {
  // order.menu_sections may be an array of strings or objects, or may live in order.payload.menu_sections
  const raw = order.menu_sections || (order.payload && order.payload.menu_sections) || [];
  if (!Array.isArray(raw)) return [];
  return raw.map(parseMenuEntry).filter(Boolean);
}

function normalizeServices(order) {
  // services might be top-level or in payload.services
  const raw = order.services || (order.payload && order.payload.services) || [];
  if (!Array.isArray(raw)) return [];
  return raw.map((s) => {
    if (!s) return null;
    // If string, convert to simple object
    if (typeof s === "string") return { id: `svc-${s.replace(/\s+/g, "-").toLowerCase()}`, title: s, extraInfo: null, price: null, raw: s };
    // If object, pick common fields
    const extra = s.extraInfo || s.extra || null;
    return {
      id: s.id || s._id || s.title || `svc-${(s.title || "service").replace(/\s+/g, "-").toLowerCase()}`,
      title: s.title || s.label || s.name || "Service",
      price: s.price != null ? Number(s.price) : (s.price && typeof s.price === "object" ? Number(s.price.min || s.price.max || 0) : null),
      extraInfo: extra,
      description: s.description || s.desc || "",
      raw: s,
    };
  }).filter(Boolean);
}

export default function OrderDetailsPage() {
  const { orderId } = useParams();
  const navigate = useNavigate();

  const [orders, setOrders] = useState(() => readOrders());
  const [order, setOrder] = useState(null);

  // local editor state (manager & finalPaid removed)
//   const [status, setStatus] = useState("");
  const [remarkText, setRemarkText] = useState("");

  useEffect(() => {
    setOrders(readOrders());
  }, [orderId]);

  useEffect(() => {
    const found = (orders || []).find(o => (o._id || o.orderNumber) === orderId);
    setOrder(found || null);
    // if (found) {
    //   setStatus(found.status || "new");
    // }
  }, [orders, orderId]);

  const saveChanges = (patch = {}) => {
    const next = (orders || []).map((o) => {
      const key = (o._id || o.orderNumber);
      if (key !== orderId) return o;
      return { ...o, ...patch, updatedAt: new Date().toISOString() };
    });
    persistOrders(next);
    setOrders(next);
    setOrder(next.find((o) => (o._id || o.orderNumber) === orderId));
  };

  const handleAddRemark = () => {
    if (!remarkText.trim()) return;
    const note = { by: "admin", text: remarkText.trim(), at: new Date().toISOString() };
    const existing = order?.remarks || [];
    saveChanges({ remarks: [...existing, note] });
    setRemarkText("");
  };

  const handleMarkClosed = () => {
    // mark closed (no finalPaid handling)
    const patch = { status: "delivered", closedAt: new Date().toISOString() };
    saveChanges(patch);
    alert("Order marked closed.");
  };

  // Normalized lists for rendering
  const menuSections = useMemo(() => (order ? normalizeMenuSections(order) : []), [order]);
  const services = useMemo(() => (order ? normalizeServices(order) : []), [order]);

  if (!order) {
    return (
      <Wrapper headertext="Order details" footer={false}>
        <div className="admin-orders-page p-6">
          <button className="btn" onClick={() => navigate(-1)}>Back</button>
          <div style={{ marginTop: 12 }}>Order not found.</div>
        </div>
      </Wrapper>
    );
  }

  // helpers for display
  const totalDisplay = (order.price && (order.price.finalPrice || (order.price._numeric && `₹${order.price._numeric.finalPrice}`))) || "-";

  return (
    <Wrapper headertext={`Order ${order.orderNumber || order._id}`} footer={false}>
      <div className="admin-orders-page details">
        <div className="detailTop">
          <div>
            <h2 style={{ textTransform: "capitalize" }}>{order.eventType || "Event"}</h2>
            <div className="small muted">{new Date(order.date).toLocaleString()}</div>
          </div>
          <div className="rightMeta">
            <div><strong>Total:</strong> <span className="mono">{totalDisplay}</span></div>
            <div><strong>Status:</strong> <span className={`statusBadge ${order.status}`}>{order.status}</span></div>
          </div>
        </div>

        <div className="gridTwo">
          <section className="card">
            <h3>Customer</h3>
            <div><strong>Name:</strong> {order.customer?.name}</div>
            <div><strong>Phone:</strong> {order.customer?.phone}</div>
            <div><strong>Area:</strong> {order.customer?.area}</div>
            <div><strong>Pincode:</strong> {order.customer?.pincode}</div>
          </section>

          <section className="card">
            <h3>Order Info</h3>
            <div><strong>Order #:</strong> {order.orderNumber || order._id}</div>
            <div><strong>People:</strong> {order.people}</div>
            <div><strong>Diet config:</strong> {order.dietConfig?.dietMode || "-"}</div>
            <div><strong>Special request:</strong> {order.special_request || "-"}</div>
          </section>
        </div>

        <section className="card">
          <h3>Menu</h3>
          <table className="miniTable">
            <thead><tr><th>Item</th><th>Qty</th><th>Unit</th></tr></thead>
            <tbody>
              {menuSections.map((m) => (
                <tr key={m.id || m.name}>
                  <td>{m.name}</td>
                  <td>{m.quantity}</td>
                  <td className="mono">₹{m.price != null ? m.price : (m.discountedPrice != null ? m.discountedPrice : "-")}</td>
                </tr>
              ))}
              {menuSections.length === 0 && <tr><td colSpan="3" className="empty">No menu items</td></tr>}
            </tbody>
          </table>
        </section>

        <section className="card">
          <h3>Services</h3>
          <ul className="serviceList">
            {services.length > 0 ? (
              services.map((s) => (
                <li key={s.id || s.title}>
                  <div className="serviceTitle">{s.title}</div>
                  {s.description && <div className="small muted">{s.description}</div>}
                  {s.price != null && <div className="small muted">Price: ₹{s.price}</div>}
                  {s.extraInfo && typeof s.extraInfo === "object" && (
                    <div style={{ marginTop: 6 }}>
                      {s.extraInfo.plates != null && <div className="small muted">Plates: {s.extraInfo.plates}</div>}
                      {s.extraInfo.note && <div className="small muted">Note: {s.extraInfo.note}</div>}
                      {s.extraInfo.choices && typeof s.extraInfo.choices === "object" && (
                        <div className="small muted" style={{ marginTop: 6 }}>
                          <strong>Choices:</strong>
                          <ul style={{ margin: "6px 0 0 14px" }}>
                            {Object.entries(s.extraInfo.choices).map(([k, v]) => (
                              <li key={k}>{k} — {v}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  )}
                </li>
              ))
            ) : (
              <div className="empty">No services</div>
            )}
          </ul>
        </section>

        <section className="card actionsPanel">
          <h3>Admin actions</h3>

          <label className="small" style={{ marginTop: 12 }}>Add remark</label>
          <textarea className="input" rows={3} value={remarkText} onChange={(e) => setRemarkText(e.target.value)} />
          <div style={{ marginTop: 6 }}><button className="btn" onClick={handleAddRemark}>Add remark</button></div>

          <div style={{ marginTop: 10, display: "flex", gap: 8 }}>
            <button className="btn" onClick={() => saveChanges({ status: "contacted" })}>Mark Contacted</button>
            <button className="btn" onClick={handleMarkClosed} style={{ background: "#111", color: "#fff" }}>Mark Delivered</button>
          </div>

          <div style={{ marginTop: 12 }}>
            <strong>Remarks</strong>
            <ul className="remarksList">
              {(order.remarks || []).map((r, i) => (
                <li key={i}>
                  <div className="small muted">{r.by} · {new Date(r.at).toLocaleString()}</div>
                  <div>{r.text}</div>
                </li>
              ))}
              {(order.remarks || []).length === 0 && <li className="empty">No remarks</li>}
            </ul>
          </div>
        </section>

      </div>
    </Wrapper>
  );
}
