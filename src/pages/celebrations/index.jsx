// src/pages/celebration-pages/celebrations/index.jsx
import React, { useState, useMemo, useCallback, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Helmet } from "react-helmet";
import Wrapper from "../../components/wrapper";
import LiveCounterEditorModal from "../create-menu/components/LiveCounterEditorModal.jsx";

import PageHeader from "./components/PageHeader";
import EventTypeGrid from "./components/EventTypeGrid";
import GuestsCard from "./components/GuestsCard";
import ServicesAccordion from "./components/ServicesAccordion";

import { getCelebrationStepsFor, eventTypeOptions, isLiveCounter } from "../../data/celebrationsData";

import "./styles.scss"; // main page-level styles (keeps global layout rules)

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

const Celebrations = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [selectedItems, setSelectedItems] = useState([]); // array of titles for quick lookup
  const [selectedItemsObj, setSelectedItemsObj] = useState([]); // full product objects (including configured live counters)
  const [selectedEvent, setSelectedEvent] = useState(eventTypeOptions[0]);
  const [guests, setGuests] = useState(30);
  const [errors, setErrors] = useState({});

  const [liveModalOpen, setLiveModalOpen] = useState(false);
  const [liveModalProduct, setLiveModalProduct] = useState(null);

  const steps = useMemo(() => getCelebrationStepsFor(selectedEvent), [selectedEvent]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    const t = setTimeout(() => {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }, 60);
    return () => clearTimeout(t);
  }, [location.key, location.pathname]);

  const onGuestsChange = useCallback((e) => {
    const raw = e.target.value;
    const normalized = raw === "" ? "" : Number(raw);
    setGuests(normalized);
    setErrors((prev) => ({ ...prev, guests: validateGuests(normalized) }));
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

  const addMeals = useCallback(() => {
    const gErr = validateGuests(guests);
    if (gErr) {
      setErrors({ guests: gErr });
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    // Finalize products: for live counters we already stored configured extraInfo in selectedItemsObj
    const finalProducts = (selectedItemsObj || []).map((p) => ({
      ...p,
      isLiveCounter: isLiveCounter(p),
    }));

    const state = {
      products: finalProducts,
      guests: Number(guests),
      eventType: selectedEvent,
    };

    navigate("/add-meal", { state });
  }, [guests, selectedItemsObj, selectedEvent, navigate]);

  const isFooterDisabled = !!validateGuests(guests);

  return (
    <>
      <Helmet>
        <title>Create a Celebration | CaterKart</title>
        <meta
          name="description"
          content="Plan your perfect event with CaterKart! Choose from live counters, props and more."
        />
        <link rel="canonical" href="https://caterkart.in/celebrations" />
      </Helmet>

      <Wrapper headerLeftType="home" headertext="CaterKart" footer>
        <main className="celebrations-page">
          <PageHeader />
          <section className="celebrations-section">
            <h3 className="subSectionTitle">Pick Your Event Type</h3>

            <EventTypeGrid
              selectedEvent={selectedEvent}
              onSelect={setSelectedEvent}
            />

            <GuestsCard guests={guests} onChange={onGuestsChange} error={errors.guests} />

            <ServicesAccordion
              steps={steps}
              selectedItems={selectedItems}
              onProductClicked={onProductClicked}
            />

            {/* NOTE: intentionally NOT rendering LiveCountersSection so selected live counters are not shown */}

            <footer
              className={`footer-next ${isFooterDisabled ? "disabled" : ""}`}
              onClick={() => { if (!isFooterDisabled) addMeals(); }}
              role="button"
              aria-disabled={isFooterDisabled}
            >
              <span>Add Meal And Checkout</span>
            </footer>
          </section>
        </main>
      </Wrapper>
{console.log({ liveModalOpen, liveModalProduct})}
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
