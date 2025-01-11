import React from "react";
import { toINR } from "../../utils/util";
import "./styles.scss";

const ProductCardMini = ({ product }) => {
    const { title, price, image } = product;
    return (
        <div className="product-card product-card-mini">
            <div className="image-container">
                <img
                    src={image}
                    alt={title}
                    className="product-image"
                />
            </div>
            <section className="product-card-details-section" >
                <h4 className="product-title">{title}</h4>
                {price && <div className="product-prices">
                    <span className="original-price">{toINR(price.max)}</span>
                    <span className="discounted-price">{toINR(price.min)}</span>
                </div>}
            </section>
        </div>
    );
};

export default ProductCardMini;
