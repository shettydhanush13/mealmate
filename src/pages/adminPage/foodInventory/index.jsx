// FoodInventoryOrders.jsx
import React, { useState, useMemo, useEffect, useRef } from 'react';
import '../inventory.scss';
import { fetchFoodInventory, updateFoodInventory } from '../../../services/food';
import { fetchVendors } from '../../../services/vendors';
import { fetchAllOrders } from '../../../services/order';
import { useAdminAuth, isVendor } from '../../../components/adminAuth/context';
import { FaPen, FaUtensils, FaReceipt, FaMapMarkerAlt, FaTimes } from "react-icons/fa";

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
  const { profile } = useAdminAuth();
  const vendorScope = isVendor(profile) ? (profile.vendorName || profile.name || '') : null;

  const [items, setItems] = useState([]);
  const [search, setSearch] = useState('');
  const [openCategory, setOpenCategory] = useState(null);
  const [editing, setEditing] = useState(null);
  const [addingTo, setAddingTo] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [busy, setBusy] = useState(false);
  // admin-created groups/subgroups (scaffolding — they persist once an item is added)
  const [customGroups, setCustomGroups] = useState({}); // { [category]: string[] subcategories }
  const [newGroup, setNewGroup] = useState(null); // { name, sub }
  const [newSub, setNewSub] = useState(null); // { category, name }
  const [vendors, setVendors] = useState([]);
  const [orderCounts, setOrderCounts] = useState({}); // vendorName -> orders served
  // admins always view food grouped by vendor; a vendor only sees their own items
  const [groupByVendor] = useState(!vendorScope);
  const isMounted = useRef(true);

  // load vendors for the item editor + grouped header stats
  useEffect(() => {
    let active = true;
    fetchVendors()
      .then((d) => { if (active) setVendors(Array.isArray(d) ? d : []); })
      .catch(() => { if (active) setVendors([]); });
    return () => { active = false; };
  }, []);

  // count orders served per vendor (admin grouped view only)
  useEffect(() => {
    if (vendorScope) return; // vendors don't need cross-vendor stats
    let active = true;
    fetchAllOrders()
      .then((res) => {
        if (!active) return;
        const list = Array.isArray(res) ? res : (Array.isArray(res?.data) ? res.data : []);
        const counts = {};
        list.forEach((o) => {
          const name = o?.order?.vendor || o?.vendor || '';
          if (name) counts[name] = (counts[name] || 0) + 1;
        });
        setOrderCounts(counts);
      })
      .catch(() => { if (active) setOrderCounts({}); });
    return () => { active = false; };
  }, [vendorScope]);

  // map vendor name -> profile (for serviceable areas in the grouped header)
  const vendorByName = useMemo(() => {
    const m = {};
    (vendors || []).forEach((v) => { if (v?.name) m[v.name] = v; });
    return m;
  }, [vendors]);

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

  // Build top -> sub -> items grouping (memoized).
  // Default: category -> subcategory. "Group by vendor": vendor -> category.
  // a vendor only sees the items they supply
  const visibleItems = useMemo(() => {
    if (!vendorScope) return items || [];
    return (items || []).filter((it) => it.vendor === vendorScope);
  }, [items, vendorScope]);

  const grouped = useMemo(() => {
    const g = {};
    const push = (top, sub, it) => {
      if (!g[top]) g[top] = {};
      if (!g[top][sub]) g[top][sub] = [];
      g[top][sub].push(it);
    };
    for (const it of visibleItems) {
      if (groupByVendor) {
        const sub = it.category || 'Uncategorized';
        push(it.vendor || 'No vendor', sub, it);
      } else {
        push(it.category || 'Uncategorized', it.subcategory || 'Other', it);
      }
    }
    return g;
  }, [visibleItems, groupByVendor]);

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

  // merge admin-created (empty) groups/subgroups into the view (not while searching)
  const displayGrouped = useMemo(() => {
    const out = {};
    for (const [cat, subs] of Object.entries(filteredGrouped)) out[cat] = { ...subs };
    if (!search.trim() && !groupByVendor) {
      for (const [cat, subsArr] of Object.entries(customGroups)) {
        if (!out[cat]) out[cat] = {};
        (subsArr || []).forEach((sub) => { if (!out[cat][sub]) out[cat][sub] = []; });
      }
    }
    // admin grouped view: show every vendor as a group, even with no items yet
    if (!search.trim() && groupByVendor) {
      (vendors || []).forEach((v) => { if (v?.name && !out[v.name]) out[v.name] = {}; });
    }
    return out;
  }, [filteredGrouped, customGroups, search, groupByVendor, vendors]);

  // category -> subcategory options for the Add/Edit modal selects, including
  // anything present in the data plus admin-created groups.
  const effectiveCategoriesMap = useMemo(() => {
    const map = {};
    const add = (cat, sub) => {
      if (!cat) return;
      if (!map[cat]) map[cat] = [];
      if (sub && !map[cat].includes(sub)) map[cat].push(sub);
    };
    Object.entries(categoriesMap || {}).forEach(([c, subs]) => (subs || []).forEach((s) => add(c, s)));
    (items || []).forEach((it) => add(it.category || 'Uncategorized', it.subcategory || 'Other'));
    Object.entries(customGroups).forEach(([c, subs]) => (subs || []).forEach((s) => add(c, s)));
    Object.keys(map).forEach((c) => { if (!map[c].length) map[c] = ['Other']; });
    return map;
  }, [categoriesMap, items, customGroups]);

  // all groups start collapsed; no group is forced open.

  // --- group/subgroup creation ---
  const createGroup = () => {
    const name = (newGroup?.name || '').trim();
    const sub = (newGroup?.sub || '').trim() || 'Other';
    if (!name) return;
    setCustomGroups((p) => ({ ...p, [name]: Array.from(new Set([...(p[name] || []), sub])) }));
    setOpenCategory(name);
    setNewGroup(null);
  };
  const createSub = () => {
    const cat = newSub?.category;
    const sub = (newSub?.name || '').trim();
    if (!cat || !sub) return;
    setCustomGroups((p) => ({ ...p, [cat]: Array.from(new Set([...(p[cat] || []), sub])) }));
    setOpenCategory(cat);
    setNewSub(null);
  };

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
  const openAdd = (category, subcategory, vendor) => {
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
      service: {}, // availability now comes from the vendor's serviceable areas
      vendor: vendorScope || vendor || '', // per-vendor menu: a vendor owns items they add
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
      const msg = err?.response?.data?.message;
      alert('Failed to save: ' + (Array.isArray(msg) ? msg.join(', ') : (msg || 'see console')));
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

  // render helpers — item name + price always on one line
  const renderRow = (it) => (
    <div key={it._id} className="fi-item-row">
      <span className={`fi-veg ${it.veg === false ? 'nonveg' : 'veg'}`} aria-hidden="true" />
      <span className="fi-item-name">{it.itemName || <em className="fi-item-untitled">Untitled item</em>}</span>
      <span className="fi-item-price">₹{it.price}</span>
      <button className="fi-btn fi-btn-edit" aria-label={`Edit ${it.itemName}`} onClick={() => openEdit(it)}>
        <FaPen /> Edit
      </button>
    </div>
  );

  // get first category/subcategory for Add button fallback
  const firstCat = Object.keys(categoriesMap || {})[0];
  const firstSub = firstCat ? (categoriesMap[firstCat][0] || 'Other') : 'Other';

  return (
    <div className="fi-root" aria-busy={busy}>
      <div className="fi-header">
        <h2>{vendorScope ? 'My Items' : 'Food Inventory'}</h2>
        <div className="fi-controls">
          <input
            placeholder="Search items, codes, cuisine..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="fi-search"
          />
          {!groupByVendor && (
            <div className="fi-actions-right">
              <button className="fi-btn" onClick={() => setNewGroup({ name: '', sub: '' })}>
                + New Group
              </button>
              <button className="fi-btn fi-btn-primary" onClick={() => openAdd(firstCat || 'Uncategorized', firstSub)}>
                + Add Item
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="fi-content">
        {Object.keys(displayGrouped).length === 0 ? (
          <div className="fi-empty">No items found.</div>
        ) : (
          Object.entries(displayGrouped).map(([cat, subs]) => (
            <div key={cat} className="fi-category">
              <button
                className={`fi-cat-header ${openCategory === cat ? 'open' : ''}`}
                onClick={() => setOpenCategory(openCategory === cat ? null : cat)}
              >
                {groupByVendor ? (() => {
                  const itemCount = Object.values(subs).reduce((n, arr) => n + arr.length, 0);
                  const areas = vendorByName[cat]?.serviceAreas || [];
                  const orders = orderCounts[cat] || 0;
                  return (
                    <span className="fi-cat-vendor">
                      <strong>{cat}</strong>
                      <span className="fi-cat-meta">
                        <span><FaUtensils /> {itemCount} item{itemCount === 1 ? '' : 's'}</span>
                        <span><FaReceipt /> {orders} order{orders === 1 ? '' : 's'} served</span>
                        <span><FaMapMarkerAlt /> {areas.length ? areas.join(', ') : 'No areas set'}</span>
                      </span>
                    </span>
                  );
                })() : (
                  <>
                    <strong>{cat}</strong>
                    <span className="fi-cat-subcount">{Object.keys(subs).length} groups</span>
                  </>
                )}
              </button>

              {openCategory === cat && (
                <div className="fi-cat-body">
                  {Object.entries(subs).map(([sub, arr]) => (
                    <div key={sub} className="fi-subgroup">
                      <div className="fi-subgroup-header">
                        <h4>{sub}</h4>
                        <div>
                          {/* grouped-by-vendor: cat=vendor, sub=category → add to (this vendor, this category) */}
                          <button
                            className="fi-btn"
                            onClick={() => (groupByVendor ? openAdd(sub, '', cat) : openAdd(cat, sub))}
                          >
                            + Add
                          </button>
                        </div>
                      </div>

                      {arr.length === 0 ? (
                        <div className="fi-empty-sub">No items in this group.</div>
                      ) : (
                        <div className="fi-item-list">{arr.map(renderRow)}</div>
                      )}
                    </div>
                  ))}

                  <div className="fi-cat-footer">
                    {groupByVendor ? (
                      <>
                        <button className="fi-btn fi-btn-primary" onClick={() => openAdd(firstCat || 'Uncategorized', firstSub, cat)}>
                          + Add item
                        </button>
                        <button className="fi-btn" onClick={() => setNewGroup({ name: '', sub: '' })}>
                          + New Group
                        </button>
                      </>
                    ) : (
                      <button className="fi-add-subgroup" onClick={() => setNewSub({ category: cat, name: '' })}>
                        + Add subgroup
                      </button>
                    )}
                  </div>
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
          categoriesMap={effectiveCategoriesMap}
          vendors={vendors}
          vendorScope={vendorScope}
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
          categoriesMap={effectiveCategoriesMap}
          vendors={vendors}
          onCancel={() => setAddingTo(null)}
          onSave={saveItem}
          busy={busy}
        />
      )}

      {/* New Group modal */}
      {newGroup && (
        <div className="fi-modal-overlay">
          <div className="fi-modal">
            <div className="fi-modal-header"><h3>New group</h3><button className="fi-close-btn" onClick={() => setNewGroup(null)}><FaTimes /></button></div>
            <div className="fi-modal-body">
              <label className="fi-field">
                <div className="fi-label">Group name</div>
                <input autoFocus type="text" value={newGroup.name} placeholder="e.g. Beverages" onChange={(e) => setNewGroup((g) => ({ ...g, name: e.target.value }))} />
              </label>
              <label className="fi-field">
                <div className="fi-label">First subgroup</div>
                <input type="text" value={newGroup.sub} placeholder="e.g. Hot Drinks" onChange={(e) => setNewGroup((g) => ({ ...g, sub: e.target.value }))} />
              </label>
              <p className="fi-hint">Add an item to the new group to save it permanently.</p>
            </div>
            <div className="fi-modal-footer">
              <button className="fi-btn" onClick={() => setNewGroup(null)}>Cancel</button>
              <button className="fi-btn fi-btn-primary" onClick={createGroup} disabled={!newGroup.name.trim()}>Create group</button>
            </div>
          </div>
        </div>
      )}

      {/* New Subgroup modal */}
      {newSub && (
        <div className="fi-modal-overlay">
          <div className="fi-modal">
            <div className="fi-modal-header"><h3>New subgroup in “{newSub.category}”</h3><button className="fi-close-btn" onClick={() => setNewSub(null)}><FaTimes /></button></div>
            <div className="fi-modal-body">
              <label className="fi-field">
                <div className="fi-label">Subgroup name</div>
                <input autoFocus type="text" value={newSub.name} placeholder="e.g. Cold Drinks" onChange={(e) => setNewSub((s) => ({ ...s, name: e.target.value }))} />
              </label>
              <p className="fi-hint">Add an item to the new subgroup to save it permanently.</p>
            </div>
            <div className="fi-modal-footer">
              <button className="fi-btn" onClick={() => setNewSub(null)}>Cancel</button>
              <button className="fi-btn fi-btn-primary" onClick={createSub} disabled={!newSub.name.trim()}>Create subgroup</button>
            </div>
          </div>
        </div>
      )}

      {/* Delete confirm */}
      {confirmDelete && (
        <div className="fi-modal-overlay">
          <div className="fi-modal">
            <div className="fi-modal-header">
              <h3>Confirm Delete</h3>
              <button className="fi-close-btn" onClick={() => setConfirmDelete(null)}><FaTimes /></button>
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

function EditModal({ initialItem, categoriesMap = {}, vendors = [], vendorScope = null, onCancel, onSave, busy }) {
  const [item, setItem] = useState(() => deepClone(initialItem));
  const [errors, setErrors] = useState({});

  useEffect(() => setItem(deepClone(initialItem)), [initialItem]);

  const change = (field, value) => {
    setItem((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: '' }));
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

  const isEdit = initialItem && initialItem._id;

  return (
    <div className="fi-modal-overlay">
      <div className="fi-modal modal-large itemModal">
        <div className="fi-modal-header itemModal__head">
          <div className="itemModal__heading">
            <span className="itemModal__icon" aria-hidden="true"><FaUtensils /></span>
            <div>
              <h3>{isEdit ? 'Edit item' : 'Add item'}</h3>
              <p className="itemModal__sub">Menu details, pricing &amp; suppliers.</p>
            </div>
          </div>
          <button className="fi-close-btn" onClick={onCancel}><FaTimes /></button>
        </div>

        <div className="fi-modal-body itemModal__body">
          {/* Details */}
          <div className="fmCard">
            <div className="fmCard__title">Item details</div>
            <div className="fi-edit-grid">
              <label className="full">
                <div className="fi-label">Item name</div>
                <input type="text" value={item.itemName} onChange={(e) => change('itemName', e.target.value)} placeholder="e.g. Masala Dosa" />
                {errors.itemName && <div className="fi-field-error">{errors.itemName}</div>}
              </label>
              <label>
                <div className="fi-label">Category</div>
                <select value={item.category || (categoryOptions[0] || 'Uncategorized')} onChange={(e) => handleCategoryChange(e.target.value)}>
                  {categoryOptions.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
                {errors.category && <div className="fi-field-error">{errors.category}</div>}
              </label>
              <label>
                <div className="fi-label">Subcategory</div>
                <select value={item.subcategory || (subOptions[0] || 'Other')} onChange={(e) => change('subcategory', e.target.value)}>
                  {subOptions.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
                {errors.subcategory && <div className="fi-field-error">{errors.subcategory}</div>}
              </label>
              <label>
                <div className="fi-label">Type</div>
                <select value={item.veg ? 'veg' : 'nonveg'} onChange={(e) => change('veg', e.target.value === 'veg')}>
                  <option value="veg">🟢 Veg</option>
                  <option value="nonveg">🔴 Non-Veg</option>
                </select>
              </label>
              <label>
                <div className="fi-label">Item code</div>
                <input type="text" value={item.itemCode || ''} onChange={(e) => change('itemCode', e.target.value)} placeholder="auto / custom" />
              </label>
              <label className="full">
                <div className="fi-label">Cuisine <span className="fi-label-note">(comma separated)</span></div>
                <input type="text" value={(item.cuisine || []).join(', ')} onChange={(e) => change('cuisine', e.target.value.split(',').map(s => s.trim()).filter(Boolean))} placeholder="South Indian, Chinese" />
              </label>
            </div>
          </div>

          {/* Pricing & portion */}
          <div className="fmCard">
            <div className="fmCard__title">Pricing &amp; portion</div>
            <div className="fi-edit-grid">
              <label>
                <div className="fi-label">Default price (₹)</div>
                <input type="number" value={item.price} onChange={(e) => change('price', e.target.value)} />
                {errors.price && <div className="fi-field-error">{errors.price}</div>}
              </label>
              <label>
                <div className="fi-label">Quantity</div>
                <input type="text" value={item.quantity || ''} onChange={(e) => change('quantity', e.target.value)} placeholder="1 pc / 200g" />
              </label>
              <label>
                <div className="fi-label">Min order qty</div>
                <input type="number" value={item.minOrderQty || 1} onChange={(e) => change('minOrderQty', e.target.value)} />
              </label>
              <label>
                <div className="fi-label">Serves</div>
                <input type="number" value={item.serves || 1} onChange={(e) => change('serves', e.target.value)} />
              </label>
              <label>
                <div className="fi-label">Currency</div>
                <input type="text" value={item.currency || 'INR'} onChange={(e) => change('currency', e.target.value)} />
              </label>
              <label>
                <div className="fi-label">Status</div>
                <select value={item.active ? 'true' : 'false'} onChange={(e) => change('active', e.target.value === 'true')}>
                  <option value="true">Active</option>
                  <option value="false">Inactive</option>
                </select>
              </label>
            </div>
          </div>

          {/* Vendor (owner of this item) */}
          <div className="fmCard">
            <div className="fmCard__title">Vendor</div>
            <p className="fmCard__hint">
              {vendorScope
                ? 'This item belongs to you.'
                : 'The kitchen that prepares this item. Customers in the vendor’s serviceable areas will see it.'}
            </p>
            <label className="full" style={{ display: 'block' }}>
              <div className="fi-label">Owned by</div>
              <select
                value={item.vendor || ''}
                onChange={(e) => change('vendor', e.target.value)}
                disabled={!!vendorScope}
              >
                <option value="">— Select vendor —</option>
                {vendors.map((v) => <option key={v._id || v.name} value={v.name}>{v.name}</option>)}
                {item.vendor && !vendors.some((v) => v.name === item.vendor) && <option value={item.vendor}>{item.vendor}</option>}
              </select>
            </label>
          </div>
        </div>

        <div className="fi-modal-footer">
          <button className="fi-btn" onClick={onCancel} disabled={busy}>Cancel</button>
          <button className="fi-btn fi-btn-primary" onClick={handleSubmitWrapper} disabled={busy}>
            Save changes
          </button>
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
      vendor: (item.vendor || '').trim(),
      updatedAt: new Date().toISOString(),
    };
    if (!out._id) out._id = generateId();
    if (!out.itemId) out.itemId = out._id;
    onSave(out);
  }
}
