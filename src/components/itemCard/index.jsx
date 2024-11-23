import React from "react";
import AddButton from "../button";
import AddButtonWithQuantity from "../quantityButton";
import './styles.scss';

const ItemCard = ({ item, onClick, selected, type = 'plate', updateItemQuantity, minQuantity }) => {
  const { name, desc, veg } = item;
  return <section className="ItemCardContainer">
    <section className="detailsSection">
        <section className="nameLogoContainer">
          <div>{name} {desc && <span>( {desc} )</span>}</div>
          {type === 'bulk' && <p className="itemInfo">{`Min order quantity is ${minQuantity}`}</p>}
          {veg && <img className="vegLogo" src="https://i.pinimg.com/736x/e4/1f/f3/e41ff3b10a26b097602560180fb91a62.jpg" alt="" />}
        </section>
        {type === 'bulk' ? <AddButtonWithQuantity minQuantity={minQuantity} updateItemQuantity={updateItemQuantity}/> : <AddButton onClick={onClick} selected={selected} />}
    </section>
  </section>
};

export default ItemCard;
