import React, { useState } from "react";
import { useNavigate, useLocation } from 'react-router-dom';
import { mealBoxOptions } from "../../data/mealboxData";
import Wrapper from '../../components/wrapper';
import ItemCard from '../../components/itemCard';
import { getPricing, handleItemAddition } from "../../utils/util";
import './styles.scss';

const CreateMealBox = () => {
    const location = useLocation();
    const navigate = useNavigate();

    const { selectedBoxType, selectedMealType, menu } = location.state;

    const [selectedItems, setSelectedItems] = useState({});
    const [selectedItemsId, setSelectedItemsId] = useState([]);

    // Determine the box options data based on the selected box type and meal type
    const boxoptionsData = selectedBoxType && selectedMealType
        ? mealBoxOptions[selectedBoxType][selectedMealType]
        : menu;

    const { name, sections } = boxoptionsData;

    // Handle checkout navigation
    const checkout = () => {
        const totalPrice = getPricing(selectedItems);
        navigate('/mealbox/checkout', { state: { type: 'mealbox', totalPrice, selectedItems } });
    };

    // Add item to the meal box
    const addItem = (item, section, limit) => {
        const { _selectedItemsId, _selectedItems } = handleItemAddition(item, section, limit, selectedItems, selectedItemsId);
        setSelectedItemsId(_selectedItemsId);
        setSelectedItems(_selectedItems);
    };

    // Render individual item cards
    const renderItemCard = (section, item, limit) => (
        <ItemCard
            key={`${section}_${item.id}`}
            selected={selectedItemsId.includes(`${section}_${item.id}`)}
            item={item}
            choice={true}
            onClick={() => addItem(item, section, limit)}
        />
    );

    // Render item sections
    const renderItemSection = (section) => {
        const { limit, options } = sections[section];
        return (
            <div key={section} className="itemSection">
                <h6>
                    {section} 
                    {limit && (
                        <span>
                            &nbsp;&nbsp;&nbsp;({selectedItems[section]?.length || 0} / {limit})
                        </span>
                    )}
                </h6>
                <div className="itemOptions">
                    {options.map((item) => renderItemCard(section, item, limit))}
                </div>
            </div>
        );
    };

    return (
        <Wrapper headertext={name} footer={true}>
            <div className="createMealBox">
                <div className="createMenuItems">
                    {Object.keys(sections).map(renderItemSection)}
                </div>
            </div>
            <div className="footer-next" onClick={checkout}>
                <p>Get Pricing</p>
            </div>
        </Wrapper>
    );
};

export default CreateMealBox;
