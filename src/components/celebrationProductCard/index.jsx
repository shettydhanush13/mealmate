import React from "react";
import { toINR } from "../../helper";
import "./styles.scss";

const ProductCard = ({ product, selected, productAdded, buttons = true }) => {
    const { title, price, image } = product;
    const buttontext = selected ? 'Remove' : 'Add';
    return (
        <div className={selected ? "product-card product-card-active" : "product-card"}>
            <div className="image-container">
                <img
                    src={image}
                    alt={title}
                    className="product-image"
                />
            </div>
            <h4 className="product-title">{title}</h4>
            {price && <div className="product-prices">
                <span className="original-price">{toINR(price.min)}</span>
                <span className="discounted-price">{toINR(price.max)}</span>
            </div>}
            {price && buttons && <div className="button-section">
                {/* <button className="add-to-cart">View</button> */}
                <button className="add-to-cart" onClick={productAdded}>{buttontext}</button>
            </div>}
        </div>
    );
};

export default ProductCard;
