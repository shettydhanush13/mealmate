// src/pages/celebrationsMeals/components/CheckoutFooter/index.jsx
import React from "react";
import { FaArrowRight } from "react-icons/fa";
import logowhite from "../../../../assets/logowhite.png";
import "./styles.scss";

const CheckoutFooter = ({ onCheckout, disabled = false }) => {
  const trigger = () => {
    if (!disabled) onCheckout();
  };

  return (
    <footer
      className={`checkoutFooter ${disabled ? "disabled" : ""}`}
      onClick={trigger}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          trigger();
        }
      }}
      aria-label="Checkout"
      aria-disabled={disabled}
    >
      <img src={logowhite} alt="" />
      <span>Checkout Without Food</span>
      <FaArrowRight className="checkoutFooter__arrow" />
    </footer>
  );
};

export default React.memo(CheckoutFooter);
