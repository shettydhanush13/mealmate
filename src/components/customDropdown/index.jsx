import React, { useState, useEffect, useRef } from "react";
import { toINR } from "../../utils/util";
import "./styles.scss";

const CustomDropdown = ({ options, onChange, placeholder }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const toggleDropdown = () => setIsOpen(!isOpen);

  const handleOptionClick = (value) => {
    onChange(value);
    setIsOpen(false);
  };

  const handleClickOutside = (event) => {
    if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
      setIsOpen(false);
    }
  };

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div className="custom-dropdown" ref={dropdownRef}>
      <div className="dropdown-header" onClick={toggleDropdown}>
        {placeholder}
        <span className="dropdown-arrow">{isOpen ? "▲" : "▼"}</span>
      </div>
      {isOpen && (
        <ul className="dropdown-list">
          {options.map(({ value, data }) => (
            <li
              key={value}
              className="dropdown-item"
              onClick={() => handleOptionClick(value)}
            >
                <span>
                    <img className="typeLogo" src="https://i.pinimg.com/736x/e4/1f/f3/e41ff3b10a26b097602560180fb91a62.jpg" alt="" />
                    <span>{data[value].name}</span>
                    &nbsp;&nbsp;<span className="desc">{data[value].desc ? `( ${data[value].desc} )`: ''}</span>
                </span>
                <span>{toINR(data[value].price)}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default CustomDropdown;
