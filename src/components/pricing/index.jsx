import React from "react";
import { toINR } from "../../utils/util";
import "./styles.scss";

const Pricing = ({ isService, type = "guest", pricing, guests, productPricing }) => {
    return (
        <section className="pricingSection">
            <div className="pricePaxSection">
                <span className="key">
                    <span>Food </span>
                </span>
                <span>{pricing.totalFoodPrice}</span>
            </div>

            {isService && type !== "mealbox" && (
                <div className="pricePaxSection">
                    <span className="key">
                        <span>Service charge </span>
                        <span className="subtext">&nbsp;&nbsp;{`${toINR(20, 0)} / plate`}</span>
                    </span>
                    <span>{pricing.serviceCharge}</span>
                </div>
            )}

            {type === "mealbox" && (
                <div className="pricePaxSection">
                    <span className="key">
                        <span>Box & Packaging Charges </span>
                        <span className="subtext">&nbsp;&nbsp;{`${toINR(10)} x ${guests} Mealbox`}</span>
                    </span>
                    <span className="packagingCharges">
                        <span className="discountedPrice">&nbsp;&nbsp;{toINR(10 * guests)}</span>
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
                    <span>Bulk order discount </span>
                    <span className="subtext">
                        &nbsp;&nbsp;{type === "bulk" ? pricing.discountPax : `${pricing.discountPax} / ${type}`}
                    </span>
                </span>
                <span>- {pricing.totalDiscount}</span>
            </div>

            {productPricing?.total !== 0 && (
                <>
                    <hr />
                    <div className="pricePaxSection">
                        <span className="key">
                            <span>Service total </span>
                        </span>
                        <span>{toINR(productPricing.total)}</span>
                    </div>
                    <div className="pricePaxSection discount">
                        <span className="key">
                            <span>Service discount </span>
                        </span>
                        <span>- {toINR(productPricing.discount)}</span>
                    </div>
                </>
            )}

            <hr />
            <div className="pricePaxSection finalPriceSection">
                <span className="key">Final price :</span>
                <span className="key">{pricing.finalPrice}</span>
            </div>
        </section>
    );
};

export default Pricing;
