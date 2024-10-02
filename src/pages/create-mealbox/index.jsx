import React, { useState } from "react";
import { useLocation } from 'react-router-dom';
import Wrapper from '../../components/wrapper';
import mealboxBanner from '../../assets/mealboxBanner.png';
import { mealBoxOptions } from "../../data/mealboxData";
import ItemCard from '../../components/itemCard';
import './styles.scss';

const CreateMealBox = () => {

    const location = useLocation();
    const { selectedBoxType, selectedMealType } = location.state;

    const [selectedItems, setSelectedItems] = useState({});
    const [selectedItemsId, setSelectedItemsId] = useState([]);

    const boxoptionsData = mealBoxOptions[selectedBoxType][selectedMealType];

    const getPricing = () => {
        const totalPrice = Object.values(selectedItems).reduce((acc, section) => {
            return acc + section.reduce((acc, item) => acc + item.price, 0);
        }, 0);
        console.log(totalPrice);
    }

    const handleItemAddition = (item, section, limit) => {
        const { name, price, id } = item;
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
    return (
        <Wrapper headertext={`${boxoptionsData.name}`} footer={true}>
            <div className="createMealBox">
                <img src={mealboxBanner} alt="" />
                <h2>CHOOSE {selectedBoxType} ITEMS</h2>
                <div className="createMenuItems">
                    {Object.keys(boxoptionsData.sections).map((section) => <>
                        <h6>{section} &nbsp;&nbsp;&nbsp;( 0 / {boxoptionsData.sections[section].limit} )</h6>
                        {boxoptionsData.sections[section].options.map((item) =>
                            <ItemCard selected={selectedItemsId.includes(`${section}_${item.id}`)} item={item} onClick={() => handleItemAddition(item, section, boxoptionsData.sections[section].limit)}/>)}
                    </>)}
                </div>
            </div>
            <div className="footer-next" onClick={getPricing}>
                <p>Get Pricing</p>
            </div>
        </Wrapper>
    );
};

export default CreateMealBox;
