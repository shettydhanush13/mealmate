import React, { useState, useEffect } from "react";
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

  // image preview state (for clicking an option image to see larger)
  const [showImagePreview, setShowImagePreview] = useState(false);
  const [imagePreviewSrc, setImagePreviewSrc] = useState("");

  // when user clicks the Add/Remove button on the card
  const handleAddClick = () => {
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

  // open preview modal for imageSrc
  const openImagePreview = (src) => {
    if (!src) return;
    setImagePreviewSrc(src);
    setShowImagePreview(true);
  };

  const closeImagePreview = () => {
    setShowImagePreview(false);
    setImagePreviewSrc("");
  };

  // close preview on ESC
  useEffect(() => {
    if (!showImagePreview) return undefined;
    const onKey = (e) => {
      if (e.key === "Escape") closeImagePreview();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [showImagePreview]);

  // render a single sub-option item (radio left, text next, image right)
  const renderSubOptionItem = (so) => {
    const imgSrc = so.image || image || "";
    return (
      <label key={so.id} className="sub-option" tabIndex={0}>
        <div className="sub-left">
          <input
            type="radio"
            className="sub-radio"
            name={`subopt-${title}`}
            checked={pendingSubId === so.id}
            onChange={() => setPendingSubId(so.id)}
            aria-label={so.label}
          />
          <div className="sub-text">
            <div className="sub-label">{so.label}</div>
            {so.extra !== undefined && so.extra > 0 && <div className="sub-extra">₹{so.extra}</div>}
          </div>
        </div>

        <div
          className="sub-right"
          onClick={(e) => {
            e.stopPropagation();
            if (imgSrc) openImagePreview(imgSrc);
          }}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              if (imgSrc) openImagePreview(imgSrc);
            }
          }}
          aria-label={`Preview image for ${so.label}`}
        >
          {imgSrc ? (
            <img src={imgSrc} alt={so.label} className="sub-option-image" />
          ) : (
            <div className="sub-option-image sub-option-image--placeholder" aria-hidden="true" />
          )}
        </div>
      </label>
    );
  };

  const renderSubOptionsModal = () => {
    if (!showSubOptions) return null;
    // modal overlay
    return (
      <div className="sub-options-modal-backdrop" onClick={handleCancel}>
        <div
          className="sub-options-panel modal"
          role="dialog"
          aria-modal="true"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="sub-panel-header">
            <strong>Choose {title} style</strong>
            <button className="sub-cancel" onClick={handleCancel} aria-label="Cancel">
              ✕
            </button>
          </div>

          <div className="sub-options-list">
            {subOptions.map((so) => renderSubOptionItem(so))}
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

  // image preview modal (opens when clicking sub-option image)
  const renderImagePreview = () => {
    if (!showImagePreview) return null;
    return (
      <div className="sub-options-modal-backdrop image-preview-backdrop" onClick={closeImagePreview}>
        <div className="image-preview-modal" role="dialog" aria-modal="true" onClick={(e) => e.stopPropagation()}>
          <div className="sub-panel-header">
            <strong></strong>
            <button className="sub-cancel" onClick={closeImagePreview} aria-label="Close preview">
              ✕
            </button>
          </div>

          <div className="image-preview-content">
            <img src={imagePreviewSrc} alt="Preview" className="image-preview-img" />
          </div>
        </div>
      </div>
    );
  };

  return (
    <>
      <div className={selected ? "product-card product-card-active" : "product-card"}>
        {/* Image on top */}
        <div className="image-container">
          <img src={image} alt={title} className="product-image" />
        </div>

        {/* Title area (flexible middle) */}
        <h4 className="product-title">{title}</h4>

        {/* Price (fixed above button) */}
        {price && (
          <div className="product-prices">
            <span className="original-price">{toINR(price.max)}</span>
            <span className="discounted-price">{toINR(price.min)}</span>
          </div>
        )}

        {/* Button anchored to bottom */}
        {price && buttons && (
          <div className="button-section">
            <button className="add-to-cart" onClick={handleAddClick}>
              {buttontext}
            </button>
          </div>
        )}
      </div>

      {/* render modal sub-options when requested */}
      {displaySubOptions === "modal" && renderSubOptionsModal()}

      {/* image preview modal (above everything when open) */}
      {renderImagePreview()}
    </>
  );
};

export default ProductCard;
