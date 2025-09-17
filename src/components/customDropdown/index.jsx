import React, { useState, useEffect, useRef } from "react";
import { toINR } from "../../utils/util";
import veg_icon from '../../assets/veg_icon.webp';
import nonveg_icon from '../../assets/nonveg_icon.webp'; // ✅ fixed relative path
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
          {options.map(({ value, data }) => {
            const item = data[value];
            const isVeg = item?.veg !== false; // default veg unless explicitly false
            return (
              <li
                key={value}
                className="dropdown-item"
                onClick={() => handleOptionClick(value)}
              >
                <span className="dropdown-item-name">
                  <img
                    className="typeLogo"
                    src={isVeg ? veg_icon : nonveg_icon}
                    alt={isVeg ? "veg" : "non-veg"}
                  />
                  <span>{item.name}</span>
                  {item.desc && <span className="desc">({item.desc})</span>}
                </span>
                <span>{toINR(item.price)}</span>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
};

export default CustomDropdown;
