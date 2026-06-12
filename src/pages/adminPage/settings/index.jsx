import React, { useEffect, useState, useCallback } from 'react';
import '../inventory.scss';
import '../vendors/styles.scss';
import { FaRegTrashAlt, FaUserShield } from 'react-icons/fa';
import { fetchAdmins, createAdmin, deleteAdmin } from '../../../services/admins';

export default function AdminSettingsPage() {
  const [admins, setAdmins] = useState([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({ name: '', phone: '' });
  const [confirmDelete, setConfirmDelete] = useState(null);

  const load = useCallback(async () => {
    setBusy(true);
    setError('');
    try {
      const data = await fetchAdmins();
      setAdmins(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to load admins');
    } finally {
      setBusy(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const add = async (e) => {
    e.preventDefault();
    const phone = (form.phone || '').replace(/\D/g, '');
    if (phone.length !== 10) { alert('Enter a valid 10-digit phone number'); return; }
    setBusy(true);
    try {
      await createAdmin({ name: form.name.trim(), phone });
      setForm({ name: '', phone: '' });
      await load();
    } catch (err) {
      alert(err?.response?.data?.message || 'Failed to add admin');
    } finally {
      setBusy(false);
    }
  };

  const remove = async (id) => {
    setBusy(true);
    try {
      await deleteAdmin(id);
      setConfirmDelete(null);
      await load();
    } catch (err) {
      alert(err?.response?.data?.message || 'Failed to remove admin');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="fi-root" aria-busy={busy}>
      <div className="vendorHead">
        <div className="vendorHead__text">
          <h2 className="vendorHead__title">Admin settings</h2>
          <p className="vendorHead__hint">Manage who can sign in to the CaterKart admin.</p>
        </div>
      </div>

      {error && <div className="ao-error">{error}</div>}

      <form className="adminAdd" onSubmit={add}>
        <div className="adminAdd__head">
          <span className="adminAdd__icon" aria-hidden="true"><FaUserShield /></span>
          <div>
            <div className="adminAdd__title">Add an admin</div>
            <p className="adminAdd__hint">They'll sign in securely with a one-time password sent to their phone.</p>
          </div>
        </div>

        <div className="adminAdd__fields">
          <label className="adminField">
            <div className="adminField__label">Name <span className="fi-label-note">optional</span></div>
            <input
              type="text"
              placeholder="e.g. Priya Sharma"
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            />
          </label>
          <label className="adminField">
            <div className="adminField__label">Phone number</div>
            <div className="adminPhone">
              <span className="adminPhone__cc">+91</span>
              <input
                type="tel"
                inputMode="numeric"
                maxLength={10}
                placeholder="10-digit number"
                value={form.phone}
                onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value.replace(/\D/g, '') }))}
              />
            </div>
          </label>
        </div>

        <button type="submit" className="fi-btn fi-btn-primary adminAdd__btn" disabled={busy}>+ Add admin</button>
      </form>

      <div className="fi-content">
        {admins.length === 0 && !busy ? (
          <div className="fi-empty">No admins yet.</div>
        ) : (
          <div className="vendorList">
            {admins.map((a) => (
              <div className="vendorRow" key={a._id}>
                <div className="vendorRow__main">
                  <div className="vendorRow__name">
                    <FaUserShield style={{ color: 'var(--ck-primary, #ec430d)' }} />
                    {a.name || 'Admin'}
                    {(a.core) && <span className="vendorRow__badge">Core</span>}
                  </div>
                  <div className="vendorRow__meta">+91 {a.phone}</div>
                </div>
                {!a.core && (
                  <div className="fi-actions">
                    <button className="iconButton iconButton--danger" aria-label="Remove" onClick={() => setConfirmDelete(a)}>
                      <FaRegTrashAlt />
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {confirmDelete && (
        <div className="fi-modal-overlay">
          <div className="fi-modal">
            <div className="fi-modal-header"><h3>Remove admin</h3><button className="fi-close-btn" onClick={() => setConfirmDelete(null)}>✕</button></div>
            <div className="fi-modal-body"><p>Remove <strong>{confirmDelete.name || 'this admin'}</strong> (+91 {confirmDelete.phone})? They will no longer be able to sign in.</p></div>
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
