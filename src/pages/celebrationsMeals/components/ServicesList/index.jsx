// src/pages/celebration-pages/celebrations/components/ServicesList.jsx
import React from "react";
import ProductCardMini from "../../../../components/celebrationProductCard/mini";
import "./styles.scss";

const ServicesList = ({ products = [] }) => {
  if (!Array.isArray(products) || products.length === 0) {
    return (
      <div className="services-emptyState">
        <svg
          className="services-emptyState__icon"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 64 64"
          aria-hidden="true"
        >
          <circle cx="32" cy="32" r="30" fill="#fef4f1" stroke="#ec430d" strokeWidth="2" />
          <path
            d="M20 24h24M20 34h24M20 44h16"
            stroke="#ec430d"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        <p>No services selected yet.</p>
        <span className="services-emptyState__hint">Pick a few services to get started 🎉</span>
      </div>
    );
  }

  return (
    <div className="servicesList" role="list">
      {products.map((product, idx) => (
        <div
          role="listitem"
          key={`${product.title ?? "prod"}-${idx}`}
          className="servicesList__itemWrap"
        >
          <ProductCardMini product={product} />
        </div>
      ))}
    </div>
  );
};

export default ServicesList;
