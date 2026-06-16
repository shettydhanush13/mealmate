// Renders an invoice model (from invoice.js) to a print-ready HTML document and
// opens the browser print dialog, so the customer can "Save as PDF" or print.
// No PDF dependency — uses the browser's own print-to-PDF.

const inr = (n) => `₹${Number(n || 0).toLocaleString("en-IN", { maximumFractionDigits: 0 })}`;
const esc = (s) => String(s ?? "").replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
const fmtDate = (d) => {
  if (!d) return "—";
  try { return new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }); }
  catch { return "—"; }
};

export function invoiceHtml(m) {
  const taxCols = m.interState
    ? `<div class="tot"><span>IGST (${m.gstRate}%)</span><span>${inr(m.igst)}</span></div>`
    : `<div class="tot"><span>CGST (${m.gstRate / 2}%)</span><span>${inr(m.cgst)}</span></div>
       <div class="tot"><span>SGST (${m.gstRate / 2}%)</span><span>${inr(m.sgst)}</span></div>`;

  const rows = (m.lines || []).map((l) => `
    <tr>
      <td>${esc(l.name)}</td>
      <td class="c">${l.qty != null ? esc(l.qty) : ""}</td>
      <td class="r">${l.amount != null ? inr(l.amount) : "—"}</td>
    </tr>`).join("");

  const s = m.supplier || {};
  const r = m.recipient || {};
  const f = m.facilitator || {};

  return `<!doctype html><html><head><meta charset="utf-8"><title>Tax Invoice ${esc(m.invoiceNo)}</title>
  <style>
    *{box-sizing:border-box}
    body{font-family:Arial,Helvetica,sans-serif;color:#16161a;margin:0;padding:28px;max-width:720px;margin:0 auto;font-size:13px;line-height:1.45}
    .head{display:flex;justify-content:space-between;align-items:flex-start;gap:16px;border-bottom:3px solid #ec430d;padding-bottom:12px}
    .brand{font-size:24px;font-weight:800;color:#ec430d;letter-spacing:-.5px}
    .doc{ text-align:right }
    .doc h2{margin:0;font-size:16px;letter-spacing:1px;text-transform:uppercase}
    .muted{color:#6b6b76}
    .small{font-size:11.5px}
    .parties{display:flex;gap:16px;margin-top:16px}
    .party{flex:1 1 0;border:1px solid #ededf2;border-radius:10px;padding:12px}
    .party h3{margin:0 0 6px;font-size:10.5px;letter-spacing:.4px;text-transform:uppercase;color:#9a9aa5}
    .party .nm{font-weight:700}
    table{width:100%;border-collapse:collapse;margin-top:18px}
    th,td{padding:9px 8px;border-bottom:1px solid #eee;font-size:13px;vertical-align:top}
    th{text-align:left;color:#6b6b76;font-size:11px;text-transform:uppercase;background:#faf7f5}
    td.c,th.c{text-align:center}td.r,th.r{text-align:right}
    .summary{display:flex;justify-content:flex-end;margin-top:8px}
    .summary .box{width:300px;max-width:100%}
    .tot{display:flex;justify-content:space-between;padding:5px 0;font-size:13px}
    .tot.grand{font-weight:800;font-size:16px;border-top:2px solid #16161a;margin-top:6px;padding-top:8px}
    .tot.due{color:#c2350a;font-weight:700}
    .words{margin-top:14px;padding:10px 12px;background:#fff7f2;border:1px solid #f4ddd2;border-radius:8px;font-size:12.5px}
    .note{margin-top:16px;font-size:11px;color:#6b6b76;border-top:1px dashed #ededf2;padding-top:10px}
    .legend{margin-top:6px;font-size:10.5px;color:#9a9aa5}
    @media print{body{padding:0}.noprint{display:none}}
    .actions{margin:0 0 18px;text-align:right}
    .btn{background:#ec430d;color:#fff;border:none;border-radius:8px;padding:9px 16px;font-size:13px;font-weight:700;cursor:pointer}
  </style></head><body>
    <div class="actions noprint"><button class="btn" onclick="window.print()">⤓ Download / Print</button></div>

    <div class="head">
      <div>
        <div class="brand">${esc(f.brand || "CaterKart")}</div>
        <div class="muted small">${esc(f.legalName || "")}</div>
        <div class="muted small">${esc(f.website || "")} · ${esc(f.phone || "")}</div>
      </div>
      <div class="doc">
        <h2>Tax Invoice</h2>
        <div class="small"><strong>${esc(m.invoiceNo)}</strong></div>
        <div class="small muted">Date: ${fmtDate(m.invoiceDate)}</div>
        ${m.refNo ? `<div class="small muted">Ref: ${esc(m.refNo)}</div>` : ""}
      </div>
    </div>

    <div class="parties">
      <div class="party">
        <h3>Supplier (food)</h3>
        <div class="nm">${esc(s.name)}</div>
        ${s.address ? `<div class="small muted">${esc(s.address)}</div>` : ""}
        ${s.gstin ? `<div class="small">GSTIN: ${esc(s.gstin)}</div>` : ""}
        ${s.fssai ? `<div class="small">FSSAI: ${esc(s.fssai)}</div>` : ""}
        <div class="legend">Invoiced by ${esc(f.brand)} on the vendor's behalf (facilitator GSTIN ${esc(f.gstin)}).</div>
      </div>
      <div class="party">
        <h3>Billed to</h3>
        <div class="nm">${esc(r.name)}</div>
        ${r.address ? `<div class="small muted">${esc(r.address)}${r.pincode ? " - " + esc(r.pincode) : ""}</div>` : ""}
        ${r.phone ? `<div class="small">Ph: ${esc(r.phone)}</div>` : ""}
        <div class="small muted">Place of supply: ${esc(m.placeOfSupply || r.state || "")}</div>
      </div>
    </div>

    ${m.meta ? `<div class="small muted" style="margin-top:10px">${[m.meta.eventType, m.meta.period, fmtDate(m.meta.eventDate) !== "—" ? fmtDate(m.meta.eventDate) : "", m.meta.guestsText].filter(Boolean).map(esc).join(" · ")}</div>` : ""}

    <table>
      <thead><tr><th>Description${m.sac ? ` <span class="muted">(SAC ${esc(m.sac)})</span>` : ""}</th><th class="c">Qty</th><th class="r">Amount</th></tr></thead>
      <tbody>${rows || `<tr><td colspan="3" class="muted">No line items</td></tr>`}</tbody>
    </table>

    <div class="summary"><div class="box">
      <div class="tot"><span>Taxable value</span><span>${inr(m.taxable)}</span></div>
      ${taxCols}
      ${m.roundOff ? `<div class="tot"><span>Round off</span><span>${m.roundOff > 0 ? "+" : ""}${inr(m.roundOff)}</span></div>` : ""}
      <div class="tot grand"><span>Total</span><span>${inr(m.total)}</span></div>
      ${m.advancePaid ? `<div class="tot"><span>Advance received</span><span>−${inr(m.advancePaid)}</span></div>` : ""}
      ${m.balanceDue ? `<div class="tot due"><span>Balance due</span><span>${inr(m.balanceDue)}</span></div>` : ""}
    </div></div>

    <div class="words"><strong>Amount in words:</strong> ${esc(m.amountWords)}</div>

    <div class="note">
      ${esc(m.eco?.note || "")}<br/>
      This is a computer-generated tax invoice and does not require a signature.
    </div>
  </body></html>`;
}

export function printInvoice(model) {
  const w = window.open("", "_blank");
  if (!w) return false;
  w.document.write(invoiceHtml(model));
  w.document.close();
  w.focus();
  return true;
}

// Vendor payout / settlement statement (not a tax invoice).
export function payoutStatementHtml(m) {
  const f = m.facilitator || {};
  const v = m.vendor || {};
  const rows = (m.lines || []).map((l) => `
    <tr>
      <td>${esc(l.name)}</td>
      <td class="r ${l.amount < 0 ? "neg" : ""}">${l.amount < 0 ? "−" : ""}${inr(Math.abs(l.amount))}</td>
    </tr>`).join("");

  return `<!doctype html><html><head><meta charset="utf-8"><title>Payout statement ${esc(m.statementNo)}</title>
  <style>
    *{box-sizing:border-box}
    body{font-family:Arial,Helvetica,sans-serif;color:#16161a;margin:0 auto;padding:28px;max-width:640px;font-size:13px;line-height:1.45}
    .head{display:flex;justify-content:space-between;align-items:flex-start;gap:16px;border-bottom:3px solid #ec430d;padding-bottom:12px}
    .brand{font-size:22px;font-weight:800;color:#ec430d}
    .doc{text-align:right}.doc h2{margin:0;font-size:15px;letter-spacing:1px;text-transform:uppercase}
    .muted{color:#6b6b76}.small{font-size:11.5px}
    .party{border:1px solid #ededf2;border-radius:10px;padding:12px;margin-top:16px}
    .party h3{margin:0 0 6px;font-size:10.5px;letter-spacing:.4px;text-transform:uppercase;color:#9a9aa5}
    .party .nm{font-weight:700}
    table{width:100%;border-collapse:collapse;margin-top:16px}
    td{padding:9px 8px;border-bottom:1px solid #eee;font-size:13px}
    td.r{text-align:right}td.neg{color:#c2350a}
    .net{display:flex;justify-content:space-between;margin-top:10px;padding-top:10px;border-top:2px solid #16161a;font-weight:800;font-size:17px}
    .words{margin-top:12px;padding:10px 12px;background:#f0fdf4;border:1px solid #bbf7d0;border-radius:8px;font-size:12.5px}
    .note{margin-top:16px;font-size:11px;color:#6b6b76;border-top:1px dashed #ededf2;padding-top:10px}
    .actions{margin:0 0 18px;text-align:right}
    .btn{background:#ec430d;color:#fff;border:none;border-radius:8px;padding:9px 16px;font-weight:700;cursor:pointer}
    @media print{body{padding:0}.noprint{display:none}}
  </style></head><body>
    <div class="actions noprint"><button class="btn" onclick="window.print()">⤓ Download / Print</button></div>
    <div class="head">
      <div><div class="brand">${esc(f.brand || "CaterKart")}</div><div class="muted small">${esc(f.legalName || "")}</div></div>
      <div class="doc"><h2>Vendor Payout Statement</h2><div class="small"><strong>${esc(m.statementNo)}</strong></div><div class="small muted">Date: ${fmtDate(m.date)}</div>${m.refNo ? `<div class="small muted">Ref: ${esc(m.refNo)}</div>` : ""}</div>
    </div>
    <div class="party"><h3>Payable to vendor</h3><div class="nm">${esc(v.name)}</div>${v.gstin ? `<div class="small">GSTIN: ${esc(v.gstin)}</div>` : ""}${v.address ? `<div class="small muted">${esc(v.address)}</div>` : ""}</div>
    <table><tbody>${rows}</tbody></table>
    <div class="net"><span>Net payable to vendor</span><span>${inr(m.payout)}</span></div>
    ${m.advancePaid ? `<div class="small muted" style="text-align:right;margin-top:4px">Advance already settled: ${inr(m.advancePaid)}</div>` : ""}
    <div class="words"><strong>Amount in words:</strong> ${esc(m.payoutWords)}</div>
    <div class="note">${esc(m.note || "")}<br/>Computer-generated statement — no signature required.</div>
  </body></html>`;
}

export function printPayout(model) {
  const w = window.open("", "_blank");
  if (!w) return false;
  w.document.write(payoutStatementHtml(model));
  w.document.close();
  w.focus();
  return true;
}
