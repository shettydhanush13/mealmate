// src/pages/celebration-pages/celebrations/components/AddMealPromo.jsx
import React from "react";
import Checkbox from "@mui/material/Checkbox";
import "./styles.scss";

const AddMealPromo = ({ productsCount, needMeal, onToggleNeedMeal, imageSrc, children }) => {
  return (
    <div className="addMealSection" role="region" aria-label="Add meal promotion">
      {productsCount < 4 && imageSrc && (
        <div className="addMealSection__imageWrap" aria-hidden="true">
          <img src={imageSrc} alt="" />
        </div>
      )}

      <p className="addMealSection__promoText">{children}</p>

      <div
        className="addMealSection__needMealSection"
        role="button"
        tabIndex={0}
        onClick={() => onToggleNeedMeal(!needMeal)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            onToggleNeedMeal(!needMeal);
          }
        }}
        aria-pressed={needMeal}
      >
        <Checkbox
          checked={Boolean(needMeal)}
          onChange={(e) => onToggleNeedMeal(Boolean(e.target.checked))}
          inputProps={{ "aria-label": "Add Meal to My Celebration" }}
          className="addMealSection__checkboxOverride"
        />
        <p className="addMealSection__key">Add Meal to My Celebration</p>
      </div>
    </div>
  );
};

export default AddMealPromo;
