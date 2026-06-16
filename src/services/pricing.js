// Single source of truth for all CaterKart pricing rules.
// Every screen (checkout, create-menu, subscriptions, order/track) must import
// from here so discounts, fees, taxes and commission stay uniform.

// --- Taxes & fees -----------------------------------------------------------
export const GST_RATE = 5;          // % GST on prepared-food orders (India standard)
export const PLATFORM_FEE = 0;      // ₹ platform fee — shown on every bill, ₹0 for now
export const DELIVERY_FEE = 0;      // ₹ delivery charge — shown on every bill, ₹0 for now
export const ADVANCE_PCT = 50;      // % advance collected up front

// GST added on top of a (post-discount) taxable amount.
export const gstOn = (taxable) => Math.round((Number(taxable) || 0) * GST_RATE / 100);

// --- Reusable-carrier saving (per box, by box size) -------------------------
// Returnable carriers replace disposable box/plates/cutlery, so we pass the
// saving on. Uniform across one-time orders and subscriptions.
export const CARRIER_SAVING_PER_BOX = { 3: 7, 5: 12, 8: 15 };
export const carrierSavingPerBox = (boxType) => CARRIER_SAVING_PER_BOX[Number(boxType)] || 0;

// --- Customized (co-branded) packaging surcharge (per box) ------------------
// Flat add-on for printing the host's brand / event details on every box's
// sleeve. Mutually exclusive with reusable carriers (a carrier has no sleeve).
export const CO_BRAND_PRICE = 10;

// --- CaterKart commission GST -----------------------------------------------
// The platform commission billed to the vendor is a support service taxed at
// 18% GST (B2B; the vendor claims it back as input tax credit).
export const COMMISSION_GST_RATE = 18;

// --- Bulk discount ----------------------------------------------------------
// Auto bulk discounts are OFF for now. Discounts are negotiated by the admin
// during quote generation (a flat % or amount entered per order/subscription).
export const AUTO_BULK_DISCOUNT = false;
export const bulkDiscountPctFor = () => 0;

// --- CaterKart commission (per vendor, by product line) ---------------------
// Stored on each vendor at onboarding. Computed internally and shown on the
// admin bill; it is NOT charged on top to the customer.
export const commissionPctFor = (vendor, mealType) =>
  String(mealType) === 'buffet'
    ? (Number(vendor?.buffetCommissionPct) || 0)
    : (Number(vendor?.caterboxCommissionPct) || 0);

export const commissionAmount = (base, pct) =>
  Math.round((Number(base) || 0) * (Number(pct) || 0) / 100);

// --- Order economics: Section 9(5) e-commerce-operator model ----------------
// CaterKart is the e-commerce operator (Sec 9(5), CGST Act) for prepared food
// supplied through the platform. It collects the customer's GST-inclusive total
// and then:
//   - remits the 5% food GST to the government ITSELF (not the vendor),
//   - bills the vendor a commission on the ex-GST food value + 18% GST on that
//     commission (a proper tax invoice the vendor can claim as ITC if eligible),
//   - pays the vendor the remainder.
// For ₹100 food at 10% commission:
//   foodGst       = ₹5      (CaterKart remits)
//   total         = ₹105    (customer pays)
//   commission    = ₹10     (CaterKart revenue, on the ₹100 ex-GST value)
//   commissionGst = ₹1.80   (18% — CaterKart's output GST on its service)
//   payout        = ₹88.20  (vendor net cash = food − commission − commission GST)
// Reconciles as: total = payout + commission + commissionGst + foodGst.
export const splitOrderEconomics = (foodNet, commissionPct) => {
  const F = Math.round(Number(foodNet) || 0);
  const pct = Number(commissionPct) || 0;
  const foodGst = Math.round((F * GST_RATE) / 100);                       // remitted by CaterKart (ECO)
  const total = F + foodGst;                                             // customer pays
  const commission = Math.round((F * pct) / 100);                        // on ex-GST food value
  const commissionGst = Math.round((commission * COMMISSION_GST_RATE) / 100); // 18% output GST
  const commissionTotal = commission + commissionGst;                    // billed to vendor
  const payout = F - commission - commissionGst;                         // vendor net cash
  return {
    foodNet: F,
    foodGst,
    total,
    commission,        // CaterKart's commission revenue (ex its GST)
    commissionGst,     // 18% GST CaterKart charges & remits on the commission
    commissionTotal,   // commission + its GST
    payout,            // vendor net cash
    govtGst: foodGst + commissionGst, // total GST CaterKart remits to government
  };
};
