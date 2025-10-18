import React from 'react';
import { useNavigate } from 'react-router-dom';
import './styles.scss';

export default function AdminInventoryPage() {
  const navigate = useNavigate();

  const cards = [
    {
      key: 'decoration',
      title: 'Decorations',
      subtitle: 'Balloons, photo booths, backdrops & more',
      route: '/admin/inventory/decorations',
      emoji: '🎈',
    },
    {
      key: 'artists',
      title: 'Artists',
      subtitle: 'Hosts, magicians, photographers & entertainers',
      route: '/admin/inventory/artists',
      emoji: '🎭',
    },
    {
      key: 'food',
      title: 'Food',
      subtitle: 'Food menu',
      route: '/admin/inventory/food',
      emoji: '🍽️',
    },
    {
      key: 'livestations',
      title: 'Live Stations',
      subtitle: 'Live stations',
      route: '/admin/inventory/livestations',
      emoji: '🧑‍🍳',
    },
  ];

  const open = (route) => {
    navigate(route);
  };

  return (
    <div className="admin-inv-root">
      <div className="admin-inv-header">
        <h1>Admin — Inventory</h1>
        <p className="admin-inv-sub">
          Select a catalog to view or manage. You can add, edit or remove items in each inventory.
        </p>
      </div>

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
