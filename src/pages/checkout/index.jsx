// src/pages/celebration-pages/bulk-checkout/Checkout.jsx
import React, { useCallback, useState, useEffect, useMemo } from "react";
import { useLocation } from "react-router-dom";
import { calculateProductPrice, toINR } from "../../utils/util";
import { calculateLiveCounterPrice } from "../../data/services/celebrationsData";
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
 * Checkout - updated to handle normalized celebration-services and to defensively
 * provide safe `price` objects to calculateProductPrice to avoid `null.max` errors.
 */

const STORAGE_KEY = "celebration-services";

const getPersistedCelebrationProducts = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch (err) {
    return null;
  }
};

/**
 * Normalize a single service item for UI & pricing:
 * - If it's a live-counter (has isLiveCounter or baseFee/baseFare) -> return as-is.
 * - If it has parentTitle -> treat as selected sub-option and return a UI-friendly object.
 * - Otherwise try to produce a stable object with a safe price field.
 */
const normalizeServiceItem = (p) => {
  if (!p) return null;

  // Pass-through live counters / configured live products
  // NOTE: we still pass-through if p.isLiveCounter === true (explicit)
  if (p.isLiveCounter === true) {
    return { ...p };
  }

  // If looks like a selected sub-option (created earlier), it should have parentTitle
  if (p.parentTitle) {
    const titleLabel = p.label || p.title || p.name || "";
    const displayTitle = p.parentTitle ? `${p.parentTitle} — ${titleLabel}` : titleLabel || p.parentTitle || "Service";
    const image = p.parentImage || (Array.isArray(p.img) && p.img[0]) || p.image || null;
    const price =
      typeof p.price === "number"
        ? p.price
        : (p.price && (p.price.min || p.price.max)) || null;

    return {
      id: p.id || p.key || `${p.parentTitle}-${titleLabel}`,
      title: displayTitle,
      parentTitle: p.parentTitle,
      titleLabel: titleLabel,
      image,
      price,
      inclusions: Array.isArray(p.inclusions) ? p.inclusions : [],
      description: p.description || "",
      thingsToRemember: Array.isArray(p.thingsToRemember) ? p.thingsToRemember : [],
      whatYouCanExpect: Array.isArray(p.whatYouCanExpect) ? p.whatYouCanExpect : [],
      customerImages: Array.isArray(p.customerImages) ? p.customerImages : [],
      customerReviews: Array.isArray(p.customerReviews) ? p.customerReviews : [],
      raw: { ...p },
    };
  }

  // Fallback normalization
  const fallbackImage = p.image || (Array.isArray(p.img) && p.img[0]) || null;
  const fallbackTitle = p.title || p.label || p.name || "Service Item";
  const fallbackPrice =
    typeof p.price === "number"
      ? p.price
      : (p.price && (p.price.min || p.price.max)) || 0;

  return {
    ...p,
    id: p.id || p.title || fallbackTitle,
    title: fallbackTitle,
    image: fallbackImage,
    price: fallbackPrice,
  };
};

/**
 * Utility: ensure product has a safe `{min,max}` price object for calculateProductPrice
 */
const ensurePriceObject = (p) => {
  const copy = { ...p };
  const rawPrice = copy.price;

  // If price already object with min/max use it
  if (rawPrice && typeof rawPrice === "object" && (rawPrice.min !== undefined || rawPrice.max !== undefined)) {
    // ensure both min and max exist as numbers
    return {
      ...copy,
      price: {
        min: Number(rawPrice.min || rawPrice.max || 0),
        max: Number(rawPrice.max || rawPrice.min || rawPrice.min || 0),
      },
    };
  }

  // If price is a single number -> convert to min/max (apply small buffer for max)
  if (typeof rawPrice === "number") {
    const min = Number(rawPrice || 0);
    return { ...copy, price: { min, max: Math.round(min * 1.05) } };
  }

  // If product has a nested selectedSubOption with a numeric price, use that
  if (copy.selectedSubOption && (typeof copy.selectedSubOption.price === "number" || typeof copy.selectedSubOption.price === "object")) {
    const sp = copy.selectedSubOption.price;
    if (typeof sp === "number") return { ...copy, price: { min: sp, max: Math.round(sp * 1.05) } };
    if (sp && typeof sp === "object") return { ...copy, price: { min: Number(sp.min || sp.max || 0), max: Number(sp.max || sp.min || sp.min || 0) } };
  }

  // If nothing present set to 0
  return { ...copy, price: { min: 0, max: 0 } };
};

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

  const getPersistedDietConfig = () => {
    try {
      const raw = localStorage.getItem("celebration-config");
      if (raw) return JSON.parse(raw);
    } catch (err) { /* ignore */ }
    return null;
  };

  const effectiveDietConfig = useMemo(() => dietConfigFromState || getPersistedDietConfig() || {}, [dietConfigFromState]);

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

  // celebrationProducts: prefer route state -> localStorage -> null
  const [celebrationProducts, setCelebrationProducts] = useState(() => {
    if (Array.isArray(servicesFromState)) return servicesFromState;
    return getPersistedCelebrationProducts();
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

  const getDiscountPrice = useCallback((price) => Math.round(Number(price || 0) * 0.05), []);

  useEffect(() => {
    if (Array.isArray(servicesFromState)) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(servicesFromState));
      } catch (err) {
        console.warn("Could not persist celebration-services to localStorage:", err);
      }
      setCelebrationProducts(servicesFromState);
    }
  }, [servicesFromState]);

  useEffect(() => {
    if (celebrationProducts !== null) return;
    const stored = getPersistedCelebrationProducts();
    if (stored) setCelebrationProducts(stored);
  }, [celebrationProducts]);

  // Normalize celebrationProducts
  const normalizedCelebrationProducts = useMemo(() => {
    if (!Array.isArray(celebrationProducts)) return [];
    return celebrationProducts.map((p) => normalizeServiceItem(p)).filter(Boolean);
  }, [celebrationProducts]);

  /**
   * IMPORTANT CHANGE:
   * Treat product as live-counter ONLY if it explicitly has `isLiveCounter: true`.
   * If the product has no `isLiveCounter` key at all, it will be considered NON-LIVE.
   *
   * This moves all products without isLiveCounter to non-live (which is what you requested).
   */
  const isLiveCounter = useCallback((product) => {
    if (!product) return false;

    // If the object explicitly contains the key `isLiveCounter`, use it strictly.
    // Otherwise treat as non-live.
    if (Object.prototype.hasOwnProperty.call(product, "isLiveCounter")) {
      return product.isLiveCounter === true;
    }

    return false;
  }, []);

  // Compute service pricing - fixed to ensure calculateProductPrice gets safe price objects
  const computeServicePricing = useCallback(
    (products = []) => {
      if (!Array.isArray(products) || products.length === 0) {
        return { numeric: { total: 0, discount: 0, finalPrice: 0 }, liveBreakdown: [] };
      }

      const liveProducts = products.filter((p) => isLiveCounter(p));
      const otherProducts = products.filter((p) => !isLiveCounter(p));

      // Normalize live breakdown as before
      const liveBreakdown = liveProducts.map((p) => {
        const extraInfo = p.extraInfo || {};
        const hours = Number(extraInfo.hours ?? p.baseHours ?? p.baseFareHours ?? 0);
        const staff = Number(extraInfo.staff ?? p.baseStaff ?? 0);

        const originalTotal = calculateLiveCounterPrice(p, extraInfo, hours, staff);

        const base = Number(p.baseFee || p.baseFare || 0);
        const extraHours = Math.max(0, hours - (p.baseHours || 0));
        const hourCost = extraHours * (p.hourlyRate || p.extraPerHour || 0);
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
          title: p.title || p.name || p.id,
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

      // produce safe price objects for the non-live products
      const safeOtherProducts = otherProducts.map((p) => ensurePriceObject(p));

      // use the existing util to compute other pricing (now safe)
      const otherPricing = safeOtherProducts.length ? calculateProductPrice(safeOtherProducts) : { total: 0, discount: 0, finalPrice: 0 };

      const liveSumDiscounted = liveBreakdown.reduce((s, b) => s + (Number(b.total) || 0), 0);
      const liveSumOriginal = liveBreakdown.reduce((s, b) => s + (Number(b.totalOriginal) || 0), 0);
      const liveServicesDiscountTotal = liveSumOriginal - liveSumDiscounted;

      const numericTotal = Number(liveSumDiscounted || 0) + Number(otherPricing.total || 0);
      const numericDiscount = Number(otherPricing.discount || 0) + Number(liveServicesDiscountTotal || 0);
      const numericFinal = Number(liveSumDiscounted || 0) + Number(otherPricing.finalPrice || 0);

      return {
        numeric: { total: Number(numericTotal), discount: Number(numericDiscount), finalPrice: Number(numericFinal) },
        liveBreakdown,
        otherPricing,
      };
    },
    [isLiveCounter]
  );

  // FOOD TOTAL computation (same as before)
  const foodTotalNumeric = useMemo(() => {
    const explicit = Number(totalPriceFromState || 0);
    if (explicit > 0) return explicit;

    const items = (selectedItemsFromState && Array.isArray(selectedItemsFromState.Items)) ? selectedItemsFromState.Items : [];
    const sum = items.reduce((s, it) => {
      const qty = Number(it.quantity || 1);
      const per = Number(it.price ?? it.pricePerItem ?? it.unitPrice ?? 0);
      return s + (per * qty);
    }, 0);
    return sum;
  }, [totalPriceFromState, selectedItemsFromState]);

  // Recalc pricing when products or food changes
  useEffect(() => {
    const foodTotal = Number(foodTotalNumeric || 0);
    const foodDiscountNumeric = getDiscountPrice(foodTotal);

    const { numeric: serviceNumeric } = computeServicePricing(normalizedCelebrationProducts || []);

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
  }, [normalizedCelebrationProducts, foodTotalNumeric, getDiscountPrice, computeServicePricing]);

  const [orderData, setOrderData] = useState(() => {
    const seedDateStr = dateFromState || (effectiveDietConfig && effectiveDietConfig.eventTime) || new Date().toLocaleString(undefined, { timeZone: "Asia/Kolkata" });
    return {
      people: guests || 0,
      price: pricing,
      special_request: "",
      menu_sections: getMenuSection(),
      date: seedDateStr,
      services: normalizedCelebrationProducts || [],
      dietConfig: dietConfigFromState || effectiveDietConfig || {},
    };
  });

  // helper: shallow-ish equality for the order fields we care about.
  // We intentionally compare only the keys that matter to avoid deep compare on functions.
  const areOrderDataEqual = (a, b) => {
    if (!a || !b) return false;
    // compare primitive fields
    if ((a.people || 0) !== (b.people || 0)) return false;

    // pricing: we compare the numeric final price and service total + discount to detect changes
    const aFinal = a.price?.finalPrice ?? "";
    const bFinal = b.price?.finalPrice ?? "";
    if (aFinal !== bFinal) return false;

    // menu sections array/string compare
    const aMenu = JSON.stringify(a.menu_sections || []);
    const bMenu = JSON.stringify(b.menu_sections || []);
    if (aMenu !== bMenu) return false;

    // services: compare by id/title array (keeps it cheap)
    const aServ = (a.services || []).map((s) => s.id || s.title || s.name || JSON.stringify(s));
    const bServ = (b.services || []).map((s) => s.id || s.title || s.name || JSON.stringify(s));
    if (aServ.length !== bServ.length) return false;
    for (let i = 0; i < aServ.length; i++) {
      if (aServ[i] !== bServ[i]) return false;
    }

    // diet config simple JSON compare
    if (JSON.stringify(a.dietConfig || {}) !== JSON.stringify(b.dietConfig || {})) return false;

    // date
    if ((a.date || "") !== (b.date || "")) return false;

    return true;
  };

  useEffect(() => {
    const next = {
      people: guests || 0,
      price: pricing,
      menu_sections: getMenuSection(),
      date: dateFromState || (effectiveDietConfig && effectiveDietConfig.eventTime) || orderData.date,
      services: normalizedCelebrationProducts || [],
      dietConfig: dietConfigFromState || effectiveDietConfig || {},
      special_request: orderData.special_request || "",
    };

    // Only update state if anything meaningful changed
    if (!areOrderDataEqual(orderData, next)) {
      setOrderData((prev) => ({ ...prev, ...next }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [guests, pricing, getMenuSection, normalizedCelebrationProducts, dietConfigFromState, effectiveDietConfig, dateFromState]);


  const onContentChange = useCallback((content) => {
    setOrderData((prev) => ({ ...prev, special_request: content }));
  }, []);

  useEffect(() => { window.scrollTo(0, 0); }, []);

  const [isService, setIsService] = useState(false);

  const serviceBreakdown = useMemo(() => {
    if (!normalizedCelebrationProducts) return [];
    const { liveBreakdown = [] } = computeServicePricing(normalizedCelebrationProducts);
    return liveBreakdown;
  }, [normalizedCelebrationProducts, computeServicePricing]);

  // NON-LIVE: all products that do NOT have explicit isLiveCounter: true
  const nonLiveProducts = useMemo(() => {
    if (!Array.isArray(normalizedCelebrationProducts)) return [];
    return normalizedCelebrationProducts.filter((p) => !isLiveCounter(p));
  }, [normalizedCelebrationProducts, isLiveCounter]);

  // small helpers
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
      <section className="orderSummaryHeader">
        <h2>Event Summary</h2>

        <ul className="eventSummaryList">
          {eventTypeFromState && (
            <li>
              <span className="label">Event type:</span>
              <span className="value">{eventTypeFromState}</span>
            </li>
          )}

          {(dateFromState || eventTime) && (
            <li>
              <span className="label">Date / Time:</span>
              <span className="value">{dateFromState || formatDateTime(eventTime)}</span>
            </li>
          )}

          {guestsFromState && <li>
            <span className="label">Total Guests:</span>
            <span className="value">{guestsFromState ?? 0}</span>
          </li>}

          {vegCountFromState != null ? (
            <li>
              <span className="label">Veg Guests:</span>
              <span className="value">{vegGuests}</span>
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

            {/* Non-live services (sub-options & normal non-live products) */}
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
          <ContactUs orderData={orderData} />
        </div>
      </div>
    </Wrapper>
  );
};

export default Checkout;
