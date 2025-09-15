// src/pages/celebration-pages/bulk-checkout/Checkout.jsx
import React, { useCallback, useState, useEffect, useMemo } from "react";
import { useLocation } from "react-router-dom";
import { calculateProductPrice, toINR } from "../../utils/util";
import { calculateLiveCounterPrice } from "../../data/celebrationsData";
import DateTimePicker from "../../components/datePicker";
import Wrapper from "../../components/wrapper";
import ContactUs from "../../components/contactUs";
import Textarea from "../../components/textArea";
import Pricing from "../../components/pricing";
import Checkbox from "@mui/material/Checkbox";

import MenuItemsSection from "./components/MenuItemsSection";
import ServiceBreakdown from "./components/ServiceBreakdown";
import NonLiveServicesList from "./components/NonLiveServicesList";

import "./styles.scss";

/**
 * Checkout - orchestrates data, pricing and passes to small components
 */
const Checkout = () => {
  const location = useLocation();
  const {
    totalPrice: totalPriceFromState = 0,
    selectedItems: selectedItemsFromState = { Items: [] },
    guests: guestsFromState = null,
    services: servicesFromState = null,
    dietConfig: dietConfigFromState = null,
    eventType: eventTypeFromState = null,   // ✅ event type passed from Celebrations
    date: dateFromState = null,             // ✅ event date if passed
    vegCount: vegCountFromState = null,     // ✅ optional counts
    nonVegCount: nonVegCountFromState = null,
    kidsCount: kidsCountFromState = null,
  } = location.state || {};

  const selectedItemsCategory = Object.keys(selectedItemsFromState || {});

  // prefer services from route state; otherwise read from localStorage
  const [celebrationProducts, setCelebrationProducts] = useState(() => {
    if (Array.isArray(servicesFromState)) return servicesFromState;
    try {
      const stored = localStorage.getItem("celebration-services");
      if (stored) return JSON.parse(stored);
    } catch (err) { /* ignore */ }
    return null;
  });

  const [productPricing, setProductPricing] = useState({ total: 0, discount: 0, finalPrice: 0 });
  const [pricing, setPricing] = useState({
    pricepax: toINR(0),
    totalFoodPrice: toINR(totalPriceFromState),
    serviceCharge: toINR(0),
    totalPrice: toINR(totalPriceFromState),
    discountPax: toINR(0),
    totalDiscount: toINR(0),
    finalPrice: toINR(totalPriceFromState),
  });

  const guests = useMemo(() => {
    if (guestsFromState === null || guestsFromState === undefined) return 0;
    return typeof guestsFromState === "number" ? guestsFromState : Number(guestsFromState);
  }, [guestsFromState]);

  const getMenuSection = useCallback(() => {
    if (!selectedItemsFromState || !selectedItemsFromState.Items) return [];
    return selectedItemsFromState.Items.map((item) => `${item.name} : ${item.quantity}`);
  }, [selectedItemsFromState]);

  // 5% food discount, rounded (Math.round)
  const getDiscountPrice = useCallback((price) => Math.round(Number(price || 0) * 0.05), []);

  // persist services from route to localStorage if provided
  useEffect(() => {
    if (Array.isArray(servicesFromState)) {
      try {
        localStorage.setItem("celebration-services", JSON.stringify(servicesFromState));
      } catch (err) {
        console.warn("Could not persist celebration-services to localStorage:", err);
      }
      setCelebrationProducts(servicesFromState);
    }
  }, [servicesFromState]);

  useEffect(() => {
    if (celebrationProducts !== null) return;
    try {
      const stored = localStorage.getItem("celebration-services");
      if (stored) {
        const parsed = JSON.parse(stored);
        setCelebrationProducts(parsed);
      }
    } catch (err) {
      console.warn("Could not read celebration-services from localStorage:", err);
    }
    window.scrollTo(0, 0);
  }, [celebrationProducts]);

  const isLiveCounter = useCallback((product) => {
    if (!product) return false;
    if (product.isLiveCounter) return true;
    return typeof product.baseFee === "number";
  }, []);

  // compute service pricing (live + non-live). Same algorithm you used previously.
  const computeServicePricing = useCallback((products = []) => {
    if (!Array.isArray(products) || products.length === 0) {
      return { numeric: { total: 0, discount: 0, finalPrice: 0 }, liveBreakdown: [] };
    }

    const liveProducts = products.filter((p) => isLiveCounter(p));
    const otherProducts = products.filter((p) => !isLiveCounter(p));

    const liveBreakdown = liveProducts.map((p) => {
      const extraInfo = p.extraInfo || {};
      const hours = Number(extraInfo.hours ?? p.baseHours ?? 0);
      const staff = Number(extraInfo.staff ?? p.baseStaff ?? 0);

      const originalTotal = calculateLiveCounterPrice(p, extraInfo, hours, staff);

      const base = Number(p.baseFee || 0);
      const extraHours = Math.max(0, hours - (p.baseHours || 0));
      const hourCost = extraHours * (p.hourlyRate || 0);
      const extraStaff = Math.max(0, staff - (p.baseStaff || 0));
      const staffCost = extraStaff * (p.extraStaffRate || 0) * Math.max(1, hours || (p.baseHours || 0));

      const choicesObj = extraInfo.choices || {};
      const choicesDetail = Object.entries(choicesObj).map(([k, v]) => {
        const qty = Number(v) || 0;
        const choiceObj = (p.recommendedChoices || []).find((c) => c.key === k);
        const unitPrice = (choiceObj && Number(choiceObj.unitPrice)) || 0;
        const discountAmt = Math.round(unitPrice * 0.05);
        const discountedUnit = unitPrice - discountAmt;
        const costOriginal = qty * unitPrice;
        const costDiscounted = qty * discountedUnit;
        const saving = costOriginal - costDiscounted;
        return { key: k, label: (choiceObj && choiceObj.label) || k, qty, unitPrice, discountedUnit, costOriginal, costDiscounted, saving };
      });

      const choicesCostOriginal = choicesDetail.reduce((s, it) => s + (Number(it.costOriginal) || 0), 0);
      const choicesCostDiscounted = choicesDetail.reduce((s, it) => s + (Number(it.costDiscounted) || 0), 0);
      const choicesSavings = choicesCostOriginal - choicesCostDiscounted;

      const recomputedTotalOriginal = base + hourCost + staffCost + choicesCostOriginal;
      const recomputedTotalDiscounted = base + hourCost + staffCost + choicesCostDiscounted;
      const totalDiscountForProduct = recomputedTotalOriginal - recomputedTotalDiscounted;

      return {
        title: p.title,
        id: p.id || p.title,
        baseFee: base,
        hours,
        extraHours,
        hourCost,
        staff,
        extraStaff,
        staffCost,
        choicesCostOriginal,
        choicesCostDiscounted,
        choicesSavings,
        choicesDetail,
        totalOriginal: Number(recomputedTotalOriginal || originalTotal || 0),
        total: Number(recomputedTotalDiscounted || originalTotal || 0),
        totalDiscountForProduct: Number(totalDiscountForProduct || 0),
        rawProduct: p,
      };
    });

    const liveSumDiscounted = liveBreakdown.reduce((s, b) => s + (Number(b.total) || 0), 0);
    const liveSumOriginal = liveBreakdown.reduce((s, b) => s + (Number(b.totalOriginal) || 0), 0);
    const liveServicesDiscountTotal = liveSumOriginal - liveSumDiscounted;

    const otherPricing = otherProducts.length ? calculateProductPrice(otherProducts) : { total: 0, discount: 0, finalPrice: 0 };

    const numericTotal = Number(liveSumDiscounted || 0) + Number(otherPricing.total || 0);
    const numericDiscount = Number(otherPricing.discount || 0) + Number(liveServicesDiscountTotal || 0);
    const numericFinal = Number(liveSumDiscounted || 0) + Number(otherPricing.finalPrice || 0);

    return {
      numeric: { total: Number(numericTotal), discount: Number(numericDiscount), finalPrice: Number(numericFinal) },
      liveBreakdown,
      otherPricing,
    };
  }, [isLiveCounter]);

  // recalc pricing when products/food changes
  useEffect(() => {
    const foodTotalNumeric = Number(totalPriceFromState || 0);
    const foodDiscountNumeric = getDiscountPrice(foodTotalNumeric);

    const { numeric: serviceNumeric } = computeServicePricing(celebrationProducts || []);

    const finalNumeric = Math.max(0, foodTotalNumeric - foodDiscountNumeric) + Number(serviceNumeric.finalPrice || 0);

    const displayPricing = {
      pricepax: toINR(0),
      totalFoodPrice: toINR(foodTotalNumeric),
      serviceCharge: toINR(serviceNumeric.total),
      totalPrice: toINR(foodTotalNumeric + serviceNumeric.total),
      discountPax: toINR(foodDiscountNumeric),
      totalDiscount: toINR(foodDiscountNumeric + (serviceNumeric.discount || 0)),
      finalPrice: toINR(finalNumeric),
    };

    setProductPricing({
      total: Number(serviceNumeric.total || 0),
      discount: Number(serviceNumeric.discount || 0),
      finalPrice: Number(serviceNumeric.finalPrice || 0),
    });

    setPricing(displayPricing);
  }, [celebrationProducts, totalPriceFromState, getDiscountPrice, computeServicePricing]);

  const [orderData, setOrderData] = useState(() => ({
    people: guests || 0,
    price: pricing,
    special_request: "",
    menu_sections: getMenuSection(),
    date: new Date().toLocaleString(undefined, { timeZone: "Asia/Kolkata" }),
    services: celebrationProducts || [],
    dietConfig: dietConfigFromState || {},
  }));

  useEffect(() => {
    setOrderData((prev) => ({
      ...prev,
      people: guests || 0,
      price: pricing,
      menu_sections: getMenuSection(),
      services: celebrationProducts || [],
      dietConfig: dietConfigFromState || {},
    }));
  }, [guests, pricing, getMenuSection, celebrationProducts, dietConfigFromState]);

  const onDateChange = useCallback((date) => {
    if (!date || typeof date.toLocaleString !== "function") return;
    setOrderData((prev) => ({ ...prev, date: date.toLocaleString(undefined, { timeZone: "Asia/Kolkata" }) }));
  }, []);

  const onContentChange = useCallback((content) => {
    setOrderData((prev) => ({ ...prev, special_request: content }));
  }, []);

  useEffect(() => { window.scrollTo(0, 0); }, []);

  const [isService, setIsService] = useState(false);

  const serviceBreakdown = useMemo(() => {
    if (!celebrationProducts) return [];
    const { liveBreakdown = [] } = computeServicePricing(celebrationProducts);
    return liveBreakdown;
  }, [celebrationProducts, computeServicePricing]);

  const nonLiveProducts = useMemo(() => {
    if (!Array.isArray(celebrationProducts)) return [];
    return celebrationProducts.filter((p) => !isLiveCounter(p));
  }, [celebrationProducts, isLiveCounter]);

  return (
    <Wrapper headertext="Confirm your order" footer={false}>
      <div className="checkoutPage mealBoxCheckoutPage">
        
        {/* ✅ Order Summary Header */}
        <section className="orderSummaryHeader">
          <h2>Event Summary</h2>
          <ul>
            {eventTypeFromState && (
              <li>
                <span className="label">Event type:</span>
                <span className="value">{eventTypeFromState}</span>
              </li>
            )}
            {dateFromState && (
              <li>
                <span className="label">Date:</span>
                <span className="value">{dateFromState}</span>
              </li>
            )}
            <li>
              <span className="label">Total Guests:</span>
              <span className="value">{guestsFromState ?? 0}</span>
            </li>
            {vegCountFromState != null && (
              <li>
                <span className="label">Veg:</span>
                <span className="value">{vegCountFromState}</span>
              </li>
            )}
            {nonVegCountFromState != null && (
              <li>
                <span className="label">Non-Veg:</span>
                <span className="value">{nonVegCountFromState}</span>
              </li>
            )}
            {kidsCountFromState != null && (
              <li>
                <span className="label">Kids:</span>
                <span className="value">{kidsCountFromState}</span>
              </li>
            )}
          </ul>
        </section>
        <section className="menuSection">
          <div className="menuItemsSection">
            <MenuItemsSection
              selectedItemsCategory={selectedItemsCategory}
              selectedItemsFromState={selectedItemsFromState}
              toINR={toINR}
            />

            {/* Only non-live products summary */}
            <NonLiveServicesList products={nonLiveProducts} />
          </div>
        </section>

        {/* Live counters price breakdown */}
        <ServiceBreakdown serviceBreakdown={serviceBreakdown} toINR={toINR} />

        <section className="pricePaxSection isServiceSection">
          <p className="key">Need staff for service?</p>
          <Checkbox checked={isService} onChange={() => setIsService((prev) => !prev)} />
        </section>

        {isService && (
          <section className="pricePaxSection isServiceSection">
            <span className="key">Our executive will discuss further about our service plans</span>
          </section>
        )}

        <Pricing isService={isService} type="bulk" productPricing={productPricing} pricing={pricing} guests={guests || 0} />

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

export default Checkout;
