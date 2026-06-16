import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import '../inventory.scss';
import { fetchInventory, updateService, deleteService } from '../../../services/services';
import { FaPen, FaTimes } from "react-icons/fa";
import DeleteIcon from '@mui/icons-material/Delete';

const deepClone = (v) => JSON.parse(JSON.stringify(v));
const generateId = () => `${Date.now().toString(36)}-${Math.random().toString(36).slice(2,9)}`;

/**
 * ArtistsInventory
 * - Fetches artists via fetchInventory('artists')
 * - Allows editing / adding / deleting items
 * - Calls updateService('artists', item) on save
 */
export default function ArtistsInventory({
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

  useEffect(() => {
    if (loadedRef.current) return;
    loadedRef.current = true;

    const load = async () => {
      setBusy(true);
      try {
        const data = await fetchInventory('artists');
        if (isMounted.current) {
          setItems(Array.isArray(data) ? data : []);
        }
      } catch (err) {
        console.error('Failed to load artists', err);
        if (isMounted.current) setItems([]);
      } finally {
        if (isMounted.current) setBusy(false);
      }
    };

    load();
  }, []);

  const grouped = useMemo(() => {
    const g = {};
    for (const it of items || []) {
      const label = it.typeLabel || it.type || 'Other';
      if (!g[label]) g[label] = [];
      g[label].push(it);
    }
    return g;
  }, [items]);

  const filtered = useMemo(() => {
    if (!search.trim()) return grouped;
    const q = search.trim().toLowerCase();
    const out = {};
    for (const [label, arr] of Object.entries(grouped)) {
      const filteredItems = arr.filter(it =>
        `${it.title} ${it.code || ''} ${it.description || ''} ${(it.events||[]).join(' ')} ${(Array.isArray(it.vendor) ? it.vendor.map(v => v.name).join(' ') : '')}`
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
    // new artist template (vendor as array)
    const newItem = {
      _id: generateId(),
      code: `artist-${Date.now()}`,
      type: 'artist',
      typeLabel: 'Artist',
      title: '',
      description: '',
      price: 0,
      baseFare: 0,
      baseHours: 2,
      extraPerHour: 0,
      currency: 'INR',
      imgs: [],
      vendor: [], // array of vendor objects
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

      // Normalize vendor.serviceableArea for each vendor (mapping -> array)
      if (Array.isArray(out.vendor)) {
        out.vendor = out.vendor.map((v) => {
          const copy = { ...v };
          if (copy.serviceableArea && typeof copy.serviceableArea === 'object' && !Array.isArray(copy.serviceableArea)) {
            copy.serviceableArea = Object.entries(copy.serviceableArea).filter(([, val]) => !!val).map(([k]) => k);
          }
          return copy;
        });
      }

      await updateService('artists', out);
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
      await deleteService('artists', _id);
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
        <div className="dec-card-sub">{Array.isArray(it.vendor) ? (it.vendor[0]?.name || '') : (it.vendor?.name || '')}</div>
        <div className="dec-card-footer">
          <div className="dec-card-price">₹{Number(it.price || 0)}</div>
          <div className="dec-card-actions">
            <button className="fi-btn fi-btn-edit" aria-label="edit" onClick={() => openEdit(it)}>
              <FaPen />
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
        <h2>Artists Inventory</h2>
        <div className="fi-controls">
          <input
            placeholder="Search title, code, vendor..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="fi-search"
          />
          <div className="fi-actions-right">
            <button className="fi-btn fi-btn-primary" onClick={openAdd}>+ Add Artist</button>
          </div>
        </div>
      </div>

      <div className="fi-content">
        {Object.keys(filtered).length === 0 ? (
          <div className="fi-empty">No artists found.</div>
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
        <ArtistModalFull
          initialItem={editing}
          defaultServiceAreas={defaultServiceAreas}
          onCancel={() => setEditing(null)}
          onSave={saveItem}
          busy={busy}
        />
      )}

      {addingTo && (
        <ArtistModalFull
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
              <p>Are you sure you want to permanently delete this artist?</p>
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

/* ------------------------- ARTIST FULL MODAL ---------------------------- */

function ArtistModalFull({ initialItem, defaultServiceAreas = [], onCancel, onSave, busy }) {
  // normalize vendor entry serviceableArea (array -> mapping)
  const normalizeVendorAreas = useCallback((vendor) => {
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
    it.imgs = Array.isArray(it.imgs) ? it.imgs.slice() : [];
    it.vendor = Array.isArray(it.vendor) ? it.vendor.map(v => ({ ...v, serviceableArea: normalizeVendorAreas(v) })) : [];
    it.events = Array.isArray(it.events) ? it.events.slice() : [];
    return it;
  });

  const [errors, setErrors] = useState({});
  const [newImageUrl, setNewImageUrl] = useState('');
  const [newVendorName, setNewVendorName] = useState('');
  const [newVendorId, setNewVendorId] = useState('');

  useEffect(() => {
    const it = deepClone(initialItem || {});
    it.imgs = Array.isArray(it.imgs) ? it.imgs.slice() : [];
    it.vendor = Array.isArray(it.vendor) ? it.vendor.map(v => ({ ...v, serviceableArea: normalizeVendorAreas(v) })) : [];
    it.events = Array.isArray(it.events) ? it.events.slice() : [];
    setItem(it);
    setErrors({});
    setNewImageUrl('');
    setNewVendorId('');
    setNewVendorName('');
  }, [initialItem, normalizeVendorAreas]);

  const change = (k, v) => {
    setItem((prev) => ({ ...prev, [k]: v }));
    setErrors((prev) => ({ ...prev, [k]: '' }));
  };

  const changeVendorField = (index, key, value) => {
    setItem(prev => {
      const copy = deepClone(prev);
      copy.vendor = copy.vendor || [];
      copy.vendor[index] = copy.vendor[index] || { id: '', name: '', serviceableArea: {} };
      copy.vendor[index][key] = value;
      return copy;
    });
  };

  // immutable toggle so React re-renders checkbox state properly
  const toggleVendorArea = (vendorIdx, area) => {
    setItem(prev => {
      const vendors = (prev.vendor || []).map((v, i) => {
        if (i !== vendorIdx) return v;
        const current = v || {};
        const currentAreas = (current.serviceableArea && typeof current.serviceableArea === 'object' && !Array.isArray(current.serviceableArea))
          ? { ...current.serviceableArea }
          : (Array.isArray(current.serviceableArea) ? current.serviceableArea.reduce((a, r) => ({ ...a, [r]: true }), {}) : {});
        return {
          ...current,
          serviceableArea: {
            ...currentAreas,
            [area]: !currentAreas[area],
          },
        };
      });
      return { ...prev, vendor: vendors };
    });
  };

  const addVendor = () => {
    const id = (newVendorId || '').trim();
    const name = (newVendorName || '').trim();
    if (!name) return;
    setItem(prev => ({
      ...prev,
      vendor: [...(prev.vendor || []), { id: id || generateId(), name, serviceableArea: defaultServiceAreas.reduce((a,r) => ({ ...a, [r]: false }), {}) }]
    }));
    setNewVendorId('');
    setNewVendorName('');
  };

  const removeVendor = (idx) => {
    setItem(prev => ({ ...prev, vendor: (prev.vendor || []).filter((_,i) => i !== idx) }));
  };

  const addImage = () => {
    const url = (newImageUrl || '').trim();
    if (!url) return;
    setItem(prev => ({ ...prev, imgs: [...(prev.imgs || []), url] }));
    setNewImageUrl('');
  };

  const removeImage = (idx) => {
    setItem(prev => ({ ...prev, imgs: (prev.imgs || []).filter((_,i) => i !== idx) }));
  };

  const toggleEvent = (ev) => {
    const arr = Array.isArray(item.events) ? [...item.events] : [];
    const idx = arr.indexOf(ev);
    if (idx >= 0) arr.splice(idx, 1);
    else arr.push(ev);
    change('events', arr);
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
    if (Array.isArray(out.vendor)) {
      out.vendor = out.vendor.map(v => {
        const copy = { ...v };
        if (copy.serviceableArea && typeof copy.serviceableArea === 'object' && !Array.isArray(copy.serviceableArea)) {
          copy.serviceableArea = Object.entries(copy.serviceableArea).filter(([, val]) => !!val).map(([k]) => k);
        }
        return copy;
      });
    }

    out.price = Number(out.price) || 0;
    out.baseFare = Number(out.baseFare) || 0;
    out.baseHours = Number(out.baseHours) || 0;
    out.extraPerHour = Number(out.extraPerHour) || 0;

    if (!out._id) out._id = generateId();
    if (!out.code) out.code = `artist-${Date.now()}`;

    onSave(out);
  };

  const sampleEvents = ['Birthday', 'Anniversary', 'Corporate', 'Baby Shower', 'Engagement'];

  return (
    <div className="fi-modal-overlay">
      <div className="fi-modal decorations-modal">
        <div className="fi-modal-header">
          <h3>{initialItem && initialItem._id ? 'Edit Artist' : 'Add Artist'}</h3>
          <button className="fi-close-btn" onClick={onCancel}><FaTimes /></button>
        </div>

        <div className="fi-modal-body">
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

            <label>
              <div className="fi-label">Currency</div>
              <input type="text" value={item.currency || 'INR'} onChange={(e) => change('currency', e.target.value)} />
            </label>

            <label className="full">
              <div className="fi-label">Title</div>
              <input type="text" value={item.title || ''} onChange={(e) => change('title', e.target.value)} />
              {errors.title && <div className="fi-field-error">{errors.title}</div>}
            </label>

            <label>
              <div className="fi-label">Price</div>
              <input type="number" value={item.price || 0} onChange={(e) => change('price', e.target.value)} />
              {errors.price && <div className="fi-field-error">{errors.price}</div>}
            </label>

            <label>
              <div className="fi-label">Base Fare</div>
              <input type="number" value={item.baseFare || 0} onChange={(e) => change('baseFare', e.target.value)} />
            </label>

            <label>
              <div className="fi-label">Base Hours</div>
              <input type="number" value={item.baseHours || 0} onChange={(e) => change('baseHours', e.target.value)} />
            </label>

            <label>
              <div className="fi-label">Extra Per Hour</div>
              <input type="number" value={item.extraPerHour || 0} onChange={(e) => change('extraPerHour', e.target.value)} />
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
                  type="text"
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

          {/* vendors (array) */}
          <div className="section vendor-section">
            <div className="fi-label">Vendors</div>

            <div className="vendor-block">
              <div className="vendor-add-row">
                <input type="text" placeholder="vendor name" value={newVendorName} onChange={(e) => setNewVendorName(e.target.value)} />
                <button className="fi-btn fi-btn-primary" onClick={addVendor} disabled={!newVendorName.trim()}>Add</button>
              </div>

              <div className="vendor-list">
                {(item.vendor || []).map((v, idx) => (
                  <div key={idx} className="vendor-row">
                    <div className="vendor-main">
                      <input type="text" value={v.name || ''} onChange={(e) => changeVendorField(idx, 'name', e.target.value)} placeholder="vendor name" />
                      <button className="fi-btn" onClick={() => removeVendor(idx)}>Remove</button>
                    </div>

                    <div className="vendor-areas">
                      {defaultServiceAreas.map(area => (
                        <label key={area} className="area-label chip">
                          <input type="checkbox" checked={!!v.serviceableArea?.[area]} onChange={() => toggleVendorArea(idx, area)} />
                          <span className="area-text">{area}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                ))}
                {(item.vendor || []).length === 0 && <div className="small-muted">No vendors — add one above.</div>}
              </div>
            </div>
          </div>

          {/* events */}
          <div className="section events-section">
            <div className="fi-label">Events</div>
            <div className="events-row">
              {sampleEvents.map((ev) => (
                <label key={ev} className="chip">
                  <input type="checkbox" checked={(item.events || []).includes(ev)} onChange={() => toggleEvent(ev)} />
                  <span>{ev}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="modal-actions modal-actions-bottom">
            <button className="fi-btn" onClick={onCancel} disabled={busy}>Cancel</button>
            <button className="fi-btn fi-btn-primary" onClick={handleSubmit} disabled={busy}>Save changes</button>
          </div>
        </div>
      </div>
    </div>
  );
}
