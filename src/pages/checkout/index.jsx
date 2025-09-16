// src/pages/celebration-pages/bulk-checkout/Checkout.jsx
import React, { useCallback, useState, useEffect, useMemo } from "react";
import { useLocation } from "react-router-dom";
import { calculateProductPrice, toINR } from "../../utils/util";
import { calculateLiveCounterPrice } from "../../data/celebrationsData";
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
    eventType: eventTypeFromState = null,
    date: dateFromState = null,
    vegCount: vegCountFromState = null,
    nonVegCount: nonVegCountFromState = null,
    kidsCount: kidsCountFromState = null,
  } = location.state || {};

  // Try to read a persisted dietConfig if route state doesn't include it
  const getPersistedDietConfig = () => {
    try {
      const raw = localStorage.getItem("celebration-config");
      if (raw) return JSON.parse(raw);
    } catch (err) { /* ignore */ }
    return null;
  };

  const effectiveDietConfig =  useMemo(() => dietConfigFromState || getPersistedDietConfig() || {}, [dietConfigFromState])

  // scroll top
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    const t = setTimeout(() => {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }, 60);
    return () => clearTimeout(t);
  }, [location.key, location.pathname]);

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

  // ---------------------------------------------------------------------------
  // FOOD TOTAL: derive numeric food total. prefer totalPriceFromState if present,
  // otherwise compute from selectedItemsFromState.Items (sum of item.price * qty).
  // ---------------------------------------------------------------------------
  const foodTotalNumeric = useMemo(() => {
    const explicit = Number(totalPriceFromState || 0);
    if (explicit > 0) return explicit;

    // try to compute from selectedItemsFromState
    const items = (selectedItemsFromState && Array.isArray(selectedItemsFromState.Items)) ? selectedItemsFromState.Items : [];
    const sum = items.reduce((s, it) => {
      // item may have a 'price' field or 'pricePerItem' and 'quantity'
      const qty = Number(it.quantity || 1);
      const per = Number(it.price ?? it.pricePerItem ?? it.unitPrice ?? 0);
      return s + (per * qty);
    }, 0);
    return sum;
  }, [totalPriceFromState, selectedItemsFromState]);

  // recalc pricing when products/food changes — use computed foodTotalNumeric
  useEffect(() => {
    const foodTotal = Number(foodTotalNumeric || 0);
    const foodDiscountNumeric = getDiscountPrice(foodTotal);

    const { numeric: serviceNumeric } = computeServicePricing(celebrationProducts || []);

    const finalNumeric = Math.max(0, foodTotal - foodDiscountNumeric) + Number(serviceNumeric.finalPrice || 0);

    const displayPricing = {
      pricepax: toINR(0),
      totalFoodPrice: toINR(foodTotal),
      serviceCharge: toINR(serviceNumeric.total),
      totalPrice: toINR(foodTotal + serviceNumeric.total),
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
  }, [celebrationProducts, foodTotalNumeric, getDiscountPrice, computeServicePricing]);

  const [orderData, setOrderData] = useState(() => {
    // seed date: prefer route date, then dietConfig.eventTime, else now
    const seedDateStr = dateFromState || (effectiveDietConfig && effectiveDietConfig.eventTime) || new Date().toLocaleString(undefined, { timeZone: "Asia/Kolkata" });
    return {
      people: guests || 0,
      price: pricing,
      special_request: "",
      menu_sections: getMenuSection(),
      date: seedDateStr,
      services: celebrationProducts || [],
      dietConfig: dietConfigFromState || effectiveDietConfig || {},
    };
  });

  useEffect(() => {
    setOrderData((prev) => ({
      ...prev,
      people: guests || 0,
      price: pricing,
      menu_sections: getMenuSection(),
      services: celebrationProducts || [],
      dietConfig: dietConfigFromState || effectiveDietConfig || {},
      // keep date preference if supplied by route / config; otherwise preserve previous
      date: dateFromState || (effectiveDietConfig && effectiveDietConfig.eventTime) || prev.date,
    }));
  }, [guests, pricing, getMenuSection, celebrationProducts, dietConfigFromState, effectiveDietConfig, dateFromState]);

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

  // small helpers to render dietConfig nicely
  const formatNumber = (v) => {
    if (v === null || v === undefined || v === "") return "-";
    const n = Number(v);
    return Number.isFinite(n) ? n : v;
  };

  const formatDateTime = (dtStr) => {
    if (!dtStr) return "Not set";
    const dt = new Date(dtStr);
    if (isNaN(dt.getTime())) return "Invalid date/time";
    return dt.toLocaleString(undefined, { timeZone: "Asia/Kolkata" });
  };

  const {
    dietMode = "veg+nonveg",
    vegGuests = "",
    nonVegGuests = "",
    kidsCount = "",
    eventTime = "",
  } = dietConfigFromState || effectiveDietConfig || {};

  return (
    <Wrapper headertext="Confirm your order" footer={false}>
      {/* ✅ Order Summary Header */}
      <section className="orderSummaryHeader">
        <h2>Event Summary</h2>

        <ul className="eventSummaryList">
          {eventTypeFromState && (
            <li>
              <span className="label">Event type:</span>
              <span className="value">{eventTypeFromState}</span>
            </li>
          )}

          {/* Prefer explicit dateFromState (route) else eventTime from dietConfig */}
          {(dateFromState || eventTime) && (
            <li>
              <span className="label">Date / Time:</span>
              <span className="value">{dateFromState || formatDateTime(eventTime)}</span>
            </li>
          )}

          <li>
            <span className="label">Total Guests:</span>
            <span className="value">{guestsFromState ?? 0}</span>
          </li>

          {vegCountFromState != null ? (
            <li>
              <span className="label">Veg Guests:</span>
              <span className="value">{vegCountFromState}</span>
            </li>
          ) : (
            <li>
              <span className="label">Veg Guests:</span>
              <span className="value">{formatNumber(vegGuests)}</span>
            </li>
          )}

          {nonVegCountFromState != null ? (
            <li>
              <span className="label">Non-Veg Guests:</span>
              <span className="value">{nonVegCountFromState}</span>
            </li>
          ) : (
            <li>
              <span className="label">Non-Veg Guests:</span>
              <span className="value">{dietMode === "veg-only" ? 0 : formatNumber(nonVegGuests)}</span>
            </li>
          )}

          {kidsCountFromState != null ? (
            <li>
              <span className="label">Kids:</span>
              <span className="value">{kidsCountFromState}</span>
            </li>
          ) : (
            <li>
              <span className="label">Kids:</span>
              <span className="value">{formatNumber(kidsCount)}</span>
            </li>
          )}
        </ul>
      </section>

      <div className="checkoutPage mealBoxCheckoutPage">
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

        {/* pass numeric food total so Pricing can display the food block */}
        <Pricing
          isService={isService}
          type="bulk"
          productPricing={productPricing}
          pricing={pricing}
          guests={guests || 0}
          foodTotalNumeric={foodTotalNumeric}
        />

        <section className="menuSection">
          <Textarea onChange={(e) => onContentChange(e.target.value)} />
        </section>

        <div className="contactSection">
          <p>Add Your Details</p>
          {/* Date selection removed: date comes from route/config */}
          <ContactUs orderData={orderData} />
        </div>
      </div>
    </Wrapper>
  );
};

export default Checkout;
