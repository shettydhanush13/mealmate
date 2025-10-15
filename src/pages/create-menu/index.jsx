// src/pages/create-menu/CreateMenu.jsx
import React, { useEffect, useState, useMemo, useCallback } from "react";
import { Helmet } from "react-helmet";
import { useNavigate, useLocation } from "react-router-dom";
import Wrapper from "../../components/wrapper";
import logowhite from "../../assets/logowhite.png";
import { isLiveCounter } from "../../data/services/celebrationsData";
import { getPricing } from "../../utils/util";
import ConfigModal from "./components/ConfigModal";
import LiveCountersSection from "./components/LiveCountersSection";
import FoodSelectionSection from "./components/FoodSelectionSection";
import EventSummary from "./components/EventSummary";
import { fetchFoodByArea } from "../../services/food";
import "./styles.scss";

const CONFIG_KEY = "celebration-config";

const CreateMenu = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // grab mealType from navigation state (set by CelebrationsMeals)
  const incomingMealType = useMemo(() => {
    const mt = location?.state?.mealType;
    return typeof mt === "string" ? mt : null;
  }, [location]);

  // don't show full-page config if we already have a saved config (i.e. opened before)
  const [showConfigModal, setShowConfigModal] = useState(() => {
    try {
      return localStorage.getItem(CONFIG_KEY) ? false : true;
    } catch (e) {
      return true;
    }
  });

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    const t = setTimeout(() => {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }, 60);
    return () => clearTimeout(t);
  }, [location.key, location.pathname, showConfigModal]);

  // incoming values
  const guestsFromRoute = useMemo(() => {
    const g = location?.state?.guests;
    return typeof g === "number" ? g : g ? Number(g) : null;
  }, [location]);

  const incomingServices = useMemo(() => location?.state?.products || [], [location]);

  // local canonical services state (includes live counters and props)
  const [servicesState, setServicesState] = useState(() => Array.isArray(incomingServices) ? incomingServices : []);

  // hold the current menu selection (received from child)
  const recommendedMenu = { "Items" : []};
  const [selectedMenuSelection, setSelectedMenuSelection] = useState({ Items: [] });

  // load persisted config (if any) and use it as initial dietConfig
  const [dietConfig, setDietConfig] = useState(() => {
    try {
      const raw = localStorage.getItem(CONFIG_KEY);
      if (raw) return JSON.parse(raw);
    } catch (e) { /* ignore */ }
    return {
      dietMode: "veg-only",
      vegGuests: "",
      nonVegGuests: "",
      kidsCount: 0,
      eventTime: "",
      pincode: "", // keep pincode in config shape (may be empty)
    };
  });

  const perGuestRatioForProduct = useCallback((product) => {
    if (product && typeof product.servingsPerGuest === "number") return product.servingsPerGuest;
  }, []);

  const computePlatesFromGuests = useCallback((product, g) => {
    if ((g === null || g === undefined) && product?.extraInfo?.plates) {
      return Number(product.extraInfo.plates);
    }
    const guestsNum = Number(g) || 0;
    const ratio = perGuestRatioForProduct(product);
    return guestsNum > 0 ? Math.max(1, Math.ceil(guestsNum * ratio)) : 1;
  }, [perGuestRatioForProduct]);

  const distributeChoicesEvenly = useCallback((product, plates) => {
    const choicesList = (product.recommendedChoices || []).map((c) => c.key);
    if (!choicesList.length) return {};
    const base = Math.floor(plates / choicesList.length);
    const remainder = plates - base * choicesList.length;
    const result = {};
    choicesList.forEach((key, idx) => {
      result[key] = base + (idx < remainder ? 1 : 0);
    });
    return result;
  }, []);

  const computeChoicesForProduct = useCallback((product, plates) => {
    if (product?.extraInfo?.choices && Object.keys(product.extraInfo.choices).length > 0) {
      return product.extraInfo.choices;
    }
    return distributeChoicesEvenly(product, plates);
  }, [distributeChoicesEvenly]);

  const buildBreakdownForProduct = useCallback((product, g) => {
    if (product && product.extraInfo && Object.keys(product.extraInfo).length > 0) {
      const platesFromExtra = product.extraInfo.plates != null ? Number(product.extraInfo.plates) : undefined;
      const choicesFromExtra = product.extraInfo.choices && Object.keys(product.extraInfo.choices).length > 0
        ? product.extraInfo.choices
        : undefined;

      const plates = typeof platesFromExtra === "number" && !Number.isNaN(platesFromExtra)
        ? platesFromExtra
        : computePlatesFromGuests(product, g);

      const choices = choicesFromExtra ? choicesFromExtra : computeChoicesForProduct(product, plates);

      return { plates, choices, note: product.extraInfo.note || "" };
    }

    const plates = computePlatesFromGuests(product, g);
    const choices = computeChoicesForProduct(product, plates);
    return { plates, choices, note: "" };
  }, [computePlatesFromGuests, computeChoicesForProduct]);

  // derive selected live counters from servicesState
  const selectedLiveCounters = useMemo(() => {
    return (servicesState || []).filter(s => isLiveCounter(s)).map(p => ({
      ...p,
      breakdown: buildBreakdownForProduct(p, guestsFromRoute),
    }));
  }, [servicesState, buildBreakdownForProduct, guestsFromRoute]);

  // update one live counter when user edits it (from LiveCountersSection)
  const handleUpdateLiveCounter = useCallback((updatedProduct) => {
    setServicesState((prev) => {
      const out = prev.map(p => (p.title === updatedProduct.title ? { ...updatedProduct } : p));
      if (!out.some(p => p.title === updatedProduct.title)) out.push(updatedProduct);
      return out;
    });
  }, []);

  // persist services state in localStorage so back/refresh keeps selection
  useEffect(() => {
    try {
      localStorage.setItem("celebration-services", JSON.stringify(servicesState));
    } catch (e) { /* ignore */ }
  }, [servicesState]);

  // fetched menu (from API)
  const [menuItems, setMenuItems] = useState({});
  const [categories, setCategories] = useState({});
  const [loadingMenu, setLoadingMenu] = useState(false);
  const [menuError, setMenuError] = useState(null);

  // handle checkout (menuSelectionPayload format unchanged)
  const handleCheckout = useCallback((menuSelectionPayload) => {
    // Compose final payload: servicesState (with live counter extraInfo), guestsFromRoute, selected menu
    const totalPrice = getPricing(menuSelectionPayload);
    // navigate to real checkout — include persisted/saved dietConfig in state
    navigate("/checkout", {
      state: {
        eventType: location.state?.eventType,
        totalPrice,
        selectedItems: menuSelectionPayload,
        guests: guestsFromRoute,
        services: servicesState,
        mealType: incomingMealType,
        dietConfig, // pass the saved config (persisted or newly saved)
        date: dietConfig.eventTime,
        pincode: location.state?.pincode || dietConfig?.pincode || "",
      },
    });
  }, [navigate, guestsFromRoute, servicesState, dietConfig, incomingMealType, location.state]);

  // ----------------------------
  // NEW: determine if checkout should be enabled
  // ----------------------------
  const hasMenuItems = Boolean(selectedMenuSelection && Array.isArray(selectedMenuSelection.Items) && selectedMenuSelection.Items.length > 0);
  const hasServices = Boolean(servicesState && Array.isArray(servicesState) && servicesState.length > 0);
  const isCheckoutDisabled = !hasMenuItems && !hasServices;

  // Map mealType to display text + small description + optional icon (emoji fallback)
  const mealTypeDisplay = useMemo(() => {
    if (!incomingMealType) return null;
    const key = String(incomingMealType).toLowerCase();
    if (key === "buffet") {
      return {
        mealLabel: "Buffet (with service staff)",
        mealDesc: "Full-service buffet with dedicated servers.",
        mealIcon: "",
        iconSrc: null,
      };
    }
    if (key === "caterbox" || key === "caterbox") {
      return {
        mealLabel: "CaterBox (boxed catering)",
        mealDesc: "Individual meal boxes for easy bulk delivery and distribution.",
        mealIcon: "",
        iconSrc: null,
      };
    }
    // fallback generic
    return {
      mealLabel: incomingMealType,
      mealDesc: "",
      mealIcon: "🍱",
      iconSrc: null,
    };
  }, [incomingMealType]);

  // ----------------------------
  // Save config both locally (state) and to localStorage
  // AFTER SAVE: call API immediately using saved pincode (from location.state) and dietMode (veg-only -> vegOnly=true)
  // ----------------------------
  const handleSaveConfig = useCallback(async (cfg) => {
    try {
      // persist locally first
      setDietConfig(cfg);
      try {
        localStorage.setItem(CONFIG_KEY, JSON.stringify(cfg));
      } catch (e) { /* ignore */ }

      // close modal right away so UI reflects saved state
      setShowConfigModal(false);

      // derive vegOnly boolean only when dietMode === 'veg-only'
      const vegOnlyFlag = cfg.dietMode === "veg-only" ? true : false;

      // NEW: prefer pincode from navigation state; fallback to cfg.pincode or empty string
      const areaParam = location?.state?.pincode || cfg?.pincode || "";

      // call API immediately and update menuItems/categories
      setLoadingMenu(true);
      setMenuError(null);
      try {
        const data = await fetchFoodByArea(areaParam, vegOnlyFlag);
        if (data && typeof data === "object") {
          setCategories(data.categories || {});
          setMenuItems(data.menuItems || {});
        } else {
          setCategories({});
          setMenuItems({});
        }
      } catch (err) {
        console.error("Failed to fetch menu after saving config", err);
        setMenuError(String(err?.message || err) || "Failed to fetch menu");
        setCategories({});
        setMenuItems({});
      } finally {
        setLoadingMenu(false);
      }
    } catch (err) {
      console.error("Failed inside handleSaveConfig", err);
    }
  }, [location?.state?.pincode]);

  // ----------------------------
  // Fetch menu from API on mount / pincode / diet mode changes
  // ----------------------------
  useEffect(() => {
    let mounted = true;
    // NEW: prefer pincode from navigation state; fallback to saved dietConfig.pincode
    const areaFromState = location?.state?.pincode || dietConfig?.pincode || "";
    const vegOnlyFlag = dietConfig?.dietMode === "veg-only" ? true : false;

    const loadMenu = async () => {
      setLoadingMenu(true);
      setMenuError(null);
      try {
        const data = await fetchFoodByArea(areaFromState, vegOnlyFlag);
        if (!mounted) return;
        if (data && typeof data === "object") {
          setCategories(data.categories || {});
          setMenuItems(data.menuItems || {});
        } else {
          setCategories({});
          setMenuItems({});
        }
      } catch (err) {
        console.error("Failed to fetch menu", err);
        setMenuError(String(err?.message || err) || "Failed to fetch menu");
        setCategories({});
        setMenuItems({});
      } finally {
        if (mounted) setLoadingMenu(false);
      }
    };

    loadMenu();
    return () => { mounted = false; };
  }, [location?.state?.pincode, dietConfig?.dietMode, dietConfig?.pincode]);

  return (
    <>
      <Helmet>
        <title>Create Your Menu | CaterKart</title>
      </Helmet>

      <Wrapper headertext="CaterKart" footer>
        <section className="pageDescSection">
          <header>
            <h1>CREATE YOUR FOOD MENU</h1>
            <p>CHOOSE YOUR FAVORITE DISH AND QUANTITY</p>
            {guestsFromRoute ? <p className="guestCount">For {guestsFromRoute} guests</p> : null}
          </header>
        </section>

        {/* If config is saved & closed, show compact summary */}
        { !showConfigModal && (
          <EventSummary
            dietConfig={dietConfig}
            guestsFromRoute={guestsFromRoute}
            onEdit={() => setShowConfigModal(true)}
          />
        )}

        {/* Config full-page panel (shown when showConfigModal === true) */}
        <ConfigModal
          show={showConfigModal}
          initial={dietConfig}
          guestsFromRoute={guestsFromRoute}
          onClose={() => setShowConfigModal(false)}
          onSave={handleSaveConfig}
        />

        {/* Only render live counters and food selection AFTER the user has saved config */}
        { !showConfigModal && (
          <>
            <LiveCountersSection
              guests={guestsFromRoute}
              liveCounters={selectedLiveCounters}
              onUpdate={handleUpdateLiveCounter}
            />

            {/* NEW: Selected meal type banner (if passed via navigation) */}
            {mealTypeDisplay && (
              <div className="selectedMealType" role="status" aria-live="polite">
                <div className="selectedMealType__icon" aria-hidden="true">
                  {mealTypeDisplay.iconSrc ? (
                    <img src={mealTypeDisplay.iconSrc} alt="" />
                  ) : (
                    <span className="selectedMealType__emoji">{mealTypeDisplay.mealIcon}</span>
                  )}
                </div>
                <div className="selectedMealType__meta">
                  <div className="selectedMealType__label">{mealTypeDisplay.mealLabel}</div>
                  {mealTypeDisplay.mealDesc ? (
                    <div className="selectedMealType__desc">{mealTypeDisplay.mealDesc}</div>
                  ) : null}
                </div>
              </div>
            )}

            {/* Loading / error UI for menu fetch */}
            {loadingMenu ? (
              <div className="menu-loading card">Loading menu…</div>
            ) : menuError ? (
              <div className="menu-error card">
                <div>Error loading menu: {menuError}</div>
              </div>
            ) : (
              <FoodSelectionSection
                menuItems={menuItems}
                categories={categories}
                guests={guestsFromRoute}
                dietConfig={dietConfig}
                recommendedMenu={recommendedMenu}   // <--- LLM response payload
                onSelectionChange={(selection) => setSelectedMenuSelection(selection)}
              />
            )}
          </>
        )}

        {/* Footer checkout only when config saved (so users can't checkout without config) */}
        { !showConfigModal && (
          <footer
            className={`footer-next ${isCheckoutDisabled ? "disabled" : ""}`}
            onClick={() => {
              if (isCheckoutDisabled) return;
              // use the child-provided selection (fallback to empty Items)
              handleCheckout(hasMenuItems ? selectedMenuSelection : { Items: [] });
            }}
            role="button"
            aria-disabled={isCheckoutDisabled}
          >
            <img src={logowhite} alt="CaterKart Logo" />
            <span>Checkout</span>
          </footer>
        )}
      </Wrapper>
    </>
  );
};

export default CreateMenu;
