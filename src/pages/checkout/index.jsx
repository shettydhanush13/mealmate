// src/pages/checkout/index.jsx
import React, { useCallback, useState, useEffect, useMemo } from "react";
import { useLocation } from "react-router-dom";
import Seo from "../../components/seo";
import { calculateProductPrice, toINR } from "../../utils/util";
import { calculateLiveCounterPrice } from "../../data/services/celebrationsData";
import { gstOn, PLATFORM_FEE, DELIVERY_FEE, carrierSavingPerBox } from "../../services/pricing";
import Wrapper from "../../components/wrapper";
import ContactUs from "../../components/contactUs";
import Textarea from "../../components/textArea";
import Pricing from "../../components/pricing";
import MenuItemsSection from "./components/MenuItemsSection";
import ServiceBreakdown from "./components/ServiceBreakdown";
import NonLiveServicesList from "./components/NonLiveServicesList";
import EventSummary from "./components/EventSummary";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import "./styles.scss";

const pad = (n) => String(n).padStart(2, "0");
/** Earliest selectable event datetime: start of day, 7 days from now. */
const getMinEventDate = () => {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() + 7);
  return d;
};
/** Convert between a Date and the "YYYY-MM-DDTHH:MM" string the order persists. */
const dateToString = (date) =>
  date
    ? `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`
    : null;
const stringToDate = (s) => {
  if (!s) return null;
  const d = new Date(s);
  return Number.isNaN(d.getTime()) ? null : d;
};

const STORAGE_KEY = "celebration-services";

/* helpers */
const makeId = (prefix = "ms", idx = 0) => `${prefix}-${idx}`;

const buildMenuSectionsFromSelectedItems = (selectedItemsFromState = {}) => {
  if (!selectedItemsFromState || !Array.isArray(selectedItemsFromState.Items)) return [];
  return selectedItemsFromState.Items.map((item, idx) => {
    const id = item.id || makeId("ms", idx);
    const name = item.name || item.title || item.label || "Unnamed item";
    const quantity = Number(item.quantity ?? item.qty ?? item.count ?? 0) || 0;
    const price = Number(item.price ?? item.unitPrice ?? item.pricePerItem ?? 0) || 0;
    // No automatic bulk/item discount — discounts are negotiated by the admin at
    // quote time (default 0%). Items are stored at full price.
    return { id, name, quantity, price, discount: 0, discountedPrice: price };
  });
};

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
    mealType: mealTypeFromState = null,
    pincode: pincodeFromState = "",
    reusableCarrier: reusableCarrierFromState = false,
  } = location.state || {};

  // keep only the state variable if the setter isn't used
  const [celebrationProducts] = useState(() => {
    if (Array.isArray(servicesFromState)) return servicesFromState;
    return getPersistedCelebrationProducts();
  });

  const [productPricing, setProductPricing] = useState({ total: 0, discount: 0, finalPrice: 0 });
  const [pricing, setPricing] = useState({
    pricepax: toINR(0),
    totalFoodPrice: toINR(totalPriceFromState),
    serviceCharge: toINR(0),
    serviceDiscount: toINR(0),
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
    if (selectedItemsFromState && Array.isArray(selectedItemsFromState.Items)) {
      return buildMenuSectionsFromSelectedItems(selectedItemsFromState);
    }
    if (Array.isArray(selectedItemsFromState?.menu_sections)) {
      return parseMenuSectionsFromStrings(selectedItemsFromState.menu_sections);
    }
    return [];
  }, [selectedItemsFromState]);

  // food discount rate: only an explicit combo bulk rate (none by default —
  // discounts are negotiated by the team during quote generation).
  const foodDiscountRate = useMemo(() => {
    const items = Array.isArray(selectedItemsFromState?.Items) ? selectedItemsFromState.Items : [];
    const bulk = items.find((it) => Number(it?.bulkDiscountPct) > 0);
    return bulk ? Number(bulk.bulkDiscountPct) / 100 : 0;
  }, [selectedItemsFromState]);

  const getDiscountPrice = useCallback((price) => Math.round(Number(price || 0) * foodDiscountRate), [foodDiscountRate]);

  // Reusable-carrier saving for one-time CaterBox: ₹/box by box size × number of
  // boxes (one per guest). Subtracted from the food total like an extra discount.
  const carrierDiscountNumeric = useMemo(() => {
    if (!reusableCarrierFromState || mealTypeFromState !== "caterbox") return 0;
    return carrierSavingPerBox(dietConfigFromState?.boxType) * Number(guests || 0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reusableCarrierFromState, mealTypeFromState, dietConfigFromState, guests]);

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

        const originalFromHelper = calculateLiveCounterPrice(p, extraInfo, hours, staff);

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

        const finalTotalOriginal = Number(recomputedTotalOriginal || originalFromHelper || 0);
        const finalTotalDiscounted = Number(recomputedTotalDiscounted || originalFromHelper || 0);

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
          totalOriginal: finalTotalOriginal,
          total: finalTotalDiscounted,
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
      const unit = Number(it.pricePerItem ?? it.unitPrice ?? 0);
      // `it.price` is already a line total (unit × qty); only multiply when we have a real unit price.
      const lineTotal = unit > 0 ? unit * qty : Number(it.price ?? 0);
      return s + lineTotal;
    }, 0);
    return sum;
  }, [totalPriceFromState, selectedItemsFromState]);

  useEffect(() => {
    const foodTotal = Number(foodTotalNumeric || 0);
    const foodDiscountNumeric = getDiscountPrice(foodTotal) + carrierDiscountNumeric;
    const { numeric: serviceNumeric } = computeServicePricing(normalizedCelebrationProducts || []);
    const taxable = Math.max(0, foodTotal - foodDiscountNumeric) + Number(serviceNumeric.finalPrice || 0);
    const gst = gstOn(taxable);
    const finalNumeric = taxable + gst + PLATFORM_FEE + DELIVERY_FEE;

    setProductPricing({
      total: Number(serviceNumeric.total || 0),
      discount: Number(serviceNumeric.discount || 0),
      finalPrice: Number(serviceNumeric.finalPrice || 0),
    });

    const displayPricing = {
      pricepax: toINR(0),
      totalFoodPrice: toINR(foodTotal),
      serviceCharge: toINR(serviceNumeric.total),
      serviceDiscount: toINR(serviceNumeric.discount),
      platformFee: toINR(PLATFORM_FEE),
      deliveryFee: toINR(DELIVERY_FEE),
      gst: toINR(gst),
      totalPrice: toINR(foodTotal + serviceNumeric.total),
      discountPax: toINR(foodDiscountNumeric),
      totalDiscount: toINR(foodDiscountNumeric + (serviceNumeric.discount || 0)),
      finalPrice: toINR(finalNumeric),
    };

    setPricing(displayPricing);
  }, [normalizedCelebrationProducts, foodTotalNumeric, getDiscountPrice, carrierDiscountNumeric, computeServicePricing]);

  // Selected date initialised from location.state.date if present, otherwise null (will show picker)
  const [selectedDate, setSelectedDate] = useState(() => (dateFromState ? dateFromState : null));

  const buildOrderData = useCallback((overrides = {}) => {
    const foodDiscountTotal = Number(getDiscountPrice(foodTotalNumeric || 0) || 0) + carrierDiscountNumeric;
    const taxableNumeric = Math.max(0, (foodTotalNumeric || 0) - foodDiscountTotal) + Number(productPricing.finalPrice || 0);
    const gstNumeric = gstOn(taxableNumeric);
    const priceNumeric = {
      totalFoodPrice: Number(foodTotalNumeric || 0),
      foodDiscount: foodDiscountTotal,
      carrierDiscount: carrierDiscountNumeric,
      serviceCharge: Number(productPricing.total || 0),
      serviceDiscount: Number(productPricing.discount || 0),
      platformFee: PLATFORM_FEE,
      deliveryFee: DELIVERY_FEE,
      gst: gstNumeric,
      totalPrice: Number((foodTotalNumeric || 0) + (productPricing.total || 0)),
      totalDiscount: Number(foodDiscountTotal + (productPricing.discount || 0)),
      finalPrice: Number(taxableNumeric + gstNumeric + PLATFORM_FEE + DELIVERY_FEE),
    };

    const menu_sections = getMenuSection();

    const services = (normalizedCelebrationProducts || []).map((s, i) => {
      const base = { id: s.id ?? s.raw?.id ?? makeId("svc", i), title: s.title ?? s.label ?? s.name ?? s.raw?.label ?? "Untitled" };
      if (s.extraInfo) base.extraInfo = s.extraInfo;
      return base;
    });

    // prefer explicit route date (location.state.date) otherwise use selectedDate
    const finalDate = dateFromState ? dateFromState : selectedDate;

    // fulfillment routing: serviceable area (from the pincode) + the vendor(s)
    // behind the chosen items, so ops can assign the order.
    const serviceArea = dietConfigFromState?.serviceArea || "";
    const items = Array.isArray(selectedItemsFromState?.Items) ? selectedItemsFromState.Items : [];
    const vendors = [...new Set(items.map((it) => it && it.vendor).filter(Boolean))];

    // CaterBox has no "event type" — store the chosen packaging type instead so
    // it surfaces correctly on Orders / Track. Buffet keeps the real event type.
    const firstItem = (selectedItemsFromState?.Items || [])[0] || {};
    const isCoBranded = !!firstItem.coBranded;
    const isReusableCarrier = !!reusableCarrierFromState || !!firstItem.reusableCarrier;
    let resolvedEventType = eventTypeFromState ?? null;
    if (mealTypeFromState === "caterbox") {
      resolvedEventType = isCoBranded
        ? "Customized packaging"
        : isReusableCarrier
          ? "Reusable carriers"
          : "Standard packaging";
    }

    const order = {
      people: Number(guests || 0),
      // buffet: event type from route state; caterbox: packaging type (above)
      eventType: resolvedEventType,
      mealType: mealTypeFromState ?? null,
      // packaging flags persisted so Track/Orders can label reliably
      coBranded: isCoBranded,
      pincode: String(pincodeFromState || "").trim(),
      serviceArea,
      reusableCarrier: isReusableCarrier,
      vendor: vendors[0] || "",
      vendors,
      price: {
        totalFoodPrice: pricing.totalFoodPrice,
        foodDiscount: pricing.discountPax,
        serviceCharge: pricing.serviceCharge,
        serviceDiscount: pricing.serviceDiscount,
        totalPrice: pricing.totalPrice,
        totalDiscount: pricing.totalDiscount,
        finalPrice: pricing.finalPrice,
        _numeric: priceNumeric,
      },
      special_request: "",
      menu_sections,
      date: finalDate,
      services,
      dietConfig: dietConfigFromState || {},
      customerData: overrides.customerData || {},
    };

    return order;
  }, [pricing, productPricing, foodTotalNumeric, getMenuSection, normalizedCelebrationProducts, guests, selectedDate, dateFromState, eventTypeFromState, mealTypeFromState, dietConfigFromState, getDiscountPrice, carrierDiscountNumeric, pincodeFromState, reusableCarrierFromState, selectedItemsFromState]);

  const [orderData, setOrderData] = useState(() => buildOrderData({}));

  useEffect(() => {
    const next = buildOrderData({ customerData: orderData.customerData || {} });
    if (JSON.stringify(next) !== JSON.stringify(orderData)) {
      setOrderData(next);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [guests, pricing, productPricing, normalizedCelebrationProducts, selectedItemsFromState, dateFromState, selectedDate]);

  const onContentChange = useCallback((content) => {
    setOrderData((prev) => ({ ...prev, special_request: content }));
  }, []);

  const serviceBreakdown = useMemo(() => {
    if (!normalizedCelebrationProducts) return [];
    const { liveBreakdown = [] } = computeServicePricing(normalizedCelebrationProducts);
    return liveBreakdown;
  }, [normalizedCelebrationProducts, computeServicePricing]);

  const nonLiveProducts = useMemo(() => {
    if (!Array.isArray(normalizedCelebrationProducts)) return [];
    return normalizedCelebrationProducts.filter((p) => !isLiveCounter(p));
  }, [normalizedCelebrationProducts, isLiveCounter]);

  const hasMenuItems = Array.isArray(selectedItemsFromState?.Items) && selectedItemsFromState.Items.length > 0;
  const hasNonLiveServices = nonLiveProducts.length > 0;

  /* For CaterBox, show the packaging choice instead of an event type. */
  const packagingLabel = useMemo(() => {
    if (mealTypeFromState !== "caterbox") return null;
    const firstItem = (selectedItemsFromState?.Items || [])[0] || {};
    if (firstItem.coBranded) return "Customized packaging";
    if (reusableCarrierFromState || firstItem.reusableCarrier) return "Reusable carriers";
    return "Standard packaging";
  }, [mealTypeFromState, selectedItemsFromState, reusableCarrierFromState]);

  const orderKindLabel = mealTypeFromState === "buffet"
    ? "buffet order"
    : mealTypeFromState === "caterbox"
      ? "CaterBox order"
      : "order";

  return (
    <>
      <Seo
        title="Confirm Your Order"
        description="Review your event summary, menu, live counters and pricing, then confirm your CaterKart catering order."
        path="/checkout"
        noindex
      />
      <Wrapper headertext="Confirm your order" footer={false}>
      <div className="checkoutPage">
        <div className="coIntro">
          <h1 className="coIntro__title">You're almost done 🎊</h1>
          <p className="coIntro__sub">
            Review your {orderKindLabel} below, choose a date, and add your details to place it.
          </p>
        </div>

        <EventSummary
          eventType={eventTypeFromState}
          // show date from location if present, otherwise show the user-picked date
          date={dateFromState ? dateFromState : selectedDate}
          guests={guestsFromState}
          vegGuests={dietConfigFromState?.vegGuests}
          nonVegGuests={dietConfigFromState?.nonVegGuests}
          dietMode={dietConfigFromState?.dietMode}
          mealType={mealTypeFromState}
          packaging={packagingLabel}
        />

        {(hasMenuItems || hasNonLiveServices) && (
          <section className="menuSection menuSection--stack">
            <MenuItemsSection selectedItemsCategory={Object.keys(selectedItemsFromState || {})} selectedItemsFromState={selectedItemsFromState} toINR={toINR} />
            <NonLiveServicesList products={nonLiveProducts} />
          </section>
        )}

        <ServiceBreakdown serviceBreakdown={serviceBreakdown} toINR={toINR} />

        {/* Date picker — only when the route didn't already supply a date */}
        {!dateFromState && (
          <section className="coCard datePickerSection" aria-label="Select event date and time">
            <header className="coCard__head">
              <span className="coCard__icon" aria-hidden="true">📅</span>
              <h3 className="coCard__title">Event date &amp; time</h3>
            </header>
            <div className="ckDateWrap">
              <DatePicker
                selected={stringToDate(selectedDate)}
                onChange={(date) => setSelectedDate(dateToString(date))}
                inline
                showTimeSelect
                timeIntervals={30}
                timeCaption="Time"
                minDate={getMinEventDate()}
                dateFormat="EEE, dd MMM yyyy · h:mm aa"
                calendarClassName="ckCal"
              />
            </div>
            <p className="datePickerHelp">
              Orders need at least <strong>7 days</strong> lead time — the earliest selectable date is 7 days from today.
            </p>
          </section>
        )}

        <section className="coCard">
          <header className="coCard__head">
            <span className="coCard__icon" aria-hidden="true">📝</span>
            <h3 className="coCard__title">Special requests <span className="coCard__opt">Optional</span></h3>
          </header>
          <Textarea onChange={(e) => onContentChange(e.target.value)} />
        </section>

        <Pricing type="bulk" productPricing={productPricing} pricing={pricing} guests={guests || 0} foodTotalNumeric={foodTotalNumeric} />

        <section className="coCard contactSection">
          <header className="coCard__head">
            <span className="coCard__icon" aria-hidden="true">👤</span>
            <h3 className="coCard__title">Your details</h3>
          </header>
          <ContactUs orderData={orderData} />
        </section>
      </div>
      </Wrapper>
    </>
  );
};

export default Checkout;
