import React from "react";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPlus, faCheck } from '@fortawesome/free-solid-svg-icons'
import "./styles.scss";

const AddButton = ({ onClick, selected }) => {
  return (selected ? <button className="added-button" onClick={onClick}><FontAwesomeIcon icon={faCheck} /> Added</button>
    : <button className="add-button" onClick={onClick}><FontAwesomeIcon icon={faPlus} /> Add Item</button>
  );
};

export default AddButton;
