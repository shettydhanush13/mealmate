import React, { useEffect, useState } from "react";
// import { useNavigate } from 'react-router-dom';
import MealboxItem from "../../components/mealbox";
import Wrapper from '../../components/wrapper';
import { bestSellerMealBoxData } from "../../data/mealboxData";
import "./styles.scss";

const Mealbox = () => {

  // const navigate = useNavigate();

  const boxType = [3, 5, 8];
  const [selectedBoxType, setSelectedBoxType] = useState(boxType[0]);
  const mealType = ['Breakfast', 'Chinese', 'North Indian', 'South Indian', 'Snacks', 'Healthy'];
  const [selectedMealType, setSelectedMealType] = useState(mealType[0]);

  const [bestSellersData, setBestSellersData ] = useState([]);

  useEffect(() => {
    setBestSellersData(bestSellerMealBoxData[selectedBoxType][selectedMealType] || []);
  }, [selectedBoxType, selectedMealType]);

  return (
    <Wrapper headertext={'Choose Your Box and Customize It!'} footer={false}>
      <div className="mealBoxContainer">
        <h5>CHOOSE MEAL TYPE</h5>
        <ul className="boxOptionsTitle boxOptionsDishType">
          {mealType.map((dishType) => <li onClick={() => setSelectedMealType(dishType)} className={dishType === selectedMealType ? 'active' : ''}>{dishType}</li>)}
        </ul>
        <h5>CHOOSE BOX TYPE</h5>
        <ul className="boxOptionsTitle boxOptionsItems">
          {boxType.map((boxType) => <li onClick={() => setSelectedBoxType(boxType)} className={boxType === selectedBoxType ? 'active' : ''}>{boxType} Items</li>)}
        </ul>
        {bestSellersData.length > 0 && <div className="mealBoxItemContainer">
          <h5>OUR BEST SELLERS</h5>
          {bestSellersData.map((menu) => <MealboxItem menu={menu} items={selectedBoxType} />)}
        </div>}
      </div>
      {/* <div className="footer-next" onClick={() => navigate('/mealbox/create', { state : { selectedBoxType, selectedMealType } })}>
        <p>CREATE YOUR OWN MEALBOX</p>
      </div> */}
    </Wrapper>
  );
};

export default Mealbox;
