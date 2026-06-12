import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { FaThLarge, FaClipboardList, FaCog, FaSignOutAlt } from "react-icons/fa";
import logo from "../../assets/logowhite.png";
import { isVendor } from "../adminAuth/context";
import "./styles.scss";

/**
 * Shared top bar for all /admin routes. Brand + quick nav + logout.
 * Vendor-admins get a restricted nav (no Settings).
 */
export default function AdminHeader({ onLogout, profile }) {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const vendor = isVendor(profile);

  const isDash = pathname === "/admin";
  const isOrders = pathname.startsWith("/admin/orders");
  const isSettings = pathname.startsWith("/admin/settings");

  return (
    <header className="admin-header">
      <div className="admin-header__inner">
        <button type="button" className="admin-header__brand" onClick={() => navigate("/admin")} aria-label="Dashboard">
          <img className="admin-header__logo" src={logo} alt="" aria-hidden="true" />
          <span className="admin-header__name">CaterKart <strong>{vendor ? "Vendor" : "Admin"}</strong></span>
        </button>

        <nav className="admin-header__nav" aria-label="Admin">
          <button
            type="button"
            className={`admin-header__link ${isDash ? "is-active" : ""}`}
            onClick={() => navigate("/admin")}
          >
            <FaThLarge /> <span>Dashboard</span>
          </button>
          <button
            type="button"
            className={`admin-header__link ${isOrders ? "is-active" : ""}`}
            onClick={() => navigate("/admin/orders")}
          >
            <FaClipboardList /> <span>Orders</span>
          </button>
          {!vendor && (
            <button
              type="button"
              className={`admin-header__link ${isSettings ? "is-active" : ""}`}
              onClick={() => navigate("/admin/settings")}
            >
              <FaCog /> <span>Settings</span>
            </button>
          )}
          <button type="button" className="admin-header__logout" onClick={onLogout}>
            <FaSignOutAlt /> <span>Logout</span>
          </button>
        </nav>
      </div>
    </header>
  );
}
