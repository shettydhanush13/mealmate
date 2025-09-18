// src/components/quantityButton/index.jsx
import React, { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus, faMinus } from "@fortawesome/free-solid-svg-icons";
import "./styles.scss";

const AddButtonWithQuantity = ({
  minQuantity = 0,
  updateItemQuantity,
  incremental = 5,
  initialQuantity = 0, // ✅ new prop
}) => {
  const [quantity, setQuantity] = useState(initialQuantity);
  const [quantityInput, setQuantityInput] = useState(initialQuantity);

  // ✅ keep in sync when parent passes a new initialQuantity
  useEffect(() => {
    setQuantity(initialQuantity);
    setQuantityInput(initialQuantity);
  }, [initialQuantity]);

  const updateQuantityValue = (q) => {
    setQuantity(q);
    setQuantityInput(q);
    updateItemQuantity(q);
  };

  const updateQuantity = (value) => {
    let _quantity = quantity;
    if (value === -1 && _quantity + value < minQuantity) updateQuantityValue(0);
    else if (value === +incremental && _quantity + value < minQuantity)
      updateQuantityValue(minQuantity);
    else updateQuantityValue(_quantity + value);
  };

  const validateQuantity = (q) => {
    if (q < 0) q = 0;
    if (q > 0 && q < minQuantity) q = minQuantity;
    updateQuantityValue(q);
  };

  return (
    <section className="quantityButtonContainer">
      <button
        className="add-button"
        onClick={() => updateQuantity(-incremental)}
      >
        <FontAwesomeIcon icon={faMinus} />
      </button>
      <input
        className="quantityField"
        type="number"
        value={quantityInput}
        onBlur={(e) => validateQuantity(Number(e.target.value))}
        onChange={(e) => setQuantityInput(Number(e.target.value))}
      />
      <button
        className="add-button"
        onClick={() => updateQuantity(+incremental)}
      >
        <FontAwesomeIcon icon={faPlus} />
      </button>
    </section>
  );
};

export default AddButtonWithQuantity;
