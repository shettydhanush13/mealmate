import React, { useState } from "react";
import MenuItem from "../../components/menuItem";
import { useLocation, useNavigate } from 'react-router-dom';
import { useEffect } from "react";
import './styles.scss';
import Wrapper from "../../components/wrapper";

const Menu = () => {
  const location = useLocation();
  const menu = location.state;

  const navigate = useNavigate();

  const [sections] = useState(Object.keys(menu.sections));
  const [selectedItems, setSelectedItems] = useState(null);
  const [itemsLimit, setItemsLimit] = useState(null);

  useEffect(() => {
    if (sections) {
        let _selectedItems = {};
        let _itemsLimit = {};
        for(const section of sections) {
            _selectedItems[section] = [];
            _itemsLimit[section] = menu.sections[section].limit;
        }
        setSelectedItems(_selectedItems);
        setItemsLimit(_itemsLimit);
    }
  }, [sections, menu.sections])

  const handleAdd = (section, id) => {
    let _selectedItems = {...selectedItems};
    const selectedItemsInSection = _selectedItems[section];
    if (selectedItemsInSection.includes(id)) {
        const index = selectedItemsInSection.indexOf(id);
        if (index > -1) {
            selectedItemsInSection.splice(index, 1);
        }
    } else {
        const limitExceeded = selectedItemsInSection.length + 1 > itemsLimit[section];
        if (limitExceeded) {
            // To-Do Add snackbar
            alert('Category limit exceeded');
        } else selectedItemsInSection.push(id);
    }
    setSelectedItems(_selectedItems);
  };

  return (
    <Wrapper headertext='Customize Your Menu'>
      {selectedItems && <div className="menu">
        <h4>{menu.name}</h4>
        <div className="menu-section">
          {sections.map((section) => (
            <div key={section} className="menu-category">
              <div className="sectionHeader">
                <p>{section} ( {selectedItems[section].length} / {menu.sections[section].limit} )</p>
              </div>
              <div className="sectionItems">
                {menu.sections[section].options.map((option) =>
                  <MenuItem
                    selected={selectedItems[section]?.includes(option.name)}
                    key={option.id}
                    item={option}
                    addItem={() => handleAdd(section, option.name)}/>
                  )}
              </div>
            </div>
          ))}
        </div>
        <div className="footer-next" onClick={() => navigate('/checkout', { state: { selectedItems, menu } })}>
          <p>Get Pricing</p>
        </div>
      </div>}
    </Wrapper>
  );
};

export default Menu;
