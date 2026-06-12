import React, { useState } from "react";
import { FaRedo, FaCheck } from "react-icons/fa";
import BoxLayoutIcon from "../../../../components/boxLayoutIcon";
import ConfigModal from "../../../create-menu/components/ConfigModal";
import SubscriptionModal, { discountFor } from "../../../create-menu/components/SubscriptionModal";
import "./styles.scss";

const TABS = [
  { id: "caterbox", label: "CaterBox" },
  { id: "buffet", label: "Buffet" },
];
const MEAL_SLOTS = ["Breakfast", "Lunch/Dinner", "Snacks"];
const BOX_OPTIONS = [3, 5, 8];

/**
 * MealTypeSection — inline tabbed meal-type chooser (replaces the modal).
 * Buffet shows a short description; CaterBox shows meal-slot + box options.
 *
 * Props: mealType, boxType, mealSlot, error, onMealType, onBoxType, onMealSlot
 */
const MealTypeSection = ({
  mealType, boxType, mealSlot, error, guests,
  dietInitial, onDietConfig, onMealType, onBoxType, onMealSlot,
}) => {
  // Subscription is an info-only entry point — it does not affect the order yet.
  const [showSub, setShowSub] = useState(false);
  const [subConfig, setSubConfig] = useState(null);

  return (
  <section className="mealType" aria-label="Choose your meal">
    <h3 className="subSectionTitle" data-step="1">Choose Your Meal</h3>

    <div className="mealType__tabs" role="tablist" aria-label="Meal type">
      {TABS.map((t) => (
        <button
          key={t.id}
          type="button"
          role="tab"
          aria-selected={mealType === t.id}
          className={`mealType__tab ${mealType === t.id ? "is-active" : ""}`}
          onClick={() => onMealType(t.id)}
        >
          {t.label}
        </button>
      ))}
    </div>

    <div className="mealType__panel">
      {mealType === "buffet" ? (
        <div className="mtBuffetWrap">
          <div className="ckIntro">
            <div className="ckIntro__head">
              <span className="ckIntro__icon" aria-hidden="true">🍽️</span>
              <div>
                <div className="ckIntro__title">Buffet for your special occasion</div>
                <p className="ckIntro__tag">
                  Full-service spread with serving staff included. Build your own menu and we handle the rest.
                </p>
              </div>
            </div>
            <ul className="ckIntro__perks">
              <li><span aria-hidden="true">👨‍🍳</span> Serving staff included</li>
              <li><span aria-hidden="true">🍲</span> Live cooking counters</li>
              <li><span aria-hidden="true">📝</span> Fully customizable menu</li>
              <li><span aria-hidden="true">🎉</span> Perfect for 30–500 guests</li>
            </ul>
          </div>

          <div className="mtBox__group">
            <span className="mtBox__label">Meal</span>
            <div className="mtBox__slots" role="radiogroup" aria-label="Meal slot">
              {MEAL_SLOTS.map((s) => (
                <button
                  key={s}
                  type="button"
                  className={`mtChip ${mealSlot === s ? "is-active" : ""}`}
                  aria-pressed={mealSlot === s}
                  onClick={() => onMealSlot(s)}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          <ConfigModal
            inline
            show
            guestsFromRoute={Number(guests) || null}
            initial={dietInitial}
            onChange={onDietConfig}
          />

          {error && <div className="mtBox__error" role="alert">{error}</div>}
        </div>
      ) : (
        <div className="mtBox">
          <div className="ckIntro">
            <div className="ckIntro__head">
              <span className="ckIntro__icon" aria-hidden="true">🍱</span>
              <div>
                <div className="ckIntro__title">CaterBox — meals, ready to hand out</div>
                <p className="ckIntro__tag">
                  Individually packed boxes, delivered in bulk. No setup, no serving staff — just open &amp; share.
                </p>
              </div>
            </div>
            <ul className="ckIntro__perks">
              <li><span aria-hidden="true">🔒</span> Sealed &amp; hygienic</li>
              <li><span aria-hidden="true">💸</span> Fixed price per box</li>
              <li><span aria-hidden="true">🚚</span> Bulk delivery</li>
              <li><span aria-hidden="true">⚡</span> Ready to distribute</li>
            </ul>
          </div>

          <div className="mtBox__group">
            <span className="mtBox__label">Meal</span>
            <div className="mtBox__slots" role="radiogroup" aria-label="Meal slot">
              {MEAL_SLOTS.map((s) => (
                <button
                  key={s}
                  type="button"
                  className={`mtChip ${mealSlot === s ? "is-active" : ""}`}
                  aria-pressed={mealSlot === s}
                  onClick={() => onMealSlot(s)}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          <div className="mtBox__group">
            <span className="mtBox__label">Box option</span>
            <div className="mtBox__grid" role="radiogroup" aria-label="Box option">
              {BOX_OPTIONS.map((b) => (
                <button
                  key={b}
                  type="button"
                  className={`mtBoxCard ${boxType === b ? "is-active" : ""}`}
                  aria-pressed={boxType === b}
                  onClick={() => onBoxType(b)}
                >
                  <span className="mtBoxCard__check" aria-hidden="true"><FaCheck /></span>
                  <span className="mtBoxCard__media">
                    <BoxLayoutIcon size={b} className="mtBoxCard__img" />
                  </span>
                  <span className="mtBoxCard__text">
                    <span className="mtBoxCard__count">{b}</span>
                    <span className="mtBoxCard__unit">items</span>
                  </span>
                </button>
              ))}
            </div>
          </div>

          <ConfigModal
            inline
            hideDate
            hideHead
            show
            guestsFromRoute={Number(guests) || null}
            initial={dietInitial}
            onChange={onDietConfig}
          />

          {/* Subscription — info / config entry point (not wired to pricing yet) */}
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
              {subConfig && (
                <div className="cbSub__summary">
                  {subConfig.totalMeals || "—"} meals · {subConfig.frequency}
                  {discountFor(subConfig.totalMeals) > 0 ? ` · save ${discountFor(subConfig.totalMeals)}%` : ""}
                </div>
              )}
            </div>
            <button type="button" className="cbSub__btn" onClick={() => setShowSub(true)}>
              {subConfig ? "Edit" : "Configure"}
            </button>
          </div>

          <SubscriptionModal
            show={showSub}
            initial={subConfig}
            mealSlot={mealSlot}
            boxType={boxType}
            onClose={() => setShowSub(false)}
            onSave={(cfg) => { setSubConfig(cfg); setShowSub(false); }}
          />

          {error && <div className="mtBox__error" role="alert">{error}</div>}
        </div>
      )}
    </div>
  </section>
  );
};

export default React.memo(MealTypeSection);
