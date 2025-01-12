import React from "react";
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPerson } from '@fortawesome/free-solid-svg-icons'
import veg_icon from '../../assets/veg_icon.webp';
import './styles.scss';

const MealboxItem = ({ menu }) => {
  const navigate = useNavigate();

  const calculatePrice = (menu) => {
    let price = 0;
    Object.values(menu.sections).forEach(section => {
      const lowestPricePerSection = [];
      const { limit, options } = section;
      options.forEach(item => {
        lowestPricePerSection.push(item.price);
      });
      price += lowestPricePerSection.sort((a, b) => a - b).slice(0, limit).reduce((partialSum, a) => partialSum + a, 0);
    });
    return Math.ceil(price * 0.9);
  };

  return <div className="MealBoxContainer" onClick={() => navigate('/mealbox/create', { state: { menu } })}>
    {menu.image && <img alt="" src={menu.image}/>}
    <img className="vegLogo" src={veg_icon} alt="" />
    <section className="MealBoxSection">
      <h4>{menu.name} <span className="itemsCount">&nbsp;&nbsp;( {menu.items} Items )</span></h4>
      <div className="priceSection">
        <p><span>Starts from</span>&nbsp;&nbsp;₹{calculatePrice(menu)} / Meal box</p>
        <p>
          <FontAwesomeIcon icon={faPerson} />
          <FontAwesomeIcon icon={faPerson} />
          <FontAwesomeIcon icon={faPerson} />
          <span>&nbsp;&nbsp;Min {menu.person.min}</span>
        </p>
      </div>
      <p className="offer">
          <p>Subscribe this Box to get upto <span>&nbsp;30%&nbsp;</span> off</p>
      </p>
    </section>
  </div>
};



export default MealboxItem;
