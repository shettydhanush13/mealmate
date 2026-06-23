import React from "react";
import { useNavigate } from "react-router-dom";
import { FaRedo, FaCheck, FaArrowRight, FaUserTie, FaBoxOpen, FaUtensils, FaGift, FaLock, FaTags, FaTruck } from "react-icons/fa";
import BoxLayoutIcon from "../../../../components/boxLayoutIcon";
import ConfigModal from "../../../create-menu/components/ConfigModal";
import carrierImg from "../../../../assets/carrier.png";
import cobrandImg from "../../../../assets/cobrand5.png";
import "../../../create-menu/components/SubscriptionModal.scss"; // .cbSub / .subCarrier styles
import "./styles.scss";

const TABS = [
  { id: "caterbox", label: "CaterBox" },
  // Buffet is temporarily disabled (shown as "Coming soon"). The whole buffet
  // flow below is untouched — flip comingSoon to false to re-enable it.
  { id: "buffet", label: "Buffet", comingSoon: true },
];
const MEAL_SLOTS = ["Breakfast", "Lunch/Dinner", "Snacks"];
const BOX_OPTIONS = [3, 8]; // 5-item box paused for now — we serve 3 & 8

/**
 * MealTypeSection — inline tabbed meal-type chooser (replaces the modal).
 * Buffet shows a short description; CaterBox shows meal-slot + box options.
 *
 * Props: mealType, boxType, mealSlot, error, onMealType, onBoxType, onMealSlot
 */
const MealTypeSection = ({
  mealType, boxType, mealSlot, error, guests,
  dietInitial, onDietConfig, onMealType, onBoxType, onMealSlot,
  reusableCarrier = false, onReusableCarrier,
}) => {
  const navigate = useNavigate();

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
          aria-disabled={t.comingSoon || undefined}
          disabled={t.comingSoon}
          className={`mealType__tab ${mealType === t.id ? "is-active" : ""} ${t.comingSoon ? "is-soon" : ""}`}
          onClick={() => { if (!t.comingSoon) onMealType(t.id); }}
          title={t.comingSoon ? "Coming soon" : undefined}
        >
          {t.label}
          {t.comingSoon && <span className="mealType__soon">Coming soon</span>}
        </button>
      ))}
    </div>

    <div className="mealType__panel">
      {mealType === "buffet" ? (
        <div className="mtBuffetWrap">
          <div className="ckIntro">
            <div className="ckIntro__head">
              <span className="ckIntro__icon" aria-hidden="true"><FaUtensils /></span>
              <div>
                <div className="ckIntro__title">Buffet for your special occasion</div>
                <p className="ckIntro__tag">
                  Full-service spread with serving staff included. Build your own menu and we handle the rest.
                </p>
              </div>
            </div>
            <ul className="ckIntro__perks">
              <li><span aria-hidden="true"><FaUserTie /></span> Serving staff included</li>
              <li><span aria-hidden="true"><FaUtensils /></span> Live cooking counters</li>
              <li><span aria-hidden="true"><FaUtensils /></span> Fully customizable menu</li>
              <li><span aria-hidden="true"><FaGift /></span> Perfect for 30–500 guests</li>
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
              <div>
                <div className="ckIntro__title">CaterBox — meals, ready to hand out</div>
                <p className="ckIntro__tag">
                  Individually packed boxes, delivered in bulk — ideal for weddings, offices &amp; functions.
                  No setup, no serving staff, just open &amp; share.
                </p>
              </div>
            </div>
            <ul className="ckIntro__perks">
              <li><span aria-hidden="true"><FaLock /></span> Sealed &amp; hygienic</li>
              <li><span aria-hidden="true"><FaTags /></span> Best price per box</li>
              <li><span aria-hidden="true"><FaTruck /></span> Bulk delivery &amp; distribution</li>
              <li><span aria-hidden="true"><FaBoxOpen /></span> Co-branded packaging</li>
            </ul>
            <figure className="ckIntro__example">
              <img
                src={cobrandImg}
                alt="CaterBox meal box with a co-branded sleeve — add your brand or event details to every box"
                className="ckIntro__exampleImg"
                loading="lazy"
              />
              <figcaption className="ckIntro__exampleCap">
                Co-branded packaging — your brand or event on every box
              </figcaption>
            </figure>
            <p className="ckIntro__note">
              Hosting a big event? Mention it at checkout — we'll add distribution staff &amp; tailor it for you.
            </p>
          </div>

          {/* Two clear paths: one-time vs recurring subscription */}
          <div className="mtModes" role="group" aria-label="How would you like to order?">
            <div className="mtMode is-active">
              <span className="mtMode__icon" aria-hidden="true"><FaBoxOpen /></span>
              <span className="mtMode__body">
                <span className="mtMode__title">One-time order</span>
                <span className="mtMode__desc">Boxes for a single occasion/events — set it up just below.</span>
              </span>
              <span className="mtMode__badge"><FaCheck aria-hidden="true" /> Selected</span>
            </div>
            <button
              type="button"
              className="mtMode mtMode--sub"
              onClick={() => navigate("/caterbox-subscription", { state: { mealSlot, boxType } })}
            >
              <span className="mtMode__icon" aria-hidden="true"><FaRedo /></span>
              <span className="mtMode__body">
                <span className="mtMode__title">Subscription <span className="cbSub__badge">New</span></span>
                <span className="mtMode__desc">Same box delivered regularly — save with bulk pricing.</span>
              </span>
              <span className="mtMode__go" aria-hidden="true"><FaArrowRight /></span>
            </button>
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

          {/* Packaging — reusable carriers (common to one-time & subscription) */}
          <div className="mtBox__group">
            <span className="mtBox__label">Packaging</span>
            <button
              type="button"
              className={`subCarrier ${reusableCarrier ? "is-on" : ""}`}
              aria-pressed={reusableCarrier}
              onClick={() => onReusableCarrier?.(!reusableCarrier)}
            >
              <span className="subCarrier__icon" aria-hidden="true">
                <img src={carrierImg} alt="" className="subCarrier__img" />
              </span>
              <span className="subCarrier__body">
                <span className="subCarrier__title">
                  Reusable carriers <span className="subCarrier__tag">Eco-friendly</span>
                </span>
                <span className="subCarrier__desc">
                  Get meals in returnable carriers instead of disposable plates &amp; cutlery —
                  less waste, and it lowers your per-meal cost.
                </span>
              </span>
              <span className={`subCarrier__check ${reusableCarrier ? "is-on" : ""}`} aria-hidden="true" />
            </button>
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

          {error && <div className="mtBox__error" role="alert">{error}</div>}
        </div>
      )}
    </div>
  </section>
  );
};

export default React.memo(MealTypeSection);
