// src/pages/admin/OrdersPage.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Wrapper from "../../components/wrapper";
import { formatDateShort } from "../../utils/util";
import "./styles.scss";

const ORDERS_KEY = "admin_orders_data_v1";

/**
 * Seed data helper (used only if no orders in localStorage).
 * Replace or remove in production.
 *
 * Event types limited to: birthday, corporate event, kitty party, house party
 */
const seedOrders = () => [
    {
      _id: "order-20251015-001",
      orderNumber: "ORD-20251015-001",
      eventType: "birthday",
      date: "2025-10-15T13:18:00.000Z",
      price: {
        finalPrice: "₹21,775.00",
        _numeric: { finalPrice: 21775 }
      },
      status: "new", // new / confirmed / contacted / cancelled / delivered
      customer: { name: "D", phone: "+918971780778", area: "AMRUTHALLI" },
      // dummy payload with food & services snapshot
      payload: {
        menu_sections: [
          { id: "m1", name: "Mysore Masala Dosa", quantity: 10, price: 60, discount: 0, discountedPrice: 60 },
          { id: "m2", name: "Filter Coffee", quantity: 20, price: 30, discount: 0, discountedPrice: 30 }
        ],
        services: [
          { id: "s1", title: "Live Chats", extraInfo: { plates: 50, choices: { panipuri: 25 } }, price: 1800 },
          { id: "s2", title: "Photo Booth", price: 7000 }
        ]
      },
      remarks: [],
    },
    {
      _id: "order-20251020-002",
      orderNumber: "ORD-20251020-002",
      eventType: "corporate event",
      date: "2025-10-20T12:00:00.000Z",
      price: { finalPrice: "₹5,400.00", _numeric: { finalPrice: 5400 } },
      status: "confirmed",
      customer: { name: "Rohit", phone: "+919000000000", area: "Indiranagar" },
      payload: {
        menu_sections: [
          { id: "m3", name: "Gobi Manchurian", quantity: 5, price: 150, discount: 0, discountedPrice: 150 }
        ],
        services: [
          { id: "s3", title: "Mocktail Bartender", extraInfo: { plates: 50, choices: { mint_mojito: 20 } }, price: 2499 }
        ]
      },
      remarks: [{ by: "system", text: "Confirmed vendor", at: new Date().toISOString() }],
    },
    {
      _id: "order-20251101-003",
      orderNumber: "ORD-20251101-003",
      eventType: "house party",
      date: "2025-11-01T18:30:00.000Z",
      price: { finalPrice: "₹120,000.00", _numeric: { finalPrice: 120000 } },
      status: "contacted",
      customer: { name: "Anita", phone: "+919111111111", area: "Jayanagar" },
      payload: {
        menu_sections: [
          { id: "m4", name: "Paneer Tikka", quantity: 30, price: 120, discount: 0, discountedPrice: 120 },
          { id: "m5", name: "Naan Basket", quantity: 10, price: 40, discount: 0, discountedPrice: 40 }
        ],
        services: [
          { id: "s4", title: "BBQ Live Counter", extraInfo: { plates: 100 }, price: 4500 }
        ]
      },
      remarks: [],
    },
    {
      _id: "order-20250930-004",
      orderNumber: "ORD-20250930-004",
      eventType: "kitty party",
      date: "2025-09-30T19:00:00.000Z",
      price: { finalPrice: "₹8,450.00", _numeric: { finalPrice: 8450 } },
      status: "delivered",
      customer: { name: "Vikram", phone: "+919222222222", area: "Koramangala" },
      payload: {
        menu_sections: [
          { id: "m6", name: "Veg Platter", quantity: 8, price: 350, discount: 0, discountedPrice: 350 }
        ],
        services: [
          { id: "s5", title: "Balloon Decoration", price: 1999 }
        ]
      },
      remarks: [{ by: "ops", text: "Delivered on time", at: new Date().toISOString() }],
    },
    {
      _id: "order-20251005-005",
      orderNumber: "ORD-20251005-005",
      eventType: "birthday",
      date: "2025-10-05T11:00:00.000Z",
      price: { finalPrice: "₹4,200.00", _numeric: { finalPrice: 4200 } },
      status: "cancelled",
      customer: { name: "Nisha", phone: "+919333333333", area: "Indiranagar" },
      payload: {
        menu_sections: [
          { id: "m7", name: "Cupcakes", quantity: 40, price: 35, discount: 0, discountedPrice: 35 }
        ],
        services: []
      },
      remarks: [{ by: "customer", text: "Changed plans", at: new Date().toISOString() }],
    },
    {
      _id: "order-20251008-006",
      orderNumber: "ORD-20251008-006",
      eventType: "corporate event",
      date: "2025-10-08T20:00:00.000Z",
      price: { finalPrice: "₹13,900.00", _numeric: { finalPrice: 13900 } },
      status: "new",
      customer: { name: "Karthik", phone: "+919444444444", area: "Electronic City" },
      payload: {
        menu_sections: [
          { id: "m8", name: "Sandwich Platter", quantity: 10, price: 250, discount: 0, discountedPrice: 250 }
        ],
        services: [
          { id: "s6", title: "Photographer", price: 8000 }
        ]
      },
      remarks: [],
    },
    {
      _id: "order-20251012-007",
      orderNumber: "ORD-20251012-007",
      eventType: "house party",
      date: "2025-10-12T17:00:00.000Z",
      price: { finalPrice: "₹58,300.00", _numeric: { finalPrice: 58300 } },
      status: "confirmed",
      customer: { name: "Zara", phone: "+919555555555", area: "Whitefield" },
      payload: {
        menu_sections: [
          { id: "m9", name: "Sushi Platter", quantity: 5, price: 1200, discount: 0, discountedPrice: 1200 }
        ],
        services: [
          { id: "s7", title: "Live Pizza Counter", price: 6500 }
        ]
      },
      remarks: [],
    },
    {
      _id: "order-20251110-008",
      orderNumber: "ORD-20251110-008",
      eventType: "kitty party",
      date: "2025-11-10T10:00:00.000Z",
      price: { finalPrice: "₹2,150.00", _numeric: { finalPrice: 2150 } },
      status: "contacted",
      customer: { name: "Priya", phone: "+919666666666", area: "Malleshwaram" },
      payload: {
        menu_sections: [
          { id: "m10", name: "Salad Bowl", quantity: 6, price: 120, discount: 0, discountedPrice: 120 }
        ],
        services: []
      },
      remarks: [],
    },
];

const readOrders = () => {
  try {
    const raw = localStorage.getItem(ORDERS_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    // ignore
  }
  const s = seedOrders();
  localStorage.setItem(ORDERS_KEY, JSON.stringify(s));
  return s;
};

export default function OrdersPage() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => {
    setOrders(readOrders());
  }, []);

  const filtered = useMemo(() => {
    let list = orders.slice().sort((a, b) => new Date(b.date) - new Date(a.date));
    if (statusFilter !== "all") list = list.filter((o) => (o.status || "new") === statusFilter);
    return list;
  }, [orders, statusFilter]);

  const onRefresh = () => setOrders(readOrders());

  const openOrder = (orderId) => {
    navigate(`/admin/orders/${orderId}`);
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
            <button className="btn" onClick={onRefresh}>Refresh</button>
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
              {filtered.map((o) => (
                <tr  onClick={() => openOrder(o._id || o.orderNumber)} key={o._id || o.orderNumber}>
                  <td>{formatDateShort(o.date)}</td>
                  <td style={{ textTransform: "capitalize" }}>{o.eventType || "-"}</td>
                  <td className="mono">{(o.price && (o.price.finalPrice || (o.price._numeric && `₹${(o.price._numeric.finalPrice)}`))) || "-"}</td>
                  <td><span className={`statusBadge ${o.status}`}>{o.status || "new"}</span></td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan="8" className="empty">No orders found</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </Wrapper>
  );
}
