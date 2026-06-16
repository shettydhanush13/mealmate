import React, { useEffect, useState, useCallback, useMemo } from 'react';
import '../inventory.scss';
import '../vendors/styles.scss';
import './styles.scss';
import { FaRegTrashAlt, FaMapMarkerAlt, FaTimes } from 'react-icons/fa';
import { fetchPincodes, createPincode, deletePincode } from '../../../services/pincodes';

// must match the vendor serviceAreas vocabulary
const AREAS = [
  'Bangalore-North',
  'Bangalore-South',
  'Bangalore-East',
  'Bangalore-West',
  'Bangalore-Central',
];

export default function AdminPincodesPage() {
  const [rows, setRows] = useState([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({ pincode: '', area: AREAS[0], city: 'Bengaluru' });
  const [confirmDelete, setConfirmDelete] = useState(null);

  const load = useCallback(async () => {
    setBusy(true);
    setError('');
    try {
      const data = await fetchPincodes();
      setRows(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to load pincodes');
    } finally {
      setBusy(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const grouped = useMemo(() => {
    const g = {};
    rows.forEach((r) => { (g[r.area || 'Unassigned'] || (g[r.area || 'Unassigned'] = [])).push(r); });
    return g;
  }, [rows]);

  const add = async (e) => {
    e.preventDefault();
    const pincode = (form.pincode || '').replace(/\D/g, '');
    if (pincode.length !== 6) { alert('Enter a valid 6-digit pincode'); return; }
    if (!form.area) { alert('Pick an area'); return; }
    setBusy(true);
    try {
      await createPincode({ pincode, area: form.area, city: form.city.trim() || 'Bengaluru' });
      setForm((f) => ({ ...f, pincode: '' }));
      await load();
    } catch (err) {
      alert(err?.response?.data?.message || 'Failed to add pincode');
    } finally {
      setBusy(false);
    }
  };

  const remove = async (id) => {
    setBusy(true);
    try {
      await deletePincode(id);
      setConfirmDelete(null);
      await load();
    } catch (err) {
      alert('Failed to remove pincode');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="fi-root" aria-busy={busy}>
      <div className="vendorHead">
        <div className="vendorHead__text">
          <h2 className="vendorHead__title">Serviceable pincodes</h2>
          <p className="vendorHead__hint">Map delivery pincodes to an area. Serviceability &amp; vendor coverage are derived from this.</p>
        </div>
      </div>

      {error && <div className="ao-error">{error}</div>}

      <form className="adminAdd" onSubmit={add}>
        <div className="adminAdd__head">
          <span className="adminAdd__icon" aria-hidden="true"><FaMapMarkerAlt /></span>
          <div>
            <div className="adminAdd__title">Add a pincode</div>
            <p className="adminAdd__hint">A pincode is serviceable only if a vendor covers its area.</p>
          </div>
        </div>
        <div className="adminAdd__fields">
          <label className="adminField">
            <div className="adminField__label">Pincode</div>
            <input
              type="tel" inputMode="numeric" maxLength={6} placeholder="560001"
              value={form.pincode}
              onChange={(e) => setForm((f) => ({ ...f, pincode: e.target.value.replace(/\D/g, '') }))}
            />
          </label>
          <label className="adminField">
            <div className="adminField__label">Area</div>
            <select value={form.area} onChange={(e) => setForm((f) => ({ ...f, area: e.target.value }))}>
              {AREAS.map((a) => <option key={a} value={a}>{a}</option>)}
            </select>
          </label>
        </div>
        <button type="submit" className="fi-btn fi-btn-primary adminAdd__btn" disabled={busy}>+ Add pincode</button>
      </form>

      <div className="fi-content">
        {rows.length === 0 && !busy ? (
          <div className="fi-empty">No pincodes yet. Add the areas you deliver to.</div>
        ) : (
          Object.entries(grouped).map(([area, list]) => (
            <div key={area} className="fi-category">
              <div className="fi-cat-header fi-cat-header--static">
                <strong>{area}</strong>
                <span className="fi-cat-subcount">{list.length} pincode{list.length === 1 ? '' : 's'}</span>
              </div>
              <div className="fi-cat-body">
                <div className="pinGrid">
                  {list.map((r) => (
                    <div className={`pinChip ${r.active === false ? 'is-off' : ''}`} key={r._id}>
                      <span className="pinChip__code">{r.pincode}</span>
                      <button className="pinChip__del" aria-label="Remove" onClick={() => setConfirmDelete(r)}><FaRegTrashAlt /></button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {confirmDelete && (
        <div className="fi-modal-overlay">
          <div className="fi-modal">
            <div className="fi-modal-header"><h3>Remove pincode</h3><button className="fi-close-btn" onClick={() => setConfirmDelete(null)}><FaTimes /></button></div>
            <div className="fi-modal-body"><p>Stop servicing <strong>{confirmDelete.pincode}</strong> ({confirmDelete.area})?</p></div>
            <div className="fi-modal-footer">
              <button className="fi-btn" onClick={() => setConfirmDelete(null)}>Cancel</button>
              <button className="fi-btn fi-btn-delete" onClick={() => remove(confirmDelete._id)} disabled={busy}>Remove</button>
            </div>
          </div>
        </div>
      )}

      {busy && <div className="fi-busy-overlay">Working…</div>}
    </div>
  );
}
