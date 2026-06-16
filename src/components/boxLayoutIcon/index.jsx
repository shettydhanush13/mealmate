import React from "react";
import box3 from "../../assets/box3.png";
import box5 from "../../assets/box5.png";
import box8 from "../../assets/box8.png";

// Real product photos of the meal boxes, keyed by item count.
const BOX_IMAGES = {
  3: box3,
  5: box5,
  8: box8,
};

/**
 * Picture of a meal box with N compartments. Keeps the original
 * (size, className) API so existing callers and styling still apply.
 */
const BoxLayoutIcon = ({ size = 3, className }) => (
  <img
    className={className}
    src={BOX_IMAGES[size] || box3}
    alt={`${size}-item meal box`}
    loading="lazy"
    draggable="false"
  />
);

export default BoxLayoutIcon;
