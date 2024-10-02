import React, { useState } from "react";
import AddButton from '../button';
import './styles.scss';

const MenuItem = ({ item, key, addItem, selected, recommended }) => {

  const [preferredItem, setPreferredItem] = useState('');

  const addItemCheck = () => {
    // if(preferredItem === '') {
    //   alert('Please enter your preferred item');
    //   return;
    // }
    addItem(item.name);
  };

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
    {item.veg && <img className="vegLogo" src="https://i.pinimg.com/736x/e4/1f/f3/e41ff3b10a26b097602560180fb91a62.jpg" alt="" />}
    <div className="buttonsContainer">
      {!item.fixed && <AddButton onClick={addItemCheck} selected={(selected || recommended)}/>}
      {!item.fixed && item.textField && <AddButton type="Recommend" onClick={recommendItem} recommended={recommended}/>}
    </div>
  </div>
};

export default MenuItem;
