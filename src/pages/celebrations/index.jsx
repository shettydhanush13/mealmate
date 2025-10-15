// src/pages/celebration-pages/celebrations/index.jsx
import React, { useState, useCallback, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Helmet } from "react-helmet";
import Wrapper from "../../components/wrapper";
import LiveCounterEditorModal from "../create-menu/components/LiveCounterEditorModal.jsx";

import PageHeader from "./components/PageHeader";
import EventTypeGrid from "./components/EventTypeGrid";
import GuestsCard from "./components/GuestsCard";
import ServicesAccordion from "./components/ServicesAccordion";

import { eventTypeOptions, isLiveCounter } from "../../data/services/celebrationsData";
import { fetchServicesByEvent } from '../../services/services';

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

const validatePincode = (value) => {
  // Indian pincode: 6 digits. Accept string or number.
  if (value === "" || value === null || value === undefined) return "Please enter your pincode.";
  const s = String(value).trim();
  if (!/^\d{6}$/.test(s)) return "Pincode must be a 6-digit number.";
  return "";
};

const Celebrations = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [selectedItems, setSelectedItems] = useState([]); // array of titles for quick lookup
  const [selectedItemsObj, setSelectedItemsObj] = useState([]); // full product objects (including configured live counters)
  const [selectedEvent, setSelectedEvent] = useState(eventTypeOptions[0]);
  const [guests, setGuests] = useState(50);
  const [pincode, setPincode] = useState("");
  const [errors, setErrors] = useState({});

  const [liveModalOpen, setLiveModalOpen] = useState(false);
  const [liveModalProduct, setLiveModalProduct] = useState(null);

  // New: steps + loading + error state
  const [steps, setSteps] = useState([]);
  const [stepsLoading, setStepsLoading] = useState(false);
  const [stepsError, setStepsError] = useState(null);

  useEffect(() => {
    window.scrollTo(0, 0);
    localStorage.clear();
  }, []);

  useEffect(() => {
    const t = setTimeout(() => {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }, 60);
    return () => clearTimeout(t);
  }, [location.key, location.pathname]);

  // Fetch steps when selectedEvent changes (no AbortController as requested)
  useEffect(() => {
    if (!selectedEvent) {
      setSteps([]);
      setStepsError(null);
      setStepsLoading(false);
      return;
    }

    let mounted = true;
    setStepsLoading(true);
    setStepsError(null);

    fetchServicesByEvent(selectedEvent)
      .then((data) => {
        if (!mounted) return;
        // fetchServicesByEvent may return undefined on error — default to empty array
        setSteps(Array.isArray(data) ? data : []);
      })
      .catch((err) => {
        if (!mounted) return;
        console.error("Error fetching services for event", selectedEvent, err);
        setStepsError(err?.message || "Failed to load services");
        setSteps([]);
      })
      .finally(() => {
        if (mounted) setStepsLoading(false);
      });

    return () => {
      // mark unmounted to avoid state updates after unmount (simple guard since no AbortController)
      mounted = false;
    };
  }, [selectedEvent]);

  const onGuestsChange = useCallback((e) => {
    const raw = e.target.value;
    const normalized = raw === "" ? "" : Number(raw);
    setGuests(normalized);
    setErrors((prev) => ({ ...prev, guests: validateGuests(normalized) }));
  }, []);

  const onPincodeChange = useCallback((e) => {
    const raw = e.target.value;
    // Keep as string to preserve leading zeros if any
    const normalized = raw === "" ? "" : String(raw).trim();
    setPincode(normalized);
    setErrors((prev) => ({ ...prev, pincode: validatePincode(normalized) }));
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
    const pErr = validatePincode(pincode);

    if (gErr || pErr) {
      setErrors({ guests: gErr, pincode: pErr });
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    /**
     * Build finalProducts array to pass to /add-meal:
     *
     * - If item is a configured live-counter -> pass it as-is (it contains config).
     * - Else, if the product has a selectedSubOption -> pass the subOption object (so downstream receives the actual chosen item).
     *   We also copy a couple of parent fields (parentTitle, parentImage) for context.
     * - Otherwise pass the product object itself.
     */
    const finalProducts = (selectedItemsObj || []).map((p) => {
      // if configured live counter (modal) keep full product shape
      if (isLiveCounter(p)) {
        return { ...p, isLiveCounter: true };
      }

      // if product has selectedSubOption (chosen via PDP), pass only the sub-option
      if (p.selectedSubOption) {
        const sub = p.selectedSubOption;
        return {
          // pass only the sub-option fields (spread)
          ...sub,
          // keep some context from parent
          parentTitle: p.title,
          parentImage: p.image || null,
        };
      }

      // fallback - pass the product itself
      return p;
    });

    const state = {
      products: finalProducts,
      guests: Number(guests),
      eventType: selectedEvent,
      pincode: String(pincode).trim(),
    };

    navigate("/add-meal", { state });
  }, [guests, pincode, selectedItemsObj, selectedEvent, navigate]);

  // disable footer if guests or pincode invalid
  const isFooterDisabled = !!validateGuests(guests) || !!validatePincode(pincode);

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

            <GuestsCard guests={guests} pincode={pincode} onPincodeChange={onPincodeChange} onChange={onGuestsChange} error={errors.guests} />

            {/* pass loading and error if you want ServicesAccordion to show placeholders */}
            <ServicesAccordion
              steps={steps}
              selectedItems={selectedItems}
              onProductClicked={onProductClicked}
              loading={stepsLoading}
              error={stepsError}
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
