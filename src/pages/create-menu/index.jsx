import React, { useEffect, useState } from "react";
import { Helmet } from "react-helmet";
import { useNavigate } from "react-router-dom";
import Wrapper from "../../components/wrapper";
import logowhite from "../../assets/logowhite.png";
import AddButtonWithQuantity from "../../components/quantityButton";
import CustomDropdown from "../../components/customDropdown";
import { menuItems, categories } from "../../data/items";
import { getPricing } from "../../utils/util";
import "./styles.scss";

const CreateMenu = () => {
    const navigate = useNavigate();

    const [showItems, setShowItems] = useState(menuItems);
    const [selectedItems, setSelectedItems] = useState({});
    const [selectedItemsId, setSelectedItemsId] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState(Object.keys(categories)[0]);

    useEffect(() => {
        window.scrollTo(0, 0);
        if (menuItems) {
            updateShowItems();
        }
        // eslint-disable-next-line
    }, [selectedCategory]);

    const updateShowItems = () => {
        const filteredItems = pick(menuItems, categories[selectedCategory]);
        setShowItems(filteredItems);

        const _selectedItems = {};
        Object.keys(filteredItems).forEach((section) => {
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
        navigate("/bulk/checkout", { state: { totalPrice, selectedItems: formattedSelectedItems } });
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
        _selectedItems[category][item].price =
            _selectedItems[category][item].pricePerItem * quantity;

        setSelectedItems(_selectedItems);
    };

    const renderSelectedItems = (itemCategory) => {
        if (!selectedItems[itemCategory]) return null;

        return Object.keys(selectedItems[itemCategory]).map((item) => (
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
          <CustomDropdown
            placeholder="Add Item"
            options={Object.keys(showItems[itemCategory] || {}).map((item) => ({
              value: item,
              data: showItems[itemCategory],
            }))}
            onChange={(value) => handleDropdownChange(itemCategory, value)}
          />
        </section>
    );      
      
    return (
        <>
            <Helmet>
                <title>Create Your Menu | CaterKart</title>
                <meta
                    name="description"
                    content="Customize your perfect menu for parties or corporate events with CaterKart. Select from a variety of dishes and drinks tailored to your needs."
                />
                <meta name="keywords" content="CaterKart, Menu, Party Menu, Custom Menu, Corporate Events" />
                <meta name="author" content="CaterKart Team" />
                <meta property="og:title" content="Create Your Menu | CaterKart" />
                <meta
                    property="og:description"
                    content="Create and customize your menu for parties or corporate events with CaterKart. Select from a variety of dishes, snacks, and drinks."
                />
                <meta property="og:image" content={logowhite} />
                <meta property="og:url" content="https://caterkart.in/create-menu" />
                <meta property="og:type" content="website" />
            </Helmet>
            <Wrapper headertext="CaterKart" footer>
                <section className="createMenu">
                    <header>
                        <h1>CREATE YOUR FOOD MENU</h1>
                        <p>CHOOSE YOUR FAVORITE DISH AND QUANTITY</p>
                    </header>
                    <br />
                    <div className="mealBoxContainer">
                        <ul className="boxOptionsTitle boxOptionsDishType">
                            {Object.keys(categories).map((category) => (
                                <li
                                    key={category}
                                    onClick={() => setSelectedCategory(category)}
                                    className={category === selectedCategory ? "active" : ""}
                                >
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
                            <section className="ItemCardContainer ItemOptionsContainer">
                                {renderSelectedItems(itemCategory)}
                                {renderDropdown(itemCategory)}
                            </section>
                        </section>
                    ))}
                </section>
                <footer className="footer-next" onClick={checkout}>
                    <img src={logowhite} alt="CaterKart Logo" />
                    <span>Checkout</span>
                </footer>
            </Wrapper>
        </>
    );
};

export default CreateMenu;
