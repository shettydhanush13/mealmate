// src/pages/celebration-pages/celebrations/index.jsx
import React, { useState, useCallback, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import Seo, { SITE_URL } from "../../components/seo";
import { FaArrowRight, FaRegCreditCard, FaTruck, FaAward } from "react-icons/fa";
import Wrapper from "../../components/wrapper";
import SiteFooter from "../../components/siteFooter";
import LiveCounterEditorModal from "../create-menu/components/LiveCounterEditorModal.jsx";
import MealTypeSection from "./components/MealTypeSection";

import PageHeader from "./components/PageHeader";
import EventTypeGrid from "./components/EventTypeGrid";
import GuestsCard from "./components/GuestsCard";
import ServicesAccordion from "./components/ServicesAccordion";

import { eventTypeOptions, isLiveCounter } from "../../data/services/celebrationsData";
import { fetchServicesByEvent } from '../../services/services';
import { checkServiceability } from '../../services/pincodes';

import "./styles.scss"; // main page-level styles (keeps global layout rules)

const STORAGE_KEY = "celebration-services";

const validateGuests = (value) => {
  const min = 30;
  const max = 500;
  if (value === "" || value === null || value === undefined)
    return "Please enter guest count.";
  if (isNaN(value)) return "Guests must be a number.";
  const n = Number(value);
  if (n < min) return `Minimum booking is ${min} guests.`;
  if (n > max) return `Maximum booking is ${max} guests.`;
  return "";
};

const DEFAULT_DIET_CONFIG = {
  dietMode: "veg-only",
  vegGuests: "",
  nonVegGuests: "0",
  kidsCount: "0",
  eventTime: "",
};

// Validate the inline event-config before continuing.
const validateDietConfig = (cfg, total, requireDate = true) => {
  if (cfg.dietMode === "veg+nonveg") {
    const v = Number(cfg.vegGuests || 0);
    const nv = Number(cfg.nonVegGuests || 0);
    if (!cfg.vegGuests || !cfg.nonVegGuests) return "Enter the veg / non-veg guest split.";
    if (v + nv !== Number(total)) return `Veg + Non-veg must equal ${total} guests.`;
  }
  if (requireDate) {
    if (!cfg.eventTime) return "Please select the event date & time.";
    const min = new Date();
    min.setHours(0, 0, 0, 0);
    min.setDate(min.getDate() + 7);
    if (new Date(cfg.eventTime).getTime() < min.getTime()) {
      return "Event must be at least 7 days from now.";
    }
  }
  return "";
};

const validatePincode = (value) => {
  // Indian pincode: 6 digits. Accept string or number.
  if (value === "" || value === null || value === undefined) return "Please enter your pincode.";
  const s = String(value).trim();
  if (!/^\d{6}$/.test(s)) return "Pincode must be a 6-digit number.";
  return "";
};

const Celebrations = () => {
  const navigate = useNavigate();
  const [selectedItems, setSelectedItems] = useState([]); // array of titles for quick lookup
  const [selectedItemsObj, setSelectedItemsObj] = useState([]); // full product objects (including configured live counters)
  const [selectedEvent, setSelectedEvent] = useState(eventTypeOptions[0]);
  const [guests, setGuests] = useState(50);
  const [pincode, setPincode] = useState("");
  const [errors, setErrors] = useState({});

  const [liveModalOpen, setLiveModalOpen] = useState(false);
  const [liveModalProduct, setLiveModalProduct] = useState(null);

  // Inline meal-type selection (tabs below "Pick Your Event Type")
  const [mealType, setMealType] = useState("caterbox"); // "buffet" | "caterbox"
  const [boxType, setBoxType] = useState(3); // default: 3-item box
  const [mealSlot, setMealSlot] = useState("Breakfast"); // default meal slot
  const [reusableCarrier, setReusableCarrier] = useState(false);
  const [mealError, setMealError] = useState("");
  // Buffet event-config (diet / kids / date) collected inline; ref keeps a stable
  // `initial` for the inline ConfigModal so it doesn't reset while typing.
  const [dietConfig, setDietConfig] = useState(DEFAULT_DIET_CONFIG);
  const dietInitialRef = useRef(DEFAULT_DIET_CONFIG);

  // New: steps + loading + error state
  const [steps, setSteps] = useState([]);
  const [stepsLoading, setStepsLoading] = useState(false);
  const [stepsError, setStepsError] = useState(null);

  useEffect(() => {
    // Home is the fresh-start screen — clear any prior selection.
    localStorage.clear();
  }, []);

  // Fetch steps when selectedEvent changes (no AbortController as requested)
  useEffect(() => {
    if (!selectedEvent) {
      setSteps([]);
      setStepsError(null);
      setStepsLoading(false);
      return;
    }

    let mounted = true;
    setStepsLoading(true);
    setStepsError(null);

    fetchServicesByEvent(selectedEvent)
      .then((data) => {
        if (!mounted) return;
        // fetchServicesByEvent may return undefined on error — default to empty array.
        // Decor is out of scope for phase 1, so hide any decor service groups.
        const list = (Array.isArray(data) ? data : []).filter(
          (s) => !/decor/i.test(s?.text || "")
        );
        setSteps(list);
      })
      .catch((err) => {
        if (!mounted) return;
        console.error("Error fetching services for event", selectedEvent, err);
        setStepsError(err?.message || "Failed to load services");
        setSteps([]);
      })
      .finally(() => {
        if (mounted) setStepsLoading(false);
      });

    return () => {
      // mark unmounted to avoid state updates after unmount (simple guard since no AbortController)
      mounted = false;
    };
  }, [selectedEvent]);

  const onGuestsChange = useCallback((e) => {
    const raw = e.target.value;
    const normalized = raw === "" ? "" : Number(raw);
    setGuests(normalized);
    setErrors((prev) => ({ ...prev, guests: validateGuests(normalized) }));
  }, []);

  const onPincodeChange = useCallback((e) => {
    const raw = e.target.value;
    // Keep as string to preserve leading zeros if any
    const normalized = raw === "" ? "" : String(raw).trim();
    setPincode(normalized);
    setErrors((prev) => ({ ...prev, pincode: validatePincode(normalized) }));
  }, []);

  /**
   * onProductClicked
   *
   * - If the product is already selected: remove it (both title and obj).
   * - If it's a live counter: open the LiveCounterEditorModal for configuration.
   * - If it's a non-live product: add it to selection immediately.
   *
   * Note: `isLiveCounter` is used with the product title (string) to match other usages.
   */
  const onProductClicked = useCallback(
    (product) => {
      if (!product || !product.title) return;
      const title = product.title;

      const alreadySelected = selectedItems.includes(title);
      if (alreadySelected) {
        // remove it (works for both live and normal products)
        setSelectedItems((prev) => prev.filter((t) => t !== title));
        setSelectedItemsObj((prev) => prev.filter((o) => o.title !== title));
        return;
      }

      // If this is a live counter, open modal rather than adding straight away
      // (we pass the full product to modal so the modal can prefill values)
      if (isLiveCounter(product)) {
        setLiveModalProduct(product);
        setLiveModalOpen(true);
        return;
      }

      // Regular product -> add immediately
      const clone = { ...product };
      setSelectedItems((prev) => [...prev, clone.title]);
      setSelectedItemsObj((prev) => [...prev, clone]);
    },
    [selectedItems]
  );

  /**
   * handleSaveLiveCounter
   * - receives the configured product (with extraInfo)
   * - add it to selected lists (replace any previous instance)
   */
  const handleSaveLiveCounter = useCallback((configuredProduct) => {
    if (!configuredProduct || !configuredProduct.title) {
      setLiveModalOpen(false);
      setLiveModalProduct(null);
      return;
    }

    setSelectedItems((prev) => {
      const without = prev.filter((t) => t !== configuredProduct.title);
      return [...without, configuredProduct.title];
    });

    setSelectedItemsObj((prev) => {
      const without = prev.filter((o) => o.title !== configuredProduct.title);
      return [...without, configuredProduct];
    });

    setLiveModalOpen(false);
    setLiveModalProduct(null);
  }, []);

  const handleCancelLiveCounter = useCallback(() => {
    setLiveModalOpen(false);
    setLiveModalProduct(null);
  }, []);

  /**
   * Normalize selected products for the menu / checkout step:
   * - configured live-counter -> pass as-is (it carries config)
   * - product with a selectedSubOption -> pass the sub-option (+ parent context)
   * - otherwise the product itself (+ parentTitle for context)
   */
  const buildFinalProducts = useCallback(
    () =>
      (selectedItemsObj || []).map((p) => {
        if (isLiveCounter(p)) return { ...p, isLiveCounter: true };
        if (p.selectedSubOption) {
          const sub = p.selectedSubOption;
          return { ...sub, parentTitle: p.title, parentImage: p.image || null };
        }
        return { ...p, parentTitle: p.parentTitle || p.title || null };
      }),
    [selectedItemsObj]
  );

  // "Add Meal & Checkout" — validate guests/pincode (+ box selection for CaterBox),
  // then continue to the menu with the chosen meal type. (Replaces /add-meal route.)
  const proceed = useCallback(async () => {
    const gErr = validateGuests(guests);
    const pErr = validatePincode(pincode);
    if (gErr || pErr) {
      setErrors({ guests: gErr, pincode: pErr });
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    // serviceability: resolve the pincode to a serviceable area (skips gracefully
    // if the backend is unreachable or no pincodes are configured yet).
    let serviceArea = dietConfig.serviceArea || "";
    try {
      const svc = await checkServiceability(String(pincode).trim());
      if (!svc.notConfigured && !svc.serviceable) {
        setErrors({ pincode: "Sorry, we don't deliver to this pincode yet." });
        window.scrollTo({ top: 0, behavior: "smooth" });
        return;
      }
      if (svc.area) serviceArea = svc.area;
    } catch {
      /* network issue — don't block the order */
    }
    if (mealType === "caterbox") {
      if (!boxType || !mealSlot) { setMealError("Please pick a meal and a box option."); return; }
      const cErr = validateDietConfig(dietConfig, guests, false);
      if (cErr) { setMealError(cErr); return; }
    }
    if (mealType === "buffet") {
      if (!mealSlot) { setMealError("Please pick a meal."); return; }
      const cErr = validateDietConfig(dietConfig, guests, true);
      if (cErr) { setMealError(cErr); return; }
    }
    setMealError("");
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(buildFinalProducts()));
    } catch {
      /* ignore quota errors */
    }
    navigate("/create-menu", {
      state: {
        products: buildFinalProducts(),
        guests: Number(guests),
        eventType: selectedEvent,
        pincode: String(pincode).trim(),
        mealType,
        boxType: mealType === "caterbox" ? boxType : null,
        mealSlot,
        reusableCarrier: mealType === "caterbox" ? reusableCarrier : false,
        dietConfig: { ...dietConfig, serviceArea },
        date: mealType === "buffet" ? dietConfig.eventTime : null,
        needMeal: true,
      },
    });
  }, [guests, pincode, mealType, boxType, mealSlot, reusableCarrier, dietConfig, buildFinalProducts, navigate, selectedEvent]);

  const isBuffet = mealType === "buffet";

  // disable footer if guests or pincode invalid
  const isFooterDisabled = !!validateGuests(guests) || !!validatePincode(pincode);

  return (
    <>
      <Seo
        title="Premium Catering in Bangalore"
        description="Plan your perfect event with CaterKart — choose live counters, custom menus, decor and more for birthdays, house parties and corporate events across Bengaluru."
        path="/"
        keywords="catering Bangalore, CaterKart, event catering, party catering, live counters, custom menu catering, corporate catering Bengaluru"
        jsonLd={[
          {
            "@context": "https://schema.org",
            "@type": "WebSite",
            name: "CaterKart",
            url: `${SITE_URL}/`,
            potentialAction: {
              "@type": "SearchAction",
              target: `${SITE_URL}/create-menu?q={search_term_string}`,
              "query-input": "required name=search_term_string",
            },
          },
          {
            "@context": "https://schema.org",
            "@type": "CateringService",
            name: "CaterKart",
            url: `${SITE_URL}/`,
            image: `${SITE_URL}/og-image.png`,
            description:
              "Premium event & party catering in Bangalore — custom menus, live counters and CaterBox meal boxes.",
            servesCuisine: ["Indian", "South Indian", "North Indian", "Continental"],
            areaServed: { "@type": "City", name: "Bengaluru" },
            address: {
              "@type": "PostalAddress",
              addressLocality: "Bengaluru",
              addressRegion: "KA",
              addressCountry: "IN",
            },
            priceRange: "₹₹",
          },
        ]}
      />

      <Wrapper headerLeftType="home" headertext="CaterKart" wide>
        <div className="celebrations-page">
          <div className="celebBg" aria-hidden="true">
            <span className="celebBg__art celebBg__art--1">🍛</span>
            <span className="celebBg__art celebBg__art--2">🥘</span>
            <span className="celebBg__art celebBg__art--3">🫓</span>
            <span className="celebBg__art celebBg__art--4">🍲</span>
            <span className="celebBg__art celebBg__art--5">🥗</span>
            <span className="celebBg__art celebBg__art--6">🍜</span>
            <span className="celebBg__art celebBg__art--7">🧆</span>
            <span className="celebBg__art celebBg__art--8">🍚</span>
            <span className="celebBg__art celebBg__art--9">☕</span>
            <span className="celebBg__art celebBg__art--10">🍢</span>
            <span className="celebBg__art celebBg__art--11">🥟</span>
            <span className="celebBg__art celebBg__art--12">🌶️</span>
          </div>

          <PageHeader />

          {/* USP strip — zero fees, modern stat bar */}
          <div className="homeUsp" role="list" aria-label="Why CaterKart">
            <div className="homeUsp__item" role="listitem">
              <span className="homeUsp__ic" aria-hidden="true"><FaRegCreditCard /></span>
              <span className="homeUsp__txt">
                <span className="homeUsp__top"><span className="homeUsp__cur">₹</span>0</span>
                <span className="homeUsp__label">Platform fee</span>
              </span>
            </div>
            <span className="homeUsp__div" aria-hidden="true" />
            <div className="homeUsp__item" role="listitem">
              <span className="homeUsp__ic" aria-hidden="true"><FaTruck /></span>
              <span className="homeUsp__txt">
                <span className="homeUsp__top"><span className="homeUsp__cur">₹</span>0</span>
                <span className="homeUsp__label">Delivery fee</span>
              </span>
            </div>
            <span className="homeUsp__div" aria-hidden="true" />
            <div className="homeUsp__item" role="listitem">
              <span className="homeUsp__ic homeUsp__ic--ok" aria-hidden="true"><FaAward /></span>
              <span className="homeUsp__txt">
                <span className="homeUsp__top homeUsp__top--sm">Best price</span>
                <span className="homeUsp__label">Guaranteed</span>
              </span>
            </div>
          </div>

          <div className="home-track">
            <span className="home-track__text">Already placed an order?</span>
            <button type="button" className="home-track__link" onClick={() => navigate("/track-order")}>
              Track your order →
            </button>
          </div>

          <section className="celebrations-section">
            <MealTypeSection
              mealType={mealType}
              boxType={boxType}
              mealSlot={mealSlot}
              error={mealError}
              guests={guests}
              dietInitial={dietInitialRef.current}
              onDietConfig={setDietConfig}
              onMealType={(t) => { setMealType(t); setMealError(""); }}
              onBoxType={(b) => { setBoxType(b); setMealError(""); }}
              onMealSlot={(s) => { setMealSlot(s); setMealError(""); }}
              reusableCarrier={reusableCarrier}
              onReusableCarrier={setReusableCarrier}
            />

            {/* Event type only matters for buffet; CaterBox skips it */}
            {isBuffet && (
              <>
                <h3 className="subSectionTitle" data-step="2">Pick Your Event Type</h3>
                <EventTypeGrid
                  selectedEvent={selectedEvent}
                  onSelect={setSelectedEvent}
                />
              </>
            )}

            <h3 className="subSectionTitle" data-step={isBuffet ? "3" : "2"}>Guests &amp; Location</h3>
            <GuestsCard guests={guests} pincode={pincode} onPincodeChange={onPincodeChange} onChange={onGuestsChange} error={errors.guests} pincodeError={errors.pincode} />

            {/* Services (decor / live counters) only apply to buffet, not CaterBox */}
            {isBuffet && (
              <ServicesAccordion
                step={4}
                steps={steps}
                selectedItems={selectedItems}
                onProductClicked={onProductClicked}
                loading={stepsLoading}
                error={stepsError}
              />
            )}

            {/* NOTE: intentionally NOT rendering LiveCountersSection so selected live counters are not shown */}

            {/* Final step — inline (no more fixed floating footer) */}
            <h3 className="subSectionTitle" data-step={isBuffet ? "5" : "3"}>Review &amp; Continue</h3>
            <div className="finalStep">
              <div className="finalStep__summary">
                <span className="finalStep__count">
                  {selectedItems.length > 0
                    ? `${selectedItems.length} service${selectedItems.length > 1 ? "s" : ""} added`
                    : "Ready when you are"}
                </span>
                <span className="finalStep__sub">{Number(guests) || 0} guests · {isBuffet ? selectedEvent : "CaterBox"}</span>
              </div>
              <button
                type="button"
                className="finalStep__cta"
                onClick={() => { if (!isFooterDisabled) proceed(); }}
                disabled={isFooterDisabled}
              >
                <span>Add Meal &amp; Checkout</span>
                <FaArrowRight />
              </button>
            </div>
          </section>

          <SiteFooter />
        </div>
      </Wrapper>

      {/* render live counter editor modal when requested */}
      {liveModalOpen && liveModalProduct && (
        <LiveCounterEditorModal
          product={liveModalProduct}
          guests={guests}
          onSave={handleSaveLiveCounter}
          onCancel={handleCancelLiveCounter}
        />
      )}
    </>
  );
};

export default Celebrations;
