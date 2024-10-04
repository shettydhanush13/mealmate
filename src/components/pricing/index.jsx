import React from "react";
import { toINR } from "../../helper";
import './styles.scss';

const Pricing = ({ isService, type = 'Plate', pricepax, pricing, guests }) => {
    return <section className="pricingSection">
            <div className="pricePaxSection">
                <span className="key">
                    <span>Food </span>
                    <span className="subtext">&nbsp;&nbsp;{`${toINR(pricepax, 0)} x ${guests} ${type === 'Mealbox' ? 'Mealbox' : guests}`}</span>
                </span>
                <span>{pricing.totalFoodPrice}</span>
            </div>
            {type !== 'Mealbox' && <div className="pricePaxSection">
                <span className="key">
                    <span>Service </span>
                    <span className="subtext">&nbsp;&nbsp;{` ${isService ? `${toINR(20, 0)} / plate` : ''}`}</span>
                </span>
                <span>{pricing.serviceCharge}</span>
            </div>}
            {type === 'Mealbox' && <div className="pricePaxSection">
                <span className="key">
                    <span>Box & Packaging Charges </span>
                    <span className="subtext">&nbsp;&nbsp;{`free`}</span>
                </span>
                <span>{toINR(0)}</span>
            </div>}
            {type === 'Mealbox' && <div className="pricePaxSection">
                <span className="key">
                    <span>Delivery Charges </span>
                    <span className="subtext">&nbsp;&nbsp;{`free`}</span>
                </span>
                <span>{toINR(0)}</span>
            </div>}
            {type === 'Mealbox' && <div className="pricePaxSection">
                <span className="key">
                    <span>Taxes & Charges </span>
                    <span className="subtext">&nbsp;&nbsp;{``}</span>
                </span>
                <span>{toINR(0)}</span>
            </div>}
            <div className="pricePaxSection discount">
                <span className="key">
                    <span>Bulk order discount </span>
                    <span className="subtext">&nbsp;&nbsp;{`${pricing.discountPax} / ${type}`}</span>
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
