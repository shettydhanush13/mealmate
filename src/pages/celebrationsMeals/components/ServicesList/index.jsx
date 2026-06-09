// src/pages/celebrationsMeals/components/ServicesList/index.jsx
import React from "react";
import ProductCardMini from "../../../../components/celebrationProductCard/mini";
import StateMessage from "../../../../components/stateMessage";
import { isLiveCounter } from "../../../../data/services/celebrationsData";
import "./styles.scss";

const ServicesList = ({ products = [], onRemove, onEdit }) => {
  if (!Array.isArray(products) || products.length === 0) {
    return (
      <StateMessage
        emoji="🎈"
        title="No services selected yet."
        description="Pick a few services to get started 🎉"
      />
    );
  }

  return (
    <div className="servicesList" role="list">
      {products.map((product, idx) => {
        const editable = isLiveCounter(product);
        return (
          <div
            role="listitem"
            key={`${product.title ?? "prod"}-${idx}`}
            className="servicesList__itemWrap"
          >
            {editable && onEdit && (
              <button
                type="button"
                className="serviceEdit"
                onClick={() => onEdit(idx)}
                aria-label={`Edit ${product.title || "service"}`}
              >
                Edit
              </button>
            )}

            {onRemove && (
              <button
                type="button"
                className="serviceRemove"
                onClick={() => onRemove(idx)}
                aria-label={`Remove ${product.title || "service"}`}
              >
                ✕
              </button>
            )}

            <ProductCardMini product={product} />
          </div>
        );
      })}
    </div>
  );
};

export default ServicesList;
