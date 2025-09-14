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
import "./styles.scss";

/* Keep validators out of component to avoid recreating them on every render */

const validateGuests = (value) => {
  const min = 30;
  const max = 500;
  if (value === "" || value === null || value === undefined) return "Please enter guest count.";
  if (isNaN(value)) return "Guests must be a number.";
  const n = Number(value);
  if (n < min) return `Minimum booking is ${min} guests.`;
  if (n > max) return `Maximum booking is ${max} guests.`;
  return "";
};

const Celebrations = () => {
  const navigate = useNavigate();

  // product selection states
  const [selectedItems, setSelectedItems] = useState([]);
  const [selectedItemsObj, setSelectedItemsObj] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(eventTypeOptions[0]);

  // new states
  const [guests, setGuests] = useState(30);
  const [errors, setErrors] = useState({});

  // get steps for the current event type (memoized)
  const steps = useMemo(() => getCelebrationStepsFor(selectedEvent), [selectedEvent]);

  /* heuristic to detect live counters by title keywords.
     If you prefer exact-title matching using the liveCounterOptions list,
     replace this with a whitelist lookup from data file. */
  const isLiveCounter = useCallback((title) => {
    if (!title || typeof title !== "string") return false;
    const re = /(live\b|bbq|momo|mocktail|turkish|pizza|chats|chat|pani?puri|ice\s*cream)/i;
    return re.test(title);
  }, []);

  /* -----------------
     plate-per-guest heuristics (now prefers product.servingsPerGuest)
     -----------------
     If a product defines `servingsPerGuest` in the data file, we use it.
     Otherwise we fall back to heuristics (tunable defaults).
  */
  const perGuestRatioForProduct = useCallback((product) => {
    // explicit override from data file (preferred)
    if (product && typeof product.servingsPerGuest === "number") {
      return product.servingsPerGuest;
    }

    // fallback heuristics (kept for products without explicit setting)
    const t = (product && product.title ? product.title.toLowerCase() : "");
    if (/pizza/.test(t)) return 1 / 6;
    if (/momo/.test(t)) return 1 / 3;
    if (/bbq/.test(t)) return 1 / 4;
    if (/chat|pani?puri|chats/.test(t)) return 1 / 2;
    if (/ice\s*cream|turkish/.test(t)) return 1 / 3;
    if (/mocktail/.test(t)) return 1 / 2;
    return 1 / 4;
  }, []);

  // compute plates purely from guest count & product-specific ratio
  const computePlatesFromGuests = useCallback((product, g) => {
    const guestsNum = Number(g) || 0;
    const ratio = perGuestRatioForProduct(product);
    const computed = guestsNum > 0 ? Math.max(1, Math.ceil(guestsNum * ratio)) : 1;
    return computed;
  }, [perGuestRatioForProduct]);

  // helper: sum of choice quantities object { key: qty }
  const sumChoices = useCallback((choices = {}) => {
    return Object.values(choices).reduce((s, v) => s + (Number(v) || 0), 0);
  }, []);

  // distribute plates using recommendedChoices.defaultQty weights if available,
  // otherwise even split. Returns { key: qty } and ensures integer totals with remainder.
  const distributeChoicesByWeights = useCallback((product, plates) => {
    const rec = product.recommendedChoices || [];
    if (!rec.length) return {};

    // build weights: defaultQty if provided else 1
    const keys = rec.map((c) => c.key);
    const weights = rec.map((c) => (typeof c.defaultQty === "number" && c.defaultQty > 0 ? c.defaultQty : 1));
    const weightSum = weights.reduce((a, b) => a + b, 0) || 1;

    // raw allocation
    const rawAlloc = weights.map((w) => (plates * w) / weightSum);

    // floor allocations and distribute remainder
    const base = rawAlloc.map((r) => Math.floor(r));
    let allocated = base.reduce((a, b) => a + b, 0);
    let remainder = plates - allocated;

    // distribute remainder by largest fractional part (stable)
    const fractional = rawAlloc.map((r, idx) => ({ idx, frac: r - Math.floor(r) }));
    fractional.sort((a, b) => b.frac - a.frac);
    for (let i = 0; i < remainder; i += 1) {
      base[fractional[i % fractional.length].idx] += 1;
    }

    const result = {};
    keys.forEach((k, i) => {
      result[k] = base[i];
    });
    return result;
  }, []);

  // evenly distribute plates across available choices (keeps for backward fallback)
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

  // choose weighted distribution when possible
  const defaultChoicesForPlates = useCallback((product, plates) => {
    const rec = product.recommendedChoices || [];
    const hasDefaultQty = rec.some((c) => typeof c.defaultQty === "number" && c.defaultQty > 0);
    if (hasDefaultQty) return distributeChoicesByWeights(product, plates);
    return distributeChoicesEvenly(product, plates);
  }, [distributeChoicesByWeights, distributeChoicesEvenly]);

  // recompute extraInfo for a product using guest count only (plates + choices)
  const recomputeExtraInfoForProduct = useCallback((product, g) => {
    const productClone = { ...product };
    const plates = computePlatesFromGuests(productClone, g);
    const choices = defaultChoicesForPlates(productClone, plates);
    productClone.extraInfo = {
      ...(productClone.extraInfo || {}),
      plates,
      choices,
      note: (productClone.extraInfo && productClone.extraInfo.note) || "",
    };
    return productClone;
  }, [computePlatesFromGuests, defaultChoicesForPlates]);

  /* -----------------
     Modal state for live counter configuration
     ----------------- */
  const [liveModalOpen, setLiveModalOpen] = useState(false);
  const [liveModalProduct, setLiveModalProduct] = useState(null);
  const [liveModalState, setLiveModalState] = useState({
    plates: "",
    choices: {},
    note: "",
    // internal flag to denote user edited anything
    userEdited: false,
  });

  // helper to build initial choices object (if product.extraInfo.choices exists prefer it)
  const initialChoicesFromProduct = useCallback((product, plates) => {
    if (product.extraInfo && product.extraInfo.choices && Object.keys(product.extraInfo.choices).length > 0) {
      // make sure keys exist for all recommended choices (zero if missing)
      const choices = {};
      (product.recommendedChoices || []).forEach((rc) => {
        choices[rc.key] = Number(product.extraInfo.choices[rc.key] || 0);
      });
      return choices;
    }
    return defaultChoicesForPlates(product, plates);
  }, [defaultChoicesForPlates]);

  // When user clicks Add/Remove on a ProductCard
  const onProductClicked = useCallback(
    (product) => {
      const alreadySelected = selectedItems.includes(product.title);
      if (alreadySelected) {
        // remove selection
        setSelectedItems((prev) => prev.filter((t) => t !== product.title));
        setSelectedItemsObj((prev) => prev.filter((o) => o.title !== product.title));
        return;
      }

      // If product is a live counter -> open modal to collect extra info
      if (isLiveCounter(product.title)) {
        const defaultPlates = computePlatesFromGuests(product, guests);
        const choicesInit = initialChoicesFromProduct(product, defaultPlates);
        setLiveModalProduct(product);
        setLiveModalState({
          plates: String(defaultPlates),
          choices: choicesInit,
          note: (product.extraInfo && product.extraInfo.note) || "",
          userEdited: false,
        });
        setLiveModalOpen(true);
        return;
      }

      // otherwise simply add product (no extra info)
      const productClone = { ...product };
      setSelectedItems((prev) => [...prev, productClone.title]);
      setSelectedItemsObj((prev) => [...prev, productClone]);
    },
    [isLiveCounter, selectedItems, guests, computePlatesFromGuests, initialChoicesFromProduct]
  );

  // handlers using callbacks
  const onGuestsChange = useCallback((e) => {
    const raw = e.target.value;
    const normalized = raw === "" ? "" : Number(raw);
    setGuests(normalized);
    setErrors((prev) => ({ ...prev, guests: validateGuests(normalized) }));
  }, []);

  // When guest count changes, update existing selectedItemsObj live counters' extraInfo
  useEffect(() => {
    if (!selectedItemsObj || selectedItemsObj.length === 0) return;
    const updated = selectedItemsObj.map((p) => {
      if (isLiveCounter(p.title)) {
        // only recompute if user hasn't explicitly edited this product (we consider presence of extraInfo.userEdited)
        const wasUserEdited = p.extraInfo && p.extraInfo._userEdited;
        if (wasUserEdited) {
          // keep user's edits (plates/choices) intact but we may still want to re-normalize if you prefer
          return p;
        }
        return recomputeExtraInfoForProduct(p, guests);
      }
      return p;
    });
    // update state
    setSelectedItemsObj(updated);
  }, [guests, selectedItemsObj.length, isLiveCounter, recomputeExtraInfoForProduct, selectedItemsObj]);

  // If modal is open and guests change, update modal defaults live (unless user has edited)
  useEffect(() => {
    if (!liveModalOpen || !liveModalProduct) return;
    setLiveModalState((prev) => {
      if (prev.userEdited) return prev; // don't override user's edits
      const newPlates = computePlatesFromGuests(liveModalProduct, guests);
      const newChoices = initialChoicesFromProduct(liveModalProduct, newPlates);
      return {
        ...prev,
        plates: String(newPlates),
        choices: newChoices,
      };
    });
  }, [guests, liveModalOpen, liveModalProduct, computePlatesFromGuests, initialChoicesFromProduct]);

  // aggregated validity (memoized)
  const allValid = useMemo(() => {
    const gErr = validateGuests(guests);
    return { ok: !gErr, details: { gErr } };
  }, [guests]);

  // footer disabled logic
  const isFooterDisabled = !allValid.ok;

  /**
   * addMeals
   * - validates guests
   * - recomputes any live-counter extraInfo one last time from current `guests` (unless user-edited)
   * - marks isLiveCounter flag
   * - navigates sending `products` (full objects), `guests` and `eventType`
   */
  const addMeals = useCallback(() => {
    const gErr = validateGuests(guests);
    const newErrors = {};
    if (gErr) newErrors.guests = gErr;
    setErrors(newErrors);

    if (!gErr) {
      // Recompute live counters from current guest count so the final payload is accurate
      const finalProducts = (selectedItemsObj || []).map((p) => {
        if (isLiveCounter(p.title)) {
          // if user edited this product earlier, prefer saved extraInfo; otherwise recompute from guests
          const wasUserEdited = p.extraInfo && p.extraInfo._userEdited;
          const recomputed = wasUserEdited ? p : recomputeExtraInfoForProduct(p, guests);
          return {
            ...recomputed,
            isLiveCounter: true,
          };
        }
        return {
          ...p,
          isLiveCounter: false,
        };
      });

      const state = {
        products: finalProducts,
        guests: Number(guests),
        eventType: selectedEvent,
      };

      console.log(state)

      navigate("/celebrations/add-meal", {state});
    } else {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [guests, selectedItemsObj, selectedEvent, navigate, isLiveCounter, recomputeExtraInfoForProduct]);

  // helper: scale current choices to match a new plates total (keeps proportions; integer rounding)
  const scaleChoicesToPlates = useCallback((currentChoices, newPlates) => {
    const keys = Object.keys(currentChoices);
    if (!keys.length) return {};
    const sum = sumChoices(currentChoices);
    if (sum === 0) {
      // nothing selected; return zeros
      const zeros = {};
      keys.forEach((k) => (zeros[k] = 0));
      return zeros;
    }
    // compute new allocations proportional to current choices
    const raw = keys.map((k) => (currentChoices[k] / sum) * newPlates);
    const floored = raw.map((r) => Math.floor(r));
    let allocated = floored.reduce((a, b) => a + b, 0);
    let remainder = newPlates - allocated;

    // distribute remainder to largest fractional parts
    const fractional = raw.map((r, idx) => ({ idx, frac: r - Math.floor(r) }));
    fractional.sort((a, b) => b.frac - a.frac);
    for (let i = 0; i < remainder; i += 1) {
      floored[fractional[i % fractional.length].idx] += 1;
    }

    const result = {};
    keys.forEach((k, i) => (result[k] = floored[i]));
    return result;
  }, [sumChoices]);

  // helper to update a single choice value inside modal (keeps plates synced to sum of choices)
  const setChoiceValue = useCallback((choiceKey, value) => {
    setLiveModalState((prev) => {
      const newChoices = { ...(prev.choices || {}) };
      newChoices[choiceKey] = Number(value || 0);

      const total = sumChoices(newChoices);

      return {
        ...prev,
        choices: newChoices,
        plates: String(total), // plates follow sum of choices
        userEdited: true,
      };
    });
  }, [sumChoices]);

  // handler for plates input change — update choices proportionally if choices already set,
  // otherwise compute defaults for the new plates
  const onPlatesChange = useCallback((platesValue) => {
    const parsed = Number(platesValue) || 0;
    setLiveModalState((prev) => {
      const prevChoices = prev.choices || {};
      const sumPrev = sumChoices(prevChoices);

      let newChoices = {};
      if (sumPrev > 0) {
        // scale existing choice proportions to match new plates
        newChoices = scaleChoicesToPlates(prevChoices, parsed);
      } else {
        // no existing choices — create defaults based on weights/defaultQty
        newChoices = defaultChoicesForPlates(liveModalProduct || {}, parsed);
      }

      return {
        ...prev,
        plates: String(parsed),
        choices: newChoices,
        userEdited: true,
      };
    });
  }, [sumChoices, scaleChoicesToPlates, defaultChoicesForPlates, liveModalProduct]);

  // Confirm modal: attach extraInfo and add to selection (or replace if already exists)
  const confirmLiveModal = () => {
    const prod = liveModalProduct;
    if (!prod) return;

    const plates = Math.max(0, Number(liveModalState.plates) || 0);
    if (!plates || plates <= 0) {
      alert("Please enter number of plates/servings for this live counter.");
      return;
    }

    // if modal choices empty but product has recommendedChoices, still distribute from plates
    const finalChoices =
      Object.keys(liveModalState.choices || {}).length > 0
        ? { ...liveModalState.choices }
        : defaultChoicesForPlates(prod, plates);

    const productToAdd = {
      ...prod,
      extraInfo: {
        plates,
        choices: finalChoices,
        note: liveModalState.note || "",
        _userEdited: true, // mark as user edited so future guest changes don't override
      },
    };

    // ensure we don't duplicate: remove existing with same title
    setSelectedItems((prev) => {
      const without = prev.filter((t) => t !== productToAdd.title);
      return [...without, productToAdd.title];
    });

    setSelectedItemsObj((prev) => {
      const without = prev.filter((o) => o.title !== productToAdd.title);
      return [...without, productToAdd];
    });

    setLiveModalOpen(false);
    setLiveModalProduct(null);
    setLiveModalState({ plates: "", choices: {}, note: "", userEdited: false });
  };

  // Close modal without adding
  const cancelLiveModal = () => {
    setLiveModalOpen(false);
    setLiveModalProduct(null);
    setLiveModalState({ plates: "", choices: {}, note: "", userEdited: false });
  };

  return (
    <>
      <Helmet>
        <title>Create a Celebration | CaterKart</title>
        <meta
          name="description"
          content="Plan your perfect event with CaterKart! Choose from live counters, props and more."
        />
        <link rel="canonical" href="https:/caterkart.in/celebrations" />
      </Helmet>

      <Wrapper headerLeftType="home" headertext="CaterKart" footer={true}>
        <section className="pageDescSection">
          <header>
            <h1>CREATE A CELEBRATION</h1>
            <p>PICK YOUR EVENT TYPE AND REQUIRED SERVICES</p>
          </header>
        </section>

        <section className="celebrations-section">
          <h3 className="subSectionTitle">Pick Your Event Type</h3>
          <section className="optionsContainer">
            {eventTypeOptions.map((event) => (
              <p
                key={event}
                className={selectedEvent === event ? "eventType active-event-type" : "eventType"}
                onClick={() => setSelectedEvent(event)}
              >
                {event}
              </p>
            ))}
          </section>

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

            <div className="eventDetailsRight" aria-hidden="true" />
          </section>

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

      {/* Live counter configuration modal */}
      {liveModalOpen && liveModalProduct && (
        <div className="live-config-backdrop" role="dialog" aria-modal="true" onClick={cancelLiveModal}>
          <div className="live-config-modal" onClick={(e) => e.stopPropagation()}>
            <header className="live-config-header">
              <div>
                <h3>{liveModalProduct.title} — Configure</h3>
                <div className="muted">Quick defaults picked from your guest count</div>
              </div>
              <button aria-label="Close" className="close-btn" onClick={cancelLiveModal}>✕</button>
            </header>

            <div className="live-config-body">
              <div>
                <label className="field-label">How many servings / plates?</label>
                <input
                  type="number"
                  min="1"
                  value={liveModalState.plates}
                  onChange={(e) => onPlatesChange(e.target.value)}
                  placeholder="e.g. 50"
                  className="input"
                />
              </div>

              <div className="recommended-block">
                <label className="field-label">Recommended choices</label>
                <div className="recommended-list">
                  {(liveModalProduct.recommendedChoices || []).map((choice) => {
                    const currentVal = liveModalState.choices[choice.key] ?? 0;
                    return (
                      <div className="choice-row" key={choice.key}>
                        <div className="choice-left">
                          <input
                            type="checkbox"
                            checked={Boolean(currentVal && Number(currentVal) > 0)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                // if user checks and there are zero choices currently, set at least 1
                                const valToSet = currentVal > 0 ? currentVal : 1;
                                setChoiceValue(choice.key, valToSet);
                              } else {
                                setChoiceValue(choice.key, 0);
                              }
                            }}
                          />
                          <div className="choice-meta">
                            <div className="choice-label">{choice.label}</div>
                          </div>
                        </div>

                        <input
                          type="number"
                          min="0"
                          value={liveModalState.choices[choice.key] ?? 0}
                          onChange={(e) => {
                            const val = e.target.value === "" ? 0 : Number(e.target.value);
                            setChoiceValue(choice.key, val);
                          }}
                          className="choice-qty"
                        />
                      </div>
                    );
                  })}

                  {(liveModalProduct.recommendedChoices || []).length === 0 && (
                    <div className="muted">No quick choices available — use the note below to add specifics.</div>
                  )}
                </div>
              </div>

              <div className="notes-block">
                <label className="field-label">Notes (optional)</label>
                <textarea
                  value={liveModalState.note}
                  onChange={(e) => setLiveModalState((s) => ({ ...s, note: e.target.value, userEdited: true }))}
                  rows={3}
                  placeholder="Any specific requests (e.g., spice level, separate counters, etc.)"
                />
              </div>
            </div>

            <footer className="live-config-actions">
              <button type="button" className="btn btn-outline" onClick={cancelLiveModal}>Cancel</button>
              <button type="button" className="btn btn-primary" onClick={confirmLiveModal}>Add & Continue</button>
            </footer>
          </div>
        </div>
      )}
    </>
  );
};

export default Celebrations;
