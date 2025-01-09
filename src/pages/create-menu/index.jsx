import React, { useEffect, useState } from "react";
import { useNavigate } from 'react-router-dom';
import Wrapper from '../../components/wrapper';
import logowhite from '../../assets/logowhite.png';
import AddButtonWithQuantity from "../../components/quantityButton";
import { items, categories } from "../../data/items";
import { getPricing } from "../../utils/util";
import './styles.scss';

const CreateMenu = () => {
    const navigate = useNavigate();

    const [showItems, setShowItems] = useState(items);
    const [selectedItems, setSelectedItems] = useState({});
    const [selectedItemsId, setSelectedItemsId] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState(Object.keys(categories)[0]);

    useEffect(() => {
        if (items) {
            updateShowItems();
        }
        // eslint-disable-next-line
    }, [selectedCategory]);

    const updateShowItems = () => {
        const filteredItems = pick(items, categories[selectedCategory]);
        setShowItems(filteredItems);

        const _selectedItems = {};
        Object.keys(filteredItems).forEach(section => {
            _selectedItems[section] = {};
        });
        setSelectedItems(_selectedItems);
    };

    const pick = (obj, arr) => Object.fromEntries(Object.entries(obj).filter(([key]) => arr.includes(key)));

    const format = (input) => {
        const itemsArray = [];
    
        Object.values(input).forEach((category) => {
            if (Object.keys(category).length > 0) {
                itemsArray.push(...Object.values(category));
            }
        });
    
        return { Items: itemsArray };
    };

    const checkout = () => {
        const formattedSelectedItems = format(selectedItems);
        const totalPrice = getPricing(formattedSelectedItems);
        navigate('/bulk/checkout', { state: { totalPrice, selectedItems: formattedSelectedItems } });
    };

    const handleDropdownChange = (itemCategory, value) => {
        if (selectedItemsId.includes(value)) {
            alert(`${value} is already added.`);
            return;
        }

        const _selectedItems = { ...selectedItems };
        const _selectedItemsId = [...selectedItemsId];

        const newItem = { ...showItems[itemCategory][value], quantity: 1, pricePerItem: showItems[itemCategory][value].price };

        if (!_selectedItems[itemCategory]) {
            _selectedItems[itemCategory] = {};
        }
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

    const renderSelectedItems = (itemCategory) => {
        if (!selectedItems[itemCategory]) return null;

        return Object.keys(selectedItems[itemCategory]).map(item => (
            <section key={item} className="selectedItems">
                <p>{selectedItems[itemCategory][item].name}</p>
                <AddButtonWithQuantity
                    incremental={1}
                    minQuantity={0}
                    updateItemQuantity={(q) => handleQuantityUpdate(itemCategory, item, q)}
                />
            </section>
        ));
    };

    const renderDropdown = (itemCategory) => (
        <section key={`${itemCategory}-dropdown`} className="selectedItems">
            <div className="dropdown-container">
                <select
                    value=""
                    onChange={(event) => handleDropdownChange(itemCategory, event.target.value)}
                    className="dropdown"
                >
                    <option value="" disabled>Add Item</option>
                    {Object.keys(showItems[itemCategory] || {}).map(item => (
                        <option key={item} value={item}>
                            {item}
                        </option>
                    ))}
                </select>
            </div>
        </section>
    );

    return (
        <Wrapper headertext="Create Your Menu" footer>
            <section className="createMenu">
                <div className="mealBoxContainer">
                    <ul className="boxOptionsTitle boxOptionsDishType">
                        {Object.keys(categories).map(category => (
                            <li
                                key={category}
                                onClick={() => setSelectedCategory(category)}
                                className={category === selectedCategory ? 'active' : ''}
                            >
                                {category}
                            </li>
                        ))}
                    </ul>
                </div>
                {Object.keys(showItems).map(itemCategory => (
                    <section key={itemCategory} className="categroy-wrapper ItemCardContainer">
                        <section>
                            <p>{itemCategory}</p>
                        </section>
                        <section className="ItemCardContainer ItemOptionsContainer">
                            {renderSelectedItems(itemCategory)}
                            {renderDropdown(itemCategory)}
                        </section>
                    </section>
                ))}
            </section>
            <footer className="footer-next" onClick={checkout}>
                <img src={logowhite} alt="logo" />
                <span>Checkout</span>
            </footer>
        </Wrapper>
    );
};

export default CreateMenu;
