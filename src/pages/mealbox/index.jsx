import React from "react";
import MealboxItem from "../../components/mealbox";
import Wrapper from '../../components/wrapper';
import { mealboxData } from "../../data/mealboxData";
import "./styles.scss";

const Mealbox = () => {
  return (
    <Wrapper headertext={'Choose Your Box and Customize It!'} footer={false}>
      <ul className="boxOptionsTitle">
        <li>3 Compartments</li>
        <li>5 Compartments</li>
        <li>8 Compartments</li>
      </ul>
      <div className="home">
        {mealboxData.map((menu) => <MealboxItem menu={menu}/>)}
      </div>
    </Wrapper>
  );
};

export default Mealbox;
