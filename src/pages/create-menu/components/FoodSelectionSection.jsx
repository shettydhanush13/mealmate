// src/pages/create-menu/components/FoodSelectionSection.jsx
import React, { useEffect, useState } from "react";
import CustomDropdown from "../../../components/customDropdown";
import AddButtonWithQuantity from "../../../components/quantityButton";
import veg_icon from '../../../assets/veg_icon.webp';

/**
 * FoodSelectionSection
 * - keeps local selectedItems state
 * - renders categories & dropdowns
 * - calls onCheckout({ Items: [...] }) with formatted data when user clicks checkout (or when parent calls)
 */
const FoodSelectionSection = ({ menuItems, categories, guests, onCheckout }) => {
  const [showItems, setShowItems] = useState(menuItems);
  const [selectedItems, setSelectedItems] = useState({});
  const [selectedItemsId, setSelectedItemsId] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(Object.keys(categories)[0]);

  useEffect(() => {
    updateShowItems();
    // eslint-disable-next-line
  }, [selectedCategory]);

  const pick = (obj, arr) => Object.fromEntries(Object.entries(obj).filter(([key]) => arr.includes(key)));

  const updateShowItems = () => {
    const filteredItems = pick(menuItems, categories[selectedCategory]);
    setShowItems(filteredItems);

    const _selectedItems = {};
    Object.keys(filteredItems).forEach((section) => {
      _selectedItems[section] = {};
    });
    setSelectedItems(_selectedItems);
  };

  const format = (input) => {
    const itemsArray = [];
    Object.values(input).forEach((category) => {
      if (Object.keys(category).length > 0) itemsArray.push(...Object.values(category));
    });
    return { Items: itemsArray };
  };

  const handleDropdownChange = (itemCategory, value) => {
    if (selectedItemsId.includes(value)) {
      alert(`${value} is already added.`);
      return;
    }

    const _selectedItems = { ...selectedItems };
    const _selectedItemsId = [...selectedItemsId];

    const newItem = {
      ...showItems[itemCategory][value],
      quantity: 1,
      pricePerItem: showItems[itemCategory][value].price,
    };

    if (!_selectedItems[itemCategory]) _selectedItems[itemCategory] = {};
    _selectedItems[itemCategory][value] = newItem;
    _selectedItemsId.push(value);
    setSelectedItems(_selectedItems);
    setSelectedItemsId(_selectedItemsId);
  };

  const handleQuantityUpdate = (category, item, quantity = 1) => {
    const _selectedItems = { ...selectedItems };
    _selectedItems[category][item].quantity = quantity;
    _selectedItems[category][item].price = _selectedItems[category][item].pricePerItem * quantity;
    setSelectedItems(_selectedItems);
  };

  const checkout = () => {
    const formattedSelectedItems = format(selectedItems);
    // allow parent to handle navigation and pricing etc.
    onCheckout(formattedSelectedItems);
  };

  return (
    <section className="createMenu" aria-hidden={false}>
      <br />
      <h3 className="subSectionTitle">Selected Food Items</h3>
      <div className="mealBoxContainer">
        <ul className="boxOptionsTitle boxOptionsDishType">
          {Object.keys(categories).map((category) => (
            <li key={category} onClick={() => setSelectedCategory(category)} className={category === selectedCategory ? "active" : ""}>
              {category}
            </li>
          ))}
        </ul>
      </div>

      {Object.keys(showItems).map((itemCategory) => (
        <section key={itemCategory} className="categroy-wrapper ItemCardContainer">
          <section>
            <h2>{itemCategory}</h2>
          </section>
          <section className="ItemOptionsContainer dropdown-container">
            {selectedItems[itemCategory] && Object.keys(selectedItems[itemCategory]).length > 0 ? (
              Object.keys(selectedItems[itemCategory]).map((item) => (
                <section key={item} className="selectedItems">
                  <div className="selectedItemName">
                    <img className="typeLogo" src={veg_icon} alt="" />
                    <p>{selectedItems[itemCategory][item].name}</p>
                  </div>
                  <AddButtonWithQuantity incremental={1} minQuantity={0} updateItemQuantity={(q) => handleQuantityUpdate(itemCategory, item, q)} />
                </section>
              ))
            ) : null}

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

      <div style={{ padding: 12 }}>
        <button className="btn btn-primary" onClick={checkout}>Proceed with Selected Items</button>
      </div>
    </section>
  );
};

export default FoodSelectionSection;
