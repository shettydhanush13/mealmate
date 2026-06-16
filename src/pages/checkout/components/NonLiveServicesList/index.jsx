// src/pages/celebration-pages/bulk-checkout/components/NonLiveServicesList.jsx
import React from "react";
import CelebrationItemsList from "../celebrationItemsList";
import "./styles.scss";

const NonLiveServicesList = ({ products = [] }) => {
  if (!Array.isArray(products) || products.length === 0) return null;
  return (
    <div className="non-live-wrapper">
      <CelebrationItemsList products={products} />
    </div>
  );
};

export default NonLiveServicesList;
