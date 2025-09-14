// src/pages/celebration-pages/bulk-checkout/BulkCheckout.jsx
import React, { useCallback, useState, useEffect, useMemo } from "react";
import { useLocation } from "react-router-dom";
import { calculateProductPrice, toINR } from "../../../utils/util";
import { calculateLiveCounterPrice } from "../../../data/celebrationsData";
import DateTimePicker from "../../../components/datePicker";
import Wrapper from "../../../components/wrapper";
import ContactUs from "../../../components/contactUs";
import Textarea from "../../../components/textArea";
import Pricing from "../../../components/pricing";
import Checkbox from "@mui/material/Checkbox";
import CelebrationItemsList from "../../../components/celebrationItemsList";
import "./styles.scss";

/**
 * BulkCheckout
 * - Expects location.state to contain:
 *    { totalPrice: number, selectedItems: { Items: [...] }, guests?: number, services?: [...] }
 *
 * Behavior:
 * - Prefers services from route state (location.state.services). If absent, falls back to localStorage key "celebration-services".
 * - Calculates food discount (5% rounded) and merges with service pricing
 * - For live counters uses calculateLiveCounterPrice(product, extraInfo, hours, staff)
 * - Exposes formatted pricing (strings via toINR) for the Pricing component while keeping numeric totals in productPricing
 */

const BulkCheckout = () => {
  const location = useLocation();
  // safe defaults if state unset
  const {
    totalPrice: totalPriceFromState = 0,
    selectedItems: selectedItemsFromState = { Items: [] },
    guests: guestsFromState = null,
    services: servicesFromState = null,
    dietConfig: dietConfigFromState = null,
  } = location.state || {};

  const selectedItemsCategory = Object.keys(selectedItemsFromState || {});

  // celebration service products (saved earlier from celebrations flow)
  // prefer services from route state; otherwise read from localStorage
  const [celebrationProducts, setCelebrationProducts] = useState(() => {
    if (Array.isArray(servicesFromState)) return servicesFromState;
    try {
      const stored = localStorage.getItem("celebration-services");
      if (stored) return JSON.parse(stored);
    } catch (err) {
      // ignore parse error
    }
    return null;
  });

  // numeric product pricing returned by our combined calculator (numbers)
  const [productPricing, setProductPricing] = useState({
    total: 0,
    discount: 0,
    finalPrice: 0,
  });

  // formatted pricing object (strings) that the Pricing component expects
  const [pricing, setPricing] = useState({
    pricepax: toINR(0),
    totalFoodPrice: toINR(totalPriceFromState),
    serviceCharge: toINR(0),
    totalPrice: toINR(totalPriceFromState),
    discountPax: toINR(0),
    totalDiscount: toINR(0),
    finalPrice: toINR(totalPriceFromState),
  });

  // guests (read from route state if present, else 0)
  const guests = useMemo(() => {
    if (guestsFromState === null || guestsFromState === undefined) return 0;
    return typeof guestsFromState === "number" ? guestsFromState : Number(guestsFromState);
  }, [guestsFromState]);

  // utility: menu section lines
  const getMenuSection = useCallback(() => {
    if (!selectedItemsFromState || !selectedItemsFromState.Items) return [];
    return selectedItemsFromState.Items.map((item) => `${item.name} : ${item.quantity}`);
  }, [selectedItemsFromState]);

  // food discount calculation (numeric): 5% rounded to nearest rupee
  const getDiscountPrice = useCallback((price) => Math.round(Number(price || 0) * 0.05), []);

  // If services come from route/state, persist them to localStorage for future flows.
  useEffect(() => {
    if (Array.isArray(servicesFromState)) {
      try {
        localStorage.setItem("celebration-services", JSON.stringify(servicesFromState));
      } catch (err) {
        // eslint-disable-next-line no-console
        console.warn("Could not persist celebration-services to localStorage:", err);
      }
      setCelebrationProducts(servicesFromState);
    }
  }, [servicesFromState]);

  // On mount: if celebrationProducts not initialized earlier from route, try localStorage
  useEffect(() => {
    if (celebrationProducts !== null) return;
    try {
      const stored = localStorage.getItem("celebration-services");
      if (stored) {
        const parsed = JSON.parse(stored);
        setCelebrationProducts(parsed);
      }
    } catch (err) {
      // eslint-disable-next-line no-console
      console.warn("Could not read celebration-services from localStorage:", err);
    }
    window.scrollTo(0, 0);
  }, [celebrationProducts]);

  /**
   * Helper: isLiveCounter detection
   * We'll treat a product as live-counter if it has `baseFee` defined (your new model).
   * For backwards compatibility, products may set `isLiveCounter: true`.
   */
  const isLiveCounter = useCallback((product) => {
    if (!product) return false;
    if (product.isLiveCounter) return true;
    return typeof product.baseFee === "number";
  }, []);

  /**
   * Compute service pricing:
   * - For live counters: compute both original and discounted choice totals (5% off per-serving).
   * - We apply discount only on the unitPrice of choices (as requested) and aggregate that into service discounts.
   *
   * Returns: {
   *   numeric: { total, discount, finalPrice },
   *   liveBreakdown: [ { title, baseFee, extraHoursCost, staffCost, choicesCost, choicesDetail[], total, totalDiscountForProduct, rawProduct } ],
   * }
   */
  const computeServicePricing = useCallback((products = []) => {
    if (!Array.isArray(products) || products.length === 0) {
      return {
        numeric: { total: 0, discount: 0, finalPrice: 0 },
        liveBreakdown: [],
      };
    }

    // split live vs others
    const liveProducts = products.filter((p) => isLiveCounter(p));
    const otherProducts = products.filter((p) => !isLiveCounter(p));

    // compute live breakdowns and sum
    const liveBreakdown = liveProducts.map((p) => {
      const extraInfo = p.extraInfo || {};
      // hours/staff requested by user may be inside extraInfo (optional)
      const hours = Number(extraInfo.hours ?? p.baseHours ?? 0);
      const staff = Number(extraInfo.staff ?? p.baseStaff ?? 0);

      // compute price using original model (original choices cost included)
      const originalTotal = calculateLiveCounterPrice(p, extraInfo, hours, staff);

      // compute more granular pieces for display: we'll re-run the math locally to expose parts
      const base = p.baseFee || 0;
      const extraHours = Math.max(0, hours - (p.baseHours || 0));
      const hourCost = extraHours * (p.hourlyRate || 0);
      const extraStaff = Math.max(0, staff - (p.baseStaff || 0));
      const staffCost = extraStaff * (p.extraStaffRate || 0) * Math.max(1, hours || (p.baseHours || 0));

      // build per-choice detail (original and discounted)
      const choicesObj = extraInfo.choices || {};
      const choicesDetail = Object.entries(choicesObj).map(([k, v]) => {
        const qty = Number(v) || 0;
        const choiceObj = (p.recommendedChoices || []).find((c) => c.key === k);
        const unitPrice = (choiceObj && Number(choiceObj.unitPrice)) || 0;
        const discountAmt = Math.round(unitPrice * 0.05); // 5% rounded
        const discountedUnit = unitPrice - discountAmt;
        const costOriginal = qty * unitPrice;
        const costDiscounted = qty * discountedUnit;
        const saving = costOriginal - costDiscounted;
        return {
          key: k,
          label: (choiceObj && choiceObj.label) || k,
          qty,
          unitPrice,
          discountedUnit,
          costOriginal,
          costDiscounted,
          saving,
        };
      });

      const choicesCostOriginal = choicesDetail.reduce((s, it) => s + (Number(it.costOriginal) || 0), 0);
      const choicesCostDiscounted = choicesDetail.reduce((s, it) => s + (Number(it.costDiscounted) || 0), 0);
      const choicesSavings = choicesCostOriginal - choicesCostDiscounted;

      // Recompute totals using discounted choice prices (customer pays discounted choice totals)
      const recomputedTotalDiscounted = base + hourCost + staffCost + choicesCostDiscounted;
      const recomputedTotalOriginal = base + hourCost + staffCost + choicesCostOriginal;

      const totalDiscountForProduct = recomputedTotalOriginal - recomputedTotalDiscounted; // essentially equal to choicesSavings

      return {
        title: p.title,
        id: p.id || p.title,
        baseFee: base,
        hours,
        extraHours,
        hourCost,
        staff,
        extraStaff,
        staffCost,
        choicesCostOriginal,
        choicesCostDiscounted,
        choicesSavings,
        choicesDetail, // array of {key,label,qty,unitPrice,discountedUnit,costOriginal,costDiscounted,saving}
        totalOriginal: Number(recomputedTotalOriginal || originalTotal || 0),
        total: Number(recomputedTotalDiscounted || originalTotal || 0),
        totalDiscountForProduct: Number(totalDiscountForProduct || 0),
        rawProduct: p,
      };
    });

    const liveSumDiscounted = liveBreakdown.reduce((s, b) => s + (Number(b.total) || 0), 0);
    const liveSumOriginal = liveBreakdown.reduce((s, b) => s + (Number(b.totalOriginal) || 0), 0);
    const liveServicesDiscountTotal = liveSumOriginal - liveSumDiscounted; // aggregated discount across live counters

    // for non-live services, leverage your existing calculateProductPrice utility
    // It returns { total, discount, finalPrice } — assume those are already net (finalPrice) and discount refers to service discount.
    const otherPricing = otherProducts.length ? calculateProductPrice(otherProducts) : { total: 0, discount: 0, finalPrice: 0 };

    // numeric totals: combine live (discounted) + other
    const numericTotal = Number(liveSumDiscounted || 0) + Number(otherPricing.total || 0);
    // numericDiscount includes discounts that come from other pricing plus the live services discount we computed
    const numericDiscount = Number(otherPricing.discount || 0) + Number(liveServicesDiscountTotal || 0);
    const numericFinal = Number(liveSumDiscounted || 0) + Number(otherPricing.finalPrice || 0);

    return {
      numeric: {
        total: Number(numericTotal),
        discount: Number(numericDiscount),
        finalPrice: Number(numericFinal),
      },
      liveBreakdown,
      otherPricing,
    };
  }, [isLiveCounter]);

  // Recalculate productPricing and overall formatted pricing whenever celebrationProducts or totalPrice changes
  useEffect(() => {
    const foodTotalNumeric = Number(totalPriceFromState || 0);
    const foodDiscountNumeric = getDiscountPrice(foodTotalNumeric);

    const { numeric: serviceNumeric } = computeServicePricing(celebrationProducts || []);

    // final numeric total = (food total - food discount) + service final
    const finalNumeric = Math.max(0, foodTotalNumeric - foodDiscountNumeric) + Number(serviceNumeric.finalPrice || 0);

    // Build display (formatted) pricing object (strings)
    const displayPricing = {
      pricepax: toINR(0),
      totalFoodPrice: toINR(foodTotalNumeric),
      serviceCharge: toINR(serviceNumeric.total), // show service total as "service charge"
      totalPrice: toINR(foodTotalNumeric + serviceNumeric.total),
      discountPax: toINR(foodDiscountNumeric),
      totalDiscount: toINR(foodDiscountNumeric + (serviceNumeric.discount || 0)),
      finalPrice: toINR(finalNumeric),
    };

    setProductPricing({
      total: Number(serviceNumeric.total || 0),
      discount: Number(serviceNumeric.discount || 0),
      finalPrice: Number(serviceNumeric.finalPrice || 0),
    });

    setPricing(displayPricing);
  }, [celebrationProducts, totalPriceFromState, getDiscountPrice, computeServicePricing]);

  // Order data that ContactUs will receive; update when pricing / guests / menu changes
  const [orderData, setOrderData] = useState(() => ({
    people: guests || 0,
    price: pricing,
    special_request: "",
    menu_sections: getMenuSection(),
    date: new Date().toLocaleString(undefined, { timeZone: "Asia/Kolkata" }),
    services: celebrationProducts || [],
    dietConfig: dietConfigFromState || {},
  }));

  useEffect(() => {
    setOrderData((prev) => ({
      ...prev,
      people: guests || 0,
      price: pricing,
      menu_sections: getMenuSection(),
      services: celebrationProducts || [],
      dietConfig: dietConfigFromState || {},
    }));
  }, [guests, pricing, getMenuSection, celebrationProducts, dietConfigFromState]);

  // handlers
  const onDateChange = useCallback((date) => {
    if (!date || typeof date.toLocaleString !== "function") return;
    setOrderData((prev) => ({
      ...prev,
      date: date.toLocaleString(undefined, { timeZone: "Asia/Kolkata" }),
    }));
  }, []);

  const onContentChange = useCallback((content) => {
    setOrderData((prev) => ({
      ...prev,
      special_request: content,
    }));
  }, []);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // local UI toggle for service
  const [isService, setIsService] = useState(false);

  /**
   * Render helpers: live breakdown list (computed again locally for rendering)
   * We compute a local breakdown for UI using the same computeServicePricing function
   */
  const serviceBreakdown = useMemo(() => {
    if (!celebrationProducts) return [];
    const { liveBreakdown = [] } = computeServicePricing(celebrationProducts);
    return liveBreakdown;
  }, [celebrationProducts, computeServicePricing]);

  // NEW: only non-live services to pass to CelebrationItemsList
  const nonLiveProducts = useMemo(() => {
    if (!Array.isArray(celebrationProducts)) return [];
    return celebrationProducts.filter((p) => !isLiveCounter(p));
  }, [celebrationProducts, isLiveCounter]);

  return (
    <Wrapper headertext="Confirm your order" footer={false}>
      <div className="checkoutPage mealBoxCheckoutPage">
        <section className="menuSection">
          <div className="menuItemsSection">
            {selectedItemsCategory.map((category) =>
              (selectedItemsFromState[category] && selectedItemsFromState[category].length) ? (
                <div key={category}>
                  <p>{category}</p>
                  <ul>
                    {selectedItemsFromState[category].map((item) => (
                      <li key={item.id || `${item.name}-${item.quantity}`}>
                        <span>
                          {item.name}
                          {item.desc && (
                            <span className="menuPricing">&nbsp;&nbsp;({item.desc})</span>
                          )}
                          <span className="quantityInfo">&nbsp;&nbsp;x {item.quantity}</span>
                        </span>
                        <span className="menuPricing">{toINR(item.price)}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null
            )}

            {/* show celebration products summary (only NON-LIVE-counter items) */}
            {nonLiveProducts && nonLiveProducts.length > 0 && (
              <CelebrationItemsList products={nonLiveProducts} />
            )}
          </div>
        </section>

        {/* Live counters price breakdown (if any) - keep structure: block per live counter, nested choices table */}
        {serviceBreakdown && serviceBreakdown.length > 0 && (
            <div className="serviceBreakdown">
              {serviceBreakdown.map((b) => (
                <div key={b.id} className="live-price-row">
                  <div className="live-price-left">
                    <strong className="live-title">{b.title}</strong>
                    <div className="muted small">Servings: {b.rawProduct?.extraInfo?.plates ?? "-"}</div>
                    {b.rawProduct?.extraInfo?.note ? <div className="muted small">Note: {b.rawProduct.extraInfo.note}</div> : null}
                  </div>

                  <div className="live-price-right">
                    <table className="live-breakdown-table" role="table" aria-label={`${b.title} breakdown`}>
                      <thead>
                        <tr>
                          <th>Item</th>
                          <th className="center">Qty</th>
                          <th className="right">Amount</th>
                        </tr>
                      </thead>
                      <tbody>
                        {b.choicesDetail && b.choicesDetail.length > 0 ? (
                          <>
                            {b.choicesDetail.map((c) => (
                              <tr key={c.key}>
                                <td>
                                  {c.label}
                                  <div className="muted smaller" style={{ display: 'flex', alignItems: 'baseline'}}>
                                    <span className="discounted">{toINR(c.unitPrice)}</span>
                                    &nbsp;&nbsp;
                                    <span>{toINR(c.discountedUnit)}</span>
                                  </div>
                                </td>
                                <td className="center">{c.qty}</td>
                                <td className="right">{toINR(c.costDiscounted)}</td>
                              </tr>
                            ))}

                            <tr className="choices-total">
                              <td><strong>Choices total (after discount)</strong></td>
                              <td />
                              <td className="right"><strong>{toINR(b.choicesCostDiscounted)}</strong></td>
                            </tr>

                            {b.choicesSavings > 0 && (
                              <tr className="choices-savings">
                                <td><strong>Discount</strong></td>
                                <td />
                                <td className="right"><strong>-{toINR(b.choicesSavings)}</strong></td>
                              </tr>
                            )}
                          </>
                        ) : (
                          <tr>
                            <td colSpan="3" className="muted small">No choices selected</td>
                          </tr>
                        )}

                        {/* show base & staff & hours lines as separate rows for clarity */}
                        <tr>
                          <td>Staff + Setup cost</td>
                          <td />
                          <td className="right">{toINR(b.baseFee)}</td>
                        </tr>
                        {b.extraHours > 0 && (
                          <tr>
                            <td>Extra hours ({b.extraHours})</td>
                            <td />
                            <td className="right">{toINR(b.hourCost)}</td>
                          </tr>
                        )}
                        {b.extraStaff > 0 && (
                          <tr>
                            <td>Extra staff</td>
                            <td />
                            <td className="right">{toINR(b.staffCost)}</td>
                          </tr>
                        )}

                        <tr className="total">
                          <td><strong>Total</strong></td>
                          <td />
                          <td className="right"><strong>{toINR(b.total)}</strong></td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              ))}
            </div>
        )}

        <section className="pricePaxSection isServiceSection">
          <p className="key">Need staff for service?</p>
          <Checkbox checked={isService} onChange={() => setIsService((prev) => !prev)} />
        </section>

        {isService && (
          <section className="pricePaxSection isServiceSection">
            <span className="key">
              Our executive will discuss further about our service plans
            </span>
          </section>
        )}

        <Pricing
          isService={isService}
          type="bulk"
          productPricing={productPricing}
          pricing={pricing}
          guests={guests || 0}
        />

        <section className="menuSection">
          <Textarea onChange={(e) => onContentChange(e.target.value)} />
        </section>

        <div className="contactSection">
          <p>Add Your Details</p>
          <DateTimePicker onDateChange={onDateChange} />
          <ContactUs orderData={orderData} />
        </div>
      </div>
    </Wrapper>
  );
};

export default BulkCheckout;
