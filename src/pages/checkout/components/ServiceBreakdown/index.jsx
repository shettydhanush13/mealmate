// src/pages/celebration-pages/bulk-checkout/components/ServiceBreakdown.jsx
import React from "react";
import "./styles.scss";

/**
 * ServiceBreakdown
 * - Expects serviceBreakdown array (each item has fields produced by computeServicePricing)
 * - Keeps the same markup / table structure you requested
 */
const LiveCounterRow = ({ b, toINR }) => {
  return (
    <div className="live-price-row" key={b.id}>
      <div className="live-price-left">
        <strong className="live-title">{b.title}</strong>
        <div className="muted small">Servings: {b.rawProduct?.extraInfo?.plates ?? "-"}</div>
        {b.rawProduct?.extraInfo?.note ? <div className="muted small">Note: {b.rawProduct.extraInfo.note}</div> : null}
      </div>

      <div className="live-price-right">
        <table className="live-breakdown-table" role="table" aria-label={`${b.title} breakdown`}>
          <thead>
            <tr>
              <th>Item</th>
              <th className="center">Qty</th>
              <th className="right">Amount</th>
            </tr>
          </thead>
          <tbody>
            {b.choicesDetail && b.choicesDetail.length > 0 ? (
              <>
                {b.choicesDetail.map((c) => (
                  c.qty > 0 && <tr key={c.key}>
                    <td>
                      {c.label}
                      <div className="amount">
                        <span  className="originalPrice">{toINR(c.unitPrice)}</span>&nbsp;
                        <span className="discountedPrice">{toINR(c.discountedUnit)}</span>
                      </div>
                    </td>
                    <td className="center">{c.qty}</td>
                    <td className="right">
                      <div className="amount">
                          <span className="originalPrice">{toINR(c.unitPrice*c.qty)}</span>&nbsp;
                          <span className="discountedPrice">{toINR(c.costDiscounted)}</span>
                      </div>
                    </td>

                  </tr>
                ))}

                <tr className="choices-total">
                  <td><strong>Choices Total</strong></td>
                  <td />
                  <td className="right">
                    <div className="amount">
                        <span className="originalPrice">{toINR(b.choicesCostDiscounted+b.choicesSavings)}</span>&nbsp;
                        <span className="discountedPrice">{toINR(b.choicesCostDiscounted)}</span>
                    </div>
                  </td>
                </tr>

                {b.choicesSavings > 0 && (
                  <tr className="choices-savings">
                    <td><strong>Savings</strong></td>
                    <td />
                    <td className="right"><strong>-{toINR(b.choicesSavings)}</strong></td>
                  </tr>
                )}
              </>
            ) : (
              <tr>
                <td colSpan="3" className="muted small">No choices selected</td>
              </tr>
            )}

            <tr>
              <td>Staff + Setup cost</td>
              <td />
              <td className="right">{toINR(b.baseFee)}</td>
            </tr>
            {b.extraHours > 0 && (
              <tr>
                <td>Extra hours ({b.extraHours})</td>
                <td />
                <td className="right">{toINR(b.hourCost)}</td>
              </tr>
            )}
            {b.extraStaff > 0 && (
              <tr>
                <td>Extra staff</td>
                <td />
                <td className="right">{toINR(b.staffCost)}</td>
              </tr>
            )}

            <tr className="total">
              <td><strong>Total</strong></td>
              <td />
              <td className="right"><strong>{toINR(b.total)}</strong></td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

const ServiceBreakdown = ({ serviceBreakdown = [], toINR }) => {
  if (!serviceBreakdown || serviceBreakdown.length === 0) return null;

  return (
    <section className="serviceBreakdown">
      {serviceBreakdown.map((b) => (
        <LiveCounterRow key={b.id} b={b} toINR={toINR} />
      ))}
    </section>
  );
};

export default ServiceBreakdown;
