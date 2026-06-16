import React, { useEffect, useState, useCallback } from 'react';
import '../inventory.scss';
import './styles.scss';
import {
  FaPen, FaRegTrashAlt, FaPhoneAlt, FaMapMarkerAlt, FaEnvelope,
  FaRegStickyNote, FaCertificate, FaCloudUploadAlt, FaImages, FaVideo,
  FaBriefcase, FaTimes, FaHandshake, FaBoxOpen, FaUtensils, FaReceipt,
} from 'react-icons/fa';
import { fetchVendors, createVendor, updateVendor, deleteVendor } from '../../../services/vendors';

const DEFAULT_REGIONS = [
  'Bangalore-North',
  'Bangalore-South',
  'Bangalore-East',
  'Bangalore-West',
  'Bangalore-Central',
];

const emptyVendor = () => ({ name: '', phone: '', email: '', area: '', notes: '', gstin: '', address: '', serviceAreas: [], active: true, caterboxCommissionPct: '', buffetCommissionPct: '' });

export default function AdminVendorsPage() {
  const [vendors, setVendors] = useState([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [editing, setEditing] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);

  const load = useCallback(async () => {
    setBusy(true);
    setError('');
    try {
      const data = await fetchVendors();
      setVendors(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to load vendors');
    } finally {
      setBusy(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const save = async (vendor) => {
    setBusy(true);
    try {
      const payload = {
        name: vendor.name,
        phone: vendor.phone,
        email: vendor.email,
        area: vendor.area,
        notes: vendor.notes,
        gstin: (vendor.gstin || '').trim().toUpperCase(),
        address: vendor.address || '',
        fssaiNumber: vendor.fssaiNumber || '',
        serviceAreas: vendor.serviceAreas || [],
        active: vendor.active !== false,
        caterboxCommissionPct: Number(vendor.caterboxCommissionPct) || 0,
        buffetCommissionPct: Number(vendor.buffetCommissionPct) || 0,
      };
      if (vendor._id) await updateVendor(vendor._id, payload);
      else await createVendor(payload);
      setEditing(null);
      await load();
    } catch (err) {
      alert(err?.response?.data?.message || 'Failed to save vendor');
    } finally {
      setBusy(false);
    }
  };

  const remove = async (id) => {
    setBusy(true);
    try {
      await deleteVendor(id);
      setConfirmDelete(null);
      await load();
    } catch (err) {
      alert('Failed to delete vendor');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="fi-root" aria-busy={busy}>
      <div className="vendorHead">
        <div className="vendorHead__text">
          <h2 className="vendorHead__title">Vendors</h2>
          <p className="vendorHead__hint">Manage the suppliers behind your food &amp; CaterBox combos.</p>
        </div>
        <button type="button" className="fi-btn fi-btn-primary" onClick={() => setEditing(emptyVendor())}>+ Add Vendor</button>
      </div>

      {error && <div className="ao-error">{error}</div>}

      <div className="fi-content">
        {vendors.length === 0 && !busy ? (
          <div className="fi-empty">No vendors yet. Add your first vendor.</div>
        ) : (
          <div className="vendorList">
            {vendors.map((v) => (
              <div className="vendorRow" key={v._id}>
                <div className="vendorRow__main">
                  <div className="vendorRow__name">
                    {v.name || 'Unnamed vendor'}
                    {v.active === false && <span className="vendorRow__badge">Inactive</span>}
                  </div>
                  <div className="vendorRow__meta">
                    {[v.phone, v.email].filter(Boolean).join(' · ') || 'No contact details'}
                    {(v.serviceAreas || []).length > 0 && <> · <FaMapMarkerAlt /> {v.serviceAreas.length} area{v.serviceAreas.length > 1 ? 's' : ''}</>}
                    {(Number(v.caterboxCommissionPct) > 0 || Number(v.buffetCommissionPct) > 0) && (
                      <> · <FaBriefcase /> CaterBox {Number(v.caterboxCommissionPct) || 0}% / Buffet {Number(v.buffetCommissionPct) || 0}%</>
                    )}
                  </div>
                </div>
                <div className="fi-actions">
                  <button className="iconButton" aria-label="Edit" onClick={() => setEditing({ ...v })}><FaPen /></button>
                  <button className="iconButton iconButton--danger" aria-label="Delete" onClick={() => setConfirmDelete(v._id)}><FaRegTrashAlt /></button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {editing && <VendorModal initial={editing} onCancel={() => setEditing(null)} onSave={save} busy={busy} />}

      {confirmDelete && (
        <div className="fi-modal-overlay">
          <div className="fi-modal">
            <div className="fi-modal-header"><h3>Delete vendor</h3><button className="fi-close-btn" onClick={() => setConfirmDelete(null)}><FaTimes /></button></div>
            <div className="fi-modal-body"><p>Delete this vendor permanently? Items/combos referencing it keep the name.</p></div>
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

function VendorModal({ initial, onCancel, onSave, busy }) {
  const [vendor, setVendor] = useState(() => ({ ...initial, serviceAreas: initial.serviceAreas || [] }));
  const set = (k, v) => setVendor((c) => ({ ...c, [k]: v }));
  const toggleArea = (region) => setVendor((c) => {
    const cur = c.serviceAreas || [];
    const next = cur.includes(region) ? cur.filter((r) => r !== region) : [...cur, region];
    return { ...c, serviceAreas: next };
  });

  // media uploads are UI-only for now (not persisted to the backend yet)
  const [fssaiFile, setFssaiFile] = useState([]);
  const [photos, setPhotos] = useState([]);
  const [videos, setVideos] = useState([]);
  const names = (list) => Array.from(list || []).map((f) => f.name);

  const submit = (e) => {
    e.preventDefault();
    if (!vendor.name.trim()) { alert('Enter a vendor name'); return; }
    onSave(vendor);
  };

  const active = vendor.active !== false;

  return (
    <div className="fi-modal-overlay">
      <form className="fi-modal modal-large vendorModal" onSubmit={submit}>
        <div className="fi-modal-header vendorModal__head">
          <div className="vendorModal__heading">
            <span className="vendorModal__icon" aria-hidden="true"><FaHandshake /></span>
            <div>
              <h3>{vendor._id ? 'Edit vendor' : 'Add vendor'}</h3>
              <p className="vendorModal__sub">Contact details &amp; kitchen compliance.</p>
            </div>
          </div>
          <button type="button" className="fi-close-btn" onClick={onCancel}><FaTimes /></button>
        </div>

        <div className="fi-modal-body vendorModal__body">
          {/* Basics */}
          <div className="vendorCard">
            <div className="vendorCard__title">Basics</div>
            <label className="vendorField">
              <div className="vendorField__label">Vendor name</div>
              <input autoFocus type="text" value={vendor.name} onChange={(e) => set('name', e.target.value)} placeholder="e.g. Sri Krishna Caterers" />
            </label>
            <div className="vendorField">
              <div className="vendorField__label">Status</div>
              <div className="vendorToggle" role="radiogroup" aria-label="Status">
                <button type="button" className={active ? 'is-on' : ''} aria-pressed={active} onClick={() => set('active', true)}>
                  <span className="vendorToggle__dot vendorToggle__dot--on" /> Active
                </button>
                <button type="button" className={!active ? 'is-on' : ''} aria-pressed={!active} onClick={() => set('active', false)}>
                  <span className="vendorToggle__dot vendorToggle__dot--off" /> Inactive
                </button>
              </div>
            </div>
          </div>

          {/* Contact */}
          <div className="vendorCard">
            <div className="vendorCard__title">Contact</div>
            <div className="vendorGrid">
              <label className="vendorField">
                <div className="vendorField__label"><FaPhoneAlt /> Phone</div>
                <input type="text" value={vendor.phone} onChange={(e) => set('phone', e.target.value)} placeholder="9876543210" />
              </label>
              <label className="vendorField">
                <div className="vendorField__label"><FaMapMarkerAlt /> Area</div>
                <input type="text" value={vendor.area} onChange={(e) => set('area', e.target.value)} placeholder="e.g. Jayanagar" />
              </label>
              <label className="vendorField vendorField--full">
                <div className="vendorField__label"><FaEnvelope /> Email</div>
                <input type="text" value={vendor.email} onChange={(e) => set('email', e.target.value)} placeholder="vendor@email.com" />
              </label>
              <label className="vendorField vendorField--full">
                <div className="vendorField__label"><FaRegStickyNote /> Notes</div>
                <input type="text" value={vendor.notes} onChange={(e) => set('notes', e.target.value)} placeholder="Anything to remember about this vendor" />
              </label>
            </div>
          </div>

          {/* CaterKart commission */}
          <div className="vendorCard">
            <div className="vendorCard__title">CaterKart commission</div>
            <p className="vendorCard__hint">Set per the onboarding agreement — CaterKart's charge on each order is computed from this.</p>
            <div className="vendorGrid">
              <label className="vendorField">
                <div className="vendorField__label"><FaBoxOpen /> CaterBox %</div>
                <input type="number" min="0" max="100" step="0.5" inputMode="decimal"
                  value={vendor.caterboxCommissionPct ?? ''}
                  onChange={(e) => set('caterboxCommissionPct', e.target.value)} placeholder="e.g. 15" />
              </label>
              <label className="vendorField">
                <div className="vendorField__label"><FaUtensils /> Buffet %</div>
                <input type="number" min="0" max="100" step="0.5" inputMode="decimal"
                  value={vendor.buffetCommissionPct ?? ''}
                  onChange={(e) => set('buffetCommissionPct', e.target.value)} placeholder="e.g. 18" />
              </label>
            </div>
          </div>

          {/* Tax & billing — used on the customer food invoice (vendor = supplier
              of record) and the vendor commission invoice. */}
          <div className="vendorCard">
            <div className="vendorCard__title">Tax &amp; billing</div>
            <p className="vendorCard__hint">Used on GST invoices — the vendor is the supplier of record for the food.</p>
            <div className="vendorGrid">
              <label className="vendorField">
                <div className="vendorField__label"><FaReceipt /> GSTIN</div>
                <input type="text" maxLength={15} value={vendor.gstin || ''}
                  onChange={(e) => set('gstin', e.target.value.toUpperCase())}
                  placeholder="e.g. 29ABCDE1234F1Z5" />
              </label>
              <label className="vendorField vendorField--full">
                <div className="vendorField__label"><FaMapMarkerAlt /> Registered address</div>
                <input type="text" value={vendor.address || ''}
                  onChange={(e) => set('address', e.target.value)}
                  placeholder="Registered business address with state & pincode" />
              </label>
            </div>
          </div>

          {/* Serviceable areas */}
          <div className="vendorCard">
            <div className="vendorCard__title">Serviceable areas</div>
            <p className="vendorCard__hint">Regions this vendor delivers to. Food availability is derived from this.</p>
            <div className="vendorAreas">
              {DEFAULT_REGIONS.map((region) => {
                const on = (vendor.serviceAreas || []).includes(region);
                return (
                  <label key={region} className={`vendorArea ${on ? 'is-on' : ''}`}>
                    <input type="checkbox" checked={on} onChange={() => toggleArea(region)} />
                    <span>{region}</span>
                  </label>
                );
              })}
            </div>
          </div>

          {/* Compliance & media */}
          <div className="vendorCard">
            <div className="vendorCard__title">Compliance &amp; media</div>
            <p className="vendorCard__hint">Uploads are captured in the form only for now — backend storage is coming soon.</p>

            <label className="vendorField">
              <div className="vendorField__label"><FaCertificate /> FSSAI licence number</div>
              <input type="text" value={vendor.fssaiNumber || ''} onChange={(e) => set('fssaiNumber', e.target.value)} placeholder="e.g. 12345678901234" />
            </label>

            <div className="vendorDrops">
              <VendorDrop
                icon={<FaCloudUploadAlt />}
                title="FSSAI licence"
                hint="Image or PDF"
                accept="image/*,application/pdf"
                files={names(fssaiFile)}
                onPick={(f) => setFssaiFile(f)}
              />
              <VendorDrop
                icon={<FaImages />}
                title="Kitchen photos"
                hint="JPG / PNG · multiple"
                accept="image/*"
                multiple
                files={names(photos)}
                onPick={(f) => setPhotos(f)}
              />
              <VendorDrop
                icon={<FaVideo />}
                title="Kitchen videos"
                hint="MP4 / MOV · multiple"
                accept="video/*"
                multiple
                files={names(videos)}
                onPick={(f) => setVideos(f)}
              />
            </div>
          </div>
        </div>

        <div className="fi-modal-footer">
          <button type="button" className="fi-btn" onClick={onCancel} disabled={busy}>Cancel</button>
          <button type="submit" className="fi-btn fi-btn-primary" disabled={busy}>Save vendor</button>
        </div>
      </form>
    </div>
  );
}

function VendorDrop({ icon, title, hint, accept, multiple = false, files = [], onPick }) {
  return (
    <div className="vendorDrop">
      <label className="vendorDrop__zone">
        <input type="file" accept={accept} multiple={multiple} onChange={(e) => onPick(e.target.files)} hidden />
        <span className="vendorDrop__icon" aria-hidden="true">{icon}</span>
        <span className="vendorDrop__text">
          <strong>{title}</strong>
          <small>{hint}</small>
        </span>
        <span className="vendorDrop__cta">{files.length ? 'Change' : 'Upload'}</span>
      </label>
      {files.length > 0 && (
        <ul className="vendorDrop__files">
          {files.map((n) => <li key={n} title={n}>{n}</li>)}
        </ul>
      )}
    </div>
  );
}
