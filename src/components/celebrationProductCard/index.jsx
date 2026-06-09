// src/components/ProductCard/index.jsx
import React, { useState, useEffect, useCallback } from "react";
import { toINR } from "../../utils/util";
import PDPModal from "../pdpModal";
import "./styles.scss";

/**
 * Props:
 * - product
 * - selected
 * - productAdded (fn)
 * - buttons = true
 * - displaySubOptions = "inline" | "modal"
 * - hideView (optional)
 */
const ProductCard = ({
  product,
  selected,
  productAdded,
  buttons = true,
  displaySubOptions = "inline",
}) => {
  const { title, image, subOptions } = product;

  // local sub-options state
  const [showSubOptions, setShowSubOptions] = useState(false);

  // PDP state
  const [pdpOpen, setPdpOpen] = useState(false);
  const [pdpItem, setPdpItem] = useState(null);
  const [pdpImgIndex, setPdpImgIndex] = useState(0);

  // preview carousel state (legacy, not used for PDP)
  const [carouselModalOpen, setCarouselModalOpen] = useState(false);
  const [carouselModalImgs, setCarouselModalImgs] = useState([]);
  const [carouselModalIndex, setCarouselModalIndex] = useState(0);
  const [carouselModalTitle, setCarouselModalTitle] = useState("");

  const getImagesForOption = useCallback(
    (so) => {
      if (!so && !image) return [];
      if (Array.isArray(so?.imgs) && so.imgs.length) return so.imgs;
      if (Array.isArray(so?.img) && so.img.length) return so.img;
      if (Array.isArray(so?.images) && so.images.length) return so.images;
      if (typeof so?.image === "string" && so.image) return [so.image];
      if (image) return [image];
      return [];
    },
    [image]
  );

  // ========= PDP handlers ==========
  const openPdpFor = useCallback((so) => {
    setPdpItem(so);
    setPdpImgIndex(0);
    setPdpOpen(true);
  }, []);

  const closePdp = useCallback(() => {
    setPdpOpen(false);
    setPdpItem(null);
    setPdpImgIndex(0);
  }, []);

  const prevPdpImg = useCallback(() => {
    if (!pdpItem) return;
    const imgs = getImagesForOption(pdpItem);
    if (!imgs.length) return;
    setPdpImgIndex((i) => (i - 1 + imgs.length) % imgs.length);
  }, [pdpItem, getImagesForOption]);

  const nextPdpImg = useCallback(() => {
    if (!pdpItem) return;
    const imgs = getImagesForOption(pdpItem);
    if (!imgs.length) return;
    setPdpImgIndex((i) => (i + 1) % imgs.length);
  }, [pdpItem, getImagesForOption]);

  const handleAddFromPdp = useCallback(() => {
    if (!pdpItem) return;
    const productWithSub = { ...product, selectedSubOption: pdpItem };
    productAdded(productWithSub);
    closePdp();
    setShowSubOptions(false);
  }, [pdpItem, product, productAdded, closePdp]);

  // legacy small carousel handlers (kept for completeness)
  const closeCarouselModal = useCallback(() => {
    setCarouselModalOpen(false);
    setCarouselModalImgs([]);
    setCarouselModalIndex(0);
    setCarouselModalTitle("");
  }, []);

  const prevCarousel = useCallback(() => {
    if (!carouselModalImgs.length) return;
    setCarouselModalIndex((i) => (i - 1 + carouselModalImgs.length) % carouselModalImgs.length);
  }, [carouselModalImgs.length]);

  const nextCarousel = useCallback(() => {
    if (!carouselModalImgs.length) return;
    setCarouselModalIndex((i) => (i + 1) % carouselModalImgs.length);
  }, [carouselModalImgs.length]);

  // keyboard handling (PDP + carousel)
  useEffect(() => {
    const onKey = (e) => {
      if (pdpOpen) {
        if (e.key === "Escape") closePdp();
        else if (e.key === "ArrowLeft") prevPdpImg();
        else if (e.key === "ArrowRight") nextPdpImg();
      } else if (carouselModalOpen) {
        if (e.key === "Escape") closeCarouselModal();
        else if (e.key === "ArrowLeft") prevCarousel();
        else if (e.key === "ArrowRight") nextCarousel();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [
    pdpOpen,
    carouselModalOpen,
    closePdp,
    prevPdpImg,
    nextPdpImg,
    closeCarouselModal,
    prevCarousel,
    nextCarousel,
  ]);

  // Add button on card
  const handleAddClick = useCallback(() => {
    // If already selected, treat as toggle/remove
    if (selected) {
      productAdded(product);
      return;
    }

    // NEW: If product has exactly one sub-option, open PDP directly for that sub-option
    if (Array.isArray(subOptions) && subOptions.length === 1) {
      openPdpFor(subOptions[0]);
      return;
    }

    // Otherwise if multiple sub-options show selection UI (modal)
    if (subOptions && subOptions.length > 0) {
      setShowSubOptions(true);
      return;
    }

    // No sub-options -> add directly
    productAdded(product);
  }, [selected, product, productAdded, subOptions, openPdpFor]);

  const handleCancel = useCallback(() => {
    setShowSubOptions(false);
  }, []);

  // render sub-option tile (card) — 2 per row
  const renderSubOptionItem = useCallback(
    (so) => {
      const imgs = getImagesForOption(so);
      const firstImg = imgs.length ? imgs[0] : "";
      const priceVal = so.price ?? 0;

      return (
        <div
          key={so.id}
          className="sub-option-card"
          role="button"
          tabIndex={0}
          onClick={() => openPdpFor(so)}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              openPdpFor(so);
            }
          }}
          aria-label={`Open details for ${so.typeLabel}`}
        >
          <div className="sub-option-card-image">
            {firstImg ? (
              <img
                src={firstImg}
                alt=""
                loading="lazy"
                className="sub-option-card-img"
              />
            ) : (
              <div className="sub-option-image sub-option-image--placeholder" />
            )}
          </div>
          <div className="sub-option-card-body">
            <div className="sub-option-card-title">{so.title}</div>
            {priceVal ? <div className="sub-option-card-price">{toINR(priceVal, 0)}</div> : null}
          </div>
        </div>
      );
    },
    [getImagesForOption, openPdpFor]
  );

  const renderSubOptionsModal = () => {
    if (!showSubOptions) return null;
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
            {(subOptions || []).map((so) => renderSubOptionItem(so))}
          </div>
        </div>
      </div>
    );
  };

  const normalizePrice = (product) => {
    if (product.price && typeof product.price === "object" && ("min" in product.price || "max" in product.price)) {
      // Already in min/max format
      return product.price;
    }

    let minPrice = product.price;

    // If subOptions exist, find the cheapest one
    if (Array.isArray(product.subOptions) && product.subOptions.length > 0) {
      const subOptionPrices = product.subOptions.map((so) => so.price || 0).filter(Boolean);
      if (subOptionPrices.length > 0) {
        minPrice = Math.min(...subOptionPrices);
      }
    }

    return {
      min: minPrice,
      max: Math.round((minPrice || 0) * 1.05), // add 5% buffer
    };
  };

  return (
    <>
      <div className={selected ? "product-card product-card-active" : "product-card"}>
        <div className="product-card__media">
          <img src={image} alt="" className="product-card__img" loading="lazy" />
          <span className="product-card__price">
            From {toINR(product.baseFee || normalizePrice(product).min, 0)}
          </span>
        </div>

        <div className="product-card__body">
          <h4 className="product-card__title">{title}</h4>

          {buttons && (
            <button
              className="product-card__add"
              onClick={handleAddClick}
              aria-pressed={selected}
            >
              {selected ? (
                "Remove"
              ) : (
                <>
                  <span className="product-card__add-plus" aria-hidden="true">+</span> Add
                </>
              )}
            </button>
          )}
        </div>
      </div>

      {displaySubOptions === "modal" && renderSubOptionsModal()}

      {/* PDP modal component */}
      <PDPModal
        isOpen={pdpOpen}
        item={pdpItem}
        initialIndex={pdpImgIndex}
        getImages={getImagesForOption}
        onClose={closePdp}
        onPrev={prevPdpImg}
        onNext={nextPdpImg}
        onAdd={handleAddFromPdp}
      />

      {/* Legacy carousel (optional) */}
      {carouselModalOpen && carouselModalImgs.length > 0 && (
        <div className="sub-options-modal-backdrop" onClick={closeCarouselModal}>
          <div className="image-preview-modal" onClick={(e) => e.stopPropagation()}>
            <div className="sub-panel-header">
              <strong>{carouselModalTitle}</strong>
              <button className="sub-cancel" onClick={closeCarouselModal}>
                ✕
              </button>
            </div>

            <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <button
                  className="carousel-prev"
                  onClick={(e) => {
                    e.stopPropagation();
                    prevCarousel();
                  }}
                >
                  ‹
                </button>
                <img src={carouselModalImgs[carouselModalIndex]} alt="" className="image-preview-img" />
                <button
                  className="carousel-next"
                  onClick={(e) => {
                    e.stopPropagation();
                    nextCarousel();
                  }}
                >
                  ›
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ProductCard;
