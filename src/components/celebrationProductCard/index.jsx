// src/components/celebrationProductCard/index.jsx
import React, { useState } from "react";
import { toINR } from "../../utils/util";
import "./styles.scss";

/**
 * Props (backwards-compatible):
 * - product
 * - selected
 * - productAdded (fn)
 * - buttons = true
 * - displaySubOptions = "inline" | "modal"  (optional)
 * - hideView (optional) — if true will force hiding the View button
 */
const ProductCard = ({
  product,
  selected,
  productAdded,
  buttons = true,
  displaySubOptions = "inline",
  hideView = false,
}) => {
  const { title, price, image, subOptions } = product;
  const buttontext = selected ? "Remove" : "Add";

  // local sub-options state (only used when product has subOptions)
  const [showSubOptions, setShowSubOptions] = useState(false);
  const [pendingSubId, setPendingSubId] = useState(subOptions && subOptions.length ? subOptions[0].id : null);

  // when user clicks the Add/Remove button on the card
  const handleAddClick = (e) => {
    // if already selected -> just call productAdded to remove (preserve existing behavior)
    if (selected) {
      productAdded(product);
      return;
    }

    // if product defines subOptions -> open sub-options UI instead of calling productAdded directly
    if (subOptions && subOptions.length > 0) {
      setPendingSubId(subOptions[0].id || null);
      setShowSubOptions(true);
      return;
    }

    // no subOptions -> call productAdded directly
    productAdded(product);
  };

  const handleCancel = () => {
    setShowSubOptions(false);
    setPendingSubId(subOptions && subOptions.length ? subOptions[0].id : null);
  };

  const handleConfirm = () => {
    if (!subOptions || subOptions.length === 0) {
      setShowSubOptions(false);
      return;
    }
    const chosen = subOptions.find((s) => s.id === pendingSubId) || subOptions[0];
    const productWithSub = { ...product, selectedSubOption: chosen };
    // call productAdded with product that includes the chosen sub-option
    productAdded(productWithSub);
    setShowSubOptions(false);
  };

  const renderSubOptionsInline = () => {
    if (!showSubOptions) return null;
    return (
      <div className="sub-options-panel" role="dialog" aria-modal="true">
        <div className="sub-panel-header">
          <strong>Choose {title} style</strong>
          <button className="sub-cancel" onClick={handleCancel} aria-label="Cancel">
            ✕
          </button>
        </div>

        <div className="sub-options-list">
          {subOptions.map((so) => (
            <label key={so.id} className="sub-option">
              <input
                type="radio"
                name={`subopt-${title}`}
                checked={pendingSubId === so.id}
                onChange={() => setPendingSubId(so.id)}
              />
              <div className="sub-meta">
                <div className="sub-label">{so.label}</div>
                {so.extra !== undefined && so.extra > 0 && <div className="sub-extra">+ ₹{so.extra}</div>}
              </div>
            </label>
          ))}
        </div>

        <div className="sub-panel-actions">
          <button type="button" className="btn btn-outline" onClick={handleCancel}>
            Cancel
          </button>
          <button type="button" className="btn btn-primary" onClick={handleConfirm}>
            Add & Continue
          </button>
        </div>
      </div>
    );
  };

  const renderSubOptionsModal = () => {
    if (!showSubOptions) return null;
    // simple modal overlay (keeps markup controlled by classes in styles.scss)
    return (
      <div className="sub-options-modal-backdrop" onClick={handleCancel}>
        <div className="sub-options-panel modal" role="dialog" aria-modal="true" onClick={(e) => e.stopPropagation()}>
          <div className="sub-panel-header">
            <strong>Choose {title} style</strong>
            <button className="sub-cancel" onClick={handleCancel} aria-label="Cancel">
              ✕
            </button>
          </div>

          <div className="sub-options-list">
            {subOptions.map((so) => (
              <label key={so.id} className="sub-option">
                <input
                  type="radio"
                  name={`subopt-${title}`}
                  checked={pendingSubId === so.id}
                  onChange={() => setPendingSubId(so.id)}
                />
                <div className="sub-meta">
                  <div className="sub-label">{so.label}</div>
                  {so.extra !== undefined && so.extra > 0 && <div className="sub-extra">+ ₹{so.extra}</div>}
                </div>
              </label>
            ))}
          </div>

          <div className="sub-panel-actions">
            <button type="button" className="btn btn-outline" onClick={handleCancel}>
              Cancel
            </button>
            <button type="button" className="btn btn-primary" onClick={handleConfirm}>
              Add & Continue
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <>
      <div className={selected ? "product-card product-card-active" : "product-card"}>
        <div className="image-container">
          <img src={image} alt={title} className="product-image" />
        </div>
        <section>
          <h4 className="product-title">{title}</h4>
          {price && (
            <div className="product-prices">
              <span className="original-price">{toINR(price.max)}</span>
              <span className="discounted-price">{toINR(price.min)}</span>
            </div>
          )}
        </section>

        {price && buttons && (
          <div className="button-section">
            {/* Hide the View button when product has subOptions (or hideView prop is true) */}
            {/* {!hideView && !(subOptions && subOptions.length > 0) && (
              <button className="add-to-cart view-btn" onClick={() => {}}>
                View
              </button>
            )} */}

            <button className="add-to-cart" onClick={handleAddClick}>
              {buttontext}
            </button>
          </div>
        )}
      </div>

      {/* render inline or modal sub-options based on displaySubOptions prop */}
      {displaySubOptions === "inline" && renderSubOptionsInline()}
      {displaySubOptions === "modal" && renderSubOptionsModal()}
    </>
  );
};

export default ProductCard;
