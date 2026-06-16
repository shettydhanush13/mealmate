// src/pages/checkout/components/ServiceBreakdown/index.jsx
import React from "react";
import "./styles.scss";

/**
 * ServiceBreakdown — fully transparent live-counter pricing.
 * Every number is shown: per-choice unit (original → discounted), line amounts,
 * menu subtotal, setup & staff, extra hours/staff, savings, and the grand total
 * (original struck-through + discounted).
 */
const LiveCounterCard = ({ b, toINR }) => {
  const raw = b.rawProduct || {};
  const plates = raw.extraInfo?.plates ?? "-";
  const note = raw.extraInfo?.note;
  const baseHours = Number(raw.baseHours || 0);
  const baseStaff = Number(raw.baseStaff || 0);
  const thumb = raw.image || (Array.isArray(raw.imgs) && raw.imgs[0]) || "";
  const choices = (b.choicesDetail || []).filter((c) => Number(c.qty) > 0);

  return (
    <article className="lcb">
      <header className="lcb__head">
        {thumb && (
          <span className="lcb__thumb">
            <img src={thumb} alt="" loading="lazy" />
          </span>
        )}
        <div className="lcb__headText">
          <h4 className="lcb__title">{b.title}</h4>
          <span className="lcb__servings">{plates} servings</span>
        </div>
      </header>

      {choices.length > 0 && (
        <div className="lcb__menu">
          {choices.map((c) => (
            <div className="lcbItem" key={c.key}>
              <div className="lcbItem__left">
                <span className="lcbItem__name">{c.label}</span>
                <span className="lcbItem__meta">
                  {c.qty} ×{" "}
                  {c.discountedUnit < c.unitPrice ? (
                    <>
                      <span className="lcbItem__wasUnit">{toINR(c.unitPrice, 0)}</span>{" "}
                      <span className="lcbItem__nowUnit">{toINR(c.discountedUnit, 0)}</span>
                    </>
                  ) : (
                    <span className="lcbItem__nowUnit">{toINR(c.unitPrice, 0)}</span>
                  )}{" "}
                  each
                </span>
              </div>
              <div className="lcbItem__amt">
                <span className="lcbItem__orig">{toINR(c.costOriginal, 0)}</span>
                <span className="lcbItem__final">{toINR(c.costDiscounted, 0)}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="lcb__lines">
        {choices.length > 0 && (
          <div className="lcbLine">
            <span className="lcbLine__label">Menu subtotal</span>
            <span className="lcbLine__amt">
              <span className="lcbLine__orig">{toINR(b.choicesCostOriginal, 0)}</span>
              <span className="lcbLine__val">{toINR(b.choicesCostDiscounted, 0)}</span>
            </span>
          </div>
        )}

        <div className="lcbLine">
          <span className="lcbLine__label">
            Setup &amp; staff
            {(baseHours || baseStaff) ? (
              <small> (incl. {baseHours} hr{baseHours === 1 ? "" : "s"} · {baseStaff} staff)</small>
            ) : null}
          </span>
          <span className="lcbLine__val">{toINR(b.baseFee, 0)}</span>
        </div>

        {b.extraHours > 0 && (
          <div className="lcbLine">
            <span className="lcbLine__label">Extra hours ({b.extraHours})</span>
            <span className="lcbLine__val">{toINR(b.hourCost, 0)}</span>
          </div>
        )}

        {b.extraStaff > 0 && (
          <div className="lcbLine">
            <span className="lcbLine__label">Extra staff ({b.extraStaff})</span>
            <span className="lcbLine__val">{toINR(b.staffCost, 0)}</span>
          </div>
        )}

        {b.choicesSavings > 0 && (
          <div className="lcbLine lcbLine--save">
            <span className="lcbLine__label">You save</span>
            <span className="lcbLine__val">− {toINR(b.choicesSavings, 0)}</span>
          </div>
        )}
      </div>

      <div className="lcb__total">
        <span className="lcb__totalLabel">Total</span>
        <span className="lcb__totalAmt">
          {b.totalOriginal > b.total && (
            <span className="lcb__totalOrig">{toINR(b.totalOriginal, 0)}</span>
          )}
          <span className="lcb__totalVal">{toINR(b.total, 0)}</span>
        </span>
      </div>

      {note && <div className="lcb__note">Note: {note}</div>}
    </article>
  );
};

const ServiceBreakdown = ({ serviceBreakdown = [], toINR }) => {
  if (!serviceBreakdown || serviceBreakdown.length === 0) return null;

  return (
    <section className="serviceBreakdown">
      <h3 className="serviceBreakdown__title">Live Counters</h3>
      {serviceBreakdown.map((b) => (
        <LiveCounterCard key={b.id} b={b} toINR={toINR} />
      ))}
    </section>
  );
};

export default ServiceBreakdown;
