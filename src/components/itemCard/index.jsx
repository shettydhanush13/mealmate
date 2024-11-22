import React from "react";
import AddButton from "../button";
import './styles.scss';

const ItemCard = ({ item, onClick, selected }) => {
  const { name, desc, veg } = item;
  return <section className="ItemCardContainer">
    <section className="detailsSection">
        <section className="nameLogoContainer">
          <div>{name} {desc && <span>( {desc} )</span>}</div>
          {veg && <img className="vegLogo" src="https://i.pinimg.com/736x/e4/1f/f3/e41ff3b10a26b097602560180fb91a62.jpg" alt="" />}
        </section>
        <AddButton onClick={onClick} selected={selected} />
    </section>
  </section>
};

export default ItemCard;
