import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaLeaf, FaPhoneAlt, FaEnvelope, FaSync, FaChevronRight } from "react-icons/fa";
import { fetchSubscriptions, updateSubscription } from "../../../../services/subscriptions";
import { formatDateShort } from "../../../../utils/util";
import "./styles.scss";

const STATUSES = ["new", "contacted", "quoted", "confirmed", "closed", "cancelled"];

const fmtDuration = (s) =>
  s?.durationValue ? `${s.durationValue} ${s.durationUnit || ""}`.trim() : "";

export default function SubscriptionsPanel() {
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [open, setOpen] = useState(true);
  const [savingId, setSavingId] = useState(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetchSubscriptions();
      const list = Array.isArray(res) ? res : Array.isArray(res?.data) ? res.data : [];
      setItems(list);
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || "Failed to load subscriptions");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const openCount = useMemo(
    () => items.filter((s) => !["closed", "cancelled"].includes(s.status)).length,
    [items],
  );

  // Confirmed subscriptions are "active" and shown in their own section.
  const active = useMemo(() => items.filter((s) => s.status === "confirmed"), [items]);
  const enquiries = useMemo(() => items.filter((s) => s.status !== "confirmed"), [items]);

  const changeStatus = async (id, status) => {
    setSavingId(id);
    // optimistic
    setItems((prev) => prev.map((s) => (s._id === id ? { ...s, status } : s)));
    try {
      await updateSubscription(id, { status });
    } catch (err) {
      load(); // revert to server truth on failure
    } finally {
      setSavingId(null);
    }
  };

  const renderCard = (s) => (
    <article
      key={s._id}
      className={`subCard status-${s.status || "new"}`}
      role="button"
      tabIndex={0}
      onClick={() => navigate(`/admin/subscriptions/${s._id}`)}
      onKeyDown={(e) => { if (e.key === "Enter") navigate(`/admin/subscriptions/${s._id}`); }}
    >
      <div className="subCard__top">
        <div className="subCard__who">
          <span className="subCard__name">{s.contactName || "—"}</span>
          {s.organisation && <span className="subCard__org">{s.organisation}</span>}
        </div>
        <div className="subCard__meta">
          <span className="subCard__date">{s.createdAt ? formatDateShort(s.createdAt) : ""}</span>
          <select
            className={`subCard__status status-${s.status || "new"}`}
            value={s.status || "new"}
            disabled={savingId === s._id}
            onClick={(e) => e.stopPropagation()}
            onChange={(e) => { e.stopPropagation(); changeStatus(s._id, e.target.value); }}
          >
            {STATUSES.map((st) => (
              <option key={st} value={st}>{st}</option>
            ))}
          </select>
          <FaChevronRight className="subCard__go" aria-hidden="true" />
        </div>
      </div>

      <div className="subCard__contact">
        <a href={`tel:+91${s.phone}`} className="subCard__link" onClick={(e) => e.stopPropagation()}><FaPhoneAlt /> +91 {s.phone}</a>
        {s.email && <a href={`mailto:${s.email}`} className="subCard__link" onClick={(e) => e.stopPropagation()}><FaEnvelope /> {s.email}</a>}
      </div>

      <div className="subCard__chips">
        {s.pincode && <span className="subTag">📍 {s.pincode}</span>}
        {s.mealSlot && <span className="subTag">{s.mealSlot}</span>}
        {s.boxType && <span className="subTag">{s.boxType}-item box</span>}
        {s.totalMeals && <span className="subTag">{s.totalMeals} meals</span>}
        {fmtDuration(s) && <span className="subTag">for {fmtDuration(s)}</span>}
        {s.frequency && <span className="subTag">{s.frequency}</span>}
        {s.startDate && <span className="subTag">from {s.startDate}</span>}
        {s.discountPct > 0 && <span className="subTag subTag--save">save {s.discountPct}%</span>}
        {s.reusableCarrier && (
          <span className="subTag subTag--eco"><FaLeaf /> Reusable carriers</span>
        )}
        {Array.isArray(s.preferredCombos) && s.preferredCombos.length > 0 && (
          <span className="subTag">{s.preferredCombos.length} combo pref.</span>
        )}
      </div>

      {s.notes && <p className="subCard__notes">“{s.notes}”</p>}
    </article>
  );

  return (
    <section className="subPanel" aria-label="Subscriptions">
      <div className="subPanel__head">
        <button className="subPanel__toggle" onClick={() => setOpen((v) => !v)} aria-expanded={open}>
          <span className="subPanel__chevron" aria-hidden="true">{open ? "▾" : "▸"}</span>
          Subscriptions
          {openCount > 0 && <span className="subPanel__badge">{openCount} open</span>}
        </button>
        <button className="subPanel__refresh" onClick={load} disabled={loading} title="Refresh">
          <FaSync className={loading ? "spin" : ""} /> {loading ? "…" : "Refresh"}
        </button>
      </div>

      {open && (
        <div className="subPanel__body">
          {error && <div className="subPanel__error">{error}</div>}
          {!loading && !error && items.length === 0 && (
            <div className="subPanel__empty">No subscription enquiries yet.</div>
          )}

          {active.length > 0 && (
            <>
              <h3 className="subPanel__section subPanel__section--active">
                Active subscriptions <span className="subPanel__sectionCount">{active.length}</span>
              </h3>
              {active.map(renderCard)}
            </>
          )}

          {enquiries.length > 0 && (
            <>
              <h3 className="subPanel__section">
                Enquiries <span className="subPanel__sectionCount">{enquiries.length}</span>
              </h3>
              {enquiries.map(renderCard)}
            </>
          )}
        </div>
      )}
    </section>
  );
}
