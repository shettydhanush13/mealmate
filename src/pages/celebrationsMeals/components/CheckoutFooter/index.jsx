// src/pages/celebration-pages/celebrations/components/CheckoutFooter.jsx
import React from "react";
import logowhite from "../../../../assets/logowhite.png";
import './styles.scss';

const CheckoutFooter = ({ onCheckout, disabled = false }) => {
  return (
    <footer
      className={`checkoutFooter ${disabled ? "disabled" : ""}`}
      onClick={() => !disabled && onCheckout()}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (!disabled && (e.key === "Enter" || e.key === " ")) {
          e.preventDefault();
          onCheckout();
        }
      }}
      aria-label="Checkout"
      aria-disabled={disabled}
    >
      <img src={logowhite} alt="CaterKart" />
      <span>Checkout</span>
    </footer>
  );
};

export default CheckoutFooter;
