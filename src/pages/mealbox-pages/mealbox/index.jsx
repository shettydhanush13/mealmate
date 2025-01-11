import React, { useEffect, useState, useMemo } from "react";
import MealboxItem from "../../../components/mealbox";
import Wrapper from "../../../components/wrapper";
import { bestSellerMealBoxData } from "../../../data/mealboxData";
import "./styles.scss";

const Mealbox = () => {
  const BOX_TYPES = [3, 5, 8];
  const MEAL_TYPES = ["Breakfast", "Chinese", "North Indian", "South Indian", "Snacks", "Healthy"];

  const [selectedBoxType, setSelectedBoxType] = useState(BOX_TYPES[0]);
  const [selectedMealType, setSelectedMealType] = useState(MEAL_TYPES[0]);
  const [bestSellersData, setBestSellersData] = useState([]);

  const computeBestSellers = useMemo(() => {
    const mealTypeData = bestSellerMealBoxData[selectedMealType] || {};
    const currentData = mealTypeData[selectedBoxType] || [];

    if (!mealTypeData) return [];

    const additionalData = [5, 8, 3]
      .filter((type) => type !== selectedBoxType)
      .flatMap((type) => mealTypeData[type] || []);

    return [...currentData, ...additionalData];
  }, [selectedBoxType, selectedMealType]);

  useEffect(() => {
    setBestSellersData(computeBestSellers);
  }, [computeBestSellers]);

  return (
    <Wrapper headertext={"Choose Your Box & Customize It"} footer={false}>
      <div className="mealBoxContainer">
        <h5>CHOOSE MEAL TYPE</h5>
        <ul className="boxOptionsTitle boxOptionsDishType">
          {MEAL_TYPES.map((type) => (
            <li
              key={type}
              onClick={() => setSelectedMealType(type)}
              className={type === selectedMealType ? "active" : ""}
            >
              {type}
            </li>
          ))}
        </ul>
        <h5>CHOOSE BOX TYPE</h5>
        <ul className="boxOptionsTitle boxOptionsItems">
          {BOX_TYPES.map((type) => (
            <li
              key={type}
              onClick={() => setSelectedBoxType(type)}
              className={type === selectedBoxType ? "active" : ""}
            >
              {type} Items
            </li>
          ))}
        </ul>
        {bestSellersData.length > 0 && (
          <div className="mealBoxItemContainer">
            <h5>OUR BEST SELLERS</h5>
            {bestSellersData.map((menu, index) => (
              <MealboxItem key={index} menu={menu} />
            ))}
          </div>
        )}
      </div>
    </Wrapper>
  );
};

export default Mealbox;
