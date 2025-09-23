// src/components/pricing/index.jsx
import React from "react";
import { toINR } from "../../utils/util";
import "./styles.scss";

/**
 * Pricing component:
 * - `pricing` fields can be formatted strings (toINR output) or raw numbers.
 * - `productPricing` is expected to be numeric { total, discount, finalPrice } but may be missing.
 * - `guests` is used when type === "mealbox".
 * - `foodTotalNumeric` (optional number) — if falsy, Food block is hidden.
 *
 * This component normalizes inputs so the UI is resilient to differing shapes.
 */

const safeNumber = (v) => {
  if (v === null || v === undefined || v === "") return 0;
  if (typeof v === "number") return v;
  // try to parse numbers out of strings like "₹ 1,234" or "1,234"
  if (typeof v === "string") {
    const cleaned = v.replace(/[^\d.-]/g, "");
    const n = Number(cleaned);
    return Number.isFinite(n) ? n : 0;
  }
  return 0;
};

const toFormatted = (v) => {
  // If already looks like a formatted string (contains non-digit currency char), return as-is
  if (typeof v === "string" && /[^0-9,.\s-]/.test(v)) return v;
  // Otherwise convert numeric to formatted INR
  return toINR(safeNumber(v));
};

const Pricing = ({
  isService,
  type = "guest",
  pricing = {},
  guests = 0,
  productPricing = {},
  foodTotalNumeric = null,
}) => {
  // Normalize incoming 'pricing' — accept both formatted strings or numeric values
  const normalizedPricing = {
    pricepax: pricing.pricepax ?? pricing.pricePax ?? 0,
    totalFoodPrice: pricing.totalFoodPrice ?? pricing.total_food_price ?? 0,
    serviceCharge: pricing.serviceCharge ?? pricing.service_charge ?? 0,
    totalPrice: pricing.totalPrice ?? pricing.total_price ?? 0,
    discountPax: pricing.discountPax ?? pricing.discount_pax ?? 0,
    totalDiscount: pricing.totalDiscount ?? pricing.total_discount ?? 0,
    finalPrice: pricing.finalPrice ?? pricing.final_price ?? 0,
  };

  // Ensure numeric representation where needed
  const numericFoodTotal = safeNumber(foodTotalNumeric || normalizedPricing.totalFoodPrice);
  const foodDiscountNumeric = Math.round(numericFoodTotal * 0.05);

  const serviceDiscountNumeric = safeNumber(productPricing?.discount ?? 0);

  const combinedDiscountNumeric = foodDiscountNumeric + serviceDiscountNumeric;

  const showFood = numericFoodTotal > 0;

  // Render formatted string versions for display — prefer provided formatted values if they look formatted
  const display = {
    pricepax: toFormatted(normalizedPricing.pricepax),
    totalFoodPrice: toFormatted(normalizedPricing.totalFoodPrice),
    serviceCharge: toFormatted(normalizedPricing.serviceCharge),
    totalPrice: toFormatted(normalizedPricing.totalPrice),
    discountPax: toFormatted(normalizedPricing.discountPax),
    totalDiscount: toFormatted(normalizedPricing.totalDiscount),
    finalPrice: toFormatted(normalizedPricing.finalPrice),
  };

  // Service numeric values safe fallback
  const serviceTotalNumeric = safeNumber(productPricing?.total ?? productPricing?.totalPrice ?? 0);
  const serviceFinalNumeric = safeNumber(productPricing?.finalPrice ?? productPricing?.final_price ?? 0);

  return (
    <section className="pricingSection">
      {showFood && (
        <div className="pricePaxSection">
          <span className="key">
            <span>Food </span>
          </span>
          <span>{display.totalFoodPrice}</span>
        </div>
      )}

      {isService && type !== "mealbox" && (
        <div className="pricePaxSection">
          <span className="key">
            <span>Service charge </span>
            <span className="subtext">&nbsp;&nbsp;{`${toINR(20, 0)} / plate`}</span>
          </span>
          <span>{display.serviceCharge}</span>
        </div>
      )}

      {type === "mealbox" && (
        <div className="pricePaxSection">
          <span className="key">
            <span>Box & Packaging Charges </span>
            <span className="subtext">&nbsp;&nbsp;{`${toINR(10)} x ${guests} Mealbox`}</span>
          </span>
          <span className="packagingCharges">
            <span className="discountedPrice">&nbsp;&nbsp;{toINR(10 * (guests || 0))}</span>
          </span>
        </div>
      )}

      <div className="pricePaxSection">
        <span className="key">
          <span>Delivery Charges </span>
          <span className="subtext">&nbsp;&nbsp;free</span>
        </span>
        <span>{toINR(0)}</span>
      </div>

      {showFood && (
        <div className="pricePaxSection discount">
          <span className="key">
            <span>Food savings </span>
            <span className="subtext">
              &nbsp;&nbsp;{type === "bulk" ? toINR(foodDiscountNumeric) : `${toINR(foodDiscountNumeric)} / ${type}`}
            </span>
          </span>
          <span>- {toINR(foodDiscountNumeric)}</span>
        </div>
      )}

      {serviceTotalNumeric ? (
        <>
          <hr />
          <div className="pricePaxSection">
            <span className="key">Service cost (before discount)</span>
            <span>{toINR(serviceTotalNumeric)}</span>
          </div>
          <div className="pricePaxSection discount">
            <span className="key">Service savings</span>
            <span>- {toINR(serviceDiscountNumeric)}</span>
          </div>
          <div className="pricePaxSection">
            <span className="key">Service total</span>
            <span>{toINR(serviceFinalNumeric)}</span>
          </div>
        </>
      ) : null}

      <hr />
      <div className="pricePaxSection">
        <span className="key">Total savings</span>
        <span>- {toINR(combinedDiscountNumeric)}</span>
      </div>
      <hr />
      <div className="pricePaxSection finalPriceSection">
        <span className="key">Total Amount Payable</span>
        {/* prefer display.finalPrice if it looks formatted, else compute from numbers */}
        <span className="key">
          {typeof normalizedPricing.finalPrice === "string" && /[^0-9]/.test(normalizedPricing.finalPrice)
            ? normalizedPricing.finalPrice
            : toINR(
                safeNumber(normalizedPricing.finalPrice) ||
                (safeNumber(numericFoodTotal) - foodDiscountNumeric) + safeNumber(serviceFinalNumeric)
              )}
        </span>
      </div>
    </section>
  );
};

export default Pricing;
