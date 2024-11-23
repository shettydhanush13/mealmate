import React, { useEffect, useState } from "react";
import { useNavigate } from 'react-router-dom';
import Wrapper from '../../components/wrapper';
import Accordion from '@mui/material/Accordion';
import AccordionDetails from '@mui/material/AccordionDetails';
import AccordionSummary from '@mui/material/AccordionSummary';
import ItemCard from '../../components/itemCard';
import createMenuBanner from '../../assets/createMenuBanner.png';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faExpandArrowsAlt } from '@fortawesome/free-solid-svg-icons'
import { items, categories } from "../../data/items";
import { getPricing, handleItemAddition } from "../../utils/util";
import './styles.scss';

const CreateMenu = () => {
    const navigate = useNavigate();

    const [showItems, setShowItems] = useState(items);
    const [selectedItems, setSelectedItems] = useState(null);
    const [selectedItemsId, setSelectedItemsId] = useState([]);
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

    const addItem = (item, section, limit) => {
        const { _selectedItemsId, _selectedItems } = handleItemAddition(item, section, limit, selectedItems, selectedItemsId);
        setSelectedItemsId(_selectedItemsId);
        setSelectedItems(_selectedItems);
    }

    return (
        <Wrapper headertext={'Create Your Menu'} footer={true}>
            <section className="createMenu">
                <img src={createMenuBanner} alt="" />
                <div className="mealBoxContainer">
                    <ul className="boxOptionsTitle boxOptionsDishType">
                    {Object.keys(categories).map((category) => <li key={category} onClick={() => setSelectedCategory(category)} className={category === selectedCategory ? 'active' : ''}>{category}</li>)}
                    </ul>
                </div>
                {Object.keys(showItems).map((itemCategory) => <Accordion
                    key={itemCategory} className="accordion">
                        <AccordionSummary
                            expandIcon={<FontAwesomeIcon icon={faExpandArrowsAlt}/>}
                            aria-controls="panel1-content"
                            id="panel1-header">
                                <h3>{itemCategory}</h3>
                        </AccordionSummary>
                        <AccordionDetails>
                            {Object.values(showItems[itemCategory]).map((item) =>
                                <ItemCard
                                    key={item.id}
                                    item={item}
                                    onClick={() => addItem(item, itemCategory, 100)}
                                    selected={selectedItemsId.includes(`${itemCategory}_${item.id}`)}
                                />
                            )}
                        </AccordionDetails>
                    </Accordion>
                )}
            </section>
            <footer className="footer-next" onClick={checkout}>
                <span>Get Pricing</span>
            </footer>
        </Wrapper>
    );
};

export default CreateMenu;
