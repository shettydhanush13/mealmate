import React from "react";
import MealboxItem from "../../components/mealbox";
import Wrapper from '../../components/wrapper';
import { mealboxData } from "../../data/mealboxData";
import mealboxBanner from '../../assets/mealboxBanner2.png';
import "./styles.scss";

const Mealbox = () => {
  return (
    <Wrapper headertext={'Choose Your Box and Customize It!'} footer={false}>
      <div className="mealBoxContainer">
        <img className='mealboxBanner' src={mealboxBanner} alt="" />
        <h5>CHOOSE BOX TYPE</h5>
        <ul className="boxOptionsTitle">
          <li>3 Items</li>
          <li>5 Items</li>
          <li>8 Items</li>
        </ul>
        {/* <button className="add-button">CHOOSE ITEMS</button> */}
        <br />
        <div className="mealBoxItemContainer">
          <h6>CHOOSE CUISINE TYPE</h6>
          <ul className="boxOptionsTitle">
            <li>Breakfast</li>
            <li>Chinese</li>
            <li>North Indian</li>
            <li>South Indian</li>
            <li>Snacks</li>
            <li>Snacks</li>
          </ul>
          <h6>OUR BESTSELLERS</h6>
          {[...mealboxData, ...mealboxData, ...mealboxData].map((menu) => <MealboxItem menu={menu}/>)}
        </div>
      </div>
    </Wrapper>
  );
};

export default Mealbox;
