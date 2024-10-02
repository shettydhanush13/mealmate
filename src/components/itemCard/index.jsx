import React from "react";
import AddButton from "../button";
import './styles.scss';

const ItemCard = ({ item, onClick, selected }) => {
  return <div className="ItemCardContainer">
    <div className="detailsSection">
        <p>
          {item.name} {item.desc && <span>( {item.desc} )</span>}
          {item.veg && <img className="vegLogo" src="https://i.pinimg.com/736x/e4/1f/f3/e41ff3b10a26b097602560180fb91a62.jpg" alt="" />}
        </p>
        <AddButton onClick={onClick} selected={selected} />
    </div>
  </div>
};

export default ItemCard;
