import React, { useState } from "react";
import AddButton from '../button';
import './styles.scss';

const MenuItem = ({ item, key, addItem, selected, recommended }) => {

  const [preferredItem, setPreferredItem] = useState('');

  const recommendItem = () => {
    addItem(`${item.name} - Recommend item`);
  };

  return <div key={key} data-textField={item.textField} className={(selected || recommended) ? `MenuItemContainer selected` : `MenuItemContainer` }>
    {item.textField ?
      <input
        className="ItemTextField"
        type="text"
        placeholder="Enter your preferred item"
        value={preferredItem}
        onChange={(e) => setPreferredItem(e.target.value)}
      />
      :
      <img src={item.image} alt="" />
    }
    {!item.textField && <span>{item.name} {item.desc && `- ${item.desc}`}</span>}
    {item.veg && <img className="vegLogo" src={veg_icon} alt="" />}
    <div className="buttonsContainer">
      {!item.fixed && <AddButton onClick={addItem(item.name)} selected={(selected || recommended)}/>}
      {!item.fixed && item.textField && <AddButton type="Recommend" onClick={recommendItem} recommended={recommended}/>}
    </div>
  </div>
};

export default MenuItem;
