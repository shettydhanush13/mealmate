// src/pages/celebration-pages/celebrations/index.jsx
import React, { useState, useMemo, useCallback, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Helmet } from "react-helmet";
import Wrapper from "../../components/wrapper";
import LiveCountersSection from "../create-menu/components/LiveCountersSection.jsx";
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
  const [selectedItems, setSelectedItems] = useState([]);
  const [selectedItemsObj, setSelectedItemsObj] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(eventTypeOptions[0]);
  const [guests, setGuests] = useState(30);
  const [errors, setErrors] = useState({});

  const [liveModalOpen, setLiveModalOpen] = useState(false);
  const [liveModalProduct, setLiveModalProduct] = useState(null);

  const steps = useMemo(() => getCelebrationStepsFor(selectedEvent), [selectedEvent]);

  const onGuestsChange = useCallback((e) => {
    const raw = e.target.value;
    const normalized = raw === "" ? "" : Number(raw);
    setGuests(normalized);
    setErrors((prev) => ({ ...prev, guests: validateGuests(normalized) }));
  }, []);

  const onProductClicked = useCallback(
    (product) => {
      const alreadySelected = selectedItems.includes(product.title);
      if (alreadySelected) {
        setSelectedItems((prev) => prev.filter((t) => t !== product.title));
        setSelectedItemsObj((prev) => prev.filter((o) => o.title !== product.title));
        return;
      }

      if (isLiveCounter(product)) {
        setLiveModalProduct(product);
        setLiveModalOpen(true);
        return;
      }

      const productClone = { ...product };
      setSelectedItems((prev) => [...prev, productClone.title]);
      setSelectedItemsObj((prev) => [...prev, productClone]);
    },
    [selectedItems]
  );

  const handleSaveLiveCounter = useCallback((configuredProduct) => {
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

    const finalProducts = (selectedItemsObj || []).map((p) => ({
      ...p,
      isLiveCounter: isLiveCounter(p.title),
    }));

    const state = {
      products: finalProducts,
      guests: Number(guests),
      eventType: selectedEvent,
    };

    navigate("/add-meal", { state });
  }, [guests, selectedItemsObj, selectedEvent, navigate]);

  const isFooterDisabled = !!validateGuests(guests);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    const t = setTimeout(() => {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }, 60);
    return () => clearTimeout(t);
  }, [location.key, location.pathname]);

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

            <LiveCountersSection
              guests={guests}
              liveCounters={selectedItemsObj.filter((p) => p.isLiveCounter)}
              onUpdate={handleSaveLiveCounter}
            />

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
