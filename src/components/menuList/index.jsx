import React, { useEffect, useState } from "react";
import { useNavigate } from 'react-router-dom';
import './styles.scss';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPerson } from '@fortawesome/free-solid-svg-icons'

const MenuList = ({ menu }) => {
  const { sections, image, name, price, person } = menu;
  const [categories, setCategories] = useState(0);
  const [items, setItems] = useState(0);

  const navigate = useNavigate();

  useEffect(() => {
    const categories = Object.keys(sections);
    let _items = 0;
    setCategories(categories.length);
    for(let i = 0; i < categories.length; i++ ) {
      _items += sections[categories[i]].limit;
    }
    setItems(_items);
  }, [sections]);

  return <section className="MenuListContainer" onClick={() => navigate('/menu/1', { state: menu })}>
    <img src={image} alt="" />
    <img className="vegLogo" src="https://i.pinimg.com/736x/e4/1f/f3/e41ff3b10a26b097602560180fb91a62.jpg" alt="" />
    <h4>{name || ''}</h4>
    <div className="categoriesCount">
      {categories}&nbsp;&nbsp;
      <span>Categories</span>
      &nbsp;|&nbsp;{items}&nbsp;
      <span>Items</span>
    </div>
    <div className="pricePersonSection">
      <div>
        <span>Starts from</span>&nbsp;&nbsp;₹{price.max} / Guest
      </div>
      <div>
        <FontAwesomeIcon icon={faPerson} />
        <FontAwesomeIcon icon={faPerson} />
        <FontAwesomeIcon icon={faPerson} />
        <span>&nbsp;&nbsp;Min {person.min} - Max {person.max}</span>
      </div>
    </div>
    <div className="offerSection">
      <p>Price reduces upto <span>&nbsp;₹{price.min}&nbsp;</span> for orders of {person.max} guests</p>
    </div>
  </section>
};

export default MenuList;
