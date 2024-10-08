import React, { useState } from "react";
import { useNavigate, useLocation } from 'react-router-dom';
import Wrapper from '../../components/wrapper';
import mealboxBanner from '../../assets/mealboxBanner.png';
import { mealBoxOptions } from "../../data/mealboxData";
import ItemCard from '../../components/itemCard';
import './styles.scss';

const CreateMealBox = () => {

    const location = useLocation();
    const navigate = useNavigate();

    const { selectedBoxType, selectedMealType, menu } = location.state;

    const [selectedItems, setSelectedItems] = useState({});
    const [selectedItemsId, setSelectedItemsId] = useState([]);
    
    const boxoptionsData = selectedBoxType && selectedMealType ? mealBoxOptions[selectedBoxType][selectedMealType] : menu;
    const { name, sections } = boxoptionsData;

    const getPricing = () => {
        const totalPrice = Object.values(selectedItems).reduce((acc, section) => {
            return acc + section.reduce((acc, item) => acc + item.price, 0);
        }, 0);
        navigate('/mealbox/checkout', { state: { totalPrice, selectedItems } })
    };

    const handleItemAddition = (item, section, limit) => {
        const { name, price, id, desc } = item;
        const itemId = `${section}_${id}`;
        const _selectedItems = {...selectedItems};
        const _selectedItemsId = [...selectedItemsId];
        if(!_selectedItems[section]) _selectedItems[section] = [];
        if (_selectedItemsId.includes(itemId)) {
            const index = _selectedItemsId.indexOf(itemId);
            const sectionIndex = _selectedItems[section].findIndex(item => item.id === id);
            if (index > -1) {
                _selectedItemsId.splice(index, 1);
                _selectedItems[section].splice(sectionIndex, 1);
            }
        } else {
            if(_selectedItems[section].length === limit) {
                alert(`Only ${limit} item(s) for this section.`);
            } else {
                _selectedItemsId.push(itemId);
                const selectedItem = {
                    id,
                    desc,
                    name,
                    price,
                    section,
                }
                _selectedItems[section].push(selectedItem);
            }
        }
        setSelectedItemsId(_selectedItemsId);
        setSelectedItems(_selectedItems);
    }

    const getItemCard = (section, item, limit) => {
        return <ItemCard
            selected={selectedItemsId.includes(`${section}_${item.id}`)}
            item={item}
            choice={true}
            onClick={() => handleItemAddition(item, section, limit)}
        />
    }

    const getItemSection = (section) => {
      const { limit, options } = sections[section];
      return <>
        <h6>{section} &nbsp;&nbsp;&nbsp;( { selectedItems[section]?.length || 0 } / {limit} )</h6>
        {options.map((item) => getItemCard(section, item, limit))}
        </>
    };
    return (
        <Wrapper headertext={`${name}`} footer={true}>
            <div className="createMealBox">
                <img src={mealboxBanner} alt="" />
                {/* <h2>CHOOSE {selectedBoxType || menu.items} ITEMS</h2> */}
                <div className="createMenuItems">
                    {Object.keys(sections).map((section) => getItemSection(section))}
                </div>
            </div>
            <div className="footer-next" onClick={getPricing}>
                <p>Get Pricing</p>
            </div>
        </Wrapper>
    );
};

export default CreateMealBox;
