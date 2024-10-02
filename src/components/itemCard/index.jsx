import React from "react";
import './styles.scss';
import AddButton from "../button";

const ItemCard = ({ item }) => {
  return <div className="ItemCardContainer">
    {/* <div className="imageSection">
        <img src={item.image} alt="" />
    </div> */}
    <div className="detailsSection">
        <p>
          {item.name} {item.desc && <span>( {item.desc} )</span>}
          {item.veg && <img className="vegLogo" src="https://i.pinimg.com/736x/e4/1f/f3/e41ff3b10a26b097602560180fb91a62.jpg" alt="" />}
        </p>
        <AddButton />
    </div>
  </div>
};

export default ItemCard;
