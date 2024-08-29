import React from "react";
import AddButton from '../button';
import './styles.scss';

const MenuItem = ({ item, key, addItem, selected }) => {
  return <div key={key} className={selected ? `MenuItemContainer selected` : `MenuItemContainer` }>
    <img src={item.image} alt="" />
    <span>{item.name} {item.desc && `- ${item.desc}`}</span>
    {item.veg && <img className="vegLogo" src="https://i.pinimg.com/736x/e4/1f/f3/e41ff3b10a26b097602560180fb91a62.jpg" alt="" />}
    <AddButton onClick={addItem} selected={selected}/>
  </div>
};

export default MenuItem;
