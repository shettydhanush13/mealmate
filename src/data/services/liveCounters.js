// src/data/liveCounters.js
import { v4 as uuidv4 } from "uuid";

/**
 * Live counter options and price utility
 */

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

export const calculateLiveCounterPrice = (
  product,
  extraInfo,
  hours = product?.baseHours,
  staff = product?.baseStaff
) => {
  if (!product) return 0;

  const discountRate = 0.05; // 5% discount applied to per-choice unit prices
  const base = Number(product.baseFee || 0);

  const extraHours = Math.max(0, (Number(hours) || 0) - (product.baseHours || 0));
  const hourCost = extraHours * (product.hourlyRate || 0);

  const extraStaff = Math.max(0, (Number(staff) || 0) - (product.baseStaff || 0));
  const staffCost =
    extraStaff * (product.extraStaffRate || 0) * Math.max(1, Number(hours) || (product.baseHours || 0));

  const choices = (extraInfo && extraInfo.choices) || {};
  const perChoiceCost = Object.entries(choices).reduce((sum, [k, v]) => {
    const choiceObj = (product.recommendedChoices || []).find((c) => c.key === k);
    if (!choiceObj) return sum;
    const unit = Number(choiceObj.unitPrice || 0);
    const discountedUnit = Math.round(unit * (1 - discountRate));
    return sum + (Number(v) || 0) * discountedUnit;
  }, 0);

  return base + hourCost + staffCost + perChoiceCost;
};
