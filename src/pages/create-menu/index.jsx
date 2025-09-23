// src/pages/create-menu/CreateMenu.jsx
import React, { useEffect, useState, useMemo, useCallback } from "react";
import { Helmet } from "react-helmet";
import { useNavigate, useLocation } from "react-router-dom";
import Wrapper from "../../components/wrapper";
import logowhite from "../../assets/logowhite.png";
import { menuItems, categories } from "../../data/food/items";
import { isLiveCounter } from "../../data/services/celebrationsData";
import { getPricing } from "../../utils/util";
import ConfigModal from "./components/ConfigModal"; // now a full page config component
import LiveCountersSection from "./components/LiveCountersSection";
import FoodSelectionSection from "./components/FoodSelectionSection";
import EventSummary from "./components/EventSummary"; // add to top imports
import "./styles.scss";

const CONFIG_KEY = "celebration-config";

const CreateMenu = () => {
  const navigate = useNavigate();
  const location = useLocation();

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
  // const recommendedMenu = { "Items" : [
  //   { name: "Mint Lime", quantity: 50, pricePerItem: 45 },
  //   { name: "Gobi Manchurian", quantity: 80, pricePerItem: 140 },
  //   { name: "Paneer Manchurian", quantity: 70, pricePerItem: 180 },
  //   { name: "Honey Chilli Potato", quantity: 50, pricePerItem: 120 },

  //   { name: "Paneer Butter Masala", quantity: 30, pricePerItem: 260 },
  //   { name: "Dal Tadka", quantity: 30, pricePerItem: 190 },
  //   { name: "Kadai Paneer", quantity: 30, pricePerItem: 270 },
  //   { name: "Butter Naan", quantity: 100, pricePerItem: 55 },

  //   { name: "Veg Biryani", quantity: 30, pricePerItem: 180 },

  //   { name: "Kosumbari", quantity: 50, pricePerItem: 30 },
  //   { name: "Green Salad", quantity: 50, pricePerItem: 60 },
  //   { name: "Curd Rice", quantity: 30, pricePerItem: 60 },
  //   { name: "Rasam", quantity: 50, pricePerItem: 60 },

  //   { name: "Gulab Jamun", quantity: 75, pricePerItem: 22 },
  //   { name: "Ras Malai", quantity: 50, pricePerItem: 40 }
  // ]};
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
      eventTime: '',
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

  // Save config both locally (state) and to localStorage
  const handleSaveConfig = useCallback((cfg) => {
    setDietConfig(cfg);
    try {
      localStorage.setItem(CONFIG_KEY, JSON.stringify(cfg));
    } catch (e) { /* ignore */ }
    setShowConfigModal(false);
  }, []);

  // handle checkout (menuSelectionPayload format unchanged)
  const handleCheckout = useCallback((menuSelectionPayload) => {
    // Compose final payload: servicesState (with live counter extraInfo), guestsFromRoute, selected menu
    const totalPrice = getPricing(menuSelectionPayload);
    // navigate to real checkout — include persisted/saved dietConfig in state
    navigate("/checkout", {
      state: {
        totalPrice,
        selectedItems: menuSelectionPayload,
        guests: guestsFromRoute,
        services: servicesState,
        dietConfig, // pass the saved config (persisted or newly saved)
      },
    });
  }, [navigate, guestsFromRoute, servicesState, dietConfig]);

  // ----------------------------
  // NEW: determine if checkout should be enabled
  // ----------------------------
  const hasMenuItems = Boolean(selectedMenuSelection && Array.isArray(selectedMenuSelection.Items) && selectedMenuSelection.Items.length > 0);
  const hasServices = Boolean(servicesState && Array.isArray(servicesState) && servicesState.length > 0);
  const isCheckoutDisabled = !hasMenuItems && !hasServices;

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

            <FoodSelectionSection
              menuItems={menuItems}
              categories={categories}
              guests={guestsFromRoute}
              dietConfig={dietConfig}
              recommendedMenu={recommendedMenu}   // <--- LLM response payload
              onSelectionChange={(selection) => setSelectedMenuSelection(selection)}
            />
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
