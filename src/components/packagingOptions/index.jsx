import React from "react";
import { carrierSavingPerBox, CO_BRAND_PRICE } from "../../services/pricing";
import box3 from "../../assets/box3.png";
import box5 from "../../assets/box5.png";
import box8 from "../../assets/box8.png";
import cobrand3 from "../../assets/cobrand3.png";
import cobrand5 from "../../assets/cobrand5.png";
import cobrand8 from "../../assets/cobrand8.png";
import carrierImg from "../../assets/carrier.png";
import "./styles.scss";

const PLAIN_IMG = { 3: box3, 5: box5, 8: box8 };
const COBRAND_IMG = { 3: cobrand3, 5: cobrand5, 8: cobrand8 };

/**
 * PackagingOptions — shared, controlled packaging chooser used across the
 * CaterBox order and subscription flows. The three options are mutually
 * exclusive (a single value), so co-branded sleeves and reusable carriers can
 * never be picked together.
 *
 * value:    "plain" | "cobrand" | "carrier"
 * onChange: (next) => void
 * boxType:  used to show the carrier saving for that box size
 */
const PackagingOptions = ({
  value = "plain",
  onChange,
  boxType = 3,
  label = "Packaging",
  className = "",
}) => {
  const carrierOff = carrierSavingPerBox(boxType);
  const plainImg = PLAIN_IMG[boxType] || box5;
  const cobrandImg = COBRAND_IMG[boxType] || cobrand5;

  const OPTIONS = [
    {
      id: "plain",
      img: plainImg,
      title: "Standard packaging",
      desc: "Individually sealed disposable boxes — included, no extra cost.",
    },
    {
      id: "cobrand",
      img: cobrandImg,
      title: "Customized packaging",
      price: `+₹${CO_BRAND_PRICE}/box`,
      desc: "Add your brand or event details to every box's sleeve.",
    },
    {
      id: "carrier",
      img: carrierImg,
      title: "Reusable carriers",
      tag: "Eco-friendly",
      save: carrierOff > 0 ? `−₹${carrierOff}/box` : null,
      desc: "Returnable carriers instead of disposables — lowers your per-box cost.",
    },
  ];

  return (
    <div className={`pkgOpts ${className}`.trim()}>
      {label && (
        <span className="pkgOpts__label">{label} <small>(pick one)</small></span>
      )}
      {OPTIONS.map((o) => {
        const on = value === o.id;
        return (
          <button
            key={o.id}
            type="button"
            className={`pkgOpt ${on ? "is-on" : ""}`}
            aria-pressed={on}
            onClick={() => onChange?.(o.id)}
          >
            <img className="pkgOpt__img" src={o.img} alt="" loading="lazy" />
            <span className="pkgOpt__body">
              <span className="pkgOpt__title">
                {o.title}
                {o.price && <span className="pkgOpt__price">{o.price}</span>}
                {o.tag && <span className="pkgOpt__tag">{o.tag}</span>}
                {o.save && <span className="pkgOpt__save">{o.save}</span>}
              </span>
              <span className="pkgOpt__desc">{o.desc}</span>
            </span>
            <span className="pkgOpt__check" aria-hidden="true" />
          </button>
        );
      })}
    </div>
  );
};

export default PackagingOptions;
