import React, { useState } from "react";
import { useNavigate, useLocation } from 'react-router-dom';
import { mealBoxOptions } from "../../data/mealboxData";
import Wrapper from '../../components/wrapper';
import mealboxBanner from '../../assets/mealboxBanner.png';
import ItemCard from '../../components/itemCard';
import { getPricing, handleItemAddition } from "../../utils/util";
import './styles.scss';

const CreateMealBox = () => {

    const location = useLocation();
    const navigate = useNavigate();

    const { selectedBoxType, selectedMealType, menu } = location.state;

    const [selectedItems, setSelectedItems] = useState({});
    const [selectedItemsId, setSelectedItemsId] = useState([]);
    
    const boxoptionsData = selectedBoxType && selectedMealType ? mealBoxOptions[selectedBoxType][selectedMealType] : menu;
    const { name, sections } = boxoptionsData;

    const checkout = () => {
        const totalPrice = getPricing(selectedItems);
        navigate('/mealbox/checkout', { state: { type: 'mealbox', totalPrice, selectedItems } })
    }

    const addItem = (item, section, limit) => {
        const { _selectedItemsId, _selectedItems } = handleItemAddition(item, section, limit, selectedItems, selectedItemsId);
        setSelectedItemsId(_selectedItemsId);
        setSelectedItems(_selectedItems);
    }

    const getItemCard = (section, item, limit) => {
        return <ItemCard
            selected={selectedItemsId.includes(`${section}_${item.id}`)}
            item={item}
            choice={true}
            onClick={() => addItem(item, section, limit)}
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
            <div className="footer-next" onClick={checkout}>
                <p>Get Pricing</p>
            </div>
        </Wrapper>
    );
};

export default CreateMealBox;
