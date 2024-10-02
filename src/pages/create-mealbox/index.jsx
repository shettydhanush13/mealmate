import React from "react";
import { useLocation } from 'react-router-dom';
import Wrapper from '../../components/wrapper';
import mealboxBanner from '../../assets/mealboxBanner.png';
import { mealBoxOptions } from "../../data/mealboxData";
import ItemCard from '../../components/itemCard';
import './styles.scss';

const CreateMealBox = () => {

    const location = useLocation();
    const { selectedBoxType, selectedMealType } = location.state;

    const boxoptionsData = mealBoxOptions[selectedBoxType][selectedMealType];

    const getPricing = () => {

    }
    return (
        <Wrapper headertext={`${boxoptionsData.name}`} footer={true}>
            <div className="createMealBox">
                <img src={mealboxBanner} alt="" />
                <h2>CHOOSE {selectedBoxType} ITEMS</h2>
                <div className="createMenuItems">
                    {Object.keys(boxoptionsData.sections).map((section) => <>
                        <h6>{section} &nbsp;&nbsp;&nbsp;( 0 / {boxoptionsData.sections[section].limit} )</h6>
                        {boxoptionsData.sections[section].options.map((item) => <ItemCard item={item}/>)}
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
