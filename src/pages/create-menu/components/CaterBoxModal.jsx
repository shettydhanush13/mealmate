// src/pages/create-menu/components/CaterBoxModal.jsx
import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { FaArrowRight, FaRedo, FaCheck, FaBoxOpen } from "react-icons/fa";
import BoxLayoutIcon from "../../../components/boxLayoutIcon";
import ConfigModal from "./ConfigModal";
import "./SubscriptionModal.scss"; // .cbSub entry-card styles
import "./ConfigModal.scss";   // shared modal shell (config-page / cfgCard / cfgBtn)
import "./CaterBoxModal.scss";

// Box options for CaterBox. Descriptions are placeholders for now.
const BOX_OPTIONS = [
  { value: 3, desc: "Description coming soon" },
  { value: 5, desc: "Description coming soon" },
  { value: 8, desc: "Description coming soon" },
];

const MEAL_SLOTS = ["Breakfast", "Lunch/Dinner", "Snacks"];

/**
 * CaterBoxModal — shown instead of the event-config modal when the user picks
 * the "caterbox" meal type. Lets them choose a meal slot + a box option (3/5/8).
 *
 * Props: show, initial, onSave, onClose
 */
const CaterBoxModal = ({ show, initial = {}, guestsFromRoute = null, onSave, onClose }) => {
  const navigate = useNavigate();
  const [boxType, setBoxType] = useState(initial.boxType ?? null);
  const [mealSlot, setMealSlot] = useState(initial.mealSlot ?? null);
  const [diet, setDiet] = useState({
    dietMode: initial.dietMode || "veg-only",
    vegGuests: initial.vegGuests ?? "",
    nonVegGuests: initial.nonVegGuests ?? "0",
  });
  const dietInitialRef = useRef({
    dietMode: initial.dietMode || "veg-only",
    vegGuests: initial.vegGuests ?? "",
    nonVegGuests: initial.nonVegGuests ?? "0",
    kidsCount: "0",
    eventTime: initial.eventTime || "",
  });
  const isEditing = Boolean(initial?.boxType);

  useEffect(() => {
    if (!show) return;
    setBoxType(initial.boxType ?? null);
    setMealSlot(initial.mealSlot ?? null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [show, initial]);

  if (!show) return null;

  const onSubmit = (e) => {
    e.preventDefault();
    if (!boxType || !mealSlot) return;
    onSave({ ...initial, ...diet, boxType, mealSlot, mealType: "caterbox" });
  };

  return (
    <div className="config-page" role="dialog" aria-modal="true" aria-label="Choose a CaterBox">
      <form className="cfgCard" onSubmit={onSubmit} noValidate>
        <header className="cfgHead">
          <div className="cfgHead__icon" aria-hidden="true"><FaBoxOpen /></div>
          <h3 className="cfgHead__title">Choose your CaterBox</h3>
          <p className="cfgHead__sub">Pick a meal and box option to continue.</p>
        </header>

        {/* Meal slot */}
        <div className="cfgField">
          <span className="cfgLabel">Meal</span>
          <div className="cbSlots" role="radiogroup" aria-label="Meal slot">
            {MEAL_SLOTS.map((slot) => (
              <button
                type="button"
                key={slot}
                className={`cbSlot ${mealSlot === slot ? "is-active" : ""}`}
                onClick={() => setMealSlot(slot)}
                aria-pressed={mealSlot === slot}
              >
                {slot}
              </button>
            ))}
          </div>
        </div>

        {/* Box option */}
        <div className="cfgField">
          <span className="cfgLabel">Box option</span>
          <div className="cbGrid" role="radiogroup" aria-label="Box options">
            {BOX_OPTIONS.map((opt) => (
              <button
                type="button"
                key={opt.value}
                className={`cbCard ${boxType === opt.value ? "is-active" : ""}`}
                onClick={() => setBoxType(opt.value)}
                aria-pressed={boxType === opt.value}
              >
                <span className="cbCard__check" aria-hidden="true"><FaCheck /></span>
                <span className="cbCard__media">
                  <BoxLayoutIcon size={opt.value} className="cbCard__img" />
                </span>
                <span className="cbCard__text">
                  <span className="cbCard__count">{opt.value}</span>
                  <span className="cbCard__unit">items</span>
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Diet preference (ConfigModal renders its own label) */}
        <ConfigModal
          inline
          hideDate
          hideHead
          show
          guestsFromRoute={Number(guestsFromRoute) || null}
          initial={dietInitialRef.current}
          onChange={setDiet}
        />

        {/* Subscription — opens the full Create CaterBox Subscription page */}
        <div className="cbSub">
          <div className="cbSub__icon" aria-hidden="true">
            <FaRedo />
          </div>
          <div className="cbSub__body">
            <div className="cbSub__title">
              Order on a subscription <span className="cbSub__badge">New</span>
            </div>
            <p className="cbSub__desc">
              Get the same box delivered regularly for a fixed number of meals — and unlock bulk discounts on long-term plans.
            </p>
          </div>
          <button
            type="button"
            className="cbSub__btn"
            onClick={() => navigate("/caterbox-subscription", { state: { mealSlot, boxType } })}
          >
            Subscribe
          </button>
        </div>

        <div className="cfgActions">
          {isEditing && (
            <button type="button" className="cfgBtn cfgBtn--ghost" onClick={onClose}>Cancel</button>
          )}
          <button type="submit" className="cfgBtn cfgBtn--primary" disabled={!boxType || !mealSlot}>
            Save &amp; Continue <FaArrowRight />
          </button>
        </div>
      </form>
    </div>
  );
};

export default CaterBoxModal;
