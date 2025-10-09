// src/pages/celebration-pages/bulk-checkout/Checkout.jsx
import React, { useCallback, useState, useEffect, useMemo } from "react";
import { useLocation } from "react-router-dom";
import { calculateProductPrice, toINR } from "../../utils/util";
import { calculateLiveCounterPrice } from "../../data/services/celebrationsData";
import Wrapper from "../../components/wrapper";
import ContactUs from "../../components/contactUs";
import Textarea from "../../components/textArea";
import Pricing from "../../components/pricing";
// import Checkbox from "@mui/material/Checkbox";

import MenuItemsSection from "./components/MenuItemsSection";
import ServiceBreakdown from "./components/ServiceBreakdown";
import NonLiveServicesList from "./components/NonLiveServicesList";
import EventSummary from "./components/EventSummary";

import "./styles.scss";

const STORAGE_KEY = "celebration-services";

/* helpers */
/* deterministic ID generator (no Date.now) to avoid generating new IDs each render */
const makeId = (prefix = "ms", idx = 0) => `${prefix}-${idx}`;

/* Build rich menu sections from selectedItemsFromState.Items */
const buildMenuSectionsFromSelectedItems = (selectedItemsFromState = {}) => {
  if (!selectedItemsFromState || !Array.isArray(selectedItemsFromState.Items)) return [];
  return selectedItemsFromState.Items.map((item, idx) => {
    const id = item.id || makeId("ms", idx);
    const name = item.name || item.title || item.label || "Unnamed item";
    const quantity = Number(item.quantity ?? item.qty ?? item.count ?? 0) || 0;
    const price = Number(item.price ?? item.unitPrice ?? item.pricePerItem ?? 0) || 0;
    const discount = Number(item.discount ?? item.discountAmount ?? item.discountPax ?? 0) || 0;
    const discountedPrice = price ? Math.round((price - discount) * 100) / 100 : 0;
    return { id, name, quantity, price, discount, discountedPrice };
  });
};

/* parse fallback string sections "Name : 2" -> rich objects */
const parseMenuSectionsFromStrings = (menuSections = []) => {
  if (!Array.isArray(menuSections)) return [];
  return menuSections.map((entry, idx) => {
    if (typeof entry !== "string") {
      return { id: makeId("ms", idx), name: String(entry), quantity: 0, price: 0, discount: 0, discountedPrice: 0 };
    }
    const lastColon = entry.lastIndexOf(":");
    if (lastColon === -1) {
      return { id: makeId("ms", idx), name: entry.trim(), quantity: 0, price: 0, discount: 0, discountedPrice: 0 };
    }
    const name = entry.slice(0, lastColon).trim();
    const qtyPart = entry.slice(lastColon + 1).replace(/[^\d]/g, "").trim();
    const quantity = Number(qtyPart || 0);
    return { id: makeId("ms", idx), name: name || "Unnamed", quantity, price: 0, discount: 0, discountedPrice: 0 };
  });
};

const getPersistedCelebrationProducts = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch (err) {
    return null;
  }
};

/* Normalize service item (unchanged behavior) */
const normalizeServiceItem = (p) => {
  if (!p) return null;
  if (p.isLiveCounter === true) return { ...p };

  if (p.parentTitle) {
    const titleLabel = p.label || p.title || p.name || "";
    const displayTitle = p.parentTitle ? `${p.parentTitle} — ${titleLabel}` : titleLabel || p.parentTitle || "Service";
    const image = p.parentImage || (Array.isArray(p.img) && p.img[0]) || p.image || null;
    const price = typeof p.price === "number" ? p.price : (p.price && (p.price.min || p.price.max)) || null;

    return {
      id: p.id || p.key || `${p.parentTitle}-${titleLabel}`,
      title: displayTitle,
      parentTitle: p.parentTitle,
      titleLabel,
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

  const fallbackImage = p.image || (Array.isArray(p.img) && p.img[0]) || null;
  const fallbackTitle = p.title || p.label || p.name || "Service Item";
  const fallbackPrice = typeof p.price === "number" ? p.price : (p.price && (p.price.min || p.price.max)) || 0;

  return {
    ...p,
    id: p.id || p.title || fallbackTitle,
    title: fallbackTitle,
    image: fallbackImage,
    price: fallbackPrice,
  };
};

const ensurePriceObject = (p) => {
  const copy = { ...p };
  const rawPrice = copy.price;
  if (rawPrice && typeof rawPrice === "object" && (rawPrice.min !== undefined || rawPrice.max !== undefined)) {
    return { ...copy, price: { min: Number(rawPrice.min || rawPrice.max || 0), max: Number(rawPrice.max || rawPrice.min || 0) } };
  }
  if (typeof rawPrice === "number") {
    const min = Number(rawPrice || 0);
    return { ...copy, price: { min, max: Math.round(min * 1.05) } };
  }
  if (copy.selectedSubOption && (typeof copy.selectedSubOption.price === "number" || typeof copy.selectedSubOption.price === "object")) {
    const sp = copy.selectedSubOption.price;
    if (typeof sp === "number") return { ...copy, price: { min: sp, max: Math.round(sp * 1.05) } };
    if (sp && typeof sp === "object") return { ...copy, price: { min: Number(sp.min || sp.max || 0), max: Number(sp.max || sp.min || 0) } };
  }
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
  } = location.state || {};

  const getPersistedDietConfig = () => {
    try {
      const raw = localStorage.getItem("celebration-config");
      if (raw) return JSON.parse(raw);
    } catch (err) {}
    return null;
  };

  const effectiveDietConfig = useMemo(() => dietConfigFromState || getPersistedDietConfig() || {}, [dietConfigFromState]);

  useEffect(() => { window.scrollTo(0, 0); }, []);
  useEffect(() => {
    const t = setTimeout(() => window.scrollTo({ top: 0, behavior: "smooth" }), 60);
    return () => clearTimeout(t);
  }, [location.key, location.pathname]);

  const selectedItemsCategory = Object.keys(selectedItemsFromState || {});

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

  // getMenuSection now returns rich menu section objects (prefer selectedItemsFromState)
  const getMenuSection = useCallback(() => {
    if (selectedItemsFromState && Array.isArray(selectedItemsFromState.Items)) {
      return buildMenuSectionsFromSelectedItems(selectedItemsFromState);
    }
    // fallback to parse string sections if present in state (rare here)
    if (Array.isArray(selectedItemsFromState?.menu_sections)) {
      return parseMenuSectionsFromStrings(selectedItemsFromState.menu_sections);
    }
    return [];
  }, [selectedItemsFromState]);

  const getDiscountPrice = useCallback((price) => Math.round(Number(price || 0) * 0.05), []);

  useEffect(() => {
    if (Array.isArray(servicesFromState)) {
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify(servicesFromState)); } catch (err) {}
      setCelebrationProducts(servicesFromState);
    }
  }, [servicesFromState]);

  useEffect(() => {
    if (celebrationProducts !== null) return;
    const stored = getPersistedCelebrationProducts();
    if (stored) setCelebrationProducts(stored);
  }, [celebrationProducts]);

  const normalizedCelebrationProducts = useMemo(() => {
    if (!Array.isArray(celebrationProducts)) return [];
    return celebrationProducts.map((p) => normalizeServiceItem(p)).filter(Boolean);
  }, [celebrationProducts]);

  const isLiveCounter = useCallback((product) => {
    if (!product) return false;
    if (Object.prototype.hasOwnProperty.call(product, "isLiveCounter")) return product.isLiveCounter === true;
    return false;
  }, []);

  const computeServicePricing = useCallback(
    (products = []) => {
      if (!Array.isArray(products) || products.length === 0) return { numeric: { total: 0, discount: 0, finalPrice: 0 }, liveBreakdown: [] };

      const liveProducts = products.filter((p) => isLiveCounter(p));
      const otherProducts = products.filter((p) => !isLiveCounter(p));

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

const safeOtherProducts = otherProducts.map((p) => ensurePriceObject(p));
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

/* New: selectedDate state (initialised from route or saved config if available) */
const [selectedDate, setSelectedDate] = useState(() => {
// prefer explicit route date, then saved config eventTime, otherwise null
return dateFromState || (effectiveDietConfig && effectiveDietConfig.eventTime) || null;
});

/* Build orderData in compact requested format.
price block contains both formatted strings (from `pricing`) and numeric values (under `_numeric`) */
const buildOrderData = useCallback((overrides = {}) => {
const priceFormatted = pricing;
const priceNumeric = {
totalFoodPrice: Number((foodTotalNumeric || 0)),
foodDiscount: Number(getDiscountPrice(foodTotalNumeric || 0) || 0),
serviceCharge: Number(productPricing.total || 0),
serviceDiscount: Number(productPricing.discount || 0),
totalPrice: Number((foodTotalNumeric || 0) + (productPricing.total || 0)),
totalDiscount: Number(getDiscountPrice(foodTotalNumeric || 0) + (productPricing.discount || 0)),
finalPrice: Number(Math.max(0, (foodTotalNumeric || 0) - getDiscountPrice(foodTotalNumeric || 0)) + (productPricing.finalPrice || 0)),
};

const menu_sections = getMenuSection(); // rich objects

const services = (normalizedCelebrationProducts || []).map((s) => {
const base = { id: s.id ?? s.raw?.id ?? makeId("svc", 0), title: s.title ?? s.label ?? s.name ?? s.raw?.label ?? "Untitled" };
if (s.extraInfo) base.extraInfo = s.extraInfo;
return base;
});

/* finalDate: prefer explicit route date, then user-picked selectedDate, then saved config */
const finalDate = dateFromState || selectedDate || (effectiveDietConfig && effectiveDietConfig.eventTime) || null;

const order = {
people: Number(guests || 0),
price: {
// keep formatted strings for UI / human readability
totalFoodPrice: priceFormatted.totalFoodPrice,
foodDsicount: priceFormatted.discountPax, // preserved key name per your spec
serviceCharge: priceFormatted.serviceCharge,
serviceDiscount: priceFormatted.totalDiscount,
totalPrice: priceFormatted.totalPrice,
totalDiscount: priceFormatted.totalDiscount,
finalPrice: priceFormatted.finalPrice,
// numeric values for backend / API
_numeric: priceNumeric,
},
special_request: "", // will be updated via Textarea
menu_sections,
date: finalDate,
services,
dietConfig: dietConfigFromState || effectiveDietConfig || {},
customerData: overrides.customerData || {},
};

return order;
}, [pricing, productPricing, foodTotalNumeric, getMenuSection, normalizedCelebrationProducts, guests, dateFromState, selectedDate, effectiveDietConfig, dietConfigFromState, getDiscountPrice]);

const [orderData, setOrderData] = useState(() => buildOrderData({}));

// detect changes and update orderData (cheap shallow checks)
useEffect(() => {
const next = buildOrderData({ customerData: orderData.customerData || {} });
// deterministic stringify compare — ok because buildOrderData is stable
if (JSON.stringify(next) !== JSON.stringify(orderData)) {
setOrderData(next);
}
// eslint-disable-next-line react-hooks/exhaustive-deps
}, [guests, pricing, productPricing, normalizedCelebrationProducts, selectedItemsFromState, dateFromState, dietConfigFromState, selectedDate]);

const onContentChange = useCallback((content) => {
setOrderData((prev) => ({ ...prev, special_request: content }));
}, []);

useEffect(() => { window.scrollTo(0, 0); }, []);

const serviceBreakdown = useMemo(() => {
if (!normalizedCelebrationProducts) return [];
const { liveBreakdown = [] } = computeServicePricing(normalizedCelebrationProducts);
return liveBreakdown;
}, [normalizedCelebrationProducts, computeServicePricing]);

const nonLiveProducts = useMemo(() => {
if (!Array.isArray(normalizedCelebrationProducts)) return [];
return normalizedCelebrationProducts.filter((p) => !isLiveCounter(p));
}, [normalizedCelebrationProducts, isLiveCounter]);

/* handler for date change (datetime-local value) */
const handleDateChange = (e) => {
const v = e.target.value || null;
setSelectedDate(v);
};

return (
<Wrapper headertext="Confirm your order" footer={false}>
<EventSummary
eventType={eventTypeFromState}
date={dateFromState || selectedDate || (effectiveDietConfig && effectiveDietConfig.eventTime)}
guests={guestsFromState}
vegGuests={dietConfigFromState?.vegGuests ?? effectiveDietConfig?.vegGuests}
nonVegGuests={dietConfigFromState?.nonVegGuests ?? effectiveDietConfig?.nonVegGuests}
dietMode={dietConfigFromState?.dietMode ?? effectiveDietConfig?.dietMode}
mealType={location.state?.mealType}
/>

<div className="checkoutPage mealBoxCheckoutPage">
<section className="menuSection">
  <div className="menuItemsSection">
    <MenuItemsSection
      selectedItemsCategory={selectedItemsCategory}
      selectedItemsFromState={selectedItemsFromState}
      toINR={toINR}
    />

    <NonLiveServicesList products={nonLiveProducts} />
  </div>
</section>

<ServiceBreakdown serviceBreakdown={serviceBreakdown} toINR={toINR} />

<Pricing
  type="bulk"
  productPricing={productPricing}
  pricing={pricing}
  guests={guests || 0}
  foodTotalNumeric={foodTotalNumeric}
/>

<section className="menuSection">
  <Textarea onChange={(e) => onContentChange(e.target.value)} />
</section>

{/* If there is no explicit route date, show a datetime-local picker so user can pick event date/time.
    Placed just above "Add Your Details" as requested. */}
{!(dateFromState) && (
  <section className="menuSection datePickerSection" aria-label="Select event date and time">
    <label htmlFor="event-datetime" className="datePickerLabel">Select event date & time</label>
    <input
      id="event-datetime"
      type="datetime-local"
      value={selectedDate || ""}
      onChange={handleDateChange}
      className="datePickerInput"
      aria-describedby="event-datetime-help"
    />
    <div id="event-datetime-help" className="datePickerHelp">Choose a date and time for your event.</div>
  </section>
)}

<div className="contactSection">
  <p>Add Your Details</p>
  <ContactUs orderData={orderData} />
</div>
</div>
</Wrapper>
);
};

export default Checkout;

