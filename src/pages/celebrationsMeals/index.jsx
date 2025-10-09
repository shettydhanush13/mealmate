// src/pages/celebration-pages/celebrations/CelebrationsMeals.jsx
import React, { useEffect, useState, useMemo, useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Wrapper from "../../components/wrapper";
import ServicesList from "./components/ServicesList";
import AddMealPromo from "./components/AddMealPromo";
import CheckoutFooter from "./components/CheckoutFooter";
import "./styles.scss";

/**
 * CelebrationsMeals (refactored)
 * Uses direct class names and plain scss imports (no CSS modules).
 *
 * This version normalizes products before persisting / passing to checkout:
 * - If product has `selectedSubOption` -> pass that sub-option object with
 *   { ...subOption, parentTitle, parentImage }.
 * - If product.isLiveCounter (configured live counter) -> pass as-is.
 * - Otherwise pass the product object itself.
 */

const STORAGE_KEY = "celebration-services";

const normalizeProductForCheckout = (p) => {
  if (!p) return p;

  // If already looks like a normalized suboption (has parentTitle) — leave it as-is
  if (p.parentTitle && (p.id || p.label || p.title)) {
    return p;
  }

  // Live counter / configured items should be passed through
  if (p.isLiveCounter || p.type === "live-counter" || p.baseFee || p.recommendedChoices) {
    return { ...p, isLiveCounter: true };
  }

  // If product contains a selectedSubOption (from PDP), return that sub-option with context
  if (p.selectedSubOption) {
    const sub = p.selectedSubOption;
    return {
      ...sub,
      parentTitle: p.title || p.parentTitle || null,
      parentImage: p.image || p.parentImage || null,
    };
  }

  // Fallback — if no special shape, try to return a compact representation
  // Keep parentTitle to ensure downstream has context
  return {
    ...p,
    parentTitle: p.title || p.parentTitle || null,
  };
};

const CelebrationsMeals = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const incomingProducts = useMemo(() => location?.state?.products, [location]);
  const incomingGuests = useMemo(() => {
    const g = location?.state?.guests;
    return typeof g === "number" ? g : g ? Number(g) : null;
  }, [location]);
  const incomingNeedMeal = useMemo(() => {
    const nm = location?.state?.needMeal;
    return typeof nm === "boolean" ? nm : false;
  }, [location]);
  const incomingEventType = useMemo(() => location?.state?.eventType ?? null, [location]);

  const [needMeal, setNeedMeal] = useState(incomingNeedMeal);
  const [guests, setGuests] = useState(incomingGuests ?? null);

  // productsState keeps the original objects for UI (ServicesList) — incoming or from localStorage
  const [productsState] = useState(() => {
    if (Array.isArray(incomingProducts) && incomingProducts.length > 0) return incomingProducts;
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      // ignore parse errors
    }
    return [];
  });

  // Derived normalizedProducts — used for persistence and for navigation (checkout/create-menu)
  const normalizedProducts = useMemo(() => {
    if (!Array.isArray(productsState)) return [];
    return productsState.map((p) => normalizeProductForCheckout(p));
  }, [productsState]);

  useEffect(() => {
    if (incomingGuests != null && incomingGuests !== guests) {
      setGuests(incomingGuests);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [incomingGuests]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    const t = setTimeout(() => {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }, 60);
    return () => clearTimeout(t);
  }, [location.key, location.pathname]);

  // Persist normalized representation (so checkout receives the normalized shape even after reload)
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(normalizedProducts));
    } catch (e) {
      // ignore quota errors
    }
  }, [normalizedProducts]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // NOTE:
  // Previously there was an effect which auto-navigated when `needMeal` became true.
  // That auto-navigation has been removed to avoid double navigation - selecting a meal
  // type now triggers navigation directly via onSelectMealType handler passed to AddMealPromo.

  const handleToggleNeedMeal = useCallback((v) => {
    setNeedMeal(Boolean(v));
  }, []);

  // New: called when the user selects a meal type in AddMealPromo
  const handleSelectMealType = useCallback(
    (mealType) => {
      // ensure normalizedProducts and other state are captured
      navigate("/create-menu", {
        state: {
          products: normalizedProducts,
          guests,
          needMeal: true,
          eventType: incomingEventType,
          mealType, // <-- new: pass selected meal type
        },
      });
    },
    [navigate, normalizedProducts, guests, incomingEventType]
  );

  const checkout = useCallback(() => {
    if (needMeal) {
      // If user indicated they want meals via checkout flow but did not choose a specific mealType,
      // navigate to create-menu without explicit mealType (legacy flow).
      navigate("/create-menu", {
        state: {
          products: normalizedProducts,
          guests,
          needMeal: true,
          eventType: incomingEventType,
        },
      });
      return;
    }

    navigate("/checkout", {
      state: {
        products: normalizedProducts,
        guests,
        needMeal: false,
        eventType: incomingEventType,
      },
    });
  }, [navigate, normalizedProducts, guests, needMeal, incomingEventType]);

  return (
    <Wrapper headertext="CaterKart" footer={true}>
      <section className="celebration-meal-section">
        {normalizedProducts.length ? <h3 className="sectionTitle">Selected Services</h3> : <></>}

        {/* ServicesList expects the UI-friendly product objects; we pass the original productsState */}
        <ServicesList products={productsState} />

        <div className="spacer-bottom" />

        <AddMealPromo
          needMeal={needMeal}
          onToggleNeedMeal={handleToggleNeedMeal}
          onSelectMealType={handleSelectMealType} // <-- wired so selection navigates with mealType
          buffetIconSrc="https://cheetah.cherishx.com/uploads/1722240621_original.jpg"
          caterboxIconSrc="https://m.media-amazon.com/images/I/71PTKrRHE7L.jpg"
        >
          Complete your party with a delicious, customized meal—add it now!
        </AddMealPromo>

        <CheckoutFooter onCheckout={checkout} disabled={normalizedProducts.length === 0} />
      </section>
    </Wrapper>
  );
};

export default CelebrationsMeals;
