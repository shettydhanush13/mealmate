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
    const [selectedItems, setSelectedItems] = useState(null);
    // const [selectedItemsId, setSelectedItemsId] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState(Object.keys(categories)[0]);

    const pick = (obj, arr) => Object.fromEntries(Object.entries(obj).filter(([k]) => arr.includes(k)));

    useEffect(() => {
        if (items) {
            setShowItems(pick(items,categories[selectedCategory]));
            const sections = Object.keys(showItems);
            let _selectedItems = {};
            for(const section of sections) {
                _selectedItems[section] = [];
            }
            setSelectedItems(_selectedItems);
        }
        // eslint-disable-next-line
    }, [selectedCategory]);

    const checkout = () => {
        const totalPrice = getPricing(selectedItems);
        navigate('/mealbox/checkout', { state: { type: 'guest', totalPrice, selectedItems } })
    }

    // const addItem = (item, section, limit) => {
    //     const { _selectedItemsId, _selectedItems } = handleItemAddition(item, section, limit, selectedItems, selectedItemsId);
    //     setSelectedItemsId(_selectedItemsId);
    //     setSelectedItems(_selectedItems);
    // }

    const handleDropdownChange = (itemCategory, value) => {
        const _selectedItems = {...selectedItems};
        console.log(_selectedItems, value);
        if(_selectedItems[itemCategory]) {
            _selectedItems[itemCategory].push(showItems[itemCategory][value]);
        } else {
            _selectedItems[itemCategory] = [showItems[itemCategory][value]];
        }
        console.log(_selectedItems, itemCategory);
        setSelectedItems(_selectedItems);
    }

    return (
        <Wrapper headertext={'Create Your Menu'} footer={true}>
            <section className="createMenu">
                {/* <img src={createMenuBanner} alt="" /> */}
                <div className="mealBoxContainer">
                    <ul className="boxOptionsTitle boxOptionsDishType">
                    {Object.keys(categories).map((category) => <li key={category} onClick={() => setSelectedCategory(category)} className={category === selectedCategory ? 'active' : ''}>{category}</li>)}
                    </ul>
                </div>
                {Object.keys(showItems).map((itemCategory) => 
                    <section className="categroy-wrapper ItemCardContainer">
                        <section className="">
                            <p>{itemCategory}</p>
                        </section>
                        <section className="ItemCardContainer ItemOptionsContainer">
                            {selectedItems && selectedItems[itemCategory].map((item) => <section className="selectedItems">
                                <p>{item.name}</p>
                                <AddButtonWithQuantity incremental={1} minQuantity={0} updateItemQuantity={() => {}}/>
                            </section>)}

                            <section key={itemCategory} className="selectedItems">
                                <div className="dropdown-container">
                                    <select
                                        value=""
                                        onChange={(event) => handleDropdownChange(itemCategory, event.target.value)}
                                        className="dropdown"
                                    >
                                        <option value="" disabled>Choose Item</option>
                                        {Object.keys(showItems[itemCategory])?.map((item) => (
                                            <option key={item} value={item}>
                                                {item}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </section>
                        </section>
                    </section>
                )}
            </section>
            <footer className="footer-next" onClick={checkout}>
                <img src={logowhite} alt="" />
                <span>Checkout</span>
            </footer>
        </Wrapper>
    );
};

export default CreateMenu;
