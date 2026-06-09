// src/pages/admin/OrderDetailsPage.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { fetchOrderById, updateOrder } from '../../services/order';
import Wrapper from "../../components/wrapper";
import { Edit, Delete } from "@mui/icons-material";
import "./styles.scss";

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

  // order/customer edit modal state
  const [isOrderModalOpen, setOrderModalOpen] = useState(false);
  const [orderModalState, setOrderModalState] = useState({
    people: '',
    date: '',
    dietMode: '',
    special_request: '',
    customerName: '',
    customerPhone: '',
    customerAddress: '',
    customerArea: '',
    customerPincode: '',
  });

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

    // send full next doc as patch to server (service will apply $set)
    await persistPatch(next);
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

  const handleSaveAssignments = async () => {
    if (!pendingDoc && !doc) return;
    const currentServices = (pendingDoc?.order || pendingDoc)?.services || (doc?.order || doc)?.services || [];
    const updatedServices = Array.isArray(currentServices)
      ? currentServices.map((s) => {
          const id = s?.id || s?._id || s?.title || (typeof s === "string" ? `svc-${s.replace(/\s+/g, "-").toLowerCase()}` : null);
          const assignedVendorId = id ? (serviceVendorMap[id] || null) : null;
          const assignedVendor = assignedVendorId ? toVendorObject(assignedVendorId) : null;
          if (typeof s === "string") {
            // keep original structure as string when possible, but attach assignedVendor in order.services as an object entry
            return { id, title: s, assignedVendor };
          }
          return { ...s, assignedVendor };
        })
      : [];

    const next = JSON.parse(JSON.stringify(pendingDoc || doc || {}));
    // update services under order if present
    if (!next.order) next.order = {};
    next.order.services = updatedServices;

    // update vendors map locally — ensure vendor entries use vendor object {id, name}
    if (!next.vendors) next.vendors = {};
    if (!next.vendors.caterer) next.vendors.caterer = { vendor: null, finalPayment: 0, vendorPayout: 0, taxes: 0, PAT: 0 };
    updatedServices.forEach((s) => {
      const key = s?.id || s?.title || null;
      if (!key) return;
      const vendorObj = s.assignedVendor ? toVendorObject(s.assignedVendor) : null;
      if (!next.vendors[key]) {
        next.vendors[key] = { vendor: vendorObj, finalPayment: 0, vendorPayout: 0, taxes: 0, PAT: 0 };
      } else {
        next.vendors[key] = { ...next.vendors[key], vendor: vendorObj || next.vendors[key].vendor || null };
      }
    });

    // changed: set manager under order.manager instead of top-level assignedManager
    if (!next.order) next.order = {};
    next.order.manager = assignedManager || null;

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
  const fetchFoodList = async () => {
    setFoodLoading(true);
    setFoodError(null);
    try {
      const url = `http://localhost:3001/food/inventory/list/Bangalore-North`;
      const res = await fetch(url);
      if (!res.ok) throw new Error(`Failed to fetch food: ${res.statusText}`);
      const data = await res.json();
      setFoodTree(data || {});
      // flatten
      const flat = [];
      Object.entries(data || {}).forEach(([category, subcats]) => {
        Object.entries(subcats || {}).forEach(([subcat, items]) => {
          (items || []).forEach((it) => {
            flat.push({
              ...it,
              _category: category,
              _subcategory: subcat,
            });
          });
        });
      });
      setFoodFlat(flat);
    } catch (err) {
      console.error(err);
      setFoodError(String(err?.message || err));
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

  // Order/customer edit modal handling
  const openOrderModal = () => {
    const oi = pendingDoc?.order || pendingDoc || doc?.order || doc || {};
    setOrderModalState({
      people: oi?.people ?? "",
      date: oi?.date ?? oi?.eventTime ?? "",
      dietMode: oi?.dietConfig?.dietMode ?? "",
      special_request: oi?.special_request ?? "",
      customerName: oi?.customerData?.name ?? oi?.customer?.name ?? "",
      customerPhone: oi?.customerData?.phone ?? oi?.customer?.phone ?? "",
      customerAddress: oi?.customerData?.address ?? oi?.customer?.address ?? "",
      customerArea: oi?.customerData?.area ?? oi?.customer?.area ?? "",
      customerPincode: oi?.customerData?.pincode ?? oi?.customer?.pincode ?? "",
    });
    setOrderModalOpen(true);
  };

  const closeOrderModal = () => {
    setOrderModalOpen(false);
  };

  const applyOrderModalChanges = () => {
    const next = JSON.parse(JSON.stringify(pendingDoc || doc || {}));
    if (!next.order) next.order = {};
    // apply fields
    next.order.people = Number(orderModalState.people || 0);
    next.order.date = orderModalState.date || null;
    if (!next.order.dietConfig) next.order.dietConfig = {};
    next.order.dietConfig.dietMode = orderModalState.dietMode || "";
    next.order.special_request = orderModalState.special_request || "";

    // customer block
    if (!next.order.customerData) next.order.customerData = {};
    next.order.customerData.name = orderModalState.customerName || "";
    next.order.customerData.phone = orderModalState.customerPhone || "";
    next.order.customerData.address = orderModalState.customerAddress || "";
    next.order.customerData.area = orderModalState.customerArea || "";
    next.order.customerData.pincode = orderModalState.customerPincode || "";
    setPendingDoc(next);
    setOrderModalOpen(false);
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
  const totalDisplay = (orderInner?.price && (orderInner.price.finalPrice || (orderInner.price._numeric && `₹${orderInner.price._numeric.finalPrice}`))) || (activeDoc?.price && (activeDoc.price.finalPrice || (activeDoc.price._numeric && `₹${activeDoc.price._numeric.finalPrice}`))) || "-";

  return (
    <Wrapper headertext={`Order Details`} footer={false}>
      <div className="admin-orders-details-page">

        <div className="card cardHeader">
            <div>#{orderInner?.orderNumber || activeDoc?._id}</div>
            <h2 className="eventTitle">{displayEventType()}</h2>
            <div className="mono totalMono">{displayDate()}</div>
        </div>

        <section className="card">
          <div><strong>Status:</strong> <span className={`statusBadge ${activeDoc?.status}`}>{activeDoc?.status}</span></div>
          <div><strong>Quote: {totalDisplay}</strong></div>
          <div><strong>People:</strong> {orderInner?.people || activeDoc?.people || "-"}</div>
          <div><strong>Diet config:</strong> {orderInner?.dietConfig?.dietMode || "-"}</div>
          <div><strong>Special request:</strong> {orderInner?.special_request || "-"}</div>
          <div><strong>Manager:</strong> {activeDoc?.manager ? String(activeDoc.manager).toUpperCase() : "-"}</div>
        </section>

        <section className="card">
          <h3>Customer Info</h3>
          <div><strong>Name:</strong> {orderInner?.customerData?.name || orderInner?.customer?.name}</div>
          <div><strong>Phone:</strong> {orderInner?.customerData?.phone || orderInner?.customer?.phone}</div>
          <div><strong>Address:</strong> {orderInner?.customerData?.address || orderInner?.customer?.address}</div>
          <div><strong>Area:</strong> {orderInner?.customerData?.area || orderInner?.customer?.area}</div>
          <div><strong>Pincode:</strong> {orderInner?.customerData?.pincode || orderInner?.customer?.pincode}</div>
        </section>

        <div>
          <button className="btn cutomer-edit-button" onClick={openOrderModal}>Update Order / Customer details</button>
          {/* Order / Customer edit modal */}
          {isOrderModalOpen && (
            <div className="modalOverlay">
              <div className="modalDialog">
                <div className="modalHeader">Edit Order & Customer</div>
                <div className="modalBody">
                  <div className="modalRow">
                    <label className="small">People</label>
                    <input className="input" value={orderModalState.people} onChange={(e) => setOrderModalState((s) => ({ ...s, people: e.target.value }))} />
                  </div>

                  <div className="modalRow">
                    <label className="small">Date / Time</label>
                    <input className="input" value={orderModalState.date} onChange={(e) => setOrderModalState((s) => ({ ...s, date: e.target.value }))} />
                  </div>

                  <div className="modalRow">
                    <label className="small">Diet mode</label>
                    <input className="input" value={orderModalState.dietMode} onChange={(e) => setOrderModalState((s) => ({ ...s, dietMode: e.target.value }))} />
                  </div>

                  <div className="modalRow">
                    <label className="small">Special request</label>
                    <textarea className="input" value={orderModalState.special_request} onChange={(e) => setOrderModalState((s) => ({ ...s, special_request: e.target.value }))} />
                  </div>

                  <div className="modalRow">
                    <label className="small">Customer name</label>
                    <input className="input" value={orderModalState.customerName} onChange={(e) => setOrderModalState((s) => ({ ...s, customerName: e.target.value }))} />
                  </div>

                  <div className="modalRow">
                    <label className="small">Customer phone</label>
                    <input className="input" value={orderModalState.customerPhone} onChange={(e) => setOrderModalState((s) => ({ ...s, customerPhone: e.target.value }))} />
                  </div>

                  <div className="modalRow">
                    <label className="small">Address</label>
                    <textarea className="input" value={orderModalState.customerAddress} onChange={(e) => setOrderModalState((s) => ({ ...s, customerAddress: e.target.value }))} />
                  </div>

                  <div className="modalRow">
                    <label className="small">Area</label>
                    <input className="input" value={orderModalState.customerArea} onChange={(e) => setOrderModalState((s) => ({ ...s, customerArea: e.target.value }))} />
                  </div>

                  <div className="modalRow">
                    <label className="small">Pincode</label>
                    <input className="input" value={orderModalState.customerPincode} onChange={(e) => setOrderModalState((s) => ({ ...s, customerPincode: e.target.value }))} />
                  </div>
                </div>

                <div className="modalFooter">
                  <button className="btn" onClick={applyOrderModalChanges}>Apply</button>
                  <button className="btn" onClick={closeOrderModal}>Cancel</button>
                </div>
              </div>
            </div>
          )}
        </div>

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
                <th></th>
                <th></th>
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
                return (
                  <tr key={m.id || m.name}>
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
                    <td>
                      <button
                        className="iconButton"
                        onClick={() => openMenuEditor(m)}
                        title={`Edit ${m.name}`}
                        style={{ background: 'transparent', border: 'none', cursor: 'pointer' }}
                      >
                        <Edit fontSize="small" />
                      </button>
                    </td>
                    <td>
                      <button
                        className="iconButton"
                        onClick={() => deleteMenuItem(m)}
                        title={`Delete ${m.name}`}
                        style={{ background: 'transparent', border: 'none', cursor: 'pointer' }}
                      >
                        <Delete fontSize="small" />
                      </button>
                    </td>
                  </tr>
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
                <div className="modalHeader">Add Food Item</div>
                <div className="modalBody">
                  <input className="input foodSearch" placeholder="Search food..." value={foodSearch} onChange={(e) => setFoodSearch(e.target.value)} />
                  <div className="foodSearchRow" style={{ display: "flex", gap: 8 }}>
                    <div>
                      <input className="input" type="number" min={1} value={selectedFoodQty} onChange={(e) => setSelectedFoodQty(Number(e.target.value || 1))} />
                    </div>
                    <button className="btn" onClick={() => addFoodToOrder()} disabled={!selectedFood}>Add to order</button>
                    <button className="btn" onClick={() => { setSelectedFood(null); setSelectedFoodQty(1); setFoodModalOpen(false); }}>Close</button>
                  </div>

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
              services.map((s) => {
                const svcId = s.id;
                const isEditing = editingServiceId === svcId;
                return (
                  <li key={svcId} className="serviceRow">
                    <div className="serviceMain">
                      <div className="serviceTitle">{s.title}</div>
                      {s.description && <div className="small muted">{s.description}</div>}
                      {s.price != null && <div className="small muted">Price: ₹{s.price}</div>}
                      {s.extraInfo && typeof s.extraInfo === "object" && (
                        <div className="extraInfoBlock">
                          {s.extraInfo.plates != null && <div className="small muted">Plates: {s.extraInfo.plates}</div>}
                          {s.extraInfo.note && <div className="small muted">Note: {s.extraInfo.note}</div>}
                          {s.extraInfo.choices && typeof s.extraInfo.choices === "object" && (
                            <div className="small muted choicesBlock">
                              <strong>Choices:</strong>
                              <ul className="choices-ul">
                                {Object.entries(s.extraInfo.choices).map(([k, v]) => (
                                  <li key={k}>{k} — {v}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    <div className="serviceControls">
                      {s.extraInfo && typeof s.extraInfo === "object" && (
                        <div className="edit-btn-container">
                          <button className="btn edit-btn" onClick={() => openExtraEditor(s)}>Edit</button>
                          <button className="btn edit-btn" onClick={() => { /* delete not implemented */ }}>Delete</button>
                        </div>
                      )}

                      <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
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
                    </div>

                    {isEditing && (
                      <div className="inlineEditor">
                        <div className="inlineEditorHeader">
                          <strong>Edit extra for {s.title}</strong>
                          <div>
                            <button className="btn" onClick={() => { setEditingServiceId(null); setEditingExtra({ plates: 0, choices: {} }); }}>Close</button>
                          </div>
                        </div>

                        <div className="inlineEditorBody">
                          <div className="inlineEditorCol">
                            <label className="small">Plates</label>
                            <input className="input" type="number" value={editingExtra.plates} onChange={(e) => setEditingExtra((p) => ({ ...p, plates: Number(e.target.value || 0) }))} />
                          </div>

                          <div className="inlineEditorCol">
                            <label className="small">Note</label>
                            <input className="input" type="text" value={editingExtra.note} onChange={(e) => setEditingExtra((p) => ({ ...p, note: String(e.target.value || '') }))} />
                          </div>

                          <div className="inlineEditorCol">
                            <label className="small">Choices (edit counts)</label>
                            <div className="choicesEditor">
                              {Object.keys(editingExtra.choices || {}).length === 0 && <div className="small muted">No choices found — add below</div>}
                              {Object.entries(editingExtra.choices || {}).map(([k, v]) => (
                                <div key={k} className="choiceRow">
                                  <div className="choiceKey">{k}</div>
                                  <input className="input choiceInput" type="number" value={String(v)} onChange={(e) => updateChoiceCount(k, Number(e.target.value || 0))} />
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>

                        <div className="inlineEditorActions">
                          <button className="btn" onClick={() => saveExtraForService(svcId)}>Save</button>
                          <button className="btn" onClick={() => { setEditingServiceId(null); setEditingExtra({ plates: 0, choices: {} }); }}>Cancel</button>
                        </div>
                      </div>
                    )}
                  </li>
                );
              })
            ) : (
              <div className="empty">No services</div>
            )}
          </ul>
          <button className="btn cutomer-edit-button" onClick={() => {}}>Update Services</button>
        </section>

        <section className="card actionsPanel">
          <h3>Admin actions</h3>

          <label className="small">Assign manager</label>
          <div className="managerRow">
            <select value={assignedManager || ""} onChange={(e) => setAssignedManager(e.target.value)} className="input">
              <option value="">— choose manager —</option>
              {managers.map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}
            </select>
            <button className="btn" onClick={handleSaveAssignments}>Save</button>
          </div>

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

                  {/* New status dropdown placed between remarks and save */}
                  <label className="small">Update status</label>
          <select
            className="input"
            value={(pendingDoc?.status ?? doc?.status ?? "")}
            onChange={(e) => {
              const value = e.target.value;
              setPendingDoc((prev) => {
                if (prev) return { ...prev, status: value };
                return { ...(doc || {}), status: value };
              });
            }}
          >
            <option value="">— choose status —</option>
            <option value="new">new</option>
            <option value="confirmed">confirmed</option>
            <option value="contacted">contacted</option>
            <option value="cancelled">cancelled</option>
            <option value="delivered">delivered</option>
            <option value="payment done">payment done</option>
          </select>

          <div style={{ marginTop: 8 }}>
            <button className="btn cutomer-edit-button" onClick={saveOrderToServer}>Save Order</button>
          </div>

      </div>
    </Wrapper>
  );
}
