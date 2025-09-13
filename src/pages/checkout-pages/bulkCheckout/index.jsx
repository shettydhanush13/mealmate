import React, { useCallback, useState, useEffect, useMemo } from "react";
import { useLocation } from "react-router-dom";
import { calculateProductPrice, toINR } from "../../../utils/util";
import DateTimePicker from "../../../components/datePicker";
import Wrapper from "../../../components/wrapper";
import ContactUs from "../../../components/contactUs";
import Textarea from "../../../components/textArea";
import Pricing from "../../../components/pricing";
import Checkbox from "@mui/material/Checkbox";
import CelebrationItemsList from "../../../components/celebrationItemsList";
import "./styles.scss";

/**
 * BulkCheckout
 * - Expects location.state to contain:
 *    { totalPrice: number, selectedItems: { Items: [...] }, guests?: number }
 *
 * Behavior:
 * - Reads celebration services from localStorage key "celebration-services" (same as previous)
 * - Calculates food discount (5% rounded up) and merges with service pricing (from calculateProductPrice)
 * - Exposes formatted pricing (strings via toINR) for the Pricing component while keeping numeric totals in productPricing
 */

const BulkCheckout = () => {
  const location = useLocation();
  // safe defaults if state unset
  const {
    totalPrice: totalPriceFromState = 0,
    selectedItems: selectedItemsFromState = { Items: [] },
    guests: guestsFromState = null,
  } = location.state || {};

  const selectedItemsCategory = Object.keys(selectedItemsFromState || {});

  // celebration service products (saved earlier from celebrations flow)
  const [celebrationProducts, setCelebrationProducts] = useState(null);

  // numeric product pricing returned by calculateProductPrice (numbers)
  const [productPricing, setProductPricing] = useState({
    total: 0,
    discount: 0,
    finalPrice: 0,
  });

  // formatted pricing object (strings) that the Pricing component expects
  const [pricing, setPricing] = useState({
    pricepax: toINR(0),
    totalFoodPrice: toINR(totalPriceFromState),
    serviceCharge: toINR(0),
    totalPrice: toINR(totalPriceFromState),
    discountPax: toINR(0),
    totalDiscount: toINR(0),
    finalPrice: toINR(totalPriceFromState),
  });

  // guests (read from route state if present, else null)
  const guests = useMemo(() => {
    if (guestsFromState === null || guestsFromState === undefined) return 0;
    return typeof guestsFromState === "number" ? guestsFromState : Number(guestsFromState);
  }, [guestsFromState]);

  // utility: menu section lines
  const getMenuSection = useCallback(() => {
    if (!selectedItemsFromState || !selectedItemsFromState.Items) return [];
    return selectedItemsFromState.Items.map((item) => `${item.name} : ${item.quantity}`);
  }, [selectedItemsFromState]);

  // food discount calculation (numeric)
  const getDiscountPrice = useCallback((price) => Math.ceil(Number(price || 0) * 0.05), []);

  // On mount: load celebration products from localStorage (same key you used earlier)
  useEffect(() => {
    try {
      const stored = localStorage.getItem("celebration-services");
      if (stored) {
        const parsed = JSON.parse(stored);
        setCelebrationProducts(parsed);
      }
    } catch (err) {
      // don't block UI if localStorage failed
      // eslint-disable-next-line no-console
      console.warn("Could not read celebration-services from localStorage:", err);
    }
    window.scrollTo(0, 0);
  }, []);

  // Recalculate productPricing and overall pricing whenever celebrationProducts or totalPrice changes
  useEffect(() => {
    const foodTotalNumeric = Number(totalPriceFromState || 0);
    const foodDiscountNumeric = getDiscountPrice(foodTotalNumeric);

    // compute numeric product pricing (service totals)
    const computedProductPricing = celebrationProducts
      ? calculateProductPrice(celebrationProducts)
      : { total: 0, discount: 0, finalPrice: 0 };

    // Ensure numeric fields exist
    const numericServiceFinal = Number(computedProductPricing.finalPrice || 0);

    // final numeric total = (food total - food discount) + service final
    const finalNumeric = Math.max(0, foodTotalNumeric - foodDiscountNumeric) + numericServiceFinal;

    // Build display (formatted) pricing object (strings)
    const displayPricing = {
      pricepax: toINR(0),
      totalFoodPrice: toINR(foodTotalNumeric),
      serviceCharge: toINR(0),
      totalPrice: toINR(foodTotalNumeric),
      discountPax: toINR(foodDiscountNumeric),
      totalDiscount: toINR(foodDiscountNumeric),
      finalPrice: toINR(finalNumeric),
    };

    setProductPricing({
      total: Number(computedProductPricing.total || 0),
      discount: Number(computedProductPricing.discount || 0),
      finalPrice: Number(computedProductPricing.finalPrice || 0),
    });

    setPricing(displayPricing);
  }, [celebrationProducts, totalPriceFromState, getDiscountPrice]);

  // Order data that ContactUs will receive; update when pricing / guests / menu changes
  const [orderData, setOrderData] = useState(() => ({
    people: guests || 0,
    price: pricing,
    special_request: "",
    menu_sections: getMenuSection(),
    date: new Date().toLocaleString(undefined, { timeZone: "Asia/Kolkata" }),
  }));

  useEffect(() => {
    setOrderData((prev) => ({
      ...prev,
      people: guests || 0,
      price: pricing,
      menu_sections: getMenuSection(),
    }));
  }, [guests, pricing, getMenuSection]);

  // handlers
  const onDateChange = useCallback((date) => {
    if (!date || typeof date.toLocaleString !== "function") return;
    setOrderData((prev) => ({
      ...prev,
      date: date.toLocaleString(undefined, { timeZone: "Asia/Kolkata" }),
    }));
  }, []);

  const onContentChange = useCallback((content) => {
    setOrderData((prev) => ({
      ...prev,
      special_request: content,
    }));
  }, []);

  // local UI toggle for service
  const [isService, setIsService] = useState(false);

  return (
    <Wrapper headertext="Confirm your order" footer={false}>
      <div className="checkoutPage mealBoxCheckoutPage">
        <section className="menuSection">
          <div className="menuItemsSection">
            {selectedItemsCategory.map((category) =>
              (selectedItemsFromState[category] && selectedItemsFromState[category].length) ? (
                <div key={category}>
                  <p>{category}</p>
                  <ul>
                    {selectedItemsFromState[category].map((item) => (
                      <li key={item.id || `${item.name}-${item.quantity}`}>
                        <span>
                          {item.name}
                          {item.desc && (
                            <span className="menuPricing">&nbsp;&nbsp;({item.desc})</span>
                          )}
                          <span className="quantityInfo">&nbsp;&nbsp;x {item.quantity}</span>
                        </span>
                        <span className="menuPricing">{toINR(item.price)}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null
            )}
            {celebrationProducts && <CelebrationItemsList products={celebrationProducts} />}
          </div>
        </section>

        <section className="pricePaxSection isServiceSection">
          <p className="key">Need staff for service?</p>
          <Checkbox checked={isService} onChange={() => setIsService((prev) => !prev)} />
        </section>

        {isService && (
          <section className="pricePaxSection isServiceSection">
            <span className="key">
              Our executive will discuss further about our service plans
            </span>
          </section>
        )}

        <Pricing
          isService={isService}
          type="bulk"
          productPricing={productPricing}
          pricing={pricing}
          guests={guests || 0}
        />

        <section className="menuSection">
          <Textarea onChange={(e) => onContentChange(e.target.value)} />
        </section>

        <div className="contactSection">
          <p>Add Your Details</p>
          <DateTimePicker onDateChange={onDateChange} />
          <ContactUs orderData={orderData} />
        </div>
      </div>
    </Wrapper>
  );
};

export default BulkCheckout;
