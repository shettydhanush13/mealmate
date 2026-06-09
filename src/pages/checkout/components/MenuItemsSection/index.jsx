// src/pages/checkout/components/MenuItemsSection/index.jsx
import React from "react";
import veg_icon from "../../../../assets/veg_icon.webp";
import nonveg_icon from "../../../../assets/nonveg_icon.webp";
import "./styles.scss";

const MenuItemsSection = ({
  selectedItemsCategory = [],
  selectedItemsFromState = {},
  toINR,
  discountRate = 0.05, // 5% discount
}) => {
  // Flatten all selected items across categories into one list.
  const items = selectedItemsCategory.flatMap((cat) =>
    Array.isArray(selectedItemsFromState[cat]) ? selectedItemsFromState[cat] : []
  );

  if (!items.length) return null;

  return (
    <section className="ckMenu">
      <header className="ckMenu__head">
        <span className="ckMenu__icon" aria-hidden="true">🍽️</span>
        <h3 className="ckMenu__title">Food Menu</h3>
        <span className="ckMenu__count">{items.length} {items.length === 1 ? "item" : "items"}</span>
      </header>

      <div className="ckMenu__list">
        {items.map((item, idx) => {
          const qty = Number(item.quantity ?? 0);
          const unitPrice = Number(item.pricePerItem ?? 0);
          // pricePerItem is the unit price; item.price is already a line total — use whichever is valid.
          const itemTotal = unitPrice > 0 ? unitPrice * qty : Number(item.price ?? 0);
          const discount = Math.round(itemTotal * discountRate);
          const discountedTotal = Math.max(0, itemTotal - discount);
          const isVeg = item.veg !== false;

          return (
            <div className="ckMenuRow" key={item.id || `${item.name}-${idx}`}>
              <div className="ckMenuRow__info">
                <img
                  className="ckMenuRow__type"
                  src={isVeg ? veg_icon : nonveg_icon}
                  alt={isVeg ? "veg" : "non-veg"}
                />
                <span className="ckMenuRow__name">{item.name}</span>
                <span className="ckMenuRow__qty">× {qty}</span>
              </div>

              <div className="ckMenuRow__price">
                {discount > 0 && (
                  <span className="ckMenuRow__orig">{toINR(itemTotal, 0)}</span>
                )}
                <span className="ckMenuRow__final">{toINR(discountedTotal, 0)}</span>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};

export default MenuItemsSection;
