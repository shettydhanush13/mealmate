import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from 'react-router-dom';
import Wrapper from "../../components/wrapper";
import ItemCard from '../../components/itemCard';
import BasicModal from "../../components/modal";
import './styles.scss';

const Menu = () => {
  const location = useLocation();
  const menu = location.state;

  const navigate = useNavigate();

  const [sections] = useState(Object.keys(menu.sections));
  const [selectedItems, setSelectedItems] = useState(null);
  const [itemsWithPrice, setItemsWithPrice] = useState({});
  const [itemsLimit, setItemsLimit] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [modalMessage, setModalMessage] = useState('');

  useEffect(() => {
    if (sections) {
        let _selectedItems = {};
        let _itemsWithPrice = {};
        let _itemsLimit = {};
        for(const section of sections) {
            _selectedItems[section] = [];
            _itemsLimit[section] = menu.sections[section].limit;
            for(const option of menu.sections[section].options) {
              if (option.extraPricing) _itemsWithPrice[option.name] = option.extraPricing;
              if(section === "Fixed Items") {
                _selectedItems[section].push(option.name);
              }
            }
        }
        setSelectedItems(_selectedItems);
        setItemsWithPrice(_itemsWithPrice);
        setItemsLimit(_itemsLimit);
    }
  }, [sections, menu.sections])

  const handleAdd = (section, { name, price }) => {
    let _selectedItems = {...selectedItems};
    const selectedItemsInSection = _selectedItems[section];
    if (selectedItemsInSection.includes(name)) {
        const index = selectedItemsInSection.indexOf(name);
        if (index > -1) {
            selectedItemsInSection.splice(index, 1);
        }
    } else {
        const limitExceeded = selectedItemsInSection.length + 1 > itemsLimit[section];
        if (itemsLimit[section] && limitExceeded) {
          modalOn(selectedItemsInSection.length, section);
        } else selectedItemsInSection.push(name);
    }
    setSelectedItems(_selectedItems);
  };

  const modalOn = (max, type) => {
    setModalMessage(`Only ${max} Item${max > 1 ? 's' : ''} can be added in ${type}.`)
    setShowModal(true);
    setTimeout(() => {
        setShowModal(false);
    }, 3000)
  };

  const getPricing = () => {
    for(const section of sections) {
      const limit = itemsLimit[section];
      const selected = selectedItems[section].length;
      if(limit && (selected < limit)) {
        alert (`Add ${limit - selected} more Items to ${section}`);
        return;
      }
    }
    navigate('/checkout', { state: { selectedItems, itemsWithPrice, menu } });
  }

  return (
    <Wrapper headertext='Customize Your Menu' footer={true}>
      {selectedItems && <div className="menu">
        <BasicModal showModal={showModal} title='Item Limit Exceeded' content={modalMessage} type='warning' />
        <h4>{menu.name}</h4>
        <section className="menu-section">
          {sections.map((section) => (
            <div key={section} className="menu-category">
              <div className="sectionHeader">
                {menu.sections[section].fixed || !menu.sections[section].limit ?
                  <p>{section}</p> :
                  <p>{section} ( {selectedItems[section].length} / {menu.sections[section].limit} )</p>
                }
              </div>
              <div className="sectionItems">
                {menu.sections[section].options.map((option) =>
                  <ItemCard
                    key={option.id}
                    item={option}
                    onClick={() => handleAdd(section, option)}
                    selected={selectedItems[section]?.includes(option.name)}
                  />
                )}
              </div>
            </div>
          ))}
        </section>
        <div className="footer-next" onClick={getPricing}>
          <p>Get Pricing</p>
        </div>
      </div>}
    </Wrapper>
  );
};

export default Menu;
