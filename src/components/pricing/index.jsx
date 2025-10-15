// src/components/pricing/index.jsx
import React from "react";
import { toINR } from "../../utils/util";
import "./styles.scss";

/**
 * Pricing component updated to:
 * - Accept `pricing` (formatted strings) + `productPricing` (numeric) + `foodTotalNumeric`
 * - Compute numeric fallbacks for discount & final total so UI shows consistent numbers
 * - Keep formatted strings when provided, otherwise format computed numeric values
 */

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
  type = "guest",
  pricing = {},
  guests = 0,
  productPricing = {},
  foodTotalNumeric = null,
}) => {
  // Normalise incoming pricing (may contain formatted strings)
  const formatted = {
    pricepax: pricing.pricepax ?? pricing.pricePax ?? pricing.price_pax ?? toINR(0),
    totalFoodPrice: pricing.totalFoodPrice ?? pricing.total_food_price ?? toINR(0),
    serviceCharge: pricing.serviceCharge ?? pricing.service_charge ?? toINR(0),
    totalPrice: pricing.totalPrice ?? pricing.total_price ?? toINR(0),
    discountPax: pricing.discountPax ?? pricing.discount_pax ?? toINR(0),
    totalDiscount: pricing.totalDiscount ?? pricing.total_discount ?? toINR(0),
    finalPrice: pricing.finalPrice ?? pricing.final_price ?? toINR(0),
  };

  // Numeric fallbacks
  const numericFoodTotal = safeNumber(foodTotalNumeric || formatted.totalFoodPrice);
  const foodDiscountNumeric = Math.round(numericFoodTotal * 0.05);
  const serviceTotalNumeric = safeNumber(productPricing?.total ?? productPricing?.totalPrice ?? 0);
  const serviceDiscountNumeric = safeNumber(productPricing?.discount ?? 0);
  const serviceFinalNumeric = safeNumber(productPricing?.finalPrice ?? productPricing?.final_price ?? 0);
  const combinedDiscountNumeric = foodDiscountNumeric + serviceDiscountNumeric;

  // Display strings: prefer provided formatted strings, else format numeric values
  const display = {
    totalFoodPrice: looksFormatted(formatted.totalFoodPrice) ? formatted.totalFoodPrice : toINR(numericFoodTotal),
    serviceCharge: looksFormatted(formatted.serviceCharge) ? formatted.serviceCharge : toINR(serviceTotalNumeric),
    discountPax: looksFormatted(formatted.discountPax) ? formatted.discountPax : toINR(foodDiscountNumeric),
    totalDiscount: looksFormatted(formatted.totalDiscount) ? formatted.totalDiscount : toINR(combinedDiscountNumeric),
    finalPrice: looksFormatted(formatted.finalPrice) ? formatted.finalPrice : toINR(Math.max(0, numericFoodTotal - foodDiscountNumeric) + serviceFinalNumeric),
    totalPrice: looksFormatted(formatted.totalPrice) ? formatted.totalPrice : toINR(numericFoodTotal + serviceTotalNumeric),
  };

  const showFood = numericFoodTotal > 0;

  return (
    <section className="pricingSection">
      {showFood && (
        <div className="pricePaxSection">
          <span className="key">Food <span className="subtext">&nbsp;&nbsp;{toINR(numericFoodTotal/guests)} Pax</span></span>
          <span>{display.totalFoodPrice}</span>
        </div>
      )}

      {showFood && (
        <div className="pricePaxSection discount">
          <span className="key">Food savings <span className="subtext">&nbsp;&nbsp;{toINR((numericFoodTotal-foodDiscountNumeric)/guests)} Pax after discount</span></span>
          <span>- {toINR(foodDiscountNumeric)}</span>
        </div>
      )}

      <div className="pricePaxSection">
        <span className="key">Delivery Charges<span className="subtext">&nbsp;&nbsp;Free</span></span>
        <span>{toINR(0)}</span>
      </div>

      <hr />
      <div className="pricePaxSection discount">
        <span className="key">Total savings</span>
        <span>- {toINR(combinedDiscountNumeric)}</span>
      </div>
      <hr />
      <div className="pricePaxSection finalPriceSection">
        <span className="key">Total Amount Payable</span>
        <span className="key">{display.finalPrice}</span>
      </div>
    </section>
  );
};

export default Pricing;
