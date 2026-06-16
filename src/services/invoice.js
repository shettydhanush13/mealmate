// Customer tax-invoice builder for CaterKart.
//
// Model: COMMISSION / MARKETPLACE. The food is supplied by the vendor (the
// supplier of record on the tax invoice); CaterKart facilitates and issues the
// invoice on the vendor's behalf. CaterKart's commission is billed to the
// vendor separately (not on this customer invoice).
//
// Amounts charged to the customer are GST-inclusive (matches how totals are
// stored and shown on Track Order). The builder back-computes the taxable value
// and the CGST/SGST (or IGST) split from that inclusive total so the invoice
// always reconciles to what the customer actually paid.

import { GST_RATE, ADVANCE_PCT, PLATFORM_FEE, DELIVERY_FEE, COMMISSION_GST_RATE, splitOrderEconomics } from "./pricing";

const GST_FRACTION = GST_RATE / 100;
const round = (n) => Math.round(Number(n) || 0);
const num = (v) => {
  const n = Number(String(v ?? "").replace(/[^0-9.-]/g, ""));
  return Number.isFinite(n) ? n : 0;
};

// --- Seller / platform legal config (FILL with your registered details) -----
// In the commission model these identify CaterKart as the *facilitator*; the
// food supplier on the invoice is the vendor (see buildOrderInvoice).
export const SELLER = {
  brand: "CaterKart",
  legalName: "<CaterKart legal entity — update>",
  gstin: "<CATERKART_GSTIN — update>",
  address: "<Registered office, Bengaluru, Karnataka 560001 — update>",
  state: "Karnataka",
  stateCode: "29",
  phone: "+91 72042 42111",
  email: "support@caterkart.in",
  website: "caterkart.in",
};

// GST treatment of the food supply — configurable, default: the vendor (as
// supplier of record) collects & remits the food GST. Switch later once your
// CA confirms whether catering via the platform is an ECO supply.
export const TAX_CONFIG = {
  ecoMode: "section-9-5", // "vendor-remits" | "tcs" | "section-9-5" — CaterKart is the ECO (Sec 9(5))
  tcsPct: 1,                // % TCS on the vendor's net supply (Sec 52) when ecoMode === "tcs"
  homeState: "Karnataka",
  homeStateCode: "29",
  foodSac: "9963",          // SAC for restaurant / outdoor-catering service
  commissionSac: "9985",    // SAC for support / intermediary services
};

// Split a (post-discount) taxable value into CGST/SGST (intra-state) or IGST.
export const splitGst = (taxable, interState = false, ratePct = GST_RATE) => {
  const tax = round((Number(taxable) || 0) * ratePct / 100);
  if (interState) return { igst: tax, cgst: 0, sgst: 0, ratePct };
  const half = round(tax / 2);
  return { cgst: half, sgst: tax - half, igst: 0, ratePct };
};

// Indian-format amount in words (used on the invoice, legally expected).
const ones = ["", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine", "Ten",
  "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen", "Seventeen", "Eighteen", "Nineteen"];
const tens = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];
const twoDigit = (x) => (x < 20 ? ones[x] : tens[Math.floor(x / 10)] + (x % 10 ? " " + ones[x % 10] : ""));
const threeDigit = (x) =>
  x >= 100 ? ones[Math.floor(x / 100)] + " Hundred" + (x % 100 ? " " + twoDigit(x % 100) : "") : twoDigit(x);
export function amountInWords(value) {
  let n = round(value);
  if (n <= 0) return "Rupees Zero Only";
  let out = "";
  const crore = Math.floor(n / 10000000); n %= 10000000;
  const lakh = Math.floor(n / 100000); n %= 100000;
  const thousand = Math.floor(n / 1000); n %= 1000;
  if (crore) out += threeDigit(crore) + " Crore ";
  if (lakh) out += twoDigit(lakh) + " Lakh ";
  if (thousand) out += twoDigit(thousand) + " Thousand ";
  if (n) out += threeDigit(n);
  return `Rupees ${out.trim()} Only`;
}

// Financial year string (Apr–Mar) for invoice numbering.
const fyOf = (d) => {
  const dt = d ? new Date(d) : new Date();
  const y = dt.getFullYear();
  const start = dt.getMonth() >= 3 ? y : y - 1; // Apr = month 3
  return `${String(start).slice(-2)}-${String(start + 1).slice(-2)}`;
};

// Display invoice number. NOTE: the canonical, gap-free sequential number must
// be assigned server-side per supplier per FY — prefer order.invoiceNo when the
// backend provides it; this is a deterministic fallback for display/preview.
const deriveInvoiceNo = (o) => {
  const tail = String(o.orderNumber || o._id || "").replace(/[^A-Za-z0-9]/g, "").slice(-6).toUpperCase();
  return `CK/${fyOf(o.date || o.createdDate)}/${tail || "000000"}`;
};

const eco = () => {
  const mode = TAX_CONFIG.ecoMode;
  if (mode === "section-9-5") {
    return { mode, note: `GST on this supply is paid by ${SELLER.brand} as an e-commerce operator under Section 9(5) of the CGST Act.` };
  }
  if (mode === "tcs") {
    return { mode, note: `${SELLER.brand} collects TCS under Section 52 on the supplier's net taxable supply.` };
  }
  return { mode, note: `Food is supplied & GST is remitted by the vendor named above. ${SELLER.brand} is the facilitator.` };
};

const lineOf = (m) => {
  const qty = Number(m.quantity || 0);
  const unit = m.unitPrice != null ? Number(m.unitPrice) : (m.price && qty ? Number(m.price) / qty : 0);
  return m.discountedPrice != null ? Number(m.discountedPrice) : unit * qty;
};

// Build a normalized customer tax-invoice model from a completed order.
// `opts`: { vendorProfile, interState, invoiceNo, issuedAt }
export function buildOrderInvoice(rawOrder, opts = {}) {
  const o = (rawOrder && rawOrder.order) || rawOrder || {};
  const price = o.price || {};
  const total = (price._numeric && typeof price._numeric.finalPrice === "number")
    ? price._numeric.finalPrice
    : num(price.finalPrice);

  const menu = Array.isArray(o.menu_sections) ? o.menu_sections : [];
  const services = Array.isArray(o.services) ? o.services : [];
  const lines = [
    ...menu.map((m) => ({ name: m.name || "Item", qty: Number(m.quantity || 0) || null, amount: round(lineOf(m)) })),
    ...services.map((s) => ({
      name: s.title || "Service",
      qty: s.extraInfo?.plates || null,
      amount: s.price != null ? round(num(s.price)) : null,
    })),
  ].filter((l) => l.name);

  const interState = opts.interState ?? false;
  const taxable = round(total / (1 + GST_FRACTION));
  const { cgst, sgst, igst } = splitGst(taxable, interState);
  const grandTotal = taxable + cgst + sgst + igst;
  const roundOff = round(total - grandTotal); // reconcile any ₹ rounding to the charged total

  const advancePaid = opts.advancePaid != null
    ? round(opts.advancePaid)
    : (o.paidAmount != null ? round(num(o.paidAmount)) : round(total * ADVANCE_PCT / 100));
  const balanceDue = Math.max(0, total - advancePaid);

  const cust = o.customerData || o.customer || {};
  const vp = opts.vendorProfile || {};
  const placeOfSupply = [cust.area, TAX_CONFIG.homeState].filter(Boolean).join(", ");

  const diet = o.dietConfig || {};
  const guestsText = diet.dietMode === "veg+nonveg"
    ? `${Number(diet.vegGuests || 0)} veg · ${Number(diet.nonVegGuests || 0)} non-veg`
    : (o.people != null ? `${o.people} guests` : "");

  return {
    kind: "order",
    invoiceNo: o.invoiceNo || opts.invoiceNo || deriveInvoiceNo(o),
    invoiceDate: opts.issuedAt || o.date || o.createdDate || null,
    refNo: o.orderNumber || o._id || "",
    placeOfSupply,
    interState,
    sac: TAX_CONFIG.foodSac,
    gstRate: GST_RATE,

    // Supplier of record in the commission model = the vendor.
    supplier: {
      name: o.vendor || vp.name || "Vendor",
      gstin: vp.gstin || "",
      fssai: vp.fssaiNumber || "",
      address: vp.address || "",
      state: vp.state || TAX_CONFIG.homeState,
    },
    facilitator: SELLER, // CaterKart, issuing on the vendor's behalf

    recipient: {
      name: cust.name || "Customer",
      phone: cust.phone || "",
      address: [cust.address, cust.area].filter(Boolean).join(", "),
      pincode: cust.pincode || o.pincode || "",
      state: TAX_CONFIG.homeState,
    },

    meta: { eventType: o.eventType || "Order", eventDate: o.date || "", guestsText },
    lines,

    taxable, cgst, sgst, igst, roundOff,
    total,
    amountWords: amountInWords(total),
    advancePaid, balanceDue,
    platformFee: PLATFORM_FEE, delivery: DELIVERY_FEE,
    eco: eco(),
  };
}

// Build a weekly customer tax-invoice for a subscription. `week` carries the
// billable taxable amount for the week and any descriptive lines:
//   { number, from, to, taxableTotal, lines: [{name, qty, amount}] }
export function buildSubscriptionWeekInvoice(sub = {}, week = {}, opts = {}) {
  const interState = opts.interState ?? false;
  const taxable = round(week.taxableTotal || 0);
  const { cgst, sgst, igst } = splitGst(taxable, interState);
  const total = taxable + cgst + sgst + igst;

  const placeOfSupply = [sub.area, TAX_CONFIG.homeState].filter(Boolean).join(", ");
  const vp = opts.vendorProfile || {};

  return {
    kind: "subscription-week",
    invoiceNo: opts.invoiceNo || `CK/${fyOf(week.to || week.from)}/SUB-${String(sub._id || "").slice(-6).toUpperCase()}-W${week.number || ""}`,
    invoiceDate: opts.issuedAt || week.to || null,
    refNo: sub._id || "",
    placeOfSupply,
    interState,
    sac: TAX_CONFIG.foodSac,
    gstRate: GST_RATE,

    supplier: {
      name: opts.vendorName || vp.name || "Vendor",
      gstin: vp.gstin || "",
      fssai: vp.fssaiNumber || "",
      address: vp.address || "",
      state: vp.state || TAX_CONFIG.homeState,
    },
    facilitator: SELLER,

    recipient: {
      name: sub.contactName || "Customer",
      phone: sub.phone || "",
      address: [sub.organisation, sub.area].filter(Boolean).join(", "),
      pincode: sub.pincode || "",
      state: TAX_CONFIG.homeState,
    },

    meta: {
      eventType: "CaterBox subscription",
      period: week.from && week.to ? `${week.from} – ${week.to}` : (week.number ? `Week ${week.number}` : ""),
      guestsText: sub.totalMeals ? `${sub.totalMeals} meals / delivery` : "",
    },
    lines: Array.isArray(week.lines) ? week.lines : [],

    taxable, cgst, sgst, igst, roundOff: 0,
    total,
    amountWords: amountInWords(total),
    advancePaid: 0, balanceDue: total, // subscriptions are billed weekly in arrears
    platformFee: PLATFORM_FEE, delivery: DELIVERY_FEE,
    eco: eco(),
  };
}

// --- Vendor commission invoice (CaterKart -> vendor, 18% GST) ----------------
// A proper GST tax invoice for CaterKart's platform commission: commission on the
// ex-GST food value, taxed at 18% (SAC 9985). Supplier = CaterKart, recipient =
// the vendor, who may claim the GST as ITC if eligible. Renders via invoiceHtml().
// `opts`: { base (food ex-GST), pct, vendor:{name,gstin,address,state}, refNo, interState, invoiceNo, issuedAt }
export function buildCommissionInvoice(opts = {}) {
  const base = round(opts.base || 0);
  const pct = Number(opts.pct) || 0;
  const ec = splitOrderEconomics(base, pct);
  const interState = opts.interState ?? false;
  const { cgst, sgst, igst } = splitGst(ec.commission, interState, COMMISSION_GST_RATE);
  const total = ec.commission + cgst + sgst + igst;
  const v = opts.vendor || {};

  return {
    kind: "commission",
    invoiceNo: opts.invoiceNo || `CK/${fyOf(opts.issuedAt)}/COM-${String(opts.refNo || "").replace(/[^A-Za-z0-9]/g, "").slice(-6).toUpperCase()}`,
    invoiceDate: opts.issuedAt || null,
    refNo: opts.refNo || "",
    placeOfSupply: [v.state || TAX_CONFIG.homeState].filter(Boolean).join(""),
    interState,
    sac: TAX_CONFIG.commissionSac,
    gstRate: COMMISSION_GST_RATE,

    // CaterKart is the supplier of the commission service.
    supplier: {
      name: SELLER.legalName || SELLER.brand,
      gstin: SELLER.gstin,
      address: SELLER.address,
      state: SELLER.state,
    },
    facilitator: SELLER,

    // The vendor is the recipient (and bears the commission).
    recipient: {
      name: v.name || "Vendor",
      gstin: v.gstin || "",
      address: v.address || "",
      state: v.state || TAX_CONFIG.homeState,
    },

    meta: { eventType: "Platform commission", period: opts.refNo ? `Order ${opts.refNo}` : "" },
    lines: [{ name: `Platform commission @ ${pct}% on food value (₹${ec.foodNet.toLocaleString("en-IN")})`, qty: null, amount: ec.commission }],

    taxable: ec.commission, cgst, sgst, igst, roundOff: 0,
    total,
    amountWords: amountInWords(total),
    advancePaid: 0, balanceDue: total,
    platformFee: 0, delivery: 0,
    eco: { mode: "commission", note: "Reverse-charge not applicable. Recipient may claim this GST as input tax credit if eligible (note: restaurants under the 5% scheme generally cannot)." },
  };
}

// --- Vendor payout / settlement statement (not a tax invoice) ----------------
// Cash settlement for the vendor under the Section 9(5) e-commerce-operator model:
//   - CaterKart remits the 5% food GST to govt itself (NOT passed to the vendor),
//   - deducts commission (pct% of ex-GST food value) + 18% GST on commission,
//   - pays the vendor the remainder.
//   payout = food value − commission − commission GST
// `opts`: { vendor:{name,...}, refNo, foodValue, commissionPct, advancePaid, issuedAt }
export function buildPayoutStatement(opts = {}) {
  const foodValue = round(opts.foodValue != null ? opts.foodValue : opts.grossCollected || 0); // ex-GST
  const pct = Number(opts.commissionPct) || 0;
  const ec = splitOrderEconomics(foodValue, pct);
  const v = opts.vendor || {};

  const lines = [
    { name: "Food value (excl. GST)", amount: ec.foodNet, kind: "add" },
    { name: `Less: CaterKart commission (${pct}% of food value)`, amount: -ec.commission, kind: "sub" },
    { name: `Less: GST on commission (${COMMISSION_GST_RATE}%) — claim as ITC if eligible`, amount: -ec.commissionGst, kind: "sub" },
  ];

  return {
    kind: "payout",
    statementNo: opts.statementNo || `CK/${fyOf(opts.issuedAt)}/PAY-${String(opts.refNo || "").replace(/[^A-Za-z0-9]/g, "").slice(-6).toUpperCase()}`,
    date: opts.issuedAt || null,
    refNo: opts.refNo || "",
    vendor: { name: v.name || "Vendor", gstin: v.gstin || "", address: v.address || "" },
    facilitator: SELLER,
    lines,
    foodValue: ec.foodNet, foodGst: ec.foodGst, gross: ec.total,
    commission: ec.commission, commissionGst: ec.commissionGst, payout: ec.payout,
    payoutWords: amountInWords(ec.payout),
    advancePaid: round(opts.advancePaid || 0),
    note: `Settlement statement (not a tax invoice). CaterKart, as the e-commerce operator under Section 9(5), collects ₹${ec.total.toLocaleString("en-IN")} from the customer and remits the ${GST_RATE}% food GST (₹${ec.foodGst.toLocaleString("en-IN")}) to the government. The ${COMMISSION_GST_RATE}% commission GST is billed via a separate tax invoice.`,
  };
}
