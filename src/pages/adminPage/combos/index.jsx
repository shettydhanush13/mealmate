import React, { useEffect, useState, useMemo, useCallback } from 'react';
import '../inventory.scss';
import './styles.scss';
import { FaPen, FaRegTrashAlt, FaUtensils, FaPlus, FaHandshake, FaTimes } from 'react-icons/fa';
import { fetchCombos, createCombo, updateCombo, deleteCombo } from '../../../services/combos';
import { fetchFoodByArea } from '../../../services/food';
import { fetchVendors } from '../../../services/vendors';
import { useAdminAuth, isVendor } from '../../../components/adminAuth/context';

const MEAL_SLOTS = ['Breakfast', 'Lunch/Dinner', 'Snacks'];
const BOX_SIZES = [3, 5, 8];

const emptyItem = () => ({ kind: 'fixed', name: '', label: '', category: '', options: [] });

// menu items inside a category supplied by `vendor`, as { name, price }.
// When no vendor is set, all items are returned at their default price.
const itemsForVendor = (menu, cat, vendor) => {
  if (!cat || !menu[cat]) return [];
  return Object.values(menu[cat])
    .map((it) => {
      if (!it || !it.name) return null;
      // per-vendor menu: an item belongs to one vendor
      if (vendor && it.vendor !== vendor) return null;
      return { name: it.name, price: Number(it.price) || 0 };
    })
    .filter(Boolean);
};
const emptyCombo = () => ({ name: '', mealSlots: ['Breakfast'], boxType: 3, items: [], commonItems: '', addOns: [], vendor: '', price: '', active: true });

// a combo's meal slots, tolerating the legacy single mealSlot field
const slotsOf = (c) => (Array.isArray(c.mealSlots) && c.mealSlots.length ? c.mealSlots : (c.mealSlot ? [c.mealSlot] : []));

// summarise a combo's items for the list view (handles structured + legacy)
const itemSummary = (items = []) =>
  items
    .map((it) => (typeof it === 'string' ? it : it.kind === 'choice' ? `${it.label || 'Choice'} (choose)` : it.name))
    .filter(Boolean)
    .join(' · ');

export default function AdminCombosPage() {
  const { profile } = useAdminAuth();
  const vendorScope = isVendor(profile) ? (profile.vendorName || profile.name || '') : null;

  const [combos, setCombos] = useState([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [editing, setEditing] = useState(null); // combo being added/edited
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [menu, setMenu] = useState({}); // full menu tree: { category: { key: item } }
  const [vendors, setVendors] = useState([]);

  useEffect(() => {
    fetchFoodByArea("")
      .then((d) => setMenu(d?.menuItems || {}))
      .catch(() => setMenu({}));
    fetchVendors()
      .then((d) => setVendors(Array.isArray(d) ? d : []))
      .catch(() => setVendors([]));
  }, []);

  const load = useCallback(async () => {
    setBusy(true);
    setError('');
    try {
      const data = await fetchCombos();
      const list = Array.isArray(data) ? data : [];
      // vendors only see their own combos
      setCombos(vendorScope ? list.filter((c) => c.vendor === vendorScope) : list);
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to load combos');
    } finally {
      setBusy(false);
    }
  }, [vendorScope]);

  useEffect(() => { load(); }, [load]);

  // group by "{mealSlot} · {boxType}-item" combination
  // (a combo assigned to multiple slots appears under each)
  const grouped = useMemo(() => {
    const g = {};
    combos.forEach((c) => {
      const slots = slotsOf(c);
      (slots.length ? slots : ['Other']).forEach((slot) => {
        const key = `${slot} · ${c.boxType || '?'}-item box`;
        (g[key] || (g[key] = [])).push(c);
      });
    });
    return g;
  }, [combos]);

  const save = async (combo) => {
    setBusy(true);
    try {
      const payload = {
        name: combo.name,
        mealSlots: combo.mealSlots || [],
        boxType: Number(combo.boxType),
        items: (combo.items || []).map((it) =>
          it.kind === 'choice'
            ? {
                kind: 'choice',
                label: it.label,
                category: it.category,
                options: (it.options || []).map((o) => ({ name: o.name, price: Number(o.price) || 0 })),
              }
            : { kind: 'fixed', name: it.name }
        ),
        commonItems: combo.commonItems,
        addOns: (combo.addOns || [])
          .map((a) => ({ name: (a.name || '').trim(), price: Number(a.price) || 0 }))
          .filter((a) => a.name),
        vendor: combo.vendor || '',
        price: Number(combo.price) || 0,
        active: combo.active !== false,
      };
      if (combo._id) await updateCombo(combo._id, payload);
      else await createCombo(payload);
      setEditing(null);
      await load();
    } catch (err) {
      alert(err?.response?.data?.message || 'Failed to save combo');
    } finally {
      setBusy(false);
    }
  };

  const remove = async (id) => {
    setBusy(true);
    try {
      await deleteCombo(id);
      setConfirmDelete(null);
      await load();
    } catch (err) {
      alert('Failed to delete combo');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="fi-root" aria-busy={busy}>
      <div className="comboHead">
        <div className="comboHead__text">
          <h2 className="comboHead__title">{vendorScope ? 'My Combos' : 'CaterBox Combos'}</h2>
          <p className="comboHead__hint">
            {vendorScope
              ? 'Create and update combos built from your items.'
              : 'Up to 6 combos per meal & box-size. Set a base price, with optional add-ons per choice.'}
          </p>
        </div>
        <button
          type="button"
          className="fi-btn fi-btn-primary comboHead__add"
          onClick={() => setEditing(vendorScope ? { ...emptyCombo(), vendor: vendorScope } : emptyCombo())}
        >
          + Add Combo
        </button>
      </div>

      {error && <div className="ao-error">{error}</div>}

      <div className="fi-content">
        {combos.length === 0 && !busy ? (
          <div className="fi-empty">No combos yet. Add your first combo.</div>
        ) : (
          Object.entries(grouped).map(([label, list]) => (
            <div key={label} className="fi-category">
              <div className="fi-cat-header fi-cat-header--static">
                <strong>{label}</strong>
                <span className="fi-cat-subcount">{list.length} / 6 combos</span>
              </div>
              <div className="fi-cat-body comboGrid">
                {list.map((c) => (
                  <div className="comboCard" key={c._id}>
                    <div className="comboCard__head">
                      <div className="comboCard__name">{c.name || 'Untitled combo'}</div>
                      <div className="comboCard__price">₹{Number(c.price || 0)}<span>/box</span></div>
                    </div>

                    <div className="comboCard__items">{itemSummary(c.items) || 'No items'}</div>

                    <div className="comboCard__foot">
                      <div className="comboCard__tags">
                        {(c.commonItems || []).length > 0 && <span className="comboTag"><FaUtensils /> {c.commonItems.length} included</span>}
                        {(c.addOns || []).length > 0 && <span className="comboTag"><FaPlus /> {c.addOns.length} add-ons</span>}
                        {c.vendor && <span className="comboTag comboTag--vendor"><FaHandshake /> {c.vendor}</span>}
                      </div>
                      <div className="comboCard__actions">
                        <button className="iconButton" aria-label="Edit" onClick={() => setEditing({ ...c, items: c.items || [] })}><FaPen /></button>
                        <button className="iconButton iconButton--danger" aria-label="Delete" onClick={() => setConfirmDelete(c._id)}><FaRegTrashAlt /></button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </div>

      {editing && <ComboModal initial={editing} menu={menu} vendors={vendors} lockVendor={vendorScope} onCancel={() => setEditing(null)} onSave={save} busy={busy} />}

      {confirmDelete && (
        <div className="fi-modal-overlay">
          <div className="fi-modal">
            <div className="fi-modal-header"><h3>Delete combo</h3><button className="fi-close-btn" onClick={() => setConfirmDelete(null)}><FaTimes /></button></div>
            <div className="fi-modal-body"><p>Delete this combo permanently?</p></div>
            <div className="fi-modal-footer">
              <button className="fi-btn" onClick={() => setConfirmDelete(null)}>Cancel</button>
              <button className="fi-btn fi-btn-delete" onClick={() => remove(confirmDelete)} disabled={busy}>Delete</button>
            </div>
          </div>
        </div>
      )}

      {busy && <div className="fi-busy-overlay">Working…</div>}
    </div>
  );
}

function ComboModal({ initial, menu = {}, vendors = [], lockVendor = null, onCancel, onSave, busy }) {
  const sections = Object.keys(menu || {});
  const [combo, setCombo] = useState(() => ({
    ...initial,
    mealSlots: slotsOf(initial).length ? slotsOf(initial) : ['Breakfast'],
    addOns: (initial.addOns || []).map((a) =>
      typeof a === 'string' ? { name: a, price: 0 } : { name: a.name || '', price: Number(a.price) || 0 }
    ),
    items: (initial.items || []).map((it) =>
      typeof it === 'string'
        ? { ...emptyItem(), name: it }
        : it.kind === 'choice'
          ? {
              kind: 'choice',
              name: '',
              label: it.label || '',
              category: it.category || '',
              options: (it.options || []).map((o) =>
                typeof o === 'string' ? { name: o, price: 0 } : { name: o.name || '', price: Number(o.price) || 0 }
              ),
            }
          : { kind: 'fixed', name: it.name || '', label: '', category: '', options: [] }
    ),
  }));
  const count = Number(combo.boxType) || 3;

  // "Included with every box" — Tissue / Cutlery presets + free-text extras
  const initCommon = Array.isArray(initial.commonItems)
    ? initial.commonItems
    : String(initial.commonItems || '').split(',').map((s) => s.trim()).filter(Boolean);
  const isPreset = (x) => /^tissue/i.test(x) || /^cutlery/i.test(x);
  const [tissue, setTissue] = useState(initCommon.some((x) => /^tissue/i.test(x)));
  const [cutlery, setCutlery] = useState(initCommon.some((x) => /^cutlery/i.test(x)));
  const [commonExtra, setCommonExtra] = useState(initCommon.filter((x) => !isPreset(x)).join(', '));

  // keep the items array sized to the box type
  useEffect(() => {
    setCombo((c) => {
      const items = Array.from({ length: count }, (_, i) => (c.items || [])[i] || emptyItem());
      return { ...c, items };
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [count]);

  const set = (k, v) => setCombo((c) => ({ ...c, [k]: v }));
  // changing the vendor resets choice options (they were scoped to the old vendor)
  const setVendor = (vendor) => setCombo((c) => ({
    ...c,
    vendor,
    items: (c.items || []).map((it) => (it.kind === 'choice' ? { ...it, options: [] } : it)),
  }));
  const toggleSlot = (slot) => setCombo((c) => {
    const cur = c.mealSlots || [];
    const next = cur.includes(slot) ? cur.filter((s) => s !== slot) : [...cur, slot];
    return { ...c, mealSlots: next };
  });
  const setItem = (i, patch) => setCombo((c) => {
    const items = [...(c.items || [])];
    items[i] = { ...items[i], ...patch };
    return { ...c, items };
  });

  // toggle a menu item in/out of a choice slot's option list (price seeds from the vendor's price)
  const toggleOpt = (i, name, price = 0) => setCombo((c) => {
    const items = [...(c.items || [])];
    const it = { ...items[i] };
    const opts = [...(it.options || [])];
    const at = opts.findIndex((o) => o.name === name);
    if (at >= 0) opts.splice(at, 1);
    else opts.push({ name, price: Number(price) || 0 });
    it.options = opts;
    items[i] = it;
    return { ...c, items };
  });
  const setOptPrice = (i, name, price) => setCombo((c) => {
    const items = [...(c.items || [])];
    const it = { ...items[i] };
    it.options = (it.options || []).map((o) => (o.name === name ? { ...o, price } : o));
    items[i] = it;
    return { ...c, items };
  });

  // recommended add-ons (optional paid extras)
  const addAddOn = () => setCombo((c) => ({ ...c, addOns: [...(c.addOns || []), { name: '', price: 0 }] }));
  const setAddOn = (i, patch) => setCombo((c) => {
    const addOns = [...(c.addOns || [])];
    addOns[i] = { ...addOns[i], ...patch };
    return { ...c, addOns };
  });
  const removeAddOn = (i) => setCombo((c) => ({ ...c, addOns: (c.addOns || []).filter((_, idx) => idx !== i) }));

  const submit = (e) => {
    e.preventDefault();
    if (!combo.name.trim()) { alert('Enter a combo name'); return; }
    if (!(combo.mealSlots || []).length) { alert('Pick at least one meal'); return; }
    const commonItems = [
      tissue && 'Tissue',
      cutlery && 'Cutlery',
      ...commonExtra.split(',').map((s) => s.trim()).filter(Boolean),
    ].filter(Boolean).join(', ');
    onSave({ ...combo, commonItems });
  };

  return (
    <div className="fi-modal-overlay">
      <form className="fi-modal modal-large" onSubmit={submit}>
        <div className="fi-modal-header">
          <h3>{combo._id ? 'Edit combo' : 'Add combo'}</h3>
          <button type="button" className="fi-close-btn" onClick={onCancel}><FaTimes /></button>
        </div>

        <div className="fi-modal-body">
          <div className="fi-edit-grid">
            <label className="full">
              <div className="fi-label">Vendor <span className="fi-label-note">(scopes which items you can pick)</span></div>
              <select value={combo.vendor || ''} onChange={(e) => setVendor(e.target.value)} disabled={!!lockVendor}>
                <option value="">— Select vendor —</option>
                {vendors.map((v) => (
                  <option key={v._id || v.name} value={v.name}>{v.name}</option>
                ))}
                {combo.vendor && !vendors.some((v) => v.name === combo.vendor) && (
                  <option value={combo.vendor}>{combo.vendor}</option>
                )}
              </select>
            </label>
            <label className="full">
              <div className="fi-label">Combo name</div>
              <input type="text" value={combo.name} onChange={(e) => set('name', e.target.value)} placeholder="e.g. South Indian Breakfast" />
            </label>
            <div className="full">
              <div className="fi-label">Meal <span className="fi-label-note">(pick one or more)</span></div>
              <div className="comboSlots">
                {MEAL_SLOTS.map((m) => {
                  const on = (combo.mealSlots || []).includes(m);
                  return (
                    <button
                      type="button"
                      key={m}
                      className={`comboSlot ${on ? 'is-on' : ''}`}
                      aria-pressed={on}
                      onClick={() => toggleSlot(m)}
                    >
                      {m}
                    </button>
                  );
                })}
              </div>
            </div>
            <label>
              <div className="fi-label">Box size</div>
              <select value={combo.boxType} onChange={(e) => set('boxType', Number(e.target.value))}>
                {BOX_SIZES.map((b) => <option key={b} value={b}>{b} items</option>)}
              </select>
            </label>
            <label>
              <div className="fi-label">Base price (₹ per box)</div>
              <input type="number" min={0} value={combo.price} onChange={(e) => set('price', e.target.value)} />
            </label>
            <label>
              <div className="fi-label">Active</div>
              <select value={combo.active ? 'true' : 'false'} onChange={(e) => set('active', e.target.value === 'true')}>
                <option value="true">Active</option>
                <option value="false">Inactive</option>
              </select>
            </label>
          </div>

          <div className="section">
            <div className="fi-section-title">Items ({count})</div>
            <p className="combo-hint">Mark each slot as <strong>Fixed</strong> (a set dish) or <strong>Choice</strong> (customer picks from options).</p>
            <div className="comboItems">
              {Array.from({ length: count }).map((_, i) => {
                const it = (combo.items || [])[i] || emptyItem();
                return (
                  <div className="comboItem" key={i}>
                    <div className="comboItem__head">
                      <span className="comboItems__no">{i + 1}</span>
                      <div className="comboItem__kind">
                        <button type="button" className={it.kind === 'fixed' ? 'is-active' : ''} onClick={() => setItem(i, { kind: 'fixed' })}>Fixed</button>
                        <button type="button" className={it.kind === 'choice' ? 'is-active' : ''} onClick={() => setItem(i, { kind: 'choice' })}>Choice</button>
                      </div>
                    </div>
                    {it.kind === 'choice' ? (
                      <div className="comboItem__fields">
                        <input type="text" value={it.label} onChange={(e) => setItem(i, { label: e.target.value })} placeholder="Label (e.g. Soup, Rice, Noodles)" />
                        <select value={it.category || ''} onChange={(e) => setItem(i, { category: e.target.value, options: [] })}>
                          <option value="">— Pick a menu category —</option>
                          {sections.map((s) => <option key={s} value={s}>{s}</option>)}
                        </select>
                        {!combo.vendor ? (
                          <p className="combo-hint">Select a vendor above to choose items.</p>
                        ) : it.category ? (
                          <div className="choiceOpts">
                            <p className="combo-hint">Tick the options a customer can choose. The price seeds from the vendor; add <strong>+₹</strong> for any premium pick.</p>
                            {itemsForVendor(menu, it.category, combo.vendor).map((opt) => {
                              const sel = (it.options || []).find((o) => o.name === opt.name);
                              return (
                                <div className={`choiceOpt ${sel ? 'is-on' : ''}`} key={opt.name}>
                                  <label className="choiceOpt__pick">
                                    <input type="checkbox" checked={!!sel} onChange={() => toggleOpt(i, opt.name, opt.price)} />
                                    <span>{opt.name}</span>
                                  </label>
                                  {sel && (
                                    <span className="choiceOpt__price">
                                      ₹
                                      <input
                                        type="number"
                                        min={0}
                                        value={sel.price}
                                        onChange={(e) => setOptPrice(i, opt.name, Number(e.target.value) || 0)}
                                      />
                                    </span>
                                  )}
                                </div>
                              );
                            })}
                            {itemsForVendor(menu, it.category, combo.vendor).length === 0 && (
                              <p className="combo-hint">This vendor has no items in this category.</p>
                            )}
                          </div>
                        ) : (
                          <p className="combo-hint">Pick a category to choose its options.</p>
                        )}
                      </div>
                    ) : (
                      <input type="text" value={it.name} onChange={(e) => setItem(i, { name: e.target.value })} placeholder={`Dish name`} />
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="section">
            <div className="fi-section-title">Included with every box</div>
            <p className="combo-hint">Comes free with the box (not counted in the item total).</p>
            <div className="includeRow">
              <label className={`includeChip ${tissue ? 'is-on' : ''}`}>
                <input type="checkbox" checked={tissue} onChange={(e) => setTissue(e.target.checked)} />
                <span>Tissue</span>
              </label>
              <label className={`includeChip ${cutlery ? 'is-on' : ''}`}>
                <input type="checkbox" checked={cutlery} onChange={(e) => setCutlery(e.target.checked)} />
                <span>Cutlery</span>
              </label>
            </div>
            <input
              type="text"
              value={commonExtra}
              onChange={(e) => setCommonExtra(e.target.value)}
              placeholder="Anything else? e.g. Mineral Water, Salt &amp; pepper"
            />
          </div>

          <div className="section">
            <div className="fi-section-title">Recommended add-ons</div>
            <p className="combo-hint">Optional paid extras a customer can add — dessert, water bottle, soft drink, ice cream…</p>
            <div className="addOns">
              {(combo.addOns || []).map((a, i) => (
                <div className="addOn" key={i}>
                  <input
                    type="text"
                    className="addOn__name"
                    value={a.name}
                    onChange={(e) => setAddOn(i, { name: e.target.value })}
                    placeholder="e.g. Gulab Jamun"
                  />
                  <span className="addOn__price">₹
                    <input
                      type="number"
                      min={0}
                      value={a.price}
                      onChange={(e) => setAddOn(i, { price: Number(e.target.value) || 0 })}
                    />
                  </span>
                  <button type="button" className="addOn__del" onClick={() => removeAddOn(i)} aria-label="Remove add-on"><FaTimes /></button>
                </div>
              ))}
              <button type="button" className="addOn__add" onClick={addAddOn}>+ Add add-on</button>
            </div>
          </div>
        </div>

        <div className="fi-modal-footer">
          <button type="button" className="fi-btn" onClick={onCancel} disabled={busy}>Cancel</button>
          <button type="submit" className="fi-btn fi-btn-primary" disabled={busy}>Save combo</button>
        </div>
      </form>
    </div>
  );
}
