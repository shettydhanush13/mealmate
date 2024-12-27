import React from "react";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faCheck } from '@fortawesome/free-solid-svg-icons';
import "./styles.scss";

const AddButton = ({ onClick, selected }) => {
  return (
    <button className={selected ? "added-button" : "add-button"} onClick={onClick}>
      <FontAwesomeIcon icon={selected ? faCheck : faPlus} />
    </button>
  );
};

export default AddButton;
