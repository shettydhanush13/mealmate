import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdminAuth, isVendor } from '../../components/adminAuth/context';
import './styles.scss';

// cards a vendor-admin is allowed to see
const VENDOR_CARD_KEYS = ['food', 'combos'];

export default function AdminInventoryPage() {
  const navigate = useNavigate();
  const { profile } = useAdminAuth();
  const vendor = isVendor(profile);

  const allCards = [
    {
      key: 'food',
      title: 'Food',
      subtitle: 'Food menu',
      route: '/admin/inventory/food',
      emoji: '🍽️',
    },
    {
      key: 'combos',
      title: 'CaterBox Combos',
      subtitle: 'Fixed-price box combos by meal & size',
      route: '/admin/combos',
      emoji: '🍱',
    },
    {
      key: 'livestations',
      title: 'Live Stations',
      subtitle: 'Live stations',
      route: '/admin/inventory/livestations',
      emoji: '🧑‍🍳',
    },
    {
      key: 'vendors',
      title: 'Vendors',
      subtitle: 'Suppliers behind food & combos',
      route: '/admin/vendors',
      emoji: '🤝',
    },
    {
      key: 'settings',
      title: 'Admin Settings',
      subtitle: 'Manage admins who can sign in',
      route: '/admin/settings',
      emoji: '🛡️',
    },
    {
      key: 'artists',
      title: 'Artists',
      subtitle: 'Hosts, magicians, photographers & entertainers',
      route: '/admin/inventory/artists',
      emoji: '🎭',
    },
  ];

  const cards = vendor ? allCards.filter((c) => VENDOR_CARD_KEYS.includes(c.key)) : allCards;

  const open = (route) => {
    navigate(route);
  };

  return (
    <div className="admin-inv-root">
      <div className="admin-inv-header">
        <h1>{vendor ? `Welcome, ${profile?.vendorName || profile?.name || 'Vendor'}` : 'Admin Dashboard'}</h1>
        <p className="admin-inv-sub">
          {vendor
            ? 'Manage your menu items, combo prices and view your delivered orders.'
            : 'Manage customer orders and your service inventory.'}
        </p>
      </div>

      <button
        className="admin-orders-card"
        onClick={() => open('/admin/orders')}
        aria-label="View orders"
      >
        <div className="admin-orders-card-emoji" aria-hidden>🧾</div>
        <div className="admin-card-body">
          <span className="admin-orders-card-eyebrow">{vendor ? 'Your orders' : 'Customer orders'}</span>
          <div className="admin-card-title">Orders</div>
          <div className="admin-card-sub">{vendor ? 'Your delivered orders' : 'View, track & manage every customer order'}</div>
        </div>
        <div className="admin-orders-card-cta">
          View <span className="admin-orders-card-arrow" aria-hidden>→</span>
        </div>
      </button>

      <div className="admin-inv-section-title">{vendor ? 'Your menu' : 'Inventory'}</div>

      <div className="admin-inv-grid" role="list">
        {cards.map((c) => (
          <button
            key={c.key}
            role="listitem"
            className="admin-card"
            onClick={() => open(c.route)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                open(c.route);
              }
            }}
            aria-label={`Open ${c.title} inventory`}
          >
            <div className="admin-card-media">
              <div className="admin-card-emoji" aria-hidden>{c.emoji}</div>
            </div>

            <div className="admin-card-body">
              <div className="admin-card-title">{c.title}</div>
              <div className="admin-card-sub">{c.subtitle}</div>
            </div>

            <div className="admin-card-cta">Open →</div>
          </button>
        ))}
      </div>
    </div>
  );
}
