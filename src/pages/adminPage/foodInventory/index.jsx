// FoodInventoryOrders.jsx
import React, { useState, useMemo, useEffect, useRef } from 'react';
import '../inventory.scss';
import { fetchFoodInventory, updateFoodInventory } from '../../../services/food';
import EditIcon from "@mui/icons-material/Edit"; // ✅ import MUI edit icon

const deepClone = (v) => JSON.parse(JSON.stringify(v));
const generateId = () =>
  `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 9)}`;

/**
 * Props:
 * - fetchFoodInventory: optional async function() => itemsArray
 * - initialItems: fallback array of items if fetchFoodInventory not provided
 * - categoriesMap: optional map of categories->subcategories used for the +Add fallback
 * - defaultRegions: array for service checkboxes
 * - onSave(item): optional async save hook
 * - onDelete(_id): optional async delete hook
 */
export default function FoodInventoryOrders({
  initialItems = [],
  categoriesMap = {
    Breakfast: [
      'Idly/Vada',
      'Dosa',
      'Bath',
      'Rotti',
      'Fried Breakfast',
      'Beverages',
    ],
    Snacks: [
      'Dry Item',
      'Chinese',
      'Noodles',
      'Additional Items',
      'Extras',
    ],
    Mains: ['Breads', 'Curries', 'Rice', 'Welcome Drink'],
    Desserts: ['Sweet'],
    Sides: ['Pallya'],
    Beverages: ['Hot Drinks', 'Cold Drinks'],
    Cutlery: ['Cutlery & Service'],
  },
  defaultRegions = [
    'Bangalore-North',
    'Bangalore-South',
    'Bangalore-East',
    'Bangalore-West',
    'Bangalore-Central',
  ],
  onSave,
  onDelete,
}) {
  const [items, setItems] = useState([]);
  const [search, setSearch] = useState('');
  const [openCategory, setOpenCategory] = useState(null);
  const [editing, setEditing] = useState(null);
  const [addingTo, setAddingTo] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [busy, setBusy] = useState(false);
  const isMounted = useRef(true);

  // track mount/unmount
  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  // --- load data once on mount: prefer fetchFoodInventory(), fallback to initialItems ---
  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      setBusy(true);
      try {
        if (typeof fetchFoodInventory === 'function') {
          const fetched = await fetchFoodInventory();
          if (!cancelled && isMounted.current) {
            // Expect fetched to be an array
            setItems(Array.isArray(fetched) ? deepClone(fetched) : []);
          }
        } else {
          // Use initialItems only once (clone)
          setItems(Array.isArray(initialItems) ? deepClone(initialItems) : []);
        }
      } catch (err) {
        console.error('Failed to load food inventory', err);
        if (!cancelled && isMounted.current) setItems(Array.isArray(initialItems) ? deepClone(initialItems) : []);
      } finally {
        if (!cancelled && isMounted.current) setBusy(false);
      }
    };

    load();
    return () => {
      cancelled = true;
    };
    // run only once on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // intentionally empty - mount only

  // Build category -> subcategory -> items grouping (memoized)
  const grouped = useMemo(() => {
    const g = {};
    for (const it of items || []) {
      const cat = it.category || 'Uncategorized';
      const sub = it.subcategory || 'Other';
      if (!g[cat]) g[cat] = {};
      if (!g[cat][sub]) g[cat][sub] = [];
      g[cat][sub].push(it);
    }
    return g;
  }, [items]);

  // filtered view by search
  const filteredGrouped = useMemo(() => {
    if (!search.trim()) return grouped;
    const q = search.trim().toLowerCase();
    const out = {};
    for (const [cat, subs] of Object.entries(grouped)) {
      const matchedSubs = {};
      for (const [sub, arr] of Object.entries(subs)) {
        const filtered = arr.filter((it) =>
          `${it.itemName} ${it.itemCode || ''} ${it.quantity || ''} ${it.cuisine?.join(' ') || ''}`
            .toLowerCase()
            .includes(q)
        );
        if (filtered.length) matchedSubs[sub] = filtered;
      }
      if (Object.keys(matchedSubs).length) out[cat] = matchedSubs;
    }
    return out;
  }, [search, grouped]);

  // Only set openCategory once if it's currently null/undefined
  useEffect(() => {
    if (openCategory) return; // already set
    const first = Object.keys(filteredGrouped)[0] ?? null;
    if (first !== null) {
      setOpenCategory(first);
    }
  }, [filteredGrouped, openCategory]);

  // --- local CRUD helpers ---
  const upsertLocal = (item) => {
    setItems((prev) => {
      const copy = deepClone(prev || []);
      const idx = copy.findIndex((p) => p._id === item._id);
      if (idx >= 0) {
        copy[idx] = item;
      } else {
        copy.push(item);
      }
      return copy;
    });
  };

  const deleteLocal = (_id) => {
    setItems((prev) => (prev || []).filter((p) => p._id !== _id));
  };

  // event handlers
  const openEdit = (item) => setEditing(deepClone(item));
  const openAdd = (category, subcategory) => {
    const newItem = {
      _id: generateId(),
      itemId: generateId(),
      itemCode: `${(subcategory || 'item')}-${Date.now()}`.toLowerCase().replace(/\s+/g, '-'),
      itemName: '',
      veg: true,
      category: category || 'Uncategorized',
      subcategory: subcategory || 'Other',
      cuisine: [],
      active: true,
      service: (defaultRegions || []).reduce((acc, r) => ({ ...acc, [r]: true }), {}),
      price: 0,
      currency: 'INR',
      quantity: '',
      minOrderQty: 1,
      serves: 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setAddingTo({ category: newItem.category, subcategory: newItem.subcategory, item: newItem });
  };

  // IMPORTANT: when saving, call updateFoodInventory(item) with full item body
  const saveItem = async (item) => {
    try {
      setBusy(true);
      const out = { ...item, updatedAt: new Date().toISOString() };
      if (!out.createdAt) out.createdAt = new Date().toISOString();

      // Call the API to update the remote inventory (payload = full item)
      // If updateFoodInventory is not implemented or throws, we let it bubble to catch and notify.
      if (typeof updateFoodInventory === 'function') {
        try {
          await updateFoodInventory(out);
        } catch (apiErr) {
          console.error('updateFoodInventory failed', apiErr);
          throw apiErr; // will be caught by outer catch and show failure
        }
      } else {
        console.warn('updateFoodInventory is not a function — ensure it is exported from services/food');
      }

      // call optional onSave hook so parent can react (still useful)
      if (onSave) await onSave(out);

      // update local UI state
      upsertLocal(out);
      setEditing(null);
      setAddingTo(null);
    } catch (err) {
      console.error('save error', err);
      alert('Failed to save. See console.');
    } finally {
      if (isMounted.current) setBusy(false);
    }
  };

  const confirmDeleteItem = async (_id) => {
    try {
      setBusy(true);
      if (onDelete) await onDelete(_id);
      deleteLocal(_id);
      setConfirmDelete(null);
    } catch (err) {
      console.error('delete error', err);
      alert('Failed to delete. See console.');
    } finally {
      if (isMounted.current) setBusy(false);
    }
  };

  // render helpers
  const renderRow = (it) => (
    <tr key={it._id}>
      <td style={{ textAlign: 'left', fontWeight: 600 }}>{it.itemName}</td>
      <td style={{ textAlign: 'left' }}>₹{it.price}</td>
      <td style={{ textAlign: 'right' }}>
        <button className="fi-btn fi-btn-edit" onClick={() => openEdit(it)}><EditIcon fontSize='small'/></button>
      </td>
    </tr>
  );

  // get first category/subcategory for Add button fallback
  const firstCat = Object.keys(categoriesMap || {})[0];
  const firstSub = firstCat ? (categoriesMap[firstCat][0] || 'Other') : 'Other';

  return (
    <div className="fi-root" aria-busy={busy}>
      <div className="fi-header">
        <h2>Food Inventory</h2>
        <div className="fi-controls">
          <input
            placeholder="Search items, codes, cuisine..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="fi-search"
          />
          <div className="fi-actions-right">
            <button
              className="fi-btn fi-btn-primary"
              onClick={() => openAdd(firstCat || 'Uncategorized', firstSub)}
            >
              + Add Item
            </button>
          </div>
        </div>
      </div>

      <div className="fi-content">
        {Object.keys(filteredGrouped).length === 0 ? (
          <div className="fi-empty">No items found.</div>
        ) : (
          Object.entries(filteredGrouped).map(([cat, subs]) => (
            <div key={cat} className="fi-category">
              <button
                className={`fi-cat-header ${openCategory === cat ? 'open' : ''}`}
                onClick={() => setOpenCategory(openCategory === cat ? null : cat)}
              >
                <strong>{cat}</strong>
                <span className="fi-cat-subcount">{Object.keys(subs).length} groups</span>
              </button>

              {openCategory === cat && (
                <div className="fi-cat-body">
                  {Object.entries(subs).map(([sub, arr]) => (
                    <div key={sub} className="fi-subgroup">
                      <div className="fi-subgroup-header">
                        <h4>{sub}</h4>
                        <div>
                          <button className="fi-btn" onClick={() => openAdd(cat, sub)}>+ Add</button>
                        </div>
                      </div>

                      {arr.length === 0 ? (
                        <div className="fi-empty-sub">No items in this group.</div>
                      ) : (
                        <div className="fi-table-wrap">
                          <table className="fi-table">
                            <thead>
                              <tr>
                                <th>Item</th>
                                <th>Price</th>
                                <th></th>
                              </tr>
                            </thead>
                            <tbody>
                              {arr.map(renderRow)}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Edit Modal */}
      {editing && (
        <EditModal
          initialItem={editing}
          regions={defaultRegions}
          categoriesMap={categoriesMap}
          onCancel={() => setEditing(null)}
          onSave={saveItem}
          busy={busy}
        />
      )}

      {/* Add Modal */}
      {addingTo && (
        <EditModal
          initialItem={addingTo.item}
          regions={defaultRegions}
          categoriesMap={categoriesMap}
          onCancel={() => setAddingTo(null)}
          onSave={saveItem}
          busy={busy}
        />
      )}

      {/* Delete confirm */}
      {confirmDelete && (
        <div className="fi-modal-overlay">
          <div className="fi-modal">
            <div className="fi-modal-header">
              <h3>Confirm Delete</h3>
              <button className="fi-close-btn" onClick={() => setConfirmDelete(null)}>✕</button>
            </div>
            <div className="fi-modal-body">
              <p>Are you sure you want to permanently delete this item?</p>
              <div style={{ display: 'flex', gap: 10, marginTop: 12 }}>
                <button className="fi-btn" onClick={() => setConfirmDelete(null)}>Cancel</button>
                <button className="fi-btn fi-btn-delete" onClick={() => confirmDeleteItem(confirmDelete)} disabled={busy}>Delete</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {busy && <div className="fi-busy-overlay">Processing…</div>}
    </div>
  );
}

/* ---------- EditModal component (unchanged logic, protected from infinite loops) ---------- */

function EditModal({ initialItem, regions = [], categoriesMap = {}, onCancel, onSave, busy }) {
  const [item, setItem] = useState(() => deepClone(initialItem));
  const [errors, setErrors] = useState({});

  useEffect(() => setItem(deepClone(initialItem)), [initialItem]);

  const change = (field, value) => {
    setItem((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: '' }));
  };

  const toggleRegion = (region) => {
    setItem((prev) => ({ ...prev, service: { ...(prev.service || {}), [region]: !prev.service?.[region] } }));
  };

  // derive options
  const categoryOptions = Object.keys(categoriesMap || {});
  const subOptions = (categoriesMap && categoriesMap[item.category]) || ['Other'];

  // when category changes, auto-set subcategory to first available
  function handleCategoryChange(newCat) {
    const subs = (categoriesMap && categoriesMap[newCat]) || ['Other'];
    change('category', newCat);
    // if current subcategory not in subs, set to first
    if (!subs.includes(item.subcategory)) {
      change('subcategory', subs[0] || 'Other');
    }
  }

  return (
    <div className="fi-modal-overlay">
      <div className="fi-modal">
        <div className="fi-modal-header">
          <h3>{initialItem && initialItem._id ? 'Edit Item' : 'Add Item'}</h3>
          <button className="fi-close-btn" onClick={onCancel}>✕</button>
        </div>
        <div className="fi-modal-body">
          <div className="fi-edit-grid">
            <label>
              <div className="fi-label">Item Name</div>
              <input type="text" value={item.itemName} onChange={(e) => change('itemName', e.target.value)} />
              {errors.itemName && <div className="fi-field-error">{errors.itemName}</div>}
            </label>

            <label>
              <div className="fi-label">Item Code</div>
              <input type="text" value={item.itemCode || ''} onChange={(e) => change('itemCode', e.target.value)} />
            </label>

            <label>
              <div className="fi-label">Category</div>
              <select
                value={item.category || (categoryOptions[0] || 'Uncategorized')}
                onChange={(e) => handleCategoryChange(e.target.value)}
              >
                {categoryOptions.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
              {errors.category && <div className="fi-field-error">{errors.category}</div>}
            </label>

            <label>
              <div className="fi-label">Subcategory</div>
              <select
                value={item.subcategory || (subOptions[0] || 'Other')}
                onChange={(e) => change('subcategory', e.target.value)}
              >
                {subOptions.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
              {errors.subcategory && <div className="fi-field-error">{errors.subcategory}</div>}
            </label>

            <label>
              <div className="fi-label">Veg</div>
              <select value={item.veg ? 'veg' : 'nonveg'} onChange={(e) => change('veg', e.target.value === 'veg')}>
                <option value="veg">Veg</option>
                <option value="nonveg">Non-Veg</option>
              </select>
            </label>

            <label>
              <div className="fi-label">Price (INR)</div>
              <input type="number" value={item.price} onChange={(e) => change('price', e.target.value)} />
              {errors.price && <div className="fi-field-error">{errors.price}</div>}
            </label>

            <label>
              <div className="fi-label">Quantity (eg. 1 pc / 200g)</div>
              <input type="text" value={item.quantity || ''} onChange={(e) => change('quantity', e.target.value)} />
            </label>

            <label>
              <div className="fi-label">Currency</div>
              <input type="text" value={item.currency || 'INR'} onChange={(e) => change('currency', e.target.value)} />
            </label>

            <label>
              <div className="fi-label">Min Order Qty</div>
              <input type="number" value={item.minOrderQty || 1} onChange={(e) => change('minOrderQty', e.target.value)} />
            </label>

            <label>
              <div className="fi-label">Serves</div>
              <input type="number" value={item.serves || 1} onChange={(e) => change('serves', e.target.value)} />
            </label>

            <label>
              <div className="fi-label">Cuisine (comma separated)</div>
              <input type="text" value={(item.cuisine || []).join(', ')} onChange={(e) => change('cuisine', e.target.value.split(',').map(s => s.trim()).filter(Boolean))} />
            </label>

            <label>
              <div className="fi-label">Service Availability</div>
              <div className='service-areas'>
                {regions.map((r) => (
                  <label key={r} className="area-label chip">
                    <input type="checkbox" checked={!!item.service?.[r]} onChange={() => toggleRegion(r)} />
                    <span style={{ fontSize: 13 }}>{r}</span>
                  </label>
                ))}
              </div>
            </label>

            <label>
              <div className="fi-label">Active</div>
              <select value={item.active ? 'true' : 'false'} onChange={(e) => change('active', e.target.value === 'true')}>
                <option value="true">Active</option>
                <option value="false">Inactive</option>
              </select>
            </label>
          </div>

          <div style={{ marginTop: 12, display: 'flex', gap: 10 }}>
            <button className="fi-btn" onClick={onCancel} disabled={busy}>Cancel</button>
            <button className="fi-btn fi-btn-primary" onClick={handleSubmitWrapper} disabled={busy}>
              Save changes
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  function handleSubmitWrapper() {
    const out = {
      ...item,
      price: Number(item.price) || 0,
      minOrderQty: Number(item.minOrderQty) || 1,
      serves: Number(item.serves) || 1,
      cuisine: Array.isArray(item.cuisine) ? item.cuisine : (item.cuisine ? String(item.cuisine).split(',').map(s => s.trim()) : []),
      updatedAt: new Date().toISOString(),
    };
    if (!out._id) out._id = generateId();
    if (!out.itemId) out.itemId = out._id;
    onSave(out);
  }
}
