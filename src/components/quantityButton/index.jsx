import React, { useState } from "react";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPlus, faMinus } from '@fortawesome/free-solid-svg-icons'
import "./styles.scss";

const AddButtonWithQuantity = ({ minQuantity, updateItemQuantity, incremental = 5 }) => {
  const [quantity, setQuantity] = useState(incremental === 1 ? 1 : 0);
  const [quantityInput, setQuantityInput] = useState(incremental === 1 ? 1 : 0);


  const updateQuantity = (value) => {
    let _quantity = quantity;
    if (value === -1 && (_quantity + value) < minQuantity) updateQuantityValue(0);
    else if (value === +incremental && (_quantity + value) < minQuantity) updateQuantityValue(minQuantity);
    else updateQuantityValue(_quantity + value);
  };

  const updateQuantityValue = (q) => {
    setQuantity(q);
    setQuantityInput(q)
    updateItemQuantity(q);
  };

  const validateQuantity = (quantity) => {
    if (quantity < 0) quantity = 0;
    if (quantity > 0 && quantity < minQuantity) quantity = minQuantity;
    updateQuantityValue(quantity)
  }

  return <section className="quantityButtonContainer">
    <button className="add-button" onClick={() => updateQuantity(-1)}><FontAwesomeIcon icon={faMinus} /></button>
    <input className="quantityField" type="number" value={quantityInput} onBlur={(e) => validateQuantity(Number(e.target.value))} onChange={(e) => setQuantityInput(Number(e.target.value))} />
    <button className="add-button" onClick={() => updateQuantity(+incremental)}><FontAwesomeIcon icon={faPlus} /></button>
  </section> 
};

export default AddButtonWithQuantity;
