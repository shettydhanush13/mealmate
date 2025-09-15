// src/components/pricing/index.jsx
import React from "react";
import { toINR } from "../../utils/util";
import "./styles.scss";

/**
 * Pricing component:
 * - `pricing` fields are expected to be formatted strings (toINR output).
 * - `productPricing` is numeric { total, discount, finalPrice }.
 * - `guests` is used when type === "mealbox".
 * - `foodTotalNumeric` (optional number) — if falsy, Food block is hidden.
 */

const Pricing = ({ isService, type = "guest", pricing = {}, guests = 0, productPricing = {}, foodTotalNumeric = null }) => {
  // defensive defaults for formatted pricing strings (these come from parent)
  const formatted = {
    pricepax: pricing.pricepax ?? toINR(0),
    totalFoodPrice: pricing.totalFoodPrice ?? toINR(0),
    serviceCharge: pricing.serviceCharge ?? toINR(0),
    totalPrice: pricing.totalPrice ?? toINR(0),
    discountPax: pricing.discountPax ?? toINR(0),
    totalDiscount: pricing.totalDiscount ?? toINR(0),
    finalPrice: pricing.finalPrice ?? toINR(0),
  };

  // compute food discount locally (5% rounded)
  const foodTotal = Number(foodTotalNumeric || 0);
  const foodDiscountNumeric = Math.round(foodTotal * 0.05);

  // combined discount = food discount + service discount (numeric)
  const serviceDiscountNumeric = Number(productPricing?.discount || 0);
  const combinedDiscountNumeric = foodDiscountNumeric + serviceDiscountNumeric;

  const showFood = Boolean(foodTotal > 0);

  return (
    <section className="pricingSection">
      {showFood && (
        <div className="pricePaxSection">
          <span className="key"><span>Food </span></span>
          <span>{formatted.totalFoodPrice}</span>
        </div>
      )}

      {isService && type !== "mealbox" && (
        <div className="pricePaxSection">
          <span className="key">
            <span>Service charge </span>
            <span className="subtext">&nbsp;&nbsp;{`${toINR(20, 0)} / plate`}</span>
          </span>
          <span>{formatted.serviceCharge}</span>
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

      {/* Food discount: computed locally from foodTotalNumeric */}
      {showFood && <div className="pricePaxSection discount">
        <span className="key">
          <span>Food savings </span>
          <span className="subtext">
            &nbsp;&nbsp;{type === "bulk" ? toINR(foodDiscountNumeric) : `${toINR(foodDiscountNumeric)} / ${type}`}
          </span>
        </span>
        <span>- {toINR(foodDiscountNumeric)}</span>
      </div>}

      {/* If services exist show their totals and discounts */}
      {productPricing?.total ? (
        <>
          <hr />
          <div className="pricePaxSection">
            <span className="key">Service cost (before discount)</span>
            <span>{toINR(productPricing.total)}</span>
          </div>
          <div className="pricePaxSection discount">
            <span className="key">Service savings</span>
            <span>- {toINR(serviceDiscountNumeric)}</span>
          </div>
          <div className="pricePaxSection">
            <span className="key">Service total</span>
            <span>{toINR(productPricing.finalPrice)}</span>
          </div>
        </>
      ) : null}

      {/* Show combined discount (food + service) as total discount */}
      <hr />
      <div className="pricePaxSection">
        <span className="key">Total savings</span>
        <span>- {toINR(combinedDiscountNumeric)}</span>
      </div>
      <hr />
      <div className="pricePaxSection finalPriceSection">
        <span className="key">Total Amount Payable</span>
        <span className="key">{formatted.finalPrice}</span>
      </div>
    </section>
  );
};

export default Pricing;
