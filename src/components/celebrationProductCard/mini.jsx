import React from "react";
import "./styles.scss";

const ProductCardMini = ({ product }) => {
    const { image, title, label, imgs } = product;

    const productImage = image ?? imgs[0];
    const productLabel = title ?? label;
    return (
        <div className="product-card product-card-mini">
            <div className="image-container">
                <img
                    src={productImage}
                    alt=""
                    loading="lazy"
                    className="product-image"
                />
            </div>
            <section className="product-card-details-section" >
                <h4 className="product-title">{productLabel}</h4>
            </section>
        </div>
    );
};

export default ProductCardMini;
