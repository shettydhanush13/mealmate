import React, { useEffect, useState } from "react";
import { useNavigate } from 'react-router-dom';
import './styles.scss';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPerson } from '@fortawesome/free-solid-svg-icons'

const MealboxItem = ({ menu }) => {
  const [, setCategories] = useState(0);
  const [items, setItems] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    const sections = menu.sections;
    const categories = Object.keys(sections);
    let _items = 0;
    setCategories(categories.length);
    for(let i = 0; i < categories.length; i++ ) {
      _items += sections[categories[i]].limit;
    }
    setItems(_items);
  }, [menu.sections]);

  return <div className="MenuListContainer" onClick={() => navigate('/menu/1', { state: menu })}>
    <img src={menu.image} alt="" />
    <img className="vegLogo" src="https://i.pinimg.com/736x/e4/1f/f3/e41ff3b10a26b097602560180fb91a62.jpg" alt="" />
    <h4>{menu.name} - {items} Items</h4>
    <div className="priceSection">
      <p><span>Starts from</span>&nbsp;&nbsp;₹{menu.price.max} / Meal box</p>
      <p>
        <FontAwesomeIcon icon={faPerson} />
        <FontAwesomeIcon icon={faPerson} />
        <FontAwesomeIcon icon={faPerson} />
        <span>&nbsp;&nbsp;Min {menu.person.min}</span>
      </p>
    </div>
    <p className="offer">
        <p>Subscribe this Mealbox to get upto <span>&nbsp;30%&nbsp;</span> off</p>
      {/* <p>Price reduces upto <span>&nbsp;₹{menu.price.min}&nbsp;</span> for orders of {menu.person.max} guests</p> */}
    </p>
  </div>
};

export default MealboxItem;
