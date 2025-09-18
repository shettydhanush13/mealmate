// src/pages/create-menu/components/FoodSelectionSection.jsx
import React, { useEffect, useState, useRef } from "react";
import CustomDropdown from "../../../../components/customDropdown";
import AddButtonWithQuantity from "../../../../components/quantityButton";
import veg_icon from "../../../../assets/veg_icon.webp";
import nonveg_icon from "../../../../assets/nonveg_icon.webp";
import "./styles.scss";

/**
 * Props:
 * - menuItems: object (sectionName -> { itemKey -> item })
 * - categories: object (categoryName -> [sectionName,...])
 * - guests
 * - dietConfig -> { dietMode: "veg-only" | "veg+nonveg" }
 * - recommendedMenu -> { Items: [{ name, quantity, pricePerItem, price }, ...] } // LLM response
 * - onSelectionChange -> fn({ Items: [...] })
 */
const FoodSelectionSection = ({
  menuItems = {},
  categories = {},
  guests = 0,
  dietConfig = {},
  recommendedMenu = null,
  onSelectionChange,
}) => {
  const [selectedCategory, setSelectedCategory] = useState(Object.keys(categories)[0] || "");
  const [selectedItems, setSelectedItems] = useState({});
  const [selectedItemsId, setSelectedItemsId] = useState([]);
  const lastRecommendedHashRef = useRef(null);
  const sectionsInitRef = useRef(false);

  // Map of menu key -> { quantity, pricePerItem } parsed from recommendedMenu (fast lookup)
  const recommendedMapRef = useRef({});

  // initialize section keys once (do not overwrite later)
  useEffect(() => {
    if (sectionsInitRef.current) return;
    const init = {};
    Object.keys(menuItems || {}).forEach((section) => {
      init[section] = {};
    });
    setSelectedItems((prev) => ({ ...init, ...(prev || {}) }));
    sectionsInitRef.current = true;
  }, [menuItems]);

  // build recommendedMapRef when recommendedMenu changes
  useEffect(() => {
    recommendedMapRef.current = {};
    if (!recommendedMenu || !Array.isArray(recommendedMenu.Items)) return;

    // helper to find entry
    const findMenuEntryByName = (name) => {
      if (!name) return null;
      const lower = String(name).toLowerCase().trim();
      // exact match on item.name
      for (const section of Object.keys(menuItems || {})) {
        for (const key of Object.keys(menuItems[section] || {})) {
          const item = menuItems[section][key];
          if ((item?.name || "").toLowerCase().trim() === lower) {
            return { section, key, item };
          }
        }
      }
      // fallback partial match
      for (const section of Object.keys(menuItems || {})) {
        for (const key of Object.keys(menuItems[section] || {})) {
          const item = menuItems[section][key];
          const itemName = (item?.name || key || "").toLowerCase().trim();
          if (itemName === lower || itemName.includes(lower) || lower.includes(itemName)) {
            return { section, key, item };
          }
        }
      }
      return null;
    };

    recommendedMenu.Items.forEach((rec) => {
      const found = findMenuEntryByName(rec.name);
      if (found) {
        const qty = Number(rec.quantity) || 1;
        const ppi = rec.pricePerItem != null ? Number(rec.pricePerItem) : Number(found.item.price || 0);
        recommendedMapRef.current[found.key] = { quantity: qty, pricePerItem: ppi };
      }
    });
    // no deps on menuItems to avoid frequent rebuilds; if menuItems changes, recommendedMap will be rebuilt next recommendedMenu change.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [recommendedMenu]);

  // Notify parent when selection changes
  useEffect(() => {
    if (typeof onSelectionChange === "function") {
      const itemsArray = [];
      Object.values(selectedItems || {}).forEach((sectionObj) => {
        if (sectionObj && Object.keys(sectionObj).length > 0) {
          itemsArray.push(...Object.values(sectionObj));
        }
      });
      onSelectionChange({ Items: itemsArray });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedItems]);

  const vegOnly = dietConfig && dietConfig.dietMode === "veg-only";

  const pick = (obj = {}, arr = []) => Object.fromEntries(Object.entries(obj || {}).filter(([key]) => (arr || []).includes(key)));

  const getVisibleSectionsForCategory = (categoryName) => {
    const sectionNames = categories?.[categoryName] || [];
    let sections = pick(menuItems || {}, sectionNames);
    if (vegOnly) {
      sections = Object.fromEntries(
        Object.entries(sections).map(([sectionKey, itemsObj]) => {
          const filtered = Object.fromEntries(Object.entries(itemsObj || {}).filter(([k, v]) => v && v.veg !== false));
          return [sectionKey, filtered];
        })
      );
    }
    return sections;
  };

  const getCountForCategory = (categoryName) => {
    const sectionNames = categories?.[categoryName] || [];
    let uniqueCount = 0;
    sectionNames.forEach((section) => {
      const sec = selectedItems?.[section] || {};
      uniqueCount += Object.keys(sec).length;
    });
    return uniqueCount;
  };

  // Helper to find menu entry by exact key (we already have the key from dropdown)
  // and ensure item exists
  const getMenuItem = (sectionName, key) => {
    return menuItems?.[sectionName]?.[key] || null;
  };

  // Hydrate recommendation into selectedItems (only when recommendedMenu changes and is new)
  useEffect(() => {
    if (!recommendedMenu || !Array.isArray(recommendedMenu.Items) || recommendedMenu.Items.length === 0) return;

    const canonical = recommendedMenu.Items.map(it => ({ name: it.name, quantity: it.quantity })).sort((a,b) => a.name.localeCompare(b.name));
    const hash = JSON.stringify(canonical);
    if (lastRecommendedHashRef.current === hash) return;

    // helper to find menu entry by name (same algorithm as used earlier)
    const findMenuEntryByName = (name) => {
      if (!name) return null;
      const lower = String(name).toLowerCase().trim();
      for (const section of Object.keys(menuItems || {})) {
        for (const key of Object.keys(menuItems[section] || {})) {
          const item = menuItems[section][key];
          if ((item?.name || "").toLowerCase().trim() === lower) {
            return { section, key, item };
          }
        }
      }
      for (const section of Object.keys(menuItems || {})) {
        for (const key of Object.keys(menuItems[section] || {})) {
          const item = menuItems[section][key];
          const itemName = (item?.name || key || "").toLowerCase().trim();
          if (itemName === lower || itemName.includes(lower) || lower.includes(itemName)) {
            return { section, key, item };
          }
        }
      }
      return null;
    };

    const newIds = [];
    setSelectedItems((prev) => {
      const base = {};
      Object.keys(menuItems || {}).forEach((section) => {
        base[section] = { ...(prev?.[section] || {}) };
      });

      recommendedMenu.Items.forEach((rec) => {
        if (!rec) return;
        const matched = findMenuEntryByName(rec.name);
        if (!matched) return;
        const { section, key, item } = matched;
        if (vegOnly && item.veg === false) return; // respect veg-only

        const qty = Number(rec.quantity) || 1;
        const pricePerItem = rec.pricePerItem != null ? Number(rec.pricePerItem) : Number(item.price || 0);
        base[section] = base[section] || {};
        base[section][key] = {
          ...item,
          quantity: qty,
          pricePerItem,
          price: qty * pricePerItem,
        };
        newIds.push(key);
      });

      // preserve previous selections that user had
      Object.keys(prev || {}).forEach((sec) => {
        base[sec] = { ...(base[sec] || {}), ...prev[sec] };
      });

      return base;
    });

    setSelectedItemsId(prev => [...new Set([...(prev || []), ...newIds])]);
    lastRecommendedHashRef.current = hash;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [recommendedMenu, menuItems, vegOnly]);

  // Dropdown add: now uses recommendedMapRef to prefill quantity/price if available
  const handleDropdownChange = (sectionName, valueKey) => {
    if (!sectionName || !valueKey) return;
    if (selectedItemsId.includes(valueKey)) {
      alert(`${valueKey} is already added.`);
      return;
    }
    const itemData = getMenuItem(sectionName, valueKey);
    if (!itemData) return;
    if (vegOnly && itemData.veg === false) return;

    // check recommended map for this item key
    const rec = recommendedMapRef.current[valueKey];
    const initialQty = rec ? Number(rec.quantity) || 1 : 1;
    const pricePerItem = rec ? Number(rec.pricePerItem) : Number(itemData.price || 0);

    const newItem = {
      ...itemData,
      quantity: initialQty,
      pricePerItem,
      price: initialQty * pricePerItem,
    };

    setSelectedItems((prev) => {
      const next = { ...(prev || {}) };
      next[sectionName] = { ...(next[sectionName] || {}), [valueKey]: newItem };
      return next;
    });

    setSelectedItemsId((prev) => ([...(prev || []), valueKey]));
  };

  const handleQuantityUpdate = (sectionName, itemKey, quantity = 1) => {
    const qty = Number(quantity) || 0;
    setSelectedItems((prev) => {
      const next = { ...(prev || {}) };
      if (!next[sectionName] || !next[sectionName][itemKey]) return next;

      if (qty <= 0) {
        const copySec = { ...(next[sectionName] || {}) };
        delete copySec[itemKey];
        next[sectionName] = copySec;
        setSelectedItemsId((ids) => ids.filter(id => id !== itemKey));
        return next;
      }

      next[sectionName] = { ...(next[sectionName] || {}) };
      const existing = next[sectionName][itemKey];
      next[sectionName][itemKey] = {
        ...existing,
        quantity: qty,
        price: (existing.pricePerItem || Number(existing.price || 0)) * qty,
      };
      return next;
    });
  };

  const visibleSections = getVisibleSectionsForCategory(selectedCategory);

  return (
    <section className="createMenu" aria-hidden={false}>
      <h3 className="subSectionTitle">Selected Food Items</h3>

      <ul className="boxOptionsTitle boxOptionsDishType" role="tablist" aria-label="Dish categories">
        {Object.keys(categories || {}).map((category) => {
          const count = getCountForCategory(category);
          const active = category === selectedCategory;
          return (
            <li
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={active ? "active" : ""}
              role="tab"
              aria-selected={active}
              tabIndex={0}
              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') setSelectedCategory(category); }}
            >
              <span>{category}</span>
              {count > 0 && <span className="tab-badge" aria-hidden="true">{count}</span>}
            </li>
          );
        })}
      </ul>

      {Object.keys(visibleSections || {}).length === 0 ? (
        <div style={{ padding: 12 }} className="muted">No items available for this category.</div>
      ) : null}

      {Object.keys(visibleSections || {}).map((sectionName) => (
        <section key={sectionName} className="categroy-wrapper ItemCardContainer">
          <section>
            <h2>{sectionName}</h2>
          </section>

          <section className="ItemOptionsContainer dropdown-container">
            {/* selected items (in this section) */}
            {selectedItems[sectionName] && Object.keys(selectedItems[sectionName]).length > 0 ? (
              Object.keys(selectedItems[sectionName]).map((itemKey) => {
                const it = selectedItems[sectionName][itemKey];
                return (
                  <section key={itemKey} className="selectedItems">
                    <div className="selectedItemName">
                      <img className="typeLogo" src={it.veg === false ? nonveg_icon : veg_icon} alt={it.veg === false ? "non-veg" : "veg"} />
                      <p>{it.name}</p>
                    </div>

                    <AddButtonWithQuantity
                      incremental={1}
                      minQuantity={0}
                      updateItemQuantity={(q) => handleQuantityUpdate(sectionName, itemKey, q)}
                      initialQuantity={it.quantity}
                    />
                  </section>
                );
              })
            ) : (
              <div className="muted">No items selected in this section yet.</div>
            )}

            {/* dropdown for this section */}
            <section style={{ marginTop: 12 }}>
              <CustomDropdown
                placeholder="Add Item"
                options={Object.keys(visibleSections[sectionName] || {}).map((itemKey) => ({ value: itemKey, data: visibleSections[sectionName] }))}
                onChange={(value) => handleDropdownChange(sectionName, value)}
              />
            </section>
          </section>
        </section>
      ))}
    </section>
  );
};

export default FoodSelectionSection;
