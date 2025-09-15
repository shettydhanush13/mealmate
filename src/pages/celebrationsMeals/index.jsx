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
 */

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

  const [productsState] = useState(() => {
    if (Array.isArray(incomingProducts) && incomingProducts.length > 0) return incomingProducts;
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

  useEffect(() => {
    if (incomingGuests != null && incomingGuests !== guests) {
      setGuests(incomingGuests);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [incomingGuests]);

  useEffect(() => {
    try {
      localStorage.setItem("celebration-services", JSON.stringify(productsState));
    } catch (e) {
      // ignore
    }
  }, [productsState]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    if (!needMeal) return undefined;
    const tid = setTimeout(() => {
      navigate("/create-menu", {
        state: {
          products: productsState,
          guests,
          needMeal: true,
          eventType: incomingEventType,
        },
      });
    }, 900);
    return () => clearTimeout(tid);
  }, [needMeal, navigate, productsState, guests, incomingEventType]);

  const handleToggleNeedMeal = useCallback((v) => {
    setNeedMeal(Boolean(v));
  }, []);

  const checkout = useCallback(() => {
    if (needMeal) {
      navigate("/create-menu", {
        state: {
          products: productsState,
          guests,
          needMeal: true,
          eventType: incomingEventType,
        },
      });
      return;
    }

    navigate("/checkout", {
      state: {
        products: productsState,
        guests,
        needMeal: false,
        eventType: incomingEventType,
      },
    });
  }, [navigate, productsState, guests, needMeal, incomingEventType]);

  return (
    <Wrapper headertext="CaterKart" footer={true}>
      <section className="celebration-meal-section">
        {productsState.length ? <h3 className="sectionTitle">Selected Services</h3> : <></>}

        <ServicesList products={productsState} />

        <div className="spacer-bottom" />

        <AddMealPromo
          productsCount={productsState.length}
          needMeal={needMeal}
          onToggleNeedMeal={handleToggleNeedMeal}
          imageSrc="https://www.shutterstock.com/image-vector/hotel-buffet-dining-table-smorgasbord-600nw-2418740701.jpg"
        >
          Complete your party with a delicious, customized meal—add it now!
        </AddMealPromo>

        <CheckoutFooter onCheckout={checkout} disabled={productsState.length === 0} />
      </section>
    </Wrapper>
  );
};

export default CelebrationsMeals;
