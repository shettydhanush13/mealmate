import React from "react";
import AddButton from "../button";
import AddButtonWithQuantity from "../quantityButton";
import veg_icon from '../../assets/veg_icon.webp';
import './styles.scss';

const ItemCard = ({ item, onClick, selected, type = 'plate', updateItemQuantity, minQuantity }) => {
  const { name, extraPricing, veg } = item;
  return <section className="ItemCardContainer">
    <section className="detailsSection">
        <section className="nameLogoContainer">
          <div>{name} {extraPricing && <span>+ ₹{extraPricing}</span>}</div>
          {type === 'bulk' && <p className="itemInfo">{`Min order quantity is ${minQuantity}`}</p>}
          {veg && <img className="vegLogo" src={veg_icon} alt="" />}
        </section>
        {type === 'bulk' ? <AddButtonWithQuantity minQuantity={minQuantity} updateItemQuantity={updateItemQuantity}/> : <AddButton onClick={onClick} selected={selected} />}
    </section>
  </section>
};

export default ItemCard;
