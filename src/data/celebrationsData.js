// src/data/celebrationsData.js
import { v4 as uuidv4 } from "uuid";

/*
  This file exports:
   - eventTypeOptions (array)
   - celebrationStepsMap (object)
   - getCelebrationStepsFor(eventType) -> returns steps array for event
   - celebrationSteps (default fallback, Birthday Party)
   - liveCounterOptions (array) — now includes id, type and isLiveCounter flags
   - calculateLiveCounterPrice(product, extraInfo, hours, staff)
   - isLiveCounterProduct(product) helper
*/

export const eventTypeOptions = [
  "Birthday Party",
  "House Party",
  "Corporate Event",
  "Kitty Party",
];

/* ------------------------------
   Shared option pools (enhanced)
   ------------------------------ */

/*
  NOTE:
  - recommendedChoices still present (used to show choice labels / allow per-choice edits)
  - servingsPerGuest: explicit control for how many "plates/servings" per guest for this product
    Setting servingsPerGuest: 1 means plates === guests when computing defaults.
*/

// updated liveCounterOptions with explicit pricing model
// - baseFee: fixed minimum booking fee (INR)
// - baseHours: hours included in baseFee
// - hourlyRate: cost per extra hour beyond baseHours
// - baseStaff: staff included in baseFee
// - extraStaffRate: per additional staff per hour
// - servingsPerGuest: used to compute default plates from guest count
// - recommendedChoices: each choice has defaultQty and unitPrice (INR per serving)
export const liveCounterOptions = [
  {
    id: uuidv4(),
    type: "live-counter",
    isLiveCounter: true,
    title: "Live Pizza",
    price: { max: 6500, min: 5000 },
    baseFee: 3000,
    baseHours: 2,
    hourlyRate: 1200,
    baseStaff: 1,
    extraStaffRate: 1000,

    servingsPerGuest: 1,
    image:
      "https://png.pngtree.com/png-vector/20240317/ourmid/pngtree-restaurant-team-engaged-in-pizza-making-process-png-image_11995539.png",
    recommendedChoices: [
      { key: "margherita", label: "Margherita", defaultQty: 20, unitPrice: 220 },
      { key: "pepperoni", label: "Pepperoni", defaultQty: 10, unitPrice: 260 },
      { key: "veggie", label: "Veggie", defaultQty: 10, unitPrice: 230 },
    ],
  },
  {
    id: uuidv4(),
    type: "live-counter",
    isLiveCounter: true,
    title: "Live Chats",
    price: { max: 6500, min: 5000 },
    baseFee: 1800,
    baseHours: 2,
    hourlyRate: 600,
    baseStaff: 1,
    extraStaffRate: 800,

    servingsPerGuest: 1,
    image:
      "https://www.creativehatti.com/wp-content/uploads/2024/01/Indian-vendor-character-selling-panipuri-snack-on-stall-Small.jpg",
    recommendedChoices: [
      { key: "panipuri", label: "Pani Puri", defaultQty: 50, unitPrice: 18 },
      { key: "sev_puri", label: "Sev Puri", defaultQty: 30, unitPrice: 22 },
      { key: "dahi_puri", label: "Dahi Puri", defaultQty: 20, unitPrice: 25 },
    ],
  },
  {
    id: uuidv4(),
    type: "live-counter",
    isLiveCounter: true,
    title: "Live MOMO",
    price: { max: 6500, min: 5000 },
    baseFee: 2000,
    baseHours: 2,
    hourlyRate: 700,
    baseStaff: 1,
    extraStaffRate: 900,

    servingsPerGuest: 1,
    image:
      "https://cdni.iconscout.com/illustration/premium/thumb/male-chef-making-momos-illustration-download-in-svg-png-gif-file-formats--cooking-expert-professional-masterchef-food-pack-restaurants-bar-illustrations-4946000.png?f=webp",
    recommendedChoices: [
      { key: "veg_momo", label: "Veg Momos", defaultQty: 40, unitPrice: 18 },
      { key: "chicken_momo", label: "Chicken Momos", defaultQty: 30, unitPrice: 28 },
      { key: "fried_momo", label: "Fried Momos", defaultQty: 10, unitPrice: 22 },
    ],
  },
  {
    id: uuidv4(),
    type: "live-counter",
    isLiveCounter: true,
    title: "Live BBQ",
    price: { max: 6500, min: 5000 },
    baseFee: 4500,
    baseHours: 3,
    hourlyRate: 1800,
    baseStaff: 1,
    extraStaffRate: 1500,

    servingsPerGuest: 1,
    image:
      "https://png.pngtree.com/png-vector/20240315/ourmid/pngtree-summer-barbecue-grill-cartoon-png-image_11969568.png",
    recommendedChoices: [
      { key: "chicken_skew", label: "Chicken Skewers", defaultQty: 30, unitPrice: 75 },
      { key: "veg_skew", label: "Veg Skewers", defaultQty: 20, unitPrice: 55 },
      { key: "prawn_skew", label: "Prawn Skewers", defaultQty: 10, unitPrice: 120 },
    ],
  },
  {
    id: uuidv4(),
    type: "live-counter",
    isLiveCounter: true,
    title: "Turkish Ice cream",
    price: { max: 6500, min: 5000 },
    baseFee: 1600,
    baseHours: 2,
    hourlyRate: 600,
    baseStaff: 1,
    extraStaffRate: 800,

    servingsPerGuest: 1,
    image:
      "https://static.vecteezy.com/system/resources/thumbnails/004/599/874/small_2x/turkish-ice-cream-man-selling-traditional-ice-cream-from-turkey-in-cartoon-flat-illustration-isolated-in-white-background-vector.jpg",
    recommendedChoices: [
      { key: "vanilla", label: "Vanilla", defaultQty: 20, unitPrice: 35 },
      { key: "chocolate", label: "Chocolate", defaultQty: 15, unitPrice: 40 },
      { key: "strawberry", label: "Strawberry", defaultQty: 10, unitPrice: 38 },
    ],
  },
  {
    id: uuidv4(),
    type: "live-counter",
    isLiveCounter: true,
    title: "Mocktail Bartender",
    price: { max: 6500, min: 5000 },
    baseFee: 2499,
    baseHours: 2,
    hourlyRate: 700,
    baseStaff: 1,
    extraStaffRate: 1200,

    servingsPerGuest: 1,
    image: "https://i.pinimg.com/736x/7b/6e/df/7b6edf838c3d51a46c4c884e635bd7a2.jpg",
    recommendedChoices: [
      { key: "citrus_mocktail", label: "Citrus Mocktail", defaultQty: 30, unitPrice: 200 },
      { key: "mint_mojito", label: "Mint Mojito", defaultQty: 30, unitPrice: 180 },
      { key: "berry_blast", label: "Berry Blast", defaultQty: 20, unitPrice: 220 },
    ],
  },
];

/* ------------------------------
   Utility to compute price
   ------------------------------ */
/**
 * Calculates live counter price.
 * - Applies a fixed discountRate (5%) to per-choice unit prices.
 * - Uses discounted unit price when computing choices cost.
 *
 * @param {Object} product - product definition (with baseFee, hourlyRate, recommendedChoices)
 * @param {Object} extraInfo - user choices e.g. { choices: { key: qty }, hours, staff }
 * @param {number} hours - hours to charge (defaults to product.baseHours)
 * @param {number} staff - staff count to charge (defaults to product.baseStaff)
 * @returns {number} total price (INR)
 */
export const calculateLiveCounterPrice = (product, extraInfo, hours = product.baseHours, staff = product.baseStaff) => {
  if (!product) return 0;

  const discountRate = 0.05; // 5% discount applied to per-choice unit prices

  const base = Number(product.baseFee || 0);

  const extraHours = Math.max(0, (Number(hours) || 0) - (product.baseHours || 0));
  const hourCost = extraHours * (product.hourlyRate || 0);

  const extraStaff = Math.max(0, (Number(staff) || 0) - (product.baseStaff || 0));
  // staff cost charged per extra staff per hour
  const staffCost = extraStaff * (product.extraStaffRate || 0) * Math.max(1, Number(hours) || (product.baseHours || 0));

  const choices = (extraInfo && extraInfo.choices) || {};
  const perChoiceCost = Object.entries(choices).reduce((sum, [k, v]) => {
    const choiceObj = (product.recommendedChoices || []).find((c) => c.key === k);
    if (!choiceObj) return sum;
    const unit = Number(choiceObj.unitPrice || 0);
    const discountedUnit = Math.round(unit * (1 - discountRate)); // round to nearest INR
    return sum + (Number(v) || 0) * discountedUnit;
  }, 0);

  return base + hourCost + staffCost + perChoiceCost;
};

/* Other option pools (artists / props) remain unchanged */
export const artistsOptions = [
  {
    title: "Magician",
    price: { max: 8500, min: 7000 },
    image:
      "https://img.freepik.com/premium-vector/beautiful-professional-cartoon-character-design-vector-illustration_1287274-50824.jpg",
  },
  {
    title: "Joker",
    price: { max: 4500, min: 3500 },
    image: "https://img.freepik.com/free-vector/colourful-clown-cartoon-character_1308-109181.jpg",
  },
  {
    title: "Cartoonist",
    price: { max: 4000, min: 3000 },
    image:
      "https://png.pngtree.com/png-vector/20230728/ourlarge/pngtree-fyi-clipart-cartoon-character-artist-boy-painting-realistic-abstract-artwork-on-vector-png-image_6810455.png",
  },
  {
    title: "Tattoo Artist",
    price: { max: 3500, min: 3000 },
    image:
      "https://static.vecteezy.com/system/resources/previews/007/299/670/non_2x/female-tattoo-artist-making-tattoo-on-arm-concept-free-vector.jpg",
  },
  {
    title: "Host",
    price: { max: 7000, min: 6000 },
    image: "https://png.pngtree.com/png-clipart/20220123/original/pngtree-host-of-annual-party-png-image_7155525.png",
    subOptions: [
      { id: "host_en", label: "English - Professional Host", extra: 0 },
      { id: "host_bi", label: "Bilingual (Local + English)", extra: 1000 },
      { id: "host_ent", label: "Emcee + Games Host (energetic)", extra: 1500 },
    ],
  },
  {
    title: "Photographer",
    price: { max: 8500, min: 7000 },
    image:
      "https://png.pngtree.com/png-clipart/20230913/original/pngtree-fotor-clipart-cartoon-photographer-boy-holding-camera-with-glasses-vector-png-image_11064900.png",
  },
];

export const propsOptions = [
  {
    title: "Console Games",
    price: { max: 2500, min: 2000 },
    image:
      "https://img.freepik.com/premium-vector/video-gaming-lounge-isolated-cartoon-vector-illustrations_107173-22083.jpg",
  },
  {
    title: "Board & Card Games",
    price: { max: 1500, min: 1000 },
    image:
      "https://static.vecteezy.com/system/resources/previews/008/580/174/non_2x/kids-playing-board-game-at-table-illustration-isolated-on-white-vector.jpg",
  },
  {
    title: "Photo booth",
    price: { max: 8500, min: 7000 },
    image: "https://cdn.vectorstock.com/i/500p/17/80/photo-booth-isolated-cartoon-vector-41421780.jpg",
    subOptions: [
      { id: "pb1", label: "Classic Backdrop", extra: 0 },
      { id: "pb2", label: "Themed Backdrop (Kids)", extra: 1200 },
      { id: "pb3", label: "GIF / Boomerang Booth", extra: 2500 },
    ],
  },
  {
    title: "Balloon Decoration",
    price: { max: 6500, min: 5000 },
    image: "https://img.freepik.com/premium-vector/balloons-birthday-party-3-colors-isolated-white-background_750364-1370.jpg",
    subOptions: [
      { id: "bd1", label: "Classic Balloon Arch", extra: 0 },
      { id: "bd2", label: "Themed Balloon Arch (Cartoon)", extra: 1200 },
      { id: "bd3", label: "Ceiling Balloon Cluster", extra: 800 },
      { id: "bd4", label: "Photo-booth Balloon Frame", extra: 1500 },
    ],
  },
];

/* --------------------------------------------------------------
   celebrationStepsMap — defines which steps/options each eventType
   -------------------------------------------------------------- */

export const celebrationStepsMap = {
  "Birthday Party": [
    { icon: "🪅", color: "pink-icon", text: "Decor Your Way – Props, Fun & Games!", options: propsOptions },
    {
      icon: "🧑‍🍳",
      color: "pink-icon",
      text: "Add Live Stations – Fresh & Fun!",
      options: [liveCounterOptions[0], liveCounterOptions[2], liveCounterOptions[4]],
    }, // Pizza, Momo, Turkish Ice cream
    {
      icon: "🎭",
      color: "pink-icon",
      text: "Spice It Up – Artists & Entertainment!",
      options: [artistsOptions[0], artistsOptions[2], artistsOptions[1]],
    }, // Magician, Cartoonist, Joker
  ],

  "House Party": [
    { icon: "🪅", color: "pink-icon", text: "Chill Props & Games", options: [propsOptions[0], propsOptions[1]] }, // Console, Board
    {
      icon: "🧑‍🍳",
      color: "pink-icon",
      text: "Live Counters to Impress",
      options: [liveCounterOptions[0], liveCounterOptions[3], liveCounterOptions[5]],
    }, // Pizza, BBQ, Mocktail
    { icon: "🎭", color: "pink-icon", text: "Capture Moments", options: [propsOptions[2], artistsOptions[5]] }, // Photo booth + Photographer
  ],

  "Corporate Event": [
    { icon: "🧑‍🍳", color: "yellow-icon", text: "Catered Live Stations", options: [liveCounterOptions[3], liveCounterOptions[1]] }, // BBQ, Chats
    { icon: "📸", color: "yellow-icon", text: "Professional Services", options: [artistsOptions[5], artistsOptions[4]] }, // Photographer, Host
    { icon: "🎪", color: "yellow-icon", text: "Event Extras", options: [propsOptions[2]] }, // Photo booth
  ],

  "Kitty Party": [
    { icon: "🪅", color: "purple-icon", text: "Fun Props", options: [propsOptions[1], propsOptions[3]] }, // Board & Balloon
    { icon: "🧑‍🍳", color: "purple-icon", text: "Quick Live Counters", options: [liveCounterOptions[1], liveCounterOptions[2]] }, // Chats, Momo
    { icon: "🎭", color: "purple-icon", text: "Entertainment", options: [artistsOptions[4], artistsOptions[2]] }, // Host / Cartoonist
  ],
};

/* Helper to fetch steps for a given event type. Falls back to Birthday Party */
export const getCelebrationStepsFor = (eventType) => {
  return celebrationStepsMap[eventType] || celebrationStepsMap["Birthday Party"];
};

/* For backwards compatibility, export a default 'celebrationSteps' (Birthday Party) */
export const celebrationSteps = celebrationStepsMap["Birthday Party"];

/* ----------------------------------------------------------------
   Helper: isLiveCounterProduct(product)
   - Checks product flags (isLiveCounter/type)
   - Also falls back to checking if product.title matches any liveCounterOptions title (defensive)
   ---------------------------------------------------------------- */
export const isLiveCounter = (product) => {
  if (!product) return false;
  if (product.isLiveCounter) return true;
  if (product.type && product.type === "live-counter") return true;

  // defensive fallback: match by title against our liveCounterOptions list
  const title = (product.title || "").toString().trim().toLowerCase();
  if (!title) return false;
  return liveCounterOptions.some((lc) => (lc.title || "").toLowerCase() === title);
};
