// src/components/pricing/index.jsx
import React from "react";
import { FaGift } from "react-icons/fa";
import { toINR } from "../../utils/util";
import { gstOn, GST_RATE, PLATFORM_FEE, DELIVERY_FEE } from "../../services/pricing";
import "./styles.scss";

const safeNumber = (v) => {
  if (v === null || v === undefined || v === "") return 0;
  if (typeof v === "number") return v;
  if (typeof v === "string") {
    const cleaned = v.replace(/[^\d.-]/g, "");
    const n = Number(cleaned);
    return Number.isFinite(n) ? n : 0;
  }
  return 0;
};

const looksFormatted = (v) => (typeof v === "string" && /[^0-9,.\s-]/.test(v));

const Pricing = ({
  pricing = {},
  guests = 0,
  productPricing = {},
  foodTotalNumeric = null,
}) => {
  const formatted = {
    totalFoodPrice: pricing.totalFoodPrice ?? pricing.total_food_price ?? toINR(0),
    serviceCharge: pricing.serviceCharge ?? pricing.service_charge ?? toINR(0),
    finalPrice: pricing.finalPrice ?? pricing.final_price ?? toINR(0),
  };

  // Numeric values — the source of truth for reconciliation.
  const foodTotal = safeNumber(foodTotalNumeric || formatted.totalFoodPrice);
  // food-side discount (reusable-carrier / negotiated) comes from checkout; no
  // automatic baseline discount.
  const foodDiscount = safeNumber(pricing.discountPax ?? pricing.discount_pax ?? 0);
  const serviceTotal = safeNumber(productPricing?.total ?? productPricing?.totalPrice ?? 0);
  const serviceDiscount = safeNumber(productPricing?.discount ?? 0);
  const serviceFinal = safeNumber(productPricing?.finalPrice ?? productPricing?.final_price ?? 0);

  const subtotal = foodTotal + serviceTotal;
  const totalSavings = foodDiscount + serviceDiscount;
  const taxable = Math.max(0, foodTotal - foodDiscount) + serviceFinal;
  const gst = gstOn(taxable);
  const payable = taxable + gst + PLATFORM_FEE + DELIVERY_FEE;

  const display = {
    totalFoodPrice: looksFormatted(formatted.totalFoodPrice) ? formatted.totalFoodPrice : toINR(foodTotal),
    serviceCharge: looksFormatted(formatted.serviceCharge) ? formatted.serviceCharge : toINR(serviceTotal),
    finalPrice: toINR(payable),
  };

  const hasFood = foodTotal > 0;
  const hasServices = serviceTotal > 0;
  const perGuest = guests > 0 ? payable / guests : 0;

  return (
    <section className="ckBill" aria-label="Bill summary">
      <h3 className="ckBill__title">Bill Summary</h3>

      <div className="ckBill__rows">
        {hasFood && (
          <div className="ckRow">
            <span className="ckRow__label">
              Food
              {guests > 0 && <span className="ckRow__sub">{toINR(foodTotal / guests, 0)} / guest</span>}
            </span>
            <span className="ckRow__value">{display.totalFoodPrice}</span>
          </div>
        )}

        {hasServices && (
          <div className="ckRow">
            <span className="ckRow__label">Services &amp; add-ons</span>
            <span className="ckRow__value">{display.serviceCharge}</span>
          </div>
        )}

        <div className="ckRow">
          <span className="ckRow__label">Platform fee</span>
          <span className="ckRow__value">{toINR(PLATFORM_FEE)}</span>
        </div>

        <div className="ckRow">
          <span className="ckRow__label">Delivery</span>
          <span className="ckRow__value ckRow__value--free">{DELIVERY_FEE > 0 ? toINR(DELIVERY_FEE) : "Free"}</span>
        </div>
      </div>

      <div className="ckBill__divider" />

      <div className="ckBill__rows">
        <div className="ckRow">
          <span className="ckRow__label">Subtotal</span>
          <span className="ckRow__value">{toINR(subtotal)}</span>
        </div>

        {totalSavings > 0 && (
          <div className="ckRow ckRow--save">
            <span className="ckRow__label">Total savings</span>
            <span className="ckRow__value">− {toINR(totalSavings)}</span>
          </div>
        )}

        <div className="ckRow">
          <span className="ckRow__label">GST ({GST_RATE}%)</span>
          <span className="ckRow__value">{toINR(gst)}</span>
        </div>
      </div>

      <div className="ckBill__total">
        <div className="ckBill__totalLeft">
          <span className="ckBill__totalLabel">Total payable</span>
          {guests > 0 && <span className="ckBill__perGuest">≈ {toINR(perGuest, 0)} / guest</span>}
        </div>
        <span className="ckBill__totalValue">{display.finalPrice}</span>
      </div>

      {totalSavings > 0 && (
        <div className="ckBill__savedTag"><FaGift /> You saved {toINR(totalSavings)} on this order</div>
      )}
    </section>
  );
};

export default Pricing;
