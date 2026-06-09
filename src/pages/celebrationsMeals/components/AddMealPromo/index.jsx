// src/pages/celebrationsMeals/components/AddMealPromo/index.jsx
import React, { useEffect, useRef, useState, useMemo, useCallback } from "react";
import { FaArrowRight } from "react-icons/fa";
import "./styles.scss";

/**
 * AddMealPromo
 * An in-flow promo card offering two meal-service options (Buffet / CaterBox).
 * Selecting an option immediately advances the flow via onSelectMealType.
 */
const AddMealPromo = ({
  needMeal,
  onSelectMealType,
  buffetIconSrc,
  caterboxIconSrc,
  children,
}) => {
  const [selected, setSelected] = useState(null);
  const optionRefs = useRef([]);

  useEffect(() => {
    if (!needMeal) setSelected(null);
  }, [needMeal]);

  const options = useMemo(
    () => [
      {
        id: "buffet",
        title: "Buffet (with service staff)",
        desc: "Full-service buffet, serving staff included.",
        icon: buffetIconSrc,
      },
      {
        id: "caterbox",
        title: "CaterBox (boxed catering)",
        desc: "Specially Designed Food Packaging for Bulk Delivery / Gatherings with customized heat insulation safe guards.",
        icon: caterboxIconSrc,
      },
    ],
    [buffetIconSrc, caterboxIconSrc]
  );

  const handleSelect = useCallback(
    (mealType) => {
      setSelected(mealType);
      onSelectMealType?.(mealType);
    },
    [onSelectMealType]
  );

  const onKeyDown = useCallback(
    (e, index) => {
      const { key } = e;
      if (key === "Enter" || key === " ") {
        e.preventDefault();
        handleSelect(options[index].id);
      } else if (key === "ArrowLeft" || key === "ArrowUp") {
        e.preventDefault();
        optionRefs.current[index - 1]?.focus();
      } else if (key === "ArrowRight" || key === "ArrowDown") {
        e.preventDefault();
        optionRefs.current[index + 1]?.focus();
      }
    },
    [handleSelect, options]
  );

  return (
    <section className="addMeal" role="region" aria-label="Add a meal">
      <header className="addMeal__head">
        <span className="addMeal__eyebrow">Optional</span>
        <p className="addMeal__title">{children}</p>
      </header>

      <div className="addMeal__options" role="radiogroup" aria-label="Select meal service type">
        {options.map((opt, i) => {
          const isSelected = selected === opt.id;
          return (
            <div
              key={opt.id}
              ref={(el) => (optionRefs.current[i] = el)}
              role="radio"
              tabIndex={0}
              aria-checked={isSelected}
              className={`mealCard ${isSelected ? "mealCard--selected" : ""}`}
              onClick={() => handleSelect(opt.id)}
              onKeyDown={(e) => onKeyDown(e, i)}
            >
              <div className="mealCard__media">
                {opt.icon && <img src={opt.icon} alt="" loading="lazy" />}
                <span className="mealCard__check" aria-hidden="true">✓</span>
              </div>

              <div className="mealCard__body">
                <h4 className="mealCard__title">{opt.title}</h4>
                <p className="mealCard__desc">{opt.desc}</p>
                <span className="mealCard__cta">
                  Select <FaArrowRight />
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};

export default React.memo(AddMealPromo);
