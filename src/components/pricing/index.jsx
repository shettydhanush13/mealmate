import React from "react";
import { toINR } from "../../helper";
import './styles.scss';

const Pricing = ({ isService, pricepax, pricing, guests }) => {
    return <section className="pricingSection">
            <div className="pricePaxSection">
                <span className="key">
                    <span>Food </span>
                    <span className="subtext">&nbsp;&nbsp;{`${toINR(pricepax, 0)} x ${guests} guests`}</span>
                </span>
                <span>{pricing.totalFoodPrice}</span>
            </div>
            <div className="pricePaxSection">
                <span className="key">
                    <span>Service </span>
                    <span className="subtext">&nbsp;&nbsp;{` ${isService ? `${toINR(20, 0)} / plate` : ''}`}</span>
                </span>
                <span>{pricing.serviceCharge}</span>
            </div>
            <div className="pricePaxSection discount">
                <span className="key">
                    <span>Bulk order discount </span>
                    <span className="subtext">&nbsp;&nbsp;{`${pricing.discountPax} / plate`}</span>
                </span>
                <span>- {pricing.totalDiscount}</span>
            </div>
            <hr />
            <div className="pricePaxSection finalPriceSection">
                <span className="key">Final price :</span>
                <span className="key">{pricing.finalPrice}</span>
            </div>
        </section>
    };

export default Pricing;
