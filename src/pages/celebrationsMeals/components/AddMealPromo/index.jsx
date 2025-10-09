// src/pages/celebration-pages/celebrations/components/AddMealPromo.jsx
import React, { useState, useEffect, useRef } from "react";
import "./styles.scss";

const AddMealPromo = ({
  needMeal,
  onToggleNeedMeal,
  onSelectMealType, // function(mealType: 'buffet'|'caterbox') => navigate or next-step
  buffetIconSrc, // optional: small image src for buffet option
  caterboxIconSrc, // optional: small image src for caterbox option
  children,
}) => {
  const [selected, setSelected] = useState(null);
  const buffetRef = useRef(null);
  const caterRef = useRef(null);

  useEffect(() => {
    if (!needMeal) setSelected(null);
  }, [needMeal]);

  // central selection handler — will call both callbacks:
  // - onToggleNeedMeal(true) to keep older flows compatible
  // - onSelectMealType(mealType) to navigate / go to next page
  const handleSelect = (mealType) => {
    setSelected(mealType);

    if (typeof onToggleNeedMeal === "function") {
      try {
        onToggleNeedMeal(true);
      } catch (err) {
        // swallow to avoid breaking UI
      }
    }

    // Immediately trigger navigation/next-step as requested.
    if (typeof onSelectMealType === "function") {
      try {
        onSelectMealType(mealType);
      } catch (err) {
        // swallow
      }
    }
  };

  // keyboard handling for radio semantics + arrow navigation
  const onOptionKeyDown = (e, mealType) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      handleSelect(mealType);
      return;
    }
    if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
      e.preventDefault();
      if (mealType === "caterbox") buffetRef.current && buffetRef.current.focus();
    }
    if (e.key === "ArrowRight" || e.key === "ArrowDown") {
      e.preventDefault();
      if (mealType === "buffet") caterRef.current && caterRef.current.focus();
    }
  };

  return (
    <div className="addMealSection" role="region" aria-label="Add meal promotion">
      <p className="addMealSection__promoText">{children}</p>

      <div
        className="addMealSection__mealOptions"
        role="radiogroup"
        aria-label="Select meal service type"
      >
        <div
          ref={buffetRef}
          role="radio"
          tabIndex={0}
          aria-checked={selected === "buffet"}
          className={`mealOption ${selected === "buffet" ? "mealOption--selected" : ""}`}
          onClick={() => handleSelect("buffet")}
          onKeyDown={(e) => onOptionKeyDown(e, "buffet")}
        >
          {buffetIconSrc && (
            <div className="mealOption__iconWrap" aria-hidden="true">
              <img src={buffetIconSrc} alt="" className="mealOption__icon" />
            </div>
          )}
          <div className="mealOption__content">
            <div className="mealOption__title">Buffet (with service staff)</div>
            <div className="mealOption__desc">
              Full-service buffet, serving staff included.
            </div>
          </div>
        </div>

        <div
          ref={caterRef}
          role="radio"
          tabIndex={0}
          aria-checked={selected === "caterbox"}
          className={`mealOption ${selected === "caterbox" ? "mealOption--selected" : ""}`}
          onClick={() => handleSelect("caterbox")}
          onKeyDown={(e) => onOptionKeyDown(e, "caterbox")}
        >
          {caterboxIconSrc && (
            <div className="mealOption__iconWrap" aria-hidden="true">
              <img src={caterboxIconSrc} alt="" className="mealOption__icon" />
            </div>
          )}
          <div className="mealOption__content">
            <div className="mealOption__title">CaterBox (boxed catering)</div>
            <div className="mealOption__desc">
            Specially Designed Food Packaging for Bulk Delivery / Gatherings with customized heat insulation safe guards.
            </div>
          </div>
        </div>
      </div>

      <div className="addMealSection__assistive" aria-hidden={false}>
        <span className="sr-only">
          {selected ? `Selected: ${selected}` : needMeal ? "Meal selected" : "No meal selected"}
        </span>
      </div>
    </div>
  );
};

export default AddMealPromo;
