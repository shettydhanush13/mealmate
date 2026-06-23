// src/pages/create-menu/index.jsx
import React, { useEffect, useState, useMemo, useCallback } from "react";
import Seo from "../../components/seo";
import { useNavigate, useLocation } from "react-router-dom";
import { FaArrowRight, FaUtensils, FaBoxOpen, FaUsers, FaExclamationTriangle } from "react-icons/fa";
import Wrapper from "../../components/wrapper";
import PageIntro from "../../components/pageIntro";
import StateMessage from "../../components/stateMessage";
import { isLiveCounter } from "../../data/services/celebrationsData";
import { getPricing } from "../../utils/util";
import ConfigModal from "./components/ConfigModal";
import CaterBoxModal from "./components/CaterBoxModal";
import LiveCountersSection from "./components/LiveCountersSection";
import FoodSelectionSection from "./components/FoodSelectionSection";
import CaterBoxFoodSelector from "./components/CaterBoxFoodSelector";
import EventSummary from "./components/EventSummary";
import { fetchFoodByArea } from "../../services/food";
import "./styles.scss";

const CONFIG_KEY = "celebration-config";
const SERVICES_KEY = "celebration-services";

const EMPTY_RECOMMENDED = { Items: [] };

const DEFAULT_DIET_CONFIG = {
  dietMode: "veg-only",
  vegGuests: "",
  nonVegGuests: "",
  kidsCount: 0,
  eventTime: "",
  pincode: "",
};

const MEAL_TYPE_INFO = {
  buffet: {
    mealIcon: <FaUtensils />,
    mealLabel: "Buffet (with service staff)",
    mealDesc: "Full-service buffet with dedicated servers.",
  },
  caterbox: {
    mealIcon: <FaBoxOpen />,
    mealLabel: "CaterBox (boxed catering)",
    mealDesc: "Individual meal boxes for easy bulk delivery and distribution.",
  },
};

/* ---- pure helpers (no component state, hoisted for clarity + stable refs) ---- */

const perGuestRatioForProduct = (product) =>
  product && typeof product.servingsPerGuest === "number" ? product.servingsPerGuest : 0;

const computePlatesFromGuests = (product, guests) => {
  if ((guests === null || guests === undefined) && product?.extraInfo?.plates) {
    return Number(product.extraInfo.plates);
  }
  const guestsNum = Number(guests) || 0;
  const ratio = perGuestRatioForProduct(product);
  return guestsNum > 0 ? Math.max(1, Math.ceil(guestsNum * ratio)) : 1;
};

const distributeChoicesEvenly = (product, plates) => {
  const keys = (product.recommendedChoices || []).map((c) => c.key);
  if (!keys.length) return {};
  const base = Math.floor(plates / keys.length);
  const remainder = plates - base * keys.length;
  return keys.reduce((acc, key, idx) => {
    acc[key] = base + (idx < remainder ? 1 : 0);
    return acc;
  }, {});
};

const computeChoicesForProduct = (product, plates) => {
  const fromExtra = product?.extraInfo?.choices;
  if (fromExtra && Object.keys(fromExtra).length > 0) return fromExtra;
  return distributeChoicesEvenly(product, plates);
};

const buildBreakdownForProduct = (product, guests) => {
  const extra = product?.extraInfo;
  if (extra && Object.keys(extra).length > 0) {
    const platesFromExtra = extra.plates != null ? Number(extra.plates) : NaN;
    const plates = Number.isFinite(platesFromExtra)
      ? platesFromExtra
      : computePlatesFromGuests(product, guests);
    const choices =
      extra.choices && Object.keys(extra.choices).length > 0
        ? extra.choices
        : computeChoicesForProduct(product, plates);
    return { plates, choices, note: extra.note || "" };
  }
  const plates = computePlatesFromGuests(product, guests);
  return { plates, choices: computeChoicesForProduct(product, plates), note: "" };
};

const readConfig = () => {
  try {
    const raw = localStorage.getItem(CONFIG_KEY);
    if (raw) return JSON.parse(raw);
  } catch {
    /* ignore */
  }
  return DEFAULT_DIET_CONFIG;
};

const CreateMenu = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const nav = location.state || {};

  const incomingMealType = typeof nav.mealType === "string" ? nav.mealType : null;
  const isCaterBox = (incomingMealType || "").toLowerCase() === "caterbox";
  const guests = nav.guests != null ? Number(nav.guests) : null;
  const routePincode = nav.pincode || "";
  // Meal config is now chosen on the home page (box/meal for CaterBox, the event
  // config for Buffet), so create-menu skips the modal when it's provided.
  const navBoxType = nav.boxType ?? null;
  const navMealSlot = nav.mealSlot ?? null;
  const navReusableCarrier = !!nav.reusableCarrier;
  const navDietConfig = nav.dietConfig || null;
  const caterBoxPreselected = isCaterBox && navBoxType != null;
  const buffetPreselected = !isCaterBox && navDietConfig && navDietConfig.eventTime;
  const preselected = caterBoxPreselected || buffetPreselected;

  const [showConfig, setShowConfig] = useState(() =>
    preselected ? false : !localStorage.getItem(CONFIG_KEY)
  );
  const [dietConfig, setDietConfig] = useState(() => {
    const base = readConfig();
    if (caterBoxPreselected) return { ...base, ...(navDietConfig || {}), mealType: "caterbox", boxType: navBoxType, mealSlot: navMealSlot };
    if (buffetPreselected) return { ...base, ...navDietConfig };
    return base;
  });
  const [servicesState, setServicesState] = useState(() =>
    Array.isArray(nav.products) ? nav.products : []
  );
  const [selectedMenu, setSelectedMenu] = useState(EMPTY_RECOMMENDED);

  const [menuItems, setMenuItems] = useState({});
  const [categories, setCategories] = useState({});
  const [loadingMenu, setLoadingMenu] = useState(false);
  const [menuError, setMenuError] = useState(null);
  const [reloadKey, setReloadKey] = useState(0);
  const retryMenu = useCallback(() => setReloadKey((k) => k + 1), []);

  // Derived menu-fetch params (single source of truth — drives the fetch effect).
  // NOTE: food is keyed by named service regions (e.g. "Bangalore-North"), not by
  // pincode — so we fetch the full menu here. The delivery pincode is captured at
  // checkout. Use a named service area only when one is explicitly provided.
  const area = dietConfig.serviceArea || "";
  const vegOnly = dietConfig.dietMode === "veg-only";

  // Scroll to top when the config panel opens/closes (route changes are handled
  // globally by <ScrollToTop />).
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [showConfig]);

  // Persist services so back/refresh keeps the selection.
  useEffect(() => {
    try {
      localStorage.setItem(SERVICES_KEY, JSON.stringify(servicesState));
    } catch {
      /* ignore */
    }
  }, [servicesState]);

  // Single menu fetch — re-runs whenever area or diet mode changes.
  useEffect(() => {
    let active = true;
    (async () => {
      setLoadingMenu(true);
      setMenuError(null);
      try {
        const data = await fetchFoodByArea(area, vegOnly);
        if (!active) return;
        setCategories(data?.categories || {});
        setMenuItems(data?.menuItems || {});
      } catch (err) {
        if (!active) return;
        console.error("Failed to fetch menu", err);
        setMenuError(String(err?.message || err) || "Failed to fetch menu");
        setCategories({});
        setMenuItems({});
      } finally {
        if (active) setLoadingMenu(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [area, vegOnly, reloadKey]);

  const selectedLiveCounters = useMemo(
    () =>
      servicesState
        .filter(isLiveCounter)
        .map((p) => ({ ...p, breakdown: buildBreakdownForProduct(p, guests) })),
    [servicesState, guests]
  );

  const handleUpdateLiveCounter = useCallback((updated) => {
    setServicesState((prev) => {
      const exists = prev.some((p) => p.title === updated.title);
      return exists
        ? prev.map((p) => (p.title === updated.title ? { ...updated } : p))
        : [...prev, updated];
    });
  }, []);

  const handleSaveConfig = useCallback((cfg) => {
    setDietConfig(cfg);
    try {
      localStorage.setItem(CONFIG_KEY, JSON.stringify(cfg));
    } catch {
      /* ignore */
    }
    setShowConfig(false); // the fetch effect re-runs if area / dietMode changed
  }, []);

  const handleCheckout = useCallback(
    (menuSelection) => {
      // the CaterBox selector may override the carrier choice made on the prior page
      const selectedCarrier = menuSelection?.Items?.[0]?.reusableCarrier;
      navigate("/checkout", {
        state: {
          eventType: nav.eventType,
          totalPrice: getPricing(menuSelection),
          selectedItems: menuSelection,
          guests,
          services: servicesState,
          mealType: incomingMealType,
          dietConfig,
          reusableCarrier: selectedCarrier ?? navReusableCarrier,
          date: dietConfig.eventTime,
          pincode: routePincode || dietConfig.pincode || "",
        },
      });
    },
    [navigate, nav.eventType, guests, servicesState, incomingMealType, dietConfig, navReusableCarrier, routePincode]
  );

  const mealTypeDisplay = useMemo(() => {
    if (!incomingMealType) return null;
    const key = incomingMealType.toLowerCase();
    return (
      MEAL_TYPE_INFO[key] || { mealIcon: <FaBoxOpen />, mealLabel: incomingMealType, mealDesc: "" }
    );
  }, [incomingMealType]);

  const hasMenuItems = selectedMenu.Items?.length > 0;
  const hasServices = servicesState.length > 0;
  const isCheckoutDisabled = !hasMenuItems && !hasServices;

  return (
    <>
      <Seo
        title="Create Your Menu"
        description="Build a custom catering menu in minutes — pick your favourite dishes and quantities for your event, and get instant pricing from CaterKart in Bangalore."
        path="/create-menu"
        keywords="custom catering menu, build catering menu Bangalore, event food menu, CaterKart menu builder"
      />

      <Wrapper headertext="CaterKart" footer>
        <div className="cmPage">
        <PageIntro
          title="CREATE YOUR FOOD MENU"
          subtitle="CHOOSE YOUR FAVORITE DISH AND QUANTITY"
          badge={guests ? <><FaUsers /> For {guests} guests</> : null}
        />

        {!showConfig && (
          <EventSummary
            dietConfig={dietConfig}
            guestsFromRoute={guests}
            onEdit={() => setShowConfig(true)}
          />
        )}

        {isCaterBox ? (
          <CaterBoxModal
            show={showConfig}
            initial={dietConfig}
            guestsFromRoute={guests}
            onClose={() => setShowConfig(false)}
            onSave={handleSaveConfig}
          />
        ) : (
          <ConfigModal
            show={showConfig}
            initial={dietConfig}
            guestsFromRoute={guests}
            onClose={() => setShowConfig(false)}
            onSave={handleSaveConfig}
          />
        )}

        {!showConfig && (
          <>
            <LiveCountersSection
              guests={guests}
              liveCounters={selectedLiveCounters}
              onUpdate={handleUpdateLiveCounter}
            />

            {mealTypeDisplay && (
              <div className="selectedMealType" role="status" aria-live="polite">
                <div className="selectedMealType__icon" aria-hidden="true">
                  <span className="selectedMealType__emoji">{mealTypeDisplay.mealIcon}</span>
                </div>
                <div className="selectedMealType__meta">
                  <div className="selectedMealType__label">{mealTypeDisplay.mealLabel}</div>
                  {mealTypeDisplay.mealDesc && (
                    <div className="selectedMealType__desc">{mealTypeDisplay.mealDesc}</div>
                  )}
                </div>
              </div>
            )}

            {loadingMenu ? (
              <StateMessage
                variant="info"
                emoji={<FaUtensils />}
                title="Loading your menu…"
                description="Fetching dishes available for your area."
              />
            ) : menuError ? (
              <StateMessage
                variant="error"
                emoji={<FaExclamationTriangle />}
                title="Couldn’t load the menu"
                description="We couldn’t fetch dishes for this area right now. Please check your connection and try again."
                action={
                  <button type="button" onClick={retryMenu}>Retry</button>
                }
              />
            ) : isCaterBox ? (
              <CaterBoxFoodSelector
                menuItems={menuItems}
                boxType={dietConfig.boxType || 3}
                mealSlot={dietConfig.mealSlot}
                guests={guests}
                dietConfig={dietConfig}
                initialReusableCarrier={navReusableCarrier}
                onSelectionChange={setSelectedMenu}
              />
            ) : (
              <FoodSelectionSection
                menuItems={menuItems}
                categories={categories}
                guests={guests}
                dietConfig={dietConfig}
                recommendedMenu={EMPTY_RECOMMENDED}
                onSelectionChange={setSelectedMenu}
              />
            )}

          </>
        )}
        </div>

        {/* Checkout bar — kept outside .cmPage so it stays full-bleed (the page
            padding never indents it) on mobile. */}
        {!showConfig && (
          <footer
            className={`cmFooter ${isCheckoutDisabled ? "disabled" : ""}`}
            onClick={() => {
              if (!isCheckoutDisabled) {
                handleCheckout(hasMenuItems ? selectedMenu : EMPTY_RECOMMENDED);
              }
            }}
            role="button"
            aria-disabled={isCheckoutDisabled}
          >
            <span>Checkout</span>
            <FaArrowRight className="cmFooter__arrow" />
          </footer>
        )}
      </Wrapper>
    </>
  );
};

export default CreateMenu;
