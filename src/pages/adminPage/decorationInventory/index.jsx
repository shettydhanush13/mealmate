import React, { useEffect, useMemo, useRef, useState, useCallback } from 'react';
import '../inventory.scss';
import { deleteService, fetchInventory, updateService } from '../../../services/services';
import { FaPen, FaRegTrashAlt, FaTimes } from "react-icons/fa";

const deepClone = (v) => JSON.parse(JSON.stringify(v));
const generateId = () => `${Date.now().toString(36)}-${Math.random().toString(36).slice(2,9)}`;

/**
 * DecorationsInventory
 * - Fetches decorations via fetchInventory()
 * - Allows editing / adding / deleting items
 * - Calls updateService('decoration', payload) on save (full item body)
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
        `${it.title} ${it.code || ''} ${it.description || ''} ${(it.events || []).join(' ')} ${(it.vendor?.name) || ''}`
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

      // convert vendor.serviceableArea mapping -> array
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
          <img src={it.imgs[0]} alt={it.title || 'preview'} loading="lazy" />
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
            <button className="fi-btn fi-btn-edit" aria-label="Edit" onClick={() => openEdit(it)}>
              <FaPen />
            </button>
            <button className="fi-btn fi-btn-delete" aria-label="Delete" onClick={() => setConfirmDelete(String(it._id))}>
              <FaRegTrashAlt />
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
              <div className="fi-cat-header fi-cat-header--static">
                <strong>{label}</strong>
                <span className="fi-cat-subcount">{arr.length} items</span>
              </div>

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
              <button className="fi-close-btn" onClick={() => setConfirmDelete(null)}><FaTimes /></button>
            </div>
            <div className="fi-modal-body">
              <p>Are you sure you want to permanently delete this decoration?</p>
            </div>
            <div className="fi-modal-footer">
              <button className="fi-btn" onClick={() => setConfirmDelete(null)}>Cancel</button>
              <button className="fi-btn fi-btn-delete" onClick={() => confirmDeleteItem(confirmDelete)} disabled={busy}>Delete</button>
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
    const sa = vendor?.serviceableArea;
    if (Array.isArray(sa)) {
      return sa.reduce((acc, a) => ({ ...acc, [a]: true }), {});
    } else if (typeof sa === 'object' && sa !== null) {
      return { ...sa };
    }
    return defaultServiceAreas.reduce((a, r) => ({ ...a, [r]: false }), {});
  }, [defaultServiceAreas]);

  const buildState = useCallback((src) => {
    const it = deepClone(src || {});
    it.imgs = Array.isArray(it.imgs) ? it.imgs.slice() : [];
    it.inclusions = Array.isArray(it.inclusions) ? it.inclusions.slice() : [];
    it.thingsToRemember = Array.isArray(it.thingsToRemember) ? it.thingsToRemember.slice() : [];
    it.whatYouCanExpect = Array.isArray(it.whatYouCanExpect) ? it.whatYouCanExpect.slice() : [];
    it.events = Array.isArray(it.events) ? it.events.slice() : [];
    it.vendor = it.vendor || { id: '', name: '', serviceableArea: {} };
    it.vendor.serviceableArea = normalizeVendorAreas(it.vendor);
    return it;
  }, [normalizeVendorAreas]);

  const [item, setItem] = useState(() => buildState(initialItem));
  const [errors, setErrors] = useState({});
  const [newImageUrl, setNewImageUrl] = useState('');
  const [newInclusion, setNewInclusion] = useState('');
  const [newThing, setNewThing] = useState('');
  const [newExpect, setNewExpect] = useState('');

  useEffect(() => {
    setItem(buildState(initialItem));
    setErrors({});
    setNewImageUrl('');
    setNewInclusion('');
    setNewThing('');
    setNewExpect('');
  }, [initialItem, buildState]);

  const change = (k, v) => {
    setItem((prev) => ({ ...prev, [k]: v }));
    setErrors((prev) => ({ ...prev, [k]: '' }));
  };

  const changeNested = (path, val) => {
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

  const toggleVendorArea = (area) => {
    setItem((prev) => {
      const currentVendor = prev.vendor || { serviceableArea: {} };
      const currentAreas = (currentVendor.serviceableArea && typeof currentVendor.serviceableArea === 'object' && !Array.isArray(currentVendor.serviceableArea))
        ? { ...currentVendor.serviceableArea }
        : (Array.isArray(currentVendor.serviceableArea) ? currentVendor.serviceableArea.reduce((a, r) => ({ ...a, [r]: true }), {}) : {});

      return {
        ...prev,
        vendor: { ...currentVendor, serviceableArea: { ...currentAreas, [area]: !currentAreas[area] } },
      };
    });
  };

  const toggleEvent = (ev) => {
    const arr = Array.isArray(item.events) ? [...item.events] : [];
    const idx = arr.indexOf(ev);
    if (idx >= 0) arr.splice(idx, 1);
    else arr.push(ev);
    change('events', arr);
  };

  const addImage = () => {
    const url = (newImageUrl || '').trim();
    if (!url) return;
    setItem((prev) => ({ ...prev, imgs: [...(prev.imgs || []), url] }));
    setNewImageUrl('');
  };
  const removeImage = (index) => {
    setItem((prev) => ({ ...prev, imgs: (prev.imgs || []).filter((_, i) => i !== index) }));
  };

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
    const out = deepClone(item);
    if (out.vendor?.serviceableArea && typeof out.vendor.serviceableArea === 'object' && !Array.isArray(out.vendor.serviceableArea)) {
      out.vendor.serviceableArea = Object.entries(out.vendor.serviceableArea)
        .filter(([, val]) => !!val)
        .map(([k]) => k);
    }
    out.price = Number(out.price) || 0;
    if (!out._id) out._id = generateId();
    if (!out.code) out.code = `dec-${Date.now()}`;
    onSave(out);
  };

  const sampleEvents = ['Birthday', 'Anniversary', 'Corporate', 'Baby Shower', 'Engagement'];

  return (
    <div className="fi-modal-overlay">
      <div className="fi-modal modal-large decorations-modal">
        <div className="fi-modal-header">
          <h3>{initialItem && initialItem._id ? 'Edit Decoration' : 'Add Decoration'}</h3>
          <button className="fi-close-btn" onClick={onCancel}><FaTimes /></button>
        </div>

        <div className="fi-modal-body">
          {/* Basics */}
          <div className="fi-edit-grid">
            <label className="full">
              <div className="fi-label">Title</div>
              <input type="text" value={item.title || ''} onChange={(e) => change('title', e.target.value)} placeholder="e.g. Balloon Arch Backdrop" />
              {errors.title && <div className="fi-field-error">{errors.title}</div>}
            </label>

            <label>
              <div className="fi-label">Price (INR)</div>
              <input type="number" value={item.price || 0} onChange={(e) => change('price', e.target.value)} />
              {errors.price && <div className="fi-field-error">{errors.price}</div>}
            </label>

            <label>
              <div className="fi-label">Type Label</div>
              <input type="text" value={item.typeLabel || ''} onChange={(e) => change('typeLabel', e.target.value)} />
            </label>

            <label>
              <div className="fi-label">Code</div>
              <input type="text" value={item.code || ''} onChange={(e) => change('code', e.target.value)} />
            </label>

            <label>
              <div className="fi-label">Type</div>
              <input type="text" value={item.type || ''} onChange={(e) => change('type', e.target.value)} />
            </label>

            <label className="full">
              <div className="fi-label">Description</div>
              <textarea value={item.description || ''} onChange={(e) => change('description', e.target.value)} />
            </label>
          </div>

          {/* Images */}
          <div className="section images-section">
            <div className="fi-section-title">Images</div>
            <div className="images-control">
              <input
                className="images-input"
                placeholder="Paste an image URL and click Add"
                value={newImageUrl}
                onChange={(e) => setNewImageUrl(e.target.value)}
              />
              <button className="fi-btn fi-btn-primary" onClick={addImage} disabled={!newImageUrl.trim()}>Add</button>
            </div>

            <div className="img-thumb-list">
              {(item.imgs || []).map((u, idx) => (
                <div key={idx} className="img-thumb">
                  <img src={u} alt={`img-${idx}`} loading="lazy" />
                  <button className="img-remove" aria-label="Remove image" onClick={() => removeImage(idx)}><FaTimes /></button>
                </div>
              ))}
              {(item.imgs || []).length === 0 && (<div className="small-muted">No images — add URLs above.</div>)}
            </div>
          </div>

          {/* Details */}
          <div className="section arrays-section">
            <div className="fi-section-title">Details</div>
            <div className="three-col-grid">
              <ListEditor
                title="Inclusions" placeholder="add inclusion"
                value={newInclusion} setValue={setNewInclusion} list={item.inclusions || []}
                onAdd={() => addToArrayField('inclusions', newInclusion, setNewInclusion)}
                onRemove={(i) => removeFromArrayField('inclusions', i)}
              />
              <ListEditor
                title="Things to remember" placeholder="add note"
                value={newThing} setValue={setNewThing} list={item.thingsToRemember || []}
                onAdd={() => addToArrayField('thingsToRemember', newThing, setNewThing)}
                onRemove={(i) => removeFromArrayField('thingsToRemember', i)}
              />
              <ListEditor
                title="What you can expect" placeholder="add expectation"
                value={newExpect} setValue={setNewExpect} list={item.whatYouCanExpect || []}
                onAdd={() => addToArrayField('whatYouCanExpect', newExpect, setNewExpect)}
                onRemove={(i) => removeFromArrayField('whatYouCanExpect', i)}
              />
            </div>
          </div>

          {/* Vendor */}
          <div className="section vendor-section">
            <div className="fi-section-title">Vendor</div>
            <div className="vendor-grid">
              <label>
                <div className="fi-label">Vendor Name</div>
                <input type="text" value={item.vendor?.name || ''} onChange={(e) => changeNested(['vendor', 'name'], e.target.value)} />
              </label>
              <label>
                <div className="fi-label">Vendor ID</div>
                <input type="text" value={item.vendor?.id || ''} onChange={(e) => changeNested(['vendor', 'id'], e.target.value)} />
              </label>
            </div>

            <div className="fi-label" style={{ marginTop: 12 }}>Serviceable Areas</div>
            <div className="service-areas">
              {defaultServiceAreas.map((area) => (
                <label key={area} className="area-label chip">
                  <input type="checkbox" checked={!!item.vendor?.serviceableArea?.[area]} onChange={() => toggleVendorArea(area)} />
                  <span className="area-text">{area}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Events */}
          <div className="section events-section">
            <div className="fi-section-title">Events</div>
            <div className="events-row">
              {sampleEvents.map((ev) => (
                <label key={ev} className="chip">
                  <input type="checkbox" checked={(item.events || []).includes(ev)} onChange={() => toggleEvent(ev)} />
                  <span>{ev}</span>
                </label>
              ))}
            </div>
          </div>
        </div>

        <div className="fi-modal-footer">
          <button className="fi-btn" onClick={onCancel} disabled={busy}>Cancel</button>
          <button className="fi-btn fi-btn-primary" onClick={handleSubmit} disabled={busy}>Save changes</button>
        </div>
      </div>
    </div>
  );
}

/* Reusable add/remove list editor (hoisted so its input keeps focus on re-render). */
function ListEditor({ title, placeholder, value, setValue, list, onAdd, onRemove }) {
  return (
    <div className="array-block">
      <div className="array-header">
        <div className="fi-label">{title}</div>
        <div className="array-control">
          <input type="text" value={value} onChange={(e) => setValue(e.target.value)} placeholder={placeholder} />
          <button className="fi-btn fi-btn-primary" onClick={onAdd} disabled={!value.trim()}>Add</button>
        </div>
      </div>
      {list.length === 0 ? (
        <div className="small-muted">Nothing added yet.</div>
      ) : (
        <ul>
          {list.map((v, i) => (
            <li key={i} className="array-item">
              <span className="array-text">{v}</span>
              <button className="chip-remove" aria-label="Remove" onClick={() => onRemove(i)}><FaTimes /></button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
