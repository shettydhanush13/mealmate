// src/pages/celebrations/CelebrationsMeals.jsx
import React, { useEffect, useState, useMemo, useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Wrapper from "../../../components/wrapper";
import ProductCardMini from "../../../components/celebrationProductCard/mini.jsx";
import logowhite from "../../../assets/logowhite.png";
import Checkbox from "@mui/material/Checkbox";
import "./styles.scss";

/**
 * CelebrationsMeals
 *
 * Responsibilities:
 *  - read incoming route state (products, guests, needMeal, eventType)
 *  - fallback to localStorage for products if route state missing
 *  - DO NOT recompute live-counter extraInfo (keep whatever came in)
 *  - forward the exact `products` payload to create-menu or checkout (including eventType)
 */

const CelebrationsMeals = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // Raw incoming values (may be undefined)
  const incomingProducts = useMemo(() => location?.state?.products, [location]);
  const incomingGuests = useMemo(() => {
    const g = location?.state?.guests;
    return typeof g === "number" ? g : g ? Number(g) : null;
  }, [location]);

  const incomingNeedMeal = useMemo(() => {
    // prefer explicit boolean if provided; otherwise default false
    const nm = location?.state?.needMeal;
    return typeof nm === "boolean" ? nm : false;
  }, [location]);

  const incomingEventType = useMemo(() => location?.state?.eventType ?? null, [location]);

  // local state
  const [needMeal, setNeedMeal] = useState(incomingNeedMeal);
  const [guests, setGuests] = useState(incomingGuests ?? null);

  // productsState: canonical products array that will be forwarded
  const [productsState] = useState(() => {
    // initial lazy derive from incomingProducts or localStorage
    if (Array.isArray(incomingProducts) && incomingProducts.length > 0) {
      return incomingProducts;
    }
    try {
      const raw = localStorage.getItem("celebration-services");
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      // ignore
    }
    return [];
  });

  // Keep local guests in sync if incomingGuests changes after mount
  useEffect(() => {
    if (incomingGuests != null && incomingGuests !== guests) {
      setGuests(incomingGuests);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [incomingGuests]);

  // Persist productsState to localStorage whenever it changes (so back/refresh preserves)
  useEffect(() => {
    try {
      localStorage.setItem("celebration-services", JSON.stringify(productsState));
    } catch (e) {
      // ignore storage errors
    }
  }, [productsState]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  /* -------------------------
     NOTE: Intentionally DO NOT recompute any extraInfo here.
     We preserve whatever the previous page sent us in `incomingProducts`
     (or the saved localStorage fallback). This component only forwards
     the canonical productsState to next routes.
  ------------------------- */

  /* -------------------------
     Auto-navigation when needMeal toggles true (keeps original small delay behavior)
  ------------------------- */
  useEffect(() => {
    if (!needMeal) return undefined;

    const tid = setTimeout(() => {
      const state = {
        products: productsState,
        guests,
        needMeal: true,
        eventType: incomingEventType,
      };

      navigate("/celebrations/create-menu", { state });
    }, 900);

    return () => clearTimeout(tid);
  }, [needMeal, navigate, productsState, guests, incomingEventType]);

  // Controlled checkbox handler (MUI signature: (event, checked))
  const handleCheckboxChange = useCallback((event, checked) => {
    if (typeof checked === "boolean") {
      setNeedMeal(Boolean(checked));
    } else {
      setNeedMeal((v) => !v);
    }
  }, []);

  // Checkout: forward processed products + guests + needMeal flag + eventType
  const checkout = useCallback(() => {

    console.log(productsState);
    if (needMeal) {
      navigate("/celebrations/create-menu", {
        state: {
          products: productsState,
          guests,
          needMeal: true,
          eventType: incomingEventType,
        },
      });
      return;
    }

    navigate("/celebrations/checkout", {
      state: {
        products: productsState,
        guests,
        needMeal: false,
        eventType: incomingEventType,
      },
    });
  }, [navigate, productsState, guests, needMeal, incomingEventType]);

  // Ensure we scroll to top on mount
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <Wrapper headertext="CaterKart" footer={true}>
      <section className="celebration-meal-section">
        <h3 className="sectionTitle">Selected Services</h3>

        <section className="optionsContainerMeal" aria-live="polite">
          {productsState.length > 0 ? (
            productsState.map((product, idx) => (
              <ProductCardMini key={`${product.title ?? "prod"}-${idx}`} product={product} />
            ))
          ) : (
            <div className="emptyState">No services selected.</div>
          )}
        </section>

        <section className="addMealSection" aria-label="Add meal promotion">
          {(productsState.length < 4) && (
            <img
              src="https://www.shutterstock.com/image-vector/hotel-buffet-dining-table-smorgasbord-600nw-2418740701.jpg"
              alt=""
            />
          )}
          <p>Complete your party with a delicious, customized meal—add it now!</p>

          <section className="needMealSection">
            <Checkbox
              checked={needMeal}
              onChange={handleCheckboxChange}
              inputProps={{ "aria-label": "Add Meal to My Celebration" }}
            />
            <p className="key">Add Meal to My Celebration.</p>
          </section>
        </section>

        <footer
          className="footer-next"
          onClick={checkout}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              checkout();
            }
          }}
          aria-label="Checkout"
        >
          <img src={logowhite} alt="CaterKart" />
          <span>Checkout</span>
        </footer>
      </section>
    </Wrapper>
  );
};

export default CelebrationsMeals;
