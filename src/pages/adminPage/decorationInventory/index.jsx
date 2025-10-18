import React, { useEffect, useMemo, useRef, useState, useCallback } from 'react';
import '../inventory.scss';
import { deleteService, fetchInventory, updateService } from '../../../services/services';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';

const deepClone = (v) => JSON.parse(JSON.stringify(v));
const generateId = () => `${Date.now().toString(36)}-${Math.random().toString(36).slice(2,9)}`;

/**
 * DecorationsInventory
 * - Fetches decorations via fetchInventory()
 * - Allows editing / adding / deleting items
 * - Calls updateDecoration(payload) on save (full item body)
 */
export default function DecorationsInventory({
  defaultServiceAreas = [
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
  const [editing, setEditing] = useState(null);
  const [addingTo, setAddingTo] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [busy, setBusy] = useState(false);
  const isMounted = useRef(true);
  const loadedRef = useRef(false);

  useEffect(() => {
    isMounted.current = true;
    return () => { isMounted.current = false; };
  }, []);

  // --- Load decorations once on mount ---
  useEffect(() => {
    if (loadedRef.current) return;
    loadedRef.current = true;

    const load = async () => {
      setBusy(true);
      try {
        const data = await fetchInventory('decorations');
        if (isMounted.current) {
          // assume API directly returns an array
          setItems(Array.isArray(data) ? data : []);
        }
      } catch (err) {
        console.error('Failed to load decorations', err);
        if (isMounted.current) setItems([]);
      } finally {
        if (isMounted.current) setBusy(false);
      }
    };

    load();
  }, []);

  // --- Group by typeLabel / type ---
  const grouped = useMemo(() => {
    const g = {};
    for (const it of items || []) {
      const label = it.typeLabel || it.type || 'Other';
      if (!g[label]) g[label] = [];
      g[label].push(it);
    }
    return g;
  }, [items]);

  // --- Search filter ---
  const filtered = useMemo(() => {
    if (!search.trim()) return grouped;
    const q = search.trim().toLowerCase();
    const out = {};
    for (const [label, arr] of Object.entries(grouped)) {
      const filteredItems = arr.filter(it =>
        `${it.title} ${it.code || ''} ${it.description || ''} ${(it.events||[]).join(' ')} ${(it.vendor?.name)||''}`
          .toLowerCase()
          .includes(q)
      );
      if (filteredItems.length) out[label] = filteredItems;
    }
    return out;
  }, [search, grouped]);

  const upsertLocal = (item) => setItems(prev => {
    const copy = deepClone(prev || []);
    const idx = copy.findIndex(p => String(p._id) === String(item._id));
    if (idx >= 0) copy[idx] = item;
    else copy.push(item);
    return copy;
  });

  const deleteLocal = (_id) => setItems(prev => (prev || []).filter(p => String(p._id) !== String(_id)));

  const openEdit = (item) => setEditing(deepClone(item));

  const openAdd = () => {
    const newItem = {
      _id: generateId(),
      code: `dec-${Date.now()}`,
      type: 'generic_decoration',
      typeLabel: 'Decoration',
      title: '',
      description: '',
      price: 0,
      currency: 'INR',
      inclusions: [],
      thingsToRemember: [],
      whatYouCanExpect: [],
      imgs: [],
      vendor: {
        id: '',
        name: '',
        // normalize to mapping here, modal expects mapping
        serviceableArea: defaultServiceAreas.reduce((a, r) => ({ ...a, [r]: true }), {}),
      },
      events: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setAddingTo({ item: newItem });
  };

  const saveItem = async (item) => {
    try {
      setBusy(true);
      const out = deepClone(item);
      out.updatedAt = new Date().toISOString();
      if (!out.createdAt) out.createdAt = new Date().toISOString();

      // convert vendor.serviceableArea mapping -> array (some saved data uses array)
      if (out.vendor?.serviceableArea && typeof out.vendor.serviceableArea === 'object' && !Array.isArray(out.vendor.serviceableArea)) {
        out.vendor.serviceableArea = Object.entries(out.vendor.serviceableArea)
          .filter(([, val]) => !!val)
          .map(([k]) => k);
      }

      await updateService('decoration', out);
      if (onSave) await onSave(out);

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
      await deleteService('decoration', _id);
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

  const renderCard = (it) => (
    <div className="dec-card" key={String(it._id)}>
      <div className="dec-card-media">
        {it.imgs?.[0] ? (
          <img src={it.imgs[0]} alt={it.title || 'preview'} />
        ) : (
          <div className="dec-card-placeholder">No image</div>
        )}
      </div>

      <div className="dec-card-body">
        <div className="dec-card-title">{it.title || 'Untitled'}</div>
        <div className="dec-card-sub">{it.vendor?.name || ''}</div>
        <div className="dec-card-footer">
          <div className="dec-card-price">₹{Number(it.price || 0)}</div>
          <div className="dec-card-actions">
            <button className="fi-btn fi-btn-edit" aria-label="edit" onClick={() => openEdit(it)}>
              <EditIcon fontSize="small" />
            </button>
            <button className="fi-btn fi-btn-delete" aria-label="delete" onClick={() => setConfirmDelete(String(it._id))}>
              <DeleteIcon fontSize="small" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="fi-root" data-busy={busy}>
      <div className="fi-header">
        <h2>Decorations Inventory</h2>
        <div className="fi-controls">
          <input
            placeholder="Search title, code, vendor..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="fi-search"
          />
          <div className="fi-actions-right">
            <button className="fi-btn fi-btn-primary" onClick={openAdd}>+ Add Decoration</button>
          </div>
        </div>
      </div>

      <div className="fi-content">
        {Object.keys(filtered).length === 0 ? (
          <div className="fi-empty">No decorations found.</div>
        ) : (
          Object.entries(filtered).map(([label, arr]) => (
            <div key={label} className="fi-category">
              <button className="fi-cat-header open">
                <strong>{label}</strong>
                <span className="fi-cat-subcount">{arr.length} items</span>
              </button>

              <div className="fi-cat-body">
                <div className="fi-cards-grid">
                  {arr.map(renderCard)}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {editing && (
        <DecorationModalFull
          initialItem={editing}
          defaultServiceAreas={defaultServiceAreas}
          onCancel={() => setEditing(null)}
          onSave={saveItem}
          busy={busy}
        />
      )}

      {addingTo && (
        <DecorationModalFull
          initialItem={addingTo.item}
          defaultServiceAreas={defaultServiceAreas}
          onCancel={() => setAddingTo(null)}
          onSave={saveItem}
          busy={busy}
        />
      )}

      {confirmDelete && (
        <div className="fi-modal-overlay">
          <div className="fi-modal">
            <div className="fi-modal-header">
              <h3>Confirm Delete</h3>
              <button className="fi-close-btn" onClick={() => setConfirmDelete(null)}>✕</button>
            </div>
            <div className="fi-modal-body">
              <p>Are you sure you want to permanently delete this decoration?</p>
              <div className="modal-actions">
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

/* ------------------------- FULL MODAL (all fields) ---------------------------- */

function DecorationModalFull({ initialItem, defaultServiceAreas = [], onCancel, onSave, busy }) {
  const normalizeVendorAreas = useCallback((vendor) => {
    // vendor.serviceableArea might be array or object mapping; normalize to mapping
    const sa = vendor?.serviceableArea;
    if (Array.isArray(sa)) {
      return sa.reduce((acc, a) => ({ ...acc, [a]: true }), {});
    } else if (typeof sa === 'object' && sa !== null) {
      return { ...sa };
    }
    return defaultServiceAreas.reduce((a, r) => ({ ...a, [r]: false }), {});
  }, [defaultServiceAreas]);

  const [item, setItem] = useState(() => {
    const it = deepClone(initialItem || {});
    // ensure arrays exist
    it.imgs = Array.isArray(it.imgs) ? it.imgs.slice() : [];
    it.inclusions = Array.isArray(it.inclusions) ? it.inclusions.slice() : [];
    it.thingsToRemember = Array.isArray(it.thingsToRemember) ? it.thingsToRemember.slice() : [];
    it.whatYouCanExpect = Array.isArray(it.whatYouCanExpect) ? it.whatYouCanExpect.slice() : [];
    it.events = Array.isArray(it.events) ? it.events.slice() : [];
    it.vendor = it.vendor || { id: '', name: '', serviceableArea: {} };
    it.vendor.serviceableArea = normalizeVendorAreas(it.vendor);
    return it;
  });
  const [errors, setErrors] = useState({});
  const [newImageUrl, setNewImageUrl] = useState('');
  const [newInclusion, setNewInclusion] = useState('');
  const [newThing, setNewThing] = useState('');
  const [newExpect, setNewExpect] = useState('');

  useEffect(() => {
    // when initialItem changes, reset state
    const it = deepClone(initialItem || {});
    it.imgs = Array.isArray(it.imgs) ? it.imgs.slice() : [];
    it.inclusions = Array.isArray(it.inclusions) ? it.inclusions.slice() : [];
    it.thingsToRemember = Array.isArray(it.thingsToRemember) ? it.thingsToRemember.slice() : [];
    it.whatYouCanExpect = Array.isArray(it.whatYouCanExpect) ? it.whatYouCanExpect.slice() : [];
    it.events = Array.isArray(it.events) ? it.events.slice() : [];
    it.vendor = it.vendor || { id: '', name: '', serviceableArea: {} };
    it.vendor.serviceableArea = normalizeVendorAreas(it.vendor);
    setItem(it);
    setErrors({});
    setNewImageUrl('');
    setNewInclusion('');
    setNewThing('');
    setNewExpect('');
  }, [initialItem, normalizeVendorAreas]);

  const change = (k, v) => {
    setItem((prev) => ({ ...prev, [k]: v }));
    setErrors((prev) => ({ ...prev, [k]: '' }));
  };

  const changeNested = (path, val) => {
    // simple nested setter for vendor fields: path: ['vendor','name'] etc
    setItem((prev) => {
      const copy = deepClone(prev);
      let cur = copy;
      for (let i = 0; i < path.length - 1; i++) {
        cur[path[i]] = cur[path[i]] || {};
        cur = cur[path[i]];
      }
      cur[path[path.length - 1]] = val;
      return copy;
    });
  };

  // <-- FIX: immutable update so React picks up changes
  const toggleVendorArea = (area) => {
    setItem((prev) => {
      const currentVendor = prev.vendor || { serviceableArea: {} };
      // normalize currentAreas to mapping safely
      const currentAreas = (currentVendor.serviceableArea && typeof currentVendor.serviceableArea === 'object' && !Array.isArray(currentVendor.serviceableArea))
        ? { ...currentVendor.serviceableArea }
        : (Array.isArray(currentVendor.serviceableArea) ? currentVendor.serviceableArea.reduce((a, r) => ({ ...a, [r]: true }), {}) : {});

      const newVendor = {
        ...currentVendor,
        serviceableArea: {
          ...currentAreas,
          [area]: !currentAreas[area],
        },
      };

      return { ...prev, vendor: newVendor };
    });
  };

  const toggleEvent = (ev) => {
    const arr = Array.isArray(item.events) ? [...item.events] : [];
    const idx = arr.indexOf(ev);
    if (idx >= 0) arr.splice(idx, 1);
    else arr.push(ev);
    change('events', arr);
  };

  // arrays: images
  const addImage = () => {
    const url = (newImageUrl || '').trim();
    if (!url) return;
    setItem((prev) => ({ ...prev, imgs: [...(prev.imgs || []), url] }));
    setNewImageUrl('');
  };
  const removeImage = (index) => {
    setItem((prev) => ({ ...prev, imgs: (prev.imgs || []).filter((_, i) => i !== index) }));
  };

  // arrays: inclusions, thingsToRemember, whatYouCanExpect
  const addToArrayField = (field, value, clearSetter) => {
    const v = (value || '').trim();
    if (!v) return;
    setItem((prev) => ({ ...prev, [field]: [...(prev[field] || []), v] }));
    clearSetter('');
  };
  const removeFromArrayField = (field, idx) => {
    setItem((prev) => ({ ...prev, [field]: (prev[field] || []).filter((_, i) => i !== idx) }));
  };

  const validate = () => {
    const e = {};
    if (!item.title || !String(item.title).trim()) e.title = 'Title required';
    if (item.price === undefined || item.price === null || String(item.price).trim() === '') e.price = 'Price required';
    return e;
  };

  const handleSubmit = () => {
    const e = validate();
    if (Object.keys(e).length) {
      setErrors(e);
      return;
    }

    // prepare payload: convert vendor.serviceableArea mapping -> array
    const out = deepClone(item);
    if (out.vendor?.serviceableArea && typeof out.vendor.serviceableArea === 'object' && !Array.isArray(out.vendor.serviceableArea)) {
      out.vendor.serviceableArea = Object.entries(out.vendor.serviceableArea)
        .filter(([, val]) => !!val)
        .map(([k]) => k);
    }

    // ensure numeric price
    out.price = Number(out.price) || 0;

    // ensure _id
    if (!out._id) out._id = generateId();
    if (!out.code) out.code = `dec-${Date.now()}`;
    onSave(out);
  };

  const sampleEvents = ['Birthday', 'Anniversary', 'Corporate', 'Baby Shower', 'Engagement'];

  return (
    <div className="fi-modal-overlay">
      <div className="fi-modal decorations-modal">
        <div className="fi-modal-header">
          <h3>{initialItem && initialItem._id ? 'Edit Decoration' : 'Add Decoration'}</h3>
          <button className="fi-close-btn" onClick={onCancel}>✕</button>
        </div>

        <div className="fi-modal-body">
          {/* metadata row */}
          <div className="fi-edit-grid">
            <label>
              <div className="fi-label">Code</div>
              <input type="text" value={item.code || ''} onChange={(e) => change('code', e.target.value)} />
            </label>

            <label>
              <div className="fi-label">Type</div>
              <input type="text" value={item.type || ''} onChange={(e) => change('type', e.target.value)} />
            </label>

            <label>
              <div className="fi-label">Type Label</div>
              <input type="text" value={item.typeLabel || ''} onChange={(e) => change('typeLabel', e.target.value)} />
            </label>

            <label className="full">
              <div className="fi-label">Title</div>
              <input type="text" value={item.title || ''} onChange={(e) => change('title', e.target.value)} />
              {errors.title && <div className="fi-field-error">{errors.title}</div>}
            </label>

            <label>
              <div className="fi-label">Price (INR)</div>
              <input type="number" value={item.price || 0} onChange={(e) => change('price', e.target.value)} />
              {errors.price && <div className="fi-field-error">{errors.price}</div>}
            </label>

            <label className="full">
              <div className="fi-label">Description</div>
              <textarea value={item.description || ''} onChange={(e) => change('description', e.target.value)} />
            </label>
          </div>

          {/* images */}
          <div className="section images-section">
            <div className="fi-label">Images</div>
            <div className="section-header">
              <div className="images-control">
                <input
                  className="images-input"
                  placeholder="paste image URL and click Add"
                  value={newImageUrl}
                  onChange={(e) => setNewImageUrl(e.target.value)}
                />
                <button className="fi-btn fi-btn-primary" onClick={addImage} disabled={!newImageUrl.trim()}>Add</button>
              </div>
            </div>

            <div className="img-thumb-list">
              {(item.imgs || []).map((u, idx) => (
                <div key={idx} className="img-thumb">
                  <img src={u} alt={`img-${idx}`} />
                  <button className="fi-btn" onClick={() => removeImage(idx)} aria-label="remove">Remove</button>
                </div>
              ))}
              {(item.imgs || []).length === 0 && (<div className="small-muted">No images — add URLs above.</div>)}
            </div>
          </div>

          {/* inclusions / thingsToRemember / whatYouCanExpect */}
          <div className="section arrays-section">
            <div className="three-col-grid">
              <div className="array-block">
                <div className="array-header">
                  <div className="fi-label">Inclusions</div>
                  <div className="array-control">
                    <input type="text" value={newInclusion} onChange={(e) => setNewInclusion(e.target.value)} placeholder="add inclusion" />
                    <button className="fi-btn fi-btn-primary" onClick={() => addToArrayField('inclusions', newInclusion, setNewInclusion)} disabled={!newInclusion.trim()}>Add</button>
                  </div>
                </div>
                <ul>
                  {(item.inclusions || []).map((v, i) => (
                    <li key={i} className="array-item chip">
                      <span className="array-text">{v}</span>
                      <button className="fi-btn" onClick={() => removeFromArrayField('inclusions', i)}>Remove</button>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="array-block">
                <div className="array-header">
                  <div className="fi-label">Things to remember</div>
                  <div className="array-control">
                    <input type="text" value={newThing} onChange={(e) => setNewThing(e.target.value)} placeholder="add note" />
                    <button className="fi-btn fi-btn-primary" onClick={() => addToArrayField('thingsToRemember', newThing, setNewThing)} disabled={!newThing.trim()}>Add</button>
                  </div>
                </div>
                <ul>
                  {(item.thingsToRemember || []).map((v, i) => (
                    <li key={i} className="array-item chip">
                      <span className="array-text">{v}</span>
                      <button className="fi-btn" onClick={() => removeFromArrayField('thingsToRemember', i)}>Remove</button>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="array-block">
                <div className="array-header">
                  <div className="fi-label">What you can expect</div>
                  <div className="array-control">
                    <input type="text" value={newExpect} onChange={(e) => setNewExpect(e.target.value)} placeholder="add expectation" />
                    <button className="fi-btn fi-btn-primary" onClick={() => addToArrayField('whatYouCanExpect', newExpect, setNewExpect)} disabled={!newExpect.trim()}>Add</button>
                  </div>
                </div>
                <ul>
                  {(item.whatYouCanExpect || []).map((v, i) => (
                    <li key={i} className="array-item chip">
                      <span className="array-text">{v}</span>
                      <button className="fi-btn" onClick={() => removeFromArrayField('whatYouCanExpect', i)}>Remove</button>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* vendor */}
          <div className="section vendor-section">
            <div className="vendor-block">
              <div className="vendor-grid">
                <label>
                  <div className="fi-label">Vendor ID</div>
                  <input type="text" value={item.vendor?.id || ''} onChange={(e) => changeNested(['vendor','id'], e.target.value)} />
                </label>
                <label>
                  <div className="fi-label">Vendor Name</div>
                  <input type="text" value={item.vendor?.name || ''} onChange={(e) => changeNested(['vendor','name'], e.target.value)} />
                </label>
              </div>

              <div className="fi-label" style={{ marginTop: 8 }}>Serviceable Areas</div>
              <div className="service-areas">
                {defaultServiceAreas.map((area) => (
                  <label key={area} className="area-label chip">
                    <input
                      type="checkbox"
                      checked={!!item.vendor?.serviceableArea?.[area]}
                      onChange={() => toggleVendorArea(area)}
                    />
                    <span className="area-text">{area}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* events */}
          <div className="section events-section">
            <div className="fi-label">Events</div>
            <div className="events-row">
              {sampleEvents.map((ev) => (
                <label key={ev} className="chip" style={{ alignItems: 'center' }}>
                  <input
                    type="checkbox"
                    checked={(item.events || []).includes(ev)}
                    onChange={() => toggleEvent(ev)}
                  />
                  <span>{ev}</span>
                </label>
              ))}
            </div>
          </div>

          {/* modal actions */}
          <div className="modal-actions modal-actions-bottom">
            <button className="fi-btn" onClick={onCancel} disabled={busy}>Cancel</button>
            <button className="fi-btn fi-btn-primary" onClick={handleSubmit} disabled={busy}>Save changes</button>
          </div>
        </div>
      </div>
    </div>
  );
}
