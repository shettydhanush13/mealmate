import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import '../inventory.scss';
import { fetchInventory, updateService, deleteService } from '../../../services/services';
import { FaPen, FaTimes } from "react-icons/fa";
import DeleteIcon from '@mui/icons-material/Delete';

const deepClone = (v) => JSON.parse(JSON.stringify(v));
const generateId = () => `${Date.now().toString(36)}-${Math.random().toString(36).slice(2,9)}`;

export default function LiveStationsInventory({
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
        const data = await fetchInventory('live-stations');
        if (isMounted.current) setItems(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error('Failed to load live stations', err);
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
        `${it.title || ''} ${it.code || ''} ${it.description || ''} ${(it.events||[]).join(' ')} ${(it.vendor || []).map(v => v.name || '').join(' ')}`
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
      code: `live-${Date.now()}`,
      originalId: null,
      type: 'live_counter',
      typeLabel: 'Live Counter',
      title: '',
      description: '',
      priceRange: { min: 0, max: 0 },
      baseFee: 0,
      baseHours: 2,
      hourlyRate: 0,
      baseStaff: 1,
      extraStaffRate: 0,
      servingsPerGuest: 1,
      currency: 'INR',
      image: '',
      imgs: [],
      recommendedChoices: [],
      vendor: [],
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

      if (Array.isArray(out.vendor)) {
        out.vendor = out.vendor.map(v => {
          const copy = { ...v };
          if (copy.serviceableArea && typeof copy.serviceableArea === 'object' && !Array.isArray(copy.serviceableArea)) {
            copy.serviceableArea = Object.entries(copy.serviceableArea).filter(([, val]) => !!val).map(([k]) => k);
          }
          return copy;
        });
      }

      if (Array.isArray(out.recommendedChoices)) {
        out.recommendedChoices = out.recommendedChoices.map(rc => {
          const c = { ...rc };
          if (!c.key) c.key = `${(c.label||'choice').toLowerCase().replace(/\s+/g,'-')}-${generateId().slice(-4)}`;
          c.defaultQty = Number(c.defaultQty || 0);
          c.unitPrice = Number(c.unitPrice || 0);
          return c;
        });
      }

      await updateService('live-stations', out);
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
      await deleteService(_id);
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
        {it.image || it.imgs?.[0] ? (
          <img src={it.image || it.imgs[0]} alt={it.title || 'preview'} />
        ) : (
          <div className="dec-card-placeholder">No image</div>
        )}
      </div>

      <div className="dec-card-body">
        <div className="dec-card-title">{it.title || 'Untitled'}</div>
        <div className="dec-card-sub">{(it.vendor && it.vendor[0]?.name) || ''}</div>
        <div className="dec-card-footer">
          <div className="dec-card-price">
            {it.priceRange ? `₹${it.priceRange.min || 0} - ₹${it.priceRange.max || 0}` : `₹${Number(it.baseFee || 0)}`}
          </div>
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
        <h2>Live Stations Inventory</h2>
        <div className="fi-controls">
          <input
            placeholder="Search title, code, vendor..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="fi-search"
          />
          <div className="fi-actions-right">
            <button className="fi-btn fi-btn-primary" onClick={openAdd}>+ Add Live Station</button>
          </div>
        </div>
      </div>

      <div className="fi-content">
        {Object.keys(filtered).length === 0 ? (
          <div className="fi-empty">No live stations found.</div>
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
        <LiveStationModalFull
          initialItem={editing}
          defaultServiceAreas={defaultServiceAreas}
          onCancel={() => setEditing(null)}
          onSave={saveItem}
          busy={busy}
        />
      )}

      {addingTo && (
        <LiveStationModalFull
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
              <p>Are you sure you want to permanently delete this live station?</p>
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

/* ------------------------- LIVE STATION FULL MODAL ---------------------------- */

function LiveStationModalFull({ initialItem, defaultServiceAreas = [], onCancel, onSave, busy }) {
  const normalizeVendorAreas = useCallback((vendor) => {
    const sa = vendor?.serviceableArea;
    if (Array.isArray(sa)) return sa.reduce((acc, a) => ({ ...acc, [a]: true }), {});
    else if (typeof sa === 'object' && sa !== null) return { ...sa };
    return defaultServiceAreas.reduce((a, r) => ({ ...a, [r]: false }), {});
  }, [defaultServiceAreas]);

  const [item, setItem] = useState(() => {
    const it = deepClone(initialItem || {});
    it.imgs = Array.isArray(it.imgs) ? it.imgs.slice() : (it.image ? [it.image] : []);
    it.recommendedChoices = Array.isArray(it.recommendedChoices) ? it.recommendedChoices.map(rc => ({ ...rc })) : [];
    it.vendor = Array.isArray(it.vendor) ? it.vendor.map(v => ({ ...v, serviceableArea: normalizeVendorAreas(v) })) : [];
    it.events = Array.isArray(it.events) ? it.events.slice() : [];
    it.priceRange = it.priceRange || { min: 0, max: 0 };
    return it;
  });

  const [errors, setErrors] = useState({});
  const [newImageUrl, setNewImageUrl] = useState('');
  const [newChoiceLabel, setNewChoiceLabel] = useState('');
  const [newChoiceQty, setNewChoiceQty] = useState('');
  const [newChoicePrice, setNewChoicePrice] = useState('');
  const [newVendorName, setNewVendorName] = useState('');
  const [newVendorId, setNewVendorId] = useState('');

  useEffect(() => {
    const it = deepClone(initialItem || {});
    it.imgs = Array.isArray(it.imgs) ? it.imgs.slice() : (it.image ? [it.image] : []);
    it.recommendedChoices = Array.isArray(it.recommendedChoices) ? it.recommendedChoices.map(rc => ({ ...rc })) : [];
    it.vendor = Array.isArray(it.vendor) ? it.vendor.map(v => ({ ...v, serviceableArea: normalizeVendorAreas(v) })) : [];
    it.events = Array.isArray(it.events) ? it.events.slice() : [];
    it.priceRange = it.priceRange || { min: 0, max: 0 };
    setItem(it);
    setErrors({});
    setNewImageUrl('');
    setNewChoiceLabel('');
    setNewChoiceQty('');
    setNewChoicePrice('');
    setNewVendorId('');
    setNewVendorName('');
  }, [initialItem, normalizeVendorAreas]);

  const change = (k, v) => {
    setItem(prev => ({ ...prev, [k]: v }));
    setErrors(prev => ({ ...prev, [k]: '' }));
  };

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
          serviceableArea: { ...currentAreas, [area]: !currentAreas[area] }
        };
      });
      return { ...prev, vendor: vendors };
    });
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

  const removeVendor = (idx) => setItem(prev => ({ ...prev, vendor: (prev.vendor || []).filter((_,i) => i !== idx) }));

  const addImage = () => {
    const url = (newImageUrl || '').trim();
    if (!url) return;
    setItem(prev => ({ ...prev, imgs: [...(prev.imgs || []), url] }));
    setNewImageUrl('');
  };

  const removeImage = (idx) => setItem(prev => ({ ...prev, imgs: (prev.imgs || []).filter((_,i) => i !== idx) }));

  const addChoice = () => {
    const label = (newChoiceLabel || '').trim();
    if (!label) return;
    const rc = {
      key: `${label.toLowerCase().replace(/\s+/g,'-')}-${generateId().slice(-4)}`,
      label,
      defaultQty: Number(newChoiceQty) || 0,
      unitPrice: Number(newChoicePrice) || 0,
    };
    setItem(prev => ({ ...prev, recommendedChoices: [...(prev.recommendedChoices || []), rc] }));
    setNewChoiceLabel('');
    setNewChoiceQty('');
    setNewChoicePrice('');
  };

  const changeChoice = (idx, key, value) => {
    setItem(prev => {
      const copy = deepClone(prev);
      copy.recommendedChoices = copy.recommendedChoices || [];
      copy.recommendedChoices[idx] = copy.recommendedChoices[idx] || {};
      copy.recommendedChoices[idx][key] = value;
      return copy;
    });
  };

  const removeChoice = (idx) => setItem(prev => ({ ...prev, recommendedChoices: (prev.recommendedChoices || []).filter((_,i) => i !== idx) }));

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
    if ((!item.priceRange || (!item.priceRange.min && !item.priceRange.max)) && !item.baseFee) e.priceRange = 'Price or base fee required';
    return e;
  };

  const handleSubmit = () => {
    const e = validate();
    if (Object.keys(e).length) {
      setErrors(e);
      return;
    }

    const out = deepClone(item);
    if (Array.isArray(out.imgs) && out.imgs.length) out.image = out.imgs[0];
    if (Array.isArray(out.vendor)) {
      out.vendor = out.vendor.map(v => {
        const copy = { ...v };
        if (copy.serviceableArea && typeof copy.serviceableArea === 'object' && !Array.isArray(copy.serviceableArea)) {
          copy.serviceableArea = Object.entries(copy.serviceableArea).filter(([, val]) => !!val).map(([k]) => k);
        }
        return copy;
      });
    }
    if (Array.isArray(out.recommendedChoices)) {
      out.recommendedChoices = out.recommendedChoices.map(rc => ({
        key: rc.key || `${(rc.label||'choice').toLowerCase().replace(/\s+/g,'-')}-${generateId().slice(-4)}`,
        label: rc.label || '',
        defaultQty: Number(rc.defaultQty || 0),
        unitPrice: Number(rc.unitPrice || 0),
      }));
    }

    out.baseFee = Number(out.baseFee || 0);
    out.baseHours = Number(out.baseHours || 0);
    out.hourlyRate = Number(out.hourlyRate || 0);
    out.baseStaff = Number(out.baseStaff || 0);
    out.extraStaffRate = Number(out.extraStaffRate || 0);
    out.servingsPerGuest = Number(out.servingsPerGuest || 0);
    out.priceRange = { min: Number(out.priceRange?.min || 0), max: Number(out.priceRange?.max || 0) };

    if (!out._id) out._id = generateId();
    if (!out.code) out.code = `live-${Date.now()}`;

    onSave(out);
  };

  const sampleEvents = ['Birthday', 'Anniversary', 'Corporate', 'Baby Shower', 'Engagement'];

  return (
    <div className="fi-modal-overlay">
      <div className="fi-modal modal-large">
        <div className="fi-modal-header">
          <h3>{initialItem && initialItem._id ? 'Edit Live Station' : 'Add Live Station'}</h3>
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
              <div className="fi-label">Price Range Min</div>
              <input type="number" value={item.priceRange?.min || 0} onChange={(e) => change('priceRange', { ...item.priceRange, min: e.target.value })} />
            </label>

            <label>
              <div className="fi-label">Price Range Max</div>
              <input type="number" value={item.priceRange?.max || 0} onChange={(e) => change('priceRange', { ...item.priceRange, max: e.target.value })} />
            </label>

            <label>
              <div className="fi-label">Base Fee</div>
              <input type="number" value={item.baseFee || 0} onChange={(e) => change('baseFee', e.target.value)} />
            </label>

            <label>
              <div className="fi-label">Base Hours</div>
              <input type="number" value={item.baseHours || 0} onChange={(e) => change('baseHours', e.target.value)} />
            </label>

            <label>
              <div className="fi-label">Hourly Rate</div>
              <input type="number" value={item.hourlyRate || 0} onChange={(e) => change('hourlyRate', e.target.value)} />
            </label>

            <label>
              <div className="fi-label">Base Staff</div>
              <input type="number" value={item.baseStaff || 0} onChange={(e) => change('baseStaff', e.target.value)} />
            </label>

            <label>
              <div className="fi-label">Extra Staff Rate</div>
              <input type="number" value={item.extraStaffRate || 0} onChange={(e) => change('extraStaffRate', e.target.value)} />
            </label>

            <label>
              <div className="fi-label">Servings per Guest</div>
              <input type="number" value={item.servingsPerGuest || 1} onChange={(e) => change('servingsPerGuest', e.target.value)} />
            </label>

            <label className="full">
              <div className="fi-label">Description</div>
              <textarea value={item.description || ''} onChange={(e) => change('description', e.target.value)} />
            </label>
          </div>

          {/* images */}
          <div className="section images-section">
            <div className="fi-label">Images</div>
            <div className="section-row section-between">
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

            <div className="images-thumb-row">
              {(item.imgs || []).map((u, idx) => (
                <div key={idx} className="img-thumb">
                  <img src={u} alt={`img-${idx}`} />
                  <button className="fi-btn" onClick={() => removeImage(idx)} aria-label="remove">Remove</button>
                </div>
              ))}
              {(item.imgs || []).length === 0 && (<div className="small-muted">No images — add URLs above.</div>)}
            </div>
          </div>

          {/* recommendedChoices */}
          <div className="section choices-section">
            <div className="fi-label">Recommended Choices</div>
            <div className="section-row">
              <div className="choice-row">
                <input className="choice-input" placeholder="label" value={newChoiceLabel} onChange={(e) => setNewChoiceLabel(e.target.value)} />
                <input className="choice-input small" placeholder="qty" value={newChoiceQty} onChange={(e) => setNewChoiceQty(e.target.value)} />
                <input className="choice-input small" placeholder="unit price" value={newChoicePrice} onChange={(e) => setNewChoicePrice(e.target.value)} />
                <button className="fi-btn fi-btn-primary" onClick={addChoice} disabled={!newChoiceLabel.trim()}>Add</button>
              </div>
            </div>

            <div className="choices-list">
              {(item.recommendedChoices || []).map((rc, idx) => (
                <div key={rc.key || idx} className="choice-row choice-item">
                    <div>
                        <label htmlFor="">Label : </label>
                        <input className="choice-input" value={rc.label || ''} onChange={(e) => changeChoice(idx, 'label', e.target.value)} placeholder="label" />
                    </div>
                    <div>
                        <label htmlFor="">Quantity : </label>
                        <input className="choice-input small" value={rc.defaultQty || 0} onChange={(e) => changeChoice(idx, 'defaultQty', Number(e.target.value))} placeholder="qty" />
                    </div>
                    <div>
                        <label htmlFor="">Price : </label>
                        <input className="choice-input small" value={rc.unitPrice || 0} onChange={(e) => changeChoice(idx, 'unitPrice', Number(e.target.value))} placeholder="unit price" />
                    </div>
                    <button className="fi-btn fi-btn-primary" onClick={() => removeChoice(idx)}>Remove</button>
                </div>
              ))}
              {(item.recommendedChoices || []).length === 0 && <div className="small-muted">No choices added.</div>}
            </div>
          </div>

          {/* vendors */}
          <div className="section vendor-section">
            <div className="fi-label">Vendors</div>
            <div className="section-row section-between">
              <div className="vendor-controls">
                <input className="vendor-input" placeholder="vendor name" value={newVendorName} onChange={(e) => setNewVendorName(e.target.value)} />
                <input className="vendor-input small" placeholder="vendor id (optional)" value={newVendorId} onChange={(e) => setNewVendorId(e.target.value)} />
                <button className="fi-btn fi-btn-primary" onClick={addVendor} disabled={!newVendorName.trim()}>Add</button>
              </div>
            </div>

            <div className="vendor-list">
              {(item.vendor || []).map((v, idx) => (
                <div key={idx} className="vendor-card">
                  <div className="vendor-main">
                    <input className="vendor-input" value={v.name || ''} onChange={(e) => changeVendorField(idx, 'name', e.target.value)} placeholder="vendor name" />
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

          {/* events */}
          <div className="section events-section">
            <div className="fi-label">Events</div>
            <div className="chip-row">
              {sampleEvents.map(ev => (
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
