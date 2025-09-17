// src/pages/create-menu/components/FoodSelectionSection.jsx
import React, { useEffect, useState } from "react";
import CustomDropdown from "../../../../components/customDropdown";
import AddButtonWithQuantity from "../../../../components/quantityButton";
import veg_icon from '../../../../assets/veg_icon.webp';
import nonveg_icon from '../../../../assets/nonveg_icon.webp';
import './styles.scss';

/**
 * FoodSelectionSection
 *
 * Props:
 * - menuItems: object (sectionName -> items)
 * - categories: object (categoryName -> [sectionName, ...])
 * - guests
 * - dietConfig (optional) -> { dietMode }
 * - onSelectionChange -> fn({ Items: [...] })
 *
 * Behavior:
 * - Keeps selections across tabs (does not clear other categories)
 * - Shows per-category badge count (number of unique items selected in that category)
 * - Renders each section inside the currently selected category with dropdown & selected items
 * - Filters out non-veg items when dietMode === "veg-only"
 */
const FoodSelectionSection = ({ menuItems = {}, categories = {}, guests = 0, dietConfig = {}, onSelectionChange }) => {
  const [selectedCategory, setSelectedCategory] = useState(Object.keys(categories)[0] || "");
  // shape: { sectionName: { itemKey: { ...item, quantity, pricePerItem, price } } }
  const [selectedItems, setSelectedItems] = useState({});
  const [selectedItemsId, setSelectedItemsId] = useState([]); // track item keys added (to prevent dupes)

  useEffect(() => {
    // initialize shape for all sections so we have predictable keys
    const init = {};
    Object.keys(menuItems || {}).forEach((section) => {
      init[section] = init[section] || {};
    });
    setSelectedItems((prev) => ({ ...init, ...prev }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [menuItems]);

  // when selections change, inform parent
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

  // small helper: pick keys from object
  const pick = (obj = {}, arr = []) => Object.fromEntries(Object.entries(obj || {}).filter(([key]) => (arr || []).includes(key)));

  // returns object of sections -> items (filtered by veg-only if needed) for current category
  const getVisibleSectionsForCategory = (categoryName) => {
    const sectionNames = categories?.[categoryName] || [];
    let sections = pick(menuItems || {}, sectionNames);
    // if veg-only selected, remove non-veg items inside each section
    const vegOnly = dietConfig && dietConfig.dietMode === "veg-only";
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

  // count unique selected items (number of distinct selected item keys) for a whole category (across its sections)
  const getCountForCategory = (categoryName) => {
    const sectionNames = categories?.[categoryName] || [];
    let uniqueCount = 0;
    sectionNames.forEach((section) => {
      const sec = selectedItems?.[section] || {};
      uniqueCount += Object.keys(sec).length; // count unique keys, not quantities
    });
    return uniqueCount;
  };

  const handleDropdownChange = (sectionName, value) => {
    if (!sectionName || !value) return;
    if (selectedItemsId.includes(value)) {
      alert(`${value} is already added.`);
      return;
    }

    // find item data in menuItems[sectionName] (note: visible sections may be filtered)
    const sectionObj = menuItems?.[sectionName] || {};
    const itemData = sectionObj?.[value];
    if (!itemData) return;

    const newItem = {
      ...itemData,
      quantity: 1,
      pricePerItem: Number(itemData.price || 0),
      price: Number(itemData.price || 0),
    };

    setSelectedItems((prev) => {
      const next = { ...(prev || {}) };
      next[sectionName] = { ...(next[sectionName] || {}) };
      next[sectionName][value] = newItem;
      return next;
    });

    setSelectedItemsId((prev) => ([...prev, value]));
  };

  const handleQuantityUpdate = (sectionName, itemKey, quantity = 1) => {
    const qty = Number(quantity) || 0;
    setSelectedItems((prev) => {
      const next = { ...(prev || {}) };
      if (!next[sectionName] || !next[sectionName][itemKey]) return next;

      if (qty <= 0) {
        // remove item
        const copySec = { ...next[sectionName] };
        delete copySec[itemKey];
        next[sectionName] = copySec;
        setSelectedItemsId((prevIds) => prevIds.filter((id) => id !== itemKey));
        return next;
      }

      next[sectionName] = { ...(next[sectionName] || {}) };
      next[sectionName][itemKey] = {
        ...next[sectionName][itemKey],
        quantity: qty,
        price: (next[sectionName][itemKey].pricePerItem || 0) * qty,
      };
      return next;
    });
  };

  // render
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

      {/* render each section inside the selected category (preserves original UI style) */}
      {Object.keys(visibleSections || {}).length === 0 ? (
        <div style={{ padding: 12 }} className="muted">No items available for this category.</div>
      ) : null}

      {Object.keys(visibleSections || {}).map((sectionName) => (
        <section key={sectionName} className="categroy-wrapper ItemCardContainer">
          <section>
            <h2>{sectionName}</h2>
          </section>

          <section className="ItemOptionsContainer dropdown-container">
            {/* render selected items for this section */}
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
