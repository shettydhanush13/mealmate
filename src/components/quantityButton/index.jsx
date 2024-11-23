import React, { useState } from "react";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPlus, faMinus } from '@fortawesome/free-solid-svg-icons'
import "./styles.scss";

const AddButtonWithQuantity = ({ minQuantity, updateItemQuantity }) => {
  const [quantity, setQuantity] = useState(0);

  const updateQuantity = (value) => {
    let _quantity = quantity;
    if (value === -1 && (_quantity + value) < minQuantity) {
        setQuantity(0);
        updateItemQuantity(0);
    }
    else if (value === +1 && (_quantity + value) < minQuantity) {
        setQuantity(minQuantity);
        updateItemQuantity(minQuantity);
    } else {
        _quantity = _quantity + value;
        setQuantity(_quantity);
        updateItemQuantity(_quantity);
    }
  };

  const changeQuantity = (quantity) => {
    if (quantity < 0) quantity = 0;
    if (quantity > 0 && quantity < minQuantity) quantity = minQuantity;
    setQuantity(quantity)
    updateItemQuantity(quantity)
  };

  return <section className="quantityButtonContainer">
    <button className="add-button" onClick={() => updateQuantity(-1)}><FontAwesomeIcon icon={faMinus} /></button>
    <input className="quantityField" type="text" value={quantity} onChange={(e) => changeQuantity(Number(e.target.value))} />
    <button className="add-button" onClick={() => updateQuantity(+1)}><FontAwesomeIcon icon={faPlus} /></button>
  </section> 
};

export default AddButtonWithQuantity;
