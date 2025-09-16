import React, { useEffect, useState } from "react";
import CustomDropdown from "../../../../components/customDropdown";
import AddButtonWithQuantity from "../../../../components/quantityButton";
import veg_icon from '../../../../assets/veg_icon.webp';
import './styles.scss';

/**
 * FoodSelectionSection
 * - keeps local selectedItems state
 * - renders categories & dropdowns
 * - calls onSelectionChange({ Items: [...] }) whenever selection changes
 *
 * Props:
 * - menuItems
 * - categories
 * - guests
 * - onSelectionChange (new) -> receives formatted selection { Items: [...] }
 */
const FoodSelectionSection = ({ menuItems, categories, guests, onSelectionChange }) => {
  const [showItems, setShowItems] = useState(menuItems);
  const [selectedItems, setSelectedItems] = useState({});
  const [selectedItemsId, setSelectedItemsId] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(Object.keys(categories)[0]);

  useEffect(() => {
    updateShowItems();
    // eslint-disable-next-line
  }, [selectedCategory, menuItems]);

  // keep parent informed whenever selectedItems changes
  useEffect(() => {
    if (typeof onSelectionChange === "function") {
      onSelectionChange(format(selectedItems));
    }
    // eslint-disable-next-line
  }, [selectedItems]);

  const pick = (obj, arr) => Object.fromEntries(Object.entries(obj).filter(([key]) => arr.includes(key)));

  const updateShowItems = () => {
    const filteredItems = pick(menuItems, categories[selectedCategory] || []);
    setShowItems(filteredItems);

    // initialize selectedItems shape for visible sections (keep existing selection IDs intact)
    const _selectedItems = {};
    Object.keys(filteredItems).forEach((section) => {
      _selectedItems[section] = {};
    });
    setSelectedItems(_selectedItems);
    setSelectedItemsId([]); // reset selected ids when switching category (original behaviour)
  };

  const format = (input) => {
    const itemsArray = [];
    Object.values(input).forEach((category) => {
      if (Object.keys(category).length > 0) itemsArray.push(...Object.values(category));
    });
    return { Items: itemsArray };
  };

  const handleDropdownChange = (itemCategory, value) => {
    // prevent duplicates
    if (selectedItemsId.includes(value)) {
      alert(`${value} is already added.`);
      return;
    }

    const _selectedItems = { ...selectedItems };
    const _selectedItemsId = [...selectedItemsId];

    // guard: showItems might not contain this category/value
    const itemData = showItems[itemCategory]?.[value];
    if (!itemData) return;

    const newItem = {
      ...itemData,
      quantity: 1,
      pricePerItem: itemData.price,
      price: itemData.price, // initial total price = pricePerItem * quantity
    };

    if (!_selectedItems[itemCategory]) _selectedItems[itemCategory] = {};
    _selectedItems[itemCategory][value] = newItem;
    _selectedItemsId.push(value);
    setSelectedItems(_selectedItems);
    setSelectedItemsId(_selectedItemsId);
  };

  const handleQuantityUpdate = (category, item, quantity = 1) => {
    const _selectedItems = { ...selectedItems };
    const _selectedItemsId = [...selectedItemsId];

    if (!_selectedItems[category] || !_selectedItems[category][item]) {
      return;
    }

    // remove item when quantity <= 0
    if (Number(quantity) <= 0) {
      delete _selectedItems[category][item];
      const idx = _selectedItemsId.indexOf(item);
      if (idx > -1) _selectedItemsId.splice(idx, 1);
      setSelectedItems(_selectedItems);
      setSelectedItemsId(_selectedItemsId);
      return;
    }

    _selectedItems[category][item].quantity = Number(quantity);
    _selectedItems[category][item].price = _selectedItems[category][item].pricePerItem * Number(quantity);
    setSelectedItems(_selectedItems);
    setSelectedItemsId(_selectedItemsId);
  };

  return (
    <section className="createMenu" aria-hidden={false}>
      <h3 className="subSectionTitle">Selected Food Items</h3>

      <ul className="boxOptionsTitle boxOptionsDishType">
        {Object.keys(categories).map((category) => (
          <li
            key={category}
            onClick={() => setSelectedCategory(category)}
            className={category === selectedCategory ? "active" : ""}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') setSelectedCategory(category); }}
          >
            {category}
          </li>
        ))}
      </ul>

      {Object.keys(showItems).map((itemCategory) => (
        <section key={itemCategory} className="categroy-wrapper ItemCardContainer">
          <section>
            <h2>{itemCategory}</h2>
          </section>

          <section className="ItemOptionsContainer dropdown-container">
            {/* Render selected items for this category */}
            {selectedItems[itemCategory] && Object.keys(selectedItems[itemCategory]).length > 0 ? (
              Object.keys(selectedItems[itemCategory]).map((item) => (
                <section key={item} className="selectedItems">
                  <div className="selectedItemName">
                    <img className="typeLogo" src={veg_icon} alt="" />
                    <p>{selectedItems[itemCategory][item].name}</p>
                  </div>

                  <AddButtonWithQuantity
                    incremental={1}
                    minQuantity={0}
                    // AddButtonWithQuantity should call this with new quantity
                    updateItemQuantity={(q) => handleQuantityUpdate(itemCategory, item, q)}
                    initialQuantity={selectedItems[itemCategory][item].quantity}
                  />
                </section>
              ))
            ) : null}

            {/* Dropdown to add an item */}
            <section key={`${itemCategory}-dropdown`}>
              <CustomDropdown
                placeholder="Add Item"
                options={Object.keys(showItems[itemCategory] || {}).map((item) => ({ value: item, data: showItems[itemCategory] }))}
                onChange={(value) => handleDropdownChange(itemCategory, value)}
              />
            </section>
          </section>
        </section>
      ))}

      {/* NOTE: Proceed button removed — parent (root) handles checkout */}
    </section>
  );
};

export default FoodSelectionSection;
