import React from "react";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPlus, faCheck } from '@fortawesome/free-solid-svg-icons'
import "./styles.scss";

const AddButton = ({ onClick, type, selected, recommended }) => {
  return type === "Recommend" ? <button className={ recommended ? "recommend-button recommended" : "recommend-button"} onClick={onClick}>Recommend Item</button> :
  (selected ? <button className="added-button" onClick={onClick}><FontAwesomeIcon icon={faCheck} /></button>
    : <button className="add-button" onClick={onClick}><FontAwesomeIcon icon={faPlus} /></button>
  );
};

export default AddButton;
