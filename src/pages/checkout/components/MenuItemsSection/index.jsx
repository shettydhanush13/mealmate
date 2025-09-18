// src/pages/celebration-pages/bulk-checkout/components/MenuItemsSection.jsx
import React from "react";
import "../../styles.scss"; // keep global styles if needed

const MenuItemsSection = ({
  selectedItemsCategory = [],
  selectedItemsFromState = {},
  toINR,
  discountRate = 0.05, // default 5% discount
}) => {
  return (
    <>
      {selectedItemsCategory.map((category) =>
        (selectedItemsFromState[category] &&
          selectedItemsFromState[category].length) ? (
          <div key={category}>
            <p>{category}</p>
            <ul>
              {selectedItemsFromState[category].map((item) => {
                const unitPrice = Number(item.pricePerItem ?? item.price ?? 0);
                const qty = Number(item.quantity ?? 0);

                const itemTotal = unitPrice * qty;
                const discount = Math.round(itemTotal * discountRate);
                const discountedTotal = itemTotal - discount;

                return (
                  <li key={item.id || `${item.name}-${qty}`}>
                    <span>
                      {item.name}
                      {/* {item.desc && (
                        <span className="menuPricing">
                          &nbsp;&nbsp;({item.desc})
                        </span>
                      )} */}
                      <span className="quantityInfo">&nbsp;&nbsp;x {qty}</span>
                    </span>

                    <span className="menuPricing">
                      <span className="originalPrice">{toINR(itemTotal)}</span>
                      &nbsp;&nbsp;
                      <span className="discountedPrice">{toINR(discountedTotal)}</span>
                    </span>
                  </li>
                );
              })}
            </ul>
          </div>
        ) : null
      )}
    </>
  );
};

export default MenuItemsSection;
