import React from "react";
import './styles.scss';
import AddButton from "../button";

const ItemCard = ({ item }) => {
  return <div className="ItemCardContainer">
    <img className="vegLogo" src="https://i.pinimg.com/736x/e4/1f/f3/e41ff3b10a26b097602560180fb91a62.jpg" alt="" />
    <div className="imageSection">
        <img src={item.image} alt="" />
    </div>
    <div className="detailsSection">
        <p>{item.name}</p>
        {item.desc && <span>{item.desc}</span>}
        <AddButton />
    </div>
  </div>
};

export default ItemCard;
