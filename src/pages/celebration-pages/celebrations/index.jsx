// src/pages/celebration-pages/celebrations/index.jsx
import React, { useState, useMemo, useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet";
import Wrapper from "../../../components/wrapper";
import ProductCard from "../../../components/celebrationProductCard";
import Accordion from "@mui/material/Accordion";
import AccordionDetails from "@mui/material/AccordionDetails";
import AccordionSummary from "@mui/material/AccordionSummary";
import { getCelebrationStepsFor, eventTypeOptions } from "../../../data/celebrationsData";
import { FaArrowDown } from "react-icons/fa";
import LiveCountersSection from "../../create-menu/components/LiveCountersSection.jsx";
import LiveCounterEditorModal from "../../create-menu/components/LiveCounterEditorModal.jsx";
import "./styles.scss";

/* ------------------------
   Guest count validator
   ------------------------ */
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

  /* ------------------------
     Local state
     ------------------------ */
  const [selectedItems, setSelectedItems] = useState([]);
  const [selectedItemsObj, setSelectedItemsObj] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(eventTypeOptions[0]);

  const [guests, setGuests] = useState(30);
  const [errors, setErrors] = useState({});

  // Live counter modal state (reused for add/edit)
  const [liveModalOpen, setLiveModalOpen] = useState(false);
  const [liveModalProduct, setLiveModalProduct] = useState(null);

  // Steps for current event
  const steps = useMemo(() => getCelebrationStepsFor(selectedEvent), [selectedEvent]);

  /* ------------------------
     Utils
     ------------------------ */
  const isLiveCounter = useCallback((title) => {
    if (!title || typeof title !== "string") return false;
    const re = /(live\b|bbq|momo|mocktail|turkish|pizza|chats|chat|pani?puri|ice\s*cream)/i;
    return re.test(title);
  }, []);

  /* ------------------------
     Handlers
     ------------------------ */

  // guests input
  const onGuestsChange = useCallback((e) => {
    const raw = e.target.value;
    const normalized = raw === "" ? "" : Number(raw);
    setGuests(normalized);
    setErrors((prev) => ({ ...prev, guests: validateGuests(normalized) }));
  }, []);

  // toggle product add/remove
  const onProductClicked = useCallback(
    (product) => {
      const alreadySelected = selectedItems.includes(product.title);
      if (alreadySelected) {
        setSelectedItems((prev) => prev.filter((t) => t !== product.title));
        setSelectedItemsObj((prev) => prev.filter((o) => o.title !== product.title));
        return;
      }

      // If it's a live counter → open modal for configuration
      if (isLiveCounter(product.title)) {
        setLiveModalProduct(product);
        setLiveModalOpen(true);
        return;
      }

      // Otherwise simple add
      const productClone = { ...product };
      setSelectedItems((prev) => [...prev, productClone.title]);
      setSelectedItemsObj((prev) => [...prev, productClone]);
    },
    [isLiveCounter, selectedItems]
  );

  // save from modal
  const handleSaveLiveCounter = (configuredProduct) => {
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
  };

  // cancel modal
  const handleCancelLiveCounter = () => {
    setLiveModalOpen(false);
    setLiveModalProduct(null);
  };

  // final CTA
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

    console.log("Final celebration payload:", state);

    navigate("/celebrations/add-meal", { state });
  }, [guests, selectedItemsObj, selectedEvent, navigate, isLiveCounter]);

  const isFooterDisabled = !!validateGuests(guests);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  /* ------------------------
     Render
     ------------------------ */
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

      <Wrapper headerLeftType="home" headertext="CaterKart" footer={true}>
        {/* Page description */}
        <section className="pageDescSection">
          <header>
            <h1>CREATE A CELEBRATION</h1>
            <p>PICK YOUR EVENT TYPE AND REQUIRED SERVICES</p>
          </header>
        </section>

        <section className="celebrations-section">
          {/* Event type */}
          <h3 className="subSectionTitle">Pick Your Event Type</h3>
          <section className="optionsContainer">
            {eventTypeOptions.map((event) => (
              <p
                key={event}
                className={
                  selectedEvent === event ? "eventType active-event-type" : "eventType"
                }
                onClick={() => setSelectedEvent(event)}
              >
                {event}
              </p>
            ))}
          </section>

          {/* Guest count */}
          <section className="eventDetailsContainer">
            <div className="guests-card">
              <label className="guests-label">Number of Guests</label>
              <input
                type="number"
                min="30"
                max="500"
                value={guests}
                onChange={onGuestsChange}
                className="input"
              />
              {errors.guests && <div className="errorText">{errors.guests}</div>}
              <div className="guests-helper">Minimum 30 – Maximum 500 guests</div>
            </div>
          </section>

          {/* Services */}
          <h3 className="subSectionTitle">Add Services</h3>
          {steps.map((step) => (
            <Accordion key={step.icon} className="accordion">
              <AccordionSummary expandIcon={<FaArrowDown />}>
                <div className={`icon ${step.color}`}>{step.icon}</div>
                <h5>{step.text}</h5>
              </AccordionSummary>
              <AccordionDetails>
                <section className="optionsContainer">
                  {step.options.map((option) => (
                    <ProductCard
                      key={option.title}
                      product={option}
                      selected={selectedItems.includes(option.title)}
                      productAdded={() => onProductClicked(option)}
                      displaySubOptions="modal"
                    />
                  ))}
                </section>
              </AccordionDetails>
            </Accordion>
          ))}

          {/* Live counters section (selected + editable) */}
          <LiveCountersSection
            guests={guests}
            liveCounters={selectedItemsObj.filter((p) => p.isLiveCounter)}
            onUpdate={handleSaveLiveCounter}
          />

          {/* CTA footer */}
          <footer
            className={`footer-next ${isFooterDisabled ? "disabled" : ""}`}
            onClick={() => {
              if (!isFooterDisabled) addMeals();
            }}
            role="button"
            aria-disabled={isFooterDisabled}
          >
            <span>Add Meal And Checkout</span>
          </footer>
        </section>
      </Wrapper>

      {/* Reusable modal */}
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
