// src/data/celebrationsData.js
import { liveCounterOptions, calculateLiveCounterPrice } from "./liveCounters.js";
import { artistsOptions } from "./artistsOptions.js";
import { propsOptions } from "./propsOptions.js";

export const eventTypeOptions = ["Birthday Party", "House Party", "Corporate Event", "Kitty Party"];

export { liveCounterOptions, artistsOptions, propsOptions, calculateLiveCounterPrice };

export const celebrationStepsMap = {
  Festival: [
    { icon: "🪅", color: "pink-icon", text: "Decor Your Way – Props, Fun & Games!", options: [propsOptions[2], propsOptions[3]] },
    { icon: "🧑‍🍳", color: "pink-icon", text: "Add Live Stations – Fresh & Fun!", options: liveCounterOptions },
    { icon: "🎭", color: "pink-icon", text: "Spice It Up – Artists & Entertainment!", options: artistsOptions },
  ],
  "Birthday Party": [
    { icon: "🪅", color: "pink-icon", text: "Decor Your Way – Props, Fun & Games!", options: [propsOptions[2], propsOptions[3]] },
    { icon: "🧑‍🍳", color: "pink-icon", text: "Add Live Stations – Fresh & Fun!", options: liveCounterOptions },
    { icon: "🎭", color: "pink-icon", text: "Spice It Up – Artists & Entertainment!", options: artistsOptions },
  ],
  "House Party": [
    { icon: "🪅", color: "pink-icon", text: "Chill Props & Games", options: [propsOptions[0], propsOptions[1]] },
    { icon: "🧑‍🍳", color: "pink-icon", text: "Live Counters to Impress", options: [liveCounterOptions[3], liveCounterOptions[5]] },
  ],
  "Corporate Event": [
    { icon: "🧑‍🍳", color: "yellow-icon", text: "Catered Live Stations", options: [liveCounterOptions[0], liveCounterOptions[1], liveCounterOptions[4], liveCounterOptions[5]] },
    { icon: "📸", color: "yellow-icon", text: "Professional Services", options: [artistsOptions[5], artistsOptions[4]] },
    { icon: "🎪", color: "yellow-icon", text: "Event Extras", options: [propsOptions[2]] },
  ],
  "Kitty Party": [
    { icon: "🪅", color: "purple-icon", text: "Fun Props", options: [propsOptions[1], propsOptions[3]] },
    { icon: "🧑‍🍳", color: "purple-icon", text: "Quick Live Counters", options: liveCounterOptions },
    { icon: "🎭", color: "purple-icon", text: "Entertainment", options: [artistsOptions[4], artistsOptions[2]] },
  ],
};

export const getCelebrationStepsFor = (eventType) => celebrationStepsMap[eventType] || celebrationStepsMap["Birthday Party"];
export const celebrationSteps = celebrationStepsMap["Birthday Party"];

export const isLiveCounter = (product) => {
  if (!product) return false;
  if (product.isLiveCounter) return true;
  if (product.type && product.type === "live-counter") return true;
  const title = (product.title || "").toString().trim().toLowerCase();
  if (!title) return false;
  return liveCounterOptions.some((lc) => (lc.title || "").toLowerCase() === title);
};
