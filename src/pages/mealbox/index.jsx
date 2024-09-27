import React from "react";
import MealboxItem from "../../components/mealbox";
import Wrapper from '../../components/wrapper';
import { mealboxData } from "../../data/mealboxData";
import mealboxBanner from '../../assets/mealboxBanner.png';
import "./styles.scss";

const Mealbox = () => {
  return (
    <Wrapper headertext={'Choose Your Box and Customize It!'} footer={false}>
      <div className="mealBoxContainer">
        <h5>CHOOSE BOX TYPE</h5>
        <ul className="boxOptionsTitle">
          <li>3 Compartments</li>
          <li>5 Compartments</li>
          <li>8 Compartments</li>
        </ul>
        <br />
        <img className='mealboxBanner' src={mealboxBanner} alt="" />
        <div className="mealBoxItemContainer">
          <h6>OUR TOP SELLING BOXES</h6>
          <ul className="boxOptionsTitle">
            <li>Breakfast</li>
            <li>Chinese</li>
            <li>North Indian</li>
            <li>Snacks</li>
          </ul>
          {[...mealboxData, ...mealboxData, ...mealboxData].map((menu) => <MealboxItem menu={menu}/>)}
        </div>
      </div>
    </Wrapper>
  );
};

export default Mealbox;
