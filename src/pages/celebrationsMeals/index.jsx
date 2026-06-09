// src/pages/celebrationsMeals/index.jsx
import React, { useEffect, useState, useMemo, useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Wrapper from "../../components/wrapper";
import ServicesList from "./components/ServicesList";
import AddMealPromo from "./components/AddMealPromo";
import CheckoutFooter from "./components/CheckoutFooter";
import LiveCounterEditorModal from "../create-menu/components/LiveCounterEditorModal";
import "./styles.scss";

const STORAGE_KEY = "celebration-services";

const BUFFET_ICON = "https://cheetah.cherishx.com/uploads/1722240621_original.jpg";
const CATERBOX_ICON = "https://m.media-amazon.com/images/I/71PTKrRHE7L.jpg";

/**
 * Normalize a UI product into the shape checkout / create-menu expects.
 * - configured live counters pass through (flagged)
 * - PDP sub-options are flattened with parent context
 * - everything else keeps a parentTitle for downstream context
 */
const normalizeProductForCheckout = (p) => {
  if (!p) return p;

  if (p.parentTitle && (p.id || p.label || p.title)) return p;

  if (p.isLiveCounter || p.type === "live-counter" || p.baseFee || p.recommendedChoices) {
    return { ...p, isLiveCounter: true };
  }

  if (p.selectedSubOption) {
    const sub = p.selectedSubOption;
    return {
      ...sub,
      parentTitle: p.title || p.parentTitle || null,
      parentImage: p.image || p.parentImage || null,
    };
  }

  return { ...p, parentTitle: p.title || p.parentTitle || null };
};

/** Read the initial product list from navigation state, falling back to localStorage. */
const readInitialProducts = (incoming) => {
  if (Array.isArray(incoming) && incoming.length > 0) return incoming;
  try {
    const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if (Array.isArray(parsed) && parsed.length > 0) return parsed;
  } catch {
    /* ignore malformed cache */
  }
  return [];
};

const CelebrationsMeals = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const nav = location.state || {};

  const [needMeal, setNeedMeal] = useState(Boolean(nav.needMeal));
  const [guests, setGuests] = useState(nav.guests != null ? Number(nav.guests) : null);
  const eventType = nav.eventType ?? null;

  // UI-friendly product objects (for ServicesList) — initialised once, editable.
  const [productsState, setProductsState] = useState(() => readInitialProducts(nav.products));
  const [editingIndex, setEditingIndex] = useState(null);

  // Normalized shape used for persistence + onward navigation.
  const normalizedProducts = useMemo(
    () => productsState.map(normalizeProductForCheckout),
    [productsState]
  );
  const hasProducts = normalizedProducts.length > 0;

  // Keep guests in sync if navigation state changes.
  useEffect(() => {
    if (nav.guests != null) setGuests(Number(nav.guests));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nav.guests]);

  // Scroll to top on entry / route change.
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [location.key]);

  // Persist normalized products so checkout survives a reload.
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(normalizedProducts));
    } catch {
      /* ignore quota errors */
    }
  }, [normalizedProducts]);

  const handleRemove = useCallback((idx) => {
    setProductsState((prev) => prev.filter((_, i) => i !== idx));
  }, []);

  const handleEdit = useCallback((idx) => setEditingIndex(idx), []);

  const handleSaveEdit = useCallback(
    (updated) => {
      setProductsState((prev) => prev.map((p, i) => (i === editingIndex ? updated : p)));
      setEditingIndex(null);
    },
    [editingIndex]
  );

  const editingProduct = editingIndex != null ? productsState[editingIndex] : null;

  const goToMenu = useCallback(
    (extra) =>
      navigate("/create-menu", {
        state: { products: normalizedProducts, guests, needMeal: true, eventType, ...extra },
      }),
    [navigate, normalizedProducts, guests, eventType]
  );

  const handleSelectMealType = useCallback(
    (mealType) => {
      setNeedMeal(true);
      goToMenu({ mealType });
    },
    [goToMenu]
  );

  const checkout = useCallback(() => {
    if (needMeal) {
      goToMenu();
      return;
    }
    navigate("/checkout", {
      state: { products: normalizedProducts, guests, needMeal: false, eventType },
    });
  }, [needMeal, goToMenu, navigate, normalizedProducts, guests, eventType]);

  return (
    <Wrapper headertext="CaterKart" footer>
      <section className="celebration-meal-section">
        {hasProducts && <h3 className="sectionTitle">Selected Services</h3>}

        <ServicesList products={productsState} onRemove={handleRemove} onEdit={handleEdit} />

        <AddMealPromo
          needMeal={needMeal}
          onSelectMealType={handleSelectMealType}
          buffetIconSrc={BUFFET_ICON}
          caterboxIconSrc={CATERBOX_ICON}
        >
          Complete your party with a delicious, customized meal—add it now!
        </AddMealPromo>

        <CheckoutFooter onCheckout={checkout} disabled={!hasProducts} />
      </section>

      {editingProduct && (
        <LiveCounterEditorModal
          product={editingProduct}
          guests={guests}
          onSave={handleSaveEdit}
          onCancel={() => setEditingIndex(null)}
        />
      )}
    </Wrapper>
  );
};

export default CelebrationsMeals;
