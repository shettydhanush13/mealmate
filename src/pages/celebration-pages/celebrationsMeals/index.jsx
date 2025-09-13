// src/pages/celebrations/CelebrationsMeals.jsx
import React, { useEffect, useState, useMemo, useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Wrapper from "../../../components/wrapper";
import ProductCardMini from "../../../components/celebrationProductCard/mini.jsx";
import logowhite from "../../../assets/logowhite.png";
import Checkbox from "@mui/material/Checkbox";
import "./styles.scss";

const CelebrationsMeals = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // read values passed from previous route (safe defaults)
  const products = useMemo(() => location?.state?.products || [], [location]);
  const guestsFromRoute = useMemo(() => {
    const g = location?.state?.guests;
    // ensure numeric or null
    return typeof g === "number" ? g : g ? Number(g) : null;
  }, [location]);

  const [needMeal, setNeedMeal] = useState(false);

  // when needMeal toggles true, navigate to create-menu after a small delay
  useEffect(() => {
    if (!needMeal) return undefined;

    const tid = setTimeout(() => {
      navigate("/celebrations/create-menu", {
        state: {
          products,
          guests: guestsFromRoute,
        },
      });
    }, 900); // keep small delay like original

    return () => clearTimeout(tid);
  }, [needMeal, navigate, products, guestsFromRoute]);

  // initial mount: scroll to top and save services to localStorage (keeps previous behavior)
  useEffect(() => {
    window.scrollTo(0, 0);

    try {
      localStorage.setItem("celebration-services", JSON.stringify(products));
    } catch (err) {
      // fail silently if localStorage blocked
      // eslint-disable-next-line no-console
      console.warn("Could not save celebration-services to localStorage", err);
    }
  }, [products]);

  // Controlled checkbox handler (MUI signature: (event, checked))
  const handleCheckboxChange = useCallback((event, checked) => {
    if (typeof checked === "boolean") {
      setNeedMeal(Boolean(checked));
    } else {
      // fallback
      setNeedMeal((v) => !v);
    }
  }, []);

  const checkout = useCallback(() => {
    navigate("/celebrations/checkout", {
      state: { products, guests: guestsFromRoute },
    });
  }, [navigate, products, guestsFromRoute]);

  return (
    <Wrapper headertext="CaterKart" footer={true}>
      <section className="celebration-meal-section">
        <h3 className="sectionTitle">Selected Services</h3>

        <section className="optionsContainerMeal" aria-live="polite">
          {products.length > 0 ? (
            products.map((product, idx) => (
              <ProductCardMini key={`${product.title ?? "prod"}-${idx}`} product={product} />
            ))
          ) : (
            <div className="emptyState">No services selected.</div>
          )}
        </section>

        <section className="addMealSection" aria-label="Add meal promotion">
          {(products.length < 7) && (
            <img
              src="https://www.shutterstock.com/image-vector/hotel-buffet-dining-table-smorgasbord-600nw-2418740701.jpg"
              alt=""
            />
          )}
          <p>Complete your party with a delicious, customized meal—add it now!</p>

          <section
            className="needMealSection"
            /* removed parent onClick/onKeyDown to avoid double-toggle issues */
          >
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
