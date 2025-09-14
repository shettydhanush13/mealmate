// src/pages/create-menu/CreateMenu.jsx
import React, { useEffect, useState, useMemo, useCallback } from "react";
import { Helmet } from "react-helmet";
import { useNavigate, useLocation } from "react-router-dom";
import Wrapper from "../../components/wrapper";
import logowhite from "../../assets/logowhite.png";
import { menuItems, categories } from "../../data/items";
import { getPricing } from "../../utils/util";
import ConfigModal from "./components/ConfigModal";
import LiveCountersSection from "./components/LiveCountersSection";
import FoodSelectionSection from "./components/FoodSelectionSection";
import "./styles.scss";

const availableCuisines = [
  "Indian","Chinese","Continental","South Indian","Italian","Mexican","Middle Eastern",
];

const CreateMenu = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // incoming values
  const guestsFromRoute = useMemo(() => {
    const g = location?.state?.guests;
    return typeof g === "number" ? g : g ? Number(g) : null;
  }, [location]);

  const incomingServices = useMemo(() => location?.state?.products || [], [location]);

  // local canonical services state (includes live counters and props)
  const [servicesState, setServicesState] = useState(() => Array.isArray(incomingServices) ? incomingServices : []);

  // show config modal initially
  const [showConfigModal, setShowConfigModal] = useState(true);

  // diet config state (kept local here; ConfigModal will update and return)
  const [dietConfig, setDietConfig] = useState({
    dietMode: "veg+nonveg",
    vegGuests: "",
    nonVegGuests: "",
    kidsCount: "",
    cuisinePrefs: [],
    eventTime: "",
  });

  // helpers copied from your previous file — small and pure
  const isLiveCounter = useCallback((title) => {
    if (!title || typeof title !== "string") return false;
    const re = /(live\b|bbq|momo|mocktail|turkish|pizza|chats|chat|pani?puri|ice\s*cream)/i;
    return re.test(title);
  }, []);

  const perGuestRatioForProduct = useCallback((product) => {
    if (product && typeof product.servingsPerGuest === "number") return product.servingsPerGuest;
    const t = (product && product.title ? product.title.toLowerCase() : "");
    if (/pizza/.test(t)) return 1 / 6;
    if (/momo/.test(t)) return 1 / 3;
    if (/bbq/.test(t)) return 1 / 4;
    if (/chat|pani?puri|chats/.test(t)) return 1 / 2;
    if (/ice\s*cream|turkish/.test(t)) return 1 / 3;
    if (/mocktail/.test(t)) return 1 / 2;
    return 1 / 4;
  }, []);

  const computePlatesFromGuests = useCallback((product, g) => {
    // prefer explicit extraInfo.plates if product includes it (i.e., previously user-edited)
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
    return (servicesState || []).filter(s => isLiveCounter(s.title)).map(p => ({
      ...p,
      breakdown: buildBreakdownForProduct(p, guestsFromRoute),
    }));
  }, [servicesState, isLiveCounter, buildBreakdownForProduct, guestsFromRoute]);

  // update one live counter when user edits it (from LiveCountersSection)
  const handleUpdateLiveCounter = useCallback((updatedProduct) => {
    setServicesState((prev) => {
      // update matching product by title
      const out = prev.map(p => (p.title === updatedProduct.title ? { ...updatedProduct } : p));
      // if not found (rare) add it
      if (!out.some(p => p.title === updatedProduct.title)) out.push(updatedProduct);
      return out;
    });
  }, []);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Food-selection state is kept inside FoodSelectionSection, but we keep the checkout handler here
  const handleCheckout = useCallback((menuSelectionPayload) => {
    // Compose final payload: servicesState (with live counter extraInfo), guestsFromRoute, and selected menu
    const totalPrice = getPricing(menuSelectionPayload);
    // navigate to real checkout
    navigate("/checkout", {
      state: {
        totalPrice,
        selectedItems: menuSelectionPayload,
        guests: guestsFromRoute,
        services: servicesState,
        dietConfig,
      },
    });
  }, [navigate, guestsFromRoute, servicesState, dietConfig]);

  // persist services state in localStorage so back/refresh keeps selection
  useEffect(() => {
    try {
      localStorage.setItem("celebration-services", JSON.stringify(servicesState));
    } catch (e) { /* ignore */ }
  }, [servicesState]);

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

        {/* Config summary / modal */}
        { !showConfigModal && (
          <div style={{ padding: "0 8px 8px 8px" }}>
            <div className="configSummary compact">
              <div className="summaryPills">
                <span className="pill">{dietConfig.dietMode === "veg-only" ? "Veg only" : "Veg + Non-Veg"}</span>
                <span className="pill">Veg: {dietConfig.vegGuests || "-"}</span>
                <span className="pill">Non-veg: {dietConfig.dietMode === "veg-only" ? 0 : (dietConfig.nonVegGuests || "-")}</span>
                <span className="pill">Kids: {dietConfig.kidsCount || "-"}</span>
              </div>
              <div className="summaryActions">
                <button className="btn btn-outline" onClick={() => setShowConfigModal(true)}>Edit</button>
              </div>
            </div>
          </div>
        )}

        {/* Live counters section */}
        <LiveCountersSection
          guests={guestsFromRoute}
          liveCounters={selectedLiveCounters}
          onUpdate={handleUpdateLiveCounter}
        />

        {/* Food selection section */}
        <FoodSelectionSection
          menuItems={menuItems}
          categories={categories}
          guests={guestsFromRoute}
          onCheckout={handleCheckout}
        />

        <footer className="footer-next" onClick={() => {
          // quick fallback - empty menu => checkout with empty selection
          handleCheckout({ Items: [] });
        }}>
          <img src={logowhite} alt="CaterKart Logo" />
          <span>Checkout</span>
        </footer>
      </Wrapper>

      {/* Config modal */}
      <ConfigModal
        show={showConfigModal}
        initial={dietConfig}
        guestsFromRoute={guestsFromRoute}
        onClose={() => setShowConfigModal(false)}
        onSave={(cfg) => {
          setDietConfig(cfg);
          setShowConfigModal(false);
        }}
        availableCuisines={availableCuisines}
      />
    </>
  );
};

export default CreateMenu;
