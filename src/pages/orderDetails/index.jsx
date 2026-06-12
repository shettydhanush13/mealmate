// src/pages/admin/OrderDetailsPage.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { fetchOrderById, updateOrder } from '../../services/order';
import { fetchFoodInventoryTree } from '../../services/food';
import { fetchServicesByEvent } from '../../services/services';
import { liveCounterOptions, calculateLiveCounterPrice } from '../../data/services/celebrationsData';
import Wrapper from "../../components/wrapper";
import { FaPen, FaRegTrashAlt } from "react-icons/fa";
import "./styles.scss";

// MOCK: batch-prep swap suggestion. Later this will query the DB for orders in the
// same region + date that already include items in this item's section, so the team
// can propose a common dish to the client and cook once for multiple events.
const SWAP_POOL = [
  "Paneer Butter Masala", "Veg Pulao", "Gobi Manchurian", "Dal Tadka",
  "Jeera Rice", "Mixed Veg Curry", "Kadai Paneer", "Veg Biryani",
];
const hashStr = (s) => {
  let h = 0;
  for (let i = 0; i < String(s).length; i++) h = (h * 31 + String(s).charCodeAt(i)) >>> 0;
  return h;
};
const mockSwapSuggestion = (name) => {
  const h = hashStr(name || "item");
  let dish = SWAP_POOL[h % SWAP_POOL.length];
  if (dish.toLowerCase() === String(name || "").toLowerCase()) dish = SWAP_POOL[(h + 1) % SWAP_POOL.length];
  return { dish, count: (h % 3) + 2 }; // 2–4 nearby orders
};

const findLiveCounterDef = (title) =>
  liveCounterOptions.find((o) => String(o.title || "").toLowerCase() === String(title || "").toLowerCase());

// 5% per-choice discount mirrors calculateLiveCounterPrice
const choiceUnitPrice = (def, key) => {
  const c = (def?.recommendedChoices || []).find((rc) => rc.key === key);
  return c ? Math.round(Number(c.unitPrice || 0) * 0.95) : 0;
};

// Computed price for a service: live counters from the formula, others from stored price.
const rawServicePrice = (s) => {
  const def = findLiveCounterDef(s?.title);
  if (def) {
    const ei = s?.extraInfo || {};
    return calculateLiveCounterPrice(def, ei.hours ?? def.baseHours, ei.staff ?? def.baseStaff, ei);
  }
  return s?.price != null ? Number(s.price) : 0;
};

const API_BASE = ""; // set to your API prefix if needed, e.g. "/api"

// local seeds (used if you don't have managers/vendors endpoints)
const seedManagers = () => [
  { id: "Dhanush", name: "Dhanush Shetty" },
  { id: "Sushmitha", name: "Sushmitha Shetty" }
];

const seedVendors = () => [
  { id: "v_panipuri", name: "Hatti Panipuri Co.", services: ["Live Chats", "Live Chats"] },
  { id: "v_momo", name: "Momo Express", services: ["Live MOMO"] },
  { id: "v_bbq", name: "Grill Masters", services: ["Live BBQ"] },
  { id: "v_mocktail", name: "Mocktail Studio", services: ["Mocktail Bartender"] },
  { id: "v_photo", name: "Flash Photo Booths", services: ["Photo booth"] },
  { id: "v_balloon", name: "Balloon Artistry", services: ["Balloon Decoration"] },
];

const SERVICE_AREAS = [
  "Bangalore-North",
  "Bangalore-South",
  "Bangalore-East",
  "Bangalore-West",
  "Bangalore-Central",
];

const parseMoney = (v) => {
  if (typeof v === "number") return Number.isFinite(v) ? v : 0;
  if (typeof v === "string") {
    const n = Number(v.replace(/[^0-9.-]/g, ""));
    return Number.isFinite(n) ? n : 0;
  }
  return 0;
};
const formatINR = (n) => `₹${Number(n || 0).toLocaleString("en-IN", { maximumFractionDigits: 0 })}`;

/* --- normalization helpers (updated to keep unitPrice) --- */
function parseMenuEntry(entry) {
  if (!entry && entry !== 0) return null;

  const toNum = (v) => {
    if (v == null || v === "") return 0;
    const n = Number(v);
    return Number.isFinite(n) ? n : 0;
  };

  if (typeof entry === "string") {
    const parts = entry.split(":").map((p) => p.trim());
    const name = parts[0] || entry;
    const quantity = parts[1] ? Number(parts[1].replace(/[^\d]/g, "")) || 0 : 0;
    return {
      id: `menu-${name.replace(/\s+/g, "-").toLowerCase()}`,
      name,
      quantity,
      price: 0,
      unitPrice: 0,
      discount: 0,
      discountedPrice: 0,
    };
  }

  if (typeof entry === "object") {
    let unitPrice = 0;
    if (entry.unitPrice != null) {
      unitPrice = toNum(entry.unitPrice);
    } else if (entry.pricePerItem != null) {
      unitPrice = toNum(entry.pricePerItem);
    } else if (entry.price != null && (entry.quantity || entry.qty)) {
      const qty = toNum(entry.quantity ?? entry.qty);
      unitPrice = qty > 0 ? toNum(entry.price) / qty : toNum(entry.price);
    } else {
      unitPrice = toNum(entry.price ?? 0);
    }

    const quantity = Number(entry.quantity || entry.qty || 1);
    const priceTotal = toNum(entry.price ?? entry.total ?? unitPrice * quantity);

    let discountedTotal = null;
    if (entry.discountedPrice != null) discountedTotal = toNum(entry.discountedPrice);
    else if (entry.discount != null) discountedTotal = priceTotal - toNum(entry.discount);
    else discountedTotal = unitPrice * quantity;

    return {
      id: entry.id || entry._id || `menu-${(entry.name || entry.label || "item").replace(/\s+/g, "-").toLowerCase()}`,
      name: entry.name || entry.label || entry.title || (entry.itemName || "Item"),
      quantity: Number(quantity || 0),
      price: priceTotal,
      unitPrice: Number(unitPrice),
      discount: Number(entry.discount ?? 0),
      discountedPrice: Number(discountedTotal),
      raw: entry,
    };
  }
  return null;
}

function normalizeMenuSections(orderInner) {
  const raw = orderInner?.menu_sections || [];
  if (!Array.isArray(raw)) return [];
  return raw.map(parseMenuEntry).filter(Boolean);
}

function normalizeServices(orderInner) {
  const raw = orderInner?.services || [];
  if (!Array.isArray(raw)) return [];
  return raw.map((s) => {
    if (!s) return null;
    if (typeof s === "string") return { id: `svc-${s.replace(/\s+/g, "-").toLowerCase()}`, title: s, extraInfo: null, price: null, raw: s };
    const extra = s.extraInfo || s.extra || null;
    return {
      id: s.id || s._id || s.title || `svc-${(s.title || "service").replace(/\s+/g, "-").toLowerCase()}`,
      title: s.title || s.label || s.name || "Service",
      price: s.price != null ? Number(s.price) : (s.price && typeof s.price === "object" ? Number(s.price.min || s.price.max || 0) : null),
      extraInfo: extra,
      description: s.description || s.desc || "",
      raw: s,
      assignedVendor: s.assignedVendor || s.vendor || null,
    };
  }).filter(Boolean);
}

/* ----------------- component ----------------- */
export default function OrderDetailsPage() {
  const { orderId } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // fetched doc (top-level DB doc with `order` field)
  const [doc, setDoc] = useState(null);

  // pendingDoc holds local edits (not yet persisted). Initialize from doc on fetch.
  const [pendingDoc, setPendingDoc] = useState(null);

  // local lists (use seeds — optionally you could fetch from API)
  const [managers] = useState(() => seedManagers());
  const [vendors] = useState(() => seedVendors());

  // helper: find vendor object by id (from local vendors list)
  const getVendorById = (id) => {
    if (!id) return null;
    const found = vendors.find((v) => v.id === id);
    return found || null;
  };

  // convert a vendor id (string) into vendor object { id, name } or null
  const toVendorObject = (idOrObj) => {
    if (!idOrObj) return null;
    if (typeof idOrObj === "object") {
      if (idOrObj.id && idOrObj.name) return { id: idOrObj.id, name: idOrObj.name };
      if (idOrObj.vendor && typeof idOrObj.vendor === "object" && idOrObj.vendor.id) return { id: idOrObj.vendor.id, name: idOrObj.vendor.name || idOrObj.vendor.id };
      return null;
    }
    const v = getVendorById(String(idOrObj));
    if (v) return { id: v.id, name: v.name };
    return { id: String(idOrObj), name: String(idOrObj) };
  };

  // editable local state
  const [assignedManager, setAssignedManager] = useState("");
  const [serviceVendorMap, setServiceVendorMap] = useState({});
  const [catererVendor, setCatererVendor] = useState(""); // vendor id for caterer

  // payments draft state (editable fields in payments panel)
  const [paymentsDraft, setPaymentsDraft] = useState({}); // { vendorKey: { finalPayment: "0", vendorPayout: "0", taxes: "0", PAT: "0" } }

  // remarks textarea holds serialized remarks (editable)
  const [remarkText, setRemarkText] = useState("");

  // editor state for service extraInfo modal
  const [editingServiceId, setEditingServiceId] = useState(null);
  const [editingExtra, setEditingExtra] = useState({ plates: 0, note: '', choices: {} });

  // --- new: menu edit modal state ---
  const [editingMenuItemId, setEditingMenuItemId] = useState(null);
  const [editingMenuItemName, setEditingMenuItemName] = useState("");
  const [editingMenuQty, setEditingMenuQty] = useState(1);
  const [editingMenuUnitPrice, setEditingMenuUnitPrice] = useState(0);
  const [editingMenuOldQty, setEditingMenuOldQty] = useState(1);

  // --- new: Add Food modal state ---
  const [foodModalOpen, setFoodModalOpen] = useState(false);
  const [foodTree, setFoodTree] = useState(null); // nested response
  const [foodFlat, setFoodFlat] = useState([]); // flattened items for search
  const [foodLoading, setFoodLoading] = useState(false);
  const [foodError, setFoodError] = useState(null);
  const [foodSearch, setFoodSearch] = useState("");
  const [selectedFood, setSelectedFood] = useState(null);
  const [selectedFoodQty, setSelectedFoodQty] = useState(1);
  const [foodArea, setFoodArea] = useState(SERVICE_AREAS[0]);

  // Add-services modal state
  const [servicesModalOpen, setServicesModalOpen] = useState(false);
  const [availServices, setAvailServices] = useState([]);
  const [servicesLoading, setServicesLoading] = useState(false);
  const [servicesError, setServicesError] = useState(null);

  // fetch order by id
  useEffect(() => {
    setLoading(true);
    setError(null);

    const fetchOrder = async () => {
      try {
        const data = await fetchOrderById(orderId);
        setDoc(data);
        // create a deep-ish clone for pending local edits
        setPendingDoc(JSON.parse(JSON.stringify(data || {})));

        // initialize remarkText from data.remarks
        const remarks = data?.remarks ?? data?.order?.remarks ?? "";
        try {
          setRemarkText(remarks ?? "");
        } catch (e) {
          setRemarkText("");
        }

        // populate local assignment state from doc:
        const orderInner = data?.order || data || {};
        setAssignedManager(data?.assignedManager ?? data?.manager ?? orderInner?.assignedManager ?? "");
        // caterer vendor from top-level vendors map if present (extract id if vendor stored as object)
        const catererVendorFromDoc = data?.vendors?.caterer?.vendor ?? (orderInner?.vendors?.caterer?.vendor) ?? "";
        const catererVendorId = catererVendorFromDoc && typeof catererVendorFromDoc === 'object' ? (catererVendorFromDoc.id || "") : (catererVendorFromDoc || "");
        setCatererVendor(catererVendorId || "");

        // build serviceVendorMap from orderInner.services or payload.services
        const sv = {};
        const svcList = orderInner?.services || [];
        if (Array.isArray(svcList)) {
          svcList.forEach((s) => {
            const id = s?.id || s?._id || s?.title || (typeof s === "string" ? `svc-${s.replace(/\s+/g, "-").toLowerCase()}` : null);
            if (!id) return;
            // assignedVendor might be object or string — store local map as vendor id string (for selects)
            let assigned = s.assignedVendor || s.vendor || (data?.vendors && data.vendors[id] && data.vendors[id].vendor) || null;
            if (assigned && typeof assigned === 'object') {
              assigned = assigned.id || (assigned.vendor && assigned.vendor.id) || null;
            }
            sv[id] = assigned || null;
          });
        }
        setServiceVendorMap(sv);

        // initialize paymentsDraft from vendors map
        const vendorsMap = data?.vendors || {};
        const pd = {};
        Object.entries(vendorsMap).forEach(([k, v]) => {
          if (!v || v.vendor == null) return;
          pd[k] = {
            finalPayment: String(v.finalPayment ?? v.final_payment ?? 0),
            vendorPayout: String(v.vendorPayout ?? v.vendor_payout ?? 0),
            taxes: String(v.taxes ?? 0),
            PAT: String(v.PAT ?? 0),
          };
        });
        setPaymentsDraft(pd);
      } catch (err) {
        console.error(err);
        setError(String(err?.message || err));
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
    return () => {};
  }, [orderId]);

  // when pendingDoc changes (e.g. other local edits), keep remarkText in sync so user sees latest remarks
  useEffect(() => {
    if (!pendingDoc) return;
    const remarks = pendingDoc?.remarks ?? pendingDoc?.order?.remarks ?? "";
    try {
      setRemarkText(remarks ?? "");
    } catch (e) {
      // ignore
    }

    // also keep paymentsDraft in sync with pendingDoc.vendors if possible
    const vendorsMap = pendingDoc?.vendors || {};
    const pd = { ...paymentsDraft }; // preserve existing partial edits
    Object.entries(vendorsMap).forEach(([k, v]) => {
      if (!v || v.vendor == null) return;
      // only set defaults if not present in paymentsDraft to avoid overwriting user edits
      if (!pd[k]) {
        pd[k] = {
          finalPayment: String(v.finalPayment ?? v.final_payment ?? 0),
          vendorPayout: String(v.vendorPayout ?? v.vendor_payout ?? 0),
          taxes: String(v.taxes ?? 0),
          PAT: String(v.PAT ?? 0),
        };
      }
    });
    setPaymentsDraft(pd);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pendingDoc]);

  // derived normalized lists for rendering — use pendingDoc first (so edits reflect), fallback to doc
  const activeDoc = pendingDoc ?? doc;
  const orderInner = activeDoc?.order || activeDoc || null;
  const menuSections = useMemo(() => (orderInner ? normalizeMenuSections(orderInner) : []), [orderInner]);
  const services = useMemo(() => (orderInner ? normalizeServices(orderInner) : []), [orderInner]);

  // MOCK batch-prep suggestion: for each menu item pick a sibling from the SAME
  // catalog section (category + subcategory). Falls back to a static pool until
  // the catalog has loaded. Hash-keyed so the pick is stable (no re-roll on render).
  const swapSuggestions = useMemo(() => {
    const sections = {};        // "cat|sub" -> [itemName]
    const sectionByName = {};   // lowercased name -> "cat|sub"
    (foodFlat || []).forEach((it) => {
      const key = `${it._category || ""}|${it._subcategory || ""}`;
      (sections[key] || (sections[key] = [])).push(it.itemName);
      sectionByName[String(it.itemName || "").toLowerCase()] = key;
    });

    const out = {};
    (menuSections || []).forEach((m) => {
      const h = hashStr(m.name);
      const raw = m.raw || {};
      const cat = raw.category || raw._category;
      const sub = raw.subcategory || raw._subcategory;
      const key = (cat && sub) ? `${cat}|${sub}` : sectionByName[String(m.name || "").toLowerCase()];
      let dish = null;
      if (key && sections[key]) {
        const siblings = sections[key].filter((n) => String(n).toLowerCase() !== String(m.name).toLowerCase());
        if (siblings.length) dish = siblings[h % siblings.length];
      }
      if (!dish) dish = mockSwapSuggestion(m.name).dish; // fallback until catalog loads
      out[m.id || m.name] = { dish, count: (h % 3) + 2 };
    });
    return out;
  }, [foodFlat, menuSections]);

  // Live order total: anchor on the stored final price (the same value the
  // orders list shows) and adjust only by the *delta* of any menu edits, so with
  // no edits the two screens match exactly.
  const liveTotal = useMemo(() => {
    const storedPrice = doc?.order?.price || doc?.price || {};
    const storedNum = storedPrice._numeric || {};
    const storedFinal = (storedNum.finalPrice != null)
      ? Number(storedNum.finalPrice)
      : parseMoney(storedPrice.finalPrice);
    // stored final already has any previously-saved discount applied; add it back
    // to get the pre-discount subtotal baseline (admin discount is applied later).
    const baseSubtotal = storedFinal + Number(storedNum.adminDiscount || 0);

    const foodFinal = (list) => (list || []).reduce((acc, m) => {
      const qty = Number(m.quantity || 0);
      const unit = (m.unitPrice != null) ? Number(m.unitPrice) : (m.price && qty ? Number(m.price) / qty : 0);
      const line = (m.discountedPrice != null) ? Number(m.discountedPrice) : unit * qty;
      return acc + (Number.isFinite(line) ? line : 0);
    }, 0);

    const originalMenu = normalizeMenuSections(doc?.order || doc || {});
    const delta = foodFinal(menuSections) - foodFinal(originalMenu);
    return Math.max(0, Math.round(baseSubtotal + delta));
  }, [doc, menuSections]);

  // Mutate the pending order in place (deep-cloned) — used by inline field editors.
  const updatePending = (mutator) => {
    setPendingDoc((prev) => {
      const n = JSON.parse(JSON.stringify(prev || doc || {}));
      if (!n.order) n.order = {};
      mutator(n);
      return n;
    });
  };
  const setOrderField = (key, value) => updatePending((n) => { n.order[key] = value; });
  const setCustomerField = (key, value) => updatePending((n) => {
    if (!n.order.customerData) n.order.customerData = {};
    n.order.customerData[key] = value;
  });
  // veg/non-veg split — keeps `people` as the running sum
  const setDietGuests = (key, value) => updatePending((n) => {
    if (!n.order.dietConfig) n.order.dietConfig = {};
    n.order.dietConfig[key] = value;
    const veg = Number(n.order.dietConfig.vegGuests || 0);
    const nonveg = Number(n.order.dietConfig.nonVegGuests || 0);
    n.order.people = veg + nonveg;
  });

  // helper to call PATCH endpoint — keeps existing optimistic behavior but updates doc/pendingDoc from server result
  const persistPatch = async (patch) => {
    if (!doc?._id && !orderId) {
      setError("Missing order id");
      return null;
    }
    const id = doc?._id || orderId;
    try {
      const updated = await updateOrder(id, patch);
      setDoc(updated);
      setPendingDoc(JSON.parse(JSON.stringify(updated)));
      // sync small local maps
      if (updated?.vendors?.caterer?.vendor != null) {
        const cv = updated.vendors.caterer.vendor;
        setCatererVendor((cv && typeof cv === 'object') ? (cv.id || "") : (cv || ""));
      }
      setAssignedManager(updated?.assignedManager ?? updated?.manager ?? (updated.order && updated.order.assignedManager) ?? "");
      // update remarkText from server result
      const remarks = updated?.remarks ?? updated?.order?.remarks ?? [];
      try {
        setRemarkText(JSON.stringify(Array.isArray(remarks) ? remarks : [], null, 2));
      } catch (e) {}
      // update paymentsDraft from server result vendors
      const vendorsMap = updated?.vendors || {};
      const pd = {};
      Object.entries(vendorsMap).forEach(([k, v]) => {
        if (!v || v.vendor == null) return;
        pd[k] = {
          finalPayment: String(v.finalPayment ?? v.final_payment ?? 0),
          vendorPayout: String(v.vendorPayout ?? v.vendor_payout ?? 0),
          taxes: String(v.taxes ?? 0),
          PAT: String(v.PAT ?? 0),
        };
      });
      setPaymentsDraft(pd);
      return updated;
    } catch (err) {
      console.error("Failed to persist patch", err);
      setError(String(err?.message || err));
      // try to refresh
      try {
        const r = await fetch(`${API_BASE}/order/${encodeURIComponent(id)}`);
        if (r.ok) {
          const fresh = await r.json();
          setDoc(fresh);
          setPendingDoc(JSON.parse(JSON.stringify(fresh)));
        }
      } catch (e) {
        // ignore
      }
      return null;
    }
  };

  // Save the entire pendingDoc.order (and top-level fields) to server in one go
  // IMPORTANT: do NOT include `payload` or `payments` fields in the final PUT body
  const saveOrderToServer = async () => {
    if (!pendingDoc) return;
    const next = JSON.parse(JSON.stringify(pendingDoc));

    // remove payload and payments keys if present
    if ('payload' in next) delete next.payload;
    if ('payments' in next) delete next.payments;

    // ensure order block exists
    if (!next.order) next.order = {};

    // parse remarks textarea — if valid JSON array use it, otherwise convert to single remark object
    let parsedRemarks = null;
    try {
      const parsed = JSON.parse(remarkText);
      if (Array.isArray(parsed)) parsedRemarks = parsed;
    } catch (e) {
      // parse failed, treat remarkText as single string
      parsedRemarks = null;
    }

    if (parsedRemarks !== null) {
      next.remarks = parsedRemarks;
      next.order.remarks = parsedRemarks;
    } else {
      const trimmed = (remarkText || "").trim();
      if (trimmed.length > 0) {
        next.remarks = trimmed;
        next.order.remarks = trimmed;
      } else {
        next.remarks = "";
        next.order.remarks = "";
      }
    }

    // --- ensure vendors map includes caterer and all services from serviceVendorMap ---
    if (!next.vendors) next.vendors = {};

    // caterer (if selected) — convert id -> {id, name}
    if (!next.vendors.caterer) next.vendors.caterer = { vendor: null, finalPayment: 0, vendorPayout: 0, taxes: 0, PAT: 0 };
    next.vendors.caterer.vendor = catererVendor ? toVendorObject(catererVendor) : null;

    // for each service selected in serviceVendorMap, ensure a vendor entry exists in next.vendors
    Object.keys(serviceVendorMap || {}).forEach((svcKey) => {
      const vid = serviceVendorMap[svcKey];
      const vendorObj = vid ? toVendorObject(vid) : null;
      // keep the same structure as caterer: { vendor: { id, name }, finalPayment: 0, ... }
      if (!next.vendors[svcKey]) {
        next.vendors[svcKey] = { vendor: vendorObj, finalPayment: 0, vendorPayout: 0, taxes: 0, PAT: 0 };
      } else {
        next.vendors[svcKey] = { ...next.vendors[svcKey], vendor: vendorObj || next.vendors[svcKey].vendor || null };
      }
    });
    // --- END ---

    // ensure order.menu_sections exists and is an array (we don't create top-level menu_sections or payload)
    if (!Array.isArray(next.order.menu_sections)) next.order.menu_sections = [];

    // ensure manager is saved in order.manager instead of top-level assignedManager
    if (!next.order) next.order = {};
    next.order.manager = assignedManager || next.order.manager || next.manager || null;
    // ensure top-level manager remains in sync if previously used by API consumers
    if (next.order.manager && !next.manager) next.manager = next.order.manager;

    // persist the recomputed total (after negotiated discount) so the saved order reflects edits
    const adminDisc = Number(next.order.adminDiscount || 0);
    const finalPrice = Math.max(0, liveTotal - adminDisc);
    if (!next.order.price) next.order.price = {};
    next.order.price.finalPrice = formatINR(finalPrice);
    next.order.price._numeric = {
      ...(next.order.price._numeric || {}),
      finalPrice,
      adminDiscount: adminDisc,
    };

    // Build a patch limited to the fields UpdateOrderDto whitelists, so the
    // strict (whitelist + forbidNonWhitelisted) validation pipe accepts it.
    const patch = { order: next.order, vendors: next.vendors };
    const mgr = next.order.manager ?? next.manager;
    if (mgr) patch.manager = mgr;
    if (next.status) patch.status = next.status;
    if (typeof next.remarks === "string" && next.remarks.trim()) patch.remarks = next.remarks;
    else if (Array.isArray(next.remarks)) patch.remarks = JSON.stringify(next.remarks);
    if (next.order.date) patch.date = next.order.date;

    await persistPatch(patch);
    alert("Order saved to server.");
  };

  // Save caterer vendor selection to pendingDoc (not immediately persisted)
  const saveCatererVendor = async () => {
    const next = JSON.parse(JSON.stringify(pendingDoc || doc || {}));
    if (!next.vendors) next.vendors = {};
    if (!next.vendors.caterer) next.vendors.caterer = { vendor: null, finalPayment: 0, vendorPayout: 0, taxes: 0, PAT: 0 };
    // convert selected catererVendor (id string) into vendor object {id, name}
    next.vendors.caterer.vendor = catererVendor ? toVendorObject(catererVendor) : null;
    setPendingDoc(next);
    alert("Caterer vendor set locally (click 'Save Order' to persist).");
  };

  // Save vendor selection for a specific service into pendingDoc (local only)
  const saveServiceVendor = async (serviceId) => {
    if (!serviceId) return;
    const next = JSON.parse(JSON.stringify(pendingDoc || doc || {}));
    if (!next.vendors) next.vendors = {};
    // ensure service vendor block exists
    if (!next.vendors[serviceId]) next.vendors[serviceId] = { vendor: null, finalPayment: 0, vendorPayout: 0, taxes: 0, PAT: 0 };

    // get selected vendor id from serviceVendorMap and convert to vendor object
    const selectedVendorId = serviceVendorMap[serviceId] || null;
    next.vendors[serviceId].vendor = selectedVendorId ? toVendorObject(selectedVendorId) : null;

    // Also reflect assignedVendor under order.services (if services exist)
    const currentServices = (next.order || next)?.services || [];
    if (Array.isArray(currentServices)) {
      const updatedServices = currentServices.map((s) => {
        const id = s?.id || s?._id || s?.title || (typeof s === "string" ? `svc-${s.replace(/\s+/g, "-").toLowerCase()}` : null);
        if (!id) return s;
        if (id !== serviceId) return s;
        const base = typeof s === "string" ? { id, title: s } : { ...s };
        return { ...base, assignedVendor: next.vendors[serviceId].vendor };
      });
      if (!next.order) next.order = {};
      next.order.services = updatedServices;
    }

    setPendingDoc(next);
  };

  // Save payments for a specific vendor key into pendingDoc (local only)
  // paymentsDraft still exists as local editing state but we will NOT persist a top-level `payments` object.
  const savePaymentsForVendor = async (vendorKey) => {
    if (!vendorKey) return;
    const draft = paymentsDraft[vendorKey] || {};
    const next = JSON.parse(JSON.stringify(pendingDoc || doc || {}));
    if (!next.vendors) next.vendors = {};
    if (!next.vendors[vendorKey]) next.vendors[vendorKey] = { vendor: null, finalPayment: 0, vendorPayout: 0, taxes: 0, PAT: 0 };

    // coerce numbers (empty string -> 0)
    const finalPayment = Number(draft.finalPayment || 0);
    const vendorPayout = Number(draft.vendorPayout || 0);
    const taxes = Number(draft.taxes || 0);
    const PAT = Number(draft.PAT || 0);

    next.vendors[vendorKey] = {
      ...next.vendors[vendorKey],
      finalPayment,
      vendorPayout,
      taxes,
      PAT,
    };

    setPendingDoc(next);
  };

  // Service extra editor handlers — now operate on pendingDoc (local edits)
  const openExtraEditor = (service) => {
    setEditingServiceId(service.id);
    const existing = service.raw?.extraInfo || service.extraInfo || {};
    const plates = existing?.plates ?? 0;
    const note = existing?.note ?? '';
    const choices = { ...(existing?.choices || {}) };
    setEditingExtra({ plates: Number(plates || 0), note, choices });
  };

  const updateChoiceCount = (key, value) => {
    setEditingExtra((prev) => ({ ...prev, choices: { ...prev.choices, [key]: Number(value || 0) } }));
  };

  const saveExtraForService = async (serviceId) => {
    const next = JSON.parse(JSON.stringify(pendingDoc || doc || {}));
    const currentServices = (next.order || next)?.services || [];
    const updatedServices = Array.isArray(currentServices)
      ? currentServices.map((s) => {
          const id = s?.id || s?._id || s?.title || (typeof s === "string" ? `svc-${s.replace(/\s+/g, "-").toLowerCase()}` : null);
          if (!id) return s;
          if (id !== serviceId) return s;
          const base = typeof s === "string" ? { id, title: s } : { ...s };
          const newExtra = {
            ...(base.extraInfo || base.extra || {}),
            plates: Number(editingExtra.plates || 0),
            note: String(editingExtra.note || ''),
            choices: { ...(editingExtra.choices || {}) },
          };

          return {
            ...base,
            extraInfo: newExtra,
            raw: { ...(base.raw || {}), extraInfo: newExtra },
            assignedVendor: base.assignedVendor ?? base.vendor ?? null,
          };
        })
      : [];

    if (!next.order) next.order = {};
    next.order.services = updatedServices;

    setPendingDoc(next);
    setEditingServiceId(null);
    setEditingExtra({ plates: 0, choices: {} });
  };

  // --- new: open menu editor modal for a menu item ---
  const openMenuEditor = (menuItem) => {
    if (!menuItem) return;
    setEditingMenuItemId(menuItem.id);
    setEditingMenuItemName(menuItem.name || "");
    setEditingMenuQty(Number(menuItem.quantity || 1));
    // determine unit price to keep immutable in edits
    const unit = (menuItem.unitPrice != null && Number(menuItem.unitPrice) >= 0)
      ? Number(menuItem.unitPrice)
      : (menuItem.price && menuItem.quantity ? Number(menuItem.price) / (menuItem.quantity || 1) : 0);
    setEditingMenuUnitPrice(unit);
    setEditingMenuOldQty(Number(menuItem.quantity || 1));
  };

  // --- new: apply menu edits to pendingDoc (local only) ---
  const applyMenuEdit = () => {
    const next = JSON.parse(JSON.stringify(pendingDoc || doc || {}));

    const updateArray = (arr) => {
      if (!Array.isArray(arr)) return arr;
      return arr.map((m) => {
        const id = m?.id || m?._id || (m?.name && `menu-${m.name.replace(/\s+/g, "-").toLowerCase()}`) || null;
        if (!id) return m;
        if (id !== editingMenuItemId) return m;

        const unit = (m.unitPrice != null && Number(m.unitPrice) >= 0)
          ? Number(m.unitPrice)
          : (m.price && m.quantity ? Number(m.price) / (m.quantity || 1) : 0);

        const oldQty = Number(m.quantity || editingMenuOldQty || 1);
        const newQty = Number(editingMenuQty || 0);

        let existingDiscountTotal = 0;
        if (m.discountedPrice != null && !isNaN(Number(m.discountedPrice))) {
          const originalTotal = (m.price != null && !isNaN(Number(m.price))) ? Number(m.price) : unit * oldQty;
          existingDiscountTotal = originalTotal - Number(m.discountedPrice);
        } else if (m.discount != null && !isNaN(Number(m.discount))) {
          const d = Number(m.discount);
          if (oldQty > 0 && d <= unit) {
            existingDiscountTotal = d * oldQty;
          } else {
            existingDiscountTotal = d;
          }
        } else {
          existingDiscountTotal = 0;
        }

        const perUnitDiscount = oldQty > 0 ? existingDiscountTotal / oldQty : existingDiscountTotal;

        const newTotal = unit * newQty;
        const newDiscountTotal = perUnitDiscount * newQty;
        const newDiscountedPrice = Math.max(0, newTotal - newDiscountTotal);

        const updated = {
          ...(typeof m === "string" ? { id, name: m } : { ...m }),
          quantity: newQty,
          unitPrice: unit,
          price: newTotal,
          // keep 'discount' as per-unit discount to be clear
          discount: perUnitDiscount,
          discountedPrice: newDiscountedPrice,
        };
        return updated;
      });
    };

    if (!next.order) next.order = {};
    if (Array.isArray(next.order.menu_sections)) {
      next.order.menu_sections = updateArray(next.order.menu_sections);
    } else {
      next.order.menu_sections = updateArray(menuSections);
    }

    setPendingDoc(next);
    // close modal
    setEditingMenuItemId(null);
    setEditingMenuItemName("");
    setEditingMenuQty(1);
    setEditingMenuUnitPrice(0);
    setEditingMenuOldQty(1);
  };

  // --- new: delete menu item from pendingDoc (local only) ---
  const deleteMenuItem = (menuItem) => {
    if (!menuItem) return;
    const idToRemove = menuItem.id;
    const next = JSON.parse(JSON.stringify(pendingDoc || doc || {}));

    const filterFn = (arr) => {
      if (!Array.isArray(arr)) return arr;
      return arr.filter((m) => {
        const id = (m && (m.id || m._id)) || (typeof m === "string" && `menu-${m.replace(/\s+/g, "-").toLowerCase()}`) || null;
        return id !== idToRemove;
      });
    };

    if (!next.order) next.order = {};
    if (Array.isArray(next.order.menu_sections)) next.order.menu_sections = filterFn(next.order.menu_sections);
    else next.order.menu_sections = (menuSections || []).filter(m => (m.id || m._id) !== idToRemove);

    setPendingDoc(next);
  };

  // --- food API helpers ---
  const fetchFoodList = async (area = foodArea) => {
    setFoodLoading(true);
    setFoodError(null);
    try {
      const data = await fetchFoodInventoryTree(area);
      const tree = (data && typeof data === "object") ? data : {};
      setFoodTree(tree);
      // flatten the nested { category: { subcategory: [items] } } tree for search
      const flat = [];
      Object.entries(tree).forEach(([category, subcats]) => {
        Object.entries(subcats || {}).forEach(([subcat, items]) => {
          (items || []).forEach((it) => {
            flat.push({ ...it, _category: category, _subcategory: subcat });
          });
        });
      });
      setFoodFlat(flat);
    } catch (err) {
      console.error("Failed to load food catalog", err);
      setFoodError(err?.response?.data?.message || err?.message || "Failed to load food catalog");
    } finally {
      setFoodLoading(false);
    }
  };

  // open food modal (fetch if not loaded)
  const openAddFoodModal = () => {
    setFoodSearch("");
    setSelectedFood(null);
    setSelectedFoodQty(1);
    setFoodModalOpen(true);
    if (!foodTree) fetchFoodList();
  };

  // Load the catalog once the order is ready so the batch-prep swap suggestions
  // can pick a real sibling item from the same section.
  useEffect(() => {
    if (doc && !foodTree) fetchFoodList();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [doc]);

  const changeFoodArea = (area) => {
    setFoodArea(area);
    setSelectedFood(null);
    fetchFoodList(area);
  };

  // --- Add services to the order ---
  const openServicesModal = async () => {
    setServicesModalOpen(true);
    if (availServices.length) return;
    setServicesLoading(true);
    setServicesError(null);
    try {
      const eventType = displayEventType();
      const data = await fetchServicesByEvent(eventType);
      const steps = Array.isArray(data) ? data : (data?.steps || []);
      // flatten each step's option groups into a simple addable list
      const flat = [];
      steps.forEach((step) => {
        (step.options || []).forEach((g) => {
          flat.push({
            id: g._id || g.id || `${step.type}-${(g.title || "service").replace(/\s+/g, "-").toLowerCase()}`,
            title: g.title || g.name || "Service",
            price: Number(g.price?.min ?? g.price?.value ?? g.price ?? 0),
            type: step.type || "service",
            image: g.image || (g.imgs && g.imgs[0]) || null,
          });
        });
      });
      setAvailServices(flat);
    } catch (err) {
      console.error("Failed to load services", err);
      setServicesError(err?.response?.data?.message || err?.message || "Failed to load services");
    } finally {
      setServicesLoading(false);
    }
  };

  const addServiceToOrder = (svc) => {
    updatePending((n) => {
      if (!Array.isArray(n.order.services)) n.order.services = [];
      // avoid duplicates by id
      if (n.order.services.some((s) => (s?.id || s?._id) === svc.id)) return;
      n.order.services.push({
        id: svc.id,
        title: svc.title,
        type: svc.type,
        price: svc.price,
        extraInfo: {},
      });
    });
  };

  const removeServiceFromOrder = (svcId) => {
    updatePending((n) => {
      if (Array.isArray(n.order.services)) {
        n.order.services = n.order.services.filter((s) => (s?.id || s?._id || s?.title) !== svcId);
      }
    });
  };

  const onSelectFoodItem = (item) => {
    setSelectedFood(item);
    setSelectedFoodQty(1);
  };

  const addFoodToOrder = () => {
    if (!selectedFood) return;
    const qty = Number(selectedFoodQty || 0);
    if (qty <= 0) {
      alert("Quantity must be at least 1");
      return;
    }

    const unitPrice = Number(selectedFood.price ?? 0);
    const newItem = {
      id: selectedFood._id || `menu-${(selectedFood.itemName || "item").replace(/\s+/g, "-").toLowerCase()}`,
      name: selectedFood.itemName || selectedFood.name || "Item",
      quantity: qty,
      unitPrice,
      price: unitPrice * qty,
      // a simple default discount example; adjust as you prefer
      discount: Number((unitPrice * 0.05).toFixed(2)), // per-unit discount
      discountedPrice: Number(((unitPrice - unitPrice * 0.05) * qty).toFixed(2)),
      raw: { ...selectedFood },
    };

    const next = JSON.parse(JSON.stringify(pendingDoc || doc || {}));
    if (!next.order) next.order = {};
    if (!Array.isArray(next.order.menu_sections)) next.order.menu_sections = [];
    next.order.menu_sections.push(newItem);

    setPendingDoc(next);
    setFoodModalOpen(false);
    setSelectedFood(null);
    setSelectedFoodQty(1);
  };

  if (loading) {
    return (
      <Wrapper headertext="Order details" footer={false}>
        <div className="admin-orders-page p-6">Loading...</div>
      </Wrapper>
    );
  }

  if (error) {
    return (
      <Wrapper headertext="Order details" footer={false}>
        <div className="admin-orders-page p-6">
          <button className="btn" onClick={() => navigate(-1)}>Back</button>
          <div>Error: {error}</div>
        </div>
      </Wrapper>
    );
  }

  if (!doc) {
    return (
      <Wrapper headertext="Order details" footer={false}>
        <div className="admin-orders-page p-6">
          <button className="btn" onClick={() => navigate(-1)}>Back</button>
          <div>Order not found.</div>
        </div>
      </Wrapper>
    );
  }

  // display helpers - prefer top-level fields, then fallback to inner order
  const displayDate = () => {
    const d = activeDoc?.date || activeDoc?.createdDate || orderInner?.date || orderInner?.eventTime || null;
    return d ? new Date(d).toLocaleString() : "-";
  };
  const displayEventType = () => (orderInner?.eventType || activeDoc?.eventType || "-").toString();

  // --- pricing / payment derivations ---
  const sumFood = (selector) => (menuSections || []).reduce((acc, m) => {
    const qty = Number(m.quantity || 0);
    const unit = (m.unitPrice != null) ? Number(m.unitPrice) : (m.price && qty ? Number(m.price) / qty : 0);
    return acc + selector(unit, qty, m);
  }, 0);
  const foodGross = Math.round(sumFood((unit, qty) => unit * qty));
  const foodNet = Math.round(sumFood((unit, qty, m) => (m.discountedPrice != null) ? Number(m.discountedPrice) : unit * qty));
  const itemDiscount = Math.max(0, foodGross - foodNet);
  // services contribution = whatever's left of the (anchored) live total after food
  const servicePortion = Math.max(0, Math.round(liveTotal - foodNet));
  // distribute the anchored services total across services by their computed weight,
  // so each service shows a real price that still sums to the services subtotal.
  const serviceRaws = services.map(rawServicePrice);
  const rawServiceSum = serviceRaws.reduce((a, b) => a + b, 0);
  const servicePriceAt = (idx) => {
    if (rawServiceSum > 0) return Math.round(servicePortion * (serviceRaws[idx] / rawServiceSum));
    return services.length ? Math.round(servicePortion / services.length) : 0;
  };
  const adminDiscount = Number(orderInner?.adminDiscount || 0);
  const finalQuote = Math.max(0, liveTotal - adminDiscount);
  const advancePercent = orderInner?.advancePercent ?? 50;
  const advanceAmount = Math.round((finalQuote * Number(advancePercent || 0)) / 100);
  const balanceDue = Math.max(0, finalQuote - advanceAmount);
  const totalDiscount = itemDiscount + adminDiscount;

  return (
    <Wrapper headertext={`Order Details`} footer={false}>
      <div className="admin-orders-details-page">

        <div className="card od-hero">
          <div className="od-hero__left">
            <span className="od-id">#{orderInner?.orderNumber || activeDoc?._id}</span>
            <h2 className="eventTitle">{displayEventType()}</h2>
            <div className="od-date">{displayDate()}</div>
          </div>
          <div className="od-hero__right">
            <span className={`statusBadge ${activeDoc?.status}`}>{activeDoc?.status || "—"}</span>
            <div className="od-quote">{formatINR(finalQuote)}</div>
            <div className="small muted">{adminDiscount > 0 ? `after ₹${adminDiscount.toLocaleString("en-IN")} discount` : "Final total"}</div>
          </div>
        </div>

        <section className="card od-form">
          <h3>Order Details</h3>
          <div className="od-grid">
            <label className="od-field">
              <span className="od-label">Status</span>
              <select className="input" value={pendingDoc?.status ?? doc?.status ?? ""}
                onChange={(e) => setPendingDoc((prev) => ({ ...(prev || doc || {}), status: e.target.value }))}>
                <option value="new">new</option>
                <option value="confirmed">confirmed</option>
                <option value="contacted">contacted</option>
                <option value="delivered">delivered</option>
                <option value="cancelled">cancelled</option>
                <option value="payment done">payment done</option>
              </select>
            </label>

            <label className="od-field">
              <span className="od-label">Manager</span>
              <select className="input" value={assignedManager || activeDoc?.order?.manager || activeDoc?.manager || ""}
                onChange={(e) => setAssignedManager(e.target.value)}>
                <option value="">— choose manager —</option>
                {managers.map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}
              </select>
            </label>

            <label className="od-field">
              <span className="od-label">Diet config</span>
              <select className="input" value={orderInner?.dietConfig?.dietMode ?? ""}
                onChange={(e) => updatePending((n) => { if (!n.order.dietConfig) n.order.dietConfig = {}; n.order.dietConfig.dietMode = e.target.value; })}>
                <option value="">—</option>
                <option value="veg-only">veg-only</option>
                <option value="veg+nonveg">veg+nonveg</option>
              </select>
            </label>

            {orderInner?.dietConfig?.dietMode === "veg+nonveg" ? (
              <>
                <label className="od-field">
                  <span className="od-label">Veg guests</span>
                  <input className="input" type="number" min={0} value={orderInner?.dietConfig?.vegGuests ?? ""}
                    onChange={(e) => setDietGuests("vegGuests", e.target.value === "" ? "" : Number(e.target.value))} />
                </label>
                <label className="od-field">
                  <span className="od-label">Non-veg guests</span>
                  <input className="input" type="number" min={0} value={orderInner?.dietConfig?.nonVegGuests ?? ""}
                    onChange={(e) => setDietGuests("nonVegGuests", e.target.value === "" ? "" : Number(e.target.value))} />
                </label>
                <label className="od-field">
                  <span className="od-label">Total guests</span>
                  <input className="input" type="number" value={orderInner?.people ?? 0} readOnly />
                </label>
              </>
            ) : (
              <label className="od-field">
                <span className="od-label">People</span>
                <input className="input" type="number" min={0} value={orderInner?.people ?? ""}
                  onChange={(e) => setOrderField("people", e.target.value === "" ? "" : Number(e.target.value))} />
              </label>
            )}

            <label className="od-field od-field--full">
              <span className="od-label">Special request</span>
              <textarea className="input" rows={2} value={orderInner?.special_request ?? ""}
                onChange={(e) => setOrderField("special_request", e.target.value)} />
            </label>
          </div>
        </section>

        <section className="card od-form">
          <h3>Customer Info</h3>
          <div className="od-grid">
            <label className="od-field">
              <span className="od-label">Name</span>
              <input className="input" value={orderInner?.customerData?.name ?? orderInner?.customer?.name ?? ""}
                onChange={(e) => setCustomerField("name", e.target.value)} />
            </label>
            <label className="od-field">
              <span className="od-label">Phone</span>
              <input className="input" value={orderInner?.customerData?.phone ?? orderInner?.customer?.phone ?? ""}
                onChange={(e) => setCustomerField("phone", e.target.value)} />
            </label>
            <label className="od-field od-field--full">
              <span className="od-label">Address</span>
              <input className="input" value={orderInner?.customerData?.address ?? orderInner?.customer?.address ?? ""}
                onChange={(e) => setCustomerField("address", e.target.value)} />
            </label>
            <label className="od-field">
              <span className="od-label">Area</span>
              <input className="input" value={orderInner?.customerData?.area ?? orderInner?.customer?.area ?? ""}
                onChange={(e) => setCustomerField("area", e.target.value)} />
            </label>
            <label className="od-field">
              <span className="od-label">Pincode</span>
              <input className="input" value={orderInner?.customerData?.pincode ?? orderInner?.customer?.pincode ?? ""}
                onChange={(e) => setCustomerField("pincode", e.target.value)} />
            </label>
          </div>
          <div className="small muted">Edits apply when you click <strong>Save Order</strong> at the bottom.</div>
        </section>

        {menuSections.length ? <section className="card">
          <h3>Food Menu</h3>

          <div className="catererRow">
            <select className="input" value={catererVendor || ""} onChange={(e) => setCatererVendor(e.target.value || "")} >
              <option value="">— choose vendor —</option>
              {vendors.map((v) => <option key={v.id} value={v.id}>{v.name}</option>)}
            </select>
            <button className="btn" onClick={saveCatererVendor}>Save</button>
          </div>

          <table className="miniTable">
            <thead>
              <tr>
                <th>Item</th>
                <th>Qty</th>
                <th>Price</th>
                <th>Total</th>
                <th className="right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {menuSections.map((m) => {
                const unit = (m.unitPrice != null && Number(m.unitPrice) >= 0)
                  ? Number(m.unitPrice)
                  : (m.price && m.quantity ? Number(m.price) / (m.quantity || 1) : 0);
                const qty = Number(m.quantity || 0);
                const final = unit * qty;
                const discounted = (m.discountedPrice != null) ? Number(m.discountedPrice) : final - (Number(m.discount || 0) * qty);
                const swap = swapSuggestions[m.id || m.name] || mockSwapSuggestion(m.name);
                const region = orderInner?.customerData?.area || orderInner?.customer?.area || "this region";
                return (
                  <React.Fragment key={m.id || m.name}>
                    <tr>
                      <td>{m.name}</td>
                      <td>{m.quantity}</td>
                      <td className="mono">₹{unit}</td>
                      <td className="mono">
                        {discounted != null && discounted < final
                          ? (
                            <>
                              <span className="original-price">₹{final}</span>
                              <span className="discounted-price">₹{discounted}</span>
                            </>
                          )
                          : `₹${final}`
                        }
                      </td>
                      <td className="right">
                        <div className="fi-actions">
                          <button
                            className="iconButton"
                            onClick={() => openMenuEditor(m)}
                            title={`Edit ${m.name}`}
                            aria-label={`Edit ${m.name}`}
                          >
                            <FaPen />
                          </button>
                          <button
                            className="iconButton iconButton--danger"
                            onClick={() => deleteMenuItem(m)}
                            title={`Delete ${m.name}`}
                            aria-label={`Delete ${m.name}`}
                          >
                            <FaRegTrashAlt />
                          </button>
                        </div>
                      </td>
                    </tr>
                    <tr className="swapRow">
                      <td colSpan="5">
                        <div className="swapHint">
                          <span className="swapHint__icon">🤝</span>
                          <span className="swapHint__text">
                            <strong>{swap.count}</strong> nearby order{swap.count > 1 ? "s" : ""} in {region} today also cook this section — swap to{" "}
                            <strong>{swap.dish}</strong> to batch-prep together.
                          </span>
                          <span className="swapHint__soon">preview</span>
                          <button
                            className="swapHint__btn"
                            onClick={() => alert(`Swap "${m.name}" → "${swap.dish}" to batch-prep — feature coming soon`)}
                          >
                            Swap
                          </button>
                        </div>
                      </td>
                    </tr>
                  </React.Fragment>
                );
              })}
              {menuSections.length === 0 && <tr><td colSpan="5" className="empty">No menu items</td></tr>}
            </tbody>
          </table>
          <button className="btn cutomer-edit-button" onClick={openAddFoodModal}>Add Food</button>

          {/* --- Menu edit modal --- */}
          {editingMenuItemId && (
            <div className="modalOverlay">
              <div className="modalDialog">
                <div className="modalHeader">Edit quantity for {editingMenuItemName}</div>
                <div className="modalBody">
                  <div className="modalRow">
                    <label className="small">Unit Price</label>
                    <input
                      className="input"
                      value={`₹${editingMenuUnitPrice}`}
                      readOnly
                    />
                  </div>

                  <div className="modalRow">
                    <label className="small">Quantity</label>
                    <input
                      className="input"
                      type="number"
                      min={0}
                      value={editingMenuQty}
                      onChange={(e) => setEditingMenuQty(Number(e.target.value || 0))}
                    />
                  </div>

                  <div className="modalRow">
                    <label className="small">Final Price (after discount)</label>
                    <input
                      className="input"
                      value={`₹${(() => {
                        const unit = Number(editingMenuUnitPrice || 0);
                        const oldQty = Number(editingMenuOldQty || 1);
                        const newQty = Number(editingMenuQty || 0);

                        const currentMenu = (pendingDoc?.order?.menu_sections || []).find(x => (x && (x.id || x._id)) === editingMenuItemId);
                        let perUnitDiscount = 0;
                        if (currentMenu) {
                          const m = currentMenu;
                          if (m.discountedPrice != null && !isNaN(Number(m.discountedPrice))) {
                            const originalTotal = (m.price != null && !isNaN(Number(m.price))) ? Number(m.price) : (Number(m.unitPrice || unit) * Number(m.quantity || oldQty));
                            const existingDiscountTotal = originalTotal - Number(m.discountedPrice);
                            perUnitDiscount = oldQty > 0 ? existingDiscountTotal / oldQty : existingDiscountTotal;
                          } else if (m.discount != null && !isNaN(Number(m.discount))) {
                            const d = Number(m.discount);
                            if (oldQty > 0 && d <= (m.unitPrice ?? unit)) {
                              perUnitDiscount = d;
                            } else {
                              perUnitDiscount = oldQty > 0 ? d / oldQty : d;
                            }
                          }
                        }

                        const newTotal = unit * newQty;
                        const newDiscountTotal = perUnitDiscount * newQty;
                        const newDiscounted = Math.max(0, newTotal - newDiscountTotal);
                        return newDiscounted;
                      })()}`}
                      readOnly
                    />
                  </div>
                </div>
                <div className="modalFooter">
                  <button
                    className="btn"
                    onClick={() => applyMenuEdit()}
                  >
                    Apply
                  </button>
                  <button
                    className="btn"
                    onClick={() => { setEditingMenuItemId(null); setEditingMenuItemName(""); setEditingMenuQty(1); setEditingMenuUnitPrice(0); setEditingMenuOldQty(1); }}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* --- Add Food modal --- */}
          {foodModalOpen && (
            <div className="modalOverlay">
              <div className="modalDialog foodModal">
                <div className="modalHeader">
                  <span>Add Food Item</span>
                  <button className="fi-close-btn" aria-label="Close" onClick={() => { setSelectedFood(null); setSelectedFoodQty(1); setFoodModalOpen(false); }}>✕</button>
                </div>
                <div className="modalBody">
                  <div className="modalRow">
                    <label className="small">Catalog area</label>
                    <select className="input" value={foodArea} onChange={(e) => changeFoodArea(e.target.value)}>
                      {SERVICE_AREAS.map((a) => <option key={a} value={a}>{a}</option>)}
                    </select>
                  </div>
                  <input className="input foodSearch" placeholder="Search food..." value={foodSearch} onChange={(e) => setFoodSearch(e.target.value)} />
                  <div className="foodSearchRow" style={{ display: "flex", gap: 8, alignItems: "center" }}>
                    <input className="input" style={{ width: 90 }} type="number" min={1} value={selectedFoodQty} onChange={(e) => setSelectedFoodQty(Number(e.target.value || 1))} />
                    <button className="btn" onClick={() => addFoodToOrder()} disabled={!selectedFood}>Add to order</button>
                  </div>
                  {selectedFood && <div className="small muted">Selected: <strong>{selectedFood.itemName}</strong> — ₹{selectedFood.price}</div>}

                  <div className="foodListContainer" style={{ marginTop: 10, maxHeight: '60vh', overflow: 'auto' }}>
                    {foodLoading && <div className="small muted">Loading menu...</div>}
                    {foodError && <div className="small" style={{ color: 'red' }}>{foodError}</div>}

                    {/* if search term present show flat filtered list */}
                    {foodSearch ? (
                      <div className="foodList">
                        {foodFlat.filter(it => String(it.itemName || "").toLowerCase().includes(foodSearch.toLowerCase())).map((it) => (
                          <div
                            key={it._id}
                            className={`foodItem ${selectedFood && selectedFood._id === it._id ? 'selected' : ''}`}
                            onClick={() => onSelectFoodItem(it)}
                            role="button"
                          >
                            <div style={{ fontWeight: 700 }}>{it.itemName}</div>
                            <div className="muted small">{it._category} › {it._subcategory} — ₹{it.price}</div>
                          </div>
                        ))}
                        {foodFlat.filter(it => String(it.itemName || "").toLowerCase().includes(foodSearch.toLowerCase())).length === 0 && <div className="empty">No results</div>}
                      </div>
                    ) : (
                      // grouped view
                      <div className="foodGroupedList">
                        {Object.entries(foodTree || {}).map(([cat, subcats]) => (
                          <div key={cat} style={{ marginBottom: 8 }}>
                            <div className="categoryHeader">{cat}</div>
                            {Object.entries(subcats || {}).map(([sub, items]) => (
                              <div key={sub}>
                                <div className="subcategoryHeader">{sub}</div>
                                <div className="subcategoryItems">
                                  {(items || []).map((it) => (
                                    <div
                                      key={it._id}
                                      className={`foodItem ${selectedFood && selectedFood._id === it._id ? 'selected' : ''}`}
                                      onClick={() => onSelectFoodItem({ ...it, _category: cat, _subcategory: sub })}
                                      role="button"
                                    >
                                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <div style={{ fontWeight: 700 }}>{it.itemName}</div>
                                        <div className="muted small">₹{it.price}</div>
                                      </div>
                                      <div className="muted small">{cat} › {sub}</div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            ))}
                          </div>
                        ))}
                        {(!foodTree || Object.keys(foodTree).length === 0) && !foodLoading && <div className="empty">No menu loaded</div>}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </section> : <></>}

        <section className="card">
          <h3>Services</h3>
          <ul className="serviceList">
            {services.length > 0 ? (
              services.map((s, sidx) => {
                const svcId = s.id;
                const isEditing = editingServiceId === svcId;
                const def = findLiveCounterDef(s.title);
                return (
                  <li key={svcId} className="serviceRow svcCard">
                    <div className="svcCard__head">
                      <div className="serviceTitle">{s.title}</div>
                      <div className="svcCard__price">{formatINR(servicePriceAt(sidx))}</div>
                      {s.extraInfo && typeof s.extraInfo === "object" && (
                        <div className="svcCard__actions">
                          <button className="btn edit-btn" onClick={() => openExtraEditor(s)}>Edit</button>
                          <button className="btn edit-btn" onClick={() => removeServiceFromOrder(svcId)}>Delete</button>
                        </div>
                      )}
                    </div>

                    <div className="svcCard__vendor">
                      <select
                        className="input"
                        value={serviceVendorMap[svcId] || ""}
                        onChange={(e) => setServiceVendorMap((prev) => ({ ...prev, [svcId]: e.target.value || null }))}
                      >
                        <option value="">— choose vendor —</option>
                        {vendors.map((v) => (
                          <option key={v.id} value={v.id}>{v.name}</option>
                        ))}
                      </select>
                      <button className="btn" onClick={() => saveServiceVendor(svcId)}>Save</button>
                    </div>

                    {s.description && <div className="small muted">{s.description}</div>}
                    {def && <div className="small muted">Base fee {formatINR(def.baseFee)}</div>}
                    {s.extraInfo && typeof s.extraInfo === "object" && (
                      <div className="extraInfoBlock">
                        <div className="svcMeta">
                          {s.extraInfo.plates != null && <span className="svcChip">{s.extraInfo.plates} plates</span>}
                          {s.extraInfo.note && <span className="svcChip svcChip--note">{s.extraInfo.note}</span>}
                        </div>
                        {s.extraInfo.choices && typeof s.extraInfo.choices === "object" && (
                          <ul className="choiceList">
                            {Object.entries(s.extraInfo.choices).map(([k, v]) => {
                              const unit = def ? choiceUnitPrice(def, k) : 0;
                              const label = def?.recommendedChoices?.find((c) => c.key === k)?.label || k;
                              return (
                                <li key={k} className="choiceList__row">
                                  <span className="choiceList__name">{label}</span>
                                  <span className="choiceList__qty">×{v}</span>
                                  {unit > 0 && <span className="choiceList__unit">@ ₹{unit}</span>}
                                  {unit > 0 && <span className="choiceList__price mono">{formatINR(Number(v) * unit)}</span>}
                                </li>
                              );
                            })}
                          </ul>
                        )}
                      </div>
                    )}

                    {isEditing && (() => {
                      const closeEditor = () => { setEditingServiceId(null); setEditingExtra({ plates: 0, choices: {} }); };
                      const choiceEntries = Object.entries(editingExtra.choices || {});
                      const allocated = choiceEntries.reduce((sum, [, v]) => sum + Number(v || 0), 0);
                      const plates = Number(editingExtra.plates || 0);
                      const matches = allocated === plates;
                      return (
                        <div className="modalOverlay" onClick={closeEditor}>
                          <div className="modalDialog extraModal" onClick={(e) => e.stopPropagation()}>
                            <div className="modalHeader">
                              <span>Edit extra · {s.title}</span>
                              <button className="fi-close-btn" aria-label="Close" onClick={closeEditor}>✕</button>
                            </div>

                            <div className="modalBody">
                              <div className="extraGrid">
                                <div className="modalRow">
                                  <label className="small">Plates</label>
                                  <input className="input" type="number" min={0} value={editingExtra.plates} onChange={(e) => setEditingExtra((p) => ({ ...p, plates: Number(e.target.value || 0) }))} />
                                </div>
                                <div className="modalRow">
                                  <label className="small">Note</label>
                                  <input className="input" type="text" placeholder="Optional note" value={editingExtra.note || ""} onChange={(e) => setEditingExtra((p) => ({ ...p, note: String(e.target.value || '') }))} />
                                </div>
                              </div>

                              <div className="choicesEditor">
                                <div className="choicesEditor__head">
                                  <span className="choicesEditor__title">Choices</span>
                                  {choiceEntries.length > 0 && (
                                    <span className={`choicesEditor__tally ${matches ? 'ok' : 'warn'}`}>
                                      {allocated} / {plates} plates
                                    </span>
                                  )}
                                </div>
                                {choiceEntries.length === 0 ? (
                                  <div className="small muted">No choices for this service.</div>
                                ) : (
                                  choiceEntries.map(([k, v]) => (
                                    <div key={k} className="choiceRow">
                                      <span className="choiceKey">{k}</span>
                                      <input className="input choiceInput" type="number" min={0} value={String(v)} onChange={(e) => updateChoiceCount(k, Number(e.target.value || 0))} />
                                    </div>
                                  ))
                                )}
                              </div>
                            </div>

                            <div className="modalFooter">
                              <button className="btn ghost" onClick={closeEditor}>Cancel</button>
                              <button className="btn" onClick={() => saveExtraForService(svcId)}>Save</button>
                            </div>
                          </div>
                        </div>
                      );
                    })()}
                  </li>
                );
              })
            ) : (
              <div className="empty">No services</div>
            )}
          </ul>
          <button className="btn cutomer-edit-button" onClick={openServicesModal}>+ Add Services</button>

          {servicesModalOpen && (
            <div className="modalOverlay" onClick={() => setServicesModalOpen(false)}>
              <div className="modalDialog servicesModal" onClick={(e) => e.stopPropagation()}>
                <div className="modalHeader">
                  <span>Add Services · {displayEventType()}</span>
                  <button className="fi-close-btn" aria-label="Close" onClick={() => setServicesModalOpen(false)}>✕</button>
                </div>
                <div className="modalBody">
                  {servicesLoading && <div className="small muted">Loading services…</div>}
                  {servicesError && <div className="ao-error">{servicesError}</div>}
                  {(() => {
                    if (servicesLoading || servicesError) return null;
                    const addedIds = new Set((orderInner?.services || []).map((s) => s?.id || s?._id));
                    const options = availServices.filter((svc) => !addedIds.has(svc.id));
                    if (availServices.length === 0) {
                      return <div className="empty">No services available for this event.</div>;
                    }
                    if (options.length === 0) {
                      return <div className="empty">All available services are already added.</div>;
                    }
                    return options.map((svc) => (
                      <div key={svc.id} className="svcPick">
                        <div className="svcPick__main">
                          <div className="svcPick__title">{svc.title}</div>
                          <div className="small muted">{svc.type}{svc.price ? ` · ₹${svc.price}` : ""}</div>
                        </div>
                        <button className="btn" onClick={() => addServiceToOrder(svc)}>Add</button>
                      </div>
                    ));
                  })()}
                </div>
                <div className="modalFooter">
                  <button className="btn" onClick={() => setServicesModalOpen(false)}>Done</button>
                </div>
              </div>
            </div>
          )}
        </section>

        <section className="card od-pricing">
          <h3>Pricing &amp; Payment</h3>

          {/* itemized breakdown for explaining the quote to the client */}
          <div className="od-breakdown">
            <div className="od-bd-group">
              <div className="od-bd-head">Food menu</div>
              {menuSections.length === 0 ? (
                <div className="small muted">No food items</div>
              ) : (
                menuSections.map((m) => {
                  const qty = Number(m.quantity || 0);
                  const unit = (m.unitPrice != null) ? Number(m.unitPrice) : (m.price && qty ? Number(m.price) / qty : 0);
                  const line = (m.discountedPrice != null) ? Number(m.discountedPrice) : unit * qty;
                  return (
                    <div className="od-bd-row" key={m.id || m.name}>
                      <span className="od-bd-name">{m.name} <em>×{qty}</em></span>
                      <span className="mono">{formatINR(line)}</span>
                    </div>
                  );
                })
              )}
              <div className="od-bd-row od-bd-sub">
                <span>Food subtotal</span>
                <span className="mono">{formatINR(foodNet)}</span>
              </div>
            </div>

            <div className="od-bd-group">
              <div className="od-bd-head">Services &amp; live counters</div>
              {services.length === 0 ? (
                <div className="small muted">No services</div>
              ) : (
                services.map((s, idx) => (
                  <div className="od-bd-row" key={s.id}>
                    <span className="od-bd-name">
                      {s.title}
                      {s.extraInfo?.plates != null && <em> · {s.extraInfo.plates} plates</em>}
                    </span>
                    <span className="mono">{formatINR(servicePriceAt(idx))}</span>
                  </div>
                ))
              )}
              <div className="od-bd-row od-bd-sub">
                <span>Services subtotal</span>
                <span className="mono">{formatINR(servicePortion)}</span>
              </div>
            </div>
          </div>

          <div className="od-pay-rows">
            <div className="od-pay-row">
              <span>Subtotal</span>
              <span className="mono">{formatINR(liveTotal)}</span>
            </div>
            {itemDiscount > 0 && (
              <div className="od-pay-row">
                <span>Item discounts</span>
                <span className="mono od-neg">−{formatINR(itemDiscount)}</span>
              </div>
            )}
            <div className="od-pay-row od-pay-row--edit">
              <span>Negotiated discount</span>
              <div className="od-pay-input">
                <span className="od-prefix">₹</span>
                <input className="input" type="number" min={0} value={orderInner?.adminDiscount ?? 0}
                  onChange={(e) => setOrderField("adminDiscount", e.target.value === "" ? 0 : Number(e.target.value))} />
              </div>
            </div>

            <div className="od-pay-row od-pay-row--total">
              <span>Total price</span>
              <span className="mono">{formatINR(finalQuote)}</span>
            </div>
            <div className="od-pay-row">
              <span>Total discount</span>
              <span className="mono od-neg">−{formatINR(totalDiscount)}</span>
            </div>

            <div className="od-pay-row od-pay-row--edit">
              <span>Advance payment (%)</span>
              <div className="od-pay-input">
                <input className="input" type="number" min={0} max={100} value={orderInner?.advancePercent ?? 50}
                  onChange={(e) => setOrderField("advancePercent", e.target.value === "" ? 0 : Number(e.target.value))} />
                <span className="od-suffix">%</span>
              </div>
            </div>
            <div className="od-pay-row od-pay-row--advance">
              <span>Advance required</span>
              <span className="mono">{formatINR(advanceAmount)}</span>
            </div>
            <div className="od-pay-row">
              <span>Balance due (on/before event)</span>
              <span className="mono">{formatINR(balanceDue)}</span>
            </div>
          </div>

          <button className="btn cutomer-edit-button od-pay-link" onClick={() => alert("Payment link feature coming soon")}>
            Send payment link
          </button>
          <div className="small muted">Save the order to persist the discount and final price.</div>
        </section>

        <section className="card actionsPanel">
          <h3>Admin actions</h3>

          <label className="small">Remarks (edit JSON array or plain text)</label>
          <textarea
            className="input"
            rows={6}
            value={remarkText}
            onChange={(e) => {
              const v = e.target.value;
              setRemarkText(v);
              setPendingDoc((prev) => {
                if (prev) return { ...prev, remarks: v };
                return { ...(doc || {}), remarks: v };
              });
            }}
          />
        </section>

        {/* new payments panel requested (flex layout, stacked inputs) */}
        <section className="card paymentsPanel">
          <h3>Payments</h3>
          {(() => {
            const vendorsMap = activeDoc?.vendors || {};
            const entries = Object.entries(vendorsMap).filter(([, v]) => v && v.vendor != null);
            if (!entries.length) {
              return <div className="empty">No vendor payment details</div>;
            }
            return (
              <div className="paymentsList" style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                {entries.map(([key, val]) => {
                  const vendorObj = val?.vendor || null;
                  const vendorDisplay = vendorObj ? `${vendorObj.name || vendorObj.id || ""} (${vendorObj.id || ""})` : "-";
                  const pd = paymentsDraft[key] || {
                    finalPayment: String(val?.finalPayment ?? val?.final_payment ?? 0),
                    vendorPayout: String(val?.vendorPayout ?? val?.vendor_payout ?? 0),
                    taxes: String(val?.taxes ?? 0),
                    PAT: String(val?.PAT ?? 0),
                  };

                  return (
                    <div
                      key={key}
                      className="paymentItem"
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: 8,
                        padding: 12,
                        border: "1px solid #eee",
                        borderRadius: 8,
                        background: "#fff",
                      }}
                    >
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
                        <div style={{ fontWeight: 600 }}>{key}</div>
                        <div style={{ color: "#333", fontSize: 14 }}>{vendorDisplay}</div>
                      </div>

                      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                        <label className="small">Final Payment</label>
                        <input
                          className="input"
                          type="text"
                          value={pd.finalPayment}
                          onChange={(e) => setPaymentsDraft((prev) => ({ ...prev, [key]: { ...(prev[key] || {}), finalPayment: e.target.value } }))}
                        />
                      </div>

                      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                        <label className="small">Vendor Payout</label>
                        <input
                          className="input"
                          type="text"
                          value={pd.vendorPayout}
                          onChange={(e) => setPaymentsDraft((prev) => ({ ...prev, [key]: { ...(prev[key] || {}), vendorPayout: e.target.value } }))}
                        />
                      </div>

                      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                        <label className="small">Taxes</label>
                        <input
                          className="input"
                          type="text"
                          value={pd.taxes}
                          onChange={(e) => setPaymentsDraft((prev) => ({ ...prev, [key]: { ...(prev[key] || {}), taxes: e.target.value } }))}
                        />
                      </div>

                      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                        <label className="small">PAT</label>
                        <input
                          className="input"
                          type="text"
                          value={pd.PAT}
                          onChange={(e) => setPaymentsDraft((prev) => ({ ...prev, [key]: { ...(prev[key] || {}), PAT: e.target.value } }))}
                        />
                      </div>

                      <div style={{ display: "flex", gap: 8, marginTop: 6 }}>
                        <button className="btn" onClick={() => savePaymentsForVendor(key)}>Save</button>
                      </div>
                    </div>
                  );
                })}
              </div>
            );
          })()}
        </section>

          <div className="od-save">
            <button className="btn cutomer-edit-button" onClick={saveOrderToServer}>Save Order</button>
          </div>

      </div>
    </Wrapper>
  );
}
