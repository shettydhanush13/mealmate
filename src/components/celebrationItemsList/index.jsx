import React from "react";
import { toINR } from "../../utils/util";
import "./styles.scss";

const CelebrationItemsList = ({ products }) => {
    return (
        <div className="celebrationsItemWrapper">
            {['Selected services'].map((title) => <>
                <p>{title}</p>
                <ul>{products.map((item) => 
                    <li className="celebrationsItem" key={item.title}>
                        <span>{item.title}</span>
                        <div className="menuPricing">
                            <span className="priceMax">{toINR(item.price.max)}</span>
                            &nbsp;&nbsp;<span className="priceMin">{toINR(item.price.min)}</span>
                        </div>
                    </li>)}
                </ul>
            </>)}
        </div>
    );
};

export default CelebrationItemsList;
