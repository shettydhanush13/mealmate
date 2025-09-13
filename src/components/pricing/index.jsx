import React from "react";
import { toINR } from "../../utils/util";
import "./styles.scss";

/**
 * Pricing component — unchanged API, but cleaned up rendering and formatting:
 * - `pricing` fields are expected to be formatted strings (toINR output).
 * - `productPricing` is numeric { total, discount, finalPrice }.
 * - `guests` is used when type === "mealbox".
 */

const Pricing = ({ isService, type = "guest", pricing = {}, guests = 0, productPricing = {} }) => {
  // defensive defaults for formatted pricing strings
  const formatted = {
    pricepax: pricing.pricepax ?? toINR(0),
    totalFoodPrice: pricing.totalFoodPrice ?? toINR(0),
    serviceCharge: pricing.serviceCharge ?? toINR(0),
    totalPrice: pricing.totalPrice ?? toINR(0),
    discountPax: pricing.discountPax ?? toINR(0),
    totalDiscount: pricing.totalDiscount ?? toINR(0),
    finalPrice: pricing.finalPrice ?? toINR(0),
  };

  return (
    <section className="pricingSection">
      <div className="pricePaxSection">
        <span className="key"><span>Food </span></span>
        <span>{formatted.totalFoodPrice}</span>
      </div>

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

      <div className="pricePaxSection discount">
        <span className="key">
          <span>Food discount </span>
          <span className="subtext">
            &nbsp;&nbsp;{type === "bulk" ? formatted.discountPax : `${formatted.discountPax} / ${type}`}
          </span>
        </span>
        <span>- {formatted.totalDiscount}</span>
      </div>

      {productPricing?.total ? (
        <>
          <hr />
          <div className="pricePaxSection">
            <span className="key">Service total </span>
            <span>{toINR(productPricing.total)}</span>
          </div>
          <div className="pricePaxSection discount">
            <span className="key">Service discount </span>
            <span>- {toINR(productPricing.discount)}</span>
          </div>
        </>
      ) : null}

      <hr />
      <div className="pricePaxSection finalPriceSection">
        <span className="key">Final price :</span>
        <span className="key">{formatted.finalPrice}</span>
      </div>
    </section>
  );
};

export default Pricing;
